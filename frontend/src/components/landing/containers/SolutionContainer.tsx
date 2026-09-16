import { SectionWrapper } from "../SectionWrapper";
import { SectionHeading } from "../SectionHeading";
import { Check, ShieldCheck, Scale, Cpu, UserCheck } from "lucide-react";

const PILLARS = [
  {
    icon: Cpu,
    step: "01",
    title: "AI Extracts & Localizes",
    badge: "Computer Vision & OCR",
    description: "Multi-angle image preprocessing, OpenCV quality gating, and PaddleOCR isolate mandatory text tokens with pixel-accurate bounding coordinates.",
    result: "High confidence extraction with zero manual data entry.",
  },
  {
    icon: Scale,
    step: "02",
    title: "Rules Evaluate Deterministically",
    badge: "Deterministic Rule Engine",
    description: "Codified Legal Metrology Act & PCR 2011 logic (C01–C26) computes compliance mathematically. Zero generative AI hallucinations or subjectivity.",
    result: "100% explainable legal statutory citations.",
  },
  {
    icon: UserCheck,
    step: "03",
    title: "Human Officer Decides",
    badge: "Decision Support System",
    description: "The certified Inspector reviews findings alongside visual evidence, modifies ambiguous values, inputs remarks, and digitally authorizes the verdict.",
    result: "Preserves constitutional and administrative due process.",
  },
];

export function SolutionContainer() {
  return (
    <SectionWrapper id="solution" background="accent">
      <SectionHeading
        badge="The Core Philosophy"
        title="Validra Operating Principle:"
        highlight="Deterministic Decision Support"
        subtitle="We firmly reject black-box autonomous AI in statutory law. Instead, Validra augments human enforcement officers with mathematical certainty."
      />

      {/* Core Principle Quote Card */}
      <div className="max-w-4xl mx-auto mb-16 p-6 sm:p-8 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 shadow-xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-emerald-400 font-mono mb-1">
              Core Operating Principle
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              &ldquo;AI extracts and assists → Rules evaluate deterministically → Human reviews and decides.&rdquo;
            </p>
            <p className="text-sm text-zinc-400 mt-2">
              Validra provides full auditability. Every non-compliance finding is tied directly to legal clauses in the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>
          </div>
        </div>
      </div>

      {/* Three Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {pillar.step}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700/60">
                    {pillar.badge}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-2">
                  {pillar.title}
                </h3>

                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{pillar.result}</span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
