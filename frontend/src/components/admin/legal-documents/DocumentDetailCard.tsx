"use client";

import * as React from "react";
import { LegalDocument } from "@/types/legal-document";
import { Button } from "@/components/shared";
import { X, FileText } from "lucide-react";

interface DocumentDetailCardProps {
  document: LegalDocument;
  onClose: () => void;
}

export function DocumentDetailCard({ document, onClose }: DocumentDetailCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-lg border border-slate-200 bg-white flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">{document.title}</h3>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {document.fileName} · Version {document.version}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Category</div>
              <div className="font-semibold text-slate-800 mt-0.5">{document.documentType}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
              <div className="font-mono text-green-800 font-bold mt-0.5">{document.status}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Vector Chunks</div>
              <div className="font-mono text-slate-900 font-bold mt-0.5">{document.chunksCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Effective Date</div>
              <div className="font-mono text-slate-700 mt-0.5">{document.effectiveDate}</div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
              Statutory Summary
            </h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {document.summary}
            </p>
          </div>

          {/* Chunks Preview */}
          {document.chunksPreview && document.chunksPreview.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Vector Chunks Ingested (Sample Snippets)</span>
                <span className="font-mono text-[10px] text-slate-400">Indexed for RAG</span>
              </h4>

              <div className="space-y-2.5">
                {document.chunksPreview.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-green-800 font-semibold">
                      <span>{chk.sectionRef}</span>
                      <span className="text-slate-400">{chk.tokenCount} tokens</span>
                    </div>
                    <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                      &quot;{chk.content}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3.5 border-t border-slate-200 bg-slate-50/60 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
