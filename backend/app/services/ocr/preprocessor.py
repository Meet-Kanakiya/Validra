"""RGB Upscale Image Preprocessing pipeline for Legal Metrology OCR.

Owner: Team M3 (Computer Vision)
Produces a high-resolution, OCR-optimized image:
- original_upscaled.jpg: 2x upscale in full RGB space with aspect ratio preservation and optional deskew.

Constraints:
- Preserves full RGB color information (no grayscale or CLAHE degradation)
- Preserves strict aspect ratio (no independent axis scaling)
- Coordinates and character heights are tracked via upscale_factor for back-projection
- Original image remains the legal measurement reference
"""

import logging
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import cv2
import numpy as np
from PIL import Image as PILImage, ImageOps

logger = logging.getLogger("validra.ocr.preprocessor")

VARIANT_UPSCALE = "upscale"
ALL_VARIANTS = [VARIANT_UPSCALE]
CORE_VARIANTS = [VARIANT_UPSCALE]


@dataclass
class PreprocessingResult:
    """Result of RGB upscaled preprocessing."""
    preprocessed_path: Optional[Path] = None
    variant_paths: Dict[str, Path] = field(default_factory=dict)
    variants_generated: List[str] = field(default_factory=lambda: [VARIANT_UPSCALE])
    original_width: int = 0
    original_height: int = 0
    processed_width: int = 0
    processed_height: int = 0
    scale_factor: float = 1.0
    deskew_angle: float = 0.0
    upscale_factor: float = 2.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "preprocessed_image": self.preprocessed_path.name if self.preprocessed_path else "original_upscaled.jpg",
            "original_dimensions": [self.original_width, self.original_height],
            "processed_dimensions": [self.processed_width, self.processed_height],
            "scale_factor": round(self.scale_factor, 4),
            "deskew_angle": round(self.deskew_angle, 2),
            "upscale_factor": round(self.upscale_factor, 2),
        }


def _pil_to_cv2(pil_img: PILImage.Image) -> np.ndarray:
    """Convert PIL RGB image to OpenCV BGR numpy array."""
    rgb = np.array(pil_img)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def _cv2_to_pil(cv_img: np.ndarray) -> PILImage.Image:
    """Convert OpenCV BGR numpy array to PIL RGB image."""
    if len(cv_img.shape) == 2:
        return PILImage.fromarray(cv_img, mode="L")
    rgb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
    return PILImage.fromarray(rgb)


def _estimate_deskew_angle(gray: np.ndarray, max_angle: float = 15.0) -> float:
    """Estimate text skew angle using Hough line transform on edge-detected image.

    Returns angle in degrees. Positive = counter-clockwise rotation needed.
    Returns 0.0 if no reliable angle detected or angle exceeds max_angle.
    """
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(
        edges, 1, np.pi / 180, threshold=80,
        minLineLength=gray.shape[1] // 8,
        maxLineGap=10
    )
    if lines is None or len(lines) < 3:
        return 0.0

    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        dx = x2 - x1
        dy = y2 - y1
        if abs(dx) < 5:
            continue
        angle = math.degrees(math.atan2(dy, dx))
        if abs(angle) < max_angle:
            angles.append(angle)

    if len(angles) < 3:
        return 0.0

    median_angle = float(np.median(angles))
    if abs(median_angle) > max_angle or abs(median_angle) < 0.3:
        return 0.0

    return median_angle


