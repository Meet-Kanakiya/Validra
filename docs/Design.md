# Validra — UI/UX & System Design Specifications

> **Single Source of Truth Reference:** Derived from [`docs/blueprints/`](./blueprints/) (`blueprint.md`, `landing-blueprint.md`, `inspector-blueprint.md`, `admin-blueprint.md`).

---

## 1. UI Architecture & Technology Stack

The Validra frontend is built with modern, accessible, and performant web technologies:

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Server Components default, streaming SSR, optimized bundling |
| **Language** | TypeScript (Strict mode) | Type safety across component props and API contracts |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first styling with accessible, headless UI primitives |
| **Authentication** | Auth.js / NextAuth + Nodemailer | Secure email verification, sessions, and signed JWT issuance |
| **State Management** | Server Components + TanStack React Query | Minimizes client bundle; handles optimistic caching & polling |
| **Form Handling** | React Hook Form + Zod | Schema-based client-side validation |
| **Icons** | Lucide React | Clean, consistent UI iconography |

---

## 2. Modular Route Groups & Team Ownership

The frontend codebase is partitioned into three isolated route groups with strict separation of concerns:

```
frontend/src/app/
│
├── (landing)/                         ← FE-1: Public Marketing & Landing
│   ├── layout.tsx                     ← Public Navbar + Footer
│   ├── page.tsx                       ← "/" Home (Assembled Containers)
│   ├── about/page.tsx                 ← "/about"
│   ├── features/page.tsx              ← "/features"
│   ├── how-it-works/page.tsx          ← "/how-it-works"
│   ├── contact/page.tsx               ← "/contact"
│   └── faq/page.tsx                   ← "/faq"
│
├── (auth)/                            ← FE-2: Authentication Pages (No Sidebar)
│   ├── layout.tsx                     ← Centered Auth Card layout
│   ├── login/page.tsx                 ← "/login"
│   ├── register/page.tsx              ← "/register" (Inspector registration)
│   ├── verify-email/page.tsx          ← "/verify-email"
│   ├── forgot-password/page.tsx       ← "/forgot-password"
│   └── reset-password/page.tsx        ← "/reset-password"
│
├── (inspector)/                       ← FE-2: Core Inspector Workflow
│   ├── layout.tsx                     ← InspectorShell (Sidebar + Header + Auth Guard)
│   ├── dashboard/page.tsx             ← "/dashboard" (Overview stats & recent scans)
│   ├── scan/
│   │   ├── new/page.tsx               ← "/scan/new" (Image upload & camera capture)
│   │   └── [id]/
│   │       ├── processing/page.tsx    ← "/scan/[id]/processing" (Step-by-step progress)
│   │       └── review/page.tsx        ← "/scan/[id]/review" (Dedicated Review Inspection ⭐)
│   ├── inspections/
│   │   ├── page.tsx                   ← "/inspections" (Search, filter, paginate history)
│   │   └── [id]/page.tsx              ← "/inspections/[id]" (Inspection detail view)
│   ├── reports/
│   │   ├── page.tsx                   ← "/reports" (Report catalog)
│   │   └── [id]/page.tsx              ← "/reports/[id]" (PDF preview & download)
│   ├── profile/page.tsx               ← "/profile"
│   └── help/page.tsx                  ← "/help"
│
└── (admin)/                           ← FE-3: Administration Portal
    ├── layout.tsx                     ← AdminShell (Admin Sidebar + Header + RBAC Guard)
    ├── admin/
    │   ├── dashboard/page.tsx         ← "/admin/dashboard" (System enforcement metrics)
    │   ├── users/
    │   │   ├── page.tsx               ← "/admin/users" (Inspector accounts management)
    │   │   └── [id]/page.tsx          ← "/admin/users/[id]"
    │   ├── rules/
    │   │   ├── page.tsx               ← "/admin/rules" (Rule engine configuration)
    │   │   ├── new/page.tsx           ← "/admin/rules/new"
    │   │   └── [id]/page.tsx          ← "/admin/rules/[id]"
    │   ├── legal-documents/
    │   │   ├── page.tsx               ← "/admin/legal-documents" (Act/Rules catalog)
    │   │   └── upload/page.tsx        ← "/admin/legal-documents/upload"
    │   ├── inspections/
    │   │   ├── page.tsx               ← "/admin/inspections" (System-wide read-only oversight)
    │   │   └── [id]/page.tsx          ← "/admin/inspections/[id]"
    │   ├── audit-logs/page.tsx        ← "/admin/audit-logs" (Immutable security audit trail)
    │   └── settings/page.tsx          ← "/admin/settings"
    └── page.tsx                       ← Redirects to "/admin/dashboard"
```

