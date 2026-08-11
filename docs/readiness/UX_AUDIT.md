# UX & Consistency Audit — 2026-08-07 (updated 2026-08-08 for Phase 28.1)

**Consumer personas:** CFO / Treasurer / Controller. **Method:** static source analysis, route inventory (465 shell routes), link-graph validation.
**Full audit:** [source-audits/ux-audit.md](./source-audits/ux-audit.md)
**Remediation evidence:** [PHASE_28_1_REMEDIATION_LOG.md](./PHASE_28_1_REMEDIATION_LOG.md)

## Verdict

The **deep** surfaces (GL, work queue, decision workspace, approvals, morning briefing, intelligence, implementation center) are substantive and Prisma-backed. After 28.1 the **hub** surfaces are too: the two fabricated-figure stubs (`/invoices`, `/audit-trail`) were rebuilt on live data, Reports is un-hidden, the deprecated `/accounting` tree is out of the nav, and Guidance/Export actions are wired. Remaining stubs are honest empties (`/mobile-*`) and one labeled mock (treasury hub KPIs — D-04).

## Severity

| Severity | Count | Status |
|---|---|---|
| Critical | 3 | **3 fixed** (28.0 + 28.1) |
| High | 8 | **8 fixed** (28.0 + 28.1) |
| Medium | 5 | 0 fixed (documented; D-04 treasury hub among them) |
| Low | 3 | 0 fixed (documented) |

## Fixed This Survey (28.0)

| Finding | Location | Fix |
|---|---|---|
| EBAM card → guaranteed 404 (`/treasury/ebam`) | `treasury/command-center/data.ts` | Route → `/treasury/bank-accounts` (real page) |
| Working page hidden as "Coming Soon" (Cash Forecasting → `/treasury/cash-forecast`) | `data.ts` | Status → `active` |
| 6 dead "Open"/CTA buttons on `/treasury` hub (Treasurer's landing screen) | `executive-header.tsx` · `treasury-scorecards.tsx` · `navigation-cards.tsx` | Wired to real routes; Export Snapshot → CSV download; Print → `window.print()` |
| Sidebar role-filtering bypass — every user saw ADMIN-only destinations | `app-shell.tsx:236` + `enterprise-sidebar-new.tsx:392-402` | Sections now intersect with the RBAC-filtered `visibleNav` |
| Cmd+N "New item" / Cmd+S "Save" advertised but no-op | `app-shell.tsx:123,125` | Removed from shortcuts registry |
| Brand leak: 6 executive tab titles `\| Vaulta` | `executive/{dashboard,kpis,alerts,pilot,scenarios,drill-down}/page.tsx` | → `\| Perionyx` |
| Legacy gold `#d4a843` (13×) | `(shell)/setup/page.tsx` | → canonical EDL `#d4af37` |

## Fixed This Survey (28.1)

| Finding | Location | Fix |
|---|---|---|
| CRITICAL — `/invoices` stub with fabricated figures ($284.5k/$42.8k/$12.3k) | `invoices/page.tsx` | **Rebuilt as live Prisma server component** — outstanding/due-week/overdue sums by currency, status breakdown (groupBy), recent-8 table, CTA to AP work queue. Verified live: 1,673 open invoices. |
| CRITICAL — `/audit-trail` stub incl. fabricated "100% Verified" | `audit-trail/page.tsx` | **Rebuilt** — merged AuditLog + ProcurementAPAuditRecord feed (real counts, chronological top-20, append-only labeling). Verified live: 21,780 AP audit records. |
| HIGH — Reports built but "Coming soon" (inverted dead end) | `nav-config.ts:125` | Removed `disabled: true` (both nav entries); page fully functional. |
| HIGH — 14 deprecated `/accounting` pages nav-promoted | `nav-config.ts` | Both `/accounting` entries removed (routes kept for deep links). |
| HIGH — Guidance Start/Resume/Retake no-ops | `guidance/page.tsx:155-178` | New `GuidanceTourButton` client component → `useOnboarding().startTour()`. |
| HIGH — Report viewer Export no-op | `report-viewer.tsx:92` | Real CSV export (UTF-8 BOM, section flattening, `reportType-id.csv`). |

## Remaining Findings (ranked)

1. **MEDIUM — mobile stubs:** `/mobile-dashboard` renders `value="—"` "awaiting data" everywhere; `/mobile/treasury` is 100% static `MOCK` data.
2. **MEDIUM — treasury hub KPIs/health/scorecards still `MOCK_*`** (`command-center/data.ts`) — most-demoed surface; D-04 open (endpoints exist, wiring is a Phase 28.2 candidate).
3. **MEDIUM — settings "Payment Rails" `href="#"`** looks disabled but navigates.
4. **MEDIUM — workflow Pause/Reassign/Delegate are disabled placeholders** (`workflow-actions.tsx:114-151`).
5. **MEDIUM — 369 of 465 routes unreferenced by nav**; duplicate trees cause stale-URL demo risk.

## Nav ↔ Route Consistency

- ✅ All nav hrefs resolve to real routes. Zero broken nav links.
- ✅ Zero missing link targets in components (the only 404 hazard was the runtime-built `/treasury/ebam` — fixed).
- ✅ Zero disabled/stub entries remain in primary nav (Reports + `/invoices` + `/audit-trail` live; `/accounting` removed).
- ⚠️ Command palette applies `filterNavByRole` but not permissions/`disabled` — lists admin-gated + disabled items (minor; no disabled items remain).

## Inventory

- 465 shell pages: 183 thin wrappers (39%, normal pattern), ~250 substantive, **2 true stubs remain** (`/mobile-dashboard`, `/mobile/treasury` — honest empties / labeled mock, no fabricated figures).
- 12 placeholder/stub items cataloged (P1-P12 in source audit).
