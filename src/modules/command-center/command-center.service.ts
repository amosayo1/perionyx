import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { IntelligenceService } from "@/modules/enterprise-intelligence";
import { DecisionService } from "@/modules/decision-intelligence/decision.service";
import { generateDecisionBriefing } from "@/modules/decision-intelligence/briefing";
import { generateExecutiveBriefing } from "@/modules/copilot/executive-briefing";
import { OperationsService } from "@/modules/operations/operations.service";
import { GovernanceService } from "@/modules/governance";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { aiProviderRegistry } from "@/modules/ai-provider";
import type { Decision, DecisionPriority } from "@/modules/decision-intelligence/types";
import type { Insight, Recommendation, ExecutiveSummary } from "@/modules/enterprise-intelligence/types";
import type { GovernanceHealthScore, ViolationSummary } from "@/modules/governance/types";
import { formatCurrency } from "@/lib/format";

const _intelligenceService = new IntelligenceService();
const _decisionService = new DecisionService();

export interface KpiMetric {
  label: string;
  value: string;
  previousValue?: string;
  change?: string;
  direction?: "up" | "down" | "stable";
  insight?: string;
  status?: "healthy" | "warning" | "critical" | "neutral";
}

export interface CommandCenterData {
  executiveSummary: KpiMetric[];
  decisions: Decision[];
  criticalDecisions: number;
  treasury: {
    totalLiquidity: string;
    availableCash: string;
    treasuryHealthScore: number;
    walletCount: number;
    treasuryAccountCount: number;
    currencyExposure: { currency: string; balance: string }[];
  };
  forecasts: {
    cashFlowConfidence: number;
    liquidityConfidence: number;
    forecastHorizons: string[];
  };
  intelligence: {
    insights: Insight[];
    recommendations: Recommendation[];
    executiveSummary: ExecutiveSummary | null;
  };
  risk: {
    openAlerts: number;
    criticalAlerts: number;
    openIncidents: number;
    policyViolations: number;
    suspiciousActivity: number;
  };
  operations: {
    connectorCount: number;
    inactiveConnectors: number;
    syncSuccessRate: number;
    failedSyncs: number;
    queueDepth: number;
  };
  governance: {
    pendingApprovals: number;
    overdueApprovals: number;
    approvalValue: string;
    auditEvents: number;
    highSeverityAudit: number;
    healthScore: GovernanceHealthScore | null;
    violations: ViolationSummary | null;
    activePolicies: number;
    activeExceptions: number;
  };
  ai: {
    activeProviders: number;
    totalProviders: number;
    healthyProviders: number;
    recentUsage: number;
  };
  workflow: {
    running: number;
    waiting: number;
    failed: number;
    completed: number;
    total: number;
    successRate: number;
  };
  timeline: EnterpriseEvent[];
  briefing: {
    title: string;
    sections: { title: string; summary: string; confidence: string }[];
    recommendations: string[];
  } | null;
  decisionBriefing: {
    title: string;
    totalDecisions: number;
    criticalCount: number;
    topDecisions: string[];
  } | null;
}

export interface EnterpriseEvent {
  id: string;
  type: string;
  label: string;
  description: string;
  timestamp: string;
  severity?: string;
  category?: string;
}

