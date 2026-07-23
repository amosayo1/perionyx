import type { ConnectionConfig, SyncState, SyncResult } from "@/server/integrations/types";

export type SyncMode =
  | "full"
  | "incremental"
  | "delta"
  | "one_way"
  | "bidirectional"
  | "realtime"
  | "scheduled"
  | "manual"
  | "recovery";

export type SyncStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "recovering";

export type SyncDirection = "import" | "export" | "bidirectional";

export type ConflictPolicy =
  | "source_wins"
  | "destination_wins"
  | "newest_wins"
  | "oldest_wins"
  | "merge_fields"
  | "manual_review"
  | "business_rule"
  | "custom";

export interface SyncOptions {
  mode: SyncMode;
  direction: SyncDirection;
  batchSize?: number;
  concurrency?: number;
  conflictPolicy?: ConflictPolicy;
  idempotencyKey?: string;
  checkpointInterval?: number;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  scope?: SyncScope;
  metadata?: Record<string, unknown>;
}

export interface SyncScope {
  entityTypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  ids?: string[];
  cursor?: string;
  limit?: number;
}

export interface SyncSession {
  id: string;
  connectionId: string;
  providerId: string;
  companyId: string;
  mode: SyncMode;
  direction: SyncDirection;
  status: SyncStatus;
  options: SyncOptions;
  checkpoint: Checkpoint;
  metrics: SyncMetrics;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
  correlationId?: string;
}

export interface Checkpoint {
  cursor: string | null;
  offset: number;
  page: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  skippedItems: number;
  lastTimestamp: string | null;
  lastId: string | null;
  batchCount: number;
  hasMore: boolean;
}

export function createInitialCheckpoint(): Checkpoint {
  return {
    cursor: null,
    offset: 0,
    page: 1,
    totalItems: 0,
    processedItems: 0,
    failedItems: 0,
    skippedItems: 0,
    lastTimestamp: null,
    lastId: null,
    batchCount: 0,
    hasMore: true,
  };
}

export interface SyncMetrics {
  recordsSynced: number;
  recordsFailed: number;
  recordsSkipped: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  conflictsDetected: number;
  conflictsResolved: number;
  retries: number;
  batchesCompleted: number;
  durationMs: number;
  throughput: number;
  averageBatchTimeMs: number;
  peakMemoryMb: number;
  checkpointCount: number;
  recoveryCount: number;
}

export function createInitialMetrics(): SyncMetrics {
  return {
    recordsSynced: 0,
    recordsFailed: 0,
    recordsSkipped: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsDeleted: 0,
    conflictsDetected: 0,
    conflictsResolved: 0,
    retries: 0,
    batchesCompleted: 0,
    durationMs: 0,
    throughput: 0,
    averageBatchTimeMs: 0,
    peakMemoryMb: 0,
    checkpointCount: 0,
    recoveryCount: 0,
  };
}

export interface SyncSummary {
  sessionId: string;
  connectionId: string;
  providerId: string;
  companyId: string;
  mode: SyncMode;
  direction: SyncDirection;
  status: SyncStatus;
  metrics: SyncMetrics;
  startedAt: Date;
  completedAt?: Date;
  durationMs: number;
  error?: string;
}

export interface SyncSnapshot {
  id: string;
  sessionId: string;
  timestamp: Date;
  checkpoint: Checkpoint;
  metrics: SyncMetrics;
  status: SyncStatus;
  data?: Record<string, unknown>;
}

export interface SyncContext {
  session: SyncSession;
  connection: ConnectionConfig;
  state: SyncState;
  provider: import("@/server/integrations/integration-provider").IntegrationProvider;
  signal: AbortSignal;
}

export interface ChangeDetection {
  changedIds: string[];
  deletedIds: string[];
  newIds: string[];
  unchangedHashes: string[];
  hasChanges: boolean;
  comparisonMethod: "timestamp" | "version" | "hash";
}

export interface ConflictRecord {
  id: string;
  sessionId: string;
  entityType: string;
  entityId: string;
  localVersion: string;
  remoteVersion: string;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  detectionMethod: string;
  policy: ConflictPolicy;
  resolution: ConflictResolution | null;
  createdAt: Date;
}

export interface ConflictResolution {
  policy: ConflictPolicy;
  resolvedAt: Date;
  resolution: "local" | "remote" | "merged" | "skipped";
  mergedData?: Record<string, unknown>;
}

export interface IdempotencyRecord {
  key: string;
  operationHash: string;
  status: "completed" | "in_progress" | "failed";
  result?: SyncResult;
  createdAt: Date;
  completedAt?: Date;
}

export interface BatchConfig {
  maxBatchSize: number;
  minBatchSize: number;
  targetBatchSize: number;
  concurrency: number;
  backpressureThreshold: number;
  streamingEnabled: boolean;
  adaptiveEnabled: boolean;
}

export function createDefaultBatchConfig(): BatchConfig {
  return {
    maxBatchSize: 1000,
    minBatchSize: 10,
    targetBatchSize: 100,
    concurrency: 4,
    backpressureThreshold: 10000,
    streamingEnabled: false,
    adaptiveEnabled: true,
  };
}

export interface RecoveryState {
  sessionId: string;
  lastCheckpoint: Checkpoint;
  failureCount: number;
  lastFailureAt: Date | null;
  lastFailureReason?: string;
  recoveredAt: Date | null;
  recoveryAttempts: number;
}

export interface SyncSchedule {
  id: string;
  connectionId: string;
  companyId: string;
  mode: SyncMode;
  direction: SyncDirection;
  cronExpression?: string;
  intervalMs?: number;
  priority: number;
  active: boolean;
  options: SyncOptions;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetryBudget {
  total: number;
  remaining: number;
  resetAt: Date;
  windowMs: number;
}
