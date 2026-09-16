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
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      default:
        "bg-green-700 text-white hover:bg-green-800 font-medium shadow-xs active:bg-green-900",
      secondary:
        "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 font-medium shadow-xs",
      outline:
        "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-xs",
      ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium",
      glow: "bg-green-700 text-white hover:bg-green-800 font-medium shadow-xs",
      destructive:
        "bg-rose-700 text-white hover:bg-rose-800 font-medium shadow-xs",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-9 px-3.5 text-xs rounded-lg gap-2",
      lg: "h-10 px-4 text-sm rounded-lg gap-2",
      icon: "h-8 w-8 rounded-lg",
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
