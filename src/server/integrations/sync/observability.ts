import { recordIntegrationMetric, recordIntegrationHistogram, logIntegrationEvent, emitIntegrationDomainEvent } from "@/server/integrations/observability";
import type { SyncSession, SyncMetrics } from "./types";

export function recordSyncMetrics(
  session: SyncSession,
  tags?: Record<string, string>,
): void {
  const { metrics, providerId, connectionId, companyId, mode, direction } = session;
  const baseTags = {
    providerId,
    connectionId,
    companyId,
    mode,
    direction,
    status: session.status,
    ...tags,
  };

  recordIntegrationMetric("sync.records_synced", metrics.recordsSynced, baseTags);
  recordIntegrationMetric("sync.records_failed", metrics.recordsFailed, baseTags);
  recordIntegrationMetric("sync.records_skipped", metrics.recordsSkipped, baseTags);
  recordIntegrationMetric("sync.conflicts_detected", metrics.conflictsDetected, baseTags);
  recordIntegrationMetric("sync.conflicts_resolved", metrics.conflictsResolved, baseTags);
  recordIntegrationMetric("sync.retries", metrics.retries, baseTags);
  recordIntegrationMetric("sync.batches_completed", metrics.batchesCompleted, baseTags);
  recordIntegrationMetric("sync.checkpoints", metrics.checkpointCount, baseTags);
  recordIntegrationMetric("sync.recoveries", metrics.recoveryCount, baseTags);

  recordIntegrationHistogram("sync.duration_ms", metrics.durationMs, baseTags);
  recordIntegrationHistogram("sync.throughput", metrics.throughput, baseTags);
  recordIntegrationHistogram("sync.average_batch_time_ms", metrics.averageBatchTimeMs, baseTags);
}

export function logSyncEvent(
  level: "info" | "warn" | "error",
  session: SyncSession,
  message: string,
  data?: Record<string, unknown>,
): void {
  logIntegrationEvent(level, `[Sync:${session.id}] ${message}`, {
    sessionId: session.id,
    connectionId: session.connectionId,
    providerId: session.providerId,
    companyId: session.companyId,
    mode: session.mode,
    status: session.status,
    ...data,
  });
}

export function emitSyncDomainEvent(
  event: "integration.sync.started" | "integration.sync.completed" | "integration.sync.failed",
  session: SyncSession,
  extra?: Record<string, unknown>,
): void {
  emitIntegrationDomainEvent(event, {
    sessionId: session.id,
    providerId: session.providerId,
    connectionId: session.connectionId,
    companyId: session.companyId,
    mode: session.mode,
    direction: session.direction,
    recordsSynced: session.metrics.recordsSynced,
    recordsFailed: session.metrics.recordsFailed,
    durationMs: session.metrics.durationMs,
    status: session.status,
    ...extra,
  });
}

export function emitCheckpointEvent(
  sessionId: string,
  checkpoint: { processedItems: number; totalItems: number; batchCount: number },
): void {
  emitIntegrationDomainEvent("integration.sync.completed", {
    sessionId,
    type: "checkpoint",
    processedItems: checkpoint.processedItems,
    totalItems: checkpoint.totalItems,
    batchCount: checkpoint.batchCount,
  });
}
