export type AuditActionType =
  | "USER_LOGIN"
  | "USER_ROLE_CHANGE"
  | "USER_INVITED"
  | "USER_STATUS_TOGGLE"
  | "RULE_CREATE"
  | "RULE_UPDATE"
  | "RULE_DELETE"
  | "DOCUMENT_UPLOAD"
  | "DOCUMENT_REPROCESS"
  | "INSPECTION_REVIEW_OVERRIDE"
  | "SETTINGS_UPDATE"
  | "REPORT_EXPORT";

export type AuditEntityType =
  | "user"
  | "rule"
  | "document"
  | "inspection"
  | "setting"
  | "system";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  ipAddress: string;
  status: "SUCCESS" | "FAILURE" | "SECURITY_ALERT";
  description: string;
  metadata: Record<string, unknown>;
}
