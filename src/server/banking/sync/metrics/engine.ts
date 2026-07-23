import type { SyncState, SyncTrigger, SyncMode } from "../types";

export interface MetricsConfig {
  retentionPeriodDays: number;
  aggregationIntervalMinutes: number;
}

export interface SyncMetrics {
  jobId: string;
  connectionId: string;
  trigger: SyncTrigger;
  mode: SyncMode;
  state: SyncState;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  accountsProcessed: number;
  transactionsImported: number;
  transactionsUpdated: number;
  transactionsFailed: number;
  transactionsSkipped: number;
  duplicatesFound: number;
  bytesTransferred: number;
  providerLatencyMs: number;
  retryCount: number;
  errorCount: number;
  reconciliationId: string | null;
  correlationId: string;
}

export interface MetricsAggregation {
  period: string;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  partialSyncs: number;
  averageDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
  totalImported: number;
  totalUpdated: number;
  totalFailed: number;
  totalSkipped: number;
  totalDuplicates: number;
  averageProviderLatencyMs: number;
  syncsByTrigger: Record<string, number>;
  syncsByMode: Record<string, number>;
  syncsByState: Record<string, number>;
}

const DEFAULT_CONFIG: MetricsConfig = {
  retentionPeriodDays: 90,
  aggregationIntervalMinutes: 60,
};

export class SyncMetricsCollector {
  private config: MetricsConfig;
  private metrics: SyncMetrics[] = [];
  private aggregations: MetricsAggregation[] = [];

  constructor(config?: Partial<MetricsConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  record(metrics: SyncMetrics): void {
    this.metrics.push(metrics);

    const cutoff = Date.now() - this.config.retentionPeriodDays * 86400000;
    this.metrics = this.metrics.filter(
      (m) => new Date(m.startedAt).getTime() > cutoff,
    );
  }

  getMetrics(jobId: string): SyncMetrics | null {
    return this.metrics.find((m) => m.jobId === jobId) ?? null;
  }

  getConnectionMetrics(connectionId: string): SyncMetrics[] {
    return this.metrics.filter((m) => m.connectionId === connectionId);
  }

  getTimeRangeMetrics(from: string, to: string): SyncMetrics[] {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    return this.metrics.filter((m) => {
      const t = new Date(m.completedAt ?? m.startedAt).getTime();
      return t >= fromTime && t <= toTime;
    });
  }

  getAggregation(period: string): MetricsAggregation | null {
    return this.aggregations.find((a) => a.period === period) ?? null;
  }

  aggregate(period: string): MetricsAggregation {
    const relevant = this.metrics.filter((m) => {
      if (period === "last_hour") {
        return Date.now() - new Date(m.startedAt).getTime() < 3600000;
      }
      if (period === "last_24h") {
        return Date.now() - new Date(m.startedAt).getTime() < 86400000;
      }
      if (period === "last_7d") {
        return Date.now() - new Date(m.startedAt).getTime() < 604800000;
      }
      if (period === "last_30d") {
        return Date.now() - new Date(m.startedAt).getTime() < 2592000000;
      }
      return true;
    });

    const durations = relevant
      .map((m) => m.durationMs ?? 0)
      .filter((d) => d > 0)
      .sort((a, b) => a - b);

    const successful = relevant.filter((m) => m.state === "COMPLETED");
    const failed = relevant.filter((m) => m.state === "FAILED");
    const partial = relevant.filter((m) => m.state === "PARTIAL_SUCCESS");

    const syncsByTrigger: Record<string, number> = {};
    const syncsByMode: Record<string, number> = {};
    const syncsByState: Record<string, number> = {};

    for (const m of relevant) {
      syncsByTrigger[m.trigger] = (syncsByTrigger[m.trigger] ?? 0) + 1;
      syncsByMode[m.mode] = (syncsByMode[m.mode] ?? 0) + 1;
      syncsByState[m.state] = (syncsByState[m.state] ?? 0) + 1;
    }

    const aggregation: MetricsAggregation = {
      period,
      totalSyncs: relevant.length,
      successfulSyncs: successful.length,
      failedSyncs: failed.length,
      partialSyncs: partial.length,
      averageDurationMs: durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0,
      p50DurationMs: durations.length > 0 ? durations[Math.floor(durations.length * 0.5)] : 0,
      p95DurationMs: durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0,
      p99DurationMs: durations.length > 0 ? durations[Math.floor(durations.length * 0.99)] : 0,
      totalImported: relevant.reduce((s, m) => s + m.transactionsImported, 0),
      totalUpdated: relevant.reduce((s, m) => s + m.transactionsUpdated, 0),
      totalFailed: relevant.reduce((s, m) => s + m.transactionsFailed, 0),
      totalSkipped: relevant.reduce((s, m) => s + m.transactionsSkipped, 0),
      totalDuplicates: relevant.reduce((s, m) => s + m.duplicatesFound, 0),
      averageProviderLatencyMs: relevant.length > 0
        ? Math.round(relevant.reduce((s, m) => s + m.providerLatencyMs, 0) / relevant.length)
        : 0,
      syncsByTrigger,
      syncsByMode,
      syncsByState,
    };

    const existingIndex = this.aggregations.findIndex((a) => a.period === period);
    if (existingIndex >= 0) {
      this.aggregations[existingIndex] = aggregation;
    } else {
      this.aggregations.push(aggregation);
    }

    return aggregation;
  }

  getTotalSyncCount(): number {
    return this.metrics.length;
  }

  clear(): void {
    this.metrics = [];
    this.aggregations = [];
  }
}

export const syncMetricsCollector = new SyncMetricsCollector();