"use client";

import * as React from "react";
import { CheckSquare, X } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children: React.ReactNode;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  children,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3.5 px-4 py-2.5 rounded-lg bg-white border border-slate-300 shadow-lg text-slate-900 animate-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
        <CheckSquare className="w-4 h-4 text-green-700" />
        <span className="font-mono bg-green-50 text-green-800 border border-green-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
          {selectedCount}
        </span>
        <span className="text-slate-600">selected</span>
      </div>

      <div className="h-4 w-px bg-slate-200" />

      <div className="flex items-center gap-2">{children}</div>

      <button
        onClick={onClearSelection}
        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
        title="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
