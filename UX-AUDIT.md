# PERIONYX — UX & Product Audit

> Performed: June 2026
> Scope: 56 routes, 80+ UI components, 25 service modules
> Style: Stripe/Linear/Rippling/Modern Treasury benchmark

---

## Dashboard

### Current Strengths
- Summary cards with balance, wallets, transactions, audit activity
- FX Sync + Ledger Integrity widgets add operational depth
- Approval Status + Bottleneck widgets provide visibility
- Telemetry + Sparkline + Financial Insights panel
- Empty states for transactions/audit when no data
- Error state banner for failed fetches

### Current Weaknesses
- **Gold-heavy hero** (38px radius, 3 gradient overlays) contradicts landing page's emerald identity
- **No loading.tsx** — full page blocks until all 4 fetches resolve
- **No recent activity feed** — transactions + audit are separate cards, no aggregated timeline
- **CommandCenterSection** has no keyboard shortcut or quick-action affordance
- **No pagination indicator** on "All time" transaction count
- **Financial Insights panel** uses hardcoded mock data (`Liquidity Ratio: 2.8`)

### Risk Level: Medium
### Priority: High

### Recommended Improvements
1. Add `loading.tsx` with skeleton grid matching actual layout
2. Restyle hero to use emerald accent matching landing page
3. Add aggregated activity feed (combined tx + audit + approval events)
4. Make CommandCenter searchable with cmd+k

### Quick Wins
- Add loading.tsx (1 file, 30 lines)
- Add activity feed (1 new component, 80 lines)

---

## Transactions

### Current Strengths
- Status + Wallet + Date filters
- Client-side filtering with useMemo
- Transfer and Credit wallet dialogs
- Export button
- Skeleton loading state
- Empty states for no-data and no-filter-results
- Error state card

### Current Weaknesses
- **Table not sortable** — clicking column headers does nothing
- **No pagination** — loads 200 ledger rows, no load-more
- **No bulk selection** — cannot act on multiple transactions
- **No search by reference/amount/vendor**
- **Filter bar wrapped in Card with gold border** — heavy visual weight for a filter row
- **Dialog forms lack validation styling** — no inline field errors
- **No success animation** after transfer/credit — just reloads data silently

### Risk Level: Medium
### Priority: High

### Recommended Improvements
1. Add sortable column headers (click to sort asc/desc)
2. Add inline field validation with error icons in dialogs
3. Add success toast/checkmark after submission
4. Lighten filter bar styling

### Quick Wins
- Sortable headers (4 lines per column)
- Success animation after submit (1 state + icon per dialog)

---

## Approvals

### Current Strengths
- Pending approvals badge in sidebar (polled every 15s)
- Dedicated approvals page route

### Current Weaknesses
- **`/approvals` is a 5-line shell** — actual content is in `PendingApprovalsClient` which I couldn't review but the page delegate pattern adds indirection
- **`/approvals/[id]` is completely unstyled** — raw `<h1>`, `<p>`, no layout, no card, no timeline
- **No approval timeline visualization**
- **No approve/reject confirmation dialog** — action is immediate
- **No sorting/filtering** on approvals list
- **No bulk approve/reject**
- **No escalation indicators**

### Risk Level: High
### Priority: Critical

### Recommended Improvements
1. Style approval detail page with full card layout, timeline, metadata
2. Add approve/reject confirmation with loading state
3. Add sorting to approvals list
4. Add escalation warnings for approaching deadlines

### Quick Wins
- Style approval detail page (1 file, ~100 lines)
- Add confirmation dialogs

---

## Policy Engine

### Current Strengths
- Full CRUD with toggle enable/disable
- Delete confirmation dialog
- Rule count display
- Empty state with creation CTA
- Skeleton loading

### Current Weaknesses
- **No policy test/execute UI on list page**
- **No audit log of policy changes** visible inline
- **No policy impact metrics** (how many times did this policy trigger?)
- **Action badge uses `danger` variant** for BLOCK — inconsistent with rest of app
- **No search/filter** on policy list
- **Toggle and delete icons are small** (h-4 w-4) with minimal hit area

### Risk Level: Low
### Priority: Medium

### Recommended Improvements
1. Add policy hit count / trigger metrics column
2. Add search by policy name
3. Enlarge toggle/delete hit areas

---

## Treasury / Ledger

### Current Strengths
- Double-entry ledger inspection with per-transaction detail dialog
- Wallet filter, transaction ID search, date range filters
- Side-by-side debit/credit display
- Badge for DEBIT/CREDIT entry type
- StatusBadge for transaction status
- JSON metadata panel for investigation
- Skeleton loading

### Current Weaknesses
- **No running balance column** — entries show amount but not cumulative balance
- **No export per filtered view**
- **Detail dialog is a full fetch + dialog** — slow for quick inspection
- **No column sorting**
- **No pagination** — hard limit 200
- **No currency conversion context**

### Risk Level: Low
### Priority: Medium

### Recommended Improvements
1. Add running balance column
2. Add column sorting
3. Add export for filtered view

---

## Audit Logs

