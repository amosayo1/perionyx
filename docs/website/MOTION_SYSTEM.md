# Perionyx Public Website — Motion System

> **Status**: v1.0
> **Scope**: Page-level and component-level animation specifications for the public website
> **Extension of**: Enterprise Motion System (15 presets, 11 transitions, 12 micro-interactions)
> **Principle**: Motion communicates state. If removing it doesn't harm comprehension, remove it.

---

## 1. Motion Principles (Public Site)

1. **Scroll-triggered, not load-triggered.** Nothing animates until the user scrolls to it. No auto-play on page load except the hero.
2. **One motion per element.** Never animate position AND opacity AND scale simultaneously on the same element.
3. **Consistent timing.** Every animation type has a fixed duration and easing. No ad-hoc values.
4. **GPU only.** Only `transform` and `opacity`. Never animate `width`, `height`, `margin`, `padding`, `top`, `left`.
5. **Reduced motion first.** Every animation has a zero-duration fallback. `prefers-reduced-motion` disables all non-essential motion.
6. **60 FPS or nothing.** If an animation drops frames on a mid-range laptop, simplify it.

---

## 2. Page Load Sequence

### 2.1 Initial Load Animation

On first page load, elements reveal in a staggered sequence:

| Element | Delay | Duration | Easing | Properties |
|---|---|---|---|---|
| Navbar | 0ms | 200ms | ease-out | `opacity: 0→1, y: -8→0` |
| Hero overline | 150ms | 400ms | `[0.16, 1, 0.3, 1]` | `opacity: 0→1, y: 16→0` |
| Hero headline | 250ms | 400ms | `[0.16, 1, 0.3, 1]` | `opacity: 0→1, y: 16→0` |
| Hero subtext | 350ms | 400ms | `[0.16, 1, 0.3, 1]` | `opacity: 0→1, y: 16→0` |
| Hero CTAs | 450ms | 400ms | `[0.16, 1, 0.3, 1]` | `opacity: 0→1, y: 16→0` |
| Metric strip | 550ms | 400ms | `[0.16, 1, 0.3, 1]` | `opacity: 0→1, y: 16→0` |
| Metric values | 650ms | 1200ms | ease-out cubic | Count from 0 to final value |

**Implementation:**

```tsx
// Hero section stagger
const heroStagger = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 + 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  })
};

// Usage
<motion.div custom={0} variants={heroStagger} initial="hidden" animate="visible">
  <Overline />
</motion.div>
<motion.div custom={1} variants={heroStagger} initial="hidden" animate="visible">
  <Headline />
</motion.div>
```

### 2.2 Page Transition (Client-Side Navigation)

| Property | Value |
|---|---|
| Type | Cross-fade |
| Duration | 300ms |
| Easing | ease-out |
| Old page | `opacity: 1→0` over 200ms |
| New page | `opacity: 0→1` over 300ms (starts at 100ms) |

```tsx
// Page wrapper
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {children}
</motion.div>
```

---

## 3. Scroll Reveal System

### 3.1 Standard Reveal

Every section, card, and visual element uses this base pattern:

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>
```

| Property | Value | Rationale |
|---|---|---|
| Initial y | 30px | Subtle lift, not jarring |
| Duration | 600ms | Noticeable but not slow |
| Easing | `[0.16, 1, 0.3, 1]` | PEDL gold standard curve |
| Viewport amount | 0.2 | Trigger at 20% visible |
| Viewport once | true | Animate only on first appearance |

### 3.2 Staggered Grid Reveal

For card grids, lists, and multi-item sections:

```tsx
// Container
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.1 }}
  variants={{
    visible: { transition: { staggerChildren: 0.08 } }
  }}
>

// Each item
<motion.div
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>
```

| Property | Value |
|---|---|
| Stagger delay | 80ms per item |
| Item initial y | 20px (less than section reveal) |
| Item duration | 600ms |
| Max stagger items | 12 (cap at ~1 second total) |

### 3.3 Directional Reveals

| Direction | Transform | When to Use |
|---|---|---|
| From bottom (default) | `y: 30→0` | All standard content |
| From left | `x: -30→0` | Left-side content in alternating sections |
| From right | `x: 30→0` | Right-side content in alternating sections |
| From bottom-left | `x: -20, y: 20→0, 0` | Diagram entries |
| From bottom-right | `x: 20, y: 20→0, 0` | Diagram entries |
| Scale in | `scale: 0.95→1, opacity: 0→1` | Featured visuals (rare) |

**Rules:**
- Never reveal from top (feels regressive)
- Directional reveals match content position (left content enters from left)
- Maximum 2 directional reveals per page (otherwise feels chaotic)

---

## 4. Hover States

### 4.1 Card Hover

```tsx
<motion.div
  whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}
  className="rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-colors"
