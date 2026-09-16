"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LegalDocumentType } from "@/types/legal-document";
import { uploadLegalDocument } from "@/services/admin-document-service";
import { Button, Input, Card } from "@/components/shared";
import { UploadCloud, FileText, AlertTriangle, Loader2 } from "lucide-react";

export function DocumentUploadForm() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [documentType, setDocumentType] = React.useState<LegalDocumentType>("Statutory Rules");
  const [version, setVersion] = React.useState("2026.01");
  const [effectiveDate, setEffectiveDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [authorizingBody, setAuthorizingBody] = React.useState(
    "Ministry of Consumer Affairs, Food & Public Distribution"
  );
  const [summary, setSummary] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<{ name: string; size: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF statutory gazette documents (.pdf) are supported.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("File exceeds the maximum 50MB statutory upload threshold.");
      return;
    }
    setSelectedFile({ name: file.name, size: file.size });
    if (!title) {
      setTitle(file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select or drop a valid PDF document.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 300);

    try {
      await uploadLegalDocument({
        title,
        documentType,
        version,
        effectiveDate,
        authorizingBody,
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        summary,
      });

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        router.push("/admin/legal-documents");
      }, 600);
    } catch (err: unknown) {
      clearInterval(interval);
      setIsUploading(false);
      setErrorMessage(err instanceof Error ? err.message : "Upload failure");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* File Dropzone */}
      <Card
        className={`p-7 border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
          isDragging
            ? "border-green-600 bg-green-50"
            : selectedFile
            ? "border-green-600 bg-green-50/40"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100/60"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
      >
        <input
          type="file"
          id="doc-file-upload"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center space-y-1.5">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-800 flex items-center justify-center border border-green-200">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-900">{selectedFile.name}</div>
            <div className="text-xs text-slate-500 font-mono">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for vector parsing
            </div>
            <label
              htmlFor="doc-file-upload"
              className="mt-1 text-xs text-green-700 hover:text-green-800 underline cursor-pointer font-medium"
            >
              Choose different PDF
            </label>
          </div>
        ) : (
          <label htmlFor="doc-file-upload" className="cursor-pointer space-y-2">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 mx-auto border border-slate-200 shadow-xs">
              <UploadCloud className="w-5 h-5 text-green-700" />
            </div>
            <div className="text-sm font-semibold text-slate-800">
              Drag and drop statutory PDF here, or click to browse
            </div>
            <div className="text-xs text-slate-500 font-mono">
              PDF formats up to 50MB · Automatic text extraction & semantic vector chunking
            </div>
          </label>
        )}
      </Card>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Metadata Form */}
      <Card className="p-5 border-slate-200 bg-white space-y-4 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900">Statutory Metadata & Taxonomy</h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Document Title
          </label>
          <Input
            required
            placeholder="e.g. Legal Metrology (Packaged Commodities) Amendment Rules, 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as LegalDocumentType)}
              className="w-full h-8.5 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-700"
            >
              <option value="Statutory Rules">Statutory Rules</option>
              <option value="Principal Act">Principal Act</option>
              <option value="Gazette Amendment">Gazette Amendment</option>
              <option value="Ministry Advisory">Ministry Advisory</option>
              <option value="Enforcement Circular">Enforcement Circular</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Statutory Version
            </label>
            <Input
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 2026.GSR01"
              className="text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gazette Effective Date
            </label>
            <Input
              type="date"
              required
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Authorizing Agency / Department
          </label>
          <Input
            required
            value={authorizingBody}
            onChange={(e) => setAuthorizingBody(e.target.value)}
            className="text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Summary / Scope of Application
          </label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief overview of the legal mandate or packaging declarations affected by this document..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700"
          />
        </div>

        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
              <span className="flex items-center gap-1.5 text-green-800 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-green-700" />
                <span>Ingesting PDF & Generating Embeddings...</span>
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-green-700 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => router.push("/admin/legal-documents")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isUploading}
          className="bg-green-700 hover:bg-green-800 text-white font-medium"
        >
          {isUploading ? "Processing Vector Pipeline..." : "Upload & Ingest Document"}
        </Button>
      </div>
    </form>
  );
}
