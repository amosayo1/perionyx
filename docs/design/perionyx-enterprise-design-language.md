# Perionyx Enterprise Design Language (PEDL)

> **Status**: v1.0 — Phase 7D  
> **Scope**: Every page, component, and interaction across the Perionyx platform

---

## 1. Design Principles

1. **Dark-first**. `#040404` primary background. Gold `#d4af37` as the single accent color. No light mode.
2. **Atmospheric depth**. Radial gradients simulate ambient light. Subtle gold and white light sources from corners.
3. **Glass surfaces**. Translucent borders (`rgba(255,255,255,0.06)`) and fills (`rgba(255,255,255,0.03)`) on every surface. Gradients from `zinc-900/50` to `black/40` for cards and panels.
4. **Gold as signal**. Used for primary CTAs, active states, brand elements, focus rings, and progress. Never decorative.
5. **Subtle motion**. Framer Motion with cubic bezier `[0.16, 1, 0.3, 1]` for all entrances. Hover scale `[1.02]` for tiles. Press scale `[0.97]` for buttons.
6. **Status through color**. Emerald (pass/complete), gold (warning/active), red (error/fail). Consistent across badges, borders, backgrounds.
7. **Zinc grays**. `zinc-900/800/500/400/300` provide the neutral range. No blue-grays or warm grays.
8. **Accessibility first**. Focus rings, ARIA labels, color contrast, keyboard navigation.

---

## 2. Color Tokens

### 2.1 CSS Custom Properties

Declared in `:root` via `globals.css`. Use these exclusively — never hardcode values.

| Token | Value | Usage |
|---|---|---|
| `--perionyx-bg-primary` | `#040404` | Page background |
| `--perionyx-bg-secondary` | `#090909` | Secondary sections |
| `--perionyx-bg-surface` | `#121212` | Input fields, table rows |
| `--perionyx-bg-panel` | `#0d0d0d` | Card, dialog, sheet surfaces |
| `--perionyx-bg-panel-strong` | `#080808` | Sidebar, heavy panels |
| `--perionyx-bg-atmosphere` | `rgba(212, 175, 55, 0.08)` | Subtle gold wash |
| `--perionyx-bg-elevated` | `rgba(255, 255, 255, 0.02)` | Hover state base |
| `--perionyx-border` | `rgba(255, 255, 255, 0.08)` | Default borders |
| `--perionyx-border-soft` | `rgba(212, 175, 55, 0.14)` | Gold-tinted borders |
| `--perionyx-border-muted` | `rgba(255, 255, 255, 0.04)` | Subtle dividers |
| `--perionyx-border-strong` | `rgba(255, 255, 255, 0.12)` | Focus/active borders |
| `--perionyx-text-primary` | `#f7f6f2` | Primary body text |
| `--perionyx-text-muted` | `#b8b5ae` | Secondary text, descriptions |
| `--perionyx-text-subtle` | `#8f8a81` | Placeholder, hints |
| `--perionyx-text-faint` | `#6c6b67` | Disabled, decorative |
| `--perionyx-gold` | `#d4af37` | Primary accent, CTAs |
| `--perionyx-gold-soft` | `#c7a961` | Hover state for gold |
| `--perionyx-gold-deep` | `#8b6b2e` | Deep accent |
| `--perionyx-success` | `#3ca16d` | Success states |
| `--perionyx-danger` | `#b56b5e` | Error/destructive states |
| `--perionyx-shadow-soft` | `0 30px 90px rgba(0,0,0,0.44)` | Card shadows |
| `--perionyx-shadow-panel` | `0 18px 48px rgba(0,0,0,0.45)` | Panel shadows |
| `--perionyx-shadow-lg` | `0 40px 120px rgba(0,0,0,0.5)` | Dialog shadows |

### 2.2 Semantic Status Colors

Use these exact values. Never invent new status colors.

| State | Text | Background | Border | Icon |
|---|---|---|---|---|
| Success / Complete | `text-emerald-400` | `bg-emerald-500/10` | `border-emerald-500/20` | `CheckCircle2` |
| Warning / Attention | `text-amber-400` | `bg-amber-500/10` | `border-amber-500/20` | `AlertTriangle` |
| Error / Failed | `text-red-400` | `bg-red-500/10` | `border-red-500/20` | `XCircle` |
| Active / Selected | `text-[#d4af37]` | `bg-[#d4af37]/10` | `border-[#d4af37]/20` | Gold variants |
| Info | `text-blue-400` | `bg-blue-500/10` | `border-blue-500/20` | `Info` |
| Muted / Pending | `text-zinc-500` | `bg-zinc-900/30` | `border-white/[0.06]` | `Circle` |

