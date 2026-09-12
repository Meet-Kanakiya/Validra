# Validra — Backend API Blueprint

> **Owner:** Backend Team (M2)  
> **Directory:** `backend/`  
> **Tech:** FastAPI + SQLAlchemy 2.0 (Async) + Pydantic v2 + PostgreSQL + PaddleOCR  

---

## 1. Overview

The backend serves as the orchestration layer between the Next.js frontend, the Computer Vision / OCR pipeline (Team M3), the Legal Metrology Rule Engine (Team M4), and object storage. It handles authentication verification, direct API routing under `/api`, scan pipeline orchestration, database persistence, and report generation.

Refer to [blueprint.md](../blueprint.md) Section 3 & 4 for the overarching system architecture.

---

## 2. Directory Structure (Current & Target Layout)

```
backend/
├── app/
│   ├── main.py                        # FastAPI app + lifespan + CORS + /api router mount
│   │
│   ├── core/
│   │   ├── config.py                  # Pydantic Settings (ENV, DATABASE_URL, API_STR="/api", UPLOAD_DIR)
│   │   └── security.py                # JWT decode & verification
│   │
│   ├── db/
│   │   ├── base.py                    # DeclarativeBase (Base)
│   │   └── session.py                 # AsyncEngine, AsyncSessionLocal, get_db, init_db
│   │
│   ├── api/                           # Direct API routing under /api
│   │   ├── router.py                  # Aggregator router mounting all feature routers
│   │   ├── deps.py                    # get_db, get_current_user, require_role
│   │   ├── auth.py                    # POST /api/auth/verify-token
│   │   ├── scans.py                   # POST /api/scans, GET /api/scans/{id}
│   │   ├── inspections.py             # GET /api/inspections, GET /api/inspections/{id}, PATCH findings, POST finalize
│   │   ├── reports.py                 # POST /api/reports/{id}, GET /api/reports/{id}/download
│   │   ├── dashboard.py               # GET /api/dashboard
│   │   ├── users.py                   # GET /api/users/me, PATCH /api/users/me
│   │   └── admin/                     # Admin endpoints mounted under /api/admin
│   │       ├── router.py              # Admin router aggregator
│   │       ├── users.py               # Admin user management
│   │       ├── rules.py               # Admin Legal Metrology rule CRUD
│   │       ├── legal_documents.py     # Admin legal doc management
│   │       ├── inspections.py         # Admin inspection oversight
│   │       ├── audit_logs.py          # Admin audit log inspection
│   │       └── settings.py            # Admin system settings
│   │
│   ├── services/
│   │   ├── scan_orchestrator.py       # Full pipeline coordinator (Quality → Preprocess → OCR → Fields → Rules)
│   │   ├── quality_gate.py            # Laplacian blur, brightness, glare, resolution check
│   │   ├── preprocessing.py           # OpenCV perspective correction, denoise, deskew
│   │   ├── ocr/                       # Computer Vision (M3) OCR boundary
│   │   │   ├── __init__.py
│   │   │   └── ocr_main.py            # PaddleOCR integration + bbox calculation + visualization overlay
│   │   ├── field_extractor.py         # Regex + NLP extractor for MRP, FSSAI, dates, net quantity, etc.
│   │   ├── rule_engine.py             # Legal Metrology deterministic rules (C01–C26)
│   │   ├── evidence_service.py        # Crop + bbox annotation for inspection evidence
│   │   ├── report_service.py          # ReportLab PDF generator
│   │   └── email_service.py           # Notification dispatcher
│   │
│   ├── models/                        # SQLAlchemy 2.0 ORM models
│   │   ├── __init__.py
│   │   ├── base.py                    # Base import
│   │   ├── inspection.py              # Inspection & Image models (active)
│   │   ├── product.py                 # Product metadata
│   │   ├── ocr_run.py                 # OCR execution metadata + JSONB raw payload
│   │   ├── ocr_text_region.py         # Individual text bounding boxes & confidence
│   │   ├── extracted_field.py         # Structured extracted fields
│   │   ├── rule.py                    # Legal Metrology rules
│   │   ├── compliance_result.py       # Compliance outcome per inspection
│   │   ├── violation.py               # Detected violations
│   │   ├── report.py                  # Report records
│   │   └── audit_log.py               # Audit trail entries
│   │
│   ├── schemas/                       # Pydantic v2 schemas
│   │   ├── __init__.py
│   │   ├── scan.py                    # ScanUploadResponse, ScanDetailResponse, ImageMetadata
│   │   ├── inspection.py              # InspectionList, InspectionDetail
│   │   ├── ocr.py                     # OCRRegion, OCRResult, QualityMetrics
│   │   ├── compliance.py              # ComplianceField, ViolationDetail, FindingUpdate
│   │   ├── report.py                  # ReportCreate, ReportResponse
│   │   ├── user.py                    # UserProfile, UserUpdate
│   │   └── common.py                  # Pagination, APIErrorResponse
│   │
│   └── utils/
│       ├── hashing.py                 # SHA-256 image & file hashers
│       ├── storage.py                 # Object storage / filesystem file manager
│       └── errors.py                  # Standard exception handlers
│
├── uploads/                           # Local file storage for uploaded images & crops
├── tests/                             # Pytest suite
│   ├── conftest.py
│   ├── test_scans.py
│   ├── test_ocr.py
│   ├── test_inspections.py
│   └── test_db.py
│
├── requirements.txt                   # Backend dependencies
├── .env.example                       # Environment template
└── README.md
```

