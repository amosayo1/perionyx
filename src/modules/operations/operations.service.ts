import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { engineRegistry, KnowledgeGraph, IntelligenceService } from "@/modules/enterprise-intelligence";
import type { IntelligenceEngineResult } from "@/modules/enterprise-intelligence/types";
import { DecisionService } from "@/modules/decision-intelligence/decision.service";
import { evaluatorRegistry } from "@/modules/decision-intelligence/engine";
import { GovernanceService } from "@/modules/governance/governance.service";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { observabilityService } from "@/modules/observability";
import { logger } from "@/lib/logger";

const _intelligenceService = new IntelligenceService();
const _decisionService = new DecisionService();

export interface ConnectorHealthSummary {
  connectorId: string;
  name: string;
  kind: string;
  status: string;
  lastHealthCheckAt: string | null;
  lastSyncAt: string | null;
  errorMessage: string | null;
  active: boolean;
}

export interface SyncMetricsSummary {
  totalSyncs: number;
  failedSyncs: number;
  averageDurationMs: number;
  successRate: number;
  byConnector: {
    connectorId: string;
    totalSyncs: number;
    failedSyncs: number;
    successRate: number;
  }[];
}

export interface QueueStatusSummary {
  queueName: string;
  queued: number;
  active: number;
  failed: number;
  scheduled: number;
}

