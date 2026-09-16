"use client";

import * as React from "react";
import Link from "next/link";
import { LegalDocument } from "@/types/legal-document";
import {
  getLegalDocuments,
  deleteLegalDocument,
  reprocessLegalDocument,
} from "@/services/admin-document-service";
import {
  AdminPageHeader,
  DocumentTable,
  DocumentDetailCard,
  AdminEmptyState,
} from "@/components/admin";
import { Button } from "@/components/shared";
import { Upload, BookOpen } from "lucide-react";

export default function AdminLegalDocumentsPage() {
  const [documents, setDocuments] = React.useState<LegalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = React.useState<LegalDocument | null>(null);

  const refreshDocs = () => {
    getLegalDocuments().then(setDocuments);
  };

  React.useEffect(() => {
    getLegalDocuments().then(setDocuments);
  }, []);

  const handleDelete = async (id: string) => {
    await deleteLegalDocument(id);
    refreshDocs();
  };

  const handleReprocess = async (id: string) => {
    await reprocessLegalDocument(id);
    refreshDocs();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Statutory Legal Documents & Knowledge Base"
        subtitle="Catalog of Legal Metrology Acts, Packaged Commodities Rules, and Gazette Notifications ingested into RAG vector index"
        badge={`${documents.length} Acts & Rules`}
      >
        <Link href="/admin/legal-documents/upload">
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white font-medium gap-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Legal Document</span>
          </Button>
        </Link>
      </AdminPageHeader>

      {documents.length > 0 ? (
        <DocumentTable
          documents={documents}
          onSelectDocument={(doc) => setSelectedDoc(doc)}
          onDeleteDocument={handleDelete}
          onReprocessDocument={handleReprocess}
        />
      ) : (
        <AdminEmptyState
          icon={BookOpen}
          title="No Legal Documents Ingested"
          description="Upload official statutory PDFs such as Legal Metrology Act, 2009 or Packaged Commodities Rules, 2011 to populate the vector search index."
          actionLabel="Upload Document"
          onAction={() => {}}
        />
      )}

      {selectedDoc && (
        <DocumentDetailCard
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
