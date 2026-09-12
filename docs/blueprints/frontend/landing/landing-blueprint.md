# Validra — Landing Page Blueprint

> **Owner:** FE-1 (Design System + Public/Landing + App Shell)
> **Directory:** `frontend/src/app/(landing)/`
> **Isolation:** This module is fully independent — no imports from `(inspector)/` or `(admin)/`.

---

## 1. Container-First Architecture

Every section of the landing page is built as a **self-contained container component**. Each container:

- Lives in its own file under `containers/`
- Owns its data, layout, and sub-components
- Can be developed, tested, and reviewed independently
- Does **not** import from Inspector or Admin modules

```
Landing Page = Assembly of Containers
┌──────────────────────────────────────┐
│  HeroContainer                       │
├──────────────────────────────────────┤
│  ProblemContainer                    │
├──────────────────────────────────────┤
│  SolutionContainer                   │
├──────────────────────────────────────┤
│  HowItWorksContainer                 │
├──────────────────────────────────────┤
│  FeaturesContainer                   │
├──────────────────────────────────────┤
│  TechStackContainer                  │
├──────────────────────────────────────┤
│  TeamContainer                       │
├──────────────────────────────────────┤
│  FAQContainer                        │
├──────────────────────────────────────┤
│  CTAContainer                        │
├──────────────────────────────────────┤
│  FooterContainer                     │
└──────────────────────────────────────┘
```

The root `page.tsx` simply composes containers in order:

```tsx
// frontend/src/app/(landing)/page.tsx
export default function LandingPage() {
  return (
    <>
      <HeroContainer />
      <ProblemContainer />
      <SolutionContainer />
      <HowItWorksContainer />
      <FeaturesContainer />
      <TechStackContainer />
      <TeamContainer />
      <FAQContainer />
      <CTAContainer />
    </>
  );
}
```

---

## 2. File Structure

```
frontend/src/
├── app/
│   ├── (landing)/                    ← Route group (no URL prefix)
│   │   ├── layout.tsx                ← Landing layout (Navbar + Footer)
│   │   ├── page.tsx                  ← "/" — Home / Landing Page
│   │   ├── about/
│   │   │   └── page.tsx              ← "/about"
│   │   ├── features/
│   │   │   └── page.tsx              ← "/features"
│   │   ├── how-it-works/
│   │   │   └── page.tsx              ← "/how-it-works"
│   │   ├── contact/
│   │   │   └── page.tsx              ← "/contact"
│   │   └── faq/
│   │       └── page.tsx              ← "/faq"
│   │
│   ├── (inspector)/                  ← SEPARATE route group (FE-2 owns)
│   ├── (admin)/                      ← SEPARATE route group (FE-3 owns)
│   └── layout.tsx                    ← Root layout (html, body, fonts, providers)
│
├── components/
│   ├── landing/                      ← Landing-specific components
│   │   ├── containers/               ← Container components (one per section)
│   │   │   ├── HeroContainer.tsx
│   │   │   ├── ProblemContainer.tsx
│   │   │   ├── SolutionContainer.tsx
│   │   │   ├── HowItWorksContainer.tsx
│   │   │   ├── FeaturesContainer.tsx
│   │   │   ├── TechStackContainer.tsx
│   │   │   ├── TeamContainer.tsx
│   │   │   ├── FAQContainer.tsx
│   │   │   ├── CTAContainer.tsx
│   │   │   └── index.ts              ← Barrel export
│   │   ├── Navbar.tsx                ← Landing navigation bar
│   │   ├── Footer.tsx                ← Landing footer
│   │   ├── FeatureCard.tsx
│   │   ├── StepCard.tsx
│   │   ├── TeamMemberCard.tsx
│   │   ├── FAQAccordion.tsx
│   │   ├── TechBadge.tsx
│   │   ├── SectionHeading.tsx
│   │   ├── SectionWrapper.tsx        ← Consistent section padding/max-width
│   │   └── index.ts
│   │
│   └── shared/                       ← SHARED across all modules (design system)
│       ├── ui/                       ← shadcn/ui primitives
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── input.tsx
│       │   ├── badge.tsx
│       │   ├── accordion.tsx
│       │   ├── dialog.tsx
│       │   ├── toast.tsx
│       │   ├── skeleton.tsx
│       │   └── ...
│       ├── Logo.tsx
│       ├── ThemeToggle.tsx
│       └── index.ts
│
├── lib/
│   ├── utils.ts                      ← cn(), formatters, etc.
│   └── constants.ts                  ← Site metadata, nav links, etc.
│
├── styles/
│   └── globals.css                   ← Tailwind + design tokens
│
└── types/
    └── landing.ts                    ← Landing-specific types
```

