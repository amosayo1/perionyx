# Backups & Disaster Recovery

## Backup Types

`BackupManager` (`src/server/recovery/backup-manager.ts`) supports two backup types:

| Type | Format | Contents | Command |
|------|--------|----------|---------|
| `database` | `.dump` (pg_dump custom) | Full database via `pg_dump --format=custom --compress=9` | `pg_dump --host ... --dbname ... --file ...` |
| `config` | `.json` | Selected env vars (NODE_ENV, APP_URL, ENCRYPTION_KEY_ID, etc.) | `JSON.stringify(config)` |

Backup files are stored in `.backups/` (configurable via `backupDir` constructor parameter).

## How Backups Work

### Database backup
```typescript
import { backupManager } from "@/server/recovery/backup-manager";

const point = await backupManager.createBackup("database", "pre-upgrade-v2.1.0");
// point.id → "bkp_1720800000000_abc123"
// point.checksum → SHA-256 of .dump file
// point.sizeBytes → file size
```

The backup process:
1. Parses `DATABASE_URL` for host, port, database name, and credentials
2. Sets `PGPASSWORD` from the URL password (never logged)
3. Executes `pg_dump` with custom format, compression level 9, `--no-owner`, `--no-acl`
4. Computes SHA-256 checksum of the resulting file
5. Populates `RecoveryPoint` metadata

### Config backup
```typescript
await backupManager.createBackup("config", "production-config-snapshot");
// Saves NODE_ENV, NEXT_PUBLIC_APP_URL, ENCRYPTION_KEY_ID, LICENSE_COMPANY_ID,
// PLAID_ENV, QB_ENV to a JSON file
```

## Restore Procedures

### Database restore
```typescript
import { restoreManager } from "@/server/recovery/restore-manager";

const result = await restoreManager.restoreDatabaseFromFile("/path/to/backup.dump");
// Or from a RecoveryPoint:
const point = await backupManager.getBackup("bkp_1720800000000_abc123");
const result = await restoreManager.restore(point);
// result.success, result.operationId, result.error
```

The restore process:
1. Parses `DATABASE_URL`
2. Executes `pg_restore` with `--clean --if-exists --no-owner --no-acl`
3. Timeout: 600 seconds (10 minutes) for large databases

### Config restore
```typescript
// Sets process.env from saved JSON
await backupManager.restoreBackup("bkp_1720800000000_abc123");
```

## Verification and Integrity Checking

### Backup verification
```typescript
const result = await backupManager.verifyBackup("bkp_1720800000000_abc123");
// { valid: boolean, error?: string }
```

Checks:
1. Backup file exists on disk
2. SHA-256 checksum matches stored checksum
3. For database backups: `pg_restore --list` can read the archive

### Recovery validation
```typescript
import { recoveryValidator } from "@/server/recovery/recovery-validator";

const validation = await recoveryValidator.validate(point);
// validation.valid, validation.checks[], validation.failed, validation.total
```

Runs 4 checks per backup: checksum format, archive integrity, metadata completeness, disk space availability.

### Disaster recovery drills
```typescript
const drillResult = await recoveryValidator.runDrill();
// drillResult.allPassed, drillResult.steps[], drillResult.timestamp
```

Drill steps:
1. Connect to database (via `pg_isready`)
2. Verify backup storage directory exists
3. Validate file I/O (write/read/delete test)
4. Test backup procedure (pg_dump to temp file, then delete)

## Retention Policies

Default retention (from `BackupManager.getRetentionPolicy()`):

| Category | Max Backups | Age Range |
|----------|-------------|-----------|
| Daily | 7 | < 1 day |
| Weekly | 4 | 1-7 days |
| Monthly | 3 | 7-30 days |
| Yearly | 1 | > 30 days |

```typescript
const deleted = await backupManager.applyRetention();
// Returns number of backups deleted
```

### Pre-upgrade backups

```typescript
const point = await backupManager.preUpgradeBackup("v2.1.0");
// Creates a database backup with label "pre-upgrade-v2.1.0"
// Automatically exempt from retention pruning
```

## Disaster Recovery Drills

Run drills regularly (recommended: monthly):

```typescript
const drill = await recoveryValidator.runDrill();
if (!drill.allPassed) {
  // Alert: recovery capability compromised
  drill.steps.filter(s => !s.passed).forEach(s => {
    console.error(`Drill step failed: ${s.name}`);
  });
}
```

The drill validates the complete recovery pipeline without restoring actual data:
- Database connectivity
- Disk write access
- pg_dump execution capability
- Backup file integrity

## Monitoring

`RecoveryMetricsCollector` (`src/server/recovery/recovery-metrics.ts`) tracks:

```typescript
const metrics = recoveryMetrics.getMetrics();
// {
//   totalBackups, totalRestores, successfulRestores, failedRestores,
//   averageRestoreTimeMs, lastBackupAt, lastRestoreAt,
//   storageUsedBytes, backupSuccessRate
// }
```
