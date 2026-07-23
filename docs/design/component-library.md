# Enterprise Component Library & Visual Language

## Design System Structure

```
src/components/design-system/
├── buttons/
│   ├── enterprise-button.tsx    # 13 button variants
│   └── index.ts
├── cards/
│   ├── enterprise-card.tsx      # 12 card variants
│   └── index.ts
├── status/
│   ├── status-indicators.tsx    # StatusDot, StatusBadge, StatusLabel (10 status types)
│   └── index.ts
├── badges/
│   ├── enterprise-badge.tsx     # EnterpriseBadge (9 variants), PriorityBadge (4 levels)
│   └── index.ts
├── dialogs/
│   ├── enterprise-dialog.tsx    # EnterpriseDialog, ConfirmDialog
│   └── index.ts
├── loading/
│   ├── loading-states.tsx       # Skeleton, SkeletonGroup, MetricSkeleton, TableSkeleton, ChartSkeleton, LoadingSpinner
│   ├── empty-state.tsx          # EmptyState with icon/title/description/action
│   └── index.ts
├── micro/
│   ├── micro-components.tsx     # MetricDelta, TrendArrow, ConfidenceScore, HealthDot, formatters
│   └── index.ts
├── charts/                      # (re-exports from executive-dashboard)
└── index.ts                     # Master barrel — re-exports everything + existing enterprise components
```

## Component Catalog

### Buttons — 13 Variants

