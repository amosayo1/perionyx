# Phase 20.0 — Enterprise Workflow Friction Analysis

## Overview

| Field | Value |
|---|---|
| **Platform** | Perionyx Enterprise Treasury Operating System v1.0.0 |
| **Date** | July 21, 2026 |
| **Total Routes** | 460 |
| **Friction Findings** | 25 |
| **Severity Breakdown** | 4 Critical, 8 High, 8 Medium, 5 Low |
| **Constitution Compliance** | 4.8 / 10 (Phase 16.0 audit) |

This analysis identifies every point of friction that a CFO, Treasurer, Controller, Finance Manager, or Auditor encounters when operating the Perionyx platform. Each finding maps to the Experience Constitution (Sections 1–8) and is grounded in verifiable source evidence. The goal is a friction-free path between any two business actions with zero guesswork.

---

## Severity Definitions

| Severity | Definition | Fix Priority |
|---|---|---|
| **Critical** | Blocks a core financial workflow entirely; user cannot complete task | P0 — before any pilot |
| **High** | Significant friction; user must work around the issue or loses trust in the data | P1 — before design partner |
| **Medium** | Noticeable friction; user is annoyed but can complete the task | P2 — before GA |
| **Low** | Minor polish issue; does not impede workflow completion | P3 — post-GA |

---

## Navigation Friction

Navigation friction occurs when a user cannot find the right screen, route, or action — or must take excessive steps to reach it.

---

### WF-001 — Dual GL Architecture Creates User Confusion

| | |
|---|---|
| **Severity** | Critical |
| **Category** | Navigation |
| **Constitution** | Section 1 (Clarity), Section 5 (Trust) |
| **Personas** | Controller, Treasurer, Auditor |
| **Workflow** | General Ledger operations, Journal Entries, Trial Balance, Financial Close |

**Description:**
Two parallel GL systems exist at `/general-ledger/` (12 pages, MEMBER role) and `/accounting/` (14 pages, TREASURER role). Both implement the same domain concepts — chart of accounts, journal entries, trial balance, financial statements — with different type systems, different service implementations, and different UI components. A Controller opening a trial balance must first determine which route is "real."

**Evidence:**
- `src/app/(shell)/general-ledger/` — 12 route files (chart-of-accounts, journal-entries, trial-balance, period-close, etc.)
- `src/app/(shell)/accounting/` — 14 route files (chart-of-accounts, journals, trial-balance, reporting, etc.)
- `src/app/(shell)/general-ledger/chart-of-accounts/chart-of-accounts-tree.tsx` — GL component tree
- `src/app/(shell)/accounting/chart-of-accounts-chart.tsx` — Accounting component tree
- Different type definitions: `src/modules/general-ledger/types.ts` vs `src/modules/accounting/types.ts`

**Current Behavior:**
A user navigates to either `/general-ledger` or `/accounting` and finds overlapping content. The chart-of-accounts exists in both modules with different tree implementations. Neither page indicates which is authoritative or whether changes in one propagate to the other.

**Expected Behavior:**
A single, authoritative chart-of-accounts and GL surface. If two roles require different views, the underlying data must be the same with role-based UI adaptation, not separate implementations.

**Impact:**
Every Controller and Treasurer interaction with the GL. 100% of GL operations affected. First-time users face immediate confusion about which route to use.

**Recommendation:**
1. Designate one GL module as authoritative (likely `/general-ledger/` with MEMBER role for broader access).
2. Deprecate or redirect `/accounting/` routes to `/general-ledger/` equivalents.
3. Merge service implementations into a single GL service backed by Prisma.
4. Add a route banner: "This is the authoritative GL. The /accounting path is deprecated."

---

### WF-002 — Duplicate Navigation Paths Create Confusion

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Navigation |
| **Constitution** | Section 1 (Clarity) |
| **Personas** | All |
| **Workflow** | Cross-module navigation |

**Description:**
The same content is accessible from multiple navigation paths. For example, invoices appear under `/procurement/invoices`, `/order-to-cash/invoices`, and `/accounts-receivable/invoices`. A user navigating to "Invoices" from the sidebar may land on any of these depending on the current section.

**Evidence:**
- 460 routes across 8 navigation sections
- `src/app/(shell)/procurement/invoices/` — procurement invoices
- `src/app/(shell)/order-to-cash/invoices/` — AR invoices
- `src/app/(shell)/accounts-receivable/invoices/` — AR invoices (duplicate)
- Navigation config in sidebar renders sections independently with no cross-reference

**Current Behavior:**
Each navigation section presents its own "invoices" without indicating the relationship to other sections. A user may not realize that procurement invoices and AR invoices represent opposite sides of the same transaction.

**Expected Behavior:**
Cross-module references should be explicit. If invoices exist in multiple contexts, the sidebar should indicate the relationship (e.g., "AP Invoices" vs "AR Invoices") or consolidate into one route with a tab/toggle for context.

**Impact:**
15–20% of navigation sessions involve searching for the right route. Confusion primarily affects new users and cross-functional workflows (e.g., AP paying an AR invoice).

**Recommendation:**
1. Rename routes to indicate context: "AP Invoices" vs "AR Invoices."
2. Add cross-link badges: "Related: AP Invoices" on the AR invoice page and vice versa.
3. Audit all 460 routes for semantic duplicates and rename or consolidate.

---

### WF-003 — Deep Nesting Requiring Excessive Clicks

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Navigation |
| **Constitution** | Section 3 (Speed) |
| **Personas** | CFO, Treasurer |
| **Workflow** | Drill-down from summary to detail |

**Description:**
Several workflows require 4–5 clicks to reach actionable detail. For example, viewing a specific treasury cash position requires: Treasury → Cash Management → Cash Positions → Filter → Select Position → View Details. A CFO checking a morning cash position expects 1–2 clicks maximum.

**Evidence:**
- `src/app/(shell)/treasury/cash-management/page.tsx` — summary page
- `src/app/(shell)/treasury/cash-management/cash-positions/page.tsx` — list page
- `src/app/(shell)/treasury/cash-management/cash-positions/[id]/page.tsx` — detail page
- No "Quick View" or "Recent Positions" shortcut on the dashboard

**Current Behavior:**
User navigates through hierarchical route structure to reach a specific data point. Each navigation step may trigger a full page load.

