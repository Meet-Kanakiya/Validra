import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, X } from "lucide-react";
import { InspectorDecisionType } from "@/types/review";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils";

export interface FinalizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  decision: InspectorDecisionType | null;
  remarks: string;
  isSubmitting: boolean;
  className?: string;
}

/**
 * Confirmation dialog for finalizing inspector compliance determination.
 */
export function FinalizeDialog({
  isOpen,
  onClose,
  onConfirm,
  decision,
  remarks,
  isSubmitting,
  className,
}: FinalizeDialogProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !decision) return null;

  const getDecisionBadge = () => {
    switch (decision) {
      case "Compliant":
        return (
          <Badge variant="success" className="gap-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Compliant</span>
          </Badge>
        );
      case "Needs Review":
        return (
          <Badge variant="warning" className="gap-1 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Needs Review</span>
          </Badge>
        );
      case "Non-compliant":
        return (
          <Badge variant="destructive" className="gap-1 text-xs">
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Non-compliant</span>
          </Badge>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="finalize-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Window */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 z-10",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3
              id="finalize-dialog-title"
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              Finalize Inspection Determination?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm recording of your official statutory audit findings
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Decision Summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Final Decision:
            </span>
            {getDecisionBadge()}
          </div>

          {remarks.trim() ? (
            <div className="text-xs text-slate-700 pt-2 border-t border-slate-200">
              <span className="text-slate-400 block mb-1 font-mono text-[11px]">
                Recorded Remarks:
              </span>
              <p className="italic bg-white p-2.5 rounded-lg border border-slate-200 max-h-28 overflow-y-auto text-slate-800">
                &ldquo;{remarks}&rdquo;
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-200">
              No manual remarks entered.
            </p>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Once finalized, this determination will be permanently signed into the inspection log.
        </p>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="text-xs gap-1.5 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Recording Decision...</span>
              </>
            ) : (
              <span>Confirm & Finalize</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
