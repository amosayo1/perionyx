# Color System

**Phase 22.0B — Canonical Palette**

Single source of truth. Every color in Perionyx derives from `src/design-system/edl/colors.ts`.

---

## Conflict Resolution (Phase 22.0B Audit)

| Location | Value | Status |
|---|---|---|
| `design-system/tokens/surfaces.ts` `background` | `#141414` | **OVERRIDDEN** → `#0a0a0f` |
| `design-system/tokens/surfaces.ts` `surface1` | `#232323` | **OVERRIDDEN** → `#111118` |
| `design-system/tokens/surfaces.ts` `surface2` | `#2a2a2a` | **OVERRIDDEN** → `#1a1a24` |
| `design-system/tokens/status.ts` gold | `#c9a84c` | **OVERRIDDEN** → `#d4af37` |
| `theme/defaults.ts` `--background` | `#040404` | **OVERRIDDEN** → `#0a0a0f` |

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `BRAND.gold` | `#d4af37` | Primary accent — metrics, active states, CTA |
| `BRAND.goldHover` | `#e5c04a` | Gold hover state |
| `BRAND.goldActive` | `#c7a961` | Gold press state |
| `BRAND.goldMuted` | `rgba(212,175,55,0.15)` | Gold backgrounds (badges, pills) |
| `BRAND.goldSubtle` | `rgba(212,175,55,0.08)` | Gold tinted surfaces |
| `BRAND.goldBorder` | `rgba(212,175,55,0.2)` | Gold borders (focus, selected) |

## Surface Colors

| Token | Hex | Usage |
|---|---|---|
| `SURFACES.base` | `#0a0a0f` | App background |
| `SURFACES.raised` | `#111118` | Cards, panels |
| `SURFACES.elevated` | `#1a1a24` | Dropdowns, hover |
| `SURFACES.floating` | `#222230` | Modals, dialogs |
| `SURFACES.overlay` | `rgba(0,0,0,0.6)` | Modal backdrop |
| `SURFACES.sidebar` | `#0a0a0f` | Sidebar |
| `SURFACES.header` | `#0a0a0f` | Topbar |

## Text Colors

| Token | Hex | Usage |
|---|---|---|
| `TEXT.primary` | `#f7f6f2` | Headings, values |
| `TEXT.secondary` | `#a1a1aa` | Body, labels |
| `TEXT.tertiary` | `#71717a` | Captions, placeholders |
| `TEXT.disabled` | `#52525b` | Disabled text |
| `TEXT.inverse` | `#0a0a0f` | Text on gold/light backgrounds |
| `TEXT.link` | `#5e9eff` | Links |

## Border Colors

| Token | Value | Usage |
|---|---|---|
| `BORDERS.default` | `rgba(255,255,255,0.08)` | Standard borders |
| `BORDERS.strong` | `rgba(255,255,255,0.12)` | Emphasized borders |
| `BORDERS.subtle` | `rgba(255,255,255,0.04)` | Dividers |
| `BORDERS.gold` | `rgba(212,175,55,0.2)` | Focus, selected |
| `BORDERS.focus` | `rgba(212,175,55,0.5)` | Focus ring |

## Status Colors

| Status | Text | Muted BG | Border |
|---|---|---|---|
| Success | `#22c55e` | `rgba(34,197,94,0.15)` | `rgba(34,197,94,0.3)` |
| Warning | `#f59e0b` | `rgba(245,158,11,0.15)` | `rgba(245,158,11,0.3)` |
| Error | `#ef4444` | `rgba(239,68,68,0.15)` | `rgba(239,68,68,0.3)` |
| Info | `#3b82f6` | `rgba(59,130,246,0.15)` | `rgba(59,130,246,0.3)` |
| Neutral | `#71717a` | `rgba(113,113,122,0.15)` | `rgba(113,113,122,0.2)` |
| Gold | `#d4af37` | `rgba(212,175,55,0.15)` | `rgba(212,175,55,0.2)` |

## Financial Colors

| Concept | Color | Token |
|---|---|---|
| Positive (gain) | `#22c55e` | `FINANCIAL.positive` |
| Negative (loss) | `#ef4444` | `FINANCIAL.negative` |
| Pending | `#f59e0b` | `FINANCIAL.pending` |
| Overdue | `#ef4444` | `FINANCIAL.overdue` |
| Current/Active | `#d4af37` | `FINANCIAL.current` |

## Chart Palette

8-color series for data visualization. Primary is always gold.

```
#d4af37  → Series 1 (gold)
#22c55e  → Series 2 (green)
#3b82f6  → Series 3 (blue)
#f59e0b  → Series 4 (amber)
#ef4444  → Series 5 (red)
#a855f7  → Series 6 (purple)
#06b6d4  → Series 7 (cyan)
#ec4899  → Series 8 (pink)
```

## Usage Rules

1. **Gold is sacred** — never use for backgrounds, borders, or decoration
2. **Status colors are semantic** — green means approved/success, red means rejected/error
3. **Surfaces progress logically** — base → raised → elevated → floating
4. **Text hierarchy is enforced** — primary for values, secondary for labels, tertiary for metadata
5. **All colors come from tokens** — no hardcoded hex values in components
