import type { SyncJobInstance, SyncState, SyncTrigger, SyncMode, SyncScope, SyncProgress } from "../types";
import { syncStateMachine } from "../state/engine";

export interface QueueConfig {
  maxConcurrency: number;
  defaultPriority: number;
  backpressureThreshold: number;
  pollIntervalMs: number;
}

export interface QueueMetrics {
  queued: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  retrying: number;
  deadLettered: number;
  averageWaitTimeMs: number;
  averageProcessingTimeMs: number;
  throughputPerMinute: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrency: 10,
  defaultPriority: 5,
  backpressureThreshold: 100,
  pollIntervalMs: 1000,
};

export class SyncQueue {
  private config: QueueConfig;
  private pending: SyncJobInstance[] = [];
  private running = new Map<string, SyncJobInstance>();
  private deadLettered: SyncJobInstance[] = [];
  private completedCount = 0;
  private failedCount = 0;
  private cancelledCount = 0;
  private totalWaitTime = 0;
  private totalProcessingTime = 0;
  private processedCount = 0;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private processor: ((job: SyncJobInstance) => Promise<void>) | null = null;

  constructor(config?: Partial<QueueConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  enqueue(job: SyncJobInstance): void {
    if (this.pending.length >= this.config.backpressureThreshold) {
      throw new Error(`Queue backpressure threshold reached (${this.config.backpressureThreshold})`);
    }

    this.pending.push({ ...job, state: "QUEUED" });
    this.pending.sort((a, b) => b.priority - a.priority);
    syncStateMachine.registerInstance({ ...job, state: "QUEUED" });
  }

  enqueueBatch(jobs: SyncJobInstance[]): void {
    for (const job of jobs) {
      try {
        this.enqueue(job);
      } catch {
        this.deadLettered.push(job);
      }
    }
  }

  setProcessor(processor: (job: SyncJobInstance) => Promise<void>): void {
    this.processor = processor;
  }

  start(): void {
    if (this.pollTimer) return;

    this.pollTimer = setInterval(() => {
      this.poll().catch(() => {});
    }, this.config.pollIntervalMs);
  }

  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async poll(): Promise<void> {
    if (!this.processor) return;

    while (this.running.size < this.config.maxConcurrency && this.pending.length > 0) {
      const job = this.pending.shift()!;
      const waitTime = job.startedAt
        ? Date.now() - new Date(job.startedAt).getTime()
        : 0;

      const runningJob: SyncJobInstance = {
        ...job,
        state: "PREPARING",
        startedAt: new Date().toISOString(),
      };

      this.running.set(job.id, runningJob);
      this.totalWaitTime += waitTime;

      syncStateMachine.transition(job.id, "PREPARING", "Dequeued for processing", "queue");

      this.processor(runningJob)
        .then(() => this.handleCompletion(runningJob))
        .catch((err) => this.handleFailure(runningJob, err));
    }
  }

  private handleCompletion(job: SyncJobInstance): void {
    this.running.delete(job.id);
    this.completedCount++;
    this.processedCount++;
    this.totalProcessingTime += job.durationMs ?? 0;
  }

  private handleFailure(job: SyncJobInstance, error: Error): void {
    this.running.delete(job.id);
    this.failedCount++;

    const instance = syncStateMachine.getInstance(job.id);
    const maxRetries = instance?.maxRetries ?? 3;

    if ((instance?.retryCount ?? 0) < maxRetries) {
      const retryJob: SyncJobInstance = {
        ...job,
        state: "RETRYING",
        retryCount: (instance?.retryCount ?? 0) + 1,
        startedAt: null,
      };

      const backoff = Math.min(1000 * Math.pow(2, retryJob.retryCount), 300000);
      setTimeout(() => {
        this.enqueue(retryJob);
      }, backoff);

      this.running.delete(job.id);
      return;
    }

    this.deadLettered.push(job);
    this.processedCount++;
  }

  cancel(jobId: string): boolean {
    const pendingIndex = this.pending.findIndex((j) => j.id === jobId);
    if (pendingIndex >= 0) {
      this.pending.splice(pendingIndex, 1);
      this.cancelledCount++;
      syncStateMachine.transition(jobId, "CANCELLED", "Cancelled by user", "queue");
      return true;
    }

    const running = this.running.get(jobId);
    if (running) {
      this.running.delete(jobId);
      this.cancelledCount++;
      return true;
    }

    return false;
  }

  getPendingCount(): number {
    return this.pending.length;
  }

  getRunningCount(): number {
    return this.running.size;
  }

  getDeadLetterCount(): number {
    return this.deadLettered.length;
  }

  getMetrics(): QueueMetrics {
    const averageWaitTimeMs = this.processedCount > 0
      ? Math.round(this.totalWaitTime / this.processedCount)
      : 0;
    const averageProcessingTimeMs = this.processedCount > 0
      ? Math.round(this.totalProcessingTime / this.processedCount)
      : 0;

    return {
      queued: this.pending.length,
      running: this.running.size,
      completed: this.completedCount,
      failed: this.failedCount,
      cancelled: this.cancelledCount,
      retrying: syncStateMachine.getByState("RETRYING").length,
      deadLettered: this.deadLettered.length,
      averageWaitTimeMs,
      averageProcessingTimeMs,
      throughputPerMinute: this.completedCount > 0
        ? Math.round(this.completedCount / (this.totalProcessingTime / 60000))
        : 0,
    };
  }

  isBackpressureActive(): boolean {
    return this.pending.length >= this.config.backpressureThreshold;
  }
}

export const syncQueue = new SyncQueue();

export interface DedupConfig {
  enabled: boolean;
  ttlDays: number;
  strictMode: boolean;
}

export interface DedupKey {
  providerTransactionId: string;
  amount: number;
  currency: string;
  bookingDate: string;
  accountId: string;
  referenceNumber: string;
  hash: string;
}

export interface DedupResult {
  isDuplicate: boolean;
  matchedField: string | null;
  existingTransactionId: string | null;
  existingExternalId: string | null;
}

const DEFAULT_DEDUP_CONFIG: DedupConfig = {
  enabled: true,
  ttlDays: 90,
  strictMode: true,
};

export class DeduplicationEngine {
  private config: DedupConfig;
  private seenKeys = new Map<string, { transactionId: string; externalId: string; timestamp: string }>();
  private seenHashes = new Map<string, { transactionId: string; externalId: string; timestamp: string }>();
  private seenProviderIds = new Map<string, { transactionId: string; timestamp: string }>();

