"""API endpoints for Scan ingestion and retrieval."""

import logging
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.db.session import get_db
from app.models.inspection import Image, Inspection
from app.schemas.scan import (
    ImageMetadata,
    ScanDetailResponse,
    ScanUploadResponse,
)
from app.services.ocr import (
    run_ocr_pipeline,
    get_original_image_path,
    get_upscaled_image_path,
    get_annotated_image_path,
)
from app.utils.image_validation import validate_and_read_image

logger = logging.getLogger("validra.scans")
router = APIRouter(prefix="/scans", tags=["Scans"])


@router.post(
    "",
    response_model=ScanUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload scanned package image and initiate OCR pipeline"
)
async def upload_scan(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WEBP, BMP, max 5MB)"),
    db: AsyncSession = Depends(get_db),
):
    """Receive and validate scanned product image, persist to storage & DB,

    and forward to the modular OCR pipeline.
    """
    # 1. Validate image constraints (5MB limit, format, integrity, safe filename)
    file_bytes, file_hash, ext, safe_filename = await validate_and_read_image(file)

    # 2. Ensure uploads directory exists and generate safe destination path
    upload_dir = Path(settings.UPLOAD_DIR)
    try:
        upload_dir.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        logger.error(f"Failed to access/create upload directory: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Storage directory could not be created or accessed."
        )

    scan_uuid = uuid.uuid4()
    image_uuid = uuid.uuid4()
    destination_path = get_original_image_path(str(scan_uuid), ext)

    # 3. Write file to disk
    try:
        with open(destination_path, "wb") as f:
            f.write(file_bytes)
    except OSError as e:
        logger.error(f"Failed to write image file to {destination_path}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist uploaded image file."
        )

    # 4. Create database records (Inspection + Image)
    try:
        inspection = Inspection(
            inspection_id=scan_uuid,
            status="processing",
        )
        db.add(inspection)

        image_record = Image(
            image_id=image_uuid,
            inspection_id=scan_uuid,
            type="original",
            storage_path=str(destination_path),
            file_name=safe_filename,
            file_size=len(file_bytes),
            mime_type=file.content_type or f"image/{ext.lstrip('.')}",
            image_hash=file_hash,
        )
        db.add(image_record)

        await db.commit()
        await db.refresh(inspection)
        await db.refresh(image_record)
    except SQLAlchemyError as e:
        logger.error(f"Database error while saving scan record: {e}")
        await db.rollback()
        # Clean up file on disk if DB transaction failed
        destination_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record scan entry in database."
        )

    # 5. Hand off to modular OCR pipeline with fault isolation
    try:
        ocr_result = await run_ocr_pipeline(
            scan_id=str(scan_uuid),
            image_path=str(destination_path)
        )
        # Update inspection status if image failed quality gate
        if ocr_result.get("status") == "quality_failed":
            try:
                inspection.status = "quality_failed"
                inspection.inspector_remarks = ocr_result.get("message")
                await db.commit()
                await db.refresh(inspection)
            except Exception as db_err:
                logger.error(f"Failed to update inspection status after quality check failure: {db_err}")
        else:
            # Record original_upscaled and annotated images in DB if generated
            upscaled_path = get_upscaled_image_path(str(scan_uuid))
            if upscaled_path.exists():
                try:
                    upscaled_record = Image(
                        image_id=uuid.uuid4(),
                        inspection_id=scan_uuid,
                        type="upscaled",
                        storage_path=str(upscaled_path),
                        file_name="original_upscaled.jpg",
                        file_size=upscaled_path.stat().st_size,
                        mime_type="image/jpeg",
                    )
                    db.add(upscaled_record)
                except Exception as img_err:
                    logger.warning(f"Failed to record upscaled image in DB: {img_err}")

            annotated_path = get_annotated_image_path(str(scan_uuid))
            if annotated_path.exists():
                try:
                    annotated_record = Image(
                        image_id=uuid.uuid4(),
                        inspection_id=scan_uuid,
                        type="annotated",
                        storage_path=str(annotated_path),
                        file_name="annotated.jpg",
                        file_size=annotated_path.stat().st_size,
                        mime_type="image/jpeg",
                    )
                    db.add(annotated_record)
                except Exception as img_err:
                    logger.warning(f"Failed to record annotated image in DB: {img_err}")

            try:
                await db.commit()
                await db.refresh(inspection)
            except Exception as db_err:
                logger.warning(f"Failed to commit artifact images in DB: {db_err}")
    except Exception as e:
        logger.error(f"OCR pipeline processing failed for scan {scan_uuid}: {e}")
        # Mark inspection as needs_review per system rules without failing upload
        try:
            inspection.status = "needs_review"
            inspection.inspector_remarks = f"OCR processing failure: {str(e)}"
            await db.commit()
            await db.refresh(inspection)
        except Exception as db_err:
            logger.error(f"Failed to update inspection status after OCR failure: {db_err}")

        ocr_result = {
            "status": "failed",
            "scan_id": str(scan_uuid),
            "error": str(e),
        }

    return ScanUploadResponse(
        scan_id=str(inspection.inspection_id),
        image_id=str(image_record.image_id),
        file_name=safe_filename,
        file_size=len(file_bytes),
        image_hash=file_hash,
        status=inspection.status,
        ocr=ocr_result,
        created_at=inspection.created_at,
    )


@router.get(
    "/{scan_id}",
    response_model=ScanDetailResponse,
    summary="Get scan and inspection details by ID"
)
async def get_scan_by_id(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve scan/inspection record and associated images by scan_id."""
    try:
        scan_uuid = uuid.UUID(scan_id)
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scan ID format '{scan_id}'. Expected a valid UUID."
        )

    try:
        stmt = (
            select(Inspection)
            .where(Inspection.inspection_id == scan_uuid)
            .options(selectinload(Inspection.images))
        )
        result = await db.execute(stmt)
        inspection = result.scalars().first()
    except SQLAlchemyError as e:
        logger.error(f"Database error while querying scan {scan_uuid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while querying scan details."
        )

    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID '{scan_id}' not found."
        )

    images_meta = [
        ImageMetadata(
            image_id=str(img.image_id),
            type=img.type,
            storage_path=img.storage_path,
            file_name=img.file_name,
            file_size=img.file_size,
            mime_type=img.mime_type,
            image_hash=img.image_hash,
            created_at=img.created_at,
        )
        for img in inspection.images
    ]

    return ScanDetailResponse(
        scan_id=str(inspection.inspection_id),
        status=inspection.status,
        compliance_score=float(inspection.compliance_score) if inspection.compliance_score is not None else None,
        inspector_remarks=inspection.inspector_remarks,
        created_at=inspection.created_at,
        completed_at=inspection.completed_at,
        images=images_meta,
    )
