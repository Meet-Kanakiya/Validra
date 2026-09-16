import * as React from "react";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { ExtractedField } from "@/types/review";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils";

export interface ExtractedFieldsTableProps {
  fields: ExtractedField[];
  className?: string;
}

function FieldStatusBadge({ status }: { status: ExtractedField["status"] }) {
  if (status === "verified") {
    return (
      <Badge variant="success" className="gap-1 text-[11px] font-medium">
        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
        <span>Verified</span>
      </Badge>
    );
  }

  if (status === "flagged") {
    return (
      <Badge variant="warning" className="gap-1 text-[11px] font-medium">
        <AlertCircle className="w-3 h-3" aria-hidden="true" />
        <span>Flagged</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1 text-[11px] font-medium">
      <HelpCircle className="w-3 h-3" aria-hidden="true" />
      <span>Missing</span>
    </Badge>
  );
}

/**
 * Responsive table displaying extracted Legal Metrology statutory package declarations.
 */
export function ExtractedFieldsTable({
  fields,
  className,
}: ExtractedFieldsTableProps) {
  return (
    <section
      aria-labelledby="extracted-declarations-title"
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2
            id="extracted-declarations-title"
            className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight"
          >
            Extracted Package Declarations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mandatory commodities declarations detected via OCR parsing
          </p>
        </div>

        <span className="text-xs font-mono text-slate-500">
          {fields.filter((f) => f.value !== null).length} / {fields.length} detected
        </span>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-3 pr-4">
                Mandatory Field
              </th>
              <th scope="col" className="py-3 px-4">
                Detected Value
              </th>
              <th scope="col" className="py-3 px-4">
                Confidence
              </th>
              <th scope="col" className="py-3 pl-4 text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {fields.map((field) => (
              <tr
                key={field.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-3.5 pr-4 align-top">
                  <span className="font-medium text-slate-900 block">
                    {field.label}
                  </span>
                  {field.isMandatory && (
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Mandatory (LM Rules)
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 align-top">
                  {field.value ? (
                    <span className="text-slate-800 font-mono text-xs break-words">
                      {field.value}
                    </span>
                  ) : (
                    <span className="text-rose-600 italic text-xs font-medium">
                      Not detected on package
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 align-top whitespace-nowrap">
                  {field.confidence !== null && field.confidence !== undefined ? (
                    <span className="text-slate-600 font-mono text-xs">
                      {Math.round(field.confidence * 100)}%
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-mono">—</span>
                  )}
                </td>

                <td className="py-3.5 pl-4 text-right align-top whitespace-nowrap">
                  <FieldStatusBadge status={field.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-100">
        {fields.map((field) => (
          <div key={field.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-900">
                {field.label}
              </span>
              <FieldStatusBadge status={field.status} />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
              {field.value ? (
                <p className="text-slate-800 font-mono break-words">{field.value}</p>
              ) : (
                <p className="text-rose-600 font-medium italic">
                  Not detected on package
                </p>
              )}
            </div>

            {field.confidence !== null && field.confidence !== undefined && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>OCR Confidence</span>
                <span>{Math.round(field.confidence * 100)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
