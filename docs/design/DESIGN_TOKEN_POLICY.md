# Design Token Policy

**Phase**: 22.0B.5 — Enterprise Design Governance

## Policy

All visual design decisions in the Perionyx codebase MUST use EDL tokens. No exceptions.

## Rule 1: Colors

All colors must come from `@/design-system/edl/colors.ts` or EDL Tailwind utilities.

### Allowed Hex Values (Direct Use)

| Hex | Use |
|---|---|
| `#d4af37`, `#e5c04a`, `#c7a961` | Gold accent (primary, hover, muted) |
| `#0a0a0f` | Base background |
| `#111118` | Raised surface |
| `#1a1a24` | Overlay surface |
| `#222230` | Drawer surface |
| `#f7f6f2` | Text primary |
| `#a1a1aa`, `#71717a`, `#52525b` | Text secondary/muted/placeholder |
| `#22c55e`, `#f59e0b`, `#ef4444`, `#3b82f6` | Status colors |

### Forbidden

- Any other hex value → use EDL tokens
- `#c9a84c` → use `#d4af37`
- `#d4a843` → use `#d4af37`
- `#101010` → use `#0a0a0f` or `#111118`
- `#1a1a1a` → use `#1a1a24`
- `#1a1a2e` → use `#1a1a24`

## Rule 2: Spacing

All spacing must use EDL spacing tokens or Tailwind utilities.

| Value | Token |
|---|---|
| 4px | `s-1` / `p-1` / `m-1` |
| 8px | `s-2` / `p-2` / `m-2` |
| 12px | `s-3` / `p-3` / `m-3` |
| 16px | `s-4` / `p-4` / `m-4` |
| 24px | `s-6` / `p-6` / `m-6` |
| 32px | `s-8` / `p-8` / `m-8` |
| 48px | `s-12` |
| 64px | `s-16` |
| 96px | `s-24` |

## Rule 3: Typography

All text must use EDL typography tokens or Tailwind utilities.

| Token | Tailwind |
|---|---|
| `text-caption` | `text-xs` |
| `text-body-sm` | `text-sm` |
| `text-body` | `text-base` |
| `text-body-lg` | `text-lg` |
| `text-heading-4` | `text-xl` |
| `text-heading-3` | `text-2xl` |
| `text-heading-2` | `text-3xl` |
| `text-heading-1` | `text-4xl` |
| `text-display` | `text-5xl` |

## Rule 4: Shadows

All shadows must use EDL shadow tokens.

| Token | Use |
|---|---|
| `shadow-elevated` | Cards, dropdowns |
| `shadow-elevatedHigh` | Modals, dialogs |
| `shadow-glow-gold` | Active states, gold highlights |
| `shadow-glow-success` | Success indicators |
| `shadow-glow-error` | Error indicators |

## Rule 5: Z-Index

All z-index values must use EDL z-index tokens.

| Level | Value | Use |
|---|---|---|
| `z-base` | 0 | Default |
| `z-raised` | 1 | Elevated content |
| `z-dropdown` | 10 | Dropdowns, popovers |
| `z-sticky` | 20 | Sticky headers |
| `z-overlay` | 30 | Backdrop overlays |
| `z-modal` | 40 | Modal dialogs |
| `z-toast` | 50 | Toast notifications |
| `z-tooltip` | 60 | Tooltips |

## Rule 6: Border Radius

All border-radius must use EDL radius tokens.

| Token | Value |
|---|---|
| `radius-none` | 0 |
| `radius-sm` | 4px |
| `radius-md` | 6px |
| `radius-lg` | 8px |
| `radius-xl` | 12px |
| `radius-2xl` | 16px |
| `radius-3xl` | 24px |
| `radius-full` | 9999px |

## Rule 7: Motion

All animation durations and easings must use EDL motion tokens.

| Token | Value |
|---|---|
| `d-fastest` | 100ms |
| `d-fast` | 200ms |
| `d-normal` | 300ms |
| `d-slow` | 400ms |
| `d-slowest` | 600ms |
| `e-standard` | cubic-bezier(0.2, 0, 0, 1) |
| `e-decelerate` | cubic-bezier(0, 0, 0, 1) |
| `e-accelerate` | cubic-bezier(0.3, 0, 1, 1) |
| `e-spring` | spring(400, 40, 0.85) |

## Enforcement

This policy is enforced through:
1. ESLint rules (automated, blocks merge)
2. CI pipeline (automated, blocks deploy)
3. VS Code diagnostics (real-time feedback)
4. Design review checklist (manual, quarterly)

## Exceptions

Only these paths are exempt:
- EDL token definitions (`src/design-system/edl/`)
- Tailwind configuration (`tailwind.config.cjs`)
- CSS custom properties (`src/app/globals.css`)
- Governance tooling itself (`tools/design-governance/`)
