"""Pydantic schemas for Scan ingestion and retrieval."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class ImageMetadata(BaseModel):
    image_id: str
    type: str
    storage_path: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    image_hash: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScanUploadResponse(BaseModel):
    scan_id: str
    image_id: str
    file_name: str
    file_size: int
    image_hash: str
    status: str
    ocr: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScanDetailResponse(BaseModel):
    scan_id: str
    status: str
    compliance_score: Optional[float] = None
    inspector_remarks: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    images: List[ImageMetadata] = []

    model_config = ConfigDict(from_attributes=True)
