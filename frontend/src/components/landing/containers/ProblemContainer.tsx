import { SectionWrapper } from "../SectionWrapper";
import { SectionHeading } from "../SectionHeading";
import { AlertOctagon, Clock, FileWarning, SearchX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/shared";

const PROBLEMS = [
  {
    icon: SearchX,
    stat: "70M+",
    badge: "Scale Challenge",
    title: "Overwhelming Retail Packaging Volume",
    description: "Millions of packaged commodities enter Indian commerce daily, vastly outpacing the physical bandwidth of field metrology inspectors.",
    impact: "Unchecked deceptive packaging and illicit labeling slip through routine manual audits.",
    ruleRef: "Enforcement Gap",
  },
  {
    icon: FileWarning,
    stat: "34.8%",
    badge: "Statutory Breaches",
    title: "Deceptive Font Sizes & Omitted Declarations",
    description: "Violations of Rule 6(1) and Table 1 area requirements—such as illegible MRP print, hidden unit sale prices, and absent consumer care contacts.",
    impact: "Consumers are misled by non-standardized units and obscured net quantities.",
    ruleRef: "PCR 2011 Rule 6(1) & Schedule II",
  },
  {
    icon: Clock,
    stat: "45 mins",
    badge: "Operational Bottleneck",
    title: "Cumbersome Manual Verification & Note-taking",
    description: "Officers manually read fine print with magnifiers, cross-reference Gazette notifications, and hand-draft inspection notices.",
    impact: "Severe delays reduce inspection throughput to only a handful of premises per day.",
    ruleRef: "Inspection SOP Delays",
  },
  {
    icon: AlertOctagon,
    stat: "High Risk",
    badge: "Evidentiary Challenge",
    title: "Vulnerable Chain of Custody in Court",
    description: "Paper citations and un-annotated camera photos frequently face judicial dispute under Section 65B due to lack of tamper-proofing.",
    impact: "Enforcement actions are contested or dismissed in consumer metrology courts.",
    ruleRef: "Indian Evidence Act, Sec 65B",
  },
];

export function ProblemContainer() {
  return (
    <SectionWrapper id="problem" background="muted">
      <SectionHeading
        badge="The Challenge"
        title="The Crisis of Manual Packaging"
        highlight="Compliance Enforcement"
        subtitle="Across India's vast retail ecosystem, traditional manual inspection cannot match modern manufacturing velocity or sophisticated deceptive packaging."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {PROBLEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card
              key={idx}
              className="border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all p-6 rounded-xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-slate-900 block">
                      {item.stat}
                    </span>
                    <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>
                </div>

                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-xl text-slate-900 group-hover:text-rose-700 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-rose-700 font-bold shrink-0">Impact:</span>
                  <span className="leading-snug">{item.impact}</span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500">
                  Legal Reference: {item.ruleRef}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
