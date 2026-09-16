"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export interface InspectorHeaderProps {
  /** Callback triggered when mobile menu button is clicked */
  onOpenMobileMenu?: () => void;
  /** Additional header classes */
  className?: string;
}

/**
 * Determine human-readable section title from current pathname.
 */
function getBreadcrumbTitle(pathname: string): string {
  if (!pathname || pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/scan")) return "Package Inspection Scan";
  if (pathname.startsWith("/inspections")) return "Inspection History";
  if (pathname.startsWith("/reports")) return "Compliance Reports";
  if (pathname.startsWith("/profile")) return "Inspector Profile";
  if (pathname.startsWith("/help")) return "Regulatory Guidelines & Help";
  return "Inspector Workspace";
}

/**
 * Reusable InspectorHeader component.
 * Houses mobile menu trigger, section titles, notification badge, and profile/logout menu.
 */
export function InspectorHeader({
  onOpenMobileMenu,
  className,
}: InspectorHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  // Close menus on outside click or escape key
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const displayName = user?.fullName || "Field Inspector";
  const displayEmail = user?.email || "officer@nic.in";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "IN";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-16 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs",
        className
      )}
    >
      {/* Left Area: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">
            Validra
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {getBreadcrumbTitle(pathname || "")}
          </h1>
        </div>
      </div>

      {/* Right Area: Notifications + User Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationOpen((prev) => !prev);
              setIsUserMenuOpen(false);
            }}
            aria-expanded={isNotificationOpen}
            aria-label="View notifications"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 p-4 shadow-xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Notifications</p>
                <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live
                </span>
              </div>
              <div className="py-6 text-center space-y-1.5">
                <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto" aria-hidden="true" />
                <p className="text-xs text-slate-500">No new notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsUserMenuOpen((prev) => !prev);
              setIsNotificationOpen(false);
            }}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            aria-label="User account menu"
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-slate-900 max-w-[120px] truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                Inspector
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" aria-hidden="true" />
          </button>

          {isUserMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
            >
              {/* Account identity */}
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {displayEmail}
                </p>
                <div className="mt-1.5">
                  <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Inspector Officer
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