### 2.3 Gold Accent Tints

| Token | Background | Border | Shadow |
|---|---|---|---|
| 5% | `bg-[#d4af37]/5` | `border-[#d4af37]/20` | — |
| 10% | `bg-[#d4af37]/10` | `border-[#d4af37]/30` | `shadow-[#d4af37]/20` |
| 15% | — | `border-[#d4af37]/40` | — |

### 2.4 Body Background

The page background `body` in `globals.css` uses a multi-layered gradient:

```css
background-image:
  radial-gradient(ellipse 520px 280px at 12% 8%, rgba(212, 175, 55, 0.08), transparent 70%),
  radial-gradient(ellipse 360px 160px at 88% 10%, rgba(255, 255, 255, 0.03), transparent 80%),
  radial-gradient(ellipse 280px 100px at 8% 92%, rgba(212, 175, 55, 0.04), transparent 80%),
  radial-gradient(ellipse 280px 80px at 92% 98%, rgba(212, 175, 55, 0.03), transparent 80%),
  linear-gradient(180deg, #050505 0%, #090909 42%, #0f0f0f 100%);
body::before {
  background-image:
    radial-gradient(ellipse 380px 160px at 50% 0%, rgba(212, 175, 55, 0.05), transparent 80%),
    radial-gradient(ellipse 480px 160px at 50% 100%, rgba(255, 255, 255, 0.02), transparent 80%),
    linear-gradient(140deg, rgba(255, 255, 255, 0.015), transparent 40%);
}
```

This must be present in every page layout.

---

## 3. Typography

### 3.1 Font Stack

```css
font-family: Inter, "Geist Sans", ui-sans-serif, system-ui, sans-serif;
```

### 3.2 Type Scale

| Level | Class | Size | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| Hero | `text-2xl font-bold` | 24px | 700 | — | Page titles |
| Section | `text-lg font-semibold` | 18px | 600 | — | Section headings |
| Card Title | `text-base font-semibold` | 16px | 600 | `tracking-tight` | Card headers |
| Dialog Title | `text-xl font-semibold` | 20px | 600 | `tracking-tight` | Dialog headers |
| Body | `text-sm` | 14px | 400–500 | — | All body text |
| Description | `text-sm` | 14px | 400 | — | Card descriptions |
| Small | `text-xs` | 12px | 400–500 | — | Metadata, hints |
| Overline | `text-[10px]` | 10px | 600–700 | `tracking-[0.15em]` | Badges, labels |
| Metric Value | `text-2xl font-bold` | 24px | 700 | — | Dashboard metrics |
| Table Header | `text-[10px]` | 10px | 600 | `tracking-[0.15em]` | Column headers |
| Sidebar Label | `text-[10px]` | 10px | 600 | `tracking-[0.2em]` | Section titles |
| Form Label | `text-xs` | 12px | 600 | `tracking-[0.24em]` | Input labels |

### 3.3 Line Heights

| Class | Value | Usage |
|---|---|---|
| `leading-tight` | ~1.25 | Titles, headings |
| `leading-relaxed` | ~1.625 | Dialog descriptions |
| `leading-none` | 1 | Overline labels |
| `leading-6` | 24px | Body text |

### 3.4 Color Hierarchy

| Role | Color |
|---|---|
| Primary text | `text-white` or `text-perionyx-text-primary` |
| Secondary text | `text-zinc-400` or `text-perionyx-text-muted` |
| Muted text | `text-zinc-500` or `text-perionyx-text-subtle` |
| Faint text | `text-zinc-600` or `text-perionyx-text-faint` |
| Disabled text | `text-zinc-700` (`opacity-50` on parent) |

---

## 4. Spacing

### 4.1 Layout Spacing

