# Enterprise Banking Alerting Framework

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Alert Engine                               │
│                                                                   │
│  ┌────────────┐    ┌────────────┐    ┌──────────────────────┐   │
│  │  Alert     │    │  Cooldown  │    │    Alert Routing     │   │
│  │  Rules     │───►│  Manager   │───►│                      │   │
│  │            │    │            │    │  ┌─────────────────┐ │   │
│  │ • Enabled  │    │ • Per-cat  │    │  │  ALERT CREATED  │ │   │
│  │ • Severity │    │ • Per-conn │    │  └─────────────────┘ │   │
│  │ • Cooldown │    │ • Duration │    │         │            │   │
│  └────────────┘    └────────────┘    │         ▼            │   │
│                                       │  ┌─────────────────┐ │   │
│                                       │  │  ACKNOWLEDGED   │ │   │
│                                       │  └─────────────────┘ │   │
│                                       │         │            │   │
│                                       │         ▼            │   │
│                                       │  ┌─────────────────┐ │   │
│                                       │  │   RESOLVED      │ │   │
│                                       │  └─────────────────┘ │   │
│                                       └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Alert Severity Levels

| Severity | Color | Response Time | Meaning |
|---|---|---|---|
| INFO | Blue | N/A | Informational, no action needed |
| WARNING | Yellow | 24 hours | Potential issue, monitor |
| CRITICAL | Orange | 1 hour | Service impacted, action required |
| EMERGENCY | Red | Immediate | Service down, immediate response |

## Alert Categories (16)

| ID | Category | Default Severity | Auto-resolve |
|---|---|---|---|
| 1 | PROVIDER_DOWN | EMERGENCY | Yes |
| 2 | PROVIDER_DEGRADED | WARNING | Yes |
| 3 | CONNECTION_FAILED | CRITICAL | No |
| 4 | CREDENTIAL_EXPIRING | WARNING | No |
| 5 | CREDENTIAL_EXPIRED | CRITICAL | No |
| 6 | SYNC_FAILED | CRITICAL | No |
| 7 | SYNC_STALLED | WARNING | Yes |
| 8 | BALANCE_MISMATCH | WARNING | No |
| 9 | LATENCY_SPIKE | WARNING | No |
| 10 | RATE_LIMIT_EXCEEDED | WARNING | Yes |
| 11 | AUTH_FAILURE | CRITICAL | No |
| 12 | PERMISSION_CHANGED | WARNING | No |
| 13 | WEBHOOK_INACTIVE | WARNING | Yes |
| 14 | DUPLICATE_IMPORT | INFO | No |
| 15 | ACCOUNT_DORMANT | INFO | No |
| 16 | CHECKPOINT_STALE | WARNING | Yes |

## Alert Lifecycle

```
                    ┌─────────────────────────────────────┐
                    │           CREATED                    │
                    │  severity: INFO/WARNING/CRITICAL/    │
                    │           EMERGENCY                  │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │         ACKNOWLEDGED                 │
                    │  User acknowledges alert             │
                    │  Stops further escalation            │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │          RESOLVED                    │
                    │  Issue fixed                         │
                    │  Auto or manual resolution           │
                    └─────────────────────────────────────┘
```

## Cooldown System

Alerts implement cooldowns to prevent alert storms:

```
cooldownKey = `${category}::${connectionId ?? "global"}`
cooldownDuration = max(defaultCooldown, rule.cooldownMinutes)

For example:
  PROVIDER_DOWN::global → 15 minutes between alerts
  CREDENTIAL_EXPIRING::conn-123 → 1440 minutes (24h) between alerts
```

## Alert Rules Configuration

Each rule defines:
- **category**: The alert category
- **severity**: Default severity level
- **enabled**: Whether the rule is active
- **threshold**: Threshold value for triggering
- **cooldownMinutes**: Minimum time between duplicate alerts

## Alert Flow Sequence

```
ProviderMonitor        AlertEngine         HistoryTracker       Dashboard
    │                     │                     │                  │
    │  checkAllProviders  │                     │                  │
    │────────────────────►│                     │                  │
    │                     │                     │                  │
    │  return results     │                     │                  │
    │◄────────────────────│                     │                  │
    │                     │                     │                  │
    │  evaluateAll()      │                     │                  │
    │                     │                     │                  │
    │                     ├── Check cooldowns   │                  │
    │                     ├── Check rules       │                  │
    │                     ├── Create alerts     │                  │
    │                     │                     │                  │
    │                     │  recordIncident()   │                  │
    │                     │────────────────────►│                  │
    │                     │                     │                  │
    │                     │  recordHistory()    │                  │
    │                     │────────────────────►│                  │
    │                     │                     │                  │
    │                     │                     │  generate()      │
    │                     │                     │─────────────────►│
    │                     │                     │                  │
    │                     │                     │  refresh()       │
    │                     │                     │◄─────────────────│
    │                     │                     │                  │
```

## Audit Trail

Every alert lifecycle event is recorded:
- **Created**: Timestamp, severity, category, source
- **Acknowledged**: Timestamp, user ID
- **Resolved**: Timestamp, resolution method (auto/manual)
- **Incident**: Linked alert with duration and resolution details
