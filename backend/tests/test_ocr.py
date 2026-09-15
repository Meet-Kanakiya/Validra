"""Unit and integration tests for Validra OCR and Computer Vision pipeline (Team M3)."""

import io
from pathlib import Path
from unittest.mock import AsyncMock, patch
import pytest
from PIL import Image as PILImage, ImageDraw

from app.services.ocr.quality_gate import check_image_quality
from app.services.ocr.geometry import compute_bbox_metrics, draw_bounding_boxes
from app.services.ocr.preprocessor import preprocess_upscale_rgb
from app.services.ocr.field_parser import (
    parse_mrp,
    parse_net_quantity,
    parse_dates,
    parse_fssai,
    parse_consumer_care,
    parse_manufacturer,
    structure_legal_metrology_fields,
)
from app.services.ocr.ocr_main import OCRPipeline
from app.services.ocr.variant_fusion import deduplicate_detections, compute_bbox_iou
from app.services.ocr.storage import (
    get_upscaled_image_path,
    get_annotated_image_path,
    get_ocr_result_json_path,
)


# Path to real test asset
ASSETS_DIR = Path(__file__).resolve().parent.parent.parent / "Assets"
BALAJI_IMAGE_PATH = ASSETS_DIR / "balaji.png"


def test_quality_gate_pass_clear_image():
    """Test that the real Balaji product package image passes quality assessment."""
    assert BALAJI_IMAGE_PATH.exists(), f"Balaji test image not found at {BALAJI_IMAGE_PATH}"

    result = check_image_quality(BALAJI_IMAGE_PATH)
    assert result.passed is True
    assert result.requires_retake is False
    assert result.text_region_detected is True
    assert len(result.issues) == 0
    assert result.advisory == "Image quality passed."
    assert result.retake_guidance is None
    assert result.blur_score >= 100.0


def test_quality_gate_reject_low_resolution(tmp_path):
    """Test rejection when image resolution is below 300x300."""
    img = PILImage.new("RGB", (150, 150), color=(200, 200, 200))
    img_path = tmp_path / "tiny.jpg"
    img.save(img_path)

    result = check_image_quality(img_path, min_width=300, min_height=300)
    assert result.passed is False
    assert result.requires_retake is True
    assert "LOW_RESOLUTION" in result.issues
    assert "too small" in result.advisory
    assert "retake" in result.advisory.lower()


def test_quality_gate_reject_blank_image(tmp_path):
    """Test rejection when image has no text or edge details."""
    img = PILImage.new("RGB", (600, 600), color=(128, 128, 128))
    img_path = tmp_path / "blank.jpg"
    img.save(img_path)

    result = check_image_quality(img_path)
    assert result.passed is False
    assert result.requires_retake is True
    assert "NO_TEXT_REGION_DETECTED" in result.issues
    assert "retake" in result.advisory.lower()


def test_quality_gate_strict_constraints(tmp_path):
    """Test strict quality constraints for blur, brightness, glare, and retake requirements."""
    # Strict dark image (< 50)
    dark_img = PILImage.new("RGB", (500, 500), color=(35, 35, 35))
    dark_path = tmp_path / "dark.jpg"
    dark_img.save(dark_path)
    dark_res = check_image_quality(dark_path)
    assert dark_res.passed is False
    assert dark_res.requires_retake is True
    assert "UNDEREXPOSED" in dark_res.issues
    assert "retake" in dark_res.advisory.lower()

    # Strict overexposed image (> 220)
    bright_img = PILImage.new("RGB", (500, 500), color=(235, 235, 235))
    bright_path = tmp_path / "bright.jpg"
    bright_img.save(bright_path)
    bright_res = check_image_quality(bright_path)
    assert bright_res.passed is False
    assert bright_res.requires_retake is True
    assert "OVEREXPOSED" in bright_res.issues

    # Strict glare image (> 5% saturated pixels)
    glare_img = PILImage.new("RGB", (500, 500), color=(255, 255, 255))
    glare_path = tmp_path / "glare.jpg"
    glare_img.save(glare_path)
    glare_res = check_image_quality(glare_path)
    assert glare_res.passed is False
    assert glare_res.requires_retake is True
    assert "SEVERE_GLARE" in glare_res.issues

    # Strict dictionary serialization
    dict_repr = glare_res.to_dict()
    assert dict_repr["passed"] is False
    assert dict_repr["requires_retake"] is True
    assert "retake_guidance" in dict_repr
    assert "glare_ratio" in dict_repr
    assert "blur_score" in dict_repr
    assert "brightness" in dict_repr
    assert "motion_blur_score" in dict_repr
    assert "perspective_skew_degrees" in dict_repr


