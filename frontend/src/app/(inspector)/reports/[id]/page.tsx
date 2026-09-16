"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, LoadingState, ErrorState } from "@/components/inspector/common";
import { ReportViewer, ReportDownloadButton } from "@/components/inspector/reports";
import { reportService } from "@/services/report-service";
import { ReportDetail } from "@/types/report";
import { Button } from "@/components/shared/ui/button";

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const resolvedParams = React.use(params);
  const reportId = resolvedParams.id;

  const [report, setReport] = React.useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    reportService
      .getReportById(reportId)
      .then((data) => {
        if (!isMounted) return;
        setReport(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load report.";
        setError(msg);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reportId, retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Inspection Report Certificate"
        description={`Official statutory certificate reference: ${report?.id.toUpperCase() || reportId}`}
        actions={
          <div className="flex items-center gap-2.5">
            {report && (
              <ReportDownloadButton
                reportId={report.id}
                downloadUrl={report.downloadUrl}
              />
            )}
            <Link href="/reports">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Reports</span>
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-12">
          <LoadingState message="Loading statutory compliance certificate..." />
        </div>
      ) : error || !report ? (
        <div className="py-8 max-w-lg mx-auto">
          <ErrorState
            title="Inspection Report Not Found"
            description={error || "The specified report reference could not be located."}
            onRetry={handleRetry}
            action={
              <div className="flex items-center gap-3">
                <Link href="/reports">
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>All Reports</span>
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleRetry}
                  className="text-xs"
                >
                  Try Again
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <ReportViewer report={report} />
      )}
    </div>
  );
}