  constructor(config?: Partial<DedupConfig>) {
    this.config = { ...DEFAULT_DEDUP_CONFIG, ...config };
  }

  check(transaction: { id: string; externalId?: string; amount: number; currency: string; bookingDate?: string; accountId: string; reference?: string; transactionDate: string }): DedupResult {
    if (!this.config.enabled) {
      return { isDuplicate: false, matchedField: null, existingTransactionId: null, existingExternalId: null };
    }

    const providerIdResult = this.checkByProviderId(transaction);
    if (providerIdResult.isDuplicate) return providerIdResult;

    const hashResult = this.checkByHash(transaction);
    if (hashResult.isDuplicate && this.config.strictMode) return hashResult;

    const compositeResult = this.checkByCompositeKey(transaction);
    if (compositeResult.isDuplicate && this.config.strictMode) return compositeResult;

    return { isDuplicate: false, matchedField: null, existingTransactionId: null, existingExternalId: null };
  }

  record(transaction: { id: string; externalId?: string; amount: number; currency: string; bookingDate?: string; accountId: string; reference?: string; transactionDate: string }): void {
    if (!this.config.enabled) return;

    const key = this.buildCompositeKey(transaction);
    const hash = this.buildHash(transaction);
    const now = new Date().toISOString();

    if (transaction.externalId) {
      this.seenProviderIds.set(transaction.externalId, {
        transactionId: transaction.id,
        timestamp: now,
      });
    }