| Variant | Purpose | Visual |
|---------|---------|--------|
| `primary` | Primary actions | Gold (#d4a800) background, black text, gold glow |
| `secondary` | Secondary actions | Zinc-800 bg, zinc border, subtle |
| `ghost` | Minimal tertiary | Transparent, text on hover |
| `outline` | Subtle border | Zinc border, transparent bg, white text on hover |
| `danger` | Destructive actions | Red-600 bg, white text, red glow |
| `success` | Confirm/success | Emerald-600 bg, white text, green glow |
| `warning` | Warning actions | Amber-600 bg, white text, amber glow |
| `executive` | Executive/CTA | Gold gradient, bold, tracking-wide |
| `ai` | AI actions | Violet->indigo gradient, violet glow |
| `toolbar` | Toolbar buttons | Zinc-900 bg, compact, border |
| `icon-only` | Icon buttons | Ghost variant, aspect-square |
| `loading` | Loading state | Spinner replaces icon, disabled |
| `disabled` | Disabled state | 50% opacity, pointer-events-none |

### Cards — 12 Variants

| Variant | Purpose |
|---------|---------|
| `standard` | General purpose content container |
| `executive-kpi` | KPI metrics with gold accent |
| `analytics` | Chart/analytics containers |
| `treasury` | Treasury/financial data |
| `timeline` | Event timeline items |
| `recommendation` | Optimization recommendations |
| `ai` | AI-generated content |
| `metric` | Compact metric display |
| `compact` | Dense, reduced padding |
| `expandable` | Collapsible with chevron toggle |
| `interactive` | Hover elevation + cursor pointer |
| `pinned` | Gold border accent for pinned items |

### Status — 10 Status Types

success, warning, critical, info, offline, online, pending, running, completed, scheduled

Each status has:
- `StatusDot` — colored dot (with optional pulse animation)
- `StatusBadge` — dot + label in colored background
- `StatusLabel` — dot + inline label

### Badges — 9 Variants + Priority

| Badge | Icon | Use Case |
|-------|------|----------|
| priority | ! | Alert/critical indicators |
| role | @ | User role badges |
| department | # | Department grouping |
| risk | ⚠ | Risk classification |
| workflow | → | Workflow state |
| treasury | $ | Treasury/trade badges |
| ai | ◈ | AI-powered indicators |
| compliance | ✓ | Compliance status |
| default | — | Generic badge |

`PriorityBadge` — 4 levels (critical/high/medium/low) with dot + color

### Dialogs — 2 Components

| Component | Features |
|-----------|----------|
| `EnterpriseDialog` | AnimatePresence, backdrop blur, 5 sizes, ARIA modal, ESC close, focus trap |
| `ConfirmDialog` | Pre-built confirm/cancel, destructive mode, loading state |

### Loading States — 7 Components

Skeleton, SkeletonGroup, MetricSkeleton, TableSkeleton, ChartSkeleton, LoadingSpinner, EmptyState

### Micro Components — 6 Components + 3 Formatters

| Component | Purpose |
|-----------|---------|
| `MetricDelta` | Colored ▲/▼ with percentage |
| `TrendArrow` | Direction arrow (up/down/flat) |
| `ConfidenceScore` | Score with color-coded dot |
| `HealthDot` | Status dot with glow/shadow |
| `formatCurrency` | Compact or full currency ($1.2M, $1,234.56) |
| `formatPercent` | Signed percentage string |
| `formatCompactInteger` | Compact number (1.2B, 3.4M) |

## Visual Consistency Rules

| Token | Source | Application |
|-------|--------|-------------|
| **Charcoal bg** | `colors.bg.primary (#0f0f11)` | Page backgrounds, cards |
| **Gold accent** | `colors.gold.DEFAULT (#d4a800)` | Primary buttons, active states, KPIs |
| **Zinc surfaces** | `colors.surface1-3` | Cards, panels, sections |
| **Border** | `colors.border (#2a2a2e)` | Card borders, dividers |
| **Radius** | `radius.md (8px)` | Cards, inputs, buttons |
| **Text primary** | `colors.text.primary (#f5f5f7)` | Headings, body |
| **Text secondary** | `colors.text.secondary (#a1a1a6)` | Labels, descriptions |
| **Text tertiary** | `colors.text.tertiary (#6b6b70)` | Captions, hints |
| **Motion** | `motion.easing.easeOut [0,0,0.2,1]` | All interactive animations |
| **Shadows** | `shadows.card / shadows.popover` | Elevation hierarchy |

## Accessibility

- All interactive components support keyboard navigation (Tab, Enter, Escape)
- Focus rings use `focus:ring-2 focus:ring-[#d4a800]/40`
- ARIA attributes: `aria-label`, `aria-modal`, `aria-expanded`, `role="dialog"`
- `ConfirmDialog` uses `role="alertdialog"` for screen reader priority
- Motion components respect `prefers-reduced-motion`
- All status colors exceed WCAG AA contrast on charcoal backgrounds
- Skeleton components have `aria-hidden="true"` to avoid screen reader noise

## Performance

- All components are `"use client"` — tree-shakeable via barrel imports
- `memo` on card components
- framer-motion `whileHover`/`whileTap` use CSS transforms only (GPU composited)
- No runtime dependencies beyond existing (framer-motion, lucide-react, tailwind)
- Empty state avoids SVG illustrations in favor of lightweight lucide icons

## Re-exports from Existing Infrastructure

The design system barrel (`index.ts`) re-exports 40+ existing enterprise components:
- Enterprise Tables (15+ features)
- Enterprise Forms (8 components)
- Enterprise Analytics (5 components)
- Enterprise Motion (12 components)
- Enterprise Metrics (5 components)
- Navigation system (4 components)
- Design tokens (9 files)
- Design providers (3 providers)
- Chart components (5 SVG chart types)

## Files Created (18)

| File | Size |
|------|------|
| `src/components/design-system/buttons/enterprise-button.tsx` | ~100 lines |
| `src/components/design-system/buttons/index.ts` | ~3 lines |
| `src/components/design-system/cards/enterprise-card.tsx` | ~130 lines |
| `src/components/design-system/cards/index.ts` | ~3 lines |
| `src/components/design-system/status/status-indicators.tsx` | ~105 lines |
| `src/components/design-system/status/index.ts` | ~3 lines |
| `src/components/design-system/badges/enterprise-badge.tsx` | ~75 lines |
| `src/components/design-system/badges/index.ts` | ~3 lines |
| `src/components/design-system/dialogs/enterprise-dialog.tsx` | ~100 lines |
| `src/components/design-system/dialogs/index.ts` | ~3 lines |
| `src/components/design-system/loading/loading-states.tsx` | ~85 lines |
| `src/components/design-system/loading/empty-state.tsx` | ~55 lines |
| `src/components/design-system/loading/index.ts` | ~2 lines |
| `src/components/design-system/micro/micro-components.tsx` | ~100 lines |
| `src/components/design-system/micro/index.ts` | ~2 lines |
| `src/components/design-system/index.ts` | ~95 lines |
| `docs/design/component-library.md` | ~120 lines |

## Verification

| Check | Result |
|-------|--------|
| `pnpm typecheck` | Zero errors |
| `pnpm build` | Production build passes |
| HTTP 200 | Server starts and responds |
| No backend modifications | ✓ |
| No API changes | ✓ |
| No business logic changes | ✓ |
| 0 new runtime dependencies | ✓ |
