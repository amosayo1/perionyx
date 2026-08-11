# PEDS — Component Library Specification

This document defines every component in the Perionyx design system with exact Auto Layout specs, variants, states, and token mappings.

---

## 1. Buttons

### Component Set Structure
```
Button
├── Variant: Primary | Secondary | Ghost | Danger | Icon
├── Size: Small | Medium | Large
└── State: Default | Hover | Pressed | Disabled | Loading
```

### Base Spec
**Frame**: Auto Layout, Horizontal, Center aligned
- Gap: 8px (icon + label)
- Radius: `border-radius.semantic.control` (6px)
- Transition: all 200ms `easing.default`

### Size Variants

| Property | Small | Medium (Default) | Large |
|----------|-------|-------------------|-------|
| Height | 32px | 40px | 48px |
| Padding H | 12px | 16px | 20px |
| Font | `button-sm` (12px, medium) | `button` (14px, medium) | `button-lg` (16px, medium) |
| Radius | `border-radius.sm` (4px) | `border-radius.md` (6px) | `border-radius.lg` (8px) |
| Icon Size | 16px | 18px | 20px |

### Primary Button

| State | Fill | Text | Border | Shadow |
|-------|------|------|--------|--------|
| Default | `button.primary.bg` | `button.primary.text` | — | — |
| Hover | `button.primary.bg-hover` | `button.primary.text` | — | `shadow.glow-gold` |
| Pressed | `button.primary.bg-active` | `button.primary.text` | — | — |
| Disabled | `button.disabled.bg` | `button.disabled.text` | `button.disabled.border` | — |
| Loading | `button.primary.bg` | `button.primary.text` | — | — |

### Secondary Button

| State | Fill | Text | Border |
|-------|------|------|--------|
| Default | transparent | `button.secondary.text` | `button.secondary.border` |
| Hover | `button.secondary.bg-hover` | `button.secondary.text` | `button.secondary.border-hover` |
| Pressed | `button.secondary.bg-active` | `button.secondary.text` | `button.secondary.border-hover` |
| Disabled | `button.disabled.bg` | `button.disabled.text` | `button.disabled.border` |
| Loading | transparent | `button.secondary.text` | `button.secondary.border` |

### Ghost Button

| State | Fill | Text |
|-------|------|------|
| Default | transparent | `button.ghost.text` |
| Hover | `button.ghost.bg-hover` | `text.primary` |
| Pressed | `button.ghost.bg-active` | `text.primary` |
| Disabled | transparent | `text.disabled` |
| Loading | transparent | `button.ghost.text` |

### Danger Button

| State | Fill | Text |
|-------|------|------|
| Default | `button.danger.bg` | `button.danger.text` |
| Hover | `button.danger.bg-hover` | `button.danger.text` |
| Pressed | `button.danger.bg-active` | `button.danger.text` |
| Disabled | `button.disabled.bg` | `button.disabled.text` |
| Loading | `button.danger.bg` | `button.danger.text` |

### Icon Button
- Same sizes as regular buttons (32×32, 40×40, 48×48)
- Same state colours as Ghost button
- Icon centered, no label
- Tooltip on hover for accessibility

### Loading State
- Show spinner icon (16×16) replacing icon slot
- Text preserved
- Pointer-events: none
- Use same colours as Default state

---

## 2. Inputs

### Component Set Structure
```
Input
├── Variant: Text | Search | Password | Number | Textarea
├── State: Default | Hover | Focus | Filled | Error | Success | Disabled
└── Size: Small | Medium | Large
```

### Base Spec
**Frame**: Auto Layout, Horizontal, Center aligned
- Min-H: 40px (medium), H: auto
- Fill: `input.default.bg`
- Border: 1px, `input.default.border`
- Radius: `input.default.radius` (6px)
- Padding H: 12px
- Gap: 8px
- Text: style `body`, `input.default.text`
- Placeholder: style `body`, `input.default.placeholder`
- Transition: border 200ms `easing.default`, shadow 200ms

### Text Input States

| State | Border | Shadow | Fill |
|-------|--------|--------|------|
| Default | `input.default.border` | — | `input.default.bg` |
| Hover | `input.hover.border` | — | `input.default.bg` |
| Focus | `input.focus.border` | `input.focus.shadow` | `input.default.bg` |
| Filled | `input.default.border` | — | `input.default.bg` |
| Error | `input.error.border` | `input.error.shadow` | `input.default.bg` |
| Success | `input.success.border` | — | `input.default.bg` |
| Disabled | `input.disabled.border` | — | `input.disabled.bg` |

