# Iconography

**Phase 22.0B — Lucide Icons**

---

## Library

**Lucide React** — the only icon library in Perionyx. No custom SVGs in component code.

## Sizes

| Token | Pixels | Usage |
|---|---|---|
| `ICON_SIZE.xs` | 16px | Badges, tags, tight spaces |
| `ICON_SIZE.sm` | 20px | **Default** — buttons, inputs, nav items |
| `ICON_SIZE.md` | 24px | Standalone icons, section headers |
| `ICON_SIZE.lg` | 32px | Feature tiles, dashboard cards |
| `ICON_SIZE.xl` | 48px | Onboarding, empty states |

## Stroke Width

| Token | Value | Usage |
|---|---|---|
| `ICON_STROKE.thin` | 1 | Decorative only |
| `ICON_STROKE.default` | 1.5 | All interactive icons |
| `ICON_STROKE.bold` | 2 | Emphasis, key indicators |

## Colors

Icons inherit their parent's `color` property by default. Explicit color overrides:

| Token | Color | Usage |
|---|---|---|
| `ICON_COLOR.default` | `currentColor` | Inherit |
| `ICON_COLOR.gold` | `#d4af37` | Primary metric icons |
| `ICON_COLOR.success` | `#22c55e` | Success indicators |
| `ICON_COLOR.warning` | `#f59e0b` | Warning indicators |
| `ICON_COLOR.error` | `#ef4444` | Error indicators |
| `ICON_COLOR.info` | `#3b82f6` | Informational |
| `ICON_COLOR.muted` | `#71717a` | Secondary icons |

## Feature Icon Map

Primary icons for navigation, feature tiles, and dashboards (from `FEATURE_ICONS`):

| Category | Icons |
|---|---|
| Core | LayoutDashboard, BarChart3, Settings, Users, Building2 |
| Financial | BookOpen, ArrowLeftRight, Wallet, FileText, CreditCard, Landmark |
| Workflow | CheckCircle, GitBranch, Zap, Clock, LayoutTemplate |
| AI | Brain, Sparkles, Lightbulb |
| Operations | Plug, Heart, Activity, Bell |
| Governance | Shield, ScrollText, BookMarked, AlertTriangle |
| AP/Procurement | Truck, ShoppingCart, RefreshCw, Scale |
| System | Server, Database, Rocket |

## Rules

1. **Lucide only** — no custom SVGs, no other icon libraries
2. **20px default** — unless there's a specific reason for another size
3. **1.5 stroke** — unless emphasizing or decorating
4. **Accessibility** — all interactive icons require `aria-label`
5. **No icon-only buttons** — every icon button must have a label (visible or `aria-label`)
