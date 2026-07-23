import {
  getLatestCheckpoint,
  recordRecoveryAttempt,
  recordFailure as recordRecoveryFailure,
  saveRecoveryState,
  clearRecoveryState,
} from "./checkpoint";
import { updateSessionStatus, getSession } from "./session";
import { recordRecovery } from "./metrics";
import type { Checkpoint, RecoveryState, SyncSession } from "./types";
import { createInitialCheckpoint } from "./types";

export interface RecoveryResult {
  recovered: boolean;
  session: SyncSession | undefined;
  checkpoint: Checkpoint;
  attempts: number;
}

const MAX_RECOVERY_ATTEMPTS = 5;
const RECOVERY_BACKOFF_MS = 5000;

export async function attemptRecovery(sessionId: string): Promise<RecoveryResult> {
  const session = getSession(sessionId);
  if (!session) {
    return { recovered: false, session: undefined, checkpoint: createInitialCheckpoint(), attempts: 0 };
  }

  const recoveryState = recordRecoveryAttempt(sessionId);

  if (recoveryState.recoveryAttempts > MAX_RECOVERY_ATTEMPTS) {
    updateSessionStatus(sessionId, "failed", `Exceeded max recovery attempts (${MAX_RECOVERY_ATTEMPTS})`);
    return { recovered: false, session: getSession(sessionId), checkpoint: recoveryState.lastCheckpoint, attempts: recoveryState.recoveryAttempts };
  }

  const checkpoint = getLatestCheckpoint(sessionId) ?? createInitialCheckpoint();

  await backoff(recoveryState.recoveryAttempts);

  updateSessionStatus(sessionId, "recovering");
  recordRecovery(sessionId);

  return {
    recovered: true,
    session: getSession(sessionId),
    checkpoint,
    attempts: recoveryState.recoveryAttempts,
  };
}

export async function recoverWithBackoff(
  sessionId: string,
  recoverFn: () => Promise<boolean>,
  maxAttempts = MAX_RECOVERY_ATTEMPTS,
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const success = await recoverFn();
      if (success) {
        const updated = recordRecoveryAttempt(sessionId);
        updateSessionStatus(sessionId, "running");
        return true;
      }
    } catch (error) {
      recordRecoveryFailure(
        sessionId,
        error instanceof Error ? error.message : String(error),
      );
    }

    updateSessionStatus(sessionId, "recovering", `Recovery attempt ${attempt} failed`);

    if (attempt < maxAttempts) {
      await backoff(attempt);
    }
  }

  updateSessionStatus(sessionId, "failed", `All ${maxAttempts} recovery attempts failed`);
  return false;
}

export function canRecover(session: SyncSession): boolean {
  if (session.status === "completed") return false;
  if (session.status === "cancelled") return false;
  if (session.status === "running") return true;
  if (session.status === "failed") return true;
  if (session.status === "recovering") return true;

  const checkpoint = getLatestCheckpoint(session.id);
  if (checkpoint && checkpoint.processedItems > 0) return true;

  return false;
}

export function clearRecoveryForSession(sessionId: string): void {
  clearRecoveryState(sessionId);
}

function backoff(attempt: number): Promise<void> {
  const delay = Math.min(RECOVERY_BACKOFF_MS * Math.pow(2, attempt - 1), 60000);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function isPowerInterruption(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return msg.includes("connection") || msg.includes("timeout") || msg.includes("network") || msg.includes("econnreset");
}

export function isApiFailure(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return msg.includes("rate limit") || msg.includes("429") || msg.includes("500") || msg.includes("503") || msg.includes("service unavailable");
}
