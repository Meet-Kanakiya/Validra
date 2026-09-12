"""OCR Pipeline entrypoint module for Validra.

Owner: Team M3 (Computer Vision)
This module acts as the modular boundary/interface for OCR processing.
Actual OCR implementation (PaddleOCR PP-OCRv4, preprocessing, text detection)
will be integrated by the Computer Vision team.
"""

import logging
from typing import Any, Dict

logger = logging.getLogger("validra.ocr")


class OCRPipeline:
    """Modular OCR Pipeline coordinator."""

    def __init__(self, engine: str = "paddleocr"):
        self.engine = engine

    async def process_image(self, scan_id: str, image_path: str) -> Dict[str, Any]:
        """Execute OCR pipeline for a given image.

        Args:
            scan_id: UUID string of the inspection/scan.
            image_path: Absolute or relative filesystem path to the uploaded image.

        Returns:
            Dict containing OCR extraction status, regions, and metadata.
        """
        logger.info(f"[OCR-DUMMY] Triggered OCR pipeline for scan {scan_id} on file {image_path}")

        # Modular placeholder: returns structured dummy payload for downstream processing
        return {
            "status": "queued",
            "scan_id": scan_id,
            "engine": self.engine,
            "image_path": image_path,
            "regions": [],
            "message": "OCR pipeline entrypoint reached. Team M3 implementation placeholder.",
        }


# Default pipeline instance
ocr_pipeline = OCRPipeline()


async def run_ocr_pipeline(scan_id: str, image_path: str) -> Dict[str, Any]:
    """Top-level helper function to dispatch image to the modular OCR pipeline."""
    return await ocr_pipeline.process_image(scan_id=scan_id, image_path=image_path)
