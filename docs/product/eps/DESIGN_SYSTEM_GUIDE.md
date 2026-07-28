---
title: "Design System Guide — EDL Application to the AP Workflow v1.0"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
tags:
  - type/specification
  - domain/design
  - domain/ap
  - status/active
owner: Design Systems Team
authority: Phase 27.1
---

# Design System Guide — EDL Application to the AP Workflow v1.0

> **Classification**: Restricted — Internal Use Only
> **Status**: Design Document (Phase 27.1)
> **Authority**: Phase 27.1 — EDL Application Contract for AP Reference Workflow
> **Evidence Basis**: Phase 8B.4 Enterprise Tables, Phase 8B.6 Enterprise Forms, Phase 8B.7 Motion System, Phase 22.0B EDL Foundation, Phase 22.0B.1 Token Migration, T1–T8, E1–E7

---

## 1. Design Language Foundation

### 1.1 EDL Token Reference

All AP screens inherit from the Enterprise Design Language (EDL). No hardcoded values.

| Token Category | Source File | Key Values |
|----------------|-------------|------------|
| **Surface colours** | `src/design-system/edl/colors.ts` | Base: `#0a0a0f`, Card: `#1a1a24`, Input: `#111118`, Hover: `#1a1a24` at 0.8 |
| **Gold accent** | `src/design-system/edl/colors.ts` | Primary: `#d4af37`, used for currency, active states, key metrics, approved status |
| **UI font** | `src/design-system/edl/typography.ts` | Inter — all UI text, labels, headings, descriptions, buttons, navigation |
| **Mono font** | `src/design-system/edl/typography.ts` | JetBrains Mono — all monetary values, invoice numbers, account codes, financial identifiers |
| **Spacing** | `src/design-system/edl/spacing.ts` | 4px base scale: xs (4px), sm (8px), md (12px), lg (16px), xl (24px), xxl (32px), xxxl (48px) |
| **Border radius** | `src/design-system/edl/radius.ts` | sm (4px), md (8px), lg (12px), xl (16px), full (9999px) |
| **Motion** | `src/design-system/edl/motion.ts` | Fast (100ms), Normal (200ms), Slow (400ms), Ease-out for entrances, ease-in-out for state changes |
| **Z-index** | `src/design-system/edl/z-index.ts` | 14 levels: dropdown (10), sticky (20), nav (30), modal (40), toast (50), tooltip (60) |

### 1.2 EDL Enforcement

Every AP screen component must:
1. Import from EDL tokens (never hardcode hex values, font stacks, or spacing)
2. Pass ESLint rules (Phase 22.0B.5: `no-hardcoded-colors`, `no-hardcoded-spacing`, `no-arbitrary-tailwind-colors`)
3. Use EDL component presets (Button, Card, Input, Badge, Table, Dialog, Toast, Tooltip, Skeleton from `components.ts`)
4. Run `pnpm edl:audit` before committing AP UI changes

### 1.3 Screen Layout Principles

Every AP screen follows a consistent structural hierarchy:

```
┌────────────────────────────────────────────────────────────────┐
│  Page Header                                                    │
│  Title + Metadata row + Primary Action                          │
├────────────────────────────────────────────────────────────────┤
│  Metric Bar (optional)                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│  │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │                          │
│  └──────┘ └──────┘ └──────┘ └──────┘                          │
├────────────────────────────────────────────────────────────────┤
│  Content Area                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Filter Bar (search, date range, filters, sort)          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Table / Grid / Card List                                 │  │
│  │                                                           │  │
│  │                                                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Pagination (25/50/100 per page) + Row count              │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  Status Bar (optional — data freshness, last sync, mode)       │
└────────────────────────────────────────────────────────────────┘
```

- **Page header**: 64px height, `spacing.xl` (24px) padding horizontal, Inter heading 18px semibold, JetBrains Mono subheading for IDs
- **Metric bar**: 4-card row, 16px gap, each card 1/4 width, flexible height (80–100px)
- **Content area**: Full-width, `spacing.lg` (16px) padding horizontal
- **Status bar**: 32px height, `text.muted` 12px, always at bottom of content area
- **Background**: `surface.base` (`#0a0a0f`) for pages, `surface.card` (`#1a1a24`) for cards/tables/panels
- **Gap between sections**: `spacing.xl` (24px)

---

## 2. Information Density

AP professionals process high volumes of financial data. Three density modes accommodate different tasks. This design is informed by Phase 8B.4 Enterprise Tables research.

### 2.1 Comfortable Mode

| Property | Value |
|----------|-------|
| **Purpose** | Exploratory review, onboarding, training, low-frequency tasks |
| **When** | First-time users, new vendor setup, exception investigation, approval review |
| **Row height** | 64px (table), 140px (card) |
| **Padding** | `spacing.lg` (16px) horizontal, `spacing.md` (12px) vertical |
| **Font** | Inter 14px body, JetBrains Mono 14px financial data |
| **Gap between rows** | 8px |
| **Visible columns** | 6–8 (core data + 2 contextual) |
| **Card style** | Full card with icon, status badge, metadata row, action buttons |
| **Evidence** | Phase 8B.4: comfort mode for executives and infrequent users |

**Used by**: First-time users, executive review, onboarding flow, infrequent approvers (Dept Heads)

### 2.2 Compact Mode (Default)

