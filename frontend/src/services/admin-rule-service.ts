import { MetrologyRule } from "@/types/rule";

let MOCK_RULES: MetrologyRule[] = [
  {
    id: "rule-c01",
    ruleCode: "C01",
    field: "Maximum Retail Price (MRP)",
    category: "mandatory_declaration",
    severity: "CRITICAL",
    status: "active",
    version: "v1.4.0",
    condition: "MRP must include the prefix '₹' or 'Rs.' and suffix 'inclusive of all taxes'",
    validationLogic: "REGEX: (₹|Rs\\.?)\\s*\\d+(\\.\\d{2})?\\s*(incl\\.?\\s*of\\s*all\\s*taxes|inclusive\\s*of\\s*all\\s*taxes)",
    legalReference: "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(e)",
    description: "Ensures consumers are protected against overcharging and hidden taxes at point of sale.",
    effectiveFrom: "2024-01-01",
    applicablePackageTypes: ["Carton", "Pouch", "Bottle", "Can", "Wrapper"],
    applicableCategories: ["Packaged Commodities (All)"],
    exemptions: ["Packages containing food grains over 25kg", "Export commodities"],
    isRequired: true,
    isActive: true,
    versionHistory: [
      {
        version: "v1.4.0",
        updatedAt: "2026-01-15",
        updatedBy: "Dhruv Patel (Admin)",
        changeSummary: "Standardized currency glyph variants and unicode rupee compatibility.",
        isCurrent: true,
      },
      {
        version: "v1.3.0",
        updatedAt: "2025-06-10",
        updatedBy: "Legal Metrology Committee",
        changeSummary: "Enforced mandatory inclusion of tax clarification wording.",
        isCurrent: false,
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2026-01-15",
  },
  {
    id: "rule-c02",
    ruleCode: "C02",
    field: "Net Quantity Declaration",
    category: "numerical_unit",
    severity: "CRITICAL",
    status: "active",
    version: "v1.2.0",
    condition: "Net quantity must be declared in standard metric units (g, kg, ml, l) without misleading non-standard symbols.",
    validationLogic: "REGEX: \\d+(\\.\\d+)?\\s*(g|kg|ml|l|L|m|cm|mm|N|U)$",
    legalReference: "PCR 2011, Rule 6(1)(a) read with Rule 12 & Rule 13",
    description: "Prohibits archaic or non-metric symbols like 'gms', 'kilo', or 'litres' to prevent consumer misrepresentation.",
    effectiveFrom: "2024-01-01",
    applicablePackageTypes: ["All Types"],
    applicableCategories: ["Liquids", "Solids", "Gases", "Numerical Units"],
    exemptions: ["Bidi packets containing less than 20 bidis"],
    isRequired: true,
    isActive: true,
    versionHistory: [
      {
        version: "v1.2.0",
        updatedAt: "2025-11-20",
        updatedBy: "Meet Kanakiya",
        changeSummary: "Added unit tolerance validation rules.",
        isCurrent: true,
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2025-11-20",
  },
  {
    id: "rule-c03",
    ruleCode: "C03",
    field: "Consumer Care Contact Information",
    category: "mandatory_declaration",
    severity: "HIGH",
    status: "active",
    version: "v1.1.0",
    condition: "Must declare name, address, telephone number, and active email address of consumer grievance officer.",
    validationLogic: "CONTAINS: (consumer\\s*care|grievance|helpline) AND (email|@) AND (tel|phone|toll\\s*free)",
    legalReference: "PCR 2011, Rule 6(1)(g)",
    description: "Empowers consumer grievance redressal with accessible contact channels on retail commodity labels.",
    effectiveFrom: "2024-03-01",
    applicablePackageTypes: ["All Types"],
    applicableCategories: ["Retail Packaged Commodities"],
    exemptions: ["Surface area less than 10 square centimetres"],
    isRequired: true,
    isActive: true,
    versionHistory: [
      {
        version: "v1.1.0",
        updatedAt: "2025-08-14",
        updatedBy: "Dhruv Patel (Admin)",
        changeSummary: "Mandated email specification alongside telephone hotline.",
        isCurrent: true,
      },
    ],
    createdAt: "2024-03-01",
    updatedAt: "2025-08-14",
  },
  {
    id: "rule-c04",
    ruleCode: "C04",
    field: "Month and Year of Manufacture / Packing",
    category: "mandatory_declaration",
    severity: "HIGH",
    status: "active",
    version: "v1.0.0",
    condition: "Must explicitly declare the month and year in which the commodity is manufactured, packed or imported.",
    validationLogic: "REGEX: (mfg|packed|imported)\\s*(date|on)?\\s*:?\\s*(0[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\\s/.-]*(\\d{4}|\\d{2})",
    legalReference: "PCR 2011, Rule 6(1)(d)",
    description: "Prevents deceptive shelf-life rotation and guarantees consumer freshness information.",
    effectiveFrom: "2024-01-01",
    applicablePackageTypes: ["All Types"],
    applicableCategories: ["Food", "Chemicals", "Perishables", "FMCG"],
    exemptions: ["Packages of agmark ghee/butter with separate state validity stamps"],
    isRequired: true,
    isActive: true,
    versionHistory: [
      {
        version: "v1.0.0",
        updatedAt: "2024-01-01",
        updatedBy: "System Baseline",
        changeSummary: "Initial statutory baseline release.",
        isCurrent: true,
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "rule-c05",
    ruleCode: "C05",
    field: "Minimum Font Height Specifications",
    category: "placement_readability",
    severity: "MEDIUM",
    status: "active",
    version: "v1.3.0",
    condition: "Declaration numerals and letters must meet minimum millimeter height based on principal display panel area.",
    validationLogic: "SPATIAL: font_height_mm >= table1_min_height(display_panel_area_sq_cm)",
    legalReference: "PCR 2011, Rule 7 & Table 1",
    description: "Enforces visual clarity and stops manufacturers from burying mandatory declarations in microscopic text.",
    effectiveFrom: "2024-02-01",
    applicablePackageTypes: ["Cartons", "Bottles", "Pouch Packs"],
    applicableCategories: ["All Packaged Commodities"],
    exemptions: [],
    isRequired: true,
    isActive: true,
    versionHistory: [
      {
        version: "v1.3.0",
        updatedAt: "2026-02-02",
        updatedBy: "Dhruv Patel (Admin)",
        changeSummary: "Refined millimeter OCR bounding polygon aspect ratio math.",
        isCurrent: true,
      },
    ],
    createdAt: "2024-02-01",
    updatedAt: "2026-02-02",
  },
  {
    id: "rule-c06",
    ruleCode: "C06",
    field: "E-Commerce Digital Readiness Declaration",
    category: "format_standard",
    severity: "LOW",
    status: "draft",
    version: "v0.9.0",
    condition: "Digital product listings must synchronize with physical label OCR entity hashes.",
    validationLogic: "HASH_VERIFY: listing_attributes_hash == label_declaration_hash",
    legalReference: "E-Commerce Rules 2020 Amendment under Consumer Protection Act",
    description: "Validates parity between physical package declarations and online marketplace listings.",
    effectiveFrom: "2026-10-01",
    applicablePackageTypes: ["E-Commerce Shipments"],
    applicableCategories: ["Online Retail"],
    exemptions: ["Direct consumer-to-consumer second hand listings"],
    isRequired: false,
    isActive: false,
    versionHistory: [
      {
        version: "v0.9.0",
        updatedAt: "2026-08-20",
        updatedBy: "Ranjit Kadachha",
        changeSummary: "Drafted for upcoming 2026 Q4 gazette enforcement rollout.",
        isCurrent: true,
      },
    ],
    createdAt: "2026-08-20",
    updatedAt: "2026-08-20",
  },
];

export async function getMetrologyRules(): Promise<MetrologyRule[]> {
  return [...MOCK_RULES];
}

export async function getMetrologyRuleById(id: string): Promise<MetrologyRule | null> {
  const rule = MOCK_RULES.find((r) => r.id === id || r.ruleCode.toLowerCase() === id.toLowerCase());
  return rule ? { ...rule } : null;
}

export async function createMetrologyRule(data: Partial<MetrologyRule>): Promise<MetrologyRule> {
  const newRule: MetrologyRule = {
    id: `rule-${(data.ruleCode || `c${MOCK_RULES.length + 1}`).toLowerCase()}`,
    ruleCode: data.ruleCode || `C${MOCK_RULES.length + 1}`,
    field: data.field || "Custom Mandatory Declaration",
    category: data.category || "mandatory_declaration",
    severity: data.severity || "MEDIUM",
    status: data.status || "draft",
    version: "v1.0.0",
    condition: data.condition || "",
    validationLogic: data.validationLogic || "",
    legalReference: data.legalReference || "Legal Metrology Act 2009",
    description: data.description || "",
    effectiveFrom: data.effectiveFrom || new Date().toISOString().split("T")[0],
    applicablePackageTypes: data.applicablePackageTypes || ["All Types"],
    applicableCategories: data.applicableCategories || ["General"],
    exemptions: data.exemptions || [],
    isRequired: data.isRequired ?? true,
    isActive: data.isActive ?? false,
    versionHistory: [
      {
        version: "v1.0.0",
        updatedAt: new Date().toISOString().split("T")[0],
        updatedBy: "Admin Portal",
        changeSummary: "Initial rule creation",
        isCurrent: true,
      },
    ],
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };

  MOCK_RULES = [newRule, ...MOCK_RULES];
  return { ...newRule };
}

export async function updateMetrologyRule(id: string, data: Partial<MetrologyRule>): Promise<MetrologyRule> {
  const index = MOCK_RULES.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Rule not found");

  const existing = MOCK_RULES[index];
  const newVersion = `v${parseFloat(existing.version.replace("v", "")) + 0.1}0`;

  const updatedHistory = [
    {
      version: newVersion,
      updatedAt: new Date().toISOString().split("T")[0],
      updatedBy: "Admin Portal",
      changeSummary: "Admin modification & condition update",
      isCurrent: true,
    },
    ...existing.versionHistory.map((v) => ({ ...v, isCurrent: false })),
  ];

  MOCK_RULES[index] = {
    ...existing,
    ...data,
    version: newVersion,
    updatedAt: new Date().toISOString().split("T")[0],
    versionHistory: updatedHistory,
  };

  return { ...MOCK_RULES[index] };
}

export async function deleteMetrologyRule(id: string): Promise<void> {
  MOCK_RULES = MOCK_RULES.filter((r) => r.id !== id);
}

export function testEvaluateRule(
  validationLogic: string,
  sampleText: string
): { passed: boolean; matchSnippet?: string; explanation: string } {
  if (!validationLogic || !sampleText) {
    return { passed: false, explanation: "Missing validation logic or sample text input." };
  }

  try {
    if (validationLogic.startsWith("REGEX:")) {
      const patternStr = validationLogic.replace("REGEX:", "").trim();
      const regex = new RegExp(patternStr, "i");
      const match = sampleText.match(regex);
      if (match) {
        return {
          passed: true,
          matchSnippet: match[0],
          explanation: `Evaluated successfully. Matched regex pattern: "${match[0]}"`,
        };
      }
      return {
        passed: false,
        explanation: `Evaluation failed: Sample text does not conform to regex pattern ${patternStr}`,
      };
    }

    if (validationLogic.startsWith("CONTAINS:")) {
      const keywords = validationLogic
        .replace("CONTAINS:", "")
        .toLowerCase()
        .split("and")
        .map((k) => k.trim());
      const lower = sampleText.toLowerCase();
      const allMatched = keywords.every((kw) => lower.includes(kw.replace(/[()]/g, "")));
      return {
        passed: allMatched,
        explanation: allMatched
          ? `All required keywords were detected in the text.`
          : `Missing required keywords. Expected presence of: ${keywords.join(", ")}`,
      };
    }

    return {
      passed: true,
      explanation: "Deterministic condition verified by statutory parser mock.",
    };
  } catch (err: unknown) {
    return {
      passed: false,
      explanation: `Syntax error in validation logic: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}
