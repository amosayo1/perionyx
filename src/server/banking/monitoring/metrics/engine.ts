import type { BankProviderKind } from "../../domain/types";
import type { HealthMetric, MetricAggregation } from "../types";

export interface MetricsCollectorConfig {
  maxMetrics: number;
  aggregationBuckets: string[];
}

const DEFAULT_CONFIG: MetricsCollectorConfig = {
  maxMetrics: 10000,
  aggregationBuckets: ["last_hour", "last_24h", "last_7d", "last_30d"],
};

export class MetricsCollector {
  private config: MetricsCollectorConfig;
  private metrics: HealthMetric[] = [];
  private counter = 0;

  constructor(config?: Partial<MetricsCollectorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  record(params: {
    connectionId: string;
    providerKind: BankProviderKind;
    metricType: string;
    value: number;
    unit: string;
    labels?: Record<string, string>;
  }): void {
    this.counter++;

    const metric: HealthMetric = {
      id: `metric-${Date.now()}-${this.counter}`,
      connectionId: params.connectionId,
      providerKind: params.providerKind,
      metricType: params.metricType,
      value: params.value,
      unit: params.unit,
      recordedAt: new Date().toISOString(),
      labels: params.labels ?? {},
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  recordLatency(
    connectionId: string,
    providerKind: BankProviderKind,
    latencyMs: number,
  ): void {
    this.record({
      connectionId,
      providerKind,
      metricType: "latency_ms",
      value: latencyMs,
      unit: "ms",
    });
  }

  recordSyncDuration(
    connectionId: string,
    providerKind: BankProviderKind,
    durationMs: number,
    transactionsCount: number,
  ): void {
    this.record({
      connectionId,
      providerKind,
      metricType: "sync_duration_ms",
      value: durationMs,
      unit: "ms",
      labels: { transactions: String(transactionsCount) },
    });
  }

  recordSuccessRate(
    connectionId: string,
    providerKind: BankProviderKind,
    rate: number,
  ): void {
    this.record({
      connectionId,
      providerKind,
      metricType: "success_rate_pct",
      value: rate,
      unit: "percent",
    });
  }

  getMetricsByType(metricType: string): HealthMetric[] {
    return this.metrics.filter((m) => m.metricType === metricType);
  }

  getMetricsByConnection(connectionId: string): HealthMetric[] {
    return this.metrics.filter((m) => m.connectionId === connectionId);
  }

  getMetricsByProvider(providerKind: BankProviderKind): HealthMetric[] {
    return this.metrics.filter((m) => m.providerKind === providerKind);
  }

  getMetricsByTimeRange(from: string, to: string): HealthMetric[] {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    return this.metrics.filter((m) => {
      const t = new Date(m.recordedAt).getTime();
      return t >= fromTime && t <= toTime;
    });
  }

  aggregate(metricType: string, period: string): MetricAggregation {
    const now = Date.now();
    let cutoff: number;

    switch (period) {
      case "last_hour": cutoff = now - 3600000; break;
      case "last_24h": cutoff = now - 86400000; break;
      case "last_7d": cutoff = now - 604800000; break;
      case "last_30d": cutoff = now - 2592000000; break;
      default: cutoff = 0;
    }

    const relevant = this.metrics.filter(
      (m) =>
        m.metricType === metricType &&
        new Date(m.recordedAt).getTime() >= cutoff,
    );

    if (relevant.length === 0) {
      return {
        metricType,
        avg: 0, min: 0, max: 0,
        p50: 0, p95: 0, p99: 0,
        count: 0, sum: 0,
        period,
      };
    }

    const values = relevant.map((m) => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;

    return {
      metricType,
      avg: Math.round(avg * 100) / 100,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
      count: values.length,
      sum: Math.round(sum * 100) / 100,
      period,
    };
  }

  aggregateByProvider(
    metricType: string,
    period: string,
  ): Record<string, MetricAggregation> {
    const results: Record<string, MetricAggregation> = {};
    const providerGroups = new Set(
      this.metrics
        .filter((m) => m.metricType === metricType)
        .map((m) => m.providerKind),
    );

    for (const provider of providerGroups) {
      const filteredMetrics = this.metrics.filter(
        (m) =>
          m.metricType === metricType && m.providerKind === provider,
      );
      const now = Date.now();
      let cutoff: number;
      switch (period) {
        case "last_hour": cutoff = now - 3600000; break;
        case "last_24h": cutoff = now - 86400000; break;
        case "last_7d": cutoff = now - 604800000; break;
        case "last_30d": cutoff = now - 2592000000; break;
        default: cutoff = 0;
      }

      const relevant = filteredMetrics.filter(
        (m) => new Date(m.recordedAt).getTime() >= cutoff,
      );
      if (relevant.length === 0) continue;

      const values = relevant.map((m) => m.value).sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;

      results[provider] = {
        metricType,
        avg: Math.round(avg * 100) / 100,
        min: values[0],
        max: values[values.length - 1],
        p50: values[Math.floor(values.length * 0.5)],
        p95: values[Math.floor(values.length * 0.95)],
        p99: values[Math.floor(values.length * 0.99)],
        count: values.length,
        sum: Math.round(sum * 100) / 100,
        period,
      };
    }

    return results;
  }

  getAllMetrics(): HealthMetric[] {
    return this.metrics;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const metricsCollector = new MetricsCollector();