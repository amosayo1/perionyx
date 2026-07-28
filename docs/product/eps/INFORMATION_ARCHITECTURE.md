---
title: "Information Architecture — AP Reference Workflow"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1
tags:
  - type/reference
  - domain/product
  - domain/ap
  - status/draft
owner: Product Architecture Board
authority: Product Constitution
supersedes: UX_INFORMATION_ARCHITECTURE.md
---

# Information Architecture — AP Reference Workflow

> **Classification**: Internal — Engineering & Product
> **Phase**: 27.1 — EPS Companion Documents
> **Design Language**: EDL v1.1 — `src/design-system/edl/`
> **Principles**: PRODUCT_PRINCIPLES.md (P1-P10)

---

## 1. Purpose

This document defines the **complete information architecture** for the AP Reference Workflow — every screen, every navigation path, every interaction pattern, and every accessibility requirement.

The previous UX Information Architecture (Phase 27.0A) defined 25 screens. This document supersedes it with a comprehensive specification that covers navigation, layout, every major screen, search, notifications, settings, accessibility, mobile, and keyboard navigation.

Every screen must answer the **5 questions** (P8 — Decision Readiness):

1. **What needs attention?** — urgency, SLA deadlines, exceptions
2. **Why?** — evidence, root cause, AI context
3. **What evidence exists?** — documents, match results, history
4. **What decision is required?** — approve, reject, investigate, pay
5. **What happens next?** — workflow progression, downstream effects

---

## 2. Navigation Model

### 2.1 Global Navigation — Sidebar

Collapsed sidebar (64px, icon-only). Expands to 240px on hover or pin. Dark surface (`#0a0a0f`) with text-primary (`#f7f6f2`). Gold accent (`#d4af37`) on active item. Minimum touch target: 44px (WCAG 2.5.5).

| Section | Icon | Badge | Persona Primary | Keyboard |
|---------|------|-------|-----------------|----------|
| Dashboard | LayoutDashboard | — | All | Cmd+1 |
| Work Queue | Inbox | Invoice count | AP Clerk, AP Manager | Cmd+2 |
| Exceptions | AlertTriangle | Exception count | AP Clerk, AP Manager | Cmd+3 |
| Payments | CreditCard | Pending batch count | Treasury Manager | Cmd+4 |
| Vendors | Building2 | Risk alerts | Procurement Manager | Cmd+5 |
| Reports | BarChart3 | — | Controller, CFO | Cmd+6 |
| Audit Trail | Shield | — | Auditor | Cmd+7 |
| Settings | Settings | — | AP Manager, Controller | Cmd+8 |

**Badge rules**:
- Work Queue badge: total unprocessed count, red if >50
- Exceptions badge: critical + high severity count, red if any critical
- Payments badge: pending approval count, yellow if any overdue
- Vendors badge: risk alert count, red if any blocked

**Pinning**: Sidebar can be pinned open (240px) or auto-collapse on blur. Pin state persists across sessions via localStorage.

### 2.2 Secondary Navigation — Tabs

Within each section, horizontal tabs provide sub-views. Gold underline (`#d4af37`) for active state. Arrow-key navigable.

| Section | Tabs |
|---------|------|
| Work Queue | All · Unmatched · Matched · Pending Approval · Aging (60d+) |
| Exceptions | All · Price Mismatch · Quantity Mismatch · Duplicate · Missing GRN · Validation Failed |
| Payments | Proposals · Pending Execution · Completed · Failed |
| Vendors | All · Active · Under Review · Blocked · High Risk |
| Reports | AP Aging · DPO Trend · Spend Analytics · Exception Trends · Approval Cycle Time |
| Audit Trail | All · Approvals · Exceptions · Payments · System |

### 2.3 Breadcrumbs

Full breadcrumb trail at the top of every detail view. Clickable at every level. Format:

```
AP / Work Queue / INV-2026-0042 — Acme Corp
```

Breadcrumb segments animate with `popLayout` spring (150ms, staggered 30ms per segment) per EDL motion system.

### 2.4 Command Palette — Cmd+K

Global command palette available on every screen. Modal, centered, 640px wide. Searches across invoices, vendors, payments, and actions.

**Search modes**:
- **Invoice lookup**: Type invoice number or vendor name — instant results
- **Quick actions**: "approve next", "create payment batch", "view exceptions"
- **Navigation**: Jump to any screen section
- **Bulk operations**: "select all unmatched", "export to CSV"

**Results format**: Entity type icon, name/number, amount, status badge, urgency indicator (SLA dot). Arrow keys to navigate, Enter to select, Esc to dismiss.

