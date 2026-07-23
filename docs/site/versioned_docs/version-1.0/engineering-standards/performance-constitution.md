---
id: performance-constitution
title: Performance Constitution
sidebar_label: Performance
---

# Perionyx Performance Constitution

**Version:** 1.0.0
**Status:** Ratified
**Scope:** All engineering work on the Perionyx platform

---

## Preamble

Performance is a first-class architectural requirement of the Perionyx Enterprise Financial Operating System. Every feature, bug fix, refactor, integration, and architectural change must satisfy the principles herein. Performance is not an afterthought — it is designed in from the start.

This constitution is supplementary to the Perionyx Engineering Constitution. Where both documents apply, the stricter principle governs.

---

## Part I — Frontend Performance

### 1.1 Prefer Server Components

Pages and page sections that do not require interactivity, browser APIs, or React state must be Server Components. Client Components must be pushed to the leaves of the component tree.

### 1.2 Minimize Client Components

Every `"use client"` directive increases the JavaScript bundle delivered to the browser. Before adding `"use client"`, determine whether the interactivity can be achieved with a Server Component + URL state, a form action, or a web component.

### 1.3 Lazy Load Heavy Modules

Charting libraries, rich text editors, PDF viewers, CSV parsers, and other heavy dependencies must be dynamically imported with `next/dynamic`. They must not be included in the initial bundle.

### 1.4 Code Split Large Pages

Pages exceeding 500 lines of component code must be split into smaller route segments or parallel routes. Large client bundles must be identified and split at route boundaries.

### 1.5 Virtualize Large Tables

Tables exceeding 100 rows must use virtualization (windowed rendering). The `react-virtualized` or `@tanstack/react-virtual` libraries must be used rather than rendering all rows to the DOM.

### 1.6 Use Optimistic UI

Mutations that succeed 95%+ of the time (toggling favorites, dismissing notifications, updating preferences) must use optimistic UI. The UI must reflect the expected result immediately and reconcile on server confirmation or error.

### 1.7 Prevent Unnecessary Re-Renders

Components must be wrapped in `React.memo` when their props change without requiring a re-render. Callback props must use `useCallback`. Expensive derivations must use `useMemo`.

### 1.8 Memoize Expensive Computations

Data transformations, sorting, filtering, and grouping of arrays exceeding 1,000 items must use `useMemo` with explicit dependency arrays. Computations that can be pushed to the server (via route handlers or server actions) should be.

### 1.9 Debounce Search

Search-as-you-type inputs must debounce by at least 300ms before triggering API calls or URL updates. Debouncing prevents excessive requests during rapid typing.

### 1.10 Throttle Frequent Events

Scroll, resize, pointer-move, and other high-frequency events must be throttled to at most 16ms intervals (60fps). Libraries like `lodash.throttle` or `requestAnimationFrame` must be used.

### 1.11 Prefetch Likely Navigation Targets

Links to likely destinations (most-used pages, next step in a wizard, primary CTA) must use `<Link prefetch={true}>`. The Next.js router prefetches these in the background during idle time.

### 1.12 Use Loading Skeletons

All data-fetching boundaries must display skeleton placeholders instead of spinners. Skeletons must match the layout of the expected content to reduce cumulative layout shift (CLS).

---

## Part II — Backend Performance

### 2.1 Never Perform N+1 Database Queries

Every list endpoint that returns related data must use Prisma `include` or `select` with joins. Detecting N+1 in code review is a blocking issue. The Prisma `findMany` with `include` is the standard pattern.

### 2.2 Batch Queries

Multiple independent queries that can be combined into a single query must be batched. Use Prisma's `findMany` with `in` filters rather than looping individual `findUnique` calls.

### 2.3 Select Only Required Columns

Every Prisma query must use `select` or Prisma's default selection behavior. `include: { relation: true }` without `select` on the relation is acceptable only when the full relation object is needed. `select` must be used on the top-level model.

