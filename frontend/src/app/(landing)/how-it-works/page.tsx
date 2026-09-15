import type { Metadata } from "next";
import { HowItWorksContainer } from "@/components/landing/containers/HowItWorksContainer";
import { SolutionContainer } from "@/components/landing/containers/SolutionContainer";
import { CTAContainer } from "@/components/landing/containers/CTAContainer";

export const metadata: Metadata = {
  title: "How It Works — Validra 6-Stage Compliance Pipeline",
  description: "Detailed pipeline walkthrough: image quality gate, PaddleOCR, Rule 6 validation, and evidence preservation.",
};

export default function HowItWorksPage() {
  return (
    <div className="pt-24 pb-12">
      <HowItWorksContainer />
      <SolutionContainer />
      <CTAContainer />
    </div>
  );
}
