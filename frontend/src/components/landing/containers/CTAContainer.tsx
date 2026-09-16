import Link from "next/link";
import { Shield, ArrowRight, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { SectionWrapper } from "../SectionWrapper";
import { Button } from "@/components/shared";
import { SITE_CONFIG } from "@/lib/constants";

export function CTAContainer() {
  return (
    <SectionWrapper id="cta" background="hero" className="pb-24 lg:pb-32">
      <div className="relative rounded-2xl border border-green-200 bg-gradient-to-b from-white to-green-50/40 p-8 sm:p-12 lg:p-16 text-center shadow-xs max-w-5xl mx-auto overflow-hidden">
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-green-700" />
            <span>Ready for Field Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight">
            Elevate Legal Metrology Enforcement with{" "}
            <span className="text-green-700">
              Deterministic Precision
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            Eliminate hours of manual scrutiny, standardize evidentiary reports, and safeguard Indian consumer rights with Validra&apos;s intelligent compliance system.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base font-semibold bg-green-700 hover:bg-green-800 text-white shadow-xs">
                <Shield className="w-5 h-5" />
                <span>Launch Inspector Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a
              href={SITE_CONFIG.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" className="h-12 px-6 text-base bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs">
                <span>View Source on GitHub</span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-600 font-medium border-t border-slate-200 w-full max-w-xl">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span>PCR 2011 Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span>SHA-256 Tamper-Proof</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span>Court-Admissible PDF</span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
