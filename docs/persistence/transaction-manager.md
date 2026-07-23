# Transaction Manager

## Overview

The Transaction Manager handles the lifecycle of database transactions, including nested transactions, optimistic locking, deadlock detection, and automatic retry policies.

## ITransactionManager

| Method | Description |
|---|---|
| `begin()` | Start a new transaction |
| `commit(tx)` | Commit a transaction |
| `rollback(tx)` | Rollback a transaction |
| `transaction(fn, retryPolicy?)` | Execute with auto retry |
| `createSavepoint(tx, name)` | Create savepoint |
| `releaseSavepoint(tx, name)` | Release savepoint |
| `rollbackToSavepoint(tx, name)` | Rollback to savepoint |
| `getActiveTransaction()` | Get active transaction |

## Features

### Nested Transactions

Transactions can be nested. Only the outermost transaction commits changes to the store.

### Optimistic Locking

Supports version tokens for concurrency detection via `ConcurrencyError`.

### Automatic Retry

```typescript
const result = await transactionManager.transaction(
  async (tx) => {
    const user = await userRepo.findById("123");
    return userRepo.update("123", { ...user, balance: user.balance + 100 });
  },
  {
    maxAttempts: 3,
    baseDelayMs: 50,
    maxDelayMs: 1000,
    retryableErrors: ["CONCURRENCY_ERROR", "DEADLOCK"],
  },
);
```

### Retry Policy

| Option | Default | Description |
|---|---|---|
| `maxAttempts` | 3 | Maximum retry attempts |
| `baseDelayMs` | 50 | Initial delay in ms |
| `maxDelayMs` | 1000 | Maximum delay in ms |
| `retryableErrors` | ["CONCURRENCY_ERROR", "DEADLOCK"] | Error codes that trigger retry |

### Deadlock Detection

The manager tracks deadlock occurrences and applies exponential backoff for retries.

### Correlation IDs

Each transaction can carry a correlation ID for tracing across services.
