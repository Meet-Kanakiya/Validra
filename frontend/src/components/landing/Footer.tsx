import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { Logo, GithubIcon } from "@/components/shared";
import { FOOTER_SECTIONS } from "@/lib/data/navigation";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <Logo size="lg" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {SITE_CONFIG.description}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 max-w-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Smart India Hackathon 2026</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Problem Statement 26034 · AI-Assisted Legal Metrology Verification System.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={SITE_CONFIG.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                aria-label="GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <span className="text-xs text-slate-400 font-mono">
                Team VisionMinds
              </span>
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_SECTIONS.map((col) => (
            <div key={col.title} className="flex flex-col space-y-3">
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-green-400 transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      {link.href.startsWith("http") && (
                        <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Validra. Built for SIH 2026 by{" "}
            <span className="text-slate-300 font-medium">Team VisionMinds</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1 text-slate-400">
              Preserving statutory compliance with deterministic precision
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
