import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import { generateAndPersistBriefing } from "@/modules/briefings/briefings.service";
import { SYSTEM_ACTOR_ID } from "./job-utils";

interface BriefingGenerateData {
  companyId: string;
  userId: string;
  period: "daily" | "weekly" | "monthly" | "quarterly";
}

export async function handleBriefingGenerate(job: { id: string; data: BriefingGenerateData }): Promise<void> {
  const { companyId, userId, period } = job.data;

  logger.info({ companyId, period, jobId: job.id }, "[BriefingGenerate] Starting");

  const ctx = { companyId, userId, role: "OWNER" as const };

  try {
    await generateAndPersistBriefing(ctx, period);
    logger.info({ companyId, period, jobId: job.id }, "[BriefingGenerate] Complete");
  } catch (err) {
    logger.error(err, "[BriefingGenerate] Failed");
    throw err;
  }
}

/// Cron handler: iterates all companies and enqueues briefing-generate for each.
export async function handleBriefingDailyCron(): Promise<void> {
  logger.info("[BriefingDailyCron] Starting daily briefing generation for all companies");

  const companies = await prisma.company.findMany({
    select: { id: true },
  });

  logger.info({ companyCount: companies.length }, "[BriefingDailyCron] Companies found");

  for (const company of companies) {
    const ctx = { companyId: company.id, userId: SYSTEM_ACTOR_ID, role: "OWNER" as const };

    try {
      await generateAndPersistBriefing(ctx, "daily");
      logger.info({ companyId: company.id }, "[BriefingDailyCron] Daily briefing generated");
    } catch (err) {
      logger.error({ err, companyId: company.id }, "[BriefingDailyCron] Failed to generate daily briefing");
    }
  }

  logger.info("[BriefingDailyCron] Complete");
}
