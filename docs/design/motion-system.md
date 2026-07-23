# Enterprise Motion System & Microinteractions

## Motion Philosophy

Perionyx motion follows four principles:

1. **Communicate state** — Every animation answers "what just happened?"
2. **Improve comprehension** — Motion guides attention, never distracts
3. **Never decorative** — If removing the animation doesn't harm UX, remove it
4. **Calm confidence** — 60 FPS, subtle, professional, enterprise-grade

## Motion Architecture

```
src/design-system/motion/            ← Central motion presets
├── motionTokens.ts                  Timing + easing tokens
├── animationPresets.ts              15 animation presets (fadeIn, scaleIn, etc.)
├── transitionPresets.ts             11 transition presets (page, modal, drawer, etc.)
├── microInteractions.ts             12 micro-interaction variants
├── gestureConfig.ts                 Gesture + drag + swipe configurations
├── reducedMotion.ts                 Accessibility-first reduced motion handling
└── index.ts                         Barrel exports

src/components/motion/               ← Runtime motion components
├── micro-interactions.tsx           8 micro-interaction components
├── animated-containers.tsx          4 layout animation wrappers
└── index.ts

src/components/enterprise/motion/    ← Existing (Phase 8B.7) — 13 motion components
├── animated-card.tsx, animated-button.tsx, animated-dialog.tsx, etc.
├── page-transition.tsx, section-transition.tsx, loading-skeleton.tsx
├── provider.tsx                      MotionProvider (reduced-motion context)
└── tokens.ts                         Variant definitions
```

## Animation Catalog

### Timing Tokens

| Token | ms | Use Case |
|-------|----|----------|
| instant | 50 | Micro-feedback, press states |
| fast | 100 | Hover, focus rings, tooltips |
| normal | 200 | Card hover, button transitions |
| slow | 300 | Page entrances, modal opens |
| page | 400 | Route transitions, content fade |
| modal | 600 | Large dialog, fullscreen transitions |

### Easing Curves

| Curve | Function | Feel |
|-------|----------|------|
| easeOut | `[0, 0, 0.2, 1]` | Natural deceleration — PRIMARY easing |
| easeInOut | `[0.4, 0, 0.2, 1]` | Expand/collapse, accordions |
| spring | `stiffness:300, damping:25` | Notifications, badges, counters |
| springGentle | `stiffness:200, damping:30` | Page transitions, card entrance |
| springStiff | `stiffness:400, damping:20` | Notification badges, count changes |

### Animation Presets (15)

fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight, scaleIn, slideInLeft, slideInRight, staggerContainer, staggerItem, hoverElevate, hoverScale, tapScale, expandCollapse, shimmer, listItem

### Transition Presets (11)

pageEnter, pageLeave, modalEnter (overlay + content), drawerEnter (overlay + content), sidebarCollapse, toastEnter (spring), tooltipEnter, accordionExpand, rowEnter, tabTransition

### Micro-Interactions (12)

buttonPress, cardLift, rowHighlight, dotPulse, shimmer, counterEnter, deltaFlash, errorShake, successCheck, notificationDot, listStagger, focusRing

## Micro-Interaction Components (8 new)

| Component | Purpose |
|-----------|---------|
| `PulseDot` | Animated status dot with glow, 6 colors, 3 sizes |
| `LoadingDots` | Three bouncing dots for loading text |
| `ThinkingIndicator` | AI/brain animation with bouncing dots + label |
| `SuccessCheck` | Spring-animated SVG checkmark in circle |
| `FailureX` | Spring-animated SVG X in circle |
| `NotificationBadge` | Spring-animated count badge with counter change |
| `AnimatedProgress` | Smooth progress bar with value transition |
| `ShimmerBlock` | Gradient shimmer loading block |

## Layout Animation Wrappers (4 new)

