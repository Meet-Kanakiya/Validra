import * as React from "react";
import {
  ScanLine,
  FileText,
  Layers,
  Scale,
  Brain,
  Eye,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { FeatureItem } from "@/types/landing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/shared";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  ScanLine,
  FileText,
  Layers,
  Scale,
  Brain,
  Eye,
  ShieldCheck,
  BarChart3,
};

interface FeatureCardProps {
  feature: FeatureItem;
  className?: string;
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
  const IconComponent = iconMap[feature.icon] || HelpCircle;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 hover:-translate-y-1 flex flex-col justify-between",
        className
      )}
    >
      {/* Subtle top glow bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500 transition-all duration-500" />

      <div>
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300">
              <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </div>

            <span className="text-[11px] font-medium tracking-wide text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700/60">
              {feature.badge}
            </span>
          </div>

          <CardTitle className="text-xl text-white group-hover:text-emerald-300 transition-colors">
            {feature.title}
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm mt-2 leading-relaxed">
            {feature.description}
          </CardDescription>
        </CardHeader>
      </div>

      {feature.legalRef && (
        <CardContent className="p-0 pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-400">
            {feature.legalRef}
          </span>
          <span className="text-xs font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Active Rule →
          </span>
        </CardContent>
      )}
    </Card>
  );
}
