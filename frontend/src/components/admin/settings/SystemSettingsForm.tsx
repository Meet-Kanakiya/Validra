"use client";

import * as React from "react";
import { SystemSettingsConfig } from "@/types/admin";
import { Card, Button, Input } from "@/components/shared";
import { ConfirmationDialog } from "../common/ConfirmationDialog";
import { Database, Check } from "lucide-react";

interface SystemSettingsFormProps {
  settings: SystemSettingsConfig;
  onSave: (data: Partial<SystemSettingsConfig>) => void;
  isSaving?: boolean;
}

export function SystemSettingsForm({
  settings,
  onSave,
  isSaving = false,
}: SystemSettingsFormProps) {
  const [retentionDays, setRetentionDays] = React.useState(settings.retentionDays);
  const [autoFlag, setAutoFlag] = React.useState(settings.autoFlagOnLowConfidence);
  const [tamperProofPdf, setTamperProofPdf] = React.useState(settings.tamperProofPdfEnabled);
  const [emailAlerts, setEmailAlerts] = React.useState(settings.enableEmailAlertsOnCritical);
  const [verbosity, setVerbosity] = React.useState(settings.auditLoggingVerbosity);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [savedBanner, setSavedBanner] = React.useState(false);

  const handleSaveConfirmed = () => {
    onSave({
      retentionDays,
      autoFlagOnLowConfidence: autoFlag,
      tamperProofPdfEnabled: tamperProofPdf,
      enableEmailAlertsOnCritical: emailAlerts,
      auditLoggingVerbosity: verbosity,
    });
    setIsConfirmOpen(false);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-slate-200 bg-white shadow-xs space-y-5 rounded-xl">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
          <Database className="w-4 h-4 text-green-700" />
          <h3 className="text-sm font-semibold text-slate-900">
            Data Retention & Cryptographic Evidence Safeguards
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Trail & Image Evidence Retention (Days)
            </label>
            <Input
              type="number"
              min="30"
              max="3650"
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="text-xs font-mono bg-slate-50/50 border-slate-200 focus:bg-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default statutory retention: 365 days under Evidence Act guidelines.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Logging Verbosity Level
            </label>
            <select
              value={verbosity}
              onChange={(e) =>
                setVerbosity(e.target.value as "NORMAL" | "DETAILED" | "DEBUG")
              }
              className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 shadow-xs"
            >
              <option value="NORMAL">Normal (State Changes & Auth)</option>
              <option value="DETAILED">Detailed (Inspections & Rule Edits)</option>
              <option value="DEBUG">Debug (Full Telemetry & Raw Payloads)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={tamperProofPdf}
              onChange={(e) => setTamperProofPdf(e.target.checked)}
              className="rounded border-slate-300 text-green-700 focus:ring-green-700"
            />
            <div>
              <div className="font-semibold text-slate-900">
                Cryptographic SHA-256 Digital PDF Seals
              </div>
              <div className="text-[11px] text-slate-500">
                Embed Section 65B hash digests and dynamic QR code verification on all exported reports.
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={autoFlag}
              onChange={(e) => setAutoFlag(e.target.checked)}
              className="rounded border-slate-300 text-green-700 focus:ring-green-700"
            />
            <div>
              <div className="font-semibold text-slate-900">
                Mandatory Supervisory Escalation on Low Confidence
              </div>
              <div className="text-[11px] text-slate-500">
                Automatically prevent direct inspector certificate signing if any mandatory field score &lt; 85%.
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-slate-300 text-green-700 focus:ring-green-700"
            />
            <div>
              <div className="font-semibold text-slate-900">
                Urgent Email Notifications on CRITICAL Violations
              </div>
              <div className="text-[11px] text-slate-500">
                Dispatch instantaneous alert to district controller when counterfeit or deceptive packaging is flagged.
              </div>
            </div>
          </label>
        </div>
      </Card>

      {savedBanner && (
        <div className="p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-green-700" />
          <span>System configuration parameters successfully committed to PostgreSQL database.</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          onClick={() => setIsConfirmOpen(true)}
          disabled={isSaving}
          className="bg-green-700 hover:bg-green-800 text-white font-semibold shadow-xs"
        >
          {isSaving ? "Saving Config..." : "Commit System Settings"}
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Commit System Configuration Changes?"
        message="These settings govern automated inspection sensitivity, legal evidence retention, and statutory escalation thresholds across all active field devices."
        confirmLabel="Save & Apply Globally"
        onConfirm={handleSaveConfirmed}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
