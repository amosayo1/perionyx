import type { SyncSession, SyncStatus, SyncOptions, SyncMode, SyncDirection, SyncMetrics, Checkpoint } from "./types";
import { createInitialCheckpoint, createInitialMetrics } from "./types";

const sessions = new Map<string, SyncSession>();
const companySessions = new Map<string, Set<string>>();

export function createSession(params: {
  connectionId: string;
  providerId: string;
  companyId: string;
  mode: SyncMode;
  direction: SyncDirection;
  options: SyncOptions;
  correlationId?: string;
}): SyncSession {
  const session: SyncSession = {
    id: crypto.randomUUID(),
    connectionId: params.connectionId,
    providerId: params.providerId,
    companyId: params.companyId,
    mode: params.mode,
    direction: params.direction,
    status: "pending",
    options: params.options,
    checkpoint: createInitialCheckpoint(),
    metrics: createInitialMetrics(),
    startedAt: new Date(),
    updatedAt: new Date(),
    correlationId: params.correlationId ?? crypto.randomUUID(),
  };

  sessions.set(session.id, session);

  if (!companySessions.has(params.companyId)) {
    companySessions.set(params.companyId, new Set());
  }
  companySessions.get(params.companyId)!.add(session.id);

  return session;
}

export function getSession(sessionId: string): SyncSession | undefined {
  return sessions.get(sessionId);
}

export function updateSession(
  sessionId: string,
  updates: Partial<SyncSession>,
): SyncSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  Object.assign(session, updates, { updatedAt: new Date() });
  return session;
}

export function updateSessionStatus(
  sessionId: string,
  status: SyncStatus,
  error?: string,
): SyncSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  session.status = status;
  session.updatedAt = new Date();

  if (status === "completed" || status === "failed") {
    session.completedAt = new Date();
    session.metrics.durationMs = session.completedAt.getTime() - session.startedAt.getTime();
  }

  if (error) session.error = error;

  return session;
}

export function updateCheckpoint(
  sessionId: string,
  checkpoint: Checkpoint,
): SyncSession | undefined {
  return updateSession(sessionId, { checkpoint });
}

export function updateMetrics(
  sessionId: string,
  metrics: Partial<SyncMetrics>,
): SyncSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  Object.assign(session.metrics, metrics);
  return session;
}

export function getCompanySessions(
  companyId: string,
  limit = 50,
): SyncSession[] {
  const ids = companySessions.get(companyId);
  if (!ids) return [];
  const result: SyncSession[] = [];
  for (const id of ids) {
    const session = sessions.get(id);
    if (session) result.push(session);
    if (result.length >= limit) break;
  }
  return result.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

export function getConnectionSessions(
  connectionId: string,
  limit = 20,
): SyncSession[] {
  const result: SyncSession[] = [];
  for (const session of sessions.values()) {
    if (session.connectionId === connectionId) {
      result.push(session);
      if (result.length >= limit) break;
    }
  }
  return result.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

export function getActiveSessions(): SyncSession[] {
  return Array.from(sessions.values()).filter(
    (s) => s.status === "pending" || s.status === "running",
  );
}

export function cleanupSessions(olderThanMs = 86400000): number {
  const cutoff = Date.now() - olderThanMs;
  let count = 0;
  for (const [id, session] of sessions) {
    if (session.startedAt.getTime() < cutoff) {
      sessions.delete(id);
      companySessions.get(session.companyId)?.delete(id);
      count++;
    }
  }
  return count;
}
