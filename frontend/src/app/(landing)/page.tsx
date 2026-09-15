import type { Metadata } from "next";
import {
  HeroContainer,
  ProblemContainer,
  SolutionContainer,
  HowItWorksContainer,
  FeaturesContainer,
  TechStackContainer,
  TeamContainer,
  FAQContainer,
  CTAContainer,
} from "@/components/landing/containers";

export const metadata: Metadata = {
  title: "Validra — Intelligent Packaged Commodity Compliance System",
  description:
    "AI-assisted packaged commodity compliance checking system under India's Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011. Automated OCR, deterministic rule validation, and court-admissible evidence reporting.",
  keywords: [
    "Legal Metrology",
    "Packaged Commodities Rules 2011",
    "Smart India Hackathon 2026",
    "SIH 26034",
    "OCR Compliance",
    "PaddleOCR",
    "Deterministic Rule Engine",
    "Product Verification India",
  ],
  authors: [{ name: "Team VisionMinds" }],
  openGraph: {
    title: "Validra — Intelligent Packaged Commodity Compliance System",
    description:
      "Automated legal metrology verification with zero hallucination deterministic rules and tamper-evident PDF inspection reports.",
    type: "website",
    locale: "en_IN",
  },
};

export default function LandingPage() {
  return (
    <>
      <HeroContainer />
      <ProblemContainer />
      <SolutionContainer />
      <HowItWorksContainer />
      <FeaturesContainer />
      <TechStackContainer />
      <TeamContainer />
      <FAQContainer />
      <CTAContainer />
    </>
  );
}
