import { logger } from "@/lib/logger";
import { evaluateAllRules } from "@/modules/intelligence";

/// Evaluate rules for a single company.
export async function handleAlertEngineEvaluate(job: { id: string; data: { companyId: string } }): Promise<void> {
  const { companyId } = job.data;
  logger.info({ companyId, jobId: job.id }, "[AlertEngineJob] Starting");
  await evaluateAllRules(companyId);
  logger.info({ companyId, jobId: job.id }, "[AlertEngineJob] Complete");
}

/// Cron handler: evaluate rules for all companies.
export async function handleAlertEngineCron(): Promise<void> {
  logger.info("[AlertEngineCron] Starting evaluation for all companies");

  const { evaluateAllCompanies } = await import("@/modules/intelligence");
  await evaluateAllCompanies();

  logger.info("[AlertEngineCron] Complete");
}
