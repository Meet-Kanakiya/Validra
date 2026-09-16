import { StepItem } from "@/types/landing";

export const STEPS: StepItem[] = [
  {
    stepNumber: 1,
    title: "Capture & Ingestion",
    badge: "Image Input",
    icon: "Camera",
    description: "Inspector captures packaging label using mobile device or uploads retail product images into Validra workspace.",
    detail: "Quality gate filters blur, low light, and distortion before processing.",
  },
  {
    stepNumber: 2,
    title: "CV & Text Extraction",
    badge: "PaddleOCR",
    icon: "Cpu",
    description: "OpenCV applies adaptive thresholding while PaddleOCR detects text zones and computes bounding box coordinates.",
    detail: "Preserves font size, character spacing, and coordinates per region.",
  },
  {
    stepNumber: 3,
    title: "Mandatory Entity Parsing",
    badge: "NLP & Regex",
    icon: "FileSearch",
    description: "Extracted textual blocks are parsed into structured declarations: MRP, Net Qty, Dates, Address, and Email/Phone.",
    detail: "Matches against Legal Metrology entity taxonomy with high precision.",
  },
  {
    stepNumber: 4,
    title: "Deterministic Rule Verification",
    badge: "Rule Engine C01-C26",
    icon: "CheckCircle2",
    description: "Rules engine mathematically validates statutory requirements without non-deterministic AI halluncinations.",
    detail: "Flags missing mandatory text, deceptive font sizes, and invalid formats.",
  },
  {
    stepNumber: 5,
    title: "Inspector Review & Override",
    badge: "Human-in-the-Loop",
    icon: "UserCheck",
    description: "Statutory discretion remains with the human officer, who reviews visual evidence crops and confirms or overrides flags.",
    detail: "Every modification is permanently recorded in the immutable audit trail.",
  },
  {
    stepNumber: 6,
    title: "Signed Court-Ready Report",
    badge: "Evidence Act 65B",
    icon: "FileCheck",
    description: "Generates tamper-proof PDF inspection certificates containing SHA-256 integrity hash, QR code, and officer digital signature.",
    detail: "Instantly exportable for regulatory notices, compounding, or judicial filing.",
  },
];