| Pattern | rem / px | Usage |
|---|---|---|
| `gap-1.5` | 6px | Card title/description pairs |
| `gap-2` | 8px | Button icon+text, tight pairs |
| `gap-3` | 12px | Metric cards, nav items |
| `gap-4` | 16px | Card content groups, forms |
| `gap-6` | 24px | Section spacing, between cards |
| `gap-8` | 32px | Major sections |
| `space-y-1` | 4px | Dense stacks (properties) |
| `space-y-2` | 8px | Form field groups |
| `space-y-5` | 20px | Form sections |
| `space-y-8` | 32px | Page sections |

### 4.2 Component Padding

| Component | Padding |
|---|---|
| Card (Header/Content/Footer) | `px-6 py-5` (24px × 20px) |
| Dialog Content | `p-6` (24px all) |
| Sheet Header | `px-6 py-4` |
| Input / Select | `px-4 py-2.5` |
| Table Header Cell | `h-11 px-4` |
| Table Body Cell | `px-4 py-3` |
| Tabs List | `p-1` |
| Badge | `px-2.5 py-1` |
| Empty State | `p-12` |
| Sidebar Item | `px-4 py-2.5` |
| Dashboard Page | `px-8` (desktop) / `px-6` (mobile) |

---

## 5. Border Radius

| Token | Value | Components |
|---|---|---|
| `rounded-lg` | 8px | Inputs, buttons (sm), selects, nav icons, table cells, tab triggers |
| `rounded-xl` | **16px (primary)** | Cards, buttons, dialogs, sheets, sidebar, topbar, table wrapper, metric cards |
| `rounded-[18px]` | 18px | Skeletons |
| `rounded-[20px]` | 20px | Mobile nav items |
| `rounded-[24px]` | 24px | Loading state containers |
| `rounded-[28px]` | 28px | Empty state icon containers |
| `rounded-2xl` | 20px | Welcome/empty icons |
| `rounded-full` | 9999px | Badges, switches, scrollbar thumbs, status dots, approval counts, icon buttons |

---

## 6. Shadows

| Token | Value | Components |
|---|---|---|
| `--perionyx-shadow-soft` | `0 30px 90px rgba(0,0,0,0.44)` | Cards, panels |
| `--perionyx-shadow-panel` | `0 18px 48px rgba(0,0,0,0.45)` | Sidebar |
| `--perionyx-shadow-lg` | `0 40px 120px rgba(0,0,0,0.5)` | Dialogs |
| Inline: cards | `shadow-lg shadow-black/20` | Card base |
| Inline: gold button | `shadow-lg shadow-[#d4af37]/20` | Primary buttons |
| Inline: empty state | `shadow-[0_20px_50px_rgba(0,0,0,0.22)]` | Empty state icons |
| Inline: topbar | `shadow-[0_32px_90px_rgba(0,0,0,0.28)]` | Topbar |

---

## 7. Component Standards

### 7.1 Cards

Every card follows this structure:

```tsx
<Card>                                    // rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40 text-white shadow-lg shadow-black/20
  <CardHeader>                           // flex flex-col gap-1.5 px-6 py-5 border-b border-white/[0.06]
    <CardTitle />                        // text-base font-semibold leading-tight tracking-tight text-white
    <CardDescription />                  // text-sm text-zinc-400
  </CardHeader>
  <CardContent>                          // px-6 py-5
    ...
  </CardContent>
  <CardFooter>                           // flex items-center px-6 py-5 border-t border-white/[0.06]
    ...
  </CardFooter>
</Card>
```

**Variants:**
- **Success/completion card**: `bg-gradient-to-b from-emerald-900/20 to-black/40`
- **Welcome card**: `bg-gradient-to-b from-zinc-900/50 to-black/40`
- **Metric card**: Card inside grid with metric value text (`text-2xl font-bold`) + label (`text-xs text-zinc-500`)

### 7.2 Buttons

All buttons use `button.tsx` via the `Button` component with these variants:

| Variant | Style |
|---|---|
| `default` | `bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 hover:bg-[#c7a961]` |
| `destructive` | `bg-[#b56b5e] text-white shadow-lg shadow-[#b56b5e]/20 hover:bg-[#9a5a4f]` |
| `outline` | `border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] hover:bg-[#d4af37]/10` |
| `secondary` | `border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]` |
| `ghost` | `border border-white/[0.06] bg-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white` |
| `link` | `text-[#d4af37] underline-offset-4 hover:underline` |