---

## 3. Direct API Endpoints Summary (`/api/*`)

All API routes are prefixed directly with `/api` (configured via `settings.API_STR = "/api"`). Versioning sub-paths (such as `/v1`) are avoided in the primary interface for direct alignment with the Next.js frontend and current backend router implementation.

### Public & Authentication

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/auth/verify-token` | Validate NextAuth JWT token and extract user claims | Public |

### Scans & Image Ingestion

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/scans` | Ingest image (≤ 5MB, JPEG/PNG/WebP), create DB records, dispatch OCR pipeline | Inspector |
| `GET` | `/api/scans/{scan_id}` | Retrieve scan progress, status, and preliminary OCR results | Inspector |

### Inspections & Review

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/inspections` | List inspector's inspections (paginated, filterable by status/date) | Inspector |
| `GET` | `/api/inspections/{inspection_id}` | Fetch full inspection details, images, extracted fields, and violations | Inspector |
| `PATCH` | `/api/inspections/{inspection_id}/findings/{finding_id}` | Override or verify an automated finding decision | Inspector |
| `POST` | `/api/inspections/{inspection_id}/finalize` | Finalize inspection and lock from further edits | Inspector |

### Reports & Dashboard

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/reports/{inspection_id}` | Trigger PDF report compilation | Inspector |
| `GET` | `/api/reports/{report_id}/download` | Download compiled PDF compliance certificate / report | Inspector |
| `GET` | `/api/dashboard` | Inspector metrics (scans today, violation breakdown, pending reviews) | Inspector |
| `GET` | `/api/users/me` | Current authenticated user profile | Any |
| `PATCH` | `/api/users/me` | Update current user preferences/profile | Any |

### Administration (`/api/admin/*`)

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | System-wide scan metrics, accuracy benchmarks, violation heatmaps | Admin |
| `GET` | `/api/admin/users` | List all system users with role/status filters | Admin |
| `GET` | `/api/admin/users/{id}` | Inspect user account | Admin |
| `PATCH` | `/api/admin/users/{id}` | Modify role or active status | Admin |
| `GET` | `/api/admin/rules` | List all 26 Legal Metrology compliance rules | Admin |
| `POST` | `/api/admin/rules` | Create or update rule logic and thresholds | Admin |
| `PATCH` | `/api/admin/rules/{id}` | Toggle active status or adjust parameters of a rule | Admin |
| `DELETE` | `/api/admin/rules/{id}` | Deprecate rule version | Admin |
| `GET` | `/api/admin/audit-logs` | Query tamper-evident audit logs | Admin |
| `GET` | `/api/admin/settings` | Query system settings | Admin |
| `PATCH` | `/api/admin/settings` | Update system settings | Admin |

