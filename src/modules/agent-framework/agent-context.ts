import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError } from "@/lib/errors/app-error";

export interface AgentContextBundle {
  financial: FinancialContext;
  treasury: TreasuryContext;
  reports: ReportContext;
  integrations: IntegrationContext;
  workflows: WorkflowContext;
  user: UserContext;
  policies: PolicyContext;
  generatedAt: string;
}

export interface FinancialContext {
  ledgerSummary: { totalDebits: number; totalCredits: number; entryCount: number };
  recentTransactions: { id: string; type: string; status: string; amount: number; currency: string; reference: string | null; createdAt: string }[];
  wallets: { id: string; name: string; balance: number; currency: string }[];
}

export interface TreasuryContext {
  cashPositions: { id: string; institutionName: string; totalBalance: number; availableBalance: number; currency: string; region: string; lastSyncedAt: string }[];
  liquidityPositions: { id: string; category: string; amount: number; percentageOfTotal: number; daysToLiquidate: number; currency: string }[];
  recentMovements: { id: string; amount: number; currency: string; status: string; fundingType: string; reason: string; createdAt: string }[];
}

export interface ReportContext {
  recentReportExecutions: { id: string; reportType: string; status: string; totalRows: number; executionTimeMs: number; createdAt: string }[];
  kpis: { id: string; kpiKey: string; label: string; category: string; currentValue: number; targetValue: number | null; status: string; trend: string | null }[];
}

export interface IntegrationContext {
  connectors: { id: string; name: string; type: string; active: boolean; lastRunAt: string | null; lastRunStatus: string | null }[];
  recentRuns: { id: string; connectorId: string; connectorName: string; status: string; event: string; startedAt: string | null; completedAt: string | null }[];
}

export interface WorkflowContext {
  activeWorkflows: { id: string; definitionId: string; status: string; currentStepId: string | null; startedAt: string | null; createdAt: string }[];
  pendingApprovals: { id: string; transactionId: string; companyId: string; createdAt: string }[];
}

export interface UserContext {
  userId: string;
  membershipRole: string;
  permissions: string[];
  preferences: Record<string, unknown>;
}

export interface PolicyContext {
  activePolicies: { id: string; name: string; type: string; enabled: boolean; priority: number }[];
  recentViolations: { id: string; title: string; severity: string; status: string; sourceModule: string; createdAt: string }[];
  complianceScore: number;
}

export class AgentContextEngine {
  static async getContext(ctx: TenantContext, agentId: string): Promise<AgentContextBundle> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const [financial, treasury, reports, integrations, workflows, user, policies] = await Promise.all([
      this.getFinancialContext(ctx, ctx.companyId),
      this.getTreasuryContext(ctx, ctx.companyId),
      this.getReportContext(ctx, ctx.companyId),
      this.getIntegrationContext(ctx, ctx.companyId),
      this.getWorkflowContext(ctx, ctx.companyId),
      this.getUserContext(ctx, ctx.userId, ctx.companyId),
      this.getPolicyContext(ctx, ctx.companyId),
    ]);

