import * as React from "react";
import { Badge } from "@/components/shared";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  alignment?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  highlight,
  subtitle,
  alignment = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-3.5 mb-12 sm:mb-16",
        alignment === "center" ? "items-center text-center max-w-3xl mx-auto" : "items-start text-left max-w-2xl",
        className
      )}
    >
      {badge && (
        <Badge variant="accent" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          {badge}
        </Badge>
      )}

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
        {title}{" "}
        {highlight && (
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h2>

      {subtitle && (
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
