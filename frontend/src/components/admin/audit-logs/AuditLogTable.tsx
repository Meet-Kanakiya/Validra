"use client";

import * as React from "react";
import { AuditLogEntry } from "@/types/audit-log";
import { Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/shared";
import { AuditLogDetailDialog } from "./AuditLogDetailDialog";

interface AuditLogTableProps {
  logs: AuditLogEntry[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = React.useState<AuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;
  const paginated = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Officer / Subject</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity Target</th>
                <th className="py-3 px-4">Origin IP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((entry) => (
                <tr
                  key={entry.id}
                  onClick={() => setSelectedLog(entry)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {entry.timestamp}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{entry.userName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{entry.userEmail}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {entry.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-green-700 font-medium">
                    {entry.entityType}/{entry.entityId}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {entry.ipAddress}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                        entry.status === "SUCCESS"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {entry.status === "SUCCESS" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      <span>{entry.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(entry);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-green-700 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
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
            {Math.min(currentPage * itemsPerPage, logs.length)} of {logs.length} audit records
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

      {selectedLog && (
        <AuditLogDetailDialog entry={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
