"use client";

import * as React from "react";
import { Card } from "@/components/shared";
import { Sliders } from "lucide-react";

interface ConfidenceThresholdConfigProps {
  ocrThreshold: number;
  onOcrThresholdChange: (val: number) => void;
  extractionThreshold: number;
  onExtractionThresholdChange: (val: number) => void;
  overallThreshold: number;
  onOverallThresholdChange: (val: number) => void;
}

export function ConfidenceThresholdConfig({
  ocrThreshold,
  onOcrThresholdChange,
  extractionThreshold,
  onExtractionThresholdChange,
  overallThreshold,
  onOverallThresholdChange,
}: ConfidenceThresholdConfigProps) {
  return (
    <Card className="p-6 border-slate-200 bg-white shadow-xs space-y-5 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              AI Confidence Gating & Sensitivity Thresholds
            </h3>
            <p className="text-xs text-slate-500">
              Confidence levels below which inspection findings are routed to supervisory manual review
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {/* OCR Confidence Slider */}
        <div className="space-y-1.5 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">PaddleOCR Character Confidence Gate</span>
            <span className="font-mono font-bold text-green-700 text-sm">{ocrThreshold}%</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Mandated by Validra Architecture: Raw text regions below this score trigger &quot;NEEDS_REVIEW&quot;.
          </p>
          <input
            type="range"
            min="60"
            max="95"
            step="1"
            value={ocrThreshold}
            onChange={(e) => onOcrThresholdChange(Number(e.target.value))}
            className="w-full accent-green-700 cursor-pointer"
          />
        </div>

        {/* Extraction Confidence Slider */}
        <div className="space-y-1.5 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">Entity Extraction Confidence Gate</span>
            <span className="font-mono font-bold text-green-700 text-sm">{extractionThreshold}%</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Regex and semantic taxonomy parser threshold for MRP, Net Quantity, and Date parsing.
          </p>
          <input
            type="range"
            min="60"
            max="95"
            step="1"
            value={extractionThreshold}
            onChange={(e) => onExtractionThresholdChange(Number(e.target.value))}
            className="w-full accent-green-700 cursor-pointer"
          />
        </div>

        {/* Overall Compliance Threshold */}
        <div className="space-y-1.5 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">System Compliance Pass Threshold</span>
            <span className="font-mono font-bold text-green-700 text-sm">{overallThreshold}%</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Minimum weighted rule score required for an automated &quot;COMPLIANT&quot; certificate seal.
          </p>
          <input
            type="range"
            min="75"
            max="100"
            step="1"
            value={overallThreshold}
            onChange={(e) => onOverallThresholdChange(Number(e.target.value))}
            className="w-full accent-green-700 cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );
}
