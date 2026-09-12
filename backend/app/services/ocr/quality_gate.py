"""Image Quality Gate module for validating phone-captured product labels.

Owner: Team M3 (Computer Vision)
Inspects images before OCR execution:
- Blur detection via Laplacian variance
- Overexposure / Glare reflection on glossy retail packaging
- Underexposure / Lighting adequacy
- Resolution sufficiency for small compliance fonts
- Edge density / text presence
"""

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import numpy as np
from PIL import Image as PILImage

logger = logging.getLogger("validra.ocr.quality")


@dataclass
class QualityCheckResult:
    passed: bool
    blur_score: float = 0.0
    brightness_score: float = 0.0
    glare_ratio: float = 0.0
    resolution: List[int] = field(default_factory=lambda: [0, 0])
    text_region_detected: bool = True
    issues: List[str] = field(default_factory=list)
    advisory: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "blur_score": round(self.blur_score, 2),
            "brightness": round(self.brightness_score, 2),
            "glare_ratio": round(self.glare_ratio, 4),
            "resolution": self.resolution,
            "text_region_detected": self.text_region_detected,
            "issues": self.issues,
            "advisory": self.advisory,
        }


def check_image_quality(
    image_input: Union[str, Path, np.ndarray, PILImage.Image],
    min_width: int = 300,
    min_height: int = 300,
    blur_threshold: float = 60.0,
    glare_threshold: float = 0.20,
    min_brightness: float = 30.0,
    max_brightness: float = 245.0,
) -> QualityCheckResult:
    """Evaluate image quality metrics to determine if OCR can reliably run.

    Args:
        image_input: File path, numpy array (BGR/RGB), or PIL Image.
        min_width: Minimum acceptable pixel width.
        min_height: Minimum acceptable pixel height.
        blur_threshold: Minimum Laplacian variance score for sharp images.
        glare_threshold: Maximum allowable ratio of overexposed pixels.
        min_brightness: Minimum mean pixel brightness (0-255).
        max_brightness: Maximum mean pixel brightness (0-255).

    Returns:
        QualityCheckResult with metrics, pass/fail status, and user advisories.
    """
    try:
        if isinstance(image_input, (str, Path)):
            pil_img = PILImage.open(str(image_input)).convert("RGB")
            np_img = np.array(pil_img)
        elif isinstance(image_input, PILImage.Image):
            pil_img = image_input.convert("RGB")
            np_img = np.array(pil_img)
        elif isinstance(image_input, np.ndarray):
            np_img = image_input
            if len(np_img.shape) == 2:
                np_img = np.stack((np_img,) * 3, axis=-1)
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")
    except Exception as e:
        logger.error(f"Failed to read image for quality gate: {e}")
        return QualityCheckResult(
            passed=False,
            issues=["UNREADABLE_IMAGE"],
            advisory="Image file is corrupt or cannot be decoded. Please re-upload.",
        )

    height, width = np_img.shape[:2]
    resolution = [width, height]
    issues = []
    advisories = []

    # 1. Resolution Check
    if width < min_width or height < min_height:
        issues.append("LOW_RESOLUTION")
        advisories.append(f"Image resolution ({width}x{height}) is too small to resolve legal compliance text. Minimum required is {min_width}x{min_height}px.")

    # Convert to grayscale for illumination and focus analysis
    if len(np_img.shape) == 3 and np_img.shape[2] == 3:
        # Standard luminance conversion Y = 0.299R + 0.587G + 0.114B
        gray = np.dot(np_img[..., :3], [0.299, 0.587, 0.114]).astype(np.float32)
    else:
        gray = np_img.astype(np.float32)

    # 2. Brightness Assessment
    mean_brightness = float(np.mean(gray))
    if mean_brightness < min_brightness:
        issues.append("UNDEREXPOSED")
        advisories.append("Image is too dark. Please take photo under adequate lighting.")
    elif mean_brightness > max_brightness:
        issues.append("OVEREXPOSED")
        advisories.append("Image is completely washed out. Please reduce lighting or turn off flash.")

    # 3. Glare Ratio (Highlight clipping on packaging)
    overexposed_pixels = np.sum(gray >= 250)
    total_pixels = gray.size
    glare_ratio = float(overexposed_pixels / total_pixels) if total_pixels > 0 else 0.0

    if glare_ratio > glare_threshold:
        issues.append("SEVERE_GLARE")
        advisories.append("Severe glare detected on package surface reflecting flash/light. Please tilt phone slightly to avoid specular reflection.")

    # 4. Blur Score (Laplacian variance using discrete kernel approximation)
    # 3x3 Laplacian kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
    # Fast numpy convolution
    try:
        kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
        # Compute laplacian on subsampled image if very large to save latency
        sub_gray = gray
        if max(height, width) > 1200:
            scale = 1200 / max(height, width)
            new_w = max(1, int(width * scale))
            new_h = max(1, int(height * scale))
            sub_gray = np.array(PILImage.fromarray(gray.astype(np.uint8)).resize((new_w, new_h)))

        # 2D correlation with laplacian
        padded = np.pad(sub_gray, pad_width=1, mode="edge")
        laplacian = (
            padded[0:-2, 1:-1]
            + padded[2:, 1:-1]
            + padded[1:-1, 0:-2]
            + padded[1:-1, 2:]
            - 4 * padded[1:-1, 1:-1]
        )
        blur_score = float(np.var(laplacian))
    except Exception as e:
        logger.warning(f"Failed to compute blur score: {e}")
        blur_score = 100.0

    if blur_score < blur_threshold:
        issues.append("BLURRY_IMAGE")
        advisories.append("Image is blurry. Blurry text can cause misread numbers. Please hold the phone steady and tap to focus.")

    # 5. Detail / Text Region presence (Gradient energy)
    grad_x = np.abs(np.diff(gray, axis=1))
    edge_density = float(np.mean(grad_x > 20))
    text_region_detected = edge_density > 0.015

    if not text_region_detected:
        issues.append("NO_TEXT_REGION_DETECTED")
        advisories.append("No clear text edges detected on the package. Ensure the product label is centered and filling the frame.")

    passed = len(issues) == 0
    final_advisory = " ".join(advisories) if advisories else "Image quality passed."

    return QualityCheckResult(
        passed=passed,
        blur_score=blur_score,
        brightness_score=mean_brightness,
        glare_ratio=glare_ratio,
        resolution=resolution,
        text_region_detected=text_region_detected,
        issues=issues,
        advisory=final_advisory,
    )
