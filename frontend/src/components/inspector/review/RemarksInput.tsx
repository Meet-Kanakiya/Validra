import * as React from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RemarksInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

/**
 * Textarea component for manual inspector audit observations and statutory remarks.
 */
export function RemarksInput({
  value,
  onChange,
  disabled = false,
  maxLength = 1000,
  className,
}: RemarksInputProps) {
  const charactersRemaining = maxLength - value.length;

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor="inspector-remarks-field"
          className="flex items-center gap-2 text-sm font-semibold text-slate-900"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Inspector Remarks & Observations</span>
        </label>
        <span className="text-xs font-mono text-slate-400">
          {charactersRemaining} characters remaining
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Record statutory notes, discrepancies, or context to be appended to the official inspection audit record.
      </p>

      <textarea
        id="inspector-remarks-field"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        disabled={disabled}
        rows={4}
        placeholder="Enter official inspector remarks, statutory notices issued, or reasons for review decision..."
        className="w-full rounded-xl border border-slate-300 bg-slate-50/70 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 transition-colors resize-y min-h-[96px]"
      />
    </div>
  );
}
