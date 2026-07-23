# Migration System

## Architecture

`MigrationRunner` (`src/server/installer/migration-runner.ts`) orchestrates Prisma database migrations with checksum verification, rollback support, and batch tracking.

```
MigrationRunner
│
├── registerMigration(file) / registerMigrations(files[])
├── getPendingMigrations() → file[]
├── getExecutedMigrations() → MigrationRecord[]
├── runPending(version, mode?) → MigrationReport
├── runBatch(files[], version) → MigrationBatch
├── rollbackTarget(version) → boolean
├── rollbackBatch(batchNumber) → boolean
├── verifyMigrations() → { verified, inconsistencies }
└── getMigrationCount() → { total, executed, pending }
```

### Integration with Prisma

On `runPending()`, the runner executes:
```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

It then reads migration history directly from the database:
```sql
SELECT id, migration_name, checksum, finished_at, started_at, applied_steps_count
FROM "_prisma_migrations"
ORDER BY finished_at ASC;
```

This dual approach ensures that the Prisma migration engine handles schema changes while the runner tracks execution metadata.

### MigrationFile structure

```typescript
interface MigrationFile {
  id: string;          // Unique identifier
  name: string;        // Migration name (mirrors Prisma migration name)
  version: string;     // Semver version
  checksum: string;    // SHA-256 or similar checksum
  script: string;      // Migration script content
  rollbackScript?: string; // Optional rollback script
}
```

Registrations validate uniqueness — duplicate `id` values throw an error.

## Checksum Verification

The `verifyMigrations()` method compares checksums between registered `MigrationFile` entries and the database `_prisma_migrations` records:

```typescript
const result = await migrationRunner.verifyMigrations();
if (!result.verified) {
  result.inconsistencies.forEach(issue => {
    console.error(`Migration integrity violation: ${issue}`);
  });
}
```

A checksum mismatch indicates that the migration file was modified after it was applied — a potential integrity or tampering concern. The runner flags any discrepancy as an inconsistency.

## Rollback Support

### Target rollback (mark specific migration as rolled back)
```typescript
await migrationRunner.rollbackTarget("20260713000001_add_treasury_tables");
// Executes: npx prisma migrate resolve --applied "20260713000001_add_treasury_tables"
```

### Batch rollback (revert all successful migrations)
```typescript
await migrationRunner.rollbackBatch(1);
// Iterates history in reverse, marking each as rolled back:
// npx prisma migrate resolve --rolled-back "<migration_name>"
```

## Run Modes

| Mode | Behavior |
|------|----------|
| `"fresh"` | Full deployment — runs all pending migrations |
| `"upgrade"` | Upgrades existing deployment — runs pending migrations |
| `"repair"` | Attempts to fix broken state — runs pending migrations |
| `"validate-only"` | Validates migrations without executing them — skips `prisma migrate deploy` |

Set via the `mode` parameter in `runPending()`:

```typescript
const report = await migrationRunner.runPending("2.1.0", "validate-only");
// report.status → "completed" (validation passed)
```

## Migration Report

Each run produces a `MigrationReport`:

```typescript
interface MigrationReport {
  batches: MigrationBatch[];       // Batches with per-migration results
  totalMigrations: number;         // Total pending
  successfulMigrations: number;    // Successfully applied
  failedMigrations: number;        // Failed
  totalDuration: number;            // Milliseconds
  status: "completed" | "failed";  // Overall status
}
```

## Schema Detection

The runner auto-detects the database schema from `DATABASE_URL`:

```typescript
// From: postgresql://user:pass@host:5432/db?schema=treasury
// Extracts: "treasury"
// Default: "public"
```

This supports multi-schema Prisma setups where migrations are isolated per schema.
