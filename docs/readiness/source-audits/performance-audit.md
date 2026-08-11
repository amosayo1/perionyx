# Perionyx Performance Readiness Audit

**Date:** 2026-08-07 | **Mode:** Read-only static analysis | **Target:** Next.js 16.2.6 / React 19.2.4 / Prisma 7.8 / PostgreSQL
**Consumer lens:** CFO — "metric values render first, charts second"

---

## 1. Executive Summary

| Severity | Count | Description |
|---|---|---|
| **Critical** | 3 | (1) `cacheHeaders()` emits `no-store`, silently disabling caching on all 212 "cached" GET endpoints; (2) `ignoreBuildErrors: true` in production config; (3) pending-approvals endpoint polled every 10s per open tab — uncached, heavy `include`, `take: 200` |
| **High** | 6 | N+1 loops in 10 services; 9 unbounded `findMany` API routes; 136/348 GET handlers with zero cache headers; key CFO GETs (cfo/dashboard, ap/invoices, ledger) uncached; zero Suspense streaming; 8.5% loading.tsx coverage |
| **Medium** | 5 | Legacy dashboard widgets with zero memoization; sequential per-item DB writes (tick/webhook/risk services); 54 routes call `withRuntimeContext(new Headers())` (no proxy headers); no `server-only` guards (1,045 client components unprotected); 4-6 polling loops app-wide |
| **Low** | 3 | Unbounded `listWallets`; unbounded `agentDefinition`/`agentPermission` reads (low volume); manual Date serialization in 50+ server pages |

**Key metric:** Of 348 GET route handlers, 212 call `cacheHeaders()` — but all 212 emit `no-store`, so **effective cacheable GETs = 0**. The remaining 136 GETs have no cache directive at all. The caching layer is non-functional in both directions.

---

## 2. Findings Table