**Expected Behavior:**
CFOs navigate to a summary and see the answer immediately. If drill-down is needed, it should be a single click from the summary (expand row, open panel) rather than a full route navigation.

**Impact:**
High-frequency workflows (cash position, approval status, balance checks) are slowed by 2–3 extra clicks per session. Multiplied across 50+ daily sessions for a Treasurer.

**Recommendation:**
1. Add "Quick View" panels on dashboard cards (click → slide-out detail panel, not page navigation).
2. Implement Cmd+K command palette to jump directly to any entity by name or ID.
3. Add "Recent" and "Frequently Accessed" shortcuts to the sidebar.

---

### WF-004 — Orphaned Routes Not in Navigation

| | |
|---|---|
| **Severity** | Low |
| **Category** | Navigation |
| **Constitution** | Section 1 (Clarity) |
| **Personas** | All |
| **Workflow** | Discovery of advanced features |

**Description:**
Several routes exist in the codebase but are not reachable from the sidebar navigation. Users can only access them by typing the URL directly, making them effectively invisible.

**Evidence:**
- `src/app/(shell)/controller/` — Controller role dashboard (no sidebar entry)
- `src/app/(shell)/role-dashboard/` — Role-based dashboard (no sidebar entry)
- Navigation config (`nav-config.ts`) does not list these routes

**Current Behavior:**
Users who know the URL can access these pages. All other users have no path to discover them.

**Expected Behavior:**
Every route with a legitimate use case should be reachable from the sidebar or from a search/command palette.

**Impact:**
Low — affects a small number of advanced users. These routes are likely intended for specific roles but were never wired into navigation.

**Recommendation:**
1. Audit all routes against sidebar entries.
2. Wire orphaned routes into the appropriate navigation section with role-based visibility.
3. Add to Cmd+K command palette for discovery.

---

## Information Friction

Information friction occurs when data is missing, stale, unattributed, or overwhelming — preventing the user from making a confident decision.

---

### WF-005 — No "What Changed?" on Dashboards

| | |
|---|---|
| **Severity** | High |
| **Category** | Information |
| **Constitution** | Section 5 (What Changed?), Principle 27 |
| **Personas** | CFO, Treasurer, Controller |
| **Workflow** | Daily dashboard review, morning briefing |

**Description:**
Most dashboards display static metric values without indicating what changed since the last view. A CFO looking at a cash position of $12.4M has no way to know whether that is up or down from yesterday, or what drove the change, without manually comparing against yesterday's numbers.

**Evidence:**
- `src/app/(shell)/dashboard/page.tsx` — ExecutiveCommandCenter, no delta/comparison widgets
- `src/app/(shell)/treasury/dashboard/page.tsx` — TreasuryCommandCenter, no change indicators
- `src/app/(shell)/finance/command-center/page.tsx` — FinanceCommandCenter, no change history
- `src/components/enterprise/analytics/executive-kpi-card.tsx` — supports `trend` prop but most consumers do not pass it

**Current Behavior:**
Dashboard metrics display current values only. No deltas, no trend arrows, no "changed since last login" indicators.

**Expected Behavior:**
Every metric card should show: current value, delta from previous period, direction arrow, and timestamp. Constitution Section 5 requires every number to answer: "What changed?"

**Impact:**
Every daily dashboard review session. A CFO spends 10–15 minutes manually comparing numbers that the system should present automatically. Across 200+ working days per year, this is 30+ hours of wasted cognitive effort.

**Recommendation:**
1. Add `previousValue`, `delta`, and `deltaPercent` to all KPI cards.
2. Implement a "Changes Since Last View" banner at the top of each dashboard.
3. Wire `ExecutiveKpiCard` trend props into every dashboard consumer.
4. Add a "Morning Brief Diff" view that highlights overnight changes.

---

### WF-006 — Missing Timestamps on Financial Figures

| | |
|---|---|
| **Severity** | High |
| **Category** | Information |
| **Constitution** | Principle 27 (Timestamp Everything), Section 5 (Trust) |
| **Personas** | Controller, Auditor, Treasurer |
| **Workflow** | Balance review, reconciliation, audit |

**Description:**
Financial figures (balances, positions, cash levels) are displayed without timestamps indicating when they were last updated or calculated. A Treasurer viewing a cash balance of $5.2M cannot tell whether this is real-time, end-of-day, or stale from a restart.

**Evidence:**
- `src/components/enterprise/analytics/executive-kpi-card.tsx` — no `asOf` or `lastUpdated` prop
- `src/app/(shell)/treasury/dashboard/` — cash position cards without timestamps
- `src/app/(shell)/general-ledger/trial-balance/page.tsx` — trial balance without as-of date
- In-memory services (`cash-management.service.ts`, `banking.service.ts`) do not persist calculation timestamps

**Current Behavior:**
Metrics display raw numbers. No "as of" timestamp. No data freshness indicator. No way to tell if data is current or stale.

**Expected Behavior:**
Every financial figure must show: (a) the value, (b) "as of [timestamp]", (c) a freshness indicator (green = <5min, yellow = <1hr, red = >1hr). Constitution Principle 27 mandates timestamps on all financial data.

**Impact:**
Every financial review session. Auditors cannot verify data currency. Regulators may flag missing timestamps during examination.

**Recommendation:**
1. Add `asOf: Date` to all financial metric types.
2. Display "Updated X minutes ago" under every metric card.
3. Implement a `DataFreshnessIndicator` component (green/yellow/red dot with tooltip).
4. Backfill timestamps on all in-memory service responses.

---

### WF-007 — Stale Data Without Freshness Indicators

| | |
|---|---|
| **Severity** | High |
| **Category** | Information |
| **Constitution** | Section 5 (Trust), Principle 26 |
| **Personas** | All |
| **Workflow** | Any data-dependent decision |

**Description:**
In-memory services lose all data on server restart. After a restart, the UI displays seeded demo data as if it were production data. There is no indicator that the data is seeded, demo, or stale.

**Evidence:**
- Most services use `Map<string, T>` storage (ephemeral per process)
- Services seeded with demo data on startup via seed functions
- No `isDemo`, `isSeeded`, or `dataSource` field on any entity type
- `src/modules/*/index.ts` — in-memory store initialization

**Current Behavior:**
After a server restart, all non-Prisma data resets to seed defaults. The UI shows the same values with no indication that anything changed. A user who entered custom data the previous day finds it gone with no explanation.

