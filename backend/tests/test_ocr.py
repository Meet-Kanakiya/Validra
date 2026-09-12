"""Unit and integration tests for Validra OCR and Computer Vision pipeline (Team M3)."""

import io
from pathlib import Path
from unittest.mock import AsyncMock, patch
import pytest
from PIL import Image as PILImage, ImageDraw

from app.services.ocr.quality_gate import check_image_quality
from app.services.ocr.geometry import compute_bbox_metrics, draw_bounding_boxes
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


def create_synthetic_image(width=800, height=600, draw_text=True) -> PILImage.Image:
    """Helper to generate a test image."""
    img = PILImage.new("RGB", (width, height), color=(240, 240, 240))
    if draw_text:
        draw = ImageDraw.Draw(img)
        # Draw high-contrast synthetic content and text-like lines
        for y in range(50, 550, 40):
            draw.line([(50, y), (750, y)], fill=(20, 20, 20), width=3)
            draw.text((60, y + 5), f"Sample Compliance Text Line at Y={y}", fill=(0, 0, 0))
    return img


def test_quality_gate_pass_clear_image(tmp_path):
    """Test that a high-contrast, well-sized image passes the quality gate."""
    img = create_synthetic_image(800, 600, draw_text=True)
    img_path = tmp_path / "clear_label.jpg"
    img.save(img_path)

    result = check_image_quality(img_path)
    assert result.passed is True
    assert result.resolution == [800, 600]
    assert len(result.issues) == 0


def test_quality_gate_reject_low_resolution(tmp_path):
    """Test rejection when image resolution is below 300x300."""
    img = PILImage.new("RGB", (150, 150), color=(200, 200, 200))
    img_path = tmp_path / "tiny.jpg"
    img.save(img_path)

    result = check_image_quality(img_path, min_width=300, min_height=300)
    assert result.passed is False
    assert "LOW_RESOLUTION" in result.issues
    assert "too small" in result.advisory


def test_quality_gate_reject_blank_image(tmp_path):
    """Test rejection when image has no text or edge details."""
    img = PILImage.new("RGB", (600, 600), color=(128, 128, 128))
    img_path = tmp_path / "blank.jpg"
    img.save(img_path)

    result = check_image_quality(img_path)
    assert result.passed is False
    assert "NO_TEXT_REGION_DETECTED" in result.issues


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
    """Test generation of visual evidence overlay image."""
    img = create_synthetic_image(500, 500)
    src_path = tmp_path / "original.jpg"
    out_path = tmp_path / "annotated.jpg"
    img.save(src_path)

    regions = [
        {"bbox": [50, 50, 300, 100], "text": "MRP ₹99", "confidence": 0.98},
        {"bbox": [50, 150, 350, 200], "text": "Net Qty: 500g", "confidence": 0.95},
    ]

    saved_path = draw_bounding_boxes(src_path, regions, out_path)
    assert saved_path.exists()
    with PILImage.open(saved_path) as annotated:
        assert annotated.size == (500, 500)


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


def test_ocr_pipeline_execution(tmp_path):
    """Test OCRPipeline coordinator with mocked inference."""
    import asyncio

    async def _run():
        img = create_synthetic_image(800, 600, draw_text=True)
        img_path = tmp_path / "test_package.jpg"
        img.save(img_path)

        mock_detections = [
            {"polygon": [[50, 50], [250, 50], [250, 80], [50, 80]], "text": "MRP ₹199.00 (Incl. of all taxes)", "confidence": 0.98},
            {"polygon": [[50, 100], [200, 100], [200, 130], [50, 130]], "text": "Net Qty: 1 kg", "confidence": 0.97},
        ]

        pipeline = OCRPipeline()
        with patch("app.services.ocr.ocr_main.ocr_engine.run_inference_async", new_callable=AsyncMock) as mock_inf:
            mock_inf.return_value = mock_detections
            result = await pipeline.process_image(
                scan_id="test-scan-12345",
                image_path=str(img_path),
                skip_quality_gate=False,
            )

            assert result["status"] == "completed"
            assert result["engine"] == "paddleocr"
            assert len(result["regions"]) == 2
            assert result["regions"][0]["bbox_height_px"] == 30
            assert result["fields"]["mrp"]["value"] == 199.0
            assert result["fields"]["net_quantity"]["value"] == 1.0
            assert result["annotated_image_path"] is not None
            assert Path(result["annotated_image_path"]).exists()

    asyncio.run(_run())
