import * as React from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, Clock, ArrowRight } from "lucide-react";
import { InspectionListItem, InspectionPaginationState } from "@/types/inspection";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { InspectionPagination } from "./InspectionPagination";
import { cn } from "@/lib/utils";

export interface InspectionTableProps {
  items: InspectionListItem[];
  pagination: InspectionPaginationState;
  onPageChange: (page: number) => void;
  className?: string;
}

function StatusBadge({ status }: { status: InspectionListItem["status"] }) {
  if (status === "Compliant") {
    return (
      <Badge variant="success" className="gap-1.5 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Compliant</span>
      </Badge>
    );
  }

  if (status === "Review") {
    return (
      <Badge variant="warning" className="gap-1.5 font-medium">
        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Review</span>
      </Badge>
    );
  }

  if (status === "Pending") {
    return (
      <Badge variant="outline" className="gap-1.5 font-medium">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Pending</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1.5 font-medium">
      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Violation</span>
    </Badge>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  const color =
    score >= 90
      ? "text-emerald-700"
      : score >= 75
      ? "text-amber-700"
      : "text-rose-700";

  return <span className={cn("font-semibold font-mono", color)}>{score}%</span>;
}

/**
 * Inspection history table with accessible "View details" row actions and responsive card layout.
 */
export function InspectionTable({
  items,
  pagination,
  onPageChange,
  className,
}: InspectionTableProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs",
        className
      )}
    >
      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-3.5 pr-4">
                Product / Reference ID
              </th>
              <th scope="col" className="py-3.5 px-4">
                Category
              </th>
              <th scope="col" className="py-3.5 px-4">
                Status
              </th>
              <th scope="col" className="py-3.5 px-4">
                Date
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Score
              </th>
              <th scope="col" className="py-3.5 pl-4 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="py-4 pr-4">
                  <div className="font-medium text-slate-900">
                    {item.productName}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {item.code}
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-600 text-xs sm:text-sm">
                  {item.category}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-xs sm:text-sm">
                  {item.date}
                </td>
                <td className="py-4 px-4 text-right whitespace-nowrap">
                  <ScoreIndicator score={item.score} />
                </td>
                <td className="py-4 pl-4 text-right whitespace-nowrap">
                  <Link href={`/inspections/${item.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-slate-500 group-hover:text-emerald-600 gap-1"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-slate-100">
        {items.map((item) => (
          <article
            key={item.id}
            aria-label={`${item.productName} (${item.code})`}
            className="py-4 first:pt-0 last:pb-0 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium text-slate-900 leading-snug">
                  {item.productName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="font-mono">#{item.code}</span>
                  <span>•</span>
                  <span>{item.category}</span>
                </div>
              </div>
              <ScoreIndicator score={item.score} />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <StatusBadge status={item.status} />
              <span>{item.date}</span>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <Link href={`/inspections/${item.id}`} className="w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full h-8 text-xs justify-between"
                >
                  <span>View Inspection Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination Footer */}
      <InspectionPagination
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </div>
  );
}
