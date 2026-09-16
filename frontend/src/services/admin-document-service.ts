import { LegalDocument, LegalDocumentType } from "@/types/legal-document";

let MOCK_DOCS: LegalDocument[] = [
  {
    id: "doc-01",
    title: "The Legal Metrology Act, 2009 (No. 1 of 2010)",
    documentType: "Principal Act",
    status: "Ready",
    version: "2009.1",
    effectiveDate: "2011-04-01",
    uploadedAt: "2026-01-05",
    fileSizeBytes: 2450000,
    fileName: "Legal_Metrology_Act_2009.pdf",
    chunksCount: 148,
    summary:
      "Statutory foundational legislation establishing standards of weights and measures, regulation of trade in commodities, and penal enforcement.",
    authorizingBody: "Parliament of India / Dept of Consumer Affairs",
    chunksPreview: [
      {
        id: "chk-01-01",
        chunkIndex: 1,
        sectionRef: "Section 18",
        tokenCount: 412,
        content:
          "No person shall manufacture, pack, sell, distribute, deliver, offer, expose or possess for sale by retail or wholesale any commodity in packaged form unless such package bears thereon a label conveying such declarations as may be prescribed.",
      },
      {
        id: "chk-01-02",
        chunkIndex: 2,
        sectionRef: "Section 36",
        tokenCount: 380,
        content:
          "Penalty for manufacture, sale, etc., of non-standard packages. Whoever manufactures, packs, imports, sells, distributes, delivers or offers for sale any commodity in packaged form shall be punished with fine which may extend to twenty-five thousand rupees.",
      },
    ],
  },
  {
    id: "doc-02",
    title: "Legal Metrology (Packaged Commodities) Rules, 2011",
    documentType: "Statutory Rules",
    status: "Ready",
    version: "2011.PCR",
    effectiveDate: "2011-04-01",
    uploadedAt: "2026-01-06",
    fileSizeBytes: 4890000,
    fileName: "Packaged_Commodities_Rules_2011_Amended.pdf",
    chunksCount: 312,
    summary:
      "Defines mandatory declarations (Rule 6), minimum font height matrices (Rule 7), net quantity declarations (Rule 12), and compounding procedures.",
    authorizingBody: "Ministry of Consumer Affairs, Food & Public Distribution",
    chunksPreview: [
      {
        id: "chk-02-01",
        chunkIndex: 1,
        sectionRef: "Rule 6(1)",
        tokenCount: 495,
        content:
          "Every package shall bear thereon or on a label securely affixed thereto, the name and address of the manufacturer, or packer, the common or generic names of the commodity, net quantity, month and year of manufacture, and Maximum Retail Price inclusive of all taxes.",
      },
    ],
  },
  {
    id: "doc-03",
    title: "Gazette Notification G.S.R. 592(E) — Font & Unit Amendments",
    documentType: "Gazette Amendment",
    status: "Ready",
    version: "2022.GSR592",
    effectiveDate: "2022-12-01",
    uploadedAt: "2026-02-10",
    fileSizeBytes: 1250000,
    fileName: "Gazette_GSR_592E_Amended_Font_Rules.pdf",
    chunksCount: 74,
    summary:
      "Clarifications on metric unit standardization and mandatory inclusion of unit sale price for commodities sold in bulk or multi-piece retail.",
    authorizingBody: "Government of India Official Gazette",
  },
  {
    id: "doc-04",
    title: "Enforcement Circular on QR Code Traceability for Seeds & Agri-Commodities",
    documentType: "Enforcement Circular",
    status: "Processing",
    version: "2026.CIR-04",
    effectiveDate: "2026-07-01",
    uploadedAt: "2026-09-15",
    fileSizeBytes: 3100000,
    fileName: "Circular_QR_Agri_Commodities_2026.pdf",
    chunksCount: 0,
    summary: "Vector chunking and semantic embedding extraction in progress via background ingestion pipeline.",
    authorizingBody: "Central Legal Metrology Division",
  },
  {
    id: "doc-05",
    title: "Draft Advisory on E-Commerce Pre-Packaged Delivery Wrappers",
    documentType: "Ministry Advisory",
    status: "Failed",
    version: "2026.ADV-DRAFT",
    effectiveDate: "2026-10-01",
    uploadedAt: "2026-09-12",
    fileSizeBytes: 890000,
    fileName: "Draft_Advisory_Delivery_Bags_Corrupt.pdf",
    chunksCount: 0,
    summary: "Document parsing failed: Invalid PDF xref table or corrupt trailer signature.",
    authorizingBody: "Advisory Directorate",
    errorMessage: "Corrupt xref table structure. Re-upload or re-encode as PDF 1.7 standard.",
  },
];

export async function getLegalDocuments(): Promise<LegalDocument[]> {
  return [...MOCK_DOCS];
}

export async function getLegalDocumentById(id: string): Promise<LegalDocument | null> {
  const doc = MOCK_DOCS.find((d) => d.id === id);
  return doc ? { ...doc } : null;
}

export async function uploadLegalDocument(data: {
  title: string;
  documentType: LegalDocumentType;
  version: string;
  effectiveDate: string;
  authorizingBody: string;
  fileName: string;
  fileSizeBytes: number;
  summary: string;
}): Promise<LegalDocument> {
  const newDoc: LegalDocument = {
    id: `doc-${String(MOCK_DOCS.length + 1).padStart(2, "0")}`,
    title: data.title,
    documentType: data.documentType,
    status: "Processing",
    version: data.version,
    effectiveDate: data.effectiveDate,
    uploadedAt: new Date().toISOString().split("T")[0],
    fileSizeBytes: data.fileSizeBytes,
    fileName: data.fileName,
    chunksCount: 0,
    summary: data.summary,
    authorizingBody: data.authorizingBody,
  };

  MOCK_DOCS = [newDoc, ...MOCK_DOCS];

  // Simulate background embedding generation after 3 seconds
  setTimeout(() => {
    const idx = MOCK_DOCS.findIndex((d) => d.id === newDoc.id);
    if (idx !== -1) {
      MOCK_DOCS[idx] = {
        ...MOCK_DOCS[idx],
        status: "Ready",
        chunksCount: Math.floor(data.fileSizeBytes / 15000),
      };
    }
  }, 3000);

  return { ...newDoc };
}

export async function deleteLegalDocument(id: string): Promise<void> {
  MOCK_DOCS = MOCK_DOCS.filter((d) => d.id !== id);
}

export async function reprocessLegalDocument(id: string): Promise<LegalDocument> {
  const idx = MOCK_DOCS.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error("Document not found");

  MOCK_DOCS[idx] = {
    ...MOCK_DOCS[idx],
    status: "Processing",
    errorMessage: undefined,
  };

  setTimeout(() => {
    const reIdx = MOCK_DOCS.findIndex((d) => d.id === id);
    if (reIdx !== -1) {
      MOCK_DOCS[reIdx] = {
        ...MOCK_DOCS[reIdx],
        status: "Ready",
        chunksCount: 65,
      };
    }
  }, 2500);

  return { ...MOCK_DOCS[idx] };
}
