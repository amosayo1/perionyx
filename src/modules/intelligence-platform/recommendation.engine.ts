import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  IntelligenceRecommendationData,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationConfidence,
  RecommendationStatus,
} from "./types";
import { FinancialIntegrityEngine } from "./engines/financial-integrity.engine";
import { CloseReadinessEngine } from "./engines/close-readiness.engine";
import { TreasuryIntelligenceEngine } from "./engines/treasury-intelligence.engine";
import { WorkingCapitalEngine } from "./engines/working-capital.engine";
import { OperationalIntelligenceEngine } from "./engines/operational-intelligence.engine";
import { ComplianceIntelligenceEngine } from "./engines/compliance-intelligence.engine";

const CATEGORY_MAP: Record<string, RecommendationCategory> = {
  integrity: "integrity",
  "close-readiness": "close",
  "treasury-health": "treasury",
  "working-capital": "working-capital",
  operational: "operational",
  compliance: "compliance",
};

export class RecommendationEngine {
  static async generate(ctx: TenantContext): Promise<IntelligenceRecommendationData[]> {
    const companyId = ctx.companyId;

    const [integrity, close, treasury, workingCapital, operational, compliance] = await Promise.all([
      FinancialIntegrityEngine.calculate(ctx),
      CloseReadinessEngine.calculate(ctx),
      TreasuryIntelligenceEngine.calculate(ctx),
      WorkingCapitalEngine.calculate(ctx),
      OperationalIntelligenceEngine.calculate(ctx),
      ComplianceIntelligenceEngine.calculate(ctx),
    ]);

    const allEngineResults = [
      { engine: "integrity", result: integrity },
      { engine: "close-readiness", result: close },
      { engine: "treasury-health", result: treasury },
      { engine: "working-capital", result: workingCapital },
      { engine: "operational", result: operational },
      { engine: "compliance", result: compliance },
    ];

    const rawRecommendations: Array<{
      category: RecommendationCategory;
      title: string;
      description?: string;
      reason: string;
      evidence?: Record<string, unknown>;
      confidence: RecommendationConfidence;
      priority: RecommendationPriority;
      affectedModules?: string[];
      expectedImpact?: string;
    }> = [];

    for (const { engine, result } of allEngineResults) {
      for (const rec of result.recommendations) {
        rawRecommendations.push({
          category: CATEGORY_MAP[engine] ?? "general",
          title: rec.title,
          reason: rec.reason,
          confidence: rec.confidence as RecommendationConfidence,
          priority: rec.priority as RecommendationPriority,
          evidence: { engineScore: result.score, engineSeverity: result.severity, components: result.components.map((c) => ({ label: c.label, value: c.value })) },
          affectedModules: [engine],
          expectedImpact: `Improving this could raise the ${engine} score`,
        });
      }
    }

    // Deduplicate by title
    const seen = new Set<string>();
    const deduplicated = rawRecommendations.filter((r) => {
      const key = r.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const created: IntelligenceRecommendationData[] = [];

    for (const rec of deduplicated) {
      const record = await prisma.intelligenceRecommendation.create({
        data: {
          companyId,
          category: rec.category,
          title: rec.title,
          description: rec.description ?? rec.reason,
          reason: rec.reason,
          evidence: rec.evidence ?? {},
          confidence: rec.confidence,
          priority: rec.priority,
          affectedModules: rec.affectedModules ?? [],
          expectedImpact: rec.expectedImpact,
          status: "active",
          sourceScoreType: rec.affectedModules?.[0] ?? undefined,
        } as any,
      });

      created.push({
        id: record.id,
        companyId: record.companyId,
        category: record.category as RecommendationCategory,
        title: record.title,
        description: record.description ?? undefined,
        reason: record.reason,
        evidence: (record.evidence ?? undefined) as Record<string, unknown> | undefined,
        confidence: record.confidence as RecommendationConfidence,
        priority: record.priority as RecommendationPriority,
        affectedModules: (record.affectedModules as string[]) ?? undefined,
        expectedImpact: record.expectedImpact ?? undefined,
        status: record.status as RecommendationStatus,
        sourceScoreType: record.sourceScoreType ?? undefined,
        createdAt: record.createdAt.toISOString(),
      });
    }

    return created;
  }

  static async list(
    ctx: TenantContext,
    opts?: { category?: string; status?: string; priority?: string },
  ): Promise<IntelligenceRecommendationData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts?.category) where.category = opts.category;
    if (opts?.status) where.status = opts.status;
    if (opts?.priority) where.priority = opts.priority;

    const records = await prisma.intelligenceRecommendation.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => ({
      id: record.id,
      companyId: record.companyId,
      category: record.category as RecommendationCategory,
      title: record.title,
      description: record.description ?? undefined,
      reason: record.reason,
      evidence: (record.evidence ?? undefined) as Record<string, unknown> | undefined,
      confidence: record.confidence as RecommendationConfidence,
      priority: record.priority as RecommendationPriority,
      affectedModules: (record.affectedModules as string[]) ?? undefined,
      expectedImpact: record.expectedImpact ?? undefined,
      status: record.status as RecommendationStatus,
      sourceScoreType: record.sourceScoreType ?? undefined,
      actionUrl: record.actionUrl ?? undefined,
      createdAt: record.createdAt.toISOString(),
      resolvedAt: record.resolvedAt?.toISOString(),
    }));
  }

  static async updateStatus(
    ctx: TenantContext,
    id: string,
    status: RecommendationStatus,
  ): Promise<void> {
    await prisma.intelligenceRecommendation.updateMany({
      where: { id, companyId: ctx.companyId },
      data: {
        status,
        resolvedAt: status === "implemented" || status === "dismissed" ? new Date() : undefined,
      },
    });
  }

  static async acknowledge(ctx: TenantContext, ids: string[]): Promise<void> {
    await prisma.intelligenceRecommendation.updateMany({
      where: { id: { in: ids }, companyId: ctx.companyId },
      data: { status: "acknowledged" },
    });
  }
}
