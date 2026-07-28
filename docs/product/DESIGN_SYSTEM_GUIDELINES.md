# AP Design System Guidelines

> Accounts Payable workflow-specific design standards built on the Enterprise Design Language (EDL).
> Every AP screen must serve CFOs, AP Managers, Treasurers, and Controllers — clarity and speed before aesthetics.

---

## 1. Purpose

These guidelines translate the EDL token system into concrete AP workflow decisions. The EDL provides the raw materials (colours, typography, spacing, motion); this document tells AP engineers **when and how** to apply them.

**AP workflow characteristics that shape every decision:**

- High-volume scanning — users process 50–200 invoices per session
- Financial precision — every number must be trustworthy at a glance
- Exception-driven — the UI must surface problems, not hide them
- Approval-critical — wrong approvals cost real money
- Audit-traced — every screen change must be defensible

**Design principles applied to AP:**

| Principle | AP Application |
|---|---|
| Clarity | Status badges answer "what is this?" in < 500ms |
| Confidence | Amounts show source (PO, GRN, OCR) alongside value |
| Speed | Keyboard navigation for all batch operations |
| Beauty | Restrained — generous whitespace between financial rows |
| Trust | Every number links to its calculation source |

---

## 2. Colour Usage

All colours from EDL tokens (`src/design-system/edl/colors.ts`). Never hardcode hex values.

### 2.1 Status Colours

| State | Token | Hex | Usage |
|---|---|---|---|
| Active / Approved | `status.gold` | `#d4af37` | Approved invoices, active vendors, selected batch |
| Exception / Rejected | `status.red` | `#ef4444` | Match failures, rejected invoices, SLA breaches |
| Matched / Completed | `status.green` | `#22c55e` | 2-way/3-way match success, paid invoices, reconciled |
| Pending / In-Progress | `status.amber` | `#f59e0b` | Awaiting approval, processing payments, pending validation |
| Information / AI | `status.blue` | `#3b82f6` | Captured invoices, AI recommendations, informational badges |

### 2.2 Background Colours

| Surface | Token | Usage |
|---|---|---|
| Page background | `surface.base` (`#0a0a0f`) | Main AP pages |
| Card background | `surface.card` (`#1a1a24`) | Invoice cards, exception cards, vendor cards |
| Hover background | `surface.hover` (`#1a1a24` at 0.8) | Row hover, card hover |
| Input background | `surface.input` (`#111118`) | Form fields, search bars |
| Modal backdrop | `surface.overlay` | Confirmation dialogs, detail panels |

### 2.3 Text Colours

| Role | Token | Usage |
|---|---|---|
| Primary text | `text.primary` (white) | Vendor names, amounts, headings |
| Secondary text | `text.secondary` (`#a0a0b0`) | Labels, captions, timestamps |
| Muted text | `text.muted` (`#6b6b80`) | Placeholder text, disabled states |
| Gold text | `text.gold` (`#d4af37`) | Approved amounts, active filters |
| Error text | `text.error` (`#ef4444`) | Validation messages, exception labels |

### 2.4 Border Colours

| Role | Token | Usage |
|---|---|---|
| Default border | `border.default` (`#1e1e2e`) | Card borders, table dividers |
| Focus ring | `border.focus` (`#d4af37`) | Active input, focused button |
| Error border | `border.error` (`#ef4444`) | Invalid form fields |
| Success border | `border.success` (`#22c55e`) | Verified fields, matched amounts |

---

## 3. Typography

Font stacks from EDL tokens (`src/design-system/edl/typography.ts`).

### 3.1 Font Selection

| Font | Role | When to Use |
|---|---|---|
| Inter | UI text | Labels, headings, descriptions, buttons, navigation |
| JetBrains Mono | Financial data | Amounts, invoice numbers, account codes, totals, dates in tables |

**Rule:** Any string representing a monetary value, invoice number, or accounting code renders in JetBrains Mono with `font-variant-numeric: tabular-nums`. All other text uses Inter.

### 3.2 Type Hierarchy

