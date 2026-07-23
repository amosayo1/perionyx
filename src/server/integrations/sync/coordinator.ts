import type { ConnectionConfig, SyncJob, SyncResult } from "@/server/integrations/types";
import type { IntegrationProvider } from "@/server/integrations/integration-provider";
import { createSession, updateSession, updateSessionStatus, getSession } from "./session";
import { getSyncState, advanceCursor, markFullSyncComplete, resetSyncState } from "./state";
import { advanceCheckpoint, markBatchProcessed, markItemsFailed, markItemsSkipped, setTotalItems, snapshotSession, clearCheckpoints } from "./checkpoint-manager";
import { clearRecoveryState } from "./checkpoint";
import { recordSyncOperation, recordBatchCompleted, initializeSessionMetrics } from "./metrics";
import { detectChanges } from "./change-detector";
import { detectVersionConflicts } from "./conflict-detector";
import { resolveConflicts } from "./conflict-resolver";
import { BatchProcessorService, type BatchItem, type BatchResult } from "./batch-processor";
import { executeWithRetry, syncRetryPolicy } from "./retry-orchestrator";
import { attemptRecovery, canRecover } from "./recovery";
import { logSyncEvent, emitSyncDomainEvent, recordSyncMetrics } from "./observability";
import { validateTenantIsolation, validateSyncOptions } from "./security";
import { isDuplicate, createIdempotencyKey, registerOperation, completeOperation, failOperation, getPreviousResult } from "./idempotency";
import { validateModeOptions, defaultOptionsForMode } from "./modes";
import type { SyncOptions, SyncMode, SyncDirection, SyncSession, Checkpoint } from "./types";
import { createInitialCheckpoint } from "./types";

export interface SyncRequest {
  connection: ConnectionConfig;
  provider: IntegrationProvider;
  mode: SyncMode;
  direction: SyncDirection;
  options?: Partial<SyncOptions>;
  companyId: string;
  scope?: { entityTypes?: string[] };
}

export class SyncCoordinator {
  private batchProcessor = new BatchProcessorService();

