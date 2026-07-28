# Motion System

**Phase 22.0B — Animation Tokens**

Single motion system. No duplicates. Every animation in Perionyx uses these tokens.

---

## Conflict Resolution

| Location | Status |
|---|---|
| `enterprise/motion/tokens.ts` | **Deprecated** → use `edl/motion.ts` |
| `design-system/tokens/animation.ts` | **Deprecated** → use `edl/motion.ts` |
| `enterprise/motion/provider.tsx` | **Kept** — reduced-motion context provider |

## Durations

| Token | Value | Usage |
|---|---|---|
| `instant` | 0ms | State changes (no animation) |
| `fast` | 100ms | Micro-interactions (hover, focus) |
| `normal` | 200ms | Standard transitions |
| `moderate` | 300ms | Page transitions, expand/collapse |
| `slow` | 400ms | Complex animations |
| `verySlow` | 600ms | Counter animations, metrics |
| `page` | 400ms | Page enter/exit |
| `shimmer` | 2000ms | Skeleton loading cycle |

## Easings

| Token | Curve | Usage |
|---|---|---|
| `default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `in` | `cubic-bezier(0.4, 0, 1, 1)` | Entering elements |
| `out` | `cubic-bezier(0, 0, 0.2, 1)` | Exiting elements |
| `inOut` | `cubic-bezier(0.4, 0, 0.2, 1)` | Bidirectional |
| `easeOut` | `cubic-bezier(0.16, 1, 0.3, 1)` | Counters, metrics |
| `snappy` | `cubic-bezier(0.2, 0, 0, 1)` | Small interactions |

## Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- All durations → 0ms
- All easings → linear
- `MotionProvider` context provides `enabled: false`

## Composed Variants

| Variant | Initial | Animate | Duration | Easing |
|---|---|---|---|---|
| `fadeIn` | opacity: 0 | opacity: 1 | 200ms | out |
| `fadeInUp` | opacity: 0, y: 8 | opacity: 1, y: 0 | 300ms | out |
| `fadeInDown` | opacity: 0, y: -8 | opacity: 1, y: 0 | 300ms | out |
| `scaleIn` | opacity: 0, scale: 0.95 | opacity: 1, scale: 1 | 200ms | out |
| `slideInRight` | x: 100, opacity: 0 | x: 0, opacity: 1 | 300ms | out |
| `expand` | height: 0, opacity: 0 | height: auto, opacity: 1 | 300ms | inOut |
| `collapse` | height: auto, opacity: 1 | height: 0, opacity: 0 | 200ms | inOut |

## Stagger

| Parameter | Value |
|---|---|
| Base delay | 30ms per item |
| Max delay | 300ms total |

Stagger is used for:
- Table row entrance
- Card grid entrance
- Navigation item entrance
- List item entrance

## Rules

1. **No spring physics** — enterprise precision, not playfulness
2. **No animation > 600ms** — respect user time
3. **Always respect reduced-motion** — check `MotionProvider.enabled`
4. **No animation on first paint** — content appears immediately, animates on update
5. **Gold glow for emphasis only** — `SHADOWS.glowGold` on selected/active states
