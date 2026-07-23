# Persistence Diagnostics

## Overview

The diagnostics system provides detailed analysis and reporting on persistence infrastructure performance, health, and potential issues.

## PersistenceDiagnostics

Collects performance metrics and generates comprehensive reports.

## Report Types

### Full Diagnostics Report

```typescript
interface PersistenceDiagnosticsReport {
  generatedAt: Date;
  provider: PersistenceProvider;
  repositoryStats: RepositoryStatistics[];
  performance: PerformanceSummary;
  migration: MigrationSummary;
  health: HealthSummary;
  warnings: string[];
  recommendations: string[];
}
```

### Repository Statistics

| Field | Description |
|---|---|
| name | Repository name |
| operationCount | Total operations performed |
| errorCount | Total errors |
| averageLatencyMs | Average operation latency |
| status | healthy / unhealthy |

### Performance Summary

| Field | Description |
|---|---|
| totalOperations | All operations |
| totalErrors | All errors |
| averageLatencyMs | Average across all repos |
| p99LatencyMs | P99 latency |
| operationsByType | Breakdown by operation type |
| errorsByRepository | Error distribution |

### Migration Summary

| Field | Description |
|---|---|
| totalMigrations | Registered migrations |
| appliedMigrations | Completed migrations |
| pendingMigrations | Unapplied migrations |
| failedMigrations | Failed migrations |
| lastAppliedDate | Most recent application |

### Health Summary

| Field | Description |
|---|---|
| status | healthy / degraded / unhealthy |
| healthScore | 0-100 composite score |
| repositoryCount | Total repositories |
| activeTransactions | Current transaction count |
| uptimeMs | System uptime |
| provider | Active provider |

## Warnings and Recommendations

The diagnostics system generates actionable warnings and recommendations:

**Warnings:**
- Repositories with high error counts (>10)
- High average latency (>500ms)
- P99 latency > 2000ms
- Error rate > 10%

**Recommendations:**
- Connection pooling or read replicas for latency issues
- Retry logic for error-heavy repositories
- Circuit breakers for failing repositories
- Query optimization for slow operations

## Usage

```typescript
import { PersistenceDiagnostics } from "@/server/persistence";

const diagnostics = new PersistenceDiagnostics();

// Record operations
diagnostics.recordOperation("users", "findMany", 45);
diagnostics.recordError("users");

// Generate reports
const fullReport = await diagnostics.generateFullReport();
const repoStats = await diagnostics.generateRepositoryStatistics();
const perfSummary = await diagnostics.generatePerformanceSummary();
const migrationSummary = await diagnostics.generateMigrationSummary();
const healthSummary = await diagnostics.generateHealthSummary();
```
