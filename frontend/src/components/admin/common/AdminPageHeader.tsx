import * as React from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  badge,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {badge && (
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {children && <div className="flex items-center gap-2.5">{children}</div>}
    </div>
  );
}
