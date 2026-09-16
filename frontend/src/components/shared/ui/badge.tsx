import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "accent";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    destructive: "bg-rose-50 text-rose-800 border-rose-200",
    outline: "bg-white text-slate-700 border-slate-300",
    accent: "bg-green-50 text-green-800 border-green-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
