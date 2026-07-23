# Deployment Checklist

**Phase:** 8E.5
**Last Updated:** July 8, 2026

---

## Pre-Deployment

### Environment Validation

| # | Check | Verification | Status |
|---|---|---|---|
| 1 | All required environment variables are set | Validate against `.env.example` | ☐ |
| 2 | `DATABASE_URL` points to the correct environment | Connection string review | ☐ |
| 3 | `AUTH_SECRET` is a fresh 64-char base64 value | `openssl rand -base64 32` | ☐ |
| 4 | `ENCRYPTION_KEY` is a fresh 64-char hex value | `openssl rand -hex 32` | ☐ |
| 5 | `NEXTAUTH_URL` matches the deployment URL | URL review | ☐ |
| 6 | AI provider keys are configured (or graceful fallback confirmed) | Provider dashboard | ☐ |
| 7 | Plaid API keys are configured for the target environment | Plaid dashboard | ☐ |
| 8 | SMTP configuration is verified (email notifications) | Test email send | ☐ |

### Build Verification

| # | Check | Verification | Status |
|---|---|---|---|
| 9 | TypeScript strict mode passes | `pnpm typecheck` — zero errors | ☐ |
| 10 | Production build succeeds | `pnpm build` — zero errors and warnings | ☐ |
| 11 | Test suite passes | `pnpm test` — all tests green | ☐ |
| 12 | Docker image builds successfully | `docker build -t perionyx .` | ☐ |
| 13 | Docker image vulnerability scan passes | Trivy / Docker Scout | ☐ |
| 14 | Build is reproducible (same commit → same hash) | CI build verification | ☐ |
| 15 | Static assets are correctly versioned and bundled | Build output inspection | ☐ |

### Database Migrations

| # | Check | Verification | Status |
|---|---|---|---|
| 16 | All pending migrations applied in staging | `prisma migrate status` | ☐ |
| 17 | Migrations are forward-only (no destructive operations) | Migration file review | ☐ |
| 18 | Migration tested against staging DB (copy of production data) | Staging apply + verify | ☐ |
| 19 | Migration is backward-compatible with previous app version | Review for breaking schema changes | ☐ |
| 20 | Rollback migration exists and has been tested | `prisma migrate down` test | ☐ |
| 21 | No orphaned data after migration (tested in staging) | Data integrity check | ☐ |
| 22 | Database constraints (unique, foreign key) verified after migration | `prisma db validate` | ☐ |
| 23 | Full database backup completed before production migration | Backup log | ☐ |
| 24 | Backup verified (restorable and integrity-checked) | Restore test on staging | ☐ |

---

## Deployment

### Production Deployment Steps

```
1. Verify environment variables on target deployment
2. Run database migration: npx prisma migrate deploy
3. Generate Prisma client: npx prisma generate
4. Deploy application (Docker image or standalone build)
5. Verify health endpoint: GET /api/health → 200
6. Verify authentication flow: login → session → protected route
7. Run post-deployment smoke tests
8. Feature flag activation (if applicable)
9. Monitor dashboards for anomaly (2 hours post-deploy)
10. Tag release in version control
```

| # | Step | Command / Action | Verification | Status |
|---|---|---|---|---|
| 25 | Apply migrations | `npx prisma migrate deploy` | Check migration log | ☐ |
| 26 | Generate client | `npx prisma generate` | Check output | ☐ |
| 27 | Start application | Per deployment platform | Container running | ☐ |
| 28 | Health check | `curl GET /api/health` | Returns `200 OK` | ☐ |
| 29 | Auth check | Login with test account | Session created | ☐ |
| 30 | API smoke test | Create a transaction via API | 201 Created | ☐ |
| 31 | UI smoke test | Load dashboard page | Renders without errors | ☐ |
| 32 | Worker check | Verify PgBoss job processing | Jobs completing | ☐ |

### Rollback Triggers

Immediate rollback if any of the following occur within 2 hours of deployment:

| # | Condition | Action |
|---|---|---|
| 33 | Health check returns non-200 | Rollback immediately |
| 34 | Auth flow broken (cannot login) | Rollback immediately |
| 35 | >1% error rate on financial API endpoints | Rollback immediately |
| 36 | Data integrity issue detected (wrong balances, orphaned records) | Rollback immediately |
| 37 | P99 latency >5s for financial operations | Rollback immediately |
| 38 | Critical security vulnerability discovered | Rollback immediately |

---

## Post-Deployment

### Smoke Tests (Post-Deploy)

| # | Test | Expected Result | Status |
|---|---|---|---|
| 39 | Dashboard loads without errors | All 10 zones render | ☐ |
| 40 | Create a transfer between wallets | Transaction created, balance updated | ☐ |
| 41 | Initiate approval workflow | Approval request created | ☐ |
| 42 | Approve and reject a transaction | Status changes correctly | ☐ |
| 43 | View audit log for the transaction | Entry exists with correct metadata | ☐ |
| 44 | Generate a report | CSV/Excel downloads correctly | ☐ |
| 45 | Use AI Copilot (ask a financial question) | Response with citation | ☐ |
| 46 | Log out and log back in | Session persists correctly | ☐ |
| 47 | Test mobile dashboard (if applicable) | Renders on mobile viewport | ☐ |
| 48 | Test search (⌘K) | Returns expected results | ☐ |

### Monitoring Verification

| # | Check | Verification | Status |
|---|---|---|---|
| 49 | Health check integrated with load balancer | Removes unhealthy instances | ☐ |
| 50 | Logs are being shipped to log aggregator | Recent log entries visible | ☐ |
| 51 | Error tracking (Sentry) is capturing events | Test error generates event | ☐ |
| 52 | Key metrics are visible on dashboard | Latency, error rate, volume | ☐ |
| 53 | Alerts are configured for critical thresholds | Alert test fires correctly | ☐ |
| 54 | On-call engineer is notified of deployment | Notification received | ☐ |

---

## Environment-Specific Configuration

| Environment | URL | Database | AI Provider | Plaid Env | Monitoring |
|---|---|---|---|---|---|
| Development | `localhost:3000` | Local PG | Any | Sandbox | None |
| Staging | `staging.perionyx.com` | Staging PG | Any (test keys) | Sandbox | Sentry + basic |
| Production | `app.perionyx.com` | Production PG | Production keys | Production | Full stack |

---

## Release Artifacts

| Artifact | Location | Purpose |
|---|---|---|
| Docker image | Container registry | Deployable application |
| Database migration | `prisma/migrations/` | Schema changes |
| Environment config | `.env.production` (not committed) | Runtime configuration |
| Release notes | `docs/operations/releases/` | Changelog for stakeholders |
| Git tag | `git tag v{major}.{minor}.{patch}` | Version control reference |

---

## References

- `docs/DEPLOYMENT.md` — Deployment guide
- `docs/launch/operations-runbook.md` — Operations runbook
- `docs/launch/rollback-strategy.md` — Rollback procedures
- `docs/operations/release-checklist.md` — Release checklist
- `docs/launch/enterprise-launch-certification.md` — Launch certification
- `docs/PRODUCTION_READINESS.md` — Production readiness sprint
