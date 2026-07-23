import { createTracer, type OTelTracer } from "./otel";
import { metrics } from "./metrics";

export interface QueryTrace {
  query: string;
  durationMs: number;
  params: unknown[];
  timestamp: Date;
  traceId?: string;
}

const queryTraces: QueryTrace[] = [];
const MAX_QUERY_TRACES = 500;
const SLOW_QUERY_THRESHOLD_MS = 500;

export function traceQuery(
  query: string,
  durationMs: number,
  params: unknown[],
  traceId?: string,
): void {
  const entry: QueryTrace = {
    query: query.length > 200 ? query.slice(0, 200) + "..." : query,
    durationMs,
    params,
    timestamp: new Date(),
    traceId,
  };
  queryTraces.push(entry);
  if (queryTraces.length > MAX_QUERY_TRACES) queryTraces.shift();

  metrics.histogram("db.query.duration").observe(durationMs);

  if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
    metrics.counter("db.slow_query").inc();
  }
}

export function getQueryTraces(limit = 100): QueryTrace[] {
  return queryTraces.slice(-limit);
}

export function getSlowQueries(thresholdMs = SLOW_QUERY_THRESHOLD_MS, limit = 50): QueryTrace[] {
  return queryTraces.filter((q) => q.durationMs >= thresholdMs).slice(-limit);
}

export function getQueryStats(): {
  total: number;
  averageMs: number;
  maxMs: number;
  slowCount: number;
  slowPct: number;
} {
  const total = queryTraces.length;
  if (total === 0) return { total: 0, averageMs: 0, maxMs: 0, slowCount: 0, slowPct: 0 };
  const sum = queryTraces.reduce((s, q) => s + q.durationMs, 0);
  const max = Math.max(...queryTraces.map((q) => q.durationMs));
  const slowCount = queryTraces.filter((q) => q.durationMs >= SLOW_QUERY_THRESHOLD_MS).length;
  return {
    total,
    averageMs: Math.round(sum / total),
    maxMs: max,
    slowCount,
    slowPct: Math.round((slowCount / total) * 100),
  };
}

export function resetQueryTraces(): void {
  queryTraces.length = 0;
}

export async function withQueryTracing<T>(
  label: string,
  queryFn: () => Promise<T>,
  tracer?: OTelTracer,
): Promise<T> {
  const activeTracer = tracer ?? createTracer();
  const span = activeTracer.startSpan(label, "client");

  const start = performance.now();
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    traceQuery(label, duration, [], activeTracer.traceId);
    activeTracer.endSpan(span);
    return result;
  } catch (err) {
    const duration = performance.now() - start;
    traceQuery(label, duration, [], activeTracer.traceId);
    activeTracer.endSpan(span, err instanceof Error ? err.message : String(err));
    throw err;
  }
}
