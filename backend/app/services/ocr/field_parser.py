"""High-quality field parser and Legal Metrology data structuring module.

Owner: Team M3 (Computer Vision)
Extracts and normalizes standardized Legal Metrology compliance declarations
(Rules 6 & 7) from recognized OCR regions:
- MRP (value, currency, taxes included flag)
- Net Quantity (value, metric unit, standardized SI value)
- Manufacturing / Packing / Expiry Dates
- FSSAI License Number (14 digits)
- Manufacturer / Packer / Importer / Marketer details
- Consumer Care contact (Toll-free, phone, email, address)
- Country of Origin
- Batch / Lot Number
- Unit Sale Price (USP)
- Dimensions (L×W×H)

Preserves complete provenance (source bbox, height, confidence).
Uses three-level confidence: OCR → Extraction → Variant Agreement.
Spatial proximity scoring for multi-line declaration grouping.
"""

import re
import calendar
from datetime import date, timedelta
import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("validra.ocr.parser")


# ---------------------------------------------------------------------------
# Spatial Proximity Scoring
# ---------------------------------------------------------------------------

def spatial_proximity_score(
    bbox_a: Optional[List[int]],
    bbox_b: Optional[List[int]],
    img_height: int = 1000,
) -> float:
    """Score how likely two text regions belong to the same declaration block.

    Uses vertical distance, horizontal alignment, and relative size.
    Returns 0.0 (unrelated) to 1.0 (definitely same declaration).

    Args:
        bbox_a: [x1, y1, x2, y2] of region A.
        bbox_b: [x1, y1, x2, y2] of region B.
        img_height: Total image height for normalization.
    """
    if not bbox_a or not bbox_b or len(bbox_a) < 4 or len(bbox_b) < 4:
        return 0.0

    h_a = max(10, bbox_a[3] - bbox_a[1])
    h_b = max(10, bbox_b[3] - bbox_b[1])
    avg_h = (h_a + h_b) / 2

    # Vertical distance (gap between bottom of A and top of B)
    vert_gap = bbox_b[1] - bbox_a[3]
    if vert_gap < -avg_h * 0.5:
        # B is above A (or heavily overlapping) — check if same line
        vert_gap = abs(bbox_b[1] - bbox_a[1])
        if vert_gap > avg_h * 1.5:
            return 0.0

    vert_score = max(0.0, 1.0 - (abs(vert_gap) / max(1, avg_h * 3.0)))

    # Horizontal alignment (how close left edges are)
    horiz_offset = abs(bbox_b[0] - bbox_a[0])
    horiz_score = max(0.0, 1.0 - (horiz_offset / max(1, avg_h * 5.0)))

    # Same-line check (horizontal adjacency)
    same_line = abs(bbox_b[1] - bbox_a[1]) < avg_h * 0.8
    if same_line:
        right_gap = bbox_b[0] - bbox_a[2]
        if 0 <= right_gap < avg_h * 5:
            return max(0.8, vert_score * 0.4 + 0.6)

    # Size similarity (similar text regions are more likely related)
    size_ratio = min(h_a, h_b) / max(h_a, h_b)
    size_score = size_ratio ** 0.5  # Gentle penalty for size mismatch

    return round(vert_score * 0.5 + horiz_score * 0.3 + size_score * 0.2, 3)


def merge_bboxes(bboxes: List[Optional[List[int]]]) -> Optional[List[int]]:
    """Combine multiple bounding boxes into a unified enclosing bounding box."""
    valid = [b for b in bboxes if b and len(b) == 4]
    if not valid:
        return None
    x1 = min(b[0] for b in valid)
    y1 = min(b[1] for b in valid)
    x2 = max(b[2] for b in valid)
    y2 = max(b[3] for b in valid)
    return [int(x1), int(y1), int(x2), int(y2)]


def _compute_extraction_confidence(
    pattern_matched: bool,
    spatial_score: float = 1.0,
    value_validated: bool = True,
) -> float:
    """Compute extraction-level confidence (distinct from OCR confidence).

    Combines pattern match quality, spatial proximity, and value validation.
    """
    base = 0.5 if pattern_matched else 0.0
    spatial_bonus = spatial_score * 0.3
    validation_bonus = 0.2 if value_validated else 0.0
    return round(min(1.0, base + spatial_bonus + validation_bonus), 3)


# ---------------------------------------------------------------------------
# Pre-compiled Regex Patterns for High Performance
# ---------------------------------------------------------------------------

# MRP patterns — expanded for Indian packaging variants
MRP_KEYWORD_RE = re.compile(
    r"\b(?:m\.?r\.?p\.?|max(?:imum)?\.?\s*retail\s*(?:sale)?\s*price|"
    r"retail\s*(?:sale)?\s*price|rs\.?|rsp|inr)\b|₹|रु\.?",
    re.IGNORECASE,
)
PRICE_VALUE_RE = re.compile(r"(?:₹|rs\.?|inr|रु\.?)?[\s:]*([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:\/\-)?", re.IGNORECASE)
TAXES_INCL_RE = re.compile(
    r"(?:incl(?:usive)?\.?\s*(?:of)?\s*(?:all)?\s*taxes|incl\.?\s*all\s*taxes|taxes\s*incl(?:uded)?|"
    r"all\s*taxes\s*incl)",
    re.IGNORECASE,
)