def _apply_deskew(img: np.ndarray, angle: float) -> np.ndarray:
    """Rotate RGB image to correct detected skew angle."""
    if abs(angle) < 0.3:
        return img
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    border_val = (255, 255, 255) if len(img.shape) == 3 else 255
    return cv2.warpAffine(
        img, matrix, (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=border_val
    )


def preprocess_upscale_rgb(
    input_path: Union[str, Path],
    output_path: Union[str, Path],
    upscale_factor: float = 2.0,
    max_dimension: int = 2400,
) -> PreprocessingResult:
    """Preprocess image by upscaling in full RGB space for PaddleOCR.

    Steps:
    1. Opens image and applies EXIF orientation correction.
    2. Limits oversized raw phone images to max_dimension preserving aspect ratio.
    3. Estimates and applies mild deskew correction.
    4. Upscales in RGB using cubic interpolation (keeping full color without grayscale or CLAHE).
    5. Saves directly to output_path (original_upscaled.jpg).

    Args:
        input_path: Path to raw original image.
        output_path: Path to save the original_upscaled.jpg.
        upscale_factor: Upscaling multiplier (default 2.0).
        max_dimension: Max length of longest edge before initial upscale.

    Returns:
        PreprocessingResult containing paths and scaling metadata.
    """
    src_path = Path(input_path)
    dst_path = Path(output_path)
    dst_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Open with PIL and correct EXIF orientation
    pil_img = PILImage.open(src_path)
    pil_img = ImageOps.exif_transpose(pil_img)
    if pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")

    orig_w, orig_h = pil_img.size

    # 2. Aspect-ratio-preserving resize if too large
    w, h = pil_img.size
    long_edge = max(w, h)
    scale = 1.0
    if long_edge > max_dimension:
        scale = max_dimension / long_edge
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        pil_img = pil_img.resize((new_w, new_h), PILImage.Resampling.LANCZOS)
        logger.debug(f"Pre-resize from {w}x{h} to {new_w}x{new_h} (scale={scale:.3f})")

    # 3. Convert to OpenCV BGR for deskew & upscale
    bgr_img = _pil_to_cv2(pil_img)
    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)

    # 4. Deskew estimation and correction
    deskew_angle = _estimate_deskew_angle(gray)
    if abs(deskew_angle) >= 0.3:
        bgr_img = _apply_deskew(bgr_img, deskew_angle)
        logger.debug(f"Applied deskew correction: {deskew_angle:.1f}°")

    # 5. Upscale in RGB (no grayscale, no CLAHE)
    h, w = bgr_img.shape[:2]
    upscaled_w = int(w * upscale_factor)
    upscaled_h = int(h * upscale_factor)
    upscaled_bgr = cv2.resize(bgr_img, (upscaled_w, upscaled_h), interpolation=cv2.INTER_CUBIC)

    # 6. Save as high-quality RGB JPEG
    pil_upscaled = _cv2_to_pil(upscaled_bgr)
    pil_upscaled.save(dst_path, format="JPEG", quality=95, optimize=True)

    logger.info(
        f"RGB upscale complete: {dst_path.name} ({upscaled_w}x{upscaled_h}), "
        f"upscale={upscale_factor}x, deskew={deskew_angle:.1f}°, scale={scale:.3f}"
    )

    return PreprocessingResult(
        preprocessed_path=dst_path,
        variant_paths={VARIANT_UPSCALE: dst_path},
        variants_generated=[VARIANT_UPSCALE],
        original_width=orig_w,
        original_height=orig_h,
        processed_width=upscaled_w,
        processed_height=upscaled_h,
        scale_factor=scale,
        deskew_angle=deskew_angle,
        upscale_factor=upscale_factor,
    )


# Backward-compatible multi-variant preprocessor wrapper
def preprocess_multi_variant(
    input_path: Union[str, Path],
    output_dir: Union[str, Path],
    max_dimension: int = 2400,
    variants: Optional[List[str]] = None,
    upscale_factor: float = 2.0,
) -> PreprocessingResult:
    """Backward-compatible wrapper routing to RGB upscale preprocessor."""
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    dst_path = out_dir / "original_upscaled.jpg"

    return preprocess_upscale_rgb(
        input_path=input_path,
        output_path=dst_path,
        upscale_factor=upscale_factor,
        max_dimension=max_dimension,
    )


# Backward-compatible single-image preprocessor wrapper
def preprocess_phone_image(
    input_path: Union[str, Path],
    output_path: Optional[Union[str, Path]] = None,
    max_dimension: int = 2400,
    enhance_contrast: bool = True,
) -> Path:
    """Backward-compatible wrapper routing to RGB upscale preprocessor."""
    src_path = Path(input_path)
    if output_path is None:
        dst_path = src_path.parent / "original_upscaled.jpg"
    else:
        dst_path = Path(output_path)

    result = preprocess_upscale_rgb(
        input_path=src_path,
        output_path=dst_path,
        upscale_factor=2.0,
        max_dimension=max_dimension,
    )
    return result.preprocessed_path or dst_path