---

## 4. OCR & Computer Vision Pipeline Architecture

The OCR subsystem adheres to a strict separation of concerns across 5 modular stages:

```
                      Uploaded Image (via POST /api/scans)
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Stage 1: Quality Gate      │
                      │  Blur (Laplacian variance)    │
                      │  Brightness & Overexposure    │
                      │  Resolution & Edge Density    │
                      └───────────────┬───────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │ PASS                    │ FAIL
                         ▼                         ▼
            ┌───────────────────────────┐     Mark status: "quality_failed"
            │ Stage 2: Preprocessing    │     Return quality advisory to user
            │ Perspective correction    │
            │ Quadrilateral warp        │
            │ Deskew & Adaptive Thresh  │
            └─────────────┬─────────────┘
                          │
                          ▼
            ┌───────────────────────────┐
            │ Stage 3: PaddleOCR Engine │
            │ Text Detection            │
            │ Text Recognition          │
            │ Bounding Boxes & Scores   │
            └─────────────┬─────────────┘
                          │
                          ▼
            ┌───────────────────────────┐
            │ Stage 4: Field Extractor  │
            │ Regex & NLP Token Matching│
            │ MRP, FSSAI, Net Qty, Dates│
            │ Bbox Height / Font Size   │
            └─────────────┬─────────────┘
                          │
                          ▼
            ┌───────────────────────────┐
            │ Stage 5: Rule Engine      │
            │ Legal Metrology C01–C26   │
            │ Mandatory fields present? │
            │ Min font size compliant?  │
            └─────────────┬─────────────┘
                          │
                          ▼
             PostgreSQL Relational + JSONB
```

### 4.1 PaddleOCR Engine Design

- **Engine Choice**: **PaddleOCR (PP-OCRv4)**. Selected over alternatives (such as EasyOCR) due to:
  - 88.7% benchmark accuracy on noisy, curved, and rotated text common in mobile packaging photography.
  - Built-in text detection polygons and layout awareness.
  - Manageable RAM footprint (~950MB vs ~1.8GB).
- **Core Responsibility**: PaddleOCR answers only *"What text is present, and where is it located on the package?"*. It does not evaluate legal compliance or parse fields.
- **Initialization & Tuning**:
  ```python
  from paddleocr import PaddleOCR

  # Unnecessary transformations are disabled initially because upstream Preprocessing handles them:
  ocr = PaddleOCR(
      use_doc_orientation_classify=False,
      use_doc_unwarping=False,
      use_textline_orientation=False,
      engine="paddle"
  )
  ```
- **Bounding Box & Provenance Extraction**:
  - Polygon: 4-point coordinates `[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]`.
  - Axis-Aligned Bounding Box: `[x_min, y_min, x_max, y_max]`.
  - Relative Font Size: Derived directly from `bbox_height_px = y_max - y_min` (mobile photos lack embedded DPI, making pixel height the most reliable metric for Legal Metrology minimum font height rules).
  - Confidence: Float score `[0.0 - 1.0]`. Regions with score below threshold (e.g. `< 0.85`) flag the scan for manual inspector review.
- **Bounding Box Visualization**:
  - Automatically draws bounding box overlays with confidence labels onto preview images to present visual evidence to inspectors.

---

## 5. Database Storage Architecture: Relational + JSONB

Validra does not store image binaries inside PostgreSQL. Images are persisted to the filesystem (`uploads/`) or cloud object storage (S3 / Supabase Storage), with paths, hashes, and metadata stored in the database.

To balance query performance with complete provenance, the database uses a **hybrid Relational + JSONB** design:

### 5.1 Storage Distribution

