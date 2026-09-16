import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, DocumentUploadForm } from "@/components/admin";
import { Button } from "@/components/shared";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Upload Statutory Document",
};

export default function DocumentUploadPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Link href="/admin/legal-documents">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Documents Catalog</span>
          </Button>
        </Link>
      </div>

      <AdminPageHeader
        title="Upload & Ingest Statutory Document"
        subtitle="Ingest statutory gazette PDFs into the Legal Metrology semantic vector index with metadata tagging"
        badge="PDF Ingestion Pipeline"
      />

      <DocumentUploadForm />
    </div>
  );
}
