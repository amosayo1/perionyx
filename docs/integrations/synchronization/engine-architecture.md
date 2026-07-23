# Synchronization Engine Architecture (Phase 12A.3)

## Overview

The Synchronization Engine is the centralized, production-grade platform that powers every integration in Perionyx. All synchronization logic is encapsulated here — business modules never implement sync logic directly.

## Architecture

```
SynchronizationEngine (top-level facade)
│
├── SyncCoordinator (orchestrates sessions)
│   ├── createSession()
│   ├── executeSync()
│   ├── performFullSync()
│   └── performIncrementalSync()
│
├── session.ts          → Session lifecycle (create, update, status, cleanup)
├── state.ts            → Sync state per connection (cursors, change tracking)
├── checkpoint.ts       → Checkpoint persistence with history (100 per session)
├── checkpoint-manager.ts → High-level checkpoint advancement + snapshots
├── metrics.ts          → Per-session + global metrics (records, conflicts, retries)
├── result.ts           → Summary builders, progress, throughput calculation
├── context.ts          → SyncContext with abort signal support
│
├── modes.ts            → 9 sync modes (full, incremental, delta, one_way,
│                          bidirectional, realtime, scheduled, manual, recovery)
├── change-detector.ts  → Timestamp/version/hash comparison, soft delete
├── conflict-detector.ts → Version, duplicate, schema, deleted-record conflicts
├── conflict-resolver.ts → 8 policies + custom resolver registration
├── idempotency.ts      → Operation hashes, duplicate detection, replay protection
├── batch-processor.ts  → Adaptive batch sizing, parallel processing, backpressure
├── recovery.ts         → Crash recovery, backoff, power interruption detection
├── retry-orchestrator.ts → Retry budgets, circuit breaker readiness, dead-letter
├── scheduler.ts        → Cron/interval/priority scheduling with timer support
├── observability.ts    → Metrics emission, structured logging, domain events
├── security.ts         → Tenant isolation, permission enforcement, scope validation
│
└── mock-validation.ts  → 8 mock provider validation routines
```

## Sync Modes

| Mode | Description | Direction | Use Case |
|---|---|---|---|
| full | Complete re-sync of all records | import/export | Initial load, recovery |
| incremental | Only records changed since last sync | import/export | Daily operations |
| delta | Only new/changed records, no full scan | import | High-volume, low-latency |
| one_way | Source → Destination only | import | Simple data import |
| bidirectional | Two-way sync with conflict resolution | bidirectional | Shared data sources |
| realtime | Continuous near-real-time sync | import | Live dashboards |
| scheduled | Cron or interval-based sync | import/export | Automated operations |
| manual | User-initiated on-demand sync | import/export | One-off requests |
| recovery | Resume failed sync from last checkpoint | import | Crash recovery |

## Change Detection

Three comparison methods:
- **Timestamp**: Compare `updatedAt` fields
- **Version**: Compare version strings (e.g., `"v3"` → `"v4"`)
- **Hash**: Compute stable JSON hash and compare

Also detects: new records, changed records, deleted records (hard + soft delete).

## Conflict Detection + Resolution

### Detection
- Version conflicts (same record, different versions)
- Duplicate records (same ID or match field)
- Schema conflicts (field type mismatch)
- Deleted record conflicts (one side deleted, other modified)

### Resolution Policies
| Policy | Behavior |
|---|---|
| source_wins | Remote data replaces local |
| destination_wins | Local data kept |
| newest_wins | Compare timestamps |
| oldest_wins | Keep older version |
| merge_fields | Deep merge with remote overwriting |
| manual_review | Flagged for manual resolution |
| business_rule | Version + timestamp heuristic |
| custom | Register per-entity resolver |

## Checkpointing

- Every batch saves a checkpoint (cursor, offset, page, processed count)
- Up to 100 checkpoints retained per session
- Snapshots can be taken at any point for full state capture
- Recovery restores from latest checkpoint
- Recovery state tracks failure count, reason, attempts

## Idempotency

- `createIdempotencyKey()` generates unique key per connection + mode
- Operations registered with key + hash of options
- Duplicate detection prevents re-execution within 24h window
- Completed results return immediately for repeated calls
- Replay protection via `isDuplicate()` / `hasBeenCompleted()`

## Batch Processing

- Configurable: min/max/target batch size, concurrency, backpressure
- Adaptive sizing: adjusts batch size based on processing time
- Parallel processing with configurable concurrency
- Chunk array splitting for large datasets

## Retry Orchestration

- Exponential backoff with jitter
- Configurable retry policy (max retries, base/max delay)
- Retryable error classification (ConnectionError, RateLimitError, etc.)
- Retry budgets (total, remaining, window-based reset)
- Circuit breaker readiness (threshold + cooldown)
- Dead-letter callback for exhausted retries

## Failure Recovery

- `canRecover()` checks if session can be resumed
- `attemptRecovery()` restores from last checkpoint
- `recoverWithBackoff()` exponential backoff with configurable max attempts
- Detection: power interruption, API failure, timeout
- Recovery state persists failure count, last error, checkpoint

## Scheduling

- Create/update/delete schedules
- Cron expression or interval-based
- Priority queues (higher priority runs first)
- Timer support with start/stop
- `getDueSchedules()` returns schedules ready for execution
- Mark runs with `markScheduleRun()`

## Observability

Per-sync metrics emitted to Prometheus:
- records_synced, records_failed, records_skipped
- conflicts_detected, conflicts_resolved
- retries, batches_completed, checkpoints, recoveries
- duration_ms, throughput, average_batch_time_ms

Domain events emitted: sync.started, sync.completed, sync.failed

## Security

- Tenant isolation: every sync validated against companyId
- Permission validation: required permissions checked against user permissions
- Scope validation: entity types restricted to provider's allowed set
- Checkpoint sanitization: sensitive fields redacted (tokens, secrets, passwords)
- Sync options validation: batch size, concurrency, timeout bounds

## Mock Validation

8 mock provider validation routines exercise the full engine:
- ERP, Bank, CRM, Payroll, HR, Storage, Identity, Email
- Test: session creation, change detection, conflict detection + resolution
- Test: capability discovery, health checks, sync operations
- Test: recovery attempt, checkpoint management
- All return structured results with pass/fail, errors, and metrics

## Scalability Assessment

> **If we synchronize 10M invoices, 2M journal entries, 500K customers, 250K vendors, 100M bank transactions — would any architectural redesign be required?**

**No.** The engine is designed for this scale:
- **Batch processing** with adaptive sizing handles any volume through configurable batch windows
- **Checkpointing** ensures no data loss on interruption
- **Idempotency** guarantees safe retry without duplication
- **Concurrent sessions** are isolated per connection/company
- **Memory** via chunked arrays (not full-load into RAM)
- **Parallel processing** with configurable concurrency
- **Metrics** throttle at counters, not data inspection
- **No provider-specific code** — all scaling is in the engine layer

The only infrastructure requirement would be sufficient database throughput for checkpoint persistence at scale, which is an operational concern, not an architectural one.
