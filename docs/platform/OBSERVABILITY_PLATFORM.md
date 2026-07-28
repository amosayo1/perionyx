# Observability Platform

**Platform**: ObservabilityPlatform
**Contract**: `ObservabilityContract`
**Mission**: Provide comprehensive, zero-overhead observability — metrics, structured logging, distributed tracing, and health checking — so that every platform, module, and external dependency is measurable, traceable, and diagnosable.
**Status**: Partially Built
**Constitutional Authority**: PLATFORM_CONSTITUTION.md

---

## Responsibilities

1. **Metrics Collection** — Collect application, infrastructure, repository, queue, cache, treasury, banking, and performance metrics via an in-process `MetricsRegistry` with Counter, Gauge, and Histogram primitives.
2. **Structured Logging** — Provide a unified Pino-based logger with structured JSON output, automatic field redaction, log level filtering, and correlation context injection.
3. **Distributed Tracing** — Create and propagate trace contexts (traceId, spanId, correlationId) across requests, database queries, AI calls, and background jobs.
4. **OpenTelemetry Bridge** — Export traces and metrics to OpenTelemetry-compatible collectors (Prometheus, Jaeger, Datadog, Grafana).
5. **Health Checking** — Aggregate health checks from all system components (memory, cache, persistence, uptime) into a unified health report with per-component status.
6. **Correlation** — Generate and propagate correlation IDs for every request, enabling end-to-end request tracing across services.
7. **Performance Monitoring** — Track CPU usage, event loop lag, active handles, GC duration, and memory consumption.
8. **Database Tracing** — Instrument Prisma queries with span creation, duration tracking, and slow-query detection.
9. **Metrics Export** — Expose metrics in Prometheus-compatible format for external monitoring systems.
10. **Alerting Foundation** — Provide metric thresholds and health status for integration with external alerting systems (PagerDuty, OpsGenie, Slack).

---

## Public API (Capability Contract)

```typescript
interface ObservabilityContract {
  // ── Metrics ─────────────────────────────────────────────────
  counter(name: string): Counter;
  gauge(name: string): Gauge;
  histogram(name: string): Histogram;
  getSnapshot(): MetricsSnapshot;

  // ── Logging ─────────────────────────────────────────────────
  getLogger(): typeof logger;
  logWithCorrelation(level: string, message: string, correlationId: string, data?: Record<string, unknown>): void;

  // ── Tracing ─────────────────────────────────────────────────
  createTracer(traceId?: string): Tracer;
  getRecentTraces(limit?: number): TraceSpan[];

  // ── Correlation ─────────────────────────────────────────────
  generateCorrelationId(): string;
  createCorrelationContext(overrides?: Partial<CorrelationContext>): CorrelationContext;
  getCorrelationContext(correlationId: string): CorrelationContext | undefined;

  // ── Health ──────────────────────────────────────────────────
  registerHealthCheck(name: string, checker: HealthChecker): void;
  getHealthReport(): Promise<HealthReport>;
  runHealthCheck(name: string): Promise<HealthCheckResult>;

  // ── Prometheus Export ───────────────────────────────────────
  exportPrometheusMetrics(): string;
}

// Primitives
interface Counter {
  inc(labels?: Record<string, string>): void;
  add(value: number, labels?: Record<string, string>): void;
  get(): number;
}

interface Gauge {
  set(value: number, labels?: Record<string, string>): void;
  inc(labels?: Record<string, string>): void;
  dec(labels?: Record<string, string>): void;
  get(): number;
}

interface Histogram {
  observe(value: number, labels?: Record<string, string>): void;
  get(): HistogramSnapshot;
}

interface HistogramSnapshot {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

interface Tracer {
  traceId: string;
  startSpan(name: string, attributes?: Record<string, string | number | boolean>): TraceSpan;
  endSpan(span: TraceSpan, error?: string): void;
  trace<T>(name: string, fn: () => Promise<T>, attributes?: Record<string, string | number | boolean>): Promise<T>;
  getSpans(): TraceSpan[];
}

interface TraceSpan {
  traceId: string;
  parentSpanId?: string;
  spanId: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "ok" | "error";
  error?: string;
  attributes: Record<string, string | number | boolean>;
}

type HealthStatus = "healthy" | "degraded" | "unhealthy";

interface HealthCheckResult {
  status: HealthStatus;
  component: string;
  message?: string;
  latencyMs: number;
  lastChecked: Date;
  metadata?: Record<string, unknown>;
}

interface HealthReport {
  status: HealthStatus;
  checks: HealthCheckResult[];
  healthy: number;
  degraded: number;
  unhealthy: number;
  total: number;
  timestamp: Date;
}
```

