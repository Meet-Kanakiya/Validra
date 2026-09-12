"""High-quality field parser and Legal Metrology data structuring module.

Owner: Team M3 (Computer Vision)
Extracts and normalizes standardized Legal Metrology compliance declarations
(Rules 6 & 7) from recognized OCR regions:
- MRP (value, currency, taxes included flag)
- Net Quantity (value, metric unit, standardized SI value)
- Manufacturing / Packing / Expiry Dates
- FSSAI License Number (14 digits)
- Manufacturer / Packer / Importer details
- Consumer Care contact (Toll-free, phone, email, address)
- Country of Origin
Preserves complete provenance (source bbox, height, confidence).
"""

import re
import calendar
from datetime import date, timedelta
import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("validra.ocr.parser")


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


# Pre-compiled Regex Patterns for High Performance
MRP_KEYWORD_RE = re.compile(
    r"\b(?:m\.?r\.?p\.?|max(?:imum)?\.?\s*retail\s*price|retail\s*(?:sale)?\s*price|rs\.?|inr)\b|₹",
    re.IGNORECASE,
)
PRICE_VALUE_RE = re.compile(r"(?:₹|rs\.?|inr)?\s*([0-9]+(?:[\.,][0-9]{1,2})?)\s*(?:\/\-)?", re.IGNORECASE)
TAXES_INCL_RE = re.compile(
    r"(?:incl(?:usive)?\.?\s*(?:of)?\s*(?:all)?\s*taxes|incl\.?\s*all\s*taxes|taxes\s*incl(?:uded)?)",
    re.IGNORECASE,
)

NET_QTY_EXCLUDE_RE = re.compile(
    r"(?:nutritional|per\s*100\s*(?:g|ml)|approximate|servings?|energy|protein|fat|sugar|carbohydrate)",
    re.IGNORECASE,
)
NET_QTY_KEYWORD_RE = re.compile(
    r"(?:net\s*(?:wt|weight|qty|quantity|content|volume|vol)|nett\s*wt|pkg\s*content|weight\s*:|qty\s*:)\b",
    re.IGNORECASE,
)
QTY_VALUE_RE = re.compile(
    r"\b([0-9]+(?:\.[0-9]+)?)\s*(kg|kgs|kilograms?|g|gm|gms|grams?|ml|mL|millilitres?|l|ltr|litres?|pcs|pieces?|count|units?|u|N)\b",
    re.IGNORECASE,
)

DATE_MFG_KEYWORD_RE = re.compile(
    r"(?:mfg\s*(?:date|dt)?|mfd|pkd|packed\s*(?:on|date|dt)?|date\s*of\s*(?:mfg|packing)|pkg)\b",
    re.IGNORECASE,
)
DATE_EXP_KEYWORD_RE = re.compile(
    r"(?:exp\s*(?:date|dt)?|expiry|use\s*by|best\s*before|bb)\b",
    re.IGNORECASE,
)
DATE_PATTERN_RE = re.compile(
    r"\b((?:0[1-9]|1[0-2]|[1-9])\s*[\/\-\.]\s*(?:20\d{2}|\d{2})|(?:0[1-9]|[12]\d|3[01])\s*[\/\-\.]\s*(?:0[1-9]|1[0-2])\s*[\/\-\.]\s*(?:20\d{2}|\d{2})|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\.\-\/]*(?:20\d{2}|\d{2}))\b",
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
    r"(months?|mths?|years?|yrs?|days?|weeks?)\s*"
    r"(?:from\s*(?:the\s*)?(?:date\s*of\s*)?(?:packaging|packing|mfg|manufacture|mfd|pkd|pkg)|of\s*packing)\b",
    re.IGNORECASE,
)

FSSAI_KEYWORD_RE = re.compile(r"(?:fssai|lic\.?\s*(?:no|num|number)?|ense\s*no)\b", re.IGNORECASE)
FSSAI_NUMBER_RE = re.compile(r"\b([12]\d{13})\b")

# Enhanced phone regex matching international +91- or domestic numbers
PHONE_RE = re.compile(r"(?:\+91[\s\-]?)?(?:1800[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,4}|[6-9]\d{9}|0\d{2,4}[\s\-]?\d{6,8})\b")
EMAIL_RE = re.compile(r"\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b")
CONSUMER_CARE_KEYWORD_RE = re.compile(
    r"(?:consumer\s*(?:care|helpline|cell)|customer\s*(?:care|support|service)|feedback|complaints|toll\s*free|care\s*manager)\b",
    re.IGNORECASE,
)

