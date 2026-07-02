import { prisma } from "@/server/db/prisma";
import { registerHandler, scheduleCron } from "@/modules/queue/queue.service";
import { IntelligenceService } from "../intelligence.service";
import type { TenantContext } from "@/server/context/tenant-context";
import type { CompanyRole } from "@prisma/client";

const intelligenceService = new IntelligenceService();

function systemContext(companyId: string): TenantContext {
  return { companyId, userId: "system", role: "ADMIN" as CompanyRole };
}

export async function startIntelligenceCronJobs(): Promise<void> {
  registerHandler("intelligence-daily", dailyIntelligenceHandler);
  registerHandler("intelligence-hourly", hourlyIntelligenceHandler);
  registerHandler("intelligence-insights", insightGenerationHandler);

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

  console.log("[IntelligenceCron] Jobs registered and scheduled");
}

async function dailyIntelligenceHandler(_job: { id: string; data: any }): Promise<void> {
  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    try {
      const ctx = systemContext(company.id);
      await intelligenceService.evaluateAll(ctx);
      await intelligenceService.syncKnowledgeGraph(ctx);
      console.log(`[IntelligenceCron] Daily run complete for ${company.id}`);
    } catch (err) {
      console.error(`[IntelligenceCron] Daily run failed for ${company.id}:`, err);
    }
  }
}

async function hourlyIntelligenceHandler(_job: { id: string; data: any }): Promise<void> {
  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    try {
      const ctx = systemContext(company.id);
      await Promise.all([
        intelligenceService.getInsights(ctx),
        intelligenceService.getRecommendations(ctx),
      ]);
    } catch (err) {
      console.error(`[IntelligenceCron] Hourly run failed for ${company.id}:`, err);
    }
  }
}

async function insightGenerationHandler(_job: { id: string; data: any }): Promise<void> {
  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    try {
      const ctx = systemContext(company.id);
      await intelligenceService.getInsights(ctx);
    } catch (err) {
      console.error(`[IntelligenceCron] Insight generation failed for ${company.id}:`, err);
    }
  }
}