export class OperationsService {
  static async getConnectorHealth(ctx: TenantContext): Promise<ConnectorHealthSummary[]> {
    const configs = await prisma.connectorConfig.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { name: "asc" },
    });

    return configs.map((c) => {
      const cfg = c.config as Record<string, any> | null;
      return {
        connectorId: c.id,
        name: c.name,
        kind: c.type,
        status: cfg?.healthStatus ?? "UNKNOWN",
        lastHealthCheckAt: cfg?.lastHealthCheckAt ?? null,
        lastSyncAt: cfg?.lastSyncAt ?? null,
        errorMessage: cfg?.errorMessage ?? null,
        active: c.active,
      };
    });
  }

  static async getSyncMetrics(ctx: TenantContext): Promise<SyncMetricsSummary> {
    const runs = await prisma.connectorRun.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const totalSyncs = runs.length;
    const failedSyncs = runs.filter((r) => r.status === "FAILED").length;

    const durations = runs
      .filter((r) => r.startedAt && r.completedAt)
      .map((r) => r.completedAt!.getTime() - r.startedAt!.getTime());

    const averageDurationMs = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    const byConnectorMap = new Map<string, { total: number; failed: number }>();
    for (const run of runs) {
      const id = run.connectorId;
      if (!byConnectorMap.has(id)) byConnectorMap.set(id, { total: 0, failed: 0 });
      const entry = byConnectorMap.get(id)!;
      entry.total++;
      if (run.status === "FAILED") entry.failed++;
    }

    return {
      totalSyncs,
      failedSyncs,
      averageDurationMs,
      successRate: totalSyncs > 0 ? ((totalSyncs - failedSyncs) / totalSyncs) * 100 : 100,
      byConnector: Array.from(byConnectorMap.entries()).map(([connectorId, data]) => ({
        connectorId,
        totalSyncs: data.total,
        failedSyncs: data.failed,
        successRate: data.total > 0 ? ((data.total - data.failed) / data.total) * 100 : 100,
      })),
    };
  }

  static async getQueueStatus(): Promise<QueueStatusSummary[]> {
    try {
      const { getQueueStats } = await import("@/modules/queue/queue.service");
      const stats = await getQueueStats();
      if (!stats) return [];

      return stats.queues.map((q) => ({
        queueName: q.name,
        queued: q.queued,
        active: q.active,
        failed: 0,
        scheduled: q.deferred,
      }));
    } catch {
      return [];
    }
  }

  static async getConnectorLatency(ctx: TenantContext): Promise<{ connectorId: string; averageLatencyMs: number }[]> {
    const runs = await prisma.connectorRun.findMany({
      where: {
        companyId: ctx.companyId,
        completedAt: { not: null },
        startedAt: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const byConnector = new Map<string, number[]>();
    for (const run of runs) {
      if (!run.startedAt || !run.completedAt) continue;
      const latency = run.completedAt.getTime() - run.startedAt.getTime();
      const id = run.connectorId;
      if (!byConnector.has(id)) byConnector.set(id, []);
      byConnector.get(id)!.push(latency);
    }

    return Array.from(byConnector.entries()).map(([connectorId, latencies]) => ({
      connectorId,
      averageLatencyMs: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    }));
  }

  // ── Intelligence Monitoring ──────────────────────────────────────────────

  static async evaluateAllIntelligence(ctx: TenantContext): Promise<Record<string, IntelligenceEngineResult>> {
    return _intelligenceService.evaluateAll(ctx);
  }

  static async getIntelligenceEngineStatus(): Promise<{
    engineCount: number;
    engineCategories: string[];
  }> {
    const engines = engineRegistry.getAll();
    return {
      engineCount: engines.length,
      engineCategories: engines.map((e) => e.category),
    };
  }

  static async getIntelligenceEngineDetail(ctx: TenantContext): Promise<{
    engineCount: number;
    engineCategories: string[];
    activeInsights: number;
    activeRecommendations: number;
    lastEvaluationSummary: string;
  }> {
    const engines = engineRegistry.getAll();
    const results = await _intelligenceService.evaluateAll(ctx).catch(() => ({}));
    const allInsights = Object.values(results).flatMap((r) => r.insights);
    const allRecommendations = Object.values(results).flatMap((r) => r.recommendations);
    return {
      engineCount: engines.length,
      engineCategories: engines.map((e) => e.category),
      activeInsights: allInsights.length,
      activeRecommendations: allRecommendations.length,
      lastEvaluationSummary: `${allInsights.length} insights, ${allRecommendations.length} recommendations across ${engines.length} engines`,
    };
  }

  static async getIntelligenceMetrics(ctx: TenantContext): Promise<{
    insightSeverityBreakdown: Record<string, number>;
    recommendationSeverityBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, { insights: number; recommendations: number }>;
  }> {
    const results = await _intelligenceService.evaluateAll(ctx).catch(() => ({}));
    const allInsights = Object.values(results).flatMap((r) => r.insights);
    const allRecommendations = Object.values(results).flatMap((r) => r.recommendations);

    const insightSeverityBreakdown: Record<string, number> = {};
    for (const i of allInsights) {
      insightSeverityBreakdown[i.severity] = (insightSeverityBreakdown[i.severity] ?? 0) + 1;
    }

    const recommendationSeverityBreakdown: Record<string, number> = {};
    for (const r of allRecommendations) {
      recommendationSeverityBreakdown[r.severity] = (recommendationSeverityBreakdown[r.severity] ?? 0) + 1;
    }

    const categoryBreakdown: Record<string, { insights: number; recommendations: number }> = {};
    for (const i of allInsights) {
      if (!categoryBreakdown[i.category]) categoryBreakdown[i.category] = { insights: 0, recommendations: 0 };
      categoryBreakdown[i.category].insights++;
    }
    for (const r of allRecommendations) {
      if (!categoryBreakdown[r.category]) categoryBreakdown[r.category] = { insights: 0, recommendations: 0 };
      categoryBreakdown[r.category].recommendations++;
    }

    return { insightSeverityBreakdown, recommendationSeverityBreakdown, categoryBreakdown };
  }

  static getKnowledgeGraphStats(): { nodeCount: number; edgeCount: number; nodeTypes: Partial<Record<string, number>>; edgeTypes: Partial<Record<string, number>> } {
    const kg = new KnowledgeGraph();
    return kg.getStats();
  }

  static async runFullIntelligenceSync(ctx: TenantContext): Promise<{ success: boolean; engineCount: number; runtimeMs: number }> {
    const started = Date.now();
    try {
      await _intelligenceService.syncKnowledgeGraph(ctx);
      return { success: true, engineCount: engineRegistry.getAll().length, runtimeMs: Date.now() - started };
    } catch (err) {
      logger.error(err, "[Operations] Intelligence sync failed:");
      return { success: false, engineCount: 0, runtimeMs: Date.now() - started };
    }
  }

  // ── Governance Monitoring ──────────────────────────────────────────────────

  static async getGovernanceMetrics(ctx: TenantContext): Promise<{
    healthScore: number;
    healthLevel: string;
    openViolations: number;
    criticalViolations: number;
    activeExceptions: number;
    activeFrameworks: number;
    evaluationsToday: number;
  }> {
    const metrics = await GovernanceService.getMetrics(ctx).catch(() => null);
    if (!metrics) {
      return { healthScore: 0, healthLevel: "unknown", openViolations: 0, criticalViolations: 0, activeExceptions: 0, activeFrameworks: 0, evaluationsToday: 0 };
    }
    return {
      healthScore: metrics.healthScore.overall,
      healthLevel: metrics.healthScore.level,
      openViolations: metrics.violations.open,
      criticalViolations: metrics.violations.critical,
      activeExceptions: metrics.activeExceptions,
      activeFrameworks: metrics.activeFrameworks,
      evaluationsToday: metrics.evaluationsToday,
    };
  }

  static async getGovernanceHealth(ctx: TenantContext): Promise<{
    overall: number;
    level: string;
    categories: { policyCompliance: number; violationTrend: number; exceptionHealth: number; auditHealth: number; approvalHealth: number };
  }> {
    const score = await GovernanceService.getGovernanceHealthScore(ctx).catch(() => null);
    if (!score) {
      return { overall: 0, level: "unknown", categories: { policyCompliance: 0, violationTrend: 0, exceptionHealth: 0, auditHealth: 0, approvalHealth: 0 } };
    }
    return { overall: score.overall, level: score.level, categories: score.categories };
  }

  static async getGovernanceViolations(ctx: TenantContext, limit = 20) {
    return GovernanceService.listViolations(ctx, { limit }).catch(() => []);
  }

  // ── Platform Observability ────────────────────────────────────────────────

  static async getPlatformHealth(): Promise<{
    services: { name: string; status: string; latencyMs: number }[];
    lastUpdated: string;
  }> {
    const health = await observabilityService.runHealthChecks();
    return {
      services: health.map((h) => ({ name: h.service, status: h.status, latencyMs: h.latencyMs })),
      lastUpdated: new Date().toISOString(),
    };
  }

  static getObservabilitySummary() {
    return observabilityService.getMetricsSummary();
  }

  static getAggregatedMetrics() {
    return observabilityService.getAggregatedMetrics();
  }

  static getRecentSpans(limit?: number) {
    return observabilityService.getRecentSpans(limit);
  }

  static getRecentMetrics(limit?: number) {
    return observabilityService.getRecentMetrics(limit);
  }

  // ── Decision Intelligence Monitoring ─────────────────────────────────────

  static async evaluateAllDecisions(ctx: TenantContext): Promise<Record<string, { decisions: number; durationMs: number }>> {
    const results = await _decisionService.evaluateAll(ctx);
    return Object.fromEntries(
      Object.entries(results).map(([cat, r]) => [cat, { decisions: r.decisions.length, durationMs: r.durationMs }]),
    );
  }

  static async getDecisionEngineStatus(): Promise<{
    evaluatorCount: number;
    evaluatorCategories: string[];
  }> {
    const evaluators = evaluatorRegistry.getAll();
    return {
      evaluatorCount: evaluators.length,
      evaluatorCategories: evaluators.map((e) => e.category),
    };
  }

  static async getDecisionMetrics(ctx: TenantContext): Promise<{
    totalDecisions: number;
    criticalCount: number;
    categoryBreakdown: Record<string, number>;
    averageScore: number;
    topDecisions: string[];
  }> {
    const prioritized = await _decisionService.getPrioritizedDecisions(ctx).catch(() => null);
    if (!prioritized || prioritized.decisions.length === 0) {
      return { totalDecisions: 0, criticalCount: 0, categoryBreakdown: {}, averageScore: 0, topDecisions: [] };
    }

    const categoryBreakdown: Record<string, number> = {};
    for (const d of prioritized.decisions) {
      categoryBreakdown[d.type] = (categoryBreakdown[d.type] ?? 0) + 1;
    }

    const avgScore = prioritized.decisions.reduce((s, d) => s + d.score.overall, 0) / prioritized.decisions.length;

    return {
      totalDecisions: prioritized.decisions.length,
      criticalCount: prioritized.decisions.filter((d) => d.priority >= 4).length,
      categoryBreakdown,
      averageScore: Math.round(avgScore * 100) / 100,
      topDecisions: prioritized.decisions.slice(0, 5).map((d) => `[P${d.priority}] ${d.title}`),
    };
  }

  // ── Workflow Monitoring ──────────────────────────────────────────────────

  static async getWorkflowMetrics(ctx: TenantContext) {
    const engine = new WorkflowEngine();
    return engine.getMetrics(ctx).catch(() => ({
      totalDefinitions: 0, activeDefinitions: 0, totalInstances: 0,
      runningInstances: 0, waitingInstances: 0, failedInstances: 0,
      completedInstances: 0, cancelledInstances: 0, averageDurationMs: 0, successRate: 100,
    }));
  }

  static async getRunningWorkflows(ctx: TenantContext, limit = 20) {
    const engine = new WorkflowEngine();
    return engine.listInstances(ctx, { status: "RUNNING", limit }).catch(() => []);
  }

  static async getWaitingWorkflows(ctx: TenantContext, limit = 20) {
    const engine = new WorkflowEngine();
    return engine.listInstances(ctx, { status: "WAITING", limit }).catch(() => []);
  }

  static async getFailedWorkflows(ctx: TenantContext, limit = 20) {
    const engine = new WorkflowEngine();
    return engine.listInstances(ctx, { status: "FAILED", limit }).catch(() => []);
  }

  static async runFullDecisionEvaluation(ctx: TenantContext): Promise<{ success: boolean; evaluatorCount: number; runtimeMs: number }> {
    const started = Date.now();
    try {
      await _decisionService.evaluateAll(ctx);
      return { success: true, evaluatorCount: evaluatorRegistry.getAll().length, runtimeMs: Date.now() - started };
    } catch (err) {
      logger.error(err, "[Operations] Decision evaluation failed:");
      return { success: false, evaluatorCount: 0, runtimeMs: Date.now() - started };
    }
  }
}
