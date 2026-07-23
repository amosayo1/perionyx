import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ExplainTargetType, ExplainSourceType, ExplainSourceData } from "./types";

export class ExplainEngine {
  static async link(
    ctx: TenantContext,
    data: {
      targetType: ExplainTargetType;
      targetId: string;
      sourceType: ExplainSourceType;
      sourceId: string;
      sourceLabel?: string;
      sourceUrl?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    await prisma.explainSource.create({
      data: {
        companyId: ctx.companyId,
        targetType: data.targetType,
        targetId: data.targetId,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceLabel: data.sourceLabel,
        sourceUrl: data.sourceUrl,
        metadata: (data.metadata ?? {}) as any,
      } as any,
    });
  }

  static async getSources(
    ctx: TenantContext,
    targetType: ExplainTargetType,
    targetId: string,
  ): Promise<ExplainSourceData[]> {
    const records = await prisma.explainSource.findMany({
      where: { companyId: ctx.companyId, targetType, targetId },
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      targetType: r.targetType as ExplainTargetType,
      targetId: r.targetId,
      sourceType: r.sourceType as ExplainSourceType,
      sourceId: r.sourceId,
      sourceLabel: r.sourceLabel ?? undefined,
      sourceUrl: r.sourceUrl ?? undefined,
      metadata: (r.metadata ?? undefined) as Record<string, unknown> | undefined,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  static async getBySource(
    ctx: TenantContext,
    sourceType: ExplainSourceType,
    sourceId: string,
  ): Promise<ExplainSourceData[]> {
    const records = await prisma.explainSource.findMany({
      where: { companyId: ctx.companyId, sourceType, sourceId },
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      targetType: r.targetType as ExplainTargetType,
      targetId: r.targetId,
      sourceType: r.sourceType as ExplainSourceType,
      sourceId: r.sourceId,
      sourceLabel: r.sourceLabel ?? undefined,
      sourceUrl: r.sourceUrl ?? undefined,
      metadata: (r.metadata ?? undefined) as Record<string, unknown> | undefined,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  static async buildExplanation(
    ctx: TenantContext,
    targetType: ExplainTargetType,
    targetId: string,
  ): Promise<{ target: unknown; sources: ExplainSourceData[]; chain: ExplainSourceData[] }> {
    let target: unknown = null;

    switch (targetType) {
      case "score": {
        const score = await prisma.financialScore.findFirst({
          where: { id: targetId, companyId: ctx.companyId },
        });
        target = score;
        break;
      }
      case "kpi": {
        const kpi = await prisma.kPIValue.findFirst({
          where: { id: targetId, companyId: ctx.companyId },
        });
        target = kpi;
        break;
      }
      case "recommendation": {
        const rec = await prisma.intelligenceRecommendation.findFirst({
          where: { id: targetId, companyId: ctx.companyId },
        });
        target = rec;
        break;
      }
      default: {
        target = { targetId, targetType };
      }
    }

    const sources = await this.getSources(ctx, targetType, targetId);

    // Build chain: recursively get sources of sources
    const chain: ExplainSourceData[] = [];
    const visited = new Set<string>();

    const traverse = async (type: string, id: string) => {
      const key = `${type}:${id}`;
      if (visited.has(key)) return;
      visited.add(key);

      const parentSources = await prisma.explainSource.findMany({
        where: { companyId: ctx.companyId, sourceType: type as ExplainSourceType, sourceId: id },
      });

      for (const ps of parentSources) {
        const data: ExplainSourceData = {
          id: ps.id,
          companyId: ps.companyId,
          targetType: ps.targetType as ExplainTargetType,
          targetId: ps.targetId,
          sourceType: ps.sourceType as ExplainSourceType,
          sourceId: ps.sourceId,
          sourceLabel: ps.sourceLabel ?? undefined,
          sourceUrl: ps.sourceUrl ?? undefined,
          metadata: (ps.metadata ?? undefined) as Record<string, unknown> | undefined,
          createdAt: ps.createdAt.toISOString(),
        };
        chain.push(data);
        await traverse(ps.sourceType, ps.sourceId);
      }
    };

    await traverse(targetType, targetId);

    return { target, sources, chain };
  }
}
