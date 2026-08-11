# Perionyx UX & Consistency Audit — Demo Readiness
**Audited:** `/Users/horus/Desktop/vaultareloaded` (Next.js 16, 465 shell routes)
**Consumer personas:** CFO / Treasurer / Controller
**Date:** 2026-08-07 · **Method:** static source analysis, route inventory, link graph validation (read-only)

---

## 1. Executive Summary

| Severity | Count | Meaning |
|---|---|---|
| CRITICAL | 3 | Navigable element leads to 404 or a primary-nav page is a stub |
| HIGH | 8 | Primary-surface dead buttons / no-op shortcuts / role-filtering bypass |
| MEDIUM | 5 | Secondary dead ends, brand/visual inconsistency, route duplication |
| LOW | 3 | Cosmetic placeholders with explicit labeling |

**Headlines**

1. **The `/treasury` hub — the Treasurer's landing surface — is a static mock with 6 dead buttons** (executive-header ×4, scorecards ×1, navigation-cards ×1). Every button renders a hover state but has no `onClick`, no `href`. `executive-header.tsx:152-167`.
2. **A primary nav card on that hub points to a non-existent route** — "EBAM" is marked `status: "active"` with `route: "/treasury/ebam"` (`data.ts:223`); the directory does not exist → guaranteed 404.
3. **Two primary nav items are pure stubs with hardcoded numbers:** `/invoices` ("Invoice detail view coming soon." `invoices/page.tsx:74`) and `/audit-trail` ("Audit trail detail view coming soon." `audit-trail/page.tsx:74`). Both nav entries are **visible to every role** (`nav-config.ts:58,97` — no `minRole`).
4. **Keyboard shortcuts Cmd+N ("New item") and Cmd+S ("Save") are advertised in the shortcuts dialog but are no-ops** (`app-shell.tsx:123,125`).
5. **Role/permission filtering is bypassed in the sidebar:** `app-shell.tsx:236` passes raw `NAV_SECTIONS` to `EnterpriseSidebarNew`, and `enterprise-sidebar-new.tsx:392-402` renders section items without filtering — `filterNavByRole`/`filterNavByPermissions` (applied only to the flat `visibleNav`) are defeated for all sectioned items. A MEMBER/TREASURER sees ADMIN-only entries (audit, compliance, governance, tax, fpa, cfo, automation-studio…).
6. **The built Reports page is hidden:** `/reports` is `disabled: true` with a "Coming soon" badge in the sidebar (`nav-config.ts:125`, `enterprise-sidebar-new.tsx:74`), but `reports/page.tsx` is a fully assembled page (28 lines, 9 components). Inverted dead end — and Cmd+K still lists it (`command-palette.tsx:34` doesn't filter `disabled`).
7. **Route duplication:** 369 of 465 routes are unreferenced by nav; parallel trees exist for the same feature (accounting vs general-ledger; planning vs fpa; treasury/cash vs treasury/cash-position; treasury/forecasts vs treasury/cash-forecast; treasury/risk vs treasury/risks; integration-platform vs integrations vs connectors). 14 `/accounting/**` pages carry a "Use General Ledger instead" deprecation banner yet the nav still promotes `/accounting` (`nav-config.ts:50`).
8. **Brand leak:** 6 executive pages render legacy tab titles "…| Vaulta" (Perionyx is the brand) — `executive/{dashboard,kpis,alerts,pilot,scenarios,drill-down}/page.tsx:4`.

**Verdict for CFO/Treasurer/Controller demo:** The *deep* surfaces (GL, work queue, decision workspace, approvals, morning briefing, intelligence, implementation center) are substantive and Prisma-backed. The *hub* surfaces (treasury hub, invoices, audit-trail, mobile dashboards) are the weak points — exactly the screens a demo would start on. Clarity and confidence are undermined by dead buttons on live-looking mock data, stubs in primary nav, and a role filter that shows admin destinations to all users.

---

## 2. Dead Ends Table (file:line · what · why it's a problem · severity)

| # | Location | What | Why it's a problem | Sev |
|---|---|---|---|---|
| D1 | `src/components/treasury/command-center/executive-header.tsx:152,156,160,164` | 4 buttons ("View Full Cash Position", "Open Liquidity Center", "Export Snapshot", "Print Dashboard") — no `onClick`, no `href` | Treasurer on `/treasury` taps a gold primary CTA → nothing. Confidence destroyed on the flagship treasury screen. | HIGH |
| D2 | `src/components/treasury/command-center/treasury-scorecards.tsx:64` | "Open" button (6 scorecards) — no handler | Same as D1, every scorecard implies drill-down that doesn't exist. | HIGH |
| D3 | `src/components/treasury/command-center/navigation-cards.tsx:53` | "Open" button on Quick Access cards — no handler | Same as D1 (used by `/treasury` via `global-treasury-command-center.tsx:42`). | HIGH |
| D4 | `src/components/treasury/command-center/data.ts:223` | EBAM card `status: "active"` → `route: "/treasury/ebam"`; directory does not exist (verified `ls` fails) | Active-looking card navigates to 404. Worse than a dead button. | CRITICAL |
| D5 | `src/app/(shell)/invoices/page.tsx:33-82` | Page = 3 hardcoded stat cards (`$284,500`, `$42,800`, `$12,300`) + empty list with "Invoice detail view coming soon." | Nav item visible to **all roles** (`nav-config.ts:58`); every user's Invoices is a stub with fabricated figures and no source/timestamp (violates Confidence principle). | CRITICAL |
| D6 | `src/app/(shell)/audit-trail/page.tsx:33-82` | Same pattern: hardcoded stats (`21,847` events, `100%` verified) + "Audit trail detail view coming soon." | Auditor-facing nav item (`nav-config.ts:97`, all roles) is a stub; hardcoded "100% Verified" is actively misleading. | CRITICAL |
| D7 | `src/components/app-shell.tsx:123,125` | Cmd+N "New item" and Cmd+S "Save" shortcuts → `handler: () => {}` | Shortcuts dialog (`useKeyboardShortcuts`) advertises them; CFO presses Cmd+S expecting save → nothing. | HIGH |
| D8 | `src/app/(shell)/guidance/page.tsx:155-178` | Start/Resume/Retake `<button>` — no `onClick`, not a `<Link>` | Every tour card offers a primary action that cannot start a tour. | HIGH |
| D9 | `src/components/financial-reports/report-viewer.tsx:92` | "Export" button `onClick={() => {}}` | Executives export reports to PDF/Excel; button renders enabled and hoverable but does nothing. | HIGH |
| D10 | `src/app/(shell)/mobile-dashboard/page.tsx:35` | `QuickActionBar onSearch={() => {}}` | Mobile search action dead; search is a core executive action. | MEDIUM |
| D11 | `src/mobile/ApprovalCenter/approval-center.tsx:152` | "Audit Trail" ActionButton `onClick={() => {}}` | Mobile approver taps Audit Trail → nothing (matters for Controller/auditor persona). | MEDIUM |
| D12 | `src/app/(shell)/settings/page.tsx:62-67` | "Payment Rails" `<Link href="#">` with `cursor-not-allowed` styling | Still a real link — click adds `#` to URL / scrolls; looks disabled but isn't. | MEDIUM |
| D13 | `src/components/workflow/workflow-actions.tsx:114-151` | Pause/Resume, Reassign, Delegate — `disabled` with `title` tooltips | Explained via tooltip (better), but core workflow actions (reassign/delegate) have no functional path — CFO cannot reassign an approval. | MEDIUM |
| D14 | `src/components/demo/demo-layout.tsx:85` | Demo step buttons `onClick={() => {}}` | Demo controller step labels look clickable; no navigation. | LOW |
| D15 | `src/components/treasury/command-center/active-alerts.tsx:48-49` | Dismiss alert — works but only local state, mock data re-renders | Dismiss appears to clear alerts but is cosmetic (MOCK data). | LOW |
| D16 | `src/components/command-center-enhanced/forecast-enhanced.tsx:55` | `{/* Trend chart placeholder */}` — chart never rendered | Forecast card displays without its primary visual. | LOW |

---

## 3. Placeholder / Stub Inventory

| # | Location | Placeholder | Notes |
|---|---|---|---|
| P1 | `src/app/(shell)/invoices/page.tsx:74` | "Invoice detail view coming soon." | Primary-nav stub (see D5) |
| P2 | `src/app/(shell)/audit-trail/page.tsx:74` | "Audit trail detail view coming soon." | Primary-nav stub (see D6) |
| P3 | `src/app/(shell)/mobile-dashboard/page.tsx:42,88,111,136` | `{/* Placeholder metric cards */}`, `{/* Treasury snapshot — placeholder */}`, `{/* Workflow & Compliance — placeholder */}`, `{/* Today's Activity — placeholder */}` | Every metric renders `value="—"`, `subtitle="awaiting data"`; entire executive mobile dashboard is an empty shell. |
| P4 | `src/mobile/TreasuryView/treasury-view.tsx:12` | `const MOCK = {…}` | Mobile treasury view is 100% static mock (balance, FX, risk, payments). |
| P5 | `src/components/treasury/command-center/coming-soon-roadmap.tsx:12-48` | "Coming Soon" roadmap with ETA badges (Q3 2026 – Q2 2027) | Explicit marketing-style placeholders on `/treasury` hub. |
| P6 | `src/components/treasury/command-center/data.ts:224` | `nav-forecast` card `status: "coming_soon"` → `/treasury/cash-forecast` | **Route exists and is built** — the "Coming Soon" badge hides a working page. Misleading. |
| P7 | `src/components/treasury/command-center/navigation-cards.tsx:36-40` | "Coming Soon" badges on Quick Access cards | Same data as P6. |
| P8 | `src/app/(shell)/settings/page.tsx:122-126` | "Coming soon" Badge on Payment Rails | Acceptable if intentional; link is still a live `href="#"` (D12). |
| P9 | `src/components/navigation/enterprise-sidebar-new.tsx:74,81-95` | "Coming soon" label on disabled `/reports` item | Reports page actually exists (D-inverted, see §4). |
| P10 | `src/components/finance-collaboration/decision-center.tsx:145` | `impact: formData.impact \|\| "TBD"` | "TBD" can surface as a user-visible value. |
| P11 | `src/app/(shell)/accounting/**` (14 files) | `DeprecationBanner redirectTo="/general-ledger"` (`accounting/page.tsx:25`) | Whole deprecated tree still rendered and navigable. |
| P12 | `src/components/workflow/workflow-actions.tsx:129,141` | Comments `{/* Reassign (placeholder) */}`, `{/* Delegate (placeholder) */}` | Disabled buttons (D13). |

**Empty-component / near-empty pages:** No `return null` pages found in `(shell)`. The 5-line pages are thin server wrappers delegating to client components (normal Next pattern). True stubs are the ones above.

---

## 4. Nav ↔ Route Consistency Findings

**Method:** parsed `nav-config.ts` (96 unique hrefs in `ALL_NAV` + 96 in `NAV_SECTIONS`) vs. filesystem route inventory of `src/app/(shell)` (465 page files) and full `src/app` link graph (1,425 routes incl. API).

### 4.1 Nav entries → routes (all resolve)
✅ All 96 unique nav hrefs have a matching route file (incl. dynamic). **Zero broken nav links** in `ALL_NAV`/`NAV_SECTIONS`.

### 4.2 Broken links found in components (static analysis of all `href=` and `router.push` in `src/components` + `src/mobile`)
✅ **Zero missing link targets** when checked against the full `src/app` route graph. The only internal 404 hazard is the runtime-built `/treasury/ebam` (D4, built from `data.ts`).

### 4.3 Role filtering bypass (HIGH)
- `app-shell.tsx:164-165` filters `ALL_NAV` → `nav` (permissions or role) → `visibleNav` (`:203`) → passed as `nav` prop (`:235`).
- BUT `sections={NAV_SECTIONS}` is passed raw (`:236`), and `enterprise-sidebar-new.tsx:392-402` renders `section.items` directly with **no filtering**.
- Result: every user sees every section item — e.g. a `TREASURER` sees ADMIN-only `/audit/dashboard`, `/compliance/*`, `/governance/*`, `/tax/*`, `/fpa/*`, `/cfo/*`, `/automation-studio`… `filterNavByRole`/`filterNavByPermissions` are effectively dead code for the sectioned sidebar.
- The Command Palette applies `filterNavByRole` (`command-palette.tsx:34`) but **not** `filterNavByPermissions` and **not** the `disabled` flag → it lists `/reports` (disabled) and admin-gated items to users who lack permissions.

### 4.4 Disabled-but-built / hidden features
- `/reports`: `disabled: true` (`nav-config.ts:125,258`) → sidebar "Coming soon" (`enterprise-sidebar-new.tsx:60-96`); page is fully built (`reports/page.tsx`). Searchable via Cmd+K. Inverted dead end.

### 4.5 Deprecated tree still first-class in nav
- `/accounting` (`nav-config.ts:50`) → renders "Use General Ledger instead" banner (`accounting/page.tsx:25`); 14 files under `/accounting` carry the banner. Parallel duplicate trees:
  - `accounting/*` (13 subpages) vs `general-ledger/*` (12 subpages) — near-identical names (journals, chart-of-accounts, financial-statements, intercompany, posting, allocations, executive…)
  - `planning/*` (17 subpages) vs `fpa/*` (10 subpages)
  - `treasury/cash` vs `treasury/cash-position`; `treasury/forecasts` vs `treasury/cash-forecast`; `treasury/risk` vs `treasury/risks`; `treasury/dashboard` vs `/treasury` hub (hub is not in nav at all)
  - `integration-platform/*` (14) vs `integrations/*` vs `connectors/*` (3 separate integration surfaces)
  - `compliance` hub + `compliance/dashboard`; `governance` hub + `governance/dashboard`

### 4.6 Duplicate / ungrouped nav entries
- "CFO Advisor" appears **twice**: `ALL_NAV` `/cfo` (`nav-config.ts:42`) **and** section item `/cfo/dashboard` (`nav-config.ts:149`). `/cfo` redirects to `/cfo/dashboard` (`cfo/page.tsx:4`).
- 4 items exist in `ALL_NAV` but **not** in any `NAV_SECTION` → rendered ungrouped at the sidebar bottom: `/insights`, `/cfo`, `/wallets`, `/accounts` (`enterprise-sidebar-new.tsx:405-417`).

### 4.7 Routes missing from nav (369 of 465)
Every subpage of `audit/*`, `compliance/*`, `governance/*`, `consolidation/*`, `fixed-assets/*`, `financial-close/*`, `order-to-cash/*`, `risk/*`, `tax/*`, `investments/*`, `intelligence/*`, `procurement/*`, `reconciliation/*`, `orchestration/*`, `system/identity/*`, `integration-platform/*`, `planning/*`, `fpa/*`, `mobile/*`, plus hubs `/compliance`, `/governance`, `/investments`, `/planning`, `/tax`, `/treasury`, `/workspaces`, `/role-dashboard`, `/guidance`, `/implementation-center`, `/enterprise-experience` etc. Most are reachable only via in-page links or direct URL. Some (treasury duplicates, accounting duplicates) are orphaned.

### 4.8 Brand & visual consistency
- 6 executive pages: metadata title "…| Vaulta" — legacy brand (Perionyx): `executive/dashboard/page.tsx:4`, `executive/kpis/page.tsx:4`, `executive/alerts/page.tsx:4`, `executive/pilot/page.tsx:4`, `executive/scenarios/page.tsx:4`, `executive/drill-down/page.tsx:4`. Visible in browser tab.
- Legacy gold `#d4a843` (canonical EDL is `#d4af37`): 13 occurrences in `setup/page.tsx` (e.g. `:192`), plus `system/identity/users/page.tsx:19`, `system/identity/audit/page.tsx:26` (used as `focus:border-[#d4a843]`).
- The `mobile/treasury` and treasury hub pages mix MOCK values with real-looking layouts (no "Demo" labeling except the global sidebar footer badge).

---

## 5. Page Inventory (Scope item 4)

- **Total page files under `src/app/(shell)`:** **465**
- **Thin wrappers (5–17 lines, delegate to a client component):** **183 (39%)** — normal Next.js server-component pattern; the underlying components are substantive for most (GL, treasury, audit, compliance, governance, tax, fpa, risk, procurement, investments, controller, orchestration, agents, finance-collab all delegate to real specialist components backed by services/Prisma).
- **Substantive pages with in-file content (≥18 lines, real data + rendering):** **~250**
- **Stub / placeholder pages (explicit "coming soon" or all-placeholder content):** **4** — `/invoices`, `/audit-trail`, `/mobile-dashboard`, `/mobile/treasury` (plus `/treasury` hub which is mock-driven with dead buttons).
- **Deprecated-but-rendered pages:** 14 (`/accounting/**`).
- **Routes unreferenced by nav:** 369.

---

## 6. Top 10 Highest-Impact Issues (ranked)

1. **`/treasury` hub = static mock with 6 dead buttons + 1 guaranteed 404 (EBAM).** `executive-header.tsx:152-167`, `treasury-scorecards.tsx:64`, `navigation-cards.tsx:53`, `data.ts:223`. The Treasurer's first screen fails every click. *(Critical)*
2. **`/invoices` and `/audit-trail` are stubs in the primary nav for all roles, with hardcoded figures.** `invoices/page.tsx:74`, `audit-trail/page.tsx:74`. Hardcoded "100% Verified" (audit-trail:29) is a trust violation for auditors. *(Critical)*
3. **Sidebar role filtering bypassed — every user sees ADMIN destinations.** `app-shell.tsx:236` + `enterprise-sidebar-new.tsx:392-402` render `NAV_SECTIONS` unfiltered; `filterNavByRole`/`filterNavByPermissions` are neutralized for sectioned items. *(High — also a security-review concern)*
4. **Cmd+N / Cmd+S advertised but no-op.** `app-shell.tsx:123,125`. Keyboard-first CFOs get silent failure. *(High)*
5. **Reports module fully built but hidden as "Coming soon" in sidebar; still listed in Cmd+K.** `nav-config.ts:125`, `enterprise-sidebar-new.tsx:74`, `reports/page.tsx`, `command-palette.tsx:34`. Inverted dead end and contradictory signals. *(High)*
6. **Deprecated `/accounting` tree promoted in nav alongside `/general-ledger`, with 14 deprecation banners and duplicated subpage trees.** `nav-config.ts:50`, `accounting/page.tsx:25`. Dual-GL confusion documented since Phase 20.0 remains user-visible. *(High)*
7. **Guidance page: Start/Resume/Retake buttons do nothing.** `guidance/page.tsx:155-178`. *(High)*
8. **Report viewer "Export" button no-op.** `report-viewer.tsx:92`. Export is a core CFO action. *(High)*
9. **369 of 465 routes unreferenced by nav; duplicate feature trees** (accounting/GL, planning/fpa, treasury/cash vs cash-position, forecasts vs cash-forecast, risk vs risks, integration-platform/integrations/connectors). Causes navigation uncertainty and stale-URL demo risk. *(Medium)*
10. **Brand leak: "Vaulta" tab titles on 6 executive pages + legacy `#d4a843` gold in `setup`.** `executive/*/page.tsx:4`, `setup/page.tsx:192`. Every executive nav visit shows the wrong brand. *(Medium — trivially fixable)*

---

*All findings verified by direct file reads and route filesystem checks. No code was modified.*