---

## Internal API

```typescript
interface ObservabilityInternalApi {
  // Correlation middleware
  extractFromHeaders(headers: Headers | Record<string, string>): Partial<CorrelationContext>;
  createHandlerContext(headers: Headers): CorrelationContext;
  finalizeHandlerContext(correlationId: string): void;

  // Request timing
  startRequestSpan(correlationId: string, tracer: Tracer): void;
  endRequestSpan(correlationId: string): { duration: number; tracer: Tracer } | undefined;

  // Metric registration (called at startup)
  registerAllMetrics(): void;
  registerApplicationMetrics(): void;
  registerInfrastructureMetrics(): void;
  registerRepositoryMetrics(): void;
  registerQueueMetrics(): void;
  registerCacheMetrics(): void;
  registerTreasuryMetrics(): void;
  registerBankingMetrics(): void;
  registerPerformanceMetrics(): void;

  // Health check registration (called at startup)
  registerCacheHealth(cacheManager: CacheManager): void;
  registerMemoryHealth(): void;
  registerUptimeHealth(): void;
  registerPersistenceHealth(persistence: PersistenceHealth): void;

  // Database tracing
  instrumentQuery<T>(queryName: string, fn: () => Promise<T>): Promise<T>;
}
```

---

## Events

```typescript
interface ObservabilityPlatformEvents {
  "observability.health.changed": {
    component: string; previousStatus: string; newStatus: string;
    message?: string; latencyMs: number;
  };
  "observability.health.unhealthy": {
    component: string; message: string; metadata?: Record<string, unknown>;
  };
  "observability.metric.threshold": {
    metric: string; value: number; threshold: number;
    labels?: Record<string, string>;
  };
  "observability.slow_query.detected": {
    queryName: string; durationMs: number; threshold: number;
  };
  "observability.trace.error": {
    traceId: string; spanName: string; error: string;
    duration: number;
  };
}
```

---

## Commands

| Command | Description | Auth |
|---|---|---|
| `RecordMetric` | Record a metric value | System (internal) |
| `RegisterHealthCheck` | Register a component health check | System (internal) |
| `ExportMetrics` | Export Prometheus-format metrics | `observability.read` |

---

## Queries

| Query | Description | Auth |
|---|---|---|
| `GetMetricsSnapshot` | Full metrics snapshot | `observability.read` |
| `GetHealthReport` | Aggregate health report | Public (`/api/health`) |
| `GetRecentTraces` | Recent trace spans | `observability.read` |
| `GetCorrelationContext` | Request correlation context | System (internal) |
| `GetPrometheusMetrics` | Prometheus-format export | `observability.read` |

---

## Errors

| Error Code | Description | HTTP Status | Retryable |
|---|---|---|---|
| `METRICS_OVERFLOW` | Histogram buffer full | 500 | No |
| `TRACE_BUFFER_FULL` | Trace buffer at capacity | 500 | No |
| `HEALTH_CHECK_TIMEOUT` | Component check timed out | 503 | Yes |
| `HEALTH_CHECK_NOT_FOUND` | Unregistered health check | 404 | No |
| `CORRELATION_EXPIRED` | Correlation context expired | 400 | No |

---

## Security Model

- **Health Endpoint Sanitized**: `/api/health` returns only `{ status, ready, live }` — no DB errors, memory usage, or uptime details exposed (Phase 17.2 fix).
- **Log Redaction**: Pino automatically redacts `auth`, `cookie`, `password`, `secret`, `authorization`, `apiKey`, `token` fields from all structured logs.
- **Correlation ID Propagation**: Correlation IDs are generated server-side and validated on incoming requests. Client-supplied IDs are accepted only if valid format.
- **Trace Data Retention**: Trace spans are held in a ring buffer (max 1000 spans) — never persisted to disk without encryption.
- **Metrics Anonymization**: No PII or financial data in metric labels. Only operational labels (provider, model, status, company_id hash).

---

## Permission Model

| Permission | Scope | Description |
|---|---|---|
| `observability.read` | Platform | View metrics, traces, health details |
| `observability.metrics.read` | Company | View own metrics dashboard |
| `observability.health.read` | Public | Basic health check (sanitized) |

---

## Observability (Self-Referential)

