import * as React from "react";
import { ClipboardCheck, Clock3, CircleCheck, TriangleAlert, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant: "primary" | "warning" | "success" | "error";
}

const STATS: StatItem[] = [
  {
    id: "total-inspections",
    label: "Total Inspections",
    value: 128,
    description: "All inspections",
    icon: ClipboardCheck,
    variant: "primary",
  },
  {
    id: "pending-reviews",
    label: "Pending Reviews",
    value: 12,
    description: "Awaiting review",
    icon: Clock3,
    variant: "warning",
  },
  {
    id: "compliant",
    label: "Compliant",
    value: 94,
    description: "Passed inspections",
    icon: CircleCheck,
    variant: "success",
  },
  {
    id: "violations-found",
    label: "Violations Found",
    value: 34,
    description: "Issues detected",
    icon: TriangleAlert,
    variant: "error",
  },
];

const VARIANT_STYLES = {
  primary: {
    iconWrapper: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  warning: {
    iconWrapper: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  success: {
    iconWrapper: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  error: {
    iconWrapper: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

export interface StatsGridProps {
  className?: string;
}

/**
 * Reusable StatCard component for dashboard metrics.
 */
export function StatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  const styles = VARIANT_STYLES[item.variant];

  return (
    <article
      aria-label={`${item.label}: ${item.value}`}
      className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors"
    >
      <div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center mb-4 shrink-0",
            styles.iconWrapper
          )}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {item.label}
        </span>
        <p className="text-3xl font-bold tracking-tight text-white mt-1">
          {item.value}
        </p>
      </div>

      <p className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800/50">
        {item.description}
      </p>
    </article>
  );
}

/**
 * Responsive StatsGrid displaying four key inspector metrics.
 * 4 columns on desktop, 2 on tablet, 1 on mobile.
 */
export function StatsGrid({ className }: StatsGridProps) {
  return (
    <section aria-label="Inspection Metrics Overview">
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
          className
        )}
      >
        {STATS.map((stat) => (
          <StatCard key={stat.id} item={stat} />
        ))}
      </div>
    </section>
  );
}