  async executeSync(request: SyncRequest): Promise<SyncResult> {
    const mergedOptions: SyncOptions = {
      ...defaultOptionsForMode(request.mode),
      ...request.options,
      mode: request.mode,
      direction: request.direction,
    };

    const modeError = validateModeOptions(request.mode, mergedOptions);
    if (modeError) {
      return { success: false, itemsSynced: 0, itemsFailed: 0, errors: [modeError], duration: 0, hasMore: false };
    }

    const optErrors = validateSyncOptions(mergedOptions);
    if (optErrors.length > 0) {
      return { success: false, itemsSynced: 0, itemsFailed: 0, errors: optErrors, duration: 0, hasMore: false };
    }

    if (!validateTenantIsolation(
      { id: "", connectionId: request.connection.id, providerId: request.provider.config.id, companyId: request.companyId, mode: request.mode, direction: request.direction, status: "pending", options: mergedOptions, checkpoint: createInitialCheckpoint(), metrics: { recordsSynced: 0, recordsFailed: 0, recordsSkipped: 0, recordsCreated: 0, recordsUpdated: 0, recordsDeleted: 0, conflictsDetected: 0, conflictsResolved: 0, retries: 0, batchesCompleted: 0, durationMs: 0, throughput: 0, averageBatchTimeMs: 0, peakMemoryMb: 0, checkpointCount: 0, recoveryCount: 0 }, startedAt: new Date(), updatedAt: new Date() },
      request.companyId,
    )) {
      return { success: false, itemsSynced: 0, itemsFailed: 0, errors: ["Tenant isolation check failed"], duration: 0, hasMore: false };
    }

    const idempotencyKey = mergedOptions.idempotencyKey ?? createIdempotencyKey(request.connection.id, request.mode);

    if (isDuplicate(idempotencyKey)) {
      const previous = getPreviousResult(idempotencyKey);
      if (previous) return previous;
      return { success: false, itemsSynced: 0, itemsFailed: 0, errors: ["Duplicate sync detected"], duration: 0, hasMore: false };
    }

    const session = createSession({
      connectionId: request.connection.id,
      providerId: request.provider.config.id,
      companyId: request.companyId,
      mode: request.mode,
      direction: request.direction,
      options: mergedOptions,
    });

    registerOperation(idempotencyKey, mergedOptions as unknown as Record<string, unknown>);
    initializeSessionMetrics(session.id);

    logSyncEvent("info", session, "Starting sync");
    emitSyncDomainEvent("integration.sync.started", session);

    updateSessionStatus(session.id, "running");
    const startTime = Date.now();

    try {
      if (request.mode === "recovery") {
        const recovery = await attemptRecovery(session.id);
        if (!recovery.recovered) {
          throw new Error("Recovery failed");
        }
      }

      if (request.mode === "full" || request.mode === "recovery") {
        const remoteState = await this.performFullSync(session, request.connection, request.provider, mergedOptions);

        const result: SyncResult = {
          success: remoteState.failed === 0,
          itemsSynced: remoteState.processed,
          itemsFailed: remoteState.failed,
          errors: remoteState.failed > 0 ? [`${remoteState.failed} items failed`] : [],
          duration: Date.now() - startTime,
          hasMore: false,
        };

        updateSessionStatus(session.id, result.success ? "completed" : "failed", result.errors[0]);
        completeOperation(idempotencyKey, result);
        logSyncEvent(result.success ? "info" : "warn", session, "Full sync completed");
        emitSyncDomainEvent(result.success ? "integration.sync.completed" : "integration.sync.failed", session);
        recordSyncMetrics(session);

        return result;
      }

      if (request.mode === "incremental" || request.mode === "delta") {
        const remoteState = await this.performIncrementalSync(session, request.connection, request.provider, mergedOptions);

        const result: SyncResult = {
          success: remoteState.failed === 0,
          itemsSynced: remoteState.processed,
          itemsFailed: remoteState.failed,
          errors: remoteState.failed > 0 ? [`${remoteState.failed} items failed`] : [],
          duration: Date.now() - startTime,
          hasMore: remoteState.hasMore,
          cursor: remoteState.nextCursor ?? undefined,
          warnings: remoteState.skipped > 0 ? [`${remoteState.skipped} items skipped`] : undefined,
        };

        if (result.success) {
          advanceCursor(request.connection.id, result.cursor ?? "");
        }

        updateSessionStatus(session.id, result.success ? "completed" : "failed", result.errors[0]);
        completeOperation(idempotencyKey, result);
        logSyncEvent(result.success ? "info" : "warn", session, "Incremental sync completed");
        emitSyncDomainEvent(result.success ? "integration.sync.completed" : "integration.sync.failed", session);
        recordSyncMetrics(session);

        return result;
      }

      throw new Error(`Unsupported sync mode: ${request.mode}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      updateSessionStatus(session.id, "failed", errorMsg);
      failOperation(idempotencyKey);
      logSyncEvent("error", session, `Sync failed: ${errorMsg}`);
      emitSyncDomainEvent("integration.sync.failed", session, { error: errorMsg });
      recordSyncMetrics(session);

      return {
        success: false,
        itemsSynced: session.metrics.recordsSynced,
        itemsFailed: session.metrics.recordsFailed,
        errors: [errorMsg],
        duration: Date.now() - startTime,
        hasMore: true,
      };
    }
  }

  private async performFullSync(
    session: SyncSession,
    connection: ConnectionConfig,
    provider: IntegrationProvider,
    options: SyncOptions,
  ): Promise<{ processed: number; failed: number; skipped: number }> {
    const remoteItems = await this.fetchAllRemoteItems(connection, provider, options);
    const checkpoint = session.checkpoint;
    setTotalItems(session.id, remoteItems.length);

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    const batches = this.chunkArray(remoteItems, options.batchSize ?? 100);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchStart = Date.now();

      const changeDetectArgs = {
        connectionId: connection.id,
        entityType: "all",
        remoteItems: batch.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? crypto.randomUUID()),
          updatedAt: String((item as { updatedAt?: string }).updatedAt ?? new Date().toISOString()),
        })),
        config: { method: "timestamp" as const },
      };

      const changes = detectChanges(changeDetectArgs);
      const changeItems = batch.filter((item: Record<string, unknown>) =>
        changes.newIds.includes(String(item.id)) || changes.changedIds.includes(String(item.id)),
      );

      for (const _item of changeItems) {
        recordSyncOperation(session.id, "created");
        processed++;
      }

      skipped += batch.length - changeItems.length;

      markBatchProcessed(session.id, batch.length, Date.now() - batchStart, i < batches.length - 1);
      recordBatchCompleted(session.id, Date.now() - batchStart);
    }

    markFullSyncComplete(connection.id);
    snapshotSession(session.id, { type: "full_sync_complete", totalProcessed: processed });

    return { processed, failed, skipped };
  }

  private async performIncrementalSync(
    session: SyncSession,
    connection: ConnectionConfig,
    provider: IntegrationProvider,
    options: SyncOptions,
  ): Promise<{ processed: number; failed: number; skipped: number; hasMore: boolean; nextCursor?: string | null }> {
    const syncState = getSyncState(connection.id);

    const remoteItems = await this.fetchChangedItems(connection, provider, syncState.lastCursor ?? undefined, options);
    const checkpoint = session.checkpoint;
    setTotalItems(session.id, remoteItems.length);

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    const batches = this.chunkArray(remoteItems, options.batchSize ?? 100);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchStart = Date.now();

      const changes = detectChanges({
        connectionId: connection.id,
        entityType: "all",
        remoteItems: batch.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? crypto.randomUUID()),
          updatedAt: String((item as { updatedAt?: string }).updatedAt ?? new Date().toISOString()),
        })),
        config: { method: "timestamp" },
      });

      const changeItems = batch.filter((item: Record<string, unknown>) =>
        changes.newIds.includes(String(item.id)) || changes.changedIds.includes(String(item.id)),
      );

      for (const _item of changeItems) {
        recordSyncOperation(session.id, "created");
        processed++;
      }

      skipped += batch.length - changeItems.length;

      markBatchProcessed(session.id, batch.length, Date.now() - batchStart, i < batches.length - 1);
      recordBatchCompleted(session.id, Date.now() - batchStart);
    }

    snapshotSession(session.id, { type: "incremental_sync_complete", totalProcessed: processed });

    return { processed, failed, skipped, hasMore: false };
  }

  private async fetchAllRemoteItems(
    _connection: ConnectionConfig,
    provider: IntegrationProvider,
    _options: SyncOptions,
  ): Promise<Record<string, unknown>[]> {
    const capabilities = await provider.getCapabilities();
    const methods = capabilities.methods ?? [];
    const items: Record<string, unknown>[] = [];

    for (const method of methods) {
      try {
        const conn = _connection;
        const result = await ((provider as unknown as Record<string, unknown>)[method] as (conn: ConnectionConfig) => Promise<unknown>)?.(conn);
        if (Array.isArray(result)) {
          items.push(...result);
        }
      } catch {
        // skip unavailable methods
      }
    }

    return items;
  }

  private async fetchChangedItems(
    _connection: ConnectionConfig,
    _provider: IntegrationProvider,
    _cursor?: string,
    _options?: SyncOptions,
  ): Promise<Record<string, unknown>[]> {
    return [];
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
}
