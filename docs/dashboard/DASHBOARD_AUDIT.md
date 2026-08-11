# Dashboard v2 — Audit of the Current Implementation

Phase 22.2 · Deliverable 1 of 4
Status: **COMPLETE** — evidence verified against source, `pnpm typecheck` clean at time of writing.

## 1. Purpose

The current dashboard (`/dashboard`) is treated as a **prototype**. This audit compares it, file-by-file and section-by-section, against the Product System (`docs/product-system/`), identifies **every** violation, and records the evidence so the redesign (Deliverable 2) can be engineered rather than guessed.

Audit method: every finding below was verified by reading the referenced source file and the referenced Product System principle. No finding is asserted from memory.

## 2. Current Implementation Inventory (verified)

| Surface | Location | What it actually does |
|---|---|---|
| Page | `src/app/(shell)/dashboard/page.tsx` | Thin server component: `auth()`, redirects to `/onboarding` when no `activeCompanyId`, renders `DashboardPageClient`. |
| Shell | `src/components/dashboard/dashboard-page-client.tsx` | Client component. Fetches `/api/dashboard/data` **and** `/api/dashboard/todays-work` (two requests). Renders sections: Greeting → Today's Work → Work Queue + Financial Health → AI Brief + Recent Activity. |
| Greeting | `src/components/dashboard/dashboard-greeting.tsx` | Time-based "Good morning/afternoon" + workload summary sentence. |
| Today's Work | `src/components/dashboard/dashboard-todays-work.tsx` | 4 category cards (high/medium-priority reviews, quick approvals, policy exceptions) from `TodaysWorkService`. Each card navigates to a category page. |
| Work Queue | `src/components/dashboard/dashboard-queue-preview.tsx` | Table of up to 5 `WorkQueuePreviewItem` rows. Rows are **not** clickable; only "View All" links to `/work-queue`. |
| AI Brief | `src/components/dashboard/dashboard-ai-brief.tsx` | Collapsible "recommendations" with a hardcoded confidence number and dead action buttons. |
| Financial Health | `src/components/dashboard/dashboard-financial-health.tsx` | 4 `ExecutiveKpiCard`s. `comparisonLabel="previous period"` is rendered even though no comparison exists. |
| Activity | `src/components/dashboard/dashboard-activity.tsx` | Maps `ActivityItem[]` to generic `ActivityTimeline`. |
| Module | `src/modules/dashboard/composition.service.ts` | Composes `DashboardData`: today's work (flat), work queue (page 1, size 5 → `toWorkQueuePreviewItem`), 4 financial metrics, 6 activity items, greeting, synthetic AI brief. |
| Module | `src/modules/dashboard/types.ts` | `DashboardData`, `AiBriefRecommendation.confidence: number`, `FinancialHealthMetric.change: string`, etc. |
| API | `src/app/api/dashboard/data/route.ts` | GET, `withRuntimeContext`, `cacheHeaders(15)`. |
| API | `src/app/api/dashboard/todays-work/route.ts` | GET, `withRuntimeContext`, `cacheHeaders(15)`. |

### Reusable canonical domains that exist but are NOT wired in

| Domain | Location | Why it matters for v2 |
|---|---|---|
| Decision Intelligence | `src/modules/decision-intelligence/` | `Decision`, `DecisionExplainability` (why, evidenceUsed, forecastsConsidered, policiesInvolved, assumptions, confidenceCalculation, expectedOutcome, alternativesConsidered), `DecisionScore`, `DecisionTimeline`. This is the correct backbone for a Decision Brief. |
| Command Center | `src/modules/command-center/command-center.service.ts` | `CommandCenterData` with `executiveSummary` (KPI metrics), `decisions`, `criticalDecisions`, treasury liquidity. |
| Today's Work | `src/modules/todays-work/` | Already canonical and correctly used. |
| Work Queue | `src/modules/work-queue/` | Canonical. `WorkQueueItem` carries `slaStatus`, `dueDate`, `exceptionCount`, `invoiceAgeDays`, `assignedTo` — all dropped by the preview projection. |
| Enterprise components | `src/components/enterprise/` | `ExecutiveKpiCard`, `ActivityTimeline`, `PageContainer`, `DashboardSection`, `AnimatedCard`, `confidence-badge`, `data-freshness-indicator`, `empty-state`, `dashboard-template`, `dashboard-grid`. |