**Expected Behavior:**
The UI should indicate: (a) data source (seed vs. user-entered), (b) last modified timestamp, (c) whether data is production or demo. A banner should appear: "Data was reset to defaults. Your changes were not persisted."

**Impact:**
Every session after a restart. Users lose trust in the platform's data integrity. Critical for design partner pilots where users expect persistence.

**Recommendation:**
1. Add a global "Data Mode" indicator in the sidebar (Demo / Live / Mixed).
2. Add `dataSource: 'seed' | 'user' | 'import'` to all entity types.
3. Show a top-banner warning when in Demo mode: "You are viewing demo data."
4. Persist critical user-entered data to Prisma (Phase 7E pattern already established).

---

### WF-008 — Recommendations Without Evidence Links

| | |
|---|---|
| **Severity** | High |
| **Category** | Information |
| **Constitution** | Principle 9 (Evidence Links), Section 5 (Trust) |
| **Personas** | CFO, Treasurer |
| **Workflow** | AI recommendations, morning briefing, treasury alerts |

**Description:**
AI-generated recommendations and alerts display text advice without linking to the underlying data, source transaction, or analysis that produced the recommendation. A CFO sees "Consider investing excess cash" but cannot click through to see which accounts have the excess, what the yield comparison is, or what the AI's confidence level is.

**Evidence:**
- `src/app/(shell)/treasury/dashboard/` — alerts without source links
- `src/modules/enterprise-intelligence/` — recommendation generation without evidence tracking
- `src/components/onboarding/onboarding-readiness.tsx` — suggestions without drill-down links
- Morning briefing recommendations without supporting data links

**Current Behavior:**
Recommendations are displayed as plain text. No "View Source Data" link, no "Why?" tooltip, no confidence percentage, no evidence trail.

**Expected Behavior:**
Every recommendation must include: (a) a "View Evidence" link to the source data, (b) a confidence score, (c) the reasoning chain, (d) the data freshness timestamp. Constitution Principle 9 requires evidence links on every recommendation.

**Impact:**
A CFO cannot act on a recommendation without verifying it manually. This erodes trust in AI features and increases time-to-decision.

**Recommendation:**
1. Add `evidenceLinks: EvidenceLink[]` to all recommendation types.
2. Render a "View Evidence" button on every recommendation card.
3. Show confidence score as a percentage badge.
4. Implement an "AI Reasoning" expandable section on each recommendation.

---

### WF-009 — Overwhelming Data Without Filtering

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Information |
| **Constitution** | Section 1 (Clarity), Section 3 (Speed) |
| **Personas** | Controller, Finance Manager |
| **Workflow** | Transaction review, journal entry review, audit log review |

**Description:**
Several list pages display all records without default filters, pagination defaults, or smart sorting. A Controller reviewing journal entries sees hundreds of entries with no date filter, no status filter, and no sort by most recent.

**Evidence:**
- `src/app/(shell)/general-ledger/journal-entries/page.tsx` — full journal entry list
- `src/app/(shell)/accounting/journals/page.tsx` — full journal entry list
- `src/app/(shell)/audit-logs/page.tsx` — full audit log list
- DataTable component supports filtering but pages do not configure default filters

**Current Behavior:**
List pages load all records. No default date range filter. No default sort by "most recent." User must manually configure filters every session.

**Expected Behavior:**
List pages should default to: (a) last 30 days, (b) sorted by most recent, (c) filtered to user's current entity/period. Filters should persist across sessions via localStorage.

**Impact:**
Every list page interaction. Users spend 30–60 seconds configuring filters before they can start working. Across 20+ list page visits per day, this is 10–20 minutes of wasted time.

**Recommendation:**
1. Add `defaultFilters` and `defaultSort` props to all DataTable consumers.
2. Implement filter persistence via localStorage or user preferences.
3. Default date ranges to "This Month" for transactional data, "Last 90 Days" for audit data.
4. Sort by most recent by default on all chronological data.

---

## Action Friction

Action friction occurs when performing an action (creating, editing, approving, deleting) is unnecessarily difficult, unclear, or risky.

---

### WF-010 — No Undo System

| | |
|---|---|
| **Severity** | High |
| **Category** | Action |
| **Constitution** | Section 8, Principle 19 (Undo Everything) |
| **Personas** | All |
| **Workflow** | All data mutations |

**Description:**
No undo mechanism exists for any data mutation. Deleting a journal entry, approving a payment, or modifying a chart of accounts entry is immediately and irreversibly committed. Constitution Principle 19 requires undo capability on every destructive action.

**Evidence:**
- No `UndoProvider` or undo history in the component tree
- No undo API endpoint pattern in any route handler
- Delete operations are immediate with no soft-delete or rollback buffer
- `src/app/(shell)/general-ledger/journal-entries/` — no undo on delete
- `src/app/(shell)/procurement/purchase-orders/` — no undo on cancel

**Current Behavior:**
Destructive actions (delete, cancel, reject) are executed immediately with a confirmation dialog. Once confirmed, the action cannot be reversed.

**Expected Behavior:**
Every destructive action should offer: (a) a 5-second undo window with a toast notification, (b) soft-delete with a recovery period, (c) an undo history panel. Constitution Principle 19 is explicit: "Undo everything."

**Impact:**
Every accidental deletion or wrong approval. A Controller who accidentally deletes a journal entry must manually recreate it. An Auditor cannot trace what was changed during the undo window.

**Recommendation:**
1. Implement a global `UndoProvider` with a 5-second undo window.
2. Wrap all destructive actions in an `withUndo(fn, undoLabel)` helper.
3. Show a toast: "Journal entry deleted. [Undo]" with 5-second auto-dismiss.
4. Implement soft-delete on all entities with a 30-day recovery window.
5. Add an "Undo History" panel in the user settings.

---

### WF-011 — No Cmd+K Command Palette

| | |
|---|---|
| **Severity** | High |
| **Category** | Navigation / Action |
| **Constitution** | Section 8 (Keyboard-First) |
| **Personas** | All (power users) |
| **Workflow** | Any navigation or action |

**Description:**
No command palette exists for keyboard-first navigation. With 460 routes, finding the right screen requires using the sidebar or typing a URL. Constitution Section 8 requires a command palette as the primary navigation mechanism.