| # | File:Line | Issue | Impact | Severity |
|---|---|---|---|---|
| F-01 | `src/server/http/handle-route.ts:63` | `Cache-Control: private, no-store, s-maxage=N, stale-while-revalidate=N*10` — `no-store` overrides `s-maxage` per RFC 9111; shared caches (CDN/edge) MUST NOT store | All 212 "cached" GETs are effectively uncached; CFO dashboard data (TTL 15s), executive dashboard (30s) re-fetched per request | **Critical** |
| F-02 | `next.config.ts:16` | `typescript: { ignoreBuildErrors: true }` | Type errors ship to production; CI typecheck gate bypassed on every build | **Critical** |
| F-03 | `src/app/(shell)/approvals/PendingApprovalsClient.tsx:39` + `src/app/api/v1/admin/pending-approvals/route.ts:13` | Poll `fetchPending()` every 10s → GET with no cacheHeaders, `include: { transaction: true }`, `take: 200` | Up to 200 full transaction rows × 6 polls/min × open tabs; DB hammering on CFO approval surface | **Critical** |
| F-04 | `src/modules/ledger/reconciliation-engine.ts:10-19` | `findFirst` + `update` per item in `for (const item of report)` — sequential N+1 | O(n) round-trips per reconciliation run; blocks until all settle | High |
| F-05 | `src/modules/approval-thread/approval-thread.service.ts:31-38` | `findMany` per mention inside loop | N+1 on every comment with mentions | High |
| F-06 | `src/modules/intelligence-platform/trend.engine.ts:74-83, 150-155` | `findMany` per `SCORE_KEYS` / `kpiKeys` inside loop | 6-12 sequential queries per trend computation | High |
| F-07 | `src/modules/fpa-specialist/scenario-modeling.ts:126-131, 142-146` | Two loops, `findFirst` per scenario (2 sequential DB round-trips each) | O(2n) per FPA scenario summary | High |
| F-08 | `src/modules/calendar/calendar.service.ts:136-146` | `findFirst` + `create` per event in loop | N+1 on calendar sync | High |
| F-09 | `src/modules/risk/risk.service.ts:212-220` | `findFirst` + `create` per alert in loop | N+1 on alert evaluation | High |
| F-10 | `src/modules/financial-reporting/statement-builders/multi-company-builder.ts:45-50, 113-118` | `findMany` per company in loop (2 loops) | N+1 per target company per financial statement build | High |
| F-11 | `src/modules/orchestration/automation-engine.ts:14-17` | `findFirst` per rule (cooldown check) | N+1 on every automation event | Medium |
| F-12 | `src/modules/intelligence/anomaly-detection.service.ts:48-53` | `findMany` per monitored metric in loop | N+1 (10 metrics), each bounded `take: 50` | Medium |
| F-13 | `src/app/api/v1/admin/users/route.ts:13` | `companyMembership.findMany` — no take/skip, deep include (user → userRoles → role) | Unbounded admin list; payload grows with headcount | High |
| F-14 | `src/app/api/v1/admin/roles/route.ts:20` | `role.findMany` — no take, `include: { permissions: { include: { permission: true } } }` | Unbounded nested payload | High |
| F-15 | `src/app/api/v1/admin/connectors/route.ts:15` | `connectorConfig.findMany` — no take, no cache | Unbounded | Medium |
| F-16 | `src/app/api/v1/admin/webhooks/route.ts:22` | `webhook.findMany` — no take, no cache | Unbounded | Medium |
| F-17 | `src/app/api/v1/financial-reports/route.ts:41`, `schedules/route.ts:46`, `views/route.ts:43`, `board-pack/route.ts:52` | 4 list endpoints — no take/skip (cached but unbounded) | Unbounded payloads on cached-but-no-store endpoints | Medium |
| F-18 | `src/app/api/v1/integration-platform/health/route.ts:12,16` | 2 `findMany` — no take | Unbounded health rows | Low |
| F-19 | `src/modules/wallets/wallets.service.ts:9-12` | `listWallets` — no take | Unbounded (low volume per tenant) | Low |
| F-20 | `src/app/api/cfo/dashboard/route.ts:13` | `NextResponse.json(dashboard)` — no cacheHeaders | CFO landing dashboard uncached | **High** |
| F-21 | `src/app/api/v1/ap/invoices/route.ts:47` | Work-queue GET — no cacheHeaders (paginated via page/limit, but zero caching) | Highest-traffic AP surface uncached | **High** |
| F-22 | `src/app/api/v1/ledger/route.ts:23` | Ledger GET — no cacheHeaders (paginated via `parseCursorPagination`) | Uncached ledger list (CFO drill-down) | High |
| F-23 | `src/app/api/v1/admin/pending-approvals/route.ts:19` | No cacheHeaders (see F-03) | Polled 10s + 15s → uncached | High |
| F-24 | `src/app/(shell)/executive/`, `cfo/`, `work-queue/` | No `loading.tsx` (verified absent) | Blank route shells during server render; no skeleton | Medium |
| F-25 | Whole app | 0 `Suspense` usages in `src/app`; 41 `loading.tsx` / 485 pages (8.5%) | No streaming; metrics never render before full data | Medium |
| F-26 | `src/components/dashboard/` legacy widgets (ApprovalBottlenecksWidget, EnhancedTransactionsTable, RecentTransactionsTable, WalletOverview, AuditPreviewTable, FinancialInsightsPanel, CommandCenterWidgets, TelemetryWidget, LedgerIntegrityWidget, FxSyncStatusWidget, SparklineGraph, SummaryCard, WalletApprovalActivity, StatusBadge, EmptyState, DashboardSkeleton) | Zero `useMemo`/`memo`/`useCallback` (verified count = 0 per file) | Re-render churn on dashboard; charts not memoized | Medium |
| F-27 | `src/modules/tick/tick.service.ts:68-70, 105-107`; `src/modules/webhooks/webhooks.service.ts:37-39`; `src/modules/integration-platform/validation-engine.service.ts:19-20,28-29`; `src/modules/enterprise-experience/workspace.service.ts:24-25`, `role-experience.service.ts:91-92`, `feature-discovery.service.ts:31-32` | Sequential per-item writes/upserts (transaction per item) | Batchable via `createMany`/`upsertMany`-style or `Promise.all` within one transaction | Medium |
| F-28 | `src/app/api` — 54 routes | `withRuntimeContext(new Headers(), ...)` (e.g. `wallets/route.ts:12`) — empty headers mean proxy headers (tenant, trace, timing) unavailable; context falls back to cookie re-parse | Lost per-request observability; duplicate auth work | Low |
| F-29 | `src/modules/` | Only 2 files use `import 'server-only'` (`decision-workspace/index.ts`, `workspace-service.ts`) | 1,045 client components have no guard against future accidental prisma/pg barrel imports | Medium |
| F-30 | `package.json` | Client-side weight: `@sentry/nextjs` (browserTracingIntegration in `sentry.client.config.ts`), `framer-motion` 12.x, `next-intl`, `sonner`, `lucide-react` (512 import sites), Radix (9 packages) | Largest contributors: framer-motion (~30-40 KB gz), Sentry tracing (~25-35 KB gz), next-intl runtime | Low (accepted) |
| F-31 | `src/app/(shell)/dashboard/page.tsx:10` | Server page is a thin auth shell; all data client-fetched from `/api/dashboard/data` (TTL 15 but no-store → uncached) | CFO dashboard is double-network-trip + uncached; TTFB of metrics = client fetch + DB query + serialize | High |
| F-32 | `src/modules/agent-framework/agent-runtime.ts:242-250`, `agent-context.ts:456-462` | `agentDefinition.findMany` / `agentPermission.findMany` — no take | Unbounded (low volume) | Low |
| F-33 | `src/app/api/v1/sandbox/intelligence/route.ts:23` | `metricKeys.map(async ...)` — properly parallelized (anti-pattern avoided) | N/A — positive finding | Info |

