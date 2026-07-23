import type { ConflictRecord, ConflictResolution, ConflictPolicy } from "./types";
import { recordConflictResolved } from "./metrics";

export type CustomResolver = (
  conflict: ConflictRecord,
) => Promise<ConflictResolution> | ConflictResolution;

const customResolvers = new Map<string, CustomResolver>();

export function registerCustomResolver(
  entityType: string,
  resolver: CustomResolver,
): void {
  customResolvers.set(entityType, resolver);
}

export function removeCustomResolver(entityType: string): void {
  customResolvers.delete(entityType);
}

export async function resolveConflict(
  conflict: ConflictRecord,
): Promise<ConflictResolution> {
  if (conflict.policy === "custom") {
    const resolver = customResolvers.get(conflict.entityType);
    if (resolver) {
      const resolution = await resolver(conflict);
      conflict.resolution = resolution;
      recordConflictResolved(conflict.sessionId);
      return resolution;
    }
  }

  const resolution = resolveByPolicy(conflict);
  conflict.resolution = resolution;
  recordConflictResolved(conflict.sessionId);
  return resolution;
}

export async function resolveConflicts(
  conflicts: ConflictRecord[],
): Promise<ConflictResolution[]> {
  return Promise.all(conflicts.map(resolveConflict));
}

export function resolveByPolicy(conflict: ConflictRecord): ConflictResolution {
  const now = new Date();

  switch (conflict.policy) {
    case "source_wins":
      return { policy: "source_wins", resolvedAt: now, resolution: "remote" };

    case "destination_wins":
      return { policy: "destination_wins", resolvedAt: now, resolution: "local" };

    case "newest_wins": {
      const localTime = extractTimestamp(conflict.localData);
      const remoteTime = extractTimestamp(conflict.remoteData);
      return {
        policy: "newest_wins",
        resolvedAt: now,
        resolution: remoteTime >= localTime ? "remote" : "local",
      };
    }

    case "oldest_wins": {
      const localTime = extractTimestamp(conflict.localData);
      const remoteTime = extractTimestamp(conflict.remoteData);
      return {
        policy: "oldest_wins",
        resolvedAt: now,
        resolution: remoteTime <= localTime ? "remote" : "local",
      };
    }

    case "merge_fields": {
      const mergedData = { ...conflict.localData, ...conflict.remoteData };
      return {
        policy: "merge_fields",
        resolvedAt: now,
        resolution: "merged",
        mergedData,
      };
    }

    case "manual_review":
      return { policy: "manual_review", resolvedAt: now, resolution: "skipped" };

    case "business_rule":
      return resolveByBusinessRule(conflict);

    default:
      return { policy: "destination_wins", resolvedAt: now, resolution: "local" };
  }
}

function resolveByBusinessRule(conflict: ConflictRecord): ConflictResolution {
  const now = new Date();

  if (conflict.remoteVersion > conflict.localVersion) {
    return { policy: "business_rule", resolvedAt: now, resolution: "remote" };
  }

  const localUpdatedAt = extractTimestamp(conflict.localData);
  const remoteUpdatedAt = extractTimestamp(conflict.remoteData);
  if (remoteUpdatedAt > localUpdatedAt) {
    return { policy: "business_rule", resolvedAt: now, resolution: "remote" };
  }

  return { policy: "business_rule", resolvedAt: now, resolution: "local" };
}

function extractTimestamp(data: Record<string, unknown>): number {
  const ts = data.updatedAt ?? data.updated_at ?? data.modifiedAt ?? data.timestamp ?? data.date;
  if (!ts) return 0;
  return new Date(ts as string | Date).getTime();
}