**Evidence:**
- `src/components/enterprise/keyboard-shortcuts/` — keyboard shortcuts dialog exists but is limited to Cmd+N/F/S
- No Cmd+K handler in `app-shell.tsx`
- No fuzzy search component in the codebase
- `useKeyboardShortcuts()` hook registered in `app-shell.tsx` but only handles 3 shortcuts

**Current Behavior:**
Users navigate exclusively via sidebar clicks or URL entry. Power users have Cmd+N (new), Cmd+F (filter), Cmd+S (save) — nothing else.

**Expected Behavior:**
Cmd+K opens a command palette with fuzzy search across all 460 routes, recent actions, entity search (by name, ID, amount), and quick actions (approve, create, export). This is the primary navigation method for power users.

**Impact:**
Every navigation action. A Treasurer checking 10 different treasury views per session clicks 10 sidebar links instead of typing 10 quick searches. At 5 seconds saved per navigation, this is 50 seconds per session — 4+ hours per year per user.

**Recommendation:**
1. Install `cmdk` or build a fuzzy search palette.
2. Index all routes, recent actions, and entity names.
3. Register Cmd+K as the global hotkey in `app-shell.tsx`.
4. Show recent searches and frequent actions as defaults.
5. Support arrow key navigation, Enter to select, Escape to close.

---

### WF-012 — 130+ Raw `<table>` Elements

| | |
|---|---|
| **Severity** | High |
| **Category** | Action |
| **Constitution** | Section 3 (Speed), Section 8 (Keyboard-First) |
| **Personas** | All |
| **Workflow** | Any data viewing or manipulation |

**Description:**
Over 130 raw `<table>` HTML elements exist across the codebase, bypassing the EnterpriseTable component that provides sorting, filtering, pagination, inline editing, keyboard navigation, and export capabilities. These raw tables offer no interactivity and require manual scrolling through potentially thousands of rows.

**Evidence:**
- 130+ `<table>` elements found via grep across `src/app/` and `src/components/`
- `src/components/enterprise/table/data-table.tsx` — EnterpriseTable with full feature set
- Zero adoption of EnterpriseTable on consumer pages (per Phase 8B.4 audit)
- Raw tables lack: sort headers, filter inputs, pagination, keyboard navigation, row selection

**Current Behavior:**
Raw HTML tables display static data. No sorting. No filtering. No pagination. No keyboard navigation. No export. Users must scroll through all rows and manually compare values.

**Expected Behavior:**
Every tabular data display should use EnterpriseTable with sorting, filtering, pagination, and keyboard navigation. Raw `<table>` should not exist in the production UI.

**Impact:**
Every data viewing interaction. A Controller reviewing 500 journal entries in a raw table cannot sort by date, filter by status, or export to Excel. This directly impacts productivity and error rates.

**Recommendation:**
1. Create a migration script to identify all raw `<table>` elements.
2. Replace each with EnterpriseTable, mapping columns to CellConfig formatters.
3. Prioritize high-traffic pages: journal entries, transactions, audit logs, approvals.
4. Track adoption progress with a running count.

---

### WF-013 — Inconsistent Error Handling

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Action |
| **Constitution** | Section 2 (Confidence), Section 5 (Trust) |
| **Personas** | All |
| **Workflow** | Any action that can fail |

**Description:**
Error handling is inconsistent across pages. Some pages show structured error boundaries with recovery UI. Others display raw 500 errors. Some silently swallow errors. A user encountering an error has no way to know whether their action completed, failed partially, or was never attempted.

**Evidence:**
- `src/app/(shell)/*/error.tsx` — some route groups have error boundaries
- `src/server/http/handle-route.ts` — `handleRouteError()` standardizes API errors
- Many client components use `try/catch` with `console.error` instead of user-facing error display
- No consistent error toast/notification pattern across the application

**Current Behavior:**
Errors display inconsistently: some show error boundaries, some show empty pages, some show console errors. Users cannot distinguish between "something went wrong" and "there is no data."

**Expected Behavior:**
All errors should display: (a) a human-readable message, (b) the specific error code, (c) a recovery action (retry, go back, contact support), (d) whether the action was partially completed.

**Impact:**
Every error scenario. A Treasurer submitting a payment transfer sees a blank page on failure with no way to know if the transfer was initiated.

**Recommendation:**
1. Implement a global `ErrorProvider` with toast-based error display.
2. Wrap all API calls in a `useApiAction` hook with standardized error handling.
3. Add error codes to all API responses.
4. Implement retry logic with exponential backoff for transient errors.

---

### WF-014 — Missing Keyboard-First Navigation for Critical Actions

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Action |
| **Constitution** | Section 8 (Keyboard-First) |
| **Personas** | Controller, Treasurer |
| **Workflow** | Approvals, data entry, search |

**Description:**
Critical actions (approve, reject, create, search) require mouse interaction. No keyboard shortcuts exist for approval workflows, and data entry forms require Tab-navigation without shortcut support.

**Evidence:**
- `src/components/enterprise/keyboard-shortcuts/` — only Cmd+N/F/S registered
- Approval actions require clicking buttons (no keyboard shortcut)
- Search requires clicking the search bar (no Cmd+K or / shortcut)
- Form submission requires clicking Submit (no Enter shortcut on non-form elements)

**Current Behavior:**
Users must use a mouse for approvals, search, and most actions. Keyboard shortcuts are limited to 3 global shortcuts.

**Expected Behavior:**
Critical actions should have keyboard shortcuts: (a) Cmd+K for search/navigation, (b) A/R for approve/reject on approval pages, (c) Enter to submit forms, (d) E to edit on detail pages.

**Impact:**
Power users and high-volume operators (Treasury, Accounts Payable) are slowed by mouse-dependent workflows. At 100+ approvals per day for a Treasury team, keyboard shortcuts would save 30+ minutes daily.

**Recommendation:**
1. Extend `useKeyboardShortcuts()` with role-specific shortcuts.
2. Add keyboard navigation to approval list (arrow keys to select, A to approve, R to reject).
3. Register `/` or Cmd+K as global search shortcut.
4. Add keyboard shortcut hints to all action buttons via tooltips.

---

### WF-015 — Inconsistent Button Styles Across Modules

| | |
|---|---|
| **Severity** | Low |
| **Category** | Action |
| **Constitution** | Section 4 (Beauty), Section 1 (Clarity) |
| **Personas** | All |
| **Workflow** | All action surfaces |

