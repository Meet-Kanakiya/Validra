# Validra — System Architecture Specification

> **Single Source of Truth Reference:** Derived from [`docs/blueprints/`](./blueprints/) (`blueprint.md`, `backend-blueprint.md`, `schema-blueprint.md`).

---

## 1. System Overview & Core Principle

**Validra** is an AI-assisted packaged commodity compliance checking system designed to inspect packaged goods against requirements under India's **Legal Metrology Act, 2009** and **Legal Metrology (Packaged Commodities) Rules, 2011**.

### Core Architecture Principle

> **AI extracts and assists → Rules evaluate deterministically → Human reviews uncertain cases.**

Validra is a decision-support system, not an autonomous replacement for authorized legal judgment. Compliance decisions are evaluated deterministically by the Rule Engine, never hallucinated by an LLM.

### End-to-End Core Pipeline

```
Image → Quality Gate → Preprocessing → OCR → Field Extraction → Rule Engine → Evidence Generation → Report Generation → Dedicated Review
```

---

## 2. Five-Layer System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 1 — USER EXPERIENCE (Next.js 14+ App Router)                   │
│  Landing Pages · Scan Interface · Dedicated Review · Reports · Admin  │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 2 — ORCHESTRATION & GATEWAY (FastAPI)                          │
│  Auth Middleware · REST APIs · Async Task Queue (Celery/ARQ) · Storage │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 3 — AI UNDERSTANDING & COMPUTER VISION                         │
│  Quality Gate · OpenCV Preprocessing · PaddleOCR (PP-OCRv4) · Extract │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 4 — COMPLIANCE INTELLIGENCE                                    │
│  Deterministic Rule Engine · Legal References · Confidence Gating     │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 5 — EVIDENCE & DATA                                            │
│  PostgreSQL (Dual ORM: Prisma + SQLAlchemy) · Object Storage (S3/Supabase)
└────────────────────────────────────────────────────────────────────────┘
```

### High-Level Architecture Flow

```mermaid
flowchart TD
    USER["👤 Inspector / Admin / Supervisor"]

    subgraph FRONTEND["🖥️ Layer 1: User Experience — Next.js 14+ (M1)"]
        AUTH_FE["Auth.js / NextAuth & Nodemailer"]
        PAGES["Landing · Inspector Portal · Dedicated Review · Admin Portal"]
    end

    subgraph SEC["🔐 Security & Token Gateway"]
        JWT["Signed JWT Access Token\n(Contains user_id, role, exp)"]
    end

    subgraph BACKEND["⚙️ Layer 2: Orchestration — FastAPI (M2)"]
        AUTH_BE["FastAPI Auth Middleware\n(Cryptographic Signature, Expiry, RBAC)"]
        ORCH["Scan Orchestrator & Task Queue (Celery/ARQ)"]
        REPO_SRV["ReportLab PDF Report Service"]
        STORAGE_UTIL["Storage Gateway (S3 / Supabase)"]
    end

    subgraph AI["👁️ Layer 3: AI & Computer Vision (M3)"]
        QG["Quality Gate\n(Blur, Brightness, Glare, Resolution)"]
        PRE["OpenCV Preprocessing\n(Perspective Warp, Deskew, Denoise, Adaptive Threshold)"]
        OCR["PaddleOCR PP-OCRv4\n(Detection + Recognition + BBoxes + Confidence)"]
        IE["Structured Field Extractor\n(Regex + NLP: MRP, Qty, Dates, Mfg, Contact)"]
    end

    subgraph COMPLIANCE["⚖️ Layer 4: Compliance Intelligence (M4)"]
        RE["Deterministic Rule Engine\n(PC Rules 2011 C01–C26 Evaluator)"]
        CONF_GATE["Confidence & Status Evaluator\n(PASS / FAIL / NEEDS_REVIEW)"]
    end

    subgraph DATA["💾 Layer 5: Evidence & Data (M2 / M1)"]
        PG["PostgreSQL Database\n(Prisma: Auth & Users | SQLAlchemy: Inspections & Violations)"]
        OBJ["Object Storage\n(Original Images, Evidence Crops, PDF Reports)"]
    end

    USER --> FRONTEND
    AUTH_FE --> JWT
    FRONTEND -->|"Bearer JWT Token"| BACKEND
    AUTH_BE --> ORCH
    ORCH --> QG
    QG --> PRE
    PRE --> OCR
    OCR --> IE
    IE --> RE
    RE --> CONF_GATE
    CONF_GATE --> REPO_SRV
    ORCH --> DATA
    REPO_SRV --> OBJ
    BACKEND --> FRONTEND
