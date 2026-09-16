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
          ? "bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 shadow-lg shadow-black/30 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 bg-zinc-900/60 border border-zinc-800/80 px-4 py-1.5 rounded-full backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-1 text-xs xl:text-sm font-medium text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/50 rounded-full transition-colors"
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
              className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-2 transition-colors inline-flex items-center gap-1.5"
            >
              <span>SIH 2026</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link href="/dashboard">
              <Button variant="glow" size="sm" className="font-semibold text-xs sm:text-sm">
                <Shield className="w-3.5 h-3.5 text-zinc-950" />
                <span>Inspector Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="/dashboard" className="sm:hidden">
              <Button variant="glow" size="sm" className="text-xs px-2.5 h-8">
                Portal
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950/95 border-b border-zinc-800/90 px-4 pt-3 pb-6 space-y-3 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-zinc-300 hover:text-emerald-400 hover:bg-zinc-900 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col space-y-2">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="glow" className="w-full justify-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>Launch Inspector Workspace</span>
              </Button>
            </Link>
            <a
              href="https://github.com/dhruvpatel16120/Validra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-center text-zinc-400 hover:text-white py-2"
            >
              Smart India Hackathon 2026 · Problem 26034
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
