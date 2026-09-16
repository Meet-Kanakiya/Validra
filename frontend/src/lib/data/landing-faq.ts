import { FAQItem } from "@/types/landing";

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    category: "Legal Metrology",
    question: "What laws and rules does Validra validate against?",
    answer:
      "Validra primarily verifies compliance under India's Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011 (as amended). This includes Rule 6 mandatory declarations (MRP, Net Quantity, Date of Manufacture/Packing, Consumer Care, Manufacturer/Packer/Importer details) and Rule 7/8 font height and placement specifications.",
    legalRef: "Legal Metrology Act 2009 & PCR 2011",
  },
  {
    id: "faq-2",
    category: "Technology & AI",
    question: "Why does Validra use a deterministic rule engine instead of an LLM for legal decisions?",
    answer:
      "Statutory legal enforcement requires 100% reproducibility and zero hallucinations. Large Language Models (LLMs) can produce probabilistic variations that could lead to unlawful seizure or dismissed court cases. In Validra, AI is used solely for perception (OCR and text detection), while legal rules (C01–C26) are executed deterministically in code.",
    legalRef: "Zero Hallucination Architecture",
  },
  {
    id: "faq-3",
    category: "Inspection Process",
    question: "Can an inspector manually review and override the system's findings?",
    answer:
      "Yes. Validra operates under a strict Human-in-the-Loop paradigm. The inspector has full authority to review cropped evidence, re-verify blurred text, and adjust or confirm non-compliance flags before signing the final report. All inspector actions are recorded in an immutable audit trail.",
    legalRef: "Inspector Discretion Principle",
  },
  {
    id: "faq-4",
    category: "Enforcement & Reports",
    question: "Are the generated PDF inspection reports court-admissible?",
    answer:
      "Yes. Validra generates tamper-evident PDF inspection certificates embedded with a SHA-256 cryptographic checksum, timestamp, inspector digital signature, and a verifiable QR code. This fulfills evidentiary criteria under Section 65B of the Indian Evidence Act, 1872 (and Bharatiya Sakshya Adhiniyam, 2023).",
    legalRef: "Indian Evidence Act Section 65B",
  },
  {
    id: "faq-5",
    category: "Technology & AI",
    question: "What OCR engine is used and how does it handle Indian packaging conditions?",
    answer:
      "Validra integrates PaddleOCR combined with OpenCV image preprocessing routines (adaptive thresholding, bilateral filtering, perspective unwarping). This pipeline handles specular glare, crumpled packaging, curved beverage bottles, and low-contrast font declarations typical of Indian retail markets.",
    legalRef: "CV Pipeline Specification",
  },
  {
    id: "faq-6",
    category: "Enforcement & Reports",
    question: "How does Validra help state Legal Metrology departments detect systemic violations?",
    answer:
      "Through the central Admin Portal, supervisors can monitor compliance rates across districts, track repeat offending manufacturers, identify the most frequently violated statutory rules (e.g., missing Consumer Care email or non-standard Net Quantity units), and optimize field inspection deployment.",
    legalRef: "Departmental Analytics",
  },
];
