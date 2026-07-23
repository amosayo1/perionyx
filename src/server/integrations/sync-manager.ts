import { integrationRegistry } from "./integration-registry";
import { getOrCreateProvider } from "./integration-factory";
import type {
  SyncJob,
  SyncType,
  SyncDirection,
  SyncResult,
  SyncState,
  ConflictRecord,
} from "./types";

const syncJobs = new Map<string, SyncJob>();
const jobConnectionIndex = new Map<string, Set<string>>();
const syncStates = new Map<string, SyncState>();
const conflicts = new Map<string, ConflictRecord>();
const conflictConnectionIndex = new Map<string, Set<string>>();

export async function startSync(
  connectionId: string,
  type: SyncType,
  direction: SyncDirection,
): Promise<SyncJob> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const providerConfig = integrationRegistry.getProvider(connection.providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${connection.providerId} not found`);
  }

  const job: SyncJob = {
    id: crypto.randomUUID(),
    connectionId,
    companyId: connection.companyId,
    type,
    direction,
    status: "running",
    startedAt: new Date(),
  };

  syncJobs.set(job.id, job);
  indexJob(job);

  try {
    const provider = await getOrCreateProvider(providerConfig);
    const state = await getSyncStateInternal(connectionId);

    let result: SyncResult;
    if (type === "full") {
      result = await provider.syncFull(job, state);
    } else if (type === "incremental") {
      result = await provider.syncIncremental(job, state);
    } else {
      result = await provider.sync(job, state);
    }

    job.status = "completed";
    job.completedAt = new Date();
    job.itemsProcessed = result.itemsSynced;
    job.itemsFailed = result.itemsFailed;

    if (result.cursor) {
      state.lastCursor = result.cursor;
    }
    state.lastSyncAt = new Date();
    if (type === "full") {
      state.lastFullSyncAt = new Date();
    }
    state.version++;
    syncStates.set(connectionId, state);

    connection.lastSyncAt = new Date();
    connection.failureCount = 0;
    integrationRegistry.registerConnection(connection);

    syncJobs.set(job.id, job);
    return job;
  } catch (error) {
    job.status = "failed";
    job.completedAt = new Date();
    job.error = error instanceof Error ? error.message : "Sync failed";

    connection.failureCount++;
    connection.lastError = job.error;
    integrationRegistry.registerConnection(connection);

    syncJobs.set(job.id, job);
    return job;
  }
}

export function getSyncStatus(jobId: string): SyncJob | undefined {
  return syncJobs.get(jobId);
}

export function listSyncJobs(connectionId: string, limit = 20): SyncJob[] {
  const ids = jobConnectionIndex.get(connectionId);
  if (!ids) return [];
  return Array.from(ids)
    .map((id) => syncJobs.get(id))
    .filter((j): j is SyncJob => j !== undefined)
    .sort((a, b) => (b.startedAt?.getTime() ?? 0) - (a.startedAt?.getTime() ?? 0))
    .slice(0, limit);
}

export function cancelSync(jobId: string): SyncJob | undefined {
  const job = syncJobs.get(jobId);
  if (job && job.status === "running") {
    job.status = "cancelled";
    job.completedAt = new Date();
    syncJobs.set(jobId, job);
  }
  return job;
}

export async function getSyncState(connectionId: string): Promise<SyncState> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const providerConfig = integrationRegistry.getProvider(connection.providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${connection.providerId} not found`);
  }

  const provider = await getOrCreateProvider(providerConfig);
  const state = await provider.getSyncState(connectionId);
  syncStates.set(connectionId, state);
  return state;
}

export async function resetSyncState(connectionId: string): Promise<void> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const providerConfig = integrationRegistry.getProvider(connection.providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${connection.providerId} not found`);
  }

  const provider = await getOrCreateProvider(providerConfig);
  await provider.resetSyncState(connectionId);
  syncStates.delete(connectionId);
}

export async function detectConflicts(connectionId: string): Promise<ConflictRecord[]> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const ids = conflictConnectionIndex.get(connectionId) ?? new Set();
  return Array.from(ids)
    .map((id) => conflicts.get(id))
    .filter((c): c is ConflictRecord => c !== undefined && c.resolution === null);
}

export function resolveConflict(
  conflictId: string,
  resolution: "local" | "remote" | "manual" | "merged",
): ConflictRecord | undefined {
  const conflict = conflicts.get(conflictId);
  if (conflict) {
    conflict.resolution = resolution;
    conflict.resolvedAt = new Date();
    conflicts.set(conflictId, conflict);
  }
  return conflict;
}

function getSyncStateInternal(connectionId: string): SyncState {
  const existing = syncStates.get(connectionId);
  if (existing) return existing;

  const state: SyncState = {
    lastSyncAt: null,
    lastCursor: null,
    lastFullSyncAt: null,
    version: 0,
    changeTracking: {},
  };
  syncStates.set(connectionId, state);
  return state;
}

function indexJob(job: SyncJob): void {
  if (!jobConnectionIndex.has(job.connectionId)) {
    jobConnectionIndex.set(job.connectionId, new Set());
  }
  jobConnectionIndex.get(job.connectionId)!.add(job.id);
}

export function addConflict(conflict: Omit<ConflictRecord, "id" | "createdAt">): ConflictRecord {
  const record: ConflictRecord = {
    ...conflict,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
  conflicts.set(record.id, record);

  if (!conflictConnectionIndex.has(record.connectionId)) {
    conflictConnectionIndex.set(record.connectionId, new Set());
  }
  conflictConnectionIndex.get(record.connectionId)!.add(record.id);

  return record;
}

export function getAllConflicts(connectionId: string): ConflictRecord[] {
  const ids = conflictConnectionIndex.get(connectionId) ?? new Set();
  return Array.from(ids)
    .map((id) => conflicts.get(id))
    .filter((c): c is ConflictRecord => c !== undefined);
}
