# UX Information Architecture — AP Reference Workflow

> Phase 27.0A — Enterprise Product Architecture & Workflow Design
> Version: 1.0 | Date: 2026-07-28
> Authority: Product Architecture Board
> Classification: Internal — Engineering & Product

---

## 1. Purpose

This document defines **how information is organised** across the AP workflow so that every user — AP Clerk, Controller, Treasury Manager, CFO — finds what they need in **2 clicks or fewer**. It is the navigational constitution for all AP screens: what exists, what is on each screen first, how users move between screens, and what every pixel communicates.

Every screen in the AP workflow answers three questions simultaneously:

1. **What needs attention right now?** — urgency, SLA deadlines, exceptions
2. **Why does it need attention?** — evidence, AI context, root cause
3. **What decision is required?** — approve, reject, investigate, pay

The design language follows Bloomberg Terminal density with Stripe Dashboard restraint: dark-first (#0a0a0f), gold accent (#d4af37), generous whitespace, and zero decoration that does not serve a decision.

---

## 2. Navigation Model

### 2.1 Primary Navigation — Sidebar

Collapsed sidebar (64px) with icon-only. Expands to 240px on hover or pin. Dark surface (#0a0a0f) with text-primary (#f7f6f2). Gold accent on active item.

| Section | Icon | Badge | Persona Primary |
|---------|------|-------|-----------------|
| Dashboard | LayoutDashboard | — | All |
| Work Queue | Inbox | Invoice count | AP Clerk, AP Manager |
| Exceptions | AlertTriangle | Exception count | AP Clerk, AP Manager |
| Payments | CreditCard | Pending batch count | Treasury Manager |
| Vendors | Building2 | Risk alerts | Procurement Manager |
| Reports | BarChart3 | — | Controller, CFO |
| Audit Trail | Shield | — | Auditor |
| Settings | Settings | — | AP Manager, Controller |

### 2.2 Secondary Navigation — Tabs

Within each section, horizontal tabs provide sub-views. Tabs sit below the section header, using gold underline (#d4af37) for active state. Tabs are keyboard-navigable with arrow keys.

**Work Queue tabs**: All | Unmatched | Matched | Pending Approval | Aging (60d+)

**Exceptions tabs**: All | Price Mismatch | Quantity Mismatch | Duplicate | Missing GRN | Validation Failed

**Payments tabs**: Proposals | Pending Execution | Completed | Failed

**Reports tabs**: AP Aging | DPO Trend | Spend Analytics | Exception Trends | Approval Cycle Time

### 2.3 Breadcrumbs

Full breadcrumb trail at the top of every detail view. Clickable at every level. Format:

`AP / Work Queue / INV-2026-0042 — Acme Corp`

### 2.4 Command Palette — Cmd+K

Global command palette available on every screen. Searches across invoices, vendors, payments, and actions. Supports:

- **Invoice lookup**: Type invoice number or vendor name
- **Quick actions**: "approve next", "create payment batch", "view exceptions"
- **Navigation**: Jump to any screen section
- **Bulk operations**: "select all unmatched", "export to CSV"

Results show: entity type, amount, status, urgency indicator (SLA dot). Keyboard: arrow keys to navigate, Enter to select, Esc to dismiss.

---

## 3. AP Dashboard

**Purpose**: At-a-glance operational status for the start of every work session. Answers: "What do I need to do today?"

**Layout**: 4-column responsive grid. Top row = 4 KPI cards. Middle row = work queue summary + exception feed. Bottom row = aging snapshot + AI insights panel.

### 3.1 KPI Row (Top)

| Card | Value | Subtitle | Accent |
|------|-------|----------|--------|
| Invoices Today | Count | vs. 7-day avg | Gold if above avg |
| Pending Approval | Count | Total $ value | Red if > $50K pending |
| Open Exceptions | Count | Critical count | Red if any critical |
| DPO | Number | Trend arrow + days | Green if improving |

Each KPI is an `AnimatedMetric` with counter animation (600ms). Click any card to jump to the relevant queue.

### 3.2 Work Queue Summary (Middle Left)

Shows the 5 most urgent invoices from the work queue. Each row: vendor name, invoice amount, status badge (coloured), days outstanding (grey), SLA indicator (green/yellow/red dot). "View All →" link navigates to full Work Queue.

### 3.3 Exception Feed (Middle Right)

Live feed of new exceptions. Each entry: exception type icon, vendor, amount, severity badge, time since creation. Click to navigate to exception detail. Shows max 8 items with scroll for more.

### 3.4 Aging Snapshot (Bottom Left)

Horizontal stacked bar showing invoice distribution: Current | 1-30 | 31-60 | 61-90 | 90+. Each segment labelled with count and $ total. Click segment to filter Work Queue by that aging bucket.

### 3.5 AI Insights Panel (Bottom Right)

Compact panel with 3-4 AI-generated observations:

- "12 invoices from Acme Corp are overdue — average payment is 45 days"
- "3 invoices flagged as potential duplicates — review recommended"
- "Cash position supports $180K in payments this week"

Each insight links to the relevant screen. Confidence badge (High/Medium) shown per insight.

---

## 4. Work Queue

**Purpose**: Central inbox for all invoices requiring action. Sorted by urgency (SLA deadline approaching), then by amount (highest first).

**Layout**: Full-width data table. 25 rows per page. Density toggle (compact/comfortable).

### 4.1 Table Columns

| Column | Width | Content | Sortable |
|--------|-------|---------|----------|
| Status | 48px | Colour dot (green/yellow/red/grey) | No |
| Invoice # | 120px | INV-2026-XXXX link | Yes |
| Vendor | 200px | Vendor name + logo/icon | Yes |
| Amount | 120px | Formatted currency, right-aligned | Yes |
| PO # | 100px | PO reference (grey if unmatched) | No |
| Status Label | 100px | Badge: Captured / Matched / Exception / Pending Approval | Yes |
| Days | 80px | Days since receipt | Yes |
| SLA | 80px | Countdown with colour: green (>2d) / yellow (1-2d) / red (<1d) | Yes |
| AI Confidence | 80px | Percentage with small confidence ring | No |
| Actions | 80px | Resolve / Override / View buttons | No |

### 4.2 Filtering

Left sidebar (200px) with filter groups:

- **Status**: Captured, Matched, Exception, Pending Approval, Paid
- **Amount**: < $1K, $1K-$10K, $10K-$50K, $50K+, Custom range
- **Age**: Today, 1-7 days, 8-30 days, 30-60 days, 60+ days
- **Vendor**: Searchable multi-select
- **AI Confidence**: High (>80%), Medium (50-80%), Low (<50%)

Active filters shown as removable chips above the table. Filter state persists across navigation within the session.

### 4.3 Bulk Operations

Select multiple rows via checkboxes. Bulk action bar appears at bottom: Approve Selected, Export CSV, Assign To, Change Status. Keyboard: Shift+click for range select, Cmd+A for all visible.

---

## 5. Exception Queue

**Purpose**: Dedicated view for invoices that failed three-way match or have other anomalies. Every exception has a clear resolution path.

**Layout**: Split — left is exception list (60%), right is exception detail panel (40%). Panel opens on click, dismissible with Esc.

### 5.1 Exception Categories

| Category | Icon | Severity Range | Typical Resolution |
|----------|------|----------------|-------------------|
| Price Mismatch | DollarSign | MEDIUM-HIGH | Adjust PO, accept variance, or dispute with vendor |
| Quantity Mismatch | Hash | MEDIUM | Confirm GRN, adjust PO, or split delivery |
| Duplicate | Copy | CRITICAL | Void duplicate, keep original |
| Missing GRN | Package | MEDIUM | Request warehouse confirmation |
| Validation Failed | AlertCircle | LOW-MEDIUM | Correct data entry |

### 5.2 Exception Detail Panel

Right panel shows for selected exception:

- **Header**: Exception type, severity badge, days open, SLA countdown
- **Invoice Summary**: Invoice number, vendor, amount, date
- **Evidence**: PO amount, GRN amount, variance ($) and variance (%)
- **AI Root Cause**: "PO-4521 shows $12,400. Invoice shows $12,650. Price increased 2% since PO was created on 2026-06-15. This vendor's prices have fluctuated 1-3% monthly."
- **Suggested Resolution**: Based on similar historical exceptions
- **Action Bar**: Resolve (with reason), Escalate, Reassign, Dismiss

---

## 6. Invoice View

**Purpose**: Single-screen comprehensive view of one invoice with all evidence needed for decision-making. This is the core working screen.

**Layout**: Split panel — left (55%) = invoice document + line items; right (45%) = evidence panel. Action bar fixed at bottom (64px).

### 6.1 Left Panel — Invoice Document

- **Header**: Invoice number, vendor name, date received, status badge, workflow stage indicator (10-dot progress)
- **Document Viewer**: Embedded PDF/image viewer with zoom, pan, annotate. OCR-extracted fields highlighted with confidence indicators.
- **Line Items Table**: Item, Description, Qty, Unit Price, Total, Match Status (green dot / yellow dot / red dot), Variance column
- **Totals**: Subtotal, Tax, Shipping, Total — each cross-referenced with PO totals inline

### 6.2 Right Panel — Evidence

Tabbed sub-panel within the evidence column:

| Tab | Content |
|-----|---------|
| Match | Three-way comparison table: Invoice vs PO vs GRN, line-by-line variance, overall match status |
| Vendor | Vendor profile summary: name, risk score, payment history, avg days-to-pay, dispute rate |
| History | Prior invoices from this vendor (last 12 months), price trend chart |
| Contract | Active contract terms: payment terms, discount %, pricing schedule, expiry |
| AI Package | Risk score (0-100 ring), recommendation, confidence %, evidence summary, comparable invoices, cash flow impact |
| Audit | Full audit trail: timestamps, actors, state transitions, checksums |

### 6.3 Action Bar (Bottom)

Fixed at bottom of screen. Contains:

- **Primary action**: Approve (Cmd+Enter) — gold button, disabled if insufficient authority
- **Secondary actions**: Reject (red), Request Info (grey), Escalate (grey)
- **Tertiary**: Add Note, Assign To, View Vendor Full Profile
- **Status**: Shows current approval level and next approver

---

## 7. Vendor View

**Purpose**: Comprehensive vendor profile for assessing reliability, payment patterns, and risk.

**Layout**: Header with vendor summary + 4-column metric row + tabbed content below.

### 7.1 Vendor Header

- Company name, logo, tax ID, primary contact
- Status badge: Active / Inactive / Blocked / Under Review
- Risk score ring (0-100) with colour: green (<30), yellow (30-70), red (>70)

### 7.2 Metric Row

| Metric | Value | Trend |
|--------|-------|-------|
| Total Spend (12mo) | $XXX,XXX | vs. prior 12mo |
| Avg Days-to-Pay | XX days | vs. terms |
| Invoice Count (12mo) | XXX | — |
| Dispute Rate | X.X% | vs. 6mo avg |

### 7.3 Tabbed Content

- **Open Invoices**: Table of all unpaid invoices from this vendor (amount, due date, status, aging)
- **Payment History**: Table of all payments (date, amount, method, reference), with payment trend chart
- **Spend Trend**: Monthly spend chart with 12-month history
- **Contracts**: Active and expired contracts with terms
- **Risk Assessment**: AI risk breakdown — reliability, pricing consistency, delivery accuracy, dispute frequency

---

## 8. Payment View

**Purpose**: Manage payment batches from proposal through execution to confirmation.

**Layout**: Two sub-views via tabs — Proposals and Completed Payments.

### 8.1 Proposals Tab

- Table of proposed payment batches: batch ID, invoice count, total amount, payment method, proposed date, status (Draft / Pending Approval / Approved / Executing)
- Click batch → batch detail view: list of invoices in batch, total, bank account, discount captured, cash impact
- Action bar: Approve Batch (Treasury Manager), Modify Batch, Reject, Export

### 8.2 Batch Detail View

- Batch header: ID, total, method, proposed date, bank account (masked), status
- Invoice list: vendor, invoice #, amount, due date, discount if applicable
- Cash impact panel: current balance, after-payment balance, forecast line
- Approval chain: current approver, next approver, completion status
- Action bar: Execute Payment (Cmd+Enter), Hold, Split Batch

### 8.3 Completed Tab

- Table of executed payments: batch ID, date, total, method, bank reference, status (Processing / Completed / Failed)
- Click row → payment confirmation: bank reference, processing time, GL entries posted, vendor notification status

---

## 9. Reports View

**Purpose**: Financial analytics and operational metrics for Controller, CFO, and AP Manager.

### 9.1 AP Aging Report

- Horizontal stacked bar (Current / 1-30 / 31-60 / 61-90 / 90+) with count and $ per bucket
- Drill-down table: vendor, invoice count, total per aging bucket
- Export: CSV, Excel, PDF

### 9.2 DPO Trend

- Line chart: DPO over last 12 months, with target line
- KPIs: current DPO, trend, benchmark comparison

### 9.3 Spend Analytics

- Bar chart: monthly spend by vendor category
- Pie chart: spend distribution by top 10 vendors
- Table: vendor, spend amount, % of total, YoY change

### 9.4 Exception Trends

- Line chart: exception count by type over last 30 days
- Table: exception type, count, avg resolution time, recurrence rate

### 9.5 Approval Cycle Time

- Histogram: time from approval request to decision
- Table: approver, avg time, median time, SLA compliance rate

---

## 10. Settings View

**Purpose**: Configure AP workflow behaviour. Restricted to AP Manager and Controller roles.

### 10.1 Tolerance Rules

- Table of tolerance rules: vendor, category, price %, quantity %, absolute $ threshold
- Create/edit modal: rule name, scope (vendor/category/global), tolerance values, effective dates
- Preview impact: "This rule would have resolved X exceptions in the last 30 days"

### 10.2 Approval Matrix

- Visual table: amount thresholds × roles, showing required approval levels
- Edit mode: drag thresholds, assign roles, set delegation rules
- Audit log of matrix changes

### 10.3 Notification Preferences

- Per-role notification settings: email, in-app, Slack
- Event type toggles: invoice captured, exception raised, approval required, payment completed
- SLA warning thresholds: when to send reminder, when to escalate

### 10.4 AI Behaviour Settings

- Confidence threshold for auto-routing (default: 85%)
- AI recommendation display: always show / show when confidence > 50% / never show
- Auto-classification: enabled/disabled per exception type
- Model selection: primary and fallback AI providers

---

## 11. Screen Inventory

| # | Screen | Purpose | Primary Action | Key Metrics | Persona |
|---|--------|---------|----------------|-------------|---------|
| 1 | AP Dashboard | Operational overview | Jump to urgent items | Invoices today, pending $, exceptions, DPO | All |
| 2 | Work Queue | Invoice inbox | Process invoices | Queue count, avg processing time | AP Clerk |
| 3 | Work Queue — Filtered | Focused subset | Batch process | Subset count, matching status | AP Clerk |
| 4 | Exception Queue | Anomaly resolution | Resolve exceptions | Exception count, SLA compliance, resolution time | AP Clerk, AP Manager |
| 5 | Exception Detail | Single exception | Resolve/escalate | Variance $/%, days open, AI confidence | AP Clerk, AP Manager |
| 6 | Invoice View | Complete invoice | Approve/reject | Match status, AI risk, approval progress | AP Clerk, Approver |
| 7 | Invoice Document Viewer | PDF/image review | Verify OCR | OCR confidence, field accuracy | AP Clerk |
| 8 | Vendor Profile | Vendor overview | Assess risk | Risk score, spend, payment history | Procurement Manager |
| 9 | Vendor List | All vendors | Search/filter | Total vendors, risk alerts | Procurement Manager |
| 10 | Payment Proposals | Batch management | Approve batch | Batch count, total $, discount captured | Treasury Manager |
| 11 | Payment Batch Detail | Batch review | Execute payment | Batch total, cash impact, bank ref | Treasury Manager |
| 12 | Payment History | Completed payments | View confirmation | Total paid, avg processing time | Treasury Manager |
| 13 | AP Aging Report | Liability snapshot | Drill-down | Aging buckets, $ per bucket | Controller, CFO |
| 14 | DPO Trend | Payment efficiency | Analyse trend | Current DPO, 12mo trend | CFO |
| 15 | Spend Analytics | Vendor spend | Identify patterns | Top vendors, category distribution | CFO, Controller |
| 16 | Exception Trends | Exception patterns | Identify systemic issues | Exception rate, resolution time | AP Manager, Controller |
| 17 | Approval Cycle Time | Approver efficiency | Optimise bottlenecks | Avg cycle time, SLA compliance | AP Manager, CFO |
| 18 | Tolerance Rules | Match configuration | Edit tolerances | Rules active, exceptions prevented | AP Manager |
| 19 | Approval Matrix | Approval configuration | Edit thresholds | Approval chain, delegation rules | AP Manager, Controller |
| 20 | Notification Settings | Alert configuration | Toggle preferences | Notification volume, SLA warnings | AP Manager |
| 21 | AI Settings | AI behaviour | Adjust thresholds | Confidence distribution, auto-route rate | AP Manager |
| 22 | Audit Trail | Compliance record | Search/export | Record count, checksum integrity | Auditor |
| 23 | Bulk Operations | Batch actions | Approve/export | Selected count, total value | AP Clerk, AP Manager |
| 24 | Vendor Portal (External) | Self-service | Upload invoice | Upload status, payment status | Vendor |
| 25 | Mobile Dashboard | Quick overview | Check status | Key KPIs, urgent items | CFO, Approver |

---

## 12. Information Hierarchy

Every screen follows a strict 3-tier information hierarchy:

### Tier 1 — Immediately Visible (No Click)

- **Metrics**: KPI values with trend indicators
- **Urgency**: SLA countdown dots (green/yellow/red)
- **Status**: Colour-coded badges for every entity
- **Counts**: Queue sizes, exception counts, pending approvals
- **AI Confidence**: Percentage with ring indicator

### Tier 2 — One Click Away

- **Invoice detail**: Full line items, match results, evidence tabs
- **Exception detail**: Root cause, suggested resolution, action buttons
- **Vendor detail**: Risk breakdown, payment history, contract terms
- **Batch detail**: Invoice list, cash impact, approval chain
- **Filter/search**: Full filtering UI, Cmd+K palette

### Tier 3 — Behind a Panel or Navigation

- **Audit trail**: Full event log with timestamps and checksums
- **AI reasoning**: Confidence breakdown, evidence chain, comparable analysis
- **Configuration**: Tolerance rules, approval matrix, notification settings
- **Exports**: CSV, Excel, PDF generation
- **Bulk operations**: Multi-select, batch actions

**Invariant**: No Tier 3 information is required to complete a Tier 1 decision. Every approval, rejection, or exception resolution can be completed with Tier 1 + Tier 2 information alone.

---

## 13. Responsive Behaviour

### Desktop — 1920px (Full Experience)

- Full split-panel layout on Invoice View (left 55% / right 45%)
- Sidebar expanded (240px) with labels
- All KPI cards visible in 4-column grid
- Exception Queue: list (60%) + detail panel (40%) side-by-side
- Full filter sidebar visible (200px)
- Command palette: centered modal, 640px wide

### Laptop — 1440px (Optimised)

- Split panel preserved but evidence panel collapsible (toggle button)
- Sidebar collapsed to icon-only (64px), expands on hover
- KPI cards: 4-column grid preserved
- Exception Queue: panel overlays on click instead of side-by-side
- Filter sidebar: collapsible via hamburger icon

### Tablet — 768px (Stacked)

- Split panels stack vertically: invoice document above, evidence below
- Sidebar replaced with top navigation dropdown
- KPI cards: 2-column grid
- Tables: horizontal scroll, sticky first 2 columns
- Touch targets: minimum 44px (WCAG 2.5.5)
- Action bar: full-width buttons, stacked vertically

### Mobile — 375px (Simplified)

- Single-column layout throughout
- Bottom navigation bar (5 items: Dashboard, Work Queue, Exceptions, Payments, More)
- KPI cards: single-column scrollable list
- Invoice View: document viewer full-width, evidence as expandable accordion
- Tables: card layout (each row becomes a card)
- Approve/Reject: swipe actions (right to approve, left to reject)
- Cmd+K: replaced with search icon in top bar

---

## 14. Keyboard Navigation

### Global Shortcuts

| Shortcut | Action | Available On |
|----------|--------|--------------|
| Cmd+K | Open command palette | All screens |
| Cmd+/ | Show keyboard shortcuts help | All screens |
| Cmd+Enter | Approve/confirm current action | Invoice View, Payment Batch |
| Cmd+E | Export current view | All list views |
| Cmd+F | Open search/filter | All list views |
| Esc | Dismiss modal/panel/dropdown | All screens |
| ? | Show shortcuts (when no input focused) | All screens |

### List Navigation

| Shortcut | Action |
|----------|--------|
| ↑ / ↓ | Move focus between rows |
| Enter | Open selected item |
| Space | Toggle row selection |
| Shift+Click | Range select |
| Cmd+A | Select all visible rows |
| Cmd+D | Deselect all |

### Invoice View Navigation

| Shortcut | Action |
|----------|--------|
| Tab | Cycle through action buttons |
| Cmd+1 through Cmd+6 | Switch evidence tabs (Match/Vendor/History/Contract/AI/Audit) |
| Cmd+← / Cmd+→ | Previous/next invoice in queue |
| Cmd+P | Print invoice |

### Accessibility

- All interactive elements have visible focus rings (gold, #d4af37, 2px offset)
- ARIA labels on all icon-only buttons: `aria-label="Approve invoice"`, `aria-label="Open exception detail"`
- Screen reader announcements for status changes: `aria-live="polite"` on queue counts, SLA timers
- Skip navigation link: "Skip to main content" (WCAG 2.4.1)
- All tables use semantic `<table>` with `<thead>`, `<th scope="col">`, and `aria-sort` on sortable columns
- Modal focus trap: Tab cycles within modal until Esc
- Reduced motion: all animations respect `prefers-reduced-motion`

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | UX_IA_AP_v1.0 |
| Phase | 27.0A |
| Authority | Product Architecture Board |
| Design Language | EDL v1.1 — `src/design-system/edl/` |
| Screens | 25 (14 list/dashboard, 8 detail, 3 configuration) |
| Personas Served | 9 (AP Clerk, AP Manager, Controller, Treasury Manager, Procurement Manager, CFO, Approver, Auditor, Vendor) |
| Workflow Stages Covered | 10 (Invoice Received → Audit Completion) |
| Status | Draft |
| Next Review | Phase 27.0B |
