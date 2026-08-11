# PEDS — Dashboard Screen Specification

## Source
**EPS Reference**: `INFORMATION_ARCHITECTURE.md` Section 4 (Dashboard)
**Decision**: Answers "What do I do today?" on arrival (P8)
**Persona**: All — AP Clerk starts here, CFO checks here

## 1. Screen Anatomy

```
┌──────────────────────────────────────────────────────────────────┐
│  Top Navigation (56px, `topbar.bg`)                              │
├────────────┬─────────────────────────────────────────────────────┤
│  Sidebar   │  Dashboard Content (scrollable)                     │
│  (280px)   │                                                     │
│            │  ┌── Page Header ────────────────────────────────┐  │
│            │  │  "AP Dashboard" · "What requires attention?"   │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                     │
│            │  ┌── Section: Attention Queue (full width) ──────┐  │
│            │  │  Section label: "Attention Queue" + badge(5)   │  │
│            │  │  ┌────────┬────────┬────────┬────────┬──────┐  │  │
│            │  │  │ Item 1 │ Item 2 │ Item 3 │ Item 4 │ View │  │  │
│            │  │  │        │        │        │        │ All→ │  │  │
│            │  │  └────────┴────────┴────────┴────────┴──────┘  │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                     │
│            │  ┌── Section: Key Metrics (full width) ──────────┐  │
│            │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───┐  │  │
│            │  │  │Invoices  │ │Pending   │ │Open      │ │DPO │  │  │
│            │  │  │Today     │ │Approval  │ │Exceptions│ │36d │  │  │
│            │  │  │47 vs 42  │ │23/$182K  │ │12 (3 crt)│ │+2d │  │  │
│            │  │  └──────────┘ └──────────┘ └──────────┘ └───┘  │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                     │
│            │  ┌── Section: Active Items (2-col split) ────────┐  │
│            │  │  ┌── Left (50%) ────────────┐                  │  │
│            │  │  │  "Aging Snapshot"         │                  │  │
│            │  │  │  ┌──────────────────────┐ │                  │  │
│            │  │  │  │ Current │ 1-30 │ 60+ │ │                  │  │
│            │  │  │  │  45%    │ 25%  │ 30% │ │                  │  │
│            │  │  │  └──────────────────────┘ │                  │  │
│            │  │  └───────────────────────────┘                  │  │
│            │  │  ┌── Right (50%) ───────────┐                  │  │
│            │  │  │  "AI Insights"            │                  │  │
│            │  │  │  ┌──────────────────────┐ │                  │  │
│            │  │  │  │ ● 12 invoices overdue│ │                  │  │
│            │  │  │  │ ● 3 potential dupes  │ │                  │  │
│            │  │  │  │ ● Cash $180K avail   │ │                  │  │
│            │  │  │  └──────────────────────┘ │                  │  │
│            │  │  └───────────────────────────┘                  │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                     │
│            │  ┌── Status Bar ─────────────────────────────────┐  │
│            │  │  Data as of: 2m ago · Source: Prisma · Cache  │  │
│            │  └───────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────────┘
```

---

## 2. Existing PEDS Components Used

| Screen Element | PEDS Component | Variant | File Reference |
|---------------|----------------|---------|----------------|
| App Shell | Application Shell | Expanded | `navigation-layout-specs.md` §1 |
| Top Navigation | Top Navigation | HasBreadcrumb=true, HasSearch=true | `navigation-layout-specs.md` §4 |
| Sidebar | Sidebar Expanded | Group: finance, Active: Dashboard | `navigation-layout-specs.md` §2 |
| Page Header | Workspace Layout > Page Header | — | `navigation-layout-specs.md` §10 |
| Attention Queue items | Card/Exception | Severity varies | `component-library-specs.md` §3 |
| KPI Cards | Card/Metric (KPI Card variant) | — | `component-library-specs.md` §5 |
| Aging Snapshot | Timeline + Property List | — | `component-library-specs.md` §5 |
| AI Insights | Card/AI Summary | State=Ready | `ai-financial-specs.md` §1.1 |
| Exception Feed items | Card/Exception | severity=warning/error/critical | `component-library-specs.md` §3 |
| Status Bar | Status Bar | optional | `navigation-layout-specs.md` §1 |
| Data Freshness text | Definition List | — | `component-library-specs.md` §5 |
| Badges | Badge / Status Chip | Various | `component-library-specs.md` §6 |

**No new components introduced.** All elements are compositions of existing PEDS parts.

---

## 3. Layout Spec (1440×900 viewport)

