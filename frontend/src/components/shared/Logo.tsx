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
          "relative flex items-center justify-center rounded-lg bg-green-700 text-white shadow-xs group-hover:bg-green-800 transition-colors",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-white"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Official Verification Shield & Checkmark */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={cn("font-bold tracking-tight text-slate-900", textSizes[size])}>
            VALID<span className="text-green-700">RA</span>
          </span>
          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-green-50 text-green-800 border border-green-200">
            Gov
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
            Legal Metrology Portal
          </span>
        )}
      </div>
    </Link>
  );
}