### Current Strengths
- Severity, action, user, date filters
- Debounced search input
- Detail dialog with full metadata + JSON panel
- SeverityBadge with color coding
- Empty states for no-data and no-filter-results
- Reset button for filters
- Skeleton loading

### Current Weaknesses
- **No severity color legend** — user must know INFO/WARNING/CRITICAL meaning
- **No export** for filtered results
- **Actor search is by user ID** — not human-readable name
- **No timeline visualization** — flat table only
- **No pagination** — hard limit 200
- **No sortable columns**

### Risk Level: Low
### Priority: Medium

### Recommended Improvements
1. Add export button
2. Add severity legend
3. Add pagination or infinite scroll

---

## Notifications

### Current Strengths
- Unread/all filter toggle
- Mark individual + mark all read
- Infinite scroll with IntersectionObserver
- Badge with count
- Link from notification to relevant resource
- Skeleton loading
- Empty states

### Current Weaknesses
- **No real-time updates** — page must be refreshed or manually polled
- **No notification grouping** — each notification is individual
- **No notification preferences UI** (what events trigger notifications)
- **List items are basic** — no avatar, no icon differentiation by event type

### Risk Level: Low
### Priority: Low

---

## Organization Settings

### Current Strengths
- Company profile form with legal name, EIN, entity type, jurisdiction, incorporation date, address
- Verification status badge
- Save with loading state
- Error + success feedback

### Current Weaknesses
- **`/settings` page is nearly empty** — "Workspace settings will be available next"
- **No navigation between settings sub-pages** — user must use sidebar
- **No settings search**
- **Form layout is basic** — no section grouping within form
- **Success message disappears after save** — no persistent indicator

### Risk Level: Medium
### Priority: High

### Recommended Improvements
1. Add settings overview page with cards for each settings category
2. Add settings search
3. Add persistent success badge

---

## User Management

### Current Strengths
- `/admin/users` route exists (327 lines)
- `/admin/roles` route exists
- RBAC permissions system
- Navigation filtered by role/permissions

### Current Weaknesses
- No `/admin/users` review possible without reading the file
- No invite flow visibility from management UI

---

## Cross-Cutting Issues

### Visual Identity
- **Color inconsistency:** App uses gold (#d4af37) as primary accent; landing page uses emerald (#10b981). These are two different brands.
- **Border radius inconsistency:** 38px, 28px, 22px, 20px, 18px, 12px, 8px — no design token system
- **Shadow inconsistency:** Inline shadow values, `shadow-soft` class, custom `shadow-[...]` — multiple systems

### Navigation
- **Sidebar has 24 items** with no grouping — overwhelming
- **No collapsible sections** in sidebar
- **Mobile bottom nav shows all items** — should be reduced to 5-6 primary items
- **No breadcrumbs** on detail pages

### Search
- **Global search bar is `readOnly`** — decorative only, no functionality
- **No cmd+k / command palette**
- **No per-page search consistency** — some pages have search, some don't

### Loading
- **Only 1 loading.tsx** (dashboard) out of 56 routes
- **No Suspense boundaries** per page section — all-or-nothing loading
- **No page transition animations** between routes

### Accessibility
- **No focus indicators visible** in dark theme
- **No aria labels on icon-only buttons**
- **No keyboard navigation for tables**
- **No color contrast check** — gold on dark may fail WCAG

### Responsive
- **Mobile bottom nav is functional but crowded**
- **Tables don't horizontally scroll on narrow viewports** in most pages (TableScroll helps but isn't used everywhere)
- **Filter bars stack vertically on mobile** but take full width

### Micro-interactions
- **No page transitions** — instant page changes
- **No hover card previews** on transaction IDs
- **No copy-to-clipboard animation** on API key creation (already exists)
- **No success checkmark animation** on form submissions
- **No optimistic UI updates** — always waits for server response

---

## Priority Matrix

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Style approvals detail page | Low | High |
| P0 | Fix settings overview (add content) | Low | High |
| P0 | Make search functional (cmd+k palette) | Medium | High |
| P0 | Add loading.tsx to key pages | Low | High |
| P1 | Add sortable table columns | Low | Medium |
| P1 | Add success animations on form submit | Low | Medium |
| P1 | Add page transition animations | Low | Medium |
| P1 | Add breadcrumbs to detail pages | Low | Medium |
| P2 | Add bulk actions to transactions | Medium | Medium |
| P2 | Add notification grouping | Medium | Low |
| P2 | Add color contrast fixes | Low | Medium |
| P2 | Add keyboard navigation | Medium | Medium |

---

## Recommended Implementation Order

### Sprint 1 (Now) — Fix critical gaps
1. Style `/approvals/[id]` detail page
2. Add content to `/settings` overview
3. Add `loading.tsx` to all shell route groups
4. Add page transition animations

### Sprint 2 — Enterprise polish
5. Implement cmd+k command palette
6. Add sortable column headers to tables
7. Add success animations on form submissions
8. Add breadcrumb navigation

### Sprint 3 — Delight
9. Add bulk actions to transactions
10. Add hover card previews
11. Add notification grouping
12. Add responsive improvements
