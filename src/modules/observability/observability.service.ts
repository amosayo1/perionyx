import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

export interface MetricPoint {
  name: string;
  value: number;
  unit: string;
  labels?: Record<string, string>;
  timestamp: string;
}

export interface TraceSpan {
  id: string;
  operation: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  status: "ok" | "error";
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ServiceHealth {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  lastCheckedAt: string;
  latencyMs: number;
  error?: string;
}

class MetricsStore {
  private metrics: MetricPoint[] = [];
  private spans: TraceSpan[] = [];
  private maxEntries = 1000;

  record(metric: MetricPoint): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxEntries) this.metrics.shift();
  }

  recordSpan(span: TraceSpan): void {
    this.spans.push(span);
    if (this.spans.length > this.maxEntries) this.spans.shift();
  }

  getRecent(limit = 100): MetricPoint[] {
    return this.metrics.slice(-limit);
  }

  getRecentSpans(limit = 100): TraceSpan[] {
    return this.spans.slice(-limit);
  }

  getSummary(): { metricCount: number; spanCount: number; lastRecorded: string | null } {
    return {
      metricCount: this.metrics.length,
      spanCount: this.spans.length,
      lastRecorded: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : null,
    };
  }

  getAggregated(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const groups: Record<string, number[]> = {};
    for (const m of this.metrics) {
      if (!groups[m.name]) groups[m.name] = [];
      groups[m.name].push(m.value);
    }
    return Object.fromEntries(
      Object.entries(groups).map(([name, values]) => [
        name,
        {
          count: values.length,
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
        },
      ]),
    );
  }
}

class ObservableService {
  constructor(
    readonly serviceName: string,
    private store: MetricsStore,
  ) {}

  async trace<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startedAt = Date.now();
    const spanId = `${this.serviceName}:${operation}:${startedAt}`;
    try {
      const result = await fn();
      this.store.recordSpan({
        id: spanId,
        operation: `${this.serviceName}.${operation}`,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        status: "ok",
      });
      return result;
    } catch (err) {
      this.store.recordSpan({
        id: spanId,
        operation: `${this.serviceName}.${operation}`,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  gauge(name: string, value: number, labels?: Record<string, string>): void {
    this.store.record({ name, value, unit: "gauge", labels, timestamp: new Date().toISOString() });
  }

  increment(name: string, labels?: Record<string, string>): void {
    this.store.record({ name, value: 1, unit: "count", labels, timestamp: new Date().toISOString() });
  }

  timing(name: string, durationMs: number, labels?: Record<string, string>): void {
    this.store.record({ name, value: durationMs, unit: "ms", labels, timestamp: new Date().toISOString() });
  }

  histogram(name: string, value: number, labels?: Record<string, string>): void {
    this.store.record({ name, value, unit: "histogram", labels, timestamp: new Date().toISOString() });
  }

  healthCheck(): ServiceHealth {
    return {
      service: this.serviceName,
      status: "healthy",
      lastCheckedAt: new Date().toISOString(),
      latencyMs: 0,
    };
  }
}

export class ObservabilityService {
  private store = new MetricsStore();
  private healthChecks = new Map<string, () => Promise<ServiceHealth>>();

  readonly metrics = new ObservableService("metrics", this.store);
  readonly intelligence = new ObservableService("intelligence", this.store);
  readonly decisions = new ObservableService("decisions", this.store);
  readonly forecasting = new ObservableService("forecasting", this.store);
  readonly connectors = new ObservableService("connectors", this.store);
  readonly queue = new ObservableService("queue", this.store);
  readonly ai = new ObservableService("ai", this.store);
  readonly api = new ObservableService("api", this.store);

  registerHealthCheck(service: string, check: () => Promise<ServiceHealth>): void {
    this.healthChecks.set(service, check);
  }

  async runHealthChecks(): Promise<ServiceHealth[]> {
    const results: ServiceHealth[] = [];
    for (const [service, check] of this.healthChecks) {
      try {
        const health = await check();
        results.push(health);
      } catch (err) {
        results.push({
          service,
          status: "unhealthy",
          lastCheckedAt: new Date().toISOString(),
          latencyMs: 0,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return results;
  }

  getMetricsSummary() {
    return this.store.getSummary();
  }

  getAggregatedMetrics() {
    return this.store.getAggregated();
  }

  getRecentSpans(limit?: number) {
    return this.store.getRecentSpans(limit);
  }

  getRecentMetrics(limit?: number) {
    return this.store.getRecent(limit);
  }

  async recordJobExecution(jobName: string, durationMs: number, status: "success" | "failed", error?: string): Promise<void> {
    this.queue.increment(`job.${jobName}.${status}`, { job: jobName });
    this.queue.timing(`job.${jobName}.duration`, durationMs, { job: jobName });

    await prisma.auditLog.create({
      data: {
        action: `JOB_${status.toUpperCase()}`,
        severity: status === "failed" ? "WARNING" : "INFO",
        resourceType: "background-job",
        resourceId: jobName,
        metadata: { durationMs, error },
        ipAddress: "system",
        userAgent: "observability",
      },
    }).catch((err) => logger.error(err, "[Observability] Failed to record job execution"));
  }

  async recordApiCall(method: string, path: string, statusCode: number, durationMs: number): Promise<void> {
    this.api.increment(`api.call.${statusCode}`, { method, path });
    this.api.timing("api.latency", durationMs, { method, path });
  }

  async recordConnectorSync(connectorId: string, status: "success" | "failed", durationMs: number): Promise<void> {
    this.connectors.increment(`connector.sync.${status}`, { connectorId });
    this.connectors.timing("connector.sync.duration", durationMs, { connectorId });
  }
}

export const observabilityService = new ObservabilityService();
