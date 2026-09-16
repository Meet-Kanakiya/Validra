import { TechItem } from "@/types/landing";

export const TECH_STACK: TechItem[] = [
  {
    name: "Next.js 16 & React 19",
    category: "Frontend",
    description: "App Router architecture with React Server Components for instantaneous initial load and dynamic edge rendering.",
    badge: "M1 Domain",
    highlight: "SSR + RSC",
  },
  {
    name: "FastAPI & Python 3.11",
    category: "Backend",
    description: "High-throughput asynchronous REST API microservice orchestrating OCR workloads and report generation.",
    badge: "M2 Domain",
    highlight: "Async / OpenAPI",
  },
  {
    name: "PaddleOCR & OpenCV",
    category: "AI & Vision",
    description: "Multi-stage computer vision pipeline handling image deskew, contrast normalization, text detection, and OCR.",
    badge: "M3 Domain",
    highlight: "PaddleOCR v4",
  },
  {
    name: "Deterministic Rules Engine",
    category: "Rule Engine",
    description: "Pure rule evaluation without LLM hallucination risk, verifying Legal Metrology PCR 2011 compliance codes.",
    badge: "M4 Domain",
    highlight: "C01–C26 Rules",
  },
  {
    name: "RAG & Legal Embeddings",
    category: "Rule Engine",
    description: "Vector search over Indian Legal Metrology Acts, gazette notifications, and state amendments for legal explainability.",
    badge: "M5 Domain",
    highlight: "Vector Search",
  },
  {
    name: "PostgreSQL & Prisma",
    category: "Database & Storage",
    description: "Relational persistence for inspections, audit trails, user management, and deterministic rule configurations.",
    badge: "M2 Domain",
    highlight: "ACID Compliant",
  },
  {
    name: "Tailwind CSS v4",
    category: "Frontend",
    description: "Modern CSS-first design system with accessibility tokens, dark-mode ergonomics, and responsive layouts.",
    badge: "M1 Domain",
    highlight: "CSS Tokens",
  },
  {
    name: "PyMuPDF & Cryptography",
    category: "Database & Storage",
    description: "Court-admissible PDF generation with SHA-256 digital seals, QR verification, and Section 65B compliance.",
    badge: "M2 / M6 Domain",
    highlight: "SHA-256 Digest",
  },
];
