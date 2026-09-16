import * as React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/shared";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface PendingReviewsCardProps {
  count: number;
}

export function PendingReviewsCard({ count }: PendingReviewsCardProps) {
  return (
    <Card className="p-5 border-amber-300/80 bg-amber-50/40 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Supervisor Queue</span>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1.5">
          {count} Inspections Awaiting Supervisory Review
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          Submissions with low OCR confidence (&lt;85%) or flagged statutory discrepancies requiring second-officer signoff before PDF certification.
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-amber-200/60 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-500">Response SLA: &lt; 24 hrs</span>

        <Link href="/admin/inspections?status=NEEDS_REVIEW">
          <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-medium gap-1.5 shadow-xs">
            <span>Open Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
