import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { InspectorDecisionType } from "@/types/review";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

export interface InspectorDecisionPanelProps {
  selectedDecision: InspectorDecisionType | null;
  onSelectDecision: (decision: InspectorDecisionType) => void;
  onFinalize: () => void;
  disabled?: boolean;
  className?: string;
}

interface OptionConfig {
  value: InspectorDecisionType;
  title: string;
  description: string;
  icon: React.ElementType;
  activeColor: string;
  badgeBg: string;
}

const OPTIONS: OptionConfig[] = [
  {
    value: "Compliant",
    title: "Mark as Compliant",
    description: "All mandatory Legal Metrology declarations verified and within legal tolerances.",
    icon: CheckCircle2,
    activeColor: "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20",
    badgeBg: "text-emerald-700 bg-emerald-100",
  },
  {
    value: "Needs Review",
    title: "Flag for Review",
    description: "Partial ambiguity or borderline declarations requiring secondary supervisor audit.",
    icon: AlertTriangle,
    activeColor: "border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20",
    badgeBg: "text-amber-700 bg-amber-100",
  },
  {
    value: "Non-compliant",
    title: "Issue Statutory Violation",
    description: "Missing declarations, deceptive packaging, or non-compliant units identified.",
    icon: XCircle,
    activeColor: "border-rose-600 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20",
    badgeBg: "text-rose-700 bg-rose-100",
  },
];

/**
 * InspectorDecisionPanel component presenting available compliance determination actions.
 */
export function InspectorDecisionPanel({
  selectedDecision,
  onSelectDecision,
  onFinalize,
  disabled = false,
  className,
}: InspectorDecisionPanelProps) {
  return (
    <section
      aria-labelledby="decision-panel-title"
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5",
        className
      )}
    >
      <div className="pb-3 border-b border-slate-100">
        <h2
          id="decision-panel-title"
          className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight"
        >
          Inspector Final Determination
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select an official determination to finalize this inspection report
        </p>
      </div>

      {/* Decision Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OPTIONS.map((opt) => {
          const isSelected = selectedDecision === opt.value;
          const Icon = opt.icon;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectDecision(opt.value)}
              disabled={disabled}
              className={cn(
                "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
                isSelected
                  ? opt.activeColor
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 hover:border-slate-300",
                disabled && "opacity-50 pointer-events-none cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? opt.badgeBg : "bg-slate-200/80 text-slate-600"
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                {isSelected && (
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider">
                    Selected
                  </span>
                )}
              </div>

              <div>
                <span className="font-semibold text-xs sm:text-sm block text-slate-900">
                  {opt.title}
                </span>
                <p className="text-[11px] text-slate-500 leading-snug mt-1">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Finalize CTA */}
      <div className="flex items-center justify-end pt-2">
        <Button
          type="button"
          variant="default"
          size="md"
          onClick={onFinalize}
          disabled={!selectedDecision || disabled}
          className="gap-2 font-semibold"
        >
          <span>Finalize & Record Decision</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  );
}