def test_spatial_bbox_deduplication():
    """Test bounding box IoU calculation and spatial deduplication."""
    # Test IoU
    bbox1 = [50, 50, 200, 100]
    bbox2 = [55, 52, 205, 102]  # High overlap
    bbox3 = [300, 300, 450, 350]  # No overlap

    iou_high = compute_bbox_iou(bbox1, bbox2)
    iou_none = compute_bbox_iou(bbox1, bbox3)
    assert iou_high > 0.7
    assert iou_none == 0.0

    # Test deduplication keeping highest confidence detection
    detections = [
        {"bbox": bbox1, "text": "MRP Rs 99", "confidence": 0.85},
        {"bbox": bbox2, "text": "MRP Rs 99", "confidence": 0.98},
        {"bbox": bbox3, "text": "Net Wt 500g", "confidence": 0.95},
    ]
    deduped = deduplicate_detections(detections, iou_threshold=0.5)
    assert len(deduped) == 2
    # Check that highest confidence was retained for overlapping bboxes
    mrp_det = next(d for d in deduped if "MRP" in d["text"])
    assert mrp_det["confidence"] == 0.98


def test_geometry_compute_bbox_metrics():
    """Test bounding box and relative height calculation."""
    polygon = [[100, 200], [400, 200], [400, 260], [100, 260]]
    metrics = compute_bbox_metrics(polygon, image_width=1000, image_height=1000)

    assert metrics["bbox"] == [100, 200, 400, 260]
    assert metrics["bbox_width_px"] == 300
    assert metrics["bbox_height_px"] == 60
    assert metrics["aspect_ratio"] == 5.0
    assert metrics["relative_height_ratio"] == 0.06
    assert metrics["normalized_bbox"] == [0.1, 0.2, 0.4, 0.26]


def test_geometry_draw_bounding_boxes(tmp_path):
    """Test generation of visual evidence overlay image using balaji.png."""
    assert BALAJI_IMAGE_PATH.exists(), f"Balaji test image not found at {BALAJI_IMAGE_PATH}"
    out_path = tmp_path / "annotated.jpg"

    regions = [
        {"bbox": [50, 50, 300, 100], "text": "MRP ₹99", "confidence": 0.98},
        {"bbox": [50, 150, 350, 200], "text": "Net Qty: 500g", "confidence": 0.95},
    ]

    saved_path = draw_bounding_boxes(BALAJI_IMAGE_PATH, regions, out_path)
    assert saved_path.exists()
    with PILImage.open(saved_path) as annotated:
        with PILImage.open(BALAJI_IMAGE_PATH) as orig:
            assert annotated.size == orig.size


def test_field_parser_mrp():
    """Test parsing varied MRP declarations with taxes."""
    regions = [
        {"text": "M.R.P. Rs. 149.50 (Incl. of all taxes)", "confidence": 0.98, "bbox": [10, 20, 200, 50], "bbox_height_px": 30, "relative_height_ratio": 0.03},
        {"text": "Brand ABC Super Cookie", "confidence": 0.99},
    ]
    mrp = parse_mrp(regions)
    assert mrp is not None
    assert mrp["status"] == "found"
    assert mrp["value"] == 149.50
    assert mrp["currency"] == "INR"
    assert mrp["inclusive_of_all_taxes"] is True
    assert mrp["confidence"] == 0.98
    assert mrp["bbox_height_px"] == 30


def test_field_parser_net_quantity_standardization():
    """Test parsing and standardizing Net Quantity in metric units."""
    regions = [
        {"text": "Net Quantity: 500 g", "confidence": 0.96, "bbox": [10, 50, 150, 80], "bbox_height_px": 30, "relative_height_ratio": 0.03},
    ]
    qty = parse_net_quantity(regions)
    assert qty is not None
    assert qty["status"] == "found"
    assert qty["value"] == 500.0
    assert qty["unit"] == "g"
    assert qty["standardized_value"] == 0.5
    assert qty["standardized_unit"] == "kg"


