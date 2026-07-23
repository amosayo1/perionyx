# Distributed Locks

## Overview

The lock system provides distributed mutual exclusion for critical sections. It scales from single-process (in-memory) to multi-process (Redis-based) deployments, exposing a unified `ILockManager` interface.

## Architecture

```
LockManager (facade) → RedisDistributedLockManager → in-memory Map
  ├── acquire(name, options?) → ILock
  ├── release(lock) → void
  ├── withLock(name, fn, options?) → T
  ├── acquireHierarchical(hierarchy, options?) → ILock[]
  └── acquireScoped(scope, name, options?) → ILock
```

## ILock Interface

```typescript
interface ILock {
  readonly name: string;
  readonly lockId: string;
  readonly owner: string;
  readonly expiresAt: number;
  readonly acquired: boolean;
  release(): Promise<void>;
  renew(ttlMs?: number): Promise<boolean>;
  isExpired(): boolean;
  isOwnedBy(owner: string): boolean;
}
```

## Lock Options

| Option | Default | Description |
|---|---|---|
| `ttlMs` | 30000 | Time-to-live before automatic release |
| `retryCount` | 3 | Number of retry attempts on contention |
| `retryDelayMs` | 200 | Base delay between retries (exponential backoff) |
| `autoRelease` | true | Whether to auto-release after TTL expiry |
| `leaseRenewalIntervalMs` | undefined | Interval for automatic lease renewal |
| `owner` | `default-{pid}` | Owner identifier |

## Hierarchical Locking

Acquires locks in order (bread-first) and releases in reverse on failure — prevents deadlocks in multi-resource operations.

Example: `acquireHierarchical(["treasury:cp:123", "treasury:fx:USD"])` acquires both locks atomically, releasing the first if the second fails.

## Error Types

| Error | Condition |
|---|---|
| `LockError` | General lock failure |
| `DeadlockError` | Deadlock detected |
| `LeaseExpiredError` | Lock lease expired |
| `OwnershipError` | Ownership mismatch on release |

## Usage Pattern

```typescript
await lockManager.withLock("treasury:fx-update", async () => {
  // Critical section — guaranteed exclusive access
  await updateFxRates();
}, { ttlMs: 10000 });
```
