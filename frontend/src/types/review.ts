import { ScanStatus } from "./scan";

export type FindingSeverity = "high" | "medium" | "low";

export interface Finding {
  id: string;
  title: string;
  severity: FindingSeverity;
  detectedIssue: string;
  relatedField: string;
  ruleReference: string;
  explanation: string;
  evidenceSnippet?: string;
}

export interface ExtractedField {
  id: string;
  label: string;
  value: string | null;
  confidence?: number | null; // e.g., 0.94 for 94%
  isMandatory: boolean;
  status: "verified" | "flagged" | "missing";
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: "original" | "processed" | "evidence_crop";
  imageUrl: string;
  description?: string;
}

export type InspectorDecisionType = "Compliant" | "Non-compliant" | "Needs Review";

export interface ReviewData {
  scanId: string;
  status: ScanStatus;
  complianceScore: number | null;
  confidenceScore: number | null; // e.g., 0.92
  extractedFields: ExtractedField[];
  evidenceImages: EvidenceItem[];
  findings: Finding[];
  inspectorRemarks?: string | null;
  createdAt: string;
}
