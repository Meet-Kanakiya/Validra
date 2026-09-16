import { ReportListItem, ReportDetail } from "@/types/report";
import { DEFAULT_EXTRACTED_FIELDS, DEFAULT_FINDINGS } from "./review-service";

/**
 * Temporary presentation dataset for generated statutory inspection reports.
 * 
 * PENDING BACKEND CONTRACT:
 * Endpoint: GET /api/reports
 * Detail: GET /api/reports/{id}
 * Download: GET /api/reports/{id}/download
 */
export const SAMPLE_REPORT_LIST: ReportListItem[] = [
  {
    id: "rep-1024",
    title: "Statutory Metrology Compliance Certificate",
    inspectionId: "ins-001",
    inspectionCode: "INS-1024",
    productName: "Premium Basmati Rice 5kg",
    generatedAt: "Sep 16, 2026",
    status: "generated",
    complianceResult: "Compliant",
    complianceScore: 96,
    downloadUrl: null, // Backend PDF service pending
  },
  {
    id: "rep-1022",
    title: "Statutory Violation Notice & Audit Report",
    inspectionId: "ins-003",
    inspectionCode: "INS-1022",
    productName: "Hydrating Moisturizer Cream 100g",
    generatedAt: "Sep 14, 2026",
    status: "generated",
    complianceResult: "Non-compliant",
    complianceScore: 61,
    downloadUrl: null,
  },
  {
    id: "rep-1021",
    title: "Packaged Commodity Audit Clearance Report",
    inspectionId: "ins-004",
    inspectionCode: "INS-1021",
    productName: "Sparkling Apple Juice 750ml",
    generatedAt: "Sep 13, 2026",
    status: "generated",
    complianceResult: "Compliant",
    complianceScore: 92,
    downloadUrl: null,
  },
  {
    id: "rep-1020",
    title: "Statutory Metrology Compliance Certificate",
    inspectionId: "ins-005",
    inspectionCode: "INS-1020",
    productName: "Whole Wheat Flour 10kg",
    generatedAt: "Sep 12, 2026",
    status: "generated",
    complianceResult: "Compliant",
    complianceScore: 95,
    downloadUrl: null,
  },
  {
    id: "rep-1018",
    title: "Statutory Violation Notice & Audit Report",
    inspectionId: "ins-007",
    inspectionCode: "INS-1018",
    productName: "Refined Sunflower Oil 1L",
    generatedAt: "Sep 10, 2026",
    status: "generated",
    complianceResult: "Non-compliant",
    complianceScore: 58,
    downloadUrl: null,
  },
  {
    id: "rep-1017",
    title: "Statutory Metrology Compliance Certificate",
    inspectionId: "ins-008",
    inspectionCode: "INS-1017",
    productName: "Herbal Green Tea 50 Bags",
    generatedAt: "Sep 09, 2026",
    status: "generated",
    complianceResult: "Compliant",
    complianceScore: 98,
    downloadUrl: null,
  },
];

class ReportService {
  /**
   * Retrieves list of generated statutory reports.
   */
  async getReports(): Promise<ReportListItem[]> {
    // In future: const res = await apiClient.get<ReportListItem[]>("/api/reports"); return res;
    return Promise.resolve(SAMPLE_REPORT_LIST);
  }

  /**
   * Retrieves complete details of an inspection report by ID.
   */
  async getReportById(id: string): Promise<ReportDetail> {
    const item = SAMPLE_REPORT_LIST.find(
      (rep) => rep.id === id || rep.inspectionCode.toLowerCase() === id.toLowerCase()
    );

    if (!item) {
      throw new Error(`Report with reference ID "${id}" was not found.`);
    }

    return {
      id: item.id,
      title: item.title,
      inspectionId: item.inspectionId,
      inspectionCode: item.inspectionCode,
      productName: item.productName,
      category:
        item.productName.includes("Cream")
          ? "Cosmetics"
          : item.productName.includes("Oil")
          ? "Packaged Food"
          : item.productName.includes("Juice") || item.productName.includes("Tea")
          ? "Beverages"
          : "Packaged Food",
      generatedAt: item.generatedAt,
      inspectorName: "Senior Metrology Officer #IND-409",
      inspectorId: "INS-OFF-409",
      status: item.status,
      complianceResult: item.complianceResult,
      complianceScore: item.complianceScore,
      findingsCount: item.complianceResult === "Non-compliant" ? 1 : 0,
      findings: item.complianceResult === "Non-compliant" ? DEFAULT_FINDINGS : [],
      extractedFields: DEFAULT_EXTRACTED_FIELDS,
      evidenceImages: [
        {
          id: "ev-report-1",
          title: "Audited Package Specimen",
          type: "original",
          imageUrl: "",
          description: "Front display panel evidence capture",
        },
      ],
      remarks:
        item.complianceResult === "Non-compliant"
          ? "Notice under Legal Metrology Act, 2009 Section 36 issued for missing mandatory declarations. Non-compliant retail distribution flagged."
          : "Statutory declarations verified in conformity with Legal Metrology (Packaged Commodities) Rules, 2011. Certificate issued.",
      downloadUrl: item.downloadUrl,
    };
  }

  /**
   * Initiates PDF report export if supported by backend service.
   */
  async downloadReport(reportId: string): Promise<{ supported: boolean; message: string }> {
    void reportId;
    // Backend PDF generation service contract is pending implementation
    return Promise.resolve({
      supported: false,
      message: "Server-side PDF generation is currently pending backend service integration.",
    });
  }
}

export const reportService = new ReportService();