| Level | Size | Weight | Font | Usage |
|---|---|---|---|---|
| Metric | 24px | Bold (700) | JetBrains Mono | KPI values, batch totals, outstanding balance |
| Heading | 18px | Semibold (600) | Inter | Page titles, section headings, card titles |
| Subheading | 14px | Medium (500) | Inter | Column headers, subsection labels, badge text |
| Body | 14px | Regular (400) | Inter | Descriptions, table cell text, form help text |
| Caption | 12px | Regular (400) | Inter | Timestamps, secondary info, legal text, footnotes |

### 3.3 Financial Number Formatting

```
Amount:        $12,450.00   — JetBrains Mono, 24px bold (metric)
                         or 14px regular (table cell)
Invoice No:    INV-2026-001 — JetBrains Mono, 14px regular
Account Code:  4000-100-01   — JetBrains Mono, 12px regular
Date:          28 Jul 2026   — JetBrains Mono, 14px regular
```

**Negative amounts:** Display in `status.red` (`#ef4444`) with parentheses: `($2,450.00)` — never with minus sign in financial tables.

---

## 4. Card Patterns

All cards use `surface.card` background, `border.default` border, `radius.lg` (12px) corners, `spacing.lg` (24px) padding.

### 4.1 Invoice Card

```
┌──────────────────────────────────────────────────────────┐
│  Vendor Name                           INV-2026-0451     │
│  ▸ $12,450.00              [✓ Matched]  · 3 days old    │
│  ─────────────────────────────────────────────────────── │
│  PO: PO-7821  ·  GRN: GRN-2026-118  ·  AI: 94% match   │
│  Due: 15 Aug 2026  ·  Net 30  ·  GL: 4000-100-01       │
└──────────────────────────────────────────────────────────┘
```

- **Vendor name:** Inter, 14px medium, white
- **Invoice number:** JetBrains Mono, 12px, `text.secondary`
- **Amount:** JetBrains Mono, 24px bold, white (or red if exception)
- **Status badge:** EDL status badge component, colour per status table
- **Age:** Inter, 12px, `text.secondary`
- **AI confidence:** Blue badge if ≥ 90%, amber if 70–89%, red if < 70%
- **Hover:** Elevation increases (shadow from EDL), subtle scale 1.005
- **Click:** Opens invoice detail panel (slide-in from right)

### 4.2 Exception Card

```
┌──────────────────────────────────────────────────────────┐
│  ⚠ Price Mismatch                         [SLA: 2h 14m] │
│  ─────────────────────────────────────────────────────── │
│  Invoice INV-2026-0451 vs PO-7821                       │
│  Expected: $12,000.00  ·  Received: $12,450.00          │
│  Variance: +$450.00 (+3.75%)                             │
│                                            [Resolve →]   │
└──────────────────────────────────────────────────────────┘
```

- **Type icon:** Warning triangle in `status.amber` (price), `status.red` (duplicate, compliance)
- **SLA countdown:** JetBrains Mono, 12px, `status.red` if < 1h, `status.amber` if < 4h
- **Variance:** JetBrains Mono, 14px medium, colour-coded (red = over, green = under)
- **Action button:** EDL Button primary, right-aligned
- **Severity indicator:** Left border — 3px `status.red` for critical, `status.amber` for high

### 4.3 Payment Card

```
┌──────────────────────────────────────────────────────────┐
│  Payment Batch #47                         [Processing]   │
│  ▸ $245,890.00    ·  12 invoices  ·  ACH                │
│  ─────────────────────────────────────────────────────── │
│  Bank: Chase ····4521  ·  Initiated: 28 Jul 09:14       │
│  Est. completion: 28 Jul 14:00                           │
└──────────────────────────────────────────────────────────┘
```

- **Batch total:** JetBrains Mono, 24px bold
- **Invoice count:** Inter, 14px, `text.secondary`
- **Payment method:** Badge (ACH/Wire/Check/EFT) with icon
- **Progress:** Linear progress bar in `status.amber` for processing, `status.green` for completed

### 4.4 Vendor Card

```
┌──────────────────────────────────────────────────────────┐
│  Acme Corporation                    [Risk: Medium]       │
│  ─────────────────────────────────────────────────────── │
│  Open invoices: 5   ·   Total spend: $124,500.00        │
│  Last payment: 15 Jul 2026  ·   Avg days to pay: 22     │
└──────────────────────────────────────────────────────────┘
```

