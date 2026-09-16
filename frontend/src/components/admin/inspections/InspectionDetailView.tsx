"use client";

import * as React from "react";
import Image from "next/image";
import { SystemInspection } from "@/types/admin";
import { Card, Button } from "@/components/shared";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  QrCode,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Eye,
} from "lucide-react";

interface InspectionDetailViewProps {
  inspection: SystemInspection;
}

// 8-stage operational processing timeline
const PROCESSING_STAGES = [
  { id: 1, name: "Image Upload", status: "COMPLETED" },
  { id: 2, name: "Quality Check", status: "COMPLETED" },
  { id: 3, name: "Preprocessing", status: "COMPLETED" },
  { id: 4, name: "PaddleOCR", status: "COMPLETED" },
  { id: 5, name: "Field Extraction", status: "COMPLETED" },
  { id: 6, name: "Rule Validation", status: "COMPLETED" },
  { id: 7, name: "Evidence Generation", status: "COMPLETED" },
  { id: 8, name: "Report Certified", status: "COMPLETED" },
];

// Technical bounding boxes mapped to fields on packaging
const BOUNDING_BOXES: Record<
  string,
  { top: string; left: string; width: string; height: string; label: string }
> = {
  MRP: { top: "64%", left: "14%", width: "32%", height: "9%", label: "MRP Declaration" },
  "Net Quantity": { top: "50%", left: "14%", width: "24%", height: "8%", label: "Net Quantity" },
  Manufacturer: { top: "24%", left: "48%", width: "42%", height: "18%", label: "Manufacturer Address" },
  "Manufacturing Date": { top: "76%", left: "50%", width: "38%", height: "9%", label: "Mfg / Best Before" },
  "Batch / Lot Number": { top: "68%", left: "50%", width: "28%", height: "7%", label: "Batch Lot" },
  "Customer Care Contact": { top: "44%", left: "48%", width: "42%", height: "12%", label: "Consumer Helpline" },
};

