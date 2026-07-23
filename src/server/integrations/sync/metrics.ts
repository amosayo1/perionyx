import type { SyncMetrics } from "./types";
import { createInitialMetrics } from "./types";

const sessionMetrics = new Map<string, SyncMetrics>();
const globalMetrics: SyncMetrics = createInitialMetrics();

export function initializeSessionMetrics(sessionId: string): SyncMetrics {
  const metrics = createInitialMetrics();
  sessionMetrics.set(sessionId, metrics);
  return metrics;
}

export function getSessionMetrics(sessionId: string): SyncMetrics | undefined {
  return sessionMetrics.get(sessionId);
}

export function updateSessionMetrics(
  sessionId: string,
  updates: Partial<SyncMetrics>,
): SyncMetrics {
  const current = sessionMetrics.get(sessionId) ?? createInitialMetrics();
  const updated: SyncMetrics = { ...current, ...updates };
  sessionMetrics.set(sessionId, updated);
  return updated;
}

export function recordSyncOperation(
  sessionId: string,
  type: "created" | "updated" | "deleted" | "skipped" | "failed",
): void {
  const current = sessionMetrics.get(sessionId) ?? createInitialMetrics();
  current.recordsSynced++;
  if (type === "created") current.recordsCreated++;
  if (type === "updated") current.recordsUpdated++;
  if (type === "deleted") current.recordsDeleted++;
  if (type === "skipped") current.recordsSkipped++;
  if (type === "failed") current.recordsFailed++;
  sessionMetrics.set(sessionId, current);

  globalMetrics.recordsSynced++;
}

export function recordConflict(sessionId: string): void {
  const current = sessionMetrics.get(sessionId) ?? createInitialMetrics();
  current.conflictsDetected++;
  sessionMetrics.set(sessionId, current);
  globalMetrics.conflictsDetected++;
}

export function recordConflictResolved(sessionId: string): void {
  const current = sessionMetrics.get(sessionId) ?? createInitialMetrics();
  current.conflictsResolved++;
  sessionMetrics.set(sessionId, current);
  globalMetrics.conflictsResolved++;
}

export function recordRetry(sessionId: string): void {
  const current = sessionMetrics.get(sessionId) ?? createInitialMetrics();
  current.retries++;
  sessionMetrics.set(sessionId, current);
  globalMetrics.retries++;
}

export function recordBatchCompleted(
  sessionId: string,
  batchDurationMs: number,
): void {
  const current = sessionMetrics.get(sessionId) ?? createInitialMetrics();
  current.batchesCompleted++;
  current.averageBatchTimeMs = Math.round(
    (current.averageBatchTimeMs * (current.batchesCompleted - 1) + batchDurationMs) / current.batchesCompleted,
  );
  current.throughput = Math.round(
    (current.recordsSynced / (current.durationMs || 1)) * 1000,
  );
  sessionMetrics.set(sessionId, current);
}

export function recordCheckpoint(sessionId: string): void {
  const current = sessionMetrics.get(sessionId) ?? createInitialMetrics();
  current.checkpointCount++;
  sessionMetrics.set(sessionId, current);
}

export function recordRecovery(sessionId: string): void {
  const current = sessionMetrics.get(sessionId) ?? createInitialMetrics();
  current.recoveryCount++;
  sessionMetrics.set(sessionId, current);
}

export function getGlobalMetrics(): SyncMetrics {
  return { ...globalMetrics };
}

export function resetGlobalMetrics(): void {
  Object.assign(globalMetrics, createInitialMetrics());
}
