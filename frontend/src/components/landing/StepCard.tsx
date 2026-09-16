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
    <div className="relative flex flex-col p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-200 group">
      {/* Top section: Step number pill & icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-50 text-green-700 font-mono font-bold text-xs border border-green-200">
            0{step.stepNumber}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {step.badge}
          </span>
        </div>

        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-green-700 group-hover:border-green-200 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 group-hover:text-green-800 transition-colors mb-2">
        {step.title}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {step.description}
      </p>

      <div className="mt-auto pt-3 border-t border-slate-100 text-xs text-slate-600 font-mono leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        {step.detail}
      </div>
    </div>
  );
}