MFG_NAME_KEYWORD_RE = re.compile(
    r"(?:mfg\s*by|manufactured\s*by|mfd\s*by|produced\s*by)\b",
    re.IGNORECASE,
)
PACKER_KEYWORD_RE = re.compile(r"(?:packed\s*by|pkd\s*by)\b", re.IGNORECASE)
MARKETER_KEYWORD_RE = re.compile(r"(?:marketed\s*by|mktd\s*by|brand\s*owner)\b", re.IGNORECASE)
IMPORTER_KEYWORD_RE = re.compile(r"(?:imported\s*by|imp\s*by)\b", re.IGNORECASE)
ORIGIN_KEYWORD_RE = re.compile(r"(?:country\s*of\s*origin|made\s*in|product\s*of)\s*:?\s*([a-zA-Z\s]+)", re.IGNORECASE)


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

        # Search for price and taxes declaration:
        # Priority 1: Same horizontal line to the right
        # Priority 2: Directly below in the same column
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
                # Exclude if it's Net Qty, Batch No, or Mfg date
                if not re.search(r"\b(?:net|wt|weight|b\.?no|pkd|mfg|[0-9]+\s*(?:g|gm|kg|ml|l))\b", otext, re.IGNORECASE):
                    matched_regions.append(other_r)
                    search_window += " " + otext

        # Clean search string (ignore parenthesized percentages like nutritional % or salt %)
        clean_search = re.sub(r"\([^\)]*%\)", "", search_window)

        # Find price value
        matches = list(PRICE_VALUE_RE.finditer(clean_search))
        for m in matches:
            raw_val = m.group(1).replace(",", ".")
            try:
                val_float = float(raw_val)
                # Ensure trailing token is not a mass/volume unit or %
                end_pos = m.end()
                trailing = clean_search[end_pos:end_pos + 6].strip().lower()
                if any(trailing.startswith(u) for u in ["g", "gm", "kg", "ml", "l", "ltr", "%"]):
                    continue

                if 0.5 <= val_float <= 100000.0:
                    taxes_incl = bool(TAXES_INCL_RE.search(search_window))
                    unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
                    height_px = (unified_bbox[3] - unified_bbox[1]) if unified_bbox else r.get("bbox_height_px")

                    return {
                        "status": "found",
                        "value": val_float,
                        "currency": "INR",
                        "inclusive_of_all_taxes": taxes_incl,
                        "raw_text": search_window.strip(),
                        "confidence": r.get("confidence", 0.0),
                        "bbox": unified_bbox or r.get("bbox"),
                        "bbox_height_px": height_px,
                        "relative_height_ratio": r.get("relative_height_ratio"),
                    }
            except (ValueError, IndexError):
                continue
    return None


