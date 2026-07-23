# Monitoring Documentation

## Overview

Observability stack covering metrics, logging, tracing, health checks, and alerting.

## Metrics

### Sources

| Source | Type | Collection |
|---|---|---|
| Application | Counter, Histogram, Gauge | In-process via MetricsRegistry |
| Infrastructure | Gauge, Histogram | In-process via MetricsRegistry |
| Repository | Counter, Histogram | In-process via MetricsRegistry |
| Cache | Counter, Histogram | In-process via MetricsRegistry |
| Queue | Counter, Histogram | In-process via MetricsRegistry |

### Prometheus Endpoint

`GET /api/metrics` returns Prometheus-formatted metrics:
```
# HELP app_requests_total Counter metric
# TYPE app_requests_total counter
app_requests_total 1500
app_requests_latency_seconds_count 1500
app_requests_latency_seconds_sum 45.2
```

## Logging

All logs are structured JSON:

```json
{
  "timestamp": "2026-07-09T12:00:00.000Z",
  "level": "info",
  "message": "Request completed",
  "method": "GET",
  "path": "/api/v1/treasury/cash-position",
  "durationMs": 45,
  "statusCode": 200
}
```

## Health Checks

Available at `GET /api/v1/enterprise/health`:
- Cache connectivity (ping)
- Memory usage (heap utilization)
- Uptime (process duration)
- Queue health (backlog, failures)

## Tracing

Span-based tracing via `Tracer` class:
- Trace ID per request
- Span hierarchy (parent → child)
- Duration tracking
- Error attribution
- Ring buffer (last 1000 spans)

## OpenTelemetry Readiness

The observability layer supports OpenTelemetry export:
- Metrics can be exported to Prometheus
- Traces can be exported to Jaeger/Zipkin
- Logs can be exported to any JSON log collector
- OpenTelemetry bridge available in `open-telemetry.ts`