**Accessibility**: Focus trap within modal. `role="dialog"`, `aria-label="Command palette"`. Screen reader announces result count on open.

### 2.5 Keyboard Shortcut Overlay — Cmd+/

Available on every screen. Shows all active shortcuts for the current context. Dismissed with Esc.

---

## 3. Workspace Layout

### 3.1 Desktop Layout (≥1440px)

```
┌─────────────────────────────────────────────────────────┐
│  Topbar (64px) — Breadcrumbs | Search | Notifications   │
├──────┬──────────────────────────────────┬───────────────┤
│      │                                  │               │
│ Side │     Main Content Area            │  Right Panel  │
│ bar  │     (flex-1, min-width: 0)       │  (320px,      │
│(64px)│                                  │   collapsible)│
│      │                                  │               │
├──────┴──────────────────────────────────┴───────────────┤
│  Status Bar (32px) — Connection | Data Source | Version │
└─────────────────────────────────────────────────────────┘
```

**Left Sidebar** (64px collapsed / 240px expanded):
- Navigation items with icons and optional badges
- Collapse/expand toggle at bottom
- Pin toggle to keep expanded

**Main Content Area** (flex-1):
- Section header with title, action buttons, and tab bar
- Primary content (table, form, detail view)
- Scrollable independently of sidebar and right panel

**Right Context Panel** (320px, collapsible):
- Contextual information relevant to the selected item
- Invoice Detail: evidence tabs (Match, Vendor, History, Contract, AI, Audit)
- Approval View: evidence panel + decision panel
- Exception Queue: exception detail panel
- Collapsed by default on screens that do not need it
- Toggle with Cmd+] or panel toggle button

**Status Bar** (32px):
- Left: connection status dot (green/red/gray) + data source label
- Center: current filter/sort summary
- Right: platform version, last sync time

### 3.2 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Desktop | ≥1440px | Full split-panel, expanded sidebar, all KPIs |
| Laptop | 1024-1439px | Collapsible sidebar (icon-only), evidence panel overlay |
| Tablet | 768-1023px | Stacked panels, top nav replaces sidebar, 2-col KPIs |
| Mobile | <768px | Single column, bottom nav bar, card layout for tables |

---

## 4. Dashboard

**Purpose**: Operational overview. Answers P8 Question 1: "What do I do today?"
**Primary persona**: All (AP Clerk starts here; CFO checks here)
**Layout**: 4-column responsive grid. Top = KPI row. Middle = work queue summary + exception feed. Bottom = aging snapshot + AI insights.

### 4.1 Attention Queue (Top, Full Width)

**Purpose**: Immediately answers P8 Q1 — "What needs attention?"

Sorted by: SLA deadline (ascending) → financial impact (descending) → exception count (descending) per P5.

Shows top 5 items. Each row: urgency icon, type (invoice/exception/payment), description, amount, SLA countdown, action button. "View All →" navigates to the relevant queue.

### 4.2 Key Metrics Row (Below Attention Queue)

| Card | Value | Subtitle | Accent | Click Target |
|------|-------|----------|--------|--------------|
| Invoices Today | Count | vs. 7-day avg | Gold if above avg | Work Queue |
| Pending Approval | Count | Total $ value | Red if > $50K pending | Work Queue → Pending Approval tab |
| Open Exceptions | Count | Critical count | Red if any critical | Exceptions |
| DPO | Number | Trend arrow + days | Green if improving | Reports → DPO Trend |

Each KPI is an `AnimatedMetric` with counter animation (600ms cubic ease-out). Updated timestamp shown below value (P1 — Trusted Information).

### 4.3 Exception Feed (Middle Right)

Live feed of new exceptions. Each entry: exception type icon, vendor name, amount, severity badge (LOW/MEDIUM/HIGH/CRITICAL), time since creation. Click navigates to exception detail. Maximum 8 items with scroll for more.

### 4.4 Aging Snapshot (Bottom Left)

Horizontal stacked bar: Current | 1-30 | 31-60 | 61-90 | 90+ days. Each segment labelled with count and $ total. Click segment filters Work Queue by that aging bucket. Colour-coded: green (Current, 1-30), yellow (31-60), orange (61-90), red (90+).

### 4.5 AI Insights Panel (Bottom Right)

Compact panel with 3-4 AI-generated observations. Each insight: text description, confidence badge (High/Medium), link to relevant screen. Examples:

- "12 invoices from Acme Corp are overdue — average payment is 45 days"
- "3 invoices flagged as potential duplicates — review recommended"
- "Cash position supports $180K in payments this week"

