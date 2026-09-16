import { API_BASE_URL, getAuthToken, ApiError } from "./api";
import {
  ScanUploadResponse,
  ScanDetailResponse,
} from "@/types/scan";

export const SCAN_ENDPOINTS = {
  UPLOAD: "/api/scans",
  DETAIL: (id: string) => `/api/scans/${id}`,
} as const;

class ScanService {
  /**
   * Uploads a package image file for OCR extraction and compliance inspection.
   * Matches FastAPI backend `POST /api/scans` endpoint with multipart/form-data.
   */
  async uploadScan(file: File): Promise<ScanUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${SCAN_ENDPOINTS.UPLOAD}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = "Failed to upload scan. Please try again.";
        try {
          const data = await response.json();
          errorDetail = data.detail || data.message || errorDetail;
        } catch {
          // Keep default errorDetail
        }
        throw new ApiError(errorDetail, response.status);
      }

      const result: ScanUploadResponse = await response.json();
      return result;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err instanceof Error ? err.message : "Unable to connect to scan service.",
        0,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Fetches the current processing and compliance status of a scan by ID.
   * Matches FastAPI backend `GET /api/scans/{scan_id}`.
   */
  async getScanById(scanId: string): Promise<ScanDetailResponse> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${SCAN_ENDPOINTS.DETAIL(scanId)}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        let errorDetail = "Failed to retrieve scan status.";
        try {
          const data = await response.json();
          errorDetail = data.detail || errorDetail;
        } catch {
          // Keep fallback
        }
        throw new ApiError(errorDetail, response.status);
      }

      const result: ScanDetailResponse = await response.json();
      return result;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err instanceof Error ? err.message : "Unable to connect to scan service.",
        0,
        "NETWORK_ERROR"
      );
    }
  }
}

export const scanService = new ScanService();
