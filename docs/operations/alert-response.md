# Alert Response Guide

## Alert Rules

| Rule ID | Severity | Category | Description | Threshold |
|---|---|---|---|---|
| db-connectivity | critical | database | Database unreachable | 1 failure |
| db-query-latency | warning | database | Query latency > 1s | 1000ms |
| cache-connectivity | warning | cache | Cache provider unreachable | 1 failure |
| queue-backlog | warning | queue | Backlog > 10,000 messages | 10000 |
| queue-failed | warning | queue | Failed/dead-letter > 100 | 100 |
| high-memory | warning | system | Heap usage > 90% | 90% |
| auth-failures | warning | security | Auth failures > 50 | 50 |
| system-cpu | warning | system | CPU usage > 80% | 80% |

## Viewing Alerts

```
# All active alerts
GET /api/v1/alerting/alerts

# Alert stats
GET /api/v1/alerting/stats

# Health report (includes alert context)
GET /api/health/report
```

## Acknowledging Alerts

```bash
curl -X POST /api/v1/alerting/alerts/{id}/acknowledge \
  -H "Content-Type: application/json" \
  -d '{"userId": "ops-user"}'
```

## Alert Cooldowns

Each alert rule has a configurable cooldown period to prevent alert fatigue:

| Rule | Cooldown | Duration before re-firing |
|---|---|---|
| db-connectivity | 60s | 1 min |
| db-query-latency | 120s | 2 min |
| cache-connectivity | 60s | 1 min |
| queue-backlog | 300s | 5 min |
| queue-failed | 300s | 5 min |
| high-memory | 120s | 2 min |
| auth-failures | 600s | 10 min |
| system-cpu | 300s | 5 min |

## Auto-Resolution

Alerts auto-resolve when the evaluation returns `firing: false`. For example:
- `high-memory` resolves when heap drops below 90%
- `queue-backlog` resolves when backlog drops below 10,000
- `db-connectivity` resolves when database is reachable again

## Escalation

If an alert remains unresolved after:

| Time Elapsed | Action |
|---|---|
| 5 min (P0) | Notify primary on-call |
| 15 min (P0) | Notify engineering lead |
| 30 min (P0) | Declare incident, page all engineers |
| 1 hour (P1) | Escalate to senior engineer |
| 4 hours (P2) | Create ticket for next sprint |
