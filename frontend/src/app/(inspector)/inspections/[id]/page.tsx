"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, LoadingState, ErrorState } from "@/components/inspector/common";
import { InspectionDetailView } from "@/components/inspector/inspections";
import { inspectionService } from "@/services/inspection-service";
import { InspectionDetail } from "@/types/inspection";
import { Button } from "@/components/shared/ui/button";

interface InspectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function InspectionDetailPage({
  params,
}: InspectionDetailPageProps) {
  const resolvedParams = React.use(params);
  const inspectionId = resolvedParams.id;

  const [inspection, setInspection] = React.useState<InspectionDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    inspectionService
      .getInspectionById(inspectionId)
      .then((data) => {
        if (!isMounted) return;
        setInspection(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load inspection.";
        setError(msg);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [inspectionId, retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Inspection Audit Detail"
        description={`Record identifier: ${inspection?.code || inspectionId}`}
        actions={
          <Link href="/inspections">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Inspections</span>
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="py-12">
          <LoadingState message="Loading inspection audit record and findings..." />
        </div>
      ) : error || !inspection ? (
        <div className="py-8 max-w-lg mx-auto">
          <ErrorState
            title="Inspection Record Not Found"
            description={error || "The specified inspection reference could not be located."}
            onRetry={handleRetry}
            action={
              <div className="flex items-center gap-3">
                <Link href="/inspections">
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>All Inspections</span>
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
        <InspectionDetailView inspection={inspection} />
      )}
    </div>
  );
}
