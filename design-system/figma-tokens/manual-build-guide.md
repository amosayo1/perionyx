# Perionyx Enterprise Design System (PEDS) — Figma Build Guide

## Before You Start

1. **Install [Tokens Studio](https://tokens.studio/)** Figma plugin
2. Open the Figma file
3. Run Tokens Studio → Settings → Import → Select `design-system/figma-tokens/tokens/` folder
4. Tokens Studio will create three token sets: **global**, **dark**, and **light**
5. Select the **Dark Theme** or **Light Theme** from Tokens Studio theme dropdown
6. All colour, typography, spacing, radius, and shadow tokens are now available in both themes

## Page Structure

Create 7 pages in this order:

| # | Page | Purpose |
|---|------|---------|
| 00 | **Cover** | Title page with brand mark, version, principles |
| 01 | **Foundations** | Token documentation — colours, typography, spacing, grid, elevation, principles |
| 02 | **Components** | Reusable UI components with Auto Layout, variants, states |
| 03 | **Patterns** | UX patterns — dashboards, queues, workspaces, AI/decision components |
| 04 | **Screens** | Full screen mock-ups built from components |
| 05 | **Prototype** | Connected flows and user journeys |
| 99 | **Playground** | Unstructured experimentation area |

---

## 01 Foundations — Build Instructions

### Page Setup
- **Frame**: 1440 × 8000px, fill `surface.base`

### Sections (in order, y-offset from top):

| Section | y-offset | Contents |
|---------|----------|----------|
| Typography | 80 | 18 text styles with labels + metadata |
| Brand Colors | 900 | 6 colour swatches (60×60, 6px radius) |
| Surface Colors | 1150 | 6 surface swatches |
| Text Colors | 1450 | 7 text colour swatches |
| Status Colors | 1800 | 5 status swatches |
| Financial & Risk | 2100 | 11 swatches |
| Chart Colors | 2450 | 8 chart series swatches |
| AI Confidence | 2800 | 8 AI colour swatches |
| Spacing Scale | 3150 | 13 spacing blocks (2–96px) |
| Border Radius | 3700 | 8 radius demo squares |
| Shadows & Elevation | 4200 | 5 elevation demo cards |
| Design Principles | 4700 | 5 principle cards (title + description) |
| Grid System | 5100 | 12-column grid demo |

### Typography Style Details

Create each as a Text Style (not just a label):

| Name | Family | Size | Weight | Line Ht | Letter Sp | Colour | Auto Resize |
|------|--------|------|--------|---------|-----------|--------|-------------|
| `Display` | Inter | 48 | Bold (700) | 56 | -2% | text.primary | Height |
| `Hero` | Inter | 36 | Bold (700) | 44 | -2% | text.primary | Height |
| `H1` | Inter | 30 | SemiBold (600) | 36 | -1.5% | text.primary | Height |
| `H2` | Inter | 24 | SemiBold (600) | 32 | -1% | text.primary | Height |
| `H3` | Inter | 20 | SemiBold (600) | 28 | -0.5% | text.primary | Height |
| `H4` | Inter | 18 | Medium (500) | 28 | 0 | text.primary | Height |
| `Body` | Inter | 16 | Regular (400) | 24 | 0 | text.primary | Height |
| `Body/Medium` | Inter | 16 | Medium (500) | 24 | 0 | text.primary | Height |
| `Small` | Inter | 14 | Regular (400) | 20 | 0 | text.secondary | Height |
| `Small/Medium` | Inter | 14 | Medium (500) | 20 | 0 | text.secondary | Height |
| `XS` | Inter | 12 | Regular (400) | 16 | +1% | text.secondary | Height |
| `XS/Medium` | Inter | 12 | Medium (500) | 16 | +1% | text.tertiary | Height |
| `Micro` | Inter | 11 | Medium (500) | 14 | +2% | text.tertiary | Height |
| `Financial` | JetBrains Mono | 24 | SemiBold (600) | 32 | -1% | brand.gold | Height |
| `Financial/Large` | JetBrains Mono | 32 | Bold (700) | 40 | -1.5% | text.primary | Height |
| `Financial/Small` | JetBrains Mono | 14 | Medium (500) | 20 | 0 | text.primary | Height |
| `Code` | JetBrains Mono | 14 | Regular (400) | 24 | 0 | text.primary | Height |
| `Table` | Inter | 14 | Regular (400) | 20 | 0 | text.primary | Height |
| `Table/Header` | Inter | 12 | SemiBold (600) | 16 | +2% | text.secondary | Height |
| `Badge` | Inter | 11 | SemiBold (600) | 14 | +2% | text.secondary | Height |
| `Tooltip` | Inter | 12 | Medium (500) | 16 | +1% | text.primary | Height |
| `Button/Label` | Inter | 14 | Medium (500) | 20 | 0 | text.primary | Height |
| `Button/Small` | Inter | 12 | Medium (500) | 16 | 0 | text.primary | Height |
| `Link` | Inter | 14 | Medium (500) | 20 | 0 | text.link | Height |

---

## 02 Components — Build Instructions

### Naming Convention

```
Category/Variant/State
```

Examples:
- `Button/Primary/Default`
- `Input/Default`
- `Badge/Success`
- `Card/Metric`

### 2.1 Buttons

#### Primary Button
**Frame**: Auto Layout, Horizontal, 12px padding left/right, 0 vertical
- W: Hug, H: Hug, Radius: 6px
- Fill: `brand.gold`, Hover: `brand.gold-hover`, Pressed: `brand.gold-active`
- Disabled: `surface.elevated` fill, `text.disabled` label, not-allowed cursor

**Children**:
- Text node: style `Button/Label`, colour `text.inverse` (#0a0a0f)

**Variants** (create as component set):
| Property | Values |
|----------|--------|
| Variant | primary, secondary, ghost, danger, icon |
| State | default, hover, pressed, disabled |
| Size | default (40px h), small (32px h), large (48px h) |

#### Primary Variants
| Variant | Fill | Text | Border | Hover Fill |
|---------|------|------|--------|------------|
| Primary | `brand.gold` | `text.inverse` | — | `brand.gold-hover` |
| Secondary | transparent | `text.primary` | `border.default` | `surface.elevated` |
| Ghost | transparent | `text.secondary` | — | `surface.elevated` |
| Danger | `status.error` | #ffffff | — | `#dc2626` |
| Icon | transparent | `text.secondary` | — | `surface.elevated` |

#### Size Variants
| Size | Height | Padding H | Font | Radius |
|------|--------|-----------|------|--------|
| Large | 48px | 20px | Button/Label (16px) | 8px |
| Default | 40px | 16px | Button/Label (14px) | 6px |
| Small | 32px | 12px | Button/Small | 4px |

**States** (each variant × size):
- Default: base fill
- Hover: hover fill + `shadow.glow-gold` (primary only) or `border.strong` (secondary)
- Pressed: active fill
- Disabled: `surface.elevated` fill, `text.disabled`, no shadow

### 2.2 Inputs

**Frame**: Auto Layout, Horizontal, 12px padding
- H: 40px, Radius: 6px (control)
- Fill: `surface.base`
- Border: 1px, `border.default`

**Children**:
- Left icon (optional): 16×16, `icon.muted`
- Text node: style `Body`, colour `text.primary`, placeholder `text.tertiary`
- Right icon (optional): for clear button, dropdown, etc.

**Variants**:
| Variant | Border | Shadow |
|---------|--------|--------|
| Default | `border.default` | — |
| Hover | `border.strong` | — |
| Focus | `border.gold` | `shadow.glow-gold` + 0 0 0 1px gold-focus |
| Error | `status.error-border` | 0 0 0 1px error-border |
| Disabled | `border.subtle` | — |

**States for each variant**:
- Filled: text present, colour `text.primary`
- Empty: placeholder text (`text.tertiary`)
- Focused: focus ring visible
- Disabled: fill `surface.elevated`, text `text.disabled`

### 2.3 Cards

**Frame**: Auto Layout, Vertical, 20px padding, 16px gap
- Radius: 8px (card)
- Fill: `surface.raised`

**Variants**:
| Variant | Fill | Border | Shadow | Extras |
|---------|------|--------|--------|--------|
| Default | `surface.raised` | `border.default` | `shadow.soft` | — |
| Elevated | `surface.elevated` | `border.default` | `shadow.medium` | — |
| Interactive | `surface.raised` | `border.default` (hover: `border.strong`) | `shadow.soft` (hover: `shadow.medium`) | 200ms transition |
| Metric | `surface.raised` | `border.default` | `shadow.soft` | 3px gold top border |
| Selected | `surface.raised` | `border.gold` | `shadow.glow-gold` | — |

### 2.4 Badges

**Frame**: Auto Layout, Horizontal, 6px pad H, 2px pad V
- Radius: 4px (tag)
- Border: 1px

**Variants**:
| Variant | Fill | Text | Border |
|---------|------|------|--------|
| Default | `surface.elevated` | `text.secondary` | `border.default` |
| Gold | `brand.gold-muted` | `brand.gold` | `brand.gold-border` |
| Success | `status.success-muted` | `status.success` | `status.success-border` |
| Warning | `status.warning-muted` | `status.warning` | `status.warning-border` |
| Error | `status.error-muted` | `status.error` | `status.error-border` |
| Info | `status.info-muted` | `status.info` | `status.info-border` |

### 2.5 Tables

**Building blocks** (create as nested components):

#### Table Header Cell
- Frame: H: 40px, Auto Layout, 12px padding H, fill `transparent`
- Bottom border: 1px, `border.default`
- Text: style `Table/Header`, colour `text.secondary`

#### Table Cell
- Frame: H: 48px (default), Auto Layout, 12px padding H
- Bottom border: 1px, `border.subtle`
- Text: style `Table`, colour `text.primary`
- Hover: fill `rgba(255,255,255,0.03)`

#### Table Row
- Frame: Auto Layout, Horizontal, fill parent
- Children: HStack of cells

#### Table
- Frame: Auto Layout, Vertical
- Children: Header Row + Data Rows

**Densities**:
| Property | Default | Compact |
|----------|---------|---------|
| Row height | 48px | 36px |
| Cell padding H | 12px | 8px |
| Font | 14px | 12px |

### 2.6 Tabs

**Frame**: Auto Layout, Horizontal, 0 gap
- Bottom border: 1px, `border.default`

**Tab Item**:
- Frame: Auto Layout, Horizontal, 16px padding H, 12px padding V
- Text: style `Button/Label`, colour `text.secondary`
- Bottom border: 2px, transparent

**Variants**:
| Variant | Text | Bottom Border |
|---------|------|---------------|
| Default | `text.secondary` | transparent |
| Active | `brand.gold` | `brand.gold`, 2px |
| Hover | `text.primary` | transparent |

### 2.7 Dropdown / Select

**Frame**: Same as Input (40px h, 6px radius)
- Fill: `surface.base`
- Border: `border.default`

**Children**:
- Text (selected value or placeholder)
- Right icon: chevron-down, 16px, `icon.muted`

**Dropdown Menu** (separate component):
- Frame: Auto Layout, Vertical
- Fill: `surface.floating`
- Border: `border.strong`
- Shadow: `shadow.large`
- Radius: 8px (dropdown)
- Padding: 4px

**Menu Item**:
- Frame: H: 36px, Auto Layout, 12px padding H
- Text: style `Body`
- Hover: fill `surface.elevated`
- Active: fill `brand.gold-subtle`, text `brand.gold`

### 2.8 Modal / Dialog

**Frame**: Auto Layout, Vertical, 24px padding (dialog)
- Fill: `surface.raised`
- Border: `border.strong`
- Shadow: `shadow.floating`
- Radius: 12px (dialog)
- Min-W: 480px, Max-W: 640px

**Children**:
1. **Header**: 24px font, semibold, `text.primary` + close icon button
2. **Body**: style `Body`, colour `text.secondary`, line-height 1.625
3. **Footer**: HStack of buttons (primary + ghost), gap 8px, justify end

### 2.9 Toast

**Frame**: Auto Layout, Horizontal, 12px padding, 8px gap
- Radius: 8px (toast)
- Fill: `surface.raised`
- Border: 1px
- Shadow: `shadow.medium`
- Min-W: 320px, Max-W: 420px

**Children**:
1. Icon: 20px, variant colour
2. VStack:
   - Title: style `Body/Medium`, `text.primary`
   - Description: style `Small`, `text.secondary`

**Variants**:
| Variant | Border | Icon Colour |
|---------|--------|-------------|
| Success | `status.success-border` | `status.success` |
| Error | `status.error-border` | `status.error` |
| Warning | `status.warning-border` | `status.warning` |
| Info | `status.info-border` | `status.info` |

### 2.10 Tooltip

**Frame**: Auto Layout, Horizontal, 6px padding H, 4px padding V
- Fill: `surface.floating`
- Border: `border.strong`
- Shadow: `shadow.medium`
- Radius: 4px (tooltip)
- Max-W: 280px
- Text: style `Tooltip`, `text.primary`

### 2.11 Toggle

**Frame**: W: 36px, H: 20px, Radius: 10px (full)
- Fill (off): `surface.elevated`
- Fill (on): `brand.gold`

**Children**:
- Knob: W: 16px, H: 16px, Radius: full, fill white
  - Position off: left 2px
  - Position on: right 2px

### 2.12 Checkbox

**Frame**: W: 18px, H: 18px, Radius: 4px
- Border: `border.strong`
- Fill (checked): `brand.gold`
- Fill (unchecked): transparent

### 2.13 Radio

**Frame**: W: 18px, H: 18px, Radius: full
- Border: 2px, `border.strong`
- Fill (selected): `brand.gold`
- Inner dot: W: 8px, H: 8px, Radius: full, white

### 2.14 Pagination

**Frame**: Auto Layout, Horizontal, 4px gap

**Components**:
- Page button: 32×32, 6px radius, text `Body/Medium`
  - Active: fill `brand.gold`, text `text.inverse`
  - Default: transparent, text `text.secondary`
- Arrow buttons: Icon buttons for prev/next
- Ellipsis: Text node "...", 32px wide

### 2.15 Breadcrumbs

**Frame**: Auto Layout, Horizontal, 4px gap
- Text: style `Small`, colour `text.tertiary`
- Separator: "/" or "›" text, `text.disabled`
- Active page: `text.primary`

---

## AI Components — Spec

These are semantic grouping components. Create as component sets with variants.

### AI Summary Card
Like Card/Default but with:
- Left gold accent border (3px)
- AI icon in header (Sparkles, brand gold)
- "AI Generated" badge top-right
- Body: bullet-point summary, `text.primary`
- Footer: confidence indicator + source link

### Confidence Indicator
**Frame**: Auto Layout, Horizontal, 8px gap
**Children**:
- Dot: 8×8, Radius full
- Label: style `Small`, `text.secondary`

**Variants**: High (green), Medium (amber), Low (red), Processing (gold pulse)

### Evidence Summary
**Frame**: Card/Default with:
- Icon: file/text icon, `icon.muted`
- Title: style `Body/Medium`
- Source: style `Small`, `text.tertiary`
- Timestamp: style `Micro`
- Confidence: inline badge

### Exception Explanation
**Frame**: Card with:
- Left border: status colour (4px)
- Category badge (top-right)
- Description: style `Body`
- Impact: style `Small/Medium` + financial value
- Suggested action: style `Link`

---

## Decision Components — Spec

### Decision Card
**Frame**: Card/Interactive, 320×auto
**Children**:
1. Gold accent bar (3px, top)
2. Decision type badge (e.g. "Approval Required")
3. Title/description
4. Financial amount (style `Financial/Large`)
5. Evidence count + confidence
6. Action buttons (Approve/Reject/Delegate)

### Approval Card
**Frame**: Card/Default
**Children**:
1. Requestor + timestamp
2. Amount (Financial style)
3. Policy reference
4. Approval chain (avatars with status)
5. Comment field (optional)
6. Approve/Reject buttons

### Evidence Card
**Frame**: Card/Default
**Children**:
1. Document type icon
2. File name / reference
3. Matched status badge
4. Key fields (amount, date, vendor)
5. Confidence score

### Audit Card
**Frame**: Card/Default
**Children**:
1. Timestamp + action label
2. Actor (name + role)
3. Before/after values (if mutation)
4. Policy reference

---

## 03 Patterns — Build Instructions

### Page Setup
- Frame: 1440 × 1600px, fill `surface.base`

### Pattern Documentation

For each pattern, create a frame (360×80) containing:
- Name: style `H4`, colour `brand.gold`
- Description: style `Body`, colour `text.secondary`

List of patterns to document:
1. **Master Detail** — List panel + detail panel with sync
2. **Work Queue** — Filterable, sortable queue with status columns
3. **Review Workspace** — Evidence panel + action panel + audit trail
4. **Approval Workspace** — Decision card + context + policy + history
5. **Exception Workspace** — Categorised exceptions with resolution actions
6. **Split View** — Side-by-side comparison (e.g. statement vs ledger)
7. **Inspector Panel** — Right-side detail panel for selected items
8. **Dashboard** — Metric grid + chart + recent activity
9. **Timeline** — Chronological event feed with status indicators
10. **Empty State** — Illustration + message + CTA
11. **Loading State** — Skeleton screens for all layouts
12. **Error State** — Error message + recovery actions

### AI Components listing (same structure):
- AI Summary Card
- Recommendation Card
- Evidence Summary
- Confidence Indicator
- Exception Explanation
- Risk Summary
- Supporting Evidence Panel

### Decision Components listing (same structure):
- Decision Card
- Evidence Card
- Approval Card
- Exception Card
- Review Card
- Activity Card
- Policy Card
- Audit Card
- Confidence Card

---

## 04 Screens — Build Instructions

### Page Setup
- Frame: 1440 × 1200px, fill `surface.base`

### Screen Frames

Create placeholders for each screen. Each is 600×380, Card frame with:
- Screen name (H4, text.primary)
- Resolution label + "Placeholder" text (Small, text.tertiary)

List of screens to create:
1. **Dashboard (CFO Overview)** — 1280×800
2. **Invoice Work Queue** — 1280×800
3. **Invoice Review Workspace** — 1440×900
4. **Approval Workspace** — 1280×800
5. **Exception Resolution** — 1280×800

---

## 05 Prototype — Build Instructions

### Page Setup
- Frame: 1440 × 800px, fill `surface.base`

Document 4 prototype flows as labelled text:
1. Flow 1: Invoice Receipt → Evidence Collection → Matching → Exception → Approval → Payment
2. Flow 2: Dashboard → KPI click → Drill-down → Detail → Action
3. Flow 3: Approval Queue → Review → Approve/Reject → Next
4. Flow 4: Exception Queue → Categorise → Research → Resolve → Document

---

## 99 Playground

### Page Setup
- Frame: 1440 × 800px, fill `surface.base`
- Header: "Playground", colour `text.disabled`
- Description: "Unstructured space for experimentation"

---

## Component Quality Checklist

Before marking a component complete:

- [ ] Auto Layout enabled for all frames
- [ ] All variants created in component set
- [ ] States reflect design (hover, focus, pressed, disabled)
- [ ] Naming convention: `Category/Variant/State`
- [ ] Text styles applied (not hardcoded)
- [ ] Colour tokens applied (not hardcoded hex)
- [ ] Radius tokens applied
- [ ] Shadow tokens applied
- [ ] Layout constraints set correctly
- [ ] Right-click → "Set as Main Component" done

---

## Design Token Usage Rules

| Token | Where Used | Figma Style Name |
|-------|-----------|------------------|
| `brand.gold` | Primary CTAs, active states, currency | gold |
| `surface.base` | Page backgrounds | surface-base |
| `surface.raised` | Cards, panels | surface-raised |
| `surface.elevated` | Dropdowns, popovers | surface-elevated |
| `surface.floating` | Modals, dialogs | surface-floating |
| `text.primary` | Highest emphasis text | text-primary |
| `text.secondary` | Body, descriptions | text-secondary |
| `text.tertiary` | Placeholders, hints | text-tertiary |
| `text.disabled` | Disabled text | text-disabled |
| `border.default` | Default borders | border-default |
| `status.success` | Success states | status-success |
| `status.warning` | Warning states | status-warning |
| `status.error` | Error states | status-error |
| `financial.positive` | Revenue, income | financial-positive |
| `financial.negative` | Expenses, losses | financial-negative |

---

---

## 02 Components — Navigation Section

### Sidebar (Expanded)
**Frame**: Auto Layout, Vertical, W:280px, H:Fill
- Fill: `sidebar.bg`
- Border-Right: 1px, `topbar.border`
- Padding: 12px 8px

**Children** (top→bottom):
1. **Logo Area**: 40px, Horizontal, gold logo mark + "Perionyx" text
2. **Search Bar**: Input/Search variant, 36px height
3. **Nav Group** (repeat for each section):
   - Group label: style `nav-group`, `sidebar.group-label`, uppercase
   - Nav items (36px height, 6px radius, 12px padding)
4. **Divider**: 1px, `sidebar.divider`
5. **User Area** (pushed to bottom): avatar 28px + name + role

**Nav Item States**:
| State | Fill | Text | Icon | Left Border |
|-------|------|------|------|-------------|
| Default | transparent | `sidebar.item-text` | `sidebar.item-text` | — |
| Hover | `sidebar.item-hover` | `text.primary` | `text.primary` | — |
| Active | `sidebar.item-active` | `sidebar.item-active-text` | `sidebar.item-active-text` | 3px gold |

**Responsive**: At <1024px use collapsed variant

### Sidebar (Collapsed)
**Frame**: Auto Layout, Vertical, W:64px, H:Fill
- Same fill/border as expanded
- Icons centered (no labels)
- Tooltip on hover for each item
- Width transition: 250ms ease-out

### Top Navigation
**Frame**: Auto Layout, Horizontal, H:56px, Fill width
- Fill: `topbar.bg`, Border-bottom: 1px, `topbar.border`
- Padding: 0 16px, items center, space-between

**Sections**:
1. **Left**: Menu toggle (hamburger) + breadcrumb/workspace title
2. **Right**: Search trigger + Notifications (icon + badge) + User Menu (avatar + name)

### Global Search
**Frame**: Dialog overlay (640px wide, centered)
1. Search input (48px height, large icon)
2. Recent searches section
3. Results section (categorised)
4. Keyboard shortcuts footer

### Notifications Panel
**Frame**: Dropdown (400px wide, 560px max height)
1. Header: "Notifications" + "Mark all read"
2. Scrollable list: icon + title + description + timestamp
3. Unread: 3px gold left accent
4. Footer: "View all notifications"

### User Menu Dropdown
**Frame**: Dropdown (240px wide)
1. User info (avatar, name, role, email)
2. Divider + actions (Profile, Settings, Shortcuts)
3. Divider + Admin section (if applicable)
4. Divider + Theme toggle + Log out

### Breadcrumbs
**Frame**: Auto Layout, Horizontal, gap 6px
- Each crumb: style `link` or `sm`, `text.tertiary`
- Active crumb: `sm-medium`, `text.primary`
- Separator: "›", `text.disabled`

---

## 02 Components — Data Display Section

### KPI Card
**Frame**: Card/Metric, Auto Layout, Vertical, gap 4px
1. Label: style `xs`, `text.secondary`
2. Value: style `financial-lg`, `text.primary`
3. Trend: style `sm` (green ↑ or red ↓)
4. Sub-label: style `micro`, `text.tertiary`

### Timeline
**Frame**: Auto Layout, Vertical, gap 0
**Item**: Horizontal, gap 12px, padding 8px 0
- Left: status dot (8×8, full radius) + vertical line (1px)
- Content: title + description + timestamp

| Status | Dot Colour |
|--------|-----------|
| Completed | `status.success` |
| In Progress | `status.info` |
| Pending | `status.warning` |
| Failed | `status.error` |

### Audit Log
Similar to Timeline with:
- Monospace timestamps (style `code`)
- Actor highlighted (style `sm-medium`)
- Before/after values (style `code`, `financial-xs`)

### Property List
**Frame**: Auto Layout, Vertical, gap 8px
**Item**: Horizontal, gap 16px, padding 4px 0
- Label: style `sm`, `text.secondary`, W:120px
- Value: style `sm-medium`, `text.primary`

---

## 02 Components — AI Components Section

### AI Summary Card
**Frame**: Card/Default with gold left accent (3px)
1. Header: Sparkles icon (20px, gold) + "AI Summary" badge + timestamp
2. Summary text: 3-5 bullet points, style `body`
3. Confidence bar: 4px height, colour-coded fill
4. Source link: "View supporting evidence →"

**States**: Loading (skeleton), Ready, Error (retry button), Empty

### Confidence Indicator
**Frame**: Horizontal, gap 6px
- Dot: 8×8, radius full
- Label: style `sm`, colour matches level

| Level | Dot | Label |
|-------|-----|-------|
| High (≥80%) | `ai.high` | "High confidence" |
| Medium (≥50%) | `ai.medium` | "Medium confidence" |
| Low (<50%) | `ai.low` | "Low confidence" |
| Processing | `ai.processing` | "Analysing…" |

### Evidence Panel
**Frame**: Card/Default
1. Header: "Supporting Evidence" + count
2. Items: document icon + name + source + matched fields + confidence badge

### Recommendation Card
**Frame**: Card/Interactive with gold top accent (3px)
1. "Recommendation" + confidence badge
2. Title: recommended action (h4)
3. Rationale: 1-3 sentences
4. Impact: financial value (green/red)
5. Evidence count + action buttons

---

## 02 Components — Financial Components Section

### Currency Display
**Frame**: Auto Layout, Horizontal, gap 2px
- Currency code: style `financial-xs`, `text.tertiary`
- Amount: varies by context (financial-lg / financial / financial-sm)
- Negative amounts: red, parentheses

### Invoice Summary Card
**Frame**: Card/Default
1. Invoice # + vendor name + status badge
2. Amount: style `financial-lg`
3. Key fields: date, due, PO ref, GL code
4. Match status: badge (Matched/Partial/Unmatched)

### Payment Card
**Frame**: Card/Default
1. Payment ID + status chip
2. Amount: style `financial-lg`
3. Recipient: name + masked account
4. Approval chain: avatars with status dots
5. Actions: Approve, Reject, Hold

### Exception Card
**Frame**: Card with 4px left accent (status colour)
1. Exception type badge + severity badge
2. Title: what went wrong (h4)
3. Description + financial impact
4. Suggested resolution
5. Actions: Resolve, Escalate, Dismiss

### Approval Summary Card
**Frame**: Card/Default
1. "Approval Required" + count
2. Chain: avatar list with connectors
3. Rules applied
4. Current step
5. Actions: Approve, Reject, Delegate

### Cash Position Card
**Frame**: Card/Metric with gold top accent
1. Label: "Cash Position"
2. Total: style `financial-lg`
3. Breakdown: Operating / Reserved / Available
4. Sparkline: mini chart (120×32)
5. Timestamp: "Updated 2m ago"

---

## 03 Layout Primitives

Create these as reusable frames in the 03 Patterns page:

### Application Shell
- Top Navigation (56px) + Content Area (Sidebar 280px + Main Content)
- Responsive: sidebar collapses at <1024px, hides at <768px

### Dashboard Layout
- Metric Row (3-4 cards, equal width)
- Chart Section (2:1 split)
- Activity Section (1:1 split)

### Split View
- Left Panel (min 320px) + draggable divider + Right Panel

### Inspector Panel
- 400px right panel with border-left, scrollable content, fixed footer

### Modal Layout
- 480px default, 85vh max, centered on overlay

---

## Theme Switching

In Tokens Studio:
1. Create the **Dark Theme** and **Light Theme** as defined in `$themes.json`
2. Apply the theme via Tokens Studio dropdown
3. All components automatically switch colours
4. Verify key contrast pairs:
   - Dark: text.primary (#f7f6f2) on surface.base (#0a0a0f) → 16.5:1 ✓ AA
   - Light: text.primary (#1a1a1a) on surface.base (#ffffff) → 16.5:1 ✓ AA
   - Dark: text.secondary (#a1a1aa) on surface.base → 8.5:1 ✓ AA
   - Light: text.secondary (#52525b) on surface.base → 4.8:1 ✓ AA

---

## File Organisation Summary

```
Pages
├── 00 Cover                       1440×1024
├── 01 Foundations
│   ├── Typography scale            22 styles
│   ├── Colour swatches             50+ swatches (dark + light)
│   ├── Spacing blocks              13 blocks
│   ├── Radius demos                8 demos
│   ├── Elevation cards             5 cards
│   ├── Design Principles           5 cards
│   └── Grid system                 12-column demo
├── 02 Components
│   ├── Navigation (8): Sidebar Expanded, Collapsed, Top Nav, Search,
│   │                    Notifications, User Menu, Breadcrumbs, Workspace Switcher
│   ├── Buttons (5 variants × 3 sizes × 5 states = 75)
│   ├── Inputs (5 variants × 7 states × 3 sizes = 105)
│   ├── Selection: Checkbox, Radio, Toggle (3 states each)
│   ├── Cards (11 variants)
│   ├── Tables (2 densities, 3 states)
│   ├── Badges & Chips (5 categories × 4-6 variants)
│   ├── Tabs (3 variants × 3 sizes)
│   ├── Dropdown / Select (5 states)
│   ├── Modal / Drawer / Toast / Tooltip
│   ├── Pagination / Breadcrumbs
│   ├── Data Display: KPI Card, Timeline, Audit Log, Property List
│   ├── AI Components (9): Summary, Recommendation, Evidence,
│   │   Confidence, Risk, Documents, Timeline, Explain, Processing
│   └── Financial Components (10): Currency, Exchange Rate, JE,
│       Invoice, Supplier, Payment, Variance, Exception, Approval, Cash
├── 03 Patterns
│   ├── UX pattern cards (12)
│   ├── AI component cards (7)
│   ├── Decision component cards (9)
│   ├── Application Shell (with responsive variants)
│   ├── Dashboard Layout
│   ├── Split View
│   ├── Inspector Panel
│   └── Modal Layout
├── 04 Screens (5 placeholders)
├── 05 Prototype (4 flows)
└── 99 Playground (experimentation)
```

**Total: ~82 components across 15 categories | Dual theme | Full WCAG AA | 200+ design tokens**
