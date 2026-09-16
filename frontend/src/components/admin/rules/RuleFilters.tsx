"use client";

import * as React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/shared";

interface RuleFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export function RuleFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  severityFilter,
  onSeverityFilterChange,
  statusFilter,
  onStatusFilterChange,
}: RuleFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by code (e.g. C01), field, or legal reference..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8.5 pl-9 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-700"
        >
          <option value="ALL">All Categories</option>
          <option value="mandatory_declaration">Mandatory Declarations</option>
          <option value="numerical_unit">Numerical Units</option>
          <option value="placement_readability">Placement & Readability</option>
          <option value="format_standard">Format Standards</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => onSeverityFilterChange(e.target.value)}
          className="h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-700"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
  );
}
