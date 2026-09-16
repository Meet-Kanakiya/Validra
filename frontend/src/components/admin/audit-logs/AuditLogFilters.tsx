"use client";

import * as React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/shared";

interface AuditLogFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  actionFilter: string;
  onActionFilterChange: (val: string) => void;
  entityFilter: string;
  onEntityFilterChange: (val: string) => void;
}

export function AuditLogFilters({
  search,
  onSearchChange,
  actionFilter,
  onActionFilterChange,
  entityFilter,
  onEntityFilterChange,
}: AuditLogFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search audit trail by user, description, or IP..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={actionFilter}
          onChange={(e) => onActionFilterChange(e.target.value)}
          className="h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 shadow-xs"
        >
          <option value="ALL">All Actions</option>
          <option value="USER_LOGIN">Logins</option>
          <option value="RULE_UPDATE">Rule Updates</option>
          <option value="RULE_CREATE">Rule Creations</option>
          <option value="DOCUMENT_UPLOAD">Doc Ingestions</option>
          <option value="INSPECTION_REVIEW_OVERRIDE">Inspection Overrides</option>
          <option value="USER_INVITED">User Invites</option>
          <option value="REPORT_EXPORT">Report Exports</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => onEntityFilterChange(e.target.value)}
          className="h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 shadow-xs"
        >
          <option value="ALL">All Entity Types</option>
          <option value="rule">Rules</option>
          <option value="inspection">Inspections</option>
          <option value="user">Users</option>
          <option value="document">Documents</option>
          <option value="system">Security / System</option>
        </select>
      </div>
    </div>
  );
}
