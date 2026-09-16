import * as React from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Finding } from "@/types/review";
import { FindingCard } from "./FindingCard";
import { cn } from "@/lib/utils";

export interface FindingsListProps {
  findings: Finding[];
  className?: string;
}

/**
 * Renders the statutory findings list or a graceful empty-findings state.
 */
export function FindingsList({ findings, className }: FindingsListProps) {
  return (
    <section
      aria-labelledby="findings-list-title"
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2
            id="findings-list-title"
            className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight"
          >
            Statutory Findings & Violations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Non-compliances evaluated against Legal Metrology Rule thresholds
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>{findings.length} Flagged</span>
        </div>
      </div>

      {findings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-1">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            No violations detected
          </h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            No statutory compliance issues were returned for this inspection scan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {findings.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      )}
    </section>
  );
}
