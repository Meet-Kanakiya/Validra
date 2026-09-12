"""PaddleOCR portable engine wrapper and execution runtime.

Owner: Team M3 (Computer Vision)
Provides:
- Thread-safe lazy singleton initialization
- Cross-platform portability (Windows, macOS Apple Silicon, Linux)
- Non-blocking asynchronous inference via asyncio.to_thread
- Unified output structure with 4-point polygons, text, and confidence
"""

import asyncio
import logging
import os
import sys
import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
from PIL import Image as PILImage

# Suppress noisy external warnings from Paddle / PaddleX on Windows
warnings.filterwarnings("ignore", message=".*ccache.*")
warnings.filterwarnings("ignore", category=UserWarning, module="paddle.*")
warnings.filterwarnings("ignore", category=UserWarning, module="paddlex.*")

logger = logging.getLogger("validra.ocr.engine")


class PaddleOCREngine:
    """Portable PaddleOCR singleton wrapper."""

    _instance: Optional["PaddleOCREngine"] = None
    _ocr_model: Any = None
    _initialized: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PaddleOCREngine, cls).__new__(cls)
        return cls._instance

    def initialize(self, lang: str = "en") -> None:
        """Initialize PaddleOCR engine lazily, reusing locally cached models if available."""
        if self._initialized and self._ocr_model is not None:
            return

        logger.info(f"Initializing PaddleOCR engine with lang={lang}...")
        try:
            from paddleocr import PaddleOCR

            # Check if local model files already exist to prevent redundant download checks
            paddlex_models_dir = Path.home() / ".paddlex" / "official_models"
            det_dir = paddlex_models_dir / "PP-OCRv4_mobile_det"
            rec_dir = paddlex_models_dir / "PP-OCRv4_mobile_rec"

            has_local_models = det_dir.exists() and rec_dir.exists()

            kwargs: Dict[str, Any] = {
                "use_doc_orientation_classify": False,
                "use_doc_unwarping": False,
                "use_textline_orientation": False,
            }

            if has_local_models:
                logger.info(f"Using locally cached PaddleOCR models from {paddlex_models_dir}")
                kwargs["text_detection_model_name"] = "PP-OCRv4_mobile_det"
                kwargs["text_detection_model_dir"] = str(det_dir)
                kwargs["text_recognition_model_name"] = "PP-OCRv4_mobile_rec"
                kwargs["text_recognition_model_dir"] = str(rec_dir)
            else:
                logger.info("Local models not found in cache; downloading PP-OCRv4 models...")
                kwargs["ocr_version"] = "PP-OCRv4"

            self._ocr_model = PaddleOCR(**kwargs)
            self._initialized = True
            logger.info("PaddleOCR engine initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {e}", exc_info=True)
            self._ocr_model = None
            self._initialized = False
            raise RuntimeError(f"PaddleOCR engine initialization error: {e}")

    def run_inference_sync(self, image_path: Union[str, Path]) -> List[Dict[str, Any]]:
        """Synchronous CPU/GPU inference for PaddleOCR.

        Args:
            image_path: Path to image file on disk.

        Returns:
            List of raw detections: [{"polygon": [...], "text": "...", "confidence": float}]
        """
        if not self._initialized or self._ocr_model is None:
            self.initialize()

        img_str = str(image_path)
        logger.debug(f"Running PaddleOCR inference on {img_str}")

        try:
            if hasattr(self._ocr_model, "predict"):
                results = list(self._ocr_model.predict(img_str))
            else:
                results = self._ocr_model.ocr(img_str, cls=True)
        except Exception as e:
            logger.error(f"PaddleOCR execution error on {img_str}: {e}")
            raise

        detections: List[Dict[str, Any]] = []

        if not results:
            return detections

        # Handle PaddleOCR 3.x structured dict format
        if isinstance(results[0], dict):
            page = results[0]
            texts = page.get("rec_texts", [])
            scores = page.get("rec_scores", [])
            polys = page.get("rec_polys", page.get("dt_polys", []))

            for idx, text in enumerate(texts):
                conf = float(scores[idx]) if idx < len(scores) else 0.0
                poly = polys[idx] if idx < len(polys) else []
                if hasattr(poly, "tolist"):
                    poly = poly.tolist()

                detections.append({
                    "polygon": poly,
                    "text": str(text).strip(),
                    "confidence": round(conf, 4),
                })
            return detections

        # Handle legacy PaddleOCR 2.x list-of-lines format
        lines = results[0] if isinstance(results[0], list) else results
        for line in lines:
            if not line or len(line) < 2:
                continue
            points = line[0]
            text_conf = line[1]

            if hasattr(points, "tolist"):
                points = points.tolist()

            if isinstance(text_conf, (list, tuple)) and len(text_conf) >= 2:
                text = str(text_conf[0]).strip()
                conf = float(text_conf[1]) if text_conf[1] is not None else 0.0
            else:
                text = str(text_conf).strip()
                conf = 0.0

            detections.append({
                "polygon": points,
                "text": text,
                "confidence": round(conf, 4),
            })

        return detections

    async def run_inference_async(self, image_path: Union[str, Path]) -> List[Dict[str, Any]]:
        """Run OCR inference in a separate worker thread to avoid blocking the event loop."""
        return await asyncio.to_thread(self.run_inference_sync, image_path)


# Global singleton instance
ocr_engine = PaddleOCREngine()
