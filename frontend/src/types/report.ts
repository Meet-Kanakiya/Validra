import { Finding, EvidenceItem, ExtractedField } from "./review";

export type ReportStatus = "generated" | "pending" | "archived";

export type ReportComplianceResult = "Compliant" | "Non-compliant" | "Needs Review";

export interface ReportListItem {
  id: string;
  title: string;
  inspectionId: string;
  inspectionCode: string;
  productName: string;
  generatedAt: string;
  status: ReportStatus;
  complianceResult: ReportComplianceResult;
  complianceScore: number | null;
  downloadUrl?: string | null;
}

export interface ReportDetail {
  id: string;
  title: string;
  inspectionId: string;
  inspectionCode: string;
  productName: string;
  category: string;
  generatedAt: string;
  inspectorName: string;
  inspectorId: string;
  status: ReportStatus;
  complianceResult: ReportComplianceResult;
  complianceScore: number | null;
  findingsCount: number;
  findings: Finding[];
  extractedFields: ExtractedField[];
  evidenceImages: EvidenceItem[];
  remarks: string;
  downloadUrl?: string | null;
}
