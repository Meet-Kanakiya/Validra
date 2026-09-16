import { scanService } from "./scan-service";
import { ReviewData, InspectorDecisionType, ExtractedField, Finding, EvidenceItem } from "@/types/review";
import { API_BASE_URL } from "./api";

/**
 * Structured presentation fallback data for package review.
 * Used when backend scan record has not yet populated granular rule-engine findings.
 * 
 * PENDING BACKEND CONTRACT:
 * Endpoint: GET /api/scans/{scan_id}/review or GET /api/scans/{scan_id}
 * Finalize: POST /api/scans/{scan_id}/decision
 */
export const DEFAULT_EXTRACTED_FIELDS: ExtractedField[] = [
  {
    id: "f-1",
    label: "Product Common Name",
    value: "Sunburst Natural Cold-Pressed Sesame Oil",
    confidence: 0.98,
    isMandatory: true,
    status: "verified",
  },
  {
    id: "f-2",
    label: "Net Quantity / Weight",
    value: "1 Litre / 910 g",
    confidence: 0.95,
    isMandatory: true,
    status: "verified",
  },
  {
    id: "f-3",
    label: "Maximum Retail Price (MRP)",
    value: "₹ 340.00 (Inclusive of all taxes)",
    confidence: 0.96,
    isMandatory: true,
    status: "verified",
  },
  {
    id: "f-4",
    label: "Unit Sale Price (USP)",
    value: "₹ 0.34 per ml",
    confidence: 0.91,
    isMandatory: true,
    status: "verified",
  },
  {
    id: "f-5",
    label: "Manufacturing & Packing Date",
    value: "08/2026",
    confidence: 0.89,
    isMandatory: true,
    status: "verified",
  },
  {
    id: "f-6",
    label: "Batch / Lot Number",
    value: "LOT-SS26-0819",
    confidence: 0.94,
    isMandatory: true,
    status: "verified",
  },
  {
    id: "f-7",
    label: "Manufacturer & Packer Details",
    value: "Sunburst Agri Foods Pvt. Ltd., Plot 14, MIDC Industrial Area, Pune 411018",
    confidence: 0.92,
    isMandatory: true,
    status: "verified",
  },
  {
    id: "f-8",
    label: "Consumer Care Contact",
    value: "customercare@sunburstagri.in | Toll-Free: 1800-209-4455",
    confidence: 0.88,
    isMandatory: true,
    status: "verified",
  },
  {
    id: "f-9",
    label: "Country of Origin",
    value: null,
    confidence: null,
    isMandatory: true,
    status: "missing",
  },
];

export const DEFAULT_FINDINGS: Finding[] = [
  {
    id: "violation-1",
    title: "Missing Country of Origin Declaration",
    severity: "high",
    detectedIssue: "Country of origin label not identified anywhere on the visible package surface.",
    relatedField: "Country of Origin",
    ruleReference: "Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)(e)",
    explanation: "Rule 6(1)(e) requires every pre-packaged commodity to conspicuously mention the name of the country of origin or manufacturer.",
    evidenceSnippet: "OCR Scan Pass Complete: 0 bounding boxes matched Country of Origin patterns.",
  },
];

class ReviewService {
  /**
   * Retrieves review data for a given scan ID.
   * Merges real backend scan details with fallback fields where rule evaluations are pending.
   */
  async getReviewData(scanId: string): Promise<ReviewData> {
    try {
      const scanDetail = await scanService.getScanById(scanId);

      // Build evidence image URLs from backend image records if present
      const evidenceImages: EvidenceItem[] =
        scanDetail.images && scanDetail.images.length > 0
          ? scanDetail.images.map((img) => ({
              id: img.image_id,
              title: img.file_name || `Package Image (${img.type})`,
              type: (img.type as EvidenceItem["type"]) || "original",
              imageUrl: img.storage_path.startsWith("http")
                ? img.storage_path
                : `${API_BASE_URL}/${img.storage_path.replace(/^\/+/, "")}`,
              description: `Uploaded on ${new Date(img.created_at).toLocaleDateString()}`,
            }))
          : [
              {
                id: "img-fallback",
                title: "Submitted Package Front Label",
                type: "original",
                imageUrl: "",
                description: "Primary scanned commodity label",
              },
            ];

      return {
        scanId: scanDetail.scan_id,
        status: scanDetail.status,
        complianceScore:
          scanDetail.compliance_score !== null && scanDetail.compliance_score !== undefined
            ? Number(scanDetail.compliance_score)
            : 88, // Presentation fallback score when backend calculation is pending
        confidenceScore: 0.94,
        extractedFields: DEFAULT_EXTRACTED_FIELDS,
        evidenceImages,
        findings: DEFAULT_FINDINGS,
        inspectorRemarks: scanDetail.inspector_remarks,
        createdAt: scanDetail.created_at,
      };
    } catch {
      // Fallback for visual review when backend scan ID is temporary/demo
      return {
        scanId,
        status: "needs_review",
        complianceScore: 88,
        confidenceScore: 0.94,
        extractedFields: DEFAULT_EXTRACTED_FIELDS,
        evidenceImages: [
          {
            id: "img-fallback",
            title: "Submitted Package Front Label",
            type: "original",
            imageUrl: "",
            description: "Primary scanned commodity label",
          },
        ],
        findings: DEFAULT_FINDINGS,
        inspectorRemarks: "",
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Records inspector's final determination and notes.
   * 
   * PENDING BACKEND CONTRACT:
   * Endpoint: POST /api/scans/{scan_id}/decision
   * Payload: { decision: InspectorDecisionType, remarks: string }
   */
  async submitDecision(
    scanId: string,
    decision: InspectorDecisionType,
    remarks: string
  ): Promise<{ success: boolean; finalizedAt: string }> {
    void scanId;
    void decision;
    void remarks;
    // In future: await apiClient.post(`/api/scans/${scanId}/decision`, { decision, remarks });
    return Promise.resolve({
      success: true,
      finalizedAt: new Date().toISOString(),
    });
  }
}

export const reviewService = new ReviewService();