    return {
      financial,
      treasury,
      reports,
      integrations,
      workflows,
      user,
      policies,
      generatedAt: new Date().toISOString(),
    };
  }

  static async getFinancialContext(ctx: TenantContext, companyId: string): Promise<FinancialContext> {
    const [entries, wallets] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          amount: true,
          side: true,
          currency: true,
          createdAt: true,
          transaction: {
            select: {
              id: true,
              type: true,
              status: true,
              reference: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.wallet.findMany({
        where: { companyId },
        orderBy: { name: "asc" },
        take: 50,
        select: { id: true, name: true, balance: true, currency: true },
      }),
    ]);

    const totalDebits = entries
      .filter((e) => e.side === "DEBIT")
      .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);
    const totalCredits = entries
      .filter((e) => e.side === "CREDIT")
      .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);

    return {
      ledgerSummary: { totalDebits, totalCredits, entryCount: entries.length },
      recentTransactions: entries.map((e) => ({
        id: e.transaction.id,
        type: e.transaction.type,
        status: e.transaction.status,
        amount: Number(e.amount) * (e.side === "DEBIT" ? -1 : 1),
        currency: e.currency,
        reference: e.transaction.reference,
        createdAt: e.transaction.createdAt.toISOString(),
      })),
      wallets: wallets.map((w) => ({
        id: w.id,
        name: w.name,
        balance: Number(w.balance),
        currency: w.currency,
      })),
    };
  }

  static async getTreasuryContext(ctx: TenantContext, companyId: string): Promise<TreasuryContext> {
    const [positions, liquidity, movements] = await Promise.all([
      prisma.treasuryCashPosition.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.treasuryLiquidityPosition.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.treasuryCashMovement.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    return {
      cashPositions: positions.map((p) => ({
        id: p.id,
        institutionName: p.institutionName,
        totalBalance: Number(p.totalBalance),
        availableBalance: Number(p.availableBalance),
        currency: p.currency,
        region: p.region,
        lastSyncedAt: p.lastSyncedAt.toISOString(),
      })),
      liquidityPositions: liquidity.map((l) => ({
        id: l.id,
        category: l.category,
        amount: Number(l.amount),
        percentageOfTotal: l.percentageOfTotal,
        daysToLiquidate: l.daysToLiquidate,
        currency: l.currency,
      })),
      recentMovements: movements.map((m) => ({
        id: m.id,
        amount: Number(m.amount),
        currency: m.currency,
        status: m.status,
        fundingType: m.fundingType,
        reason: m.reason,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  static async getReportContext(ctx: TenantContext, companyId: string): Promise<ReportContext> {
    const [recentExecutions, kpis] = await Promise.all([
      prisma.financialReportExecution.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          reportType: true,
          status: true,
          totalRows: true,
          executionTimeMs: true,
          createdAt: true,
        },
      }),
      prisma.kPIValue.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20,
        distinct: ["kpiKey"],
        select: {
          id: true,
          kpiKey: true,
          label: true,
          category: true,
          currentValue: true,
          targetValue: true,
          status: true,
          trend: true,
        },
      }),
    ]);

    return {
      recentReportExecutions: recentExecutions.map((r) => ({
        id: r.id,
        reportType: r.reportType,
        status: r.status,
        totalRows: r.totalRows,
        executionTimeMs: r.executionTimeMs,
        createdAt: r.createdAt.toISOString(),
      })),
      kpis: kpis.map((k) => ({
        id: k.id,
        kpiKey: k.kpiKey,
        label: k.label,
        category: k.category,
        currentValue: k.currentValue,
        targetValue: k.targetValue,
        status: k.status,
        trend: k.trend,
      })),
    };
  }

  static async getIntegrationContext(ctx: TenantContext, companyId: string): Promise<IntegrationContext> {
    const [connectors, recentRuns] = await Promise.all([
      prisma.connectorConfig.findMany({
        where: { companyId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          active: true,
          runs: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { completedAt: true, status: true },
          },
        },
      }),
      prisma.connectorRun.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          connectorId: true,
          status: true,
          event: true,
          startedAt: true,
          completedAt: true,
          connector: { select: { name: true } },
        },
      }),
    ]);

    return {
      connectors: connectors.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        active: c.active,
        lastRunAt: c.runs[0]?.completedAt?.toISOString() ?? null,
        lastRunStatus: c.runs[0]?.status ?? null,
      })),
      recentRuns: recentRuns.map((r) => ({
        id: r.id,
        connectorId: r.connectorId,
        connectorName: r.connector.name,
        status: r.status,
        event: r.event,
        startedAt: r.startedAt?.toISOString() ?? null,
        completedAt: r.completedAt?.toISOString() ?? null,
      })),
    };
  }

  static async getWorkflowContext(ctx: TenantContext, companyId: string): Promise<WorkflowContext> {
    const [activeWorkflows, pendingApprovals] = await Promise.all([
      prisma.workflowInstance.findMany({
        where: { companyId, status: { in: ["RUNNING", "PAUSED", "WAITING"] } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          definitionId: true,
          status: true,
          currentStepId: true,
          startedAt: true,
          createdAt: true,
        },
      }),
      prisma.approvalThread.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          transactionId: true,
          companyId: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      activeWorkflows: activeWorkflows.map((w) => ({
        id: w.id,
        definitionId: w.definitionId,
        status: w.status,
        currentStepId: w.currentStepId,
        startedAt: w.startedAt?.toISOString() ?? null,
        createdAt: w.createdAt.toISOString(),
      })),
      pendingApprovals: pendingApprovals.map((a) => ({
        id: a.id,
        transactionId: a.transactionId,
        companyId: a.companyId,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  static async getUserContext(
    ctx: TenantContext,
    userId: string,
    companyId: string,
  ): Promise<UserContext> {
    const membership = await prisma.companyMembership.findUnique({
      where: { userId_companyId: { userId, companyId } },
      select: { role: true },
    });

    const roleAssignments = await prisma.userRole.findMany({
      where: { userId, companyId },
      select: {
        role: {
          select: {
            permissions: {
              select: {
                permission: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const permissionSet = new Set<string>();
    for (const assignment of roleAssignments) {
      for (const rp of assignment.role.permissions) {
        permissionSet.add(rp.permission.name);
      }
    }

    const preferences = await prisma.userPreference.findMany({
      where: { userId, companyId },
      select: { key: true, value: true },
    });

    const preferencesMap: Record<string, unknown> = {};
    for (const p of preferences) {
      preferencesMap[p.key] = p.value;
    }

    return {
      userId,
      membershipRole: membership?.role ?? "VIEWER",
      permissions: Array.from(permissionSet),
      preferences: preferencesMap,
    };
  }

  static async getPolicyContext(ctx: TenantContext, companyId: string): Promise<PolicyContext> {
    const [activePolicies, recentViolations, totalPolicies, openViolations] = await Promise.all([
      prisma.policy.findMany({
        where: { companyId, enabled: true },
        orderBy: { priority: "asc" },
        take: 20,
        select: { id: true, name: true, type: true, enabled: true, priority: true },
      }),
      prisma.policyViolation.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
          sourceModule: true,
          createdAt: true,
        },
      }),
      prisma.policy.count({ where: { companyId } }),
      prisma.policyViolation.count({ where: { companyId, status: "OPEN" } }),
    ]);

    const complianceScore = totalPolicies > 0
      ? Math.round(((totalPolicies - openViolations) / totalPolicies) * 100)
      : 100;

    return {
      activePolicies: activePolicies.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        enabled: p.enabled,
        priority: p.priority,
      })),
      recentViolations: recentViolations.map((v) => ({
        id: v.id,
        title: v.title,
        severity: v.severity,
        status: v.status,
        sourceModule: v.sourceModule,
        createdAt: v.createdAt.toISOString(),
      })),
      complianceScore,
    };
  }

  static async filterContextByPermissions(
    ctx: TenantContext,
    agentId: string,
    context: AgentContextBundle,
  ): Promise<AgentContextBundle> {
    const permissions = await prisma.agentPermission.findMany({
      where: { agentId, companyId: ctx.companyId, effect: "ALLOW" },
      select: { permission: true },
    });

    const permissionSet = new Set(permissions.map((p) => p.permission));

    const filtered = { ...context };

    if (!permissionSet.has("financial.read")) {
      filtered.financial = { ledgerSummary: { totalDebits: 0, totalCredits: 0, entryCount: 0 }, recentTransactions: [], wallets: [] };
    }

    if (!permissionSet.has("treasury.read")) {
      filtered.treasury = { cashPositions: [], liquidityPositions: [], recentMovements: [] };
    }

    if (!permissionSet.has("reports.read")) {
      filtered.reports = { recentReportExecutions: [], kpis: [] };
    }

    if (!permissionSet.has("integrations.read")) {
      filtered.integrations = { connectors: [], recentRuns: [] };
    }

    if (!permissionSet.has("workflows.read")) {
      filtered.workflows = { activeWorkflows: [], pendingApprovals: [] };
    }

    if (!permissionSet.has("policies.read")) {
      filtered.policies = { activePolicies: [], recentViolations: [], complianceScore: 0 };
    }

    return filtered;
  }

  static async validateContextAccess(
    ctx: TenantContext,
    agentId: string,
    resourceType: string,
  ): Promise<boolean> {
    const permission = await prisma.agentPermission.findUnique({
      where: {
        companyId_agentId_permission: {
          companyId: ctx.companyId,
          agentId,
          permission: `${resourceType}.read`,
        },
      },
    });

    if (!permission || permission.effect === "DENY") {
      return false;
    }

    if (permission.expiresAt && permission.expiresAt < new Date()) {
      return false;
    }

    return true;
  }
}
