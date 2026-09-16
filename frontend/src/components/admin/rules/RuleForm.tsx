"use client";

import * as React from "react";
import { MetrologyRule, RuleCategory, RuleSeverity, RuleStatus } from "@/types/rule";
import { Button, Input, Card } from "@/components/shared";
import { testEvaluateRule } from "@/services/admin-rule-service";
import { Play, CheckCircle2, AlertTriangle, Scale, Sparkles } from "lucide-react";

interface RuleFormProps {
  initialData?: Partial<MetrologyRule>;
  isEditMode?: boolean;
  onSubmit: (data: Partial<MetrologyRule>) => void;
  isSubmitting?: boolean;
}

export function RuleForm({
  initialData,
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
}: RuleFormProps) {
  const [ruleCode, setRuleCode] = React.useState(initialData?.ruleCode || "C27");
  const [field, setField] = React.useState(initialData?.field || "");
  const [category, setCategory] = React.useState<RuleCategory>(
    initialData?.category || "mandatory_declaration"
  );
  const [severity, setSeverity] = React.useState<RuleSeverity>(
    initialData?.severity || "HIGH"
  );
  const [status, setStatus] = React.useState<RuleStatus>(initialData?.status || "draft");
  const [legalReference, setLegalReference] = React.useState(
    initialData?.legalReference || "Legal Metrology (Packaged Commodities) Rules, 2011"
  );
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [condition, setCondition] = React.useState(initialData?.condition || "");
  const [validationLogic, setValidationLogic] = React.useState(
    initialData?.validationLogic || "REGEX: (₹|Rs\\.?)\\s*\\d+"
  );
  const [effectiveFrom, setEffectiveFrom] = React.useState(
    initialData?.effectiveFrom || new Date().toISOString().split("T")[0]
  );
  const [isRequired, setIsRequired] = React.useState(initialData?.isRequired ?? true);
  const [isActive, setIsActive] = React.useState(initialData?.isActive ?? false);

  // Live Rule Evaluation Preview State
  const [sampleText, setSampleText] = React.useState(
    "MRP Rs. 149.00 (inclusive of all taxes)"
  );
  const [previewResult, setPreviewResult] = React.useState<{
    passed: boolean;
    matchSnippet?: string;
    explanation: string;
  } | null>(null);

  const handleTestEvaluation = () => {
    const res = testEvaluateRule(validationLogic, sampleText);
    setPreviewResult(res);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ruleCode,
      field,
      category,
      severity,
      status,
      legalReference,
      description,
      condition,
      validationLogic,
      effectiveFrom,
      isRequired,
      isActive,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Basic Rule Definition */}
      <Card className="p-5 border-slate-200 bg-white space-y-4 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-green-700" />
          <span>Statutory Rule Definition</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rule Code (C01–C26)
            </label>
            <Input
              required
              value={ruleCode}
              onChange={(e) => setRuleCode(e.target.value)}
              placeholder="e.g. C01"
              className="font-mono font-bold text-green-700 uppercase text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Declaration Field Name
            </label>
            <Input
              required
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g. Maximum Retail Price (MRP)"
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Statutory Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RuleCategory)}
              className="w-full h-8.5 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-700"
            >
              <option value="mandatory_declaration">Mandatory Declaration</option>
              <option value="numerical_unit">Numerical Metric Units</option>
              <option value="placement_readability">Placement & Font Height</option>
              <option value="format_standard">Format Standards</option>
              <option value="exemption_conditional">Conditional Exemption</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Violation Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as RuleSeverity)}
              className="w-full h-8.5 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-700"
            >
              <option value="CRITICAL">CRITICAL (Immediate Seizure)</option>
              <option value="HIGH">HIGH (Penalty Compounding)</option>
              <option value="MEDIUM">MEDIUM (Show Cause Notice)</option>
              <option value="LOW">LOW (Advisory Warning)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Effective Statutory Date
            </label>
            <Input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Statutory Legal Reference (Act / PCR Clause)
          </label>
          <Input
            required
            value={legalReference}
            onChange={(e) => setLegalReference(e.target.value)}
            placeholder="e.g. Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(e)"
            className="text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Description & Legal Intent
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain why this declaration is legally required and the statutory consumer interest protected..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700"
          />
        </div>
      </Card>

      {/* Deterministic Evaluation Condition & Engine Logic */}
      <Card className="p-5 border-slate-200 bg-white space-y-4 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-green-700" />
          <span>Deterministic Validation Logic (Zero Hallucination)</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Human-Readable Condition
          </label>
          <Input
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g. MRP must include prefix ₹ and suffix inclusive of all taxes"
            className="text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Machine Evaluator Expression (REGEX / CONTAINS / SPATIAL)
          </label>
          <textarea
            rows={2}
            required
            value={validationLogic}
            onChange={(e) => setValidationLogic(e.target.value)}
            placeholder="REGEX: (₹|Rs\\.?)\\s*\\d+(\\.\\d{2})?\\s*(incl\\.?\\s*of\\s*all\\s*taxes)"
            className="w-full font-mono text-xs rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-green-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 focus:bg-white"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Prefix with <code>REGEX:</code>, <code>CONTAINS:</code>, or <code>SPATIAL:</code> for the evaluation engine.
          </span>
        </div>

        {/* Live Evaluation Simulator */}
        <div className="mt-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">
              Interactive Rule Preview & Verification Test
            </span>
            <button
              type="button"
              onClick={handleTestEvaluation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-800 hover:bg-green-200 text-xs font-medium transition-colors cursor-pointer border border-green-200"
            >
              <Play className="w-3 h-3 text-green-700" />
              <span>Simulate Evaluation</span>
            </button>
          </div>

          <div>
            <Input
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Enter OCR sample detected packaging text to test against this rule..."
              className="text-xs font-mono bg-white"
            />
          </div>

          {previewResult && (
            <div
              className={`p-3 rounded-md border text-xs flex items-start gap-2.5 ${
                previewResult.passed
                  ? "bg-green-50 border-green-200 text-green-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {previewResult.passed ? (
                <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold">
                  {previewResult.passed ? "RULE PASSES VALIDATION" : "VIOLATION DETECTED"}
                </div>
                <div className="text-[11px] opacity-90">{previewResult.explanation}</div>
              </div>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded border-slate-300 text-green-700 focus:ring-green-700"
            />
            <span>Mandatory Statutory Declaration</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-slate-300 text-green-700 focus:ring-green-700"
            />
            <span>Active in Field Inspection Engine</span>
          </label>
        </div>
      </Card>

      {/* Form Submission Bar */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={() => setStatus("draft")}
        >
          Save as Draft
        </Button>

        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          onClick={() => {
            setStatus("active");
            setIsActive(true);
          }}
          className="bg-green-700 hover:bg-green-800 text-white font-medium"
        >
          {isSubmitting
            ? "Publishing..."
            : isEditMode
            ? "Publish Version Update"
            : "Publish Statutory Rule"}
        </Button>
      </div>
    </form>
  );
}
