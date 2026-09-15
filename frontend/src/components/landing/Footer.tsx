import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { Logo, GithubIcon } from "@/components/shared";
import { FOOTER_SECTIONS } from "@/lib/data/navigation";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800/80 pt-16 pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800/80">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <Logo size="lg" />
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              {SITE_CONFIG.description}
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 max-w-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Smart India Hackathon 2026</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Problem Statement 26034 · AI-Assisted Legal Metrology Verification System.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={SITE_CONFIG.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                aria-label="GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <span className="text-xs text-zinc-400 font-mono">
                Team VisionMinds
              </span>
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_SECTIONS.map((col) => (
            <div key={col.title} className="flex flex-col space-y-3">
              <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 group"
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>
            © {new Date().getFullYear()} Validra. Built for SIH 2026 by{" "}
            <span className="text-zinc-300 font-medium">Team VisionMinds</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1 text-zinc-400">
              Preserving statutory compliance with deterministic precision
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
