# Perionyx — Design System

**Version 1.0**  
**Last Updated: July 2026**

---

## 1. Design Philosophy

Perionyx uses a dark-themed, data-dense design optimized for financial professionals who spend hours in the platform. The design prioritizes readability, information density, and consistency over visual flourish.

---

## 2. Brand Colors

### 2.1 Primary Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-gold` | `#d4af37` | Primary accent, CTAs, active states, highlights |
| `--color-gold-hover` | `#c7a961` | Hover states for gold elements |
| `--color-gold-subtle` | `rgba(212, 175, 55, 0.1)` | Subtle backgrounds, active table rows |
| `--color-gold-border` | `rgba(212, 175, 55, 0.2)` | Card borders, decorative elements |

### 2.2 Background Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#090909` | Page background |
| `--color-bg-panel` | `rgba(255, 255, 255, 0.02)` | Card and panel backgrounds |
| `--color-bg-hover` | `rgba(255, 255, 255, 0.04)` | Hover states |
| `--color-bg-active` | `rgba(255, 255, 255, 0.06)` | Active states |
| `--color-bg-elevated` | `#0c0c0c` | Modals, dialogs, dropdowns |

### 2.3 Text Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#ffffff` | Primary content, headings |
| `--color-text-secondary` | `rgba(255, 255, 255, 0.7)` | Secondary content |
| `--color-text-muted` | `rgba(255, 255, 255, 0.4)` | Labels, hints, metadata |
| `--color-text-disabled` | `rgba(255, 255, 255, 0.2)` | Disabled states |

### 2.4 Border Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-border` | `rgba(255, 255, 255, 0.06)` | Default borders |
| `--color-border-hover` | `rgba(255, 255, 255, 0.12)` | Hover borders |
| `--color-border-active` | `rgba(255, 255, 255, 0.2)` | Active/focus borders |

### 2.5 Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#10b981` | Positive metrics, completed status |
| `--color-warning` | `#f59e0b` | Warnings, pending status, attention |
| `--color-error` | `#ef4444` | Errors, failed status, critical alerts |
| `--color-info` | `#3b82f6` | Informational, processing status |

---

## 3. Typography

### 3.1 Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display",
             Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 3.2 Font Sizes

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-2xs` | 10px | 14px | Labels, badges, metadata |
| `--text-xs` | 11px | 16px | Small labels, table cells |
| `--text-sm` | 13px | 20px | Body text, descriptions |
| `--text-base` | 14px | 22px | Default body |
| `--text-lg` | 16px | 24px | Card titles |
| `--text-xl` | 20px | 28px | Section headers |
| `--text-2xl` | 24px | 32px | Page headers |
| `--text-3xl` | 30px | 38px | Hero text |
| `--text-display` | 48px | 52px | Marketing headlines |

### 3.3 Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Labels, emphasis |
| `--font-semibold` | 600 | Card titles, buttons |
| `--font-bold` | 700 | Headings, big numbers |

---

## 4. Spacing

Spacing follows a 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tiny gaps |
| `--space-2` | 8px | Small gaps |
| `--space-3` | 12px | Button padding, cell padding |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Form spacing |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Page sections |
| `--space-10` | 40px | Large page breaks |
| `--space-12` | 48px | Modal padding |

---

## 5. Component Philosophy

### 5.1 Cards

Cards are the primary container pattern:

```css
.card {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-4);
}
```

Cards with gold accent (for highlighted content):

```css
.card-accent {
  border-color: var(--color-gold-border);
  background: rgba(212, 175, 55, 0.02);
}
```

### 5.2 Tables

Tables are the primary data display pattern:

- Dense row height (40px default)
- Subtle row borders (`rgba(255, 255, 255, 0.05)`)
- Hover highlight on rows
- Sticky headers for long tables
- Numeric columns right-aligned (tabular-nums)
- Minimal visual noise — no grid lines, alternating rows only on hover

### 5.3 Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| Primary | Gold bg, black text | Main CTAs |
| Secondary | Border only, muted text | Secondary actions |
| Ghost | No border, muted text | Subtle actions |
| Destructive | Red bg or border | Irreversible actions |
| Icon | Square, icon only | Toolbar actions |

### 5.4 Forms

- Labels above inputs (not side-by-side)
- Inline validation with error messages below inputs
- Tab-between-fields for keyboard navigation
- Submit buttons left-aligned below forms

### 5.5 Badges

| Variant | Style | Usage |
|---------|-------|-------|
| Default | Muted bg, muted text | Generic labels |
| Success | Emerald bg/10, emerald text | Completed, active |
| Warning | Amber bg/10, amber text | Pending, warning |
| Error | Red bg/10, red text | Failed, critical |
| Info | Blue bg/10, blue text | Informational |
| Gold | Gold bg/10, gold text | Premium, featured |

---

## 6. Navigation

### 6.1 App Shell

- Left sidebar navigation (collapsible)
- Module grouping with section headers
- Active module highlighted with gold accent
- Notification badges for pending items
- User menu at bottom with logout

### 6.2 Command Palette

- Activated with `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
- Fuzzy search across all pages and entities
- Results grouped by category (Pages, Enterprise Search)
- Keyboard navigation (arrows + enter)
- Recent searches shown when empty

