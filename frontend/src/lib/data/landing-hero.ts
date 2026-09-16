import { HeroSlide } from "@/types/landing";

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "automated-scan-pipeline",
    title: "Real-Time Package OCR & Detection",
    subtitle: "High-precision edge detection, perspective transformation, and OCR extraction with PaddleOCR under variable retail lighting.",
    badge: "Stage 01 · Inspection Capture",
    image: "/images/hero/hero-scan.jpg",
    metrics: [
      { label: "Extraction Speed", value: "850ms", status: "pass" },
      { label: "BBox Confidence", value: "99.4%", status: "pass" },
      { label: "Readability Score", value: "High", status: "pass" },
    ],
  },
  {
    id: "deterministic-rule-engine",
    title: "Deterministic Rule Verification (C01–C26)",
    subtitle: "Legal Metrology Rules 2011 compliance evaluated mathematically without generative hallucinations or non-deterministic variance.",
    badge: "Stage 02 · Compliance Engine",
    image: "/images/hero/hero-review.jpg",
    metrics: [
      { label: "Rules Evaluated", value: "26 Checks", status: "pass" },
      { label: "Rule Accuracy", value: "100%", status: "pass" },
      { label: "Violation Severity", value: "Calculated", status: "pass" },
    ],
  },
  {
    id: "evidence-analytics-reporting",
    title: "Cryptographic Evidence & Tamper-Evident Reports",
    subtitle: "Court-admissible PDF reports sealed with SHA-256 hashes, geo-timestamps, and QR code verification under Indian Evidence Act.",
    badge: "Stage 03 · Judicial Reporting",
    image: "/images/hero/hero-dashboard.jpg",
    metrics: [
      { label: "Hash Integrity", value: "SHA-256", status: "pass" },
      { label: "Court Admissible", value: "Sec 65B", status: "pass" },
      { label: "Audit Logged", value: "PostgreSQL", status: "pass" },
    ],
  },
];

export const HERO_METRICS = [
  {
    value: "26+",
    label: "Statutory Rules",
    caption: "PCR 2011 Rule 6 declarations verified deterministically",
  },
  {
    value: "< 1.2s",
    label: "Processing Latency",
    caption: "Sub-second end-to-end OCR and compliance analysis",
  },
  {
    value: "100%",
    label: "Explainability",
    caption: "Zero AI hallucinations; exact rule citations on every flag",
  },
  {
    value: "Sec 65B",
    label: "Evidence Admissibility",
    caption: "Tamper-proof signed PDF with SHA-256 cryptographic seal",
  },
];
