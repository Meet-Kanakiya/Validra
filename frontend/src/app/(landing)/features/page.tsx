import type { Metadata } from "next";
import { FeaturesContainer } from "@/components/landing/containers/FeaturesContainer";
import { CTAContainer } from "@/components/landing/containers/CTAContainer";

export const metadata: Metadata = {
  title: "Validra Features — Automated Metrology Inspection & Rule Engine",
  description: "Explore Validra's 8 core enterprise capabilities for packaged commodity compliance checking.",
};

export default function FeaturesPage() {
  return (
    <div className="pt-24 pb-12">
      <FeaturesContainer />
      <CTAContainer />
    </div>
  );
}
