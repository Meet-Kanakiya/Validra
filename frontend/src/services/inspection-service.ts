import {
  InspectionListItem,
  InspectionFilterState,
  InspectionPaginationState,
  InspectionDetail,
} from "@/types/inspection";
import { DEFAULT_EXTRACTED_FIELDS, DEFAULT_FINDINGS } from "./review-service";

/**
 * Temporary presentation dataset for inspections.
 * 
 * PENDING BACKEND CONTRACT:
 * Endpoint: GET /api/inspections?search=&status=&page=&limit=
 * Detail: GET /api/inspections/{id}
 * Backend Model: app.models.inspection.Inspection
 */
export const SAMPLE_INSPECTION_LIST: InspectionListItem[] = [
  {
    id: "ins-001",
    code: "INS-1024",
    productName: "Premium Basmati Rice 5kg",
    category: "Packaged Food",
    status: "Compliant",
    date: "Sep 16, 2026",
    score: 96,
    scanId: "scan-1024",
    reportId: "rep-1024",
  },
  {
    id: "ins-002",
    code: "INS-1023",
    productName: "Floor Disinfectant Surface Cleaner 1L",
    category: "Household Chemicals",
    status: "Review",
    date: "Sep 15, 2026",
    score: 78,
    scanId: "scan-1023",
    reportId: null,
  },
  {
    id: "ins-003",
    code: "INS-1022",
    productName: "Hydrating Moisturizer Cream 100g",
    category: "Cosmetics",
    status: "Violation",
    date: "Sep 14, 2026",
    score: 61,
    scanId: "scan-1022",
    reportId: "rep-1022",
  },
  {
    id: "ins-004",
    code: "INS-1021",
    productName: "Sparkling Apple Juice 750ml",
    category: "Packaged Beverage",
    status: "Compliant",
    date: "Sep 13, 2026",
    score: 92,
    scanId: "scan-1021",
    reportId: "rep-1021",
  },
  {
    id: "ins-005",
    code: "INS-1020",
    productName: "Whole Wheat Flour 10kg",
    category: "Packaged Food",
    status: "Compliant",
    date: "Sep 12, 2026",
    score: 95,
    scanId: "scan-1020",
    reportId: "rep-1020",
  },
  {
    id: "ins-006",
    code: "INS-1019",
    productName: "Antiseptic Hand Wash 250ml",
    category: "Personal Care",
    status: "Review",
    date: "Sep 11, 2026",
    score: 74,
    scanId: "scan-1019",
    reportId: null,
  },
  {
    id: "ins-007",
    code: "INS-1018",
    productName: "Refined Sunflower Oil 1L",
    category: "Packaged Food",
    status: "Violation",
    date: "Sep 10, 2026",
    score: 58,
    scanId: "scan-1018",
    reportId: "rep-1018",
  },
  {
    id: "ins-008",
    code: "INS-1017",
    productName: "Herbal Green Tea 50 Bags",
    category: "Beverages",
    status: "Compliant",
    date: "Sep 09, 2026",
    score: 98,
    scanId: "scan-1017",
    reportId: "rep-1017",
  },
];

class InspectionService {
  /**
   * Retrieves a filtered and paginated list of inspections.
   */
  async getInspections(
    filters: InspectionFilterState,
    page: number = 1,
    pageSize: number = 5
  ): Promise<{
    items: InspectionListItem[];
    pagination: InspectionPaginationState;
  }> {
    let filtered = [...SAMPLE_INSPECTION_LIST];

    // Apply text search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((item) => {
        if (filters.status === "compliant") return item.status === "Compliant";
        if (filters.status === "needs_review") return item.status === "Review";
        if (filters.status === "violation") return item.status === "Violation";
        if (filters.status === "pending") return item.status === "Pending";
        return true;
      });
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      pagination: {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Retrieves full details for a single inspection by reference ID.
   */
  async getInspectionById(id: string): Promise<InspectionDetail> {
    const item = SAMPLE_INSPECTION_LIST.find(
      (insp) => insp.id === id || insp.code.toLowerCase() === id.toLowerCase()
    );

    if (!item) {
      // If requested ID is unknown, throw a not found error
      throw new Error(`Inspection record with ID "${id}" was not found.`);
    }

    return {
      id: item.id,
      code: item.code,
      productName: item.productName,
      category: item.category,
      status: item.status,
      score: item.score,
      date: item.date,
      completedAt: `${item.date} 14:30 IST`,
      inspectorName: "Senior Metrology Inspector #IND-409",
      scanId: item.scanId,
      reportId: item.reportId,
      remarks:
        item.status === "Violation"
          ? "Statutory violation recorded under LM Rules 2011 Rule 6(1)(e). Mandatory declarations missing from primary package display panel."
          : item.status === "Review"
          ? "Borderline declaration visibility. Secondary confirmation recommended prior to certificate clearance."
          : "All mandatory statutory declarations verified and fully compliant with Packaged Commodities regulations.",
      findings: item.status === "Violation" ? DEFAULT_FINDINGS : [],
      evidenceImages: [
        {
          id: "ev-1",
          title: "Primary Front Label Capture",
          type: "original",
          imageUrl: "",
          description: "Full frontal packaging surface area",
        },
      ],
      extractedFields: DEFAULT_EXTRACTED_FIELDS,
    };
  }
}

export const inspectionService = new InspectionService();
