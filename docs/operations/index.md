# Operations Runbooks

## Runbook Index

| Runbook | Description | Priority |
|---|---|---|
| [Startup](startup-runbook.md) | Application startup sequence, validation, failure scenarios | High |
| [Shutdown](shutdown-runbook.md) | Graceful shutdown, timeouts, forceful vs graceful | High |
| [Deployment](deployment-guide.md) | Dev/staging/prod deployment via Docker + K8s | High |
| [Rollback](rollback-guide.md) | K8s/Docker rollback + DB migration rollback | High |
| [Incident Response](incident-response.md) | P0-P3 incident flow, common incidents, communication | High |
| [Recovery](recovery-guide.md) | App crash, DB failure, Redis failure, region outage | High |
| [Alert Response](alert-response.md) | Alert rules, thresholds, cooldowns, escalation | Medium |
| [Monitoring](monitoring-guide.md) | Metrics endpoints, alert thresholds, Grafana dashboards | Medium |
| [Scaling](scaling-guide.md) | HPA config, manual scaling, DB read replicas, PgBouncer | Medium |
| [Maintenance](maintenance-guide.md) | Daily/weekly/monthly/quarterly tasks | Medium |
| [Troubleshooting](troubleshooting.md) | Common issues, debug commands, solutions | Medium |
| [On-call](oncall-guide.md) | Alert response, incident flow, escalation criteria | Medium |
| [DR Validation](disaster-recovery-validation.md) | Recovery scenarios, validation results | High |

## Quick Links

- **Health**: `GET /api/health` | `GET /api/health/readiness` | `GET /api/health/liveness` | `GET /api/health/report`
- **Metrics**: `GET /api/metrics` (Prometheus format) | `GET /api/metrics/json`
- **Queue**: `GET /api/v1/queue/stats`
- **Alerts**: `GET /api/v1/alerting/stats`
- **Operations Dashboard**: `/system/operations`
- **Deployment Dashboard**: `/system/deployment`
- **Performance Dashboard**: `/system/performance`
- **Status Dashboard**: `/system/status`

## Version

Platform version: v1.0.0
Documentation updated: July 2026
