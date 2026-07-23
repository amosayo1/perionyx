# Perionyx Public Website — Visual Direction

> **Status**: v1.0
> **Scope**: Hero concepts, section treatments, scroll behaviors, visual content strategy
> **Principle**: Every visual element earns its place. If it doesn't inform, it doesn't exist.

---

## 1. Hero Concepts

### 1.1 Option A — Bold Statement + Metric

**Concept**: One powerful headline, one supporting metric, two CTAs. Maximum impact, minimum noise.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    [overline badge]                       │
│                                                          │
│          Financial intelligence                          │
│            that earns trust.                             │
│                                                          │
│    [14px subtext — outcome-focused, 2 lines max]         │
│                                                          │
│         [ Book a Demo ]   [ See the platform ]           │
│                                                          │
│    ─────────────────────────────────────────────────     │
│    $2.4B+ processed   │  32ms p99   │  99.99% uptime    │
│    ─────────────────────────────────────────────────     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Exact specifications:**
- Headline: `text-5xl md:text-6xl font-bold tracking-tight text-white`, centered, `max-w-4xl mx-auto`
- Subtext: `text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mt-6`
- CTAs: Gold primary + secondary outline, `gap-4`
- Metric strip: `flex justify-center gap-8 md:gap-16 mt-12 pt-8 border-t border-white/[0.06]`
- Metric values: `text-2xl font-bold text-white tabular-nums`
- Metric labels: `text-xs text-zinc-500 uppercase tracking-[0.15em]`
- Background: Standard PEDL atmospheric gradient
- Vertical centering: `min-h-[85vh] flex flex-col items-center justify-center`

**When to use:** Homepage, product overview pages.

### 1.2 Option B — Animated Diagram + Tagline

**Concept**: Interactive architecture diagram or workflow animation with a concise tagline.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│         [overline badge]                                 │
│                                                          │
│     One platform. Complete financial                     │
│         intelligence.                                    │
│                                                          │
│    ┌──────────────────────────────────────────────┐      │
│    │                                              │      │
│    │     [Animated SVG diagram]                   │      │
│    │     Nodes appear on scroll                   │      │
│    │     Connections draw in                       │      │
│    │     Data flows animate                        │      │
│    │                                              │      │
│    └──────────────────────────────────────────────┘      │
│                                                          │
│         [ Explore the platform ]                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Exact specifications:**
- Headline: `text-4xl md:text-5xl font-bold tracking-tight text-white`
- Diagram container: `relative w-full max-w-5xl mx-auto mt-12 rounded-xl border border-white/[0.06] bg-zinc-950 p-8`
- Diagram: SVG, `viewBox="0 0 800 400"`, `width="100%"`
- Node style: `rounded-lg fill-[#121212] stroke-zinc-700 stroke-1`, text `Inter 13px zinc-300`
- Connection style: `stroke-zinc-600 stroke-1.5`, arrow markers in `zinc-500`
- Animation: Nodes fade-in stagger (80ms delay), connections draw via `pathLength` (800ms ease-in-out)
- Gold highlight on central node or active path
- CTA below diagram: `mt-8`

**When to use:** Platform overview, architecture pages, workflow engine.

### 1.3 Option C — Minimal + Code

**Concept**: Technical audience. Headline + code example showing real precision.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│         [overline badge: "Engineering"]                  │
│                                                          │
│     Financial precision is not                           │
│         negotiable.                                      │
│                                                          │
│    ┌──────────────────────────────────────────────┐      │
│    │  precision.ts                    [Copy]       │      │
│    ├──────────────────────────────────────────────┤      │
│    │  1  const a = new Decimal('0.1');            │      │
│    │  2  const b = new Decimal('0.2');            │      │
│    │  3  // 0.1 + 0.2 ≠ 0.3 in Float             │      │
│    │  4  // 0.1 + 0.2 = 0.3 in Decimal           │      │
│    │  5  expect(a.plus(b)).toEqual('0.3');        │      │
│    └──────────────────────────────────────────────┘      │
│                                                          │
│    Decimal(38,12) precision. Banker's rounding.          │
│    No phantom cents. No accumulation drift.              │
│                                                          │
│         [ Read the engineering blog ]                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Exact specifications:**
- Headline: `text-4xl md:text-5xl font-bold tracking-tight text-white`
- Code block: Full-width, `bg-zinc-950 border border-white/[0.06] rounded-xl`, max-w-3xl
- Code font: `JetBrains Mono text-sm`, line numbers in `zinc-600`
- Supporting text below code: `text-base text-zinc-400 mt-6`
- No metrics strip (code IS the proof)

**When to use:** Engineering blog index, platform/ledger page, financial precision page.

---

## 2. Section Treatments

### 2.1 Card Grid

**Structure**: 2-3 equal cards in a grid.

