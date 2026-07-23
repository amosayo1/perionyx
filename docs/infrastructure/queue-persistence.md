# Queue Persistence

## Overview

The queue system provides async message processing with support for FIFO, priority, delayed, and scheduled queues. Built as a lightweight in-memory implementation with a manager that handles worker registration, polling, rate limiting, and dead-letter routing.

## Architecture

```
QueueManager (facade) → MemoryQueue[]
  ├── createQueue(config) → IQueue
  ├── registerWorker(name, handler)
  ├── start() / stop()
  ├── enqueue / dequeue / acknowledge / reject
  └── getAggregateMetrics()
```

## Queue Types

| Type | Behavior |
|---|---|
| `fifo` | First-in-first-out, strict ordering |
| `priority` | Priority-based ordering (1=highest, 5=lowest) |
| `delayed` | Messages delayed until `delayUntil` timestamp |
| `scheduled` | Messages scheduled for `scheduledFor` timestamp |

## Default Queues

| Queue | Concurrency | Max Retries | Timeout | Rate Limit |
|---|---|---|---|---|
| `sync` | 5 | 3 | 5min | 100/min |
| `forecast` | 3 | 2 | 10min | 20/min |
| `payment` | 10 | 5 | 2min | 200/min |
| `notification` | 20 | 3 | 1min | 500/min |
| `alert` | 5 | 3 | 2min | 100/min |
| `metrics` | 2 | 1 | 1min | 50/min |
| `audit` | 3 | 2 | 1min | 200/min |
| `recommendation` | 2 | 1 | 5min | 10/min |

## Dead-Letter Queues

Each queue has a corresponding `{name}-dlq` dead-letter queue. Messages that exceed `maxRetries` are moved to the DLQ for manual inspection.

## Worker Pattern

```typescript
queueManager.registerWorker("notification", async (message, ack, reject) => {
  try {
    await sendNotification(message.payload);
    await ack();
  } catch (err) {
    await reject(true); // requeue with retry
  }
});

await queueManager.start();
```

## Metrics

Each queue exposes:
- enqueued / processed / failed counts
- retry count and dead-letter count
- average latency
- backlog size
- active worker count
