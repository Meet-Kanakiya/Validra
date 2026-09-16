import * as React from "react";
import { Card } from "@/components/shared";
import { CommonViolation } from "@/types/admin";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface TopViolationsTableProps {
  violations: CommonViolation[];
}

export function TopViolationsTable({ violations }: TopViolationsTableProps) {
  return (
    <Card className="p-5 border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Top 5 Most Common Violations</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Recurring compliance flags prioritized for inspector field enforcement
          </p>
        </div>
        <Link
          href="/admin/rules"
          className="text-xs text-green-700 hover:text-green-800 font-medium inline-flex items-center gap-1"
        >
          <span>View Rule Config</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px] bg-slate-50/60">
              <th className="py-2.5 px-3">Rule</th>
              <th className="py-2.5 px-3">Declaration Field</th>
              <th className="py-2.5 px-3">Common Failure Pattern</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3 text-right">Occurrences</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {violations.map((v) => (
              <tr key={v.ruleCode} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-green-700">
                  {v.ruleCode}
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-900">{v.field}</td>
                <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={v.title}>
                  {v.title}
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
                      v.severity === "CRITICAL"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : v.severity === "HIGH"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-yellow-50 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    {v.severity}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono font-semibold text-right text-slate-900">
                  {v.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
