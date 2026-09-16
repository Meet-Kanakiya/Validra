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
    muted: "bg-slate-50/70 border-y border-slate-200/80",
    accent: "relative bg-green-50/40 border-y border-green-100",
    hero: "relative bg-white",
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
