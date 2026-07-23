# Persistence Health Monitoring

## Overview

The persistence health monitoring system provides real-time visibility into the state of all persistence infrastructure, including repositories, transactions, and migrations.

## PersistenceHealthMonitor

Singleton monitor that tracks:

- Repository latency and error counts
- Transaction commit/rollback/failure rates
- Deadlock detection
- Overall health scoring

## Health Report

```typescript
interface PersistenceHealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  provider: PersistenceProvider;
  repositoryCount: number;
  repositories: RepositoryHealth[];
  transaction: TransactionHealth;
  migration: MigrationHealth;
  version: string;
  uptimeMs: number;
  healthScore: number;
}
```

## Repository Health

| Field | Description |
|---|---|
| name | Repository name |
| status | healthy / degraded / unhealthy |
| latencyMs | Average operation latency |
| errorCount | Total errors |
| lastAccessed | Last access timestamp |

## Transaction Health

| Field | Description |
|---|---|
| activeCount | Currently active transactions |
| totalCommitted | Total commits |
| totalRolledBack | Total rollbacks |
| totalFailed | Total failures |
| deadlockCount | Deadlock occurrences |

## Health Score

The health score is calculated from:

- Latency (avg latency / 10, max 100)
- Error rate (% * 20, max 100)
- Transaction failure rate (% * 50, max 100)

| Score | Status |
|---|---|
| 90-100 | Healthy |
| 70-89 | Degraded |
| <70 | Unhealthy |

## Usage

```typescript
import { persistenceHealth } from "@/server/persistence";

// Record operations
persistenceHealth.recordRepositoryAccess("users");
persistenceHealth.recordRepositoryLatency("users", 45);
persistenceHealth.recordRepositoryError("users");
persistenceHealth.recordTransactionCommit();

// Generate report
const report = await persistenceHealth.generateReport();
console.log(`Health: ${report.healthScore} (${report.status})`);
```
