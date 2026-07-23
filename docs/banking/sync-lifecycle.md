# Sync Lifecycle

## State Machine

```
                    ┌─────────────────────────────────────┐
                    │              QUEUED                  │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │            PREPARING                 │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │         AUTHENTICATING               │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │          DOWNLOADING                 │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │          PROCESSING                  │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │         RECONCILING                  │
                    └──┬───────┬───────────┬──────────────┘
                       │       │           │
              ┌────────▼──┐ ┌──▼────────┐ ┌▼──────────────┐
              │ COMPLETED │ │  PARTIAL  │ │   RETRYING    │
              └───────────┘ │  SUCCESS  │ └───┬───────────┘
                            └───────────┘     │
                                     ┌───────▼───────────┐
                                     │      FAILED       │
                                     └───────────────────┘

              CANCELLED (from any active state)
```

## State Transitions

| From | To | Condition |
|---|---|---|
| QUEUED | PREPARING | Job dequeued for processing |
| QUEUED | CANCELLED | User cancellation |
| PREPARING | AUTHENTICATING | Validation complete |
| PREPARING | CANCELLED | User cancellation |
| AUTHENTICATING | DOWNLOADING | Credentials verified |
| AUTHENTICATING | RETRYING | Auth failure, retryable |
| AUTHENTICATING | FAILED | Auth failure, non-retryable |
| DOWNLOADING | PROCESSING | Data received |
| DOWNLOADING | RETRYING | Download error, retryable |
| DOWNLOADING | FAILED | Download error, non-retryable |
| PROCESSING | RECONCILING | Processing complete |
| PROCESSING | RETRYING | Processing error, retryable |
| PROCESSING | FAILED | Processing error, non-retryable |
| RECONCILING | COMPLETED | All checks pass |
| RECONCILING | PARTIAL_SUCCESS | Some issues found |
| RECONCILING | RETRYING | Reconciliation error, retryable |
| RECONCILING | FAILED | Reconciliation error, non-retryable |
| RETRYING | PREPARING | Retry attempt starts |
| RETRYING | FAILED | Max retries exhausted |
| RETRYING | CANCELLED | User cancellation |

## Sync Lifecycle Sequence

```
User/Scheduler     SyncEngine          Queue         StateMachine    Provider
     │                 │                 │               │             │
     │   sync()       │                 │               │             │
     │───────────────►│                 │               │             │
     │                │  enqueue(job)   │               │             │
     │                │────────────────►│               │             │
     │                │                 │ register      │             │
     │                │                 │──────────────►│             │
     │                │                 │  QUEUED       │             │
     │                │                 │               │             │
     │                │   processJob()  │               │             │
     │                │◄────────────────│               │             │
     │                │  transition     │               │             │
     │                │  QUEUED→PREPARE │               │             │
     │                │────────────────────────────────►│             │
     │                │                 │               │             │
     │                │  transition     │               │             │
     │                │  PREPARE→AUTH   │               │             │
     │                │────────────────────────────────►│             │
     │                │                 │               │             │
     │                │  transition     │               │             │
     │                │  AUTH→DOWNLOAD  │               │             │
     │                │────────────────────────────────►│             │
     │                │                 │               │             │
     │                │  fetchTransactions()             │             │
     │                │──────────────────────────────────────────────►│
     │                │                 │               │             │
     │                │◄──────────────────────────────────────────────┤
     │                │                 │               │             │
     │                │  transition     │               │             │
     │                │  DOWNLOAD→PROC  │               │             │
     │                │────────────────────────────────►│             │
     │                │                 │               │             │
     │                │  transition     │               │             │
     │                │  PROC→RECONCILE │               │             │
     │                │────────────────────────────────►│             │
     │                │                 │               │             │
     │                │  transition     │               │             │
     │                │  RECONCILE→DONE │               │             │
     │                │────────────────────────────────►│             │
     │                │                 │               │             │
     │                │  recordMetrics()│               │             │
     │                │                 │               │             │
     │◄───────────────│                 │               │             │
  jobId returned      │                 │               │             │
```

## Retry Lifecycle

```
Sync Job
    │
    ├── Attempt 1 ──► FAILED (transient error)
    │                    │
    │                    ▼
    │              RETRYING
    │                    │
    │                    ├── Backoff: 1 min
    │                    │
    ├── Attempt 2 ──► FAILED (transient error)
    │                    │
    │                    ▼
    │              RETRYING
    │                    │
    │                    ├── Backoff: 2 min (exponential)
    │                    │
    ├── Attempt 3 ──► FAILED (transient error)
    │                    │
    │                    ▼
    │              RETRYING
    │                    │
    │                    ├── Backoff: 4 min (exponential)
    │                    │
    ├── Attempt 4 ──► FAILED
    │                    │
    │                    ▼
    │             DEAD LETTER QUEUE
    │
    Max retries (3) exceeded

    Note: Backoff = baseBackoff × 2^(retryCount)
    Max backoff capped at 5 minutes
```

## Health Monitoring

### Alert Thresholds
- Success rate < 80% → WARNING
- Success rate < 50% → CRITICAL
- 3+ consecutive failures → CRITICAL
- Data freshness > 120 minutes → DEGRADED

### Health Snapshots
- Overall status: HEALTHY / DEGRADED / UNHEALTHY
- Per-connection metrics: total syncs, success/fail counts
- Data freshness: last sync time per account
- Active alerts: categorized by severity

### Metrics Aggregation
- Time periods: 1 hour, 24 hours, 7 days, 30 days
- Percentiles: P50, P95, P99 for duration
- Distribution: by trigger type, mode, and state
- Throughput: syncs per minute
