import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import { FxService } from "@/modules/fx/fx.service";
import { riskService } from "@/modules/risk/risk.service";
import { SYSTEM_ACTOR_ID } from "./job-utils";

export async function handleFxSync(job: { id: string; data: { companyId: string } }) {
  const { companyId } = job.data;
  const ctx = { companyId, userId: SYSTEM_ACTOR_ID, role: "OWNER" as const };

  const result = await FxService.syncRates(companyId, ctx.userId);
  if (!result.success) {
    throw new Error(`FX sync failed for ${companyId}: ${result.error}`);
  }

  const health = await FxService.checkHealth(companyId);
  if (!health.healthy) {
    await riskService.createAlert(ctx, {
      category: "FX_SYNC",
      severity: "MEDIUM",
      title: "FX rate sync outdated",
      description: health.hoursSinceLastSync === null
        ? "No FX rate sync has ever completed."
        : `Last successful FX rate sync was ${Math.round(health.hoursSinceLastSync)} hours ago (threshold: 24h).`,
      source: "FxWorker",
      metadata: { hoursSinceLastSync: health.hoursSinceLastSync },
    });
  }
}

/// Cron handler: iterates all companies and syncs FX rates for each. Follows the
/// briefing-daily-cron pattern — per-company failures are logged, never thrown.
export async function handleFxSyncCron(): Promise<void> {
  logger.info("[FxSyncCron] Starting FX rate sync for all companies");

  const companies = await prisma.company.findMany({
    select: { id: true },
  });

  logger.info({ companyCount: companies.length }, "[FxSyncCron] Companies found");

  for (const company of companies) {
    try {
      await handleFxSync({ id: "cron", data: { companyId: company.id } });
      logger.info({ companyId: company.id }, "[FxSyncCron] FX rates synced");
    } catch (err) {
      logger.error({ err, companyId: company.id }, "[FxSyncCron] Failed to sync FX rates");
    }
  }

  logger.info("[FxSyncCron] Complete");
}