def parse_net_quantity(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect and parse Net Quantity declaration, filtering out nutritional tables and converting to standard SI metric units."""
    unit_multipliers = {
        "g": (1.0, "g", 0.001, "kg"),
        "gm": (1.0, "g", 0.001, "kg"),
        "gms": (1.0, "g", 0.001, "kg"),
        "gram": (1.0, "g", 0.001, "kg"),
        "grams": (1.0, "g", 0.001, "kg"),
        "kg": (1000.0, "g", 1.0, "kg"),
        "kgs": (1000.0, "g", 1.0, "kg"),
        "kilogram": (1000.0, "g", 1.0, "kg"),
        "kilograms": (1000.0, "g", 1.0, "kg"),
        "ml": (1.0, "ml", 0.001, "l"),
        "millilitres": (1.0, "ml", 0.001, "l"),
        "l": (1000.0, "ml", 1.0, "l"),
        "ltr": (1000.0, "ml", 1.0, "l"),
        "litres": (1000.0, "ml", 1.0, "l"),
        "pcs": (1.0, "units", 1.0, "units"),
        "pieces": (1.0, "units", 1.0, "units"),
        "units": (1.0, "units", 1.0, "units"),
        "u": (1.0, "units", 1.0, "units"),
        "n": (1.0, "units", 1.0, "units"),
    }

    # Pass 1: Look for explicit Net Weight / Quantity keyword declarations
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        # Filter out nutritional table lines (e.g. "Per 100g")
        if NET_QTY_EXCLUDE_RE.search(text):
            continue

        if NET_QTY_KEYWORD_RE.search(text):
            matched_regions = [r]
            search_window = text
            # Look ahead up to 3 lines if quantity is placed adjacent (e.g. "Net Weight:" followed by "18g")
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
                    num_val = float(match.group(1))
                    raw_unit = match.group(2).lower()
                    conv = unit_multipliers.get(raw_unit, (1.0, raw_unit, 1.0, raw_unit))

                    std_val = round(num_val * conv[2], 4)
                    std_unit = conv[3]
                    unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
                    height_px = (unified_bbox[3] - unified_bbox[1]) if unified_bbox else r.get("bbox_height_px")

                    return {
                        "status": "found",
                        "value": num_val,
                        "unit": raw_unit,
                        "standardized_value": std_val,
                        "standardized_unit": std_unit,
                        "raw_text": search_window.strip(),
                        "confidence": r.get("confidence", 0.0),
                        "bbox": unified_bbox or r.get("bbox"),
                        "bbox_height_px": height_px,
                        "relative_height_ratio": r.get("relative_height_ratio"),
                    }
                except (ValueError, IndexError):
                    continue

    # Pass 2: Fallback to standalone metric pattern if no nutritional exclusion applies
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        if NET_QTY_EXCLUDE_RE.search(text):
            continue

        match = QTY_VALUE_RE.search(text)
        if match:
            try:
                num_val = float(match.group(1))
                raw_unit = match.group(2).lower()
                conv = unit_multipliers.get(raw_unit, (1.0, raw_unit, 1.0, raw_unit))

                return {
                    "status": "found",
                    "value": num_val,
                    "unit": raw_unit,
                    "standardized_value": round(num_val * conv[2], 4),
                    "standardized_unit": conv[3],
                    "raw_text": text.strip(),
                    "confidence": r.get("confidence", 0.0),
                    "bbox": r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                    "relative_height_ratio": r.get("relative_height_ratio"),
                }
            except (ValueError, IndexError):
                continue

    return None


def parse_date_string(date_str: str) -> Tuple[Any, Optional[str]]:
    """Parse date string into (parsed_date, format_type).
    Returns (date_obj, 'full') or ((year, month), 'month_year') or (None, None).
    """
    clean = re.sub(r"[^\w\/\-\.]", " ", date_str).strip()

    # 1. Full date: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
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

    # 2. Month + Year: MM/YYYY or MM/YY or MM-YYYY
    m = re.search(r"\b([0-1]?[0-9])[\/\-\.](20\d{2}|\d{2})\b", clean)
    if m:
        mth, y = int(m.group(1)), int(m.group(2))
        if y < 100:
            y += 2000
        if 1 <= mth <= 12:
            return (y, mth), "month_year"

    # 3. Text Month: DD Mon YYYY or Mon YYYY
    m = re.search(
        r"\b(?:([0-3]?[0-9])\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(20\d{2}|\d{2})\b",
        clean,
        re.IGNORECASE,
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
    """Detect and parse manufacturing, packing, and expiry dates, including auto-calculation for relative shelf life."""
    mfg_result = None
    exp_result = None

    # Pass 1: Look for Mfg / Pkd date
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
                    "bbox": unified_bbox or r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                }
                break

    # Pass 2: Look for Expiry / Best Before (Relative or Absolute)
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        if exp_result:
            break

        # Check relative "Best before *** months/years/days from packaging"
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
            # Normalize unit
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
                    "bbox": unified_bbox or r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                    "calculated_expiry_date": None,
                    "is_calculated": False,
                }
                break

        # Check absolute date declaration (e.g. "Exp Date: 12/2025")
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
                    "bbox": unified_bbox or r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                    "calculated_expiry_date": d_match.group(1).strip(),
                    "is_calculated": False,
                }
                break

    # Pass 3: Auto-calculate expiry date if relative shelf life and packaging/mfg date are present
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
    """Detect 14-digit FSSAI license number and validate format."""
    for idx, r in enumerate(regions):
        text = r.get("text", "")
        fssai_match = FSSAI_NUMBER_RE.search(text)
        has_keyword = bool(FSSAI_KEYWORD_RE.search(text))

        if not fssai_match and has_keyword and idx + 1 < len(regions):
            next_text = regions[idx + 1].get("text", "")
            fssai_match = FSSAI_NUMBER_RE.search(next_text)
            if fssai_match:
                unified_bbox = merge_bboxes([r.get("bbox"), regions[idx + 1].get("bbox")])
                return {
                    "status": "found",
                    "license_number": fssai_match.group(1),
                    "is_valid_14_digits": len(fssai_match.group(1)) == 14,
                    "raw_text": f"{text} {next_text}".strip(),
                    "confidence": r.get("confidence", 0.0),
                    "bbox": unified_bbox or r.get("bbox"),
                    "bbox_height_px": r.get("bbox_height_px"),
                }

        if fssai_match:
            lic_num = fssai_match.group(1)
            return {
                "status": "found",
                "license_number": lic_num,
                "is_valid_14_digits": len(lic_num) == 14,
                "raw_text": text.strip(),
                "confidence": r.get("confidence", 0.0),
                "bbox": r.get("bbox"),
                "bbox_height_px": r.get("bbox_height_px"),
            }
    return None


def parse_consumer_care(regions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Detect customer care helpline, toll-free number, email, and declaration (Rule 6(2))."""
    # Collect all FSSAI numbers to avoid false positive phone matches
    all_text = " ".join(r.get("text", "") for r in regions)
    fssai_numbers = set(FSSAI_NUMBER_RE.findall(all_text))

    phones = []
    emails = []
    matched_regions = []

    for idx, r in enumerate(regions):
        text = r.get("text", "")
        has_kw = bool(CONSUMER_CARE_KEYWORD_RE.search(text))

        # Check phone numbers
        p_matches = PHONE_RE.findall(text)
        valid_phones = []
        for p in p_matches:
            digits = re.sub(r"[^0-9]", "", p)
            # Must be a valid phone length (10 digits mobile, 11 digits with 0/1800, or 12 with 91)
            if len(digits) not in (10, 11, 12):
                continue
            # Must not be part of any 14-digit FSSAI license
            if any(digits in f or f in digits for f in fssai_numbers):
                continue
            valid_phones.append(p.replace(" ", "").replace("-", ""))

        e_matches = EMAIL_RE.findall(text)

        if has_kw or valid_phones or e_matches:
            matched_regions.append(r)
            phones.extend(valid_phones)
            emails.extend(e_matches)

            # If keyword matched, also check subsequent 1-3 lines directly below in the same column
            if has_kw and r.get("bbox"):
                bx = r["bbox"]
                h = max(10, bx[3] - bx[1])
                for other_r in regions:
                    if other_r is r:
                        continue
                    obx = other_r.get("bbox")
                    if not obx:
                        continue
                    if 0 <= (obx[1] - bx[3]) < h * 3.0 and abs(obx[0] - bx[0]) < 90:
                        otext = other_r.get("text", "")
                        for p in PHONE_RE.findall(otext):
                            d = re.sub(r"[^0-9]", "", p)
                            if len(d) in (10, 11, 12) and not any(d in f for f in fssai_numbers):
                                phones.append(p.replace(" ", "").replace("-", ""))
                                matched_regions.append(other_r)
                        for e in EMAIL_RE.findall(otext):
                            emails.append(e)
                            matched_regions.append(other_r)

    if matched_regions:
        unique_phones = list(dict.fromkeys(phones))
        unique_emails = list(dict.fromkeys(emails))
        unified_bbox = merge_bboxes([mr.get("bbox") for mr in matched_regions])
        raw_text_summary = " ".join([mr.get("text", "") for mr in matched_regions])[:200]

        return {
            "status": "found",
            "phones": unique_phones,
            "emails": unique_emails,
            "has_toll_free": any("1800" in p for p in unique_phones),
            "raw_text": raw_text_summary,
            "confidence": matched_regions[0].get("confidence", 0.0),
            "bbox": unified_bbox,
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

        # Scan for continuation lines directly below in the same visual column
        if bx:
            for other_r in regions:
                if other_r is keyword_region:
                    continue
                obx = other_r.get("bbox")
                if not obx:
                    continue
                # Same column, directly below within 2.5 line heights
                is_col_below = 0 <= (obx[1] - bx[3]) < h * 2.5 and abs(obx[0] - bx[0]) < 70
                if is_col_below:
                    otext = other_r.get("text", "")
                    # Stop if we hit FSSAI, Batch, Date, or another declaration
                    if FSSAI_KEYWORD_RE.search(otext) or FSSAI_NUMBER_RE.search(otext) or re.search(r"\b(?:b\.?no|pkd|mfg|net|mrp)\b", otext, re.IGNORECASE):
                        break
                    block_regions.append(other_r)
                    if len(block_regions) >= 3:
                        break

        snippet = " ".join([sr.get("text", "") for sr in block_regions]).strip()
        unified_bbox = merge_bboxes([sr.get("bbox") for sr in block_regions])
        return {
            "status": "found",
            "raw_text": snippet[:200],
            "confidence": keyword_region.get("confidence", 0.0),
            "bbox": unified_bbox or keyword_region.get("bbox"),
            "bbox_height_px": keyword_region.get("bbox_height_px"),
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
                "bbox": r.get("bbox"),
            }
    return None


def structure_legal_metrology_fields(regions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Structure all detected OCR text regions into high-quality Legal Metrology fields for the Rule Engine."""
    mrp = parse_mrp(regions)
    net_qty = parse_net_quantity(regions)
    dates = parse_dates(regions)
    fssai = parse_fssai(regions)
    consumer_care = parse_consumer_care(regions)
    entities = parse_manufacturer(regions)
    origin = parse_origin(regions)

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
    }
