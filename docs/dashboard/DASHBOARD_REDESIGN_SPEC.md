# Dashboard v2 — Redesign Specification

Phase 22.2 · Deliverable 2 of 4
Status: **APPROVED FOR IMPLEMENTATION** — every decision traces to a Product System principle or a verified audit finding.

## 1. Purpose

Define the Dashboard v2 as the canonical operational home surface: it answers **"What should I do next?"** — not "What happened?" The audit (Deliverable 1) is the evidence base. The Product System is the authority; where Product System and prior implementation conflict, Product System wins.

## 2. The eight commitments (from audit, non-negotiable)

1. **No fabricated confidence.** Confidence is categorical (`Approve / Reject / Needs-review`) with a stated calculation basis, or it is absent.
2. **No recommendation without evidence.** Every recommendation ships with its Evidence Package (claim, sources, reasoning, confidence, basis, alternatives).
3. **No deterministic heuristics branded as AI.** Label by source of truth: a rule-based summary says "Automation summary"; only the AI platform produces an "AI" surface.
4. **No dead affordances.** Every rendered button/row/keyboard action resolves to a real target.
5. **Every KPI states its basis.** Value, same-period comparison, source, timestamp — or the KPI is not shown.
6. **Every item drills to work.** Rows, KPIs, and decisions open their work item.
7. **Exactly one way to load.** One composed payload per persona; no parallel overlapping fetches.
8. **Empty states teach.** "No open exceptions (checked 2 min ago)" — never "All caught up."

## 3. Persona model (PP-051, PP-022)

The dashboard is one canonical template with **persona-filtered sections** — not one dashboard per page, not one blob for everyone.

| Persona | Role signal | Sections shown | Hidden |
|---|---|---|---|
| **Treasurer** | role includes treasury access | Metrics (cash), Work Queue, Today's Work, Activity | Decision Brief (unless priority ≥ 4), |
| **Controller / Finance Manager** | role includes AP/GL access | Metrics (AP), Attention Queue, Decision Brief, Work Queue, Today's Work, Activity | — |
| **CFO / Executive** | ADMIN / executive | Metrics (full), Attention Queue, Decision Brief, Work Queue | Today's Work (delegated), Activity (collapsed) |
| **Auditor** | auditor role | Metrics (read-only, full source), Activity (full, chronological) | Today's Work, Decision Brief actions |

Persona is derived from the existing IAM role via RuntimeContext — **no new domain, no new table**. Default (no signal): Controller layout.

Section visibility rules (shared): Decision Brief renders only when it has decisions; Attention Queue renders only when non-empty; every section may be individually dismissed and the preference persists to the Runtime Registry config.

## 4. Page architecture (PP-055, PP-058)

- Server component `src/app/(shell)/dashboard/page.tsx` keeps `auth()` + onboarding redirect, then renders the new client shell.
- **One** GET to `/api/dashboard/data` returns the full persona payload. The `/api/dashboard/todays-work` endpoint becomes internal-only (still called by the composition service; no longer a second client fetch) — fixes audit SEV-9.
- The shell renders sections with **per-section** loading/error/empty states (PP-058 independent fallibility). No all-or-nothing page skeleton.
- Every section is `aria-labelledby` and its own landmark region; sections are keyboard-navigable in DOM order = visual order.

## 5. Section specifications

### 5.1 Metric strip — "the state" (PP-041, PP-042, PP-044, PP-050, PP-057, PP-060)

- **Position**: above the fold, first content after the header (audit SEV-8; PP-041).
- **Count**: 5 KPIs (PP-041: 4–6).
- **Shape** (`ExecutiveKpiCard` + `DataFreshnessIndicator` + drill link):
  - `label` — noun (PP-126: numbers are nouns, captions are verbs).
  - `value` — the metric, rendered first (PP-043).
  - `comparison` — same-period delta, **computed**, never hardcoded (PP-042; fixes SEV-5). Basis labeled (PP-128), e.g. "vs prior 30d".
  - `source` + `updatedAt` — every card (PP-044; fixes SEV-6).
  - `drillTarget` — every card deep-links to the work it represents (PP-050; fixes SEV-7).
  - `dataMode` — "live / demo / seeded" badge on the strip (PP-060; fixes SEV-11).
