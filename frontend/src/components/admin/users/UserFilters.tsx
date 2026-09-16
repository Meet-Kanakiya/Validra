"use client";

import * as React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/shared";

interface UserFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by name, email, or jurisdiction..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8.5 pl-9 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className="h-8.5 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-700"
        >
          <option value="ALL">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="supervisor">Supervisor</option>
          <option value="inspector">Field Inspector</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="h-8.5 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="invited">Invited</option>
        </select>
      </div>
    </div>
  );
}
