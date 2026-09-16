"use client";

import * as React from "react";
import { X } from "lucide-react";
import { InspectorSidebar } from "./InspectorSidebar";
import { InspectorHeader } from "./InspectorHeader";
import { cn } from "@/lib/utils";

export interface InspectorShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable InspectorShell layout container.
 * Combines fixed desktop sidebar, slide-over mobile drawer, top header,
 * and fluid main content container.
 */
export function InspectorShell({ children, className }: InspectorShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className={cn("min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased", className)}>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30 border-r border-slate-200/80 bg-white shadow-xs">
        <InspectorSidebar />
      </aside>

      {/* Mobile Slide-over Drawer / Sheet */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Canvas */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 p-4 flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {/* Close Button Header */}
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar content */}
            <InspectorSidebar
              onNavigate={() => setIsMobileMenuOpen(false)}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {/* Main Content Area beside Sidebar */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <InspectorHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Content Canvas */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
