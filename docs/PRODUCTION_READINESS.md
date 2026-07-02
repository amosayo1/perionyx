# Production Readiness Sprint

**Date**: July 2026  
**Target**: Ship Perionyx to a live enterprise customer  
**Estimated**: 3–4 weeks for a single-tenant MVP, 6–8 weeks for multi-tenant  

---

## Current State Summary

| Area | Status | Details |
|------|--------|---------|
| Tests | 160/161 pass, 22/23 files | 1 flaky test (approvals FK issue) |
| Auth | Working | NextAuth credentials + sandbox login |
| Docker | Exists | Needs fixes |
| CI/CD | None | No GitHub Actions |
| Monitoring | Basic Pino logger | No APM, no Sentry, no alerting |
| Health checks | `/api/health` exists | Basic DB ping only |
| Error tracking | None | No error boundary, no crash reporting |
| Queue workers | Broken | PgBoss assertion error on startup |
| Backup | None | No documented backup strategy |
| Report generation | Client-side only | CSV download from mock data |

---

## Sprint 1: Infrastructure & Stability (Week 1)

### 1.1 Fix PgBoss Queue Worker (~1 day)
**Problem**: `createQueue()` is called before `start()` in `src/modules/queue/queue.service.ts:46-56`, causing an assertion error. The queue worker never starts.

**Work**: Swap the order — call `instance.start()` first, then `instance.createQueue()`, then `instance.work()`.

```ts
// Before (broken):
await instance.createQueue(name, options);
await instance.work(name, handler);
await instance.start();

// After (fixed):
await instance.start();
await instance.createQueue(name, options);
await instance.work(name, handler);
```

**Also**: Create the `perionyx_queue` schema automatically in a migration or on worker start so it doesn't require manual `CREATE SCHEMA`.

### 1.2 Docker Build Fixes (~1 day)
**Problems found**:
- `pnpm fetch --prod` + `pnpm install --offline --prod` will fail because Prisma needs `prisma generate` which needs dev deps
- No `prisma generate` step in the Dockerfile
- `.next/standalone` output requires `output: standalone` in `next.config.ts` — verify this is set
- No `.dockerignore` (node_modules, .env, etc. copied into builder context unnecessarily)

**Work**:
- Add `prisma generate` step in builder stage
- Add `.dockerignore`
- Add `output: "standalone"` to next.config if missing
- Fix `entrypoint` in docker-compose to run `npx prisma migrate deploy && npx prisma generate && node server.js`

### 1.3 CI/CD Pipeline (~1 day)
**Add GitHub Actions workflow**:

```yaml
# .github/workflows/ci.yml
- lint (eslint)
- typecheck (tsc --noEmit)
- test (vitest run)
- build (next build)
```

**Add** a separate CD workflow for:
- Build Docker image
- Push to registry (Docker Hub / ECR / GHCR)
- Deploy to target (configurable per env)

### 1.4 Fix Failing Test (~0.5 day)
**Problem**: `test/approvals.test.ts:18` — tries to create a `RolePermission` referencing a non-existent permission ID. The test needs to create the permission first or use a valid permission key.

**Fix**: Add permission creation before the role-permission assignment in test setup.

---

## Sprint 2: Observability & Error Handling (Week 2)

