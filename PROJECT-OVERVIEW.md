# Perionyx — Enterprise Treasury Operating System

**Stack:** Next.js 16 (App Router), TypeScript, Prisma (Postgres), NextAuth.js, Tailwind CSS, Radix UI, Framer Motion, Lucide Icons

**Domain:** Multi-tenant treasury management platform — wallet management, double-entry ledger, transaction processing, approval workflows, policy engine, reconciliation, risk monitoring, audit trails, role-based access control.

---

## What We've Built — Complete Inventory

### Session 1: Foundation & UX Audit

- **UX Audit** — Comprehensive audit of all 56 route files and 80+ UI components across 12 modules (Dashboard, Transactions, Approvals, Policy Engine, Treasury, Ledger, Audit Logs, Notifications, Settings, Users, Risk, Reconciliation). Evaluated against 20 enterprise SaaS criteria. Produced priority matrix and 3-sprint plan.

### Session 2: Sprint 1 — Critical Gaps

| File | What |
|---|---|
| `src/app/(shell)/approvals/[id]/page.tsx` | Rewrote from 29 lines of unstyled HTML to full enterprise detail page: status badge header, metadata grid (requested time, required role, approver), transaction summary card, timeline card, rejection reason card, approve/reject action panel with emerald/red styling |
| `src/app/(shell)/approvals/ApproveButtons.tsx` | Styled approve/reject with per-button loading spinners, success/error banners, disabled state during action |
| `src/app/(shell)/settings/page.tsx` | Replaced empty placeholder with categorized card grid: Organization (Company Profile, Members, Approvers), Development (API Keys, Webhooks, Payment Rails), Preferences (Notifications). Each card shows icon, description, status badge |
| `src/app/(shell)/loading.tsx` | Skeleton page with shimmer placeholders for title, summary cards, filter bar, table rows — covers all 50+ shell routes via route group inheritance |
| `src/components/app-shell.tsx` | Wrapped children in `motion.div` for fade+slide-up page transitions (0.35s custom ease). Updated search bar with `⌘K` hint |
| `src/app/(shell)/transactions/page.tsx` | Added sortable column headers on all 6 columns with arrow indicators and memoized sort logic |

### Session 3: Enterprise Data Layer

**New directory:** `src/components/data-table/`

| File | What |
|---|---|
| `types.ts` | Type system: Column, SortDirection, Density, FilterDef, FilterValue, DataTableProps |
| `data-table.tsx` | Core table: sticky header, sort arrows with active indicator (emerald), checkbox row selection, expandable rows, density toggle (compact/comfortable), column visibility dropdown, context menu per row (Copy ID, custom items), built-in loading skeletons, empty state with action, pagination bar (page numbers, prev/next, item count), CSV export |
| `filter-builder.tsx` | Multi-filter builder: add/remove filters by field, operator selector (equals/contains/≥/≤/between/>, <), value input adapts to type (select/text/number/date), between operator shows second date input, active filters displayed as removable badges with clear-all |
| `inspector-panel.tsx` | Slide-over sheet (right side, `max-w-lg`, dark `#0c0c0c`, uses Radix Dialog primitives with custom animation). Section tabs at top, scrollable content. `InspectorRow` (label:value pairs), `InspectorSection` (grouped headings) |
| `column-visibility.tsx` | Dropdown per table showing column count, eye/eye-off icons per column, toggle to show/hide |
| `density-toggle.tsx` | Button to switch between compact (`py-1.5`) and comfortable (`py-2.5`) row heights with maximize/minimize icons |
| `context-menu.tsx` | Absolute-positioned right-click menu bound to row, dismisses on click-away or Escape |

**New directory:** `src/components/command-palette/`

| File | What |
|---|---|
| `command-palette.tsx` | Full `⌘K` dialog: global keyboard listener, 12 pages searchable by name and keywords, live transaction search via `/api/v1/admin/quick-search`, arrow-key navigation, keyboard shortcut hints in footer, Escape to close. Triggers from search bar click or `⌘K` |

**New primitives:**

| File | What |
|---|---|
| `src/components/ui/sheet.tsx` | Radix Dialog-based slide-over (right/left, animated, dark backdrop) |
| `src/components/ui/checkbox.tsx` | Custom checkbox with emerald active state |
| `src/components/ui/tabs.tsx` | Radix Tabs with dark theme styling |
| `src/hooks/use-debounce.ts` | Generic debounce hook |

**Upgraded pages:**

| Page | Before | After |
|---|---|---|
| **Transactions** | Manual table + 4 selects/dates + dialog for detail | DataTable (sort/select/export/density/column visibility) + FilterBuilder (6 filter types) + InspectorPanel (slide-over with summary) |
| **Ledger** | Manual table + 4 filters + dialog for detail | DataTable + FilterBuilder (4 filter types) + InspectorPanel (with ledger lines, metadata JSON, full transaction link) |
| **Audit Logs** | Manual table + 6 filters + debounced search + dialog for detail | DataTable + FilterBuilder (6 filter types) + InspectorPanel (full event: IP, user agent, payload hash, request ID, copy ID button). Debounced search integrated with FilterBuilder |

### Session 4: Workflow System

**New directory:** `src/components/workflow/`

| File | What |
|---|---|
| `types.ts` | Types for WorkflowStage, WorkflowEvent, WorkflowStatus, WorkflowData |
| `use-workflow-data.ts` | Hook that derives complete workflow state from existing APIs (transaction status + approval records + requirements). Computes: 6 stages (Created → Validated → Approvals → Treasury → Posted → Reconciled) with status per stage, 10+ event types, SLA timer (24h default), risk level (low/medium/high/critical), bottleneck detection (>12h pending). No new API calls needed |
| `workflow-diagram.tsx` | Horizontal pipeline with connected nodes. Each stage shows colored icon (check/clock/pulse/x/skip), label, description, current owner. Active stage has emerald glow and pulse animation. Escalated shows amber alert. Progress connector lines |
| `workflow-status-bar.tsx` | 4-grid info bar: Current Owner, Elapsed Time, SLA Remaining, Risk Level (color-coded badge). Bottleneck banner when pending >12h |
| `workflow-actions.tsx` | Action buttons with dialogs: Escalate (amber, calls API), Pause/Resume (disabled), Reassign (disabled), Delegate (disabled), Request Docs (dialog → thread API), Add Note (dialog → thread API). Shows 3 most recent notes |
| `workflow-timeline.tsx` | Vertical event timeline. Type-specific icons, labels, descriptions, actors, timestamps. Connected by vertical line, sorted chronologically |
| `workflow-panel.tsx` | Combines all above into a single enterprise panel with 3 tabs: Timeline, Actions, Discussion (embedded ApprovalThread). Handles API calls with optimistic local state |

**Integration:**

- **`transactions/[id]/page.tsx`** — Server component passes transaction + approval data to `TransactionWorkflowWrapper` client component → renders WorkflowPanel in right column. Old approval workflow card and timeline card replaced by comprehensive pipeline. Transaction summary, status badge, ledger postings, approval history remain preserved

---

## Architecture Rules

- **No backend modifications** — zero changes to Prisma schema, API routes, services, or business logic
- **No dependency additions** — everything built with existing libraries (Radix, Framer Motion, Lucide)
- **Server components stay server** — client boundaries created via thin wrapper components
- **Existing functionality preserved** — every original feature still works, only presentation/interaction layer enhanced

**Total: ~20 new files, 5 modified files, 0 database changes, 0 API changes, 0 dependency additions, clean production build.**