AI insights are labelled as "AI-generated" with a small badge. Confidence score visible. Override rate tracked (P3 — Preserve Human Judgement).

### 4.6 Dashboard Data Freshness

Bottom of dashboard: "Data as of: 2 minutes ago · Source: Prisma · Cache: 30s TTL". Stale data indicator: "Data may be up to 5 minutes old" (P1).

---

## 5. Invoice Queue (Work Queue)

**Purpose**: Central inbox for all invoices requiring action. The primary workspace for AP Clerks.
**Primary persona**: AP Clerk, AP Manager
**Layout**: Full-width data table with left filter sidebar (200px, collapsible).

### 5.1 Filters (Left Sidebar)

| Filter Group | Options | Multi-Select |
|-------------|---------|--------------|
| Status | Captured, Matched, Exception, Pending Approval, Paid | Yes |
| Amount | < $1K, $1K-$10K, $10K-$50K, $50K+, Custom range | Yes |
| Age | Today, 1-7 days, 8-30 days, 30-60 days, 60+ days | Yes |
| Vendor | Searchable multi-select (type-ahead) | Yes |
| AI Confidence | High (>80%), Medium (50-80%), Low (<50%) | Yes |
| Currency | All currencies (from Supported Currencies list) | Yes |

Active filters shown as removable chips above the table. Filter state persists across navigation within the session. "Clear all" button resets all filters.

### 5.2 Table Columns

| Column | Width | Content | Sortable | P1 Compliance |
|--------|-------|---------|----------|---------------|
| Status | 48px | Colour dot (green/yellow/red/grey) | No | — |
| Invoice # | 120px | INV-2026-XXXX link | Yes | — |
| Vendor | 200px | Vendor name + icon | Yes | — |
| Amount | 120px | Formatted currency, right-aligned | Yes | Original + functional currency shown |
| PO # | 100px | PO reference (grey if unmatched) | No | — |
| Status Label | 100px | Badge: Captured / Matched / Exception / Pending Approval | Yes | — |
| Days | 80px | Days since receipt | Yes | — |
| SLA | 80px | Countdown: green (>2d) / yellow (1-2d) / red (<1d) | Yes | — |
| Data Freshness | 60px | Dot: green (<1h), yellow (1-24h), red (>24h) | No | P1 — Trusted Info |
| AI Confidence | 80px | Percentage with confidence ring | No | — |
| Actions | 80px | Resolve / Override / View buttons | No | — |

### 5.3 Sort Behaviour

Multi-column sort supported (primary + secondary + tertiary). Priority labels shown above column headers. Sort state persists in URL query params for shareability.

Default sort: SLA deadline (ascending) → Amount (descending) per P5 (Exceptions First).

### 5.4 Bulk Operations

Select multiple rows via checkboxes. Bulk action bar appears at bottom (64px height, dark surface): Approve Selected, Export CSV, Export Excel, Assign To, Change Status. Shows: selected count, total value of selection.

Keyboard: Shift+click for range select, Cmd+A for all visible, Cmd+D for deselect.

### 5.5 Pagination

25 rows per page. Page size selector: 25 / 50 / 100 / 200. Ellipsis-style page buttons. "Showing 1-25 of 342 invoices" summary. Page state in URL query params.

---

## 6. Invoice Detail

**Purpose**: Single-screen comprehensive view of one invoice with all evidence needed for decision-making. This is the core working screen.
**Primary persona**: AP Clerk, Approver
**Layout**: Split panel — left (55%) = invoice document + line items; right (45%) = evidence tabs. Action bar fixed at bottom (64px).

### 6.1 Left Panel — Invoice Document

**Header**: Invoice number, vendor name, date received, status badge, workflow stage indicator (10-dot progress bar).

**Document Viewer**: Embedded PDF/image viewer with zoom, pan, annotate. OCR-extracted fields highlighted with confidence indicators. Alt text on document image for screen readers.

**Line Items Table**:

| Column | Content | Accessibility |
|--------|---------|---------------|
| Item | Item description | scope="row" |
| Qty | Quantity | aria-label="Quantity: 5" |
| Unit Price | Unit price (original currency) | aria-label="Unit price: $24.00 USD" |
| Total | Line total (original currency) | aria-label="Line total: $120.00 USD" |
| Match Status | Green/yellow/red dot | aria-label="Match status: matched" or "Match status: variance $5.00" |
| Variance | Variance amount and % | Screen reader announces: "Price variance: $5.00 (2.1%)" |

