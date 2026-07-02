import { prisma } from "@/server/db/prisma";
import { engineRegistry } from "./engine";
import { InsightEngine } from "./insight-engine";
import { RecommendationEngine } from "./recommendation-engine";
import { KnowledgeGraph } from "./knowledge-graph";
import { LiquidityIntelligenceEngine } from "./engines/liquidity-engine";
import { TreasuryIntelligenceEngine } from "./engines/treasury-engine";
import { RiskIntelligenceEngine } from "./engines/risk-engine";
import { OperationalIntelligenceEngine } from "./engines/operational-engine";
import { ExecutiveIntelligenceEngine } from "./engines/executive-engine";
import { enterpriseEventBus, type EnterpriseEventType } from "./event-bus";
import { connectorEventBus } from "@/modules/connector-platform/event-hooks";
import type { TenantContext } from "@/server/context/tenant-context";
import type { IntelligenceCategory, IntelligenceEngineResult, Insight, Recommendation, ExecutiveSummary, KnowledgeDocument, ContextDocument } from "./types";

export class IntelligenceService {
  private insightEngine = new InsightEngine();
  private recommendationEngine = new RecommendationEngine();
  private knowledgeGraph = new KnowledgeGraph();
  private eventBridgeInitialized = false;

  constructor() {
    engineRegistry.register(new LiquidityIntelligenceEngine());
    engineRegistry.register(new TreasuryIntelligenceEngine());
    engineRegistry.register(new RiskIntelligenceEngine());
    engineRegistry.register(new OperationalIntelligenceEngine());
    engineRegistry.register(new ExecutiveIntelligenceEngine());
  }

  // ── Engine Evaluation ──────────────────────────────────────────────────

