"use client";

import * as React from "react";
import { Search, Filter, Download } from "lucide-react";
import { Input, Button } from "@/components/shared";

interface InspectionFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  inspectorFilter: string;
  onInspectorFilterChange: (val: string) => void;
  onExportCsv: () => void;
}

export function InspectionFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  inspectorFilter,
  onInspectorFilterChange,
  onExportCsv,
}: InspectionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by product name, brand, or ID (e.g. INS-0842)..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8.5 pl-9 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLIANT">Compliant</option>
          <option value="NON_COMPLIANT">Non-Compliant</option>
          <option value="NEEDS_REVIEW">Needs Review</option>
        </select>

        <select
          value={inspectorFilter}
          onChange={(e) => onInspectorFilterChange(e.target.value)}
          className="h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-700"
        >
          <option value="ALL">All Inspectors</option>
          <option value="Rajesh Sharma">Rajesh Sharma</option>
          <option value="Sunita Deshmukh">Sunita Deshmukh</option>
          <option value="Amitabh Verma">Amitabh Verma</option>
          <option value="Kavita Nair">Kavita Nair</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="h-8.5 gap-1.5 text-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CSV</span>
        </Button>
      </div>
    </div>
  );
}
