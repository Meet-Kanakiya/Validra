import type { Metadata } from "next";
import { FAQContainer } from "@/components/landing/containers/FAQContainer";
import { CTAContainer } from "@/components/landing/containers/CTAContainer";

export const metadata: Metadata = {
  title: "Validra FAQ — Legal Metrology & Technology Answers",
  description: "Find answers about Legal Metrology Act, 2009, PCR 2011 Rule 6, OCR accuracy, and court-admissibility.",
};

export default function FAQPage() {
  return (
    <div className="pt-24 pb-12">
      <FAQContainer />
      <CTAContainer />
    </div>
  );
}