>
```

| Property | Value |
|---|---|
| Transform | `y: -2px` (subtle lift) |
| Duration | 200ms |
| Easing | ease-out |
| Border | `white/[0.06]` → `white/[0.12]` (CSS transition, 200ms) |
| Shadow | Inherits from card (no change) |

**Rules:**
- Only on interactive cards (cards with links or click handlers)
- Non-interactive cards get border change only (no lift)
- Never scale cards on hover (feels cheap)

### 4.2 Button Hover

```tsx
// Primary (gold)
className="bg-[#d4af37] hover:bg-[#c7a961] active:scale-[0.98] transition-all duration-200"

// Secondary
className="border border-[#d4af37]/30 hover:bg-[#d4af37]/10 active:scale-[0.98] transition-all duration-200"
```

| Property | Value |
|---|---|
| Color shift | Gold darkens slightly on hover |
| Scale on press | `0.98` (subtle feedback) |
| Duration | 200ms |
| Easing | ease-out |

### 4.3 Link Hover

```tsx
className="text-[#d4af37] hover:text-[#c7a961] underline-offset-4 hover:underline transition-all duration-200"
```

| Property | Value |
|---|---|
| Underline | Appears on hover, 200ms |
| Color shift | Gold darkens slightly |
| Underline offset | 4px |

### 4.4 Logo/Partner Hover

```tsx
className="grayscale opacity-60 hover:opacity-100 transition-opacity duration-300"
```

| Property | Value |
|---|---|
| Opacity | 60% → 100% |
| Duration | 300ms |

---

## 5. Metric Counter Animation

### 5.1 Count-Up

```tsx
function useCountUp(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, value };
}
```

| Property | Value |
|---|---|
| Duration | 1200ms |
| Easing | Ease-out cubic (`1 - (1 - t)^3`) |
| Trigger | 50% visible in viewport |
| Format | `Intl.NumberFormat` for commas/decimals |
| One-time | Never re-animates |

### 5.2 Formatting

| Metric Type | Format | Example |
|---|---|---|
| Currency | `$X.XB` or `$X.XM` | `$2.4B` |
| Time | `Xms` | `32ms` |
| Percentage | `XX.XX%` | `99.99%` |
| Count | `X,XXX` | `12,847` |
| Duration | `Xh` or `X min` | `12h` |

---

## 6. Diagram Animations

### 6.1 SVG Path Drawing

```tsx
<motion.path
  d="M 100 200 L 300 200"
  stroke="zinc-600"
  strokeWidth={1.5}
  fill="none"
  initial={{ pathLength: 0, opacity: 0 }}
  whileInView={{ pathLength: 1, opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
/>
```

| Property | Value |
|---|---|
| Duration | 800ms per path |
| Easing | `[0.16, 1, 0.3, 1]` |
| Trigger | Scroll into viewport |
| Stagger | 100ms between paths |

### 6.2 Node Appearance

```tsx
<motion.g
  initial={{ opacity: 0, scale: 0.8 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: nodeIndex * 0.1 }}
>
  <rect ... />
  <text ... />
</motion.g>
```

| Property | Value |
|---|---|
| Duration | 500ms per node |
| Stagger | 100ms between nodes |
| Scale | 0.8 → 1 |
| Opacity | 0 → 1 |

### 6.3 Data Flow Animation

For showing data moving through a workflow:

```tsx
<motion.circle
  cx={0}
  cy={0}
  r={4}
  fill="#d4af37"
  initial={{ offsetDistance: "0%" }}
  whileInView={{ offsetDistance: "100%" }}
  viewport={{ once: true }}
  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
/>
```

| Property | Value |
|---|---|
| Duration | 2000ms per cycle |
| Easing | Linear (consistent speed) |
| Repeat | Once on scroll, then stop (or loop if critical) |
| Size | 4px radius dot |
| Color | Gold (`#d4af37`) |

---

## 7. Navigation Animations

### 7.1 Mega Menu

| Property | Value |
|---|---|
| Trigger | Hover on nav item |
| Enter | `opacity: 0→1, y: -4→0`, 200ms, ease-out |
| Leave | `opacity: 1→0`, 150ms, ease-in |
| Background | `bg-[#0a0a0a]/95 backdrop-blur-xl` |
| Border | `border border-white/[0.06] rounded-xl` |
| Shadow | `shadow-2xl` |

### 7.2 Mobile Drawer

| Property | Value |
|---|---|
| Trigger | Hamburger button click |
| Enter | `x: 100%→0%`, 300ms, spring (stiffness: 300, damping: 30) |
| Leave | `x: 0%→100%`, 250ms, ease-in |
| Overlay | `opacity: 0→1, bg-black/60`, 200ms |
| Close | Tap overlay, swipe right, or press Escape |

### 7.3 Scroll-to-Section

| Property | Value |
|---|---|
| Behavior | `smooth` scroll behavior |
| Offset | 80px (navbar height) |
| Duration | Native browser smooth scroll (~300-500ms) |

---

## 8. Specific Component Animations

### 8.1 Code Block Copy Button

| State | Animation |
|---|---|
| Default | `opacity: 0` (hidden) |
| Code hover | `opacity: 0→1`, 200ms |
| Click | Icon swaps to `Check` for 1500ms, then reverts |
| Copy feedback | `scale: 1→1.1→1`, 200ms spring |

### 8.2 Tab Navigation

| Property | Value |
|---|---|
| Indicator | `layoutId` underline, spring (stiffness: 400, damping: 30) |
| Content | Cross-fade 200ms |

### 8.3 Accordion / Expandable

| Property | Value |
|---|---|
| Height | `AnimatePresence` with `height: auto`, 300ms, ease-in-out |
| Icon rotate | `rotate: 0→180deg`, 300ms |
| Content | `opacity: 0→1` with 100ms delay |

### 8.4 Tooltip

| Property | Value |
|---|---|
| Enter | `opacity: 0→1, scale: 0.95→1`, 150ms, ease-out |
| Leave | `opacity: 1→0`, 100ms, ease-in |
| Delay | 300ms before showing |

---

## 9. Reduced Motion Handling

### 9.1 Implementation

```tsx
// Wrap all public site pages in MotionProvider
// MotionProvider checks prefers-reduced-motion

function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
```

### 9.2 Reduced Motion Rules

| Animation Type | Reduced Motion Behavior |
|---|---|
| Scroll reveals | Appear immediately (opacity: 1, no transform) |
| Page transitions | Instant switch (no cross-fade) |
| Metric counters | Display final value immediately |
| Diagram animations | Show final state immediately |
| Hover states | Color changes only (no transform) |
| Nav drawer | Instant show/hide |
| Stagger animations | All items appear simultaneously |

### 9.3 Essential vs. Non-Essential

| Essential (kept with reduced motion) | Non-Essential (disabled) |
|---|---|
| Focus rings | Scroll reveals |
| Loading indicators | Hover lifts |
| Active state feedback | Diagram path drawing |
| Error state appearance | Metric count-up |
| | Page transitions |
| | Mega menu fade |

---

## 10. Performance Rules

### 10.1 What to Animate

| Allowed (GPU composited) | Forbidden (layout-triggering) |
|---|---|
| `opacity` | `width`, `height` |
| `transform: translateX/Y` | `margin`, `padding` |
| `transform: scale` | `top`, `left`, `right`, `bottom` |
| `transform: rotate` | `border-width` |
| `transform: skew` | `font-size` (use `scale` instead) |
| `clip-path` | `box-shadow` (use pseudo-element) |
| `filter: blur()` | `background-position` |

### 10.2 Performance Budget

| Metric | Target |
|---|---|
| Frame rate | 60 FPS |
| Animation startup | < 5ms |
| Per-frame CPU | < 4ms |
| Layout thrashing | 0 forced reflows |
| Composite layers | Max 10 animated elements simultaneously |

### 10.3 Optimization Techniques

| Technique | When to Use |
|---|---|
| `will-change: transform` | Animating elements about to animate |
| `transform: translateZ(0)` | Force GPU compositing for complex elements |
| `memo` on motion components | Prevent re-renders triggering new animations |
| `AnimatePresence mode="wait"` | Page transitions (prevent layout jump) |
| `layout` prop | Shared layout animations (mega menu indicator) |

---

## 11. Timing Reference Table

| Animation | Duration | Delay | Easing | Properties | Trigger |
|---|---|---|---|---|---|
| **Page load** | | | | | |
| Navbar enter | 200ms | 0ms | ease-out | opacity, y | Page load |
| Hero overline | 400ms | 150ms | `[0.16,1,0.3,1]` | opacity, y | Page load |
| Hero headline | 400ms | 250ms | `[0.16,1,0.3,1]` | opacity, y | Page load |
| Hero subtext | 400ms | 350ms | `[0.16,1,0.3,1]` | opacity, y | Page load |
| Hero CTAs | 400ms | 450ms | `[0.16,1,0.3,1]` | opacity, y | Page load |
| Metric strip | 400ms | 550ms | `[0.16,1,0.3,1]` | opacity, y | Page load |
| **Scroll reveals** | | | | | |
| Section content | 600ms | 0ms | `[0.16,1,0.3,1]` | opacity, y (30) | 20% visible |
| Grid item | 600ms | 80ms stagger | `[0.16,1,0.3,1]` | opacity, y (20) | 20% visible |
| Left content | 600ms | 0ms | `[0.16,1,0.3,1]` | opacity, x (-30) | 20% visible |
| Right content | 600ms | 0ms | `[0.16,1,0.3,1]` | opacity, x (30) | 20% visible |
| **Hover** | | | | | |
| Card lift | 200ms | 0ms | ease-out | y (-2px) | Mouse enter |
| Button scale | 200ms | 0ms | ease-out | scale (0.98 on press) | Mouse down |
| Link underline | 200ms | 0ms | ease-out | text-decoration | Mouse enter |
| Border brighten | 200ms | 0ms | ease-out | border-color | Mouse enter |
| **Diagram** | | | | | |
| Path draw | 800ms | 0ms | `[0.16,1,0.3,1]` | pathLength | 20% visible |
| Node appear | 500ms | 100ms stagger | `[0.16,1,0.3,1]` | opacity, scale | 20% visible |
| Data flow dot | 2000ms | 0ms | linear | offset-distance | Scroll |
| **Counter** | | | | | |
| Count-up | 1200ms | 0ms | ease-out cubic | value (0→N) | 50% visible |
| **Navigation** | | | | | |
| Mega menu in | 200ms | 0ms | ease-out | opacity, y (-4) | Hover |
| Mega menu out | 150ms | 0ms | ease-in | opacity | Mouse leave |
| Mobile drawer | 300ms | 0ms | spring(300,30) | x (100%→0%) | Click |
| Mobile drawer close | 250ms | 0ms | ease-in | x (0%→100%) | Click/swipe |
| **Page transitions** | | | | | |
| Cross-fade out | 200ms | 0ms | ease-out | opacity | Navigate |
| Cross-fade in | 300ms | 100ms | ease-out | opacity | Navigate |
| **Micro** | | | | | |
| Copy success | 200ms | 0ms | spring | scale (1→1.1→1) | Click |
| Tab indicator | — | 0ms | spring(400,30) | layoutId | Click |
| Accordion | 300ms | 0ms | ease-in-out | height, opacity | Click |
| Tooltip | 150ms | 300ms | ease-out | opacity, scale | Hover |

---

## 12. Motion Checklist

Before shipping any animation:

1. **Purpose defined?** What state does it communicate?
2. **Duration appropriate?** Refer to timing table
3. **Easing correct?** `[0.16, 1, 0.3, 1]` for enters, ease-in for exits
4. **GPU-only?** Only `transform` and `opacity`
5. **Reduced motion handled?** Zero-duration fallback
6. **Viewport trigger correct?** `once: true`, `amount: 0.2`
7. **Performance acceptable?** 60 FPS on mid-range hardware
8. **No layout thrashing?** No width/height/margin animation
9. **Not decorative?** Removing it doesn't harm comprehension
10. **Consistent with timing table?** No ad-hoc durations
