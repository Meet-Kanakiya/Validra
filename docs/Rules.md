# Validra — Workspace Rules & Coding Standards

> **Single Source of Truth Reference:** Derived from [`docs/blueprints/`](./blueprints/) and team architectural decisions.

This document summarizes the workspace coding standards, domain boundaries, token efficiency constraints, and safety guidelines for human developers and AI agents working on Validra.

---

## 1. Living Documentation Priority

Every team member and AI agent must consult documentation before implementation:

```text
docs/PRD.md
   ↓
docs/Architecture.md
   ↓
docs/Design.md
   ↓
docs/Rules.md / docs/team-guide/Team_Role.md
   ↓
docs/blueprints/ (System, Backend, Schema, Frontend Blueprints)
   ↓
Implementation
   ↓
README.md / docs/memory.md updated
```

Documentation must stay synchronized with actual codebase implementations.

---

## 2. Team Domain Boundaries (M1 to M5)

| Module | Domain | Scope | Path Boundaries | GitHub Tag |
|---|---|---|---|---|
| **M1** | **Frontend & Presentation** | Next.js 14+ App Router, Tailwind CSS, shadcn/ui, Landing, Inspector Review UI, Admin Portal | `frontend/` | `frontend` |
| **M2** | **Backend & Infrastructure** | FastAPI, REST APIs, PostgreSQL, Dual ORM (Prisma/SQLAlchemy), Auth/JWT, RBAC, Task Queue, PDF Reports | `backend/`, `db/` | `backend` / `db` |
| **M3** | **Computer Vision & OCR** | OpenCV Preprocessing, Quality Gate, PaddleOCR PP-OCRv4, Bounding Boxes, Field Extraction | `cv/` | `cv` |
| **M4** | **Rule Engine** | Legal Metrology Rule Evaluation (C01–C26), Deterministic Validation, Rule Repository | `rule-engine/` | `rule-engine` |
| **M5** | **Research & QA** | Datasets, Model Benchmarking, Rule Validation Testing, E2E Testing, SIH Documentation | `research/`, `tests/`, `qa/` | `qa` / `research` |

### Frontend Sub-Team Ownership (M1)

- **FE-1**: Design system tokens, Shared App Shell, Public Landing & Marketing pages (`frontend/src/app/(landing)/`).
- **FE-2**: Inspector core workflow: Scan Upload, Processing status, Dedicated Review Inspection, Evidence visualizer, Auth pages (`frontend/src/app/(inspector)/`, `frontend/src/app/(auth)/`).
- **FE-3**: Dashboard analytics, History data tables, PDF Reports preview, Admin portal (`frontend/src/app/(admin)/`).

**Hard Rule**: Never edit code in another team domain without recording cross-module coordination in `implementation.md`.

---

## 3. Token Efficiency & Communication Rules

1. **Concise Communication**: Keep chat responses minimal (`Implementing.` / `Implemented and tested.`).
2. **Line-Range Inspection**: Read only the line ranges needed; do not dump massive files into model context.
3. **No Browser Walkthroughs**: Use terminal, linters, typecheckers, and test suites for verification unless explicitly requested.
4. **Targeted Module Navigation**: Check specific module directories (`frontend/`, `backend/`, `cv/`, `rule-engine/`, `tests/`) directly using targeted path reads instead of broad repository greps.
5. **No Unnecessary Explanations**: Write requested explanations to `temp/explanation.md`.

---

## 4. Engineering & Architectural Standards

### 4.1 Frontend Standards (M1)
- **Server Components Default**: Use React Server Components for data fetching and layouts; isolate `"use client"` to interactive leaves.
- **Form Validation**: Always use Zod schemas paired with React Hook Form.
- **Dynamic Imports**: Lazily load heavy modules (e.g. interactive bounding box evidence visualizer, charts).

### 4.2 Backend & Database Standards (M2)
- **Dual-ORM Consistency**: Prisma manages user authentication tables; SQLAlchemy 2.0 (async) manages inspection domain entities.
- **Pydantic Schemas**: All API inputs and outputs must define explicit Pydantic v2 schemas.
- **No Silent Failures**: Uncaught exceptions must be mapped to structured JSON error responses with standard HTTP status codes.

### 4.3 Computer Vision & OCR Standards (M3)
- **PaddleOCR PP-OCRv4**: Selected for high accuracy on retail packaging text.
- **Confidence Scores Mandatory**: Every extracted field must include a confidence score `[0.0, 1.0]`.
- **Bounding Box Coordinate Preservation**: Spatial polygons (`[x1, y1, x2, y2]`) must flow through extraction to evidence crops and PDF reports.

### 4.4 Rule Engine Standards (M4)
- **Deterministic Evaluation**: Compliance evaluation is rule-based and versioned (C01–C26). AI models never determine the final legal verdict.
- **Confidence Gating**: Any rule input with OCR confidence `< 85%` must automatically assign the status `NEEDS_REVIEW`.

---

## 5. Security & Quality Checklist

Before completing any implementation task:

- [ ] Next.js Auth issues JWT; FastAPI Auth Middleware verifies signature + expiry + RBAC on every protected endpoint.
- [ ] Administrator accounts are provisioned via secure server scripts; no public admin signup.
- [ ] No hardcoded API keys, passwords, or secrets.
- [ ] Original images and final PDF reports stamped with SHA-256 integrity hashes.
- [ ] Unit & integration tests added/updated and passing.
- [ ] Low OCR confidence (< 85%) routes to `NEEDS_REVIEW` state.
- [ ] Living documentation (`README.md`, `docs/memory.md`) updated if architecture or APIs changed.