# Net quantity patterns — expanded with more variants
NET_QTY_EXCLUDE_RE = re.compile(
    r"(?:nutritional|per\s*100\s*(?:g|ml)|approximate|servings?|energy|protein|fat|sugar|carbohydrate|"
    r"calories|sodium|cholesterol|dietary|fibre|vitamin)",
    re.IGNORECASE,
)
NET_QTY_KEYWORD_RE = re.compile(
    r"(?:net\s*(?:wt|weight|qty|quantity|content|volume|vol)|nett\s*(?:wt|weight|qty)|"
    r"pkg\s*content|weight\s*:|qty\s*:|contents?\s*:)\b",
    re.IGNORECASE,
)
QTY_VALUE_RE = re.compile(
    r"\b([0-9]+(?:\.[0-9]+)?)\s*"
    r"(kg|kgs|kilograms?|g|gm|gms|grams?|"
    r"ml|mL|millilitres?|milliliters?|"
    r"l|ltr|ltrs|litres?|liters?|"
    r"pcs|pieces?|count|units?|u|N|nos?\.?|numbers?)\b",
    re.IGNORECASE,
)

# Date patterns — expanded with more Indian formats
DATE_MFG_KEYWORD_RE = re.compile(
    r"(?:mfg\s*(?:date|dt)?|mfd|pkd|packed\s*(?:on|date|dt)?|date\s*of\s*(?:mfg|mfr|packing|packaging|manufacture)|"
    r"pkg|manufacturing\s*date|packing\s*date)\b",
    re.IGNORECASE,
)
DATE_EXP_KEYWORD_RE = re.compile(
    r"(?:exp\s*(?:date|dt)?|expiry|use\s*by|best\s*before|bb|use\s*before|"
    r"exp(?:iry)?\s*date)\b",
    re.IGNORECASE,
)
DATE_PATTERN_RE = re.compile(
    r"\b("
    r"(?:0[1-9]|1[0-2]|[1-9])\s*[\/\-\.]\s*(?:20\d{2}|\d{2})|"  # MM/YYYY or MM/YY
    r"(?:0[1-9]|[12]\d|3[01])\s*[\/\-\.]\s*(?:0[1-9]|1[0-2])\s*[\/\-\.]\s*(?:20\d{2}|\d{2})|"  # DD/MM/YYYY
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\.\-\/]*(?:20\d{2}|\d{2})|"  # Mon YYYY
    r"(?:0[1-9]|[12]\d|3[01])\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(?:20\d{2}|\d{2})|"  # DD Mon YYYY
    r"20\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])"  # YYYYMMDD
    r")\b",
    re.IGNORECASE,
)

WORD_TO_NUM = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "eighteen": 18, "twenty": 20,
    "twenty-four": 24, "twenty four": 24, "thirty-six": 36, "thirty six": 36,
}

MONTH_NAME_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

BEST_BEFORE_DURATION_RE = re.compile(
    r"(?:best\s*before|use\s*(?:by|within)|consume\s*within|shelf\s*life\s*(?:is|of)?)\s*:?\s*"
    r"(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|eighteen|twenty[\s\-]four|thirty[\s\-]six)\s*"
    r"(months?|mths?|years?|yrs?|days?|weeks?)"
    r"(?:\s*from\s*(?:the\s*)?(?:date\s*of\s*)?(?:pack\w*|mfg\w*|mfd\w*|pkd\w*|pkg\w*|manufacture\w*)|of\s*pack\w*)?",
    re.IGNORECASE,
)

# Reserved words that must never be classified as a batch/lot number
BATCH_RESERVED_WORDS = {
    "manufactured", "manufacture", "manufacturer", "mfd", "mfg",
    "packer", "packed", "marketer", "importer", "wafers", "private",
    "limited", "pvt", "ltd", "company", "ingredients", "nutritional",
    "energy", "carbohydrates", "weight", "net", "qty", "quantity",
    "mrp", "price", "taxes", "license", "fssai", "feedback", "consumer",
    "complaints", "queries", "category", "best", "before", "pkd",
    "regd", "office", "website", "email", "phone",
}

# FSSAI patterns
FSSAI_KEYWORD_RE = re.compile(r"(?:fssai|lic\.?\s*(?:no|num|number)?|ense\s*no|license\s*no)\b", re.IGNORECASE)
FSSAI_NUMBER_RE = re.compile(r"\b([12]\d{13})\b")

# Consumer care patterns — expanded
PHONE_RE = re.compile(r"(?:\+91[\s\-]?)?(?:1800[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,4}|[6-9]\d{6,9}|0\d{2,4}[\s\-]?\d{6,8})\b")
EMAIL_RE = re.compile(r"\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b")
WEBSITE_RE = re.compile(r"(?<!@)\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9\-]+\.(?:com|in|co\.in|org|net|gov|io))\b", re.IGNORECASE)
CONSUMER_CARE_KEYWORD_RE = re.compile(
    r"(?:consumer\s*(?:care|helpline|cell)|customer\s*(?:care|support|service)|"
    r"feedback|complaints?|toll\s*free|care\s*manager|contact\s*us|call\s*us|helpline)\b",
    re.IGNORECASE,
)

# Entity patterns — expanded with more Indian variants
MFG_NAME_KEYWORD_RE = re.compile(
    r"(?:mfg\s*by|manufactured\s*by|mfd\s*by|produced\s*by|made\s*by|mfg\.?\s*:)\b",
    re.IGNORECASE,
)
PACKER_KEYWORD_RE = re.compile(
    r"(?:packed\s*(?:by|at)|pkd\s*by|packed\s*&?\s*marketed\s*by|packaging\s*unit|"
    r"packing\s*unit|pkg\s*by)\b",
    re.IGNORECASE,
)
MARKETER_KEYWORD_RE = re.compile(
    r"(?:marketed\s*by|mktd\s*by|brand\s*owner|distributed\s*by)\b",
    re.IGNORECASE,
)
IMPORTER_KEYWORD_RE = re.compile(
    r"(?:imported\s*by|imp\s*by|imported\s*&?\s*marketed\s*by|importer)\b",
    re.IGNORECASE,
)
ORIGIN_KEYWORD_RE = re.compile(
    r"(?:country\s*of\s*origin|made\s*in|product\s*of)\s*:?\s*([a-zA-Z\s]+)",
    re.IGNORECASE,
)

