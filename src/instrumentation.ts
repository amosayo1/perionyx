import { validateEnv } from "@/server/env/validate";
import { logger } from "@/lib/logger";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const result = validateEnv();
    if (!result.ok) {
      logger.error({ missing: result.missing }, "Missing required environment variables");
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Missing required env vars: ${result.missing.join(", ")}`);
      }
    }
    if (result.warnings.length > 0) {
      logger.warn({ warnings: result.warnings }, "Environment warnings");
    }

    // pg-boss uses PostgreSQL SKIP LOCKED — safe for multi-replica deployments.
    // Multiple instances can listen on the same queues; only one worker claims each job.
    // Cron scheduling via schedule() is idempotent (upsert by name).
    import("@/modules/queue/jobs").then(({ registerAllJobs }) => {
      registerAllJobs();
      return import("@/modules/queue/queue.service").then(({ startQueueWorker, scheduleCron, unscheduleCron }) =>
        startQueueWorker().then(() =>
          Promise.all([
            unscheduleCron("fx-sync"),
            scheduleCron("fx-sync-cron", "0 * * * *", {}, {
              retryLimit: 2,
              retryDelay: 300,
              retryBackoff: true,
            }),
            scheduleCron("webhook-retry", "*/5 * * * *", {}, {}),
            scheduleCron("briefing-daily-cron", "0 6 * * *", {}, {}),
            scheduleCron("snapshot-cron", "0 */3 * * *", {}, {}),
            scheduleCron("alert-engine-cron", "*/30 * * * *", {}, {}),
            scheduleCron("anomaly-detection-cron", "0 */4 * * *", {}, {}),
            scheduleCron("ai-provider-health", "*/5 * * * *", {}, {}),
          ]),
        ),
      );
    }).catch((err: unknown) => {
      logger.error(err, "[Instrumentation] Failed to start queue worker");
    });
  }
}
