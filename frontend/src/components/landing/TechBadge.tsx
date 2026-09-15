import * as React from "react";
import { TechItem } from "@/types/landing";
import { Card } from "@/components/shared";

interface TechBadgeProps {
  tech: TechItem;
}

export function TechBadge({ tech }: TechBadgeProps) {
  return (
    <Card className="p-5 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-300 group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            {tech.category}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            {tech.highlight}
          </span>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
          {tech.name}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          {tech.description}
        </p>
      </div>

      <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
        <span>Component</span>
        <span className="font-mono text-zinc-400">{tech.badge}</span>
      </div>
    </Card>
  );
}