## 3. Violations — ranked by severity

### SEV-1 — Fabricated AI confidence (constitutional)

- **Product System**: DI Invariant 3 "Never fabricate confidence. Categories and defined bands only; no '72%'"; AI Clause 4 "Confidence is measured and categorical, not a fake scalar"; PP-109.
- **Evidence**: `src/modules/dashboard/composition.service.ts:185` hardcodes `confidence: 75` in `buildAiBrief()`. `dashboard-ai-brief.tsx:71` renders it as `{rec.confidence}% confidence` with an `AlertTriangle` icon.
- **Impact**: The single most trust-damaging pattern on the surface. A CFO seeing "75% confidence" believes a measurement exists. None does.
- **Fix (v2)**: Replace with categorical confidence (`Approve / Reject / Needs-review`) backed by the Evidence Package — or remove the recommendation.

### SEV-2 — Recommendations without an Evidence Package

- **Product System**: DI Invariant 6 "Never ship a recommendation without its evidence. The Evidence Package is a release gate."; AI Section 3 (claim, sources, citations, reasoning, confidence, alternatives, basis, integrity); PP-104–PP-110.
- **Evidence**: `AiBriefRecommendation` (types.ts) has only `id/title/explanation/actions/confidence`. `buildAiBrief()` (composition.service.ts:150–198) builds recommendations from string concatenation of count thresholds — no sources, no citations, no reasoning chain, no basis, no alternatives.
- **Impact**: An "AI Brief" whose reasoning cannot render is, per DI Invariant 4, a bug.
- **Fix (v2)**: Wire `decision-intelligence` and render its `DecisionExplainability`.

### SEV-3 — A non-AI heuristic is presented as AI

- **Product System**: AI Section 1 "AI explains; it never decides"; AI Rules; PP-145 "Trust is stated, not implied".
- **Evidence**: `buildAiBrief()` is deterministic rule code (if automationRate < 80 → recommend; if exceptions > 5 → recommend). It is labeled "AI Brief" with a `Sparkles` icon (`dashboard-ai-brief.tsx:27,40`). There is no model, no provider, no inference anywhere.
- **Impact**: Presenting deterministic thresholds as "AI" misleads the user about the source of the claim — a trust violation (PP-145).
- **Fix (v2)**: Either use the real AI platform (with evidence) or label deterministic summaries as what they are — "Automation summary", not "AI Brief".

### SEV-4 — Dead action affordances

- **Product System**: 19 Anti-patterns (placeholder affordances); PP-101 "Find the object → see the facts → act".
- **Evidence**: `dashboard-page-client.tsx:74–80` — `handleReviewRecommendation` and `handleExplainRecommendation` are `console.log` no-ops. `dashboard-ai-brief.tsx:88–102` renders "Review" and "Explain Recommendation" buttons that call these no-ops.
- **Impact**: Clicks do nothing. This is the exact "placeholder UX" the phase brief prohibits.
- **Fix (v2)**: Only render actions that work. Decision Brief actions must resolve to real work items.

### SEV-5 — "previous period" is a lie

- **Product System**: PP-042 "Every KPI carries same-period comparison"; PP-128 "Totals state their basis"; PP-145 trust.
- **Evidence**: `dashboard-financial-health.tsx:82` hardcodes `comparisonLabel="previous period"`. But `getFinancialMetrics()` (composition.service.ts:255–309) computes **no prior-period deltas**: `change` is `"${totalInvoices} invoices"`, `"${dueToday} due today"`, `"${exceptionCount} open"`, `"${matchedCount} of ${processedCount} matched"`. The UI then regex-parses these strings back into a number: `parseFloat(metric.change.replace(/[^\d.-]/g, ""))` (`dashboard-financial-health.tsx:79`).
- **Impact**: A false comparison label + string-scraped trend values. PP-042 is violated in both data and display. `trend="neutral"` is hardcoded for 3 of 4 metrics.
- **Fix (v2)**: Real same-period deltas (or state basis honestly), or drop the comparison.