```
Section header (centered)
Subtitle (centered, zinc-400)

┌─────────┐  ┌─────────┐  ┌─────────┐
│  Icon   │  │  Icon   │  │  Icon   │
│  Title  │  │  Title  │  │  Title  │
│  Desc   │  │  Desc   │  │  Desc   │
│  Link → │  │  Link → │  │  Link → │
└─────────┘  └─────────┘  └─────────┘
```

**Specs:**
- Grid: `grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`
- Card: PEDL card standard (`rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40 p-6 lg:p-8`)
- Icon: `h-10 w-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center mb-4`, icon in `text-[#d4af37] h-5 w-5`
- Title: `text-lg font-semibold text-white mb-2`
- Description: `text-sm text-zinc-400 leading-relaxed mb-4`
- Link: `text-sm text-[#d4af37] hover:text-[#c7a961] transition-colors`
- Entrance: Stagger fade-in-up (80ms delay per card)

**When to use:** Product overview features, platform capabilities, trust signals.

### 2.2 Alternating Left-Right

**Structure**: Text on one side, visual on the other. Alternates per section.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌─────────────────┐  ┌──────────────────────────────┐   │
│  │                 │  │                              │   │
│  │  Overline       │  │  [Diagram / Screenshot /    │   │
│  │  Headline       │  │   Code block]               │   │
│  │  Description    │  │                              │   │
│  │  Bullet list    │  │                              │   │
│  │  CTA →          │  │                              │   │
│  │                 │  │                              │   │
│  └─────────────────┘  └──────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────┐  ┌─────────────────┐   │
│  │                              │  │                 │   │
│  │  [Visual]                   │  │  Overline       │   │
│  │                              │  │  Headline       │   │
│  │                              │  │  Description    │   │
│  │                              │  │  Bullet list    │   │
│  │                              │  │  CTA →          │   │
│  └──────────────────────────────┘  └─────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Container: `max-w-7xl mx-auto px-6 lg:px-8`
- Row: `grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center`
- Text side: `max-w-lg`
- Visual side: `relative rounded-xl border border-white/[0.06] overflow-hidden bg-zinc-950`
- Section vertical padding: `py-24 md:py-32`
- Visual options: Screenshot with dark frame, SVG diagram, code block

**When to use:** Product detail pages (feature showcases), platform deep-dives.

### 2.3 Full-Bleed Diagram

**Structure**: Section-wide diagram or visual, full-width.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Section header (centered)                               │
│  Subtitle (centered)                                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │              [Full-width diagram]                │    │
│  │              SVG, animated on scroll              │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Container: `max-w-7xl mx-auto px-6 lg:px-8`
- Diagram: `w-full rounded-xl border border-white/[0.06] bg-zinc-950 p-8 lg:p-12`
- Max diagram width: 1200px
- Animation: Scroll-triggered, staggered node appearance

**When to use:** Architecture overviews, workflow visualizations, data flow diagrams.

---

## 3. Comparison Sections

### 3.1 Before/After

**Structure**: Side-by-side showing old way vs. Perionyx way.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │   BEFORE             │  │   PERIONYX          │       │
│  │                      │  │                      │       │
│  │  ❌ Manual entry     │  │  ✅ Auto-capture     │       │
│  │  ❌ Email approvals  │  │  ✅ Smart routing    │       │
│  │  ❌ Spreadsheet      │  │  ✅ Real-time ledger │       │
│  │  ❌ Month-end panic  │  │  ✅ Continuous close │       │
│  └─────────────────────┘  └─────────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Grid: `grid grid-cols-1 gap-6 lg:grid-cols-2`
- Left card: `border-zinc-700/50 bg-zinc-900/30` (dull, muted)
- Right card: `border-[#d4af37]/20 bg-[#d4af37]/5` (gold-tinted, alive)
- Headers: `text-xs uppercase tracking-[0.15em] font-semibold`
  - Before: `text-zinc-500`
  - After: `text-[#d4af37]`
- List items: `flex items-start gap-3 text-sm`
  - Before: `text-zinc-400` with `XCircle` in `text-zinc-500`
  - After: `text-zinc-200` with `CheckCircle2` in `text-[#d4af37]`

**Rules:**
- Never name competitors. "Before" = "Traditional approach"
- Show outcomes, not just features
- Maximum 6 items per side
- Items should correspond (row 1: old vs. new version of same thing)

### 3.2 Feature Matrix