  async evaluateAll(ctx: TenantContext): Promise<Record<IntelligenceCategory, IntelligenceEngineResult>> {
    const engines = engineRegistry.getAll();
    const entries = await Promise.all(
      engines.map(async (engine) => {
        const result = await engine.evaluate(ctx).catch(() => ({
          insights: [], recommendations: [], evaluatedAt: new Date().toISOString(), durationMs: 0,
        } as IntelligenceEngineResult));
        return [engine.category, result] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<IntelligenceCategory, IntelligenceEngineResult>;
  }

  async evaluateCategory(ctx: TenantContext, category: IntelligenceCategory): Promise<IntelligenceEngineResult> {
    const engine = engineRegistry.get(category);
    if (!engine) return { insights: [], recommendations: [], evaluatedAt: new Date().toISOString(), durationMs: 0 };
    return engine.evaluate(ctx);
  }

  // ── Insights & Recommendations ─────────────────────────────────────────

  async getInsights(ctx: TenantContext): Promise<Insight[]> {
    return this.insightEngine.evaluate(ctx);
  }

  async getRecommendations(ctx: TenantContext): Promise<Recommendation[]> {
    return this.recommendationEngine.evaluate(ctx);
  }

  async getDailySummary(ctx: TenantContext, period?: "daily" | "weekly" | "monthly" | "quarterly"): Promise<ExecutiveSummary> {
    const execEngine = engineRegistry.get("executive");
    if (!(execEngine instanceof ExecutiveIntelligenceEngine)) {
      const now = new Date();
      return {
        id: `exec-summary-${ctx.companyId}-${now.toISOString().slice(0, 10)}`,
        type: period ?? "daily",
        title: "Executive Summary",
        period: { start: new Date(Date.now() - 86400000).toISOString(), end: now.toISOString() },
        generatedAt: now.toISOString(),
        sections: [],
        topRecommendations: [],
        metrics: [],
        strategicHighlights: [],
      };
    }
    return execEngine.generateDaily(ctx, period);
  }

  // ── Copilot Integration ────────────────────────────────────────────────

  async getCopilotContext(ctx: TenantContext): Promise<ContextDocument[]> {
    const docs: ContextDocument[] = [];

    const insights = await this.getInsights(ctx);
    for (const insight of insights) {
      docs.push({
        id: insight.id,
        type: "insight",
        label: insight.title,
        content: `${insight.description} [Confidence: ${insight.confidence}%] [Source: ${insight.sourceService}]`,
        priority: insight.severity === "critical" ? 1 : insight.severity === "high" ? 2 : insight.severity === "medium" ? 3 : 4,
        sourceService: insight.sourceService,
      });
    }

    const recommendations = await this.getRecommendations(ctx);
    for (const rec of recommendations) {
      docs.push({
        id: rec.id,
        type: "recommendation",
        label: rec.title,
        content: `${rec.description} [Evidence: ${rec.supportingEvidence.join(", ")}] [Actions: ${rec.suggestedActions.join(", ")}]`,
        priority: rec.severity === "critical" ? 1 : rec.severity === "high" ? 2 : 3,
        sourceService: rec.sourceService,
      });
    }

    const summary = await this.getDailySummary(ctx);
    for (const section of summary.sections) {
      docs.push({
        id: `section-${section.title.toLowerCase().replace(/\s+/g, "-")}`,
        type: "executive-summary",
        label: section.title,
        content: `${section.summary} ${section.details}`,
        priority: 2,
        sourceService: "enterprise-intelligence:executive-engine",
      });
    }

    return docs;
  }

  async getKnowledgeBase(ctx: TenantContext): Promise<KnowledgeDocument[]> {
    const modules = await Promise.all([
      this.indexModule("Wallets", () => prisma.wallet.count({ where: { companyId: ctx.companyId } }), "Financial accounts"),
      this.indexModule("Transactions", () => prisma.transaction.count({ where: { companyId: ctx.companyId } }), "Financial transactions"),
      this.indexModule("Approvals", () => prisma.transactionApproval.count({ where: { companyId: ctx.companyId } }), "Transaction approvals"),
      this.indexModule("Risk Alerts", () => prisma.riskAlert.count({ where: { companyId: ctx.companyId } }), "Risk alerts and incidents"),
      this.indexModule("Connectors", () => prisma.connectorConfig.count({ where: { companyId: ctx.companyId } }), "Platform connectors"),
      this.indexModule("Policies", () => prisma.policy.count({ where: { companyId: ctx.companyId } }), "Compliance policies"),
      this.indexModule("Audit", () => prisma.auditLog.count({ where: { companyId: ctx.companyId } }), "Audit trail"),
      this.indexModule("Reconciliation", () => prisma.reconciliationRun.count({ where: { companyId: ctx.companyId } }), "Reconciliation runs"),
      this.indexModule("Treasury", () => prisma.treasuryAccount.count({ where: { companyId: ctx.companyId } }), "Treasury accounts"),
      this.indexModule("Users", () => prisma.companyMembership.count({ where: { companyId: ctx.companyId } }), "Platform users"),
      this.indexModule("Insights", async () => (await this.getInsights(ctx)).length, "Active intelligence insights"),
      this.indexModule("Recommendations", async () => (await this.getRecommendations(ctx)).length, "Active recommendations"),
    ]);
    return modules;
  }

  // ── Knowledge Graph ────────────────────────────────────────────────────

  async syncKnowledgeGraph(ctx: TenantContext): Promise<void> {
    await this.knowledgeGraph.buildFromAllSources(ctx);
    const results = await this.evaluateAll(ctx);
    for (const [, result] of Object.entries(results)) {
      for (const insight of result.insights) {
        this.knowledgeGraph.addNode({ id: insight.id, type: "insight", label: insight.title, metadata: { category: insight.category, severity: insight.severity } });
      }
      for (const rec of result.recommendations) {
        this.knowledgeGraph.addNode({ id: rec.id, type: "recommendation", label: rec.title, metadata: { category: rec.category, severity: rec.severity } });
      }
      for (const insight of result.insights) {
        for (const rec of result.recommendations) {
          if (rec.relatedInsightIds.includes(insight.id)) {
            this.knowledgeGraph.addEdge({
              sourceId: insight.id, sourceType: "insight",
              targetId: rec.id, targetType: "recommendation",
              relationship: "generates",
            });
          }
        }
      }
    }
  }

  getKnowledgeGraphStats() {
    return this.knowledgeGraph.getStats();
  }

  getKnowledgeGraph() {
    return this.knowledgeGraph;
  }

  // ── Event Bridge (Connector → Enterprise) ─────────────────────────────

  initEventBridge(): void {
    if (this.eventBridgeInitialized) return;
    this.eventBridgeInitialized = true;

    const eventMap: Record<string, EnterpriseEventType> = {
      "disconnected": "connector:disconnected",
      "sync-failed": "connector:sync-failed",
      "health-check": "connector:health-critical",
    };

    connectorEventBus.subscribe("connector:disconnected", async (payload) => {
      const et = eventMap["disconnected"];
      await enterpriseEventBus.publish({
        eventType: et,
        companyId: payload.companyId,
        source: "connector-platform",
        timestamp: new Date().toISOString(),
        metadata: { connectorId: payload.connectorId, ...payload.metadata },
      });
    });

    connectorEventBus.subscribe("connector:sync-failed", async (payload) => {
      const et = eventMap["sync-failed"];
      await enterpriseEventBus.publish({
        eventType: et,
        companyId: payload.companyId,
        source: "connector-platform:orchestrator",
        timestamp: new Date().toISOString(),
        metadata: { connectorId: payload.connectorId, ...payload.metadata },
      });
    });

    connectorEventBus.subscribe("connector:health-check", async (payload) => {
      const meta = payload.metadata as { status?: string } | undefined;
      if (meta?.status === "critical") {
        await enterpriseEventBus.publish({
          eventType: "connector:health-critical",
          companyId: payload.companyId,
          source: "connector-platform:orchestrator",
          timestamp: new Date().toISOString(),
          metadata: { connectorId: payload.connectorId, ...payload.metadata },
        });
      }
    });
  }

  // ── Private ────────────────────────────────────────────────────────────

  private async indexModule(name: string, counter: () => Promise<number>, description: string): Promise<KnowledgeDocument> {
    try {
      const count = await counter();
      return { id: `kb-${name.toLowerCase().replace(/\s+/g, "-")}`, moduleName: name, recordCount: count, summary: `${count} records — ${description}`, details: `${name}: ${count} records`, sourceService: "enterprise-intelligence" };
    } catch {
      return { id: `kb-${name.toLowerCase().replace(/\s+/g, "-")}`, moduleName: name, recordCount: 0, summary: "Unavailable", details: "(unavailable)", sourceService: "enterprise-intelligence" };
    }
  }
}
