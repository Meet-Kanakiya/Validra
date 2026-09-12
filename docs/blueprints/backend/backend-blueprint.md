# Validra — Backend API Blueprint

> **Owner:** Backend Team (M2)
> **Directory:** `backend/`
> **Tech:** FastAPI + SQLAlchemy + Pydantic + Alembic

---

## 1. Overview

The backend serves as the orchestration layer between the Next.js frontend and the AI/CV + Rule Engine + RAG services. It handles authentication verification, API routing, scan pipeline orchestration, database operations, and report generation.

Refer to [blueprint.md](../blueprint.md) Section 3 for the full backend architecture.

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── main.py                        # FastAPI app + lifespan + CORS
│   ├── config.py                      # Pydantic Settings from .env
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── router.py              # v1 API router aggregator
│   │   │   ├── auth.py                # JWT token verification endpoint
│   │   │   ├── scans.py               # POST /scans, GET /scans/{id}
│   │   │   ├── inspections.py         # GET /inspections, GET /inspections/{id}, PATCH findings, POST finalize
│   │   │   ├── reports.py             # POST /reports/{id}, GET /reports/{id}/download
│   │   │   ├── dashboard.py           # GET /dashboard
│   │   │   └── admin/
│   │   │       ├── users.py           # Admin user CRUD
│   │   │       ├── rules.py           # Admin rule CRUD
│   │   │       ├── legal_documents.py # Admin legal doc management
│   │   │       ├── inspections.py     # Admin: all inspections (read-only)
│   │   │       ├── audit_logs.py      # Admin: audit log queries
│   │   │       ├── settings.py        # Admin: system settings
│   │   │       └── router.py          # Admin router aggregator
│   │   └── deps.py                    # get_db, get_current_user, require_role
│   │
│   ├── services/
│   │   ├── scan_orchestrator.py       # Full pipeline: quality → OCR → extract → rules → RAG
│   │   ├── quality_gate.py            # Image quality assessment
│   │   ├── preprocessing.py           # OpenCV preprocessing
│   │   ├── ocr_service.py             # PaddleOCR wrapper
│   │   ├── field_extractor.py         # Regex/NLP field extraction
│   │   ├── rule_engine.py             # Deterministic compliance evaluation
│   │   ├── rag_service.py             # Vector search + LLM explanation
│   │   ├── evidence_service.py        # Crop + annotate bounding boxes
│   │   ├── report_service.py          # ReportLab PDF generation
│   │   └── email_service.py           # Email sending (if needed from backend)
│   │
│   ├── models/                        # SQLAlchemy ORM models
│   │   ├── base.py                    # DeclarativeBase
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── inspection.py
│   │   ├── image.py
│   │   ├── ocr_run.py
│   │   ├── ocr_text_region.py
│   │   ├── extracted_field.py
│   │   ├── rule.py
│   │   ├── compliance_result.py
│   │   ├── violation.py
│   │   ├── report.py
│   │   ├── legal_document.py
│   │   └── audit_log.py
│   │
│   ├── schemas/                       # Pydantic v2 request/response
│   │   ├── scan.py                    # ScanCreate, ScanStatus, ScanResponse
│   │   ├── inspection.py              # InspectionList, InspectionDetail
│   │   ├── compliance.py              # ComplianceResult, Finding
│   │   ├── report.py                  # ReportCreate, ReportResponse
│   │   ├── user.py                    # UserCreate, UserResponse
│   │   ├── rule.py                    # RuleCreate, RuleUpdate, RuleResponse
│   │   ├── dashboard.py              # DashboardStats
│   │   ├── audit_log.py              # AuditLogEntry
│   │   └── common.py                  # Pagination, ErrorResponse, SuccessResponse
│   │
│   ├── reports/                       # PDF report generation
│   │   ├── generator.py
│   │   ├── styles.py
│   │   ├── sections/
│   │   │   ├── cover.py
│   │   │   ├── summary.py
│   │   │   ├── quality.py
│   │   │   ├── fields.py
│   │   │   └── evidence.py
│   │   └── assets/
│   │       └── validra_logo.png
│   │
│   └── utils/
│       ├── auth.py                    # JWT decode, verify, role check
│       ├── storage.py                 # S3/Supabase upload/download
│       ├── hashing.py                 # SHA-256 for images/reports
│       └── errors.py                  # Custom exception classes
│
├── alembic/                           # Database migrations
│   ├── env.py
│   └── versions/
│
├── tests/
│   ├── test_scans.py
│   ├── test_inspections.py
│   ├── test_rules.py
│   └── conftest.py
│
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## 3. API Endpoints Summary

