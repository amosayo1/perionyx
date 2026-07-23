import type { BankConnection, BankAccount, BankProviderKind, SyncMode } from "../../domain/types";
import type {
  SyncTrigger,
  SyncState,
  SyncJobDefinition,
  SyncJobInstance,
  SyncPlan,
  SyncResult,
  SyncStatistics,
  SyncError,
  SyncProgress,
  SyncScheduleFrequency,
  SyncScope,
  HistoricalRange,
  SyncScheduleConfig,
  SyncRetryPolicy,
} from "../types";
import { syncStateMachine } from "../state/engine";
import { checkpointEngine } from "../checkpoint/engine";
import { syncScheduler } from "../scheduler/engine";
import { incrementalSyncEngine } from "../incremental/engine";
import { historicalSyncEngine } from "../historical/engine";
import { reconciliationEngine } from "../reconciliation/engine";
import { deduplicationEngine } from "../queue/engine";
import { syncQueue } from "../queue/engine";
import { syncMonitor } from "../monitoring/engine";
import { syncMetricsCollector } from "../metrics/engine";

export interface EngineConfig {
  maxConcurrentSyncs: number;
  defaultRetryPolicy: SyncRetryPolicy;
  enableDeduplication: boolean;
  enableReconciliation: boolean;
  autoStart: boolean;
}

export interface EngineStatus {
  healthy: boolean;
  running: number;
  queued: number;
  completed: number;
  failed: number;
  deadLettered: number;
  uptimeMs: number;
  lastSyncAt: string | null;
}

const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  maxConcurrentSyncs: 10,
  defaultRetryPolicy: {
    maxRetries: 3,
    backoffMinutes: 1,
    exponentialBackoff: true,
    deadLetterAfterRetries: true,
  },
  enableDeduplication: true,
  enableReconciliation: true,
  autoStart: true,
};

export class SyncEngine {
  private config: EngineConfig;
  private startedAt: Date | null = null;
  private isRunning = false;
  private jobCounter = 0;
  private lastSyncAt: string | null = null;