| Property | Value |
|----------|-------|
| **Purpose** | Daily operations, batch processing, queue management |
| **When** | AP Clerk daily work, AP Manager oversight, exception queue |
| **Row height** | 48px (table), 100px (card) |
| **Padding** | `spacing.md` (12px) horizontal, `spacing.sm` (8px) vertical |
| **Font** | Inter 14px body, JetBrains Mono 14px financial data |
| **Gap between rows** | 4px |
| **Visible columns** | 8–10 (all core data) |
| **Card style** | Compact card with status dot, amount, age, action menu |
| **Evidence** | Phase 8B.4: compact is the default for daily operators |

**Used by**: AP Clerk, AP Manager, Treasury Manager (daily active users processing 50–200 invoices/session)

### 2.3 Ultra-Compact Mode

| Property | Value |
|----------|-------|
| **Purpose** | Bulk review, batch approval, audit verification |
| **When** | Controller month-end review, auditor sampling, bulk approve/reject |
| **Row height** | 36px (table) |
| **Padding** | `spacing.sm` (8px) horizontal, 4px vertical |
| **Font** | Inter 12px body, JetBrains Mono 12px financial data (tabular-nums) |
| **Gap between rows** | 0px (border-bottom only) |
| **Visible columns** | 10–14 (all data, including technical fields) |
| **Card style** | Hidden (table only) |
| **Sticky columns** | First 2 columns pinned left (checkbox + invoice number) |
| **Evidence** | Phase 8B.4: ultra-compact for auditors and controllers |

**Used by**: Controller (month-end review), Auditor (sampling), high-volume bulk operations

### 2.4 Density Toggle

- Density toggle is always visible in the secondary toolbar (icon: grid/compact/hamburger)
- User preference is stored in localStorage + user profile settings
- Density change is animated (200ms ease-out, row height transitions)
- Default: Compact for authenticated users, Comfortable for first login
- Mobile: always Comfortable (single-column layout)

---

## 3. Colour Semantics

### 3.1 Status Colour System

**Core rule**: Status colours are used **only** for status indicators (badges, progress bars, alert icons, border left markers). They never appear as decorative elements, background fills, or text colours outside status context.

| Status | Hex | Token | Usage | Accessibility |
|--------|-----|-------|-------|---------------|
| **Approved / Active / Selected** | `#d4af37` | `status.gold` | Approved invoices, active vendors, selected batch, current state highlight | Contrast 4.5:1 on card dark |
| **Warning / Exception** | `#f59e0b` | `status.amber` | Exception queue items, SLA < 50% remaining, partial matches, pending approval | Contrast 4.5:1 on card dark |
| **Error / Blocked / Failed** | `#ef4444` | `status.red` | Rejected invoices, failed payments, SLA breaches, critical anomalies, duplicate flags | Contrast 5.2:1 on card dark |
| **Info / AI / System** | `#3b82f6` | `status.blue` | AI recommendations, system messages, informational badges, captured invoices | Contrast 4.7:1 on card dark |
| **Success / Matched / Paid** | `#22c55e` | `status.green` | Matched invoices, paid status, reconciled items, confirmed reconciliations | Contrast 4.5:1 on card dark |
| **Neutral / Closed / Voided** | `#6b6b80` | `text.muted` | Closed invoices, voided items, completed workflows, inactive vendors | Contrast 3.5:1 (not used for interactive elements) |

### 3.2 Badge Variants

| Variant | CSS | When to Use |
|---------|-----|-------------|
| **Filled** | Background: status colour at 100% opacity, text: white | Primary status indicator on cards, table cells, metric bars |
| **Outlined** | Border: status colour 1px, text: status colour, bg: transparent | Secondary indicator, informational badges, multi-status lists |
| **Ghost** | Text: status colour, bg: transparent | Inline within text, subtle indicators, dense layouts |

### 3.3 Semantic Backgrounds

| Context | Token | Opacity | Usage |
|---------|-------|---------|-------|
| Exception card left border | `status.red` / `status.amber` | 100% (3px border) | Severity indicator on exception queue cards |
| AI recommendation highlight | `status.blue` | 8% | Background behind AI output in explainability panels |
| Warning banner | `status.amber` | 10% | Top-of-page warning banners for data staleness, connectivity |
| Error banner | `status.red` | 10% | Top-of-page error banners for failed operations |
| Success banner | `status.green` | 10% | Confirmation banners after batch operations |

### 3.4 Financial Colour Coding

| Condition | Colour | Context |
|-----------|--------|---------|
| Positive trend, savings, discount captured | `#22c55e` | Trend arrows (↑), discount capture indicators |
| Negative trend, penalty, loss | `#ef4444` | Trend arrows (↓), late payment fees, interest charges |
| Variance within tolerance | `#d4af37` | Match variances < 2% |
| Variance outside tolerance | `#ef4444` | Match variances ≥ 2% |
| Neutral / no change | `#a0a0b0` (`text.secondary`) | Flat trend (→), baseline values |

---

## 4. Typography

### 4.1 Font Selection Rules

