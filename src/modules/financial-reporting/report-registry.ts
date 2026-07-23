import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportType, ReportConfig, ReportSection } from "./types";

export interface ReportTypeInfo {
  type: ReportType;
  name: string;
  description: string;
  category: string;
}

export const REPORT_TYPE_REGISTRY: ReportTypeInfo[] = [
  { type: "balance-sheet", name: "Balance Sheet", description: "Assets, liabilities, and equity at a point in time", category: "Financial Statement" },
  { type: "profit-loss", name: "Profit & Loss", description: "Revenue, expenses, and net income over a period", category: "Financial Statement" },
  { type: "cash-flow", name: "Cash Flow Statement", description: "Operating, investing, and financing cash flows", category: "Financial Statement" },
  { type: "equity-statement", name: "Equity Statement", description: "Changes in equity over the reporting period", category: "Financial Statement" },
  { type: "trial-balance", name: "Trial Balance", description: "All account balances before adjustments", category: "Ledger" },
  { type: "general-ledger", name: "General Ledger", description: "Detailed transaction history by account", category: "Ledger" },
  { type: "journal-report", name: "Journal Report", description: "Chronological journal entry listing", category: "Ledger" },
  { type: "chart-of-accounts", name: "Chart of Accounts", description: "Complete account structure listing", category: "Ledger" },
  { type: "aged-receivables", name: "Aged Receivables", description: "Customer outstanding balances by aging bucket", category: "Aging" },
  { type: "aged-payables", name: "Aged Payables", description: "Vendor outstanding balances by aging bucket", category: "Aging" },
  { type: "fixed-assets", name: "Fixed Assets Schedule", description: "Fixed asset register with depreciation", category: "Ledger" },
  { type: "budget-vs-actual", name: "Budget vs Actual", description: "Comparison of budgeted vs actual amounts", category: "Analytics" },
  { type: "department-pl", name: "Department P&L", description: "Profit and loss segmented by department", category: "Analytics" },
  { type: "cost-center", name: "Cost Center Report", description: "Expenses grouped by cost center", category: "Analytics" },
  { type: "consolidated-group", name: "Consolidated Group", description: "Multi-entity consolidated financial statements", category: "Consolidation" },
  { type: "multi-company", name: "Multi-Company Comparison", description: "Side-by-side comparison across companies", category: "Consolidation" },
  { type: "treasury-report", name: "Treasury Report", description: "Cash, investments, and liquidity overview", category: "Treasury" },
  { type: "fx-exposure", name: "FX Exposure", description: "Foreign currency exposure by currency pair", category: "Treasury" },
  { type: "cash-position", name: "Cash Position", description: "Real-time cash balances across accounts", category: "Treasury" },
];

export const REPORT_TYPE_CATEGORIES = [
  "Financial Statement",
  "Ledger",
  "Aging",
  "Treasury",
  "Consolidation",
  "Analytics",
] as const;

const BUILDER_PATH_MAP: Record<ReportType, string> = {
  "balance-sheet": "./statement-builders/balance-sheet-builder",
  "profit-loss": "./statement-builders/profit-loss-builder",
  "cash-flow": "./statement-builders/cash-flow-builder",
  "trial-balance": "./statement-builders/trial-balance-builder",
  "general-ledger": "./statement-builders/general-ledger-builder",
  "journal-report": "./statement-builders/journal-report-builder",
  "chart-of-accounts": "./statement-builders/chart-of-accounts-builder",
  "aged-receivables": "./statement-builders/aged-receivables-builder",
  "aged-payables": "./statement-builders/aged-payables-builder",
  "fixed-assets": "./statement-builders/fixed-assets-builder",
  "equity-statement": "./statement-builders/equity-statement-builder",
  "budget-vs-actual": "./statement-builders/budget-vs-actual-builder",
  "department-pl": "./statement-builders/department-pl-builder",
  "cost-center": "./statement-builders/cost-center-builder",
  "consolidated-group": "./statement-builders/consolidated-reports-builder",
  "multi-company": "./statement-builders/multi-company-builder",
  "treasury-report": "./statement-builders/treasury-reports-builder",
  "fx-exposure": "./statement-builders/fx-exposure-builder",
  "cash-position": "./statement-builders/cash-position-builder",
};

export function getReportTypeInfo(type: ReportType): ReportTypeInfo {
  const info = REPORT_TYPE_REGISTRY.find((r) => r.type === type);
  if (!info) {
    throw new Error(`Unknown report type: "${type}"`);
  }
  return info;
}

export function getReportTypesByCategory(category: string): ReportTypeInfo[] {
  return REPORT_TYPE_REGISTRY.filter((r) => r.category === category);
}

export async function getBuilder(
  type: ReportType,
): Promise<{ build: (ctx: TenantContext, config: ReportConfig) => Promise<ReportSection[]> }> {
  const path = BUILDER_PATH_MAP[type];
  if (!path) {
    throw new Error(`No builder registered for report type: "${type}"`);
  }
  const mod = await import(path) as { build: (ctx: TenantContext, config: ReportConfig) => Promise<ReportSection[]> };
  return { build: mod.build };
}