| Size | Class | Height | Padding |
|---|---|---|---|
| `sm` | `h-9 rounded-lg px-3 text-sm` | 36px | 12px horiz |
| `default` | `h-11 px-5` | 44px | 20px horiz |
| `lg` | `h-13 rounded-xl px-8` | 52px | 32px horiz |
| `icon` | `h-10 w-10 p-0` | 40px | — |

Always include `gap-2` when combining icon + text.

### 7.3 Badges

```tsx
<Badge variant="success | warning | danger | secondary | outline | default">
  LABEL
</Badge>
```

Base: `inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]`

| Variant | Style |
|---|---|
| `default` | `border-white/[0.08] bg-white/[0.03] text-zinc-400` |
| `secondary` | `border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]` |
| `outline` | `border-[#d4af37]/20 bg-transparent text-zinc-400` |
| `success` | `border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]` |
| `warning` | `border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]` |
| `danger` | `border-red-500/20 bg-red-500/10 text-red-400` |

### 7.4 Form Controls

All form controls share the same base styles:

```
rounded-lg border border-white/[0.1] bg-white/[0.03] text-sm text-white shadow-sm
placeholder:text-zinc-500
transition-all duration-200 ease-out
focus:outline-none focus:border-[#d4af37]/40 focus:ring-2 focus:ring-[#d4af37]/20
disabled:cursor-not-allowed disabled:opacity-50
```

**Input**: `flex h-11 w-full px-4 py-2.5`  
**Select**: `w-full px-4 py-2.5` (uses `<select>` or shadcn `<Select>`)  
**Textarea**: `min-h-[120px] w-full px-3 py-3`

**Labels**: `<Label>` component — `text-xs uppercase tracking-[0.24em] text-perionyx-text-subtle font-semibold leading-none`

**Checkbox**:
- Box: `flex h-4 w-4 items-center justify-center rounded border border-zinc-600 bg-transparent`
- Checked: `peer-checked:border-[#d4af37] peer-checked:bg-[#d4af37]/20`
- Icon: `h-3 w-3 text-[#d4af37]`

**Switch**:
- Track (checked): `bg-[#d4af37]`
- Track (unchecked): `bg-white/[0.12]`
- Thumb: `h-4 w-4 rounded-full bg-black shadow-lg transition-transform duration-200`
- Checked: `translate-x-4` / Unchecked: `translate-x-0`

### 7.5 Dialogs

```tsx
<Dialog>
  <DialogContent>      // fixed ... rounded-xl border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-2xl
    <DialogHeader>
      <DialogTitle />  // text-xl font-semibold leading-none tracking-tight text-perionyx-text-primary
      <DialogDescription />  // text-sm leading-relaxed text-perionyx-text-muted
    </DialogHeader>
    ...
    <DialogFooter>     // flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2
    </DialogFooter>
    <DialogClose />    // absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel text-perionyx-text-muted
  </DialogContent>
</Dialog>
```

Overlay: `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm`

### 7.6 Tables

```tsx
// Table wrapper — use TableScroll for horizontal scroll
<div className="relative w-full overflow-auto rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 shadow-lg shadow-black/20">
  <table className="w-full caption-bottom text-sm text-white">
    <thead>
      <tr className="border-b border-white/[0.05]">
        <th className="h-11 px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-white/[0.05] transition-colors hover:bg-white/[0.03]">
        <td className="px-4 py-3 align-middle text-sm text-zinc-300">
      </tr>
    </tbody>
  </table>
</div>
```

### 7.7 Tabs

```tsx
<TabsList className="inline-flex items-center justify-center gap-1 rounded-xl bg-zinc-900/60 p-1">
  <TabsTrigger
    value="..."
    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-[#d4af37]/10 data-[state=active]:text-[#d4af37] data-[state=active]:shadow-sm [state=inactive]:text-zinc-500"
  />
</TabsList>
```

### 7.8 Navigation

**Sidebar** (`sidebar.tsx`):
- Width: `w-72 shrink-0`
- Background: `bg-gradient-to-b from-[#0a0a0a] to-[#070707] border-r border-white/[0.06]`
- Gold accent line: `::before { bg-gradient-to-b from-[#d4af37]/20 to-transparent }`
- Sections: `text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold px-4 py-2`
- Items: `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200 transition-colors`
- Active: `bg-[#d4af37]/10 text-[#d4af37]`