| Font | Role | When to Use | Exception |
|------|------|-------------|-----------|
| **Inter** | All UI text | Labels, headings, descriptions, buttons, navigation, help text, tooltips, form fields, table headers, non-financial table cells | Never use Inter for monetary values, IDs, or codes |
| **JetBrains Mono** | Financial data + identifiers | Amounts, totals, balances, rates, invoice numbers, PO numbers, GRN numbers, account codes, GL codes, VAT numbers, tax IDs, dates in tables, batch IDs, status codes | Use `font-variant-numeric: tabular-nums` for column alignment |

**Gold rule**: Any string that represents a monetary value, financial identifier, or accounting code renders in JetBrains Mono. If in doubt, use JetBrains Mono.

### 4.2 Type Scale (AP-Specific)

| Level | Size | Weight | Line Height | Font | Usage in AP |
|-------|------|--------|-------------|------|-------------|
| **Hero metric** | 32px | Bold (700) | 40px | JetBrains Mono | Dashboard-level KPI values (e.g., "Total AP: $2,450,890") |
| **Metric** | 24px | Bold (700) | 32px | JetBrains Mono | Card-level metric values (e.g., invoice amount, batch total) |
| **Heading 1** | 20px | Semibold (600) | 28px | Inter | Page title (e.g., "Accounts Payable — Invoice Detail") |
| **Heading 2** | 18px | Semibold (600) | 24px | Inter | Section heading (e.g., "Match Results", "Approval Chain") |
| **Heading 3** | 16px | Medium (500) | 22px | Inter | Card title, panel heading (e.g., "Vendor Profile") |
| **Subheading** | 14px | Medium (500) | 20px | Inter | Column headers, subsection labels, badge text, form labels |
| **Body** | 14px | Regular (400) | 20px | Inter | Descriptions, table cell text (non-financial), forms |
| **Body small** | 13px | Regular (400) | 18px | Inter | Dense table cells, filter labels, help text |
| **Caption** | 12px | Regular (400) | 16px | Inter | Timestamps, footnotes, legal text, secondary metadata |
| **Caption small** | 11px | Regular (400) | 14px | Inter | Ultra-compact mode, SLA countdowns, inline error messages |
| **Monetary table** | 14px | Regular (400) | 20px | JetBrains Mono | Standard table cell amounts |
| **Monetary compact** | 12px | Regular (400) | 16px | JetBrains Mono | Ultra-compact table cell amounts |
| **Code/ID** | 14px | Regular (400) | 20px | JetBrains Mono | Invoice numbers, PO numbers, account codes |

### 4.3 Number Formatting Standards

```
Positive amount:           $12,450.00     — JetBrains Mono, tabular-nums, right-aligned
Negative amount:          ($2,450.00)    — JetBrains Mono, tabular-nums, text.error, parentheses
Zero amount:               $0.00          — JetBrains Mono, tabular-nums, text.muted
Invoice number:           INV-2026-0451   — JetBrains Mono, left-aligned
Account code:             4000-100-01     — JetBrains Mono, left-aligned
Date (standard):          28 Jul 2026     — JetBrains Mono (for tables), right-aligned
Date (compact):           28 Jul          — JetBrains Mono (for tight columns)
Time:                     14:30           — JetBrains Mono, tabular-nums
Percentage:               +3.75%          — JetBrains Mono, green (positive) or red (negative)
Currency symbol:          Always $ prefix — never suffix; always ISO 4217 for multi-currency
Digit grouping:           Thousands separator (comma for en, space for ar)
Decimal places:           2 for display, 4 for detail views, 12 internal (Decimal(38,12))
```

**Negative amount display rules:**
- Always parentheses, never minus sign: `($2,450.00)`, not `-$2,450.00`
- Red colour (`status.red` / `#ef4444`)
- Only amounts can be negative — invoice numbers, account codes, IDs are never displayed as negative

**Positive amount display rules:**
- Default white colour (`text.primary`)
- Green (`status.green`) only if showing savings, discounts captured, or favourable variance
- Gold (`status.gold`) for approved/active amounts

---

## 5. Monetary Display

### 5.1 Decimal Precision by Context

| Context | Decimal Places | Format | Example |
|---------|---------------|--------|---------|
| Dashboard KPI | 0 (round millions) | `$2.45M` | Total AP outstanding |
| Dashboard KPI (precise) | 2 | `$2,450,890.00` | When expanded |
| Table cell (standard) | 2 | `$12,450.00` | Invoice amount |
| Table cell (compact) | 2 | `$12.4K` | Amount abbreviate at > 10K |
| Detail view | 2 (or 4 for unit prices) | `$12,450.00` / `$85.2500` | Invoice detail, line items |
| Batch total | 2 | `$245,890.00` | Payment batch total |
| Variance | 2 | `+$450.00 (+3.75%)` | Match variance |
| Unit price | 4 | `$85.2500` | Line item unit price |
| Tax rate | 2 (percentage) | `15.00%` | VAT/GST rate |
| Exchange rate | 6 | `1.234500` | FX rate display |
| Internal precision | 12 | — | Storage only (Decimal(38,12)) |

### 5.2 Monetary Value Rendering (JetBrains Mono)