**Totals**: Subtotal, Tax, Shipping, Total — each cross-referenced with PO totals inline. Functional currency equivalent shown below each total (P10 — Multi-Currency).

### 6.2 Right Panel — Evidence Tabs

| Tab | Shortcut | Content |
|-----|----------|---------|
| Match | Cmd+1 | Three-way comparison: Invoice vs PO vs GRN, line-by-line variance, overall match status, tolerance applied |
| Vendor | Cmd+2 | Vendor profile: name, risk score ring, payment history summary, avg days-to-pay, dispute rate |
| History | Cmd+3 | Prior invoices from this vendor (last 12 months), price trend chart, match rate |
| Contract | Cmd+4 | Active contract terms: payment terms, discount %, pricing schedule, expiry date |
| AI Package | Cmd+5 | Risk score (0-100 ring), recommendation text, confidence %, evidence summary, comparable invoices, cash flow impact |
| Audit | Cmd+6 | Full audit trail: timestamps, actors, state transitions, checksums, evidence hash |

**Tab accessibility**: Tabs are keyboard-navigable with arrow keys. Active tab has gold underline. `role="tablist"`, `role="tab"`, `role="tabpanel"`. `aria-selected` on active tab.

### 6.3 Action Bar (Bottom, Fixed)

| Action | Shortcut | Style | Condition |
|--------|----------|-------|-----------|
| Approve | Cmd+Enter | Gold (primary) | Disabled if insufficient authority or data stale |
| Reject | — | Red (secondary) | Requires reason field |
| Request Info | — | Grey (tertiary) | Opens comment field |
| Escalate | — | Grey (tertiary) | Opens escalation target selector |
| Add Note | — | Grey (tertiary) | Opens inline note field |
| Assign To | — | Grey (tertiary) | Opens user selector |
| View Full Vendor | — | Link | Navigates to vendor profile |

**Status line** within action bar: "Current approval level: AP Manager · Next approver: Controller" with approval chain visualization.

---

## 7. Approval View

**Purpose**: Dedicated view for approvers to review and decide on pending approvals. Optimised for fast, evidence-based decisions.
**Primary persona**: Controller, CFO, AP Manager (approver roles)
**Layout**: Two-panel — left (60%) = evidence panel; right (40%) = decision panel. Full-screen mode available.

### 7.1 Evidence Panel (Left)

**Invoice Summary**: Invoice number, vendor, amount (original + functional currency), date, AP Clerk who prepared it.

**Match Evidence**: Three-way comparison table with variance highlights. Red for mismatches, green for matches. Tolerance rules applied shown inline.

**Supporting Documents**: Invoice image/PDF inline viewer. PO document link. GRN document link. All viewable inline — no download required (P6 — Evidence Before Approval).

**AI Risk Assessment**: Risk score ring (0-100), recommendation text, confidence %, evidence chain. Labelled as "AI recommendation" with badge (P3 — Preserve Human Judgement).

**Vendor Context**: Risk score, payment history summary, dispute rate, spend trend (last 12 months).

**Policy Compliance**: Checklist of policy rules evaluated. Green checkmark or red flag per rule. Explanation for any violation.

### 7.2 Decision Panel (Right)

**Decision Form**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Decision | Radio: Approve / Reject / Request Info / Escalate | Yes | — |
| Reason | Text area | Conditional (required for Reject, optional for Approve) | Min 10 characters for Reject |
| Authority | Display only | — | Shows approver's authority level and threshold |
| Amount within authority | Display only | — | Green check or red flag |

**Approve button**: Gold, Cmd+Enter. Disabled until:
1. Evidence panel has been scrolled/acknowledged (minimum 3 seconds visible)
2. Decision is set to "Approve"
3. Reason is provided (if override)

**Reject button**: Red. Requires reason (minimum 10 characters). Confirmation dialog: "Rejecting this invoice will return it to the AP Clerk with your reason. Continue?"

**Escalation**: Opens target selector showing next-level approvers. Escalation reason required.

### 7.3 Approval Chain Visualization

Horizontal progress bar showing: Prepared (AP Clerk) → Under Review (current) → Approved (next) → Completed. Each step shows actor name, timestamp (if completed), and status icon.

### 7.4 Audit Capture

On decision, the system captures:
- Approver identity and role
- Timestamp (UTC)
- Evidence hash (SHA-256 of evidence panel state at decision time)
- Decision (approve/reject/escalate)
- Reason text
- Authority level validated against

---

## 8. Exception Queue