### Module Isolation Rules

- **FE-1 (Landing)** does not import components from `(inspector)` or `(admin)`.
- **FE-2 (Inspector)** does not import components from `(landing)` or `(admin)`.
- **FE-3 (Admin)** does not import components from `(landing)` or `(inspector)`.
- All modules share global primitives from `components/ui/` (shadcn) and shared design tokens.

---

## 3. Landing Module: Container-First Architecture

The public landing page (`/`) is built using modular, self-contained containers:

```
┌────────────────────────────────────────────────────────┐
│  HeroContainer       — Headline, SIH 26034, Quick CTA  │
├────────────────────────────────────────────────────────┤
│  ProblemContainer    — Retail packaging compliance pain│
├────────────────────────────────────────────────────────┤
│  SolutionContainer   — Validra automated workflow      │
├────────────────────────────────────────────────────────┤
│  HowItWorksContainer — Interactive 6-step pipeline      │
├────────────────────────────────────────────────────────┤
│  FeaturesContainer   — Key product capabilities        │
├────────────────────────────────────────────────────────┤
│  TechStackContainer  — Next.js, FastAPI, PaddleOCR, PG │
├────────────────────────────────────────────────────────┤
│  TeamContainer       — VisionMinds team members        │
├────────────────────────────────────────────────────────┤
│  FAQContainer        — Legal Metrology & system FAQs   │
├────────────────────────────────────────────────────────┤
│  CTAContainer        — Get started / Login trigger     │
├────────────────────────────────────────────────────────┤
│  FooterContainer     — Legal disclaimer, links, repo   │
└────────────────────────────────────────────────────────┘
```

---

## 4. Dedicated Review Inspection UX Specification (Core Flow)

The **Review Inspection Page** (`/scan/[id]/review`) represents Validra's highest UI design priority, giving officers complete oversight over AI findings before formal report finalization:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ VALIDRA — Inspection Review · #INS-000124                             Status: NEEDS REVIEW│
├──────────────────────────────────────────┬──────────────────────────────────────────────┤
│ 📷 Product Evidence Visualizer           │ 📋 Declarations & Rule Engine Findings       │
│                                          ├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │ 1. Maximum Retail Price (MRP)                │
│ │ [BBox 1: MRP ₹99.00]                 │ │    Detected: "₹99.00 (Incl. of all taxes)"   │
│ │                                      │ │    Confidence: 97%  ·  Status: ✅ PASS        │
│ │ [BBox 2: Net Quantity]               │ │    Legal Ref: Rule 6(1)(e), PC Rules 2011    │
│ │                                      │ ├──────────────────────────────────────────────┤
│ │ [BBox 3: Date of Mfg]                │ │ 2. Net Quantity Declaration                  │
│ └──────────────────────────────────────┘ │    Detected: "500 g" (Low OCR confidence)    │
│                                          │    Confidence: 64%  ·  Status: ⚠️ NEEDS REVIEW│
│ Zoom: [ 100% ] [ + ] [ - ] [ Fit ]       │    Legal Ref: Rule 6(1)(a) & Rule 12         │
│ Bounding Boxes: [ Active (3) ]           │    Officer Decision:                         │
│ Layer Filter: [ All ] [ MRP ] [ Qty ]    │    (•) Accept   ( ) Modify Value   ( ) Reject│
├──────────────────────────────────────────┴──────────────────────────────────────────────┤
│ Inspector Notes & Remarks:                                                              │
│ [ Verified unit against physical package carton; net quantity is compliant.           ] │
│                                                                                         │
│ Actions:                                                                                │
│ [ 💾 Save Draft ]               [ ⚠️ Escalate for Second Opinion ]   [ 📄 Finalize & Sign ]│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

