import Link from "next/link";
import { Shield, ArrowRight, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { SectionWrapper } from "../SectionWrapper";
import { Button } from "@/components/shared";
import { SITE_CONFIG } from "@/lib/constants";

export function CTAContainer() {
  return (
    <SectionWrapper id="cta" background="hero" className="pb-24 lg:pb-32">
      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-zinc-950 p-8 sm:p-12 lg:p-16 text-center backdrop-blur-2xl shadow-2xl shadow-emerald-950/20 max-w-5xl mx-auto overflow-hidden">
        {/* Subtle grid in background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Field Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Elevate Legal Metrology Enforcement with{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Deterministic Precision
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
            Eliminate hours of manual scrutiny, standardize evidentiary reports, and safeguard Indian consumer rights with Validra&apos;s intelligent compliance system.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button variant="glow" size="lg" className="h-12 px-8 text-base font-semibold shadow-xl shadow-emerald-500/30">
                <Shield className="w-5 h-5 text-zinc-950" />
                <span>Launch Inspector Workspace</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </Button>
            </Link>

            <a
              href={SITE_CONFIG.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" className="h-12 px-6 text-base border-zinc-700 hover:bg-zinc-800">
                <span>View Source on GitHub</span>
                <ExternalLink className="w-4 h-4 text-zinc-400" />
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-zinc-400 font-medium border-t border-zinc-800/80 w-full max-w-xl">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PCR 2011 Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SHA-256 Tamper-Proof</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Court-Admissible PDF</span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
