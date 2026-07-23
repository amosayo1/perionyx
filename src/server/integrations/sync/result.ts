import type { SyncSession, SyncMetrics, Checkpoint, SyncSummary, SyncStatus } from "./types";

export function buildSummary(session: SyncSession): SyncSummary {
  const durationMs = (session.completedAt ?? new Date()).getTime() - session.startedAt.getTime();

  return {
    sessionId: session.id,
    connectionId: session.connectionId,
    providerId: session.providerId,
    companyId: session.companyId,
    mode: session.mode,
    direction: session.direction,
    status: session.status,
    metrics: { ...session.metrics, durationMs },
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationMs,
    error: session.error,
  };
}

export function wasSuccessful(session: SyncSession): boolean {
  return session.status === "completed" && session.metrics.recordsFailed === 0;
}

export function hadPartialFailure(session: SyncSession): boolean {
  return session.status === "completed" && session.metrics.recordsFailed > 0;
}

export function needsRecovery(session: SyncSession): boolean {
  return session.status === "failed" || session.status === "recovering";
}

export function calculateThroughput(metrics: SyncMetrics): number {
  if (metrics.durationMs === 0) return 0;
  return Math.round((metrics.recordsSynced / metrics.durationMs) * 1000);
}

export function estimateRemaining(checkpoint: Checkpoint): number {
  return Math.max(0, checkpoint.totalItems - checkpoint.processedItems);
}

export function progressPercent(checkpoint: Checkpoint): number {
  if (checkpoint.totalItems === 0) return 0;
  return Math.min(100, Math.round((checkpoint.processedItems / checkpoint.totalItems) * 100));
}