```

---

## 3. Scan Orchestration Pipeline & Lifecycle

When an inspector uploads an image, the backend orchestrates the multi-stage pipeline asynchronously:

```mermaid
sequenceDiagram
    actor Officer as 👤 Inspector
    participant FE as 🖥️ Frontend (Next.js)
    participant BE as ⚙️ FastAPI Gateway
    participant Storage as 🗄️ Object Storage
    participant Queue as ⚡ Task Queue (Celery/ARQ)
    participant CV as 👁️ CV & OCR (PaddleOCR)
    participant RE as ⚖️ Rule Engine
    participant DB as 💾 PostgreSQL

    Officer->>FE: Upload package image(s) (Drag-drop / Camera)
    FE->>BE: POST /api/v1/scans (multipart/form-data)
    BE->>BE: Validate file format & size (max 10MB)
    BE->>Storage: Store original image + compute SHA-256 hash
    BE->>DB: Create Inspection record (status: "processing")
    BE-->>FE: Return { inspection_id, status: "processing" }
    BE->>Queue: Dispatch background inspection job

    Queue->>CV: Stage 1: Quality Gate evaluation
    alt Quality Gate Fails (Excessive blur, glare, illegible)
        CV-->>DB: Update status = "quality_failed", save metrics
        Queue-->>FE: Inspection status "quality_failed"
    else Quality Gate Passes
        Queue->>CV: Stage 2: OpenCV Preprocessing (warp, deskew, denoise)
        Queue->>CV: Stage 3: PaddleOCR PP-OCRv4 (detect text + bboxes)
        Queue->>CV: Stage 4: Field Extraction (MRP, Net Qty, Dates, Mfg, Contact)
        Queue->>RE: Stage 5: Evaluate against PC Rules 2011 (C01–C26)
        RE->>RE: Gating: OCR conf < 85% → Mark NEEDS_REVIEW
        Queue->>Storage: Stage 6: Crop & annotate spatial evidence bboxes
        Queue->>DB: Save extracted fields, violations, compliance score
        Queue->>DB: Update inspection status ("needs_review" or "completed")
    end

    Officer->>FE: View Dedicated Review Inspection page
    Officer->>FE: Accept / Reject / Modify findings & add remarks
    FE->>BE: POST /api/v1/inspections/{id}/finalize
    BE->>BE: Generate PDF Report (ReportLab) with SHA-256 hash & QR code
    BE->>DB: Update status = "finalized"
    BE-->>FE: Final report ready for download
```

### Inspection Status Lifecycle

| Status | Trigger / Condition | Allowed Next Actions |
|---|---|---|
| `pending` | Record created, image queued | Awaiting worker pickup |
| `processing` | Background worker processing OCR / Rules | Poll status via `GET /api/v1/scans/{id}` |
| `quality_failed` | Blur score / glare / resolution below threshold | Retry scan with clearer image |
| `completed` | All rules evaluated with high confidence (≥ 85%) | Inspector reviews & finalizes |
| `needs_review` | Low confidence (< 85%), ambiguous unit, or missing mandatory field | Mandatory human review on Dedicated Review page |
| `finalized` | Inspector accepted/modified findings, added remarks, signed off | Download PDF report, immutable audit trail |

---

## 4. Authentication, Authorization & Security Architecture

### Authentication & Token Issuance Flow

```mermaid
sequenceDiagram
    actor User as 👤 Inspector / Supervisor
    participant FE as 🖥️ Next.js Auth (Auth.js / NextAuth)
    participant Mail as 📧 Nodemailer
    participant DB as 💾 PostgreSQL (Prisma)
    participant BE as ⚙️ FastAPI Backend

    User->>FE: Inspector Registration / Login
    alt Inspector Registration
        FE->>Mail: Send email verification link
        User->>FE: Click verification link
        FE->>DB: Mark email_verified = true
    end
    User->>FE: Submit credentials (email + password)
    FE->>DB: Authenticate via Prisma user record
    FE-->>User: Issue signed JWT session token (includes user_id, role, email)

    Note over User, BE: Protected API Request (e.g. POST /api/v1/scans)
    User->>BE: HTTP Request + Header: "Authorization: Bearer <JWT>"
    BE->>BE: FastAPI Auth Middleware: verify signature, expiration & RBAC
    alt Invalid / Expired / Forbidden
        BE-->>User: 401 Unauthorized / 403 Forbidden
    else Authorized
        BE->>BE: Execute requested endpoint logic
        BE-->>User: 200 OK + payload
    end
