import type { BankConnection, BankAccount } from "../../domain/types";
import type { SyncPlan, SyncResult, SyncStatistics, SyncError, HistoricalRange } from "../types";
import { checkpointEngine } from "../checkpoint/engine";

export interface HistoricalSyncConfig {
  batchSize: number;
  maxConcurrentAccounts: number;
  defaultRange: HistoricalRange;
}

const DEFAULT_CONFIG: HistoricalSyncConfig = {
  batchSize: 250,
  maxConcurrentAccounts: 5,
  defaultRange: "LAST_90_DAYS",
};

const RANGE_DAYS: Record<HistoricalRange, number | null> = {
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
  LAST_180_DAYS: 180,
  LAST_YEAR: 365,
  ALL_AVAILABLE: null,
  CUSTOM_RANGE: null,
};

export class HistoricalSyncEngine {
  private config: HistoricalSyncConfig;

  constructor(config?: Partial<HistoricalSyncConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute(
    connection: BankConnection,
    accounts: BankAccount[],
    plan: SyncPlan,
    historicalRange?: HistoricalRange,
    customStartDate?: string,
    customEndDate?: string,
  ): Promise<SyncResult> {
    const startedAt = Date.now();
    const errors: SyncError[] = [];
    const range = historicalRange ?? this.config.defaultRange;

    const rangeDays = RANGE_DAYS[range];
    const startDate = customStartDate ?? (rangeDays !== null
      ? new Date(Date.now() - rangeDays * 86400000).toISOString()
      : "1970-01-01T00:00:00.000Z");
    const endDate = customEndDate ?? new Date().toISOString();

    const statistics: SyncStatistics = {
      totalAccounts: accounts.length,
      totalTransactions: 0,
      imported: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      duplicatesFound: 0,
      reconciliationsRun: 0,
      reconciliationIssues: 0,
      durationMs: 0,
      bytesTransferred: 0,
      providerLatencyMs: 0,
    };

    const batchSize = this.config.maxConcurrentAccounts;
    for (let i = 0; i < accounts.length; i += batchSize) {
      const batch = accounts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((account) =>
          this.syncAccountHistorical(connection, account, startDate, endDate, errors),
        ),
      );

      for (const result of batchResults) {
        statistics.imported += result.imported;
        statistics.updated += result.updated;
        statistics.failed += result.failed;
        statistics.skipped += result.skipped;
        statistics.duplicatesFound += result.duplicatesFound;
        statistics.totalTransactions += result.total;
      }
    }

    const durationMs = Date.now() - startedAt;
    statistics.durationMs = durationMs;

    const success = errors.filter((e) => !e.retryable).length === 0;

    return {
      jobId: plan.jobId,
      success,
      state:
        errors.length === 0
          ? "COMPLETED"
          : errors.some((e) => e.retryable)
            ? "PARTIAL_SUCCESS"
            : "FAILED",
      statistics,
      errors,
      hasMore: false,
      completedAt: new Date().toISOString(),
    };
  }

  private async syncAccountHistorical(
    connection: BankConnection,
    account: BankAccount,
    startDate: string,
    endDate: string,
    errors: SyncError[],
  ): Promise<{
    imported: number;
    updated: number;
    failed: number;
    skipped: number;
    duplicatesFound: number;
    total: number;
  }> {
    let imported = 0;
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    let duplicatesFound = 0;
    let total = 0;

    try {
      const checkpoint = checkpointEngine.getOrCreateCheckpoint(connection.id, account.id);

      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const pageResult = await this.mockHistoricalPage(
          connection,
          account,
          startDate,
          endDate,
          page,
        );

        total += pageResult.total;
        imported += pageResult.imported;
        updated += pageResult.updated;
        skipped += pageResult.skipped;

        const updatedCheckpoint = checkpointEngine.updateCheckpoint(connection.id, account.id, {
          cursor: pageResult.nextCursor,
          totalTransactionsSynced: (checkpoint.totalTransactionsSynced ?? 0) + pageResult.imported,
        });

        hasMore = pageResult.hasMore;
        page++;
      }

      checkpointEngine.markSyncSuccess(
        connection.id,
        account.id,
        null,
        null,
        null,
        null,
        0,
      );
    } catch (err) {
      failed += 1;
      checkpointEngine.markSyncFailure(
        connection.id,
        account.id,
        err instanceof Error ? err.message : "Unknown error",
      );
      errors.push({
        code: "HISTORICAL_SYNC_ERROR",
        message: err instanceof Error ? err.message : "Unknown historical sync error",
        accountId: account.id,
        retryable: true,
        timestamp: new Date().toISOString(),
      });
    }

    return { imported, updated, failed, skipped, duplicatesFound, total };
  }

  private async mockHistoricalPage(
    connection: BankConnection,
    account: BankAccount,
    startDate: string,
    endDate: string,
    page: number,
  ): Promise<{
    total: number;
    imported: number;
    updated: number;
    skipped: number;
    hasMore: boolean;
    nextCursor: string | null;
  }> {
    const mockCount = Math.min(200, this.config.batchSize);
    const hasMore = page < 3;
    const nextCursor = hasMore ? `hist-cursor-${account.id}-${page + 1}` : null;

    return {
      total: mockCount,
      imported: mockCount,
      updated: 0,
      skipped: 0,
      hasMore,
      nextCursor,
    };
  }
}

export const historicalSyncEngine = new HistoricalSyncEngine();