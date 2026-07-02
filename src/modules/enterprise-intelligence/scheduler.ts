import { prisma } from "@/server/db/prisma";
import { scheduleCron } from "@/modules/queue/queue.service";
import { IntelligenceService } from "./intelligence.service";
import type { TenantContext } from "@/server/context/tenant-context";
import type { CompanyRole } from "@prisma/client";

const intelligenceService = new IntelligenceService();

function systemContext(companyId: string): TenantContext {
  return { companyId, userId: "system", role: "ADMIN" as CompanyRole };
}

export async function registerIntelligenceJobs(): Promise<void> {
  await scheduleCron("intelligence-daily", "0 6 * * *", {
    type: "intelligence-daily",
    data: {},
  });
  await scheduleCron("intelligence-hourly", "0 * * * *", {
    type: "intelligence-hourly",
    data: {},
  });
  await scheduleCron("intelligence-insights", "*/30 * * * *", {
    type: "intelligence-insights",
    data: {},
  });
}

export async function handleIntelligenceJob(job: {
  type: string;
  data: Record<string, unknown>;
}): Promise<void> {
  switch (job.type) {
    case "intelligence-daily":
      await runDailyIntelligence();
      break;
    case "intelligence-hourly":
      await runHourlyIntelligence();
      break;
    case "intelligence-insights":
      await runInsightGeneration();
      break;
  }
}

async function runDailyIntelligence(): Promise<void> {
  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    const ctx = systemContext(company.id);
    try {
      await intelligenceService.evaluateAll(ctx);
      await intelligenceService.syncKnowledgeGraph(ctx);
    } catch (err) {
      console.error(`[IntelligenceScheduler] Daily run failed for ${company.id}:`, err);
    }
  }
}

async function runHourlyIntelligence(): Promise<void> {
  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    const ctx = systemContext(company.id);
    try {
      await Promise.all([
        intelligenceService.getInsights(ctx),
        intelligenceService.getRecommendations(ctx),
      ]);
    } catch (err) {
      console.error(`[IntelligenceScheduler] Hourly run failed for ${company.id}:`, err);
    }
  }
}

async function runInsightGeneration(): Promise<void> {
  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    const ctx = systemContext(company.id);
    try {
      await intelligenceService.getInsights(ctx);
    } catch (err) {
      console.error(`[IntelligenceScheduler] Insight generation failed for ${company.id}:`, err);
    }
  }
}