### Search Input
- Radius: `border-radius.semantic.pill` (full)
- Left icon: search/magnifying glass, 16px
- Right icon: Cmd+K hint (or clear button when filled)
- Same states as Text input

### Textarea
- Same as Text input but Vertical Auto Layout
- Min-H: 80px, H: auto (grows with content)
- Resize: vertical (via CSS, not Figma)

### Input Sizes

| Property | Small | Medium (Default) | Large |
|----------|-------|-------------------|-------|
| Height | 32px | 40px | 48px |
| Font | `sm` | `body` | `body-lg` |
| Padding H | 10px | 12px | 16px |

---

## 3. Cards

### Component Set Structure
```
Card
├── Type: Default | Elevated | Interactive | Metric | Selected | Decision | Evidence | Exception | AI-Summary | Audit | Financial-Metric
└── Has-Action: true, false
```

### Base Spec
**Frame**: Auto Layout, Vertical
- Fill: `card.default.bg`
- Border: 1px, `card.default.border`
- Shadow: `card.default.shadow`
- Radius: `card.default.radius` (8px)
- Padding: `card.default.padding` (20px)
- Gap: `card-gap` (16px)

### Card Type Variants

| Type | Fill | Border | Shadow | Extras |
|------|------|--------|--------|--------|
| Default | `surface.raised` | `border.default` | `shadow.soft` | — |
| Elevated | `surface.elevated` | `border.default` | `shadow.medium` | — |
| Interactive | `surface.raised` | `border.default` (hover: `border.strong`) | `shadow.soft` (hover: `shadow.medium`) | 200ms transition |
| Metric | `surface.raised` | `border.default` | `shadow.soft` | 3px gold top border inset |
| Selected | `surface.raised` | `border.gold` | `shadow.glow-gold` | — |
| Decision | `surface.raised` | `border.default` | `shadow.medium` | 3px gold left accent |
| Evidence | `surface.raised` | `border.default` | `shadow.soft` | Document icon in header |
| Exception | `surface.raised` | `border.default` | `shadow.soft` | 4px left accent (status colour) |
| AI Summary | `surface.raised` | `border.default` | `shadow.soft` | Sparkles icon + "AI" badge |
| Audit | `surface.raised` | `border.default` | `shadow.soft` | Clock icon, monospace timestamps |
| Financial Metric | `surface.raised` | `border.default` | `shadow.soft` | 3px gold top border, financial typography |

### Padding Variants
| Variant | Padding |
|---------|---------|
| Compact | 16px (card-padding-compact) |
| Default | 20px (card-padding) |
| Loose | 24px (card-padding-loose) |

---

## 4. Tables

### Component Set Structure
```
Table
├── Density: Default | Compact
├── Selection: None | Single | Multi
└── State: Empty | Loading | Populated
```

### Building Blocks

#### Table Header Cell
- Frame: Auto Layout, Horizontal, `table-cell-padding` H
- H: 40px (default), 32px (compact)
- Fill: `table.header-bg`
- Border-Bottom: 1px, `table.header-border`
- Text: style `table-header`, `table.header-text`
- Sort indicator: arrow icon, 12px, visible on hover/active

| State | Text | Sort Icon | Background |
|-------|------|-----------|------------|
| Default | `table.header-text` | hidden | `table.header-bg` |
| Hover | `table.header-text` | visible, muted | `row-hover` |
| Active | `text.primary` | visible, gold | `table.header-bg` |

#### Table Cell
- Frame: Auto Layout, Horizontal, `table-cell-padding` H
- H: 48px (default), 36px (compact)
- Fill: transparent
- Border-Bottom: 1px, `table.row-border`
- Text: style `table`, `table.cell-text`
- Financial text: style `financial-sm`, `table.cell-text`

| Type | Font | Alignment |
|------|------|-----------|
| Text | `table` | Left |
| Number | `table` | Right |
| Financial | `financial-sm` (mono) | Right |
| Status | `table` + status badge | Center |
| Date | `table` | Left |
| Action | icon buttons | Right |

#### Table Row
- Frame: Auto Layout, Horizontal, Fill
- H: auto (matches cells)
- Fill: `table.row-bg`

| State | Background |
|-------|-----------|
| Default | `table.row-bg` |
| Hover | `table.row-hover` |
| Selected | `table.row-selected` |

#### Table
- Frame: Auto Layout, Vertical, Fill
- Border: 1px, `table.header-border`
- Radius: `border-radius.semantic.card` (8px)
- Overflow: hidden (clips header radius)

