import { prisma } from "@/server/db/prisma";
import type { ConnectorSyncResult } from "../types";
import type { SyncJob, SyncConfig, ISyncExecutor } from "./types";

export class SyncExecutor implements ISyncExecutor {
  async execute(
    job: SyncJob,
    syncFn: (opts: { fullSync?: boolean; since?: string; limit?: number }) => Promise<ConnectorSyncResult>,
  ): Promise<ConnectorSyncResult> {
    const startedAt = new Date().toISOString();

    try {
      await prisma.connectorRun.create({
        data: {
          connectorId: job.connectorId,
          companyId: job.companyId,
          status: "RUNNING",
          event: `sync:${job.direction}`,
          input: { fullSync: job.fullSync, since: job.since } as any,
        },
      });

      const result = await syncFn({
        fullSync: job.fullSync,
        since: job.since,
      });

      await prisma.connectorRun.create({
        data: {
          connectorId: job.connectorId,
          companyId: job.companyId,
          status: result.success ? "COMPLETED" : "FAILED",
          event: `sync:${job.direction}`,
          output: result as any,
          error: result.errors.length > 0 ? result.errors.join("; ") : null,
          completedAt: new Date(),
          startedAt: new Date(startedAt),
        },
      });

      return result;
    } catch (err: any) {
      const errorMsg = String(err?.message ?? err);
      await prisma.connectorRun.create({
        data: {
          connectorId: job.connectorId,
          companyId: job.companyId,
          status: "FAILED",
          event: `sync:${job.direction}`,
          error: errorMsg,
          completedAt: new Date(),
        },
      });

      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: [errorMsg],
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }
  }
}

export async function scheduleSync(
  connectorId: string,
  _companyId: string,
  _config: SyncConfig,
): Promise<void> {
  const { scheduleCron } = await import("@/modules/queue/queue.service");
  await scheduleCron(
    `sync:${connectorId}`,
    _config.schedule ?? "0 * * * *",
    { connectorId, companyId: _companyId },
  );
}

export async function cancelSyncSchedule(connectorId: string): Promise<void> {
  const { unscheduleCron } = await import("@/modules/queue/queue.service");
  await unscheduleCron(`sync:${connectorId}`);
}
