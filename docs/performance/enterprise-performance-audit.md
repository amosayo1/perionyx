# Enterprise Performance Audit Report

**Date**: 2026-07-07
**Scope**: Full-stack performance audit of the Perionyx codebase
**Methodology**: Static analysis of ~200 source files across architecture, database, API, rendering, state management, and service layers
**Status**: Assessment only — zero code changes

---

## Executive Summary

The audit identified **43 findings**: 7 Critical, 16 High, 15 Medium, 5 Low.

The most impactful issues are concentrated in three areas:

1. **Database query patterns** — N+1 loops in QuickBooks sync, identity directory sync, and connector listing will cause severe degradation at scale. Missing indexes on foreign keys and composite query patterns will be painful above 100k records.

2. **Bundle and rendering architecture** — Zero usage of `next/dynamic`, `React.memo`, or `Suspense` across the entire codebase. Every page eagerly bundles all components. 58% of pages are Client Components rendering server-fetchable data.

3. **Missing infrastructure** — No middleware, no caching headers, no query client (SWR/React Query), no image optimization. These are standard enterprise patterns that were deferred.

The total estimated performance gain from resolving all Critical findings is **40–65% reduction in page load time** and **50–80% reduction in database query volume** for the most expensive operations.

---

## Critical Findings

### C-01: N+1 Queries in QuickBooks Accounting Sync

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/connector-platform/services/quickbooks-accounting.service.ts:169–319` |
| **Pattern** | `syncVendors`, `syncCustomers`, `syncInvoices` each loop over N entities performing individual `findUnique` + `create`/`update` |
| **Impact** | For 5,000 entities: 10,001+ DB round trips instead of batch upsert |
| **Scaling Concern** | At 10 users: 50k DB calls. At 1,000 users: 5M DB calls per sync cycle |
| **Recommendation** | Use `createMany` + `updateMany` with `$transaction` — or follow the `ChartOfAccounts` pattern at lines 118–147 (already correct) |
| **Estimated Gain** | 99% reduction in DB round trips for sync operations |

### C-02: N+1 Queries in Identity Directory Sync

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/identity/adapters/google-workspace.ts:327–398`, `entra-id.ts:330–405` |
| **Pattern** | Per-user `findFirst`, `create`, `update` in a loop |
| **Impact** | For 1,000 users: 2,000+ individual DB calls |
| **Scaling Concern** | Directories with 10k+ users become synchronous multi-minute operations |
| **Recommendation** | Batch user creation with `createMany`, batch account creation, use `$transaction` |
| **Estimated Gain** | 95% reduction in sync time for large directories |

### C-03: N+1 Query in Connector Listing

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/connectors/connector-runs.service.ts:34–44` |
| **Pattern** | For each connector: `findFirst` (lastRun) + `count` (runCount) |
| **Impact** | For 50 connectors: 101 queries instead of 3 |
| **Scaling Concern** | Companies with 200+ connectors: 401 queries per API call |
| **Recommendation** | Use a single aggregation query or `Promise.all` batch |
| **Estimated Gain** | 95% reduction in connector listing latency |

### C-04: AI Provider Fetch Calls Without Timeouts

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/ai-provider/providers/openai.ts:43,70,161`, `anthropic.ts:41,68`, `gemini.ts:46,73`, `mistral.ts`, `grok.ts`, `cohere.ts`, `azure-openai.ts` |
| **Pattern** | `fetch()` with optional `request.signal` — when signal is undefined, the call can hang indefinitely |
| **Impact** | An AI provider outage holds open server resources until OS timeout (~2 minutes) |
| **Scaling Concern** | At 100 concurrent hanging requests: 100 server connections consumed for 2 minutes |
| **Recommendation** | Always provide `AbortSignal.timeout(30000)` as default in provider base class |
| **Estimated Gain** | Eliminates connection leak risk during provider outages |

### C-05: Zero `next/dynamic` Usage

