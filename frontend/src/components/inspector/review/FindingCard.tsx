import * as React from "react";
import { AlertTriangle, AlertCircle, Info, Scale, BookOpen } from "lucide-react";
import { Finding, FindingSeverity } from "@/types/review";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils";

export interface FindingCardProps {
  finding: Finding;
  className?: string;
}

function SeverityIndicator({ severity }: { severity: FindingSeverity }) {
  if (severity === "high") {
    return (
      <Badge variant="destructive" className="gap-1 text-[11px] font-semibold">
        <AlertCircle className="w-3 h-3" aria-hidden="true" />
        <span>High Severity</span>
      </Badge>
    );
  }

  if (severity === "medium") {
    return (
      <Badge variant="warning" className="gap-1 text-[11px] font-semibold">
        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
        <span>Medium Severity</span>
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1 text-[11px] font-semibold">
      <Info className="w-3 h-3" aria-hidden="true" />
      <span>Low Severity</span>
    </Badge>
  );
}

/**
 * FindingCard component presenting a specific Legal Metrology statutory non-compliance.
 */
export function FindingCard({ finding, className }: FindingCardProps) {
  return (
    <article
      aria-labelledby={`finding-title-${finding.id}`}
      className={cn(
        "rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 sm:p-5 space-y-3.5",
        finding.severity === "high"
          ? "border-l-4 border-l-rose-500"
          : finding.severity === "medium"
          ? "border-l-4 border-l-amber-500"
          : "border-l-4 border-l-blue-500",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            Target Field: {finding.relatedField}
          </span>
          <h3
            id={`finding-title-${finding.id}`}
            className="text-sm sm:text-base font-semibold text-zinc-100"
          >
            {finding.title}
          </h3>
        </div>

        <SeverityIndicator severity={finding.severity} />
      </div>

      {/* Detected Issue Description */}
      <div className="text-xs text-zinc-300 space-y-1 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/50">
        <span className="font-semibold text-zinc-400 block text-[11px] uppercase tracking-wide">
          Detected Condition:
        </span>
        <p className="leading-relaxed">{finding.detectedIssue}</p>
      </div>

      {/* Statutory Rule Reference & Legal Explanation */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
          <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{finding.ruleReference}</span>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed">
          {finding.explanation}
        </p>

        {finding.evidenceSnippet && (
          <div className="pt-2 flex items-start gap-1.5 text-[11px] font-mono text-zinc-500 border-t border-zinc-800/40">
            <BookOpen className="w-3 h-3 text-zinc-500 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{finding.evidenceSnippet}</span>
          </div>
        )}
      </div>
    </article>
  );
}