### Empty State
- Centered: illustration + "No data" message + CTA button
- Padding: 80px 20px

### Loading State
- 5 skeleton rows
- Shimmer animation (2000ms)

---

## 5. Data Display Components

### KPI Card
- Type: `Card/Metric`
- Top accent: 3px gold border
- **Children** (Auto Layout, Vertical, gap 4px):
  1. Label: style `xs`, `text.secondary`
  2. Value: style `financial-lg` (32px, bold, mono), `text.primary`
  3. Trend: style `sm`, colour varies (positive green, negative red)
  4. Sub-label: style `micro`, `text.tertiary` (e.g. "vs last period")

### Statistic Card
- Type: `Card/Default`
- **Children** (Auto Layout, Vertical, gap 8px):
  1. Icon + Label row (Horiz, gap 8px)
  2. Value: style `financial` (24px, mono), `text.primary`
  3. Change indicator: arrow + percentage, style `sm`

### Timeline
**Frame**: Auto Layout, Vertical, Fill
- Gap: 0

**Timeline Item**:
- Frame: Auto Layout, Horizontal, Gap: 12px
- Padding: 8px 0
- **Left**: Status dot (8×8, radius full, status colour) + vertical line (1px, `border.subtle`)
- **Content**: Auto Layout, Vertical
  1. Title: style `sm-medium`, `text.primary`
  2. Description: style `sm`, `text.secondary`
  3. Timestamp: style `xs`, `text.tertiary`

| Status | Dot Colour |
|--------|-----------|
| Completed | `status.success` |
| In Progress | `status.info` |
| Pending | `status.warning` |
| Failed | `status.error` |
| Skipped | `text.disabled` |

### Activity Feed
Same structure as Timeline but:
- No connecting lines between items
- Larger gap: 12px
- Activity type icon (16px) instead of dot
- Right side: timestamp (style `xs`, `text.tertiary`)

### Audit Log
**Frame**: Auto Layout, Vertical
- Similar to Activity Feed but:
  - Monospace timestamps (style `code`, `text.tertiary`)
  - Actor name highlighted (style `sm-medium`)
  - Action description (style `sm`)
  - Before/after values (style `code`, `financial-xs`)
  - Policy reference badge

### Property List
**Frame**: Auto Layout, Vertical
- Gap: 8px

**Property Item**:
- Frame: Auto Layout, Horizontal, Fill
- Gap: 16px
- Padding: 4px 0
- Label: style `sm`, `text.secondary`, W: 120px (fixed)
- Value: style `sm-medium`, `text.primary`, Fill remaining

### Definition List
Similar to Property List but vertical:
- Label: style `xs`, `text.tertiary`, transform uppercase
- Value: style `body`, `text.primary`
- Gap between items: 16px

---

## 6. Badges & Status Chips

### Component Set Structure
```
Badge
├── Variant: Default | Gold | Success | Warning | Error | Info
└── Size: Small | Medium
```

### Badge Spec
**Frame**: Auto Layout, Horizontal, Center aligned
- Padding H: 8px (medium), 6px (small)
- Padding V: 2px (medium), 1px (small)
- Border: 1px
- Radius: `border-radius.tag` (4px)
- Text: style `badge` (11px, semibold, 0.02em tracking)

### Status Chip
Same as badge but with left dot indicator:
- Dot: 6×6, radius full, left of text
- Gap: 4px

### Status Chip Variants

| Variant | Dot | Fill | Text | Border |
|---------|-----|------|------|--------|
| Pending | `status-chip.pending-text` | `status-chip.pending-bg` | `status-chip.pending-text` | matching border |
| Completed | `status-chip.completed-text` | `status-chip.completed-bg` | `status-chip.completed-text` | matching border |
| Failed | `status-chip.failed-text` | `status-chip.failed-bg` | `status-chip.failed-text` | matching border |
| Draft | `status-chip.draft-text` | `status-chip.draft-bg` | `status-chip.draft-text` | matching border |

### Risk Badge
- Variant of Status Chip
- Colours: `risk.low` | `risk.medium` | `risk.high` | `risk.critical`
- Text: "Low" / "Med" / "High" / "Critical"
- Dot uses risk colour

### Approval Badge
- "Approved" → success
- "Rejected" → error
- "Pending" → warning
- "Needs Review" → info

### Exception Badge
- Categorised by exception type
- Colours match exception severity

### Financial Badge
- "Overdue" → error
- "Current" → gold/current
- "Paid" → success
- "Pending" → warning