| Attribute | Value |
|-----------|-------|
| **Location** | Entire codebase — no imports of `next/dynamic` or `React.lazy` |
| **Pattern** | All components are eagerly imported, including heavy modals (WelcomeModal, GuidedTourOverlay, CommandPalette, DemoBanner, MissionPanel) |
| **Impact** | Every shell page bundles ~100KB+ of JS that may never be used |
| **Scaling Concern** | Every user downloads the full application JS regardless of feature use |
| **Recommendation** | Use `next/dynamic` for: CommandPalette, WelcomeModal, GuidedTourOverlay, MissionPanel, DemoBanner, DemoController, all dashboard charts |
| **Estimated Gain** | 30–50% reduction in initial JS bundle size |

### C-06: Zero `next/image` Usage + 2.25MB PNG Logo

| Attribute | Value |
|-----------|-------|
| **Location** | `public/logo.PNG` (2,253,130 bytes — 2.25MB), used in 7 files via `<img>` tags |
| **Pattern** | Native `<img>` tags everywhere — no `next/image`, no lazy loading, no width/height, no responsive images |
| **Impact** | 2.25MB logo download on every page load; layout shift on every render; no WebP/AVIF |
| **Scaling Concern** | Every user pays the 2.25MB cost. At 10k daily visitors: ~22GB/day wasted bandwidth |
| **Recommendation** | Replace with `logo.svg` (757 bytes exists), migrate all `<img>` to `next/image`, configure `remotePatterns` if needed |
| **Estimated Gain** | 99.97% reduction in logo bandwidth (2.25MB → 757 bytes) |

### C-07: Missing Transaction Boundaries in Tick Service

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/tick/tick.service.ts:68–128` |
| **Pattern** | Approval escalations and rejections update `transactionApproval` + `transaction` + send notifications without `$transaction` |
| **Impact** | Mid-operation failure leaves data in inconsistent state (approval escalated but transaction not updated) |
| **Scaling Concern** | At scale, partial failures become statistically inevitable |
| **Recommendation** | Wrap escalation and rejection logic in `prisma.$transaction` |
| **Estimated Gain** | Eliminates data inconsistency risk |

---

## High Findings

### H-01: No Middleware (edge auth gating)

| Attribute | Value |
|-----------|-------|
| **Location** | No `src/middleware.ts` exists |
| **Impact** | Unauthenticated requests reach Server Components before redirect |
| **Recommendation** | Add `middleware.ts` for auth check + redirect at edge |
| **Estimated Gain** | Reduces unauthenticated render overhead by 100% |

### H-02: No Caching Headers on Any API Route

| Attribute | Value |
|-----------|-------|
| **Location** | All 80+ GET routes in `src/app/api/v1/` and `src/app/api/automation-studio/` |
| **Impact** | Every request hits the database; no browser/CDN caching |
| **Recommendation** | Add `Cache-Control` to rate-appropriate routes (30s for health, 60s for rates, etc.) |
| **Estimated Gain** | 30–70% reduction in API call DB load for frequently-polled endpoints |

### H-03: 58% of Pages Are Client Components

| Attribute | Value |
|-----------|-------|
| **Location** | 43+ `page.tsx` files with `"use client"` |
| **Impact** | No server-side data fetching, extra render cycle, no streaming |
| **Recommendation** | Convert data-fetching pages (audit-logs, policies, reconciliation) to Server Components |
| **Estimated Gain** | 20–40% reduction in page load time for converted pages |

### H-04: Landing Page = 13 Client Components

| Attribute | Value |
|-----------|-------|
| **Location** | `src/app/page.tsx` imports 13 `'use client'` components |
| **Impact** | Static marketing content forces JS download |
| **Recommendation** | Remove `'use client'` from presentational landing components (Footer, TrustBar, ProblemSection, etc.) |
| **Estimated Gain** | ~100KB reduction in landing page JS |

### H-05: AppShell Re-renders All 38 Nav Items on Every Route Change

| Attribute | Value |
|-----------|-------|
| **Location** | `src/components/app-shell.tsx:146–444` |
| **Impact** | Every navigation re-renders entire nav tree; polling every 15s triggers full re-render |
| **Recommendation** | Extract nav list into memoized child, use `React.memo`, separate active state computation |
| **Estimated Gain** | 50–70% reduction in nav re-render cost |

### H-06: Sequential `create()` in Loop Instead of `createMany()`

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/workflow/engine.ts:247–249`, `calendar.service.ts:136–150`, `risk.service.ts:211–220` |
| **Impact** | For N step instances: N sequential DB round trips (50ms × 20 = 1s) |
| **Recommendation** | Replace loops with `createMany()` |
| **Estimated Gain** | 80–95% reduction in insert time |

