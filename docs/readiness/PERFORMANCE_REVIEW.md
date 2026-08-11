# Performance Review — 2026-08-07 (updated 2026-08-08 for Phase 28.1)

**Mode:** read-only static analysis (Next.js 16.2.6 / React 19.2.4 / Prisma 7.8 / PostgreSQL). Consumer lens: CFO — "metric values render first, charts second."
**Full audit:** [source-audits/performance-audit.md](./source-audits/performance-audit.md)
**Remediation evidence:** [PHASE_28_1_REMEDIATION_LOG.md](./PHASE_28_1_REMEDIATION_LOG.md) (F-02…F-22) — all Critical + High findings **FIXED** in 28.1.

## Key Numbers

- 348 GET handlers → 212 call `cacheHeaders()` → **all emitted `no-store` → 0 effective cached GETs** (FIXED 28.0 → `private, max-age=N`)
- 136 GET handlers with no cache directive at all (F-20…F-23 partly addressed: cfo/dashboard, ap/invoices, ledger, pending-approvals now cached)
- 9 N+1 read-path loops (F-04…F-12) — **ALL FIXED (28.1)** → single-query batches · 9 unbounded API queries (F-13…F-17) — **ALL FIXED (28.1)** → take/skip
- 0 `Suspense` usages · 41 `loading.tsx` / 485 pages (8.5%) — unchanged
- 1,045 client components, **zero** prisma/pg bundle leaks (H-01 held)
- `ignoreBuildErrors` — **REMOVED (28.1)** → typecheck 0 errors, build passes

## Severity

| Severity | Count | Headline |
|---|---|---|
| Critical | 3 | cache dead-code (fixed 28.0) · `ignoreBuildErrors` (fixed 28.1) · approval-poll DB hammering (fixed 28.1) |
| High | 6 | N+1 batch loops (fixed 28.1) · unbounded admin lists (fixed 28.1) · uncached CFO GETs (fixed 28.1) · no streaming (open) |
| Medium | 5 | unmemoized legacy widgets · sequential writes · 54 routes without proxy context |
| Low | 3 | minor unbounded reads · client bundle weight (accepted) |

## Critical Findings

| # | Location | Issue |
|---|---|---|
| F-01 | `src/server/http/handle-route.ts:61` | `Cache-Control: private, no-store, s-maxage=N` — `no-store` overrides `s-maxage` (RFC 9111). **FIXED (28.0): now `private, max-age=N`.** |
| F-02 | `next.config.ts:16` | `ignoreBuildErrors: true` — type errors ship to production; the typecheck gate is defeated on every build. **FIXED (28.1): flag removed; `docs/site` excluded from root tsconfig (separate Docusaurus project); `seed-fresh.ts` errors fixed. `pnpm typecheck` = 0 errors.** |
| F-03 | `PendingApprovalsClient.tsx:39` + `app-shell.tsx:184` + `v1/admin/pending-approvals/route.ts:13` | Polled every 10s per tab + 15s app-shell; uncached, `include: { transaction: true }`, `take: 200` → steady-state DB hammering. **FIXED (28.1): 30s polls both sides, `select` instead of `include`, `take: 100`, `cacheHeaders(10)`.** |

## High Findings

| # | Location | Issue |
|---|---|---|
| F-04…F-12 | `reconciliation-engine.ts:10` · `approval-thread.service.ts:31` · `trend.engine.ts:74,150` · `scenario-modeling.ts:126,142` · `calendar.service.ts:136` · `risk.service.ts:212` · `multi-company-builder.ts:45,113` · `automation-engine.ts` · `anomaly-detection.service.ts` | 9 N+1 read-path loops — sequential `findMany`/`findFirst` per item. **ALL FIXED (28.1): single batched `in:` queries + in-memory Maps; anomaly-detection parallelized with `Promise.all`.** |
| F-13…F-17 | `v1/admin/{users,roles,connectors,webhooks}` + `financial-reports` ×4 | Unbounded `findMany` with deep includes, no take/skip. **ALL FIXED (28.1): default take 200 (users 500), max 1000, `createdAt asc` order, skip/limit params.** |
| F-20…F-23 | `cfo/dashboard`, `v1/ap/invoices` (work queue), `v1/ledger`, `v1/admin/pending-approvals` | Key CFO GETs with zero cache headers. **FIXED (28.1): cfo/dashboard `cacheHeaders(30)`, ap/invoices 15s via `applyCommonHeaders`, ledger 15s, pending-approvals 10s.** |
| F-24/F-25 | `executive/`, `cfo/`, `work-queue/` | No `loading.tsx`; zero Suspense anywhere → no skeleton/streaming. **OPEN (deferred)** |
| F-31 | `(shell)/dashboard/page.tsx:10` | Dashboard double-network-trip (server shell + client fetch to `/api/dashboard/data`) + was uncached. **Cached 28.1 (30s); architectural change deferred.** |

## Strengths (verified)

- `dashboard/composition.service.ts` uses `Promise.all` with per-section fallibility
- `agent-context` bounded reads; pagination caps exist (DEFAULT 20 / MAX 100)
- app-shell lazy-loads heavy providers (`next/dynamic ssr:false`)
- `/api/v1/ap/invoices`, `/api/v1/ledger`, agents tasks, treasury alerts all properly paginated
- No client→prisma bundle leaks; H-01 deep-import discipline held

## Top 10 Fixes Ranked by ROI — status after 28.1

| Rank | Fix | Status |
|---|---|---|
| 1 | Cache directive fix (`private, max-age=N`) | ✅ DONE (28.0) |
| 2 | Poll-fix approvals: `cacheHeaders(10)`, `select`, `take: 100`, client poll 30s | ✅ DONE (28.1) |
| 3 | Remove `ignoreBuildErrors` + fix surfaced errors | ✅ DONE (28.1) — typecheck 0 errors |
| 4 | Parallelize N+1 read loops → batched `IN` queries / `Promise.all` | ✅ DONE (28.1) — 9 loops |
| 5 | Add take/skip + count to admin list endpoints | ✅ DONE (28.1) — 9 endpoints |
| 6 | Add `cacheHeaders` to cfo/dashboard, ap/invoices, ledger | ✅ DONE (28.1) |
| 7 | Stream CFO dashboard: Suspense + loading.tsx | ⏳ OPEN |
| 8 | Add `server-only` guards to prisma-importing module barrels | ⏳ OPEN |
| 9 | Memoize legacy dashboard widgets (6 components) | ⏳ OPEN |
| 10 | Batch write loops into single-transaction `createMany` | ⏳ OPEN |
