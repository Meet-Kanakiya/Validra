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
        "min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 shadow-xl shadow-black/20">
        <Loader2
          className="w-6 h-6 text-emerald-400 animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
