export type ScanStatus =
  | "pending"
  | "processing"
  | "quality_failed"
  | "completed"
  | "needs_review"
  | "finalized";

export interface ScanImageMetadata {
  image_id: string;
  type: string;
  storage_path: string;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  image_hash?: string | null;
  created_at: string;
}

export interface ScanUploadResponse {
  scan_id: string;
  image_id: string;
  file_name: string;
  file_size: number;
  image_hash: string;
  status: ScanStatus;
  ocr: Record<string, unknown>;
  created_at: string;
}

export interface ScanDetailResponse {
  scan_id: string;
  status: ScanStatus;
  compliance_score?: number | null;
  inspector_remarks?: string | null;
  created_at: string;
  completed_at?: string | null;
  images: ScanImageMetadata[];
}

export type ScanUploadState =
  | "idle"
  | "preparing"
  | "uploading"
  | "complete"
  | "error";

export type ProcessingStage = "received" | "ocr" | "rules" | "ready";
