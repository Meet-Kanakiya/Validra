"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "@/components/inspector/common";
import { ReviewPage } from "@/components/inspector/review";
import { reviewService } from "@/services/review-service";
import { ReviewData } from "@/types/review";
import { Button } from "@/components/shared/ui/button";

interface ReviewRouteProps {
  params: Promise<{ id: string }>;
}

export default function ScanReviewRoute({ params }: ReviewRouteProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const scanId = resolvedParams.id;

  const [reviewData, setReviewData] = React.useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    reviewService
      .getReviewData(scanId)
      .then((data) => {
        if (!isMounted) return;
        setReviewData(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load review data.";
        setError(msg);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [scanId, retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading inspection audit record and statutory findings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 max-w-lg mx-auto">
        <ErrorState
          title="Unable to load inspection review"
          description={error}
          onRetry={handleRetry}
          action={
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => router.push("/inspections")}
                className="gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Inspections</span>
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleRetry}
              >
                Try Again
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="py-8 max-w-lg mx-auto">
        <EmptyState
          title="Inspection review not found"
          description="The requested scan reference could not be located or has not yet completed processing."
          action={
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => router.push("/inspections")}
              className="gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Inspections</span>
            </Button>
          }
        />
      </div>
    );
  }

  return <ReviewPage initialData={reviewData} />;
}
