"""Character and text geometry measurement module for Legal Metrology compliance.

Owner: Team M3 (Computer Vision)
Separates OCR readability measurement from legal font-size measurement.

IMPORTANT ARCHITECTURAL CONSTRAINT:
- pixel_height != physical_height_mm
- Pixel → mm conversion is NOT performed (requires physical reference scale)
- OCR-variant coordinates are back-projected to original image coordinates
- The rule engine receives pixel measurements and must decide if physical
  verification is required (NEEDS_REVIEW vs direct PASS/FAIL)

Rule 7 context:
- Minimum numeral/letter heights depend on Principal Display Panel area
- Characters on blown/formed/moulded/embossed containers have different minimums
- Width generally must not be less than 1/3 of height (with exceptions)
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("validra.ocr.measurement")


def compute_char_metrics(
    bbox: Optional[List[int]],
    scale_factor: float = 1.0,
    upscale_factor: float = 1.0,
    original_image_dims: Optional[Tuple[int, int]] = None,
    source_variant: str = "rgb",
) -> Dict[str, Any]:
    """Compute character geometry metrics with coordinate back-projection.

    Args:
        bbox: [x1, y1, x2, y2] bounding box in OCR-variant coordinate space.
        scale_factor: Resize factor applied during preprocessing (original → base).
        upscale_factor: Additional upscale factor for upscale variant.
        original_image_dims: (width, height) of the original uploaded image.
        source_variant: Which preprocessing variant produced this detection.

    Returns:
        Dict with pixel measurements in both OCR and original coordinate systems,
        plus the transformation chain for audit/evidence.
    """
    if not bbox or len(bbox) < 4:
        return {
            "ocr_char_height_px": None,
            "ocr_char_width_px": None,
            "original_char_height_px": None,
            "original_char_width_px": None,
            "scale_factor": scale_factor,
            "upscale_factor": upscale_factor,
            "source_variant": source_variant,
            "estimated_physical_height_mm": None,
            "physical_measurement_available": False,
        }

    x1, y1, x2, y2 = bbox
    ocr_width = max(1, x2 - x1)
    ocr_height = max(1, y2 - y1)

    # Back-project to original image coordinates
    # If upscale variant was used, divide by upscale_factor first
    effective_scale = scale_factor
    if source_variant == "upscale" and upscale_factor > 1.0:
        effective_scale = scale_factor * upscale_factor

    # In original coordinates
    if effective_scale > 0:
        original_height = ocr_height / effective_scale if effective_scale != 1.0 else ocr_height
        original_width = ocr_width / effective_scale if effective_scale != 1.0 else ocr_width
    else:
        original_height = float(ocr_height)
        original_width = float(ocr_width)

    # Width-to-height ratio (Rule 7 requires width >= 1/3 height for most characters)
    width_height_ratio = original_width / max(1, original_height)

    # Relative height as fraction of full image height
    relative_height = None
    if original_image_dims and original_image_dims[1] > 0:
        relative_height = round(original_height / original_image_dims[1], 5)

    return {
        "ocr_char_height_px": round(float(ocr_height), 1),
        "ocr_char_width_px": round(float(ocr_width), 1),
        "original_char_height_px": round(float(original_height), 1),
        "original_char_width_px": round(float(original_width), 1),
        "width_height_ratio": round(width_height_ratio, 3),
        "relative_height_ratio": relative_height,
        "scale_factor": round(scale_factor, 4),
        "upscale_factor": round(upscale_factor, 2),
        "source_variant": source_variant,
        "estimated_physical_height_mm": None,  # Requires physical reference
        "physical_measurement_available": False,
    }


def enrich_regions_with_measurements(
    regions: List[Dict[str, Any]],
    scale_factor: float = 1.0,
    upscale_factor: float = 1.0,
    original_image_dims: Optional[Tuple[int, int]] = None,
) -> List[Dict[str, Any]]:
    """Add character measurement metrics to each OCR region.

    Args:
        regions: List of OCR detection regions (with bbox, text, confidence, etc.).
        scale_factor: Preprocessing resize factor.
        upscale_factor: Upscale variant factor.
        original_image_dims: Original image (width, height).

    Returns:
        Same regions list with added measurement fields.
    """
    for region in regions:
        source_variant = region.get("source_variant", "rgb")
        metrics = compute_char_metrics(
            bbox=region.get("bbox"),
            scale_factor=scale_factor,
            upscale_factor=upscale_factor,
            original_image_dims=original_image_dims,
            source_variant=source_variant,
        )
        region["char_metrics"] = metrics
        # Also set top-level convenience fields
        region["original_char_height_px"] = metrics["original_char_height_px"]
        region["original_char_width_px"] = metrics["original_char_width_px"]

    return regions


def enrich_fields_with_measurements(
    fields: Dict[str, Any],
    scale_factor: float = 1.0,
    upscale_factor: float = 1.0,
    original_image_dims: Optional[Tuple[int, int]] = None,
) -> Dict[str, Any]:
    """Add character measurement metrics to each extracted field.

    Args:
        fields: Structured Legal Metrology fields dict from field_parser.
        scale_factor: Preprocessing resize factor.
        upscale_factor: Upscale variant factor.
        original_image_dims: Original image (width, height).

    Returns:
        Same fields dict with added measurement data per field.
    """
    for field_name, field_data in fields.items():
        if not field_data or not isinstance(field_data, dict):
            continue
        if field_data.get("status") != "found":
            continue

        source_variant = field_data.get("source_variant", "rgb")
        metrics = compute_char_metrics(
            bbox=field_data.get("bbox"),
            scale_factor=scale_factor,
            upscale_factor=upscale_factor,
            original_image_dims=original_image_dims,
            source_variant=source_variant,
        )
        field_data["char_metrics"] = metrics
        field_data["original_char_height_px"] = metrics["original_char_height_px"]

    return fields