def test_field_parser_dates():
    """Test extraction of Mfg Date and Expiry Date."""
    regions = [
        {"text": "Mfg Dt: 08/2026", "confidence": 0.92, "bbox": [10, 100, 150, 130], "bbox_height_px": 30},
        {"text": "Best Before: 08/2027", "confidence": 0.91, "bbox": [10, 140, 150, 170], "bbox_height_px": 30},
    ]
    dates = parse_dates(regions)
    assert dates["mfg_date"] is not None
    assert "08/2026" in dates["mfg_date"]["raw_date"]
    assert dates["expiry_date"] is not None
    assert "08/2027" in dates["expiry_date"]["raw_date"]


def test_field_parser_best_before_relative_calculation():
    """Test 'best before *** months from packaging' extraction and auto-calculation."""
    # Test with full date
    regions_full = [
        {"text": "PKD. Date: 15/04/2026", "confidence": 0.93, "bbox": [10, 100, 180, 130], "bbox_height_px": 30},
        {"text": "BEST BEFORE THREE MONTHS FROM PACKAGING", "confidence": 0.95, "bbox": [10, 140, 350, 170], "bbox_height_px": 30},
    ]
    dates_full = parse_dates(regions_full)
    assert dates_full["mfg_date"] is not None
    assert dates_full["expiry_date"] is not None
    assert dates_full["expiry_date"]["status"] == "found"
    assert dates_full["expiry_date"]["type"] == "relative_best_before"
    assert dates_full["expiry_date"]["duration_value"] == 3
    assert dates_full["expiry_date"]["duration_unit"] == "months"
    assert dates_full["expiry_date"]["is_calculated"] is True
    assert dates_full["expiry_date"]["calculated_expiry_date"] == "15/07/2026"

    # Test with MM/YYYY date
    regions_my = [
        {"text": "Packed On: 03/2025", "confidence": 0.92, "bbox": [10, 100, 180, 130], "bbox_height_px": 30},
        {"text": "Best before 6 months from packaging", "confidence": 0.94, "bbox": [10, 140, 320, 170], "bbox_height_px": 30},
    ]
    dates_my = parse_dates(regions_my)
    assert dates_my["expiry_date"]["is_calculated"] is True
    assert dates_my["expiry_date"]["calculated_expiry_date"] == "09/2025"

    # Test standalone best before when packaging date is not on image
    regions_standalone = [
        {"text": "BEST BEFORE 12 MONTHS FROM MANUFACTURE", "confidence": 0.90, "bbox": [10, 140, 320, 170], "bbox_height_px": 30},
    ]
    dates_standalone = parse_dates(regions_standalone)
    assert dates_standalone["expiry_date"] is not None
    assert dates_standalone["expiry_date"]["type"] == "relative_best_before"
    assert dates_standalone["expiry_date"]["duration_value"] == 12
    assert dates_standalone["expiry_date"]["duration_unit"] == "months"
    assert dates_standalone["expiry_date"]["calculated_expiry_date"] is None


def test_field_parser_fssai():
    """Test 14-digit FSSAI license extraction."""
    regions = [
        {"text": "FSSAI Lic No: 11521018000456", "confidence": 0.97, "bbox": [10, 200, 250, 230], "bbox_height_px": 30},
    ]
    fssai = parse_fssai(regions)
    assert fssai is not None
    assert fssai["license_number"] == "11521018000456"
    assert fssai["is_valid_14_digits"] is True


def test_field_parser_consumer_care():
    """Test consumer complaint contact detection (toll-free and email)."""
    regions = [
        {"text": "Customer Care: 1800-209-1234", "confidence": 0.95, "bbox": [10, 300, 250, 330]},
        {"text": "Email: feedback@validra.com", "confidence": 0.94, "bbox": [10, 340, 250, 370]},
    ]
    care = parse_consumer_care(regions)
    assert care is not None
    assert "18002091234" in care["phones"]
    assert care["has_toll_free"] is True
    assert "feedback@validra.com" in care["emails"]


