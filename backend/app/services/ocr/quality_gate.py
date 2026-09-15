"""Image Quality Gate module for validating phone-captured product labels.

Owner: Team M3 (Computer Vision)
Inspects images before OCR execution:
- Blur detection via Laplacian variance
- Motion blur detection via directional gradient energy ratio
- Overexposure / Glare reflection on glossy retail packaging
- Underexposure / Lighting adequacy
- Resolution sufficiency for small compliance fonts
- Perspective skew estimation via edge angle variance
- Text coverage / text area ratio check
- Edge density / text presence
"""

import logging
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import numpy as np
from PIL import Image as PILImage

logger = logging.getLogger("validra.ocr.quality")


@dataclass
class QualityCheckResult:
    passed: bool
    requires_retake: bool = False
    blur_score: float = 0.0
    brightness_score: float = 0.0
    glare_ratio: float = 0.0
    motion_blur_score: float = 0.0
    perspective_skew_degrees: float = 0.0
    text_coverage_ratio: float = 0.0
    resolution: List[int] = field(default_factory=lambda: [0, 0])
    text_region_detected: bool = True
    issues: List[str] = field(default_factory=list)
    advisory: Optional[str] = None
    retake_guidance: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "requires_retake": self.requires_retake,
            "blur_score": round(self.blur_score, 2),
            "brightness": round(self.brightness_score, 2),
            "glare_ratio": round(self.glare_ratio, 4),
            "motion_blur_score": round(self.motion_blur_score, 2),
            "perspective_skew_degrees": round(self.perspective_skew_degrees, 1),
            "text_coverage_ratio": round(self.text_coverage_ratio, 4),
            "resolution": self.resolution,
            "text_region_detected": self.text_region_detected,
            "issues": self.issues,
            "advisory": self.advisory,
            "retake_guidance": self.retake_guidance,
        }


def _compute_motion_blur_score(gray: np.ndarray) -> float:
    """Detect motion blur via directional gradient energy ratio.

    Motion blur creates strong gradients in one direction and weak in the other.
    Returns ratio of gradient energies (high ratio = likely motion blur).
    A ratio > 3.0 typically indicates significant motion blur.
    """
    # Horizontal and vertical Sobel gradients
    grad_x = np.diff(gray.astype(np.float32), axis=1)
    grad_y = np.diff(gray.astype(np.float32), axis=0)

    energy_x = float(np.mean(grad_x ** 2))
    energy_y = float(np.mean(grad_y ** 2))

    if min(energy_x, energy_y) < 1e-6:
        return 10.0  # One direction has near-zero energy → severe directional blur

    ratio = max(energy_x, energy_y) / max(1e-6, min(energy_x, energy_y))
    return ratio


def _estimate_perspective_skew(gray: np.ndarray) -> float:
    """Estimate perspective skew from variance of horizontal edge angles.

    Uses Sobel gradients to estimate dominant edge orientations.
    Returns estimated skew in degrees. > 15° is considered severe.
    """
    # Subsample for performance on large images
    h, w = gray.shape
    if max(h, w) > 800:
        scale = 800 / max(h, w)
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        gray = np.array(PILImage.fromarray(gray.astype(np.uint8)).resize((new_w, new_h)))

    # Compute gradients
    grad_x = np.diff(gray.astype(np.float32), axis=1)
    grad_y = np.diff(gray.astype(np.float32), axis=0)

    # Ensure same shape
    min_h = min(grad_x.shape[0], grad_y.shape[0])
    min_w = min(grad_x.shape[1], grad_y.shape[1])
    gx = grad_x[:min_h, :min_w]
    gy = grad_y[:min_h, :min_w]

    # Only consider pixels with significant gradient magnitude
    magnitude = np.sqrt(gx ** 2 + gy ** 2)
    strong_mask = magnitude > np.percentile(magnitude, 85)

    if np.sum(strong_mask) < 100:
        return 0.0

    angles = np.degrees(np.arctan2(gy[strong_mask], gx[strong_mask]))
    # Focus on near-horizontal edges (text baselines)
    horizontal_angles = angles[np.abs(angles) < 30]

    if len(horizontal_angles) < 50:
        return 0.0

    median_angle = float(np.median(horizontal_angles))
    return abs(median_angle)