---

## 3. Route Group Isolation Strategy

Next.js **route groups** `(landing)`, `(inspector)`, `(admin)` enable complete code isolation:

```
app/
├── (landing)/       ← Public pages — FE-1 works here
│   └── layout.tsx   ← Navbar + Footer (no sidebar)
│
├── (inspector)/     ← Inspector app — FE-2 works here
│   └── layout.tsx   ← AppShell (sidebar + header)
│
├── (admin)/         ← Admin portal — FE-3 works here
│   └── layout.tsx   ← AdminShell (admin sidebar + header)
│
└── layout.tsx       ← Root (html, body, providers, fonts)
```

**Rules:**
- `components/landing/` → ONLY imported by `(landing)/` pages
- `components/inspector/` → ONLY imported by `(inspector)/` pages
- `components/admin/` → ONLY imported by `(admin)/` pages
- `components/shared/` → Imported by ALL modules (design system primitives)

This means FE-1, FE-2, and FE-3 can work on separate branches without merge conflicts.

---

## 4. Page Specifications

### 4.1 Home Page — `/`

**Purpose:** First impression. Communicate Validra's value proposition. SEO-critical.

**Containers (scroll order):**

| # | Container | Content | Component Type |
|---|---|---|---|
| 1 | `HeroContainer` | Headline, sub-headline, CTA buttons, hero image/animation | Server Component |
| 2 | `ProblemContainer` | Manual inspection pain points, statistics pie chart | Server Component |
| 3 | `SolutionContainer` | Validra pipeline visualization, core principle | Server Component |
| 4 | `HowItWorksContainer` | 4–6 step cards with icons (Scan → Extract → Validate → Report) | Server Component |
| 5 | `FeaturesContainer` | Feature grid (6–8 cards with icons and descriptions) | Server Component |
| 6 | `TechStackContainer` | Technology badges grid | Server Component |
| 7 | `TeamContainer` | Team VisionMinds member cards | Server Component |
| 8 | `FAQContainer` | Accordion FAQ items | Client Component (accordion interaction) |
| 9 | `CTAContainer` | Final call-to-action with login/demo button | Server Component |

**SEO Requirements:**
- `<title>`: "Validra — Intelligent Product Compliance System"
- `<meta description>`: "AI-assisted packaged commodity compliance checking..."
- Single `<h1>` in HeroContainer
- Proper heading hierarchy: h1 → h2 (section titles) → h3 (sub-items)
- Open Graph + Twitter Card metadata
- Semantic HTML (`<section>`, `<article>`, `<nav>`, `<footer>`)

### 4.2 About Page — `/about`

**Purpose:** Team VisionMinds introduction, SIH 2026 context, project motivation.

| Section | Content |
|---|---|
| About Validra | Project vision, SIH 2026 Problem Statement 26034 |
| The Problem | Manual inspection challenges in Legal Metrology enforcement |
| Our Approach | AI-assisted decision-support (not replacement) philosophy |
| Team VisionMinds | Member profiles, roles, photos |
| Technology | Stack overview with justification |

### 4.3 Features Page — `/features`

**Purpose:** Detailed feature breakdown for stakeholders.

| Feature | Description |
|---|---|
| Product Scanning | Upload/capture images, multi-image support |
| Computer Vision & OCR | OpenCV preprocessing, PaddleOCR, bounding boxes |
| Information Extraction | MRP, Net Qty, Manufacturer, Dates, Contact |
| Rule Engine | Deterministic compliance validation, severity, confidence |
| RAG Legal Intelligence | Legal provision retrieval, citations, explanations |
| Evidence Preservation | Cropped evidence, bounding box annotations |
| Compliance Reports | Professional PDF with QR verification |
| Enforcement Dashboard | Analytics, trends, inspection history |

### 4.4 How It Works Page — `/how-it-works`

**Purpose:** Step-by-step pipeline visualization for non-technical stakeholders.

Steps:
1. **Scan** — Inspector uploads/captures product label image
2. **Process** — AI preprocesses and runs OCR
3. **Extract** — System identifies mandatory declarations
4. **Validate** — Rule Engine checks compliance
5. **Explain** — RAG retrieves legal context
6. **Review** — Inspector reviews findings and evidence
7. **Report** — Generate signed compliance report

### 4.5 Contact Page — `/contact`

**Purpose:** Contact form and team information.

- Contact form (Name, Email, Subject, Message)
- Team email address
- GitHub repository link
- SIH 2026 context

### 4.6 FAQ Page — `/faq`

**Purpose:** Common questions about Validra.

Categories:
- General (What is Validra? Who is it for?)
- Technology (What OCR engine? How accurate?)
- Legal (Which laws? Is it legally binding?)
- Usage (How to start? What image formats?)

