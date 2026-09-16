import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "accent";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-zinc-800/80 text-zinc-200 border-zinc-700/80",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    destructive: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    outline: "bg-transparent text-zinc-300 border-zinc-700",
    accent: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
