import * as React from "react";
import { Card } from "@/components/shared";
import { InspectorActivity } from "@/types/admin";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface InspectorActivityTableProps {
  inspectors: InspectorActivity[];
}

export function InspectorActivityTable({ inspectors }: InspectorActivityTableProps) {
  return (
    <Card className="p-5 border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Inspector Field Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational activity, inspection throughput, and verification precision
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-xs text-green-700 hover:text-green-800 font-medium inline-flex items-center gap-1"
        >
          <span>Manage Users</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px] bg-slate-50/60">
              <th className="py-2.5 px-3">Inspector Officer</th>
              <th className="py-2.5 px-3">Completed</th>
              <th className="py-2.5 px-3">Violations Flagged</th>
              <th className="py-2.5 px-3">Avg Pace</th>
              <th className="py-2.5 px-3">Precision Rate</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inspectors.map((insp) => (
              <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-900">{insp.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{insp.email}</div>
                </td>
                <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                  {insp.inspectionsCompleted}
                </td>
                <td className="py-2.5 px-3 font-mono text-amber-700 font-medium">
                  {insp.flaggedCount}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600">
                  {insp.avgInspectionTimeMinutes}m
                </td>
                <td className="py-2.5 px-3 font-mono text-green-700 font-bold">
                  {insp.accuracyRate}%
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                      insp.status === "active"
                        ? "bg-green-50 text-green-800 border-green-200"
                        : insp.status === "away"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        insp.status === "active"
                          ? "bg-green-600"
                          : insp.status === "away"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {insp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