### SEV-6 — KPI source and timestamp missing

- **Product System**: PP-044 "Every KPI shows source and timestamp."
- **Evidence**: `ExecutiveKpiCard` usage passes no `source`/`timestamp`. The `FinancialHealthMetric` type has no source field. `DataFreshnessIndicator` exists in `src/components/enterprise/` but is not used.
- **Impact**: A CFO cannot tell when "Outstanding AP $1.2M" was computed or where it came from — the trust gap PP-044 exists to close.
- **Fix (v2)**: Add source + timestamp to every metric; surface freshness at point of use (PP-152).

### SEV-7 — No drill-down to work items

- **Product System**: PP-050 "Every chart drills down to work items"; PP-049 "Actionable items are triaged by 'needs me'".
- **Evidence**: KPI cards are not clickable. Work-queue preview rows are not clickable (`dashboard-queue-preview.tsx` — `<tr>` has no link). Today's Work cards navigate to category pages, not to the specific work items.
- **Fix (v2)**: Every KPI and every queue row must deep-link to its work items (PP-070 "Every row opens its detail; every detail returns").

### SEV-8 — Greeting above the fold, before the decision content

- **Product System**: PP-041 "4–6 KPIs above the fold"; PP-048 "Omit what doesn't change a decision".
- **Evidence**: `dashboard-page-client.tsx:119` renders `<DashboardGreeting>` first, before any decision content. The greeting's workload summary is derived from the same data as Today's Work (duplication) and its date/time text changes no decision.
- **Fix (v2)**: KPIs above the fold. Fold greeting into the header or drop it (PP-048).

### SEV-9 — Double-fetch of the same data

- **Product System**: Phase 26.0A first principle "exactly one way for production code to execute"; 15 Performance (no unnecessary requests); PP-058.
- **Evidence**: `dashboard-page-client.tsx:35` fetches `/api/dashboard/data` (whose `DashboardData.todaysWork` is populated — composition.service.ts:42) and lines 48–67 fetch `/api/dashboard/todays-work` again. Two round-trips for overlapping data; two sources of truth for Today's Work.
- **Fix (v2)**: Single fetch; Today's Work renders from the composed payload.

### SEV-10 — Queue preview loses the decision context

- **Product System**: PP-061 "Tables are reconciliation instruments"; PP-072 "Status is dot + label + color"; PP-125 "Status is explicit, never color alone"; PP-060 "Dashboards state their data mode".
- **Evidence**: `toWorkQueuePreviewItem` (`src/modules/work-queue/preview.ts`) drops `slaStatus`, `dueDate`, `exceptionCount`, `invoiceAgeDays`, `assignedTo`, `supplierId`. So the dashboard cannot show "near SLA breach", blocked work, or who it awaits. The phase brief requires a **decision inbox** (critical, blocked, recently changed, awaiting user, near SLA breach) — the current projection cannot support any of those.
- **Fix (v2)**: Render from full `WorkQueueItem` (or a richer projection), and the SLA status as dot + label (PP-072).

### SEV-11 — No data-mode / freshness boundary

- **Product System**: PP-026 "Environment and data-mode are permanent labeled boundaries"; PP-060; PP-152 "Freshness is shown at the moment of use".
- **Evidence**: The dashboard shows no data-mode badge. "Updated 4:32 PM" appears only in the AI Brief header (`dashboard-ai-brief.tsx:41`). The sidebar data-mode badge is not the dashboard's.
- **Fix (v2)**: Data-mode badge + per-section freshness (PP-152), using `DataFreshnessIndicator`.

### SEV-12 — "Recent Activity" is a log, not a decision story

- **Product System**: 08 Dashboard (activity must answer: what changed, why it matters, who is affected, what should happen next); PP-141 "Status messages answer what-happened + what-to-do-next".
- **Evidence**: `getRecentActivity()` (composition.service.ts:312–368) returns raw approval/exception lines ("Approved payment for Invoice INV-xxx"). `dashboard-activity.tsx` maps them to a generic timeline with no consequence or next-step.
- **Fix (v2)**: Activity items must carry why-it-matters + next-step, and link to the affected work.

