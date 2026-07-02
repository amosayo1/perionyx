import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import { captureAllSnapshots } from "@/modules/intelligence";

/// Single-company snapshot handler (for targeted enqueues).
export async function handleIntelligenceSnapshot(job: { id: string; data: { companyId: string } }): Promise<void> {
  const { companyId } = job.data;
  logger.info({ companyId, jobId: job.id }, "[IntelligenceSnapshot] Starting");
  await captureAllSnapshots(companyId);
  logger.info({ companyId, jobId: job.id }, "[IntelligenceSnapshot] Complete");
}

/// Cron handler: captures snapshots for all companies.
export async function handleSnapshotCron(): Promise<void> {
  logger.info("[SnapshotCron] Starting intelligence snapshot for all companies");

  const companies = await prisma.company.findMany({ select: { id: true } });
  logger.info({ companyCount: companies.length }, "[SnapshotCron] Companies found");

  for (const company of companies) {
    try {
      await captureAllSnapshots(company.id);
      logger.info({ companyId: company.id }, "[SnapshotCron] Snapshots captured");
    } catch (err) {
      logger.error({ err, companyId: company.id }, "[SnapshotCron] Failed to capture snapshots");
    }
  }

  logger.info("[SnapshotCron] Complete");
}
