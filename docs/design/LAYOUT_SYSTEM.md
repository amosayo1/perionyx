# Layout System

**Phase 22.0B — Page Structure & Responsive Grid**

---

## Page Layout

```
┌─────────────────────────────────────────┐
│ Topbar (56px)                           │
├──────────┬──────────────────────────────┤
│ Sidebar  │ Content                      │
│ (280px)  │ ┌──────────────────────────┐ │
│          │ │ Page Header              │ │
│          │ ├──────────────────────────┤ │
│          │ │ Main Content             │ │
│          │ │ (max-width: 1280px)      │ │
│          │ └──────────────────────────┘ │
└──────────┴──────────────────────────────┘
```

## Breakpoints

| Name | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, bottom nav, no sidebar |
| Tablet | 640–1024px | Single column, collapsible sidebar |
| Desktop | 1024–1440px | Sidebar + content |
| Wide | > 1440px | Sidebar + wide content |

## Content Widths

| Container | Max Width | Usage |
|---|---|---|
| Default | 1280px | Most pages |
| Narrow | 768px | Documentation, articles, forms |
| Wide | 1440px | Dashboards, data-heavy pages |
| Full | 100% | Tables, spreadsheets |

## Sidebar

- Width: 280px (expanded), 64px (collapsed)
- Background: `SURFACES.sidebar` (`#0a0a0f`)
- Position: fixed, left
- Scroll: native overflow-y auto (no Radix ScrollArea)
- Z-index: `Z.sidebar` (400)

## Topbar

- Height: 56px
- Background: `SURFACES.header` (`#0a0a0f`)
- Position: fixed, top
- Z-index: `Z.nav` (300)

## Grid System

Perionyx does NOT use a CSS grid framework. Layout is achieved through:

- **Tailwind flex utilities** — for most layouts
- **CSS Grid** — for data-dense dashboards (KPI grids, card grids)
- **Manual positioning** — for complex layouts (workflow canvas)

### Common Patterns

| Pattern | Implementation |
|---|---|
| KPI row | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` |
| Card grid | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| Two-column | `grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6` |
| Full-width table | `w-full overflow-x-auto` |

## Page Sections

```
Page Container (p-6)
├── Page Header (mb-6)
│   ├── Title + Description
│   └── Actions
├── Content Sections (space-y-8)
│   ├── Section 1
│   ├── Section 2
│   └── Section 3
└── Footer (mt-8, optional)
```
