# Operations Guide

## Production Deployment Checklist

### Pre-deployment

- [ ] Run `secretsValidator.validate({ environment: "production" })` — must pass
- [ ] Run `environmentValidator.validate()` — must pass
- [ ] Run `migrationRunner.verifyMigrations()` — no inconsistencies
- [ ] Run `pnpm typecheck` — zero errors
- [ ] Run `pnpm build` — builds successfully
- [ ] Run `pnpm test` — all tests pass
- [ ] Create pre-upgrade backup: `backupManager.preUpgradeBackup(version)`
- [ ] Verify backup integrity: `backupManager.verifyBackup(id)`
- [ ] Check `dependencyScanner.scan()` output for known vulnerabilities

### Deployment

1. Push Docker image with the new version tag
2. Apply k8s manifests: `kubectl apply -f k8s/`
3. Migrations run automatically via `migrationRunner.runPending()`
4. Monitor health endpoint for readiness

### Post-deployment

- [ ] Verify audit logging is recording events
- [ ] Check `recoveryMetrics.getMetrics()` for backup success rate
- [ ] Run a recovery drill: `recoveryValidator.runDrill()`
- [ ] Verify encryption: encrypt and decrypt a test value
- [ ] Confirm rate limiting headers are present in API responses

## Monitoring and Alerting

### Key Metrics

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Backup success rate | `RecoveryMetrics.backupSuccessRate` | < 100% |
| Last backup age | `RecoveryMetrics.lastBackupAt` | > 24 hours |
| Restore failures | `RecoveryMetrics.failedRestores` | > 0 |
| Backup storage used | `RecoveryMetrics.storageUsedBytes` | > 80% of disk |
| Rate limit hits | HTTP 429 responses | Spike alert |
| Audit chain breaks | `AuditEventStore.verifyChain().breaks` | > 0 |
| Migration checksum mismatches | `MigrationRunner.verifyMigrations().inconsistencies` | > 0 |

### Health Checks

The infrastructure health endpoint (`/api/health`) checks:
- Database connectivity (via Prisma)
- Cache layer (in-memory + Redis)
- Queue workers
- Security subsystem (encryption key present, secrets validated)

## Backup Schedule

```bash
# Recommended crontab (via PgBoss scheduler or k8s CronJob)

# Daily database backup at 02:00 UTC
0 2 * * * npx tsx -e "
  const { backupManager } = require('./src/server/recovery/backup-manager');
  const point = await backupManager.createBackup('database', 'daily-' + new Date().toISOString().slice(0,10));
  console.log('Backup created:', point.id);
"

# Hourly config snapshots (retains last 24)
0 * * * * npx tsx -e "
  const { backupManager } = require('./src/server/recovery/backup-manager');
  await backupManager.createBackup('config', 'hourly-snapshot');
"

# Retention pruning daily at 03:00
0 3 * * * npx tsx -e "
  const { backupManager } = require('./src/server/recovery/backup-manager');
  const deleted = await backupManager.applyRetention();
  console.log('Pruned backups:', deleted);
"

# Recovery drill weekly on Sunday 04:00
0 4 * * 0 npx tsx -e "
  const { recoveryValidator } = require('./src/server/recovery/recovery-validator');
  const drill = await recoveryValidator.runDrill();
  if (!drill.allPassed) throw new Error('Recovery drill failed');
"

# Audit log retention (quarterly)
0 5 1 */3 * npx tsx -e "
  const { auditEventStore } = require('./src/server/security/audit-logger');
  const deleted = await auditEventStore.applyRetention(365);
  console.log('Deleted audit entries:', deleted);
"
```

## Incident Response

### Steps

1. **Identify** — Alert triggers (audit chain break, backup failure, rate limit spike)
2. **Contain** — Use `rateLimiter.reset(key)` to clear a rate-limited user; update CSP headers if XSS suspected
3. **Investigate** — Query audit log:
   ```typescript
   const { entries } = await auditEventStore.query({
     severity: "critical",
     startDate: new Date(Date.now() - 3600000).toISOString(),
     take: 100,
   });
   ```
4. **Recover** — Restore from latest clean backup:
   ```typescript
   const backup = backupManager.getLatestBackup("database");
   if (backup) await restoreManager.restore(backup);
   ```
5. **Verify** — Run `recoveryValidator.validate()` on the restored backup
6. **Document** — Record the incident in the audit log:
   ```typescript
   await securityAuditLogger.log({
     type: "incident",
     severity: "critical",
     action: "incident.response",
     details: JSON.stringify({ incidentId, steps: [...] }),
   });
   ```

### Audit Chain Break Response

If `verifyChain()` reports breaks:
1. Immediately investigate the time range of the break
2. Check database access logs for unauthorized queries on the `auditLog` table
3. Restore the `auditLog` table from the most recent pre-incident backup
4. Re-run `verifyChain()` to confirm chain integrity
5. Record the incident in the restored audit log

## Key Rotation Procedure

### Encryption Key Rotation

```bash
# 1. Generate a new key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEW_KEY_ID="v$(date +%s)"

# 2. Update environment with old key in history
# In .env.production:
#   ENCRYPTION_KEY=$NEW_KEY
#   ENCRYPTION_KEY_ID=$NEW_KEY_ID
#   ENCRYPTION_KEY_HISTORY="v1=$OLD_KEY,$NEW_KEY_ID=$NEW_KEY"

# 3. Deploy new environment
kubectl set env deployment/perionyx-web ENCRYPTION_KEY=$NEW_KEY \
  ENCRYPTION_KEY_ID=$NEW_KEY_ID \
  ENCRYPTION_KEY_HISTORY="v1=$OLD_KEY"

# 4. Verify decryption still works
# (existing data encrypted with old key will be decrypted via history)

# 5. Re-encrypt sensitive fields (optional batch job)
npx tsx scripts/re-encrypt-all.ts

# 6. Remove old key from history once all data is re-encrypted
```

### JWT Secret Rotation

```bash
# 1. Generate new secret
NEW_JWT=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))")

# 2. Update environment and restart
kubectl set env deployment/perionyx-web JWT_SECRET=$NEW_JWT

# 3. Existing sessions remain valid until token expiry
# Old secret is not needed for validation — NextAuth handles this
```

## Security Headers Verification

After deployment, verify security headers are present:

```bash
curl -sI https://app.perionyx.com | grep -i "^content-security-policy\|^strict-transport-security\|^x-content-type-options\|^x-frame-options"
```

Expected response:
```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: DENY
```