### 2.1 Error Monitoring (~1 day)
- Add [Sentry](https://sentry.io) for Next.js (free tier handles ~5k events/month)
- Wrap root layout with `Sentry.ErrorBoundary`
- Instrument API routes with `sentryHandle`

**Alternatively**: PostHog (free tier) if you want product analytics too.

### 2.2 Global Error Boundary (~0.5 day)
- Create `src/components/ui/error-boundary.tsx` with a fallback UI
- Wrap the shell layout so dashboard pages show "Something went wrong" instead of a white screen

### 2.3 Production Logging (~0.5 day)
- Current Pino logger works but logs to stdout only
- Add log rotation or shipping (e.g., `pino/file` with date-based rotation, or ship to stdout in JSON for cloud log aggregators)
- Ensure `NODE_ENV=production` suppresses debug logs (currently does, but LOG_LEVEL can override)

### 2.4 Health Check Enhancement (~0.5 day)
- Current `/api/health` checks DB only
- Add checks for: Redis (if configured), PgBoss queue worker, last successful job run
- Add response time metrics
- Return `ready` vs `live` status separately

---

## Sprint 3: Production Hardening (Week 3)

### 3.1 Security Hardening (~1.5 days)
- **Rate limiting**: Audit all API routes — add rate limits to auth endpoints (already has sandbox-login limit), password reset, sign-up
- **CSP headers**: Add Content-Security-Policy in `next.config.ts` or middleware
- **HTTPS**: Ensure production deployment terminates TLS (let the reverse proxy handle this — nginx/Caddy/Cloudflare)
- **Cookie security**: Verify NextAuth session cookie has `Secure`, `HttpOnly`, `SameSite=Lax`
- **Input validation**: Audit that all POST/PUT endpoints use Zod schemas (check existing patterns)

### 3.2 Backup & Disaster Recovery (~1 day)
- **Document backup strategy**:
  ```
  Daily: pg_dump to S3-compatible storage (retention: 30 days)
  Weekly: Full DB dump (retention: 12 weeks)
  Monthly: Archive dump (retention: 12 months)
  ```
- **Add backup script**: `scripts/backup.sh` using `pg_dump`
- **Add restore script**: `scripts/restore.sh`
- **Test restore**: Verify on a staging environment

### 3.3 Tenant Onboarding Flow (~1 day)
- Currently: sandbox seeds one company programmatically
- For a new customer, you need:
  - Sign-up → creates company + admin user → redirects to setup wizard
  - Or: invite-based flow (existing `/api/v1/invites` route exists — verify it works)
- **Check**: `src/app/(auth)/sign-up/page.tsx` exists but the API handler for sign-up needs verification
- **Add**: Post-sign-up provisioning — create default wallets, default approval rules, default policies

### 3.4 Env Validation Hardening (~0.5 day)
- Currently `validateEnv()` only checks 3 required vars and logs warnings in dev
- In production, missing critical vars should prevent startup:
  - `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY` → block startup
  - `NEXTAUTH_URL` → warn (used for callback URLs)
  - `AI_API_KEY` — optional, graceful fallback (already handled)

---

## Sprint 4: Feature Completeness (Week 4)

### 4.1 Backend Report Generation (~1.5 days)
- Currently: client-side only CSV generation from hardcoded mock data
- **Add API route**: `POST /api/v1/reports/generate` with template ID, filters, columns, format
- **Use PgBoss** (once fixed) to generate reports as background jobs
- **Support formats**: CSV (easy), JSON (easy), PDF (use `@react-pdf/renderer` or Puppeteer)

### 4.2 Real Data in Reports (~1 day)
- Instead of hardcoded sample rows, query actual ledger/transaction data
- Connect the report builder's dataset selector → filters → columns → actual DB queries
- Add pagination for large result sets

### 4.3 Deployment to Target (~1 day)
- Choose hosting: Railway (simplest), Fly.io (good DX), AWS ECS (most control)
- Set up:
  - PostgreSQL (Railway/Fly managed, or RDS)
  - Redis (optional, for rate limiting across instances)
  - Environment variables
  - Custom domain + TLS
- Deploy first build
- Verify health endpoint, auth flow, sandbox login

### 4.4 Smoke Tests & Validation (~1 day)
- Run e2e tests: `npx playwright test` (2 spec files exist in `e2e/`)
- Manual checklist:
  - Sign up → create company → login flow
  - Dashboard loads without errors
  - Create transaction → approval flow
  - Reports → template → builder → download CSV
  - Logout → login again
  - Reset sandbox → verify clean state

---

## Quick Wins (Do First, Day 1)

These take <30 minutes each and remove immediate blockers:

1. **Swap `createQueue`/`start` order** in `queue.service.ts` — fixes the assertion error
2. **Create `perionyx_queue` schema** in a migration so new deployments don't need manual setup
3. **Add `output: "standalone"`** to `next.config.ts` if missing (required for Docker)
4. **Add `.dockerignore`** — `node_modules`, `.env`, `.git`, `.next` (saves ~200MB in build context)
5. **Bump `AUTH_SECRET`** to a real 64-char hex value in production (current dev secret is exposed in .env)

---

## Estimated Timeline

| Sprint | Focus | Duration | Who |
|--------|-------|----------|-----|
| Week 1 | Infrastructure & Stability | 5 days | Backend |
| Week 2 | Observability & Error Handling | 3 days | Backend/DevOps |
| Week 3 | Production Hardening | 4 days | Full-stack/DevOps |
| Week 4 | Feature Completeness | 5 days | Full-stack |

**Total**: ~4 weeks for a single-tenant MVP deploy  
**Add +2 weeks** for: multi-tenant isolation audit, SSO/SAML, SOC2 compliance prep, penetration testing

---

## Files That Need Changes

| File | Issue | Fix |
|------|-------|-----|
| `src/modules/queue/queue.service.ts:46-56` | `createQueue` before `start` | Reorder: `start()` → `createQueue()` → `work()` |
| `test/approvals.test.ts:18` | FK violation in test setup | Add permission creation first |
| `Dockerfile` | Missing `prisma generate`, no `.dockerignore` | Add generate step, add ignore file |
| `docker-compose.yml:45` | Entrypoint may fail silently | Add explicit `prisma generate` step |
| `next.config.ts` (check if exists) | May lack `output: "standalone"` | Add `output: "standalone"` |
| `src/app/layout.tsx` | No error boundary | Wrap with `ErrorBoundary` |
| `.env.production.example` | Missing vars | Add `NEXTAUTH_URL` as required |
| `src/components/reports/report-builder-dialog.tsx` | Mock data only | Connect to real API/DB queries |