### 6.3 Page Headers

- Breadcrumb navigation for deep pages
- Back link for drill-down pages
- Action buttons right-aligned
- Subtitle describing page purpose

---

## 7. Accessibility

### 7.1 Current State

- Focus visible on all interactive elements
- Keyboard navigation through all UI components
- Semantic HTML structure
- ARIA labels on icon-only buttons

### 7.2 Target Level

WCAG 2.1 AA compliance is the target for all new development:

- Color contrast ratios ≥ 4.5:1 for normal text
- Color contrast ratios ≥ 3:1 for large text
- All functionality available via keyboard
- Screen reader support for data tables
- Error messages associated with form fields

---

## 8. Animation

- Subtle, purposeful animations using Framer Motion
- Duration: 200-300ms for UI transitions, 500-700ms for hero animations
- Easing: `[0.16, 1, 0.3, 1]` (custom cubic-bezier) for natural feel
- Reduced motion respected via `prefers-reduced-motion`
- No animation without user interaction (no autoplay)

### 8.1 Allowed Animation Types

- Fade in/out for modals and overlays
- Slide in/out for side panels
- Scale for hover effects on cards
- Stagger for list appearances

---

## 9. Loading States

### 9.1 Skeleton Loading

Preferred over spinners for content areas:

```tsx
<Skeleton className="h-8 w-48" />
<Skeleton className="h-48" />
<Skeleton className="h-64" />
```

### 9.2 Spinner Loading

Reserved for actions (saving, submitting):

- Small spinner in buttons during submission
- Centered spinner for full-page loading
- No spinning indicators for content — use skeletons

### 9.3 Progressive Loading

- Dashboard widgets load independently
- Page content loads before sidebar content
- Initial data visible while filters load

---

## 10. Empty States

Every data-display component must handle the empty state:

```tsx
<EmptyState
  title="No transactions"
  description="Transactions will appear here once created."
  action={{ label: "Create Transaction", href: "/transactions/new" }}
/>
```

- Helpful title explaining what's missing
- Description suggesting next steps
- Optional action button for primary next step

---

## 11. Data Visualization

### 11.1 Status Badges

Standardized status display across all entities:

```tsx
<StatusBadge status={transaction.status} />
```

Status colors are consistent regardless of entity type:
- `COMPLETED` / `ACTIVE` / `APPROVED` → Emerald
- `PENDING` / `PROCESSING` → Amber
- `FAILED` / `REJECTED` / `CANCELLED` → Red
- `INFO` / default → Zinc

### 11.2 Financial Values

```css
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

All monetary values use tabular numbers for alignment consistency.

### 11.3 Timelines

- Vertical timeline with dot indicators
- Color-coded dots (emerald for completed, amber for pending, red for failed)
- Step mode for guided walkthrough
- Duration display for process tracking

### 11.4 Relationship Graphs

- Tree layout for entity relationships
- Expandable/collapsible nodes
- Color-coded node types
- Click-to-navigate from graph nodes

---

## 12. Iconography

- Lucide React icon library
- Consistent 16px (small), 20px (medium), 24px (large) sizes
- No filled variants — all outlined style
- Icons always accompany text in nav items
- Icon-only buttons require tooltip or ARIA label
