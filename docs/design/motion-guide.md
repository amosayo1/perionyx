# Perionyx Motion & Animation Guide

Motion guidelines for the Perionyx enterprise platform. Motion communicates state changes, guides attention, and provides feedback — never distracts or blocks productivity.

---

## Table of Contents

1. [Durations](#durations)
2. [Easings](#easings)
3. [Animation Catalog](#animation-catalog)
4. [Reduced Motion](#reduced-motion)
5. [Rules](#rules)

---

## Durations

| Token | Value | Usage |
|---|---|---|
| `instant` | 50ms | Micro-interactions: opacity changes, color shifts, checkbox toggle |
| `fast` | 100ms | Button press, hover states, focus ring appear |
| `normal` | 200ms | Hover transitions, dialog content update, tab switch |
| `slow` | 300ms | Dialog enter/exit, expand/collapse, dropdown open |
| `slower` | 400ms | Page transitions, sidebar slide-in, toast appear |
| `slowest` | 600ms | Complex orchestrated animations, counter count-up |

### Duration Selection Guide

| Question | Duration |
|---|---|
| Is it a micro-interaction (color, opacity)? | `instant` (50ms) |
| Is it immediate feedback (press, hover)? | `fast` (100ms) |
| Is it a state change (toggle, tab)? | `normal` (200ms) |
| Is it a UI element appearing (dialog, dropdown)? | `slow` (300ms) |
| Is it a page-level transition? | `slower` (400ms) |
| Is it complex multi-step animation? | `slowest` (600ms) |

---

## Easings

| Token | Value | Usage |
|---|---|---|
| `linear` | `linear` | Progress bars, loading spinners, continuous loops |
| `default` | `ease-in-out` | General purpose transitions |
| `in` | `ease-in` | Exiting elements (shrink, fade out, move away) |
| `out` | `ease-out` | Entering elements (grow, fade in, move in) |
| `spring` | Framer Motion spring | Dialogs, toasts, natural bounce |
| `bounce` | Framer Motion bounce | Celebratory feedback (success states) |
| `emphasize` | `cubic-bezier(0.4, 0, 0.2, 1)` | High-emphasis transitions (page enter) |

### Easing Selection Guide

| Scenario | Easing |
|---|---|
| Element entering the viewport | `out` (ease-out) |
| Element leaving the viewport | `in` (ease-in) |
| Element transforming in place | `default` (ease-in-out) |
| Natural feel (spring physics) | `spring` |
| Celebration/feedback | `bounce` |
| Linear, constant speed | `linear` |
| Important page transition | `emphasize` |

---

## Animation Catalog

### Page Transitions

**fade-in-up** — Page enter animation.

```tsx
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 }
}

// Duration: 400ms, Easing: emphasize
```

Used by `PageTransition` and `PageContainer` components. Every new page fades in from slightly below.

### Card Interactions

**hover-lift** — Interactive cards lift on hover.

```tsx
// While hover: translateY(-2px), shadow-medium
// While tap: scale(0.98)
// Duration: 150ms, Easing: out
```

Used by `AnimatedCard` and dashboard metric cards. Provides tactile feedback without being distracting.

**press-scale** — Button and card press feedback.

```tsx
// While tap: scale(0.98)
// Duration: 100ms, Easing: default
```

### Dialog Animations

**backdrop-fade + scale-in** — Dialog entrance.

```tsx
// Backdrop: opacity 0 → 1, 200ms, ease-in
// Content: scale(0.95) → scale(1), opacity 0 → 1, 200ms, spring
// Exit: reverse of entrance, 150ms
```

Used by `AnimatedDialog` and all Radix-based dialogs. AnimatePresence handles mount/unmount.

### Skeleton Loading

**shimmer** — Skeleton placeholder animation.

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Duration: 1.5s infinite, linear easing */
/* Applied via CSS ::before pseudo-element */
```

Used by `LoadingSkeleton`, `SkeletonCard`, `SkeletonTable`. A translucent highlight sweeps across the skeleton surface.

### Stagger Lists

**stagger** — Sequential entrance for list items.

```tsx
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.03  // 30ms delay per item
    }
  }
}

// Each child: fadeInUp, 200ms, ease-out
```

Used by `AnimatedTable` rows, `WorkflowDesigner` step cards, `NotificationCenter` items. Creates a cascading entrance effect.

### Toast Notifications

**slide-in-right** — Toast entrance from right edge.

```tsx
// Initial: translateX(120%), opacity 0
// Animate: translateX(0), opacity 1
// Duration: spring physics (stiffness: 300, damping: 25)
// Exit: translateX(120%), opacity 0, 150ms
```

Used by `AnimatedToast`. Stack layout animation repositions remaining toasts.

### Expand/Collapse

**expand-collapse** — Accordion and section toggle.

```tsx
// Initial: height: 0, opacity: 0
// Animate: height: auto, opacity: 1
// Duration: 300ms, ease-in-out
// AnimatePresence handles unmount
```

Used by `EnterpriseSection` collapsible sections, `ApprovalQuickView` expandable cards, dropdown menus.

### Sidebar

**slide-in** — Sidebar drawer on mobile.

```tsx
// Initial: translateX(-100%)
// Animate: translateX(0)
// Duration: 400ms, spring physics
// Backdrop: opacity 0 → 0.6, 200ms
```

Used by `AnimatedSidebar` and mobile navigation drawer.

### Metric Counter

**count-up** — Animated number display.

```tsx
// From: 0 (or previous value)
// To: target value
// Duration: 600ms, cubic-bezier(0.4, 0, 0.2, 1)
// Initial: opacity 0, y 4
// Animate: opacity 1, y 0
```

Used by `AnimatedMetric` and dashboard KPI cards. Numbers count up from zero on page load.

### Breadcrumb Transitions

**pop-layout** — Breadcrumb segment transitions.

```tsx
// Each segment: scale 0.9 → 1, opacity 0 → 1
// Duration: 150ms, stagger 30ms per segment
// AnimatePresence with popLayout mode
```

Used by `Breadcrumbs` component. New segments pop in when navigating deeper.

---

## Reduced Motion

All animations are wrapped in motion preference detection.

### Implementation

```tsx
import { useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced
        ? { duration: 0 }
        : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
      }
    >
      {children}
    </motion.div>
  )
}
```

### Fallback Behavior

| Animation | Normal | Reduced Motion |
|---|---|---|
| Page transitions | fade-in-up 400ms | Instant (duration: 0) |
| Card hover | lift -2y 150ms | No movement |
| Dialog entrance | backdrop + scale 200ms | Instant appear |
| Skeleton shimmer | 1.5s infinite loop | Static gray background |
| Stagger lists | 30ms per item | All items at once |
| Toast slide-in | spring 300ms | Instant appear |
| Expand/collapse | height transition 300ms | Instant toggle |
| Counter count-up | 600ms count | Display final value |
| Sidebar slide-in | 400ms spring | Instant appear |

### CSS Fallback

For CSS-only animations (skeleton shimmer), use the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton::before {
    animation: none;
  }
}
```