---

## 7. Tabs

### Component Set Structure
```
Tabs
├── Variant: Underline | Pills | Segmented
├── State: Default | Hover | Active | Disabled
└── Size: Small | Medium | Large
```

### Underline Tabs (Default)
**Frame**: Auto Layout, Horizontal
- Border-Bottom: 1px, `border.default`
- Gap: 0

**Tab Item**:
- Frame: Auto Layout, Horizontal, Center
- Padding H: 16px, Padding V: 12px
- Text: style `button` or `sm-medium`
- Border-Bottom: 2px, transparent

| State | Text | Bottom Border |
|-------|------|---------------|
| Default | `text.secondary` | transparent |
| Hover | `text.primary` | transparent (or subtle) |
| Active | `nav-tab.active-text` | `nav-tab.active-indicator`, 2px |
| Disabled | `text.disabled` | transparent |

### Pill Tabs
- Each tab: pill shape (radius `full`)
- Padding: 12px 16px
- Active: fill `brand.gold`, text `text.inverse`
- Default: transparent, text `text.secondary`, hover bg `surface.elevated`

### Segmented Control
- Frame: 1px border, radius `control` (6px), no gap
- Each segment: 50% width, center aligned
- Active: fill `surface.elevated` or `brand.gold-subtle`

---

## 8. Dropdown / Select

### Trigger (same as Input)
- Frame: same as Input/Default
- Right icon: chevron-down, 16px, `text.tertiary`
- Text: selected value (style `body`) or placeholder (style `body`, `text.tertiary`)

### States
- Same as Input: Default, Hover, Focus, Disabled, Error

### Dropdown Menu
**Frame**: Auto Layout, Vertical
- Min-W: 200px (match trigger width)
- Fill: `surface.floating`
- Border: `border.strong`
- Shadow: `shadow.large`
- Radius: `dropdown` (8px)
- Padding: 4px
- Gap: 0

**Menu Item**:
- Frame: Auto Layout, Horizontal, Center
- H: 36px, Fill width
- Padding H: 12px
- Gap: 8px
- Radius: 4px
- Text: style `body`

| State | Background | Text | Icon |
|-------|-----------|------|------|
| Default | transparent | `text.primary` | `text.tertiary` |
| Hover | `surface.elevated` | `text.primary` | `text.primary` |
| Active/Selected | `brand.gold-subtle` | `brand.gold` | `brand.gold` |
| Disabled | transparent | `text.disabled` | `text.disabled` |

**Sections**:
- Group label: style `nav-group` (11px, uppercase), `text.tertiary`, padding 8px 12px 4px
- Divider: H: 1px, fill `border.default`, margin 4px 0

---

## 9. Pagination

**Frame**: Auto Layout, Horizontal, Center aligned
- Gap: 4px

**Components**:
1. **Page Button**: 32×32, radius `control` (6px)
   - Text: style `button`, centered
   - Default: `text.secondary`
   - Active: fill `brand.gold`, text `text.inverse`
   - Hover: fill `surface.elevated`
2. **Arrow Buttons**: Icon buttons, left/right arrows
3. **Ellipsis**: "..." text node, 32px wide, `text.disabled`
4. **Page Info**: style `xs`, `text.tertiary`, "1—10 of 100"

---

## 10. Drawer

**Frame**: Auto Layout, Vertical
- W: 400px (default), H: Fill
- Fill: `surface.raised`
- Border-Left: 1px, `border.default`
- Shadow: `shadow.large`
- Animation: slide-in-right (300ms, ease-out)

**Children**:
1. **Header**: title + close button, 56px height
2. **Body**: scrollable, padding `card-padding`
3. **Footer (optional)**: action buttons, sticky bottom

---

## 11. Skeleton / Loading States

### Component Set Structure
```
Skeleton
├── Variant: Text | Card | Circle | Chart | Table-Row | Metric
└── Width: Full | Narrow | Custom
```

### Spec
**Frame**: Auto Layout
- Fill: `skeleton.bg`
- Radius: `border-radius.semantic.control` (6px)
- Shimmer overlay: gradient from transparent → `skeleton.shimmer` → transparent, 2000ms animation

### Variants
| Variant | Size | Shape |
|---------|------|-------|
| Text | H: 14px, W: varies | Full radius sm |
| Card | 280×160 | Full radius card |
| Circle | 40×40 | Radius full |
| Chart | H: 200px, Fill | Radius lg |
| Table Row | H: 48px, Fill | Radius none |
| Metric | 200×100 | Radius card |
