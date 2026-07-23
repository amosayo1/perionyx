import type { BankConnection, BankAccount, BankTransaction } from "../../domain/types";
import type { SyncPlan, SyncResult, SyncStatistics, SyncError } from "../types";
import { checkpointEngine } from "../checkpoint/engine";

export interface IncrementalSyncConfig {
  maxBatchSize: number;
  pageSize: number;
  maxConsecutiveErrors: number;
}

const DEFAULT_CONFIG: IncrementalSyncConfig = {
  maxBatchSize: 500,
  pageSize: 100,
  maxConsecutiveErrors: 3,
};

export class IncrementalSyncEngine {
  private config: IncrementalSyncConfig;

  constructor(config?: Partial<IncrementalSyncConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute(
    connection: BankConnection,
    accounts: BankAccount[],
    plan: SyncPlan,
  ): Promise<SyncResult> {
    const startedAt = Date.now();
    const errors: SyncError[] = [];
    let hasMore = false;
    let checkpointId: string | null = null;

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

    for (const account of accounts) {
      checkpointEngine.getOrCreateCheckpoint(connection.id, account.id);

      const isStale = checkpointEngine.isStale(connection.id, account.id);
      if (!isStale) {
        continue;
      }

      const checkpoint = checkpointEngine.getCheckpoint(connection.id, account.id);
      const currentCursor = checkpoint?.cursor ?? null;
      let pageErrors = 0;

      let page = 0;
      let hasNextPage = true;

      while (hasNextPage && pageErrors < this.config.maxConsecutiveErrors) {
        const pageResult = await this.fetchPage(
          connection,
          account,
          currentCursor,
          page,
        );

        statistics.providerLatencyMs += pageResult.latencyMs;
        statistics.imported += pageResult.imported;
        statistics.updated += pageResult.updated;
        statistics.failed += pageResult.failed;
        statistics.skipped += pageResult.skipped;
        statistics.totalTransactions += pageResult.total;

        if (pageResult.error) {
          pageErrors++;
          errors.push({
            code: "INCREMENTAL_PAGE_ERROR",
            message: pageResult.error,
            accountId: account.id,
            retryable: true,
            timestamp: new Date().toISOString(),
          });
        } else {
          pageErrors = 0;
        }

        hasNextPage = pageResult.hasMore;
        page++;

        checkpointEngine.updateCheckpoint(connection.id, account.id, {
          cursor: pageResult.nextCursor ?? currentCursor,
        });
      }

      if (pageErrors >= this.config.maxConsecutiveErrors) {
        checkpointEngine.markSyncFailure(connection.id, account.id, "Max consecutive page errors");
        errors.push({
          code: "TOO_MANY_ERRORS",
          message: `Max consecutive page errors (${pageErrors}) for account ${account.id}`,
          accountId: account.id,
          retryable: false,
          timestamp: new Date().toISOString(),
        });
      } else if (hasNextPage) {
        hasMore = true;
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
      hasMore,
      completedAt: new Date().toISOString(),
    };
  }

  private async fetchPage(
    connection: BankConnection,
    account: BankAccount,
    cursor: string | null,
    page: number,
  ): Promise<{
    imported: number;
    updated: number;
    failed: number;
    skipped: number;
    total: number;
    hasMore: boolean;
    nextCursor: string | null;
    latencyMs: number;
    error: string | null;
  }> {
    const start = Date.now();
    const pageSize = this.config.pageSize;

    try {
      const result = await this.mockProviderFetch(
        connection,
        account,
        cursor,
        page,
        pageSize,
      );

      return {
        ...result,
        latencyMs: Date.now() - start,
        error: null,
      };
    } catch (err) {
      return {
        imported: 0,
        updated: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        hasMore: false,
        nextCursor: cursor,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Unknown fetch error",
      };
    }
  }

  private async mockProviderFetch(
    connection: BankConnection,
    account: BankAccount,
    cursor: string | null,
    page: number,
    pageSize: number,
  ): Promise<{
    imported: number;
    updated: number;
    failed: number;
    skipped: number;
    total: number;
    hasMore: boolean;
    nextCursor: string | null;
  }> {
    const mockCount = Math.min(50, pageSize);

    const hasMore = mockCount >= pageSize;
    const nextCursor = hasMore ? `cursor-${account.id}-${page + 1}` : null;

    return {
      imported: mockCount,
      updated: 0,
      failed: 0,
      skipped: 0,
      total: mockCount,
      hasMore,
      nextCursor,
    };
  }
}

export const incrementalSyncEngine = new IncrementalSyncEngine();