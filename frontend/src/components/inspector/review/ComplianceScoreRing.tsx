import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/shared/ui/badge";
import { ScanStatus } from "@/types/scan";
import { cn } from "@/lib/utils";

export interface ComplianceScoreRingProps {
  score: number | null;
  status: ScanStatus;
  className?: string;
}

/**
 * Visual circular score ring displaying automated statutory compliance score and determination.
 */
export function ComplianceScoreRing({
  score,
  status,
  className,
}: ComplianceScoreRingProps) {
  const size = 110;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validScore = score !== null && !isNaN(score) ? Math.min(Math.max(0, score), 100) : null;
  const strokeDashoffset = validScore !== null
    ? circumference - (validScore / 100) * circumference
    : circumference;

  const strokeColor =
    validScore === null
      ? "#52525b"
      : validScore >= 90
      ? "#10b981"
      : validScore >= 75
      ? "#f59e0b"
      : "#f43f5e";

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="gap-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Compliant</span>
          </Badge>
        );
      case "needs_review":
        return (
          <Badge variant="warning" className="gap-1 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Needs Review</span>
          </Badge>
        );
      case "quality_failed":
        return (
          <Badge variant="destructive" className="gap-1 text-xs">
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Quality Failed</span>
          </Badge>
        );
      case "finalized":
        return (
          <Badge variant="accent" className="gap-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Finalized</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-xs">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Pending</span>
          </Badge>
        );
    }
  };

  return (
    <div
      aria-label={`Compliance score: ${validScore !== null ? `${validScore}%` : "Unavailable"}, Status: ${status}`}
      className={cn(
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6",
        className
      )}
    >
      {/* Circular Progress SVG */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Track background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          {validScore !== null ? (
            <>
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {validScore}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                Score
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-zinc-400 font-mono">
              N/A
            </span>
          )}
        </div>
      </div>

      {/* Summary Description */}
      <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Automated Audit
          </span>
          {getStatusBadge()}
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          {validScore !== null && validScore >= 90
            ? "High Compliance Adherence"
            : validScore !== null && validScore >= 75
            ? "Moderate Statutory Adherence"
            : "Significant Violations Detected"}
        </h3>

        <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
          Evaluated according to the Legal Metrology (Packaged Commodities) Rules, 2011. Inspect mandatory fields below before making a final determination.
        </p>
      </div>
    </div>
  );
}