---

## 3. N+1 Inventory (verified)

| File:Line | Loop | Query per iteration | Severity |
|---|---|---|---|
| `src/modules/ledger/reconciliation-engine.ts:10-19` | `for (const item of report)` | `settlementRecord.findFirst` + `update` (sequential, awaited) | High |
| `src/modules/approval-thread/approval-thread.service.ts:31-38` | `for (const mention of mentions)` | `companyMembership.findMany` | High |
| `src/modules/intelligence-platform/trend.engine.ts:74-83` | `for (const scoreType of SCORE_KEYS)` (6 keys) | `financialScore.findMany` | High |
| `src/modules/intelligence-platform/trend.engine.ts:150-155` | `for (const kpiKey of kpiKeys)` | `kPIValue.findMany` | High |
| `src/modules/fpa-specialist/scenario-modeling.ts:126-131` | `for (const summary of scenarioSummaries)` | `fPAScenarioExecution.findFirst` | High |
| `src/modules/fpa-specialist/scenario-modeling.ts:142-146` | `for (const s of scenarios)` | `fPAScenarioExecution.findFirst` | High |
| `src/modules/calendar/calendar.service.ts:136-146` | `for (const e of events)` | `calendarEvent.findFirst` + `create` | High |
| `src/modules/risk/risk.service.ts:212-220` | `for (const a of alerts)` | `riskAlert.findFirst` + `create` | High |
| `src/modules/financial-reporting/statement-builders/multi-company-builder.ts:45-50` | `for (const cid of targetIds)` | `gLAccountBalance.findMany` | High |
| `src/modules/financial-reporting/statement-builders/multi-company-builder.ts:113-118` | `for (const cid of targetIds)` (2nd loop) | `gLAccountBalance.findMany` | High |
| `src/modules/orchestration/automation-engine.ts:14-17` | `for (const rule of rules)` | `workflowLog.findFirst` (cooldown) | Medium |
| `src/modules/intelligence/anomaly-detection.service.ts:48-53` | `for (const metric of MONITORED_METRICS)` (10) | `intelligenceSnapshot.findMany` (take 50) | Medium |
| `src/modules/tick/tick.service.ts:68-70, 105-107` | `for (const approval of stale/expired)` | `$transaction` per item (write path, integrity-motivated) | Medium |
| `src/modules/webhooks/webhooks.service.ts:37-39` | `for (const webhook of webhooks)` | `webhookDelivery.create` (write path) | Medium |
| `src/modules/integration-platform/validation-engine.service.ts:19-20, 28-29` | `for (const issue of ...)` | `validationIssue.create` (write path) | Medium |

