import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Reusable LoadingState component for inspector data views.
 */
export function LoadingState({
  message = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center",
        className
      )}
    >
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" aria-hidden="true" />
      <span className="text-sm font-medium text-slate-600">{message}</span>
      <span className="sr-only">Loading content, please wait.</span>
    </div>
  );
}
