# Design Review Checklist

**Phase**: 22.0B.5 — Enterprise Design Governance

Use this checklist when reviewing any PR that touches UI components, pages, or styles.

## Pre-Review (Automated)

- [ ] `pnpm edl:audit` passes (exit code 0)
- [ ] `pnpm edl:tokens` passes (exit code 0)
- [ ] No ESLint errors from `edl/*` rules
- [ ] No new hardcoded hex colors (verify in diff)
- [ ] No new arbitrary Tailwind color classes (verify in diff)

## Visual Consistency

- [ ] Background colors use EDL surfaces (`bg-surface-base`, `bg-surface-raised`, `bg-surface-overlay`, `bg-surface-drawer`)
- [ ] Text colors use EDL text tokens (`text-st-primary`, `text-st-secondary`, `text-st-muted`, `text-gold`)
- [ ] Borders use EDL border tokens (`border-st-subtle`, `border-st-default`, `border-st-strong`)
- [ ] Shadows use EDL shadow tokens (`shadow-elevated`, `shadow-elevatedHigh`, `shadow-glow-*`)
- [ ] Gold accent is #d4af37 only (not #c9a84c, #d4a843, or any other shade)
- [ ] Status colors use EDL status tokens (`text-st-success`, `bg-st-error`, etc.)

## Typography

- [ ] Font sizes use Tailwind text utilities (`text-xs`, `text-sm`, `text-base`, etc.)
- [ ] Font weights use Tailwind font utilities (`font-normal`, `font-medium`, `font-semibold`, `font-bold`)
- [ ] Font family is Inter (body) or JetBrains Mono (code/numbers)
- [ ] Line heights use Tailwind leading utilities (`leading-tight`, `leading-normal`, `leading-relaxed`)
- [ ] Letter spacing uses Tailwind tracking utilities (`tracking-wide`, `tracking-wider`)

## Spacing & Layout

- [ ] Padding/margins use Tailwind spacing utilities (`p-4`, `m-6`, `gap-3`, etc.)
- [ ] No hardcoded `px` values in style objects
- [ ] Border radius uses EDL radius tokens (`radius-sm`, `radius-md`, `radius-lg`, `radius-xl`)
- [ ] Z-index uses EDL z-index tokens (`z-dropdown`, `z-modal`, `z-toast`, `z-tooltip`)

## Animation & Motion

- [ ] Durations use EDL motion tokens (`d-fastest`, `d-fast`, `d-normal`, `d-slow`)
- [ ] Easings use EDL motion tokens (`e-standard`, `e-decelerate`, `e-accelerate`, `e-spring`)
- [ ] Reduced motion is respected (`prefers-reduced-motion` media query or `useReducedMotion()`)
- [ ] No jarring animations (duration < 100ms or > 600ms)

## Components

- [ ] Uses EDL component primitives (`Button`, `Card`, `Input`, `Badge`, `Table`, `Dialog`, `Toast`, `Tooltip`)
- [ ] No inline style objects (use Tailwind classes or EDL components)
- [ ] Imports from `@/design-system/edl` (not legacy paths)
- [ ] No duplicate component implementations (check existing components first)

## Accessibility

- [ ] Color contrast ratio ≥ 4.5:1 (text), ≥ 3:1 (large text, UI components)
- [ ] Interactive elements have visible focus indicators
- [ ] Screen reader text provided for icon-only buttons
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA attributes used correctly

## Responsive

- [ ] Mobile-first approach (min-width breakpoints)
- [ ] Touch targets ≥ 44px
- [ ] Content reflows without horizontal scroll
- [ ] Text remains readable at 200% zoom

## Performance

- [ ] No unnecessary re-renders from style changes
- [ ] Images optimized (WebP, responsive sizes)
- [ ] Fonts loaded with `font-display: swap`
- [ ] Animations use `transform` and `opacity` (not layout properties)

## Documentation

- [ ] New components documented in `docs/design/COMPONENT_PRINCIPLES.md`
- [ ] New tokens documented in relevant EDL token file
- [ ] Breaking changes documented in PR description
- [ ] Migration guide provided for deprecated APIs

---

*Checklist version: 1.0 — Phase 22.0B.5*
