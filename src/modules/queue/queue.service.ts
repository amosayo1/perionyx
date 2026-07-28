import { PgBoss, fromPrisma } from "pg-boss";
import type { SendOptions } from "pg-boss";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import type { ProgressUpdate } from "./job-types";

type JobHandler = (job: { id: string; data: any }) => Promise<void>;

let boss: PgBoss | null = null;
let started = false;
const handlers = new Map<string, JobHandler>();

const DEFAULT_RETRY_LIMIT = 3;
const DEFAULT_RETRY_DELAY = 60;

function getConnectionString(): string {
  return process.env.DATABASE_URL ?? "";
}

async function getBoss(): Promise<PgBoss> {
  if (!boss) {
    boss = new PgBoss({
      connectionString: getConnectionString(),
      schema: "perionyx_queue",
    });
    boss.on("error", (err: unknown) => {
      logger.error(err, "[Queue] pg-boss error");
    });
  }
  return boss;
}

async function ensureSchema(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      'CREATE SCHEMA IF NOT EXISTS "perionyx_queue"',
    );
  } catch (err) {
    logger.warn(err, "[Queue] Could not create schema (may already exist)");
  }
}

export async function startQueueWorker(): Promise<void> {
  if (started) return;
  started = true;

  try {
    await ensureSchema();

    const instance = await getBoss();

    const maintenanceOptions = {
      retryLimit: DEFAULT_RETRY_LIMIT,
      retryDelay: DEFAULT_RETRY_DELAY,
      retryBackoff: true,
      deleteAfterSeconds: 86400 * 7,
      expireInSeconds: 900,
    };

    await instance.start();

    for (const [name, handler] of handlers) {
      await instance.createQueue(name, maintenanceOptions);
      await instance.work(name, { batchSize: 5 }, async (jobs) => {
        for (const job of jobs) {
          try {
            await handler({ id: job.id, data: job.data });
            await instance.complete(name, job.id);
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error({ jobId: job.id, queueName: name, error: error.message }, "[Queue] Job failed");
            await instance.fail(name, job.id, error);
          }
        }
      });
    }
    logger.info({ queueCount: handlers.size }, "[Queue] Worker started");
  } catch (err) {
    logger.warn(err, "[Queue] Failed to start queue worker — database may not be available");
    started = false;
  }
}

export async function stopQueueWorker(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
    started = false;
    logger.info("[Queue] Worker stopped");
  }
}

export async function enqueue(
  name: string,
  data: any,
  options?: SendOptions,
): Promise<string | null> {
  try {
    const instance = await getBoss();
    const id = await instance.send(name, data, options);
    return id;
  } catch (err) {
    logger.error(err, "[Queue] Failed to enqueue %s", name);
    return null;
  }
}

export async function enqueueWithinTx(
  tx: any,
  name: string,
  data: any,
  options?: SendOptions,
): Promise<string | null> {
  try {
    const instance = await getBoss();
    const db = fromPrisma(tx);
    const id = await instance.send(name, data, { ...options, db });
    return id;
  } catch (err) {
    logger.error(err, "[Queue] Failed to enqueue in tx %s", name);
    return null;
  }
}

export async function scheduleCron(
  name: string,
  cron: string,
  data?: any,
  options?: SendOptions,
): Promise<void> {
  try {
    const instance = await getBoss();
    await instance.schedule(name, cron, data, options);
  } catch (err) {
    logger.warn(err, "[Queue] Failed to schedule cron %s — database may not be available", name);
  }
}

export async function unscheduleCron(name: string): Promise<void> {
  try {
    const instance = await getBoss();
    await instance.unschedule(name);
  } catch (err) {
    logger.warn(err, "[Queue] Failed to unschedule %s", name);
  }
}

export async function cancelJob(name: string, jobId: string): Promise<boolean> {
  try {
    const instance = await getBoss();
    await instance.cancel(name, jobId);
    return true;
  } catch (err) {
    logger.error(err, "[Queue] Failed to cancel job %s in %s", jobId, name);
    return false;
  }
}

export async function getQueueStats() {
  if (!boss) return null;
  try {
    const queues = await boss.getQueues();
    const stats = await Promise.all(
      queues.slice(0, 50).map(async (q) => {
        const allStats = await boss!.getQueueStats(q.name);
        const s = allStats[0];
        if (!s) {
          return { name: q.name, queued: 0, active: 0, deferred: 0, total: 0, capturedOn: null };
        }
        return {
          name: q.name,
          queued: s.queuedCount ?? 0,
          active: s.activeCount ?? 0,
          deferred: s.deferredCount ?? 0,
          total: s.totalCount ?? 0,
          capturedOn: s.capturedOn?.toISOString() ?? null,
        };
      }),
    );
    return { queues: stats };
  } catch (err) {
    logger.error(err, "[Queue] Failed to get queue stats");
    return null;
  }
}

export function registerHandler(name: string, handler: JobHandler): void {
  handlers.set(name, handler);
}

export function isQueueRunning(): boolean {
  return started;
}

export async function getJobStatus(name: string, jobId: string) {
  if (!boss) return null;
  try {
    const job = await boss.getJobById(name, jobId);
    if (!job) return null;
    return {
      id: job.id,
      name: job.name,
      state: job.state,
      data: job.data,
      output: job.output,
      createdOn: job.createdOn?.toISOString() ?? null,
      startedOn: job.startedOn?.toISOString() ?? null,
      completedOn: job.completedOn?.toISOString() ?? null,
      retryCount: job.retryCount,
      maxRetries: job.retryLimit,
      error: null,
    };
  } catch (err) {
    logger.error(err, "[Queue] Failed to get job status %s/%s", name, jobId);
    return null;
  }
}

export { fromPrisma };
