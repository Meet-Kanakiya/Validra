import io
import uuid
from unittest.mock import patch
import pytest
from PIL import Image as PILImage


def create_test_image(format="JPEG", size=(100, 100), color=(255, 0, 0)) -> bytes:
    """Create in-memory image bytes."""
    buf = io.BytesIO()
    image = PILImage.new("RGB", size, color=color)
    image.save(buf, format=format)
    return buf.getvalue()


def test_upload_valid_image(client):
    """Test successful image upload under 5MB."""
    img_bytes = create_test_image(format="JPEG")
    files = {"file": ("test_package.jpg", img_bytes, "image/jpeg")}

    response = client.post("/api/scans", files=files)
    assert response.status_code == 201

    data = response.json()
    assert "scan_id" in data
    assert "image_id" in data
    assert data["file_name"] == "test_package.jpg"
    assert data["file_size"] == len(img_bytes)
    assert "image_hash" in data
    assert data["status"] == "processing"
    assert "ocr" in data
    assert data["ocr"]["status"] == "queued"


def test_upload_image_exceeding_5mb(client):
    """Test rejection of files exceeding 5MB."""
    oversized_bytes = b"0" * (5 * 1024 * 1024 + 100)
    files = {"file": ("huge_image.png", oversized_bytes, "image/png")}

    response = client.post("/api/scans", files=files)
    assert response.status_code == 413
    assert "exceeds maximum allowed size" in response.json()["detail"]


def test_upload_invalid_extension(client):
    """Test rejection of non-image file extensions."""
    files = {"file": ("test_document.txt", b"Hello World", "text/plain")}

    response = client.post("/api/scans", files=files)
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]


def test_upload_no_extension(client):
    """Test rejection of filename without extension."""
    files = {"file": ("noextensionfile", b"Hello World", "image/jpeg")}

    response = client.post("/api/scans", files=files)
    assert response.status_code == 400
    assert "has no extension" in response.json()["detail"]


def test_upload_unsupported_mime_type(client):
    """Test rejection when MIME type is not allowed."""
    img_bytes = create_test_image(format="JPEG")
    files = {"file": ("test.jpg", img_bytes, "application/pdf")}

    response = client.post("/api/scans", files=files)
    assert response.status_code == 400
    assert "Unsupported image type" in response.json()["detail"]


def test_upload_empty_filename(client):
    """Test rejection of empty filename."""
    img_bytes = create_test_image(format="JPEG")
    files = {"file": ("", img_bytes, "image/jpeg")}

    response = client.post("/api/scans", files=files)
    assert response.status_code in (400, 422)


def test_upload_corrupted_image(client):
    """Test rejection of files with image extension but corrupt content."""
    fake_bytes = b"not a real image content at all"
    files = {"file": ("fake.jpg", fake_bytes, "image/jpeg")}

    response = client.post("/api/scans", files=files)
    assert response.status_code == 400
    assert "Invalid or corrupted image" in response.json()["detail"]


def test_upload_empty_file(client):
    """Test rejection of 0-byte file."""
    files = {"file": ("empty.jpg", b"", "image/jpeg")}

    response = client.post("/api/scans", files=files)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"]


def test_get_scan_by_id(client):
    """Test retrieving scan metadata by UUID."""
    img_bytes = create_test_image(format="PNG")
    files = {"file": ("query_test.png", img_bytes, "image/png")}

    upload_res = client.post("/api/scans", files=files)
    assert upload_res.status_code == 201
    scan_id = upload_res.json()["scan_id"]

    get_res = client.get(f"/api/scans/{scan_id}")
    assert get_res.status_code == 200
    scan_data = get_res.json()
    assert scan_data["scan_id"] == scan_id
    assert scan_data["status"] == "processing"
    assert len(scan_data["images"]) == 1
    assert scan_data["images"][0]["file_name"] == "query_test.png"


def test_get_scan_invalid_uuid(client):
    """Test 400 when invalid UUID format is provided."""
    response = client.get("/api/scans/not-a-valid-uuid-12345")
    assert response.status_code == 400
    assert "Invalid scan ID format" in response.json()["detail"]


def test_get_scan_not_found(client):
    """Test 404 for non-existent scan ID."""
    random_uuid = str(uuid.uuid4())
    response = client.get(f"/api/scans/{random_uuid}")
    assert response.status_code == 404
    assert f"Scan with ID '{random_uuid}' not found." in response.json()["detail"]


def test_ocr_failure_fault_tolerance(client):
    """Test that OCR failure does not crash upload and sets status to needs_review."""
    with patch("app.api.scans.run_ocr_pipeline", side_effect=RuntimeError("OCR engine timeout")):
        img_bytes = create_test_image(format="JPEG")
        files = {"file": ("test_ocr_fail.jpg", img_bytes, "image/jpeg")}

        response = client.post("/api/scans", files=files)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "needs_review"
        assert data["ocr"]["status"] == "failed"
        assert "OCR engine timeout" in data["ocr"]["error"]

        # Verify persisted status in GET
        scan_id = data["scan_id"]
        get_res = client.get(f"/api/scans/{scan_id}")
        assert get_res.status_code == 200
        assert get_res.json()["status"] == "needs_review"
