import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { RoleDashboardData, RoleDashboardConfig, RoleType } from "./types";

const ROLE_DASHBOARDS: { role: RoleType; config: RoleDashboardConfig }[] = [
  {
    role: "cfo",
    config: {
      layout: { widgets: ["cash-position", "approval-queue", "forecast", "risk-summary", "kpi-grid"], columns: 3 },
      kpis: ["cashBalance", "monthlyBurn", "receivablesDays", "approvalSla"],
      reports: ["cash-flow", "p-l-summary", "balance-sheet"],
      quickActions: ["approve-pending", "review-forecast", "export-report"],
      approvals: true, notifications: true, recommendations: true,
    },
  },
  {
    role: "controller",
    config: {
      layout: { widgets: ["reconciliation-status", "month-end-progress", "gl-activity", "exception-list", "approval-queue"], columns: 3 },
      kpis: ["reconciliationRate", "openExceptions", "monthEndProgress", "journalEntries"],
      reports: ["trial-balance", "reconciliation-summary", "audit-log"],
      quickActions: ["run-reconciliation", "review-exceptions", "close-period"],
      approvals: true, notifications: true, recommendations: true,
    },
  },
  {
    role: "treasurer",
    config: {
      layout: { widgets: ["cash-position", "liquidity-overview", "fx-exposure", "forecast", "transfer-queue"], columns: 3 },
      kpis: ["totalCash", "liquidityRatio", "fxExposure", "forecastAccuracy"],
      reports: ["cash-position", "liquidity-report", "fx-report"],
      quickActions: ["initiate-transfer", "review-fx", "update-forecast"],
      approvals: true, notifications: true, recommendations: true,
    },
  },
  {
    role: "finance-manager",
    config: {
      layout: { widgets: ["team-activity", "approval-queue", "exception-list", "calendar", "kpi-grid"], columns: 2 },
      kpis: ["pendingApprovals", "teamThroughput", "slaCompliance", "openItems"],
      reports: ["activity-summary", "approval-report", "exception-report"],
      quickActions: ["review-pending", "assign-task", "generate-report"],
      approvals: true, notifications: true, recommendations: false,
    },
  },
  {
    role: "ap",
    config: {
      layout: { widgets: ["invoice-queue", "payment-schedule", "vendor-list", "exception-list"], columns: 2 },
      kpis: ["invoicesPending", "paymentsDue", "vendorCount", "discrepancies"],
      reports: ["ap-aging", "payment-summary", "vendor-report"],
      quickActions: ["process-invoices", "approve-payment", "resolve-exception"],
      approvals: false, notifications: true, recommendations: false,
    },
  },
  {
    role: "ar",
    config: {
      layout: { widgets: ["receivables-aging", "collection-queue", "customer-list", "cash-application"], columns: 2 },
      kpis: ["receivablesOutstanding", "agingBuckets", "collectionRate", "cashApplied"],
      reports: ["ar-aging", "collection-report", "customer-report"],
      quickActions: ["apply-cash", "send-reminder", "review-aging"],
      approvals: false, notifications: true, recommendations: false,
    },
  },
  {
    role: "auditor",
    config: {
      layout: { widgets: ["audit-trail", "policy-violations", "approval-history", "compliance-score"], columns: 2 },
      kpis: ["violationsOpen", "complianceRate", "auditCoverage", "findingsResolved"],
      reports: ["audit-log", "violation-report", "compliance-report"],
      quickActions: ["export-audit-log", "review-violations", "run-compliance-check"],
      approvals: false, notifications: true, recommendations: true,
    },
  },
  {
    role: "administrator",
    config: {
      layout: { widgets: ["user-activity", "system-health", "integration-status", "adoption-metrics", "security-overview"], columns: 3 },
      kpis: ["activeUsers", "systemUptime", "integrationsOnline", "adoptionScore"],
      reports: ["user-report", "system-report", "security-report"],
      quickActions: ["manage-users", "configure-integrations", "view-logs"],
      approvals: false, notifications: true, recommendations: true,
    },
  },
];

export class RoleExperienceService {
  static async initialize(ctx: TenantContext): Promise<RoleDashboardData[]> {
    const results: RoleDashboardData[] = [];
    for (const rd of ROLE_DASHBOARDS) {
      const record = await prisma.roleDashboard.upsert({
        where: { companyId_role: { companyId: ctx.companyId, role: rd.role } },
        create: {
          companyId: ctx.companyId,
          role: rd.role,
          config: rd.config as any,
          isDefault: true,
        },
        update: {
          config: rd.config as any,
        },
      });
      results.push(record as unknown as RoleDashboardData);
    }
    return results;
  }

  static async getDashboard(ctx: TenantContext, role: RoleType): Promise<RoleDashboardData | null> {
    const record = await prisma.roleDashboard.findUnique({
      where: { companyId_role: { companyId: ctx.companyId, role } },
    });
    return record as unknown as RoleDashboardData | null;
  }

  static async list(ctx: TenantContext): Promise<RoleDashboardData[]> {
    const records = await prisma.roleDashboard.findMany({
      where: { companyId: ctx.companyId },
    });
    return records as unknown as RoleDashboardData[];
  }

  static async update(ctx: TenantContext, role: RoleType, config: RoleDashboardConfig): Promise<RoleDashboardData> {
    const record = await prisma.roleDashboard.update({
      where: { companyId_role: { companyId: ctx.companyId, role } },
      data: { config: config as any },
    });
    return record as unknown as RoleDashboardData;
  }

  static async getCFOHighlights(ctx: TenantContext): Promise<{
    totalCash: number;
    pendingApprovals: number;
    pendingApprovalAmount: number;
    reconciliationStatus: string;
    openRisks: number;
  }> {
    const [cashAgg, pendingApprovals, lastRec, openRisks] = await Promise.all([
      prisma.treasuryCashPosition.aggregate({
        where: { companyId: ctx.companyId },
        _sum: { totalBalance: true },
      }),
      prisma.transactionApproval.count({
        where: { companyId: ctx.companyId, status: "PENDING" },
      }),
      prisma.reconciliationRun.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
        select: { status: true },
      }),
      prisma.riskAlert.count({
        where: { companyId: ctx.companyId, status: "OPEN" },
      }),
    ]);
    const pendingAmountAgg = await prisma.transaction.findMany({
      where: {
        companyId: ctx.companyId,
        status: "PENDING_APPROVAL",
      },
      select: { primaryAmount: true },
    });
    const pendingApprovalAmount = pendingAmountAgg.reduce((sum, t) => sum + Number(t.primaryAmount), 0);

    return {
      totalCash: Number(cashAgg._sum.totalBalance ?? 0),
      pendingApprovals,
      pendingApprovalAmount,
      reconciliationStatus: lastRec?.status ?? "UNKNOWN",
      openRisks,
    };
  }
}
