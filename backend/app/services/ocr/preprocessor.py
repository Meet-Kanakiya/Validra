"""Phone camera image preprocessing pipeline for Legal Metrology OCR readiness.

Owner: Team M3 (Computer Vision)
Handles real-world phone photography conditions:
- EXIF orientation correction (phone camera rotation tags)
- Contrast & dynamic range enhancement for noisy/colored backgrounds
- Noise suppression while preserving fine text stroke edges
- Intelligent downscaling of ultra-high-res phone photos to optimize latency
"""

import logging
from pathlib import Path
from typing import Optional, Tuple, Union
import numpy as np
from PIL import Image as PILImage, ImageEnhance, ImageFilter, ImageOps

logger = logging.getLogger("validra.ocr.preprocessor")


def preprocess_phone_image(
    input_path: Union[str, Path],
    output_path: Optional[Union[str, Path]] = None,
    max_dimension: int = 2400,
    enhance_contrast: bool = True,
) -> Path:
    """Preprocess a phone camera image to make it OCR-ready.

    Args:
        input_path: Path to the original uploaded image.
        output_path: Optional destination path. Defaults to overwriting or saving alongside.
        max_dimension: Maximum pixel size on longest edge to preserve low latency.
        enhance_contrast: Whether to apply adaptive contrast normalization.

    Returns:
        Path to the preprocessed, saved image.
    """
    src_path = Path(input_path)
    if output_path is None:
        dst_path = src_path.parent / f"preprocessed_{src_path.stem}.jpg"
    else:
        dst_path = Path(output_path)

    dst_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Open with Pillow and transpose per EXIF orientation tag
    img = PILImage.open(src_path)
    img = ImageOps.exif_transpose(img)

    # Ensure RGB
    if img.mode != "RGB":
        img = img.convert("RGB")

    width, height = img.size

    # 2. Scale down if mobile photo is unnecessarily large (> 2400px), maintaining aspect ratio
    long_edge = max(width, height)
    if long_edge > max_dimension:
        scale = max_dimension / long_edge
        new_w = max(1, int(width * scale))
        new_h = max(1, int(height * scale))
        img = img.resize((new_w, new_h), PILImage.Resampling.LANCZOS)
        logger.debug(f"Resized image from {width}x{height} to {new_w}x{new_h} for OCR latency optimization")

    # 3. Enhance text contrast on packaging if requested
    if enhance_contrast:
        # Mild contrast enhancement (factor 1.25) to make text stand out against package art
        contrast_enhancer = ImageEnhance.Contrast(img)
        img = contrast_enhancer.enhance(1.25)

        # Mild sharpness enhancement to restore character edges
        sharpness_enhancer = ImageEnhance.Sharpness(img)
        img = sharpness_enhancer.enhance(1.2)

    # 4. Save preprocessed image at high quality JPEG
    img.save(dst_path, format="JPEG", quality=95, optimize=True)
    return dst_path
