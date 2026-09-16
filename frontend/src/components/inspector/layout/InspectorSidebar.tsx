"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  ScanLine,
  Shield,
  User,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

export interface InspectorSidebarProps {
  /** Optional callback invoked when a navigation link is clicked (e.g. to close mobile drawer) */
  onNavigate?: () => void;
  /** Additional container classes */
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchMode: "exact" | "prefix";
}

const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    matchMode: "exact",
  },
  {
    label: "New Scan",
    href: "/scan/new",
    icon: ScanLine,
    matchMode: "prefix",
  },
  {
    label: "Inspections",
    href: "/inspections",
    icon: ClipboardCheck,
    matchMode: "prefix",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
    matchMode: "prefix",
  },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    matchMode: "exact",
  },
  {
    label: "Help & Rules",
    href: "/help",
    icon: CircleHelp,
    matchMode: "exact",
  },
];

/**
 * Reusable InspectorSidebar navigation component.
 * Displays brand emblem, active navigation states, grouped navigation,
 * and institutional metadata.
 */
export function InspectorSidebar({ onNavigate, className }: InspectorSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: NavItem): boolean => {
    if (!pathname) return false;
    if (item.matchMode === "exact") {
      return pathname === item.href;
    }
    // Prefix match keeps nested routes (/scan/[id]/review, /inspections/[id], etc.) active
    return pathname.startsWith(item.href) || pathname.startsWith(item.href.replace(/\/new$/, ""));
  };

  const renderNavList = (items: NavItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isItemActive(item);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                active
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors flex-shrink-0",
                  active ? "text-emerald-700" : "text-slate-400 group-hover:text-emerald-700"
                )}
              />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Branding Header */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
        <Logo size="sm" showSubtitle={true} theme="light" />
      </div>

      {/* Navigation Links Area */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto" aria-label="Inspector navigation">
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
            Inspection
          </p>
          {renderNavList(MAIN_NAV_ITEMS)}
        </div>

        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
            Workspace
          </p>
          {renderNavList(SECONDARY_NAV_ITEMS)}
        </div>
      </nav>

      {/* Footer / Institutional Badge */}
      <div className="p-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-800">
          <Shield className="w-4 h-4 text-emerald-700 flex-shrink-0" aria-hidden="true" />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-semibold text-emerald-950 truncate">Legal Metrology</span>
            <span className="text-[10px] text-emerald-700">Act, 2009 &bull; GoI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
