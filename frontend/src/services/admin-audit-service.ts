import { AuditLogEntry } from "@/types/audit-log";

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-901",
    timestamp: "2026-09-16 10:14:22",
    userName: "Dhruv Patel",
    userEmail: "admin@validra.gov.in",
    userRole: "admin",
    action: "RULE_UPDATE",
    entityType: "rule",
    entityId: "C01",
    ipAddress: "192.168.1.45",
    status: "SUCCESS",
    description: "Updated validation logic condition for Rule C01 (MRP currency prefix standardization)",
    metadata: {
      previousVersion: "v1.3.0",
      newVersion: "v1.4.0",
      modifiedFields: ["validationLogic", "applicablePackageTypes"],
    },
  },
  {
    id: "aud-902",
    timestamp: "2026-09-16 09:45:00",
    userName: "Rajesh Sharma",
    userEmail: "rajesh.sharma@lm.gov.in",
    userRole: "inspector",
    action: "REPORT_EXPORT",
    entityType: "inspection",
    entityId: "INS-2026-0842",
    ipAddress: "10.45.12.98",
    status: "SUCCESS",
    description: "Signed and downloaded Court-Admissible Evidence Certificate for Basmati Rice",
    metadata: {
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      complianceScore: 100,
    },
  },
  {
    id: "aud-903",
    timestamp: "2026-09-16 08:37:10",
    userName: "Sunita Deshmukh",
    userEmail: "sunita.deshmukh@lm.gov.in",
    userRole: "inspector",
    action: "INSPECTION_REVIEW_OVERRIDE",
    entityType: "inspection",
    entityId: "INS-2026-0841",
    ipAddress: "10.45.14.110",
    status: "SUCCESS",
    description: "Confirmed Non-Compliance finding for non-standard unit 'mls' on shampoo carton",
    metadata: {
      overriddenRule: "C02",
      previousStatus: "NEEDS_REVIEW",
      finalStatus: "NON_COMPLIANT",
    },
  },
  {
    id: "aud-904",
    timestamp: "2026-09-15 16:30:15",
    userName: "Dhruv Patel",
    userEmail: "admin@validra.gov.in",
    userRole: "admin",
    action: "USER_INVITED",
    entityType: "user",
    entityId: "usr-06",
    ipAddress: "192.168.1.45",
    status: "SUCCESS",
    description: "Dispatched statutory onboarding email invite to field inspector Manoj Chawla",
    metadata: {
      jurisdiction: "Punjab - Ludhiana",
      roleAssigned: "inspector",
    },
  },
  {
    id: "aud-905",
    timestamp: "2026-09-15 14:15:00",
    userName: "System Daemon",
    userEmail: "system@validra.internal",
    userRole: "system",
    action: "DOCUMENT_UPLOAD",
    entityType: "document",
    entityId: "doc-04",
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
    description: "Uploaded statutory circular 'QR Code Traceability for Seeds 2026'",
    metadata: {
      fileSize: 3100000,
      mimeType: "application/pdf",
    },
  },
  {
    id: "aud-906",
    timestamp: "2026-09-14 23:04:12",
    userName: "Unknown",
    userEmail: "guest@unauthorized.net",
    userRole: "unauthenticated",
    action: "USER_LOGIN",
    entityType: "system",
    entityId: "AUTH_GATE",
    ipAddress: "203.0.113.195",
    status: "SECURITY_ALERT",
    description: "Repeated failed login attempts on admin supervisory portal",
    metadata: {
      attempts: 5,
      blockedDurationSeconds: 900,
    },
  },
];

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return [...MOCK_AUDIT_LOGS];
}

export async function getAuditLogById(id: string): Promise<AuditLogEntry | null> {
  const log = MOCK_AUDIT_LOGS.find((l) => l.id === id);
  return log ? { ...log } : null;
}
