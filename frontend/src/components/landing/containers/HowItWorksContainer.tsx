import { SectionWrapper } from "../SectionWrapper";
import { SectionHeading } from "../SectionHeading";
import { StepCard } from "../StepCard";
import { STEPS } from "@/lib/data/landing-steps";

export function HowItWorksContainer() {
  return (
    <SectionWrapper id="how-it-works" background="muted">
      <SectionHeading
        badge="End-To-End Architecture"
        title="Six-Stage Automated"
        highlight="Compliance Pipeline"
        subtitle="From instantaneous retail package capture to digitally sealed court-ready PDF certificates, every step is optimized for speed, precision, and evidentiary rigor."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {STEPS.map((step) => (
          <StepCard key={step.stepNumber} step={step} />
        ))}
      </div>
    </SectionWrapper>
  );
}
