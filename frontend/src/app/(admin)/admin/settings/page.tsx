"use client";

import * as React from "react";
import { SystemSettingsConfig } from "@/types/admin";
import {
  getSystemSettings,
  updateSystemSettings,
} from "@/services/admin-settings-service";
import {
  AdminPageHeader,
  ConfidenceThresholdConfig,
  SystemSettingsForm,
} from "@/components/admin";

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<SystemSettingsConfig>({
    ocrConfidenceThreshold: 85,
    extractionConfidenceThreshold: 80,
    overallComplianceThreshold: 90,
    autoFlagOnLowConfidence: true,
    tamperProofPdfEnabled: true,
    retentionDays: 365,
    auditLoggingVerbosity: "DETAILED",
    enableEmailAlertsOnCritical: true,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    getSystemSettings().then(setSettings);
  }, []);

  const handleThresholdChange = (key: keyof SystemSettingsConfig, val: number) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (data: Partial<SystemSettingsConfig>) => {
    setIsSaving(true);
    try {
      const merged = { ...settings, ...data };
      const updated = await updateSystemSettings(merged);
      setSettings(updated);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="System Enforcement & Sensitivity Settings"
        subtitle="Configure OCR confidence gates, Evidence Act retention parameters, and system-wide default thresholds"
        badge="Global Policies"
      />

      <ConfidenceThresholdConfig
        ocrThreshold={settings.ocrConfidenceThreshold}
        onOcrThresholdChange={(val) => handleThresholdChange("ocrConfidenceThreshold", val)}
        extractionThreshold={settings.extractionConfidenceThreshold}
        onExtractionThresholdChange={(val) =>
          handleThresholdChange("extractionConfidenceThreshold", val)
        }
        overallThreshold={settings.overallComplianceThreshold}
        onOverallThresholdChange={(val) =>
          handleThresholdChange("overallComplianceThreshold", val)
        }
      />

      <SystemSettingsForm
        settings={settings}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
