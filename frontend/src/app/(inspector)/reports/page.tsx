"use client";

import * as React from "react";
import { PageHeader } from "@/components/inspector/common";
import { ReportList } from "@/components/inspector/reports";
import { reportService } from "@/services/report-service";
import { ReportListItem } from "@/types/report";

export default function ReportsPage() {
  const [reports, setReports] = React.useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    reportService
      .getReports()
      .then((data) => {
        if (!isMounted) return;
        setReports(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load inspection reports.";
        setError(msg);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Reports"
        description="View and access generated statutory inspection certificates and compliance summaries."
      />

      <ReportList
        reports={reports}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
      />
    </div>
  );
}