**Structure**: Table with capabilities and checkmarks.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  │ Capability              │ Traditional │ Perionyx    │ │
│  │─────────────────────────│─────────────│─────────────│ │
│  │ Three-way matching      │ Manual      │ Automatic   │ │
│  │ Multi-currency          │ Limited     │ 34 currencies│ │
│  │ Approval routing        │ Sequential  │ Smart       │ │
│  │ Audit trail             │ Partial     │ Complete    │ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Table wrapper: PEDL table standard
- Perionyx column: Gold-tinted header (`bg-[#d4af37]/5`)
- Checkmarks: `CheckCircle2` in `text-[#d4af37]`
- Traditional column: `text-zinc-500`
- Perionyx column values: `text-zinc-200`

### 3.3 Competitor Comparison

**Approach**: We do NOT do head-to-head competitor comparisons on the public site. If comparison is needed, it's implicit through capability descriptions. The brand voice rule: "We show what we do, not what others don't."

---

## 4. Data Sections

### 4.1 Metric Counters

**Structure**: Animated numbers that count up when scrolled into view.

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  $2.4B+ │  │  32ms   │  │  99.99% │  │  12     │
│ processed│  │  p99    │  │ uptime  │  │ domains │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

**Specs:**
- Value: `text-4xl md:text-5xl font-bold text-[#d4af37] tabular-nums`
- Label: `text-xs text-zinc-500 uppercase tracking-[0.15em] mt-2`
- Alignment: Center
- Grid: `grid grid-cols-2 gap-8 md:grid-cols-4`
- Animation: Count from 0 to final value, 1200ms, ease-out cubic
- Trigger: `whileInView`, `viewport={{ once: true, amount: 0.5 }}`

### 4.2 Live Dashboard Preview

**Structure**: Embedded screenshot or interactive demo of the product.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │    │
│  │                                              │  │    │
│  │         [Product screenshot or demo]         │  │    │
│  │         Dark frame, 8px radius               │  │    │
│  │         Subtle shadow                        │  │    │
│  │                                              │  │    │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │    │
│                                                          │
│  Caption: "The Perionyx executive dashboard"             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Container: `relative rounded-xl border border-white/[0.06] overflow-hidden`
- Shadow: `shadow-2xl shadow-black/40`
- Max width: `max-w-5xl mx-auto`
- Image: `w-full h-auto`
- Caption: `text-xs text-zinc-500 text-center mt-4`
- Entrance: Fade-in-up on scroll

---

## 5. Testimonial Sections

### 5.1 Quote Card

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  "Perionyx replaced three tools and one spreadsheet     │
│   our team used to manage AP. The matching engine        │
│   alone saved us 12 hours per week."                     │
│                                                          │
│   ─────────────────────────────                          │
│   Sarah Chen                                              │
│   VP of Finance, Meridian Capital                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Quote: `text-lg italic text-zinc-300 leading-relaxed`
- Attribution: `text-sm text-zinc-500 mt-4`
- Name: `text-sm font-semibold text-zinc-300`
- Border: `border-l-2 border-[#d4af37] pl-6`
- Container: `max-w-2xl mx-auto`

### 5.2 Logo Grid

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Trusted by finance teams at                             │
│                                                          │
│  [Logo1]  [Logo2]  [Logo3]  [Logo4]  [Logo5]  [Logo6]  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Text: `text-sm text-zinc-500 text-center mb-8`
- Logos: `h-8 md:h-10` height, proportional width
- Treatment: `grayscale opacity-60 hover:opacity-100 transition-opacity`
- Grid: `flex flex-wrap justify-center items-center gap-8 md:gap-12`
- Maximum 6 logos per row

---

## 6. CTA Sections

### 6.1 Full-Width Gold-Tinted