- **Risk badge:** `status.green` (low), `status.amber` (medium), `status.red` (high)
- **Spend amount:** JetBrains Mono, 18px semibold
- **Metrics row:** Inter, 12px, `text.secondary`, evenly spaced

---

## 5. Table Patterns

Tables use EDL `DataTable` with AP-specific column configurations.

### 5.1 Column Standards

| Column | Alignment | Font | Sortable | Width |
|---|---|---|---|---|
| Checkbox (bulk select) | Center | — | No | 40px |
| Invoice number | Left | JetBrains Mono | Yes | 140px |
| Vendor | Left | Inter | Yes | Flexible |
| Amount | Right | JetBrains Mono | Yes | 120px |
| Status | Center | Inter (badge) | Yes | 110px |
| Date | Right | JetBrains Mono | Yes | 110px |
| Age | Right | JetBrains Mono | Yes | 80px |
| AI confidence | Center | Inter | No | 90px |
| Actions | Right | — | No | 60px |

### 5.2 Table Behaviours

- **Sticky header:** `z-index: sticky` on `thead`, background `surface.card`
- **Row hover:** `surface.hover` background, 150ms transition
- **Row expansion:** Click chevron or double-click row to expand detail panel below
- **Bulk select:** Checkbox in header selects visible page; "Select all 847 invoices" link for cross-page
- **Pagination:** 25 / 50 / 100 rows per page, ellipsis-style page buttons
- **Multi-sort:** Click column to sort (desc → asc → clear); Shift+Click for secondary sort
- **Sticky first column:** Invoice number column pins left on horizontal scroll

### 5.3 Row Expansion Detail

```
┌──────────────────────────────────────────────────────────┐
│ ▼ INV-2026-0451  Acme Corporation  $12,450.00  Matched  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Line Items              Qty   Unit Price    Amount    │ │
│ │ Widget A                 100    $85.00     $8,500.00  │ │
│ │ Widget B                  50    $79.00     $3,950.00  │ │
│ │                              Subtotal:    $12,450.00  │ │
│ │                              Tax (0%):         $0.00  │ │
│ │                              Total:       $12,450.00  │ │
│ │                                                      │ │
│ │ GL Coding: 4000-100-01 (Software)                    │ │
│ │ Cost Center: Engineering                              │ │
│ │ Attachments: invoice.pdf, grn.pdf                     │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Form Patterns

All forms use the `EnterpriseForm` system with auto-save, validation summary, and unsaved changes guard.

### 6.1 Invoice Entry

- **Line item grid:** Editable data grid (not a static table). Tab navigates cell-to-cell (qty → unit price → amount auto-calculates)
- **Running total:** Sticky bottom bar showing subtotal + tax + total, JetBrains Mono 18px bold
- **Tax calculator:** Inline per-line-item tax rate selector with calculated tax amount
- **Add line:** "Add line item" button at bottom of grid, auto-focuses new row
- **Remove line:** Trash icon per row with undo toast (8s)
- **Keyboard:** Arrow keys navigate grid, Enter confirms cell, Escape cancels edit

### 6.2 Exception Resolution

- **Root cause dropdown:** Pre-populated from exception types (Price Mismatch, Duplicate Invoice, Missing PO, Compliance Violation, Quantity Variance)
- **Resolution text:** Textarea, 500 char max, character count displayed
- **Amount adjustment:** JetBrains Mono input with +/- toggle, validates against original amount
- **Attachments:** Drag-and-drop zone for supporting documents
- **Submit:** "Resolve Exception" button — requires confirmation if amount adjustment > $500

### 6.3 Payment Batch

- **Invoice selection:** Checkbox table of approved invoices, filterable by vendor, date, amount
- **Batch total:** Real-time running total as invoices are selected, displayed in sticky footer
- **Payment method:** Radio group (ACH / Wire / Check / EFT) with method-specific fields
- **Review step:** Summary screen showing all selected invoices, total, payment method, bank account
- **Confirm:** "Submit Payment Batch" — type-to-confirm if total > $10,000

---

## 7. Status Indicators

### 7.1 Invoice Lifecycle

| Status | Colour | Badge Style | Icon |
|---|---|---|---|
| Captured | Blue (`#3b82f6`) | Outlined | Document |
| Validated | Blue (`#3b82f6`) | Outlined | Check circle |
| Matched | Green (`#22c55e`) | Filled | Link |
| Exception | Red (`#ef4444`) | Filled | Alert triangle |
| Approved | Gold (`#d4af37`) | Filled | Shield check |
| Paid | Green (`#22c55e`) | Filled | Banknote |
| Reconciled | Green (`#22c55e`) | Filled | Check double |
| Closed | Gray (`#6b6b80`) | Outlined | Archive |