```
PostgreSQL Database
  │
  ├── Relational Columns (Fast indexing, filtering, search, joins)
  │     ├── inspections (id, status, compliance_score, timestamps)
  │     ├── images (id, type, storage_path, mime_type, image_hash)
  │     ├── ocr_runs (id, inspection_id, model_name, processing_time_ms)
  │     ├── ocr_text_regions (id, text, confidence, bbox, bbox_height)
  │     └── compliance_fields / violations (id, field_name, value, status)
  │
  └── JSONB Columns (Auditing, reproduction, schema evolution)
        └── ocr_runs.raw_result (Complete unaltered PaddleOCR output)
```

### 5.2 Why Both Relational and JSONB?

1. **Auditability & Reprocessing**: If an extraction regex or rule parser is updated months later, storing the `raw_result` in `JSONB` alongside bounding boxes allows re-running extraction without re-uploading or re-running OCR inference.
2. **Interactive UI**: Relational `ocr_text_regions` and `compliance_fields` enable instantaneous frontend filtering, highlighting of specific fields on the image, and fast dashboard aggregations.
3. **Traceability (Provenance)**: Every compliance violation directly links to the bounding box coordinate and raw OCR text that triggered it.

---

## 6. Scan Orchestration Contract

### 6.1 Upload & Ingestion (`POST /api/scans`)

- **Input**: `multipart/form-data` with `file: UploadFile`.
- **Validation**:
  - Maximum upload size: `5MB`.
  - Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`.
  - Magic byte MIME verification: `image/jpeg`, `image/png`, `image/webp`, `image/bmp`.
  - Checksum: SHA-256 computed on stream for deduplication.
- **Persistence**: File written atomically to `uploads/original_<uuid>.<ext>`, records created in `inspections` (status: `"processing"`) and `images` (type: `"original"`).
- **OCR Dispatch**: Dispatched to `OCRPipeline` with fault isolation. If OCR fails or times out, the inspection status transitions safely to `"needs_review"` without failing the HTTP upload request.

### 6.2 Standard Pipeline Output Schema

```json
{
  "quality": {
    "passed": true,
    "blur_score": 182.4,
    "brightness": 126.2,
    "glare_ratio": 0.012,
    "resolution": [3024, 4032],
    "text_region_detected": true
  },
  "ocr": {
    "engine": "paddleocr",
    "model_version": "PP-OCRv4",
    "processing_time_ms": 1180,
    "annotated_image_path": "uploads/annotated_9b1deb4d_label.jpg",
    "regions": [
      {
        "text": "MRP ₹99.00 (Incl. of all taxes)",
        "confidence": 0.98,
        "bbox": [120, 340, 420, 390],
        "bbox_height_px": 50,
        "polygon": [[120, 340], [420, 340], [420, 390], [120, 390]]
      }
    ]
  },
  "fields": {
    "mrp": {
      "value": "99.00",
      "currency": "INR",
      "confidence": 0.98,
      "bbox": [120, 340, 420, 390],
      "bbox_height_px": 50,
      "status": "found"
    },
    "fssai": {
      "value": "12345678901234",
      "confidence": 0.95,
      "bbox_height_px": 38,
      "status": "found"
    },
    "net_quantity": {
      "value": "500 g",
      "confidence": 0.96,
      "bbox_height_px": 42,
      "status": "found"
    }
  }
}
```

---

## 7. Error Handling & Pagination Contracts

### Error Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File exceeds maximum allowed size of 5MB",
    "details": {}
  }
}
```

| HTTP Code | Error Code | Scenario |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Unsupported file extension, invalid MIME type, malformed payload |
| `401` | `UNAUTHORIZED` | Expired or missing Bearer token |
| `403` | `FORBIDDEN` | Insufficient role permissions |
| `404` | `NOT_FOUND` | Scan or resource not found |
| `413` | `FILE_TOO_LARGE` | Uploaded image exceeds 5MB limit |
| `422` | `UNPROCESSABLE` | Valid request structure but corrupted image payload |
| `500` | `INTERNAL_ERROR` | Uncaught server or database failure |

### Pagination Envelope

All collection endpoints (`GET /api/inspections`, `GET /api/admin/users`, etc.) adhere to:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 120,
    "total_pages": 6
  }
}
```

Query parameters: `?page=1&per_page=20&sort=-created_at&search=...&status=...`
