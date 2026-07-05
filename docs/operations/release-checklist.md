# Release Checklist

**Version:** 1.0.0
**Status:** Ratified
**Scope:** Every production release of the Perionyx platform

> This checklist is the mandatory release gate. Every item must be verified and signed off before a release can proceed to production. Partial compliance is non-compliance — a release missing any item must be delayed until the item is resolved.

---

## Release Information

| Field | Value |
|-------|-------|
| Release Version | |
| Release Date | |
| Release Engineer | |
| Engineering Lead | |
| Security Lead | |

---

## 1. Build Verification

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 1.1 | Production build completes with zero errors | `pnpm build` | ☐ |
| 1.2 | Production build completes with zero warnings | `pnpm build` | ☐ |
| 1.3 | Docker image builds successfully | `docker build -t perionyx .` | ☐ |
| 1.4 | Docker image scan passes (no critical vulnerabilities) | Trivy / Docker Scout | ☐ |
| 1.5 | Static assets are correctly bundled and versioned | Build output inspection | ☐ |
| 1.6 | Environment variable configuration is validated | `env` file check | ☐ |

---

## 2. Migration Verification

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 2.1 | All pending migrations have been applied in staging | `prisma migrate status` | ☐ |
| 2.2 | Migrations are forward-only (no destructive operations) | Migration file review | ☐ |
| 2.3 | Migration has been tested against staging database (copy of production) | Staging apply + verify | ☐ |
| 2.4 | Migration is backward-compatible with previous application version | Review for breaking schema changes | ☐ |
| 2.5 | Rollback migration exists and has been tested | `prisma migrate down` test | ☐ |
| 2.6 | No orphaned data after migration (tested in staging) | Data integrity check | ☐ |
| 2.7 | Database constraints (unique, foreign key) are verified after migration | `prisma db validate` | ☐ |

---

## 3. TypeScript Verification

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 3.1 | TypeScript strict mode passes with zero errors | `pnpm typecheck` | ☐ |
| 3.2 | No `any` types introduced (unless explicitly justified) | `pnpm typecheck` + diff review | ☐ |
| 3.3 | No `@ts-ignore` or `@ts-expect-error` in new/modified code | `git diff` review | ☐ |

---

## 4. Performance Review

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 4.1 | P99 latency for financial operations is below 2 seconds | Staging benchmark | ☐ |
| 4.2 | No new N+1 query patterns introduced | Query log review | ☐ |
| 4.3 | New database queries use existing indexes (verified via `EXPLAIN ANALYZE`) | Query plan review | ☐ |
| 4.4 | Connection pool sizing accommodates peak load | Pool utilization review | ☐ |
| 4.5 | No synchronous external API calls in request path (queues used instead) | Code review | ☐ |
| 4.6 | Batch operations used instead of per-row queries for bulk operations | Code review | ☐ |

---

## 5. Security Review

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 5.1 | Dependency scan passes (no critical or high vulnerabilities) | `pnpm audit` | ☐ |
| 5.2 | OWASP Top 10 review completed for new endpoints | Manual review | ☐ |
| 5.3 | No secrets exposed in code, configuration, or commit history | `git diff` + secret scanner | ☐ |
| 5.4 | Authentication is enforced for all new endpoints | Code review | ☐ |
| 5.5 | Authorization (RBAC) is enforced at the service layer for all new operations | Code review | ☐ |
| 5.6 | Tenant isolation is verified (negative tests pass) | Test results | ☐ |
| 5.7 | Rate limiting is configured for new endpoints | Code review | ☐ |
| 5.8 | CORS is correctly configured for new endpoints | Code review | ☐ |
| 5.9 | Input validation is implemented for all new endpoints | Code review | ☐ |
| 5.10 | No raw SQL in new financial service code | Code review | ☐ |
| 5.11 | Security review sign-off obtained | Signature | ☐ |

---

## 6. Monitoring

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 6.1 | Key metrics are exposed for the new feature (latency, error rate, volume) | Dashboard review | ☐ |
| 6.2 | Financial integrity metrics (version conflicts, retry rate) are monitored | Dashboard review | ☐ |
| 6.3 | Database connection pool utilization is monitored | Dashboard review | ☐ |
| 6.4 | Lock contention metrics are collected | Dashboard review | ☐ |
| 6.5 | Alert thresholds are configured for anomaly detection | Alert configuration | ☐ |
| 6.6 | Monitoring dashboards are verified to show correct data | Dashboard smoke test | ☐ |

---

## 7. Logging

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 7.1 | All new financial operations have structured logging (info/warn/error) | Code review | ☐ |
| 7.2 | Logs include: `companyId`, `transactionId`, `operation`, `durationMs` | Code review | ☐ |
| 7.3 | Transaction retries are logged | Code review | ☐ |
| 7.4 | Serialization failures and deadlocks are logged | Code review | ☐ |
| 7.5 | No secrets or PII in log output | Code review | ☐ |
| 7.6 | Log levels are appropriate (no excessive info logging in hot paths) | Code review | ☐ |

---

## 8. Metrics

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 8.1 | Transaction success/failure count metrics are implemented | Code review | ☐ |
| 8.2 | Transaction latency (P50, P95, P99) metrics are implemented | Code review | ☐ |
| 8.3 | Lock acquisition success/failure metrics are implemented | Code review | ☐ |
| 8.4 | Retry count distribution metrics are implemented | Code review | ☐ |
| 8.5 | Connection pool utilization metrics are implemented | Infra review | ☐ |
| 8.6 | Business metrics (transfer volume, approval throughput) are implemented | Code review | ☐ |

---

