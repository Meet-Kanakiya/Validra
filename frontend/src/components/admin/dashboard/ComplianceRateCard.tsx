import * as React from "react";
import { Card } from "@/components/shared";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function ComplianceRateCard() {
  return (
    <Card className="p-5 border-slate-200 bg-white flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Statutory Compliance Index</h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-200 font-medium">
            PCR 2011 Rule 6
          </span>
        </div>

        <div className="flex items-center gap-5 my-2">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-green-600/25 bg-green-50/60">
            <span className="text-xl font-bold text-green-900 font-mono">84.6%</span>
          </div>

          <div className="space-y-2 flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-700" /> Fully Compliant
              </span>
              <span className="font-mono font-semibold text-slate-900">84.6%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Needs Review
              </span>
              <span className="font-mono font-semibold text-amber-700">9.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Non-Compliant
              </span>
              <span className="font-mono font-semibold text-rose-700">6.2%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3.5 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
        Aggregated across 14,820 automated inspections conducted under Legal Metrology standards.
      </div>
    </Card>
  );
}
