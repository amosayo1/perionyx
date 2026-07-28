# Enterprise Design Language (EDL)

**Phase 22.0B — Canonical Visual Operating System**

The EDL is not a component library. Not a homepage. Not a style guide. It is the visual infrastructure — the tokenized foundation that every pixel in Perionyx consumes.

---

## What Is the EDL

The EDL defines **one truth** for every visual decision in Perionyx:

- **One background palette** — 4 surfaces (base → raised → elevated → floating), not 4 conflicting sets
- **One gold** — `#d4af37`, not 3 variants
- **One typography scale** — Inter + JetBrains Mono, 14 sizes, not 6 font stacks
- **One spacing system** — 4px base unit, semantic names, not 3 parallel definitions
- **One motion system** — durations, easings, variants — no spring physics
- **One z-index scale** — predictable stacking, no `z-[9999]` surprises
- **One radius scale** — 3 levels, applied consistently
- **One shadow system** — 6 levels, gold glows for active states

## What the EDL Is NOT

- **Not a component library** — Components consume EDL tokens; EDL does not render UI
- **Not a framework** — No new dependencies. Tokens are plain TypeScript objects
- **Not a design tool export** — Tokens are authored in code, not Figma
- **Not optional** — Every new component, page, or animation MUST consume these tokens

## Token Architecture

```
src/design-system/edl/
├── colors.ts        # Brand, surfaces, text, borders, status, financial, risk, charts, AI, shadows, elevation
├── typography.ts    # Font families, sizes, weights, line heights, tracking, numeric formatting
├── spacing.ts       # 4px base scale, semantic spacing, layout tokens, Tailwind mappings
├── radius.ts        # 8 radius values, semantic radius use, Tailwind mappings
├── motion.ts        # Durations, easings, reduced-motion, composed variants, Framer-Motion ready
├── z-index.ts       # 14 predictable stacking levels
├── icons.ts         # Icon sizes, strokes, colors, feature icon map
├── components.ts    # Pre-composed tokens for Button, Card, Input, Badge, Table, Dialog, Toast, Tooltip, Skeleton
└── index.ts         # Barrel export — single import point
```

## Import Pattern

```typescript
// ✅ Correct — import from EDL
import { BRAND, SURFACES, STATUS } from "@/design-system/edl";

// ❌ Wrong — import from legacy locations
import { colors } from "@/design-system/tokens/colors";
import { surfaces } from "@/design-system/tokens/surfaces";
import { status } from "@/design-system/tokens/status";
```

## Migration Strategy

Existing code continues to work. EDL tokens are additive — they define the canonical values. Legacy token files are deprecated but not deleted. Migration is incremental:

1. New components MUST import from `@/design-system/edl`
2. Existing components migrate during routine maintenance
3. Legacy token files are deleted once zero consumers remain

## Related Documents

- [Design Principles](./DESIGN_PRINCIPLES.md) — 8 governing principles
- [Visual Identity](./VISUAL_IDENTITY.md) — Brand DNA, color rationale, typography rationale
- [Color System](./COLOR_SYSTEM.md) — Complete color palette with usage rules
- [Typography System](./TYPOGRAPHY_SYSTEM.md) — Type scale, font stack, usage
- [Spacing System](./SPACING_SYSTEM.md) — 4px base, semantic spacing
- [Motion System](./MOTION_SYSTEM.md) — Durations, easings, variants, reduced-motion
- [Iconography](./ICONOGRAPHY.md) — Lucide icons, sizes, feature map
- [Component Principles](./COMPONENT_PRINCIPLES.md) — How components consume tokens
- [Token Architecture](./TOKEN_ARCHITECTURE.md) — Token file structure, naming, export patterns
- [EDP_22_0B](./EDP_22_0B.md) — Engineering Decision Packet