The Observability Platform is itself observable, creating a meta-observability loop:

### Metrics (8 Domains)

| Domain | Functions | Metric Count |
|---|---|---|
| Application | `registerApplicationMetrics()` | 7 |
| Infrastructure | `registerInfrastructureMetrics()` | 5 |
| Repository | `registerRepositoryMetrics()` | 7 |
| Queue | `registerQueueMetrics()` | 6 |
| Cache | `registerCacheMetrics()` | 6 |
| Treasury | `registerTreasuryMetrics()` | 6 |
| Banking | `registerBankingMetrics()` | 5 |
| Performance | `registerPerformanceMetrics()` | 5 |
| **Total** | | **47 metrics** |

### Health Checks (5 Registered)

| Check | Component | Thresholds |
|---|---|---|
| Memory | `memory` | healthy < 90%, degraded < 95%, unhealthy ≥ 95% heap |
| Uptime | `uptime` | Always healthy (informational) |
| Cache | `cache` | Delegates to `CacheManager` health |
| Persistence | `persistence` | Delegates to persistence layer health |

---

## Metrics Reference

### Application Metrics
| Metric | Type | Description |
|---|---|---|
| `app.requests.total` | Counter | Total HTTP requests |
| `app.requests.success` | Counter | Successful requests |
| `app.requests.error` | Counter | Failed requests |
| `app.requests.latency` | Histogram | Request latency |
| `app.memory.heap` | Gauge | Heap memory usage |
| `app.memory.rss` | Gauge | RSS memory usage |
| `app.connections.active` | Gauge | Active connections |

### Infrastructure Metrics
| Metric | Type | Description |
|---|---|---|
| `infra.memory.heapUsed` | Gauge | Heap used |
| `infra.memory.heapTotal` | Gauge | Heap total |
| `infra.memory.rss` | Gauge | RSS |
| `infra.errors.total` | Counter | Infrastructure errors |
| `infra.operation.latency` | Histogram | Infrastructure operation latency |

### Performance Metrics
| Metric | Type | Description |
|---|---|---|
| `perf.cpu.usage` | Histogram | CPU usage |
| `perf.eventLoop.lag` | Histogram | Event loop lag |
| `perf.handles.active` | Gauge | Active handles |
| `perf.requests.active` | Gauge | Active requests |
| `perf.gc.duration` | Histogram | GC duration |

### Treasury Metrics
| Metric | Type | Description |
|---|---|---|
| `treasury.cashPosition` | Gauge | Cash position |
| `treasury.liquidity` | Gauge | Liquidity ratio |
| `treasury.fxExposure` | Gauge | FX exposure |
| `treasury.transfers.total` | Counter | Total transfers |
| `treasury.transfers.pending` | Counter | Pending transfers |
| `treasury.transfers.completed` | Counter | Completed transfers |
| `treasury.forecast.error` | Histogram | Forecast accuracy |

---

## Rate Limiting

Health endpoint is rate-limited at 60 req/min per IP. Metrics endpoint is rate-limited at 120 req/min per IP. Internal metrics recording has no rate limit.

---

## Retry Policy

| Operation | Max Retries | Backoff | Context |
|---|---|---|---|
| Prometheus export | 1 | Fixed 1s | On serialization error |
| Health check | 2 | Fixed 500ms | On timeout |

---

## Circuit Breakers

| Circuit | Threshold | Recovery | Fallback |
|---|---|---|---|
| Health check component | 3 timeouts / 60s | 60s | Report as degraded |
| OpenTelemetry collector | 5 failures / 300s | 120s | Local buffer only |

---

## Caching

| Cache | TTL | Scope | Invalidation |
|---|---|---|---|
| Health report | 10s | Global | On component status change |
| Metrics snapshot | Real-time (on read) | Global | N/A — always current |
| Recent traces | In-memory ring buffer | Global | Eviction at 1000 spans |

---

## Versioning

| Aspect | Strategy |
|---|---|
| API versioning | URL path prefix (`/api/v1/observability/`) |
| Metric names | Stable naming convention; prefix-based namespacing |
| Prometheus format | OpenMetrics compatible |
| Health endpoint | Minimal contract (status, ready, live) — never break |

---

## Lifecycle