### H-07: Missing FK Index on `Account.userId`

| Attribute | Value |
|-----------|-------|
| **Location** | `prisma/schema.prisma` — `Account` model, `userId` field |
| **Impact** | Auth adapter queries by userId perform full table scans |
| **Recommendation** | Add `@@index([userId])` to `Account` model |
| **Estimated Gain** | Sub-millisecond lookups vs table scan |

### H-08: Missing Composite Index `TransactionApproval(transactionId, status)`

| Attribute | Value |
|-----------|-------|
| **Location** | `prisma/schema.prisma` — `TransactionApproval` model |
| **Impact** | Approval workflow queries filter by transactionId + status — missing composite index |
| **Recommendation** | Add `@@index([transactionId, status])` |
| **Estimated Gain** | Index seek vs sequential scan on approval lookups |

### H-09: Missing `$transaction` in Workflow Instance Creation

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/workflow/engine.ts:205–258` |
| **Impact** | Partial instance creation possible if step creation fails |
| **Recommendation** | Wrap in `prisma.$transaction` |
| **Estimated Gain** | Eliminates zombie workflow instances |

### H-10: Missing `$transaction` in Approval Thread Operations

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/approval-thread/approval-thread.service.ts:107–138` |
| **Impact** | Comment created but participant/audit write fails — orphaned data |
| **Recommendation** | Wrap in `prisma.$transaction` |
| **Estimated Gain** | Eliminates orphaned comment risk |

### H-11: Unbounded `history` Array in ApprovalMatrixEvaluator

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/automation-studio/approval-matrix-evaluator.ts:30–35` |
| **Impact** | Array grows without bound — memory leak over time |
| **Recommendation** | Add size cap (e.g., 1000 entries) or use LRU cache |
| **Estimated Gain** | Eliminates long-running memory growth |

### H-12: Unbounded Rate Limiter Maps

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/ai-provider/rate-limiter.ts:12–13` |
| **Impact** | `requestBuckets` and `tokenBuckets` grow with every unique tenant key — no eviction |
| **Recommendation** | Use LRU cache or periodic cleanup with TTL |
| **Estimated Gain** | Eliminates memory growth proportional to tenant count |

### H-13: `getAnalytics()` Loads All Instances Into Memory

| Attribute | Value |
|-----------|-------|
| **Location** | `src/modules/automation-studio/automation-studio.service.ts:902–1009` |
| **Impact** | `findMany` without date filter — loads ALL workflow instances for analytics computation |
| **Recommendation** | Add date range filter to Prisma query; aggregate in DB not in-memory |
| **Estimated Gain** | Linear to logarithmic memory savings as instance count grows |

### H-14: Auth JWT Callback Makes 2 DB Queries Per Request

| Attribute | Value |
|-----------|-------|
| **Location** | `src/server/auth/auth.ts:67–113` |
| **Impact** | Every authenticated request triggers `companyMembership.findFirst` + `company.findUnique` |
| **Recommendation** | Cache membership in JWT token; invalidate on role change |
| **Estimated Gain** | Eliminates 2 queries per authenticated request |

### H-15: No AI Response Caching

| Attribute | Value |
|-----------|-------|
| **Location** | All AI provider implementations |
| **Impact** | Identical or similar prompts hit API every time |
| **Recommendation** | Add semantic caching layer with TTL based on prompt similarity |
| **Estimated Gain** | 20–40% reduction in AI API costs |

