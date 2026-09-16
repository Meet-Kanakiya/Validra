"use client";

import * as React from "react";
import Link from "next/link";
import { AdminUser, UserStatus } from "@/types/admin";
import {
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ArrowRight,
} from "lucide-react";
import { BulkActionBar } from "../common/BulkActionBar";
import { Button } from "@/components/shared";

interface UserTableProps {
  users: AdminUser[];
  onStatusToggle: (id: string, newStatus: UserStatus) => void;
  onBulkStatusUpdate: (ids: string[], newStatus: UserStatus) => void;
}

type SortField = "name" | "role" | "inspectionsCount" | "lastActive";

export function UserTable({ users, onStatusToggle, onBulkStatusUpdate }: UserTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("inspectionsCount");
  const [sortAsc, setSortAsc] = React.useState<boolean>(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") comparison = a.name.localeCompare(b.name);
    if (sortField === "role") comparison = a.role.localeCompare(b.role);
    if (sortField === "inspectionsCount") comparison = a.inspectionsCount - b.inspectionsCount;
    if (sortField === "lastActive") comparison = a.lastActive.localeCompare(b.lastActive);
    return sortAsc ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedUsers.map((u) => u.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {selectedIds.length > 0 && selectedIds.length === paginatedUsers.length ? (
                      <CheckSquare className="w-4 h-4 text-green-700" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    <span>Officer / User</span>
                    {sortField === "name" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-1">
                    <span>Role</span>
                    {sortField === "role" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors text-right"
                  onClick={() => handleSort("inspectionsCount")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Inspections</span>
                    {sortField === "inspectionsCount" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort("lastActive")}
                >
                  <div className="flex items-center gap-1">
                    <span>Last Active</span>
                    {sortField === "lastActive" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((user) => {
                const isSelected = selectedIds.includes(user.id);

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? "bg-green-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleSelectRow(user.id)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-green-700" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="group inline-flex items-center gap-2.5"
                      >
                        <div className="w-7.5 h-7.5 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center font-mono border border-slate-200 text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-green-800 transition-colors">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-medium ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : user.role === "supervisor"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-green-50 text-green-800 border-green-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {user.jurisdiction || "—"}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                      {user.inspectionsCount}
                    </td>

                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {user.lastActive}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                          user.status === "active"
                            ? "bg-green-50 text-green-800 border-green-200"
                            : user.status === "invited"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === "active"
                              ? "bg-green-600"
                              : user.status === "invited"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            onStatusToggle(
                              user.id,
                              user.status === "active" ? "inactive" : "active"
                            )
                          }
                          className="px-2 py-1 rounded text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          {user.status === "active" ? "Deactivate" : "Activate"}
                        </button>

                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="View user details"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50/60 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users
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

      {/* Floating Bulk Operations Toolbar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
      >
        <Button
          size="sm"
          className="h-7.5 text-xs bg-green-700 hover:bg-green-800 text-white"
          onClick={() => {
            onBulkStatusUpdate(selectedIds, "active");
            setSelectedIds([]);
          }}
        >
          Activate Selected
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-7.5 text-xs"
          onClick={() => {
            onBulkStatusUpdate(selectedIds, "inactive");
            setSelectedIds([]);
          }}
        >
          Deactivate Selected
        </Button>
      </BulkActionBar>
    </div>
  );
}