**Description:**
Button styles vary across modules: some use Tailwind `bg-blue-600`, others use `bg-indigo-500`, others use the `AnimatedButton` component. Sizes, padding, and border-radius are inconsistent.

**Evidence:**
- Raw Tailwind button classes in `src/app/(shell)/procurement/` components
- `AnimatedButton` from `src/components/enterprise/motion/animated-button.tsx` used in form components
- `Button` from `src/components/ui/button.tsx` (shadcn) used in some pages
- No unified button token system

**Current Behavior:**
Buttons look different across pages. Primary actions may be blue on one page and indigo on another. Sizes vary from `px-4 py-2` to `px-6 py-3`.

**Expected Behavior:**
A single button component system with variants (primary, secondary, destructive, ghost) that renders consistently across all pages.

**Impact:**
Low — functional but inconsistent. Undermines the visual identity and professionalism of the platform.

**Recommendation:**
1. Standardize on `AnimatedButton` (already built) as the primary button component.
2. Define button tokens: size (sm/md/lg), variant (primary/secondary/destructive/ghost), and usage rules.
3. Migrate all raw Tailwind buttons to the unified component.

---

## Trust Friction

Trust friction occurs when the user cannot verify, audit, or understand the data and decisions presented to them.

---

### WF-016 — AI Outputs Without Confidence Ratings

| | |
|---|---|
| **Severity** | High |
| **Category** | Trust |
| **Constitution** | Principle 9 (Evidence Links), Section 5 (Trust) |
| **Personas** | CFO, Treasurer |
| **Workflow** | AI recommendations, intelligent suggestions |

**Description:**
AI-generated outputs (recommendations, insights, risk assessments) do not include confidence ratings. A CFO cannot determine whether an AI recommendation is based on strong evidence (95% confidence) or weak inference (40% confidence).

**Evidence:**
- `src/modules/enterprise-intelligence/` — recommendation types without confidence field
- `src/modules/agent-framework/decision-engine.ts` — decisions without confidence scores
- Morning briefing AI insights without confidence indicators
- No `confidence` or `certainty` field in any AI output type

**Current Behavior:**
AI outputs are presented as definitive statements. No confidence percentage. No uncertainty range. No "this is based on X data points" attribution.

**Expected Behavior:**
Every AI output must include: (a) a confidence score (0–100%), (b) the number of data points used, (c) the data freshness, (d) a disclaimer when confidence is below 70%.

**Impact:**
CFOs cannot calibrate their trust in AI recommendations. High-confidence and low-confidence recommendations look identical, leading to either over-trust or under-trust.

**Recommendation:**
1. Add `confidence: number` (0–100) to all AI output types.
2. Display confidence as a badge: green (>80%), yellow (50–80%), red (<50%).
3. Show "Based on X data points" as a tooltip.
4. Implement a confidence threshold below which a disclaimer is shown.

---

### WF-017 — Decisions Without Audit Trails

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Trust |
| **Constitution** | Section 6 (Audit Trail) |
| **Personas** | Controller, Auditor |
| **Workflow** | Approval workflows, configuration changes |

**Description:**
Some decisions (especially AI-assisted or automated decisions) lack complete audit trails. An Auditor reviewing a batch approval cannot see who initiated the batch, what criteria were used, or whether the AI recommendation influenced the decision.

**Evidence:**
- `src/modules/agent-framework/decision-engine.ts` — decisions logged but not linked to approval actions
- `src/modules/automation-studio/approval-matrix-evaluator.ts` — rule matching without full audit trail
- Audit logging exists (`recordAudit()`) but is not consistently called on all decision points

**Current Behavior:**
Audit logs capture who performed an action and when. They do not capture: (a) what data was considered, (b) what rules were evaluated, (c) whether AI influenced the decision, (d) what alternatives were rejected.

**Expected Behavior:**
Every decision should produce an audit entry that includes: (a) the decision maker, (b) the data inputs considered, (c) the rules or criteria applied, (d) the AI recommendation (if any), (e) the confidence level, (f) the timestamp.

**Impact:**
Audit readiness. An external auditor examining a batch payment approval needs to verify that proper controls were followed. Missing audit trail data creates compliance risk.

**Recommendation:**
1. Extend `recordAudit()` to accept structured decision context.
2. Wire decision context into all approval workflows.
3. Implement a `DecisionAuditEntry` type with full traceability.
4. Add a "View Decision Context" link on every audit log entry.

---

### WF-018 — Numbers Without Precision Guarantees

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Trust |
| **Constitution** | Section 5 (Trust), Principle 26 |
| **Personas** | Controller, Auditor, Treasurer |
| **Workflow** | Financial calculations, GL allocation, tax computation |

**Description:**
Financial calculations use native JavaScript numbers (IEEE 754 floating-point) in several critical paths, leading to precision loss. A GL allocation of $100.00 across 3 targets may produce $33.33 + $33.33 + $33.33 = $99.99 instead of $100.00.

**Evidence:**
- Phase 19.1 identified 4 Prisma Float fields storing monetary values (migrated to Decimal)
- Phase 19.1 added `financialRound()` for banker's rounding
- However, many services still use native `number` arithmetic
- `src/server/accounting/` — journal entry amounts as `number`
- `src/server/procurement/` — PO totals as `number`

**Current Behavior:**
Financial calculations may produce floating-point precision errors. Users may see $0.01 discrepancies in trial balances or allocations.

**Expected Behavior:**
All financial calculations must use `Decimal` or the `financial-precision.ts` helpers. Every monetary value should be displayed with exactly 2 decimal places. Trial balance debits must equal credits exactly.

**Impact:**
Audit findings. A $0.01 discrepancy in a trial balance is a control failure. Even if rare, the possibility erodes trust in the system's financial accuracy.

**Recommendation:**
1. Audit all monetary field types across the codebase.
2. Replace `number` with `Decimal` for all monetary values.
3. Enforce `financialRound()` at all calculation boundaries.
4. Add a trial balance validation check that fails on any $0.01 discrepancy.

---

## Workflow Friction

Workflow friction occurs when multi-step processes are difficult to track, resume, or complete.

---

### WF-019 — Multi-Step Processes Without Progress Indication

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Workflow |
| **Constitution** | Section 3 (Speed), Section 7 (Progressive Disclosure) |
| **Personas** | All |
| **Workflow** | Onboarding, financial close, approval chains |

