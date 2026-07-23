# Perionyx Public Website — Iconography Guide

> **Status**: v1.0
> **Scope**: Icon system, sizing, color, animation, and product icon specifications
> **Primary set**: Lucide React (consistent with product)
> **Principle**: Icons communicate meaning faster than words. Every icon must have a clear purpose.

---

## 1. Icon Library

### 1.1 Primary Set: Lucide React

```tsx
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
```

**Why Lucide:** Already used throughout the Perionyx product. Consistent stroke-based style. 1400+ icons. Well-maintained. MIT licensed.

### 1.2 Custom Icons

For product-specific concepts not covered by Lucide, create custom SVG icons following the same stroke-based style:

| Custom Icon | Concept | Description |
|---|---|---|
| `PerionyxLogo` | Brand mark | "P" monogram |
| `WorkflowEngine` | Workflow system | Connected nodes |
| `DecisionEngine` | Decision AI | Branching paths |
| `FinancialLedger` | General ledger | Book with lines |
| `ApprovalChain` | Approval routing | Checkmarks in chain |
| `EvidenceEngine` | AI evidence | Document with magnifier |
| `RiskMatrix` | Risk management | Shield with grid |
| `ComplianceCheck` | Compliance | Clipboard with check |
| `AuditTrail` | Audit logging | Chain links |
| `TreasuryFlow` | Treasury management | Arrows flowing |
| `APAutomation` | Accounts payable | Invoice with check |
| `ARCollection` | Accounts receivable | Envelope with arrow |

---

## 2. Size System

| Size | Dimensions | Stroke Width | Usage |
|---|---|---|---|
| `xs` | 12x12px | 1.5px | Inline badges, metadata labels |
| `sm` | 16x16px | 1.5px | Inline text, list items |
| `md` | 20x20px | 1.5px | Buttons, nav items, form elements |
| `lg` | 24x24px | 1.5px | Navigation headers, card headers |
| `xl` | 32x32px | 1.5px | Feature section icons |
| `2xl` | 40x40px | 1.5px | Hero icons (rare) |
| `3xl` | 48x48px | 2px | Hero feature icons (rare) |

**Usage mapping:**

```tsx
<ArrowRight className="h-4 w-4" />        // sm — 16px, inline with text
<ArrowRight className="h-5 w-5" />        // md — 20px, in buttons
<Bot className="h-6 w-6" />               // lg — 24px, in navigation
<Shield className="h-8 w-8" />            // xl — 32px, in feature cards
<Workflow className="h-10 w-10" />        // 2xl — 40px, in hero sections
<Zap className="h-12 w-12" />             // 3xl — 48px, hero feature icons
```

---

## 3. Color Rules

### 3.1 Default Colors

| Context | Color | Class |
|---|---|---|
| Default | `#a1a1aa` (zinc-400) | `text-zinc-400` |
| On hover | `#e4e4e7` (zinc-200) | `group-hover:text-zinc-200` |
| Active/selected | `#d4af37` (gold) | `text-[#d4af37]` |
| In CTA context | `#d4af37` (gold) | `text-[#d4af37]` |
| Disabled | `#52525b` (zinc-600) | `text-zinc-600` |

### 3.2 Icon in Container

```tsx
// Gold container (primary actions, metrics)
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4af37]/10">
  <Icon className="h-5 w-5 text-[#d4af37]" />
</div>

// Zinc container (secondary features)
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50">
  <Icon className="h-5 w-5 text-zinc-400" />
</div>

// Status containers
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
</div>
```

### 3.3 Color Rules