### 2.4 Always Paginate Large Datasets

Every list endpoint that returns a variable number of results must support cursor-based or offset-based pagination. The default page size must not exceed 100 records. Unbounded queries are forbidden.

### 2.5 Use Efficient Indexes

Every query pattern must be backed by at least one index. The query planner must be verified with `EXPLAIN ANALYZE` for any query that touches more than 10,000 rows.

### 2.6 Profile Slow Queries

Any API endpoint exceeding 500ms p95 latency must be profiled. The slow query must be identified, optimized, and re-verified. The performance baseline must be documented in the PR.

### 2.7 Cache Expensive Read Operations

Read operations that produce the same result for multiple users (configuration, metadata, reference data) must be cached with an appropriate TTL. In-memory caches (`Map`, `lru-cache`) must be used for per-process data. Redis must be used for cross-process caches.

### 2.8 Run Long-Running Work Asynchronously

Any operation expected to take longer than 500ms (sync operations, report generation, reconciliation, bulk operations) must be queued with PgBoss. The API must return immediately with a job ID or status URL.

### 2.9 Never Block API Requests

API requests must not wait synchronously for background work to complete. The response must be returned immediately once the work is queued or validated. Polling or WebSocket must be used for status updates.

---

## Part III — Database Performance

### 3.1 Review Every New Table for Indexes

Every new table must have indexes on:
- `companyId` (tenant isolation)
- Any column used in `WHERE`, `ORDER BY`, or `JOIN` clauses
- Composite indexes for multi-column filter patterns

### 3.2 Use Transactions Only When Needed

Not every write requires a transaction. Single-row writes, idempotent operations, and non-financial writes may use implicit transactions. Transaction scope must be minimized — wrap only the writes that need atomicity.

### 3.3 Keep Transactions as Short as Possible

Transactions must not include I/O operations (API calls, email sending, file uploads), user wait time (confirmation dialogs), or expensive computations. Move all non-database work outside the transaction.

### 3.4 Use Row Locking Only Where Required

`FOR UPDATE` row locks must be used only for financial writes that need pessimistic concurrency control. Read-only operations, non-financial writes, and operations that can tolerate stale reads must not acquire row locks.

### 3.5 Use Optimistic Locking Where Appropriate

Non-financial writes that risk concurrent modification (preferences, metadata, configurations) must use optimistic locking via a `version` column. Pessimistic locking is reserved for financial integrity.

### 3.6 Archive Historical Data

Tables exceeding 10 million rows must have an archiving strategy. Historical data (completed transactions, resolved alerts, processed reconciliations) must be moved to archive tables or partitioned into time-based ranges.

---

## Part IV — Workflow Engine Performance

### 4.1 Never Execute Expensive Workflows Synchronously

Workflow execution that involves multiple steps, human approvals, or external API calls must not execute in the request-response cycle. The workflow must be queued and executed asynchronously.

### 4.2 Queue Long-Running Jobs

Workflow instances with an estimated duration exceeding 1 second must be enqueued with PgBoss. The API must return immediately with the workflow instance ID for status tracking.

### 4.3 Stream Progress Back to the UI

Long-running workflow executions must provide status updates. The UI must poll or subscribe to workflow events via the existing `WorkflowEvent` model. The user must never stare at a blank screen during workflow execution.

---

## Part V — Connector Platform Performance

### 5.1 Sync Incrementally

Connector sync operations must use incremental sync strategies (since the last sync timestamp, since the last sync token). Full re-syncs must be explicitly requested by the user and must show a warning about duration.

### 5.2 Retry Intelligently

Connector failures must use exponential backoff with jitter. The retry strategy must account for rate limits (HTTP 429), transient failures (5xx), and permanent failures (4xx that are not rate limits). Permanent failures must not be retried.

### 5.3 Avoid Full Re-Syncs

Full re-synchronization of a connector must never be triggered automatically. It must require explicit user action. The UI must display an estimated duration and a progress indicator during re-syncs.