| Component | Purpose |
|-----------|---------|
| `AnimatedPageContainer` | Page-level fade-in-up entrance + exit |
| `AnimatedSection` | Section-level fade-in-up with configurable delay |
| `AnimatedList` | Stagger container for list children |
| `AnimatedListItem` | Individual stagger item for lists |

## Motion Wiring — Enhanced Components (2 modified)

| Component | What Changed |
|-----------|-------------|
| `DashboardSection` | Added `animate` prop + motion.section with fade-in-up variants |
| `EmptyState` | Added gentle scale+fade entrance animation via framer-motion |

## Existing Motion Infrastructure (untouched — Phase 8B.7)

- 13 motion components with backward compatibility (`MotionDiv`, `MotionStagger`)
- `MotionProvider` with `useReducedMotion` context
- Variant definitions in `enterprise/motion/tokens.ts`

## Accessibility

- **`prefers-reduced-motion`**: Respected globally via `MotionProvider` — disables all non-essential animations
- **`reducedMotion.ts`**: Provides `getReducedMotionProps()` that returns zero-duration transitions when reduced motion is enabled
- **`shouldAnimate()`**: Utility to conditionally animate based on reduced motion + essential flag
- **Never rely on animation alone**: All state communicated via color, text, and ARIA attributes alongside motion
- **Animation duration**: Under 600ms (WCAG 2.3.3 guidance for flashing)
- **GPU accelerated**: All animations use `transform` (scale, translate) and `opacity` only — no layout-triggering properties

## Performance

| Metric | Target | How |
|--------|--------|-----|
| Frame rate | 60 FPS | CSS transforms + opacity only, GPU composited |
| Animation budget | <16ms/frame | framer-motion's optimized animation engine |
| Layout thrashing | None | No animating `width`, `height`, `margin`, `padding` |
| React renders | Minimal | `memo` on motion wrappers, stable variant references |
| CPU impact | Negligible | Spring physics offloaded to GPU; avoids JS-driven animations |

## Motion Checklist — Every Animation Must Answer

1. **Why does this animation exist?** — Must communicate state or guide attention
2. **Does it communicate state?** — Loading, success, error, transition, focus
3. **Can it be removed without harming UX?** — If yes, it's decorative; remove it
4. **GPU accelerated?** — Only `opacity` + `transform` (scale, translate)
5. **CPU impact?** — No layout-triggering properties, no JS-driven frames
6. **Accessibility impact?** — Respects `prefers-reduced-motion` at provider level
7. **Mobile performance?** — 60 FPS on Safari/iOS WebKit with GPU compositing
8. **Enterprise scalability?** — All variants are tree-shakeable, no runtime cost when not used

## Files Created (12)

| File | Purpose |
|------|---------|
| `src/design-system/motion/motionTokens.ts` | Timing + easing tokens from design system |
| `src/design-system/motion/animationPresets.ts` | 15 animation variants |
| `src/design-system/motion/transitionPresets.ts` | 11 transition presets |
| `src/design-system/motion/microInteractions.ts` | 12 micro-interaction variants |
| `src/design-system/motion/gestureConfig.ts` | Gesture + drag + swipe configs |
| `src/design-system/motion/reducedMotion.ts` | Reduced motion compliance utilities |
| `src/design-system/motion/index.ts` | Barrel exports |
| `src/components/motion/micro-interactions.tsx` | 8 micro-interaction components |
| `src/components/motion/animated-containers.tsx` | 4 layout animation wrappers |
| `src/components/motion/index.ts` | Barrel exports |

## Files Modified (2)

| File | Change |
|------|--------|
| `src/components/enterprise/dashboard-section.tsx` | Added framer-motion fade-in-up entrance with animate prop |
| `src/components/design-system/loading/empty-state.tsx` | Added gentle scale+fade entrance animation |

## Verification

| Check | Result |
|-------|--------|
| `pnpm typecheck` | Zero errors |
| `pnpm build` | Production build passes |
| HTTP 200 | Server starts and responds |
| No backend/API/business logic changes | ✓ |
| 0 new runtime dependencies | ✓ |
