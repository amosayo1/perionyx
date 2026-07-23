import type { SyncState } from "@/server/integrations/types";

const syncStates = new Map<string, SyncState>();

export function getSyncState(connectionId: string): SyncState {
  const existing = syncStates.get(connectionId);
  if (existing) return { ...existing };

  const fresh: SyncState = {
    lastSyncAt: null,
    lastCursor: null,
    lastFullSyncAt: null,
    version: 1,
    changeTracking: {},
  };

  syncStates.set(connectionId, fresh);
  return fresh;
}

export function updateSyncState(
  connectionId: string,
  updates: Partial<SyncState>,
): SyncState {
  const current = getSyncState(connectionId);
  const updated: SyncState = { ...current, ...updates };
  syncStates.set(connectionId, updated);
  return updated;
}

export function advanceCursor(
  connectionId: string,
  cursor: string,
): void {
  updateSyncState(connectionId, {
    lastCursor: cursor,
    lastSyncAt: new Date(),
  });
}

export function markFullSyncComplete(connectionId: string): void {
  updateSyncState(connectionId, {
    lastFullSyncAt: new Date(),
    lastSyncAt: new Date(),
    version: getSyncState(connectionId).version + 1,
  });
}

export function resetSyncState(connectionId: string): void {
  syncStates.set(connectionId, {
    lastSyncAt: null,
    lastCursor: null,
    lastFullSyncAt: null,
    version: 1,
    changeTracking: {},
  });
}

export function trackChange(
  connectionId: string,
  entityType: string,
  entityId: string,
  hash: string,
): void {
  const state = getSyncState(connectionId);
  state.changeTracking[`${entityType}:${entityId}`] = hash;
  syncStates.set(connectionId, state);
}

export function hasChanged(
  connectionId: string,
  entityType: string,
  entityId: string,
  hash: string,
): boolean {
  const state = getSyncState(connectionId);
  const key = `${entityType}:${entityId}`;
  return state.changeTracking[key] !== hash;
}

export function clearChangeTracking(connectionId: string): void {
  const state = getSyncState(connectionId);
  state.changeTracking = {};
  syncStates.set(connectionId, state);
}