    this.seenKeys.set(key, {
      transactionId: transaction.id,
      externalId: transaction.externalId ?? "",
      timestamp: now,
    });

    this.seenHashes.set(hash, {
      transactionId: transaction.id,
      externalId: transaction.externalId ?? "",
      timestamp: now,
    });

    this.evictExpired();
  }

  private checkByProviderId(transaction: { id: string; externalId?: string; amount: number; currency: string; bookingDate?: string; accountId: string; reference?: string; transactionDate: string }): DedupResult {
    if (!transaction.externalId) {
      return { isDuplicate: false, matchedField: null, existingTransactionId: null, existingExternalId: null };
    }

    const existing = this.seenProviderIds.get(transaction.externalId);
    if (existing) {
      return {
        isDuplicate: true,
        matchedField: "provider_transaction_id" as const,
        existingTransactionId: existing.transactionId,
        existingExternalId: transaction.externalId,
      };
    }

    return { isDuplicate: false, matchedField: null, existingTransactionId: null, existingExternalId: null };
  }

  private checkByHash(transaction: { id: string; externalId?: string; amount: number; currency: string; bookingDate?: string; accountId: string; reference?: string; transactionDate: string }): DedupResult {
    const hash = this.buildHash(transaction);
    const existing = this.seenHashes.get(hash);
    if (existing) {
      return {
        isDuplicate: true,
        matchedField: "normalized_hash" as const,
        existingTransactionId: existing.transactionId,
        existingExternalId: existing.externalId,
      };
    }

    return { isDuplicate: false, matchedField: null, existingTransactionId: null, existingExternalId: null };
  }

  private checkByCompositeKey(transaction: { id: string; externalId?: string; amount: number; currency: string; bookingDate?: string; accountId: string; reference?: string; transactionDate: string }): DedupResult {
    const key = this.buildCompositeKey(transaction);
    const existing = this.seenKeys.get(key);
    if (existing) {
      return {
        isDuplicate: true,
        matchedField: "booking_date_amount_currency" as const,
        existingTransactionId: existing.transactionId,
        existingExternalId: existing.externalId,
      };
    }

    return { isDuplicate: false, matchedField: null, existingTransactionId: null, existingExternalId: null };
  }

  private buildHash(transaction: { id: string; externalId?: string; amount: number; currency: string; bookingDate?: string; accountId: string; reference?: string; transactionDate: string }): string {
    const normalized = [
      transaction.externalId ?? "",
      String(transaction.amount),
      transaction.currency,
      transaction.bookingDate ?? transaction.transactionDate,
      transaction.accountId,
      transaction.reference ?? "",
    ].join("|");

    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }

    return `hash_${Math.abs(hash).toString(16)}`;
  }

  private buildCompositeKey(transaction: { id: string; externalId?: string; amount: number; currency: string; bookingDate?: string; accountId: string; reference?: string; transactionDate: string }): string {
    return [
      transaction.bookingDate ?? transaction.transactionDate,
      String(transaction.amount),
      transaction.currency,
      transaction.accountId,
      transaction.reference ?? "",
    ].join("::");
  }

  private evictExpired(): void {
    const cutoff = Date.now() - this.config.ttlDays * 86400000;

    for (const [key, value] of this.seenProviderIds) {
      if (new Date(value.timestamp).getTime() < cutoff) {
        this.seenProviderIds.delete(key);
      }
    }

    for (const [key, value] of this.seenKeys) {
      if (new Date(value.timestamp).getTime() < cutoff) {
        this.seenKeys.delete(key);
      }
    }

    for (const [key, value] of this.seenHashes) {
      if (new Date(value.timestamp).getTime() < cutoff) {
        this.seenHashes.delete(key);
      }
    }
  }

  getSeenCount(): number {
    return this.seenProviderIds.size + this.seenKeys.size + this.seenHashes.size;
  }
}

export const deduplicationEngine = new DeduplicationEngine();