**Purpose**: Dedicated view for invoices that failed three-way match or have other anomalies. Every exception has a clear resolution path.
**Primary persona**: AP Clerk, AP Manager
**Layout**: Split — left (60%) = exception list; right (40%) = exception detail panel (opens on click, dismissible with Esc).

### 8.1 Exception List

**Grouping** (default): By root cause type. Toggle to: by vendor, by age, by amount.

**Columns**:

| Column | Content |
|--------|---------|
| Severity | Colour badge: LOW (grey), MEDIUM (yellow), HIGH (orange), CRITICAL (red) |
| Type | Exception type icon + label |
| Invoice # | Link to invoice detail |
| Vendor | Vendor name |
| Amount | Variance amount (original + functional currency) |
| Age | Days since exception raised |
| SLA | Countdown indicator |
| Root Cause | AI-generated root cause summary (1 line) |
| Actions | Resolve / Escalate / View |

### 8.2 Exception Detail Panel (Right)

**Header**: Exception type, severity badge, days open, SLA countdown. Close button (X) or Esc to dismiss.

**Invoice Summary**: Invoice number, vendor, amount, date, current status.

**Evidence**: Side-by-side comparison: Invoice data vs PO data vs GRN data. Variance highlighted in red. Variance percentage shown.

**AI Root Cause**: Generated analysis explaining the discrepancy. Example:
> "PO-4521 shows $12,400. Invoice shows $12,650. Price increased 2% since PO was created on 2026-06-15. This vendor's prices have fluctuated 1-3% monthly. Historical resolution: 80% adjusted PO, 15% accepted variance, 5% disputed with vendor."

**Suggested Resolution**: Based on similar historical exceptions. Shows: suggested action, confidence %, historical success rate.

**Resolution Actions**:

| Action | Description | Requires |
|--------|-------------|----------|
| Adjust PO | Update PO to match invoice | Reason, authority check |
| Accept Variance | Approve with noted variance | Reason (mandatory), authority check |
| Dispute with Vendor | Mark for vendor follow-up | Note with specific claim |
| Void Invoice | Reject and void | Confirmation dialog, reason |
| Escalate | Send to AP Manager/Controller | Escalation reason |

### 8.3 Exception Analytics (Bottom of List)

Summary bar: Total open exceptions, avg resolution time, exceptions resolved this week, SLA compliance rate. Links to Reports → Exception Trends.

---

## 9. Payment View

**Purpose**: Manage payment batches from proposal through execution to confirmation.
**Primary persona**: Treasury Manager
**Layout**: Two sub-views via tabs — Proposals and Completed Payments.

### 9.1 Proposals Tab

**Table columns**: Batch ID, invoice count, total amount (functional currency), payment method, proposed date, status (Draft / Pending Approval / Approved / Executing), SLA.

**Batch Detail** (click row): Full batch view with:

- **Batch header**: ID, total, method, proposed date, bank account (masked: ****1234), status
- **Invoice list**: Vendor, invoice #, amount, due date, early-pay discount if applicable
- **Cash impact panel**: Current balance → after-payment balance → forecast line (next 30 days)
- **Approval chain**: Current approver, next approver, completion status
- **Action bar**: Execute Payment (Cmd+Enter, gold), Hold, Split Batch, Reject

### 9.2 Cash Impact Visualization

Line chart showing: current cash position, projected outflows (this batch highlighted), projected inflows, minimum cash threshold line. Time range: 30 days forward. Shows whether executing this batch would breach the minimum cash threshold.

### 9.3 Completed Tab

**Table columns**: Batch ID, execution date, total, method, bank reference, processing status (Processing / Completed / Failed), GL entries posted.

**Payment Confirmation** (click row): Bank reference number, processing time, GL journal entry reference, vendor notification status (sent/failed), reconciliation status.

### 9.4 Payment Safety

- Dual-signature required for batches > $50K (configurable threshold)
- Cash position check before execution — prevents payments that would breach minimum balance
- Idempotency key on every payment execution — prevents duplicate payments
- Rollback window: 5 minutes after execution for cancellation (configurable)

---

## 10. Vendor Profile

**Purpose**: Comprehensive vendor profile for assessing reliability, payment patterns, and risk.
**Primary persona**: Procurement Manager, AP Manager
**Layout**: Header with vendor summary + 4-column metric row + tabbed content.

### 10.1 Vendor Header

Company name, logo, tax ID, primary contact. Status badge: Active / Inactive / Blocked / Under Review. Risk score ring (0-100): green (<30), yellow (30-70), red (>70).

### 10.2 Metric Row