### 3.1 Application Shell
**Frame**: Auto Layout, Vertical, W:1440, H:900
- Fill: `surface.base`

**Children**:
1. **Top Navigation** (H:56px, Fill)
2. **Content Area** (Horizontal, Fill remaining)
   - **Sidebar** (W:280px, Fill height)
   - **Main Content** (Vertical, Fill remaining)

### 3.2 Top Navigation
**Component**: `TopNavigation` with HasBreadcrumb=true
- Breadcrumb: "Dashboard" (style `h4`, `text.primary`)
- Right: Search icon + Notifications (icon + badge[3]) + User Menu

### 3.3 Sidebar
**Component**: `Sidebar/Expanded` with Active="Dashboard"
**Groups**:
- **Navigation**: Dashboard (active), Work Queue, Exceptions, Payments, Reports
- **Finance**: Vendors, Invoices, Payments, GL
- **Settings**: (bottom) Profile, Settings

### 3.4 Page Header
**Frame**: Auto Layout, Horizontal, Fill, padding: `page-padding` 24px 24px 0
- Gap: 8px

**Children**:
1. Title: "AP Dashboard" (style `h2`, `text.primary`)
2. Description: "What requires attention?" (style `body`, `text.secondary`)
3. Right: Refresh button (IconButton, tooltip "Refresh data")

### 3.5 Dashboard Content
**Frame**: Auto Layout, Vertical, Fill (scrollable)
- Padding: 24px (page-padding)
- Gap: 24px (section-gap)

**Children** (4 sections):

---

## 4. Section: Attention Queue

### 4.1 Section Header
**Frame**: Auto Layout, Horizontal, Fill
- Gap: 8px
- Items: center, space-between

**Children**:
1. Label: "Attention Queue" (style `h3`, `text.primary`)
2. Badge: "5 items" (Badge/Gold, style `badge`)
3. Right: "View All →" (style `link`, `text.link`)

### 4.2 Queue Items
**Frame**: Auto Layout, Vertical, Fill
- Border: 1px, `border.default`
- Radius: `card` (8px)
- Overflow: hidden

#### Queue Item Row
**Frame**: Auto Layout, Horizontal, Fill
- H: 48px
- Padding: 0 16px
- Gap: 12px
- Items: center
- Border-Bottom: 1px, `table.row-border`
- Fill: transparent (hover: `table.row-hover`)

**Children** (left to right):
| Column | Width | Component | Content |
|--------|-------|-----------|---------|
| Urgency icon | 20px | Icon (AlertCircle/FileText/Clock) | Colour: `status.warning` / `status.info` |
| Type | 120px | Badge | Badge/Warning "Invoice" / Badge/Info "Exception" |
| Description | Fill | Text (style `sm-medium`, `text.primary`) | "INV-042 — Acme Corp — $12,400" |
| Amount | 120px | Text (style `financial-sm`) | "$12,400.00" (right-aligned) |
| SLA | 80px | Text (style `xs`) | "Due in 4h" (red if overdue) |
| Action | 80px | IconButton | ChevronRight |

**5 rows total.** Last row has "View All →" as a full-width button.

### 4.3 Spec Visualization
```
┌──────────────────────────────────────────────────────────────────┐
│  Attention Queue           [Gold badge: 5 items]   [View All →]  │
├──────┬───────────┬──────────────────────────┬──────────┬────────┤
│  🔔  │  Invoice  │ INV-042 — Acme Corp      │ $12,400  │ Due 4h │
│  ⚠️  │ Exception │ PO-891 — Price mismatch  │  $2,400  │ Overdue│
│  🔔  │  Invoice  │ INV-051 — Beta Ltd       │  $8,900  │ Due 1d │
│  🔔  │  Payment  │ PMT-023 — VendorX        │ $45,000  │ Due 2d │
│  📄  │  Approval │ 23 items pending         │  $182K   │ —      │
└──────┴───────────┴──────────────────────────┴──────────┴────────┘
```

---

## 5. Section: Key Metrics

### 5.1 Container
**Frame**: Auto Layout, Horizontal, Fill
- Gap: 16px
- Items: stretch (equal width)

### 5.2 KPI Cards (4)

Each card is:
**Component**: `Card/Metric` (3px gold top border)
- Fill: `surface.raised`
- Border: `border.default`
- Shadow: `shadow.soft`
- Radius: `card` (8px)
- Padding: `card-padding` (20px)
- Gap: 4px (via card-gap-small)

**Children** (Auto Layout, Vertical):
1. **Label**: style `xs`, `text.secondary`
2. **Value**: style `financial-lg` (32px, bold, mono), `text.primary`
3. **Trend Row**: Horizontal, gap 8px, items center
   - Arrow: ↑ or ↓, style `sm`, colour `financial.positive`/`financial.negative`
   - Percentage/text: style `sm`, matching colour
