import * as React from "react";
import { FileText } from "lucide-react";
import { ReportListItem } from "@/types/report";
import { ReportCard } from "./ReportCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/inspector/common";
import { cn } from "@/lib/utils";

export interface ReportListProps {
  reports: ReportListItem[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * ReportList component handling loading, error, empty, and responsive report card grid rendering.
 */
export function ReportList({
  reports,
  isLoading,
  error,
  onRetry,
  className,
}: ReportListProps) {
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading statutory inspection reports and certificates..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 max-w-lg mx-auto">
        <ErrorState
          title="Unable to load inspection reports"
          description={error}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="py-8 max-w-lg mx-auto">
        <EmptyState
          icon={FileText}
          title="No inspection reports found"
          description="Generated compliance certificates and statutory audit reports will appear here once inspections are finalized."
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
        className
      )}
    >
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
