"""Modular OCR Pipeline entrypoint and coordinator for Validra.

Owner: Team M3 (Computer Vision)
Orchestrates the 3-stage pipeline:
- Stage 1: Quality Gate & Mobile Phone Image Preprocessing
- Stage 2: PaddleOCR Detection, Bounding Box Geometry & Visual Evidence Annotation
- Stage 3: Legal Metrology Field Structuring (MRP, Net Qty, Dates, FSSAI, Entities)
"""

import time
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Union
from PIL import Image as PILImage

from app.core.config import settings
from app.services.ocr.quality_gate import check_image_quality
from app.services.ocr.preprocessor import preprocess_phone_image
from app.services.ocr.engine import ocr_engine
from app.services.ocr.geometry import (
    compute_bbox_metrics,
    draw_bounding_boxes,
    draw_compliance_field_bboxes,
)
from app.services.ocr.field_parser import structure_legal_metrology_fields
from app.services.ocr.storage import (
    get_scan_dir,
    get_preprocessed_image_path,
    get_annotated_image_path,
)

logger = logging.getLogger("validra.ocr")


class OCRPipeline:
    """Production OCR Pipeline coordinator."""

    def __init__(self, engine_name: str = "paddleocr"):
        self.engine_name = engine_name

    async def process_image(
        self,
        scan_id: str,
        image_path: str,
        skip_quality_gate: bool = False,
    ) -> Dict[str, Any]:
        """Execute full OCR pipeline on an uploaded product image.

        Args:
            scan_id: Unique identifier for the scan.
            image_path: Filesystem path to the original uploaded image.
            skip_quality_gate: If True, bypasses blur/glare checks (useful for test mocks).

        Returns:
            Structured Dict containing quality report, OCR regions, evidence overlay, and parsed fields.
        """
        start_time = time.perf_counter()
        src_path = Path(image_path)

        if not src_path.exists():
            return {
                "status": "failed",
                "scan_id": scan_id,
                "error": f"Image file not found: {image_path}",
            }

        scan_dir = get_scan_dir(scan_id)
        preprocessed_path = get_preprocessed_image_path(scan_id)
        annotated_path = get_annotated_image_path(scan_id)

        # -------------------------------------------------------------
        # Stage 1: Quality Gate & Mobile Image Preprocessing
        # -------------------------------------------------------------
        import os
        is_test_env = (getattr(settings, "ENV", "").lower() in ("test", "testing")) or (os.getenv("TESTING") == "1")
        quality_result = check_image_quality(src_path)
        if not skip_quality_gate and not is_test_env and not quality_result.passed:
            logger.warning(f"Scan {scan_id} failed quality gate: {quality_result.issues}")
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            return {
                "status": "quality_failed",
                "scan_id": scan_id,
                "engine": self.engine_name,
                "processing_time_ms": elapsed_ms,
                "quality": quality_result.to_dict(),
                "regions": [],
                "fields": {},
                "message": quality_result.advisory or "Image failed quality requirements.",
            }

        try:
            # Preprocess image (EXIF auto-orientation, contrast tuning, scaling)
            preprocess_phone_image(
                input_path=src_path,
                output_path=preprocessed_path,
            )
        except Exception as e:
            logger.error(f"Image preprocessing failed for scan {scan_id}: {e}", exc_info=True)
            # Fall back to source path if preprocessing fails
            preprocessed_path = src_path

        # -------------------------------------------------------------
        # Stage 2: PaddleOCR Inference & Geometry Derivation
        # -------------------------------------------------------------
        try:
            with PILImage.open(preprocessed_path) as pimg:
                img_width, img_height = pimg.size

            raw_detections = await ocr_engine.run_inference_async(preprocessed_path)
        except Exception as e:
            logger.error(f"OCR inference failed for scan {scan_id}: {e}", exc_info=True)
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            return {
                "status": "failed",
                "scan_id": scan_id,
                "engine": self.engine_name,
                "processing_time_ms": elapsed_ms,
                "error": str(e),
                "quality": quality_result.to_dict(),
                "regions": [],
                "fields": {},
            }

        # Calculate bounding boxes, aspect ratio, height, and normalized coordinates
        regions = []
        for det in raw_detections:
            polygon = det.get("polygon", [])
            text = det.get("text", "")
            conf = det.get("confidence", 0.0)

            if len(polygon) >= 4:
                metrics = compute_bbox_metrics(polygon, img_width, img_height)
                regions.append({
                    "text": text,
                    "confidence": conf,
                    "polygon": metrics["polygon"],
                    "bbox": metrics["bbox"],
                    "bbox_width_px": metrics["bbox_width_px"],
                    "bbox_height_px": metrics["bbox_height_px"],
                    "aspect_ratio": metrics["aspect_ratio"],
                    "normalized_bbox": metrics["normalized_bbox"],
                    "relative_height_ratio": metrics["relative_height_ratio"],
                })

        # -------------------------------------------------------------
        # Stage 3: Structuring & Organizing for Rule Engine
        # -------------------------------------------------------------
        structured_fields = structure_legal_metrology_fields(regions)

        # -------------------------------------------------------------
        # Stage 4: Draw Bounding Boxes ONLY on Matched Compliance Fields
        # -------------------------------------------------------------
        annotated_image_path_str = None
        try:
            draw_compliance_field_bboxes(
                image_path=preprocessed_path,
                fields=structured_fields,
                output_path=annotated_path,
            )
            annotated_image_path_str = str(annotated_path)
        except Exception as e:
            logger.warning(f"Failed to generate annotated bounding box image: {e}")
            annotated_image_path_str = None

        elapsed_ms = int((time.perf_counter() - start_time) * 1000)
        logger.info(
            f"Scan {scan_id} OCR completed in {elapsed_ms}ms: "
            f"{len(regions)} regions, {sum(1 for f in structured_fields.values() if f)} fields found."
        )

        return {
            "status": "completed",
            "scan_id": scan_id,
            "engine": self.engine_name,
            "model_version": "PP-OCRv4",
            "processing_time_ms": elapsed_ms,
            "annotated_image_path": annotated_image_path_str,
            "annotated_image_url": f"/uploads/scans/{scan_id}/annotated.jpg" if annotated_image_path_str else None,
            "quality": quality_result.to_dict(),
            "regions": regions,
            "fields": structured_fields,
            "message": "OCR pipeline and Legal Metrology field extraction completed successfully.",
        }


# Default singleton pipeline instance
ocr_pipeline = OCRPipeline()


async def run_ocr_pipeline(
    scan_id: str,
    image_path: str,
    skip_quality_gate: bool = False,
) -> Dict[str, Any]:
    """Helper function to dispatch an image through the OCR pipeline."""
    return await ocr_pipeline.process_image(
        scan_id=scan_id,
        image_path=image_path,
        skip_quality_gate=skip_quality_gate,
    )
