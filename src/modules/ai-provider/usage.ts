import { prisma } from "@/server/db/prisma";
import type { Usage, AiProviderKind } from "./types";
import { estimateCost } from "./types";

export async function trackUsage(params: {
  companyId?: string;
  userId?: string;
  provider: AiProviderKind;
  model: string;
  usage: Usage;
  feature: string;
}): Promise<void> {
  const cost = params.usage.estimatedCost ?? estimateCost(params.model, params.usage.promptTokens, params.usage.completionTokens);

  try {
    await prisma.aiUsage.create({
      data: {
        companyId: params.companyId ?? "system",
        userId: params.userId,
        provider: params.provider,
        model: params.model,
        feature: params.feature,
        promptTokens: params.usage.promptTokens,
        completionTokens: params.usage.completionTokens,
        totalTokens: params.usage.totalTokens,
        estimatedCost: cost,
      },
    });
  } catch {
    // Usage tracking is non-critical — fail silently
  }
}

export async function getUsageSummary(companyId: string, since?: Date): Promise<{
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, { tokens: number; cost: number; calls: number }>;
  byProvider: Record<string, { tokens: number; cost: number; calls: number }>;
}> {
  const where: Record<string, unknown> = { companyId };
  if (since) where.createdAt = { gte: since };

  const records = await prisma.aiUsage.findMany({ where });

  const summary = {
    totalTokens: 0,
    totalCost: 0,
    byModel: {} as Record<string, { tokens: number; cost: number; calls: number }>,
    byProvider: {} as Record<string, { tokens: number; cost: number; calls: number }>,
  };

  for (const r of records) {
    summary.totalTokens += r.totalTokens;
    summary.totalCost += Number(r.estimatedCost);

    if (!summary.byModel[r.model]) summary.byModel[r.model] = { tokens: 0, cost: 0, calls: 0 };
    summary.byModel[r.model].tokens += r.totalTokens;
    summary.byModel[r.model].cost += Number(r.estimatedCost);
    summary.byModel[r.model].calls += 1;

    if (!summary.byProvider[r.provider]) summary.byProvider[r.provider] = { tokens: 0, cost: 0, calls: 0 };
    summary.byProvider[r.provider].tokens += r.totalTokens;
    summary.byProvider[r.provider].cost += Number(r.estimatedCost);
    summary.byProvider[r.provider].calls += 1;
  }

  return summary;
}

export async function getProviderUsageSummary(providerKind: AiProviderKind, since?: Date): Promise<{
  totalTokens: number;
  totalCost: number;
  totalCalls: number;
}> {
  const where: Record<string, unknown> = { provider: providerKind };
  if (since) where.createdAt = { gte: since };

  const records = await prisma.aiUsage.findMany({ where });

  return {
    totalTokens: records.reduce((s, r) => s + r.totalTokens, 0),
    totalCost: records.reduce((s, r) => s + Number(r.estimatedCost), 0),
    totalCalls: records.length,
  };
}