4. **Sub-label**: style `xs`, `text.tertiary`

### 5.3 KPI Details

| KPI | Label | Value (example) | Trend | Sub-label | Accent Condition |
|-----|-------|-----------------|-------|-----------|-----------------|
| 1 | Invoices Today | 47 | ↑ 12% (green) | vs. 42 avg past 7d | Gold accent if >avg |
| 2 | Pending Approval | 23 | $182K total (red if >$50K) | 8 urgent | Red if >$50K |
| 3 | Open Exceptions | 12 | ↓ 3 (green) | 3 critical | Red if critical>0 |
| 4 | Days Payable | 36 | ↑ 2d (green) | +2 days vs last month | Green if improving |

**Interaction**: Each KPI is clickable → navigates to context screen:
- Invoices Today → Work Queue
- Pending Approval → Work Queue (Approval tab)
- Open Exceptions → Exceptions
- DPO → Reports (DPO Trend)

**Timestamp**: Each card shows "As of HH:MM" (style `micro`, `text.tertiary`) per P1 (Trusted Information).

---

## 6. Section: Active Items (2-Column Split)

### 6.1 Container
**Frame**: Auto Layout, Horizontal, Fill
- Gap: 16px

### 6.2 Left Column — Exception Feed

**Frame**: Auto Layout, Vertical, flex: 1
- Border: 1px, `border.default`
- Radius: `card` (8px)
- Overflow: hidden

**Header** (H:44px, Horizontal, Fill, padding 12px 16px):
- Title: "Active Exceptions" (style `sm-medium`, `text.primary`)
- Badge: "12" (Badge/Error)
- Right: "View All →" (style `link`)

**Exception Items** (max 6, scrollable):
Each item: Frame, Auto Layout, Horizontal, H:52px, padding 8px 16px
- Left: Severity indicator (4px left border, `risk.critical`/`risk.high`/`risk.medium`)
- Icon: 16px, status colour
- VStack (gap 2px):
  - Title: "Acme Corp — Price mismatch" (style `sm-medium`, `text.primary`)
  - Meta: "$2,400 · PO-891 · 5m ago" (style `xs`, `text.tertiary`)
- Right: Severity badge (Badge/Error: "HIGH")

### 6.3 Right Column — AI Insights

**Component**: `Card/AI Summary` (state=Ready)
**Frame**: Auto Layout, Vertical, flex: 1

**Header Bar** (Horizontal, Fill, space-between):
- Sparkles icon (20px, `ai-card.accent`)
- "AI Insights" badge (`Badge/Gold`, style `micro`)
- Timestamp "Updated 3m ago" (style `xs`, `text.tertiary`)

**Insight Items** (3-4 items, Vertical, gap 12px):
Each insight:
- Frame: Auto Layout, Horizontal, Fill, gap 8px
- Left: dot (6×6, radius full, `ai.high` or `ai.medium`)
- VStack (gap 2px):
  - Text: "12 invoices from Acme Corp are overdue — avg payment is 45 days" (style `sm`, `text.primary`)
  - Meta Row: Confidence badge `Badge/Success "High"` + "View invoices →" (style `link`)
- Clickable → navigates to relevant screen

**Footer**: "View all insights →" (style `link`, right-aligned)

---

## 7. Section: Aging Snapshot

### 7.1 Container
**Frame**: Auto Layout, Vertical, Fill
- Border: 1px, `border.default`
- Radius: `card` (8px)
- Padding: `card-padding` (20px)
- Gap: 16px

### 7.2 Header
**Frame**: Horizontal, Fill, space-between
- "Aging Distribution" (style `sm-medium`, `text.primary`)
- "$2.45M Total Outstanding" (style `financial-sm`, `text.primary`)

### 7.3 Stacked Bar
**Frame**: Auto Layout, Horizontal, Fill, H:40px
- Radius: `sm` (4px)
- Overflow: hidden

**Segments** (width = percentage of total):

| Segment | % | Colour | Width (est) | Label |
|---------|---|--------|-------------|-------|
| Current | 45% | `financial.positive` | 45% | "Current: $1.1M" |
| 1-30 days | 25% | `status.success` (lighter) | 25% | "1-30: $612K" |
| 31-60 days | 15% | `status.warning` | 15% | "31-60: $367K" |
| 61-90 days | 10% | `status.warning` (darker) | 10% | "61-90: $245K" |
| 90+ days | 5% | `financial.negative` | 5% | "90+: $122K" |

