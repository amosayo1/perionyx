import type { SyncMode, SyncDirection, SyncOptions } from "./types";

export const SYNC_MODE_LABELS: Record<SyncMode, string> = {
  full: "Full Synchronization",
  incremental: "Incremental Synchronization",
  delta: "Delta Synchronization",
  one_way: "One-way Synchronization",
  bidirectional: "Bidirectional Synchronization",
  realtime: "Real-time Synchronization",
  scheduled: "Scheduled Synchronization",
  manual: "Manual Synchronization",
  recovery: "Recovery Synchronization",
};

export function isFullSyncMode(mode: SyncMode): boolean {
  return mode === "full" || mode === "recovery";
}

export function isIncrementalMode(mode: SyncMode): boolean {
  return mode === "incremental" || mode === "delta" || mode === "realtime";
}

export function requiresBidirectional(mode: SyncMode): boolean {
  return mode === "bidirectional";
}

export function requiresRemoteSource(mode: SyncMode): boolean {
  return mode !== "manual";
}

export function validateModeOptions(mode: SyncMode, options: SyncOptions): string | null {
  if (mode === "bidirectional" && options.direction !== "bidirectional") {
    return "Bidirectional sync requires bidirectional direction";
  }
  if (mode === "realtime" && !options.scope) {
    return "Real-time sync requires a scope configuration";
  }
  if (mode === "recovery" && !options.idempotencyKey) {
    return "Recovery sync requires an idempotency key";
  }
  return null;
}

export function inferDirection(mode: SyncMode): SyncDirection {
  switch (mode) {
    case "bidirectional": return "bidirectional";
    default: return "import";
  }
}

export function defaultOptionsForMode(mode: SyncMode): Partial<SyncOptions> {
  switch (mode) {
    case "full":
      return { batchSize: 500, concurrency: 2, conflictPolicy: "destination_wins" };
    case "incremental":
      return { batchSize: 200, concurrency: 4, conflictPolicy: "newest_wins" };
    case "delta":
      return { batchSize: 1000, concurrency: 6, conflictPolicy: "newest_wins" };
    case "realtime":
      return { batchSize: 50, concurrency: 1, conflictPolicy: "source_wins" };
    case "recovery":
      return { batchSize: 100, concurrency: 1, conflictPolicy: "destination_wins" };
    default:
      return { batchSize: 100, concurrency: 2, conflictPolicy: "newest_wins" };
  }
}