def _compute_text_coverage(gray: np.ndarray) -> float:
    """Estimate text coverage ratio via gradient-based text region detection.

    Returns ratio of high-gradient pixels (text-like) to total pixels.
    < 5% typically means the product label isn't filling the frame.
    """
    # Compute gradient magnitude
    grad_x = np.abs(np.diff(gray.astype(np.float32), axis=1))
    grad_y = np.abs(np.diff(gray.astype(np.float32), axis=0))

    # Ensure same shape
    min_h = min(grad_x.shape[0], grad_y.shape[0])
    min_w = min(grad_x.shape[1], grad_y.shape[1])

    combined = grad_x[:min_h, :min_w] + grad_y[:min_h, :min_w]
    text_pixels = np.sum(combined > 30)
    total_pixels = combined.size

    return float(text_pixels / max(1, total_pixels))


# Strict Quality Gate Thresholds
STRICT_MIN_WIDTH = 400
STRICT_MIN_HEIGHT = 400
STRICT_BLUR_THRESHOLD = 120.0          # Strict minimum Laplacian sharpness score
STRICT_MIN_BRIGHTNESS = 50.0           # Strict minimum illumination (0-255)
STRICT_MAX_BRIGHTNESS = 220.0          # Strict maximum illumination (0-255)
STRICT_GLARE_THRESHOLD = 0.05          # Strict maximum glare/reflection ratio (5%)
STRICT_MOTION_BLUR_THRESHOLD = 2.2     # Strict maximum directional motion smear ratio
STRICT_PERSPECTIVE_THRESHOLD = 8.0     # Strict maximum skew degrees (8°)
STRICT_TEXT_COVERAGE_THRESHOLD = 0.04  # Strict minimum text coverage ratio (4%)


