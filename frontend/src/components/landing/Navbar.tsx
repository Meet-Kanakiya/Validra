"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Shield, ArrowRight, ExternalLink } from "lucide-react";
import { Logo, Button } from "@/components/shared";
import { NAV_LINKS } from "@/lib/data/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-xs py-3"
          : "bg-white/70 backdrop-blur-xs border-b border-slate-200/50 py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 rounded-lg">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-1 text-xs xl:text-sm font-medium text-slate-600 hover:text-green-800 hover:bg-white rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="https://github.com/dhruvpatel16120/Validra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2.5 py-1.5 transition-colors inline-flex items-center gap-1.5"
            >
              <span>SIH 2026</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link href="/dashboard">
              <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white font-medium text-xs sm:text-sm shadow-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Inspector Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="/dashboard" className="sm:hidden">
              <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white text-xs px-2.5 h-8">
                Portal
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-green-800 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col space-y-2">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center bg-green-700 hover:bg-green-800 text-white">
                <Shield className="w-4 h-4 mr-2" />
                <span>Launch Inspector Workspace</span>
              </Button>
            </Link>
            <a
              href="https://github.com/dhruvpatel16120/Validra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-center text-slate-500 hover:text-slate-800 py-2"
            >
              Smart India Hackathon 2026 · Problem 26034
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
