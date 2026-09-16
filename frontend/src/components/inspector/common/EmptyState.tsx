import * as React from "react";
import { Inbox, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable EmptyState component for inspector pages and data panels.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-zinc-200">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