### 7.2 Payment Lifecycle

| Status | Colour | Badge Style | Icon |
|---|---|---|---|
| Proposed | Blue (`#3b82f6`) | Outlined | Lightbulb |
| Approved | Gold (`#d4af37`) | Filled | Shield check |
| Processing | Amber (`#f59e0b`) | Filled, animated | Loader |
| Completed | Green (`#22c55e`) | Filled | Check circle |
| Confirmed | Green (`#22c55e`) | Filled, double ring | Check double |
| Failed | Red (`#ef4444`) | Filled | X circle |
| Voided | Gray (`#6b6b80`) | Outlined, strikethrough | Ban |

### 7.3 Badge Specifications

- **Height:** 24px
- **Padding:** 0 8px
- **Border radius:** `radius.full` (9999px)
- **Font:** Inter, 12px medium
- **Outlined variant:** 1px border in status colour, transparent background, coloured text
- **Filled variant:** Status colour background (15% opacity), status colour text, 1px border in status colour (20% opacity)

---

## 8. Metric Display

### 8.1 KPI Card Layout

```
┌──────────────────────────────────────┐
│  Outstanding AP              ↑ 12%   │
│  $2,450,890.00         vs last month │
│  ──────────────────────────────────  │
│  ▁▂▃▅▆▅▃▂▃  7-day trend            │
└──────────────────────────────────────┘
```

- **Value:** JetBrains Mono, 24px bold, white
- **Trend arrow:** ↑ (green) / ↓ (red) / → (gray), Inter 14px
- **Comparison text:** Inter, 12px, `text.secondary`
- **Sparkline:** SVG, 80×24px, stroke in status colour (green if positive trend, red if negative)
- **Progress bar:** For targets — 4px height, `surface.input` track, status colour fill

### 8.2 Metric Grid

- **Desktop:** 4 columns, 16px gap
- **Tablet:** 2 columns, 16px gap
- **Mobile:** 1 column, 12px gap
- **Card:** `surface.card` background, `radius.md` (8px), `spacing.lg` (24px) padding

### 8.3 Progress Bars

- **Track:** 4px height, `surface.input` (`#111118`) background
- **Fill:** Animated width transition (400ms ease-out), status colour
- **Label:** Percentage in Inter 12px, positioned above or below
- **Threshold markers:** Vertical dashed line at 75% and 100% of target

---

## 9. Notification Patterns

### 9.1 Toast Notifications

- **Position:** Top-right, 16px from edge
- **Width:** 384px max
- **Animation:** Slide in from right (200ms ease-out), slide out on dismiss
- **Auto-dismiss:** 5 seconds (non-critical), no auto-dismiss (critical/payment)
- **Variants:** Success (green icon), Error (red icon), Warning (amber icon), Info (blue icon)
- **Stacking:** New toasts push older down, max 3 visible

### 9.2 Badge Counts

- **Sidebar nav items:** Numeric badge in `status.red` for pending exceptions
- **Tab counts:** "(12)" suffix in `text.secondary`
- **Dot indicator:** 8px circle in `status.red`, positioned top-right on icon, pulsing animation for SLA breach

### 9.3 Urgency Indicators

- **Pulsing dot:** 8px `status.red` circle with CSS `@keyframes pulse` (1s ease-in-out infinite)
- **SLA countdown:** JetBrains Mono, `status.amber` if > 1h remaining, `status.red` if < 1h
- **Breach state:** Badge changes from amber to red, pulsing animation starts, toast fires

---

## 10. Empty States

Every list, table, and dashboard section needs an empty state.

### 10.1 Structure

