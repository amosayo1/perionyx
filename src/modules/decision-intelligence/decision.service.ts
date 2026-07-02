import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { evaluatorRegistry } from "./engine";
import { TreasuryDecisionEvaluator } from "./evaluators/treasury-evaluator";
import { PaymentDecisionEvaluator } from "./evaluators/payment-evaluator";
import { ApprovalDecisionEvaluator } from "./evaluators/approval-evaluator";
import { ReconciliationDecisionEvaluator } from "./evaluators/reconciliation-evaluator";
import { OperationalDecisionEvaluator } from "./evaluators/operational-evaluator";
import { RiskDecisionEvaluator } from "./evaluators/risk-evaluator";
import type {
  Decision, DecisionCategory, DecisionEvaluatorResult,
  DecisionPriority, DecisionWeightConfig, ScenarioComparison,
} from "./types";

export interface PrioritizedDecisions {
  decisions: Decision[];
  categories: Record<DecisionCategory, { count: number; averageScore: number }>;
  generatedAt: string;
  summary: string;
}

export class DecisionService {
  constructor() {
  }

  async evaluateAll(ctx: TenantContext): Promise<Record<DecisionCategory, DecisionEvaluatorResult>> {
    const evaluators = evaluatorRegistry.getAll();
    if (evaluators.length === 0) {
      evaluatorRegistry.register(new TreasuryDecisionEvaluator());
      evaluatorRegistry.register(new PaymentDecisionEvaluator());
      evaluatorRegistry.register(new ApprovalDecisionEvaluator());
      evaluatorRegistry.register(new ReconciliationDecisionEvaluator());
      evaluatorRegistry.register(new OperationalDecisionEvaluator());
      evaluatorRegistry.register(new RiskDecisionEvaluator());
    }

    const entries = await Promise.all(
      evaluatorRegistry.getAll().map(async (evaluator) => {
        const result = await evaluator.evaluate(ctx).catch(() => ({
          decisions: [], evaluatedAt: new Date().toISOString(), durationMs: 0,
        } as DecisionEvaluatorResult));
        return [evaluator.category, result] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<DecisionCategory, DecisionEvaluatorResult>;
  }

  async evaluateCategory(ctx: TenantContext, category: DecisionCategory): Promise<DecisionEvaluatorResult> {
    const evaluator = evaluatorRegistry.get(category);
    if (!evaluator) return { decisions: [], evaluatedAt: new Date().toISOString(), durationMs: 0 };
    return evaluator.evaluate(ctx);
  }

  async getPrioritizedDecisions(ctx: TenantContext, weights?: DecisionWeightConfig): Promise<PrioritizedDecisions> {
    const results = await this.evaluateAll(ctx);
    const allDecisions = Object.values(results).flatMap((r) => r.decisions);

    const sorted = [...allDecisions].sort((a, b) => b.score.overall - a.score.overall);

    const categories = {} as Record<DecisionCategory, { count: number; averageScore: number }>;
    for (const [, result] of Object.entries(results)) {
      const catDecisions = result.decisions;
      if (catDecisions.length === 0) continue;
      const avgScore = catDecisions.reduce((s, d) => s + d.score.overall, 0) / catDecisions.length;
      const cat = catDecisions[0].type;
      categories[cat] = { count: catDecisions.length, averageScore: Math.round(avgScore * 10) / 10 };
    }

    const priorityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    for (const d of sorted) {
      priorityCounts[d.priority] = (priorityCounts[d.priority] ?? 0) + 1;
    }

    return {
      decisions: sorted,
      categories,
      generatedAt: new Date().toISOString(),
      summary: `${sorted.length} decisions generated. ` +
        `P5: ${priorityCounts[5] ?? 0}, P4: ${priorityCounts[4] ?? 0}, ` +
        `P3: ${priorityCounts[3] ?? 0}, P2: ${priorityCounts[2] ?? 0}, P1: ${priorityCounts[1] ?? 0}.`,
    };
  }

  async getTopDecisions(ctx: TenantContext, limit = 10): Promise<Decision[]> {
    const results = await this.evaluateAll(ctx);
    const allDecisions = Object.values(results).flatMap((r) => r.decisions);
    return [...allDecisions].sort((a, b) => b.score.overall - a.score.overall).slice(0, limit);
  }

  compareScenarios(currentScenario: ScenarioComparison): string {
    const currentScore = currentScenario.currentStrategy.confidence;
    const alternativeScore = currentScenario.alternativeStrategy.confidence;
    const improvement = alternativeScore - currentScore;

    return [
      `Current: ${currentScenario.currentStrategy.label} (confidence: ${currentScore})`,
      `Alternative: ${currentScenario.alternativeStrategy.label} (confidence: ${alternativeScore})`,
      `Expected improvement: ${currentScenario.expectedImprovement}`,
      `Improvement probability: ${improvement > 0 ? "+" : ""}${improvement}`,
      `Risk tradeoffs: ${currentScenario.riskTradeoffs.join(", ")}`,
    ].join("\n");
  }

  async generateScenarioComparison(
    ctx: TenantContext,
    _scenarioType: string,
    _parameters: Record<string, unknown>,
  ): Promise<ScenarioComparison | null> {
    const topDecisions = await this.getTopDecisions(ctx, 5);
    if (topDecisions.length === 0) return null;

    const avgScore = topDecisions.reduce((s, d) => s + d.score.overall, 0) / topDecisions.length;
    const bestScore = topDecisions[0].score.overall;

    return {
      currentStrategy: {
        label: "Current operating model",
        description: `${topDecisions.length} active decisions with average score ${avgScore.toFixed(2)}`,
        projectedOutcome: "Gradual improvement based on current trajectory",
        confidence: Math.round(avgScore / 5 * 100),
        metrics: [
          { label: "Active Decisions", value: String(topDecisions.length) },
          { label: "Average Score", value: avgScore.toFixed(2) },
          { label: "Highest Priority", value: String(topDecisions[0].priority) },
        ],
      },
      alternativeStrategy: {
        label: "Proactive intervention",
        description: `Prioritize top ${topDecisions.length} decisions with accelerated execution`,
        projectedOutcome: "Faster resolution of critical items, reduced risk exposure",
        confidence: Math.round((avgScore + 0.5) / 5 * 100),
        metrics: [
          { label: "Projected Resolution Time", value: "24-48h", change: "-50%" },
          { label: "Expected Average Score", value: Math.min(bestScore + 0.3, 5).toFixed(2), change: "+0.3" },
        ],
      },
      expectedImprovement: "Proactive intervention expected to reduce decision resolution time by 50%",
      riskTradeoffs: [
        "Faster execution may increase operational load",
        "Some lower-priority decisions may be deprioritized",
      ],
    };
  }

  async updateDecisionStatus(
    ctx: TenantContext,
    decisionId: string,
    status: "accepted" | "dismissed",
    reason?: string,
  ): Promise<boolean> {
    try {
      await prisma.auditLog.create({
        data: {
          companyId: ctx.companyId,
          actorUserId: ctx.userId,
          action: `DECISION_${status.toUpperCase()}`,
          severity: "INFO",
          resourceType: "decision-intelligence",
          resourceId: decisionId,
          metadata: { decisionId, status, reason },
          ipAddress: "system",
          userAgent: "decision-intelligence",
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
