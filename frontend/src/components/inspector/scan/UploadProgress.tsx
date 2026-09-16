import * as React from "react";
import { Loader2, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { ScanUploadState } from "@/types/scan";
import { cn } from "@/lib/utils";

export interface UploadProgressProps {
  state: ScanUploadState;
  fileName?: string;
  fileSize?: number;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Upload progress indicator showing explicit states: preparing, uploading, complete, error.
 */
export function UploadProgress({
  state,
  fileName,
  fileSize,
  error,
  onRetry,
  className,
}: UploadProgressProps) {
  if (state === "idle") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-all",
        state === "error"
          ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
          : state === "complete"
          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
          : "border-zinc-800 bg-zinc-900/60 text-zinc-300",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {state === "preparing" || state === "uploading" ? (
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" aria-hidden="true" />
          ) : state === "complete" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
          )}

          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">
              {state === "preparing"
                ? "Preparing image for upload..."
                : state === "uploading"
                ? "Uploading package image to inspection engine..."
                : state === "complete"
                ? "Upload complete. Initializing analysis pipeline..."
                : "Upload failed"}
            </p>
            {fileName && (
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {fileName} {fileSize ? `(${formatBytes(fileSize)})` : ""}
              </p>
            )}
            {state === "error" && error && (
              <p className="text-xs text-rose-400 mt-1">{error}</p>
            )}
          </div>
        </div>

        {state === "error" && onRetry && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="shrink-0 h-8 px-2.5 text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        )}
      </div>
    </div>
  );
}
