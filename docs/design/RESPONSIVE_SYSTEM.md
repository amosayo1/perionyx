# Responsive System

**Phase 22.0B — Breakpoints & Adaptive Layout**

---

## Breakpoints

| Name | Width | Target |
|---|---|---|
| xs | < 640px | Mobile phones |
| sm | 640px | Large phones |
| md | 768px | Small tablets |
| lg | 1024px | Tablets / small laptops |
| xl | 1280px | Desktop |
| 2xl | 1536px | Wide desktop |

## Layout Behavior

| Breakpoint | Sidebar | Content | Nav |
|---|---|---|---|
| xs | Hidden (drawer) | Full width | Bottom bar |
| sm | Hidden (drawer) | Full width | Bottom bar |
| md | Collapsible | Fluid | Side nav |
| lg | Visible (280px) | Fluid | Side nav |
| xl | Visible (280px) | Max 1280px | Side nav |
| 2xl | Visible (280px) | Max 1440px | Side nav |

## Component Adaptation

### Tables
- Mobile: Card layout (rows become cards)
- Tablet: Horizontal scroll with fixed first column
- Desktop: Full table with all columns

### Cards
- Mobile: 1 column
- sm: 2 columns
- lg: 3 columns
- xl: 4 columns (KPI grids)

### Forms
- Mobile: Full width, stacked fields
- Desktop: Side-by-side labels (horizontal layout option)

### Dialogs
- Mobile: Full screen sheet
- Tablet: Centered modal (max 480px)
- Desktop: Centered modal (max 560px)

## Tailwind Responsive Prefixes

```tsx
// Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="hidden lg:block">
<div className="text-sm md:text-base lg:text-lg">
```

## Rules

1. **Mobile-first** — start with mobile styles, add breakpoints upward
2. **Test at every breakpoint** — no assumption that mobile = desktop scaled down
3. **Touch targets on mobile** — minimum 44px
4. **No hover-only interactions on mobile** — must have touch alternative
5. **Content priority on mobile** — hide secondary content, show primary
