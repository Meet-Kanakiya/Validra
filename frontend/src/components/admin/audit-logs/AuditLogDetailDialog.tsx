"use client";

import * as React from "react";
import { AuditLogEntry } from "@/types/audit-log";
import { Button } from "@/components/shared";
import { X, ShieldAlert, Terminal } from "lucide-react";

interface AuditLogDetailDialogProps {
  entry: AuditLogEntry;
  onClose: () => void;
}

export function AuditLogDetailDialog({ entry, onClose }: AuditLogDetailDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                entry.status === "SUCCESS"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">{entry.action}</h3>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Log ID: {entry.id} · {entry.timestamp}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Actor / User</div>
              <div className="font-semibold text-slate-900 mt-0.5">{entry.userName}</div>
              <div className="text-[10px] text-slate-500 font-mono">{entry.userEmail}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Origin IP Address</div>
              <div className="font-mono text-slate-700 mt-0.5">{entry.ipAddress}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Entity Target</div>
              <div className="font-mono text-green-700 font-medium mt-0.5">
                {entry.entityType.toUpperCase()}: {entry.entityId}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Status</div>
              <div
                className={`font-mono font-bold mt-0.5 ${
                  entry.status === "SUCCESS" ? "text-green-700" : "text-rose-700"
                }`}
              >
                {entry.status}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">
              Event Narrative
            </div>
            <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              {entry.description}
            </p>
          </div>

          {/* JSON Payload Inspection */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 uppercase font-mono mb-1">
              <Terminal className="w-3.5 h-3.5 text-green-700" />
              <span>Immutable Audit Payload (JSON)</span>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-green-400 overflow-x-auto leading-relaxed">
              {JSON.stringify(entry.metadata, null, 2)}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
