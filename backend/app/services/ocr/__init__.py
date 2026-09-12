"""Validra OCR & Computer Vision Subsystem (Team M3)."""

from app.services.ocr.ocr_main import OCRPipeline, ocr_pipeline, run_ocr_pipeline
from app.services.ocr.quality_gate import check_image_quality, QualityCheckResult
from app.services.ocr.preprocessor import preprocess_phone_image
from app.services.ocr.engine import PaddleOCREngine, ocr_engine
from app.services.ocr.geometry import compute_bbox_metrics, draw_bounding_boxes
from app.services.ocr.field_parser import structure_legal_metrology_fields
from app.services.ocr.storage import (
    get_scan_dir,
    get_original_image_path,
    get_preprocessed_image_path,
    get_annotated_image_path,
    cleanup_scan_dir,
)

__all__ = [
    "OCRPipeline",
    "ocr_pipeline",
    "run_ocr_pipeline",
    "check_image_quality",
    "QualityCheckResult",
    "preprocess_phone_image",
    "PaddleOCREngine",
    "ocr_engine",
    "compute_bbox_metrics",
    "draw_bounding_boxes",
    "structure_legal_metrology_fields",
    "get_scan_dir",
    "get_original_image_path",
    "get_preprocessed_image_path",
    "get_annotated_image_path",
    "cleanup_scan_dir",
]