### SEV-13 — Hardcoded single-persona dashboard

- **Product System**: PP-051 "One dashboard per persona, not per data set."
- **Evidence**: `DashboardData` is a fixed shape for everyone. No role- or responsibility-based composition (a Treasurer vs. a Controller see the same 6 sections).
- **Fix (v2)**: Persona-aware composition; one canonical template, role-filtered sections (PP-022).

### SEV-14 — "All caught up" false reassurance

- **Product System**: PP-147 "'Unsure' is a designed state"; PP-048.
- **Evidence**: `buildGreeting()` returns "No pending tasks. All caught up." when Today's Work is empty (composition.service.ts:56, 68). This conflates "no work in this module" with "everything is fine" — the classic misleading-dashboard message.
- **Fix (v2)**: Empty states teach (PP-144); say what was checked and when.

### SEV-15 — Dashboard dead-ends

- **Product System**: PP-120 "The lifecycle spine never dead-ends"; PP-030 "Views are projections; they never change work".
- **Evidence**: With rows not clickable and KPI cards not clickable, a CFO must leave the dashboard and know to navigate to `/work-queue` or `/procurement/approvals`. The dashboard cannot hand off a task (PP-101: find → see facts → act).
- **Fix (v2)**: Every item resolves to a working detail page with an action.

## 4. Strengths worth preserving

Not everything is wrong. The v2 redesign must keep:

1. **Today's Work domain** (`TodaysWorkService`, priority calculator, workload estimator) — genuinely canonical, evidence-derived, and correctly consumed. Keep the 4 categories and their urgency/effort computation.
2. **Work Queue domain** (`WorkQueueService`, `deriveSlaStatus`, `derivePriority`, `PENDING_STATUSES`, `HIGH_VALUE_THRESHOLD`) — solid. Fix only the preview projection.
3. **`withRuntimeContext` + `cacheHeaders(15)`** on the API routes — correct execution path.
4. **Independent fallibility** (PP-058): `DashboardTodaysWork` and `DashboardFinancialHealth` already have loading/error/empty states; the v2 must keep per-section fallibility instead of an all-or-nothing shell.
5. **Component craft**: `AnimatedCard`, `ExecutiveKpiCard`, `DashboardSection`, `PageContainer` are EDL-aligned and reusable.
6. **Keyboard/card nav** in Today's Work (cards are real `<button>`/`AnimatedCard` with onClick → router push).

## 5. Redesign requirements derived from this audit

Every requirement traces to a violation above. Detailed design is Deliverable 2.

1. **Decision Brief** replaces AI Brief — powered by `decision-intelligence`, with Evidence Package, categorical confidence, reasoning, and working actions (SEV-1,2,3,4).
2. **Attention Queue** — the first thing seen; ranked by impact, risk, due date, confidence, dependencies, "needs me" (SEV-7,8; PP-049).
3. **Financial Health** — real same-period deltas, source + timestamp, drill-down, no fabricated labels (SEV-5,6,7; PP-042,044,050).
4. **Work Queue Preview** — decision inbox using full `WorkQueueItem` context: critical, blocked, recently changed, awaiting user, near SLA breach (SEV-10,15; PP-072).
5. **Activity Timeline** — why-it-matters + next-step per event (SEV-12; PP-141).
6. **Single fetch** — one composed payload per persona (SEV-9,13).
7. **Data-mode + freshness** at point of use (SEV-11; PP-060,152).
8. **Empty states teach**, never reassure (SEV-14; PP-144,147).
9. **No placeholder affordances** — every rendered action works (SEV-4).

## 6. What the v2 will NOT do

- It will not invent a new "AI Brief" brand for deterministic text.
- It will not show a KPI it cannot delta or source.
- It will not create new canonical domains — it composes the existing ones (`decision-intelligence`, `todays-work`, `work-queue`, `command-center`).
- It will not regress accessibility or performance; it adds freshness, keyboard operation, and per-section fallibility.

---

*Next: `docs/dashboard/DASHBOARD_REDESIGN_SPEC.md` — the v2 specification, each decision traced to Product System principles.*