Each segment is a RectangleNode with:
- Fill: segment colour
- Radius: 0 (first: left 4px, last: right 4px)
- Label inside: style `xs`, `text.inverse` (or `text.primary` on light segments)

### 7.4 Legend
**Frame**: Auto Layout, Horizontal, Fill, gap 16px, wrap
Each legend item: Horizontal, gap 6px, items center
- Dot: 8×8, radius full, segment colour
- Label: style `xs`, `text.secondary`

**Interaction**: Click segment → filters Work Queue by aging bucket.

---

## 8. Status Bar (Data Freshness)

### 8.1 Spec
**Frame**: Auto Layout, Horizontal, Fill
- H: 32px
- Padding: 0 24px
- Items: center, space-between
- Border-Top: 1px, `border.subtle`

**Left**: "Data as of: 2 minutes ago" (style `xs`, `text.tertiary`)
**Center**: "Source: Prisma · Cache: 30s TTL" (style `xs`, `text.tertiary`)
**Right**: Status dot (green: fresh, yellow: recent, red: stale) + "Auto-refresh in 45s" (style `xs`, `text.tertiary`)

### 8.2 Freshness States
| State | Dot | Text |
|-------|-----|------|
| Fresh (<1h) | `status.success` | "Data as of: X minutes ago" |
| Recent (1-24h) | `status.warning` | "Data as of: X hours ago" |
| Stale (>24h) | `status.error` | "Data may be stale — refresh recommended" |

---

## 9. Token Usage Audit

| Token | Used In |
|-------|---------|
| `surface.base` | App Shell background |
| `surface.raised` | Cards, panels |
| `surface.elevated` | Hover states |
| `surface.floating` | Dropdown menus |
| `surface.sidebar` | Sidebar |
| `text.primary` | All headings, values |
| `text.secondary` | Descriptions, body text |
| `text.tertiary` | Timestamps, metadata |
| `border.default` | Card borders, section borders |
| `border.subtle` | Dividers, subtle separators |
| `shadow.soft` | Default cards |
| `shadow.medium` | Interactive cards, hover |
| `brand.gold` | KPI card accents, active states |
| `brand.gold-muted` | AI badge background |
| `status.success` | Positive trends, current aging |
| `status.warning` | Aging 31-60, pending items |
| `status.error` | Negative trends, critical exceptions |
| `risk.critical` | Severity=Critical border |
| `risk.high` | Severity=High border |
| `risk.medium` | Severity=Medium border |
| `financial.positive` | Income, favourable variance |
| `financial.negative` | Expenses, unfavourable variance |
| `financial.pending` | Pending transactions |
| `ai.high` | High confidence dot |
| `ai.medium` | Medium confidence dot |
| `layout-semantic.page-padding` | 24px content padding |
| `layout-semantic.section-gap` | 32px between sections |
| `layout-semantic.card-padding` | 20px inside cards |
| `layout-semantic.sidebar-width` | 280px sidebar |
| `layout-semantic.topbar-height` | 56px top navigation |
| `border-radius.semantic.card` | 8px card radius |
| `border-radius.semantic.control` | 6px input/button radius |
| `border-radius.semantic.sm` | 4px bar segments |
| `typography.font-size.h2` | Page title (30px) |
| `typography.font-size.h3` | Section titles (20px) |
| `typography.font-size.sm-medium` | Body text (14px medium) |
| `typography.font-size.financial-lg` | KPI values (32px mono bold) |
| `typography.font-size.financial-sm` | Financial table values (14px mono) |
| `typography.font-size.xs` | Labels, metadata (12px) |
| `typography.font-size.micro` | Timestamps, badges (11px) |
| `typography.font-size.badge` | Badge text (11px semibold) |
| `typography.font-family.mono` | Financial values |

---

## 10. Responsive Behaviour

| Breakpoint | Layout Changes |
|------------|---------------|
| ≥1280px (xl) | Full layout as specified: expanded sidebar, 4 KPI row, 2-col split |
| 1024px (lg) | Sidebar collapsed (64px), KPIs stay at 4, split stays 2-col |
| 768px (md) | Sidebar hidden (overlay). KPIs → 2×2 grid. Split → stacked (exc above AI) |
| <768px (sm) | Single column. KPIs → scrollable row. AI insights → collapsed accordion. Aging → simplified bar. Attention queue → 3 items + view all |

### Tablet Adjustments (768-1023px)
- KPI row: 2 columns × 2 rows
- Exception feed + AI insights: stacked (not side-by-side)
- Aging bar: segments labelled inside, legend hidden
- Attention queue: 4 items (not 5)

