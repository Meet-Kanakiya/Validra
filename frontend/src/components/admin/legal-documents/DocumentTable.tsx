"use client";

import * as React from "react";
import { LegalDocument } from "@/types/legal-document";
import {
  FileText,
  Layers,
  RotateCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

interface DocumentTableProps {
  documents: LegalDocument[];
  onSelectDocument: (doc: LegalDocument) => void;
  onDeleteDocument: (id: string) => void;
  onReprocessDocument: (id: string) => void;
}

export function DocumentTable({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onReprocessDocument,
}: DocumentTableProps) {
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3.5">Statutory Document</th>
                <th className="py-2.5 px-3.5">Type</th>
                <th className="py-2.5 px-3.5">Version</th>
                <th className="py-2.5 px-3.5">Ingestion Status</th>
                <th className="py-2.5 px-3.5 text-right">Vector Chunks</th>
                <th className="py-2.5 px-3.5">File Size</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3.5">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="text-left group cursor-pointer"
                    >
                      <div className="font-semibold text-slate-900 group-hover:text-green-800 transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-700 flex-shrink-0" />
                        <span>{doc.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {doc.fileName} · Authorizer: {doc.authorizingBody}
                      </div>
                    </button>
                  </td>

                  <td className="py-3 px-3.5 font-medium text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono border border-slate-200">
                      {doc.documentType}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">
                    {doc.version}
                  </td>

                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                        doc.status === "Ready"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : doc.status === "Processing"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {doc.status === "Ready" && <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />}
                      {doc.status === "Processing" && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                      {doc.status === "Failed" && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{doc.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-900">
                    {doc.chunksCount > 0 ? (
                      <span className="flex items-center justify-end gap-1 text-green-800">
                        <Layers className="w-3.5 h-3.5 text-green-700" />
                        <span>{doc.chunksCount}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">
                    {formatBytes(doc.fileSizeBytes)}
                  </td>

                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View chunks and metadata"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {doc.status === "Failed" && (
                        <button
                          onClick={() => onReprocessDocument(doc.id)}
                          className="p-1 rounded text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Re-run semantic vector ingestion"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteTargetId(doc.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Delete legal document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteTargetId !== null}
        title="Delete Legal Metrology Document?"
        message="This document and its vector embeddings will be permanently purged from the RAG knowledge index."
        confirmLabel="Purge Document"
        isDestructive={true}
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteDocument(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
