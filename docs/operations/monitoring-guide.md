# Monitoring Guide

## Metrics Endpoints

| Endpoint | Description | Format |
|---|---|---|
| `GET /api/v1/enterprise/health` | Health check | JSON |
| `GET /api/metrics` | Prometheus metrics | Text |
| `GET /api/v1/queue/stats` | Queue statistics | JSON |
| `GET /api/v1/cache/admin` | Cache metrics | JSON |

## Health Check Interpretation

| Status | Meaning | Action |
|---|---|---|
| `healthy` | All checks passing | None |
| `degraded` | Non-critical failure | Investigate within 24h |
| `unhealthy` | Critical failure | Immediate investigation |

## Prometheus Metrics

Key metrics to monitor:

```
# Application metrics
app_requests_total{status="success"}
app_requests_total{status="error"}
app_requests_latency_seconds

# Infrastructure metrics
infra_memory_heap_bytes
infra_cpu_usage_ratio
infra_connections_active

# Queue metrics
queue_size
queue_failed_total
queue_processing_latency_seconds

# Cache metrics
cache_hit_ratio
cache_size
cache_latency_seconds

# Treasury metrics
treasury_cash_position_total
treasury_transfers_total
treasury_fx_exposure
```

## Alert Thresholds

| Alert | Threshold | Severity |
|---|---|---|
| High error rate | > 1% errors | Critical |
| High latency | P95 > 5s | Critical |
| Cache hit rate | < 70% | Warning |
| Queue backlog | > 1000 messages | Warning |
| Memory usage | > 90% heap | Critical |
| CPU usage | > 80% sustained | Warning |

## Grafana Dashboards

Recommended dashboards:
1. Application Overview — request rate, error rate, latency
2. Infrastructure — CPU, memory, disk, network
3. Queue Monitoring — backlog, processing rates, failures
4. Cache Performance — hit rate, evictions, latency
5. Treasury Operations — cash position, transfers, FX

## Logging

All logs are structured JSON. Query with:

```bash
# View recent errors
kubectl logs -l app=perionyx -n perionyx | grep '"level":"error"'

# Trace specific request
kubectl logs -l app=perionyx -n perionyx | grep "trace_id_here"

# View queue processing
kubectl logs -l app=perionyx -n perionyx | grep '"component":"queue"'
```
