import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InspectionPaginationState } from "@/types/inspection";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

export interface InspectionPaginationProps {
  pagination: InspectionPaginationState;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Accessible pagination component for inspections and compliance logs.
 */
export function InspectionPagination({
  pagination,
  onPageChange,
  className,
}: InspectionPaginationProps) {
  const { currentPage, pageSize, totalItems, totalPages } = pagination;

  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate clean page list without exploding numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      aria-label="Inspections pagination"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500",
        className
      )}
    >
      <div>
        Showing{" "}
        <span className="font-medium text-slate-900">{startItem}</span> to{" "}
        <span className="font-medium text-slate-900">{endItem}</span> of{" "}
        <span className="font-medium text-slate-900">{totalItems}</span> inspections
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Page Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5 text-xs text-slate-600 disabled:opacity-40"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          <span>Previous</span>
        </Button>

        {/* Page Number Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  p === currentPage
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {p}
              </button>
            ) : (
              <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                {p}
              </span>
            )
          )}
        </div>

        {/* Next Page Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5 text-xs text-slate-600 disabled:opacity-40"
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </nav>
  );
}
