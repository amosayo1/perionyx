import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { type Insight, type InsightSeverity, type InsightDirection, type ExplainabilityInfo } from "./types";

interface InsightSource {
  label: string;
  sourceService: string;
  extract: (ctx: TenantContext) => Promise<Insight[]>;
}

const sources: InsightSource[] = [
  {
    label: "New Connectors",
    sourceService: "connector-platform",
    extract: async (ctx) => {
      const recent = await prisma.connectorConfig.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" }, take: 5,
      });
      return recent
        .filter((c) => Date.now() - new Date(c.createdAt).getTime() < 7 * 86400000)
        .map((c) => ({
          id: `insight-new-connector-${c.id}`,
          category: "operational" as const,
          title: `New connector added: ${c.type}`,
          description: `${c.type} connector was added recently`,
          severity: "info" as InsightSeverity,
          confidence: 100,
          sourceData: ["connector_configs"],
          timestamp: new Date().toISOString(),
          affectedEntities: [c.id],
          sourceService: "insight-engine",
          explainability: {
            why: `A new ${c.type} connector was created at ${c.createdAt.toISOString()}`,
            evidence: [`Connector ${c.id} created at ${c.createdAt.toISOString()}`],
            confidenceCalculation: "Direct database query — 100% confidence",
            whatToDo: "Verify the connector is configured and syncing correctly",
            dataFreshness: new Date().toISOString(),
            relatedSources: ["connector_configs"],
          },
        }));
    },
  },
  {
    label: "Large Transactions",
    sourceService: "transactions",
    extract: async (ctx) => {
      const largeTxns = await prisma.transaction.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { primaryAmount: "desc" }, take: 5,
      });
      return largeTxns
        .filter((t) => Number(t.primaryAmount) > 50000)
        .map((t) => ({
          id: `insight-large-tx-${t.id}`,
          category: "treasury" as const,
          title: `Large transaction: ${Number(t.primaryAmount).toFixed(2)}`,
          description: `Transaction of ${Number(t.primaryAmount).toFixed(2)} (${t.type}) exceeds $50,000 threshold`,
          severity: "medium" as InsightSeverity,
          confidence: 100,
          direction: "stable" as InsightDirection,
          sourceData: ["transactions"],
          timestamp: new Date().toISOString(),
          sourceService: "insight-engine",
          explainability: {
            why: `Transaction ${t.id} has amount ${Number(t.primaryAmount).toFixed(2)} which exceeds the $50,000 threshold`,
            evidence: [`Transaction ${t.id}: ${t.type} ${Number(t.primaryAmount).toFixed(2)} ${t.currency}`],
            confidenceCalculation: "Threshold-based: >$50k amount triggers insight",
            whatToDo: "Verify approval chain and compliance checks for this transaction",
            dataFreshness: new Date().toISOString(),
            relatedSources: ["transactions"],
          },
        }));
    },
  },
  {
    label: "Balance Trend",
    sourceService: "intelligence:snapshot",
    extract: async (ctx) => {
      const snapshots = await prisma.intelligenceSnapshot.findMany({
        where: { companyId: ctx.companyId, metric: "total_balance" },
        orderBy: { takenAt: "desc" }, take: 14,
      });
      if (snapshots.length < 2) return [];

      const values = snapshots.map((s) => Number(s.value));
      const change = ((values[0] - values[values.length - 1]) / values[values.length - 1]) * 100;
      if (Math.abs(change) < 10) return [];

      return [{
        id: `insight-balance-trend-${ctx.companyId}`,
        category: "liquidity" as const,
        title: `Balance ${change > 0 ? "increased" : "decreased"} by ${Math.abs(change).toFixed(1)}%`,
        description: `Balance changed from ${values[values.length - 1].toFixed(2)} to ${values[0].toFixed(2)} over ${snapshots.length} snapshots`,
        severity: Math.abs(change) > 25 ? "high" as InsightSeverity : "medium" as InsightSeverity,
        confidence: 80,
        direction: change > 0 ? "up" as InsightDirection : "down" as InsightDirection,
        sourceData: ["intelligence_snapshots"],
        timestamp: new Date().toISOString(),
        sourceService: "insight-engine",
        explainability: {
          why: `Balance changed by ${change.toFixed(1)}% across ${snapshots.length} data points — significant movement detected`,
          evidence: [`Start: ${values[values.length - 1].toFixed(2)}`, `End: ${values[0].toFixed(2)}`, `Period: ${snapshots.length} snapshots`],
          confidenceCalculation: "Statistical: >10% change triggers insight, >25% escalates severity",
          whatToDo: "Review cash flow drivers and investigate significant changes",
          dataFreshness: new Date().toISOString(),
          relatedSources: ["intelligence_snapshots"],
        },
      }];
    },
  },
  {
    label: "Risk Alert Activity",
    sourceService: "risk:alert-engine",
    extract: async (ctx) => {
      const [openAlerts, recentAlerts] = await Promise.all([
        prisma.riskAlert.count({ where: { companyId: ctx.companyId, status: "OPEN" } }),
        prisma.riskAlert.count({ where: { companyId: ctx.companyId, createdAt: { gte: new Date(Date.now() - 86400000) } } }),
      ]);
      const insights: Insight[] = [];
      if (openAlerts > 5) {
        insights.push({
          id: `insight-risk-activity-${ctx.companyId}`,
          category: "risk" as const,
          title: "Elevated risk alert activity",
          description: `${openAlerts} open risk alerts (${recentAlerts} created in last 24h)`,
          severity: openAlerts > 10 ? "high" as InsightSeverity : "medium" as InsightSeverity,
          confidence: 95,
          direction: "up" as InsightDirection,
          sourceData: ["risk_alerts"],
          timestamp: new Date().toISOString(),
          sourceService: "insight-engine",
          explainability: {
            why: `${openAlerts} open alerts with ${recentAlerts} created in the last 24 hours indicates elevated risk activity`,
            evidence: [`${openAlerts} open alerts`, `${recentAlerts} created in last 24h`],
            confidenceCalculation: "Direct alert count — threshold-based assessment",
            whatToDo: "Review recent risk alerts and investigate root causes",
            dataFreshness: new Date().toISOString(),
            relatedSources: ["risk_alerts"],
          },
        });
      }
      return insights;
    },
  },
  {
    label: "Approval Bottleneck",
    sourceService: "approvals",
    extract: async (ctx) => {
      const [pending, overdue] = await Promise.all([
        prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" } }),
        prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL", createdAt: { lte: new Date(Date.now() - 86400000) } } }),
      ]);
      if (pending <= 5) return [];
      return [{
        id: `insight-approval-bottleneck-${ctx.companyId}`,
        category: "operational" as const,
        title: "Approval bottleneck detected",
        description: `${pending} pending approvals (${overdue} overdue >24h)`,
        severity: overdue > 5 ? "high" as InsightSeverity : "medium" as InsightSeverity,
        confidence: 95,
        direction: "up" as InsightDirection,
        sourceData: ["transactions", "approvals"],
        timestamp: new Date().toISOString(),
        sourceService: "insight-engine",
        explainability: {
          why: `${pending} approvals are pending with ${overdue} exceeding 24h threshold`,
          evidence: [`${pending} total pending`, `${overdue} overdue (>24h)`],
          confidenceCalculation: "Direct approval count — threshold-based (pending >5)",
          whatToDo: "Review approval workload and consider reassignment or escalation",
          dataFreshness: new Date().toISOString(),
          relatedSources: ["transactions", "approvals"],
        },
      }];
    },
  },
  {
    label: "Sync Health",
    sourceService: "connector-platform:orchestrator",
    extract: async (ctx) => {
      const recentSyncs = await prisma.syncLog.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { startedAt: "desc" }, take: 50,
      });
      const failed = recentSyncs.filter((s) => s.status === "failed").length;
      const total = recentSyncs.length;
      if (total === 0 || failed === 0) return [];
      return [{
        id: `insight-sync-health-${ctx.companyId}`,
        category: "operational" as const,
        title: "Data sync health issue",
        description: `${failed}/${total} recent syncs failed (${Math.round((failed / total) * 100)}% failure rate)`,
        severity: failed > total * 0.3 ? "critical" as InsightSeverity : failed > 5 ? "high" as InsightSeverity : "medium" as InsightSeverity,
        confidence: 90,
        direction: "up" as InsightDirection,
        sourceData: ["sync_logs"],
        timestamp: new Date().toISOString(),
        sourceService: "insight-engine",
        explainability: {
          why: `${failed} of ${total} recent syncs failed — ${Math.round((failed / total) * 100)}% failure rate`,
          evidence: [`${total} syncs analyzed`, `${failed} failed`, `${Math.round((failed / total) * 100)}% failure rate`],
          confidenceCalculation: "Statistical: failure rate from last 50 sync records",
          whatToDo: "Investigate failed syncs and check provider API connectivity",
          dataFreshness: new Date().toISOString(),
          relatedSources: ["sync_logs"],
        },
      }];
    },
  },
];

export class InsightEngine {
  async evaluate(ctx: TenantContext): Promise<Insight[]> {
    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          return await source.extract(ctx);
        } catch (err) {
          console.error(`[InsightEngine] Source ${source.label} failed:`, err);
          return [];
        }
      }),
    );
    return results.flat().sort((a, b) => {
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
    });
  }
}