1. **`EvidenceViewer`**: High-resolution image canvas supporting pan, pinch-zoom, and dynamic SVG bounding box polygon overlays. Clicking a bounding box automatically highlights and scrolls to the corresponding finding card.
2. **`ExtractedFieldsTable`**: Displays key parsed values (MRP, Net Quantity, Dates, Manufacturer, Consumer Care Contact) with confidence score bars and status badges.
3. **`FindingCard`**: Per-rule evaluation card presenting rule code, legal citation, detected snippet, severity tag (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and officer action controls (`Accept`, `Reject`, `Modify`).
4. **`RemarksInput` & `FinalizeButton`**: Collects inspector evidence notes and triggers the generation of the digitally signed PDF report.

---

## 5. Design System Tokens & Guidelines

### Compliance Status Palette

| Token | Hex Value | Semantic Meaning | Usage |
|---|---|---|---|
| `COMPLIANT` | `#00C853` | Fully compliant | Rule passed, high confidence |
| `VIOLATION` | `#FF1744` | Non-compliant / Breach | Rule violated, missing declaration |
| `NEEDS_REVIEW` | `#FFAB00` | Human review required | Confidence `< 85%` or ambiguous format |
| `NOT_APPLICABLE` | `#9E9E9E` | Rule exempt | Exemption under Rule 26 |

### Confidence Thresholds

- **HIGH (≥ 85%)**: Displayed in green; eligible for automatic rule pass without mandatory flag.
- **MEDIUM (60% – 84%)**: Displayed in amber; automatically flags finding as `NEEDS_REVIEW`.
- **LOW (< 60%)**: Displayed in red; triggers low-confidence warning banner and officer inspection prompt.

### Typography & Layout Spacing

- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Base Grid**: 4px base increment (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Border Radii**: `4px` for small controls/inputs, `8px` for cards/tables, `12px` for dialogs/modals, `9999px` for status badges.

---

## 6. Comprehensive Component State Matrix

Every view and data container must explicitly implement the following 7 states:

| State | Visual Treatment | Action |
|---|---|---|
| **Loading** | Tailwind animated skeleton placeholders matching final layout geometry | Displays progress text |
| **Success** | Populated interactive components with primary CTA buttons | Data exploration & actions |
| **Empty** | Thematic illustration, informative headline, and clear action button | Guide user to initiate scan |
| **Error** | Red/amber destructive callout banner with precise error message | "Retry" action button |
| **Unauthorized** | Clean redirection or HTTP 401/403 card with login CTA | Prevents unauthorized layout render |
| **Processing** | Multi-stage stepped progress bar with animated indicator | Live status polling (`/processing`) |
| **Partial Failure** | Renders successful data with alert banner for failed sub-tasks | Allows manual fallback entry |

---

## 7. Performance & Optimization Standards

1. **Server Components First**: Next.js Server Components are used for static content, metadata generation, and initial data fetching to keep the client JavaScript bundle minimal.
2. **Targeted Interactive Client Components**: `"use client"` directives are strictly isolated to interactive sub-trees (e.g. `EvidenceViewer.tsx`, `ImageUploader.tsx`, `ReviewActions.tsx`).
3. **Dynamic Imports for Heavy Modules**: Interactive image viewers, PDF previews, and charting modules (`Recharts`) are loaded using `next/dynamic` with skeleton fallbacks.
4. **Strict Pagination for Audit Trails**: Inspection history and admin audit logs utilize numbered page pagination (20 items per page) to ensure deterministic indexing and legal audit compliance (no infinite scroll).
5. **Image Optimization**: Original package photos and evidence crops utilize WebP compression and `next/image` responsive srcset rendering.
