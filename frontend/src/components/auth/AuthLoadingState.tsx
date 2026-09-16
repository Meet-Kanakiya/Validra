import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthLoadingStateProps {
  /** Optional status message */
  message?: string;
  /** Optional additional classes */
  className?: string;
}

/**
 * Minimal, accessible authentication loading state indicator.
 * Displays during session verification and route authorization checks.
 */
export function AuthLoadingState({
  message = "Checking your session...",
  className,
}: AuthLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50">
        <Loader2
          className="w-6 h-6 text-emerald-600 animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-slate-700">{message}</p>
      </div>
    </div>
  );
}
