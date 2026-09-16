import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  UserCheck,
  Tag,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import { InspectionDetail } from "@/types/inspection";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { ComplianceScoreRing } from "@/components/inspector/review/ComplianceScoreRing";
import { ExtractedFieldsTable } from "@/components/inspector/review/ExtractedFieldsTable";
import { EvidenceViewer } from "@/components/inspector/review/EvidenceViewer";
import { FindingsList } from "@/components/inspector/review/FindingsList";
import { cn } from "@/lib/utils";

export interface InspectionDetailViewProps {
  inspection: InspectionDetail;
  className?: string;
}

function StatusIndicator({ status }: { status: InspectionDetail["status"] }) {
  if (status === "Compliant") {
    return (
      <Badge variant="success" className="gap-1 text-xs">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Compliant</span>
      </Badge>
    );
  }

  if (status === "Review") {
    return (
      <Badge variant="warning" className="gap-1 text-xs">
        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Needs Review</span>
      </Badge>
    );
  }

  if (status === "Pending") {
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Pending</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1 text-xs">
      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Violation</span>
    </Badge>
  );
}

/**
 * InspectionDetailView component showing complete inspection summary, compliance findings, and evidence.
 */
export function InspectionDetailView({
  inspection,
  className,
}: InspectionDetailViewProps) {
  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
      {/* Top Meta Summary Card */}
      <section
        aria-label="Inspection Overview"
        className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">
                #{inspection.code}
              </span>
              <StatusIndicator status={inspection.status} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {inspection.productName}
            </h2>
          </div>

          {/* Related Action Links */}
          <div className="flex flex-wrap items-center gap-2.5">
            {inspection.scanId && (
              <Link href={`/scan/${inspection.scanId}/review`}>
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Review</span>
                </Button>
              </Link>
            )}

            {inspection.reportId && (
              <Link href={`/reports/${inspection.reportId}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Report</span>
                </Button>
              </Link>
            )}

            <Link href="/inspections">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-500 hover:text-slate-900">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Inspections</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Category</span>
            </span>
            <p className="font-medium text-slate-800">{inspection.category}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Audit Date</span>
            </span>
            <p className="font-medium text-slate-800">{inspection.date}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assigned Inspector</span>
            </span>
            <p className="font-medium text-slate-800">
              {inspection.inspectorName || "Metrology Officer"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Statutory Rules</span>
            </span>
            <p className="font-medium text-slate-800 font-mono">LM Rules 2011</p>
          </div>
        </div>
      </section>

      {/* Compliance Ring & Evidence Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceScoreRing
          score={inspection.score}
          status={
            inspection.status === "Compliant"
              ? "completed"
              : inspection.status === "Review"
              ? "needs_review"
              : "quality_failed"
          }
        />
        <EvidenceViewer images={inspection.evidenceImages} />
      </div>

      {/* Extracted Declarations Table */}
      <ExtractedFieldsTable fields={inspection.extractedFields} />

      {/* Findings List */}
      <FindingsList findings={inspection.findings} />

      {/* Inspector Remarks Card */}
      {inspection.remarks && (
        <section
          aria-labelledby="inspection-remarks-heading"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-2"
        >
          <h3
            id="inspection-remarks-heading"
            className="text-sm font-semibold text-slate-900"
          >
            Inspector Audit Remarks
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
            &ldquo;{inspection.remarks}&rdquo;
          </p>
        </section>
      )}
    </div>
  );
}
