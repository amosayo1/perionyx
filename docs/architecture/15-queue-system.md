# 15 — Queue System

---

## Architecture

The queue system has two layers:

1. **Production Job Queue** (`src/modules/queue/`) — PgBoss-based with typed job payloads and registered handlers
2. **Infrastructure Queue Manager** (`src/server/queues/`) — facade over in-memory queues with worker pools, retry, and dead-letter routing

## PgBoss Job Queue

### Job Types

**File**: `src/modules/queue/job-types.ts`

| Job Type | Payload | Purpose |
|---|---|---|
| `notification-email` | `NotificationJobPayload` | Email notification delivery |
| `notification-slack` | `NotificationJobPayload` | Slack notification delivery |
| `notification-connector` | `NotificationJobPayload` | Connector notification delivery |
| `workflow-execute` | `WorkflowJobPayload` | Start/resume/step workflow execution |
| `ai-analysis` | `AiJobPayload` | AI-powered financial analysis |
| `ai-forecast` | `AiJobPayload` | AI-based forecasting |
| `ai-narrative` | `AiJobPayload` | Narrative generation |
| `ai-extraction` | `AiJobPayload` | Data extraction |
| `ai-risk` | `AiJobPayload` | Risk assessment |
| `report-generate` | `ReportJobPayload` | Report generation (CSV/JSON) |
| `connector-sync` | `ConnectorSyncJobPayload` | Connector data sync |

Every payload extends `BaseJobPayload` with `tenantId`, `userId`, `correlationId`, and `requestId`.

### Registered Job Handlers

**File**: `src/modules/queue/jobs/` (10 handler files)

| Handler | Job | Behavior |
|---|---|---|
| `webhook-send.job.ts` | Webhook delivery | Sends webhook payloads to registered endpoints |
| `webhook-retry.job.ts` | Webhook retry | Retries failed webhook deliveries with backoff |
| `briefing-generate.job.ts` | Morning briefing | Generates daily financial briefing |
| `report-generate.job.ts` | Report generation | Generates financial reports in requested format |
| `alert-engine.job.ts` | Alert evaluation | Evaluates alert conditions and creates alerts |
| `intelligence-snapshot.job.ts` | Intelligence snapshot | Computes and stores intelligence score snapshot |
| `fx-sync.job.ts` | FX rate sync | Synchronizes foreign exchange rates |
| `notification-delivery.job.ts` | Notification delivery | Delivers notifications via email, Slack, or connector |
| `anomaly-detection.job.ts` | Anomaly detection | Runs anomaly detection on transaction data |

### Queue Service

`src/modules/queue/queue.service.ts` wraps PgBoss operations:
- `enqueue(queue, payload)` — add job to queue
- `cancelJob(queue, id)` — cancel a queued job
- `getJobStatus(queue, id)` — retrieve job status
- `scheduleCron(name, cron, data)` — schedule recurring jobs
- `unscheduleCron(name)` — remove cron schedule
- `registerHandler(jobType, handler)` — register worker for job type

## Infrastructure Queue Manager

**Location**: `src/server/queues/`

### Default Queues

**File**: `default-queues.ts` — 8 pre-configured queues:

| Queue | Type | Concurrency | Rate Limit/min | Max Retries | DLQ |
|---|---|---|---|---|---|
| `sync` | FIFO | 5 | 100 | 3 | `sync-dlq` |
| `forecast` | Priority | 3 | 20 | 2 | `forecast-dlq` |
| `payment` | FIFO | 10 | 200 | 5 | `payment-dlq` |
| `notification` | FIFO | 20 | 500 | 3 | `notification-dlq` |
| `alert` | Priority | 5 | 100 | 3 | `alert-dlq` |
| `metrics` | FIFO | 2 | 50 | 1 | `metrics-dlq` |
| `audit` | FIFO | 3 | 200 | 2 | `audit-dlq` |
| `recommendation` | Priority | 2 | 10 | 1 | `recommendation-dlq` |

### Queue Manager

`QueueManager` (`queue-manager.ts`) implements the `IQueueManager` interface:

```
QueueManager
├── createQueue(config) → IQueue
├── getQueue(name) → IQueue
├── registerWorker(queueName, handler)
├── unregisterWorker(queueName)
├── start() — begins polling all queues
├── stop() — stops all workers
└── getAggregateMetrics() → Record<queueName, QueueMetrics>
```

Queues are backed by `MemoryQueue` (in-memory implementation of `IQueue`).

### Queue Types

- **FIFO**: First-in, first-out processing order
- **Priority**: Messages processed by priority value (higher = first)
- **Delayed**: Messages scheduled for future processing
- **Scheduled**: Recurring messages based on cron expressions

### Retry & Failure

- Configurable `maxRetries` and `retryDelayMs` per queue
- Exponential backoff on retry
- Dead-letter queues (DLQ) for messages exceeding max retries
- Error logging to `QueueError` types (`QueueNotFoundError`, `QueueFullError`, etc.)

### Metrics

`QueueManager.getAggregateMetrics()` returns per-queue:
- Queue depth (pending message count)
- Processing rate (messages per second)
- Error rate
- Average latency

## Notification Service Integration

The notification service (`src/modules/notifications/notifications.service.ts`) enqueues email and Slack deliveries to PgBoss instead of processing inline. The `notification-delivery` handler registered in `src/modules/queue/jobs/index.ts` processes these jobs asynchronously.
