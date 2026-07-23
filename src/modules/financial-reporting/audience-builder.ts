import type { AudiencePreset, ReportAudience, ReportType, ReportConfig } from "./types";

const presets: AudiencePreset[] = [
  {
    audience: "ceo",
    label: "CEO",
    description: "Strategic overview for executive leadership",
    reportTypes: ["profit-loss", "balance-sheet", "cash-flow", "treasury-report"],
    configOverrides: { compact: true, comparison: "prior-year" },
    defaultSections: ["executive-summary", "kpi-highlights", "financial-summary"],
  },
  {
    audience: "cfo",
    label: "CFO",
    description: "Full financial performance with variance analysis",
    reportTypes: ["profit-loss", "balance-sheet", "cash-flow", "equity-statement", "treasury-report", "fx-exposure", "cash-position", "budget-vs-actual"],
    configOverrides: { comparison: "prior-period" },
    defaultSections: ["executive-summary", "financial-statements", "variance-analysis", "treasury-summary", "commentary"],
  },
  {
    audience: "treasurer",
    label: "Treasurer",
    description: "Cash, liquidity, and FX exposure management",
    reportTypes: ["treasury-report", "cash-position", "fx-exposure", "cash-flow"],
    configOverrides: { compact: true, currency: "USD" },
    defaultSections: ["cash-summary", "fx-exposure", "liquidity", "forecast"],
  },
  {
    audience: "controller",
    label: "Controller",
    description: "Detailed ledger, trial balance, and journal integrity",
    reportTypes: ["trial-balance", "general-ledger", "journal-report", "chart-of-accounts", "balance-sheet"],
    configOverrides: { showZeroBalances: false },
    defaultSections: ["detail-accounts", "transactions", "aging-summary", "reconciliation"],
  },
  {
    audience: "finance-manager",
    label: "Finance Manager",
    description: "Department and cost center performance",
    reportTypes: ["department-pl", "cost-center", "budget-vs-actual", "profit-loss"],
    configOverrides: { groupBy: ["department"] },
    defaultSections: ["department-summary", "cost-center-analysis", "budget-variance"],
  },
  {
    audience: "board",
    label: "Board of Directors",
    description: "Consolidated governance view with multi-entity oversight",
    reportTypes: ["consolidated-group", "multi-company", "balance-sheet", "profit-loss", "cash-flow", "treasury-report"],
    configOverrides: { compact: true, comparison: "prior-year" },
    defaultSections: ["executive-summary", "consolidated-statements", "segment-analysis", "commentary", "recommendations"],
  },
  {
    audience: "auditor",
    label: "Auditor",
    description: "Audit trail, ledger integrity, and reconciliation",
    reportTypes: ["general-ledger", "journal-report", "trial-balance", "chart-of-accounts", "aged-receivables", "aged-payables"],
    configOverrides: { showZeroBalances: true, includeDrillDown: true },
    defaultSections: ["audit-trail", "journal-entries", "account-balances", "source-documents"],
  },
  {
    audience: "investor",
    label: "Investor",
    description: "Financial health, profitability, and growth metrics",
    reportTypes: ["profit-loss", "balance-sheet", "cash-flow", "equity-statement"],
    configOverrides: { comparison: "prior-year" },
    defaultSections: ["financial-highlights", "income-statement", "balance-sheet", "cash-flow", "equity"],
  },
  {
    audience: "department-manager",
    label: "Department Manager",
    description: "Department budget vs actual and cost control",
    reportTypes: ["department-pl", "cost-center", "budget-vs-actual"],
    configOverrides: { groupBy: ["department"], comparison: "budget" },
    defaultSections: ["department-performance", "cost-analysis", "budget-status"],
  },
];

export class AudienceBuilder {
  static getPresets(): AudiencePreset[] {
    return presets;
  }

  static getPreset(audience: ReportAudience): AudiencePreset | undefined {
    return presets.find((p) => p.audience === audience);
  }

  static applyAudienceConfig(audience: ReportAudience, baseConfig: ReportConfig): ReportConfig {
    const preset = this.getPreset(audience);
    if (!preset) return { ...baseConfig };

    return {
      ...baseConfig,
      ...preset.configOverrides,
      dateRange: baseConfig.dateRange,
      companyIds: baseConfig.companyIds,
      entityIds: baseConfig.entityIds,
      departmentIds: baseConfig.departmentIds,
      costCenterIds: baseConfig.costCenterIds,
      projectIds: baseConfig.projectIds,
    };
  }

  static getRecommendedReportTypes(audience: ReportAudience): ReportType[] {
    const preset = this.getPreset(audience);
    return preset?.reportTypes ?? [];
  }
}
