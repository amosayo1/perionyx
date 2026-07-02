import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { generateExecutiveBriefing, type ExecutiveBriefing } from "@/modules/copilot/executive-briefing";
import { logger } from "@/lib/logger";

export type BriefingPeriod = "daily" | "weekly" | "monthly" | "quarterly";

export interface PersistedBriefing {
  id: string;
  companyId: string;
  period: string;
  title: string;
  summary: string | null;
  sections: ExecutiveBriefing["sections"];
  recommendations: string[];
  createdAt: string;
}

export async function generateAndPersistBriefing(
  ctx: TenantContext,
  period: BriefingPeriod,
): Promise<PersistedBriefing> {
  const briefing = await generateExecutiveBriefing(ctx, period);

  const sectionSummaries = briefing.sections.map((s) => s.summary).join("; ");

  const record = await prisma.briefing.create({
    data: {
      companyId: ctx.companyId,
      period,
      title: briefing.title,
      summary: sectionSummaries,
      sections: briefing.sections as any,
      recommendations: briefing.recommendations,
      requestedByUserId: ctx.userId,
    },
  });

  logger.info({ briefingId: record.id, companyId: ctx.companyId, period }, "Briefing persisted");

  return {
    id: record.id,
    companyId: record.companyId,
    period: record.period,
    title: record.title,
    summary: record.summary,
    sections: record.sections as unknown as ExecutiveBriefing["sections"],
    recommendations: record.recommendations,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function getLatestBriefings(
  companyId: string,
  opts?: { limit?: number; period?: BriefingPeriod },
): Promise<PersistedBriefing[]> {
  const where: Record<string, unknown> = { companyId };
  if (opts?.period) where.period = opts.period;

  const records = await prisma.briefing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 5,
  });

  return records.map((r) => ({
    id: r.id,
    companyId: r.companyId,
    period: r.period,
    title: r.title,
    summary: r.summary,
    sections: r.sections as unknown as ExecutiveBriefing["sections"],
    recommendations: r.recommendations,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getBriefingById(
  companyId: string,
  briefingId: string,
): Promise<PersistedBriefing | null> {
  const record = await prisma.briefing.findFirst({
    where: { id: briefingId, companyId },
  });
  if (!record) return null;

  return {
    id: record.id,
    companyId: record.companyId,
    period: record.period,
    title: record.title,
    summary: record.summary,
    sections: record.sections as unknown as ExecutiveBriefing["sections"],
    recommendations: record.recommendations,
    createdAt: record.createdAt.toISOString(),
  };
}
