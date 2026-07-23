# Migration Framework

## Overview

The migration framework provides a structured way to manage schema changes over time. It includes version tracking, dependency ordering, validation, and rollback support.

## Architecture

```
MigrationRunner
  └── MigrationEngine
        ├── MigrationHistory (records)
        └── Migration[] (definitions)
```

## Migration Definition

```typescript
abstract class Migration {
  abstract name: string;
  abstract version: MigrationVersion; // { major, minor, patch }
  abstract description: string;

  abstract up(): Promise<void>;
  abstract down(): Promise<void>;

  async validate(): Promise<boolean>;
  async seed(): Promise<void>;
}
```

## Migration History

Tracks which migrations have been applied with status, timestamps, checksums, and batch IDs.

| Status | Description |
|---|---|
| Pending | Not yet applied |
| Running | Currently being applied |
| Completed | Successfully applied |
| Failed | Error during application |
| RolledBack | Reverted |

## MigrationEngine

The engine handles:

- **Registration** — Migrations are registered, optionally with topological sorting for dependency ordering
- **Execution** — Runs migrations in version order
- **Validation** — Validates pending migrations before executing
- **Rollback** — Supports rolling back individual migrations, all migrations, or to a specific version
- **Dependency Ordering** — Automatic topological sort prevents circular dependencies

## MigrationRunner

High-level interface for executing migrations:

```typescript
const runner = new MigrationRunner();

// Register migrations
runner.register(new CreateUsersTable());
runner.registerMany([new CreateAccountsTable(), new CreateTransactionsTable()]);

// Execute
const result = await runner.runAll();
console.log(result.success, result.errors);

// Rollback
await runner.rollback("create_users_table");
await runner.rollbackAll();
await runner.rollbackTo({ major: 1, minor: 0, patch: 0 });

// Status
const status = await runner.status();
console.log(`${status.applied}/${status.total} migrations applied`);
```

## Checksums

Each migration generates a deterministic checksum from its name and version to detect tampering.
