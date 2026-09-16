import * as React from "react";
import Link from "next/link";
import { FileText, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Calendar, Tag } from "lucide-react";
import { ReportListItem } from "@/types/report";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

export interface ReportCardProps {
  report: ReportListItem;
  className?: string;
}

function ResultBadge({ result }: { result: ReportListItem["complianceResult"] }) {
  if (result === "Compliant") {
    return (
      <Badge variant="success" className="gap-1 text-xs">
        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
        <span>Compliant</span>
      </Badge>
    );
  }

  if (result === "Needs Review") {
    return (
      <Badge variant="warning" className="gap-1 text-xs">
        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
        <span>Needs Review</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1 text-xs">
      <XCircle className="w-3 h-3" aria-hidden="true" />
      <span>Non-compliant</span>
    </Badge>
  );
}

/**
 * ReportCard component presenting a statutory inspection certificate summary.
 */
export function ReportCard({ report, className }: ReportCardProps) {
  return (
    <article
      aria-labelledby={`report-title-${report.id}`}
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 hover:shadow-sm transition-all",
        className
      )}
    >
      <div className="space-y-3">
        {/* Header with Reference and Result Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              #{report.id.toUpperCase()}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-400">
              {report.inspectionCode}
            </span>
          </div>

          <ResultBadge result={report.complianceResult} />
        </div>

        {/* Title and Product Name */}
        <div>
          <h3
            id={`report-title-${report.id}`}
            className="text-base font-semibold text-slate-900 leading-snug"
          >
            {report.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            Product: <span className="text-slate-700 font-medium">{report.productName}</span>
          </p>
        </div>

        {/* Metadata items */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>Generated: {report.generatedAt}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span className="font-mono">
              Score: {report.complianceScore !== null ? `${report.complianceScore}%` : "N/A"}
            </span>
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
        <Link href={`/reports/${report.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
