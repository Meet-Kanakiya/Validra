import * as React from "react";
import { RuleVersion } from "@/types/rule";
import { Card } from "@/components/shared";
import { History } from "lucide-react";

interface RuleVersionHistoryProps {
  history: RuleVersion[];
}

export function RuleVersionHistory({ history }: RuleVersionHistoryProps) {
  return (
    <Card className="p-5 border-slate-200 bg-white space-y-4 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
        <History className="w-4 h-4 text-green-700" />
        <span>Statutory Version History</span>
      </div>

      <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
        {history.map((ver) => (
          <div key={ver.version} className="relative pl-7 space-y-1 text-xs">
            {/* Version timeline point */}
            <div
              className={`absolute left-1.5 top-0.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${
                ver.isCurrent
                  ? "bg-green-700 border-white ring-2 ring-green-600/30"
                  : "bg-slate-300 border-white"
              }`}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900">{ver.version}</span>
                {ver.isCurrent && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-green-50 text-green-800 border border-green-200 font-semibold">
                    Active
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{ver.updatedAt}</span>
            </div>

            <div className="text-[11px] text-slate-600">{ver.changeSummary}</div>
            <div className="text-[10px] text-slate-400 font-mono">By: {ver.updatedBy}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
