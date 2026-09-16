import { DashboardData } from "@/types/dashboard";

/**
 * Temporary fallback presentation data for the Inspector Dashboard.
 * Used until the backend exposes GET /api/dashboard/summary.
 * 
 * PENDING BACKEND CONTRACT:
 * Endpoint: GET /api/dashboard/summary
 * Response: DashboardData
 */
export const PRESENTATION_DASHBOARD_DATA: DashboardData = {
  stats: [
    {
      id: "total-inspections",
      label: "Total Inspections",
      value: 128,
      description: "All inspections",
      variant: "primary",
    },
    {
      id: "pending-reviews",
      label: "Pending Reviews",
      value: 12,
      description: "Awaiting review",
      variant: "warning",
    },
    {
      id: "compliant",
      label: "Compliant",
      value: 94,
      description: "Passed inspections",
      variant: "success",
    },
    {
      id: "violations-found",
      label: "Violations Found",
      value: 34,
      description: "Issues detected",
      variant: "error",
    },
  ],
  recentInspections: [
    {
      id: "1",
      code: "INS-1024",
      productName: "Packaged Food Product",
      status: "Compliant",
      date: "Today",
      score: 96,
    },
    {
      id: "2",
      code: "INS-1023",
      productName: "Household Cleaner",
      status: "Review",
      date: "Sep 15",
      score: 78,
    },
    {
      id: "3",
      code: "INS-1022",
      productName: "Cosmetic Product",
      status: "Violation",
      date: "Sep 14",
      score: 61,
    },
    {
      id: "4",
      code: "INS-1021",
      productName: "Packaged Beverage",
      status: "Compliant",
      date: "Sep 13",
      score: 92,
    },
  ],
  complianceTrends: [
    { date: "Week 1", complianceRate: 72, inspectionsCount: 28 },
    { date: "Week 2", complianceRate: 81, inspectionsCount: 34 },
    { date: "Week 3", complianceRate: 77, inspectionsCount: 31 },
    { date: "Week 4", complianceRate: 88, inspectionsCount: 35 },
  ],
  violationBreakdown: [
    { category: "Missing declaration", count: 14, percentage: 41, severity: "high" },
    { category: "Incorrect quantity", count: 9, percentage: 26, severity: "medium" },
    { category: "Incorrect MRP format", count: 6, percentage: 18, severity: "medium" },
    { category: "Manufacturer details", count: 3, percentage: 9, severity: "low" },
    { category: "Other non-compliances", count: 2, percentage: 6, severity: "low" },
  ],
};

class DashboardService {
  /**
   * Fetches dashboard metrics, recent logs, trend points, and violation distribution.
   * Gracefully returns presentation dataset until backend endpoint is available.
   */
  async getDashboardData(): Promise<DashboardData> {
    // Future backend endpoint integration:
    // const res = await apiClient.get<DashboardData>("/dashboard/summary");
    // return res.data;
    return Promise.resolve(PRESENTATION_DASHBOARD_DATA);
  }
}

export const dashboardService = new DashboardService();
