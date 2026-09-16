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
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6 shadow-sm space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor="inspector-remarks-field"
          className="flex items-center gap-2 text-sm font-semibold text-zinc-200"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>Inspector Remarks & Observations</span>
        </label>
        <span className="text-xs font-mono text-zinc-500">
          {charactersRemaining} characters remaining
        </span>
      </div>

      <p className="text-xs text-zinc-400">
        Record statutory notes, discrepancies, or context to be appended to the official inspection audit record.
      </p>

      <textarea
        id="inspector-remarks-field"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        disabled={disabled}
        rows={4}
        placeholder="Enter official inspector remarks, statutory notices issued, or reasons for review decision..."
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50 transition-colors resize-y min-h-[96px]"
      />
    </div>
  );
}
