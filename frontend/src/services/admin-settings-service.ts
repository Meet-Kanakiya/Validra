import { SystemSettingsConfig } from "@/types/admin";

let MOCK_SETTINGS: SystemSettingsConfig = {
  ocrConfidenceThreshold: 85,
  extractionConfidenceThreshold: 80,
  overallComplianceThreshold: 90,
  autoFlagOnLowConfidence: true,
  tamperProofPdfEnabled: true,
  retentionDays: 365,
  auditLoggingVerbosity: "DETAILED",
  enableEmailAlertsOnCritical: true,
};

export async function getSystemSettings(): Promise<SystemSettingsConfig> {
  return { ...MOCK_SETTINGS };
}

export async function updateSystemSettings(data: Partial<SystemSettingsConfig>): Promise<SystemSettingsConfig> {
  MOCK_SETTINGS = { ...MOCK_SETTINGS, ...data };
  return { ...MOCK_SETTINGS };
}
