"use client";

import * as React from "react";
import Link from "next/link";
import { SystemInspection } from "@/types/admin";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/shared";

interface AllInspectionsTableProps {
  inspections: SystemInspection[];
}

type SortField = "scannedAt" | "complianceScore" | "status" | "productName";

export function AllInspectionsTable({ inspections }: AllInspectionsTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("scannedAt");
  const [sortAsc, setSortAsc] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 8;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedInspections = [...inspections].sort((a, b) => {
    let comparison = 0;
    if (sortField === "scannedAt") comparison = a.scannedAt.localeCompare(b.scannedAt);
    if (sortField === "complianceScore") comparison = a.complianceScore - b.complianceScore;
    if (sortField === "status") comparison = a.status.localeCompare(b.status);
    if (sortField === "productName") comparison = a.productName.localeCompare(b.productName);
    return sortAsc ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedInspections.length / itemsPerPage) || 1;
  const paginated = sortedInspections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Inspection ID</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("productName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Product & Brand</span>
                    {sortField === "productName" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4">Field Inspector</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {sortField === "status" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                  onClick={() => handleSort("complianceScore")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Score</span>
                    {sortField === "complianceScore" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("scannedAt")}
                >
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    {sortField === "scannedAt" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    <Link
                      href={`/admin/inspections/${item.id}`}
                      className="text-green-700 hover:text-green-800 flex items-center gap-1.5"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{item.id}</span>
                    </Link>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.productName}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.brandName} · <span className="font-mono text-slate-400">{item.batchNumber}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{item.inspectorName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.inspectorEmail}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                        item.status === "COMPLIANT"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : item.status === "NEEDS_REVIEW"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {item.status === "COMPLIANT" && <ShieldCheck className="w-3 h-3" />}
                      {item.status === "NEEDS_REVIEW" && <AlertTriangle className="w-3 h-3" />}
                      {item.status === "NON_COMPLIANT" && <XCircle className="w-3 h-3" />}
                      <span>{item.status.replace("_", " ")}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span
                      className={
                        item.complianceScore === 100
                          ? "text-green-700"
                          : item.complianceScore >= 70
                          ? "text-amber-700"
                          : "text-rose-700"
                      }
                    >
                      {item.complianceScore}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {item.scannedAt}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/inspections/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50/80 text-xs text-slate-600">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedInspections.length)} of {sortedInspections.length} inspections
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="font-mono px-2 text-slate-600">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
