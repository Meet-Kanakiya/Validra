import * as React from "react";
import { CheckCircle2, Loader2, AlertCircle, Sparkles, Scale, FileText } from "lucide-react";
import { ScanStatus, ProcessingStage } from "@/types/scan";
import { cn } from "@/lib/utils";

export interface ProcessingStatusProps {
  status: ScanStatus;
  currentStage: ProcessingStage;
  error?: string | null;
  className?: string;
}

interface StepInfo {
  id: ProcessingStage;
  label: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: StepInfo[] = [
  {
    id: "received",
    label: "Image Ingestion",
    description: "Validating resolution, hash integrity, and format",
    icon: Sparkles,
  },
  {
    id: "ocr",
    label: "Reading Package Declarations",
    description: "Detecting bounding boxes and extracting text via PaddleOCR",
    icon: FileText,
  },
  {
    id: "rules",
    label: "Evaluating Legal Metrology Rules",
    description: "Validating mandatory declarations, units, and MRP formatting",
    icon: Scale,
  },
  {
    id: "ready",
    label: "Preparing Audit Findings",
    description: "Compiling statutory compliance score and evidence clips",
    icon: CheckCircle2,
  },
];

const STAGE_ORDER: Record<ProcessingStage, number> = {
  received: 1,
  ocr: 2,
  rules: 3,
  ready: 4,
};

/**
 * ProcessingStatus component rendering compliance pipeline progress stages.
 */
export function ProcessingStatus({
  status,
  currentStage,
  error,
  className,
}: ProcessingStatusProps) {
  const currentStepNum = STAGE_ORDER[currentStage] || 1;
  const isFailed = status === "quality_failed";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-6 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            Inspection Analysis in Progress
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated legal metrology verification pipeline
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          <span>Stage {currentStepNum} of 4</span>
        </div>
      </div>

      {isFailed && error && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Vertical Pipeline Steps */}
      <div className="space-y-4">
        {STEPS.map((step) => {
          const stepNum = STAGE_ORDER[step.id];
          const isDone = stepNum < currentStepNum || status === "completed" || status === "needs_review";
          const isCurrent = stepNum === currentStepNum && !isDone && !isFailed;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-4 p-3.5 rounded-xl border transition-colors",
                isDone
                  ? "border-emerald-200 bg-emerald-50/50 text-slate-800"
                  : isCurrent
                  ? "border-emerald-300 bg-emerald-50/20 text-slate-900 shadow-2xs"
                  : "border-slate-200/60 bg-slate-50/40 text-slate-400 opacity-60"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                  isDone
                    ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                    : isCurrent
                    ? "bg-emerald-600 border-emerald-600 text-white animate-pulse"
                    : "bg-slate-100 border-slate-200 text-slate-400"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
