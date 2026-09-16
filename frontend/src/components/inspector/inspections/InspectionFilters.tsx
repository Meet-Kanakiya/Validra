import * as React from "react";
import { Search, X, Filter } from "lucide-react";
import { InspectionFilterState, InspectionStatusType } from "@/types/inspection";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

export interface InspectionFiltersProps {
  filters: InspectionFilterState;
  onChange: (filters: InspectionFilterState) => void;
  onReset: () => void;
  className?: string;
}

const STATUS_OPTIONS: { label: string; value: InspectionStatusType }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Compliant", value: "compliant" },
  { label: "Needs Review", value: "needs_review" },
  { label: "Violation", value: "violation" },
  { label: "Pending", value: "pending" },
];

/**
 * Filter and search controls for inspection history.
 */
export function InspectionFilters({
  filters,
  onChange,
  onReset,
  className,
}: InspectionFiltersProps) {
  const hasActiveFilters =
    filters.search.trim().length > 0 || filters.status !== "all";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs",
        className
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by product, category, or INS-ID..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          aria-label="Search inspections"
        />
      </div>

      {/* Filter Select Controls */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center">
          <Filter
            className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as InspectionStatusType,
              })
            }
            className="pl-8 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
            aria-label="Filter by inspection status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters CTA */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Clear all active filters"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
