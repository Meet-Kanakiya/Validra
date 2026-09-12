# Product Requirements Document (PRD) — Validra

> **Single Source of Truth Reference:** Derived from [`docs/blueprints/`](./blueprints/) (`blueprint.md`, `backend-blueprint.md`, `schema-blueprint.md`).

---

## 1. Product Overview & Vision

**Validra** is an AI-assisted packaged commodity compliance checking system designed to inspect packaged consumer goods against the statutory requirements of India's:
- **Legal Metrology Act, 2009**
- **Legal Metrology (Packaged Commodities) Rules, 2011** (and applicable amendments)

Validra automates image quality assessment, label preprocessing, OCR text recognition, structured field extraction (MRP, Net Quantity, Dates, Manufacturer/Packer details, Consumer Care), deterministic rule engine validation, spatial evidence localization, and tamper-evident compliance report generation.

> 🏆 **Smart India Hackathon 2026** — Problem Statement ID: **26034**  
> 👥 **Team:** VisionMinds — Think. Build. Transform.

### Core Operating Principle

> **AI extracts and assists → Rules evaluate deterministically → Human reviews uncertain cases.**

Validra is explicitly designed as an enforcement decision-support system. It never allows autonomous AI models to issue legal verdicts; deterministic rule logic evaluates compliance, and legal officers review and sign off on all findings.

---

## 2. Target Personas & Primary Workflows

| Persona | Primary Purpose | Key Workflows | Access Method |
|---|---|---|---|
| **Inspector** | Conduct field inspections of retail & packaged goods | Capture/Upload Image → Processing → Review Findings & Evidence → Accept/Reject/Modify → Finalize & Generate PDF | Self-registration with email verification |
| **Supervisor / Controller** | Monitor regional compliance trends & review escalations | Inspection Oversight → Review Escalations → Analytics Trends → Export Statistics | Role upgrade by Admin |
| **Administrator** | System maintenance, rules, and security auditing | User Management → Rule Engine Configurator → Audit Log Queries → System Settings | Secure CLI script provisioning (`seed.ts`) |

---

## 3. Functional Requirements Matrix (FR-01 to FR-20)

| Requirement ID | Module | Feature Scope | Target User |
|---|---|---|---|
| **FR-01** | Auth | Register, login, email verification, password reset, and session management | All users |
| **FR-02** | Auth / RBAC | Role-based portal routing and permissions (Inspector vs Supervisor vs Admin) | All users |
| **FR-03** | Scan | Upload high-resolution images via drag-and-drop or device camera capture | Inspector |
| **FR-04** | Scan | Client-side file type (JPEG/PNG/WebP) and file size (≤ 10MB) validation | Inspector |
| **FR-05** | Scan | Multi-stage upload and processing progress indicator (Quality → OCR → Extract → Rule) | Inspector |
| **FR-06** | CV / OCR | Automated quality gate check (blur score, brightness, glare, resolution) | System |
| **FR-07** | CV / OCR | Text recognition and spatial bounding-box coordinate tracking with confidence scores | System |
| **FR-08** | Extraction | Structured extraction of mandatory declarations (MRP, Net Qty, Dates, Mfg, Contact) | System |
| **FR-09** | Rule Engine | Deterministic evaluation against Legal Metrology Rules (C01–C26 checks) | System |
| **FR-10** | Review | Evidence-first review UI displaying original image with interactive bounding box overlays | Inspector |
| **FR-11** | Review | Side-by-side display of extracted declarations, confidence scores, and legal citations | Inspector |
| **FR-12** | Review | Action controls to Accept, Reject, or Modify individual compliance findings | Inspector |
| **FR-13** | Review | Free-form inspector remarks and evidence annotations input | Inspector |
| **FR-14** | Review | Finalize inspection and lock record against subsequent unauthenticated edits | Inspector |
| **FR-15** | Reports | Automated PDF compliance report generation (ReportLab Platypus) | Inspector / Admin |
| **FR-16** | Reports | SHA-256 integrity hash and verification QR code embedded in every PDF report | All |
| **FR-17** | History | Search, filter (by status, date, category), sort, and paginate past inspections | Inspector / Supervisor |
| **FR-18** | Admin | Admin rule management: view, create, edit, activate/deactivate Legal Metrology rules | Admin |
| **FR-19** | Admin | User account administration: role reassignment, status toggle, invitation | Admin |
| **FR-20** | Admin | Immutable security and activity audit log queries | Admin |

---

## 4. Legal Metrology Compliance Checks Matrix (C01 to C26)

The deterministic Rule Engine evaluates packages against 26 compliance checks derived from the Legal Metrology (Packaged Commodities) Rules, 2011:

| Check ID | Declaration / Rule Requirement | Legal Reference | CV-Verifiable? | Rule Engine Logic |
|---|---|---|---|---|
| **C01** | Package applicability & exemption check | Rule 3, 26 | Partially | Evaluates weight/volume thresholds; checks packages ≤ 10g/ml exemption |
| **C02** | Manufacturer name declaration | Rule 6, 10 | ✅ | Verifies presence of registered manufacturing corporate entity |
| **C03** | Manufacturer complete address | Rule 6, 10 | ✅ | Verifies geographic location, state/city, and postal code |
| **C04** | Packer name and address (if distinct) | Rule 6, 10 | ✅ | Checks packer entity if different from manufacturer |
| **C05** | Importer details (if foreign product) | Rule 6, 10 | ✅ | Mandatory country of origin and registered importer details |
| **C06** | Common / generic commodity name | Rule 6(1)(b) | ✅ | Verifies commodity nomenclature matches standard retail classification |
| **C07** | Multipack individual product naming | Rule 6(1)(b) | ✅ | Validates itemization in multi-piece consumer packaging |
| **C08** | Net quantity declaration present | Rule 6, 11 | ✅ | Validates presence of numerical net quantity |
| **C09** | Correct measurement unit for commodity | Rule 12, 13 | ✅ | Verifies weight (g/kg), volume (ml/l), or length (m/cm) by commodity type |
| **C10** | Standard SI units compliance | Rule 13 | ✅ | Prohibits non-metric terms (dozen, gross, lbs, ounces) |
| **C11** | Month & year of mfg / packing / import | Rule 6(1)(d) | ✅ | Regex validation for valid MM/YYYY, MMM-YYYY, or date format |
| **C12** | MRP declaration present | Rule 6(1)(e) | ✅ | Verifies presence of Indian Rupee symbol (₹ / Rs.) and numerical price |
| **C13** | MRP inclusive of all taxes declaration | Rule 6(1)(e) | ✅ | Verifies mandatory text: "inclusive of all taxes" / "incl. of all taxes" |
| **C14** | Package physical dimensions | Rule 6(1)(f), 14–17 | ✅ | Verifies size declarations where required for textiles/cables |
| **C15** | Consumer care contact details | Rule 6(2) | ✅ | Verifies presence of helpline phone, email address, and physical contact |
| **C16** | Principal Display Panel (PDP) placement | Rule 7, 8 | Partially | Checks location of mandatory declarations relative to label surface |
| **C17** | Quantity numeral minimum height | Rule 7 | ⚠️ Relative | Measures relative pixel height; flags for verification if borderline |
| **C18** | Declaration letter minimum height | Rule 7 | ⚠️ Relative | Checks text height ratios against package bounding area |
| **C19** | Quantity clear space surrounding | Rule 8 | Partially | Spatial check ensuring no overlapping artwork or text crowding |
| **C20** | Legibility & prominence | Rule 9 | Partially | Evaluates OCR character confidence and edge contrast |
| **C21** | Contrast of declarations | Rule 9 | ✅ | Computes luminance contrast between text and background region |
| **C22** | Language requirement (English or Hindi) | Rule 9 | ✅ | Verifies mandatory text is declared in English or Devanagari Hindi |
| **C23** | No misleading quantity expressions | Rule 12 | ✅ | Disallows deceptive terms (e.g. "Jumbo size", "Giant pack" without metric) |
| **C24** | Standard pack size compliance | Rule 5, 2nd Sched. | ✅ | Compares against scheduled standard weights for regulated commodities |
| **C25** | Sticker over original MRP tamper check | Rule 6(3) | ⚠️ Flag | Detects dual pricing layers or label overlays; flags for review |
| **C26** | Deceptive packaging suspicion | Rule 23 | ⚠️ Flag | Ratio analysis of packaging volume to contents; routes to `NEEDS_REVIEW` |

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Latency Budgets
- **Client Upload Latency**: Immediate client-side format/size validation (< 50ms).
- **Full Scan Pipeline Execution**: End-to-end processing (Quality → Preprocessing → PaddleOCR → Field Extraction → Rule Evaluation) completed within **15 seconds** for an 8MP image.
- **UI Responsiveness**: Initial page loads < 1.5s; client UI transitions < 100ms via Next.js App Router and Server Components.

### 5.2 Confidence Gating & Quality Assurance
- Every extracted field carries an explicit confidence score `[0.0, 1.0]`.
- OCR/Extraction confidence threshold:
  - `≥ 0.85`: High confidence (eligible for automated PASS).
  - `< 0.85`: Automatically triggers `NEEDS_REVIEW` state requiring human review.
- Low-quality images (blur, glare, resolution < 1024px) fail fast at the Quality Gate (`quality_failed`) before burning compute.

### 5.3 Security, Auth & RBAC
- FastAPI independently validates JWT signature, expiration, and role permissions on every protected endpoint.
- Administrator accounts are provisioned via secure server CLI scripts; no public administrative signup.
- Passwords hashed using bcrypt/argon2; all API communications encrypted over HTTPS/TLS.

### 5.4 Data Integrity & Tamper-Evidence
- Original uploaded images hashed with SHA-256 upon receipt.
- Finalized PDF reports stamped with document SHA-256 hash and dynamic verification QR code pointing to `https://validra.app/verify/{report_code}`.
- Immutable `audit_logs` record all inspector overrides and admin rule modifications.
