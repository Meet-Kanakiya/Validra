"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/inspector/common";
import { ComplianceScoreRing } from "./ComplianceScoreRing";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { ExtractedFieldsTable } from "./ExtractedFieldsTable";
import { EvidenceViewer } from "./EvidenceViewer";
import { FindingsList } from "./FindingsList";
import { RemarksInput } from "./RemarksInput";
import { InspectorDecisionPanel } from "./InspectorDecisionPanel";
import { FinalizeDialog } from "./FinalizeDialog";
import { Button } from "@/components/shared/ui/button";
import { ReviewData, InspectorDecisionType } from "@/types/review";
import { reviewService } from "@/services/review-service";

export interface ReviewPageProps {
  initialData: ReviewData;
}

/**
 * ReviewPage composition container coordinating inspection compliance findings, evidence, and decision making.
 */
export function ReviewPage({ initialData }: ReviewPageProps) {
  const router = useRouter();

  const [data] = React.useState<ReviewData>(initialData);
  const [remarks, setRemarks] = React.useState(initialData.inspectorRemarks || "");
  const [selectedDecision, setSelectedDecision] = React.useState<InspectorDecisionType | null>(
    initialData.status === "completed"
      ? "Compliant"
      : initialData.status === "needs_review"
      ? "Needs Review"
      : initialData.status === "quality_failed"
      ? "Non-compliant"
      : null
  );

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isFinalized, setIsFinalized] = React.useState(false);

  const handleConfirmFinalize = async () => {
    if (!selectedDecision) return;

    setIsSubmitting(true);
    try {
      await reviewService.submitDecision(data.scanId, selectedDecision, remarks);
      setIsSubmitting(false);
      setIsDialogOpen(false);
      setIsFinalized(true);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Inspection Review"
        description={`Audit and finalize statutory compliance determination for Scan Reference: ${data.scanId}`}
        actions={
          <Link href="/inspections">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Inspections</span>
            </Button>
          </Link>
        }
      />

      {/* Finalized Banner if already submitted */}
      {isFinalized && (
        <div
          role="status"
          className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold">
              Inspection finalized and signed into statutory record.
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => router.push("/inspections")}
            className="text-xs"
          >
            Return to Inspections List
          </Button>
        </div>
      )}

      {/* Top Grid: Compliance Summary & Evidence Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6 flex flex-col justify-between">
          <ComplianceScoreRing
            score={data.complianceScore}
            status={data.status}
          />
          <ConfidenceIndicator confidence={data.confidenceScore} />
        </div>

        <EvidenceViewer images={data.evidenceImages} />
      </div>

      {/* Extracted Package Information Table */}
      <ExtractedFieldsTable fields={data.extractedFields} />

      {/* Findings / Violations */}
      <FindingsList findings={data.findings} />

      {/* Remarks Input */}
      <RemarksInput
        value={remarks}
        onChange={setRemarks}
        disabled={isFinalized}
      />

      {/* Inspector Decision Panel */}
      {!isFinalized && (
        <InspectorDecisionPanel
          selectedDecision={selectedDecision}
          onSelectDecision={setSelectedDecision}
          onFinalize={() => setIsDialogOpen(true)}
          disabled={isFinalized}
        />
      )}

      {/* Finalize Confirmation Modal Dialog */}
      <FinalizeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmFinalize}
        decision={selectedDecision}
        remarks={remarks}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