| Metric | Value | Trend |
|--------|-------|-------|
| Total Spend (12mo) | $XXX,XXX | vs. prior 12mo |
| Avg Days-to-Pay | XX days | vs. terms |
| Invoice Count (12mo) | XXX | — |
| Dispute Rate | X.X% | vs. 6mo avg |

### 10.3 Tabbed Content

- **Open Invoices**: Table of unpaid invoices (amount, due date, status, aging bucket)
- **Payment History**: Table of all payments (date, amount, method, reference) with trend chart
- **Spend Trend**: Monthly spend chart with 12-month history
- **Contracts**: Active and expired contracts with terms
- **Risk Assessment**: AI risk breakdown — reliability, pricing consistency, delivery accuracy, dispute frequency
- **Audit**: Full vendor audit trail

---

## 11. Reports

**Purpose**: Financial analytics and operational metrics for Controller, CFO, and AP Manager.
**Layout**: Report selector on left, report content on right. Export options in top-right.

### 11.1 AP Aging Report

Horizontal stacked bar: Current | 1-30 | 31-60 | 61-90 | 90+. Drill-down table: vendor, invoice count, total per aging bucket. Export: CSV, Excel, PDF. Filter by: vendor, amount range, currency.

### 11.2 DPO Trend

Line chart: DPO over last 12 months with target line. KPIs: current DPO, trend direction, benchmark comparison. Drill-down: click data point to see invoices contributing to that period's DPO.

### 11.3 Spend Analytics

Bar chart: monthly spend by vendor category. Pie chart: spend distribution by top 10 vendors. Table: vendor, spend amount, % of total, YoY change. Filter by: date range, vendor, category, currency.

### 11.4 Exception Trends

Line chart: exception count by type over last 30 days. Table: exception type, count, avg resolution time, recurrence rate. Drill-down: click exception type to see individual exceptions.

### 11.5 Approval Cycle Time

Histogram: time from approval request to decision. Table: approver, avg time, median time, SLA compliance rate. Filter by: approver, amount range, time period.

---

## 12. Search

### 12.1 Global Search — Cmd+K

Available on every screen. Modal, centered, 640px wide. Type-ahead search across:

- Invoices (number, vendor name, amount)
- Vendors (name, tax ID)
- Payments (batch ID, bank reference)
- Exceptions (type, vendor)

**Result format**: Entity type icon, name/number, amount, status badge, urgency indicator. Keyboard: arrow keys, Enter to select, Esc to dismiss.

### 12.2 Scoped Search

Within each section, a search bar filters the current view. Cmd+F opens scoped search. Results are filtered in-place — no navigation.

### 12.3 Search Filters

Advanced filters available via Cmd+K → filter icon:

| Filter | Type | Scope |
|--------|------|-------|
| Entity type | Checkbox | Invoice, Vendor, Payment, Exception |
| Date range | Date picker | Created, Updated, Due |
| Amount range | Min/Max | Invoice amount |
| Status | Checkbox | All status options per entity |
| Currency | Dropdown | All supported currencies |

---

## 13. Notifications

### 13.1 Real-Time Notifications

In-app notification centre (bell icon in topbar). Badge shows unread count. Click opens notification panel (slide-in from right, 400px).

**Notification types**:

| Type | Trigger | Priority | Channel |
|------|---------|----------|---------|
| Invoice received | New invoice captured | Normal | In-app |
| Match exception | Three-way match failed | High | In-app + Email |
| Approval required | Invoice routed for approval | High | In-app + Email + Slack |
| Approval decision | Approver decided | Normal | In-app |
| Payment completed | Batch executed | Normal | In-app |
| Payment failed | Batch execution failed | Critical | In-app + Email + Slack |
| SLA warning | Approaching SLA deadline | High | In-app |
| SLA breached | SLA deadline passed | Critical | In-app + Email |

### 13.2 Notification Preferences

Per-role notification settings. Configurable in Settings → Notifications. Toggle per event type, per channel (in-app, email, Slack).

### 13.3 Digest

Daily digest email (configurable time): summary of open items, exceptions, pending approvals. Sent to each role's configured email.

---

## 14. Settings

**Purpose**: Configure AP workflow behaviour. Restricted to AP Manager and Controller roles.

### 14.1 Approval Matrix

Visual table: amount thresholds × roles, showing required approval levels. Edit mode: drag thresholds, assign roles, set delegation rules. Preview: "This matrix would route $25K invoice to: AP Manager → Controller." Audit log of all matrix changes.

### 14.2 Tolerance Thresholds

