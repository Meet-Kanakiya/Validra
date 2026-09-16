import * as React from "react";
import { TechItem } from "@/types/landing";
import { Card } from "@/components/shared";

interface TechBadgeProps {
  tech: TechItem;
}

export function TechBadge({ tech }: TechBadgeProps) {
  return (
    <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-xl flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 border border-green-200">
            {tech.category}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {tech.highlight}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-green-800 transition-colors">
          {tech.name}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          {tech.description}
        </p>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Component</span>
        <span className="font-mono text-slate-700">{tech.badge}</span>
      </div>
    </Card>
  );
}
