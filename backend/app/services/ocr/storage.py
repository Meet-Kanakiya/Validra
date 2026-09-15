"""Smart filesystem management for scan images and processing artifacts.

Owner: Team M3 (Computer Vision)
Provides structured folder isolation per scan:
uploads/scans/{scan_id}/
  ├── original.<ext>
  ├── original_upscaled.jpg
  ├── annotated.jpg
  └── ocr_result.json
"""

import shutil
from pathlib import Path
from typing import Optional
from app.core.config import settings


def get_scan_dir(scan_id: str) -> Path:
    """Ensure and return the isolated directory for a specific scan."""
    scan_dir = Path(settings.UPLOAD_DIR) / "scans" / str(scan_id)
    scan_dir.mkdir(parents=True, exist_ok=True)
    return scan_dir


def get_original_image_path(scan_id: str, extension: str = "jpg") -> Path:
    """Return path to the original raw uploaded image."""
    ext = extension.lstrip(".")
    return get_scan_dir(scan_id) / f"original.{ext}"


def get_upscaled_image_path(scan_id: str) -> Path:
    """Return path to the RGB upscaled image for OCR processing."""
    return get_scan_dir(scan_id) / "original_upscaled.jpg"


def get_preprocessed_image_path(scan_id: str) -> Path:
    """Return path to the OCR preprocessed image (alias to original_upscaled.jpg)."""
    return get_upscaled_image_path(scan_id)


def get_annotated_image_path(scan_id: str) -> Path:
    """Return path to the visual evidence image with drawn bounding boxes."""
    return get_scan_dir(scan_id) / "annotated.jpg"


def get_ocr_result_json_path(scan_id: str) -> Path:
    """Return path to the structured OCR result JSON file."""
    return get_scan_dir(scan_id) / "ocr_result.json"


def cleanup_scan_dir(scan_id: str) -> bool:
    """Remove scan directory and artifacts in case of critical failure or purge."""
    scan_dir = Path(settings.UPLOAD_DIR) / "scans" / str(scan_id)
    if scan_dir.exists() and scan_dir.is_dir():
        shutil.rmtree(scan_dir, ignore_errors=True)
        return True
    return False

