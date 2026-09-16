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
        "group relative overflow-hidden border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all duration-200 flex flex-col justify-between rounded-xl p-6",
        className
      )}
    >
      <div>
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-700 group-hover:text-green-800 transition-colors">
              <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:scale-105" />
            </div>

            <span className="text-[11px] font-medium tracking-wide text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {feature.badge}
            </span>
          </div>

          <CardTitle className="text-xl text-slate-900 group-hover:text-green-800 transition-colors">
            {feature.title}
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm mt-2 leading-relaxed">
            {feature.description}
          </CardDescription>
        </CardHeader>
      </div>

      {feature.legalRef && (
        <CardContent className="p-0 pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            {feature.legalRef}
          </span>
          <span className="text-xs font-semibold text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
            Active Rule →
          </span>
        </CardContent>
      )}
    </Card>
  );
}
