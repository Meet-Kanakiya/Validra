import { Finding, EvidenceItem, ExtractedField } from "./review";

export type InspectionStatusType =
  | "all"
  | "compliant"
  | "needs_review"
  | "violation"
  | "pending";

export interface InspectionListItem {
  id: string;
  code: string;
  productName: string;
  category: string;
  status: "Compliant" | "Review" | "Violation" | "Pending";
  date: string;
  score: number;
  scanId?: string;
  reportId?: string | null;
}

export interface InspectionFilterState {
  search: string;
  status: InspectionStatusType;
}

export interface InspectionPaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface InspectionDetail {
  id: string;
  code: string;
  productName: string;
  category: string;
  status: "Compliant" | "Review" | "Violation" | "Pending" | "Finalized";
  score: number | null;
  date: string;
  completedAt?: string | null;
  inspectorName?: string;
  scanId?: string;
  reportId?: string | null;
  remarks?: string;
  findings: Finding[];
  evidenceImages: EvidenceItem[];
  extractedFields: ExtractedField[];
}
