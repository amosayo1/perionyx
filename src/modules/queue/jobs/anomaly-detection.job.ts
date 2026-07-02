import { logger } from "@/lib/logger";
import { detectAndAlert } from "@/modules/intelligence";

/// Run anomaly detection for a single company.
export async function handleAnomalyDetection(job: { id: string; data: { companyId: string } }): Promise<void> {
  const { companyId } = job.data;
  logger.info({ companyId, jobId: job.id }, "[AnomalyDetectionJob] Starting");
  await detectAndAlert(companyId);
  logger.info({ companyId, jobId: job.id }, "[AnomalyDetectionJob] Complete");
}

/// Cron handler: run anomaly detection for all companies.
export async function handleAnomalyDetectionCron(): Promise<void> {
  logger.info("[AnomalyDetectionCron] Starting for all companies");

  const { detectAllCompanies } = await import("@/modules/intelligence");
  await detectAllCompanies();

  logger.info("[AnomalyDetectionCron] Complete");
}
