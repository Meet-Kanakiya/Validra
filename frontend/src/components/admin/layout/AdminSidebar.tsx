"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Scale,
  BookOpen,
  FileCheck2,
  FileText,
  Settings,
  ShieldAlert,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/shared";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    badge: undefined,
  },
  {
    label: "Statutory Rules",
    href: "/admin/rules",
    icon: Scale,
    badge: "26 Rules",
  },
  {
    label: "Legal Documents",
    href: "/admin/legal-documents",
    icon: BookOpen,
    badge: undefined,
  },
  {
    label: "All Inspections",
    href: "/admin/inspections",
    icon: FileCheck2,
    badge: "Oversight",
  },
  {
    label: "Security Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
    badge: undefined,
  },
  {
    label: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: undefined,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shadow-xs">
      <div>
        {/* Top Header Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
          <Logo size="sm" />
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">
            Admin
          </span>
        </div>

        {/* Navigation List */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Supervisory Portal
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group",
                  isActive
                    ? "bg-green-50 text-green-900 font-semibold border border-green-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-green-700" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold",
                      isActive
                        ? "bg-green-200/70 text-green-900"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/70"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
          title="Switch to field inspector interface"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500 group-hover:text-green-700" />
            <span>Inspector Workspace</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
        </Link>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-green-100 border border-green-200 text-green-800 flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono">
              DP
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">Dhruv Patel</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">admin@validra.gov.in</div>
            </div>
          </div>

          <Link
            href="/"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors"
            title="Sign out to landing page"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
