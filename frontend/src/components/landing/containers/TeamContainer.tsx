import { SectionWrapper } from "../SectionWrapper";
import { SectionHeading } from "../SectionHeading";
import { TeamMemberCard } from "../TeamMemberCard";
import { TEAM_MEMBERS } from "@/lib/data/landing-team";

export function TeamContainer() {
  return (
    <SectionWrapper id="team" background="default">
      <SectionHeading
        badge="SIH 2026 Innovators"
        title="Meet Team VisionMinds —"
        highlight="Think. Build. Transform."
        subtitle="Cross-functional engineers, computer vision specialists, and legal metrology contributors solving Problem Statement 26034."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member, idx) => (
          <TeamMemberCard key={idx} member={member} />
        ))}
      </div>
    </SectionWrapper>
  );
}
