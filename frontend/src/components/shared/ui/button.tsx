import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "glow" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] cursor-pointer";

    const variants = {
      default:
        "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold shadow-md shadow-emerald-500/25",
      secondary:
        "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/60 shadow-sm",
      outline:
        "border border-zinc-700 bg-transparent hover:bg-zinc-800/80 text-zinc-200 hover:text-white",
      ghost: "text-zinc-300 hover:bg-zinc-800/60 hover:text-white",
      glow: "relative bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.55)] hover:brightness-105",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/25",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