def test_structure_legal_metrology_fields_full():
    """Test end-to-end structuring of all Legal Metrology declarations."""
    regions = [
        {"text": "MRP Rs 99.00 (INCL OF ALL TAXES)", "confidence": 0.98, "bbox": [10, 20, 200, 50], "bbox_height_px": 30, "relative_height_ratio": 0.03},
        {"text": "Net Wt: 250 ml", "confidence": 0.95, "bbox": [10, 60, 150, 90], "bbox_height_px": 30, "relative_height_ratio": 0.03},
        {"text": "Mfd: 01/2026", "confidence": 0.93, "bbox": [10, 100, 120, 120], "bbox_height_px": 20},
        {"text": "Use By: 01/2027", "confidence": 0.92, "bbox": [10, 130, 120, 150], "bbox_height_px": 20},
        {"text": "Lic No. 10014022003123", "confidence": 0.96, "bbox": [10, 160, 200, 180], "bbox_height_px": 20},
        {"text": "Manufactured by Sunrise Beverages Pvt Ltd, Mumbai", "confidence": 0.94, "bbox": [10, 190, 350, 210], "bbox_height_px": 20},
        {"text": "Helpline: 1800-111-2222 care@sunrise.in", "confidence": 0.95, "bbox": [10, 220, 300, 240]},
        {"text": "Country of Origin: India", "confidence": 0.95, "bbox": [10, 250, 200, 270]},
    ]
    fields = structure_legal_metrology_fields(regions)

    assert fields["mrp"]["value"] == 99.0
    assert fields["net_quantity"]["standardized_value"] == 0.25
    assert fields["net_quantity"]["standardized_unit"] == "l"
    assert fields["fssai"]["license_number"] == "10014022003123"
    assert fields["manufacturer"]["status"] == "found"
    assert "Sunrise Beverages" in fields["manufacturer"]["raw_text"]
    assert fields["consumer_care"]["has_toll_free"] is True
    assert fields["country_of_origin"]["country"] == "India"


def test_preprocessor_upscale_rgb(tmp_path):
    """Test 2x RGB upscale preprocessing on Balaji product packaging."""
    assert BALAJI_IMAGE_PATH.exists(), f"Balaji test image not found at {BALAJI_IMAGE_PATH}"
    out_path = tmp_path / "original_upscaled.jpg"

    result = preprocess_upscale_rgb(
        input_path=BALAJI_IMAGE_PATH,
        output_path=out_path,
        upscale_factor=2.0,
    )

    assert out_path.exists()
    assert result.upscale_factor == 2.0
    with PILImage.open(out_path) as upscaled_img:
        assert upscaled_img.mode == "RGB"
        assert upscaled_img.size == (result.processed_width, result.processed_height)
        with PILImage.open(BALAJI_IMAGE_PATH) as orig_img:
            # Upscaled dimensions should be approximately 2x (accounting for aspect-ratio resize if any)
            assert upscaled_img.size[0] >= orig_img.size[0]
            assert upscaled_img.size[1] >= orig_img.size[1]


def test_ocr_pipeline_execution(tmp_path):
    """Test OCRPipeline coordinator with RGB upscale, PaddleOCR, and ocr_result.json persistence."""
    import asyncio
    import json

    async def _run():
        assert BALAJI_IMAGE_PATH.exists(), f"Balaji test image not found at {BALAJI_IMAGE_PATH}"

        mock_detections = [
            {"polygon": [[50, 50], [250, 50], [250, 80], [50, 80]], "text": "MRP ₹199.00 (Incl. of all taxes)", "confidence": 0.98},
            {"polygon": [[50, 100], [200, 100], [200, 130], [50, 130]], "text": "Net Qty: 1 kg", "confidence": 0.97},
        ]

        pipeline = OCRPipeline()
        with patch("app.services.ocr.ocr_main.ocr_engine.run_inference_async", new_callable=AsyncMock) as mock_inf:
            mock_inf.return_value = mock_detections
            result = await pipeline.process_image(
                scan_id="test-scan-12345",
                image_path=str(BALAJI_IMAGE_PATH),
                skip_quality_gate=False,
            )

            assert result["status"] == "completed"
            assert result["engine"] == "paddleocr"
            assert len(result["regions"]) >= 2
            assert result["fields"]["mrp"]["value"] == 199.0
            assert result["fields"]["net_quantity"]["value"] == 1.0

            # Verify every scan produces original_upscaled, annotated, and ocr_result.json
            upscaled_path = get_upscaled_image_path("test-scan-12345")
            annotated_path = get_annotated_image_path("test-scan-12345")
            json_path = get_ocr_result_json_path("test-scan-12345")

            assert upscaled_path.exists()
            assert annotated_path.exists()
            assert json_path.exists()

            # Verify saved ocr_result.json contents
            with open(json_path, "r", encoding="utf-8") as f:
                saved_json = json.load(f)
            assert saved_json["status"] == "completed"
            assert saved_json["scan_id"] == "test-scan-12345"
            assert saved_json["images"]["original_upscaled"] is not None
            assert saved_json["images"]["annotated"] is not None

    asyncio.run(_run())