**Topbar** (`topbar.tsx`):
- Height: `h-[92px]`
- Background: `bg-[linear-gradient(90deg,rgba(10,10,10,0.98)_60%,rgba(212,175,55,0.03)_100%)]`
- Borders: `border-b border-[rgba(255,255,255,0.08)]`
- Shadow: `shadow-[0_32px_90px_rgba(0,0,0,0.28)]`
- Blur: `backdrop-blur-2xl`
- Padding: `px-8`

### 7.9 Icon Containers

| Size | Radius | Usage |
|---|---|---|
| `h-8 w-8` | `rounded-lg` | Nav icons, quick actions |
| `h-9 w-9` | `rounded-lg` | Feature row icons |
| `h-10 w-10` | `rounded-lg` | Metric card icons |
| `h-11 w-11` | `rounded-xl` | Brand logo in sidebar |
| `h-14 w-14` | `rounded-2xl` | Empty state icons |
| `h-16 w-16` | `rounded-[28px]` | Large empty state |
| `h-16 w-16` | `rounded-full` | Completion checkmarks |
| `h-20 w-20` | `rounded-2xl` | Welcome screen |

Consistent inner styling: `bg-[#d4af37]/10 text-[#d4af37]` for gold, or status-tinted.

---

## 8. State Patterns

### 8.1 Loading States

- **Skeleton**: `animate-pulse rounded-[18px] bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.08),rgba(255,255,255,0.04))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]`
- **Loading container**: Gold pulsing dot + message text
- **Full page loading**: Use `loading.tsx` with skeleton grid matching page layout
- **Inline loading**: Use `<LoadingState message="..." />` — `flex min-h-[140px] items-center justify-center gap-3 rounded-[24px] border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel p-6 text-perionyx-text-muted`

### 8.2 Error States

- **Page error**: `error.tsx` — centered error icon + message + retry button
- **Inline error**: Red-tinted banner — `flex items-center gap-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400`
- **Form validation**: Red text below field — `text-sm text-red-400`
- **Error boundary**: `<ErrorBoundary>` component wrapping each page section

### 8.3 Empty States

Use `<EmptyState>` component:

```tsx
<Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
  <CardContent className="grid place-items-center gap-4 p-12 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[rgba(212,175,55,0.10)] text-perionyx-gold shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
      <FileMinus className="h-7 w-7" />
    </div>
    <CardTitle className="text-lg font-semibold tracking-tight text-perionyx-text-primary">No data</CardTitle>
    <CardDescription className="max-w-sm text-sm text-perionyx-text-muted">Description</CardDescription>
  </CardContent>
</Card>
```

### 8.4 Success States

- **Toast**: Use `sonner` `toast.success()` with gold accent styling
- **Inline banner**: `flex items-center gap-3 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400`
- **Completion card**: `bg-gradient-to-b from-emerald-900/20 to-black/40` with `CheckCircle2` icon
- **Toast promise pattern**: `toast.promise(promise, { loading: '...', success: '...', error: '...', action: { label: 'Retry', onClick: ... } })`

### 8.5 Progress Indicators

- **Determinate**: `<div className="h-2 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-[#d4af37] transition-all duration-500" style={{width: X%}} /></div>`
- **Indeterminate**: Use animated skeleton or pulsing gold dot
- **Step progress**: Track via `completed/total` with percentage and `~X min remaining`

---

## 9. Animation Principles

### 9.1 Standard Easing

All Framer Motion animations use the gold standard curve:

```tsx
transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
```

### 9.2 Animation Patterns

| Pattern | Properties | Use Case |
|---|---|---|
| Enter | `opacity: 0 → 1, y: 12 → 0` | Page content entrance |
| Stagger enter | `y: 20 → 0, delay: i * 0.08` | Grid items, list items |
| Viewport | `whileInView: { opacity: 1, y: 0 }` | Scroll-triggered reveals |
| Hover (tiles) | `hover:scale-[1.02]` | Feature tiles, clickable cards |
| Active (buttons) | `active:scale-[0.97]` | Button press |
| Transition duration | `duration-200 ease-out` | CSS transitions (buttons) |
| Progress bar | `transition-all duration-500` | Progress indicators |
| Sheet/dialog | shadcn `animate-in slide-in-from-right` | Panel entrances |

