import {
  DashboardMetric,
  ComplianceTrendPoint,
  ViolationCategoryStat,
  CommonViolation,
  InspectorActivity,
  SystemActivityEvent,
} from "@/types/admin";

export async function getDashboardOverviewMetrics(): Promise<DashboardMetric[]> {
  return [
    {
      title: "Total Inspections",
      value: "14,820",
      change: "+12.4%",
      trend: "up",
      caption: "vs previous 30-day period",
      iconName: "FileCheck",
    },
    {
      title: "Active Field Inspectors",
      value: "48",
      change: "+4",
      trend: "up",
      caption: "across 12 state enforcement zones",
      iconName: "Users",
    },
    {
      title: "Statutory Rules Active",
      value: "26",
      change: "v1.4.0",
      trend: "neutral",
      caption: "Legal Metrology PCR 2011 standard",
      iconName: "Scale",
    },
    {
      title: "Overall Compliance Rate",
      value: "84.6%",
      change: "+3.2%",
      trend: "up",
      caption: "statutory declarations passing check",
      iconName: "ShieldCheck",
    },
  ];
}

export async function getComplianceTrend(timeRange: "7d" | "30d" | "90d" = "30d"): Promise<ComplianceTrendPoint[]> {
  if (timeRange === "7d") {
    return [
      { date: "Day 1", total: 420, compliant: 360, violations: 60, rate: 85.7 },
      { date: "Day 2", total: 480, compliant: 410, violations: 70, rate: 85.4 },
      { date: "Day 3", total: 510, compliant: 430, violations: 80, rate: 84.3 },
      { date: "Day 4", total: 460, compliant: 395, violations: 65, rate: 85.8 },
      { date: "Day 5", total: 530, compliant: 455, violations: 75, rate: 85.8 },
      { date: "Day 6", total: 390, compliant: 330, violations: 60, rate: 84.6 },
      { date: "Day 7", total: 470, compliant: 405, violations: 65, rate: 86.1 },
    ];
  }

  // 30 days sampled
  return [
    { date: "Week 1", total: 3100, compliant: 2600, violations: 500, rate: 83.8 },
    { date: "Week 2", total: 3450, compliant: 2900, violations: 550, rate: 84.0 },
    { date: "Week 3", total: 3820, compliant: 3260, violations: 560, rate: 85.3 },
    { date: "Week 4", total: 4450, compliant: 3810, violations: 640, rate: 85.6 },
  ];
}

export async function getViolationHeatmap(): Promise<ViolationCategoryStat[]> {
  return [
    {
      category: "Maximum Retail Price (MRP)",
      rulePrefix: "C01–C04",
      count: 642,
      severity: "CRITICAL",
      percentage: 28.5,
    },
    {
      category: "Net Quantity & Units",
      rulePrefix: "C05–C09",
      count: 518,
      severity: "HIGH",
      percentage: 23.0,
    },
    {
      category: "Consumer Care Details",
      rulePrefix: "C10–C13",
      count: 420,
      severity: "MEDIUM",
      percentage: 18.7,
    },
    {
      category: "Date of Mfg / Packing",
      rulePrefix: "C14–C17",
      count: 360,
      severity: "HIGH",
      percentage: 16.0,
    },
    {
      category: "Manufacturer Address",
      rulePrefix: "C18–C22",
      count: 210,
      severity: "MEDIUM",
      percentage: 9.3,
    },
    {
      category: "Font Size & Placement",
      rulePrefix: "C23–C26",
      count: 102,
      severity: "LOW",
      percentage: 4.5,
    },
  ];
}

export async function getTopViolations(): Promise<CommonViolation[]> {
  return [
    {
      ruleCode: "C01",
      field: "Maximum Retail Price",
      title: "Missing 'Inclusive of all taxes' suffix",
      severity: "CRITICAL",
      count: 489,
      legalReference: "Rule 6(1)(e), PCR 2011",
    },
    {
      ruleCode: "C06",
      field: "Net Quantity",
      title: "Non-standard unit symbol (e.g. gms instead of g)",
      severity: "HIGH",
      count: 384,
      legalReference: "Rule 12 & Rule 13, PCR 2011",
    },
    {
      ruleCode: "C11",
      field: "Consumer Care Contact",
      title: "Missing customer care email address or hotline",
      severity: "HIGH",
      count: 322,
      legalReference: "Rule 6(1)(g), PCR 2011",
    },
    {
      ruleCode: "C14",
      field: "Manufacturing Date",
      title: "Ambiguous date format (lacks Month and Year spec)",
      severity: "MEDIUM",
      count: 271,
      legalReference: "Rule 6(1)(d), PCR 2011",
    },
    {
      ruleCode: "C24",
      field: "Font Height",
      title: "Declaration font height less than statutory minimum for package area",
      severity: "LOW",
      count: 154,
      legalReference: "Rule 7 Table 1, PCR 2011",
    },
  ];
}

export async function getInspectorActivityList(): Promise<InspectorActivity[]> {
  return [
    {
      id: "insp-01",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@lm.gov.in",
      inspectionsCompleted: 342,
      flaggedCount: 68,
      avgInspectionTimeMinutes: 4.2,
      accuracyRate: 98.2,
      status: "active",
    },
    {
      id: "insp-02",
      name: "Sunita Deshmukh",
      email: "sunita.deshmukh@lm.gov.in",
      inspectionsCompleted: 298,
      flaggedCount: 54,
      avgInspectionTimeMinutes: 5.1,
      accuracyRate: 97.6,
      status: "active",
    },
    {
      id: "insp-03",
      name: "Amitabh Verma",
      email: "amitabh.verma@lm.gov.in",
      inspectionsCompleted: 245,
      flaggedCount: 42,
      avgInspectionTimeMinutes: 3.8,
      accuracyRate: 99.1,
      status: "away",
    },
    {
      id: "insp-04",
      name: "Kavita Nair",
      email: "kavita.nair@lm.gov.in",
      inspectionsCompleted: 189,
      flaggedCount: 38,
      avgInspectionTimeMinutes: 4.9,
      accuracyRate: 96.4,
      status: "offline",
    },
  ];
}

export async function getRecentSystemActivity(): Promise<SystemActivityEvent[]> {
  return [
    {
      id: "act-1",
      user: "Dhruv Patel (Admin)",
      userEmail: "admin@validra.gov.in",
      action: "Published Rule C01 Amendment v1.4",
      entityType: "Rule",
      entityId: "C01",
      timestamp: "10 mins ago",
      status: "success",
    },
    {
      id: "act-2",
      user: "Rajesh Sharma",
      userEmail: "rajesh.sharma@lm.gov.in",
      action: "Generated Signed PDF Report #INS-0842",
      entityType: "Inspection",
      entityId: "INS-0842",
      timestamp: "24 mins ago",
      status: "success",
    },
    {
      id: "act-3",
      user: "System Daemon",
      userEmail: "system@validra.internal",
      action: "Ingested Legal Gazette Notification 2026/02",
      entityType: "Document",
      entityId: "DOC-2026-02",
      timestamp: "1 hour ago",
      status: "success",
    },
    {
      id: "act-4",
      user: "Sunita Deshmukh",
      userEmail: "sunita.deshmukh@lm.gov.in",
      action: "Flagged High Severity Unit Discrepancy #INS-0839",
      entityType: "Inspection",
      entityId: "INS-0839",
      timestamp: "2 hours ago",
      status: "warning",
    },
  ];
}

export async function getPendingReviewsCount(): Promise<number> {
  return 19;
}