---

## Rules

### DO

1. **Never block interaction** — Animations must not prevent users from clicking, typing, or navigating. All interactive elements remain functional during animation.
2. **Keep it subtle** — Enterprise users spend 8+ hours daily in the app. Movements should be barely perceptible, not attention-grabbing.
3. **Use motion for meaning** — Every animation communicates something: entrance (new content), exit (removal), expansion (more detail), contraction (less detail).
4. **Provide reduced-motion alternative** — Every animation must have a `prefers-reduced-motion` fallback that displays content instantly.
5. **Use consistent durations** — Stick to the token scale. Don't invent custom durations.
6. **Use appropriate easings** — Entering elements use `ease-out`. Exiting use `ease-in`. Transformations use `ease-in-out`.
7. **Stagger large lists** — Lists of 5+ items should use stagger animation (30ms delay per item) for visual hierarchy.

### DON'T

1. **Never autoplay loud animations** — No flashing, pulsing, or bouncing that draws attention away from data.
2. **Never flash content** — Avoid rapid opacity changes that could trigger photosensitive reactions. Maximum flash duration: single frame.
3. **Never block interaction** — Dialog entrance animations must not prevent the user from pressing Escape to close.
4. **Never animate layout** — Avoid animating `width`, `height`, `top`, `left` properties. Use `transform` and `opacity` for GPU-accelerated animation.
5. **Never animate scroll** — Don't hijack scroll behavior. Let the browser handle scrolling.
6. **Never animate critical data** — Metric values, balances, and financial figures should appear immediately. Counter animation is optional enhancement, not requirement.
7. **Never use animation as the only indicator** — Loading state must include both animation AND text ("Loading..."). Status must include both color AND icon/text.