### 9.3 Viewport Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
/>
```

### 9.4 Staggered Children

```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
  />
))}
```

---

## 10. Accessibility

### 10.1 Focus Management

- All interactive elements have visible focus rings: `focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040404]`
- Dialog/Sheet: Focus trapped inside, returns on close
- Skip link: Not yet implemented (planned: add to app shell)

### 10.2 ARIA

- Navigation: `role="navigation"`, `aria-label` on nav elements
- Tabs: Use shadcn `<Tabs>` (built-in ARIA)
- Dialogs: Use shadcn `<Dialog>` (built-in ARIA, `DialogTitle` for label)
- Progress: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Buttons: Always have accessible names (icon buttons need `aria-label`)
- Status messages: Use `role="status"` or `aria-live="polite"` for dynamic content
- Tables: Use `<caption>` or `aria-label` on table wrapper

### 10.3 Color Contrast

- Gold `#d4af37` on black `#040404`: ~9.5:1 ratio (exceeds AA/AAA)
- Text `#f7f6f2` on `#0d0d0d`: ~16:1 ratio
- Status colors (emerald/red/amber on dark backgrounds): minimum 4.5:1 ratio maintained
- Muted text `#b8b5ae` on `#0d0d0d`: ~7:1 ratio

### 10.4 Keyboard Navigation

- All interactive elements reachable via Tab
- Escape closes dialogs/sheets
- Enter/Space activates buttons
- Arrow keys for tabs, select menus

---

## 11. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `< 768px` (mobile) | Single column. Stepper goes above content. Sidebar hidden (hamburger menu). Topbar collapses. Tables scroll horizontally. Dialogs full-width. |
| `768px – 1024px` (tablet) | 2-column grids. Sidebar still hidden (optional). Cards reflow. |
| `>= 1024px` (desktop) | Full layout. Sidebar visible. 3–6 column grids. Max width `max-w-7xl`. |

Dashboard page padding:
- Mobile: `px-6 py-6`
- Desktop: `px-8 pb-10 pt-8`

---

## 12. Dashboard Layout Standards

### 12.1 Standard Dashboard Page

```tsx
<div className="mx-auto max-w-7xl space-y-8 px-6 py-6 md:px-8 md:pb-10 md:pt-8">
  <div>
    <h1 className="text-2xl font-bold text-white">Page Title</h1>
    <p className="mt-1 text-sm text-zinc-400">Page description</p>
  </div>
  {/* Content here */}
</div>
```

### 12.2 Metric Grid

