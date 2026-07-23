export interface SyncCheckpoint {
  id: string;
  connectionId: string;
  accountId: string;
  lastSuccessfulSync: string | null;
  lastFailedSync: string | null;
  checkpointToken: string | null;
  cursor: string | null;
  paginationState: Record<string, unknown> | null;
  providerSyncToken: string | null;
  continuationToken: string | null;
  lastTransactionExternalId: string | null;
  totalTransactionsSynced: number;
  lastSyncDurationMs: number | null;
  consecutiveFailures: number;
  isStale: boolean;
  staleThresholdMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export class CheckpointEngine {
  private checkpoints = new Map<string, SyncCheckpoint>();

  private buildKey(connectionId: string, accountId: string): string {
    return `${connectionId}::${accountId}`;
  }

  getCheckpoint(connectionId: string, accountId: string): SyncCheckpoint | null {
    const key = this.buildKey(connectionId, accountId);
    return this.checkpoints.get(key) ?? null;
  }

  getOrCreateCheckpoint(
    connectionId: string,
    accountId: string,
    staleThresholdMinutes = 60,
  ): SyncCheckpoint {
    const existing = this.getCheckpoint(connectionId, accountId);
    if (existing) return existing;

    const checkpoint: SyncCheckpoint = {
      id: `${connectionId}-${accountId}-checkpoint`,
      connectionId,
      accountId,
      lastSuccessfulSync: null,
      lastFailedSync: null,
      checkpointToken: null,
      cursor: null,
      paginationState: null,
      providerSyncToken: null,
      continuationToken: null,
      lastTransactionExternalId: null,
      totalTransactionsSynced: 0,
      lastSyncDurationMs: null,
      consecutiveFailures: 0,
      isStale: false,
      staleThresholdMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.checkpoints.set(this.buildKey(connectionId, accountId), checkpoint);
    return checkpoint;
  }

  updateCheckpoint(
    connectionId: string,
    accountId: string,
    updates: Partial<SyncCheckpoint>,
  ): SyncCheckpoint | null {
    const key = this.buildKey(connectionId, accountId);
    const existing = this.checkpoints.get(key);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.checkpoints.set(key, updated);
    return updated;
  }

  markSyncSuccess(
    connectionId: string,
    accountId: string,
    cursor: string | null,
    checkpointToken: string | null,
    providerSyncToken: string | null,
    lastTransactionExternalId: string | null,
    durationMs: number,
  ): SyncCheckpoint {
    const key = this.buildKey(connectionId, accountId);
    const existing = this.getOrCreateCheckpoint(connectionId, accountId);

    return this.updateCheckpoint(connectionId, accountId, {
      lastSuccessfulSync: new Date().toISOString(),
      cursor,
      checkpointToken,
      providerSyncToken,
      lastTransactionExternalId,
      lastSyncDurationMs: durationMs,
      consecutiveFailures: 0,
      isStale: false,
    })!;
  }

  markSyncFailure(
    connectionId: string,
    accountId: string,
    error: string,
  ): SyncCheckpoint {
    const key = this.buildKey(connectionId, accountId);
    const existing = this.getOrCreateCheckpoint(connectionId, accountId);

    const consecutiveFailures = (existing.consecutiveFailures ?? 0) + 1;
    const isStale = consecutiveFailures >= 3;

    return this.updateCheckpoint(connectionId, accountId, {
      lastFailedSync: new Date().toISOString(),
      lastSyncDurationMs: null,
      consecutiveFailures,
      isStale,
    })!;
  }

  isStale(connectionId: string, accountId: string): boolean {
    const checkpoint = this.getCheckpoint(connectionId, accountId);
    if (!checkpoint) return true;
    if (!checkpoint.lastSuccessfulSync) return true;

    const staleTime =
      new Date(checkpoint.lastSuccessfulSync).getTime() +
      checkpoint.staleThresholdMinutes * 60 * 1000;

    return Date.now() > staleTime || checkpoint.isStale;
  }

  getAccountsNeedingSync(connectionId: string): string[] {
    const results: string[] = [];
    const prefix = `${connectionId}::`;
    for (const [key, checkpoint] of this.checkpoints) {
      if (key.startsWith(prefix) && this.isStale(connectionId, checkpoint.accountId)) {
        results.push(checkpoint.accountId);
      }
    }
    return results;
  }

  deleteCheckpoint(connectionId: string, accountId: string): void {
    this.checkpoints.delete(this.buildKey(connectionId, accountId));
  }

  clearConnection(connectionId: string): void {
    const prefix = `${connectionId}::`;
    for (const key of this.checkpoints.keys()) {
      if (key.startsWith(prefix)) {
        this.checkpoints.delete(key);
      }
    }
  }

  getAllCheckpoints(): SyncCheckpoint[] {
    return Array.from(this.checkpoints.values());
  }
}

export const checkpointEngine = new CheckpointEngine();