| Rule | Specification |
|---|---|
| Icons on dark backgrounds | zinc-400 default, zinc-200 hover |
| Icons in gold containers | Gold-500 (text-[#d4af37]) |
| Status icons | Follow semantic color mapping (emerald/red/amber/blue) |
| Gold icons | Only in gold containers, CTA contexts, or active states |
| Never | Gold icons on dark backgrounds without a container |

---

## 4. Stroke Width

| Size | Stroke Width | Rationale |
|---|---|---|
| xs through lg (12-24px) | 1.5px | Standard Lucide default, crisp at small sizes |
| xl through 2xl (32-40px) | 1.5px | Still clean, consistent |
| 3xl (48px) | 2px | Slightly bolder for hero emphasis |

**Never change stroke width arbitrarily.** The defaults are tested for clarity at each size.

---

## 5. Product Domain Icons

Each product domain has a primary icon used consistently across all pages:

| Domain | Icon | Source | Usage |
|---|---|---|---|
| Accounts Payable | `FileText` + checkmark | Lucide composite | AP product page |
| Accounts Receivable | `Mail` + arrow | Lucide composite | AR product page |
| Treasury | `Banknote` | Lucide | Treasury page |
| Approvals | `CheckCircle2` | Lucide | Approvals page |
| Risk | `Shield` | Lucide | Risk page |
| Compliance | `ClipboardCheck` | Lucide | Compliance page |
| Reconciliation | `GitMerge` | Lucide | Reconciliation page |
| Audit | `ScrollText` | Lucide | Audit page |
| Executive Intelligence | `Brain` | Lucide | Executive page |
| AI Copilot | `Bot` | Lucide | AI pages |
| Workflow Engine | Custom: Connected nodes | Custom SVG | Platform pages |
| General Ledger | `BookOpen` | Lucide | GL page |
| Cash Management | `Wallet` | Lucide | Cash page |
| Reporting | `BarChart3` | Lucide | Reporting page |

**Usage rules:**
- Always use the same icon for a domain across all pages
- Domain icons appear in product cards, nav, breadcrumbs, and feature sections
- Domain icons use gold containers on product pages
- Domain icons use zinc containers on non-product pages

---

## 6. Section Icons

Top-level navigation sections each have a primary icon:

| Section | Icon | Source |
|---|---|---|
| Product | `Layers` | Lucide |
| Platform | `Server` | Lucide |
| Security | `Shield` | Lucide |
| AI | `Brain` | Lucide |
| Engineering | `Code2` | Lucide |
| Research | `BookOpen` | Lucide |
| Company | `Building2` | Lucide |

---

## 7. Social Icons

| Platform | Icon | Source | Size |
|---|---|---|---|
| GitHub | `Github` | Lucide | 20px |
| LinkedIn | `Linkedin` | Lucide | 20px |
| Twitter/X | `Twitter` | Lucide | 20px |
| Discord | Custom `Discord` | Custom SVG | 20px |
| Email | `Mail` | Lucide | 20px |
| RSS | `Rss` | Lucide | 20px |

**Social icon style:**
```tsx
<a href="..." className="text-zinc-600 hover:text-zinc-400 transition-colors">
  <Icon className="h-5 w-5" />
</a>
```

---

## 8. Icon + Text Alignment

### 8.1 Inline with Text

```tsx
<span className="flex items-center gap-2">
  <Icon className="h-4 w-4 shrink-0" />
  <span className="text-sm">Label text</span>
</span>
```

| Pattern | Alignment | Usage |
|---|---|---|
| `items-center` | Vertical center | Default for most icon+text pairs |
| `items-start` | Top-aligned | Long text with icon |
| `items-baseline` | Baseline-aligned | Inline code annotations (rare) |

### 8.2 In Buttons

```tsx
// Always gap-2, always centered
<Button>
  <Icon className="h-5 w-5" />
  Button text
</Button>
```

### 8.3 In Navigation

```tsx
// Always gap-3, items-center
<Link className="flex items-center gap-3 px-4 py-2.5">
  <Icon className="h-5 w-5 text-zinc-400" />
  <span className="text-sm text-zinc-400">Navigation item</span>
</Link>
```

### 8.4 In Cards

```tsx
// Icon in container, above title
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4af37]/10 mb-4">
  <Icon className="h-5 w-5 text-[#d4af37]" />
</div>
<h3 className="text-lg font-semibold text-white">Card title</h3>
```

### 8.5 Alignment Rules

| Context | Vertical Align | Gap | Icon Size |
|---|---|---|---|
| Inline text | center | `gap-2` (8px) | 16px |
| Navigation | center | `gap-3` (12px) | 20px |
| Buttons | center | `gap-2` (8px) | 20px |
| Cards (header) | start | stacked | 32-40px |
| Feature rows | center | `gap-4` (16px) | 24-32px |
| Metric cards | center | `gap-3` (12px) | 20px |
| Breadcrumbs | center | `gap-1.5` (6px) | 14px (ChevronRight) |

---

## 9. Icon Animation

### 9.1 Scroll Reveal

Icons can animate on scroll reveal:

```tsx
// Fade in (standard)
<motion.div
  initial={{ opacity: 0, y: 8 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
>
  <Icon className="h-8 w-8 text-[#d4af37]" />
</motion.div>
```

| Animation | Duration | When to Use |
|---|---|---|
| Fade in | 400ms | Standard icon appearance |
| Scale in | 300ms | Icon containers appearing |
| Slide in | 400ms | Directional reveals |

### 9.2 Hover Animation

```tsx
// Subtle scale on container hover
<motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
  <Icon className="h-8 w-8" />
</motion.div>
```

### 9.3 Continuous Animation

**Rule: No continuous animation on icons.** Icons animate on scroll reveal or hover, never loop. The only exception is the status pulse dot (`PulseDot` component) which communicates live state.

### 9.4 Animation Rules

| Rule | Specification |
|---|---|
| Never animate continuously | Scroll reveal or hover only |
| Respect reduced motion | Disable all icon animation |
| GPU only | Use transform + opacity |
| Maximum duration | 800ms for any icon animation |
| Trigger | Scroll into viewport or hover |

---

## 10. Icon Accessibility

| Rule | Specification |
|---|---|
| Decorative icons | `aria-hidden="true"`, no alt text |
| Interactive icons (alone) | `aria-label` on the button/link |
| Informative icons | `aria-label` or visually hidden text |
| Status icons | Conveyed via color + text, not icon alone |

```tsx
// Decorative (next to text)
<Icon className="h-4 w-4" aria-hidden="true" />

// Interactive (icon-only button)
<button aria-label="Copy code">
  <Copy className="h-4 w-4" />
</button>

// Informative (status)
<span role="status">
  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
  <span className="sr-only">Completed</span>
</span>
```

---

## 11. Icon Checklist

Before using any icon:

- [ ] Is it Lucide or follows the custom icon spec?
- [ ] Is the size correct for the context?
- [ ] Is the color correct (zinc-400 default, gold for containers/active)?
- [ ] Is the stroke width correct (1.5px standard, 2px for 48px)?
- [ ] Does it use `aria-hidden="true"` if decorative?
- [ ] Does it have `aria-label` if interactive and alone?
- [ ] Is the icon consistent with the domain icon mapping?
- [ ] Is animation reduced-motion safe?
- [ ] Does it use `shrink-0` when inline with wrapping text?
