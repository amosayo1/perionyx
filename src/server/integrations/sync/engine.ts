import type { ConnectionConfig } from "@/server/integrations/types";
import type { IntegrationProvider } from "@/server/integrations/integration-provider";
import { getOrCreateProvider, destroyProvider } from "@/server/integrations/integration-factory";
import { integrationRegistry } from "@/server/integrations/integration-registry";
import { SyncCoordinator } from "./coordinator";
import { createSchedule, getSchedule, updateSchedule, deleteSchedule, getDueSchedules, getCompanySchedules, markScheduleRun } from "./scheduler";
import { getSession, getCompanySessions as getCompanySyncSessions, getConnectionSessions, cleanupSessions } from "./session";
import { getSyncState, resetSyncState as resetProviderSyncState } from "./state";
import { clearCheckpoints, clearRecoveryState, getLatestCheckpoint, getCheckpointHistory } from "./checkpoint";
import { getGlobalMetrics, resetGlobalMetrics } from "./metrics";
import { buildSummary } from "./result";
import { validateAllMockProviders } from "./mock-validation";
import { canRecover } from "./recovery";
import type { SyncSession, SyncSchedule, SyncMode, SyncDirection, SyncOptions, SyncSummary, Checkpoint } from "./types";

export class SynchronizationEngine {
  private coordinator = new SyncCoordinator();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  async destroy(): Promise<void> {
    this.initialized = false;
    clearAllSchedules();
  }

  async sync(connectionId: string, mode: SyncMode = "incremental", direction: SyncDirection = "import", options?: Partial<SyncOptions>): Promise<SyncSummary> {
    const connection = integrationRegistry.getConnection(connectionId);
    if (!connection) throw new Error(`Connection not found: ${connectionId}`);

    const providerConfig = integrationRegistry.getProvider(connection.providerId);
    if (!providerConfig) throw new Error(`Provider not found: ${connection.providerId}`);

    const provider = await getOrCreateProvider(providerConfig);

    const request = {
      connection,
      provider,
      mode,
      direction,
      options,
      companyId: connection.companyId,
    };

    const result = await this.coordinator.executeSync(request);
    const session = getLatestSession(connectionId);

    return {
      sessionId: session?.id ?? "",
      connectionId,
      providerId: connection.providerId,
      companyId: connection.companyId,
      mode,
      direction,
      status: result.success ? "completed" : "failed",
      metrics: {
        recordsSynced: result.itemsSynced,
        recordsFailed: result.itemsFailed,
        recordsSkipped: 0,
        recordsCreated: result.itemsSynced,
        recordsUpdated: 0,
        recordsDeleted: 0,
        conflictsDetected: 0,
        conflictsResolved: 0,
        retries: 0,
        batchesCompleted: 0,
        durationMs: result.duration,
        throughput: result.duration > 0 ? Math.round((result.itemsSynced / result.duration) * 1000) : 0,
        averageBatchTimeMs: 0,
        peakMemoryMb: 0,
        checkpointCount: 0,
        recoveryCount: 0,
      },
      startedAt: new Date(Date.now() - result.duration),
      completedAt: new Date(),
      durationMs: result.duration,
      error: result.errors[0],
    };
  }

  async fullSync(connectionId: string, options?: Partial<SyncOptions>): Promise<SyncSummary> {
    return this.sync(connectionId, "full", "import", options);
  }

  async incrementalSync(connectionId: string, options?: Partial<SyncOptions>): Promise<SyncSummary> {
    return this.sync(connectionId, "incremental", "import", options);
  }

  async deltaSync(connectionId: string, options?: Partial<SyncOptions>): Promise<SyncSummary> {
    return this.sync(connectionId, "delta", "import", options);
  }

  async bidirectionalSync(connectionId: string, options?: Partial<SyncOptions>): Promise<SyncSummary> {
    return this.sync(connectionId, "bidirectional", "bidirectional", options);
  }

  async recoverySync(connectionId: string, options?: Partial<SyncOptions>): Promise<SyncSummary> {
    return this.sync(connectionId, "recovery", "import", { ...options, idempotencyKey: `recovery-${connectionId}-${Date.now()}` });
  }

  getSession(sessionId: string): SyncSession | undefined {
    return getSession(sessionId);
  }

  getConnectionSessions(connectionId: string, limit = 20): SyncSession[] {
    return getConnectionSessions(connectionId, limit);
  }

  getCompanySessions(companyId: string, limit = 50): SyncSession[] {
    return getCompanySyncSessions(companyId, limit);
  }

  getCheckpoint(sessionId: string): Checkpoint | undefined {
    return getLatestCheckpoint(sessionId);
  }

  getCheckpointHistory(sessionId: string): Checkpoint[] {
    return getCheckpointHistory(sessionId);
  }

  getSyncState(connectionId: string): import("@/server/integrations/types").SyncState {
    return getSyncState(connectionId);
  }

  resetSyncState(connectionId: string): void {
    resetProviderSyncState(connectionId);
  }

  clearSessionCheckpoints(sessionId: string): void {
    clearCheckpoints(sessionId);
    clearRecoveryState(sessionId);
  }

  canRecover(sessionId: string): boolean {
    const session = getSession(sessionId);
    if (!session) return false;
    return canRecover(session);
  }

  createSchedule(
    connectionId: string,
    companyId: string,
    mode: SyncMode,
    direction: SyncDirection,
    options: SyncOptions,
    intervalMs?: number,
    cronExpression?: string,
  ): SyncSchedule {
    return createSchedule({ connectionId, companyId, mode, direction, options, intervalMs, cronExpression });
  }

  getSchedule(scheduleId: string): SyncSchedule | undefined {
    return getSchedule(scheduleId);
  }

  updateSchedule(scheduleId: string, updates: Partial<SyncSchedule>): SyncSchedule | undefined {
    return updateSchedule(scheduleId, updates);
  }

  deleteSchedule(scheduleId: string): void {
    deleteSchedule(scheduleId);
  }

  getCompanySchedules(companyId: string): SyncSchedule[] {
    return getCompanySchedules(companyId);
  }

  getDueSchedules(): SyncSchedule[] {
    return getDueSchedules();
  }

  getGlobalMetrics(): import("./types").SyncMetrics {
    return getGlobalMetrics();
  }

  resetGlobalMetrics(): void {
    resetGlobalMetrics();
  }

  cleanupSessions(olderThanMs = 86400000): number {
    return cleanupSessions(olderThanMs);
  }

  async validateMockProviders(): Promise<{ results: import("./mock-validation").MockValidationResult[]; allPassed: boolean; totalRecords: number }> {
    return validateAllMockProviders();
  }
}

function getLatestSession(connectionId: string): SyncSession | undefined {
  const sessions = getConnectionSessions(connectionId, 1);
  return sessions[0];
}

function clearAllSchedules(): void {
  const { clearAllSchedules: clear } = require("./scheduler");
  clear();
}

export const syncEngine = new SynchronizationEngine();
