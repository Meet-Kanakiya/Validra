import * as React from "react";
import { cn } from "@/lib/utils";

export interface PasswordStrengthMeterProps {
  /** The current password value to evaluate */
  password: string;
  /** Optional class name */
  className?: string;
}

/**
 * Lightweight, accessible password strength meter component.
 * Evaluates length, letter case, numbers, and special characters.
 */
export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedCriteria = [
    hasMinLength,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  let strengthLabel = "";
  let strengthLevel = 0; // 0 to 4
  let barColor = "bg-zinc-800";
  let textColor = "text-zinc-400";

  if (!password) {
    strengthLabel = "";
    strengthLevel = 0;
  } else if (passedCriteria <= 2) {
    strengthLabel = "Weak";
    strengthLevel = 1;
    barColor = "bg-rose-500";
    textColor = "text-rose-400";
  } else if (passedCriteria === 3) {
    strengthLabel = "Fair";
    strengthLevel = 2;
    barColor = "bg-amber-500";
    textColor = "text-amber-400";
  } else if (passedCriteria === 4) {
    strengthLabel = "Strong";
    strengthLevel = 3;
    barColor = "bg-emerald-500";
    textColor = "text-emerald-400";
  } else {
    strengthLabel = "Very strong";
    strengthLevel = 4;
    barColor = "bg-emerald-400";
    textColor = "text-emerald-300";
  }

  if (!password) {
    return null;
  }

  return (
    <div
      className={cn("space-y-1.5 pt-1", className)}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-400">Password strength:</span>
        <span className={cn("font-medium", textColor)}>{strengthLabel}</span>
      </div>
      <div
        className="grid grid-cols-4 gap-1.5 h-1.5 w-full"
        role="progressbar"
        aria-valuenow={strengthLevel * 25}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Password strength: ${strengthLabel}`}
      >
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-full rounded-full transition-all duration-300",
              step <= strengthLevel ? barColor : "bg-zinc-800"
            )}
          />
        ))}
      </div>
    </div>
  );
}
