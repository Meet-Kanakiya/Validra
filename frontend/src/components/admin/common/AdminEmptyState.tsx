import * as React from "react";
import { LucideIcon, HelpCircle } from "lucide-react";
import { Button } from "@/components/shared";

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminEmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-lg border border-slate-200 bg-white shadow-xs">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-3 border border-slate-200">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
