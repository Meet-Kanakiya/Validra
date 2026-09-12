"""Smart filesystem management for scan images and processing artifacts.

Owner: Team M3 (Computer Vision)
Provides structured folder isolation per scan:
uploads/scans/{scan_id}/
  ├── original.<ext>
  ├── preprocessed.jpg
  └── annotated.jpg
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


def get_preprocessed_image_path(scan_id: str) -> Path:
    """Return path to the OCR-optimized preprocessed image."""
    return get_scan_dir(scan_id) / "preprocessed.jpg"


def get_annotated_image_path(scan_id: str) -> Path:
    """Return path to the visual evidence image with drawn bounding boxes."""
    return get_scan_dir(scan_id) / "annotated.jpg"


def cleanup_scan_dir(scan_id: str) -> bool:
    """Remove scan directory and artifacts in case of critical failure or purge."""
    scan_dir = Path(settings.UPLOAD_DIR) / "scans" / str(scan_id)
    if scan_dir.exists() and scan_dir.is_dir():
        shutil.rmtree(scan_dir, ignore_errors=True)
        return True
    return False
