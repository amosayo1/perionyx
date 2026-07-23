import {
  saveCheckpoint,
  getLatestCheckpoint,
  getCheckpointHistory,
  restoreFromCheckpoint,
  clearCheckpoints,
  takeSnapshot,
  getLatestSnapshot,
  getSnapshots,
  recordRecoveryAttempt,
  recordFailure,
} from "./checkpoint";
import { updateCheckpoint } from "./session";
import { recordCheckpoint } from "./metrics";
import type { Checkpoint, SyncSnapshot } from "./types";
import { createInitialCheckpoint } from "./types";

export function advanceCheckpoint(
  sessionId: string,
  updates: Partial<Checkpoint>,
): Checkpoint {
  const latest = getLatestCheckpoint(sessionId) ?? createInitialCheckpoint();
  const checkpoint: Checkpoint = { ...latest, ...updates };
  saveCheckpoint(sessionId, checkpoint);
  updateCheckpoint(sessionId, checkpoint);
  recordCheckpoint(sessionId);
  return checkpoint;
}

export function markBatchProcessed(
  sessionId: string,
  batchSize: number,
  batchDurationMs: number,
  hasMore: boolean,
  cursor?: string | null,
): Checkpoint {
  const latest = getLatestCheckpoint(sessionId) ?? createInitialCheckpoint();
  const checkpoint: Checkpoint = {
    ...latest,
    offset: latest.offset + batchSize,
    page: latest.page + 1,
    processedItems: latest.processedItems + batchSize,
    batchCount: latest.batchCount + 1,
    cursor: cursor ?? latest.cursor,
    hasMore,
    lastTimestamp: new Date().toISOString(),
  };
  saveCheckpoint(sessionId, checkpoint);
  updateCheckpoint(sessionId, checkpoint);
  recordCheckpoint(sessionId);
  return checkpoint;
}

export function markItemsFailed(
  sessionId: string,
  failedCount: number,
): Checkpoint {
  const latest = getLatestCheckpoint(sessionId) ?? createInitialCheckpoint();
  const checkpoint: Checkpoint = {
    ...latest,
    failedItems: latest.failedItems + failedCount,
  };
  saveCheckpoint(sessionId, checkpoint);
  updateCheckpoint(sessionId, checkpoint);
  return checkpoint;
}

export function markItemsSkipped(
  sessionId: string,
  skippedCount: number,
): Checkpoint {
  const latest = getLatestCheckpoint(sessionId) ?? createInitialCheckpoint();
  const checkpoint: Checkpoint = {
    ...latest,
    skippedItems: latest.skippedItems + skippedCount,
  };
  saveCheckpoint(sessionId, checkpoint);
  updateCheckpoint(sessionId, checkpoint);
  return checkpoint;
}

export function setTotalItems(
  sessionId: string,
  total: number,
): Checkpoint {
  return advanceCheckpoint(sessionId, { totalItems: total });
}

export function snapshotSession(
  sessionId: string,
  data?: Record<string, unknown>,
): SyncSnapshot {
  const checkpoint = getLatestCheckpoint(sessionId) ?? createInitialCheckpoint();
  const snapshot: SyncSnapshot = {
    id: crypto.randomUUID(),
    sessionId,
    timestamp: new Date(),
    checkpoint,
    metrics: { recordsSynced: 0, recordsFailed: 0, recordsSkipped: 0, recordsCreated: 0, recordsUpdated: 0, recordsDeleted: 0, conflictsDetected: 0, conflictsResolved: 0, retries: 0, batchesCompleted: 0, durationMs: 0, throughput: 0, averageBatchTimeMs: 0, peakMemoryMb: 0, checkpointCount: 0, recoveryCount: 0 },
    status: "running",
    data,
  };
  takeSnapshot(sessionId, snapshot);
  return snapshot;
}

export {
  getLatestCheckpoint,
  getCheckpointHistory,
  restoreFromCheckpoint,
  clearCheckpoints,
  getLatestSnapshot,
  getSnapshots,
  recordRecoveryAttempt,
  recordFailure,
};