# Batch / Lot patterns
BATCH_KEYWORD_RE = re.compile(
    r"(?:batch\s*(?:no\.?|number|code)?|lot\s*(?:no\.?|number|code)?|"
    r"code\s*(?:no\.?|number)?|b\.?\s*no\.?|l\.?\s*no\.?)\s*:?\s*",
    re.IGNORECASE,
)
BATCH_VALUE_RE = re.compile(r"([A-Z0-9][A-Z0-9\-\.\/]{2,20})\b", re.IGNORECASE)

# Unit Sale Price patterns
USP_KEYWORD_RE = re.compile(
    r"(?:usp|unit\s*(?:sale\s*)?price|price\s*per\s*(?:unit|kg|g|l|ml|100\s*(?:g|ml)))\s*:?\s*",
    re.IGNORECASE,
)
USP_VALUE_RE = re.compile(
    r"(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:\/|\s*per\s*)\s*"
    r"(kg|100\s*g|g|l|ltr|100\s*ml|ml|unit|pc|number)\b",
    re.IGNORECASE,
)

# Dimensions patterns
DIMENSION_KEYWORD_RE = re.compile(
    r"(?:dimensions?|size|measurements?)\s*:?\s*",
    re.IGNORECASE,
)
DIMENSION_VALUE_RE = re.compile(
    r"([0-9]+(?:\.[0-9]+)?)\s*[x×X]\s*([0-9]+(?:\.[0-9]+)?)"
    r"(?:\s*[x×X]\s*([0-9]+(?:\.[0-9]+)?))?\s*(cm|mm|m|inch|in)\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Field Extraction Functions
# ---------------------------------------------------------------------------

def _find_nearby_regions(
    anchor: Dict[str, Any],
    anchor_idx: int,
    regions: List[Dict[str, Any]],
    max_regions: int = 3,
    img_height: int = 1000,
    min_score: float = 0.3,
    exclude_patterns: Optional[re.Pattern] = None,
) -> Tuple[List[Dict[str, Any]], str]:
    """Find nearby regions that likely belong to the same declaration.

    Returns (matched_regions, concatenated_text).
    """
    matched_regions = [anchor]
    search_window = anchor.get("text", "")
    anchor_bbox = anchor.get("bbox")

    for oi, other_r in enumerate(regions):
        if oi == anchor_idx or len(matched_regions) > max_regions:
            break
        other_bbox = other_r.get("bbox")
        score = spatial_proximity_score(anchor_bbox, other_bbox, img_height)
        if score < min_score:
            continue

        otext = other_r.get("text", "")
        if exclude_patterns and exclude_patterns.search(otext):
            continue

        matched_regions.append(other_r)
        search_window += " " + otext

    return matched_regions, search_window


def parse_mrp(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect and parse Maximum Retail Price declaration across multi-line packaging labels."""
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        if not MRP_KEYWORD_RE.search(text):
            continue

        bx = r.get("bbox")
        if not bx or len(bx) < 4:
            continue
        h = max(10, bx[3] - bx[1])

        matched_regions = [r]
        search_window = text

        # Search for price and taxes declaration using spatial proximity
        for oi, other_r in enumerate(regions):
            if oi == idx:
                continue
            obx = other_r.get("bbox")
            if not obx or len(obx) < 4:
                continue

            is_same_line_right = (
                abs(obx[1] - bx[1]) < h * 1.0
                and obx[0] >= bx[0]
                and obx[0] <= bx[2] + 250
            )
            is_directly_below = (
                0 <= (obx[1] - bx[3]) < h * 2.0
                and abs(obx[0] - bx[0]) < 70
            )

            if is_same_line_right or is_directly_below:
                otext = other_r.get("text", "")
                if not re.search(r"\b(?:net|wt|weight|b\.?no|pkd|mfg|[0-9]+\s*(?:g|gm|kg|ml|l))\b", otext, re.IGNORECASE):
                    matched_regions.append(other_r)
                    search_window += " " + otext

        # Clean search string (ignore parenthesized percentages)
        clean_search = re.sub(r"\([^\)]*%\)", "", search_window)

        # Find price value
        matches = list(PRICE_VALUE_RE.finditer(clean_search))
        for m in matches:
            raw_val = m.group(1).replace(",", ".")
            try:
                val_float = float(raw_val)
                end_pos = m.end()
                trailing = clean_search[end_pos:end_pos + 6].strip().lower()
                if any(trailing.startswith(u) for u in ["g", "gm", "kg", "ml", "l", "ltr", "%"]):
                    continue

                if 0.5 <= val_float <= 100000.0:
                    taxes_incl = bool(TAXES_INCL_RE.search(search_window))
                    unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
                    height_px = (unified_bbox[3] - unified_bbox[1]) if unified_bbox else r.get("bbox_height_px")
                    ext_conf = _compute_extraction_confidence(True, 0.9, True)

                    return {
                        "status": "found",
                        "value": val_float,
                        "currency": "INR",
                        "inclusive_of_all_taxes": taxes_incl,
                        "raw_text": search_window.strip(),
                        "confidence": r.get("confidence", 0.0),
                        "extraction_confidence": ext_conf,
                        "variant_agreement": r.get("variant_agreement", 1.0),
                        "bbox": unified_bbox or r.get("bbox"),
                        "bbox_height_px": height_px,
                        "relative_height_ratio": r.get("relative_height_ratio"),
                        "source_variant": r.get("source_variant"),
                    }
            except (ValueError, IndexError):
                continue
    return None


def parse_net_quantity(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect and parse Net Quantity declaration, filtering out nutritional tables."""
    unit_multipliers = {
        "g": (1.0, "g", 0.001, "kg"), "gm": (1.0, "g", 0.001, "kg"),
        "gms": (1.0, "g", 0.001, "kg"), "gram": (1.0, "g", 0.001, "kg"),
        "grams": (1.0, "g", 0.001, "kg"),
        "kg": (1000.0, "g", 1.0, "kg"), "kgs": (1000.0, "g", 1.0, "kg"),
        "kilogram": (1000.0, "g", 1.0, "kg"), "kilograms": (1000.0, "g", 1.0, "kg"),
        "ml": (1.0, "ml", 0.001, "l"), "millilitres": (1.0, "ml", 0.001, "l"),
        "milliliters": (1.0, "ml", 0.001, "l"),
        "l": (1000.0, "ml", 1.0, "l"), "ltr": (1000.0, "ml", 1.0, "l"),
        "ltrs": (1000.0, "ml", 1.0, "l"), "litres": (1000.0, "ml", 1.0, "l"),
        "liters": (1000.0, "ml", 1.0, "l"),
        "pcs": (1.0, "units", 1.0, "units"), "pieces": (1.0, "units", 1.0, "units"),
        "units": (1.0, "units", 1.0, "units"), "u": (1.0, "units", 1.0, "units"),
        "n": (1.0, "units", 1.0, "units"), "nos": (1.0, "units", 1.0, "units"),
        "no": (1.0, "units", 1.0, "units"), "numbers": (1.0, "units", 1.0, "units"),
        "count": (1.0, "units", 1.0, "units"),
    }

    def _build_result(num_val, raw_unit, matched_regions, anchor_r, search_window):
        conv = unit_multipliers.get(raw_unit, (1.0, raw_unit, 1.0, raw_unit))
        unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
        height_px = (unified_bbox[3] - unified_bbox[1]) if unified_bbox else anchor_r.get("bbox_height_px")
        ext_conf = _compute_extraction_confidence(True, 0.85, True)
        # Determine measurement type from unit
        if raw_unit in ("g", "gm", "gms", "gram", "grams", "kg", "kgs", "kilogram", "kilograms"):
            measurement_type = "mass"
        elif raw_unit in ("ml", "l", "ltr", "ltrs", "litres", "liters", "millilitres", "milliliters"):
            measurement_type = "volume"
        else:
            measurement_type = "count"

        return {
            "status": "found",
            "value": num_val,
            "unit": raw_unit,
            "measurement_type": measurement_type,
            "standardized_value": round(num_val * conv[2], 4),
            "standardized_unit": conv[3],
            "raw_text": search_window.strip(),
            "confidence": anchor_r.get("confidence", 0.0),
            "extraction_confidence": ext_conf,
            "variant_agreement": anchor_r.get("variant_agreement", 1.0),
            "bbox": unified_bbox or anchor_r.get("bbox"),
            "bbox_height_px": height_px,
            "relative_height_ratio": anchor_r.get("relative_height_ratio"),
            "source_variant": anchor_r.get("source_variant"),
        }

    # Pass 1: Explicit Net Weight/Qty keyword
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        if NET_QTY_EXCLUDE_RE.search(text):
            continue
        if NET_QTY_KEYWORD_RE.search(text):
            matched_regions = [r]
            search_window = text
            for offset in range(1, 4):
                if idx + offset < len(regions):
                    next_r = regions[idx + offset]
                    next_t = next_r.get("text", "")
                    if NET_QTY_EXCLUDE_RE.search(next_t):
                        continue
                    search_window += " " + next_t
                    matched_regions.append(next_r)
                    if QTY_VALUE_RE.search(search_window):
                        break

            match = QTY_VALUE_RE.search(search_window)
            if match:
                try:
                    return _build_result(
                        float(match.group(1)),
                        match.group(2).lower(),
                        matched_regions, r, search_window
                    )
                except (ValueError, IndexError):
                    continue

    # Pass 2: Fallback standalone metric pattern
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        if NET_QTY_EXCLUDE_RE.search(text):
            continue
        match = QTY_VALUE_RE.search(text)
        if match:
            try:
                return _build_result(
                    float(match.group(1)),
                    match.group(2).lower(),
                    [r], r, text
                )
            except (ValueError, IndexError):
                continue
    return None


def parse_date_string(date_str: str) -> Tuple[Any, Optional[str]]:
    """Parse date string into (parsed_date, format_type).
    Returns (date_obj, 'full') or ((year, month), 'month_year') or (None, None).
    """
    clean = re.sub(r"[^\w\/\-\.]", " ", date_str).strip()

    # YYYYMMDD format
    m = re.search(r"\b(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\b", clean)
    if m:
        y, mth, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        try:
            return date(y, mth, d), "full"
        except ValueError:
            pass

    # DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    m = re.search(r"\b([0-3]?[0-9])[\/\-\.]([0-1]?[0-9])[\/\-\.](20\d{2}|\d{2})\b", clean)
    if m:
        d, mth, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if y < 100:
            y += 2000
        if 1 <= mth <= 12 and 1 <= d <= 31:
            try:
                return date(y, mth, d), "full"
            except ValueError:
                pass

    # MM/YYYY or MM/YY or MM-YYYY
    m = re.search(r"\b([0-1]?[0-9])[\/\-\.](20\d{2}|\d{2})\b", clean)
    if m:
        mth, y = int(m.group(1)), int(m.group(2))
        if y < 100:
            y += 2000
        if 1 <= mth <= 12:
            return (y, mth), "month_year"

    # DD Mon YYYY or Mon YYYY
    m = re.search(
        r"\b(?:([0-3]?[0-9])\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(20\d{2}|\d{2})\b",
        clean, re.IGNORECASE,
    )
    if m:
        d_str, mon_str, y_str = m.group(1), m.group(2).lower()[:3], m.group(3)
        y = int(y_str)
        if y < 100:
            y += 2000
        mth = MONTH_NAME_MAP.get(mon_str, 1)
        if d_str:
            d = int(d_str)
            try:
                return date(y, mth, d), "full"
            except ValueError:
                pass
        return (y, mth), "month_year"

    return None, None


def calculate_expiry_date(mfg_date_str: str, duration_val: int, duration_unit: str) -> Optional[str]:
    """Calculate expiry date given an mfg/packaging date string and shelf life duration."""
    parsed, fmt_type = parse_date_string(mfg_date_str)
    if not parsed:
        return None

    unit = duration_unit.lower()
    if fmt_type == "full":
        base_date: date = parsed
        if "year" in unit:
            new_y = base_date.year + duration_val
            max_d = calendar.monthrange(new_y, base_date.month)[1]
            exp = base_date.replace(year=new_y, day=min(base_date.day, max_d))
        elif "month" in unit:
            total_m = base_date.month - 1 + duration_val
            new_y = base_date.year + (total_m // 12)
            new_m = (total_m % 12) + 1
            max_d = calendar.monthrange(new_y, new_m)[1]
            exp = base_date.replace(year=new_y, month=new_m, day=min(base_date.day, max_d))
        elif "week" in unit:
            exp = base_date + timedelta(weeks=duration_val)
        elif "day" in unit:
            exp = base_date + timedelta(days=duration_val)
        else:
            return None
        return exp.strftime("%d/%m/%Y")

    elif fmt_type == "month_year":
        y, mth = parsed
        if "year" in unit:
            new_y = y + duration_val
            new_m = mth
        elif "month" in unit:
            total_m = mth - 1 + duration_val
            new_y = y + (total_m // 12)
            new_m = (total_m % 12) + 1
        else:
            return None
        return f"{new_m:02d}/{new_y}"

    return None


def parse_dates(regions: List[Dict[str, Any]]) -> Dict[str, Optional[Dict[str, Any]]]:
    """Detect and parse manufacturing, packing, and expiry dates."""
    mfg_result = None
    exp_result = None
    mfg_keyword_found = None

    # Pass 1: Mfg / Pkd date
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        if DATE_MFG_KEYWORD_RE.search(text) and not mfg_result:
            matched_regions = [r]
            search_window = text
            for offset in range(1, 4):
                if idx + offset < len(regions):
                    next_r = regions[idx + offset]
                    search_window += " " + next_r.get("text", "")
                    matched_regions.append(next_r)
            d_match = DATE_PATTERN_RE.search(search_window)
            if d_match:
                unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
                mfg_result = {
                    "status": "found",
                    "raw_date": d_match.group(1).strip(),
                    "raw_text": search_window.strip(),
                    "confidence": r.get("confidence", 0.0),
                    "extraction_confidence": _compute_extraction_confidence(True, 0.8, True),
                    "variant_agreement": r.get("variant_agreement", 1.0),
                    "bbox": unified_bbox or r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                    "source_variant": r.get("source_variant"),
                }
                break
            elif not mfg_keyword_found:
                mfg_keyword_found = {
                    "status": "needs_review",
                    "keyword_present": True,
                    "raw_date": None,
                    "raw_text": search_window.strip()[:100],
                    "note": "Packaging/Mfg date indicator detected; stamped date requires inspector review.",
                    "confidence": r.get("confidence", 0.0),
                    "extraction_confidence": 0.6,
                    "variant_agreement": r.get("variant_agreement", 1.0),
                    "bbox": r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                    "source_variant": r.get("source_variant"),
                }

    if not mfg_result and mfg_keyword_found:
        mfg_result = mfg_keyword_found

    # Pass 2: Expiry / Best Before
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        if exp_result:
            break

        matched_regions = [r]
        search_window = text
        for offset in range(1, 4):
            if idx + offset < len(regions):
                next_r = regions[idx + offset]
                search_window += " " + next_r.get("text", "")
                matched_regions.append(next_r)

        bb_match = BEST_BEFORE_DURATION_RE.search(search_window)
        if bb_match:
            raw_num = bb_match.group(1).lower()
            val = WORD_TO_NUM.get(raw_num, int(raw_num) if raw_num.isdigit() else None)
            raw_unit = bb_match.group(2).lower()
            if "year" in raw_unit or "yr" in raw_unit:
                std_unit = "years"
            elif "day" in raw_unit:
                std_unit = "days"
            elif "week" in raw_unit or "wk" in raw_unit:
                std_unit = "weeks"
            else:
                std_unit = "months"

            if val:
                unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
                exp_result = {
                    "status": "found",
                    "type": "relative_best_before",
                    "duration_value": val,
                    "duration_unit": std_unit,
                    "raw_date": f"{val} {std_unit} from packaging",
                    "raw_text": search_window.strip(),
                    "confidence": r.get("confidence", 0.0),
                    "extraction_confidence": _compute_extraction_confidence(True, 0.85, True),
                    "variant_agreement": r.get("variant_agreement", 1.0),
                    "bbox": unified_bbox or r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                    "calculated_expiry_date": None,
                    "is_calculated": False,
                    "source_variant": r.get("source_variant"),
                }
                break

        if DATE_EXP_KEYWORD_RE.search(text):
            d_match = DATE_PATTERN_RE.search(search_window)
            if d_match:
                unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
                exp_result = {
                    "status": "found",
                    "type": "absolute",
                    "raw_date": d_match.group(1).strip(),
                    "raw_text": search_window.strip(),
                    "confidence": r.get("confidence", 0.0),
                    "extraction_confidence": _compute_extraction_confidence(True, 0.85, True),
                    "variant_agreement": r.get("variant_agreement", 1.0),
                    "bbox": unified_bbox or r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                    "calculated_expiry_date": d_match.group(1).strip(),
                    "is_calculated": False,
                    "source_variant": r.get("source_variant"),
                }
                break

    # Auto-calculate expiry if relative + mfg date available
    if exp_result and exp_result.get("type") == "relative_best_before" and mfg_result and mfg_result.get("raw_date"):
        calc = calculate_expiry_date(
            mfg_date_str=mfg_result["raw_date"],
            duration_val=exp_result["duration_value"],
            duration_unit=exp_result["duration_unit"],
        )
        if calc:
            exp_result["calculated_expiry_date"] = calc
            exp_result["is_calculated"] = True
            exp_result["calculation_basis"] = (
                f"Calculated from packaging date ({mfg_result['raw_date']}) + "
                f"{exp_result['duration_value']} {exp_result['duration_unit']}"
            )

    return {"mfg_date": mfg_result, "expiry_date": exp_result}


def parse_fssai(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect 14-digit FSSAI license numbers and validate format."""
    licenses_found: List[str] = []
    matched_regions: List[Dict[str, Any]] = []

    for idx, r in enumerate(regions):
        text = r.get("text", "")
        fssai_matches = FSSAI_NUMBER_RE.findall(text)
        has_keyword = bool(FSSAI_KEYWORD_RE.search(text))

        if not fssai_matches and has_keyword and idx + 1 < len(regions):
            next_r = regions[idx + 1]
            next_text = next_r.get("text", "")
            next_matches = FSSAI_NUMBER_RE.findall(next_text)
            if next_matches:
                for lic in next_matches:
                    if lic not in licenses_found:
                        licenses_found.append(lic)
                        matched_regions.extend([r, next_r])

        for lic in fssai_matches:
            if lic not in licenses_found:
                licenses_found.append(lic)
                matched_regions.append(r)

    if licenses_found:
        primary = licenses_found[0]
        unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
        anchor = matched_regions[0]
        raw_text_summary = " ".join([mr.get("text", "") for mr in matched_regions])[:200]
        return {
            "status": "found",
            "license_number": primary,
            "license_numbers": licenses_found,
            "total_licenses_found": len(licenses_found),
            "is_valid_14_digits": len(primary) == 14,
            "raw_text": raw_text_summary,
            "confidence": anchor.get("confidence", 0.0),
            "extraction_confidence": _compute_extraction_confidence(True, 0.95, True),
            "variant_agreement": anchor.get("variant_agreement", 1.0),
            "bbox": unified_bbox or anchor.get("bbox"),
            "bbox_height_px": anchor.get("bbox_height_px"),
            "source_variant": anchor.get("source_variant"),
        }
    return None


def parse_consumer_care(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect customer care helpline, toll-free number, email, website (Rule 6(2))."""
    all_text = " ".join(r.get("text", "") for r in regions)
    fssai_numbers = set(FSSAI_NUMBER_RE.findall(all_text))

    phones: List[str] = []
    emails: List[str] = []
    websites: List[str] = []
    matched_regions: List[Dict[str, Any]] = []

    for idx, r in enumerate(regions):
        text = r.get("text", "")
        has_kw = bool(CONSUMER_CARE_KEYWORD_RE.search(text))

        p_matches = PHONE_RE.findall(text)
        valid_phones = []
        for p in p_matches:
            digits = re.sub(r"[^0-9]", "", p)
            if len(digits) not in (10, 11, 12):
                continue
            if any(digits in f or f in digits for f in fssai_numbers):
                continue
            valid_phones.append(p.replace(" ", "").replace("-", ""))

        e_matches = EMAIL_RE.findall(text)
        w_matches = WEBSITE_RE.findall(text)

        if has_kw or valid_phones or e_matches or w_matches:
            matched_regions.append(r)
            phones.extend(valid_phones)
            emails.extend(e_matches)
            websites.extend(w_matches)

            if has_kw and r.get("bbox"):
                bx = r["bbox"]
                h = max(10, bx[3] - bx[1])
                for other_r in regions:
                    if other_r is r:
                        continue
                    obx = other_r.get("bbox")
                    if not obx:
                        continue
                    vert_dist = obx[1] - bx[3]
                    # Search within generous vertical window for contact details
                    if -h * 0.6 <= vert_dist < h * 7.0 and abs(obx[0] - bx[0]) < 180:
                        otext = other_r.get("text", "")
                        for p in PHONE_RE.findall(otext):
                            d = re.sub(r"[^0-9]", "", p)
                            if len(d) in (10, 11, 12) and not any(d in f for f in fssai_numbers):
                                phones.append(p.replace(" ", "").replace("-", ""))
                                matched_regions.append(other_r)
                        for e in EMAIL_RE.findall(otext):
                            emails.append(e)
                            matched_regions.append(other_r)
                        for w in WEBSITE_RE.findall(otext):
                            websites.append(w)
                            matched_regions.append(other_r)

    if matched_regions:
        unique_phones = list(dict.fromkeys(phones))
        unique_emails = list(dict.fromkeys(emails))
        unique_websites = list(dict.fromkeys(websites))
        unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
        raw_text_summary = " ".join([mr.get("text", "") for mr in matched_regions])[:250]

        return {
            "status": "found",
            "phones": unique_phones,
            "emails": unique_emails,
            "websites": unique_websites,
            "has_toll_free": any("1800" in p for p in unique_phones),
            "raw_text": raw_text_summary,
            "confidence": matched_regions[0].get("confidence", 0.0),
            "extraction_confidence": _compute_extraction_confidence(True, 0.8, bool(unique_phones or unique_emails)),
            "variant_agreement": matched_regions[0].get("variant_agreement", 1.0),
            "bbox": unified_bbox,
            "source_variant": matched_regions[0].get("source_variant"),
        }
    return None


def parse_manufacturer(regions: List[Dict[str, Any]]) -> Dict[str, Optional[Dict[str, Any]]]:
    """Detect Manufacturer, Packer, Marketer, or Importer entity declarations."""
    entities: Dict[str, Optional[Dict[str, Any]]] = {
        "manufacturer": None,
        "packer": None,
        "marketer": None,
        "importer": None,
    }

    def _extract_entity_block(keyword_region: Dict[str, Any], start_idx: int) -> Dict[str, Any]:
        bx = keyword_region.get("bbox")
        h = max(10, bx[3] - bx[1]) if bx else 15
        block_regions = [keyword_region]

        if bx:
            # Sort other regions below or adjacent to keyword
            sorted_candidates = sorted(
                [or_ for or_ in regions if or_ is not keyword_region and or_.get("bbox")],
                key=lambda o: (o["bbox"][1], o["bbox"][0])
            )
            for other_r in sorted_candidates:
                obx = other_r.get("bbox")
                if not obx:
                    continue
                vert_dist = obx[1] - bx[3]
                # Allow slight overlap (skewed packaging) and up to 3.5 line heights below
                is_vertically_aligned = -h * 0.6 <= vert_dist < h * 3.5
                horiz_dist = abs(obx[0] - bx[0])
                horiz_overlap = not (obx[2] < bx[0] or obx[0] > bx[2])
                is_col_below = is_vertically_aligned and (horiz_dist < 120 or horiz_overlap)

                if is_col_below:
                    otext = other_r.get("text", "")
                    if FSSAI_KEYWORD_RE.search(otext) or FSSAI_NUMBER_RE.search(otext) or re.search(r"\b(?:b\.?no|pkd|mfg\s*dt|net\s*wt|mrp)\b", otext, re.IGNORECASE):
                        break
                    block_regions.append(other_r)
                    if len(block_regions) >= 4:
                        break

        snippet = " ".join([sr.get("text", "") for sr in block_regions]).strip()
        unified_bbox = merge_bboxes([sr.get("bbox") for sr in block_regions])
        return {
            "status": "found",
            "raw_text": snippet[:200],
            "confidence": keyword_region.get("confidence", 0.0),
            "extraction_confidence": _compute_extraction_confidence(True, 0.85, True),
            "variant_agreement": keyword_region.get("variant_agreement", 1.0),
            "bbox": unified_bbox or keyword_region.get("bbox"),
            "bbox_height_px": keyword_region.get("bbox_height_px"),
            "source_variant": keyword_region.get("source_variant"),
        }

    for idx, r in enumerate(regions):
        text = r.get("text", "")
        if MFG_NAME_KEYWORD_RE.search(text) and not entities["manufacturer"]:
            entities["manufacturer"] = _extract_entity_block(r, idx)
        elif PACKER_KEYWORD_RE.search(text) and not entities["packer"]:
            entities["packer"] = _extract_entity_block(r, idx)
        elif MARKETER_KEYWORD_RE.search(text) and not entities["marketer"]:
            entities["marketer"] = _extract_entity_block(r, idx)
        elif IMPORTER_KEYWORD_RE.search(text) and not entities["importer"]:
            entities["importer"] = _extract_entity_block(r, idx)

    return entities


def parse_origin(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect Country of Origin declaration."""
    for r in regions:
        text = r.get("text", "")
        match = ORIGIN_KEYWORD_RE.search(text)
        if match:
            country = match.group(1).strip()
            return {
                "status": "found",
                "country": country,
                "raw_text": text.strip(),
                "confidence": r.get("confidence", 0.0),
                "extraction_confidence": _compute_extraction_confidence(True, 0.9, True),
                "variant_agreement": r.get("variant_agreement", 1.0),
                "bbox": r.get("bbox"),
                "source_variant": r.get("source_variant"),
            }

    # Check for Indian domestic origin indicators in address/packaging lines
    for r in regions:
        text = r.get("text", "")
        if (
            re.search(r"(?:Gujarat|Maharashtra|Delhi|Tamil\s*Nadu|Karnataka|Punjab|Haryana|Rajasthan|Uttar\s*Pradesh|Madhya\s*Pradesh|Kerala|West\s*Bengal|Telangana|Andhra\s*Pradesh)[\s\-\,]+INDIA\b", text, re.I)
            or re.search(r"\b(?:Made\s*in|Product\s*of)\s*India\b", text, re.I)
            or re.search(r"-\s*INDIA\b", text, re.I)
        ):
            return {
                "status": "found",
                "country": "India",
                "raw_text": text.strip(),
                "confidence": r.get("confidence", 0.0),
                "extraction_confidence": _compute_extraction_confidence(True, 0.85, True),
                "variant_agreement": r.get("variant_agreement", 1.0),
                "bbox": r.get("bbox"),
                "source_variant": r.get("source_variant"),
            }
    return None


def parse_batch_lot(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect Batch/Lot/Code number declaration."""
    fallback_needs_review = None

    for idx, r in enumerate(regions):
        text = r.get("text", "")
        # Filter out informational / reference sentences (e.g. "see first two characters of batch no")
        if re.search(r"\b(?:see|refer|check|first\s*two|characters\s*of)\b", text, re.I):
            continue

        kw_match = BATCH_KEYWORD_RE.search(text)
        if not kw_match:
            continue

        if not fallback_needs_review:
            fallback_needs_review = {
                "status": "needs_review",
                "keyword_present": True,
                "value": None,
                "raw_text": text.strip(),
                "note": "Batch/Lot indicator present; stamped lot code requires manual inspector verification.",
                "confidence": r.get("confidence", 0.0),
                "extraction_confidence": 0.55,
                "variant_agreement": r.get("variant_agreement", 1.0),
                "bbox": r.get("bbox"),
                "source_variant": r.get("source_variant"),
            }

        # Look for alphanumeric value in same region or next
        search_window = text[kw_match.end():]
        matched_regions = [r]

        if not BATCH_VALUE_RE.search(search_window) and idx + 1 < len(regions):
            next_r = regions[idx + 1]
            next_text = next_r.get("text", "")
            # Do not swallow the next region if it belongs to another declaration
            is_other_declaration = bool(
                MFG_NAME_KEYWORD_RE.search(next_text)
                or DATE_MFG_KEYWORD_RE.search(next_text)
                or DATE_EXP_KEYWORD_RE.search(next_text)
                or MRP_KEYWORD_RE.search(next_text)
                or NET_QTY_KEYWORD_RE.search(next_text)
                or FSSAI_KEYWORD_RE.search(next_text)
                or CONSUMER_CARE_KEYWORD_RE.search(next_text)
            )
            if not is_other_declaration:
                search_window += " " + next_text
                matched_regions.append(next_r)

        matches = list(BATCH_VALUE_RE.finditer(search_window))
        for m in matches:
            batch_val = m.group(1).strip()
            clean_batch = re.sub(r"[^a-zA-Z0-9]", "", batch_val).lower()
            # Filter out reserved words and website domains
            if any(clean_batch.startswith(rw) for rw in BATCH_RESERVED_WORDS):
                continue
            if any(clean_batch.endswith(ext) or ext in clean_batch for ext in ("com", "org", "net", "gov", "co")):
                continue
            # Filter out pure numbers that could be dates/prices or too short
            if len(batch_val) < 3 or batch_val.replace(".", "").isdigit():
                continue

            unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
            return {
                "status": "found",
                "value": batch_val,
                "raw_text": (text + " " + search_window).strip()[:150],
                "confidence": r.get("confidence", 0.0),
                "extraction_confidence": _compute_extraction_confidence(True, 0.85, True),
                "variant_agreement": r.get("variant_agreement", 1.0),
                "bbox": unified_bbox or r.get("bbox"),
                "source_variant": r.get("source_variant"),
            }

    return fallback_needs_review


def parse_unit_sale_price(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect Unit Sale Price (USP) declaration."""
    for idx, r in enumerate(regions):
        text = r.get("text", "")

        # Check for explicit USP keyword
        if USP_KEYWORD_RE.search(text):
            search_window = text
            matched_regions = [r]
            if idx + 1 < len(regions):
                search_window += " " + regions[idx + 1].get("text", "")
                matched_regions.append(regions[idx + 1])

            val_match = USP_VALUE_RE.search(search_window)
            if val_match:
                unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
                return {
                    "status": "found",
                    "value": float(val_match.group(1)),
                    "per_unit": val_match.group(2).strip().lower(),
                    "currency": "INR",
                    "raw_text": search_window.strip()[:150],
                    "confidence": r.get("confidence", 0.0),
                    "extraction_confidence": _compute_extraction_confidence(True, 0.85, True),
                    "variant_agreement": r.get("variant_agreement", 1.0),
                    "bbox": unified_bbox or r.get("bbox"),
                    "source_variant": r.get("source_variant"),
                }

        # Also check for standalone ₹/kg patterns
        val_match = USP_VALUE_RE.search(text)
        if val_match:
            # Ensure this isn't the MRP field
            if not MRP_KEYWORD_RE.search(text):
                return {
                    "status": "found",
                    "value": float(val_match.group(1)),
                    "per_unit": val_match.group(2).strip().lower(),
                    "currency": "INR",
                    "raw_text": text.strip()[:150],
                    "confidence": r.get("confidence", 0.0),
                    "extraction_confidence": _compute_extraction_confidence(True, 0.6, True),
                    "variant_agreement": r.get("variant_agreement", 1.0),
                    "bbox": r.get("bbox"),
                    "source_variant": r.get("source_variant"),
                }
    return None


def parse_dimensions(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect product dimensions declaration (L×W×H)."""
    for idx, r in enumerate(regions):
        text = r.get("text", "")

        has_keyword = bool(DIMENSION_KEYWORD_RE.search(text))
        search_window = text
        matched_regions = [r]

        if has_keyword and idx + 1 < len(regions):
            search_window += " " + regions[idx + 1].get("text", "")
            matched_regions.append(regions[idx + 1])

        dim_match = DIMENSION_VALUE_RE.search(search_window)
        if dim_match:
            dims = [float(dim_match.group(1)), float(dim_match.group(2))]
            if dim_match.group(3):
                dims.append(float(dim_match.group(3)))
            unit = dim_match.group(4).lower()

            unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
            return {
                "status": "found",
                "values": dims,
                "unit": unit,
                "raw_text": search_window.strip()[:150],
                "confidence": r.get("confidence", 0.0),
                "extraction_confidence": _compute_extraction_confidence(has_keyword, 0.7, True),
                "variant_agreement": r.get("variant_agreement", 1.0),
                "bbox": unified_bbox or r.get("bbox"),
                "source_variant": r.get("source_variant"),
            }
    return None


def structure_legal_metrology_fields(regions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Structure all detected OCR text regions into Legal Metrology fields for the Rule Engine.

    Returns a comprehensive dict with all compliance-relevant fields.
    Each field includes OCR confidence, extraction confidence, and variant agreement.
    """
    mrp = parse_mrp(regions)
    net_qty = parse_net_quantity(regions)
    dates = parse_dates(regions)
    fssai = parse_fssai(regions)
    consumer_care = parse_consumer_care(regions)
    entities = parse_manufacturer(regions)
    origin = parse_origin(regions)
    batch = parse_batch_lot(regions)
    usp = parse_unit_sale_price(regions)
    dims = parse_dimensions(regions)

    return {
        "mrp": mrp,
        "net_quantity": net_qty,
        "manufacturing_date": dates["mfg_date"],
        "expiry_date": dates["expiry_date"],
        "fssai": fssai,
        "consumer_care": consumer_care,
        "manufacturer": entities["manufacturer"],
        "packer": entities["packer"],
        "marketer": entities["marketer"],
        "importer": entities["importer"],
        "country_of_origin": origin,
        "batch_lot": batch,
        "unit_sale_price": usp,
        "dimensions": dims,
    }