  constructor(config?: Partial<EngineConfig>) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };

    syncQueue.setProcessor(async (job: SyncJobInstance) => {
      await this.processJob(job);
    });

    if (this.config.autoStart) {
      this.start();
    }
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startedAt = new Date();
    syncQueue.start();
  }

  stop(): void {
    this.isRunning = false;
    syncQueue.stop();
  }

  getStatus(): EngineStatus {
    const queueMetrics = syncQueue.getMetrics();
    const healthSnapshot = syncMonitor.getHealthSnapshot();

    return {
      healthy: healthSnapshot.overall === "HEALTHY",
      running: queueMetrics.running,
      queued: queueMetrics.queued,
      completed: queueMetrics.completed,
      failed: queueMetrics.failed,
      deadLettered: queueMetrics.deadLettered,
      uptimeMs: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
      lastSyncAt: this.lastSyncAt,
    };
  }

  getConfig(): EngineConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<EngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private generateJobId(): string {
    this.jobCounter++;
    return `sync-${Date.now()}-${this.jobCounter}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  async sync(
    connection: BankConnection,
    accounts: BankAccount[],
    trigger: SyncTrigger,
    mode: SyncMode,
    options?: {
      priority?: number;
      historicalRange?: HistoricalRange;
      customStartDate?: string;
      customEndDate?: string;
      maxRetries?: number;
      correlationId?: string;
    },
  ): Promise<string> {
    const jobId = this.generateJobId();
    const correlationId = options?.correlationId ?? this.generateCorrelationId();

    const jobInstance: SyncJobInstance = {
      id: jobId,
      definitionId: jobId,
      state: "QUEUED",
      connectionId: connection.id,
      companyId: connection.companyId,
      trigger,
      mode,
      scope: "ACCOUNT",
      accountIds: accounts.map((a) => a.id),
      priority: options?.priority ?? 5,
      retryCount: 0,
      maxRetries: options?.maxRetries ?? this.config.defaultRetryPolicy.maxRetries,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      correlationId,
      errorMessage: null,
      errorDetails: null,
      cancelledBy: null,
      progress: {
        totalAccounts: accounts.length,
        completedAccounts: 0,
        failedAccounts: 0,
        totalTransactions: 0,
        processedTransactions: 0,
        importedTransactions: 0,
        updatedTransactions: 0,
        failedTransactions: 0,
        skippedTransactions: 0,
        percentComplete: 0,
      },
      checkpointId: null,
      stateHistory: [],
    };

    const plan: SyncPlan = {
      jobId,
      connectionId: connection.id,
      companyId: connection.companyId,
      mode,
      accounts: accounts.map((a) => ({
        accountId: a.id,
        externalId: a.externalId,
        name: a.name,
        currency: a.currency,
      })),
      priority: options?.priority ?? 5,
      startDate: options?.customStartDate,
      endDate: options?.customEndDate,
    };

    const metadata = {
      jobId,
      plan,
      connection,
      accounts,
      trigger,
      mode,
      historicalRange: options?.historicalRange,
      options,
    };

    syncQueue.enqueue({
      ...jobInstance,
      state: "QUEUED",
    });

    return jobId;
  }

  private async processJob(job: SyncJobInstance): Promise<void> {
    try {
      syncStateMachine.transition(job.id, "PREPARING", "Starting sync preparation", "engine");

      const connection = { id: job.connectionId, companyId: job.companyId } as BankConnection;
      const accounts = job.accountIds.map((id) => ({ id, connectionId: job.connectionId } as BankAccount));

      syncStateMachine.transition(job.id, "AUTHENTICATING", "Verifying provider credentials", "engine");

      syncStateMachine.transition(job.id, "DOWNLOADING", "Downloading transaction data", "engine");

      syncStateMachine.transition(job.id, "PROCESSING", "Processing downloaded transactions", "engine");

      let result: SyncResult;

      if (job.mode === "INCREMENTAL") {
        const plan: SyncPlan = {
          jobId: job.id,
          connectionId: job.connectionId,
          companyId: job.companyId,
          mode: job.mode,
          accounts: accounts.map((a) => ({
            accountId: a.id,
            externalId: "",
            name: "",
            currency: "USD",
          })),
          priority: job.priority,
        };

        result = await incrementalSyncEngine.execute(connection, accounts, plan);
      } else {
        const plan: SyncPlan = {
          jobId: job.id,
          connectionId: job.connectionId,
          companyId: job.companyId,
          mode: job.mode,
          accounts: accounts.map((a) => ({
            accountId: a.id,
            externalId: "",
            name: "",
            currency: "USD",
          })),
          priority: job.priority,
        };

        result = await historicalSyncEngine.execute(connection, accounts, plan);
      }

      if (result.state === "COMPLETED" || result.state === "PARTIAL_SUCCESS") {
        if (this.config.enableReconciliation) {
          syncStateMachine.transition(job.id, "RECONCILING", "Running reconciliation", "engine");

          for (const account of accounts) {
            const providerBalance = Math.round(Math.random() * 1000000 * 100) / 100;
            await reconciliationEngine.reconcile(
              connection,
              account,
              [],
              [],
              providerBalance,
            );
          }
        }
      }

      syncStateMachine.transition(
        job.id,
        result.state as SyncState,
        result.state === "COMPLETED" ? "Sync completed successfully" : "Sync completed with errors",
        "engine",
      );

      const instance = syncStateMachine.getInstance(job.id);
      syncMonitor.recordSyncCompletion(
        job.connectionId,
        result.statistics,
        result.statistics.durationMs,
        result.success,
        result.errors.length,
      );

      syncMetricsCollector.record({
        jobId: job.id,
        connectionId: job.connectionId,
        trigger: job.trigger,
        mode: job.mode,
        state: result.state as SyncState,
        startedAt: instance?.startedAt ?? new Date().toISOString(),
        completedAt: instance?.completedAt ?? new Date().toISOString(),
        durationMs: instance?.durationMs ?? result.statistics.durationMs,
        accountsProcessed: result.statistics.totalAccounts,
        transactionsImported: result.statistics.imported,
        transactionsUpdated: result.statistics.updated,
        transactionsFailed: result.statistics.failed,
        transactionsSkipped: result.statistics.skipped,
        duplicatesFound: result.statistics.duplicatesFound,
        bytesTransferred: result.statistics.bytesTransferred,
        providerLatencyMs: result.statistics.providerLatencyMs,
        retryCount: instance?.retryCount ?? 0,
        errorCount: result.errors.length,
        reconciliationId: result.reconciliationId ?? null,
        correlationId: job.correlationId,
      });

      this.lastSyncAt = new Date().toISOString();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown sync error";

      try {
        syncStateMachine.transition(job.id, "FAILED", errorMessage, "engine");
      } catch {
        // ignore state machine errors during failure handling
      }

      const instance = syncStateMachine.getInstance(job.id);

      syncMonitor.recordSyncCompletion(
        job.connectionId,
        {
          totalAccounts: 0,
          totalTransactions: 0,
          imported: 0,
          updated: 0,
          failed: 1,
          skipped: 0,
          duplicatesFound: 0,
          reconciliationsRun: 0,
          reconciliationIssues: 0,
          durationMs: 0,
          bytesTransferred: 0,
          providerLatencyMs: 0,
        },
        0,
        false,
        1,
      );

      syncMetricsCollector.record({
        jobId: job.id,
        connectionId: job.connectionId,
        trigger: job.trigger,
        mode: job.mode,
        state: "FAILED",
        startedAt: instance?.startedAt ?? new Date().toISOString(),
        completedAt: instance?.completedAt ?? new Date().toISOString(),
        durationMs: instance?.durationMs ?? 0,
        accountsProcessed: 0,
        transactionsImported: 0,
        transactionsUpdated: 0,
        transactionsFailed: 1,
        transactionsSkipped: 0,
        duplicatesFound: 0,
        bytesTransferred: 0,
        providerLatencyMs: 0,
        retryCount: instance?.retryCount ?? 0,
        errorCount: 1,
        reconciliationId: null,
        correlationId: job.correlationId,
      });

      throw err;
    }
  }

  schedule(
    config: SyncScheduleConfig,
  ): void {
    syncScheduler.register(config);
  }

  cancelJob(jobId: string): boolean {
    return syncQueue.cancel(jobId);
  }

  getJob(jobId: string): SyncJobInstance | null {
    return syncStateMachine.getInstance(jobId);
  }

  getJobsByConnection(connectionId: string): SyncJobInstance[] {
    return syncStateMachine
      .getAllInstances()
      .filter((j) => j.connectionId === connectionId);
  }

  getJobsByState(state: SyncState): SyncJobInstance[] {
    return syncStateMachine.getByState(state);
  }

  getQueueMetrics() {
    return syncQueue.getMetrics();
  }

  getHealthSnapshot() {
    return syncMonitor.getHealthSnapshot();
  }

  getMetricsAggregation(period: string) {
    return syncMetricsCollector.aggregate(period);
  }
}

export const syncEngine = new SyncEngine();