# 08 — Dashboard

**Product System · Document 08 of 20**
**Authority: Dashboard is the KPI and decision-surface specification for Perionyx. It derives from the Vision (00), Philosophy (01), Product Principles (02, especially the Decision Surfaces domain), and Finance Principles (04), and is binding on all dashboard, KPI, metric, and analytics-survey pages.**
**Sources: The four-product research program — Stripe S4 (the home page, KPI row, intentional omission), Linear S19.6 (the financial metric card), Ramp S7/S13.11 (spend/approval/analytics and the compliance dashboard), Coupa S7 (spend intelligence); the EDL; the existing dashboard and analytics components.**

---

## 1. The Dashboard Doctrine

A Perionyx dashboard is **a decision surface, not a poster** (PP-055). It answers one question, shows the evidence needed to answer it, and provides the action that follows. Every element on a dashboard must pass the gate: **"does this change a decision?"** (PP-048). If an element would not change a decision, it does not belong.

The research synthesis:
- **Stripe** proves the KPI discipline: 4–6 KPIs above the fold, same-period comparison, source + timestamp, value before chart, omission as design (PP-041–044, P-048).
- **Linear** proves the metric card is the trust object and that dashboards are projections over work (PP-057, PP-030).
- **Ramp** proves the compliance dashboard — policy health as a standing surface (PP-053) — and that every chart drills to work items (PP-050).
- **Coupa** proves the executive spend surface and the savings-tracking discipline (PR-44–45).

## 2. The KPI Row

The KPI row is the signature pattern: the financial metric card (PP-057). Each card renders, in fixed order (PP-126):

1. **Value** — the number, tabular, right-aligned, large. Renders first, independently of charts (PP-043).
2. **Label** — what the number is, plain language.
3. **Delta** — same-period comparison, labeled with basis (PP-042, PP-135).
4. **Source + timestamp** — provenance and freshness (PP-044, PP-152).
5. **Drill-down** — the card opens the evidence: the object list, the chart, the decision (PP-050).

The KPI budget (PP-041): **4–6 KPI cards above the fold.** Everything else is one click away. The fold holds only behavior-changing information.

The five executive KPIs (Phase 20.1, canonical):
1. **Cash position** — with previous period, timestamp, source.
2. **Liquidity (7-day)** — with forecast band and confidence.
3. **Pending approvals** — with "requires me" count (PP-049).
4. **Critical alerts / exceptions** — with the exception queue door.
5. **Workflow health** — with policy-health and bottleneck signals (PP-053).

## 3. Render Order and Independent Fallibility

**Metrics render first; charts second; tables third** (PP-043, PP-058). Each region loads and fails independently (PP-058). A failed chart never blanks the number. The dashboard is a composition of independent, fallible render units — the CFO never waits for the chart to see the number (PP-241).

Skeletons preview structure (PP-242); loading lives inside components (PP-243); the page never reloads (PP-247).

## 4. Charts

Charts on a Perionyx dashboard:

- **Answer "what is it made of?"** with interactive legends — legend-as-filter (PP-045).
- **Drill to work items** — every segment/bucket opens the underlying list with filters applied (PP-050, PP-281).
- **Are bespoke and accessible** — custom SVG, text alternatives, color-plus-text encoding (PP-236, PP-125).
- **Label forecasts with bands, horizons, and evidence** (PP-046, PP-139).
- **Never decorate** — a chart without decision value is a poster (PP-048).

The research authority: Stripe's interactive distribution charts (PP-045), Ramp's drill-down charts (PP-050), Coupa's spend-category analysis (PR-44).

## 5. Below-the-Fold: Previews with Doors

Below the fold, the dashboard shows **preview cards with doors, not walls of data** (PP-018, Stripe P18):

- "6 of 25 failed" teaches and routes (PP-018).
- Each preview card is a summary of its underlying queue/domain with a "View all" door.
- The door opens the decision surface, not a bigger poster.

Below-the-fold content is the executive's second glance: exceptions, pending approvals, policy health, spend drift, close status. All of it routes to work.

## 6. Persona Shaping

Dashboards are persona-shaped (PP-051): each answers the persona's question, not a data-set catalog.

- **CFO:** liquidity, spend, approvals-above-threshold, risk — "Are we financially sound this quarter?"
- **Treasurer:** cash position, forecast bands, FX, idle cash — "Do we have liquidity for 7 days?"
- **Controller:** approvals, reconciliation, close — "What is unresolved before close?"
- **AP Manager:** exceptions, invoices, approvals — "What requires me today?"
- **Auditor:** audit, exports, decisions, policy history — "What is the trail saying?"

The shared metric components are the same; the arrangement and priority are role-shaped (PP-025, PP-051). Dashboards are projections over the same work (PP-030) — never forks of the data.

## 7. Data-Mode and Freshness

Every dashboard states its data mode and freshness (PP-060):

- Values that are live, cached, persisted, or demo are labeled (PP-013, PP-152).
- Stale data renders as stale — never silent (PP-013).
- The data-mode marker is permanent, not a toggle (PP-026).

The freshness label renders where the user reads the number (PP-152) — beside the KPI value, not in a settings screen.

## 8. Dashboard Rules (Condensed)

1. A dashboard is a decision surface; every element passes the "does this change a decision?" gate (PP-055, PP-048).
2. 4–6 KPIs above the fold; the fold holds only behavior-changing information (PP-041).
3. Every KPI carries value, label, delta, source, timestamp, drill-down (PP-042, PP-044, PP-057).
4. Metrics render first; charts second; independently fallible (PP-043, PP-058).
5. Charts answer "what is it made of?", drill to work items, and label forecasts with bands (PP-045, PP-050, PP-046).
6. Below the fold is previews with doors (PP-018).
7. Dashboards are persona-shaped projections (PP-051, PP-030).
8. Data mode and freshness are labeled, always (PP-060, PP-013).
9. Policy health is a standing panel (PP-053).
10. Every insight cites its source and confidence (PP-086).

## 9. Dashboard Anti-Patterns

- **The poster dashboard** — static infographic with no actions (rejected: PP-055).
- **The data catalog** — one widget per table in the schema (rejected: PP-051).
- **The vanity metric** — a number that doesn't change any decision (rejected: PP-048).
- **The silent staleness** — stale data presented as live (rejected: PP-013).
- **The charts-first layout** — charts loading before numbers (rejected: PP-043).
- **The whole-page failure** — one region's error blanking the dashboard (rejected: PP-058).

---

*Next: `09 Tables.md` — the table and data-grid specification.*
