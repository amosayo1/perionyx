# Token Architecture

**Phase 22.0B — File Structure & Naming**

---

## File Structure

```
src/design-system/edl/
├── colors.ts        # 250 lines — brand, surfaces, text, borders, status, financial, risk, charts, AI, shadows, elevation
├── typography.ts    # 180 lines — font families, sizes, weights, line heights, tracking, numeric formatting
├── spacing.ts       # 120 lines — 4px base scale, semantic spacing, layout constants, Tailwind mappings
├── radius.ts        # 50 lines  — 8 radius values, semantic use, Tailwind mappings
├── motion.ts        # 140 lines — durations, easings, reduced-motion, composed variants, Framer-Motion ready
├── z-index.ts       # 30 lines  — 14 predictable stacking levels
├── icons.ts         # 150 lines — sizes, strokes, colors, feature icon map
├── components.ts    # 200 lines — pre-composed tokens for Button, Card, Input, Badge, Table, Dialog, Toast, Tooltip, Skeleton
└── index.ts         # 25 lines  — barrel export
```

## Naming Conventions

### Tokens
- **SCREAMING_SNAKE_CASE** for exported objects: `SURFACES`, `TEXT`, `BORDERS`
- **camelCase** for properties: `SURFACES.raised`, `TEXT.primary`
- **Semantic names** preferred: `SURFACES.raised` over `SURFACES.surface1`
- **Dot notation** for hierarchy: `STATUS.success.text`, `STATUS.success.muted`

### Files
- **kebab-case** for file names: `colors.ts`, `z-index.ts`
- **One concern per file** — colors, typography, spacing, etc.
- **Barrel export** in `index.ts`

### Imports
```typescript
// ✅ Correct — named imports from barrel
import { SURFACES, TEXT, BRAND } from "@/design-system/edl";

// ✅ Correct — direct file import (for tree-shaking)
import { SURFACES } from "@/design-system/edl/colors";

// ❌ Wrong — default imports
import tokens from "@/design-system/edl";

// ❌ Wrong — legacy locations
import { colors } from "@/design-system/tokens/colors";
```

## Token Hierarchy

```
EDL_COLORS (master object)
├── brand        → BRAND (gold, goldHover, goldMuted, etc.)
├── surface      → SURFACES (base, raised, elevated, floating, etc.)
├── text         → TEXT (primary, secondary, tertiary, etc.)
├── border       → BORDERS (default, strong, subtle, gold, etc.)
├── status       → STATUS (success, warning, error, info, neutral, gold)
│   └── *.text, *.bg, *.border, *.muted, *.subtle, *.dot
├── financial    → FINANCIAL (positive, negative, pending, etc.)
├── risk         → RISK (low, medium, high, critical)
├── charts       → CHARTS (primary, series, axis, grid, etc.)
├── ai           → AI (high, medium, low, processing)
├── shadow       → SHADOWS (soft, medium, large, floating, glow*)
└── elevation    → ELEVATION (base, raised, elevated, floating, hover, selected)
```

## Backward Compatibility

Legacy token files remain operational during migration:

| Legacy File | EDL Replacement | Status |
|---|---|---|
| `design-system/tokens/colors.ts` | `edl/colors.ts` | Deprecated |
| `design-system/tokens/surfaces.ts` | `edl/colors.ts` (SURFACES) | Deprecated |
| `design-system/tokens/status.ts` | `edl/colors.ts` (STATUS) | Deprecated |
| `design-system/tokens/typography.ts` | `edl/typography.ts` | Deprecated |
| `design-system/tokens/spacing.ts` | `edl/spacing.ts` | Deprecated |
| `design-system/tokens/radius.ts` | `edl/radius.ts` | Deprecated |
| `design-system/tokens/animation.ts` | `edl/motion.ts` | Deprecated |
| `design-system/tokens/shadows.ts` | `edl/colors.ts` (SHADOWS) | Deprecated |
| `enterprise/motion/tokens.ts` | `edl/motion.ts` | Deprecated |

## Adding New Tokens

1. Identify the correct file (colors, typography, spacing, etc.)
2. Add the token following naming conventions
3. Export from the file
4. Add to barrel export in `index.ts`
5. Update this document
6. Update the relevant system doc (COLOR_SYSTEM, TYPOGRAPHY_SYSTEM, etc.)