```
┌──────────────────────────────────────┐
│                                      │
│         [Illustration]               │
│         (80×80, EDL style)          │
│                                      │
│    No invoices to process            │
│    Upload an invoice to get started  │
│                                      │
│       [Upload Invoice]               │
│                                      │
└──────────────────────────────────────┘
```

- **Illustration:** 80×80px, line-art style in `text.muted` colour, EDL illustration system
- **Title:** Inter, 16px medium, white
- **Description:** Inter, 14px regular, `text.secondary`, max 2 lines
- **Action:** EDL Button primary, centred
- **Background:** `surface.card`, `radius.lg`, `spacing.xl` (32px) padding

### 10.2 Contextual Empty States

| Context | Title | Description | Action |
|---|---|---|---|
| No invoices | No invoices to process | Upload an invoice to get started | Upload Invoice |
| No exceptions | All clear | No exceptions requiring attention | — |
| No vendors | No vendors yet | Add your first vendor to begin | Add Vendor |
| No payment batches | No batches | Create a payment batch to pay invoices | Create Batch |
| Search empty | No results | Try adjusting your filters or search term | Clear Filters |

---

## 11. Loading States

### 11.1 Skeleton Loaders

- **Card skeleton:** Rectangular blocks matching card layout — title bar (60% width, 16px height), two detail lines (40% and 30% width, 12px height)
- **Table skeleton:** 10 rows matching column widths, 48px row height, shimmer animation
- **Metric skeleton:** Number block (120×24px) + label block (80×12px), 16px gap
- **Animation:** Shimmer gradient moving left-to-right, 1.5s infinite, `surface.hover` to `surface.card` gradient

### 11.2 Progress Indicators

- **Determinate:** Linear progress bar with percentage label — use for uploads, batch processing
- **Indeterminate:** Pulsing bar or spinner — use for API calls, saves
- **Spinner:** 20px, `status.gold` stroke, 1s rotation — use inline with buttons

### 11.3 Skeleton Timing

- **Show skeleton:** If operation takes > 300ms
- **Show progress:** If operation is > 2s and progress is known
- **Never:** Show both skeleton and progress simultaneously

---

## 12. Error States

### 12.1 Inline Validation

```
┌──────────────────────────────────┐
│  Amount *                        │
│ ┌──────────────────────────────┐ │
│ │ abc                          │ │ ← red border (border.error)
│ └──────────────────────────────┘ │
│  ⚠ Please enter a valid amount   │ ← red text (text.error), 12px
└──────────────────────────────────┘
```

- **Border:** 1px `border.error` (`#ef4444`) on invalid field
- **Message:** Inter, 12px, `text.error`, with ⚠ icon prefix
- **Timing:** Validate on blur, re-validate on change after first error
- **Focus ring:** `border.focus` (`#d4af37`) overrides error border when focused

### 12.2 Network Errors

- **Banner:** Top of page, full width, `surface.error` background (`#ef4444` at 10% opacity), 1px bottom border in `status.red`
- **Content:** "Connection lost. Changes will be saved when connectivity is restored." + Retry button
- **Auto-retry:** Exponential backoff (1s, 2s, 4s), 3 attempts max

### 12.3 Permission Errors

- **Inline:** Lock icon (16px, `text.muted`) + "Contact your administrator to request access"
- **Full page:** Lock icon (48px, `text.muted`) + heading "Access Denied" + description + "Request Access" button

### 12.4 Data Errors

- **Stale data:** Badge "Data may be outdated" in `status.amber`, with "Refresh" link
- **Calculation mismatch:** Red inline badge "Expected $X, got $Y" with "Recalculate" action

---

## 13. Confirmation Patterns

### 13.1 Destructive Actions

**Standard (any amount):**
```
┌──────────────────────────────────────┐
│  Delete Invoice INV-2026-0451?       │
│                                      │
│  This will permanently remove the    │
│  invoice and all associated records. │
│  This action cannot be undone.       │
│                                      │
│  [Cancel]         [Delete] (red)     │
└──────────────────────────────────────┘
```

- **Modal:** Backdrop blur, scale-in animation (200ms)
- **Confirm button:** `status.red` background, white text
- **Focus:** Auto-focus Cancel button (safe default)