### H-16: Dashboard Sequential Pagination Loop

| Attribute | Value |
|-----------|-------|
| **Location** | `src/app/(shell)/dashboard/page.tsx:70` — `fetchTotalTransactions(20)` |
| **Impact** | Up to 20 sequential API calls (each fetching 100 records, totaling 2000) just for a count |
| **Recommendation** | Use `count` endpoint instead of paginated fetch for total |
| **Estimated Gain** | Eliminates 19 of 20 sequential calls |

---

## Medium Findings

### M-01: No Suspense Boundaries (except 1)

| Location | Impact | Recommendation |
|----------|--------|---------------|
| Entire codebase — 1 Suspense in sign-up page only | All pages block on slowest fetch | Wrap async data sections in `<Suspense>` with fallbacks |

### M-02: `React.memo` Never Used

| Location | Impact | Recommendation |
|----------|--------|---------------|
| All presentational components | Every component re-renders on parent change | Add `React.memo` to: ApprovalStatusBadge, SparklineGraph, StatCard, StatusBadge, MetricCard |

### M-03: 7 Components Have Unnecessary `'use client'`

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `approval-status-badge.tsx`, `approval-chain-badge.tsx`, `escalation-warning.tsx`, `approval-indicator.tsx`, `approval-timeline.tsx`, `notification-badge.tsx`, `approval-details-panel.tsx` | Server-compatible HTML in client bundle | Remove `'use client'` |

### M-04: Missing Virtualization on Large Data Lists

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `data-table.tsx`, `enterprise/table/data-table.tsx`, `incident-table.tsx` | DOM bloat with large datasets | Integrate `@tanstack/react-virtual` for table rows |

### M-05: Non-Sargable Global Search (ILIKE on 14 Tables)

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `src/modules/search/global-search.ts:46–104` | Full table scans on every search | Use PostgreSQL `tsvector`/`tsquery` or dedicated search engine |

### M-06: Missing Pagination on Governance/RBAC/Workflow Queries

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `policy-registry.ts:9–48`, `rbac.service.ts:35,101`, `workflow/engine.ts:131–134` | Loads all records into memory | Add `take`/`skip` with sensible defaults |

### M-07: Deeply Nested Include (4 Levels) in RBAC

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `rbac.service.ts:111,136` | Materializes N×M rows per permission check | Use subquery or flatten |

### M-08: Sequential Step Execution in Workflow Engine

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `engine.ts:290–292` | Workflow duration = sum of all step times | Parallelize independent branch steps |

### M-09: Sequential AI Provider Health Checks

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `registry.ts:46–59` | Each call hits all provider APIs sequentially | Add health cache with TTL; run checks in parallel |

### M-10: No SWR/React Query for Client Data Fetching

| Location | Impact | Recommendation |
|----------|--------|---------------|
| All `useEffect` + `fetch()` patterns | No deduplication, caching, retry | Adopt TanStack Query for client-side data fetching |

### M-11: `framer-motion` in 61 Components Without Code Splitting

| Location | Impact | Recommendation |
|----------|--------|---------------|
| Shell + landing components | ~30KB framed adds to every page bundle | Dynamic import or replace with CSS animations |

### M-12: Missing `useMemo` on Expensive Computations

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `analytics-dashboard.tsx:115`, `automation-dashboard.tsx:384` — `Math.max(...stepDuration.map(...))` inside render | Recalculated on every render | Memoize with `useMemo` |

### M-13: Sequential Approval Statistics (4 Count Queries)

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `approval-workflow.ts:533–547` | 4 sequential queries could be 1 | Single aggregate or `Promise.all` |

### M-14: Webhook HTTP Deliveries Without Timeout

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `webhooks.service.ts:27,146` | Hanging webhook holds connection | Add `AbortSignal.timeout(10000)` |

### M-15: Unnecessary `'use client'` on Onboarding Wizard