export function InspectionDetailView({ inspection }: InspectionDetailViewProps) {
  const [activeTab, setActiveTab] = React.useState<"fields" | "rules" | "violations">("fields");
  const [selectedField, setSelectedField] = React.useState<string | null>("MRP");
  const [zoomLevel, setZoomLevel] = React.useState<number>(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = React.useState<boolean>(true);

  const violations = inspection.findings.filter((f) => f.status !== "PASS");

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return { label: "High confidence", color: "text-green-700 bg-green-50 border-green-200", bar: "bg-green-700" };
    if (score >= 0.75) return { label: "Review recommended", color: "text-amber-800 bg-amber-50 border-amber-200", bar: "bg-amber-600" };
    return { label: "Low confidence", color: "text-rose-700 bg-rose-50 border-rose-200", bar: "bg-rose-600" };
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Banner - Compact Operational Oversight */}
      <Card className="p-5 border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                {inspection.id}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  inspection.status === "COMPLIANT"
                    ? "bg-green-50 text-green-800 border-green-200"
                    : inspection.status === "NEEDS_REVIEW"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {inspection.status === "COMPLIANT" && <ShieldCheck className="w-3.5 h-3.5 text-green-700" />}
                {inspection.status === "NEEDS_REVIEW" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {inspection.status === "NON_COMPLIANT" && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                <span>{inspection.status.replace("_", " ")}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Category: {inspection.category}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 pt-0.5">{inspection.productName}</h2>
            <div className="text-xs text-slate-500 font-mono">
              Brand: <strong className="text-slate-700">{inspection.brandName}</strong> · Batch:{" "}
              <span className="text-slate-800">{inspection.batchNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Overall Compliance</div>
              <div className="text-2xl font-extrabold font-mono text-green-800">
                {inspection.complianceScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry and Officer Meta Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Field Inspector</div>
            <div className="font-semibold text-slate-900 mt-0.5">{inspection.inspectorName}</div>
            <div className="text-[10px] text-slate-500 font-mono">{inspection.inspectorEmail}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Capture Timestamp</div>
            <div className="font-mono text-slate-700 mt-0.5">{inspection.scannedAt}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Sec 65B Cryptographic Hash</div>
            <div className="font-mono text-[11px] text-slate-800 truncate mt-0.5" title={inspection.hashSha256}>
              SHA256: {inspection.hashSha256.slice(0, 16)}...
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Admissibility Evidence</div>
            <div className="flex items-center gap-1.5 text-green-800 font-mono mt-0.5 text-[11px] font-medium">
              <QrCode className="w-3.5 h-3.5 text-green-700" />
              <span>Verified Dynamic QR Seal</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Processing Stepper Timeline (Section 14) */}
      <Card className="p-4 border-slate-200 bg-white shadow-xs">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-green-700" />
          <span>Statutory Processing Timeline</span>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {PROCESSING_STAGES.map((stg) => (
            <div
              key={stg.id}
              className="p-2 rounded-md bg-slate-50 border border-slate-200 flex flex-col items-center text-center gap-1"
            >
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-[10px]">
                ✓
              </div>
              <span className="text-[11px] font-medium text-slate-800 leading-tight">
                {stg.name}
              </span>
              <span className="text-[9px] font-mono text-slate-400">Completed</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Evidence Workstation: Side-by-Side (Sections 10 & 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product Image & Evidence Bounding Box Canvas (7 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4 border-slate-200 bg-white shadow-xs">
            {/* Canvas Toolbar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Product Packaging Evidence Canvas
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`h-7 px-2 text-[11px] ${
                    showBoundingBoxes ? "border-green-600 text-green-800 bg-green-50" : ""
                  }`}
                  title="Toggle OCR Bounding Boxes"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>{showBoundingBoxes ? "Hide Boxes" : "Show Boxes"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.2))}
                  className="h-7 w-7 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                  className="h-7 w-7 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(1)}
                  className="h-7 w-7 p-0"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Interactive Image Frame */}
            <div className="relative aspect-[4/3] w-full rounded-lg bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
              <div
                className="relative w-full h-full transition-transform duration-200 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <Image
                  src="/images/hero/hero-scan.jpg"
                  alt="Scanned Packaged Commodity Evidence"
                  fill
                  className="object-contain"
                  priority
                />

                {/* Technical OCR Bounding Boxes Overlay */}
                {showBoundingBoxes &&
                  Object.entries(BOUNDING_BOXES).map(([fieldKey, box]) => {
                    const isSelected = selectedField === fieldKey;
                    const finding = inspection.findings.find((f) => f.field === fieldKey);
                    const isPass = !finding || finding.status === "PASS";

                    return (
                      <div
                        key={fieldKey}
                        onClick={() => setSelectedField(fieldKey)}
                        className={`absolute border-2 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "border-green-500 bg-green-500/20 ring-2 ring-green-400/80 shadow-md"
                            : isPass
                            ? "border-green-600/70 bg-green-600/10 hover:border-green-500 hover:bg-green-600/20"
                            : "border-rose-500/80 bg-rose-500/15 hover:border-rose-400"
                        }`}
                        style={{
                          top: box.top,
                          left: box.left,
                          width: box.width,
                          height: box.height,
                        }}
                      >
                        <span
                          className={`absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-tight text-white whitespace-nowrap shadow-xs ${
                            isSelected
                              ? "bg-green-700"
                              : isPass
                              ? "bg-slate-900/90 text-green-300"
                              : "bg-rose-700"
                          }`}
                        >
                          {box.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Evidence Callout Note */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                <span>Selected: <strong className="text-slate-900">{selectedField || "None"}</strong></span>
              </div>
              <span className="font-mono text-slate-500">Scale: {Math.round(zoomLevel * 100)}%</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Structured Findings, Declarations & Rules (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4 border-slate-200 bg-white shadow-xs">
            {/* View Filter Tabs */}
            <div className="flex items-center gap-1 pb-3 mb-3 border-b border-slate-200">
              <button
                onClick={() => setActiveTab("fields")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "fields"
                    ? "bg-green-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Extracted Fields ({inspection.findings.length})
              </button>

              <button
                onClick={() => setActiveTab("rules")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "rules"
                    ? "bg-green-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Rule Evaluations
              </button>

              <button
                onClick={() => setActiveTab("violations")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "violations"
                    ? "bg-rose-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>Violations / Flags</span>
                {violations.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === "violations"
                        ? "bg-white text-rose-700"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {violations.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab 1: Extracted Fields List */}
            {activeTab === "fields" && (
              <div className="space-y-2.5">
                {inspection.findings.map((f) => {
                  const isSelected = selectedField === f.field;
                  const conf = getConfidenceLevel(f.confidenceScore);

                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedField(f.field)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? "border-green-600 bg-green-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <span className="font-mono text-green-700 font-bold">{f.ruleCode}</span>
                          <span className="text-slate-300">·</span>
                          <span>{f.field}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                              f.status === "PASS"
                                ? "bg-green-50 text-green-800 border-green-200"
                                : f.status === "FLAGGED"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {f.status}
                          </span>
                        </div>
                      </div>

                      {/* Detected Value */}
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                        <span className="text-slate-400 mr-2 uppercase text-[10px]">Detected:</span>
                        <strong className="text-slate-900 font-semibold">{f.detectedValue}</strong>
                      </div>

                      {/* Confidence Bar & Legal Reference */}
                      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full ${conf.bar}`}
                              style={{ width: `${Math.round(f.confidenceScore * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-600">
                            {Math.round(f.confidenceScore * 100)}% ({conf.label})
                          </span>
                        </div>

                        <span className="font-mono text-[10px] text-slate-400">{f.legalRef}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Rule Evaluations */}
            {activeTab === "rules" && (
              <div className="space-y-3 text-xs">
                {inspection.findings.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900">
                        {f.ruleCode}: {f.field}
                      </div>
                      <span className="font-mono text-[10px] text-green-700 bg-green-50 px-1.5 py-0.2 rounded border border-green-200">
                        {f.legalRef}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Statutory requirement verified under Legal Metrology (Packaged Commodities) Rules 2011.
                    </p>

                    <div className="text-[11px] text-slate-700 font-mono pt-1">
                      Finding: <strong className="text-slate-900">{f.detectedValue}</strong>
                    </div>

                    {f.officerRemarks && (
                      <div className="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] mt-1 font-medium">
                        Officer Remark: {f.officerRemarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Violations / Flags (Section 15) */}
            {activeTab === "violations" && (
              <div className="space-y-3 text-xs">
                {violations.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 rounded-lg bg-green-50/50 border border-green-200">
                    <CheckCircle2 className="w-8 h-8 text-green-700 mx-auto mb-2" />
                    <div className="font-semibold text-slate-900 text-sm">Zero Non-Compliance Violations</div>
                    <div className="text-xs text-slate-600 mt-1">
                      All mandatory statutory declarations satisfy Legal Metrology Rules 2011.
                    </div>
                  </div>
                ) : (
                  violations.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <XCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                          <span>{v.ruleCode}: {v.field}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                          {v.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700">
                        <strong>Discrepancy:</strong> {v.officerRemarks || "Declared value violates Legal Metrology guidelines."}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div>
                          <span className="text-slate-400">Detected: </span>
                          <span className="text-slate-900 font-semibold">{v.detectedValue}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Rule Ref: </span>
                          <span className="text-slate-900">{v.legalRef}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-rose-800 font-semibold">Action: Issue Statutory Notice</span>
                        <Button variant="outline" size="sm" className="h-7 text-[10px]">
                          <span>Flag for Review</span>
                          <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>

          {/* Officer Remarks */}
          {inspection.notes && (
            <Card className="p-4 border-slate-200 bg-white shadow-xs space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Inspector Supervisory Field Notes
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {inspection.notes}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