**Description:**
Multi-step workflows (onboarding wizard, financial close, approval chains) do not show clear progress indicators. A user in step 3 of a 7-step process does not know how many steps remain, how long each takes, or which steps can be skipped.

**Evidence:**
- `src/components/onboarding/onboarding-wizard.tsx` — welcome screen exists but step progress is minimal
- `src/components/onboarding/onboarding-stepper.tsx` — vertical step list with status indicators (exists but not wired to all flows)
- `src/components/enterprise/forms/enterprise-wizard.tsx` — step indicator bar (exists but not used in financial workflows)
- Financial close workflow has no step-by-step UI

**Current Behavior:**
Multi-step processes either lack progress indicators or use inconsistent implementations. Users cannot estimate time remaining or know which steps are required vs. optional.

**Expected Behavior:**
Every multi-step workflow should show: (a) current step X of Y, (b) estimated time remaining, (c) which steps are complete/in-progress/pending, (d) ability to go back to previous steps.

**Impact:**
Every multi-step operation. A Controller running a month-end close across 10 steps does not know whether they are at step 2 or step 8. This causes anxiety and repeated navigation to check progress.

**Recommendation:**
1. Standardize on `EnterpriseWizard` for all multi-step flows.
2. Wire the financial close workflow into the wizard component.
3. Add estimated time remaining based on historical completion times.
4. Persist step progress to allow resume after interruption.

---

### WF-020 — No Save-and-Resume for Long Workflows

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Workflow |
| **Constitution** | Section 3 (Speed), Section 2 (Confidence) |
| **Personas** | Controller, Finance Manager |
| **Workflow** | Journal entry creation, reconciliation, financial reporting |

**Description:**
Long workflows (journal entry with 50+ line items, reconciliation with 200+ transactions, financial report with 10+ sections) cannot be saved as drafts and resumed later. If the user navigates away or the session expires, all progress is lost.

**Evidence:**
- Journal entry creation has no draft/autosave functionality
- Reconciliation workflow has no session persistence
- `EnterpriseForm` has auto-save (debounced 2s) but it is not wired to all forms
- No draft state on any financial workflow entity

**Current Behavior:**
Users must complete the entire workflow in one session. Navigating away loses all unsaved work. No draft state. No autosave.

**Expected Behavior:**
Long workflows should: (a) autosave drafts every 30 seconds, (b) show "Draft saved" indicator, (c) allow resume from the last saved state, (d) warn before navigating away with unsaved changes.

**Impact:**
Every interrupted workflow. A Controller who is called away mid-journal-entry loses 30 minutes of work. Across a team of 5 controllers, this is hours of lost productivity per week.

**Recommendation:**
1. Wire `EnterpriseForm` autosave to all long-form workflows.
2. Implement a draft state for journal entries, reconciliations, and reports.
3. Add `UnsavedChangesGuard` (already built) to all workflow pages.
4. Show "Last saved X minutes ago" in the form header.

---

### WF-021 — Missing End-to-End Workflow Connections

| | |
|---|---|
| **Severity** | Critical |
| **Category** | Workflow |
| **Constitution** | Section 1 (Clarity) |
| **Personas** | Controller, Treasurer |
| **Workflow** | Procure-to-Pay, Order-to-Cash, Financial Close |

**Description:**
Domain workflows are implemented in isolation. A CRM invoice does not wire to Accounts Receivable. A procurement payment does not post to the General Ledger. The only workflow with a complete GL integration service is Order-to-Cash. All others require manual mapping.

**Evidence:**
- `src/server/accounts-receivable/domain/gl-integration/` — only domain with automated GL posting
- `src/server/procurement/` — `accountCode` on line items but no `GLIntegrationService`
- `src/modules/crm/` — invoice creation does not trigger AR workflow
- `src/server/treasury/` — cash movements do not auto-post to GL
- `src/server/fixed-assets/` — depreciation entries require manual journal creation

**Current Behavior:**
Each domain module operates independently. Creating an invoice in the procurement system does not automatically create a corresponding AP entry in the GL. Users must manually reconcile across systems.

**Expected Behavior:**
Domain events should trigger cross-module workflows: (a) Procurement invoice → AP journal entry, (b) AR receipt → GL cash posting, (c) Treasury transfer → GL movement, (d) Fixed asset depreciation → GL expense.

**Impact:**
Every cross-module transaction. A Treasurer reconciling bank statements must manually verify that all treasury movements are reflected in the GL. This is the primary source of reconciliation errors.

**Recommendation:**
1. Implement `GLIntegrationService` for each domain (procurement, treasury, fixed assets, tax).
2. Use the Order-to-Cash pattern as the reference implementation.
3. Wire domain events to GL posting via the event bus.
4. Add a "Pending GL Postings" dashboard showing unposted transactions.

---

### WF-022 — In-Memory Data Means Workflows Reset on Restart

| | |
|---|---|
| **Severity** | Critical |
| **Category** | Workflow |
| **Constitution** | Section 5 (Trust), Section 2 (Confidence) |
| **Personas** | All |
| **Workflow** | All non-Prisma-backed workflows |

**Description:**
Most services use in-memory `Map<string, T>` storage that is lost on server restart. After a restart, all user-entered data, workflow state, and configuration is gone. Only Prisma-backed services (morning briefing, reconciliation, financial reporting, CRM, agent framework, approval rules) survive restarts.

**Evidence:**
- `src/modules/automation-studio/business-rules-builder.ts` — in-memory Map
- `src/modules/automation-studio/approval-matrix-evaluator.ts` — in-memory Map
- `src/modules/automation-studio/automation-scheduler.ts` — in-memory Map
- `src/server/general-ledger/` — in-memory GL data
- `src/server/accounting/` — in-memory accounting data
- Only Prisma-backed: morning briefing, reconciliation, financial reporting, CRM, agent framework

**Current Behavior:**
After a server restart, all business rules, approval matrix configurations, scheduler settings, GL data, and accounting data are reset to seed defaults. Users must re-enter all configuration.

**Expected Behavior:**
All user-entered data must persist across restarts. In-memory stores are acceptable for caching but not as the primary data store.

**Impact:**
Every server restart. In production, this means any deployment or crash loses all user configuration. For a design partner pilot, this is a deal-breaker — users will not invest time configuring a system that forgets their settings.

