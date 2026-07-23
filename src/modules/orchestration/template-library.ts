import type { WorkflowTemplateData, WorkflowStep } from "./types";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

const BUILT_IN_TEMPLATES: Omit<WorkflowTemplateData, "id" | "companyId" | "createdAt" | "updatedAt">[] = [
  {
    slug: "month-end-close",
    name: "Month-End Close",
    description: "Standard month-end close workflow: reconcile accounts, run reports, notify stakeholders",
    category: "month-end",
    estimatedDuration: "2h",
    requiredModules: ["ledger", "reporting", "approval", "notification"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "ledger", action: "verify_trial_balance", label: "Verify Trial Balance", timeoutMs: 300000 },
      { index: 1, type: "module_action", module: "ledger", action: "run_reconciliation", label: "Reconcile Accounts", timeoutMs: 600000 },
      { index: 2, type: "condition", label: "Check Reconciliation Status", config: { check: "reconciliation_complete" } },
      { index: 3, type: "module_action", module: "reporting", action: "generate_financial_statements", label: "Generate Financial Statements", timeoutMs: 300000 },
      { index: 4, type: "module_action", module: "approval", action: "request_close_approval", label: "Request Close Approval" },
      { index: 5, type: "notification", label: "Notify Accounting Team", config: { triggerOn: "complete", channel: "all", role: "controller" } },
    ],
  },
  {
    slug: "daily-treasury-review",
    name: "Daily Treasury Review",
    description: "Morning treasury check: cash position, FX rates, liquidity alerts",
    category: "treasury",
    estimatedDuration: "15m",
    requiredModules: ["treasury", "intelligence", "notification"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "treasury", action: "get_cash_position", label: "Fetch Cash Position", timeoutMs: 60000 },
      { index: 1, type: "module_action", module: "treasury", action: "get_fx_rates", label: "Fetch FX Rates", timeoutMs: 60000 },
      { index: 2, type: "module_action", module: "intelligence", action: "check_liquidity", label: "Check Liquidity Alerts", timeoutMs: 60000 },
      { index: 3, type: "notification", label: "Send Treasury Summary", config: { triggerOn: "complete", channel: "in-app", role: "treasurer" } },
    ],
  },
  {
    slug: "weekly-executive-brief",
    name: "Weekly Executive Brief",
    description: "Weekly financial summary for executives: KPIs, variances, recommendations",
    category: "reporting",
    estimatedDuration: "30m",
    requiredModules: ["reporting", "intelligence", "notification"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "intelligence", action: "compute_kpis", label: "Compute Key KPIs", timeoutMs: 120000 },
      { index: 1, type: "module_action", module: "reporting", action: "generate_variance_report", label: "Generate Variance Report", timeoutMs: 120000 },
      { index: 2, type: "module_action", module: "intelligence", action: "get_recommendations", label: "Get AI Recommendations", timeoutMs: 60000 },
      { index: 3, type: "notification", label: "Deliver Executive Brief", config: { triggerOn: "complete", channel: "email", role: "cfo" } },
    ],
  },
  {
    slug: "bank-reconciliation",
    name: "Bank Reconciliation",
    description: "Automated bank reconciliation workflow",
    category: "reconciliation",
    estimatedDuration: "45m",
    requiredModules: ["integration", "ledger"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "integration", action: "sync_bank_transactions", label: "Sync Bank Transactions", timeoutMs: 180000 },
      { index: 1, type: "module_action", module: "ledger", action: "match_transactions", label: "Match Transactions", timeoutMs: 300000 },
      { index: 2, type: "condition", label: "Check Match Rate", config: { threshold: 0.95 } },
      { index: 3, type: "notification", label: "Reconciliation Complete", config: { triggerOn: "complete", channel: "in-app", role: "controller" } },
    ],
  },
  {
    slug: "cash-forecast-refresh",
    name: "Cash Forecast Refresh",
    description: "Refresh 13-week cash forecast with latest data",
    category: "treasury",
    estimatedDuration: "20m",
    requiredModules: ["treasury", "intelligence"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "treasury", action: "get_cash_position", label: "Get Current Cash", timeoutMs: 60000 },
      { index: 1, type: "module_action", module: "treasury", action: "get_receivables", label: "Get Receivables", timeoutMs: 60000 },
      { index: 2, type: "module_action", module: "treasury", action: "get_payables", label: "Get Payables", timeoutMs: 60000 },
      { index: 3, type: "module_action", module: "intelligence", action: "forecast_cash", label: "Run Forecast Model", timeoutMs: 120000 },
      { index: 4, type: "module_action", module: "treasury", action: "update_forecast", label: "Update Forecast Report", timeoutMs: 60000 },
    ],
  },
  {
    slug: "budget-review",
    name: "Budget vs Actual Review",
    description: "Compare budget against actuals and flag variances",
    category: "budget",
    estimatedDuration: "30m",
    requiredModules: ["reporting", "intelligence", "notification"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "reporting", action: "get_budget_data", label: "Load Budget Data", timeoutMs: 60000 },
      { index: 1, type: "module_action", module: "reporting", action: "get_actuals", label: "Load Actuals", timeoutMs: 60000 },
      { index: 2, type: "module_action", module: "intelligence", action: "compute_variances", label: "Compute Variances", timeoutMs: 120000 },
      { index: 3, type: "condition", label: "Check Material Variances", config: { threshold: 0.1 } },
      { index: 4, type: "notification", label: "Alert on Variances", config: { triggerOn: "threshold", channel: "email", role: "finance-manager" } },
    ],
  },
  {
    slug: "board-pack-preparation",
    name: "Board Pack Preparation",
    description: "Compile board pack with financial statements, KPIs, and executive summary",
    category: "board",
    estimatedDuration: "4h",
    requiredModules: ["reporting", "intelligence", "notification"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "reporting", action: "generate_income_statement", label: "Income Statement", timeoutMs: 180000 },
      { index: 1, type: "module_action", module: "reporting", action: "generate_balance_sheet", label: "Balance Sheet", timeoutMs: 180000 },
      { index: 2, type: "module_action", module: "reporting", action: "generate_cash_flow", label: "Cash Flow Statement", timeoutMs: 180000 },
      { index: 3, type: "module_action", module: "intelligence", action: "compute_scorecard", label: "Executive Scorecard", timeoutMs: 120000 },
      { index: 4, type: "module_action", module: "approval", action: "request_review", label: "CFO Review", timeoutMs: 86400000 },
      { index: 5, type: "notification", label: "Board Pack Ready", config: { triggerOn: "complete", channel: "email", role: "cfo" } },
    ],
  },
  {
    slug: "quarter-end-close",
    name: "Quarter-End Close",
    description: "Comprehensive quarter-end close with full reconciliation and reporting",
    category: "month-end",
    estimatedDuration: "8h",
    requiredModules: ["ledger", "reporting", "treasury", "integration", "approval", "notification"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "integration", action: "sync_all", label: "Sync All Integrations", timeoutMs: 600000 },
      { index: 1, type: "module_action", module: "ledger", action: "verify_trial_balance", label: "Verify Trial Balance", timeoutMs: 300000 },
      { index: 2, type: "module_action", module: "ledger", action: "run_reconciliation", label: "Full Reconciliation", timeoutMs: 600000 },
      { index: 3, type: "module_action", module: "treasury", action: "confirm_cash", label: "Confirm Cash Position", timeoutMs: 180000 },
      { index: 4, type: "module_action", module: "reporting", action: "generate_financial_statements", label: "Quarterly Statements", timeoutMs: 600000 },
      { index: 5, type: "module_action", module: "intelligence", action: "compute_kpis", label: "Q KPIs", timeoutMs: 180000 },
      { index: 6, type: "module_action", module: "approval", action: "request_close_approval", label: "Controller Approval" },
      { index: 7, type: "module_action", module: "approval", action: "request_close_approval", label: "CFO Approval" },
      { index: 8, type: "notification", label: "Quarter Close Complete", config: { triggerOn: "complete", channel: "all", role: "cfo" } },
    ],
  },
  {
    slug: "year-end-close",
    name: "Year-End Close",
    description: "Full year-end close with audit preparation and compliance checks",
    category: "audit",
    estimatedDuration: "16h",
    requiredModules: ["ledger", "reporting", "treasury", "integration", "approval", "notification", "intelligence"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "ledger", action: "verify_trial_balance", label: "Annual Trial Balance", timeoutMs: 600000 },
      { index: 1, type: "module_action", module: "ledger", action: "run_reconciliation", label: "Annual Reconciliation", timeoutMs: 1200000 },
      { index: 2, type: "module_action", module: "treasury", action: "annual_cash_summary", label: "Annual Cash Summary", timeoutMs: 300000 },
      { index: 3, type: "module_action", module: "reporting", action: "generate_financial_statements", label: "Annual Statements", timeoutMs: 600000 },
      { index: 4, type: "module_action", module: "intelligence", action: "compute_scorecard", label: "Annual Scorecard", timeoutMs: 300000 },
      { index: 5, type: "module_action", module: "approval", action: "request_close_approval", label: "Audit Committee Review" },
      { index: 6, type: "notification", label: "Year-End Complete", config: { triggerOn: "complete", channel: "email", role: "cfo" } },
    ],
  },
  {
    slug: "audit-preparation",
    name: "Audit Preparation",
    description: "Prepare all documentation and reports for external audit",
    category: "audit",
    estimatedDuration: "4h",
    requiredModules: ["ledger", "reporting", "integration", "notification"],
    isBuiltIn: true,
    steps: [
      { index: 0, type: "module_action", module: "ledger", action: "export_all_ledger", label: "Export Ledger Data", timeoutMs: 300000 },
      { index: 1, type: "module_action", module: "reporting", action: "generate_trial_balance", label: "Trial Balance Report", timeoutMs: 120000 },
      { index: 2, type: "module_action", module: "reporting", action: "generate_general_ledger", label: "General Ledger Report", timeoutMs: 120000 },
      { index: 3, type: "module_action", module: "integration", action: "export_audit_logs", label: "Export Audit Logs", timeoutMs: 180000 },
      { index: 4, type: "notification", label: "Audit Package Ready", config: { triggerOn: "complete", channel: "email", role: "auditor" } },
    ],
  },
];

