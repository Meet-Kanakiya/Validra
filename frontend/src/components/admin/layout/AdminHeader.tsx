"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/shared";

export function AdminHeader() {
  const pathname = usePathname();

  // Compute breadcrumbs from path
  const pathParts = pathname.split("/").filter(Boolean);
  const breadcrumb = pathParts.length > 1 ? pathParts[1] : "Dashboard";
  const formattedBreadcrumb =
    breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1).replace(/-/g, " ");

  return (
    <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Breadcrumbs & Domain Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className="text-slate-400">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-semibold">{formattedBreadcrumb}</span>
        </div>

        <span className="h-4 w-px bg-slate-200 hidden sm:inline-block" />

        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-[11px] text-green-800 font-mono font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* Right: Quick Search, Pending Alert & Actions */}
      <div className="flex items-center gap-3">
        <div className="relative w-48 lg:w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search rules, users, logs..."
            className="h-8.5 pl-9 text-xs bg-slate-50 border-slate-200 focus:bg-white focus:border-green-700"
          />
        </div>

        {/* Pending Reviews notification trigger */}
        <Link
          href="/admin/inspections?status=NEEDS_REVIEW"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs hover:bg-amber-100/80 transition-colors font-medium"
          title="19 inspections requiring supervisor review"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-semibold font-mono">19</span>
          <span className="hidden lg:inline text-[11px]">Pending Reviews</span>
        </Link>

        {/* SIH Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
          <span>SIH 2026</span>
        </div>
      </div>
    </header>
  );
}
