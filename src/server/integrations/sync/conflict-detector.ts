import type { ConflictRecord, ConflictPolicy } from "./types";
import { getSyncState } from "./state";

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: ConflictRecord[];
}

export function detectVersionConflicts(params: {
  sessionId: string;
  entityType: string;
  connectionId: string;
  localRecords: Array<{ id: string; version: string; data: Record<string, unknown> }>;
  remoteRecords: Array<{ id: string; version: string; data: Record<string, unknown> }>;
  policy: ConflictPolicy;
}): ConflictDetectionResult {
  const conflicts: ConflictRecord[] = [];
  const localMap = new Map(params.localRecords.map((r) => [r.id, r]));

  for (const remote of params.remoteRecords) {
    const local = localMap.get(remote.id);
    if (!local) continue;

    if (local.version !== remote.version) {
      conflicts.push({
        id: crypto.randomUUID(),
        sessionId: params.sessionId,
        entityType: params.entityType,
        entityId: remote.id,
        localVersion: local.version,
        remoteVersion: remote.version,
        localData: local.data,
        remoteData: remote.data,
        detectionMethod: "version_mismatch",
        policy: params.policy,
        resolution: null,
        createdAt: new Date(),
      });
    }
  }

  return { hasConflicts: conflicts.length > 0, conflicts };
}

export function detectDuplicateRecords(params: {
  sessionId: string;
  entityType: string;
  remoteRecords: Array<{ id: string; data: Record<string, unknown> }>;
  existingIds: Set<string>;
  policy: ConflictPolicy;
  matchField?: string;
}): ConflictDetectionResult {
  const conflicts: ConflictRecord[] = [];
  const seen = new Set<string>();

  for (const remote of params.remoteRecords) {
    if (params.existingIds.has(remote.id)) {
      conflicts.push({
        id: crypto.randomUUID(),
        sessionId: params.sessionId,
        entityType: params.entityType,
        entityId: remote.id,
        localVersion: "existing",
        remoteVersion: "incoming",
        localData: {},
        remoteData: remote.data,
        detectionMethod: "duplicate_id",
        policy: params.policy,
        resolution: null,
        createdAt: new Date(),
      });
    }

    if (params.matchField) {
      const matchValue = String(remote.data[params.matchField] ?? "");
      if (seen.has(matchValue)) {
        conflicts.push({
          id: crypto.randomUUID(),
          sessionId: params.sessionId,
          entityType: params.entityType,
          entityId: remote.id,
          localVersion: "seen",
          remoteVersion: "duplicate",
          localData: {},
          remoteData: remote.data,
          detectionMethod: "duplicate_field",
          policy: params.policy,
          resolution: null,
          createdAt: new Date(),
        });
      }
      seen.add(matchValue);
    }
  }

  return { hasConflicts: conflicts.length > 0, conflicts };
}

export function detectSchemaConflicts(
  localSchema: Record<string, string>,
  remoteSchema: Record<string, string>,
): string[] {
  const issues: string[] = [];
  for (const [field, localType] of Object.entries(localSchema)) {
    const remoteType = remoteSchema[field];
    if (remoteType && remoteType !== localType) {
      issues.push(`Field "${field}" type mismatch: local="${localType}" remote="${remoteType}"`);
    }
  }
  return issues;
}

export function detectDeletedRecordConflict(
  localExists: boolean,
  remoteExists: boolean,
): "local_deleted" | "remote_deleted" | "both_deleted" | "no_conflict" {
  if (!localExists && !remoteExists) return "both_deleted";
  if (!localExists) return "local_deleted";
  if (!remoteExists) return "remote_deleted";
  return "no_conflict";
}
