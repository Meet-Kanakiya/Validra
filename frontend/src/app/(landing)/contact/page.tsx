import type { Metadata } from "next";
import { SectionWrapper, SectionHeading, ContactForm } from "@/components/landing";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Team VisionMinds — Validra SIH 2026",
  description: "Get in touch with Team VisionMinds regarding Validra, Problem Statement 26034, or legal metrology integrations.",
};

export default function ContactPage() {
  return (
    <div className="pt-24 pb-16">
      <SectionWrapper background="hero">
        <SectionHeading
          badge="Inquiries & Collaboration"
          title="Get In Touch With"
          highlight="Team VisionMinds"
          subtitle="Have questions about our Legal Metrology AI system or want to pilot Validra in your regulatory enforcement jurisdiction?"
        />

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info Card */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SIH 2026 Team</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Team VisionMinds</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Think. Build. Transform. Participating in Smart India Hackathon 2026 under Problem Statement 26034.
              </p>

              <div className="space-y-4 text-sm text-zinc-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Team Repository</div>
                    <div className="font-mono text-xs">github.com/dhruvpatel16120/Validra</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Location</div>
                    <div>India (SIH 2026 National Finalists)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-zinc-800/80 text-xs text-zinc-400">
              Department of Consumer Affairs · Legal Metrology Division
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-6">Send an Inquiry</h3>
            <ContactForm />
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
