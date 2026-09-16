import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  background?: "default" | "muted" | "accent" | "hero";
  children: React.ReactNode;
}

export function SectionWrapper({
  id,
  background = "default",
  className,
  children,
  ...props
}: SectionWrapperProps) {
  const backgrounds = {
    default: "bg-transparent",
    muted: "bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 border-y border-zinc-800/50",
    accent: "relative bg-gradient-to-b from-zinc-950 via-indigo-950/20 to-zinc-950 border-y border-indigo-900/30",
    hero: "relative bg-gradient-to-b from-zinc-950 via-zinc-900/80 to-zinc-950 overflow-hidden",
  };

  return (
    <section
      id={id}
      className={cn(
        "relative w-full py-16 sm:py-20 lg:py-24 scroll-mt-20",
        backgrounds[background],
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {children}
      </div>
    </section>
  );
}