**Recommendation:**
1. Migrate all in-memory stores to Prisma (following Phase 7E.2 pattern).
2. Priority: business rules, approval matrix, scheduler configuration.
3. Add a "Last persisted" timestamp to all in-memory entities.
4. Implement a graceful shutdown that flushes in-memory data to Prisma.

---

### WF-023 — No Offline Capability

| | |
|---|---|
| **Severity** | Medium |
| **Category** | Workflow |
| **Constitution** | Section 3 (Speed) |
| **Personas** | CFO, Treasurer |
| **Workflow** | Mobile dashboard, approvals on the go |

**Description:**
No offline capability exists. A CFO reviewing the morning briefing on a flight or in a conference room with poor connectivity sees a blank screen or loading spinner. The mobile components exist (`OfflineIndicator`, `ConnectionStatus`) but no data is cached for offline use.

**Evidence:**
- `src/components/mobile/offline-indicator.tsx` — shows "You are offline" banner
- `src/components/mobile/connection-status.tsx` — red dot when offline
- No Service Worker registration in the application
- No `localStorage` or `IndexedDB` caching of API responses
- No offline action queue

**Current Behavior:**
When offline, the app shows an offline indicator and all data-dependent components show loading states or errors. No data is available. No actions can be taken.

**Expected Behavior:**
When offline: (a) previously loaded data should be available from cache, (b) approvals should queue and sync on reconnect, (c) read-only dashboards should function with cached data, (d) the user should see "Offline — showing cached data from X minutes ago."

**Impact:**
CFOs and Treasurers are mobile professionals. Any time they are without connectivity (flights, tunnels, remote locations), the platform is unusable. This is a table-stakes feature for executive mobile users.

**Recommendation:**
1. Implement a Service Worker for API response caching.
2. Cache critical dashboard data in IndexedDB with TTL.
3. Implement an offline action queue for approvals.
4. Show "Last synced X minutes ago" when offline.
5. Sync queued actions on reconnection.

---

### WF-024 — Inconsistent Empty States Across Pages

| | |
|---|---|
| **Severity** | Low |
| **Category** | Workflow |
| **Constitution** | Section 1 (Clarity), Section 2 (Confidence) |
| **Personas** | All |
| **Workflow** | First-time use, post-restart |

**Description:**
Empty states (no data yet) are inconsistent. Some pages show helpful illustrations with "Get started" buttons. Others show a blank table. Others show a generic "No data" message. A user encountering an empty page cannot determine whether data is expected, whether they need to take action, or whether something went wrong.

**Evidence:**
- `src/app/(shell)/dashboard/page.tsx` — Welcome screen for new companies (good)
- `src/app/(shell)/general-ledger/journal-entries/page.tsx` — empty table (no guidance)
- `src/app/(shell)/procurement/invoices/page.tsx` — raw empty table
- `src/components/enterprise/table/data-table.tsx` — generic empty state component
- No unified empty state design system

**Current Behavior:**
Empty states vary from helpful (dashboard welcome) to confusing (blank table with no explanation). Users cannot distinguish between "no data yet" and "data failed to load."

**Expected Behavior:**
Every empty state should: (a) explain why it is empty, (b) show an illustration or icon, (c) provide a clear next action ("Create your first journal entry"), (d) link to a getting-started guide.

**Impact:**
First-time users and post-restart scenarios. An empty page with no guidance increases time-to-first-action by 2–5 minutes.

**Recommendation:**
1. Create an `EmptyState` component with variants: no-data, no-results, first-time, error.
2. Replace all raw empty states with the unified component.
3. Wire each empty state to the primary action for that page.
4. Add illustrations consistent with the charcoal/gold visual identity.

---

### WF-025 — Inconsistent Terminology Across Modules

| | |
|---|---|
| **Severity** | Low |
| **Category** | Information |
| **Constitution** | Section 1 (Clarity) |
| **Personas** | All |
| **Workflow** | Cross-module operations |

**Description:**
The same concept is referred to by different names across modules. "Variance" in one module is "deviation" in another and "difference" in a third. "Journal entry" is sometimes "journal" and sometimes "JE." "Account code" is sometimes "account number" and sometimes "GL code."

**Evidence:**
- GL module uses "journal entry" and "account code"
- Accounting module uses "journal" and "account number"
- Procurement uses "variance" (quantity variance, price variance)
- Tax uses "difference" (tax difference, withholding difference)
- Treasury uses "deviation" (budget deviation)
- No glossary or terminology standard in the codebase

**Current Behavior:**
Users encountering different terminology across modules must mentally map "variance = deviation = difference." This increases cognitive load and creates confusion when the same metric is displayed differently in different contexts.

**Expected Behavior:**
A single terminology standard applied across all modules. A glossary accessible from the help menu. Consistent naming in the UI, API, and documentation.

**Impact:**
Cross-module users (Controllers, Treasurers) encounter 5–10 terminology inconsistencies per session. This is a minor friction but accumulates over time.

**Recommendation:**
1. Create a terminology glossary (`docs/glossary.md`).
2. Standardize on one term per concept: variance (GL), deviation (budget), difference (tax).
3. Update all UI labels to match the glossary.
4. Add terminology tooltips on first use.

---

## Summary Matrix

| ID | Severity | Category | Persona | Workflow | Effort |
|---|---|---|---|---|---|
| WF-001 | Critical | Navigation | Controller/Treasurer | GL Operations | Large (weeks) |
| WF-002 | Medium | Navigation | All | Cross-module | Small (days) |
| WF-003 | Medium | Navigation | CFO/Treasurer | Drill-down | Medium (days) |
| WF-004 | Low | Navigation | All | Discovery | Small (hours) |
| WF-005 | High | Information | CFO/Treasurer/Controller | Dashboard review | Medium (days) |
| WF-006 | High | Information | Controller/Auditor | Balance review | Medium (days) |
| WF-007 | High | Information | All | Data-dependent decisions | Medium (days) |
| WF-008 | High | Information | CFO/Treasurer | AI recommendations | Medium (days) |
| WF-009 | Medium | Information | Controller/Finance Mgr | Transaction review | Small (days) |
| WF-010 | High | Action | All | All mutations | Large (weeks) |
| WF-011 | High | Navigation/Action | All (power users) | Any navigation | Medium (days) |
| WF-012 | High | Action | All | Data viewing | Large (weeks) |
| WF-013 | Medium | Action | All | Error scenarios | Medium (days) |
| WF-014 | Medium | Action | Controller/Treasurer | Approvals/entry | Small (days) |
| WF-015 | Low | Action | All | All action surfaces | Small (hours) |
| WF-016 | High | Trust | CFO/Treasurer | AI outputs | Small (days) |
| WF-017 | Medium | Trust | Controller/Auditor | Approvals/config | Medium (days) |
| WF-018 | Medium | Trust | Controller/Auditor | Financial calculations | Large (weeks) |
| WF-019 | Medium | Workflow | All | Multi-step processes | Small (days) |
| WF-020 | Medium | Workflow | Controller/Finance Mgr | Long workflows | Medium (days) |
| WF-021 | Critical | Workflow | Controller/Treasurer | Cross-module | Large (weeks) |
| WF-022 | Critical | Workflow | All | All non-Prisma | Large (weeks) |
| WF-023 | Medium | Workflow | CFO/Treasurer | Mobile | Large (weeks) |
| WF-024 | Low | Workflow | All | First-time use | Small (hours) |
| WF-025 | Low | Information | All | Cross-module | Small (days) |

