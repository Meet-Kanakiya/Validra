export type IngestionStatus = "Processing" | "Ready" | "Failed";

export type LegalDocumentType =
  | "Principal Act"
  | "Statutory Rules"
  | "Gazette Amendment"
  | "Ministry Advisory"
  | "Enforcement Circular";

export interface DocumentChunkPreview {
  id: string;
  chunkIndex: number;
  content: string;
  sectionRef: string;
  tokenCount: number;
}

export interface LegalDocument {
  id: string;
  title: string;
  documentType: LegalDocumentType;
  status: IngestionStatus;
  version: string;
  effectiveDate: string;
  uploadedAt: string;
  fileSizeBytes: number;
  fileName: string;
  chunksCount: number;
  summary: string;
  authorizingBody: string;
  chunksPreview?: DocumentChunkPreview[];
  errorMessage?: string;
}