```
┌──────────────────────────────────────────────────────────┐
│  [subtle gold gradient background]                        │
│                                                          │
│         Ready to transform your                          │
│           financial operations?                          │
│                                                          │
│    [description text, max-w-xl, centered]                │
│                                                          │
│         [ Book a Demo ]   [ Contact Sales ]              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Background: `relative` with `absolute inset-0 bg-gradient-to-b from-[#d4af37]/5 to-transparent`
- Headline: `text-3xl md:text-4xl font-bold tracking-tight text-white`
- Description: `text-lg text-zinc-400 max-w-xl mx-auto mt-4`
- CTAs: `flex items-center justify-center gap-4 mt-8`
- Padding: `py-24 md:py-32`

### 6.2 Inline Text CTA

Used within prose content:

```markdown
Want to see how this works in practice? [Book a demo →](/contact)
```

**Specs:** `text-[#d4af37] underline underline-offset-2 hover:text-[#c7a961]`

### 6.3 Floating Bottom Bar

**NOT used.** No pop-ups, no sticky bars, no exit-intent modals. CTAs are always in the flow.

---

## 7. Scroll Behaviors

### 7.1 Parallax Rules

**Rule: No parallax scrolling.** Parallax causes motion sickness, breaks accessibility, and adds no informational value.

Instead, use:

| Behavior | Implementation |
|---|---|
| Reveal on scroll | Elements fade-in + translate up (400ms) when entering viewport |
| Stagger reveals | Grid items appear sequentially (80ms delay per item) |
| Diagram drawing | SVG path `pathLength` animates from 0 to 1 on scroll |
| Counter count-up | Numbers count from 0 to final value on scroll |
| Section transitions | Subtle cross-fade between sections (no parallax) |

### 7.2 Reveal on Scroll

```tsx
// Every section, card, and visual element uses this pattern:
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
>
  {/* content */}
</motion.div>
```

**Rules:**
- `viewport={{ once: true }}` — animate only on first appearance
- `amount: 0.2` — trigger when 20% of element is visible
- Staggered children: `delay: index * 0.08`
- Never animate the same element twice

### 7.3 Section Transitions

Sections use consistent spacing rather than visual transitions:

| Between Sections | Treatment |
|---|---|
| Same background | `space-y-0` (spacing only) |
| Different background | Gradient overlap or hard edge |
| Major section change | Full-width divider (`border-t border-white/[0.06]`) |

---

## 8. Image Treatment

### 8.1 Screenshots

| Property | Value |
|---|---|
| Frame | `rounded-xl border border-white/[0.06]` |
| Shadow | `shadow-2xl shadow-black/40` |
| Background | Matches product dark background |
| Max width | `max-w-5xl` (full page) or `max-w-3xl` (feature) |
| Caption | `text-xs text-zinc-500 text-center mt-4` |
| Retina | 2x resolution, `srcSet` for responsive |

### 8.2 Diagrams

See `ILLUSTRATION_GUIDE.md` for full specification. Key rules:
- SVG, inline or React component
- Animated on scroll (path drawing, node staggering)
- Zinc palette with gold highlights for emphasis

### 8.3 Abstract Patterns

| Pattern | Usage | Rules |
|---|---|---|
| Dot grid | Section background texture | `zinc-800/30`, 2px dots, 24px grid |
| Radial gradient | Hero backgrounds | PEDL body gradient |
| Line lines | Section dividers | `zinc-800/20`, horizontal, full-width |
| Hexagon grid | Technical backgrounds (rare) | `zinc-900/30`, SVG pattern |

---

## 9. Page Transitions

### 9.1 Between Pages

| Transition | Duration | Easing | Usage |
|---|---|---|---|
| Cross-fade | 300ms | ease-out | All page transitions |
| Slide-up (new page) | 300ms | `[0.16, 1, 0.3, 1]` | Mobile page transitions |

**Rules:**
- No page transition on initial load
- No page transition when navigating from footer/header (only content area)
- Back navigation uses same forward transition (no reverse)

### 9.2 Within Pages

| Transition | Duration | Usage |
|---|---|---|
| Content fade-in | 400ms | Section appearances |
| Card stagger | 80ms per item | Grid reveals |
| Diagram draw | 800ms | SVG path animation |
| Metric count | 1200ms | Number animation |
| Hover states | 200ms | Card lift, button scale |
| Focus rings | 100ms | Focus/blur |

---

## 10. Visual Content Decision Tree

When deciding what visual to use for a section:

```
Does this section explain a PROCESS or WORKFLOW?
  → YES → Animated diagram (Option B hero style)
  → NO ↓

Does this section show PRODUCT UI?
  → YES → Screenshot with dark frame
  → NO ↓

Does this section explain ARCHITECTURE?
  → YES → Architecture diagram (nodes + connections)
  → NO ↓

Does this section show DATA or METRICS?
  → YES → Animated metric counters
  → NO ↓

Does this section QUOTE someone?
  → YES → Quote card with attribution
  → NO ↓

Does this section show PARTNERS or CUSTOMERS?
  → YES → Logo grid
  → NO ↓

Does this section explain CODE or IMPLEMENTATION?
  → YES → Code example with syntax highlighting
  → NO ↓

Does this section need ANY visual?
  → Use typography + spacing only. Not every section needs a visual.
```

---

## 11. Visual Direction Checklist

Before finalizing any page design:

- [ ] Hero uses one of the 3 defined variants (A, B, or C)
- [ ] No parallax scrolling
- [ ] All visuals use zinc + gold palette (no other colors)
- [ ] No stock photography
- [ ] No decorative elements that don't inform
- [ ] Diagrams follow the Illustration Guide spec
- [ ] Screenshots have dark frames and captions
- [ ] Metric sections use animated counters
- [ ] All scroll reveals use `once: true` viewport
- [ ] CTA sections use gold-tinted background
- [ ] No floating/sticky CTAs or pop-ups
- [ ] Page transitions are 300ms cross-fade
- [ ] Mobile: all sections stack vertically
- [ ] Code examples use JetBrains Mono
- [ ] No section exceeds 3 screens of scroll depth
