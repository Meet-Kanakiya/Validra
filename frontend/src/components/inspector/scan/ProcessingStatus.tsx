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
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 space-y-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Inspection Analysis in Progress
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated legal metrology verification pipeline
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          <span>Stage {currentStepNum} of 4</span>
        </div>
      </div>

      {isFailed && error && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
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
                  ? "border-emerald-500/20 bg-emerald-500/5 text-zinc-200"
                  : isCurrent
                  ? "border-zinc-700 bg-zinc-800/50 text-zinc-100"
                  : "border-zinc-800/50 bg-zinc-950/40 text-zinc-500 opacity-60"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                  isDone
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    : isCurrent
                    ? "bg-zinc-800 border-zinc-700 text-emerald-400 animate-pulse"
                    : "bg-zinc-900 border-zinc-800 text-zinc-600"
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
                <p className="text-sm font-medium leading-tight">
                  {step.label}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
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
