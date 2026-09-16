"use client";

import * as React from "react";
import Link from "next/link";
import { MetrologyRule } from "@/types/rule";
import { ChevronDown, ChevronUp, ArrowRight, Scale } from "lucide-react";
import { Button } from "@/components/shared";

interface RuleTableProps {
  rules: MetrologyRule[];
}

type SortField = "ruleCode" | "severity" | "effectiveFrom" | "field";

export function RuleTable({ rules }: RuleTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("ruleCode");
  const [sortAsc, setSortAsc] = React.useState<boolean>(true);
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

  const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

  const sortedRules = [...rules].sort((a, b) => {
    let comparison = 0;
    if (sortField === "ruleCode") comparison = a.ruleCode.localeCompare(b.ruleCode);
    if (sortField === "field") comparison = a.field.localeCompare(b.field);
    if (sortField === "effectiveFrom") comparison = a.effectiveFrom.localeCompare(b.effectiveFrom);
    if (sortField === "severity") comparison = severityWeight[a.severity] - severityWeight[b.severity];
    return sortAsc ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedRules.length / itemsPerPage) || 1;
  const paginatedRules = sortedRules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-mono uppercase text-[10px]">
                <th
                  className="py-2.5 px-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("ruleCode")}
                >
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    {sortField === "ruleCode" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="py-2.5 px-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("field")}
                >
                  <div className="flex items-center gap-1">
                    <span>Declaration Field</span>
                    {sortField === "field" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-3.5">Statutory Reference</th>
                <th
                  className="py-2.5 px-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("severity")}
                >
                  <div className="flex items-center gap-1">
                    <span>Severity</span>
                    {sortField === "severity" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-3.5">Version</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3.5">
                    <Link
                      href={`/admin/rules/${rule.id}`}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-green-700 hover:text-green-800"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{rule.ruleCode}</span>
                    </Link>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">{rule.field}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                      {rule.condition}
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-xs truncate" title={rule.legalReference}>
                    {rule.legalReference}
                  </td>

                  <td className="py-3 px-3.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
                        rule.severity === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : rule.severity === "HIGH"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : rule.severity === "MEDIUM"
                          ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">
                    {rule.version}
                  </td>

                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                        rule.status === "active"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : rule.status === "draft"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          rule.status === "active"
                            ? "bg-green-600"
                            : rule.status === "draft"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {rule.status}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-right">
                    <Link
                      href={`/admin/rules/${rule.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-green-700 hover:text-green-800 hover:bg-green-50 transition-colors"
                    >
                      <span>Configure</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50/60 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedRules.length)} of {sortedRules.length} statutory rules
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7.5 px-2.5 text-xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="font-mono px-2 text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7.5 px-2.5 text-xs"
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