---

## Part VI — AI Platform Performance

### 6.1 Cache Repeated Prompts

Prompts that produce deterministic or near-deterministic results (data formatting, classification, extraction with fixed schemas) must be cached. The cache key must include the prompt template, input parameters, and model identifier.

### 6.2 Stream Responses

AI responses must be streamed using Server-Sent Events or ReadableStream. The UI must display partial results incrementally. The user must never wait for a complete AI response before seeing any output.

### 6.3 Support Cancellation

All AI requests must support cancellation via `AbortController`. The UI must provide a visible cancel button during AI processing. Cancelled requests must not consume API quota or billing time.

### 6.4 Track Latency

AI provider latency must be tracked per provider, per model, and per prompt template. The `AiUsage` and `AiProviderHealth` models must be populated for every AI request. Latency outliers must trigger alerts.

---

## Part VII — UI Responsiveness Principles

### 7.1 Instant Navigation

Page transitions must feel instantaneous. Server Components with streaming and Suspense boundaries must be used to deliver content progressively. The goal is under 200ms for first paint of meaningful content.

### 7.2 Immediate Dialog Opening

Dialogs, modals, and side panels must open in under 50ms. The content inside may load asynchronously, but the shell must appear immediately. Skeleton layouts must be used for dialog content.

### 7.3 Fast Filtering

Client-side filtering of datasets under 10,000 items must respond in under 100ms. Server-side filtering must debounce by 300ms and respond in under 500ms. Filtering must never block the UI thread.

### 7.4 Progressive Chart Rendering

Charts must render progressively. The axes and grid must appear first, followed by data points, followed by labels and annotations. Large datasets (>10,000 points) must be downsampled before rendering.

### 7.5 Immediate Skeletons

Skeleton placeholders must appear within 50ms of initiating a data fetch. The skeleton must match the final layout dimensions to prevent layout shift. Spinners must never be the primary loading indicator.

---

## Part VIII — Performance Monitoring

### 8.1 Metrics to Track

The Operations Dashboard must track the following metrics:

| Metric | Source | Alert Threshold |
|---|---|---|
| API latency (p50/p95/p99) | Route handler instrumentation | p95 > 1s |
| Database query latency (p50/p95) | Prisma middleware | p95 > 500ms |
| Queries per request | Prisma middleware | > 20 per request |
| Slow queries (>500ms) | Prisma middleware + pg_stat_statements | > 1% of queries |
| PgBoss queue latency | Queue service | > 5s |
| Workflow execution time | WorkflowInstance | p95 > 30s |
| Connector sync latency | ConnectorRun | p95 > 5min |
| AI provider latency | AiProviderHealth | p95 > 10s |
| Next.js render time | Server Actions / Route handlers | p95 > 500ms |
| Client-side render time | PerformanceObserver (FCP, LCP, INP) | LCP > 2.5s |
| Bundle size (JS per page) | next/build output | > 200kB per page |

### 8.2 Monitoring Integration

These metrics must be surfaced in the Operations Dashboard at `/operations`. Each metric must have:
- Current value
- Trend (7-day sparkline)
- Alert status (normal / warning / critical)
- Link to relevant logs or traces

### 8.3 Performance Regression Detection

Automated performance tests must run on every staging deployment. A regression of more than 20% in any tracked metric must block the deployment and notify the engineering team.

---

## Part IX — Performance Impact Assessment

Every feature, bug fix, refactor, integration, and architectural change **must** include a Performance Impact Assessment before implementation begins. The assessment is documented in the implementation report and reviewed as part of code review.

The assessment template is defined in the Perionyx Engineering Constitution (Section 19). It is mandatory and may not be skipped.

---

## Ratification

This constitution is ratified by the engineering organization and governs all code in the Perionyx repository. It is supplementary to the Perionyx Engineering Constitution. Amendments require review by the architecture review board and a 2/3 majority of the engineering team.

---

*Last amended: 2026-07-06*
