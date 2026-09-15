"""Validra OCR & Computer Vision Subsystem (Team M3)."""

from app.services.ocr.ocr_main import OCRPipeline, ocr_pipeline, run_ocr_pipeline
from app.services.ocr.quality_gate import check_image_quality, QualityCheckResult
from app.services.ocr.preprocessor import (
    preprocess_upscale_rgb,
    preprocess_phone_image,
    preprocess_multi_variant,
    PreprocessingResult,
    VARIANT_UPSCALE,
    ALL_VARIANTS,
    CORE_VARIANTS,
)
from app.services.ocr.engine import PaddleOCREngine, ocr_engine
from app.services.ocr.variant_fusion import (
    fuse_variant_results,
    deduplicate_detections,
    compute_bbox_iou,
)
from app.services.ocr.measurement import (
    compute_char_metrics,
    enrich_regions_with_measurements,
    enrich_fields_with_measurements,
)
from app.services.ocr.geometry import compute_bbox_metrics, draw_bounding_boxes, draw_compliance_field_bboxes
from app.services.ocr.field_parser import structure_legal_metrology_fields, spatial_proximity_score
from app.services.ocr.storage import (
    get_scan_dir,
    get_original_image_path,
    get_upscaled_image_path,
    get_preprocessed_image_path,
    get_annotated_image_path,
    get_ocr_result_json_path,
    cleanup_scan_dir,
)

__all__ = [
    # Pipeline
    "OCRPipeline",
    "ocr_pipeline",
    "run_ocr_pipeline",
    # Quality Gate
    "check_image_quality",
    "QualityCheckResult",
    # Preprocessing
    "preprocess_upscale_rgb",
    "preprocess_phone_image",
    "preprocess_multi_variant",
    "PreprocessingResult",
    "VARIANT_UPSCALE",
    "ALL_VARIANTS",
    "CORE_VARIANTS",
    # Engine
    "PaddleOCREngine",
    "ocr_engine",
    # Deduplication
    "deduplicate_detections",
    "compute_bbox_iou",
    "fuse_variant_results",
    # Measurement
    "compute_char_metrics",
    "enrich_regions_with_measurements",
    "enrich_fields_with_measurements",
    # Geometry
    "compute_bbox_metrics",
    "draw_bounding_boxes",
    "draw_compliance_field_bboxes",
    # Field Parser
    "structure_legal_metrology_fields",
    "spatial_proximity_score",
    # Storage
    "get_scan_dir",
    "get_original_image_path",
    "get_upscaled_image_path",
    "get_preprocessed_image_path",
    "get_annotated_image_path",
    "get_ocr_result_json_path",
    "cleanup_scan_dir",
]