```tsx
<div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
  {metrics.map(m => (
    <Card key={m.label}>
      <CardContent className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4af37]/10">
            <m.icon className="h-4 w-4 text-[#d4af37]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-zinc-500">{m.label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### 12.3 Content Grids

- **Two-column**: `grid grid-cols-1 gap-6 lg:grid-cols-2`
- **Three-column**: `grid grid-cols-1 gap-6 lg:grid-cols-3`
- **Feature tiles**: `grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7`
- **Cards grid**: `grid grid-cols-1 gap-4 md:grid-cols-2`
- **Table + card**: `grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]`

---

## 13. Domain-Specific Standards

### 13.1 Executive Dashboard

- **KPI strip**: Single row of 4–6 metric cards (`lg:grid-cols-6`) with large values and trend indicators
- **Charts section**: Two-column grid of chart cards (line/bar chart for revenue, area chart for cash flow)
- **Alert list**: Compact table with severity badges and timestamps
- **Quick actions**: Row of action buttons with icons
- **Summary panel**: Side card with key ratios and compliance score

### 13.2 Command Center

- **Status overview**: Cards with health status indicators (green/amber/red dots with pulse animation for LIVE)
- **Queue monitor**: Table with queue name, queued/active/failed counts, color-coded by failure rate
- **Event stream**: Scrollable list with timestamps, event badges, severity indicators
- **Action panel**: Right sidebar for quick actions (pause/resume, retry, inspect)
- **Search bar**: Prominent top search with command palette (`⌘K`)

### 13.3 Automation Studio

- **Feature tiles**: Grid of 7 automation feature cards with icons, labels, descriptions, and gold arrows
- **Metrics strip**: Row of compact metric cards (active rules, pending approvals, failed runs, etc.)
- **Content area**: Two-column layout (`lg:grid-cols-[1fr_380px]`) with table + detail panel
- **Stepper pages**: Two-column layout (`lg:grid-cols-[300px_1fr]`) — stepper sidebar + content
- **Form dialogs**: All CRUD operations use `<Dialog>` with `<DialogFooter>` for save/cancel
- **Toast feedback**: `sonner` toast.promise() for all async operations with retry action buttons

### 13.4 Onboarding

- **Layout**: Two-column (`lg:grid-cols-[300px_1fr]`) — stepper sidebar + content
- **Progress bar**: `h-2 rounded-full bg-zinc-800` with `bg-[#d4af37]` fill, `transition-all duration-500`
- **Step status**: Icons per status — `CheckCircle2` (complete), `Play` (active), `Circle` (pending), `AlertCircle` (failed), `Lock` (blocked)
- **Step cards**: Compact card with step icon, label, category badge, status badge
- **Completion view**: Success gradient card (`from-emerald-900/20 to-black/40`) + readiness report + dashboard preview
- **Readiness report**: Score ring (`h-20 w-20 rounded-full border-4`), per-domain pass/warn/fail badges, suggestions section

### 13.5 Analytics

- **KPI row**: Top strip of metric cards with sparklines or delta indicators
- **Charts**: Full-width card with chart toolbar (time range, granularity, export)
- **Filter bar**: Horizontal bar with date picker, entity select, metric toggle
- **Breakdown tables**: Data tables with sortable columns and pagination
- **Bottleneck section**: Cards identifying slowest steps, highest failure rates
- **Export**: Download button in top-right of each chart/table card

### 13.6 Charts

- **Library**: Recharts
- **Theme**: Dark — `"#d4af37"` as primary line/bar color, `"#b8b5ae"` as axis text, `"rgba(212,175,55,0.1)"` as fill
- **Grid**: Subtle dashed lines in `"rgba(255,255,255,0.05)"`
- **Tooltips**: Dark background `"#0d0d0d"` with gold border, white text
- **Legends**: Top or right, `text-xs text-zinc-500`
- **Responsive**: `width="100%"` height fixed per chart type

---

## 14. Icon Standards

- **Library**: `lucide-react`
- **Size**: `h-4 w-4` (default inline), `h-7 w-7` (empty states), `h-10 w-10` (welcome)
- **Stroke**: `strokeWidth={1.5}` (standard) — avoid thicker or thinner
- **Wrapping Icons**: Always wrap in themed container div (see §7.9)
- **Status icons**: Use standard mappings — `CheckCircle2` (success), `AlertTriangle` (warning), `XCircle` (error), `Info` (info), `Circle` (pending)
- **Navigation icons**: Use consistent icon per section across all pages

---

## 15. Code Conventions

### 15.1 Utility Function

Always use the `cn()` helper from `@/lib/utils` for conditional class merging:

```tsx
import { cn } from "@/lib/utils";
<div className={cn("base-class", condition && "conditional-class", className)} />
```

### 15.2 Import Order

1. React / Next.js
2. Library imports (lucide, framer-motion, recharts, sonner, etc.)
3. UI components (`@/components/ui/*`)
4. App components (`@/components/*`)
5. Server/Client utilities
6. Types
7. CSS

### 15.3 Component Patterns

- **Server Components**: Pages, data fetching, auth
- **Client Components**: Interactions, forms, animations — prefix with `"use client"`
- **Props interfaces**: Defined inline above component or exported from a types file

---

## 16. Implementation Checklist

When creating a new page or component, verify:

- [ ] Body gradient applied (via `globals.css` or layout)
- [ ] `cn()` imported and used for class merging
- [ ] Dark theme — no hardcoded light colors
- [ ] Gold accent `#d4af37` for primary actions
- [ ] `rounded-xl` for cards, `rounded-lg` for inputs
- [ ] Consistent spacing — `px-6 py-5` for cards, `gap-6` for sections
- [ ] Framer Motion entrance animation with `[0.16, 1, 0.3, 1]` easing
- [ ] Loading skeleton matching page layout
- [ ] Error boundary with retry action
- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] Visible focus rings on interactive elements
- [ ] Semantic ARIA attributes
- [ ] Responsive — works at mobile/tablet/desktop
- [ ] Lucide icons in themed containers
- [ ] Status colors follow semantic mapping (§2.2)
- [ ] Toast feedback for async operations
- [ ] No hardcoded color values (use CSS variables or tailwind tokens)