### Mobile Adjustments (<768px)
- Sidebar: slide-out drawer (hamburger trigger)
- Top nav: condensed (hamburger + title only, no breadcrumb)
- KPI cards: horizontal scrollable row (snap)
- Exception feed: 3 items, expandable
- AI insights: collapsible header
- Aging: simplified % bar without labels
- Status bar: hidden

---

## 11. Build Steps (Figma)

### Step 1: App Shell
1. Create frame 1440×900, fill `surface.base`
2. Insert Top Navigation component (56px)
3. Insert Sidebar Expanded component (280px)
4. Remaining area = Main Content (Vertical, Fill)

### Step 2: Page Header
1. Auto Layout, Horizontal, Fill, padding 24-24-0
2. H2 text "AP Dashboard"
3. Body text "What requires attention?"
4. IconButton (refresh) right-aligned

### Step 3: Dashboard Content Frame
1. Auto Layout, Vertical, Fill (resize to contents)
2. Padding 24px all sides, gap 24px

### Step 4: Attention Queue Section
1. Section header: H3 + Gold badge + "View All" link
2. 5 queue item rows (existing Table/Row pattern)
3. Each row: icon + badge + description + amount + SLA + action
4. Last row: "View All" full-width

### Step 5: KPI Row
1. Auto Layout, Horizontal, Fill, gap 16px
2. 4 × Card/Metric with KPI Card children
3. Each: label, value (financial-lg), trend row, sub-label
4. Attach link interactions to each card

### Step 6: Active Items Split
1. Auto Layout, Horizontal, Fill, gap 16px
2. Left (flex:1): Exception Feed card with header + 6 items
3. Right (flex:1): AI Insights card with header + 3-4 insights

### Step 7: Aging Snapshot
1. Card/Default with padding
2. Header: title + total
3. Stacked bar: 5 segments with % widths
4. Legend row below

### Step 8: Status Bar
1. 32px bar at bottom
2. Data freshness text + status dot

### Token Mapping
All 40+ tokens are pre-mapped in Section 9. Apply via Tokens Studio.

---

## 12. Interaction Map

| Element | Interaction | Target |
|---------|-------------|--------|
| KPI: Invoices Today | Click | Work Queue (filtered: today) |
| KPI: Pending Approval | Click | Work Queue (tab: Approval) |
| KPI: Open Exceptions | Click | Exceptions screen |
| KPI: DPO | Click | Reports (DPO Trend) |
| Attention Queue items | Click | Respective item detail |
| Attention Queue "View All" | Click | Work Queue |
| Exception item | Click | Exception detail |
| AI Insight: "View invoices" | Click | Work Queue (filtered) |
| AI Insight: "View all" | Click | AI Insights panel |
| Aging segment | Click | Work Queue (aging filtered) |
| Refresh button | Click | Re-fetch dashboard data |
| "Auto-refresh" | Auto | Poll every 5 minutes |

---

## 13. Empty State (No Data)

If the dashboard has no data (first time, no invoices):

**Frame**: Card/Default, centered
1. Illustration: empty inbox (40×40, `text.disabled`)
2. Title: "No invoices to review" (style `h4`, `text.primary`)
3. Description: "Invoices will appear here once they are captured" (style `body`, `text.secondary`)
4. CTA: "Capture your first invoice" (Button/Primary)

---

## 14. Loading State

**Frame**: Same layout with skeleton placeholders:
- Attention Queue: 5 × Skeleton/Table-Row
- KPIs: 4 × Skeleton/Metric
- Exceptions: 6 × Skeleton/Text
- AI: Skeleton/Card + Skeleton/Text (3)
- Aging: Skeleton/Chart

---

## 15. Design Principles Validation

| Principle | How the Dashboard Satisfies It |
|-----------|-------------------------------|
| Decision First (P8) | Attention Queue answers "What do I do today?" on arrival. Top 5 items sorted by SLA. |
| Calm Enterprise UX | Spacious 24px padding, 32px section gaps. No visual noise. 4 KPIs, not 20. |
| AI Prepares | AI Insights panel summarises, explains, cites evidence. No AI decisions. |
| Evidence First | Every KPI has timestamp + source. AI insights link to source data. |
| Progressive Disclosure | 4 KPIs shown. Click → full detail. Aging snapshot → click → filtered queue. |
| Exceptions First (P5) | Exception feed visible directly. KPI shows critical count. SLA countdowns visible. |
| Trusted Information (P1) | "As of HH:MM" on every KPI. Status bar shows freshness, source, cache TTL. |