**Positive:** `src/modules/dashboard/composition.service.ts:90,162,379` uses `Promise.all`; `src/modules/agent-framework/agent-context.ts` uses `Promise.all` with `take` bounds; `src/app/(shell)/intelligence/page.tsx:20` and `agents/sessions/page.tsx:15` use `Promise.all`; `src/app/api/v1/sandbox/intelligence/route.ts:23` uses `Promise.all` over `map(async)`.

---

## 4. Unbounded Query Inventory (no take/skip/limit)

### API routes (verified no limit)
| File:Line | Model | Notes |
|---|---|---|
| `src/app/api/v1/admin/users/route.ts:13` | `companyMembership` | Deep include user→userRoles→role; no cache |
| `src/app/api/v1/admin/roles/route.ts:20` | `role` | Deep include permissions→permission; no cache |
| `src/app/api/v1/admin/connectors/route.ts:15` | `connectorConfig` | No cache |
| `src/app/api/v1/admin/webhooks/route.ts:22` | `webhook` | No cache |
| `src/app/api/v1/financial-reports/route.ts:41` | `financialReportDefinition` | cacheHeaders(30) — but no-store (F-01) |
| `src/app/api/v1/financial-reports/schedules/route.ts:46` | `financialReportSchedule` | cacheHeaders(15) — no-store |
| `src/app/api/v1/financial-reports/views/route.ts:43` | `financialReportView` | cacheHeaders(30) — no-store |
| `src/app/api/v1/financial-reports/board-pack/route.ts:52` | `financialReportBoardPack` | cacheHeaders (no-store) |
| `src/app/api/v1/integration-platform/health/route.ts:12,16` | `connectorConfig` + `integrationHealth` | Health data |

### Services (verified no limit)
| File:Line | Model | Notes |
|---|---|---|
| `src/modules/wallets/wallets.service.ts:9-12` | `wallet` | Called by `transactions/page.tsx:154` client page |
| `src/modules/agent-framework/agent-runtime.ts:242-250` | `agentDefinition` | |
| `src/modules/agent-framework/agent-context.ts:456-462` | `agentPermission` | |

**Positive:** `/api/v1/ap/invoices` (page/limit), `/api/v1/ledger` (`parseCursorPagination`, DEFAULT 20 / MAX 100 at `src/server/http/pagination.ts:1-2`), `/api/agents/[id]/tasks` (skip/take + count), `treasury/alerts` (take 100), `reconciliation/*` (take 50/limit).

---

## 5. Bundle Risk Inventory

| Risk | Evidence | Status |
|---|---|---|
| `ignoreBuildErrors: true` | `next.config.ts:16` | **Critical — masks type/bundle regressions; builds ship with errors** |
| Prisma/pg in client bundle | Client value imports from `@/modules`, `@/server`, `@/modules/*/index` barrels = **0** (verified via scan of 1,045 client components; all module imports are `import type` or client-safe deep imports: `work-queue/status`, `decision-workspace/format`, `dashboard/dashboard-service`) | Clean (H-01 fix held) |
| Missing `server-only` guards | Only 2 files (`decision-workspace/index.ts`, `workspace-service.ts`) | **Medium — regression-prone**: `command-center.service.ts:1` imports `prisma` and instantiates services at module scope; any future value import from a client component pulls `pg` |
| Heavy client libs | `@sentry/nextjs` (browserTracingIntegration, `sentry.client.config.ts`), `framer-motion@12.42.1`, `next-intl@4.13.1`, `sonner`, `lucide-react` (512 import sites), 9 Radix packages | Accepted; framer-motion + Sentry are the top two client bytes |
| Good patterns | `app-shell.tsx:28-30` lazy-loads CommandPalette/DemoController/OnboardingProvider via `next/dynamic({ ssr: false })`; `data-table.tsx` (753 lines, 6 memo/useMemo) | Positive |
| Client page bulk | `setup/page.tsx` (715 lines), `admin/rules/page.tsx` (613), `transactions/page.tsx` (531) — all `'use client'`, fetch-driven | Medium — server-renderable data (companies, roles, ledger) fetched client-side |

