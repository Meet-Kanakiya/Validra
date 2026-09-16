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
    activeColor: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
    badgeBg: "text-emerald-400 bg-emerald-500/20",
  },
  {
    value: "Needs Review",
    title: "Flag for Review",
    description: "Partial ambiguity or borderline declarations requiring secondary supervisor audit.",
    icon: AlertTriangle,
    activeColor: "border-amber-500 bg-amber-500/10 text-amber-300",
    badgeBg: "text-amber-400 bg-amber-500/20",
  },
  {
    value: "Non-compliant",
    title: "Issue Statutory Violation",
    description: "Missing declarations, deceptive packaging, or non-compliant units identified.",
    icon: XCircle,
    activeColor: "border-rose-500 bg-rose-500/10 text-rose-300",
    badgeBg: "text-rose-400 bg-rose-500/20",
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
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6 shadow-sm space-y-5",
        className
      )}
    >
      <div className="pb-3 border-b border-zinc-800/80">
        <h2
          id="decision-panel-title"
          className="text-base sm:text-lg font-semibold text-white tracking-tight"
        >
          Inspector Final Determination
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
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
                "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                isSelected
                  ? opt.activeColor
                  : "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/80 text-zinc-300 hover:border-zinc-700",
                disabled && "opacity-50 pointer-events-none cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? opt.badgeBg : "bg-zinc-800 text-zinc-400"
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
                <span className="font-semibold text-xs sm:text-sm block text-zinc-100">
                  {opt.title}
                </span>
                <p className="text-[11px] text-zinc-400 leading-snug mt-1">
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
