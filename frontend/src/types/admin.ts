export type UserRole = "admin" | "supervisor" | "inspector";
export type UserStatus = "active" | "inactive" | "invited";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  lastActive: string;
  inspectionsCount: number;
  jurisdiction?: string;
}

export interface DashboardMetric {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  caption: string;
  iconName: string;
}

export interface ComplianceTrendPoint {
  date: string;
  total: number;
  compliant: number;
  violations: number;
  rate: number;
}

export interface ViolationCategoryStat {
  category: string;
  rulePrefix: string;
  count: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  percentage: number;
}

export interface CommonViolation {
  ruleCode: string;
  field: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  count: number;
  legalReference: string;
}

export interface InspectorActivity {
  id: string;
  name: string;
  email: string;
  inspectionsCompleted: number;
  flaggedCount: number;
  avgInspectionTimeMinutes: number;
  accuracyRate: number;
  status: "active" | "away" | "offline";
}

export interface SystemActivityEvent {
  id: string;
  user: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

export type InspectionOverallStatus = "COMPLIANT" | "NON_COMPLIANT" | "NEEDS_REVIEW" | "PENDING";

export interface SystemInspectionFinding {
  id: string;
  ruleCode: string;
  field: string;
  status: "PASS" | "FAIL" | "FLAGGED";
  detectedValue: string;
  confidenceScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  legalRef: string;
  officerRemarks?: string;
}

export interface SystemInspection {
  id: string;
  productName: string;
  brandName: string;
  category: string;
  batchNumber: string;
  inspectorId: string;
  inspectorName: string;
  inspectorEmail: string;
  status: InspectionOverallStatus;
  complianceScore: number;
  violationsCount: number;
  scannedAt: string;
  reviewedAt?: string;
  hashSha256: string;
  qrVerified: boolean;
  findings: SystemInspectionFinding[];
  notes?: string;
}

export interface SystemSettingsConfig {
  ocrConfidenceThreshold: number; // e.g. 85%
  extractionConfidenceThreshold: number; // e.g. 80%
  overallComplianceThreshold: number; // e.g. 90%
  autoFlagOnLowConfidence: boolean;
  tamperProofPdfEnabled: boolean;
  retentionDays: number;
  auditLoggingVerbosity: "NORMAL" | "DETAILED" | "DEBUG";
  enableEmailAlertsOnCritical: boolean;
}
