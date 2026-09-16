import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark" | "auto";
}

export function Logo({
  className,
  showSubtitle = true,
  size = "md",
  theme = "auto",
}: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const titleColor =
    theme === "dark"
      ? "text-white"
      : theme === "light"
      ? "text-slate-900"
      : "text-slate-900 dark:text-white";

  const subtitleColor =
    theme === "dark"
      ? "text-zinc-400"
      : theme === "light"
      ? "text-slate-500"
      : "text-slate-500 dark:text-zinc-400";

  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      {/* Emblem */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-500 p-0.5 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/35 transition-all duration-300",
          iconSizes[size]
        )}
      >
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle grid/radial glow inside logo */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-80" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-emerald-400 relative z-10 transition-transform duration-300 group-hover:scale-110"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Shield with checkmark */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="text-emerald-300 stroke-emerald-300" />
            <path d="m9 12 2 2 4-4" className="text-emerald-400 stroke-emerald-400" />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={cn("font-bold tracking-tight", titleColor, textSizes[size])}>
            VALID<span className="text-emerald-600">RA</span>
          </span>
          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Gov
          </span>
        </div>
        {showSubtitle && (
          <span className={cn("text-[10.5px] font-medium tracking-wider uppercase", subtitleColor)}>
            Legal Metrology AI
          </span>
        )}
      </div>
    </Link>
  );
}
