import * as React from "react";
import { DashboardMetric } from "@/types/admin";
import { FileCheck, Users, Scale, ShieldCheck, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card } from "@/components/shared";

interface SystemStatsGridProps {
  metrics: DashboardMetric[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileCheck,
  Users,
  Scale,
  ShieldCheck,
};

export function SystemStatsGrid({ metrics }: SystemStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = iconMap[m.iconName] || ShieldCheck;
        const isUp = m.trend === "up";
        const isDown = m.trend === "down";

        return (
          <Card
            key={idx}
            className="p-4.5 border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-slate-500">{m.title}</span>
              <div className="w-8 h-8 rounded-md bg-green-50 border border-green-200 flex items-center justify-center text-green-700">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {m.value}
              </span>

              <div
                className={`flex items-center text-xs font-semibold ${
                  isUp ? "text-green-700" : isDown ? "text-rose-700" : "text-slate-500"
                }`}
              >
                {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
                {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
                {!isUp && !isDown && <Minus className="w-3 h-3" />}
                <span>{m.change}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 mt-1.5 truncate">{m.caption}</div>
          </Card>
        );
      })}
    </div>
  );
}
