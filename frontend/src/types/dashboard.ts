export interface ComplianceTrendPoint {
  date: string;
  complianceRate: number; // Percentage 0-100
  inspectionsCount?: number;
}

export type ViolationSeverity = "high" | "medium" | "low";

export interface ViolationBreakdownItem {
  category: string;
  count: number;
  percentage: number;
  severity: ViolationSeverity;
}

export interface DashboardStatData {
  id: string;
  label: string;
  value: string | number;
  description: string;
  variant: "primary" | "warning" | "success" | "error";
}

export interface DashboardData {
  stats: DashboardStatData[];
  recentInspections: Array<{
    id: string;
    code: string;
    productName: string;
    status: "Compliant" | "Review" | "Violation";
    date: string;
    score: number;
  }>;
  complianceTrends: ComplianceTrendPoint[];
  violationBreakdown: ViolationBreakdownItem[];
}