export class CommandCenterService {
  async getData(ctx: TenantContext): Promise<CommandCenterData> {
    const [
      walletAgg, treasuryAgg, alerts, incidents, policyViolations,
      pendingApprovals, overdueApprovals, pendingApprovalValue,
      auditCount, highAudit, connectors, queueStatus,
      syncMetrics,
    ] = await Promise.all([
      prisma.wallet.aggregate({ where: { companyId: ctx.companyId }, _sum: { balance: true }, _count: true }),
      prisma.treasuryAccount.aggregate({ where: { companyId: ctx.companyId, isActive: true }, _sum: { balance: true }, _count: true }),
      prisma.riskAlert.findMany({ where: { companyId: ctx.companyId, status: "OPEN" }, select: { severity: true, category: true, id: true } }),
      prisma.riskIncident.count({ where: { companyId: ctx.companyId, status: { not: "RESOLVED" } } }),
      prisma.policyTestResult.count({ where: { companyId: ctx.companyId, matched: false } }),
      prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" } }),
      prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL", createdAt: { lte: new Date(Date.now() - 86400000) } } }),
      prisma.transaction.aggregate({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" }, _sum: { primaryAmount: true } }),
      prisma.auditLog.count({ where: { companyId: ctx.companyId } }),
      prisma.auditLog.count({ where: { companyId: ctx.companyId, severity: "CRITICAL" } }),
      prisma.connectorConfig.findMany({ where: { companyId: ctx.companyId }, select: { id: true, active: true } }),
      OperationsService.getQueueStatus(),
      OperationsService.getSyncMetrics(ctx).catch(() => null),
    ]).catch(() => []).then((r) => r);

    const walletsResult = (walletAgg ?? { _sum: { balance: 0 }, _count: 0 }) as { _sum: { balance: number | null }; _count: number };
    const treasuryResult = (treasuryAgg ?? { _sum: { balance: 0 }, _count: 0 }) as { _sum: { balance: number | null }; _count: number };

    const totalLiquidity = Number(walletsResult._sum.balance ?? 0) + Number(treasuryResult._sum.balance ?? 0);
    const availableCash = Number(walletsResult._sum.balance ?? 0);

    const criticalAlerts = (alerts ?? []).filter((a: { severity: string }) => a.severity === "CRITICAL").length;
    const suspiciousAlerts = (alerts ?? []).filter((a: { category: string }) => a.category === "SUSPICIOUS_ACTIVITY").length;

    const treasuryHealthScore = this.calculateTreasuryHealthScore(
      totalLiquidity, availableCash, (alerts ?? []).length, (connectors ?? []),
    );

    const execSummary: KpiMetric[] = [
      { label: "Total Liquidity", value: formatCurrency(totalLiquidity), status: totalLiquidity > 0 ? "healthy" : "warning", direction: "stable" },
      { label: "Available Cash", value: formatCurrency(availableCash), status: availableCash > 1000000 ? "healthy" : availableCash > 0 ? "warning" : "critical", direction: "stable" },
      { label: "Treasury Health", value: `${treasuryHealthScore}/100`, status: treasuryHealthScore >= 70 ? "healthy" : treasuryHealthScore >= 40 ? "warning" : "critical", direction: "stable" },
      { label: "Critical Risks", value: String(criticalAlerts), status: criticalAlerts === 0 ? "healthy" : criticalAlerts <= 3 ? "warning" : "critical", direction: "up" },
      { label: "Active Decisions", value: "—" as string, status: "neutral" as const, direction: "stable" },
      { label: "Connector Health", value: "—" as string, status: "neutral" as const, direction: "stable" },
      { label: "Operational Status", value: "—" as string, status: "neutral" as const, direction: "stable" },
      { label: "Pending Approvals", value: String(pendingApprovals ?? 0), status: (pendingApprovals ?? 0) > 10 ? "warning" : "healthy", direction: "stable" },
    ];

    const [decisionsData, forecastConfidence, eiSummary, eiBriefing, diBriefing] = await Promise.all([
      _decisionService.getPrioritizedDecisions(ctx).catch(() => null),
      this.getForecastConfidence(ctx),
      _intelligenceService.getDailySummary(ctx).catch(() => null),
      generateExecutiveBriefing(ctx, "daily").catch(() => null),
      generateDecisionBriefing(ctx, "daily").catch(() => null),
    ]);

    const criticalDecisions = decisionsData?.decisions.filter((d) => d.priority >= 4).length ?? 0;
    execSummary[4] = { label: "Active Decisions", value: String(decisionsData?.decisions.length ?? 0), status: (decisionsData?.decisions.length ?? 0) > 0 ? "healthy" : "neutral", direction: "stable" };

    const inactiveCount = (connectors ?? []).filter((c: { active: boolean }) => !c.active).length;
    const activeCount = (connectors ?? []).filter((c: { active: boolean }) => c.active).length;
    execSummary[5] = { label: "Connector Health", value: `${activeCount}/${(connectors ?? []).length}`, status: inactiveCount === 0 ? "healthy" : inactiveCount <= 2 ? "warning" : "critical", direction: inactiveCount > 0 ? "down" : "stable" };

    const successRate = syncMetrics?.successRate ?? 100;
    execSummary[6] = { label: "Sync Success", value: `${Math.round(successRate)}%`, status: successRate >= 95 ? "healthy" : successRate >= 80 ? "warning" : "critical", direction: "stable" };

    const currencies = await prisma.treasuryAccount.findMany({
      where: { companyId: ctx.companyId, isActive: true },
      select: { currency: true, balance: true },
    });

    const currencyExposureMap = new Map<string, number>();
    for (const c of currencies) {
      currencyExposureMap.set(c.currency, (currencyExposureMap.get(c.currency) ?? 0) + Number(c.balance));
    }

    return {
      executiveSummary: execSummary,
      decisions: decisionsData?.decisions ?? [],
      criticalDecisions,
      treasury: {
        totalLiquidity: formatCurrency(totalLiquidity),
        availableCash: formatCurrency(availableCash),
        treasuryHealthScore,
        walletCount: walletsResult._count,
        treasuryAccountCount: treasuryResult._count,
        currencyExposure: Array.from(currencyExposureMap.entries()).map(([currency, balance]) => ({ currency, balance: formatCurrency(balance) })),
      },
      forecasts: {
        cashFlowConfidence: forecastConfidence.cashFlow,
        liquidityConfidence: forecastConfidence.liquidity,
        forecastHorizons: ["7d", "30d", "90d"],
      },
      intelligence: {
        insights: eiSummary?.sections.flatMap((s) => s.insights) ?? [],
        recommendations: eiSummary?.topRecommendations ?? [],
        executiveSummary: eiSummary,
      },
      risk: {
        openAlerts: (alerts ?? []).length,
        criticalAlerts,
        openIncidents: (incidents ?? 0),
        policyViolations: (policyViolations ?? 0),
        suspiciousActivity: suspiciousAlerts,
      },
      operations: {
        connectorCount: (connectors ?? []).length,
        inactiveConnectors: inactiveCount,
        syncSuccessRate: Math.round(successRate),
        failedSyncs: syncMetrics?.failedSyncs ?? 0,
        queueDepth: (queueStatus ?? []).reduce((s: number, q: { queued: number }) => s + q.queued, 0),
      },
      governance: {
        pendingApprovals: pendingApprovals ?? 0,
        overdueApprovals: overdueApprovals ?? 0,
        approvalValue: formatCurrency(Number((pendingApprovalValue as { _sum: { primaryAmount: number | null } })?._sum?.primaryAmount ?? 0)),
        auditEvents: auditCount ?? 0,
        highSeverityAudit: highAudit ?? 0,
        healthScore: await GovernanceService.getGovernanceHealthScore(ctx).catch(() => null),
        violations: await GovernanceService.getViolationSummary(ctx).catch(() => null),
        activePolicies: await prisma.policy.count({ where: { companyId: ctx.companyId, enabled: true } }).catch(() => 0),
        activeExceptions: await prisma.policyException.count({ where: { companyId: ctx.companyId, status: "ACTIVE" } }).catch(() => 0),
      },
      ai: await this.getAiStatus(),
      workflow: await this.getWorkflowStatus(ctx),
      timeline: await this.getTimeline(ctx),
      briefing: eiBriefing ? {
        title: eiBriefing.title,
        sections: eiBriefing.sections.map((s) => ({ title: s.title, summary: s.summary, confidence: s.confidence })),
        recommendations: eiBriefing.recommendations,
      } : null,
      decisionBriefing: diBriefing ? {
        title: diBriefing.title,
        totalDecisions: diBriefing.totalDecisions,
        criticalCount: diBriefing.criticalCount,
        topDecisions: diBriefing.recommendations.slice(0, 5),
      } : null,
    };
  }

  private calculateTreasuryHealthScore(
    totalLiquidity: number,
    availableCash: number,
    alertCount: number,
    connectors: { active: boolean }[],
  ): number {
    let score = 70;
    if (totalLiquidity > 10_000_000) score += 15;
    else if (totalLiquidity > 1_000_000) score += 5;
    else score -= 20;
    if (availableCash > totalLiquidity * 0.3) score += 10;
    else if (availableCash > totalLiquidity * 0.1) score += 5;
    else score -= 10;
    score -= alertCount * 2;
    const inactiveCount = connectors.filter((c) => !c.active).length;
    score -= inactiveCount * 5;
    return Math.max(0, Math.min(100, score));
  }

  private async getForecastConfidence(_ctx: TenantContext): Promise<{ cashFlow: number; liquidity: number }> {
    try {
      const { SimpleMovingAverageModel } = await import("@/modules/enterprise-intelligence/forecasting");
      const model = new SimpleMovingAverageModel();
      const cashFlow = await model.forecast("cash-flow", "30d", []);
      return {
        cashFlow: Math.round(cashFlow.confidence * 100),
        liquidity: 0,
      };
    } catch {
      return { cashFlow: 0, liquidity: 0 };
    }
  }

  private async getAiStatus(): Promise<{ activeProviders: number; totalProviders: number; healthyProviders: number; recentUsage: number }> {
    try {
      const ai = await import("@/modules/ai-provider");
      const cachedHealth = ai.providerHealthMonitor.getAllCached();
      const providers = aiProviderRegistry?.getAll() ?? [];
      const healthyCount = Array.from(cachedHealth.values()).filter((h) => h.status === "healthy").length;
      return {
        activeProviders: providers.length,
        totalProviders: 7,
        healthyProviders: healthyCount,
        recentUsage: 0,
      };
    } catch {
      return { activeProviders: 0, totalProviders: 7, healthyProviders: 0, recentUsage: 0 };
    }
  }

  private async getWorkflowStatus(ctx: TenantContext): Promise<{ running: number; waiting: number; failed: number; completed: number; total: number; successRate: number }> {
    try {
      const engine = new WorkflowEngine();
      const metrics = await engine.getMetrics(ctx);
      return {
        running: metrics.runningInstances,
        waiting: metrics.waitingInstances,
        failed: metrics.failedInstances,
        completed: metrics.completedInstances,
        total: metrics.totalInstances,
        successRate: metrics.successRate,
      };
    } catch {
      return { running: 0, waiting: 0, failed: 0, completed: 0, total: 0, successRate: 100 };
    }
  }

  private async getTimeline(ctx: TenantContext): Promise<EnterpriseEvent[]> {
    const events: EnterpriseEvent[] = [];

    const [recentTx, recentAudit, recentAlerts, recentDecisions, recentConnectors] = await Promise.all([
      prisma.transaction.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, type: true, status: true, primaryAmount: true, currency: true, createdAt: true } }),
      prisma.auditLog.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, action: true, severity: true, resourceType: true, createdAt: true } }),
      prisma.riskAlert.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, severity: true, category: true, createdAt: true } }),
      prisma.auditLog.findMany({ where: { companyId: ctx.companyId, action: { contains: "DECISION" } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, action: true, metadata: true, createdAt: true } }),
      prisma.connectorRun.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, status: true, connectorId: true, createdAt: true } }),
    ]);

    for (const tx of recentTx) {
      events.push({ id: `tx-${tx.id}`, type: "transaction", label: `${tx.type} ${tx.status}`, description: `${formatCurrency(Number(tx.primaryAmount))} ${tx.currency}`, timestamp: tx.createdAt.toISOString(), category: "treasury" });
    }
    for (const audit of recentAudit) {
      events.push({ id: `audit-${audit.id}`, type: "audit", label: audit.action, description: audit.resourceType, timestamp: audit.createdAt.toISOString(), severity: audit.severity, category: "governance" });
    }
    for (const alert of recentAlerts) {
      events.push({ id: `alert-${alert.id}`, type: "risk-alert", label: alert.title, description: `[${alert.severity}] ${alert.category}`, timestamp: alert.createdAt.toISOString(), severity: alert.severity, category: "risk" });
    }
    for (const d of recentDecisions) {
      const meta = d.metadata as { decisionId?: string; status?: string } | null;
      events.push({ id: `decision-${d.id}`, type: "decision", label: meta?.status ? `Decision ${meta.status}` : "Decision", description: meta?.decisionId ?? d.action, timestamp: d.createdAt.toISOString(), category: "intelligence" });
    }
    for (const rc of recentConnectors) {
      events.push({ id: `connector-${rc.id}`, type: "connector", label: `Connector ${rc.status}`, description: `Run ${rc.connectorId.slice(0, 8)}`, timestamp: rc.createdAt.toISOString(), category: "operations" });
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 25);
  }
}