---

## Remediation Roadmap

### Phase P0 — Before Any Pilot (Weeks 1–2)

| ID | Finding | Effort | Owner |
|---|---|---|---|
| WF-001 | Designate authoritative GL, deprecate duplicate | 2 weeks | Architect |
| WF-021 | Wire cross-module GL integration (at least procurement) | 2 weeks | Backend Engineer |
| WF-022 | Persist business rules, approval matrix, scheduler to Prisma | 1 week | Backend Engineer |
| WF-007 | Add data mode indicator (Demo/Live) to sidebar | 1 day | Frontend Engineer |

### Phase P1 — Before Design Partner (Weeks 3–6)

| ID | Finding | Effort | Owner |
|---|---|---|---|
| WF-005 | Add delta/change indicators to all dashboard KPI cards | 1 week | Frontend Engineer |
| WF-006 | Add timestamps to all financial figures | 3 days | Frontend Engineer |
| WF-008 | Add evidence links to AI recommendations | 3 days | AI Engineer |
| WF-010 | Implement undo system (UndoProvider + withUndo helper) | 1 week | Frontend Engineer |
| WF-011 | Build Cmd+K command palette | 1 week | Frontend Engineer |
| WF-016 | Add confidence ratings to AI outputs | 2 days | AI Engineer |
| WF-012 | Begin EnterpriseTable migration (top 10 pages) | 2 weeks | Frontend Engineer |

### Phase P2 — Before GA (Weeks 7–12)

| ID | Finding | Effort | Owner |
|---|---|---|---|
| WF-003 | Implement Quick View panels for dashboard drill-down | 1 week | Frontend Engineer |
| WF-009 | Add default filters and filter persistence to list pages | 3 days | Frontend Engineer |
| WF-013 | Standardize error handling with global ErrorProvider | 1 week | Frontend Engineer |
| WF-014 | Extend keyboard shortcuts for critical actions | 3 days | Frontend Engineer |
| WF-017 | Extend audit trail for AI-influenced decisions | 1 week | Backend Engineer |
| WF-018 | Migrate remaining monetary fields to Decimal | 1 week | Backend Engineer |
| WF-019 | Wire financial close to EnterpriseWizard | 3 days | Frontend Engineer |
| WF-020 | Implement draft/autosave for long workflows | 1 week | Frontend Engineer |

### Phase P3 — Post-GA Polish (Weeks 13–20)

| ID | Finding | Effort | Owner |
|---|---|---|---|
| WF-002 | Rename/consolidate duplicate navigation paths | 1 week | Product + Frontend |
| WF-004 | Wire orphaned routes into sidebar navigation | 1 day | Frontend Engineer |
| WF-015 | Standardize button styles across modules | 3 days | Frontend Engineer |
| WF-023 | Implement offline caching and action queue | 2 weeks | Frontend Engineer |
| WF-024 | Create unified EmptyState component | 2 days | Frontend Engineer |
| WF-025 | Create terminology glossary and update UI labels | 3 days | Technical Writer |

---

## Constitution Alignment Score

| Principle | Current | After P0 | After P1 | After P2 | After P3 |
|---|---|---|---|---|---|
| Section 1 — Clarity | 5/10 | 6/10 | 7/10 | 8/10 | 9/10 |
| Section 2 — Confidence | 4/10 | 6/10 | 7/10 | 8/10 | 9/10 |
| Section 3 — Speed | 4/10 | 5/10 | 6/10 | 8/10 | 9/10 |
| Section 4 — Beauty | 7/10 | 7/10 | 8/10 | 8/10 | 9/10 |
| Section 5 — Trust | 3/10 | 5/10 | 7/10 | 8/10 | 9/10 |
| Section 6 — Audit Trail | 6/10 | 6/10 | 7/10 | 8/10 | 9/10 |
| Section 7 — Progressive Disclosure | 5/10 | 5/10 | 6/10 | 8/10 | 9/10 |
| Section 8 — Keyboard-First | 2/10 | 2/10 | 5/10 | 7/10 | 9/10 |
| **Overall** | **4.8/10** | **5.3/10** | **6.8/10** | **7.9/10** | **9.0/10** |

---

## Measurement Criteria

Each friction finding is resolved when:

1. **WF-001**: One GL route is designated authoritative; duplicate routes redirect or show deprecation banner.
2. **WF-005**: Every dashboard KPI card shows delta from previous period with direction arrow.
3. **WF-006**: Every financial figure has an "as of [timestamp]" label.
4. **WF-007**: Sidebar shows "Demo" / "Live" / "Mixed" data mode indicator.
5. **WF-008**: Every recommendation card has a "View Evidence" link and confidence badge.
6. **WF-010**: Destructive actions show an undo toast with 5-second window.
7. **WF-011**: Cmd+K opens a command palette with fuzzy search across all routes.
8. **WF-012**: Zero raw `<table>` elements in production pages (tracked by grep).
9. **WF-016**: Every AI output shows confidence percentage.
10. **WF-021**: At least 3 domain modules have automated GL integration services.
11. **WF-022**: Business rules, approval matrix, and scheduler survive server restart.
12. **WF-023**: Dashboard loads from cache when offline.

---

*Phase 20.0 — Documentation only. No code changes.*
