import type { SyncState } from "@/server/integrations/types";
import type { ChangeDetection } from "./types";
import { getSyncState, hasChanged, trackChange, advanceCursor } from "./state";
import type { Checkpoint } from "./types";

export type ComparisonMethod = "timestamp" | "version" | "hash";

export interface ChangeDetectionConfig {
  method: ComparisonMethod;
  timestampField?: string;
  versionField?: string;
}

export function detectChanges(params: {
  connectionId: string;
  entityType: string;
  remoteItems: Array<{ id: string; updatedAt?: string | Date; version?: string; hash?: string; deleted?: boolean }>;
  config: ChangeDetectionConfig;
}): ChangeDetection {
  const changedIds: string[] = [];
  const deletedIds: string[] = [];
  const newIds: string[] = [];
  const unchangedHashes: string[] = [];
  const state = getSyncState(params.connectionId);

  for (const item of params.remoteItems) {
    if (item.deleted) {
      deletedIds.push(item.id);
      continue;
    }

    const hash = item.hash ?? item.version ?? String(item.updatedAt ?? item.id);

    if (!hasChanged(params.connectionId, params.entityType, item.id, hash)) {
      unchangedHashes.push(hash);
      continue;
    }

    const key = `${params.entityType}:${item.id}`;
    const existingHash = state.changeTracking[key];

    if (!existingHash) {
      newIds.push(item.id);
    } else {
      changedIds.push(item.id);
    }

    trackChange(params.connectionId, params.entityType, item.id, hash);
  }

  return {
    changedIds,
    deletedIds,
    newIds,
    unchangedHashes,
    hasChanges: changedIds.length > 0 || deletedIds.length > 0 || newIds.length > 0,
    comparisonMethod: params.config.method,
  };
}

export function compareByTimestamp(
  remoteTimestamp: string | Date | undefined,
  localTimestamp: string | Date | undefined,
): boolean {
  if (!remoteTimestamp) return false;
  const remote = new Date(remoteTimestamp).getTime();
  const local = localTimestamp ? new Date(localTimestamp).getTime() : 0;
  return remote > local;
}

export function compareByVersion(
  remoteVersion: string | undefined,
  localVersion: string | undefined,
): boolean {
  if (!remoteVersion) return true;
  if (!localVersion) return true;
  return remoteVersion !== localVersion;
}

export function computeHash(data: Record<string, unknown>): string {
  const stable = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < stable.length; i++) {
    const char = stable.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function detectDeletedRecords(
  existingIds: Set<string>,
  remoteIds: Set<string>,
): string[] {
  const deleted: string[] = [];
  for (const id of existingIds) {
    if (!remoteIds.has(id)) {
      deleted.push(id);
    }
  }
  return deleted;
}

export function isSoftDeleted(
  record: Record<string, unknown>,
  deletedField = "status",
  deletedValues: string[] = ["deleted", "inactive", "archived"],
): boolean {
  const value = record[deletedField];
  return typeof value === "string" && deletedValues.includes(value.toLowerCase());
}
