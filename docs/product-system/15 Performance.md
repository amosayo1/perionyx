# 15 — Performance

**Product System · Document 15 of 20**
**Authority: Performance is the responsiveness, loading, and deterministic-execution specification for Perionyx. It derives from the Vision (00), Philosophy (01), Product Principles (02, especially the Performance domain), and Finance Principles (04), and is binding on all loading, rendering, and financial-execution behavior.**
**Sources: The four-product research program — Stripe S9 (perceived performance and trust), Linear S14 (velocity at scale), Ramp S14.4 (speed as a feature), Coupa S10.3 (enterprise performance); the performance audits (Phase 8A); the EDL; the runtime and persistence layers.**

---

## 1. The Performance Doctrine

**Performance is trust** (PP-128, PP-129). A CFO who waits is a CFO who doubts. Perionyx performance has two faces, and both are constitutional:

1. **Perceived performance** — the number renders before the chart, the page answers before the eye tires (PP-128, PP-043).
2. **Deterministic execution** — financial actions never succeed ambiguously, retry never double-executes, and the state after a failure is always known (PP-129, F-05, F-19).

The research synthesis:
- **Stripe** proves perceived performance is a trust instrument: value-first rendering, independent fallibility (PP-058).
- **Linear** proves velocity at scale: instant transitions, optimistic UI, cached views (PP-121, PP-058).
- **Ramp** proves speed is a feature for operators (PP-128).
- **Coupa** proves enterprise performance is not optional: indexes, pagination, and bounded queries (PP-066, PP-249).

## 2. Perceived Performance

- **Metrics render first** — KPI values paint independently of charts and tables (PP-043).
- **Skeletons preview structure** — loading shows shape, never a spinner wall (PP-242).
- **Independent fallibility** — one region's failure never blanks its neighbors (PP-058).
- **Optimistic UI with rollback** — immediate response, honest rollback on failure (PP-121).
- **Caching and persistence of projections** — views, filters, and positions persist; revisits are instant (PP-030, PP-247).
- **No page reloads** — navigation and mutations stay in-app (PP-247).

## 3. Data and Query Performance

- **Server-side filtering and pagination at scale** (PP-066) — the client never loads the full table (PP-249).
- **Indexes over scans** — every filtered query is indexed; N+1 is a defect (Phase 8A.2).
- **Parallel, read-only queries** — independent reads run in `Promise.all` (AGENTS.md: parallelization).
- **Bounded responses** — API responses carry limits, cursors, and totals; nothing unbounded (PP-075, PP-249).
- **Virtualization** — tables render only visible rows (PP-248).
- **Tiered cache** — critical data at short TTL, stale-while-revalidate; the freshness label is honest (PP-060, PP-152).

## 4. Deterministic Financial Execution

Financial performance is measured in certainty, not just seconds (PP-129):

- **Idempotency** — retries never double-post (F-05); requests carry keys.
- **Transactions and unit of work** — financial commands execute atomically (F-06).
- **Optimistic concurrency** — versioned writes; stale writes fail visibly (F-09).
- **Fail-closed money** — on doubt, the money action does not happen (F-10).
- **Explicit failure states** — a failed payment shows a failed state with recovery, never a silent maybe (F-19, PP-141).
- **Audit on every outcome** — success and failure both record (PP-165, F-08).

Deterministic execution is the performance gate finance can't negotiate: **speed is measured; certainty is guaranteed.**

## 5. The Performance Budget

Perionyx targets (Phase 8B.8, Lighthouse ≥95):

- **First paint** — metric values visible before meaningful interaction (PP-043).
- **Interactive** — under 2.5s on mid-range hardware (p75).
- **Layout stability** — CLS < 0.1; no content jumping (PP-219).
- **Chart render** — charts paint behind numbers, never before (PP-043).
- **Table interactions** — sort/filter respond within 100ms perceived (PP-068).

## 6. Performance Rules (Condensed)

1. Performance is trust: value-first, never the reverse (PP-128, PP-043).
2. Financial actions are deterministic: idempotent, transactional, fail-closed (F-05, F-06, F-10).
3. Skeletons, not spinners; regions fail independently (PP-242, PP-058).
4. Server-side filtering and pagination at scale (PP-066).
5. No N+1; every query indexed; reads parallelize (Phase 8A.2).
6. Optimistic UI with honest rollback (PP-121).
7. Stale data is labeled, never silent (PP-060).
8. Cached projections persist; revisits are instant (PP-030).
9. Budgets are enforced: CLS < 0.1, p75 interactivity (Phase 8B.8).
10. Speed is measured; certainty is guaranteed (PP-129).

## 7. Performance Anti-Patterns

- **The charts-first dashboard** — a CFO waiting for a chart to see a number (rejected: PP-043).
- **The client-side slice** — loading the whole dataset to the browser (rejected: PP-066).
- **The N+1 spiral** — a list page that queries per row (rejected: Phase 8A.2).
- **The silent maybe** — a financial action whose outcome is unknown (rejected: F-19).
- **The double-post** — retry after timeout creating a duplicate (rejected: F-05).
- **The unbounded response** — an API returning 400K rows (rejected: PP-249).
- **The layout jump** — content shifting after paint (rejected: PP-219).

---

*Next: `16 Architecture Principles.md` — the product architecture specification.*