- **The 5 KPIs (v2 default persona)** — each basis is honest and computable:
  1. **Cash position** — `sum(TreasuryCashPosition.totalBalance)`. Comparison: net executed `TreasuryCashMovement` (last 30d) vs prior 30d. Source: Treasury. Drill: `/treasury`.
  2. **Pending approvals** — `count(transaction.status=PENDING_APPROVAL)` + overdue count labeled. Comparison: created last 7d vs prior 7d. Source: Governance. Drill: `/approvals`.
  3. **Open AP value** — `sum(procurementVendorInvoice where status NOT IN final)`. Comparison: invoicing volume (created 30d vs prior 30d) labeled as such. Source: AP. Drill: `/procurement/invoices`.
  4. **Automation rate** — matched/processed %; comparison: same rate, prior 30d window. Source: AP Matching. Drill: `/work-queue`.
  5. **Open exceptions** — `count(procurementInvoiceException status=OPEN)`; comparison: exceptions created 7d vs prior 7d. Source: AP Exceptions. Drill: `/procurement/exceptions`.
- Financial precision: all money via `src/lib/financial-precision.ts` (`financialRound`, `formatDecimalCurrency`); never string-scraped numbers (audit SEV-5; PP-122, PP-123).

### 5.2 Attention Queue — "the answer" (PP-049, PP-055, PP-109, PP-046)

- **Position**: immediately below the metric strip. The first actionable content. Renders only when non-empty (audit SEV-14 → PP-144 empty states teach).
- **Item**: ranked by a visible reason. Each item shows:
  - `title` — the object (supplier + invoice + amount) (PP-101).
  - `impact` — financial magnitude (currency, formatted).
  - `reason` — why now, computed: SLA breach / due today / high value ≥ $25,000 / open exceptions / policy breach (uses `HIGH_VALUE_THRESHOLD`, `deriveSlaStatus` from work-queue).
  - `due` — due date labeled in user's context (PP-155).
  - `confidence` — only for decision-derived items, categorical + basis.
  - `target` — the work item URL (fixes audit SEV-7, SEV-15).
- **Ranking**: (1) needs-me/blocked on me, (2) due date, (3) financial impact, (4) SLA status, (5) confidence. Same operators as `derivePriority`, applied to the composed set. The ranking formula is a pure function in the composition service — documented, testable.
- Rows are real `<button>`/`<Link>` rows, tabbable (13 Accessibility; Linear S13.4).

### 5.3 Decision Brief — "evidence before action" (06 DI, 12 AI, PP-104–110)

- **Replaces** the AI Brief entirely (audit SEV-1,2,3,4).
- **Data**: `DecisionService.getTopDecisions(ctx, 5)` — real `Decision` objects with `score`, `priority`, `explainability`, `suggestedActions`, `supportingEvidence`, `timeline`.
- **Render**: each decision as a card:
  - Title + priority badge (P1–P5 with label).
  - `explainability.why` — one sentence of why now.
  - Evidence Package: `evidenceUsed[]` as a list, each item links to its source object (PP-105). `confidenceCalculation` shown verbatim (DI Invariant 3).
  - `suggestedActions[]` as working buttons; each action resolves to its work item URL (no dead affordances).
  - "Why not alternatives" — `alternativesConsidered[]` (Stripe S14.4).
  - Consequence preview before any irreversible action (DI Invariant 8).
  - Decision lifecycle: `accepted / dismissed` buttons call the existing `updateDecisionStatus` (audited, PP-112 human override).
- **Empty state**: "No open decisions. Evaluated 2 min ago." — never "all good".

### 5.4 Work Queue preview — "the decision inbox" (PP-061, PP-070, PP-072, PP-125, PP-062)

- **Replaces** the lossy preview (audit SEV-10). Data: full `WorkQueueItem[]` (top 5, page 1) — **not** `toWorkQueuePreviewItem`. The dashboard imports the canonical type directly (type-only, deep-import per H-01).
- **Rows**: priority (dot + label, PP-072), supplier, invoice, amount (right-aligned, tabular-nums, PP-062), SLA status (dot + label from `toWorkQueueSlaLabel`, PP-125), due date, exceptions count, next action.
- **Row behavior**: whole row is a link to `/procurement/invoices/[invoiceId]` (PP-070; fixes SEV-15). "View all" → `/work-queue`.
- **Inbox facets** (filter chips, server-side — PP-066): All / Critical / Blocked / Recently changed / Awaiting me / Near SLA breach. Fulfills the brief's "decision inbox" requirement.

