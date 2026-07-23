import type { Checkpoint, SyncSnapshot, RecoveryState } from "./types";
import { createInitialCheckpoint } from "./types";

const checkpoints = new Map<string, Checkpoint[]>();
const snapshots = new Map<string, SyncSnapshot[]>();
const recoveryStates = new Map<string, RecoveryState>();
const maxHistory = 100;

export function saveCheckpoint(sessionId: string, checkpoint: Checkpoint): void {
  if (!checkpoints.has(sessionId)) {
    checkpoints.set(sessionId, []);
  }
  const history = checkpoints.get(sessionId)!;
  history.push({ ...checkpoint });

  if (history.length > maxHistory) {
    checkpoints.set(sessionId, history.slice(-maxHistory));
  }
}

export function getLatestCheckpoint(sessionId: string): Checkpoint | undefined {
  const history = checkpoints.get(sessionId);
  if (!history || history.length === 0) return undefined;
  return history[history.length - 1];
}

export function getCheckpointHistory(sessionId: string): Checkpoint[] {
  return checkpoints.get(sessionId) ?? [];
}

export function restoreFromCheckpoint(sessionId: string): Checkpoint | null {
  const latest = getLatestCheckpoint(sessionId);
  if (!latest) return null;
  return { ...latest };
}

export function clearCheckpoints(sessionId: string): void {
  checkpoints.delete(sessionId);
}

export function takeSnapshot(sessionId: string, snapshot: SyncSnapshot): void {
  if (!snapshots.has(sessionId)) {
    snapshots.set(sessionId, []);
  }
  const history = snapshots.get(sessionId)!;
  history.push(snapshot);

  if (history.length > maxHistory) {
    snapshots.set(sessionId, history.slice(-maxHistory));
  }
}

export function getLatestSnapshot(sessionId: string): SyncSnapshot | undefined {
  const history = snapshots.get(sessionId);
  if (!history || history.length === 0) return undefined;
  return history[history.length - 1];
}

export function getSnapshots(sessionId: string): SyncSnapshot[] {
  return snapshots.get(sessionId) ?? [];
}

export function saveRecoveryState(sessionId: string, state: RecoveryState): void {
  recoveryStates.set(sessionId, state);
}

export function getRecoveryState(sessionId: string): RecoveryState | undefined {
  return recoveryStates.get(sessionId);
}

export function recordRecoveryAttempt(sessionId: string): RecoveryState {
  const existing = getRecoveryState(sessionId) ?? {
    sessionId,
    lastCheckpoint: createInitialCheckpoint(),
    failureCount: 0,
    lastFailureAt: null,
    recoveredAt: null,
    recoveryAttempts: 0,
  };

  const updated: RecoveryState = {
    ...existing,
    lastCheckpoint: getLatestCheckpoint(sessionId) ?? existing.lastCheckpoint,
    recoveryAttempts: existing.recoveryAttempts + 1,
    recoveredAt: new Date(),
  };

  recoveryStates.set(sessionId, updated);
  return updated;
}

export function recordFailure(sessionId: string, reason: string): RecoveryState {
  const existing = getRecoveryState(sessionId) ?? {
    sessionId,
    lastCheckpoint: createInitialCheckpoint(),
    failureCount: 0,
    lastFailureAt: null,
    recoveredAt: null,
    recoveryAttempts: 0,
  };

  const updated: RecoveryState = {
    ...existing,
    failureCount: existing.failureCount + 1,
    lastFailureAt: new Date(),
    lastFailureReason: reason,
    lastCheckpoint: getLatestCheckpoint(sessionId) ?? existing.lastCheckpoint,
  };

  recoveryStates.set(sessionId, updated);
  return updated;
}

export function clearRecoveryState(sessionId: string): void {
  recoveryStates.delete(sessionId);
}
