import * as React from "react";
import { AlertCircle } from "lucide-react";
import { ViolationBreakdownItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export interface ViolationBreakdownProps {
  data?: ViolationBreakdownItem[];
  className?: string;
}

const DEFAULT_BREAKDOWN_DATA: ViolationBreakdownItem[] = [
  { category: "Missing declaration", count: 14, percentage: 41, severity: "high" },
  { category: "Incorrect quantity", count: 9, percentage: 26, severity: "medium" },
  { category: "Incorrect MRP format", count: 6, percentage: 18, severity: "medium" },
  { category: "Manufacturer details", count: 3, percentage: 9, severity: "low" },
  { category: "Other non-compliances", count: 2, percentage: 6, severity: "low" },
];

const SEVERITY_COLORS = {
  high: {
    bar: "bg-rose-500",
    text: "text-rose-700",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  medium: {
    bar: "bg-amber-500",
    text: "text-amber-700",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  low: {
    bar: "bg-blue-500",
    text: "text-blue-700",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

/**
 * Breakdown of detected statutory violations by rule category and severity.
 */
export function ViolationBreakdown({
  data = DEFAULT_BREAKDOWN_DATA,
  className,
}: ViolationBreakdownProps) {
  const items = data.length > 0 ? data : DEFAULT_BREAKDOWN_DATA;
  const totalViolations = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section
      aria-labelledby="violation-breakdown-heading"
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div>
          <h2
            id="violation-breakdown-heading"
            className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight"
          >
            Violation Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution across Legal Metrology rule categories
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{totalViolations} Total Issues</span>
        </div>
      </div>

      {/* Progress Breakdown List */}
      <div className="py-4 space-y-3.5">
        {items.map((item) => {
          const colors = SEVERITY_COLORS[item.severity];

          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">
                    {item.category}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold border",
                      colors.badge
                    )}
                  >
                    {item.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-500">{item.count} items</span>
                  <span className={cn("font-semibold", colors.text)}>
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", colors.bar)}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> High Severity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Severity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Low Severity
        </span>
      </div>
    </section>
  );
}