**Type-to-confirm (payments > $10,000):**
- Input field with label "Type CONFIRM to proceed"
- Confirm button disabled until input matches "CONFIRM" exactly
- Case-sensitive

### 13.2 Approval Actions

- **Single click:** Approve button, no confirmation needed
- **Undo window:** Toast "Approved. Undo?" with 10-second countdown
- **Undo:** Reverts approval, restores previous status
- **After 10s:** Toast dismisses, approval is final

### 13.3 Batch Actions

- **Summary:** "You are about to approve 12 invoices totaling $245,890.00"
- **Confirm:** "Approve All" button, single click
- **Undo:** 10-second undo window per invoice, toast with count

---

## 14. Accessibility

All AP screens must meet WCAG 2.1 AA. No exceptions.

### 14.1 Interactive Elements

- **Touch targets:** Minimum 44×44px for all buttons, links, and interactive elements
- **Focus indicators:** 2px `border.focus` (`#d4af37`) outline, 2px offset, on all focusable elements
- **Keyboard navigation:** Tab order follows visual layout, all actions reachable via keyboard
- **Escape:** Closes modals, dismisses toasts, cancels inline edits

### 14.2 ARIA Labels

| Element | Required ARIA |
|---|---|
| Status badge | `aria-label="Status: Matched"` |
| Sort button | `aria-label="Sort by amount, ascending"` |
| Bulk checkbox | `aria-label="Select invoice INV-2026-0451"` |
| Action button | `aria-label="Approve invoice INV-2026-0451"` |
| SLA countdown | `aria-label="SLA remaining: 2 hours 14 minutes"` |
| Progress bar | `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label="Payment processing: 45%"` |
| Toast | `role="status"`, `aria-live="polite"` |
| Error message | `role="alert"`, `aria-live="assertive"` |

### 14.3 Screen Reader Announcements

- **Status change:** "Invoice INV-2026-0451 status changed from Captured to Matched"
- **Batch progress:** "Payment batch processing: 8 of 12 invoices completed"
- **Exception raised:** "New exception: Price mismatch on invoice INV-2026-0451, SLA 4 hours"
- **Approval:** "Invoice INV-2026-0451 approved. Undo available for 10 seconds"

### 14.4 Colour Independence

- Every status conveyed by colour must also have a text label or icon
- Status badges include text ("Matched", not just a green dot)
- Trend arrows (↑/↓/→) supplement colour for direction
- Error states use border + icon + text, not red colour alone

### 14.5 Motion

- All animations respect `prefers-reduced-motion: reduce`
- Reduced motion: instant transitions (0ms), no shimmer, no pulse, no slide-in
- Sparklines render as static images when motion is reduced

---

## Appendix: EDL Token Reference

| Token | Value | Source |
|---|---|---|
| `surface.base` | `#0a0a0f` | EDL colors.ts |
| `surface.card` | `#1a1a24` | EDL colors.ts |
| `surface.input` | `#111118` | EDL colors.ts |
| `status.gold` | `#d4af37` | EDL colors.ts |
| `status.red` | `#ef4444` | EDL colors.ts |
| `status.green` | `#22c55e` | EDL colors.ts |
| `status.amber` | `#f59e0b` | EDL colors.ts |
| `status.blue` | `#3b82f6` | EDL colors.ts |
| `text.primary` | white | EDL colors.ts |
| `text.secondary` | `#a0a0b0` | EDL colors.ts |
| `text.muted` | `#6b6b80` | EDL colors.ts |
| `border.default` | `#1e1e2e` | EDL colors.ts |
| `border.focus` | `#d4af37` | EDL colors.ts |
| `font.ui` | Inter | EDL typography.ts |
| `font.mono` | JetBrains Mono | EDL typography.ts |
| `spacing.base` | 4px | EDL spacing.ts |
| `radius.sm` | 4px | EDL radius.ts |
| `radius.md` | 8px | EDL radius.ts |
| `radius.lg` | 12px | EDL radius.ts |
| `motion.duration.fast` | 100ms | EDL motion.ts |
| `motion.duration.normal` | 200ms | EDL motion.ts |
| `motion.duration.slow` | 400ms | EDL motion.ts |
