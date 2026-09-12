"""Spatial geometry and visual evidence generator for OCR text detections.

Owner: Team M3 (Computer Vision)
Handles:
- Coordinate mapping and normalization
- Numeral and text bounding box height derivation (for Legal Metrology font height rules)
- Drawing focused, high-clarity visual evidence overlays with bounding boxes ONLY
  on matched Legal Metrology compliance fields (MRP, Net Qty, Dates, FSSAI, Entities).
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
from PIL import Image as PILImage, ImageDraw, ImageFont

logger = logging.getLogger("validra.ocr.geometry")

# Visual styling definitions for Legal Metrology compliance fields
COMPLIANCE_FIELD_STYLES = {
    "mrp": {
        "color": "#FFAB00",      # Vibrant Amber / Gold
        "bg_color": "#E65100",   # Deep Amber-Orange badge
        "title": "MRP",
    },
    "net_quantity": {
        "color": "#00E676",      # Vibrant Emerald Green
        "bg_color": "#004D40",   # Deep Teal-Green badge
        "title": "Net Qty",
    },
    "fssai": {
        "color": "#2979FF",      # Electric Royal Blue
        "bg_color": "#0D47A1",   # Deep Navy Blue badge
        "title": "FSSAI",
    },
    "manufacturing_date": {
        "color": "#D500F9",      # Vibrant Purple
        "bg_color": "#4A148C",   # Deep Violet badge
        "title": "Mfg Date",
    },
    "expiry_date": {
        "color": "#FF3D00",      # Vivid Coral / Orange-Red
        "bg_color": "#BF360C",   # Deep Rust badge
        "title": "Expiry / Best Before",
    },
    "manufacturer": {
        "color": "#00E5FF",      # Crisp Cyan
        "bg_color": "#006064",   # Deep Cyan-Navy badge
        "title": "Manufacturer",
    },
    "packer": {
        "color": "#1DE9B6",      # Mint Teal
        "bg_color": "#004D40",   # Deep Teal badge
        "title": "Packer",
    },
    "consumer_care": {
        "color": "#F50057",      # Hot Pink
        "bg_color": "#880E4F",   # Deep Maroon badge
        "title": "Consumer Care",
    },
    "country_of_origin": {
        "color": "#76FF03",      # Crisp Lime
        "bg_color": "#33691E",   # Deep Olive badge
        "title": "Origin",
    },
}


def compute_bbox_metrics(
    polygon: List[List[float]],
    image_width: int,
    image_height: int,
) -> Dict[str, Any]:
    """Calculate spatial metrics from a 4-point polygon.

    Args:
        polygon: List of 4 points [[x1, y1], [x2, y2], [x3, y3], [x4, y4]].
        image_width: Total image width in pixels.
        image_height: Total image height in pixels.

    Returns:
        Dict containing axis-aligned bbox, pixel dimensions, and normalized metrics.
    """
    xs = [float(p[0]) for p in polygon]
    ys = [float(p[1]) for p in polygon]

    x_min = max(0.0, min(xs))
    y_min = max(0.0, min(ys))
    x_max = min(float(image_width), max(xs))
    y_max = min(float(image_height), max(ys))

    width_px = max(1.0, x_max - x_min)
    height_px = max(1.0, y_max - y_min)

    # Normalized coordinates [0.0 - 1.0]
    norm_x_min = round(x_min / max(1, image_width), 4)
    norm_y_min = round(y_min / max(1, image_height), 4)
    norm_x_max = round(x_max / max(1, image_width), 4)
    norm_y_max = round(y_max / max(1, image_height), 4)

    # Relative height ratio to full package height (crucial for Principal Display Panel font rules)
    rel_height_ratio = round(height_px / max(1, image_height), 5)

    return {
        "polygon": [[round(x, 1), round(y, 1)] for x, y in polygon],
        "bbox": [int(x_min), int(y_min), int(x_max), int(y_max)],
        "bbox_width_px": int(width_px),
        "bbox_height_px": int(height_px),
        "aspect_ratio": round(width_px / height_px, 2),
        "normalized_bbox": [norm_x_min, norm_y_min, norm_x_max, norm_y_max],
        "relative_height_ratio": rel_height_ratio,
    }


def draw_compliance_field_bboxes(
    image_path: Union[str, Path],
    fields: Dict[str, Any],
    output_path: Union[str, Path],
) -> Path:
    """Draw bounding boxes ONLY on identified Legal Metrology compliance fields.

    This ensures the output visual evidence is uncluttered and directly highlights
    the compliance findings for inspectors and the Rule Engine.

    Args:
        image_path: Source preprocessed image path.
        fields: Structured dictionary of Legal Metrology fields.
        output_path: Target path for the clean evidence overlay.

    Returns:
        Path to the saved annotated evidence image.
    """
    src_path = Path(image_path)
    dst_path = Path(output_path)
    dst_path.parent.mkdir(parents=True, exist_ok=True)

    img = PILImage.open(src_path).convert("RGB")
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    fields_to_draw = [
        ("mrp", fields.get("mrp")),
        ("net_quantity", fields.get("net_quantity")),
        ("fssai", fields.get("fssai")),
        ("manufacturing_date", fields.get("manufacturing_date")),
        ("expiry_date", fields.get("expiry_date")),
        ("manufacturer", fields.get("manufacturer")),
        ("packer", fields.get("packer")),
        ("consumer_care", fields.get("consumer_care")),
        ("country_of_origin", fields.get("country_of_origin")),
    ]

    for field_key, field_data in fields_to_draw:
        if not field_data or not isinstance(field_data, dict):
            continue
        if field_data.get("status") != "found":
            continue

        bbox = field_data.get("bbox")
        if not bbox or len(bbox) < 4:
            continue

        x1, y1, x2, y2 = bbox
        style = COMPLIANCE_FIELD_STYLES.get(field_key, {
            "color": "#00E676",
            "bg_color": "#004D40",
            "title": field_key.upper(),
        })

        # Format descriptive badge label
        if field_key == "mrp":
            taxes_str = " (Incl. Taxes)" if field_data.get("inclusive_of_all_taxes") else ""
            label_text = f"MRP: ₹{field_data.get('value')}{taxes_str}"
        elif field_key == "net_quantity":
            label_text = f"Net Qty: {field_data.get('value')} {field_data.get('unit', '')}"
        elif field_key == "fssai":
            label_text = f"FSSAI: {field_data.get('license_number')}"
        elif field_key in ("manufacturing_date", "expiry_date"):
            prefix = "Mfg" if "mfg" in field_key else "Exp"
            if field_key == "expiry_date" and field_data.get("calculated_expiry_date"):
                label_text = f"Exp: {field_data['calculated_expiry_date']}"
            elif field_key == "expiry_date" and field_data.get("duration_value"):
                label_text = f"Exp: {field_data['duration_value']} {field_data.get('duration_unit', 'months')}"
            else:
                label_text = f"{prefix}: {field_data.get('raw_date', field_data.get('raw_text', ''))[:20]}"
        elif field_key in ("manufacturer", "packer"):
            prefix = "Mfg" if field_key == "manufacturer" else "Packer"
            raw_val = field_data.get('raw_text', '')
            label_text = f"{prefix}: {raw_val[:25]}"
        elif field_key == "consumer_care":
            phones = field_data.get("phones", [])
            emails = field_data.get("emails", [])
            contact_str = phones[0] if phones else (emails[0] if emails else "Contact Found")
            label_text = f"Care: {contact_str[:25]}"
        elif field_key == "country_of_origin":
            label_text = f"Origin: {field_data.get('country', '')}"
        else:
            label_text = style["title"]

        # 1. Draw outer boundary box (3px thickness)
        draw.rectangle([x1, y1, x2, y2], outline=style["color"], width=3)

        # 2. Smart badge placement (above by default, below if it collides with another field bbox or image top)
        badge_h = 18
        badge_w = min(img.width - x1, len(label_text) * 7 + 12)
        badge_y1 = y1 - badge_h - 2
        badge_y2 = y1 - 2

        collides = badge_y1 < 0
        if not collides:
            for other_k, other_d in fields_to_draw:
                if other_k == field_key or not other_d or other_d.get("status") != "found":
                    continue
                ob = other_d.get("bbox")
                if ob and len(ob) == 4:
                    if not (x1 + badge_w < ob[0] or x1 > ob[2] or badge_y2 < ob[1] or badge_y1 > ob[3]):
                        collides = True
                        break

        if collides:
            badge_y1 = y2 + 2
            badge_y2 = y2 + 2 + badge_h

        badge_x2 = min(img.width, x1 + badge_w)
        draw.rectangle([x1, badge_y1, badge_x2, badge_y2], fill=style["bg_color"])
        draw.text((x1 + 6, badge_y1 + 3), label_text, fill="#FFFFFF", font=font)

    img.save(dst_path, format="JPEG", quality=92, optimize=True)
    return dst_path


def draw_bounding_boxes(
    image_path: Union[str, Path],
    regions: List[Dict[str, Any]],
    output_path: Union[str, Path],
    box_color: str = "#00E676",
    text_bg_color: str = "#004D40",
) -> Path:
    """Legacy helper: Draw bounding boxes for raw regions if explicitly requested."""
    src_path = Path(image_path)
    dst_path = Path(output_path)
    dst_path.parent.mkdir(parents=True, exist_ok=True)

    img = PILImage.open(src_path).convert("RGB")
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    for r in regions:
        bbox = r.get("bbox")
        text = r.get("text", "")
        conf = r.get("confidence", 1.0)

        if not bbox or len(bbox) < 4:
            continue

        x1, y1, x2, y2 = bbox
        draw.rectangle([x1, y1, x2, y2], outline=box_color, width=2)

        label_text = f"{text[:20]} ({int(conf * 100)}%)" if text else f"{int(conf * 100)}%"
        badge_y1 = max(0, y1 - 16)
        badge_y2 = badge_y1 + 15
        badge_x2 = min(img.width, x1 + len(label_text) * 7 + 8)

        draw.rectangle([x1, badge_y1, badge_x2, badge_y2], fill=text_bg_color)
        draw.text((x1 + 4, badge_y1 + 2), label_text, fill="#FFFFFF", font=font)

    img.save(dst_path, format="JPEG", quality=90, optimize=True)
    return dst_path
