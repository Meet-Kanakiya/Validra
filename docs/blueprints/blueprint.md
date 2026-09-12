# Validra — System Blueprint

> Consolidated design reference for Frontend, Backend, ML/CV, Rule Engine, RAG, Database, and Report Generation.
> Derived from team research, Legal Metrology (Packaged Commodities) Rules 2011 analysis, and existing architecture docs.

---

## Table of Contents

- [1. System Overview](#1-system-overview)
- [2. Frontend Design](#2-frontend-design)
- [3. Backend Design](#3-backend-design)
- [4. ML / Computer Vision Pipeline](#4-ml--computer-vision-pipeline)
- [5. Rule Engine Design](#5-rule-engine-design)
- [6. RAG & Legal Intelligence](#6-rag--legal-intelligence)
- [7. Database Design](#7-database-design)
- [8. Report Generation](#8-report-generation)
- [9. API Contract Summary](#9-api-contract-summary)
- [10. Security Architecture](#10-security-architecture)
- [11. Team Ownership Matrix](#11-team-ownership-matrix)
- [12. Development Phases](#12-development-phases)

---

## 1. System Overview

### 1.1 Core Pipeline

```
Image → Quality Gate → Preprocessing → OCR → Field Extraction → Rule Engine → RAG → Evidence → Report → Dashboard
```

### 1.2 Architecture Layers

```
┌───────────────────────────────────────────────┐
│  Layer 1 — USER EXPERIENCE (Next.js)          │
│  Scan · Dashboard · Review · Reports · Admin  │
├───────────────────────────────────────────────┤
│  Layer 2 — ORCHESTRATION (FastAPI)            │
│  Auth Middleware · APIs · Task Queue · DB Ops │
├───────────────────────────────────────────────┤
│  Layer 3 — AI UNDERSTANDING                   │
│  Quality Gate · OpenCV · PaddleOCR · Extract  │
├───────────────────────────────────────────────┤
│  Layer 4 — COMPLIANCE INTELLIGENCE            │
│  Deterministic Rule Engine · RAG · Citations  │
├───────────────────────────────────────────────┤
│  Layer 5 — EVIDENCE & DATA                    │
│  PostgreSQL · Object Storage · Vector DB      │
└───────────────────────────────────────────────┘
```

### 1.3 Core Principle

**AI extracts and assists → Rules evaluate → RAG explains and cites → Human reviews uncertain cases.**

Validra is a decision-support system, not a replacement for authorized legal judgment.

### 1.4 User Personas

| Persona | Primary Purpose | Key Workflows |
|---|---|---|
| **Inspector** | Conduct field inspections | Scan → Review → Finalize → Report |
| **Supervisor/Controller** | Monitor & review | Dashboard → Analytics → Pending Reviews |
| **Admin** | System management | Users · Rules · Legal Docs · Audit Logs |

---

## 2. Frontend Design

### 2.1 Technology Stack

| Component | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Auth.js / NextAuth + Nodemailer |
| State | Server Components default, React Query for server state |
| Forms | React Hook Form + Zod validation |

### 2.2 Route Map

| Area | Routes | Description |
|---|---|---|
| **Public** | `/` `/about` `/features` `/how-it-works` `/contact` `/faq` | Landing, marketing, SEO-optimized |
| **Auth** | `/login` `/register` `/verify-email` `/forgot-password` | Auth flows via NextAuth |
| **Inspector** | `/dashboard` `/scan/new` `/scan/[id]/processing` `/scan/[id]/review` `/inspections` `/inspections/[id]` `/reports` `/reports/[id]` | Core inspection workflow |
| **Admin** | `/admin/dashboard` `/admin/users` `/admin/rules` `/admin/legal-documents` `/admin/audit-logs` `/admin/settings` | Administration portal |
| **Common** | `/profile` `/notifications` `/help` `/404` `/403` | Shared pages |

### 2.3 Component Architecture

Build shared components **before** pages:

```
AppShell
├── Sidebar / Navigation
├── Header
├── PageHeader
├── DataTable (sortable, filterable, paginated)
├── StatusBadge (COMPLIANT / VIOLATION / NEEDS_REVIEW)
├── ConfidenceIndicator (progress bar + percentage)
├── EvidenceViewer (image + bounding box overlay)
├── FindingCard (violation details + evidence + legal ref)
├── ComplianceScoreRing
├── EmptyState
├── LoadingState / Skeleton
├── ErrorState
├── Toast / Notification
└── ConfirmationDialog
```

### 2.4 Inspection UX — Highest Priority

The core flow that must receive the most design effort:

```
1. Upload / Capture Images (drag-drop, camera, multi-image)
   ↓
2. Upload Progress Bar
   ↓
3. Processing Status (Queued → OCR → Extracting → Validating → RAG)
   ↓
4. Review Inspection Page
   ├── Extracted Fields Table (field, value, confidence, evidence)
   ├── Evidence Viewer (original image + bounding boxes)
   ├── Findings Panel (per-finding: status, severity, rule, legal ref)
   ├── Inspector Actions (Accept / Reject / Modify per finding)
   ├── Remarks / Notes Input
   └── Finalize Inspection
   ↓
5. Generate / Download Report (PDF)
```

### 2.5 Evidence-First Display Pattern

Every finding must show:

```
┌─────────────────────────────────────────────┐
│  ⚠️ POTENTIAL VIOLATION                      │
│                                             │
│  Missing mandatory declaration              │
│  Field: Consumer Complaint Contact          │
│  Severity: HIGH                             │
│  Confidence: 94%                            │
│                                             │
│  📷 Evidence: [cropped image region]        │
│  📍 Location: bounding box on original      │
│  📖 Legal Ref: Rule 6(2), PC Rules 2011    │
│                                             │
│  Inspector Decision: [Accept] [Reject] [Modify] │
│  Remarks: [_________________________]       │
└─────────────────────────────────────────────┘
```

### 2.6 Design System Tokens

Define before development begins:

- **Compliance Colors**: `COMPLIANT=#00C853` `VIOLATION=#FF1744` `NEEDS_REVIEW=#FFAB00` `NOT_APPLICABLE=#9E9E9E`
- **Confidence Thresholds**: `HIGH ≥ 85%` `MEDIUM 60–84%` `LOW < 60%`
- **Typography**: Inter / system font, scale: 12/14/16/20/24/32px
- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- **Border Radius**: 4px (inputs), 8px (cards), 12px (modals), full (badges)
- **Shadows**: sm/md/lg/xl elevation tokens

### 2.7 State Matrix

Every page must design for all states:

| State | UI Treatment |
|---|---|
| Loading | Skeleton / spinner with status text |
| Success | Data display with actions |
| Empty | Illustration + CTA |
| Error | Error message + retry action |
| Unauthorized | Redirect to login or 403 page |
| Processing | Multi-step progress indicator |
| Partial failure | Show successful results + error banner for failures |

### 2.8 Performance Rules

- Server Components by default; `"use client"` only for interactivity
- Dynamic imports for heavy components (EvidenceViewer, charts)
- Optimize evidence images (WebP, lazy loading, responsive srcset)
- Pagination for inspection history (not infinite scroll for auditability)
- Skeletons instead of blocking page loads
- No hardcoded API URLs in components — use environment config

### 2.9 Functional Requirements Summary

| ID | Requirement |
|---|---|
| FR-01 | Register, login, logout, session management |
| FR-02 | Role-based UI (Inspector vs Admin) |
| FR-03 | Upload/capture product images |
| FR-04 | Client-side file type/size validation |
| FR-05 | Upload progress + processing status display |
| FR-06 | Display OCR/extracted fields with confidence |
| FR-07 | Display compliance status (COMPLIANT / VIOLATION / NEEDS_REVIEW) |
| FR-08 | Display findings with severity, confidence, evidence |
| FR-09 | Evidence image viewer with bounding box overlay |
| FR-10 | Display applicable legal references per finding |
| FR-11 | Inspector: Accept/Reject/Modify findings |
| FR-12 | Inspector: Add remarks/notes |
| FR-13 | Save/finalize inspection |
| FR-14 | View inspection history |
| FR-15 | Search, filter, sort, paginate inspections |
| FR-16 | Generate/view/download PDF reports |
| FR-17 | Admin: manage users, rules, legal docs |
| FR-18 | Admin: view audit logs |
| FR-19 | Responsive: desktop, tablet, mobile |
| FR-20 | Notifications/toasts for actions |

---

## 3. Backend Design

### 3.1 Technology Stack

| Component | Technology |
|---|---|
| Framework | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.0 (async) |
| Schemas | Pydantic v2 |
| Task Queue | Celery / ARQ (async background processing) |
| Auth Middleware | JWT verification (signature + expiry + RBAC) |
| File Storage | Supabase Storage / S3-compatible |
| PDF Generation | ReportLab (Platypus) |
| Migrations | Alembic |

### 3.2 Directory Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app + lifespan
│   ├── config.py                  # Settings from environment
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── scans.py
│   │   │   ├── inspections.py
│   │   │   ├── reports.py
│   │   │   ├── dashboard.py
│   │   │   ├── admin/
│   │   │   │   ├── users.py
│   │   │   │   ├── rules.py
│   │   │   │   └── audit_logs.py
│   │   │   └── router.py
│   │   └── deps.py                # Dependency injection (auth, db)
│   ├── services/
│   │   ├── scan_orchestrator.py   # Pipeline orchestration
│   │   ├── quality_gate.py
│   │   ├── preprocessing.py
│   │   ├── ocr_service.py         # PaddleOCR wrapper
│   │   ├── field_extractor.py
│   │   ├── rule_engine.py
│   │   ├── rag_service.py
│   │   ├── evidence_service.py    # Crop + annotate
│   │   └── report_service.py      # PDF generation
│   ├── models/                    # SQLAlchemy models
│   │   ├── user.py
│   │   ├── inspection.py
│   │   ├── product.py
│   │   ├── image.py
│   │   ├── extracted_field.py
│   │   ├── compliance_result.py
│   │   ├── violation.py
│   │   ├── rule.py
│   │   ├── report.py
│   │   └── audit_log.py
│   ├── schemas/                   # Pydantic request/response
│   │   ├── scan.py
│   │   ├── inspection.py
│   │   ├── compliance.py
│   │   ├── report.py
│   │   └── common.py
│   ├── reports/                   # PDF report sections
│   │   ├── generator.py
│   │   ├── styles.py
│   │   ├── sections/
│   │   │   ├── cover.py
│   │   │   ├── summary.py
│   │   │   ├── quality.py
│   │   │   ├── fields.py
│   │   │   └── evidence.py
│   │   └── assets/
│   └── utils/
│       ├── auth.py
│       ├── storage.py
│       └── errors.py
├── alembic/                       # DB migrations
├── tests/
└── requirements.txt
```

### 3.3 Scan Orchestration Pipeline

```
POST /api/v1/scans (multipart image upload)
    │
    ├── 1. Validate image (type, size)
    ├── 2. Store original to Object Storage
    ├── 3. Create Inspection record (status: PROCESSING)
    ├── 4. Dispatch to background task:
    │      │
    │      ├── Quality Gate (blur, brightness, glare, resolution)
    │      │      ├── FAIL → status: QUALITY_FAILED
    │      │      └── PASS → continue
    │      │
    │      ├── OpenCV Preprocessing
    │      │      └── perspective, deskew, denoise, threshold, upscale
    │      │
    │      ├── PaddleOCR
    │      │      └── text + bounding boxes + confidence
    │      │
    │      ├── Field Extraction
    │      │      └── MRP, Net Qty, Manufacturer, Packer, Dates, Contact
    │      │
    │      ├── Rule Engine Evaluation
    │      │      └── per-field compliance check
    │      │
    │      ├── RAG Legal Context Retrieval
    │      │      └── citations + explanations for findings
    │      │
    │      ├── Evidence Generation
    │      │      └── crop + annotate bounding boxes
    │      │
    │      └── Store results → DB
    │
    └── Return: { inspection_id, status: "processing" }
```

### 3.4 Error Handling Contract

All API errors use a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Image file size exceeds 10MB limit",
    "details": { "max_size_mb": 10, "actual_size_mb": 12.4 }
  }
}
```

Standard HTTP codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `422` unprocessable, `500` internal.

---

## 4. ML / Computer Vision Pipeline

### 4.1 Pipeline Architecture

```
Product Image
     │
     ▼
┌─────────────────┐
│  QUALITY GATE   │  Module: cv/quality_gate.py
│                 │
│  blur_score     │  Laplacian variance > threshold
│  brightness     │  mean pixel value in range
│  glare_ratio    │  overexposed pixel % < threshold
│  resolution     │  min width/height
│  text_presence  │  edge density check
└────────┬────────┘
         │ PASS / REJECT
         ▼
┌─────────────────┐
│ PREPROCESSING   │  Module: cv/preprocessing.py
│                 │
│  Perspective    │  find label quad → warp front-on
│  Deskew         │  Hough transform rotation
│  Denoise        │  fastNlMeansDenoising
│  Threshold      │  adaptive thresholding
│  Upscale        │  resize if too small
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PADDLEOCR     │  Module: cv/ocr_engine.py
│                 │
│  Text Detection │  PP-OCRv4 detection model
│  Recognition    │  PP-OCRv4 recognition model
│                 │
│  Output per region:
│    text, confidence, bbox (polygon)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ FIELD EXTRACTION│  Module: cv/field_extractor.py
│                 │
│  Regex/NLP      │  Pattern matching for legal fields
│  Role Classify  │  manufacturer vs packer vs importer
│  Date Parsing   │  MFG/EXP/PKD date formats
│  Unit Parsing   │  quantity value + unit separation
│  Spatial Group  │  group nearby text blocks
└─────────────────┘
```

### 4.2 OCR Engine: PaddleOCR

Selected over EasyOCR because:

| Criteria | PaddleOCR | EasyOCR |
|---|---|---|
| Noisy/curved text accuracy | 88.7% benchmark | Lower on real photos |
| Built-in layout analysis | Yes | No |
| RAM footprint | ~950 MB | ~1.8 GB |
| Best for | Form-like product labels | Plain-text documents |

Configuration:

```python
from paddleocr import PaddleOCR

ocr = PaddleOCR(
    use_doc_orientation_classify=False,  # our preprocessing handles this
    use_doc_unwarping=False,
    use_textline_orientation=False,
    engine="paddle"
)
```

### 4.3 OCR Output Schema (CV → Backend Contract)

Every OCR result must include provenance for evidence:

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
    "processing_time_ms": 1240,
    "regions": [
      {
        "text": "MRP ₹99",
        "confidence": 0.97,
        "bbox": [120, 340, 420, 390],
        "bbox_height_px": 50
      }
    ]
  },
  "fields": {
    "mrp": {
      "value": 99,
      "currency": "INR",
      "raw_text": "MRP ₹99",
      "confidence": 0.97,
      "bbox": [120, 340, 420, 390],
      "bbox_height_px": 50,
      "status": "found"
    },
    "net_quantity": {
      "value": 500,
      "unit": "g",
      "measurement_type": "mass",
      "raw_text": "Net Qty 500 g",
      "confidence": 0.94,
      "status": "found"
    },
    "manufacturer": {
      "name": "ABC Foods Pvt Ltd",
      "address": "Ahmedabad, Gujarat",
      "role": "manufacturer",
      "confidence": 0.91,
      "status": "found"
    },
    "packer": null,
    "importer": null,
    "manufacturing_date": {
      "value": "2026-06",
      "type": "manufacturing_date",
      "raw_text": "Mfg: June 2026",
      "confidence": 0.89,
      "status": "found"
    },
    "consumer_contact": {
      "name": "ABC Foods Pvt Ltd",
      "phone": "18001234567",
      "email": "care@abc.com",
      "address": "Ahmedabad, Gujarat",
      "confidence": 0.86,
      "status": "found"
    },
    "commodity_name": {
      "value": "Shampoo",
      "raw_text": "Shampoo",
      "confidence": 0.92,
      "status": "found"
    }
  }
}
```

### 4.4 Field Extraction Patterns

Target patterns for regex + NLP extraction:

| Field | Patterns to Recognize |
|---|---|
| MRP | `MRP`, `M.R.P.`, `Max Retail Price`, `Maximum Retail Price`, `Rs.`, `₹` |
| Net Quantity | `Net Qty`, `Net Weight`, `Net Wt`, `Net Content`, `N.W.`, value + unit |
| Manufacturer | `Manufactured by`, `Mfg by`, `Mfd by`, company name following |
| Packer | `Packed by`, `Packaged by`, `Pkd by` |
| Importer | `Imported by`, `Importer` |
| Dates | `Mfg:`, `MFD:`, `Packed:`, `PKD:`, `Exp:`, `Best Before`, `Use By` |
| FSSAI | `FSSAI`, `Lic No`, 14-digit number pattern |
| Consumer Care | `Consumer Care`, `Customer Care`, `Helpline`, `Toll Free`, phone/email patterns |

### 4.5 Critical Design Constraints

1. **OCR ≠ Compliance**: OCR detects text; Rule Engine evaluates compliance. Never mix.
2. **Confidence is mandatory**: Every extracted field must carry a confidence score.
3. **Bounding boxes preserved**: Spatial data must flow from OCR → extraction → evidence → report.
4. **Provenance chain**: Store `raw_text`, `extraction_rule`, `model_version` for every field.
5. **Font size limitation**: Pixel height is the honest signal; claiming physical mm requires a reference scale.

---

## 5. Rule Engine Design

### 5.1 Architecture Principle

> **Don't build Validra as an OCR checker. Build it as a rule engine whose input happens to come from OCR + computer vision.**

The Rule Engine:
- Receives structured JSON from Field Extraction
- Never reads images or performs OCR
- Makes deterministic compliance decisions
- Outputs structured findings with rule references

### 5.2 Rule Schema

Every rule stored in the `rules` table:

```json
{
  "rule_id": "PC-MRP-001",
  "rule_code": "RULE_6_1_E",
  "version": "2011-v1",
  "field": "mrp",
  "category": "mandatory_declaration",
  "applicable_package_type": ["retail"],
  "applicable_product_category": ["all"],
  "condition": "field_present",
  "validation_logic": "mrp.value IS NOT NULL AND mrp.currency == 'INR'",
  "required": true,
  "severity": "HIGH",
  "legal_reference": "Rule 6(1)(e), Legal Metrology (Packaged Commodities) Rules, 2011",
  "description": "Every retail package must declare the Maximum Retail Price inclusive of all taxes",
  "effective_from": "2011-01-01",
  "effective_until": null,
  "exemptions": ["packages ≤10g/10ml per Rule 26"]
}
```

### 5.3 Compliance Checks Derived from Rules 2011

| ID | Check | Rules | CV-Verifiable? |
|---|---|---|---|
| C01 | Package applicability / exemption check | Rule 3, 26 | Partially |
| C02 | Manufacturer name present | Rule 6, 10 | ✅ |
| C03 | Manufacturer address present | Rule 6, 10 | ✅ |
| C04 | Packer name/address (if different) | Rule 6, 10 | ✅ |
| C05 | Importer name/address (if imported) | Rule 6, 10 | ✅ |
| C06 | Commodity common/generic name | Rule 6(1)(b) | ✅ |
| C07 | Multiple-product identification | Rule 6(1)(b) | ✅ |
| C08 | Net quantity declaration | Rule 6, 11 | ✅ |
| C09 | Correct quantity unit for commodity type | Rule 12, 13 | ✅ |
| C10 | SI-unit compliance (no dozen/gross) | Rule 13 | ✅ |
| C11 | Manufacturing/packing/import month+year | Rule 6(1)(d) | ✅ |
| C12 | MRP declaration present | Rule 6(1)(e) | ✅ |
| C13 | MRP inclusive of taxes statement | Rule 6(1)(e) | ✅ |
| C14 | Dimensions where applicable | Rule 6(1)(f), 14-17 | ✅ |
| C15 | Consumer complaint contact info | Rule 6(2) | ✅ |
| C16 | Declaration on Principal Display Panel | Rule 7, 8 | Partially |
| C17 | Quantity numeral minimum size | Rule 7 | ⚠️ Relative only |
| C18 | Letter height minimum | Rule 7 | ⚠️ Relative only |
| C19 | Quantity declaration clear space | Rule 8 | Partially |
| C20 | Legibility / prominence | Rule 9 | Partially |
| C21 | MRP/net quantity contrast | Rule 9 | ✅ (contrast score) |
| C22 | Language (Hindi or English required) | Rule 9 | ✅ |
| C23 | No misleading quantity wording | Rule 12 | ✅ |
| C24 | Standard package quantity compliance | Rule 5 + Second Schedule | ✅ with category |
| C25 | Sticker does not cover original MRP | Rule 6(3) | ⚠️ Advanced CV |
| C26 | Deceptive packaging suspicion | Rule 23 | ⚠️ → NEEDS_REVIEW |

### 5.4 Rule Evaluation Pipeline

```
Extracted Product JSON
        ↓
┌──────────────────┐
│ APPLICABILITY    │  Is this a retail package? Exempt?
│ ENGINE           │  Package type classification
└────────┬─────────┘
         │ applicable rules subset
         ▼
┌──────────────────┐
│ RULE EVALUATOR   │  For each applicable rule:
│                  │    1. Check field presence
│                  │    2. Validate format
│                  │    3. Validate value
│                  │    4. Check exceptions
│                  │    5. Assign status
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ CONFIDENCE GATE  │  If OCR confidence < threshold:
│                  │    status = NEEDS_REVIEW
│                  │  Else:
│                  │    status = PASS / FAIL
└────────┬─────────┘
         │
         ▼
   Compliance Result JSON
```

### 5.5 Decision States

| State | Code | When Used |
|---|---|---|
| Compliant | `PASS` | Field present, valid, high confidence |
| Non-Compliant | `FAIL` | Field missing/invalid, high confidence |
| Needs Review | `NEEDS_REVIEW` | Low confidence, ambiguous, partial match |
| Not Applicable | `NOT_APPLICABLE` | Rule exempt for this product/package |
| Not Verifiable | `NOT_VERIFIABLE_FROM_IMAGE` | Physical measurement required |

### 5.6 Rule Engine Output Schema

```json
{
  "inspection_id": "INS-000124",
  "overall_status": "NEEDS_REVIEW",
  "compliance_score": 78,
  "total_rules_evaluated": 14,
  "passed": 10,
  "failed": 2,
  "needs_review": 1,
  "not_applicable": 1,
  "findings": [
    {
      "finding_id": "F-001",
      "rule_id": "PC-MRP-001",
      "rule_code": "RULE_6_1_E",
      "field": "mrp",
      "status": "PASS",
      "severity": "HIGH",
      "detected_value": "₹99",
      "confidence": 0.97,
      "evidence_bbox": [120, 340, 420, 390],
      "legal_reference": "Rule 6(1)(e)",
      "explanation": null
    },
    {
      "finding_id": "F-002",
      "rule_id": "PC-CONTACT-001",
      "rule_code": "RULE_6_2",
      "field": "consumer_contact",
      "status": "FAIL",
      "severity": "HIGH",
      "detected_value": null,
      "confidence": 0.94,
      "evidence_bbox": null,
      "legal_reference": "Rule 6(2)",
      "explanation": "Consumer complaint contact information not detected"
    }
  ]
}
```

---

## 6. RAG & Legal Intelligence

### 6.1 Purpose

RAG answers: **"Why is this considered a violation?"**

RAG does NOT answer: **"Is this product legally compliant?"** (Rule Engine decides that)

### 6.2 Document Ingestion Pipeline

```
Legal Documents (PDF)
       ↓
Document Loader (PyPDF / pdfplumber)
       ↓
Cleaning (remove headers/footers/page numbers)
       ↓
Semantic Chunking (by rule/section, 500–1000 tokens)
       ↓
Embedding Generation (sentence-transformers / OpenAI)
       ↓
Vector Database (ChromaDB / Qdrant / pgvector)
       ↓
Metadata: { source, rule_number, section, page, effective_date }
```

### 6.3 Authoritative Sources

| Document | Priority |
|---|---|
| Legal Metrology Act, 2009 | Primary |
| Legal Metrology (Packaged Commodities) Rules, 2011 | Primary |
| Amendments (2012–2026) | Primary |
| DoCA FAQs and Guidelines | Secondary |
| Standard Practice Guides | Secondary |

### 6.4 RAG Query Flow

```
Rule Engine Finding (e.g., "MRP missing")
       ↓
RAG Query: "What does Rule 6(1)(e) require for MRP declaration?"
       ↓
Vector Search → Top-K relevant chunks
       ↓
LLM Generation with retrieved context
       ↓
Output:
  {
    "explanation": "Under Rule 6(1)(e), every retail package must...",
    "citations": [
      {
        "source": "PC Rules 2011",
        "rule": "Rule 6(1)(e)",
        "page": 12,
        "text": "retail sale price of the package..."
      }
    ]
  }
```

### 6.5 Constraints

- RAG **never** overrides Rule Engine decisions
- Every RAG response must include exact source citations (document, rule number, section)
- Preserve source metadata in vector DB for traceability
- Support rule versioning — different effective dates

---

## 7. Database Design

### 7.1 RDBMS: PostgreSQL

### 7.2 Entity Relationship Diagram

```
users
  │ 1:N
  ▼
inspections ──── 1:1 ──── products
  │ 1:N           │ 1:1
  ├── images      ├── compliance_results
  ├── extracted_fields
  ├── violations ─── N:1 ──── rules
  ├── reports
  └── ocr_runs ──── 1:N ──── ocr_text_regions
```

### 7.3 Table Definitions

#### `users`
```sql
CREATE TABLE users (
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role          VARCHAR(50) NOT NULL CHECK (role IN ('inspector', 'admin', 'supervisor')),
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### `products`
```sql
CREATE TABLE products (
    product_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255),
    category      VARCHAR(100),
    sub_category  VARCHAR(100),
    barcode       VARCHAR(50),
    package_type  VARCHAR(50) CHECK (package_type IN ('retail', 'wholesale', 'export', 'unknown')),
    is_imported   BOOLEAN DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### `inspections`
```sql
CREATE TABLE inspections (
    inspection_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID REFERENCES products(product_id),
    inspector_id    UUID REFERENCES users(user_id),
    status          VARCHAR(50) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'quality_failed',
                           'completed', 'needs_review', 'finalized')),
    compliance_score DECIMAL(5,2),
    inspector_remarks TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    finalized_at    TIMESTAMPTZ
);
```

#### `images`
```sql
CREATE TABLE images (
    image_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES inspections(inspection_id),
    type          VARCHAR(50) CHECK (type IN ('original', 'processed', 'evidence_crop')),
    storage_path  TEXT NOT NULL,
    image_hash    VARCHAR(64),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ocr_runs`
```sql
CREATE TABLE ocr_runs (
    ocr_run_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id   UUID REFERENCES inspections(inspection_id),
    engine          VARCHAR(50) DEFAULT 'paddleocr',
    model_version   VARCHAR(50),
    processing_time_ms INTEGER,
    raw_result      JSONB,
    quality_report  JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ocr_text_regions`
```sql
CREATE TABLE ocr_text_regions (
    region_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocr_run_id    UUID REFERENCES ocr_runs(ocr_run_id),
    text          TEXT NOT NULL,
    confidence    DECIMAL(5,4),
    x1            INTEGER, y1 INTEGER,
    x2            INTEGER, y2 INTEGER,
    bbox_width    INTEGER,
    bbox_height   INTEGER
);
```

#### `extracted_fields`
```sql
CREATE TABLE extracted_fields (
    field_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id   UUID REFERENCES inspections(inspection_id),
    field_name      VARCHAR(100) NOT NULL,
    field_value     TEXT,
    raw_ocr_text    TEXT,
    confidence      DECIMAL(5,4),
    bbox            JSONB,
    bbox_height_px  INTEGER,
    extraction_rule VARCHAR(100),
    status          VARCHAR(50) CHECK (status IN ('found', 'not_found', 'uncertain')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `rules`
```sql
CREATE TABLE rules (
    rule_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code         VARCHAR(50) UNIQUE NOT NULL,
    version           VARCHAR(20) NOT NULL,
    field             VARCHAR(100),
    category          VARCHAR(100),
    applicable_package_types JSONB DEFAULT '["retail"]',
    condition         VARCHAR(100),
    validation_logic  TEXT,
    required          BOOLEAN DEFAULT true,
    severity          VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    legal_reference   TEXT,
    description       TEXT,
    effective_from    DATE,
    effective_until   DATE,
    exemptions        JSONB,
    is_active         BOOLEAN DEFAULT true,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `compliance_results`
```sql
CREATE TABLE compliance_results (
    result_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id   UUID UNIQUE REFERENCES inspections(inspection_id),
    status          VARCHAR(50) NOT NULL,
    score           DECIMAL(5,2),
    total_rules     INTEGER,
    passed          INTEGER,
    failed          INTEGER,
    needs_review    INTEGER,
    not_applicable  INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `violations`
```sql
CREATE TABLE violations (
    violation_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id     UUID REFERENCES inspections(inspection_id),
    rule_id           UUID REFERENCES rules(rule_id),
    field             VARCHAR(100),
    violation_type    VARCHAR(100),
    description       TEXT,
    severity          VARCHAR(20),
    detected_value    TEXT,
    confidence        DECIMAL(5,4),
    bbox              JSONB,
    evidence_image    TEXT,
    legal_reference   TEXT,
    rag_explanation   TEXT,
    rag_citations     JSONB,
    inspector_decision VARCHAR(50) CHECK (inspector_decision IN
                       ('pending', 'accepted', 'rejected', 'modified')),
    inspector_remarks  TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `reports`
```sql
CREATE TABLE reports (
    report_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id   UUID REFERENCES inspections(inspection_id),
    report_code     VARCHAR(50) UNIQUE,
    format          VARCHAR(10) DEFAULT 'pdf',
    storage_path    TEXT,
    pipeline_version VARCHAR(20),
    ocr_model_version VARCHAR(50),
    ruleset_version  VARCHAR(50),
    image_hash       VARCHAR(64),
    report_hash      VARCHAR(64),
    qr_code_url      TEXT,
    generated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### `audit_logs`
```sql
CREATE TABLE audit_logs (
    log_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(user_id),
    action        VARCHAR(100) NOT NULL,
    entity_type   VARCHAR(50),
    entity_id     UUID,
    details       JSONB,
    ip_address    INET,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.4 Storage Strategy

| Data Type | Storage | Why |
|---|---|---|
| Structured metadata | PostgreSQL | Relational queries, joins, analytics |
| Raw OCR JSON | PostgreSQL JSONB | Reprocessing, auditing, debugging |
| Product images | Object Storage (S3/Supabase) | Binary files don't belong in RDBMS |
| Evidence crops | Object Storage | Referenced by path in DB |
| PDF reports | Object Storage | Large binary artifacts |
| Legal embeddings | Vector DB (ChromaDB/pgvector) | Semantic similarity search |

### 7.5 Key Indexes

```sql
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_created ON inspections(created_at DESC);
CREATE INDEX idx_violations_inspection ON violations(inspection_id);
CREATE INDEX idx_violations_severity ON violations(severity);
CREATE INDEX idx_extracted_fields_inspection ON extracted_fields(inspection_id);
CREATE INDEX idx_rules_active ON rules(is_active, field);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
```

---

## 8. Report Generation

### 8.1 Architecture

```
Compliance Result JSON + Evidence Images
           ↓
┌──────────────────────┐
│  Evidence Service    │  Crop bounding boxes with padding
│  (Pillow)            │  Annotate original image
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│  Report Generator    │  ReportLab Platypus
│                      │
│  Page 1: Cover       │  Logo, report ID, date, product image, overall status, score
│  Page 2: Summary     │  Fields table (field, value, confidence, status)
│  Page 3: Quality     │  Image quality metrics table
│  Page 4+: Evidence   │  Per-finding: annotated image + crop + details
│  Final: Compliance   │  Summary, pass/fail counts, recommendations
│  Footer: Integrity   │  Pipeline version, model version, image hash, report hash, QR
└──────────────────────┘
```

### 8.2 Report Data Model

```json
{
  "report_id": "VAL-2026-00125",
  "generated_at": "2026-09-12T10:30:00Z",
  "product": { "name": "...", "category": "...", "brand": "..." },
  "overall_status": "NEEDS_REVIEW",
  "compliance_score": 78,
  "fields": [
    {
      "name": "MRP",
      "value": "₹99",
      "status": "PASS",
      "confidence": 0.97,
      "evidence_id": "EV-001"
    }
  ],
  "quality": {
    "blur": 0.12, "brightness": 0.71, "glare": 0.08,
    "resolution": "1920x1080", "text_region_detected": true
  },
  "evidence": [
    {
      "id": "EV-001",
      "field": "MRP",
      "original_image": "product.jpg",
      "crop_image": "evidence/crop_001.jpg",
      "bbox": [120, 340, 420, 390],
      "confidence": 0.97
    }
  ],
  "integrity": {
    "pipeline_version": "Validra 1.0.0",
    "ocr_engine": "PaddleOCR PP-OCRv4",
    "ruleset": "PC-2011-v1",
    "image_sha256": "8d72...a91f",
    "report_sha256": "31af...c92e"
  }
}
```

### 8.3 QR Code Verification

Each report includes a QR code linking to:
```
https://validra.app/verify/VAL-2026-00125
```

Enables downstream verification of report authenticity.

---

## 9. API Contract Summary

### 9.1 Core Endpoints

| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Login | ❌ | All |
| `POST` | `/api/v1/scans` | Upload image, start scan | ✅ | Inspector |
| `GET` | `/api/v1/scans/{id}` | Get processing status | ✅ | Inspector |
| `GET` | `/api/v1/inspections` | List inspections (paginated) | ✅ | Inspector |
| `GET` | `/api/v1/inspections/{id}` | Get inspection detail | ✅ | Inspector |
| `PATCH` | `/api/v1/inspections/{id}/findings/{fid}` | Accept/reject/modify finding | ✅ | Inspector |
| `POST` | `/api/v1/inspections/{id}/finalize` | Finalize inspection | ✅ | Inspector |
| `POST` | `/api/v1/reports/{inspection_id}` | Generate PDF report | ✅ | Inspector |
| `GET` | `/api/v1/reports/{id}/download` | Download report PDF | ✅ | Inspector |
| `GET` | `/api/v1/dashboard` | Dashboard statistics | ✅ | All |
| `GET` | `/api/v1/admin/users` | List users | ✅ | Admin |
| `POST` | `/api/v1/admin/rules` | Create/update rule | ✅ | Admin |
| `GET` | `/api/v1/admin/audit-logs` | Audit log list | ✅ | Admin |

### 9.2 Pagination Contract

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

### 9.3 Filter/Sort Query Parameters

```
GET /api/v1/inspections?status=needs_review&sort=-created_at&page=2&per_page=20
```

---

## 10. Security Architecture

### 10.1 Auth Flow

```
Next.js (Auth.js) → Issues signed JWT → Frontend sends Bearer token →
FastAPI middleware independently verifies JWT signature + expiry + RBAC →
Grants/denies access
```

### 10.2 Security Rules

| Rule | Enforcement |
|---|---|
| JWT validation | FastAPI middleware on every protected endpoint |
| RBAC | Role checked server-side, never trust frontend |
| Secrets | Never hardcoded; use `.env` / secrets manager |
| File upload | Validate type + size server-side |
| API keys | Never exposed to frontend |
| Session expiry | Handle gracefully in UI (redirect to login) |
| Audit trail | Log all inspector decisions and admin actions |
| Image integrity | SHA-256 hash stored at upload time |

---

## 11. Team Ownership Matrix

| Module | Domain | Owner | Directory |
|---|---|---|---|
| M1 | Frontend (Next.js, UI/UX) | FE Team (3 members) | `frontend/` |
| M2 | Backend (FastAPI, APIs) | Backend Lead | `backend/` |
| M3 | Database, Auth, Integration | Backend + Auth | `backend/`, `db/` |
| M4 | Computer Vision + OCR | CV Lead | `cv/` |
| M5 | Rule Engine + Info Extraction | ML/Rules Lead | `rule-engine/` |
| M6 | RAG + Legal Intelligence | RAG Lead | `rag/` |

### Frontend Sub-ownership

| Member | Responsibility |
|---|---|
| FE-1 | Design system + Public pages + App Shell |
| FE-2 | Inspector workflow: Scan + Review + Evidence |
| FE-3 | Dashboard + History + Reports + Admin UI |

---

## 12. Development Phases

### Phase 0 — Architecture (All team)
- [ ] Finalize API contracts
- [ ] Finalize DB schema
- [ ] Finalize CV ↔ Backend JSON contract
- [ ] Set up Git workflow (`main → develop → feature/*`)
- [ ] Set up project tooling (linting, formatting, CI)

### Phase 1 — Independent Building (Parallel)
| Member | Milestone |
|---|---|
| FE | Upload + Scan UI with mock API |
| Backend | `/scans` API + DB models |
| CV | Image → OCR → Structured JSON |
| Rules | JSON → Rule evaluation → Findings |
| RAG | Legal docs → Vector DB → Query → Explanation |

### Phase 2 — Integration
- [ ] Connect Frontend → FastAPI → CV → Rules → RAG
- [ ] End-to-end: Upload image → see compliance result

### Phase 3 — Horizontal Expansion
- [ ] All compliance fields (MRP, Net Qty, Manufacturer, Dates, Contact, etc.)
- [ ] Multiple images per inspection
- [ ] Evidence crops + bounding box annotations
- [ ] Inspector review workflow (accept/reject/modify)
- [ ] Report PDF generation

### Phase 4 — Polish
- [ ] Dashboard analytics
- [ ] Inspection history with search/filter
- [ ] Admin portal (users, rules, legal docs, audit logs)
- [ ] Authentication + RBAC
- [ ] Responsive design

### Phase 5 — Testing & Deployment
- [ ] Unit tests per module
- [ ] Integration tests (E2E pipeline)
- [ ] Performance testing
- [ ] Security audit
- [ ] Deployment (Docker + CI/CD)

---

> **This blueprint is the single source of truth for Validra's system design. All modules must build against the contracts defined here. Update this document when architectural decisions change.**