### Public

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/verify-token` | Verify JWT validity |

### Inspector (role: inspector)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/scans` | Upload image, start scan |
| `GET` | `/api/v1/scans/{id}` | Get scan processing status |
| `GET` | `/api/v1/inspections` | List own inspections (paginated) |
| `GET` | `/api/v1/inspections/{id}` | Get inspection detail |
| `PATCH` | `/api/v1/inspections/{id}/findings/{fid}` | Update finding decision |
| `POST` | `/api/v1/inspections/{id}/finalize` | Finalize inspection |
| `POST` | `/api/v1/reports/{inspection_id}` | Generate PDF report |
| `GET` | `/api/v1/reports/{id}/download` | Download report file |
| `GET` | `/api/v1/dashboard` | Inspector dashboard stats |
| `GET` | `/api/v1/users/me` | Get own profile |
| `PATCH` | `/api/v1/users/me` | Update own profile |

### Admin (role: admin, supervisor)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | System-wide stats |
| `GET` | `/api/v1/admin/users` | List all users |
| `GET` | `/api/v1/admin/users/{id}` | User detail |
| `PATCH` | `/api/v1/admin/users/{id}` | Update role/status |
| `POST` | `/api/v1/admin/users/invite` | Send invite email |
| `GET` | `/api/v1/admin/rules` | List rules |
| `POST` | `/api/v1/admin/rules` | Create rule |
| `PATCH` | `/api/v1/admin/rules/{id}` | Update rule |
| `DELETE` | `/api/v1/admin/rules/{id}` | Delete rule |
| `GET` | `/api/v1/admin/legal-documents` | List legal docs |
| `POST` | `/api/v1/admin/legal-documents` | Upload legal doc |
| `DELETE` | `/api/v1/admin/legal-documents/{id}` | Delete legal doc |
| `GET` | `/api/v1/admin/inspections` | All inspections |
| `GET` | `/api/v1/admin/inspections/{id}` | Inspection detail |
| `GET` | `/api/v1/admin/audit-logs` | Audit log list |
| `GET` | `/api/v1/admin/settings` | System settings |
| `PATCH` | `/api/v1/admin/settings` | Update settings |

---

## 4. Scan Orchestration Flow

```
POST /api/v1/scans
    │
    ├── Validate: auth, file type/size
    ├── Upload image → Object Storage
    ├── Create inspection record (status: "processing")
    ├── Dispatch background task:
    │      │
    │      ├── quality_gate.check(image)
    │      │      ├── FAIL → status: "quality_failed"
    │      │      └── PASS → continue
    │      │
    │      ├── preprocessing.process(image)
    │      ├── ocr_service.extract(processed_image)
    │      ├── field_extractor.extract(ocr_result)
    │      ├── rule_engine.evaluate(extracted_fields)
    │      ├── rag_service.explain(findings)
    │      ├── evidence_service.generate(image, findings)
    │      ├── Save all results → DB
    │      └── status: "completed"
    │
    └── Return: { inspection_id, status: "processing" }
```

---

## 5. Error Response Contract

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

| HTTP Code | Error Code | Usage |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid request body/params |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 403 | `FORBIDDEN` | Insufficient role/permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 422 | `UNPROCESSABLE` | Valid request but cannot process |
| 500 | `INTERNAL_ERROR` | Server error |

---

## 6. Pagination Contract

All list endpoints return:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 248,
    "total_pages": 13
  }
}
```

Query params: `?page=1&per_page=20&sort=-created_at&search=query&status=filter`