export class TemplateLibrary {
  static async seedBuiltIns(ctx: TenantContext): Promise<void> {
    for (const tmpl of BUILT_IN_TEMPLATES) {
      const existing = await prisma.workflowTemplate.findUnique({
        where: { companyId_slug: { companyId: ctx.companyId, slug: tmpl.slug } },
      });
      if (!existing) {
        await prisma.workflowTemplate.create({
          data: {
            companyId: ctx.companyId,
            slug: tmpl.slug,
            name: tmpl.name,
            description: tmpl.description,
            category: tmpl.category,
            steps: tmpl.steps as never,
            estimatedDuration: tmpl.estimatedDuration,
            requiredModules: tmpl.requiredModules as never,
            isBuiltIn: true,
          },
        });
      }
    }
  }

  static async list(ctx: TenantContext, category?: string): Promise<WorkflowTemplateData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (category) where.category = category;
    const rows = await prisma.workflowTemplate.findMany({
      where: where as never,
      orderBy: [{ isBuiltIn: "desc" }, { name: "asc" }],
    });
    return rows.map((t) => ({
      id: t.id, companyId: t.companyId, slug: t.slug, name: t.name,
      description: t.description ?? undefined, category: t.category as WorkflowTemplateData["category"],
      steps: t.steps as never as Array<WorkflowStep>, estimatedDuration: t.estimatedDuration ?? undefined,
      requiredModules: t.requiredModules as string[] | undefined,
      isBuiltIn: t.isBuiltIn,
      createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
    }));
  }

  static async get(ctx: TenantContext, id: string): Promise<WorkflowTemplateData | null> {
    const t = await prisma.workflowTemplate.findUnique({ where: { id } });
    if (!t || t.companyId !== ctx.companyId) return null;
    return {
      id: t.id, companyId: t.companyId, slug: t.slug, name: t.name,
      description: t.description ?? undefined, category: t.category as WorkflowTemplateData["category"],
      steps: t.steps as never as Array<WorkflowStep>, estimatedDuration: t.estimatedDuration ?? undefined,
      requiredModules: t.requiredModules as string[] | undefined,
      isBuiltIn: t.isBuiltIn,
      createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
    };
  }

  static async instantiate(ctx: TenantContext, templateId: string, name: string): Promise<unknown> {
    const tmpl = await this.get(ctx, templateId);
    if (!tmpl) throw new Error("Template not found");
    return await prisma.workflowDefinition.create({
      data: {
        companyId: ctx.companyId,
        name,
        description: tmpl.description,
        category: tmpl.category,
        steps: tmpl.steps as never,
      },
    });
  }
}