---

## 5. Component Specifications

### 5.1 SectionWrapper

Provides consistent section layout across all containers:

```tsx
interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  background?: 'default' | 'muted' | 'accent';
}

// Renders: <section> with max-w-7xl mx-auto px-4 py-16/24
```

### 5.2 SectionHeading

Consistent heading treatment for every section:

```tsx
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;        // e.g., "Problem", "Solution"
  alignment?: 'left' | 'center';
}
```

### 5.3 FeatureCard

```tsx
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
```

### 5.4 StepCard

```tsx
interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}
```

### 5.5 TeamMemberCard

```tsx
interface TeamMemberCardProps {
  name: string;
  role: string;
  image: string;
  github?: string;
  linkedin?: string;
}
```

### 5.6 Navbar

```tsx
// Responsive navbar with:
// - Logo (left)
// - Nav links: Home, About, Features, How It Works, FAQ, Contact
// - CTA: Login button (right)
// - Mobile: hamburger menu
// - Sticky on scroll
// - Transparent on hero, solid on scroll
```

### 5.7 Footer

```tsx
// Footer with:
// - Logo + tagline
// - Quick Links column
// - Legal column (Privacy, Terms)
// - Social links (GitHub)
// - SIH 2026 badge
// - Copyright
```

---

## 6. SEO Checklist

| Requirement | Implementation |
|---|---|
| Title tags | Unique per page via `metadata` export |
| Meta descriptions | Descriptive, 150–160 chars |
| H1 | Single per page, in first container |
| Heading hierarchy | h1 → h2 → h3, no skips |
| Semantic HTML | `<section>`, `<nav>`, `<main>`, `<footer>` |
| Open Graph | og:title, og:description, og:image |
| Sitemap | `app/sitemap.ts` auto-generated |
| Robots | `app/robots.ts` — allow public, disallow dashboard |
| Canonical URLs | Set via metadata |
| Image alt text | All images have descriptive alt |
| Fast loading | Server Components, no unnecessary JS |
| Structured data | JSON-LD for Organization |

---

## 7. Responsive Breakpoints

| Breakpoint | Target | Layout |
|---|---|---|
| `< 640px` | Mobile | Single column, stacked sections, hamburger nav |
| `640–1024px` | Tablet | 2-column grids, collapsible nav |
| `> 1024px` | Desktop | Full layout, sticky nav, multi-column grids |

---

## 8. Performance Rules

- All landing page containers are **Server Components** (no `"use client"` unless interactive)
- FAQ accordion is the only Client Component on the home page
- Images: WebP format, responsive `srcSet`, lazy loading below fold
- Fonts: `next/font` with `display: swap`
- No API calls on landing pages — all content is static/hardcoded
- Lighthouse target: Performance ≥ 95, Accessibility ≥ 95, SEO = 100

---

## 9. Design Tokens (Landing-Specific)

```css
/* Landing page specific tokens — extends shared design system */
--landing-hero-gradient: linear-gradient(135deg, #0d1117 0%, #1a1a2e 50%, #0f3460 100%);
--landing-section-padding: 96px 0;          /* py-24 */
--landing-section-padding-mobile: 64px 0;   /* py-16 */
--landing-max-width: 1280px;                /* max-w-7xl */
--landing-card-border-radius: 12px;
```

---

## 10. Data / Content Structure

All landing page content should be defined in a central constants file so designers can update copy without touching components:

```
frontend/src/
└── lib/
    └── data/
        ├── landing-hero.ts       ← headline, subtitle, CTA text
        ├── landing-features.ts   ← features array
        ├── landing-steps.ts      ← how-it-works steps
        ├── landing-faq.ts        ← FAQ items
        ├── landing-team.ts       ← team members
        ├── landing-tech.ts       ← tech stack items
        └── navigation.ts         ← nav links, footer links
```

Example:

```ts
// lib/data/landing-features.ts
export const FEATURES = [
  {
    icon: "scan",
    title: "Product Scanning",
    description: "Upload or capture packaged commodity images for instant analysis."
  },
  // ...
] as const;
```

---

## 11. Ownership Rules

| Rule | Detail |
|---|---|
| FE-1 owns | `(landing)/`, `components/landing/`, `lib/data/landing-*.ts` |
| FE-1 co-owns | `components/shared/` (design system primitives) |
| FE-1 must NOT | Import from `components/inspector/` or `components/admin/` |
| FE-1 must NOT | Create auth-protected pages |
| FE-1 must NOT | Make API calls to FastAPI backend |
| Branch pattern | `feature/landing-*` (e.g., `feature/landing-hero`, `feature/landing-features`) |
