# Integration Guide

## Quick Start

```typescript
import { initializeInfrastructure, cacheManager } from "@/server/infrastructure";

// One call to initialize everything
await initializeInfrastructure();

// Start using cache
await cacheManager.set("key", value);
const cached = await cacheManager.get("key");
```

## Gradual Adoption

### Step 1: Add Cache to a Module

```typescript
import { cacheManager } from "@/server/infrastructure";

export class TreasuryService {
  async getCashPosition(id: string): Promise<CashPosition> {
    const cacheKey = `treasury:cp:${id}`;
    const cached = await cacheManager.get(cacheKey);
    if (cached) return cached as CashPosition;

    const position = await this.repository.findById(id);
    await cacheManager.set(cacheKey, position, { ttlMs: 5000 }); // 5s TTL
    return position;
  }
}
```

### Step 2: Protect Critical Sections with Locks

```typescript
import { lockManager } from "@/server/infrastructure";

export class TreasuryService {
  async updateFxRates(): Promise<void> {
    await lockManager.withLock("treasury:fx-update", async () => {
      const rates = await fetchFxRates();
      await this.repository.saveRates(rates);
    }, { ttlMs: 10000 });
  }
}
```

### Step 3: Offload Work to Queues

```typescript
import { queueManager } from "@/server/infrastructure";

export class NotificationService {
  async send(notification: Notification): Promise<void> {
    const queue = queueManager.getQueue("notification");
    await queue.enqueue({
      type: "notification:send",
      payload: notification,
      priority: 3,
    });
  }
}
```

### Step 4: Monitor Health

```typescript
import { getHealthReport } from "@/server/observability/health";

// Expose as /health endpoint
export async function GET() {
  const report = await getHealthReport();
  return Response.json(report, {
    status: report.status === "unhealthy" ? 503 : 200,
  });
}
```

## Migration from In-Memory to Redis

1. Set `CACHE_PROVIDER=redis` and `REDIS_HOST=<host>` environment variables
2. Set `LOCK_PROVIDER=redis` for distributed locking across processes
3. Initialize with `await initializeInfrastructure()` — Redis providers will be used automatically
4. Graceful degradation: if Redis is unavailable, cache falls back to in-memory

## Testing with In-Memory Providers

```typescript
describe("TreasuryService", () => {
  beforeAll(async () => {
    await initializeInfrastructure();
  });

  afterAll(async () => {
    await shutdownInfrastructure();
  });
});
```

No Redis or database needed — all providers default to in-memory for CI/CD.
