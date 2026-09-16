import * as React from "react";
import { AlertTriangle, RotateCcw, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/ui/button";

export interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable ErrorState component for inspector data views.
 */
export function ErrorState({
  icon: Icon = AlertTriangle,
  title = "Unable to load data",
  description = "Something went wrong while loading this information. Please try again.",
  onRetry,
  retryLabel = "Try again",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-rose-200 bg-rose-50/50 shadow-2xs",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-600 max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {action ? (
        <div className="mt-6">{action}</div>
      ) : onRetry ? (
        <div className="mt-6">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{retryLabel}</span>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