Table of tolerance rules: vendor, category, price %, quantity %, absolute $ threshold. Create/edit modal with preview: "This rule would have resolved 14 exceptions in the last 30 days." Rules are versioned — old rules archived, not deleted.

### 14.3 Payment Rules

Payment method preferences per vendor. Early-pay discount threshold. Minimum/maximum payment amounts. Dual-signature threshold. Payment schedule preferences (weekly, bi-weekly, monthly).

### 14.4 User Preferences

| Setting | Options | Default |
|---------|---------|---------|
| Table density | Compact / Comfortable | Comfortable |
| Default sort | SLA / Amount / Date | SLA |
| Notification email | On / Off | On |
| AI recommendations | Always / High confidence only / Never | Always |
| Currency display | Original / Functional / Both | Both |
| Date format | DD/MM/YYYY / MM/DD/YYYY / YYYY-MM-DD | DD/MM/YYYY |

---

## 15. Accessibility (WCAG 2.1 AA)

### 15.1 Keyboard Navigation

| Shortcut | Action | Available On |
|----------|--------|--------------|
| Cmd+K | Command palette | All screens |
| Cmd+/ | Keyboard shortcuts help | All screens |
| Cmd+1-8 | Sidebar navigation | All screens |
| Cmd+Enter | Approve/confirm | Invoice View, Payment Batch |
| Cmd+E | Export current view | All list views |
| Cmd+F | Open search/filter | All list views |
| Cmd+] | Toggle right panel | Detail views |
| Cmd+1-6 | Switch evidence tabs | Invoice Detail |
| Cmd+←/→ | Previous/next item | Detail views |
| Esc | Dismiss modal/panel | All screens |
| Tab/Shift+Tab | Move focus | All screens |
| Arrow keys | Navigate within groups | Tabs, menus, lists |

### 15.2 Focus Management

- Visible focus ring on all interactive elements: gold (`#d4af37`), 2px offset, 2px width
- Focus trap in modals (Cmd+K, Confirm Dialog): Tab cycles within modal until Esc
- Focus restoration: after closing a modal, focus returns to the element that opened it
- Skip navigation: "Skip to main content" link (WCAG 2.4.1), visible on focus

### 15.3 Screen Reader Support

| Element | ARIA |
|---------|------|
| Sidebar | `role="navigation"`, `aria-label="Main navigation"` |
| Topbar | `role="banner"`, `aria-label="Top bar"` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Tables | Semantic `<table>`, `<thead>`, `<th scope="col">`, `aria-sort` on sortable columns |
| Modals | `role="dialog"`, `aria-modal="true"`, `aria-label` |
| Status badges | `aria-label="Status: Matched"` or `aria-label="Severity: Critical"` |
| KPI values | `aria-label="Pending approvals: 23 invoices, $182,400"` |
| SLA countdown | `aria-live="polite"` on countdown updates |
| Notifications | `aria-live="polite"` on notification count badge |

### 15.4 Colour and Contrast

- All text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- Status information is never conveyed by colour alone — always accompanied by text label or icon
- SLA indicators use colour + text: "2d" (green), "1d" (yellow), "<1d" (red)
- Focus rings use gold (`#d4af37`) on dark surfaces — contrast ratio > 7:1

### 15.5 Reduced Motion

All animations respect `prefers-reduced-motion: reduce`:
- Counter animations disabled (value appears instantly)
- Stagger animations disabled (rows appear simultaneously)
- Slide animations disabled (panels appear/disappear without transition)
- Skeleton shimmer disabled (static placeholders)

---

## 16. Mobile Considerations

### 16.1 Mobile Layout (<768px)

- Single-column layout throughout
- Bottom navigation bar: Dashboard, Work Queue, Exceptions, Payments, More
- KPI cards: single-column scrollable list
- Tables: card layout (each row becomes a card)
- Action bar: full-width buttons, stacked vertically
- Swipe actions: right to approve, left to reject (with confirmation)

### 16.2 Tablet Layout (768-1023px)

- Stacked panels: invoice document above, evidence below
- Top navigation dropdown replaces sidebar
- KPI cards: 2-column grid
- Tables: horizontal scroll, sticky first 2 columns
- Touch targets: minimum 44px (WCAG 2.5.5)

### 16.3 Mobile-Specific Features

- Quick action bar: approve/review/search/create/scan/notifications/recent
- Offline indicator: sticky banner when connection lost, retry button
- Connection status: inline dot indicator (green/red/gray)
- Push notifications for critical items (when supported)

---

## 17. Data Freshness and Staleness