def check_image_quality(
    image_input: Union[str, Path, np.ndarray, PILImage.Image],
    min_width: int = STRICT_MIN_WIDTH,
    min_height: int = STRICT_MIN_HEIGHT,
    blur_threshold: float = STRICT_BLUR_THRESHOLD,
    glare_threshold: float = STRICT_GLARE_THRESHOLD,
    min_brightness: float = STRICT_MIN_BRIGHTNESS,
    max_brightness: float = STRICT_MAX_BRIGHTNESS,
    motion_blur_threshold: float = STRICT_MOTION_BLUR_THRESHOLD,
    perspective_threshold: float = STRICT_PERSPECTIVE_THRESHOLD,
    text_coverage_threshold: float = STRICT_TEXT_COVERAGE_THRESHOLD,
) -> QualityCheckResult:
    """Evaluate strict image quality constraints to determine if OCR can reliably run.

    Strict Constraints Enforced:
    1. Resolution: Width >= min_width (400px), Height >= min_height (400px)
    2. Sharpness (Blur Score): Laplacian variance >= blur_threshold (120.0)
    3. Illumination (Brightness): min_brightness (50.0) <= mean luminance <= max_brightness (220.0)
    4. Glare / Reflection: Glare pixel ratio <= glare_threshold (0.05 / 5%)
    5. Motion Blur: Directional gradient ratio <= motion_blur_threshold (2.2)
    6. Perspective Skew: Skew angle <= perspective_threshold (8.0°)
    7. Text Coverage: High-gradient text area >= text_coverage_threshold (0.04 / 4%)
    8. Text Region Presence: Edge density confirms valid product text is visible

    Returns:
        QualityCheckResult with metrics, pass/fail status, requires_retake flag, and advisories.
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
            requires_retake=True,
            issues=["UNREADABLE_IMAGE"],
            advisory="Image quality check failed. Please retake image: Image file is corrupt or unreadable. Please capture and upload a new photo.",
            retake_guidance="Capture a new clear photo of the product packaging and upload again.",
        )

    height, width = np_img.shape[:2]
    resolution = [width, height]
    issues = []
    advisories = []
    guidelines = []

    # 1. Strict Resolution Check
    if width < min_width or height < min_height:
        issues.append("LOW_RESOLUTION")
        advisories.append(f"Image resolution ({width}x{height}) is too small to resolve legal compliance text. Minimum required is {min_width}x{min_height}px.")
        guidelines.append(f"Use standard or high camera resolution (minimum {min_width}x{min_height}px) and ensure the label is in full view.")

    # Convert to grayscale for illumination and focus analysis
    if len(np_img.shape) == 3 and np_img.shape[2] == 3:
        # Standard luminance conversion Y = 0.299R + 0.587G + 0.114B
        gray = np.dot(np_img[..., :3], [0.299, 0.587, 0.114]).astype(np.float32)
    else:
        gray = np_img.astype(np.float32)

    # 2. Strict Brightness Assessment
    mean_brightness = float(np.mean(gray))
    if mean_brightness < min_brightness:
        issues.append("UNDEREXPOSED")
        advisories.append(f"Image is too dark (brightness: {mean_brightness:.1f} < {min_brightness:.1f}).")
        guidelines.append("Please retake the photo under adequate, balanced lighting.")
    elif mean_brightness > max_brightness:
        issues.append("OVEREXPOSED")
        advisories.append(f"Image is completely washed out (brightness: {mean_brightness:.1f} > {max_brightness:.1f}).")
        guidelines.append("Please retake the photo with reduced lighting or flash turned off.")

    # 3. Strict Glare Ratio Assessment (Highlight clipping on packaging)
    overexposed_pixels = np.sum(gray >= 248)
    total_pixels = gray.size
    glare_ratio = float(overexposed_pixels / total_pixels) if total_pixels > 0 else 0.0

    if glare_ratio > glare_threshold:
        issues.append("SEVERE_GLARE")
        advisories.append(f"Severe glare detected on package surface ({glare_ratio * 100:.1f}% overexposed area > {glare_threshold * 100:.1f}% limit).")
        guidelines.append("Please retake by tilting phone 10-15 degrees to avoid specular flash/light reflections.")

    # 4. Strict Sharpness / Blur Score Assessment (Laplacian variance)
    try:
        sub_gray = gray
        if max(height, width) > 1200:
            scale = 1200 / max(height, width)
            new_w = max(1, int(width * scale))
            new_h = max(1, int(height * scale))
            sub_gray = np.array(PILImage.fromarray(gray.astype(np.uint8)).resize((new_w, new_h)))

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
        advisories.append(f"Image is blurry (sharpness score: {blur_score:.1f} < {blur_threshold:.1f}). Blurry text causes misread compliance numbers.")
        guidelines.append("Please retake holding the phone steady and tap the screen to focus sharply on text.")

    # 5. Strict Motion Blur Detection
    try:
        motion_blur_score = _compute_motion_blur_score(gray.astype(np.uint8))
    except Exception as e:
        logger.warning(f"Failed to compute motion blur score: {e}")
        motion_blur_score = 1.0

    if motion_blur_score > motion_blur_threshold:
        issues.append("MOTION_BLUR")
        advisories.append(f"Motion blur detected (directional smear ratio: {motion_blur_score:.2f} > {motion_blur_threshold:.2f}).")
        guidelines.append("Please retake holding the phone completely steady while capturing.")

    # 6. Strict Perspective Skew Estimation
    try:
        perspective_skew = _estimate_perspective_skew(gray.astype(np.uint8))
    except Exception as e:
        logger.warning(f"Failed to estimate perspective skew: {e}")
        perspective_skew = 0.0

    if perspective_skew > perspective_threshold:
        issues.append("SEVERE_PERSPECTIVE")
        advisories.append(f"Severe perspective distortion detected ({perspective_skew:.1f}° > {perspective_threshold:.1f}° limit).")
        guidelines.append("Please retake holding the phone directly parallel and facing the product label.")

    # 7. Strict Text Coverage Check
    try:
        text_coverage = _compute_text_coverage(gray.astype(np.uint8))
    except Exception as e:
        logger.warning(f"Failed to compute text coverage: {e}")
        text_coverage = 0.1

    if text_coverage < text_coverage_threshold:
        issues.append("LOW_TEXT_COVERAGE")
        advisories.append(f"Product label text area is too small ({text_coverage * 100:.1f}% < {text_coverage_threshold * 100:.1f}%).")
        guidelines.append("Please retake moving closer to ensure the product label fills the frame.")

    # 8. Detail / Text Region presence (Gradient energy)
    grad_x = np.abs(np.diff(gray, axis=1))
    edge_density = float(np.mean(grad_x > 20))
    text_region_detected = edge_density > 0.015

    if not text_region_detected:
        issues.append("NO_TEXT_REGION_DETECTED")
        advisories.append("No clear text edges detected on the package.")
        guidelines.append("Please retake ensuring the product label is centered, clear, and well-lit.")

    passed = len(issues) == 0
    requires_retake = not passed

    if passed:
        final_advisory = "Image quality passed."
        retake_guidance = None
    else:
        detailed_reasons = " ".join(advisories)
        final_advisory = f"Image quality check failed. Please retake image: {detailed_reasons}"
        retake_guidance = " ".join(guidelines)

    return QualityCheckResult(
        passed=passed,
        requires_retake=requires_retake,
        blur_score=blur_score,
        brightness_score=mean_brightness,
        glare_ratio=glare_ratio,
        motion_blur_score=motion_blur_score,
        perspective_skew_degrees=perspective_skew,
        text_coverage_ratio=text_coverage,
        resolution=resolution,
        text_region_detected=text_region_detected,
        issues=issues,
        advisory=final_advisory,
        retake_guidance=retake_guidance,
    )