## 9. Health Checks

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 9.1 | Application health check endpoint returns `200 OK` | `GET /api/health` | ☐ |
| 9.2 | Database connectivity health check passes | Health check endpoint | ☐ |
| 9.3 | Critical external integrations (Plaid, QBO) health check passes | Health check endpoint | ☐ |
| 9.4 | Background worker health check passes (if applicable) | Worker health endpoint | ☐ |
| 9.5 | Health check is integrated with load balancer (removes unhealthy instances) | Infra review | ☐ |

---

## 10. Rollback Plan

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 10.1 | Rollback plan is documented for this release | Plan document | ☐ |
| 10.2 | Previous working Docker image is tagged and available | Container registry | ☐ |
| 10.3 | Database migration is reversible (via new migration, not destructive) | Migration review | ☐ |
| 10.4 | Feature flags exist for new functionality (can be disabled without deploy) | Feature flag system | ☐ |
| 10.5 | Rollback triggers are defined (what conditions trigger immediate rollback) | Plan document | ☐ |
| 10.6 | Rollback procedure has been tested in staging | Staging test | ☐ |
| 10.7 | Rollback communication plan is defined (who to notify, how) | Plan document | ☐ |

---

## 11. Database Backup

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 11.1 | Full database backup completed before migration | Backup log | ☐ |
| 11.2 | Backup is verified (restorable and integrity-checked) | Restore test | ☐ |
| 11.3 | WAL archiving is active and continuous | Database config | ☐ |
| 11.4 | Backup is encrypted (AES-256-GCM) and stored separately from primary data | Backup config | ☐ |
| 11.5 | Backup retention policy is configured (30 days daily, 12 months monthly) | Backup config | ☐ |

---

## 12. Documentation Updated

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 12.1 | API documentation (OpenAPI) is updated for new/changed endpoints | OpenAPI spec | ☐ |
| 12.2 | Enterprise documentation (`docs/enterprise/`) is updated for new financial operations | Files review | ☐ |
| 12.3 | Architecture Decision Records (ADRs) are created for significant decisions | `docs/adr/` | ☐ |
| 12.4 | README or setup documentation is updated for new dependencies | `docs/` review | ☐ |
| 12.5 | On-call runbook is updated for new operational concerns | Runbook review | ☐ |
| 12.6 | Monitoring runbook is updated (dashboard links, alert explanations) | Runbook review | ☐ |

---

## 13. Release Notes

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 13.1 | Release notes are written and reviewed | Release notes document | ☐ |
| 13.2 | Release notes include: new features, bug fixes, breaking changes, migration steps | Content review | ☐ |
| 13.3 | Breaking changes are clearly marked with migration instructions | Content review | ☐ |
| 13.4 | Deprecated APIs are listed with removal timeline | Content review | ☐ |
| 13.5 | Release version follows semantic versioning (MAJOR.MINOR.PATCH) | Version check | ☐ |

---

## 14. Smoke Testing

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 14.1 | Production build deployed to staging environment | Deployment | ☐ |
| 14.2 | All critical API endpoints return correct responses | Manual smoke test | ☐ |
| 14.3 | Authentication flow works (login, session, logout) | Manual smoke test | ☐ |
| 14.4 | Financial write operation works (transfer, deposit) | Manual smoke test | ☐ |
| 14.5 | Tenant isolation is maintained (create and access data in two tenants) | Manual smoke test | ☐ |
| 14.6 | Error handling returns appropriate error responses | Manual smoke test | ☐ |
| 14.7 | UI renders correctly (if UI changes are included) | Manual smoke test | ☐ |
| 14.8 | Background jobs process correctly (if applicable) | Job queue review | ☐ |

---

## 15. Production Readiness

| # | Criterion | Verification | Status |
|---|-----------|-------------|--------|
| 15.1 | Feature flags are configured for gradual rollout | Feature flag system | ☐ |
| 15.2 | Staged rollout plan is defined (canary → 25% → 50% → 100%) | Rollout plan | ☐ |
| 15.3 | On-call engineer is notified of the release | Notification sent | ☐ |
| 15.4 | Monitoring dashboards are reviewed during rollout | Dashboard watch | ☐ |
| 15.5 | Rollback trigger thresholds are configured in monitoring | Alert config | ☐ |
| 15.6 | Post-release monitoring period is defined (e.g., 2 hours post-release) | Plan document | ☐ |

---

## 16. Definition of Release Complete

A release is complete only when ALL of the following are true:

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All items in sections 1–15 are verified and signed off | ☐ |
| 2 | Production deployment is live and serving traffic | ☐ |
| 3 | Health checks pass in production | ☐ |
| 4 | Post-release smoke tests pass in production | ☐ |
| 5 | Monitoring dashboards show expected behavior (no anomaly) | ☐ |
| 6 | Alerts are not firing for the new release | ☐ |
| 7 | Post-release monitoring period has elapsed (2 hours minimum) | ☐ |
| 8 | Release notes are published | ☐ |
| 9 | Release is tagged in version control | ☐ |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Release Engineer | __________ | __________ | __________ |
| Engineering Lead | __________ | __________ | __________ |
| Security Lead | __________ | __________ | __________ |
| Product Owner | __________ | __________ | __________ |

---

## Post-Release

| Item | Completed | Notes |
|------|-----------|-------|
| Post-release review scheduled | ☐ | |
| Lessons learned documented | ☐ | |
| Release checklist updated (if gaps found) | ☐ | |
| On-call handoff completed | ☐ | |

---

*This document is part of the Perionyx Engineering Governance Framework. It is reviewed and updated quarterly.*