Per P1 (Trusted Information Before Transactions), every data element has a freshness indicator:

| Freshness | Indicator | Action Required |
|-----------|-----------|-----------------|
| Fresh (<1h) | Green dot | None |
| Recent (1-24h) | Yellow dot | None (but visible) |
| Stale (>24h) | Red dot | Refresh recommended |
| Critical (>7d) | Red dot + warning | Refresh required before action |

**Approval blocking**: Approve button is disabled when match data is stale (>24h). User must refresh to re-run match before approving.

**Dashboard staleness**: Dashboard shows "Data as of: X" with refresh button. Auto-refresh every 5 minutes (configurable).

---

## 18. Error States

| Error Type | Display | Recovery |
|------------|---------|----------|
| Network error | Offline banner with retry button | Auto-retry on reconnect |
| API error | Toast notification with error message | Retry action in toast |
| Validation error | Inline field error with explanation | Fix field and resubmit |
| Permission error | Toast: "You don't have permission" | Contact AP Manager |
| Data not found | Empty state with explanation + link | Navigate to queue |
| Session expired | Redirect to login | Re-authenticate |

All error states preserve navigation context — the user can retry without losing their place.

---

## 19. Screen Inventory

| # | Screen | Purpose | Primary Action | Persona |
|---|--------|---------|----------------|---------|
| 1 | AP Dashboard | Operational overview | Jump to urgent items | All |
| 2 | Work Queue | Invoice inbox | Process invoices | AP Clerk |
| 3 | Invoice Detail | Complete invoice | Approve/reject | AP Clerk, Approver |
| 4 | Exception Queue | Anomaly resolution | Resolve exceptions | AP Clerk, AP Manager |
| 5 | Exception Detail | Single exception | Resolve/escalate | AP Clerk, AP Manager |
| 6 | Approval View | Evidence-based decision | Approve/reject with evidence | Approver |
| 7 | Payment Proposals | Batch management | Approve batch | Treasury Manager |
| 8 | Payment Batch Detail | Batch review | Execute payment | Treasury Manager |
| 9 | Payment History | Completed payments | View confirmation | Treasury Manager |
| 10 | Vendor Profile | Vendor overview | Assess risk | Procurement Manager |
| 11 | Vendor List | All vendors | Search/filter | Procurement Manager |
| 12 | AP Aging Report | Liability snapshot | Drill-down | Controller, CFO |
| 13 | DPO Trend | Payment efficiency | Analyse trend | CFO |
| 14 | Spend Analytics | Vendor spend | Identify patterns | CFO, Controller |
| 15 | Exception Trends | Exception patterns | Identify systemic issues | AP Manager, Controller |
| 16 | Approval Cycle Time | Approver efficiency | Optimise bottlenecks | AP Manager, CFO |
| 17 | Tolerance Rules | Match configuration | Edit tolerances | AP Manager |
| 18 | Approval Matrix | Approval configuration | Edit thresholds | AP Manager, Controller |
| 19 | Payment Rules | Payment configuration | Edit rules | AP Manager, Treasury |
| 20 | Notification Settings | Alert configuration | Toggle preferences | AP Manager |
| 21 | AI Settings | AI behaviour | Adjust thresholds | AP Manager |
| 22 | User Preferences | Personal settings | Configure display | All |
| 23 | Audit Trail | Compliance record | Search/export | Auditor |
| 24 | Search (Cmd+K) | Global search | Find entity | All |
| 25 | Keyboard Shortcuts | Help overlay | Learn shortcuts | All |

---

## 20. Document Metadata

| Field | Value |
|-------|-------|
| Document ID | IA_AP_v2.0 |
| Phase | 27.1 |
| Authority | Product Architecture Board |
| Supersedes | UX_INFORMATION_ARCHITECTURE.md (Phase 27.0A) |
| Design Language | EDL v1.1 — `src/design-system/edl/` |
| Principles | PRODUCT_PRINCIPLES.md (P1-P10) |
| Screens | 25 (14 list/dashboard, 8 detail, 3 configuration) |
| Personas Served | 9 (AP Clerk, AP Manager, Controller, Treasury Manager, Procurement Manager, CFO, Approver, Auditor, Vendor) |
| Workflow Stages Covered | 10 (Invoice Received → Audit Completion) |
| Accessibility Standard | WCAG 2.1 AA |
| Responsive Breakpoints | 4 (Desktop ≥1440, Laptop 1024-1439, Tablet 768-1023, Mobile <768) |
| Status | Draft |
| Next Review | Phase 27.0B |