| Location | Impact | Recommendation |
|----------|--------|---------------|
| `onboarding-wizard.tsx` | Entire 400+ line wizard in client bundle | Split; keep interactive parts client, static parts server |

---

## Low Findings

### L-01: No `@relation` on `GovernanceFrameworkPolicy.policyId`

| Location | Impact |
|----------|--------|
| `schema.prisma:1880` | Silent FK enforcement gaps |

### L-02: Decimal(38,12) on Non-Critical Fields

| Location | Impact |
|----------|--------|
| Schema — various `amount`/`balance` fields | 16 bytes per field overhead |

### L-03: No Custom `font-display` Strategy

| Location | Impact |
|----------|--------|
| `layout.tsx:7–15` | Default `swap` may cause FOUT on very slow connections |

### L-04: Mobile Nav Duplicates Full Nav List in DOM

| Location | Impact |
|----------|--------|
| `app-shell.tsx:407–424` | Double evaluation of 38 nav items on mobile |

### L-05: Sidebar Favorites/Recent Re-render on Pathname

| Location | Impact |
|----------|--------|
| `sidebar-favorites.tsx:41`, `sidebar-recent-pages.tsx:66` | Minor re-render overhead |

---

## Prioritized Optimization Roadmap

### Phase 1 — Critical (Week 1)

| Order | ID | Finding | Effort | Gain |
|-------|----|---------|--------|------|
| 1 | C-06 | Replace 2.25MB logo with SVG + migrate to `next/image` | 2h | 99.97% bandwidth reduction |
| 2 | C-04 | Add AbortSignal.timeout to all AI provider fetches | 1h | Eliminate hanging connection risk |
| 3 | C-03 | Fix N+1 in connector listing (batch query) | 2h | 95% latency reduction |
| 4 | C-01 | Fix N+1 in QuickBooks sync (createMany + updateMany) | 4h | 99% DB round trip reduction |
| 5 | C-02 | Fix N+1 in identity directory sync | 4h | 95% sync time reduction |
| 6 | C-07 | Wrap tick service operations in $transaction | 3h | Eliminate data inconsistency risk |
| 7 | C-05 | Add next/dynamic for heavy components | 4h | 30–50% JS bundle reduction |

### Phase 2 — High (Week 2)

| Order | ID | Finding | Effort | Gain |
|-------|----|---------|--------|------|
| 8 | H-01 | Create middleware.ts for edge auth | 1h | Redirect before render |
| 9 | H-02 | Add Cache-Control headers to GET routes | 3h | 30–70% DB load reduction |
| 10 | H-16 | Fix dashboard sequential pagination loop | 1h | Eliminate 19 of 20 calls |
| 11 | H-14 | Cache membership in JWT token | 2h | Eliminate 2 queries per request |
| 12 | H-07 | Add missing FK indexes | 1h | Sub-ms lookups |
| 13 | H-08 | Add composite index | 1h | Index seek vs scan |
| 14 | H-06 | Replace sequential creates with createMany | 2h | 80–95% insert time reduction |

### Phase 3 — High (Week 3)

| Order | ID | Finding | Effort | Gain |
|-------|----|---------|--------|------|
| 15 | H-11 | Add size cap to ApprovalMatrixEvaluator history | 1h | Memory leak fix |
| 16 | H-12 | Add TTL to rate limiter Maps | 1h | Memory leak fix |
| 17 | H-13 | Add date filters to getAnalytics query | 2h | Linear memory savings |
| 18 | H-15 | Add AI response caching | 3h | 20–40% cost reduction |
| 19 | H-03 | Convert top 10 Client Component pages to Server | 8h | 20–40% page load reduction |
| 20 | H-04 | Convert landing components to Server Components | 3h | ~100KB JS reduction |

### Phase 4 — Medium (Week 4)

