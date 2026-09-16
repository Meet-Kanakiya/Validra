"use client";

import * as React from "react";
import { Card } from "@/components/shared";
import { ComplianceTrendPoint } from "@/types/admin";
import { getComplianceTrend } from "@/services/admin-dashboard-service";

export function InspectionTrendChart() {
  const [range, setRange] = React.useState<"7d" | "30d" | "90d">("7d");
  const [points, setPoints] = React.useState<ComplianceTrendPoint[]>([]);

  React.useEffect(() => {
    getComplianceTrend(range).then(setPoints);
  }, [range]);

  const maxTotal = Math.max(...points.map((p) => p.total), 1);

  return (
    <Card className="p-5 border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Inspection Volume & Compliance Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational throughput showing statutory verifications vs. flagged non-compliances
          </p>
        </div>

        {/* Date range switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                range === r
                  ? "bg-white text-green-900 font-bold shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-4 pb-2 border-b border-slate-200">
          {points.map((pt, idx) => {
            const heightPercent = Math.max(15, Math.round((pt.total / maxTotal) * 100));
            const compliantPercent = Math.round((pt.compliant / pt.total) * 100);

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="text-[10px] font-mono text-slate-400 group-hover:text-slate-800 transition-colors">
                  {pt.total}
                </div>

                {/* Stacked bar */}
                <div
                  className="w-full max-w-[32px] rounded-t bg-slate-100 relative overflow-hidden transition-all duration-150"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="absolute bottom-0 inset-x-0 bg-green-700 rounded-t-xs"
                    style={{ height: `${compliantPercent}%` }}
                    title={`Compliant: ${pt.compliant}`}
                  />
                  <div
                    className="absolute top-0 inset-x-0 bg-rose-600"
                    style={{ height: `${100 - compliantPercent}%` }}
                    title={`Violations: ${pt.violations}`}
                  />
                </div>

                <span className="text-[10px] text-slate-500 font-mono truncate w-full text-center">
                  {pt.date}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-green-700 inline-block" />
              <span>Compliant Inspections</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 inline-block" />
              <span>Violations Flagged</span>
            </span>
          </div>

          <span className="font-mono text-green-800 font-semibold text-xs">
            Avg Rate: ~85.2%
          </span>
        </div>
      </div>
    </Card>
  );
}
