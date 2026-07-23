# Perionyx Enterprise Design System v1.0

Dark-theme enterprise design language for financial executives. Built on CSS custom properties + Tailwind CSS + Framer Motion + Radix UI.

---

## Table of Contents

1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Component Library](#component-library)
4. [Patterns](#patterns)

---

## Overview

Perionyx serves CFOs, Treasurers, Controllers, Finance Managers, and Auditors. Every design decision prioritizes **clarity, confidence, speed, beauty, and trust** — in that order.

The design system enforces visual consistency across 96+ routes, 130+ components, and 20+ enterprise modules. It is not a consumer SaaS aesthetic. It draws influence from Bloomberg Terminal, Stripe Dashboard, Linear, Apple, and the Mercedes S-Class interior.

### Core Principles

| Principle | Meaning |
|---|---|
| **Clarity** | Every screen answers one question; no visual noise |
| **Confidence** | Data is stale? Label it. Action is destructive? Confirm it. Balance is cached? Mark it. |
| **Speed** | CFOs don't wait. Metric values render first, charts second |
| **Beauty** | Achieved through restraint: generous whitespace, consistent rhythm, purposeful color |
| **Trust** | Every number has a source; every state has an explanation |

### Technology Stack

| Layer | Technology |
|---|---|
| CSS Foundation | CSS custom properties (design tokens) |
| Utility CSS | Tailwind CSS |
| Animation | Framer Motion v12 |
| Primitives | Radix UI (Dialog, Select, Tooltip, Dropdown) |
| Icons | Lucide React |
| Typography | Inter (sans) + JetBrains Mono (mono) |
| Charts | Custom SVG (zero external chart libraries) |

### Visual Identity

| Element | Target | Description |
|---|---|---|
| Charcoal surfaces | ~95% | Backgrounds, cards, sidebars, headers |
| Typography | ~4% | White/off-white text on charcoal |
| Gold accents | ~1% | Currency, active states, key metrics, logo |

---

## Design Tokens

### Color Palette

#### Surfaces

| Token | Hex | Usage |
|---|---|---|
| `surface-primary` | `#0a0a0f` | App background, page canvas |
| `surface-secondary` | `#111118` | Card backgrounds, sidebar |
| `surface-tertiary` | `#1a1a24` | Hovered cards, nested panels |
| `surface-elevated` | `#222230` | Dropdowns, popovers, floating elements |
| `surface-overlay` | `rgba(0,0,0,0.6)` | Modal backdrop, sheet overlay |

#### Gold

| Token | Hex | Usage |
|---|---|---|
| `gold` | `#d4af37` | Brand accent, active nav, key metrics |
| `gold-muted` | `rgba(212,175,55,0.15)` | Gold backgrounds, subtle highlights |
| `gold-hover` | `rgba(212,175,55,0.25)` | Gold hover states |

#### Borders

| Token | Value | Usage |
|---|---|---|
| `border-default` | `rgba(255,255,255,0.08)` | Card borders, table dividers |
| `border-subtle` | `rgba(255,255,255,0.04)` | Inner section dividers |
| `border-strong` | `rgba(255,255,255,0.15)` | Focused inputs, active states |
| `border-gold` | `rgba(212,175,55,0.4)` | Gold-accented borders, active nav items |

#### Text

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#f7f6f2` | Headings, primary content, metric values |
| `text-secondary` | `#a1a1aa` | Descriptions, labels, secondary info |
| `text-tertiary` | `#71717a` | Placeholders, hints, timestamps |
| `text-disabled` | `#52525b` | Disabled text, read-only labels |

### Status Colors

| Status | Base | Muted | Usage |
|---|---|---|---|
| Success | `#22c55e` | `rgba(34,197,94,0.15)` | Completed, healthy, approved |
| Warning | `#f59e0b` | `rgba(245,158,11,0.15)` | Caution, attention needed |
| Danger | `#ef4444` | `rgba(239,68,68,0.15)` | Error, failed, rejected, destructive |
| Info | `#3b82f6` | `rgba(59,130,246,0.15)` | Informational, neutral status |

### Typography

| Font | Weight | Usage |
|---|---|---|
| Inter | 400 (regular) | Body text, labels, descriptions |
| Inter | 500 (medium) | Subheadings, button text, nav items |
| Inter | 600 (semibold) | Section titles, card headings |
| Inter | 700 (bold) | Page titles, metric values |
| JetBrains Mono | 400 | Code, financial figures, monospace |

#### Named Size Tokens

| Token | Size | Line Height | Usage |
|---|---|---|---|
| `text-display` | 2.5rem (40px) | 1.2 | Hero metrics, dashboard totals |
| `text-h1` | 2rem (32px) | 1.25 | Page titles |
| `text-h2` | 1.5rem (24px) | 1.3 | Section headings |
| `text-h3` | 1.25rem (20px) | 1.4 | Card titles, subsection headings |
| `text-h4` | 1.125rem (18px) | 1.4 | Sub-card titles |
| `text-body-lg` | 1rem (16px) | 1.5 | Body text (large) |
| `text-body` | 0.9375rem (15px) | 1.5 | Body text (default) |
| `text-body-sm` | 0.875rem (14px) | 1.5 | Compact body text |
| `text-caption` | 0.8125rem (13px) | 1.5 | Captions, secondary labels |
| `text-small` | 0.75rem (12px) | 1.5 | Fine print, metadata |
| `text-tiny` | 0.6875rem (11px) | 1.5 | Micro labels, badges |
| `text-tooltip` | 0.75rem (12px) | 1.4 | Tooltip content |
| `text-nav` | 0.875rem (14px) | 1 | Navigation items |
| `text-mono-lg` | 1.125rem (18px) | 1.5 | Code blocks (large) |
| `text-mono` | 0.9375rem (15px) | 1.5 | Inline code, figures |
| `text-mono-sm` | 0.8125rem (13px) | 1.5 | Compact figures |
| `text-mono-xs` | 0.75rem (12px) | 1.5 | Ticker data, compact code |
| `text-mono-tiny` | 0.6875rem (11px) | 1.5 | Timestamps, smallest figures |

### Spacing

#### Numeric Scale (px)

| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 14 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 80 | 96 | 128 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0px | 4px | 8px | 12px | 16px | 20px | 24px | 32px | 40px | 48px | 56px | 64px | 80px | 96px | 128px | 160px | 192px | 224px | 256px | 320px | 384px | 512px |

#### Semantic Spacing

| Token | Value | Usage |
|---|---|---|
| `space-page` | 24px (mobile) / 32px (desktop) | Page horizontal padding |
| `space-card` | 24px | Card internal padding |
| `space-section` | 32px | Gap between page sections |
| `space-panel` | 16px | Gap between sidebar panels |
| `space-form` | 16px | Gap between form fields |
| `space-table` | 8px | Table cell padding |
| `space-navigation` | 8px | Gap between nav items |
| `space-dialog` | 24px | Dialog internal padding |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-none` | 0 | No radius |
| `radius-sm` | 4px | Badges, small elements |
| `radius-md` | 6px | Buttons, inputs |
| `radius-lg` | 8px | Cards, containers |
| `radius-xl` | 12px | Dialogs, sheets |
| `radius-2xl` | 16px | Large cards |
| `radius-3xl` | 24px | Modals |
| `radius-full` | 9999px | Circles, pills |

### Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-soft` | `0 1px 3px rgba(0,0,0,0.3)` | Subtle elevation |
| `shadow-medium` | `0 4px 6px rgba(0,0,0,0.4)` | Cards, panels |
| `shadow-large` | `0 10px 15px rgba(0,0,0,0.5)` | Elevated elements |
| `shadow-floating` | `0 20px 40px rgba(0,0,0,0.6)` | Dropdowns, popovers |
| `shadow-popover` | `0 12px 24px rgba(0,0,0,0.5)` | Tooltips, popovers |
| `shadow-modal` | `0 24px 48px rgba(0,0,0,0.7)` | Modal dialogs |
| `shadow-dialog` | `0 20px 40px rgba(0,0,0,0.6)` | Side sheets |
| `shadow-sidebar` | `2px 0 8px rgba(0,0,0,0.4)` | Sidebar elevation |
| `shadow-toast` | `0 8px 24px rgba(0,0,0,0.5)` | Toast notifications |

#### Glow Variants

| Token | Value | Usage |
|---|---|---|
| `glow-gold` | `0 0 20px rgba(212,175,55,0.3)` | Gold hover glow, active states |
| `glow-success` | `0 0 15px rgba(34,197,94,0.25)` | Success indicator glow |
| `glow-danger` | `0 0 15px rgba(239,68,68,0.25)` | Danger alert glow |

### Motion

#### Durations

| Token | Value | Usage |
|---|---|---|
| `duration-instant` | 50ms | Micro-interactions (opacity, color) |
| `duration-fast` | 100ms | Button press, checkbox toggle |
| `duration-normal` | 200ms | Hover states, focus rings |
| `duration-slow` | 300ms | Dialog enter/exit, expand/collapse |
| `duration-slower` | 400ms | Page transitions, sidebar slide |
| `duration-slowest` | 600ms | Complex orchestrated animations |

#### Easings

| Token | Value | Usage |
|---|---|---|
| `ease-linear` | `linear` | Progress bars, loading spinners |
| `ease-default` | `ease-in-out` | General purpose |
| `ease-in` | `ease-in` | Exiting animations (shrink, fade out) |
| `ease-out` | `ease-out` | Entering animations (grow, fade in) |
| `ease-spring` | `spring` | Natural bounce on dialogs, toasts |
| `ease-bounce` | `bounce` | Celebratory feedback |
| `ease-emphasize` | `cubic-bezier(0.4,0,0.2,1)` | High-emphasis transitions |

#### Animation Variants (Framer Motion)

| Variant | Description |
|---|---|
| `fadeIn` | Opacity 0 → 1 |
| `fadeInUp` | Opacity 0 → 1 + translateY(8px) → 0 |
| `fadeInDown` | Opacity 0 → 1 + translateY(-8px) → 0 |
| `scaleIn` | Scale 0.95 → 1 + opacity 0 → 1 |
| `slideInLeft` | TranslateX(-100%) → 0 |
| `slideInRight` | TranslateX(100%) → 0 |
| `expandCollapse` | Height auto → measured → auto (AnimatePresence) |
| `stagger` | Parent variant that staggers children with 30ms delay |
| `popLayout` | Scale 0.9 + opacity 0 → 1 (for exiting elements with layout) |
| `shimmer` | CSS keyframe: translateX(-100%) → translateX(100%) on 1.5s loop |
| `pulse` | Opacity 0.5 → 1 → 0.5 (2s loop) |
| `counter` | Animate number from 0 to target (600ms cubic ease-out) |
| `slideInRightToast` | TranslateX(120%) → 0 with spring physics |
| `scaleBadge` | Scale 0 → 1.1 → 1 (pop-in for badges) |
| `expandRow` | Height 0 → auto with opacity fade |
| `rotateIcon` | Rotate 0 → 90deg (chevron expand) |
| `glowPulse` | Box-shadow intensity 0.2 → 0.5 → 0.2 (2s loop) |

---

## Component Library

### Button

7 variants, 5 sizes, loading and icon support.

#### Variants

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| `primary` | `gold` | `surface-primary` | none | Primary actions (Save, Submit, Approve) |
| `secondary` | `surface-tertiary` | `text-primary` | `border-default` | Secondary actions (Cancel, Back) |
| `ghost` | transparent | `text-secondary` | none | Tertiary actions, toolbar buttons |
| `outline` | transparent | `text-primary` | `border-strong` | Emphasized secondary (Export, Add) |
| `danger` | `danger` | white | none | Destructive actions (Delete, Revoke) |
| `success` | `success` | white | none | Positive confirmations (Approve) |
| `warning` | `warning` | `surface-primary` | none | Caution actions (Suspend, Pause) |

#### Sizes

| Size | Padding | Height | Font Size | Icon Size |
|---|---|---|---|---|
| `xs` | 4px 8px | 28px | `text-small` | 14px |
| `sm` | 6px 12px | 32px | `text-body-sm` | 14px |
| `md` | 8px 16px | 36px | `text-body-sm` | 16px |
| `lg` | 10px 20px | 40px | `text-body` | 16px |
| `xl` | 12px 24px | 44px | `text-body` | 18px |

#### States

| State | Visual |
|---|---|
| Default | Variant colors as described |
| Hover | 10% brightness increase, `glow-gold` on primary |
| Active | 0.95 scale (press feedback) |
| Focus | 2px gold ring, 2px offset |
| Disabled | `text-disabled` text, 50% opacity, cursor not-allowed |
| Loading | Spinner replaces icon, text unchanged, pointer-events none |

#### Props

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  children: React.ReactNode
  disabled?: boolean
  fullWidth?: boolean
}
```

---

### Card

6 variants, padding options, interactive hover.

#### Variants

| Variant | Background | Border | Shadow | Usage |
|---|---|---|---|---|
| `default` | `surface-secondary` | `border-default` | `shadow-soft` | Standard containers |
| `elevated` | `surface-secondary` | none | `shadow-medium` | Prominent content |
| `interactive` | `surface-secondary` | `border-default` | `shadow-soft` → `shadow-medium` | Clickable cards, dashboard tiles |
| `gold` | `gold-muted` | `border-gold` | none | Highlighted/active items |
| `danger` | `danger-muted` | `border-danger` | none | Error states, alerts |
| `success` | `success-muted` | `border-success` | none | Completed states |

#### Padding Options

| Option | Value |
|---|---|
| `none` | 0 |
| `sm` | 12px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |

#### Interactive Hover

The `interactive` variant transitions on hover:
- Background shifts to `surface-tertiary`
- Border becomes `border-strong`
- Shadow elevates from `shadow-soft` to `shadow-medium`
- Optional `glow-gold` on hover when `highlight` prop is true

```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive' | 'gold' | 'danger' | 'success'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  highlight?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}
```

---

### Dialog

Radix-based, 5 sizes, Sheet variant for side panels, ConfirmDialog for destructive actions.

#### Sizes

| Size | Width | Usage |
|---|---|---|
| `sm` | 400px | Simple confirmations, single-field forms |
| `md` | 520px | Standard forms, detail views |
| `lg` | 640px | Complex forms, multi-section content |
| `xl` | 800px | Wide content, comparison views |
| `full` | 90vw | Full-screen content, dashboards |

#### Sheet Variant

Slides in from the right edge. Used for detail panels, filters, and settings that don't need modal focus.

| Width | Usage |
|---|---|
| `sm` (320px) | Quick filters, simple forms |
| `md` (480px) | Detail panels, edit forms |
| `lg` (640px) | Complex settings, multi-step flows |

#### ConfirmDialog

Specialized dialog for destructive actions. Always includes:
- Warning icon (AlertTriangle)
- Destructive action description
- "This action cannot be undone" notice
- Cancel + Confirm (danger variant) buttons
- Keyboard: Enter to confirm, Escape to cancel

```tsx
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  loading?: boolean
  variant?: 'danger' | 'warning'
}
```

---

### Skeleton

7 variants, multi-line support, compound components.

#### Variants

| Variant | Shape | Usage |
|---|---|---|
| `text` | Rectangle (height: 1em) | Text content placeholders |
| `circle` | Circle | Avatar, icon placeholders |
| `rect` | Rectangle (configurable) | Generic rectangular content |
| `card` | Card-shaped rectangle | Full card placeholder |
| `metric` | Large number + label | Dashboard metric cards |
| `chart` | Chart-shaped rectangle | Chart/graph placeholders |
| `table-row` | Full-width row | Table row placeholders |

#### Multi-Line

The `text` variant supports `lines` prop to render stacked skeleton lines with varying widths (100%, 85%, 70%) for natural text appearance.

#### Compound Components

- `SkeletonCard` — Card variant with metric sub-skeletons
- `SkeletonTable` — Header + N rows with cell skeletons
- `SkeletonGroup` — Staggered entrance of multiple skeleton items

```tsx
interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'card' | 'metric' | 'chart' | 'table-row'
  width?: string | number
  height?: string | number
  lines?: number
  className?: string
}
```

---

### Badge

7 variants, 3 sizes, PriorityBadge and StatusDot specializations.

#### Variants

| Variant | Background | Text | Usage |
|---|---|---|---|
| `default` | `surface-tertiary` | `text-secondary` | Neutral labels |
| `gold` | `gold-muted` | `gold` | Active, premium, highlighted |
| `success` | `success-muted` | `success` | Completed, healthy, approved |
| `warning` | `warning-muted` | `warning` | Caution, pending review |
| `danger` | `danger-muted` | `danger` | Failed, rejected, critical |
| `info` | `info-muted` | `info` | Informational, neutral status |
| `muted` | transparent | `text-tertiary` | De-emphasized labels |

#### Sizes

| Size | Height | Padding | Font Size |
|---|---|---|---|
| `sm` | 20px | 4px 8px | `text-tiny` |
| `md` | 24px | 4px 10px | `text-small` |
| `lg` | 28px | 6px 12px | `text-caption` |

#### PriorityBadge

Displays priority level (Critical/High/Medium/Low) with color-coded variant and optional icon.

#### StatusDot

Small colored dot (8px) with optional pulse animation for real-time status.

---

### Alert

4 variants, dismissible, action slot.

#### Variants

| Variant | Icon | Background | Border | Usage |
|---|---|---|---|---|
| `info` | `Info` | `info-muted` | `info` | Informational messages |
| `success` | `CheckCircle` | `success-muted` | `success` | Success confirmations |
| `warning` | `AlertTriangle` | `warning-muted` | `warning` | Warning messages |
| `danger` | `AlertCircle` | `danger-muted` | `danger` | Error messages |

#### Behavior

- Dismissible: shows close button that removes alert from DOM
- Action slot: optional action button area below the message
- Entrance animation: `fadeInUp` (200ms)
- Exit: `fadeOut` (100ms) then remove from DOM

---

### EmptyState

Icon + title + description + action button. Used when a list, table, or section has no data.

```
┌─────────────────────────────────┐
│                                 │
│           [icon 48px]           │
│                                 │
│         No transactions         │
│    No transactions found for    │
│     the selected period.        │
│                                 │
│     [  Create Transaction  ]    │
│                                 │
└─────────────────────────────────┘
```

---

### ErrorState

Title + error message + reset button. Used when data fails to load.

```
┌─────────────────────────────────┐
│                                 │
│        [AlertCircle 48px]       │
│                                 │
│       Failed to load data       │
│  Unable to fetch treasury       │
│  balances. Please try again.    │
│                                 │
│        [  Try Again  ]          │
│                                 │
└─────────────────────────────────┘
```

---

### Spinner

Loading indicator with gold top border. 3 sizes.

| Size | Diameter | Usage |
|---|---|---|
| `sm` | 16px | Inline loading, button loading |
| `md` | 24px | Standard loading states |
| `lg` | 40px | Page-level loading, skeleton fallback |

---

### PageHeader

Title + description + badge + actions + breadcrumbs.

```
┌─────────────────────────────────────────────────────┐
│  Dashboard > Treasury > Cash Positions               │
│                                                     │
│  Cash Position                          [Active]    │
│  Real-time view of all cash accounts                │
│                                                     │
│  [Export]  [Refresh]  [+ New Position]              │
└─────────────────────────────────────────────────────┘
```

- Title: `text-h1`, `text-primary`
- Description: `text-body`, `text-secondary`
- Badge: `Badge` component, typically status
- Actions: `Button` group, right-aligned
- Breadcrumbs: auto-generated from URL segments via `LABEL_MAP`

---

### DashboardLayout

6-slot grid for dashboard pages.

```
┌──────────────────────────────────────────────────┐
│                  Header (full width)              │
├──────────────────────────────────────────────────┤
│                  KPIs (full width)                │
├──────────────────────────────────────────────────┤
│                  Alerts (full width)              │
├──────────────────────────────────────────────────┤
│           Recommendations (full width)            │
├────────────────────────────────┬─────────────────┤
│                                │                 │
│     Content (3/4 width)        │  Sidebar (1/4)  │
│                                │                 │
├────────────────────────────────┴─────────────────┤
│               Activity (full width)               │
└──────────────────────────────────────────────────┘
```

---

### DashboardSection

Titled content section with top border separator.

- Title: `text-h3`, `text-primary`
- Optional action link (right-aligned)
- Top border: `border-subtle`
- Content area with `space-card` padding

---

## Patterns

### Dashboard Pattern

Standard dashboard layout following the CFO-first principle:

1. **PageHeader** — title, description, actions
2. **KPI Row** — 4-5 MetricCards with values, trends, status dots
3. **Alerts** — Warning/danger alerts for items needing attention
4. **Recommendations** — AI-generated insights and suggestions
5. **Content (3/4)** — Charts, tables, detail views
6. **Sidebar (1/4)** — Quick actions, recent activity, shortcuts
7. **Activity** — Audit trail, recent changes, notifications

The KPI row renders first (metric values before charts) because CFOs need numbers immediately.

### Table Pattern

EnterpriseTable with comprehensive features:

- **Sorting**: Multi-column sort with priority labels
- **Filtering**: Column filters, saved views, relative date presets
- **Search**: Global search with result highlighting
- **Density**: Compact (32px rows), default (44px), comfortable (56px)
- **Export**: CSV (UTF-8 BOM) + Excel (XML Spreadsheet 2003)
- **Saved Views**: Named filter/sort configurations per user
- **Bulk Actions**: Select-all, multi-select, batch operations
- **Inline Editing**: Click-to-edit cells with validation

### Form Pattern

EnterpriseForm with comprehensive validation:

- **Auto-save**: Debounced 2s save on change
- **Validation**: On-blur inline errors, async validation, cross-field rules
- **Sections**: Collapsible EnterpriseSection with error count badges
- **Wizard**: EnterpriseWizard with step indicator, back/next/complete
- **Error Summary**: Top-of-form error list with field navigation
- **Unsaved Changes**: `beforeunload` guard + inline save/discard prompt

### Modal Pattern

Three modal strategies based on context:

| Context | Component | Behavior |
|---|---|---|
| Focused action | `Dialog` | Backdrop blur + scale-in, focus trap, Escape to close |
| Detail panel | `Sheet` | Slide-in from right, overlay backdrop, scrollable |
| Destructive action | `ConfirmDialog` | Warning icon, description, cancel/confirm, cannot undo |

### Loading Pattern

Layered loading strategy for perceived performance:

| Context | Component |
|---|---|
| Page initial load | `SkeletonCard` grid (2x2) |
| Section loading | `Skeleton` variants (text, metric, chart) |
| Action loading | `Spinner` (sm/md) inside button |
| Table loading | `SkeletonTable` with 5 rows |
| Dashboard metrics | `Skeleton` metric variant |

### Empty Pattern

When a list, table, or section has no data:

- Icon (48px, `text-tertiary`)
- Title: clear description of what's empty
- Description: explanation or next steps
- Action: primary button to create/populate

### Error Pattern

When data fails to load:

- Icon (48px, `danger`)
- Title: "Failed to [action]"
- Description: error message (user-friendly, not raw error)
- Action: "Try Again" button that retries the failed operation
- Optional: technical details expandable section for developers