### 5.5 Today's Work — "my agenda" (PP-049, 11 Workflows)

- **Data**: unchanged — `TodaysWorkResult` from the canonical `TodaysWorkService`. Already correct.
- **Changes**: (a) render from the composed payload (single fetch, audit SEV-9); (b) each category card drills to its **work items** (the category page), and shows effort (already does); (c) replace the "partial" banner copy with a teaching line: which data is partial and why (PP-141).

### 5.6 Activity timeline — "what changed and why it matters" (PP-141, 08 Dashboard)

- **Replaces** the log (audit SEV-12). Each `ActivityItem` gains:
  - `action` — verb + object ("Approved payment for INV-1042").
  - `whyItMatters` — computed consequence ("$48,500 now scheduled for disbursement").
  - `nextStep` — what the viewer should do, if anything ("None — complete" or "Review matching evidence").
  - `targetUrl` — the affected object (PP-101).
- Keeps chronological integrity, but never without consequence. Timeline is screen-reader-friendly (PP-160).

## 6. Data contract — `DashboardDataV2`

Defined in `src/modules/dashboard/types.ts` (supersedes the old shape; old shape deleted, not kept).

```ts
interface DashboardKpi {
  id: string;              // "cash-position" | "pending-approvals" | "open-ap-value" | "automation-rate" | "open-exceptions"
  label: string;
  value: string;           // formatted, via financial-precision
  comparison: { delta: string; basis: string } | null;  // delta + "vs prior 30d"
  direction: "up" | "down" | "stable";
  status: "healthy" | "warning" | "critical";
  source: string;          // "Treasury" | "AP" | "Governance"
  updatedAt: string;       // ISO
  drillTarget: string;     // URL
}

interface AttentionItem {
  id: string;
  title: string;
  impact: string;          // formatted currency
  reason: string;          // why now
  due: string | null;      // ISO, labeled in user context
  priority: "critical" | "high" | "medium" | "low";
  confidence?: { level: "Approve" | "Reject" | "Needs-review"; basis: string };
  target: string;
}

interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  whyItMatters: string;
  nextStep: string;
  type: "approval" | "exception" | "payment" | "decision" | "system";
  status: "completed" | "warning";
  targetUrl: string | null;
}

interface DashboardDataV2 {
  persona: "treasurer" | "controller" | "executive" | "auditor";
  generatedAt: string;
  dataMode: "live" | "demo" | "seeded";
  metrics: DashboardKpi[];
  attentionQueue: AttentionItem[];
  decisions: Decision[];              // from decision-intelligence
  workQueue: WorkQueueItem[];         // canonical, full
  todaysWork: TodaysWorkResult;       // canonical
  activity: ActivityTimelineItem[];
}
```

`Decision`, `WorkQueueItem`, `TodaysWorkResult` are **imported canonical types** — never re-declared. The composition service is the only place that maps domain data → view data.

## 7. Composition service — `DashboardV2CompositionService`

- **One method**: `getDashboardData(ctx, persona)` returning `DashboardDataV2`.
- **Sources** (all existing, none new): `DecisionService.getTopDecisions`, `TodaysWorkService`, `WorkQueueService.getWorkQueue`, `prisma` aggregates (cash, approvals, AP, exceptions), and the same windowed-delta helper for comparisons.
- **Concurrency**: `Promise.allSettled` per source; a failing section yields its own empty/error state, never a blank page (PP-058).
- **Pure functions** (unit-testable, exported):
  - `rankAttention(items): AttentionItem[]`
  - `buildComparison(now, prior): { delta, basis }`
  - `toActivityItem(raw): ActivityTimelineItem`
- **Persona filter**: pure function `sectionsFor(persona)`.

## 8. Interaction design (07 Navigation, 13 Accessibility, Linear S13.4)

