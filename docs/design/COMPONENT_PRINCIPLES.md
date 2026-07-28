# Component Principles

**Phase 22.0B — How Components Consume EDL Tokens**

---

## Component Anatomy

Every Perionyx component follows this structure:

```tsx
import { SURFACES, BORDERS, TEXT, BRAND, RADIUS_USE, SHADOWS, SPACE, LAYOUT, EASING, DURATION } from "@/design-system/edl";

export function MyComponent({ variant = "default" }) {
  return (
    <div
      style={{
        background: SURFACES.raised,
        border: `1px solid ${BORDERS.default}`,
        borderRadius: RADIUS_USE.card,
        padding: LAYOUT.cardPadding,
        boxShadow: SHADOWS.soft,
        transition: `all ${DURATION.normal} ${EASING.default}`,
      }}
    >
      {/* Content */}
    </div>
  );
}
```

## Token Consumption Rules

### Colors
- Backgrounds: `SURFACES.*` only
- Text: `TEXT.*` only
- Borders: `BORDERS.*` only
- Accent: `BRAND.*` only
- Status: `STATUS.*` only
- Shadows: `SHADOWS.*` only

### Spacing
- Page-level: `LAYOUT.pagePadding`
- Component internal: `LAYOUT.cardPadding` or `SPACE[*]`
- Gaps: `LAYOUT.cardGap` or `SPACE[*]`
- Never: hardcoded `px` values

### Typography
- Use Tailwind text utilities: `text-base`, `text-sm`, `text-xs`
- Financial numbers: `font-mono` (JetBrains Mono)
- Headings: `font-semibold` or `font-bold`

### Radius
- Cards: `rounded-lg`
- Buttons/inputs: `rounded-md`
- Dialogs: `rounded-xl`
- Badges: `rounded`
- Full round: `rounded-full`

### Motion
- Use Framer Motion variants from `MOTION_DIV`
- Or CSS transitions using `DURATION.*` and `EASING.*`
- Always check `MotionProvider.enabled` for reduced motion

## Variant Pattern

```tsx
type CardVariant = "default" | "elevated" | "interactive" | "selected" | "metric";

const variantStyles = {
  default: { bg: SURFACES.raised, border: BORDERS.default, shadow: SHADOWS.soft },
  elevated: { bg: SURFACES.elevated, border: BORDERS.default, shadow: SHADOWS.medium },
  interactive: { bg: SURFACES.raised, border: BORDERS.default, shadow: SHADOWS.soft, cursor: "pointer" },
  selected: { bg: SURFACES.raised, border: BORDERS.gold, shadow: SHADOWS.glowGold },
  metric: { bg: SURFACES.raised, border: BORDERS.default, shadow: SHADOWS.soft, borderLeft: `3px solid ${BRAND.gold}` },
};
```

## Compound Components

Complex components compose from EDL primitives:

```tsx
<Card variant="metric">
  <CardHeader>
    <Text variant="sm" color={TEXT.secondary}>Cash Position</Text>
  </CardHeader>
  <CardBody>
    <Text variant="financial" color={TEXT.primary}>$1,234,567.89</Text>
  </CardBody>
  <CardFooter>
    <Badge variant="success">+12.3%</Badge>
  </CardFooter>
</Card>
```

## Rules

1. **Tokens only** — no hardcoded colors, spacing, or shadows
2. **Variant pattern** — use variant props, not conditional inline styles
3. **Composition over inheritance** — compose from small primitives
4. **Forward refs** — all interactive components forward refs
5. **TypeScript strict** — all props typed, no `any`
