import { SectionWrapper } from "../SectionWrapper";
import { SectionHeading } from "../SectionHeading";
import { FeatureCard } from "../FeatureCard";
import { FEATURES } from "@/lib/data/landing-features";

export function FeaturesContainer() {
  return (
    <SectionWrapper id="features" background="default">
      <SectionHeading
        badge="Engine Capabilities"
        title="Enterprise-Grade Features for"
        highlight="Statutory Verification"
        subtitle="Engineered to meet the stringent demands of Legal Metrology enforcement officers, state controllers, and judicial standards."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </SectionWrapper>
  );
}
