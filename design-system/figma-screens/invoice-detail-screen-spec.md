# PEDS — Invoice Detail Screen Specification

## Source
**EPS Reference**: `INFORMATION_ARCHITECTURE.md` Section 6 (Invoice Detail)
**Decision Rating**: P8 — Decision Readiness. Answers "What decision is required, what evidence exists, and what happens next?"
**Persona**: AP Clerk (default), Approver, Auditor, Controller — with persona-based density modes
**Cognitive Load**: ~320 data points → reduced via progressive disclosure (4 persona modes)

## Component Inventory Cross-Check

| PEDS Component | Documentation Source | Verified in Inventory |
|----------------|---------------------|----------------------|
| Application Shell | `navigation-layout-specs.md` §1 | ✓ (#1) |
| Top Navigation | `navigation-layout-specs.md` §4 | ✓ (#3) |
| Sidebar Expanded | `navigation-layout-specs.md` §2 | ✓ (#1-2) |
| Breadcrumbs | `navigation-layout-specs.md` §8 | ✓ (#7) |
| Workspace Layout | `navigation-layout-specs.md` §10 | ✓ (Layout Primitive) |
| Split View | `navigation-layout-specs.md` §10 | ✓ (Layout Primitive) |
| Inspector Panel | `navigation-layout-specs.md` §10 | ✓ (Layout Primitive) |
| Status Bar | `navigation-layout-specs.md` §1 | ✓ (#1) |
| Tabs/Underline | `component-library-specs.md` §7 | ✓ (#42) |
| Button/Primary | `component-library-specs.md` §1 | ✓ (#9) |
| Button/Secondary | `component-library-specs.md` §1 | ✓ (#10) |
| Button/Ghost | `component-library-specs.md` §1 | ✓ (#11) |
| Button/Danger | `component-library-specs.md` §1 | ✓ (#12) |
| Button/Icon | `component-library-specs.md` §1 | ✓ (#13) |
| Card/Default | `component-library-specs.md` §3 | ✓ (#22) |
| Card/Elevated | `component-library-specs.md` §3 | ✓ (#23) |
| Card/Interactive | `component-library-specs.md` §3 | ✓ (#24) |
| Card/Metric | `component-library-specs.md` §3 | ✓ (#25) |
| Card/Decision | `component-library-specs.md` §3 | ✓ (#27) |
| Card/Evidence | `component-library-specs.md` §3 | ✓ (#28) |
| Card/Exception | `component-library-specs.md` §3 | ✓ (#29) |
| Card/AI Summary | `ai-financial-specs.md` §1.1 | ✓ (#30) |
| Card/Audit | `component-library-specs.md` §3 | ✓ (#31) |
| Invoice Summary Card | `ai-financial-specs.md` §2.4 | ✓ (#70) |
| Variance Card | `ai-financial-specs.md` §2.7 | ✓ (#73) |
| Exception Card | `ai-financial-specs.md` §2.8 | ✓ (#74) |
| Approval Summary Card | `ai-financial-specs.md` §2.9 | ✓ (#75) |
| Supplier Summary Card | `ai-financial-specs.md` §2.5 | ✓ (#71) |
| Evidence Panel | `ai-financial-specs.md` §1.3 | ✓ (#60) |
| Recommendation Card | `ai-financial-specs.md` §1.2 | ✓ (#59) |
| Confidence Indicator | `ai-financial-specs.md` §1.4 | ✓ (#61) |
| Risk Indicator | `ai-financial-specs.md` §1.5 | ✓ (#62) |
| Supporting Documents | `ai-financial-specs.md` §1.6 | ✓ (#63) |
| AI Activity Timeline | `ai-financial-specs.md` §1.7 | ✓ (#64) |
| Explain Recommendation | `ai-financial-specs.md` §1.8 | ✓ (#65) |
| AI Processing State | `ai-financial-specs.md` §1.9 | ✓ (#66) |
| Table | `component-library-specs.md` §4 | ✓ (#36) |
| Table/Row | `component-library-specs.md` §4 | ✓ (#35) |
| Table/Cell | `component-library-specs.md` §4 | ✓ (#34) |
| Table/Header Cell | `component-library-specs.md` §4 | ✓ (#33) |
| Badge | `component-library-specs.md` §6 | ✓ (#37) |
| Status Chip | `component-library-specs.md` §6 | ✓ (#38) |
| Risk Badge | `component-library-specs.md` §6 | ✓ (#39) |
| Approval Badge | `component-library-specs.md` §6 | ✓ (#40) |
| Exception Badge | `component-library-specs.md` §6 | ✓ (#41) |
| Input/Text | `component-library-specs.md` §2 | ✓ (#14) |
| Input/Search | `component-library-specs.md` §2 | ✓ (#15) |
| Input/Textarea | `component-library-specs.md` §2 | ✓ (#17) |
| Dropdown/Select | `component-library-specs.md` §8 | ✓ (#56) |
| Dropdown/Menu | `component-library-specs.md` §8 | ✓ (#57) |
| Timeline | `component-library-specs.md` §5 | ✓ (#51) |
| Audit Log | `component-library-specs.md` §5 | ✓ (#53) |
| Activity Feed | `component-library-specs.md` §5 | ✓ (#52) |
| Property List | `component-library-specs.md` §5 | ✓ (#54) |
| Definition List | `component-library-specs.md` §5 | ✓ (#55) |
| Currency Display | `ai-financial-specs.md` §2.1 | ✓ (#67) |
| Modal/Dialog | `component-library-specs.md` §10 (Overlays) | ✓ (#46) |
| Drawer | `component-library-specs.md` §10 | ✓ (#47) |
| Toast | `component-library-specs.md` §10 | ✓ (#48) |
| Skeleton/Text | `component-library-specs.md` §11 | ✓ (#77) |
| Skeleton/Card | `component-library-specs.md` §11 | ✓ (#78) |
| Skeleton/Table Row | `component-library-specs.md` §11 | ✓ (#81) |
| Skeleton/Circle | `component-library-specs.md` §11 | ✓ (#79) |
| Checkbox | `component-library-specs.md` §2 (Selection) | ✓ (#19) |
| Radio | `component-library-specs.md` §2 | ✓ (#20) |
| Toggle | `component-library-specs.md` §2 | ✓ (#21) |
| Pagination | `component-library-specs.md` §9 | ✓ (#45) |

**Total: 65 PEDS components** used in this screen. All verified against the 82-component inventory.
**No new primitives introduced.**

---

## 1. Screen Anatomy (Desktop ≥1440px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Top Navigation (56px) — Breadcrumbs | Search | Notifications | User Menu   │
├────────────┬──────────────────────────────────────────────────────────────┤
│            │  ┌── Page Header ──────────────────────────────────────────┐  │
│  Sidebar   │  │  AP / Work Queue / INV-2026-0042 — Acme Corp            │  │
│  (280px)   │  │  Invoice #: INV-2026-0042  |  Status: [Matched]          │  │
│  or 64px   │  │  Workflow: [● ● ● ● ○ ○ ○ ○ ○ ○] 7 of 10               │  │
│  collapsed)│  └─────────────────────────────────────────────────────────┘  │
│            │                                                               │
│            │  ┌── Split View ────────────────────────────────────────────┐  │
│            │  │                                                          │  │
│            │  │  ┌── Left Panel (55%) ──────────┐  ┌── Right Panel ──┐  │  │
│            │  │  │                                │  │  (45%)         │  │  │
│            │  │  │  ┌─ Invoice Summary Card ────┐  │  │               │  │  │
│            │  │  │  │  Vendor | Amount | Due    │  │  │  Tabs/        │  │  │
│            │  │  │  └──────────────────────────┘  │  │  Underline    │  │  │
│            │  │  │                                │  │  [Match|Vendor │  │  │
│            │  │  │  ┌─ Line Items Table ────────┐  │  │  |History|    │  │  │
│            │  │  │  │ Item | Qty | Price | Total │  │  │  Contract|AI │  │  │
│            │  │  │  │ ... (scrollable)          │  │  │  |Audit]      │  │  │
│            │  │  │  └──────────────────────────┘  │  │               │  │  │
│            │  │  │                                │  │  ┌─ Active    ─┐ │  │
│            │  │  │  ┌─ Totals ──────────────────┐  │  │  │ Tab        │ │  │
│            │  │  │  │ Subtotal | Tax | Total    │  │  │  │ Content    │ │  │
│            │  │  │  │ (functional currency eq.)  │  │  │  │            │ │  │
│            │  │  │  └──────────────────────────┘  │  │  └────────────┘ │  │
│            │  │  │                                │  │               │  │  │
│            │  │  └────────────────────────────────┘  └───────────────┘  │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                               │
│            │  ┌── Action Bar (64px, fixed bottom) ──────────────────────┐  │
│            │  │  Approval chain: AP Clerk ✓ → You (current) → Controller │  │
│            │  │  [Approve (Cmd+Enter)]  [Reject]  [Request Info]  [...]  │  │
│            │  └─────────────────────────────────────────────────────────┘  │
├────────────┴──────────────────────────────────────────────────────────────┤
│  Status Bar (32px) — Data: Fresh (2m ago)  |  Source: Prisma  |  v1.0.0   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layout Spec (1440×900 viewport)

### 2.1 Application Shell
**Frame**: Auto Layout, Vertical, W:1440, H:900
- Fill: `surface.base`

**Children**:
1. **Top Navigation** (H:56px, Fill) — Breadcrumbs "AP / Work Queue / INV-2026-0042"
2. **Content Area** (Horizontal, Fill remaining)
   - **Sidebar** (W:280px expanded / 64px collapsed)
   - **Main Content** (Vertical, Fill remaining)
     - **Page Header** (H:auto)
     - **Split View Container** (Fill remaining, scrollable)
3. **Action Bar** (H:64px, Fill, fixed bottom)
4. **Status Bar** (optional, H:32px)

### 2.2 Page Header
**Frame**: Auto Layout, Vertical, Fill, padding 16px 24px 12px
- Gap: 8px
- Fill: `surface.base`
- Border-Bottom: 1px, `border.subtle`

**Row 1 (Horizontal, Fill, space-between)**:
- **Breadcrumbs** component: AP / Work Queue / INV-2026-0042 — Acme Corp
  - Style: `link` for first 2, `sm-medium` + `text.primary` for active
  - Separator: "›"
- **Right actions**: Share button (Icon) + Export (Ghost button) + Close (Icon button, size S)

**Row 2 (Horizontal, Fill, items center, gap 16px)**:
- **Invoice number**: "INV-2026-0042" (style `h2`, `text.primary`, mono)
- **Status Chip**: "Matched" (Status Chip / Completed)
- **Match badge**: "2-Way Match: Pass" (Badge/Success)
- **Risk Indicator**: "Low Risk" (Risk/Low)
- **Density toggle**: Segmented control [AP Clerk | Approver | Auditor | Controller] (Segmented Control, S)

**Row 3 (Horizontal, Fill, items center, gap 8px)**:
- **Workflow Progress Bar**: 7 of 10 stages completed
  - Frame: Horizontal, gap 4px
  - 10 dots (12×12, radius full):
    - Completed (7): `status.success`
    - Current (1): `brand.gold` with pulse
    - Remaining (2): `border.subtle`
  - Label: "7 of 10 — Pending Approval" (style `xs`, `text.secondary`)

---

## 3. Left Panel — Invoice Document (55%)

### 3.1 Container
**Frame**: Auto Layout, Vertical, W: 55% of split, Fill height
- Border-Right: 1px, `border.default`
- Fill: `surface.base`
- Padding: 0
- Gap: 0

### 3.2 Invoice Summary Card (Sticky Top)
**Component**: Invoice Summary Card (`ai-financial-specs.md` §2.4)
**Frame**: Auto Layout, Vertical, Fill
- Padding: `card-padding` (20px)
- Gap: 12px
- Border-Bottom: 1px, `border.subtle`

**Children**:

1. **Header Row** (Horizontal, Fill, space-between):
   - Vendor name: "Acme Corporation" (style `h3`, `text.primary`)
   - Vendor link: "View Supplier →" (style `link`, right)

2. **Key Fields** (Property List, 2-column grid, gap 16px):
   | Label | Value |
   |-------|-------|
   | Invoice # | INV-2026-0042 (mono) |
   | PO Reference | PO-4521 (link) |
   | GRN Reference | GRN-891 (link) |
   | Invoice Date | 2026-07-15 |
   | Due Date | 2026-08-14 (style `financial-xs`, red if overdue) |
   | GL Code | 5100-AP-TRADE (mono) |
   | Cost Centre | CC-NA-042 |
   | Currency | USD (gold badge if functional currency) |
   | Payment Terms | Net 30 |
   | Contract Ref | CTR-2026-012 (link) |

3. **Financial Summary Row** (Horizontal, Fill, gap 24px):
   - Each item: Vertical
     - Label: "Subtotal" (style `micro`, `text.tertiary`)
     - Value: "$12,000.00" (style `financial-sm`, `text.primary`)
     - Functional equity: "EUR 11,040.00" (style `micro`, `text.tertiary`, mono)
   - Divider: (vertical, 1px, `border.subtle`, H:32px)
   - Items: Subtotal | Tax (8%) | Shipping | Total
   - **Total**: gold accent, style `financial`, `brand.gold`

4. **Data Freshness Dot**: "Updated 2m ago" (style `xs`, `text.tertiary`)
   - Dot: 6×6, radius full, `status.success` (green = fresh)

### 3.3 Section Header — Line Items
**Frame**: Auto Layout, Horizontal, Fill
- Padding: 12px 20px 8px
- Gap: 8px
- Items: center, space-between

**Children**:
1. "Line Items" (style `sm-medium`, `text.primary`)
2. "4 items" (Badge/Gold, `badge`)
3. Right: "Expand all" toggle (style `link`, S) — expands match details per row

### 3.4 Line Items Table
**Component**: Table (`component-library-specs.md` §4)
**Frame**: Auto Layout, Vertical, Fill
- Density: Compact (AP Clerk default)

**Header Row** (Table/Header Cell ×7):

| Column | Width | Label | Sortable | Align |
|--------|-------|-------|----------|-------|
| # | 32px | "#" | No | Center |
| Item Description | Fill | "Item" | No | Left |
| Qty | 64px | "Qty" | Yes | Right |
| Unit Price | 100px | "U/Price" | Yes | Right |
| Total | 100px | "Total" | Yes | Right |
| Match Status | 80px | "Match" | No | Center |
| Variance | 80px | "Var." | Yes | Right |

**Row Data** (Table/Row ×4, default state, hover on pointer):

```
#1  Consulting Services — Apr 2026    5   $2,400.00  $12,000.00  ✓ Matched    $0.00
#2  Software License — Q2 2026        1   $5,000.00  $5,000.00   ⚠ Partial  +$250.00
#3  Support Retainer — Jul 2026       1   $3,500.00  $3,500.00   ✓ Matched    $0.00
#4  Travel Expenses — Q2               2   $750.00    $1,500.00   ✗ Exception +$75.00
```

**Row States**:
- Default: `table.row-bg`
- Hover: `table.row-hover`
- Selected (click row): `table.row-selected`
- Match OK: green dot in Match Status cell
- Match Partial: yellow dot + amount in Variance
- Match Exception: red dot + amount in Variance + row gets subtle red left accent

**Variance Cell Detail** (click row to expand):
- Expanded variant: Table/Row becomes a nested frame, H:auto
- Shows per-field comparison: Invoice vs PO vs GRN
- Fields: Item, Qty, Price, Total
- Variance: `financial.positive` (green) or `financial.negative` (red)

### 3.5 Totals Section
**Frame**: Auto Layout, Vertical, Fill
- Padding: 12px 20px 20px
- Border-Top: 1px, `border.default`

**Children**:

1. **Total Rows** (Auto Layout, Vertical, gap 4px):
   Each row: Horizontal, Fill, gap 16px, padding 2px 0
   - Label (style `sm`, `text.secondary`): "Subtotal"
   - Currency code (style `micro`, `text.tertiary`): "USD"
   - Amount (style `financial-sm`, `text.primary`, right-aligned): "$12,000.00"
   - Functional equity (style `micro`, `text.tertiary`, mono): "€11,040.00"

   **Divider**: 1px, `border.subtle`

   **Total Row**: (style `sm-medium`, `text.primary` label, style `financial`, `brand.gold` amount)
   - Label: "Total"
   - Amount: "$22,000.00"
   - Functional: "€20,240.00"

2. **PO Cross-Reference**: (style `xs`, `text.tertiary`)
   "PO-4521 total: $21,500.00 — Invoice exceeds PO by $500.00 (2.3%)"
   - Colour: `status.warning` if over PO

---

## 4. Right Panel — Evidence Panel (45%)

### 4.1 Container
**Frame**: Auto Layout, Vertical, W: 45% of split, Fill height
- Fill: `surface.base`

### 4.2 Tabs
**Component**: Tabs/Underline (`component-library-specs.md` §7)
**Frame**: Auto Layout, Horizontal, Fill
- Border-Bottom: 1px, `border.default`
- Gap: 0
- Padding: 0 16px

**Tab Items** (6 tabs):

| # | Label | Icon | Keyboard | Badge |
|---|-------|------|----------|-------|
| 1 | Match | FileCheck | Cmd+1 | — |
| 2 | Vendor | Building2 | Cmd+2 | Risk/Low |
| 3 | History | Clock | Cmd+3 | — |
| 4 | Contract | FileText | Cmd+4 | — |
| 5 | AI | Sparkles | Cmd+5 | "New" |
| 6 | Audit | Shield | Cmd+6 | — |

**Spec** (per tab):
- Frame: Auto Layout, Horizontal, Center
- H: 40px, padding 0 12px
- Gap: 6px
- Icon: 16px
- Label: style `sm-medium`
- Badge (optional): Badge, S

| State | Text | Bottom Border | Background |
|-------|------|---------------|------------|
| Default | `text.secondary` | transparent | transparent |
| Hover | `text.primary` | transparent | `surface.elevated` |
| Active | `text.primary` | `nav-tab.active-indicator`, 2px, gold | transparent |
| Disabled | `text.disabled` | transparent | transparent |

### 4.3 Tab Content Area
**Frame**: Auto Layout, Vertical, Fill remaining, scrollable
- Padding: 16px
- Gap: 16px

### 4.4 MATCH Tab (Default)
**Component**: Card/Evidence + Variance Card + Property List

**Children**:

1. **Three-Way Match Header** (Card/Evidence, compact padding):
   - Title: "Three-Way Match" (style `sm-medium`)
   - Status: Badge/Success "2-Way: Pass" or Badge/Warning "3-Way: Partial"
   - Tolerance applied: "Tolerance: ±2% / $100" (style `xs`, `text.tertiary`)

2. **Match Summary Row** (Horizontal, Fill, gap 12px):
   - **Invoice vs PO** (Card/Default, flex:1):
     - Value match: "99.8%" (style `financial-sm`, `status.success`)
     - Label: "Invoice Amount" (style `micro`, `text.tertiary`)
   - **Invoice vs GRN** (Card/Default, flex:1):
     - Qty match: "80%" (style `financial-sm`, `status.warning`)
     - Label: "Quantity Match" (style `micro`, `text.tertiary`)
   - **Overall** (Card/Default, flex:1):
     - Score: "95%" (style `financial-sm`, `brand.gold`)
     - Label: "Trust Score" (style `micro`, `text.tertiary`)

3. **Line-by-Line Match** (Table, compact):
   | # | Field | Invoice | PO | GRN | Variance | Status |
   |---|-------|---------|----|-----|----------|--------|
   | 1 | Qty | 5 | 5 | 5 | 0 | ✓ |
   | 2 | Price | $2,400 | $2,400 | — | $0 | ✓ |
   | 3 | Total | $12,000 | $12,000 | — | $0 | ✓ |
   | 4 | Qty | 1 | 1 | 1 | 0 | ✓ |
   | 5 | Price | $5,000 | $4,750 | — | +$250 | ⚠ |

   Variance highlighting:
   - Zero variance: `financial.positive` text
   - Positive variance (invoice > PO): `financial.negative` text + red bg tint
   - Negative variance (invoice < PO): `financial.positive` text + green bg tint

4. **Tolerance Rules Applied** (Property List):
   - "Price tolerance: ±2% or $100, whichever is greater" — Pass
   - "Quantity tolerance: Exact match required" — Item 2 exceeded
   - "Line item variance: $250.00 — exceeds tolerance" — Flagged

### 4.5 VENDOR Tab
**Component**: Supplier Summary Card + Risk Indicator + Activity Feed

**Children**:

1. **Vendor Header** (Horizontal, Fill, gap 12px):
   - Avatar placeholder: 40×40, `surface.elevated`, first letter
   - VStack:
     - "Acme Corporation" (style `h3`, `text.primary`)
     - "Vendor since 2023 · 142 invoices" (style `xs`, `text.tertiary`)
   - Right: Risk badge "Low Risk" (Badge/Risk/Low)

2. **Vendor Metrics** (Horizontal, Fill, gap 12px):
   - **Total Spend (12mo)** (Statistic Card):
     - Value: "$1,245,000" (style `financial-sm`)
     - Trend: "↑ 12% vs prior" (style `micro`, `financial.positive`)
   - **Avg Days-to-Pay** (Statistic Card):
     - Value: "38 days" (style `financial-sm`)
     - Trend: "Net 30 terms" (style `micro`, `status.warning`)
   - **Dispute Rate** (Statistic Card):
     - Value: "2.1%" (style `financial-sm`)
     - Trend: "↓ 0.3% vs avg" (style `micro`, `financial.positive`)

3. **Recent Activity** (Activity Feed, 3 items):
   - "Payment completed — INV-039 — $8,400" (2d ago)
   - "Invoice approved — INV-038 — $12,000" (5d ago)
   - "Exception resolved — Price variance accepted" (1w ago)

4. **Invoice History Link**: "View all invoices from Acme Corp →" (style `link`)

### 4.6 HISTORY Tab
**Component**: Activity Feed + Trend + Table

**Children**:

1. **Price Trend Summary**:
   - "Average price per item: $2,150 (last 12 months)" (style `sm-medium`)
   - Trend: "↑ 3.2% vs prior period" (style `sm`, `status.warning`)
   - Mini sparkline area (chart, Fill width, H:60px) — placeholder rectangle with gradient

2. **Match Rate** (Horizontal, gap 16px):
   - "Match rate: 94%" (badge/success)
   - "Exception rate: 4.2%" (badge/warning)
   - "Avg resolution time: 2.3 days" (badge/info)

3. **Prior Invoices** (Table, compact, 3 rows):
   | Invoice | Date | Amount | Status | Match |
   |---------|------|--------|--------|-------|
   | INV-2026-0039 | 2026-07-01 | $8,400 | Paid | ✓ |
   | INV-2026-0035 | 2026-06-15 | $12,000 | Paid | ✓ |
   | INV-2026-0028 | 2026-05-20 | $6,200 | Paid | ⚠ |

4. **Link**: "View full history (34 invoices) →" (style `link`)

### 4.7 CONTRACT Tab
**Component**: Property List + Card/Default

**Children**:

1. **Active Contract** (Card/Default):
   - Title: "CTR-2026-012 — Annual Services Agreement"
   - Status: Badge/Success "Active"

   **Terms** (Property List):
   | Term | Value |
   |------|-------|
   | Payment Terms | Net 30 |
   | Discount | 2% if paid within 10 days |
   | Pricing Schedule | Fixed for FY 2026 |
   | Expiry | 2026-12-31 (148 days remaining) |
   | Auto-Renew | Yes (90-day notice required) |
   | Min. Commitment | $480,000/year ($120,000/quarter) |
   | Remaining | $240,000 (50% utilized) |

2. **Compliance Check**:
   - "Invoice is within contract scope" — ✓ (style `status.success`)
   - "Pricing matches contract schedule" — ✓ (style `status.success`)
   - "Quantity within quarterly commitment" — ⚠ (style `status.warning`)
     - "Q2 commitment: $60,000 utilized of $120,000"

### 4.8 AI Tab
**Component**: Card/AI Summary + Recommendation Card + Evidence Panel + Confidence Indicator

**Children**:

1. **AI Header Bar** (Horizontal, Fill, space-between):
   - Sparkles icon (20px, `ai-card.accent`)
   - "AI Assessment" badge (`Badge/Gold`, style `micro`)
   - "Updated 3m ago" (style `xs`, `text.tertiary`)

2. **Risk Score Ring** (Centered, optional compact):
   - Circular ring: 60×60
   - Score: "18/100" (style `h3`, mono)
   - Label: "Risk Score" (style `micro`, `text.tertiary`)
   - Colour: `risk.low` (green gradient)

3. **AI Summary Text** (style `body`, `text.primary`, line-height 1.625):
   ```
   This invoice from Acme Corp matches PO-4521 within tolerance.
   Two line items match exactly. Item 2 (Software License) shows
   a +$250 price variance (+5.3%) — exceeds 2% tolerance. Historical
   data shows this vendor's software prices fluctuate 3-8% quarterly.
   Recommend: Accept variance with note.
   ```

4. **Recommendation Card** (`ai-financial-specs.md` §1.2, priority=Default):
   - Title: "Recommend: Approve with accepted variance"
   - Rationale: "Price variance within historical range. Vendor has 94% match rate. No prior disputes."
   - Financial Impact: "+$250.00 this invoice" (style `financial-sm`, `financial.pending`)
   - Evidence Count: "Based on 4 sources" (style `xs`, `text.tertiary`)
   - Actions: "Apply" (Primary/S) + "Dismiss" (Ghost/S) — but only visible in AP Clerk mode

5. **Confidence Bar** (Horizontal, gap 12px):
   - "Overall Confidence" (style `sm`, `text.secondary`)
   - Bar: 4px height, W:200px, radius 2px
     - Fill: `ai.high` at 82% width
     - Track: `border.subtle`
   - "82%" (style `xs`, mono, `text.secondary`)

6. **Evidence Sources** (Evidence Panel, `ai-financial-specs.md` §1.3, 3 items):
   - "PO-4521 — Match result: 98.3%" — Confidence: High
   - "Vendor History — 12-month match rate: 94%" — Confidence: High
   - "Invoice Line Items — 3 of 4 matched within tolerance" — Confidence: Medium
   - "Contract CTR-2026-012 — Pricing within agreed schedule" — Confidence: High

7. **Explain Recommendation** trigger: "Why was this recommended?" (style `link`)
   - Expands inline or opens Dialog: shows factor ranking, rule contributions, data sources, alternatives

### 4.9 AUDIT Tab
**Component**: Card/Audit + Timeline

**Children**:

1. **Audit Header**:
   - "Audit Trail" (style `sm-medium`, `text.primary`)
   - "Evidence Hash: a3f8c9...1b2d" (style `code`, `micro`, `text.tertiary`)
   - "SHA-256" badge (Badge, `xs`)

2. **Audit Timeline** (Timeline with Audit Log styling, `component-library-specs.md` §5):
   Each entry (5-8 items, scrollable):

   | Icon | Time | Actor | Action | Detail |
   |------|------|-------|--------|--------|
   | ✓ | 2026-07-28 14:32:04 UTC | System | Invoice Captured | OCR completed, 98.5% confidence |
   | ✓ | 14:32:10 UTC | Workflow Engine | PO Match Initiated | PO-4521 selected, 2-way match started |
   | ✓ | 14:32:15 UTC | Matching Engine | 2-Way Match: Partial | Item 2 price variance: +$250 |
   | ✓ | 14:32:15 UTC | AI Engine | Risk Assessment | Score: 18/100 — Low Risk |
   | ✓ | 14:33:00 UTC | System | Routed for Approval | Pending: AP Manager |
   | — | 14:33:00 UTC | — | Awaiting Decision | Current step |

   Each entry format:
   - Frame: Auto Layout, Horizontal, gap 12px, padding 6px 0
   - Status dot: 8×8, radius full, `status.success` (completed) / `status.warning` (pending) / `status.info` (current)
   - Connecting line: 1px, `border.subtle`, left of dot
   - VStack:
     - Actor (style `sm-medium`, `text.primary`)
     - Action (style `sm`, `text.secondary`)
   - Timestamp (style `code`, `xs`, `text.tertiary`, right-aligned)

3. **Tamper Evidence** (bottom):
   - "Chain integrity: Verified" — ✓ (style `status.success`)
   - "Encryption: AES-256-GCM" (style `xs`, `text.tertiary`)

---

## 5. Action Bar (Fixed Bottom, 64px)

### 5.1 Container
**Frame**: Auto Layout, Horizontal, Fill
- H: 64px
- Padding: 0 24px
- Gap: 12px
- Items: center, space-between
- Fill: `surface.raised`
- Border-Top: 1px, `border.default`
- z-index: `z-sticky` (EDL)

### 5.2 Left — Approval Chain Status
**Frame**: Auto Layout, Horizontal, gap 8px, items center

**Children**:
1. **Status label**: "Approval Chain:" (style `xs`, `text.tertiary`)
2. **Chain Visualization** (Horizontal, gap 4px, items center):
   Each step:
   - Avatar: 24×24, radius full
   - Status dot (6×6, radius full, `status.success` if completed, `brand.gold` if current, `border.subtle` if pending)
   - Label (style `micro`, `text.secondary`): "AP Clerk"
   - Connector: "→" (style `xs`, `text.disabled`)
   - Chain: "AP Clerk ✓ → **You (current)** → Controller → CFO (if >$50K)"
3. **Authority info**: "Your limit: $25,000" (style `xs`, `text.tertiary`)
   - If amount > limit: red flag icon + "Requires escalation" (style `xs`, `status.error`)

### 5.3 Right — Action Buttons
**Frame**: Auto Layout, Horizontal, gap 8px, items center

| Action | Component | Shortcut | Style | Condition |
|--------|-----------|----------|-------|-----------|
| Approve | Button/Primary, M | Cmd+Enter | Gold | Disabled if: data stale, insufficient authority, or evidence not viewed |
| Reject | Button/Danger, M | — | Red | Required reason field (opens modal) |
| Request Info | Button/Secondary, M | — | — | Opens comment field |
| Escalate | Button/Ghost, S | — | — | Opens escalation target selector |
| More | Button/Icon (more-vertical), S | — | — | Dropdown: Add Note, Assign To, View Full Vendor, Print |

**Primary action disabled state**:
- If evidence-before-approval mode is "Required" and evidence tab not visited: "Review evidence first"
- If auth amount < invoice amount: "Exceeds your approval limit — escalate"
- If data stale: "Data is stale — refresh to approve"
- Tooltip on disabled button explains why

---

## 6. Persona Density Modes

The Invoice Detail implements 4 persona-based density modes controlled by the Segmented Control in the Page Header.

### 6.1 Approver Mode (Default) — ~15 data points
**Purpose**: Fast evidence-based decisions. Approver sees only what's needed to approve/reject.

**Visible elements**:
- Invoice Summary Card (simplified: vendor, amount, due date, status)
- Match result summary (Pass/Fail/Partial badge)
- AI Confidence + Recommendation
- Action Bar (Approve/Reject/Request Info)

**Hidden**:
- Line items table (collapsed, shows item count only)
- Vendor metrics (collapsed)
- History tab (hidden)
- Contract details (hidden)
- Full audit trail (hidden)

**Layout**: Left panel simplified, right panel shows Match tab by default

### 6.2 AP Clerk Mode (Default expanded) — ~35 data points
**Purpose**: Full operational view for processing invoices.

**All elements visible** as specified in Sections 2-5 above, including:
- Full line items table with variance expand
- Evidence tabs: Match, Vendor, History, Contract, AI, Audit
- All cards shown

### 6.3 Auditor Mode — ~50 data points
**Purpose**: Complete evidence for audit review. Read-only.

**Adds over AP Clerk mode**:
- Full Audit tab expanded by default
- Evidence hash shown in page header
- Before/after values for every state transition
- Version history of invoice data
- No action buttons (Approve/Reject hidden)
- Export button (Primary) replaces Approve
- "Print audit report" (Ghost button)

### 6.4 Controller Mode — ~30 data points
**Purpose**: Financial review with GL coding visibility.

**Adds over Approver mode**:
- GL coding section in Invoice Summary
- Budget check status
- Cost centre allocation
- Adjustment entry capability (direct edit fields)
- Variance explanation field
- Approval chain shows additional approval if over budget

---

## 7. Keyboard Accessibility

| Shortcut | Action | Scope |
|----------|--------|-------|
| Cmd+Enter | Approve (when enabled) | Global — invoice detail |
| Cmd+Escape | Cancel/Close detail | Global |
| Cmd+1-6 | Switch evidence tabs | Right panel |
| Cmd+] | Toggle right panel visibility | Global |
| Cmd+[ | Previous invoice in queue | Global |
| Cmd+] | Next invoice in queue | Global |
| Cmd+Shift+E | Export current view | Global |
| Tab/Shift+Tab | Move focus forward/backward | All interactive elements |
| Enter/Space | Activate focused element | Buttons, links, checkboxes |
| Arrow Left/Right | Navigate tabs | Tab bar |
| Arrow Up/Down | Navigate table rows | Line items table |
| Space | Select/deselect row | Table rows with Checkbox |
| Esc | Close modal, dropdown, drawer | All overlays |
| ? | Keyboard shortcuts help | Global |

**Focus Management**:
- On page load: focus moves to the first actionable element (Approve button if enabled, else first evidence tab)
- Tab order: Page Header breadcrumbs → Invoice Summary links → Table → Evidence tabs → Evidence content → Action bar
- Focus ring: 2px gold (`brand.gold`), 2px offset, on all interactive elements
- Focus trap: Modal dialogs (Reject reason, Escalate) trap Tab cycling
- Focus restoration: Returning from Tab content preserves scroll position

---

## 8. Interaction States

### 8.1 Normal Flow
1. Arrive from Work Queue (click invoice row or Cmd+Enter on selected row)
2. Page loads → focus on Approve button (or first tab if disabled)
3. Evidence tabs load content progressively (Match first, then others on click)
4. User reviews evidence (Match/Vendor/History/Contract/AI/Audit)
5. User makes decision (Approve/Reject/Request Info/Escalate)
6. Action bar shows confirmation animation (gold checkmark overlay on button)
7. Toast appears: "Invoice approved — routed to next approver" or "Invoice rejected — returned to AP Clerk"
8. Auto-advance: next invoice in queue loads

### 8.2 Approve Action
1. User clicks Approve (or Cmd+Enter)
2. If evidence-before-approval mode = "Required": check evidence tabs visited
   - If not: toast "Review match evidence first" + highlight Match tab
3. If amount exceeds authority:
   - Modal: "This invoice ($22,000) exceeds your approval limit ($25,000). Escalate to Controller?"
   - Options: "Escalate" (Primary) / "Cancel" (Ghost)
4. If reason required (configurable): show inline text field below action bar
5. Confirm: button shows loading spinner → checkmark → "Approved"
6. Toast: success notification
7. Auto-advance to next invoice (configurable in Settings)

### 8.3 Reject Action
1. User clicks Reject
2. Modal/Dialog (size S):
   - Title: "Reject Invoice INV-2026-0042"
   - Description: "Rejecting will return this invoice to the AP Clerk with your reason."
   - Textarea: "Reason for rejection" (required, min 10 chars)
   - Checkbox: "Notify vendor" (optional, default off)
   - Actions: "Reject" (Danger) / "Cancel" (Ghost)
3. On confirm: button loading → checkmark → "Rejected"
4. Toast: "Invoice rejected — reason shared with AP Clerk"

### 8.4 Request Info Action
1. User clicks Request Info
2. Inline panel slides up from action bar:
   - Textarea: "What additional information do you need?"
   - Actions: "Send Request" (Primary/S) / "Cancel" (Ghost/S)
3. On send: Toast "Request sent to AP Clerk"
4. Invoice status changes to "Info Requested"

### 8.5 Escalate Action
1. User clicks Escalate
2. Drawer (right, 320px):
   - Title: "Escalate Invoice"
   - Dropdown: "Target approver" — lists next-level approvers with authority limits
   - Textarea: "Escalation reason" (required)
   - Actions: "Escalate" (Primary) / "Cancel" (Ghost)
3. On confirm: Toast "Escalated to [Approver Name]"

### 8.6 Evidence-Before-Approval Mode
- Mode set in Settings (3 modes)
- **Required**: Approve button disabled until at least 2 evidence tabs visited (Match + one other)
  - Progress indicator: "Evidence review: 1/3 tabs visited"
- **Standard**: Approve available after 3s (configurable delay)
  - "Evidence available" toast after 3s if user has not opened tabs
- **Trusted**: Approve available immediately
  - Tooltip: "Evidence is available for review"

### 8.7 Data Staleness Handling
- Data freshness dot in Invoice Summary Card
- If data stale (>24h): Approve button disabled
- Refresh button (Icon button in page header): re-fetches invoice data + re-evaluates match
- On refresh: shimmer on stale elements → update → "Updated now" toast
- Stale tooltip: "Match data is 26h old — refresh to re-evaluate before approving"

---

## 9. Modal/Dialog Specifications

### 9.1 Reject Reason Dialog
**Component**: Modal/Dialog (size S, 400px)
**Frame**: Auto Layout, Vertical, W:400px
- Padding: 0 (uses modal layout)

**Children**:
1. **Header**: "Reject Invoice INV-2026-0042" (style `h4`) + close Icon
2. **Body**: gap 16px
   - Alert message: "Rejecting will return this to the AP Clerk with your reason."
     - Icon: AlertTriangle (16px, `status.warning`)
     - Text: style `sm`, `text.secondary`
   - Textarea (Input/Textarea, M, state=error if invalid):
     - Placeholder: "Explain why this invoice is being rejected..."
     - Min 10 characters
     - Character count: "0/500" (style `micro`, `text.tertiary`, red if <10)
   - Checkbox: "Notify vendor of rejection" (default: off)
3. **Footer**: "Cancel" (Ghost/S) + "Reject" (Danger/S)

### 9.2 Escalate Drawer
**Component**: Drawer (right, 400px)

**Children**:
1. **Header**: "Escalate Invoice" + close Icon
2. **Body** (Vertical, gap 16px):
   - Dropdown/Select: "Target approver"
     - Options: Controller ($50K limit), VP Finance ($100K), CFO ($500K)
     - Each option: name + authority limit + current availability status
   - Textarea: "Escalation reason" (required, placeholder: "Why does this need higher authority?")
   - Current chain display: "Current: AP Manager (you) → Controller → CFO"
3. **Footer**: "Cancel" (Ghost) + "Escalate" (Primary)

### 9.3 Explain Recommendation Dialog
**Component**: Modal/Dialog (size M, 560px)

**Children**:
1. **Header**: "Why was this recommended?" (style `h4`)
2. **Body** (Vertical, gap 20px):
   - **Factor Ranking** (ordered by importance):
     Each factor: Horizontal, Fill
     - Bar: relative importance (width = contribution %)
     - Label: "Line item match rate: 75%"
     - Weight: "Weight: 0.35" (style `code`, `xs`)
   - **Data Sources**: linked evidence items with confidence
   - **Alternative**: "What would change this recommendation?"
     - "If price variance tolerance increased to 5%, recommendation would change to Approve All"
   - **Confidence Breakdown**: per-factor confidence scores
3. **Footer**: "Close" (Ghost)

---

## 10. Related Documents

### 10.1 Container
**Frame**: Card/Default, vertical
- Padding: `card-padding` (20px)
- Gap: 12px

### 10.2 Header
- "Related Documents" (style `sm-medium`, `text.primary`)
- "3 documents" (Badge/Gold)

### 10.3 Document List
**Component**: Supporting Documents (`ai-financial-specs.md` §1.6)

Each item (3 total):

| Icon | Name | Meta | Status | Action |
|------|------|------|--------|--------|
| FileText | PO-4521.pdf | 3 pages · 2026-07-10 | Matched | View → |
| FileText | GRN-891.pdf | 1 page · 2026-07-12 | Verified | View → |
| FileImage | INV-2026-0042-scanned.pdf | 2 pages · 2026-07-15 | OCR'd 98% | View → |

**Spec per item**:
- Frame: Auto Layout, Horizontal, Fill, gap 12px, padding 8px 12px
- Radius: 6px
- Icon: 20px, file type icon
- VStack:
  - Name (style `sm-medium`, `text.primary`)
  - Meta (style `xs`, `text.tertiary`)
- Status: Status Chip (S)
- Right: "View →" (style `link`, S)

| State | Background |
|-------|-----------|
| Default | transparent |
| Hover | `surface.elevated` |

---

## 11. Comments / Notes

### 11.1 Container
**Frame**: Card/Default, vertical
- Padding: `card-padding` (20px)
- Gap: 12px

### 11.2 Header
- "Notes & Comments" (style `sm-medium`, `text.primary`)
- "3 comments" (Badge/Gold)
- Right: "Add Note" (Button/Ghost, S)

### 11.3 Comment List
**Frame**: Auto Layout, Vertical, gap 12px

Each comment item:
- Frame: Auto Layout, Horizontal, Fill, gap 12px
- Avatar: 24×24, radius full, `surface.elevated`
- VStack (gap 2px):
  - Actor name + role (style `sm-medium`, `text.primary`)
  - Timestamp (style `xs`, `text.tertiary`): "2026-07-28 14:35 UTC"
  - Text (style `sm`, `text.secondary`): "PO price needs review — vendor increased rates in Q2"

**States**: default only (no interaction on past comments)

### 11.4 Add Note Inline
**Frame**: Auto Layout, Horizontal, Fill, gap 8px
- Input/Text (M, placeholder: "Add a note...", Fill)
- Button/Primary (S, "Post", disabled if empty)

---

## 12. Audit Timeline

**Component**: Timeline (`component-library-specs.md` §5) + Audit Log (`component-library-specs.md` §5)

### 12.1 Position
Within the AUDIT tab (Section 4.9), or as a standalone section in the left panel under Auditor mode.

### 12.2 Full Audit Log Format
**Frame**: Auto Layout, Vertical, Fill

**Header Row** (Horizontal, Fill, space-between):
- "Audit Trail" (style `sm-medium`)
- "8 events" (Badge)
- Right: "Export" (Ghost, S)

**Timeline Items** (8 entries, scrollable):

| # | Time (UTC) | Actor | Action | Before | After | Source |
|---|------------|-------|--------|--------|-------|--------|
| 1 | 14:32:04 | OCR Engine | Invoice Captured | — | Status: Captured | OCR |
| 2 | 14:32:10 | Workflow Engine | Status Changed | Captured | Matched | Rule Engine |
| 3 | 14:32:12 | Matching Engine | Match Initiated | — | PO-4521 linked | System |
| 4 | 14:32:15 | Matching Engine | 2-Way Match | In Progress | Partial Match | System |
| 5 | 14:32:15 | AI Engine | Risk Assessment | — | Score: 18/100 | AI |
| 6 | 14:32:18 | Workflow Engine | Exception Created | — | Price Variance | Rule |
| 7 | 14:33:00 | System | Routed for Approval | Partial Match | Pending Approval | Workflow |
| 8 | 14:33:00 | — | Awaiting Decision | — | — | — |

**Each item spec**:
- Frame: Auto Layout, Horizontal, Fill, gap 12px, padding 4px 0
- Status dot: 8×8, radius full
  - Completed: `status.success`
  - Current: `brand.gold` (with subtle pulse glow)
  - Pending: `border.subtle`
- Connecting line: 1px, `border.subtle`
- VStack (gap 1px):
  - Actor (style `sm-medium`, `text.primary`)
  - Action description (style `sm`, `text.secondary`)
  - Policy ref (optional): "Rule: Price > 2%" (style `micro`, `code`, `text.tertiary`)
- Timestamp (style `code`, `xs`, `text.tertiary`, right-aligned, mono)
- Before/After (style `code`, `financial-xs`, if applicable):
  - Before: `text.tertiary`
  - After: `text.primary`

---

## 13. Empty / Loading / Error States

### 13.1 Loading State
**Frame**: Same layout with skeleton placeholders:
- Invoice Summary Card → Skeleton/Card (280×160)
- Line Items Table → 4 × Skeleton/Table Row
- Evidence Tabs → Skeleton/Text (3 lines)
- Action bar → Ghost buttons (non-interactive)

### 13.2 Empty State (No Data)
Not applicable for invoice detail (always has an invoice). Fallback: "Invoice not found" redirect to queue.

### 13.3 Error State

**Error Banner** (below Page Header):
- Frame: Auto Layout, Horizontal, Fill, padding 12px 24px
- Fill: `status.error` at 10% opacity
- Border-Bottom: 1px, `status.error`
- Icon: AlertTriangle (16px, `status.error`)
- Text: "Failed to load evidence data — Match results may be incomplete" (style `sm`, `text.primary`)
- Action: "Retry" (Button/Ghost, S)

**Error types**:

| Error | Display | Recovery |
|-------|---------|----------|
| Network failure | Banner: "Connection lost — showing cached data" | Auto-retry, "Retry now" button |
| Match engine error | Banner: "Match results unavailable" | "Re-run match" button |
| AI unavailable | AI tab shows error state: "AI analysis unavailable" + "Retry" | Retry button |
| Permission denied | Toast: "You don't have permission to approve this invoice" | Contact AP Manager |
| Data stale >24h | Warning dot in Invoice Summary + disabled Approve | "Refresh data" button |

---

## 14. Responsive Behaviour

| Element | Desktop (≥1440px) | Laptop (1024-1439px) | Tablet (768-1023px) | Mobile (<768px) |
|---------|-------------------|----------------------|---------------------|-----------------|
| Sidebar | Expanded 280px | Collapsed 64px | Hidden (overlay drawer) | Hidden (drawer) |
| Split Panels | 55% / 45% | 50% / 50% | Stacked (left above right) | Single column |
| Evidence Tabs | 6 tabs visible | 6 tabs, scrollable | Scrollable tabs | 4 tabs (Match/Vendor/AI/Audit) |
| Line Items Table | Full table | Full table | Horizontal scroll | Card layout (each row = card) |
| Action Bar | Full (all buttons) | Condensed (text icons) | Collapsed (icon-only) | Collapsed (icon-only, bottom nav) |
| Invoice Summary | 2-col property list | 2-col | 1-col | 1-col |
| Persona Controls | Segmented (4 options) | Segmented (3: Clerk/Approver/Auditor) | Dropdown | Dropdown |
| Document Viewer | Inline | Inline | Modal overlay | Full-screen modal |

### Tablet Adjustments (768-1023px)
- Evidence Panel moves below Invoice Document (stacked)
- Tabs: horizontally scrollable (6 tabs)
- Line items: horizontal scroll, sticky first 2 columns
- Action bar: text labels hidden, icon-only buttons
- Sidebar: overlay drawer triggered by hamburger

### Mobile Adjustments (<768px)
- Single column: Invoice Summary first, line items below, evidence below that
- Bottom navigation: replace fixed action bar with primary action (Approve/Reject)
- Line items: card layout (each item = Card/Default with key-value pairs)
- Evidence tabs: only 4 (Match/Vendor/AI/Audit) — others accessible via "More" dropdown
- Persona selector: Dropdown/Select instead of segmented control
- Document viewer: full-screen modal with swipe to close

---

## 15. Token Usage Audit

| Token | Used In |
|-------|---------|
| `surface.base` | App Shell, Main Content, Left/Right panels |
| `surface.raised` | Cards, Action Bar |
| `surface.elevated` | Hover states, dropdown items |
| `surface.floating` | Dropdown menus, dialogs |
| `surface.sidebar` | Sidebar |
| `text.primary` | All headings, values, actor names |
| `text.secondary` | Descriptions, body text, tab labels |
| `text.tertiary` | Timestamps, metadata, sub-labels |
| `text.disabled` | Disabled tabs, placeholder text |
| `border.default` | Split panel divider, card borders |
| `border.subtle` | Dividers, section separators |
| `border.strong` | Dropdown menus, floating panels |
| `border.gold` | Selected cards, active tabs |
| `shadow.soft` | Default cards |
| `shadow.medium` | Elevated cards, action bar |
| `shadow.large` | Dropdowns, drawers |
| `shadow.glow-gold` | Approve button hover |
| `brand.gold` | Current workflow dot, active tab indicator, total amount, approve primary |
| `brand.gold-muted` | AI badge background, subtle accents |
| `brand.gold-subtle` | Table selected rows, active menu items |
| `status.success` | Completed matches, verified status, green dots |
| `status.warning` | Partial matches, warnings, pending items |
| `status.error` | Exceptions, rejections, errors |
| `status.info` | Info badges, notification types |
| `risk.low` | Low risk badge, AI confidence high |
| `risk.medium` | Medium risk |
| `risk.high` | High risk |
| `risk.critical` | Critical exceptions |
| `financial.positive` | Favourable variance, green financial values |
| `financial.negative` | Unfavourable variance, red financial values |
| `financial.pending` | Pending transaction amounts |
| `financial.approved` | Approved amounts |
| `financial.overdue` | Overdue indicators |
| `ai.high` / `.medium` / `.low` | AI confidence indicators |
| `ai.processing` | AI analysis state |
| `button.primary.*` | Approve button |
| `button.danger.*` | Reject button |
| `button.secondary.*` | Request Info/Escalate |
| `button.ghost.*` | Tab actions, less prominent actions |
| `input.*` | All input fields (textarea, dropdown) |
| `card.*` | All card types |
| `table.*` | Line items table |
| `tab.*` | Evidence tabs |
| `dialog.*` | Reject modal, Explain dialog |
| `skeleton.*` | Loading states |
| `layout-semantic.page-padding` | 24px content padding |
| `layout-semantic.section-gap` | 32px between sections |
| `layout-semantic.card-padding` | 20px inside cards |
| `layout-semantic.sidebar-width` | 280px sidebar |
| `layout-semantic.topbar-height` | 56px top navigation |
| `border-radius.semantic.card` | 8px card radius |
| `border-radius.semantic.control` | 6px input/button radius |
| `border-radius.semantic.tag` | 4px badge radius |
| `typography.font-size.h2` | Invoice number (30px) |
| `typography.font-size.h3` | Vendor name (20px) |
| `typography.font-size.h4` | Section titles, dialog titles |
| `typography.font-size.sm-medium` | Body text, buttons (14px medium) |
| `typography.font-size.financial-lg` | Total amount display |
| `typography.font-size.financial` | KPI values, metric amounts |
| `typography.font-size.financial-sm` | Table financial values |
| `typography.font-size.financial-xs` | Before/after audit values |
| `typography.font-size.xs` | Labels, metadata (12px) |
| `typography.font-size.micro` | Timestamps, badges (11px) |
| `typography.font-size.badge` | Badge text (11px semibold) |
| `typography.font-size.code` | Audit hash, IDs |
| `typography.font-family.mono` | All financial values, audit data, codes |
| `z-index.z-sticky` | Fixed action bar |

**Total: ~105 distinct tokens** referenced.

---

## 16. Build Steps (Figma)

### Step 1: App Shell
1. Create frame 1440×900, fill `surface.base`
2. Insert Top Navigation (Breadcrumbs variant, H:56px)
3. Insert Sidebar (Expanded, W:280px)
4. Remaining = Main Content (Vertical, Fill)

### Step 2: Page Header
1. Auto Layout, Vertical, Fill, padding 16-24-12
2. Row 1: Breadcrumbs (AP / Work Queue / INV-2026-0042 — Acme Corp)
3. Row 2: H2 "INV-2026-0042" + Status Chip "Matched" + Badge "2-Way Match: Pass" + Risk Badge "Low Risk" + Persona Segmented Control
4. Row 3: Workflow Progress Bar (10 dots, 7 filled, 1 gold pulsing)

### Step 3: Split View Container
1. Auto Layout, Horizontal, Fill
2. Left Panel (55%): Vertical
3. Right Panel (45%): Vertical
4. Divider: draggable 8px (Split View primitive)

### Step 4: Left Panel — Invoice Summary
1. Invoice Summary Card (ai-financial-specs.md §2.4)
2. Property List: 2-column grid (Invoice #, PO, GRN, Date, Due, GL Code, Cost Centre, Currency, Terms, Contract)
3. Financial Summary Row: Subtotal | Tax | Shipping | Total
4. Data Freshness dot + "Updated 2m ago"

### Step 5: Left Panel — Line Items
1. Section Header: "Line Items" + Badge "4" + "Expand all"
2. Table (density: compact)
3. Header: # | Item | Qty | U/Price | Total | Match | Var.
4. 4 data rows with match status dots
5. Variance expand: nested per-field comparison

### Step 6: Left Panel — Totals
1. Subtotal, Tax, Shipping, Total rows
2. PO cross-reference

### Step 7: Right Panel — Tabs
1. Tabs/Underline: Match | Vendor | History | Contract | AI | Audit
2. Keyboard labels: Cmd+1-6

### Step 8: Right Panel — Tab Content (6 frames, only active visible)
1. **Match**: Three-way match header + summary cards + line-by-line table + tolerance rules
2. **Vendor**: Supplier Summary Card + metrics row + Activity Feed
3. **History**: Price trend + match rate + prior invoices table
4. **Contract**: Active contract terms + compliance check
5. **AI**: AI Summary + Recommendation Card + Evidence Panel + Confidence
6. **Audit**: Audit Timeline + tamper evidence

### Step 9: Action Bar
1. Fixed bottom frame, H:64px, Fill
2. Left: Approval chain avatars + "You (current)" + authority limit
3. Right: Approve (Primary, Gold) + Reject (Danger) + Request Info (Secondary) + Escalate (Ghost) + More (Icon)

### Step 10: States
1. Loading: skeleton placeholders for all cards
2. Empty: redirect state (not applicable)
3. Error: banner with retry action
4. Reject: modal dialog (size S)
5. Escalate: right drawer (400px)

### Token Mapping
All ~105 tokens pre-mapped in Section 15. Apply via Tokens Studio.

---

## 17. Design Principles Validation

| Principle | How the Screen Satisfies It |
|-----------|----------------------------|
| Decision First (P8) | Action bar answers "What decision is required?" on every scroll. Evidence panel answers "Why?" |
| Calm Enterprise UX | Progressive disclosure via 4 persona modes. ~15 → ~35 → ~30 → ~50 data points. No visual noise. |
| AI Prepares | AI tab shows assessment, recommendation, confidence, evidence. No AI decisions, no chatbot. |
| Evidence First | 6 evidence tabs before action buttons. Match tab shows full three-way comparison. Evidence-before-approval mode enforced. |
| Progressive Disclosure | AP Clerk: full 35 pts. Approver: 15 pts. Collapsible sections. Expandable variance detail. |
| Exceptions First (P5) | Match tab highlights variances immediately. Red/gold variance cells in table. Exception colors visible without scrolling. |
| Trusted Information (P1) | Data freshness dot on Invoice Summary. Stale data blocks Approve. Every number has a source. |
| Preserve Human Judgement (P3) | AI recommends but never decides. Override rate tracked. Confidence shown for every AI output. |
| Multi-Currency (P10) | Functional currency equivalent below every amount. Currency code shown next to values. |
| Audit Integrity | Full audit timeline with SHA-256 evidence hash. Chain integrity verified. Tamper-evident design. |