```
Initialization → registerAllMetrics() → registerMemoryHealth() → registerUptimeHealth()
                    ↓
Request Start → CorrelationMiddleware.createHandlerContext() → startRequestSpan()
                    ↓
Processing → trace spans, metric recording, structured logging
                    ↓
Request End → finalizeHandlerContext() → endRequestSpan()
                    ↓
Background → health checks every 30s → metric export every 60s
                    ↓
Shutdown → finalize all spans → flush logs → export final metrics
```

---

## Extension Model

- **Custom Health Checks**: Register via `registerHealthCheck(name, checker)`. Any component can add its own health check.
- **Custom Metrics**: Register new counters, gauges, histograms via `metrics.counter(name)`, `metrics.gauge(name)`, `metrics.histogram(name)`.
- **Custom Trace Attributes**: Add domain-specific attributes to spans (e.g., `treasury.account_id`, `workflow.instance_id`).
- **Prometheus Custom Metrics**: Expose custom metrics via the Prometheus exporter by naming convention.
- **OTEL Exporters**: Add custom OpenTelemetry exporters by configuring the `otel.ts` bridge.

---

## Provider Model

The Observability Platform uses an internal metrics implementation. No external metrics SDK is imported by business domains (Constitution Law 1).

| Component | Implementation | External Export |
|---|---|---|
| MetricsRegistry | Custom in-process (`src/server/observability/metrics.ts`) | Prometheus (`metrics-exporter.ts`) |
| Logger | Pino (`@/lib/logger`) | JSON stdout → any log aggregator |
| Tracer | Custom in-process (`tracing.ts`) + OTel bridge (`otel.ts`, `open-telemetry.ts`) | Jaeger, Datadog, Grafana |
| Health | Custom registry (`health.ts`) | REST endpoint (`/api/health`) |
| Correlation | Custom middleware (`correlation.ts`) | Header propagation |

---

## Testing Strategy

| Test Type | Scope | Coverage Target |
|---|---|---|
| Unit tests | Counter, Gauge, Histogram math; state machine; health aggregation | 95% |
| Integration tests | Correlation ID propagation through request lifecycle | 90% |
| Contract tests | Health endpoint response format | 100% |
| Performance tests | Metrics recording overhead (<1% CPU), trace buffer performance | Baseline |
| Reliability tests | Metrics survive concurrent access, trace buffer overflow | 100% |
| Compliance tests | Log redaction correctness, health endpoint sanitization | 100% |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| MetricsRegistry overflow | Old metrics lost | Periodic reset for histograms; counters are monotonic |
| Trace buffer full | Oldest traces evicted | Ring buffer with configurable max (1000) |
| Logger failure | Structured logs lost | Pino writes to stdout; fallback to stderr |
| Health check timeout | Component reported as degraded | Timeout threshold, retry once |
| OTEL collector unreachable | Metrics/traces buffered locally | Local buffer, retry on next export cycle |
| Correlation ID collision | Request traces mixed | High-entropy ID generation (32-char random) |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Metrics data loss | Metrics are ephemeral by design; dashboards repopulate from Prisma |
| Log aggregation failure | Pino buffers locally; logs available on stdout |
| Trace context lost | Correlation ID enables reconstruction from logs |
| Health check failure | Previous health state retained; retry on next cycle |
| OTEL collector down | Local metrics retained; export resumes on reconnect |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/server/observability/metrics.ts` | `MetricsRegistry` with Counter, Gauge, Histogram |
| `src/server/observability/metrics-registry.ts` | 47 metric registrations across 8 domains |
| `src/server/observability/metrics-exporter.ts` | Prometheus-format export |
| `src/server/observability/logger.ts` | Re-exports Pino logger |
| `src/server/observability/tracing.ts` | In-process `Tracer` with ring buffer |
| `src/server/observability/otel.ts` | OpenTelemetry bridge |
| `src/server/observability/open-telemetry.ts` | OTel tracer factory |
| `src/server/observability/health.ts` | `HealthRegistry` with `HealthReport` aggregation |
| `src/server/observability/health-checks.ts` | Memory, uptime, cache, persistence health checks |
| `src/server/observability/correlation.ts` | `CorrelationMiddleware` with context propagation |
| `src/server/observability/database-tracing.ts` | Prisma query instrumentation |
| `src/server/observability/extended.ts` | Extended health checks |
| `src/server/observability/index.ts` | Barrel export |
| `src/modules/metrics/metrics.ts` | Business-level metrics (legacy) |
| `src/modules/observability/` | Observability module (legacy) |

---

*The Observability Platform is the nervous system of Perionyx — every signal flows through it, every component is measured by it.*
