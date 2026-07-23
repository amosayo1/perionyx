import type { ConnectionConfig } from "@/server/integrations/types";
import type { IntegrationProvider } from "@/server/integrations/integration-provider";
import type { BatchConfig, Checkpoint } from "./types";
import { createDefaultBatchConfig } from "./types";
import { markBatchProcessed, markItemsFailed, markItemsSkipped } from "./checkpoint-manager";
import { recordBatchCompleted, recordSyncOperation } from "./metrics";

export interface BatchItem {
  id: string;
  data: Record<string, unknown>;
  hash?: string;
}

export interface BatchResult {
  processed: number;
  failed: number;
  skipped: number;
  created: number;
  updated: number;
  deleted: number;
  durationMs: number;
  hasMore: boolean;
  nextCursor?: string | null;
}

export type BatchProcessor = (
  items: BatchItem[],
  connection: ConnectionConfig,
  provider: IntegrationProvider,
) => Promise<BatchResult>;

export class BatchProcessorService {
  private config: BatchConfig;

  constructor(config?: Partial<BatchConfig>) {
    this.config = { ...createDefaultBatchConfig(), ...config };
  }

  updateConfig(config: Partial<BatchConfig>): void {
    Object.assign(this.config, config);
  }

  getConfig(): BatchConfig {
    return { ...this.config };
  }

  async processBatches(
    sessionId: string,
    connection: ConnectionConfig,
    provider: IntegrationProvider,
    fetchBatch: (config: BatchConfig, checkpoint: Checkpoint) => Promise<{ items: BatchItem[]; total?: number }>,
    processor: BatchProcessor,
    checkpoint: Checkpoint,
    onProgress?: (processed: number, total: number) => void,
  ): Promise<BatchResult> {
    const startTime = Date.now();
    let totalProcessed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalDeleted = 0;
    let hasMore = true;
    let nextCursor: string | null = null;
    let adaptiveConfig = { ...this.config };

    while (hasMore) {
      const batchStart = Date.now();
      const { items, total } = await fetchBatch(adaptiveConfig, checkpoint);

      if (total !== undefined && checkpoint.totalItems === 0) {
        const { setTotalItems } = await import("./checkpoint-manager");
        setTotalItems(sessionId, total);
      }

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      const result = await processor(items, connection, provider);

      totalProcessed += result.processed;
      totalFailed += result.failed;
      totalSkipped += result.skipped;
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalDeleted += result.deleted;

      for (let i = 0; i < result.processed; i++) {
        recordSyncOperation(sessionId, "created");
      }
      for (let i = 0; i < result.failed; i++) {
        recordSyncOperation(sessionId, "failed");
      }

      const batchDuration = Date.now() - batchStart;
      recordBatchCompleted(sessionId, batchDuration);

      markBatchProcessed(sessionId, items.length, batchDuration, result.hasMore, result.nextCursor);
      nextCursor = result.nextCursor ?? null;
      hasMore = result.hasMore;

      if (this.config.adaptiveEnabled) {
        adaptiveConfig = adaptBatchSize(adaptiveConfig, batchDuration, items.length);
      }

      if (onProgress) {
        onProgress(totalProcessed, checkpoint.totalItems || totalProcessed);
      }

      if (hasMore && items.length === 0) {
        hasMore = false;
      }
    }

    return {
      processed: totalProcessed,
      failed: totalFailed,
      skipped: totalSkipped,
      created: totalCreated,
      updated: totalUpdated,
      deleted: totalDeleted,
      durationMs: Date.now() - startTime,
      hasMore: false,
      nextCursor,
    };
  }

  async processParallel(
    sessionId: string,
    connection: ConnectionConfig,
    provider: IntegrationProvider,
    batches: Array<{ items: BatchItem[] }>,
    processor: BatchProcessor,
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const concurrency = this.config.concurrency;
    const results: BatchResult[] = [];

    for (let i = 0; i < batches.length; i += concurrency) {
      const chunk = batches.slice(i, i + concurrency);
      const chunkResults = await Promise.all(
        chunk.map((batch) => processor(batch.items, connection, provider)),
      );
      results.push(...chunkResults);
    }

    return {
      processed: results.reduce((s, r) => s + r.processed, 0),
      failed: results.reduce((s, r) => s + r.failed, 0),
      skipped: results.reduce((s, r) => s + r.skipped, 0),
      created: results.reduce((s, r) => s + r.created, 0),
      updated: results.reduce((s, r) => s + r.updated, 0),
      deleted: results.reduce((s, r) => s + r.deleted, 0),
      durationMs: Date.now() - startTime,
      hasMore: false,
    };
  }
}

function adaptBatchSize(
  config: BatchConfig,
  durationMs: number,
  itemsProcessed: number,
): BatchConfig {
  const targetTimePerBatch = 5000;
  const adjusted = Math.round(config.targetBatchSize * (targetTimePerBatch / Math.max(durationMs, 1)));

  return {
    ...config,
    targetBatchSize: Math.max(config.minBatchSize, Math.min(config.maxBatchSize, adjusted)),
  };
}
