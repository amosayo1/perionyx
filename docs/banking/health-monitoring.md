# Enterprise Banking Health Monitoring

## Architecture

The health monitoring system provides continuous, multi-layered visibility into every provider, connection, account, and synchronization process across the enterprise banking platform.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Health Monitoring System                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     Data Sources                            │ │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐   │ │
│  │  │Provider │  │Connection│  │  Account │  │   Sync    │   │ │
│  │  │ Monitor │  │  Monitor │  │  Monitor │  │  Monitor  │   │ │
│  │  └─────────┘  └──────────┘  └──────────┘  └───────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Processing Layer                         │ │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │ │
│  │  │  Health    │  │Diagnostics │  │    Scoring Engine    │  │ │
│  │  │ Status     │  │  Engine    │  │     (0–100)          │  │ │
│  │  └────────────┘  └────────────┘  └──────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     Output Layer                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Alerts  │  │Dashboard │  │  Metrics │  │ History  │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Monitoring Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Monitoring Cycle                             │
│                                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Check   │───►│  Score   │───►│ Evaluate │───►│  Alert   │  │
│  │ Providers│    │(0–100)   │    │  Alerts  │    │   &      │  │
│  │          │    │          │    │          │    │  Record  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                                                         │
│       │                        ┌──────────────────────────┐     │
│       └────────────────────────►   Diagnostics Engine      │     │
│                                │   (full scan on demand)   │     │
│                                └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Provider Health Monitoring

| Metric | Source | Thresholds |
|---|---|---|
| Availability | Simulated health check | < 98% → WARNING |
| Latency | Simulated response time | > 1s → WARNING, > 3s → CRITICAL, > 5s → EMERGENCY |
| API Version | Provider manifest | Version mismatch → WARNING |
| Auth Status | Simulated auth check | FAILED → CRITICAL |
| Webhook Health | Subscription check | Inactive → WARNING |
| Rate Limits | Usage vs total | > 90% → WARNING |
| Capabilities | Manifest comparison | Missing → INFO |

## Connection Health Monitoring

| Metric | Scoring Impact | Alert Condition |
|---|---|---|
| Connection Status | −30 to −50 | ERROR/REVOKED/EXPIRED |
| Credential Expiry | −10 to −25 | ≤ 7 days → WARNING, ≤ 0 → CRITICAL |
| Failed Syncs | −15 per 3 failures | ≥ 3 failures → WARNING |
| Health Score | 0–100 composite | < 50 → CRITICAL, < 70 → DEGRADED |
| Connection Age | −5 after 90 days | ≥ 90 days → WARNING |
| Reconnect Required | −5 | Status in ERROR |

## Account Health Monitoring

| Metric | Description |
|---|---|
| Activity Status | Active vs dormant (no transactions in 90 days) |
| Balance Staleness | Time since last balance update |
| Currency Issues | Mismatch between account currency and entity currency |
| Ownership Issues | Missing or incomplete legal entity mapping |
| Mapping Completeness | Account mapped to treasury structure |
| Last Imported Transaction | Recency of transaction data |

## Sync Health Monitoring

| Metric | Description |
|---|---|
| Success Rate | Percentage of successful syncs |
| Queue Size | Pending sync jobs |
| Retry Count | Jobs currently in retry state |
| Average Duration | Mean sync execution time |
| Import Speed | Transactions per second |
| Checkpoint Health | Stale vs healthy checkpoints |
| Dead Letter Count | Jobs that exhausted retries |

## Health Scoring Model

Score ranges and their interpretations:

| Score Range | Status | Meaning |
|---|---|---|
| 80–100 | HEALTHY | All systems operational |
| 50–79 | DEGRADED | Some issues, monitoring |
| 20–49 | UNHEALTHY | Significant issues, attention needed |
| 0–19 | DOWN | Service unavailable |

### Scoring Weights

| Component | Weight Factors |
|---|---|
| Provider | Availability (40%), Latency (30%), Auth (20%), Webhook (10%) |
| Connection | Status (40%), Credential (25%), History (20%), Age (15%) |
| Institution | Average of all connection scores |
| Account | Activity, Freshness, Mapping completeness |
| Region | Average of all connection scores in region |
| Overall | Average of all provider + connection scores |

## Data Freshness

- Provider health checks: Every 15 minutes (simulated)
- Connection health assessment: On every status change
- Dashboard data: Cached for 30 seconds
- Metrics retention: 90 days (in-memory, configurable)
- Alert cooldowns: 15–1440 minutes based on category
