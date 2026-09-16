import * as React from "react";
import {
  Camera,
  Cpu,
  FileSearch,
  CheckCircle2,
  UserCheck,
  FileCheck,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { StepItem } from "@/types/landing";

const stepIconMap: Record<string, LucideIcon> = {
  Camera,
  Cpu,
  FileSearch,
  CheckCircle2,
  UserCheck,
  FileCheck,
};

interface StepCardProps {
  step: StepItem;
}

export function StepCard({ step }: StepCardProps) {
  const Icon = stepIconMap[step.icon] || HelpCircle;

  return (
    <div className="relative flex flex-col p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 backdrop-blur-md transition-all duration-300 group hover:-translate-y-1">
      {/* Top section: Step number pill & icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
            0{step.stepNumber}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {step.badge}
          </span>
        </div>

        <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors mb-2">
        {step.title}
      </h3>

      <p className="text-sm text-zinc-400 leading-relaxed mb-4">
        {step.description}
      </p>

      <div className="mt-auto pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 font-mono leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/50">
        {step.detail}
      </div>
    </div>
  );
}
