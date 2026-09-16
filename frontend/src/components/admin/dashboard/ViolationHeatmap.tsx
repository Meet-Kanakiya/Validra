import * as React from "react";
import { Card } from "@/components/shared";
import { ViolationCategoryStat } from "@/types/admin";

interface ViolationHeatmapProps {
  stats: ViolationCategoryStat[];
}

export function ViolationHeatmap({ stats }: ViolationHeatmapProps) {
  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "HIGH":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "MEDIUM":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Card className="p-5 border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Violations by Legal Metrology Category</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution across Packaged Commodities Rules 2011 rule clusters
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 font-medium">Total Flags: 2,252</span>
      </div>

      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{stat.category}</span>
                <span className="text-[10px] font-mono text-slate-400">({stat.rulePrefix})</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium ${getSeverityBadgeClass(
                    stat.severity
                  )}`}
                >
                  {stat.severity}
                </span>
                <span className="font-mono font-semibold text-slate-900 text-xs w-12 text-right">
                  {stat.count}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  stat.severity === "CRITICAL"
                    ? "bg-rose-600"
                    : stat.severity === "HIGH"
                    ? "bg-amber-600"
                    : stat.severity === "MEDIUM"
                    ? "bg-yellow-600"
                    : "bg-green-700"
                }`}
                style={{ width: `${stat.percentage * 3.2}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
