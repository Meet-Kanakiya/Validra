import { SectionWrapper } from "../SectionWrapper";
import { SectionHeading } from "../SectionHeading";
import { TechBadge } from "../TechBadge";
import { TECH_STACK } from "@/lib/data/landing-tech";

export function TechStackContainer() {
  return (
    <SectionWrapper id="tech-stack" background="muted">
      <SectionHeading
        badge="Modern Architecture"
        title="Powered by Robust, Open &"
        highlight="Compliant Technologies"
        subtitle="Built for zero latency, data privacy, and statutory compliance with Next.js 16, FastAPI, PaddleOCR, and PostgreSQL."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TECH_STACK.map((tech, idx) => (
          <TechBadge key={idx} tech={tech} />
        ))}
      </div>
    </SectionWrapper>
  );
}
