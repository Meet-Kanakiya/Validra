export type RuleSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RuleCategory =
  | "mandatory_declaration"
  | "format_standard"
  | "placement_readability"
  | "numerical_unit"
  | "exemption_conditional";

export type RuleStatus = "active" | "inactive" | "draft";

export interface RuleVersion {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changeSummary: string;
  isCurrent: boolean;
}

export interface MetrologyRule {
  id: string;
  ruleCode: string; // e.g. "C01", "C02"
  field: string; // e.g. "Maximum Retail Price (MRP)"
  category: RuleCategory;
  severity: RuleSeverity;
  status: RuleStatus;
  version: string;
  condition: string;
  validationLogic: string;
  legalReference: string;
  description: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  applicablePackageTypes: string[];
  applicableCategories: string[];
  exemptions: string[];
  isRequired: boolean;
  isActive: boolean;
  versionHistory: RuleVersion[];
  createdAt: string;
  updatedAt: string;
}
