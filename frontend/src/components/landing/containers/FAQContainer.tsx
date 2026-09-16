import { SectionWrapper } from "../SectionWrapper";
import { SectionHeading } from "../SectionHeading";
import { FAQAccordion } from "../FAQAccordion";
import { FAQ_ITEMS } from "@/lib/data/landing-faq";

export function FAQContainer() {
  return (
    <SectionWrapper id="faq" background="muted">
      <SectionHeading
        badge="Clarifications & Legal Context"
        title="Frequently Asked"
        highlight="Questions"
        subtitle="Understand how Validra operationalizes the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011."
      />

      <FAQAccordion items={FAQ_ITEMS} />
    </SectionWrapper>
  );
}