```

### Security Principles & Rules

1. **Independent Backend Authorization**: FastAPI **never** trusts a frontend client-side authorization flag (`isAuthorized: true`). Every protected API endpoint independently validates the cryptographic JWT signature, expiration, and role permissions.
2. **Admin Provisioning**: Administrative accounts are **never created via public registration**. Admin users are provisioned exclusively through secure CLI scripts (`npm run prisma:seed` or admin CLI).
3. **Role-Based Access Control (RBAC)**:
   - `inspector`: Upload scans, view assigned inspections, review findings, finalize inspections, download reports.
   - `supervisor`: Read-only access to all inspections, inspector performance monitoring, dashboard analytics.
   - `admin`: User management, rule management (CRUD), audit logs, system configuration.
4. **Zero Hardcoded Secrets**: Secrets, DB connection strings, and JWT signing keys are managed strictly via environment variables (`.env`).
5. **Tamper-Evidence & Integrity**: SHA-256 hashes are computed for both raw uploaded images and finalized PDF reports.

---

## 5. Dedicated Review Inspection Architecture

Validra enforces a **human-in-the-loop** inspection review architecture to guarantee legal accountability:

```
┌────────────────────────────────────────────────────────────────────────┐
│ VALIDRA Inspector Portal — Inspection Review (#INS-000124)             │
├──────────────────────────────────────┬─────────────────────────────────┤
│ 📷 Product Package Evidence          │ 📋 Rule Engine Findings & Evid. │
│                                      │                                 │
│ ┌──────────────────────────────────┐ │ MRP: ₹99.00 (Inclusive of taxes)│
│ │ [BBox 1: MRP]                    │ │ Status: ✅ PASS                 │
│ │ [BBox 2: Net Qty]                │ │ Confidence: 97%                 │
│ │ [BBox 3: Mfg Date]               │ │ Rule: Rule 6(1)(e)              │
│ └──────────────────────────────────┘ │                                 │
│ Zoom: [ + ] [ - ] [ Reset ]          │ Net Quantity: 500 g             │
│ Toggle Bounding Boxes: [ ON ]        │ Status: ⚠️ NEEDS REVIEW          │
│ Highlight: [ MRP ] [ Qty ] [ Mfg ]   │ Confidence: 64%                 │
│                                      │ Rule: Rule 6(1)(a)              │
├──────────────────────────────────────┴─────────────────────────────────┤
│ Inspector Decision per Finding:                                        │
│ [ Accept ]    [ Modify Value / Status ]    [ Reject Violation ]        │
│                                                                        │
│ Inspector Remarks: [ Verified unit matches physical retail carton    ] │
│                                                                        │
│ [ 📄 Finalize & Generate Signed PDF Report ]                           │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Spatial Evidence Localization**: PaddleOCR bounding boxes (`[x1, y1, x2, y2]`) are mapped directly to interactive overlays on the package photo.
2. **Confidence-Aware Flagging**: Findings with OCR confidence `< 85%` or ambiguous text formatting are flagged as `NEEDS_REVIEW`.
3. **Audit Trail Logging**: Any modification made by the inspector (overriding a status, editing a detected value) is recorded in the `audit_logs` table with inspector ID, timestamp, and previous vs new value.

---

## 6. Database & Storage Architecture (Dual-ORM Strategy)

Validra uses **two ORMs** accessing the **same PostgreSQL database**:

| ORM | Layer | Scope & Entities |
|---|---|---|
| **Prisma** | Frontend / NextAuth | `users`, `accounts`, `sessions`, `verification_tokens`, `password_reset_tokens` |
| **SQLAlchemy 2.0 (async)** | Backend / FastAPI | `products`, `inspections`, `images`, `ocr_runs`, `ocr_text_regions`, `extracted_fields`, `rules`, `compliance_results`, `violations`, `reports`, `audit_logs` |

### Relational Entity Model

```
users (Prisma / NextAuth)
  │ 1:N
  ▼
inspections (SQLAlchemy) ────── 1:1 ────── products
  │ 1:N                            │ 1:1
  ├── images                       └── compliance_results
  ├── ocr_runs ──── 1:N ──── ocr_text_regions
  ├── extracted_fields
  ├── violations ────── N:1 ────── rules
  └── reports
```

### Storage Strategy

| Data Asset | Storage Medium | Justification |
|---|---|---|
| Relational Entities & Metadata | PostgreSQL 15+ | Relational integrity, foreign keys, ACID compliance |
| Raw OCR JSON & Quality Metrics | PostgreSQL `JSONB` | Flexible debugging, auditability, reprocessing |
| Original Uploaded Images | Object Storage (S3 / Supabase) | Binary assets kept out of RDBMS |
| Cropped Bounding Box Evidence | Object Storage | Referenced by URI path in `violations` |
| Final PDF Reports | Object Storage | Large binary output files |

---

## 7. PDF Report Generation Architecture

Compliance reports are generated using **ReportLab Platypus** with an evidentiary structure:

1. **Cover Section**: Validra emblem, Report Code (`VAL-YYYY-XXXXX`), Inspection Timestamp, Officer details, Product Overview, Overall Compliance Status Badge, Compliance Score Ring.
2. **Executive Summary**: Tabular breakdown of mandatory declarations (Field, Detected Value, Confidence %, Compliance Status, Rule Reference).
3. **Image Quality Metrics**: Blur score, glare ratio, brightness, resolution, and text presence audit.
4. **Detailed Evidentiary Findings**: Side-by-side cropped bounding boxes highlighting detected text regions on the actual package surface.
5. **Integrity & Tamper Evidence Footer**:
   - SHA-256 hash of original image.
   - SHA-256 hash of final PDF document.
   - Verification QR Code resolving to `https://validra.app/verify/{report_code}` for downstream authenticity checks.
