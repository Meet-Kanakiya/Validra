import * as React from "react";
import {
  Scale,
  Camera,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/inspector/common";
import { Badge } from "@/components/shared/ui/badge";

export const metadata = {
  title: "Help & Rules | VALIDRA Inspector",
  description: "Legal Metrology Packaged Commodities Rules 2011 guidelines and inspector field manual.",
};

export default function HelpPage() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Regulatory Guidelines & Field Manual"
        description="Standard operating procedures, statutory declaration requirements under PC Rules 2011, and inspection guidelines."
      />

      {/* Mandatory Declarations Quick Reference */}
      <section
        aria-labelledby="mandatory-declarations-title"
        className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="mandatory-declarations-title"
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
            >
              Mandatory Declarations under Rule 6(1) — PC Rules 2011
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every pre-packaged commodity intended for retail sale must prominently display:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              1. Name and Address of Manufacturer / Packer
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
              Must include complete postal address, registered factory location, or country of origin for imported goods.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              2. Generic or Common Name of Commodity
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
              Generic product nomenclature must not mislead the consumer regarding raw material composition.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              3. Net Quantity in Standard Metric Units
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
              Weight (g, kg), volume (ml, L), or count. Fractional units must strictly conform to Schedule II specifications.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              4. Maximum Retail Price (MRP) & Unit Sale Price
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
              Must explicitly state &ldquo;Inclusive of all taxes&rdquo;. Unit sale price (USP) is mandatory for packages exceeding 1kg/1L.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              5. Month & Year of Manufacture / Packing
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
              Clear MM/YYYY or Month Year designation. Best before date alone does not satisfy Rule 6(1)(d).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              6. Consumer Care / Grievance Contact
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
              Must provide valid telephone number, official email address, and physical contact office.
            </p>
          </div>
        </div>
      </section>

      {/* Package Photography Best Practices */}
      <section
        aria-labelledby="capture-guidelines-title"
        className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="capture-guidelines-title"
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
            >
              Field Photography & OCR Optimization Protocol
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Guidelines for capturing high-confidence label evidence in retail and manufacturing audits:
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
            <p>
              <strong className="text-slate-900">Perpendicular Angle:</strong> Hold camera flat and parallel to the principal display panel to prevent perspective distortion in letter-height measurement.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
            <p>
              <strong className="text-slate-900">Eliminate Glare:</strong> Tilting glossy pouches slightly away from overhead light bulbs ensures OCR engines do not lose decimal points in price and net quantity fields.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
            <p>
              <strong className="text-slate-900">Full Boundary Coverage:</strong> Ensure corners of the container are included in the frame for automated aspect-ratio and area-of-principal-display-panel (PDP) calculation.
            </p>
          </div>
        </div>
      </section>

      {/* Enforcement & Notice Matrix */}
      <section
        aria-labelledby="enforcement-matrix-title"
        className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="enforcement-matrix-title"
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
            >
              Statutory Violation Classification Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Severity grading applied by the VALIDRA deterministic rule engine:
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
            <Badge variant="destructive" className="shrink-0 mt-0.5">High Severity</Badge>
            <div className="space-y-1">
              <span className="font-semibold text-slate-900 block">Missing Mandatory Declarations / Overcharging</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Absence of MRP, Net Quantity, Manufacturer details, or sale above stamped MRP. Triggers compounding notice or prosecution under Section 36 of the Legal Metrology Act, 2009.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
            <Badge variant="warning" className="shrink-0 mt-0.5">Medium Severity</Badge>
            <div className="space-y-1">
              <span className="font-semibold text-slate-900 block">Formatting Discrepancies & Non-standard Units</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Use of non-metric units (e.g. lbs, oz), missing &ldquo;Inclusive of all taxes&rdquo; suffix, or inadequate font size relative to principal display panel area. Requires corrective action within statutory notice period.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start gap-3">
            <Badge variant="accent" className="shrink-0 mt-0.5">Low Severity</Badge>
            <div className="space-y-1">
              <span className="font-semibold text-slate-900 block">Minor Typographical Ambiguity</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Consumer care email domain typos or non-standard date separator formatting. Advisory warning recorded in inspection remarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support & System Help Contact */}
      <section
        aria-label="System Help & Support"
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Need Technical System Assistance?</span>
          </h3>
          <p className="text-xs text-slate-500">
            For issues with OCR camera recognition or account permissions, contact the National Metrology Help Desk.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
          support-metrology@validra.nic.in
        </span>
      </section>
    </div>
  );
}
