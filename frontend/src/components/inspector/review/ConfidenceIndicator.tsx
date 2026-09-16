import * as React from "react";
import { Gauge, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfidenceIndicatorProps {
  confidence: number | null; // e.g., 0.94 for 94%
  className?: string;
}

/**
 * Visual indicator displaying OCR extraction and parsing confidence.
 * Highlights reliability of automated detection without implying legal certainty.
 */
export function ConfidenceIndicator({
  confidence,
  className,
}: ConfidenceIndicatorProps) {
  if (confidence === null || isNaN(confidence)) return null;

  const percentage = Math.round(confidence > 1 ? confidence : confidence * 100);

  const level =
    percentage >= 85
      ? { label: "High Confidence", color: "text-emerald-400", bar: "bg-emerald-500" }
      : percentage >= 70
      ? { label: "Medium Confidence", color: "text-amber-400", bar: "bg-amber-500" }
      : { label: "Low Confidence", color: "text-rose-400", bar: "bg-rose-500" };

  return (
    <div
      aria-label={`Extraction confidence: ${percentage}%, ${level.label}`}
      className={cn(
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 shadow-sm space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-zinc-300">
          <Gauge className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>Extraction Confidence</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className={cn("font-semibold", level.color)}>{level.label}</span>
          <span className="text-zinc-400">({percentage}%)</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", level.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-zinc-400 leading-snug">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-500" aria-hidden="true" />
        <span>
          Confidence indicates how reliably text declarations were localized and recognized by OCR; it does not constitute legal certainty.
        </span>
      </p>
    </div>
  );
}
