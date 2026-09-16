"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { PageHeader, ErrorState } from "@/components/inspector/common";
import { ProcessingStatus } from "@/components/inspector/scan";
import { Button } from "@/components/shared/ui/button";
import { scanService } from "@/services/scan-service";
import { ScanStatus, ProcessingStage } from "@/types/scan";

interface ProcessingPageProps {
  params: Promise<{ id: string }>;
}

export default function ScanProcessingPage({ params }: ProcessingPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const scanId = resolvedParams.id;

  const [status, setStatus] = React.useState<ScanStatus>("processing");
  const [stage, setStage] = React.useState<ProcessingStage>("received");
  const [error, setError] = React.useState<string | null>(null);

  // Poll scan status until completion
  React.useEffect(() => {
    let isCancelled = false;
    let pollInterval: NodeJS.Timeout | null = null;
    let timerCount = 0;

    const checkStatus = async () => {
      try {
        const detail = await scanService.getScanById(scanId);
        if (isCancelled) return;

        setStatus(detail.status);

        if (detail.status === "completed" || detail.status === "needs_review") {
          setStage("ready");
          if (pollInterval) clearInterval(pollInterval);
          // Redirect to review page once processed
          setTimeout(() => {
            if (!isCancelled) {
              router.push(`/scan/${scanId}/review`);
            }
          }, 800);
          return;
        }

        if (detail.status === "quality_failed") {
          setError(
            detail.inspector_remarks ||
              "Image resolution or quality was insufficient for OCR text extraction."
          );
          if (pollInterval) clearInterval(pollInterval);
          return;
        }

        // Progressively advance stage indicators during ongoing pipeline
        timerCount += 1;
        if (timerCount >= 3) {
          setStage("rules");
        } else if (timerCount >= 1) {
          setStage("ocr");
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        // If backend is unreachable or returning error, surface clean retryable error
        const msg =
          err instanceof Error ? err.message : "Unable to query scan status.";
        setError(msg);
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 2.5 seconds
    pollInterval = setInterval(checkStatus, 2500);

    return () => {
      isCancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [scanId, router]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      <PageHeader
        title="Processing Package Scan"
        description={`Scan Reference: ${scanId}`}
      />

      {error ? (
        <ErrorState
          title="Analysis Could Not Complete"
          description={error}
          action={
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => router.push("/scan/new")}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Upload New Photo</span>
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  setError(null);
                  setStatus("processing");
                  setStage("received");
                }}
                className="gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Analysis</span>
              </Button>
            </div>
          }
        />
      ) : (
        <ProcessingStatus
          status={status}
          currentStage={stage}
          error={error}
        />
      )}
    </div>
  );
}
