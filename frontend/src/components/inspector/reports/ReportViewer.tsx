import * as React from "react";
import Link from "next/link";
import {
  FileCheck2,
  Calendar,
  UserCheck,
  Tag,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { ReportDetail } from "@/types/report";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { ComplianceScoreRing } from "@/components/inspector/review/ComplianceScoreRing";
import { ExtractedFieldsTable } from "@/components/inspector/review/ExtractedFieldsTable";
import { EvidenceViewer } from "@/components/inspector/review/EvidenceViewer";
import { FindingsList } from "@/components/inspector/review/FindingsList";
import { ReportDownloadButton } from "./ReportDownloadButton";
import { cn } from "@/lib/utils";

export interface ReportViewerProps {
  report: ReportDetail;
  className?: string;
}

function ComplianceResultBadge({ result }: { result: ReportDetail["complianceResult"] }) {
  if (result === "Compliant") {
    return (
      <Badge variant="success" className="gap-1 text-xs">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Statutory Compliant</span>
      </Badge>
    );
  }

  if (result === "Needs Review") {
    return (
      <Badge variant="warning" className="gap-1 text-xs">
        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Action Required / Review</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1 text-xs">
      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Statutory Non-compliant</span>
    </Badge>
  );
}

/**
 * ReportViewer component displaying complete statutory compliance audit certificate and evidence.
 */
export function ReportViewer({ report, className }: ReportViewerProps) {
  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
      {/* Official Certificate Banner Header */}
      <section
        aria-label="Official Report Certificate"
        className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6" aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400">
                  Certificate #{report.id.toUpperCase()}
                </span>
                <ComplianceResultBadge result={report.complianceResult} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {report.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <ReportDownloadButton reportId={report.id} downloadUrl={report.downloadUrl} />

            <Link href={`/inspections/${report.inspectionId}`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Source Inspection</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Target Commodity</span>
            </span>
            <p className="font-medium text-slate-800 truncate">{report.productName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date of Issuance</span>
            </span>
            <p className="font-medium text-slate-800">{report.generatedAt}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Signatory Officer</span>
            </span>
            <p className="font-medium text-slate-800">{report.inspectorName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Legal Jurisdiction</span>
            </span>
            <p className="font-medium text-slate-800 font-mono">LM Act 2009 / Rules 2011</p>
          </div>
        </div>
      </section>

      {/* Compliance Ring & Evidence Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceScoreRing
          score={report.complianceScore}
          status={
            report.complianceResult === "Compliant"
              ? "completed"
              : report.complianceResult === "Needs Review"
              ? "needs_review"
              : "quality_failed"
          }
        />
        <EvidenceViewer images={report.evidenceImages} />
      </div>

      {/* Extracted Statutory Declarations */}
      <ExtractedFieldsTable fields={report.extractedFields} />

      {/* Findings List */}
      <FindingsList findings={report.findings} />

      {/* Recorded Inspector Observations */}
      {report.remarks && (
        <section
          aria-labelledby="report-remarks-title"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-2"
        >
          <h3
            id="report-remarks-title"
            className="text-sm font-semibold text-slate-900"
          >
            Signatory Officer Remarks & Statutory Citations
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
            &ldquo;{report.remarks}&rdquo;
          </p>
        </section>
      )}

      {/* Court Admissibility Legal Disclaimer */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 text-xs text-slate-500 space-y-1 text-center">
        <p className="font-medium text-slate-700">
          Statutory Audit Notice
        </p>
        <p className="text-[11px] leading-relaxed max-w-2xl mx-auto">
          This inspection summary report is generated pursuant to the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011. Verified digitally by authorized Metrology Officers.
        </p>
      </div>
    </div>
  );
}