---

## 6. Top 10 Fixes Ranked by ROI

| Rank | Fix | Effort | ROI |
|---|---|---|---|
| 1 | **Remove `no-store` from `cacheHeaders()`** (`handle-route.ts:63`) — emit `s-maxage=N, stale-while-revalidate=N*10` only; add `stale-if-error`. Instant CDN caching for 212 endpoints incl. dashboard/data | 1 line | **Huge** — the single highest-leverage fix |
| 2 | **Cache/poll-fix pending approvals**: add `cacheHeaders(10)` or SWR to `/api/v1/admin/pending-approvals` + reduce `include` to `select`, lower `take` to 50; raise client poll to ≥30s (`PendingApprovalsClient.tsx:39`, `app-shell.tsx:184`) | 30 min | Huge — kills steady-state DB traffic |
| 3 | **Remove `ignoreBuildErrors: true`** (`next.config.ts:16`) and fix surfaced type errors | 1-2 d | Critical hygiene; enables bundle analysis |
| 4 | **Parallelize N+1 read loops**: `reconciliation-engine.ts:10`, `trend.engine.ts:74,150`, `scenario-modeling.ts:126,142` → single batched query (`findMany ... in:` + group) or `Promise.all` | 1-2 d | High — reconciliations/trends are batch jobs; latency ↓ 6-12× |
| 5 | **Add `take`/`skip` + count to admin list endpoints** (users, roles, connectors, webhooks, financial-reports ×4) | 0.5 d | High — unbounded payload elimination |
| 6 | **Add `cacheHeaders` to top CFO GETs**: `cfo/dashboard`, `ap/invoices` (work queue), `ledger`, `morning-briefing` (with `Vary` on filters) | 0.5 d | High — biggest-traffic uncached surfaces |
| 7 | **Stream the CFO dashboard**: wrap metric strip in `<Suspense>`; server-render `/api/dashboard/data` metrics in the page (metrics first, charts after); add `loading.tsx` to `executive/`, `cfo/`, `work-queue/` | 1-2 d | High — directly serves "metric values render first" |
| 8 | **Add `server-only` guards to all prisma-importing modules** (mechanical: add `import 'server-only'` to module barrels) | 0.5 d | High — prevents the bundle regression class |
| 9 | **Memoize legacy dashboard widgets** (`EnhancedTransactionsTable`, `RecentTransactionsTable`, `WalletOverview`, `SparklineGraph`, `CommandCenterWidgets`, `TelemetryWidget`) with `React.memo` + `useMemo` selectors | 1 d | Medium — cuts dashboard re-render churn |
| 10 | **Batch write loops** (`tick.service.ts`, `webhooks.service.ts`, `risk.service.ts:212`, `calendar.service.ts:136`, `validation-engine.service.ts`) into single-transaction `createMany`/`upsert` batching | 1-2 d | Medium — lower write amplification on cron paths |

---

## Appendix — Verification Stats

- GET handlers: 348; with `cacheHeaders`: 212 (61%); without: 136 (39%)
- `cacheHeaders` call sites: 210 across 214 files; TTL distribution: 123×30s, 52×15s, 25×60s, 3×300s, 3×120s, 2×0s, 1×3600s, 1×10s
- API route files: 472; pages: 485; `loading.tsx`: 41 (8.5%); `Suspense`: 0 in `src/app`
- Client components: 1,045; pages importing prisma directly (server): 50
- `findMany` total: 1,213; without take in same call: 1,136 (heuristic — includes multi-line takes)
- Unbounded verified API routes: 9; N+1 verified loops: 15 (10 read-path)
- `withRuntimeContext(new Headers())`: 54 routes
- Polling loops: 6 (10s approvals, 15s app-shell count, 30s notifications ×2, 60s intelligence-panel)