1. **Keyboard-first**: sections in DOM order; queue rows, attention rows, and decision actions are tabbable with visible focus; `Enter`/`Space` activate; arrow keys navigate inbox facets; `Esc` returns from expanded decision. Registered via the existing `useKeyboardShortcuts` pattern where global.
2. **Minimal clicks**: the most frequent action on the surface (approve / open item) is reachable from the item itself — no intermediate list.
3. **Progressive disclosure**: decision evidence, activity consequence, and inbox facets are collapsed by default; one `Enter`/click expands.
4. **Context preserved**: drill targets open the existing detail pages; the detail pages already provide breadcrumbs back (PP-028, PP-070).
5. **Split views**: desktop metric strip + attention queue stack; the decision card expands inline rather than navigating away.

## 9. Visual design (08 Dashboard, 22.0B EDL)

- Dark-first EDL tokens throughout (`src/design-system/edl/`): surfaces `surface-1/2/3`, gold `brand-gold` for currency/active states, status colors via EDL status palette — no raw hex in new code.
- Density: **default density** — information-dense but calm; tabular numerals for all money (`tabular-nums`); no chart without a purpose (PP-045: charts answer "what is it made of?" — the dashboard's primary surface is the attention queue, charts belong to drill-downs).
- Motion: EDL motion tokens only; `prefers-reduced-motion` respected (EDL Motion); no spring physics.
- Signature pattern: the **metric card** (PP-057) and the **attention row** — consistent across the surface.

## 10. Accessibility (13 Accessibility)

- WCAG 2.1 AA: contrast on all text/status; `aria-labelledby` on every section; `aria-live="polite"` for loading/error transitions; focus trap not needed (no modals on surface).
- Status never color alone (PP-125): every status dot has a text label.
- Screen-reader-friendly activity/export surfaces (PP-160): timestamps parseable, decisions announced with priority label.
- Keyboard shortcuts registered and discoverable via existing `?` help (PP-089).

## 11. Performance (15 Performance, PP-058)

- Single composed request; `cacheHeaders(15)` retained on `/api/dashboard/data`.
- Per-section skeletons render immediately; metrics strip renders first (PP-043).
- No layout shift: skeleton dimensions match final layout (already the pattern in the audit inventory).
- `React.memo` on pure section components; `useCallback`/`useMemo` where state changes (already present); no re-render waterfalls.
- Zero new dependencies.

## 12. Anti-patterns checklist (19 Anti-patterns)

Rejected explicitly: fake confidence, AI-washed heuristics, dead buttons, hardcoded comparison labels, "All caught up" reassurance, lossy projections, double fetches, decorative greeting sections, non-clickable rows, string-scraped numbers, and duplicate canonical types.

## 13. Implementation plan (Deliverable 3)

| Step | File(s) |
|---|---|
| 1. Types | `src/modules/dashboard/types.ts` — replace with `DashboardDataV2` + view types |
| 2. Composition | `src/modules/dashboard/composition.service.ts` → `DashboardV2CompositionService` (new method, pure helpers) |
| 3. API | `src/app/api/dashboard/data/route.ts` — return v2 payload (persona from role); `todays-work` route kept for internal reuse |
| 4. Shell | `src/components/dashboard/dashboard-page-client.tsx` — single fetch, per-section states, persona sections |
| 5. Sections | New: `dashboard-metric-strip.tsx`, `dashboard-attention-queue.tsx`, `dashboard-decision-brief.tsx`; Rewrite: `dashboard-work-queue.tsx` (full items + facets), `dashboard-todays-work.tsx` (minor), `dashboard-activity.tsx` (consequence + next-step); Delete: `dashboard-greeting.tsx`, `dashboard-ai-brief.tsx` |
| 6. Shared | `src/components/dashboard/data-mode-badge.tsx` (or reuse `DataFreshnessIndicator`) |
| 7. Tests | `test/dashboard-v2.test.ts` — ranking, comparison, persona filter, composition resilience |
| 8. Docs | `DASHBOARD_VALIDATION.md` (Deliverable 4) |

## 14. Definition of done

- `pnpm typecheck` and `pnpm build` pass.
- New tests pass; no existing test regressions.
- No new canonical domains; no duplicate types/logic; H-01 deep-import respected.
- Validation report lists principles satisfied vs. gaps with compliance percentage (Deliverable 4).
- The dashboard reflects Stripe (trust), Linear (keyboard), Ramp (evidence-first AI), Coupa (lifecycle) — but unmistakably Perionyx (EDL, gold, finance-first).

---

*Next: implementation (Deliverable 3), then `docs/dashboard/DASHBOARD_VALIDATION.md` (Deliverable 4).*