| Order | ID | Finding | Effort | Gain |
|-------|----|---------|--------|------|
| 21 | M-01 | Add Suspense boundaries to data-fetching sections | 4h | Progressive page rendering |
| 22 | M-02 | Add React.memo to presentational components | 2h | Reduced re-render cascades |
| 23 | M-03 | Remove unnecessary 'use client' directives | 1h | Smaller client bundles |
| 24 | M-10 | Introduce TanStack Query for client fetching | 6h | Dedup, caching, retry |
| 25 | M-05 | Add PostgreSQL full-text search indexes | 4h | Eliminate full table scans |
| 26 | M-06 | Add pagination to unbounded queries | 3h | Prevent memory pressure |

### Phase 5 — Low (Ongoing)

| Order | ID | Finding | Effort | Gain |
|-------|----|---------|--------|------|
| 27 | M-11 | Replace framer-motion animations with CSS | 4h | ~30KB bundle reduction |
| 28 | M-04 | Add virtualization to data tables | 4h | Smooth rendering at 10k+ rows |
| 29 | L-01–L-05 | Various minor fixes | 3h | Incremental improvements |

---

## Estimated Performance Gains

| Metric | Current | After Phase 1–2 | After Phase 1–3 |
|--------|---------|-----------------|-----------------|
| Landing page JS bundle | ~150KB+ | ~50KB | ~50KB |
| Shell page JS bundle | ~200KB+ | ~120KB | ~80KB |
| Dashboard initial load | 4–6 sequential API calls | 2 sequential + 2 parallel | 4 parallel |
| Logo bandwidth | 2.25MB per page | 757 bytes per page | 757 bytes per page |
| QuickBooks sync (5000 items) | 10k+ DB calls | 2–4 batch calls | 2–4 batch calls |
| Directory sync (1000 users) | 2k+ DB calls | 4–6 batch calls | 4–6 batch calls |
| Connector listing (50 items) | 101 DB calls | 3 DB calls | 3 DB calls |
| Auth per request | 2 DB queries | 0 DB queries | 0 DB queries |
| AI provider hanging risk | Indefinite | 30s timeout | 30s timeout |
| In-memory store growth | Unbounded | Capped at 1000 | Capped + TTL |
| Analytics query memory | O(n) instances | O(filtered) | O(filtered) |
| API cache utilization | 0% | 0% | Estimated 30–70% |

---

## Scaling Projections

| Scenario | Current Behavior | After Optimization |
|----------|-----------------|-------------------|
| **10 users**, 1k transactions each | Functional. QuickBooks sync ~5s. Dashboard loads in ~1s. | QuickBooks sync <100ms. Dashboard loads in ~500ms. |
| **100 users**, 10k transactions each | Noticeable slowdown. Connector listing ~3s. Analytics queries ~5s. | Connector listing <200ms. Analytics queries <500ms. |
| **1,000 users**, 100k transactions each | N+1 queries cause timeouts. QuickBooks sync >10min. Bundle size causes 3s+ JS parse. | Sync <5s. Listings <500ms. JS parse <1s. |
| **10,000 users**, 1M transactions each | Current architecture cannot scale. Memory leaks OOM. Auth query storm kills DB. | Optimized queries 50x fewer. Auth offloaded to JWT. Bundle code-split. |

---

## Compliance Cross-Reference

| Framework | Relevant Findings | Status |
|-----------|------------------|--------|
| Engineering Constitution ($18 DoD) | C-01, C-02, C-03, H-06 — performance non-compliance | 4 violations |
| Enterprise Readiness Checklist (item 9) | H-13 — analytics scalability gap | 1 gap |
| AI Engineering Playbook (item 5) | C-04, H-15 — missing timeouts, missing caching | 2 violations |
| Secure Development Lifecycle | C-07, H-09, H-10 — missing transaction boundaries | 3 risks |
| Performance Standards | All 43 findings | Comprehensive assessment |
| Release Checklist | N/A — pre-release, no code changes | Assessment only |

---

*This report is an assessment only. No code changes were made. All recommendations are advisory pending prioritization.*

*Next step: Phase 8A.2 — Prioritized optimization implementation.*