def test_field_parser_unspaced_best_before():
    """Test extracting shelf life from tight or unspaced packaging text."""
    regions = [
        {"text": "PKD.:", "confidence": 0.90, "bbox": [10, 100, 50, 120], "bbox_height_px": 20},
        {"text": "BESTBEFORETHREEMONTHSFROMPACKAR", "confidence": 0.93, "bbox": [10, 130, 200, 150], "bbox_height_px": 20},
    ]
    dates = parse_dates(regions)
    assert dates["expiry_date"] is not None
    assert dates["expiry_date"]["status"] == "found"
    assert dates["expiry_date"]["type"] == "relative_best_before"
    assert dates["expiry_date"]["duration_value"] == 3
    assert dates["expiry_date"]["duration_unit"] == "months"
    assert dates["mfg_date"] is not None
    assert dates["mfg_date"]["status"] == "needs_review"
    assert dates["mfg_date"]["keyword_present"] is True


def test_field_parser_multiple_fssai():
    """Test extracting multiple 14-digit FSSAI licenses on multi-unit packaging."""
    regions = [
        {"text": "fssai Lic No. 10012021000039", "confidence": 0.95, "bbox": [10, 100, 200, 120], "bbox_height_px": 20},
        {"text": "Unit 2 fssai Lic No: 10012021000037", "confidence": 0.94, "bbox": [10, 130, 200, 150], "bbox_height_px": 20},
        {"text": "Unit 3 Lic No: 10016026000857", "confidence": 0.92, "bbox": [10, 160, 200, 180], "bbox_height_px": 20},
    ]
    fssai = parse_fssai(regions)
    assert fssai is not None
    assert fssai["status"] == "found"
    assert fssai["total_licenses_found"] == 3
    assert len(fssai["license_numbers"]) == 3
    assert "10012021000039" in fssai["license_numbers"]
    assert "10012021000037" in fssai["license_numbers"]
    assert "10016026000857" in fssai["license_numbers"]


def test_field_parser_batch_reserved_word_filtering():
    """Test that reserved section words (like Manufactured by) are never extracted as batch numbers."""
    from app.services.ocr.field_parser import parse_batch_lot
    regions = [
        {"text": "B.No.:", "confidence": 0.88, "bbox": [10, 100, 80, 120]},
        {"text": "Manufactured by: Balaji Wafers", "confidence": 0.96, "bbox": [10, 130, 250, 150]},
        {"text": "Website.www.balajiwafers.com", "confidence": 0.95, "bbox": [10, 160, 250, 180]},
    ]
    batch = parse_batch_lot(regions)
    assert batch is not None
    # Must not falsely accept 'Manufacturedby' or 'balajiwafers.com'
    assert batch["status"] == "needs_review"
    assert batch["value"] is None
    assert batch["keyword_present"] is True

    # Test valid batch extraction
    valid_regions = [
        {"text": "B.No.: U2827H", "confidence": 0.92, "bbox": [10, 100, 150, 120]},
    ]
    valid_batch = parse_batch_lot(valid_regions)
    assert valid_batch is not None
    assert valid_batch["status"] == "found"
    assert valid_batch["value"] == "U2827H"


def test_field_parser_origin_from_domestic_address():
    """Test country of origin extraction from domestic address ending with INDIA."""
    from app.services.ocr.field_parser import parse_origin
    regions = [
        {"text": "Dist. Rajkot-360021 Gujarat - INDIA.", "confidence": 0.92, "bbox": [10, 100, 300, 120]},
    ]
    origin = parse_origin(regions)
    assert origin is not None
    assert origin["status"] == "found"
    assert origin["country"] == "India"


def test_field_parser_consumer_care_clean_website():
    """Test consumer care website extraction ignores false abbreviations like B.No."""
    regions = [
        {"text": "B.No.:", "confidence": 0.90, "bbox": [10, 50, 60, 70]},
        {"text": "For feedback and complaints:", "confidence": 0.94, "bbox": [10, 100, 200, 120], "bbox_height_px": 20},
        {"text": "email us at: care@balajiwafers.com", "confidence": 0.95, "bbox": [10, 130, 250, 150]},
        {"text": "Website: www.balajiwafers.com", "confidence": 0.93, "bbox": [10, 160, 250, 180]},
    ]
    care = parse_consumer_care(regions)
    assert care is not None
    assert "care@balajiwafers.com" in care["emails"]
    assert "balajiwafers.com" in care["websites"]
    assert "B.No" not in care["websites"]