All monetary values in tables and cards must:
1. Use JetBrains Mono with `font-variant-numeric: tabular-nums` (fixed-width digits for column alignment)
2. Be right-aligned in table columns (alignment of decimal points)
3. Include currency symbol (always prefix, never suffix)
4. Use `financialRound(2)` for display (banker's rounding via `src/lib/financial-precision.ts`)
5. Never truncate or round to 0 decimal places in detail views (KPI summaries may abbreviate)
6. Show negative values in parentheses with `status.red` colour

### 5.3 Amount Abbreviation Rules

| Amount Range | Format (Standard) | Format (Ultra-Compact) |
|-------------|-------------------|----------------------|
| < $1,000 | $850.00 | $850 |
| $1,000 – $999,999 | $12,450.00 | $12.5K |
| $1,000,000 – $999,999,999 | $1,245,890.00 | $1.25M |
| ≥ $1,000,000,000 | $1,245,890,000.00 | $1.25B |

- Abbreviation is disabled in detail views and audit exports (full precision required)
- Hover on abbreviated amount shows full precision tooltip

---

## 6. Component Library — AP Screen Map

### 6.1 Screen-to-Component Mapping

| Screen | Primary Components | Density | Key Interactions | Reference |
|--------|-------------------|---------|-----------------|-----------|
| **Invoice List** | `EnterpriseTable`, `TableSearch`, `TablePagination`, `Toolbar`, `MultiSort` | Compact/Ultra-Compact | Bulk select, sort by 5+ columns, filter by status/date/vendor, expand row for line detail | Phase 8B.4 |
| **Invoice Detail** | `EnterpriseForm`, `EnterpriseSection`, `AnimatedCard`, `InlineEdit`, `AttachmentList` | Comfortable | Tab-navigable line grid, inline edit amounts, AI confidence badges per field | Phase 8B.6 |
| **Exception Queue** | `AnimatedCard` (exception cards), `FilterBar`, `SortDropdown`, `SLACountdown` | Compact/Comfortable | Card-based (not table), severity border, SLA timer, resolve/ escalate buttons | Phase 8B.7 |
| **Exception Resolution** | `EnterpriseForm`, `ConditionEditor`, `SmartSelect`, `AIInsightPanel`, `ConfirmDialog` | Comfortable | Root cause dropdown, resolution textarea, evidence links, amount adjustment | Phase 8B.6 |
| **Approval Dashboard** | `ApprovalPreview`, `AnimatedCard`, `WorkflowCanvas`, `QuickActionBar` | Compact | Visual approval chain, approve/reject/delegate buttons, context panel | Phase 8B.6, 8B.8 |
| **Approval Detail** | `EnterpriseForm`, `AnimatedCard`, `EvidencePanel`, `AIRecommendationBox` | Comfortable | Invoice + PO + GRN side-by-side, AI risk score, approve/reject with reason | Phase 8B.6 |
| **Payment Batches** | `EnterpriseTable`, `BatchSummaryCard`, `ProgressBar`, `PaymentMethodBadge` | Compact | Batch total running sum, method selector, invoice picker, type-to-confirm | Phase 8B.4 |
| **Vendor List** | `EnterpriseTable`, `TableSearch`, `SmartSelect` (filter by status), `VendorRiskBadge` | Compact/Ultra-Compact | Sort by spend/risk/ageing, click for profile, bulk status change | Phase 8B.4 |
| **Vendor Profile** | `EnterpriseForm`, `EnterpriseSection`, `MetricCard` (4-KPI row), `TagList` | Comfortable | Edit vendor details, view history, manage banking, risk score card | Phase 8B.6 |
| **AP Dashboard** | `ExecutiveKpiCard`, `MetricGrid`, `ChartCard` (sparklines), `AnimatedMetric` | Comfortable | 4-KPI row, 7-day trend sparklines, aging distribution bar, approval funnel | Phase 8B.5 |
| **Payment Dashboard** | `ExecutiveKpiCard`, `CashFlowTimeline`, `ForecastChart`, `MetricGrid` | Comfortable | Cash position card, outflow forecast, discount capture table, batch status | Phase 8B.5 |
| **Three-Way Match View** | `EnterpriseTable` (line-level), `MatchStatusIndicator`, `VarianceColumn` | Compact | Line-by-line invoice vs PO vs GRN, variance %, tolerance indicator, override button | Phase 8B.4 |
| **Audit Trail** | `EnterpriseTable` (append-only log), `TimelineChart`, `ChecksumDisplay` | Ultra-Compact | Chronological event log, expanded event detail, checksum verification badge | Phase 8B.4 |
| **GL Coding** | `EnterpriseTable` (line items), `SmartSelect` (account picker), `ConfidenceBadge` | Compact | Suggested codes with confidence, alternatives dropdown, confirm button | Phase 8B.6 |
| **Reconciliation** | `EnterpriseTable` (bank vs payments), `MatchPairCard`, `ExceptionBadge` | Compact | Side-by-side matching, auto-matched vs manual, exception items highlighted | Phase 8B.4 |

### 6.2 Component Behaviour Standards

| Behaviour | Specification | Reference |
|-----------|--------------|-----------|
| **Bulk selection** | Checkbox column in all list screens; "Select all N items" link in toolbar | Phase 8B.4 |
| **Row expansion** | Click chevron or double-click row to expand detail below row (inline, not modal) | Phase 8B.4 |
| **Inline editing** | Tab-navigate cells in line item grid; Enter confirms; Escape cancels | Phase 8B.4 |
| **Auto-save** | 2s debounce on all form fields; save indicator (saving/saved/failed) | Phase 8B.6 |
| **Undo** | 8s undo window for status changes; toast with "Undo" button | Phase 8B.6 |
| **Type-to-confirm** | Payments > $10K; "Type CONFIRM to proceed" — case-sensitive, button disabled until match | Phase 8B.6 |
| **Keyboard shortcuts** | Cmd+Z undo, Cmd+Shift+Z redo, Cmd+S save, Escape close modal, Tab/Shift+Tab form nav | Phase 8B.6, 8B.9 |
| **Sticky headers** | Table headers: `position: sticky; top: 0; z-index: 20` on `thead` | Phase 8B.4 |
| **Sticky columns** | Invoice number column pins left on horizontal scroll; checkbox column also pins | Phase 8B.4 |
| **Focus management** | Auto-focus first input in modal; focus trap in dialogs; return focus on close | Phase 8B.9 |
| **Selection glow** | Selected row: 2px `status.gold` left border + `surface.hover` background | Phase 8B.7 |

---

## 7. Patterns

### 7.1 Invoice Detail Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Invoice Detail                          Status: [Matched ✓]        │
│  INV-2026-0451                          AI Confidence: High · 94%   │
├──────────────────────┬──────────────────────────────────────────────┤
│  Vendor Information   │  Financial Summary                           │
│  ──────────────────   │  ─────────────────                          │
│  Acme Corporation     │  Subtotal:     $12,450.00                    │
│  VAT: GB1234567890    │  Tax (0%):       $0.00                      │
│  123 Business Rd      │  Total:      $12,450.00                      │
│  London, UK           │  Due: 15 Aug 2026                            │
│                        │  GL Code: 4000-100-01                       │
├──────────────────────┴──────────────────────────────────────────────┤
│  Line Items                                                          │
│  ┌───────┬──────────────┬─────┬──────────┬──────────┬────────┐      │
│  │ Item  │ Description  │ Qty │ Unit Price│ Amount   │ Code   │      │
│  ├───────┼──────────────┼─────┼──────────┼──────────┼────────┤      │
│  │ 1     │ Widget A     │ 100 │ $85.00   │ $8,500.00│ 6120   │      │
│  │ 2     │ Widget B     │  50 │ $79.00   │ $3,950.00│ 6120   │      │
│  │ 3     │ Setup Fee    │   1 │ $500.00  │ $500.00  │ 6140   │      │
│  └───────┴──────────────┴─────┴──────────┴──────────┴────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│  Match Results                                                       │
│  ┌───────┬──────────┬──────────┬──────────┬────────┬──────────┐     │
│  │ Item  │ Invoice  │ PO       │ GRN      │ Variance│ Status   │     │
│  ├───────┼──────────┼──────────┼──────────┼────────┼──────────┤     │
│  │ 1     │ $8,500.00│ $8,500.00│ $8,500.00│ $0.00  │ MATCH ✓  │     │
│  │ 2     │ $3,950.00│ $3,900.00│ $3,900.00│+$50.00 │ PARTIAL ⚠│     │
│  │ 3     │ $500.00  │ —        │ —        │ —      │ NO PO ✗  │     │
│  └───────┴──────────┴──────────┴──────────┴────────┴──────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│  AI Recommendation                                                    │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │ AI RECOMMENDS: APPROVE  ┌─────────────────────────────────┐   │   │
│  │ Confidence: High · 87%  │ Risk Score: 24/100 (Low)       │   │   │
│  │ [Show reasoning →]      │ Breakdown: Vendor 8/30,        │   │   │
│  │                         │ Price 3/25, Match 5/20,        │   │   │
│  │                         │ Budget 4/15, Timing 4/10       │   │   │
│  │                         └─────────────────────────────────┘   │   │
│  │ [Approve] [Reject] [Escalate]                                  │   │
│  └───────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  Activity Timeline                                                    │
│  ● CAPTURED      28 Jul 09:14  AI: 94% confidence                    │
│  ● VALIDATED     28 Jul 09:17  Evidence linked: PO, GRN, Contract    │
│  ● MATCHED       28 Jul 09:19  2/3 lines auto-matched, 1 partial     │
│  ◌ APPROVED      —             Awaiting [Controller]                 │
├─────────────────────────────────────────────────────────────────────┤
│  [Save Draft] [Submit for Approval]                                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Layout rules:**
- Two-column top section (vendor info + financial summary), equal width, `spacing.lg` gap
- Line items: full-width table, sticky header, editable (compact mode) or read-only (approved)
- Match results: full-width table, colour-coded variance cells, tolerance indicator column
- AI recommendation: gold left border (`status.gold` 3px), `status.blue` 8% background
- Activity timeline: vertical dot-and-line timeline, compact, `text.secondary` for timestamps
- Action bar: sticky bottom, `surface.card` background, right-aligned buttons

### 7.2 Approval View Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Approval Required — Invoice INV-2026-0451                          │
│  Amount: $12,450.00 · Vendor: Acme Corporation · Due: 15 Aug 2026  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                              │
│  │ Invoice │ │ PO      │ │ GRN     │ — tabbed document viewer       │
│  └─────────┘ └─────────┘ └─────────┘                              │
├─────────────────────────────────────────────────────────────────────┤
│  AI Summary                                                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ✓ Matched (1 partial — $50 variance within tolerance)        │  │
│  │ ✓ No duplicate detected                                       │  │
│  │ ✓ Vendor history clean (47 invoices, 98% on-time)             │  │
│  │ ✓ Within budget ($45K remaining of $120K)                     │  │
│  │ ⚠ Line 3 (Setup Fee): $500 — no PO evidence                   │  │
│  │ Risk Score: 24/100 (Low) — recommend APPROVE                  │  │
│  │                                                               │  │
│  │ [Show full reasoning →]                                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  Approval Chain                                                      │
│  ┌───[x]───[AP Manager]───[ ]───[Controller]───[ ]───[CFO]───┐     │
│  │   Pending (2h)           ✓ Approved (1h)    — Not required  │     │
│  └─────────────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│  [Approve] [Reject] [Delegate] [Escalate]  |  Reason: [________]    │
└─────────────────────────────────────────────────────────────────────┘
```

**Layout rules:**
- Header: amount in JetBrains Mono 24px bold, vendor + due in Inter 14px secondary
- Tabbed document viewer: 3 tabs (Invoice, PO, GRN), each showing document image + extracted data
- AI summary: gold left border, bullet list with ✓/⚠ icons, collapsible reasoning section
- Approval chain: horizontal connected-node visual, colour-coded (green = approved, amber = pending, gray = not required)
- Action bar: 4 action buttons (approve/reject/delegate/escalate) + mandatory reason field

### 7.3 Exception Queue Card

```
┌─[3px status.red border]─────────────────────────────────────────────┐
│  ⚠ Price Mismatch                         HIGH · [SLA: 2h 14m]     │
│  ─────────────────────────────────────────────────────────────────  │
│  INV-2026-0451 · Acme Corporation · $12,450.00                      │
│  Expected: $12,000.00 (PO-7821) · Received: $12,450.00             │
│  Variance: +$450.00 (+3.75%) — Outside tolerance (2%)              │
│                                                           [Resolve] │
│  AI: Root cause — price increase not reflected in PO (78% conf)    │
└─────────────────────────────────────────────────────────────────────┘
```

**Card properties:**
- Height: auto (min 140px comfort, 100px compact)
- Left border: 3px `status.red` for CRITICAL/HIGH, `status.amber` for MEDIUM, `status.blue` for LOW
- SLA countdown: JetBrains Mono 12px, red if < 1h, amber if < 4h, green if > 4h
- Amount: JetBrains Mono 18px semibold (comfort) or 14px regular (compact)
- Variance: JetBrains Mono 14px, red if outside tolerance, gold if within
- AI root cause line: `text.secondary` 12px, collapsible to full explanation
- Action button: "Resolve" EDL button primary, right-aligned

### 7.4 Payment Proposal Card

```
┌─────────────────────────────────────────────────────────────────────┐
│  Payment Proposal #47                      [Treasury Approval Pending]│
│  ▸ Total: $245,890.00 · 12 invoices · ACH (Chase ····4521)         │
│  ─────────────────────────────────────────────────────────────────  │
│  Discount captured: $4,200.00 (2/10 Net 30 — paying on day 8)      │
│  Cash impact: $245,890.00 outflow · Available: $380,000.00         │
│  Est. completion: 30 Jul 14:00                                      │
│                                                     [Review →]      │
└─────────────────────────────────────────────────────────────────────┘
```

**Card properties:**
- Total: JetBrains Mono 24px bold, white
- Invoice count + method: Inter 14px secondary
- Discount captured: green (`status.green`) text, JetBrains Mono 14px
- Cash impact: JetBrains Mono 14px, green if within available, red if exceeding
- Progress: linear progress bar (processing only), 4px height

### 7.5 Vendor Profile Header

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Risk: Low] Acme Corporation                   Status: Active ✓    │
│  ─────────────────────────────────────────────────────────────────  │
│  Open invoices: 5       |  Total spend (YTD): $450,000             │
│  Avg days to pay: 22    |  Last payment: 15 Jul 2026               │
│  On-time rate: 98%      |  Disputes: 1 in 24 months                │
│                                                                     │
│  [View Invoices] [Create Invoice] [Edit Vendor] [Suspend]           │
└─────────────────────────────────────────────────────────────────────┘
```

**Header properties:**
- Risk badge: 24px, colour-coded (green/amber/red per score)
- Vendor name: Inter 20px semibold
- Metric row: Inter 12px secondary, evenly spaced with `·` separator
- Action buttons: horizontal row, secondary actions (not primary), 4 max

---

## 8. Accessibility

All AP screens must meet WCAG 2.1 AA. No exceptions.

### 8.1 Interaction Requirements

| Requirement | Specification | WCAG Reference |
|-------------|--------------|----------------|
| **Touch targets** | Minimum 44×44px for all buttons, links, and interactive elements (icons with actions, badge clicks, sort headers, checkbox cells) | 2.5.5 |
| **Focus indicators** | 2px `border.focus` (`#d4af37`) outline, 2px offset, visible on all focusable elements — never removed, never hidden | 2.4.7 |
| **Keyboard navigation** | Tab order follows visual layout; all actions reachable via keyboard; no keyboard traps; arrow keys in tables and grids; Enter/Space to activate; Escape to close/ cancel | 2.1.1, 2.1.2 |
| **Skip navigation** | Skip link as first focusable element on every page — "Skip to content" links to main content area | 2.4.1 |
| **Screen reader announcements** | Live regions (`aria-live="polite"`) for status changes, batch progress, exceptions, approvals | 4.1.3 |

### 8.2 ARIA Labels by Component

| Component | Required ARIA | Example |
|-----------|--------------|---------|
| Status badge | `aria-label="Status: Matched — all line items within tolerance"` | `<span aria-label="Status: Matched" role="status">Matched</span>` |
| Sort button | `aria-label="Sort by amount, descending. Currently sorted ascending."` | `<button aria-label="Sort by amount" aria-sort="ascending">` |
| Checkbox (bulk) | `aria-label="Select all 25 invoices on this page"` | `<input aria-label="Select all invoices" type="checkbox">` |
| Checkbox (row) | `aria-label="Select invoice INV-2026-0451 for batch action"` | `<input aria-label="Select invoice INV-2026-0451" type="checkbox">` |
| Action button | `aria-label="Approve invoice INV-2026-0451 for $12,450.00 from Acme Corp"` | `<button aria-label="Approve invoice INV-2026-0451">Approve</button>` |
| SLA countdown | `aria-label="SLA remaining: 2 hours 14 minutes — on track"` | `<span aria-label="SLA remaining: 2 hours 14 minutes">2h 14m</span>` |
| Progress bar | `aria-valuenow="45"` `aria-valuemin="0"` `aria-valuemax="100"` `aria-label="Payment batch processing: 45% complete"` | `<div role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100">` |
| Toast | `role="status"` `aria-live="polite"` — for non-critical; `role="alert"` `aria-live="assertive"` for critical | — |
| Error message | `role="alert"` `aria-live="assertive"` — announced immediately | — |
| Modal | `role="dialog"` `aria-modal="true"` `aria-labelledby="modal-title"` — focus trap, Escape to close | — |
| Tab panel | `role="tablist"` `role="tab"` `aria-selected` `role="tabpanel"` | — |
| Data table | `<table>` with `<caption>` or `aria-label`; `<th>` with `scope="col"` or `scope="row"` | — |

### 8.3 Colour Independence

- Every status conveyed by colour must also have a text label or icon — no information conveyed by colour alone
- Status badges include text ("Matched", "Exception", "Approved"), not just colour
- Trend arrows (↑ green / ↓ red / → gray) supplement colour with directional symbols
- Error states use border + icon + text, never red colour alone
- Charts use patterns (hatching, dashes) in addition to colour for series differentiation

### 8.4 Keyboard Navigation Map (Invoice List)

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element (top-left to bottom-right) |
| `Shift+Tab` | Move to previous focusable element |
| `↑` / `↓` | Navigate rows in table (single select) |
| `Space` | Toggle checkbox on focused row |
| `Shift+Space` | Toggle checkbox on focused row + extend selection |
| `Enter` | Open row expansion (detail panel below row) |
| `Shift+Enter` | Open full detail view (slide-in panel) |
| `Escape` | Close expanded row / close panel / close modal |
| `Ctrl+A` | Select all visible rows |
| `Ctrl+F` | Focus search bar |
| `F2` | Enter inline edit mode on cell (if editable) |
| `Delete` | Bulk delete selected (with confirmation) |
| `?` | Open keyboard shortcuts dialog |

### 8.5 Motion and Reduced Motion

All animations respect `prefers-reduced-motion: reduce`:
- Reduced motion: instant transitions (0ms duration), no shimmer, no pulse, no slide-in, no stagger
- Sparklines render as static images when motion is reduced
- Page transitions become instant (no fadeInUp)
- Skeleton shimmer becomes static placeholder
- Toasts appear instantly (no slide animation)
- MotionProvider (`src/components/enterprise/motion/provider.tsx`) detects and applies reduced motion globally

---

## 9. Motion

### 9.1 Motion Tokens (from EDL)

| Token | Value | When to Use |
|-------|-------|-------------|
| `duration.fast` | 100ms | Hover states, micro-interactions, button press, colour transitions |
| `duration.normal` | 200ms | Toast appear/dismiss, badge updates, focus ring, collapse/expand small sections |
| `duration.slow` | 400ms | Page transitions, panel slide-in, modal open/close, section expansion |
| `duration.xslow` | 600ms | Metric counter animation, progress bar fill, batch processing indicator |
| `easing.out` | cubic-bezier(0.16, 1, 0.3, 1) | Entrances — page transitions, card appear, panel slide-in |
| `easing.inOut` | cubic-bezier(0.65, 0, 0.35, 1) | State changes — expand/collapse, badge transition, sort indicator |
| `easing.in` | cubic-bezier(0.4, 0, 1, 1) | Exits — toast dismiss, panel slide-out, row removal |

**No spring physics.** All AP motion uses cubic-bezier easing curves. Spring physics (overshoot, bounce) are inappropriate for financial software where stability and predictability are paramount.

### 9.2 AP-Specific Motion Specifications

| Element | Animation | Duration | Easing | Trigger | Reduced Motion |
|---------|-----------|----------|--------|---------|----------------|
| Page transition | fadeInUp (opacity 0→1, y 8→0) | 400ms | ease-out | Route change | Instant appear |
| Section transition | fadeIn (opacity 0→1) | 350ms | ease-out | Section mount | Instant appear |
| Table row entrance | stagger fadeInUp, 20ms delay per row | 200ms per row | ease-out | Data load | Instant appear |
| Card hover | elevation increase (shadow 0→shadow md) | 100ms | ease-out | Hover enter | No change |
| Card select | left border appear (0→3px) | 100ms | ease-out | Click | No change |
| Button press | scale 1→0.97 | 100ms | ease-out | mousedown | No change |
| Toast appear | slideInRight (x 100%→0) | 200ms | ease-out | Toast trigger | Instant appear |
| Toast dismiss | fadeOut + slideOutRight | 150ms | ease-in | Auto/timeout | Instant hide |
| Modal backdrop | fadeIn (opacity 0→1) | 200ms | ease-out | Modal open | Instant |
| Modal content | scaleIn (scale 0.95→1) | 200ms | ease-out | Modal open | Instant |
| Panel slide-in | slideInRight (x 100%→0) | 400ms | ease-out | Panel open | Instant |
| Skeleton shimmer | gradient shift left→right | 1.5s loop | linear | Loading | Static placeholder |
| Metric counter | count up 0→N | 600ms | ease-out (cubic) | Metric visible | Instant display |
| Status badge change | cross-fade (opacity 1→0→1) | 200ms | ease-in-out | Status change | Instant swap |
| Progress bar fill | width 0→N% | 400ms | ease-out | Progress update | Instant |
| Expand/collapse | height 0→auto (max-height) | 300ms | ease-in-out | Toggle | Instant |
| AI recommendation | highlight pulse (opacity 1→0.8→1) | 500ms | ease-in-out | New rec appears | No pulse |

### 9.3 Animation Rules

1. **Never animate for the sake of animation** — every animation serves a purpose: draw attention, indicate state change, or provide spatial orientation
2. **Never block interaction** — all animations are non-blocking; user can interact while animation plays
3. **Never exceed 600ms** — maximum animation duration for any element
4. **Never animate layout properties (width, height, top, left)** on critical path elements — use transforms (scale, translate, opacity) which are GPU-accelerated
5. **Stagger only when it aids scanning** — table row stagger helps users track rows as they appear; card stagger on dashboard helps users absorb KPIs sequentially
6. **Respect reduced motion** — all animations disabled via MotionProvider when `prefers-reduced-motion: reduce`

---

## 10. Implementation Notes

### 10.1 Required Imports

```typescript
// Always import from EDL tokens, never hardcode values
import { colors } from '@/design-system/edl/colors';
import { typography } from '@/design-system/edl/typography';
import { spacing } from '@/design-system/edl/spacing';
import { motion } from '@/design-system/edl/motion';

// Component presets
import { Button, Card, Input, Badge, Table } from '@/design-system/edl/components';

// Motion components
import { AnimatedCard, PageTransition, AnimatedTableRow } from '@/components/enterprise/motion';

// Enterprise table (for AP data grids)
import { EnterpriseTable, type CellConfig } from '@/components/enterprise/table';

// Enterprise forms (for AP forms)
import { EnterpriseForm, EnterpriseSection, EnterpriseField } from '@/components/enterprise/forms';

// Financial precision
import { financialRound, formatDecimalCurrency, toDisplayNumber } from '@/lib/financial-precision';
```

### 10.2 Code Generation Rules

1. **Use EDL component presets** — never build custom Button, Card, Input, Badge, Table, Dialog, Toast, Tooltip, or Skeleton from scratch. Always extend EDL presets.
2. **Use `financialRound(2)` for display** — never use `Number.toFixed()`, `Math.round()`, or inline rounding for monetary display
3. **Use JetBrains Mono + tabular-nums** for all monetary values — CSS: `font-family: var(--font-mono); font-variant-numeric: tabular-nums;`
4. **Use `formatDecimalCurrency()`** from `src/lib/financial-precision.ts` for all monetary display strings
5. **Use `PageTransition`** from `src/components/enterprise/motion` for all page-level animations
6. **Use `AnimatedTableRow`** with stagger for all table row entrances in data lists
7. **Use `AnimatedCard`** for all card-based layouts (exception queue, vendor cards, payment cards)
8. **Use `EnterpriseForm`** as the root wrapper for all form-based screens (invoice entry, vendor edit, exception resolution)
9. **Use `EnterpriseTable`** (not base `DataTable`) for all AP data grids — supports cell formatters for currency/date/status columns

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Foundation | [[PLATFORM_CONSTITUTION]] | Highest engineering authority — design must comply |
| Product | [[ENTERPRISE_PRODUCT_SPECIFICATION_AP]] | Master product spec — this document is the design chapter |
| Design | [[AI_BEHAVIOUR_GUIDE]] | AI explainability and confidence display patterns |
| Workflow | [[REFERENCE_WORKFLOW_AP]] | 10-stage workflow this design supports |
| Tokens | `src/design-system/edl/` | EDL token source of truth |
| Components | `src/components/enterprise/` | Component library reference |
| Components | `src/components/enterprise/table/` | Enterprise Table system reference |
| Forms | `src/components/enterprise/forms/` | Enterprise Form system reference |
| Motion | `src/components/enterprise/motion/` | Motion component reference |
| Financial | `src/lib/financial-precision.ts` | Financial display helpers |

---

## Version History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0 | 2026-07-28 | Phase 27.1 — Design System Guide for AP Reference Workflow | Design Systems Team |
