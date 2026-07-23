# Perionyx Public Website — Design Language

> **Status**: v1.0
> **Scope**: Visual design system for the public marketing website
> **Extension of**: PEDL v1.0 (enterprise product design language)
> **Principle**: The public site is a curated window into the product. Same DNA, different audience.

---

## 1. Design Principles (Public Site)

1. **Product is the hero.** The website exists to explain what Perionyx does. Every design decision serves comprehension.
2. **Earn attention through substance.** No carousels, no auto-playing video, no pop-ups, no decorative noise.
3. **Progressive disclosure.** Simple on the surface, technical underneath. Every page has a 30-second layer and a 5-minute layer.
4. **Dark-first, always.** Same `#040404` primary background as the product. The website IS the product aesthetic.
5. **Gold signals action.** `#d4af37` reserved for CTAs, metrics, and active states. Never decorative.
6. **Glass over flat.** Cards and surfaces use translucent borders and gradient fills, matching the product's atmospheric depth.
7. **Enterprise confidence.** Not startup-cute. Not enterprise-stiff. Confident, clear, technical, human.

---

## 2. Page Layout Templates

### 2.1 Homepage

```
┌──────────────────────────────────────────────────────────┐
│  Navbar (h-16, glass, fixed)                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Hero Section                                            │
│  - max-w-4xl centered                                    │
│  - Overline badge (gold outline)                         │
│  - Display headline (56px/64px, font-bold, tracking-tight)│
│  - Subheadline (20px, zinc-400, max-w-2xl)               │
│  - CTA row (primary gold + secondary outline)            │
│  - Metric strip below CTAs (3-4 metrics, zinc-400)      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Social proof bar                                        │
│  - "Trusted by finance teams" + logo row (zinc-600)     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Product overview section                                │
│  - Section header (centered, max-w-2xl)                  │
│  - 3-column feature cards (max-w-7xl, grid-cols-3)      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Deep-dive sections (alternating left/right)             │
│  - 2-3 domain showcases (AP, Treasury, Executive)        │
│  - Text left + visual right, then swap                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Technical credibility section                            │
│  - Code snippet or architecture diagram                  │
│  - 3 metric counters (animated)                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Security / Trust section                                │
│  - Full-width, secondary background                      │
│  - 4-column trust signals (encryption, audit, SOC, MFA)  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CTA section                                             │
│  - Full-width, gold-tinted background                    │
│  - Headline + subtext + button                           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Footer (zinc-950, 4-column links + legal)               │
└──────────────────────────────────────────────────────────┘
```

**Total scroll depth**: 6-8 screens. No carousel. One message per screen.

### 2.2 Product Page (e.g., `/product/accounts-payable`)

```
┌──────────────────────────────────────────────────────────┐
│  Navbar                                                  │
├──────────────────────────────────────────────────────────┤
│  Breadcrumb (Home > Product > Accounts Payable)          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Hero                                                    │
│  - Overline: "Accounts Payable"                          │
│  - Headline: One sentence (max 15 words)                 │
│  - Sub: Outcome-focused description                      │
│  - CTA: "See how it works"                               │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Workflow overview                                       │
│  - 4-6 step horizontal flow diagram (SVG, animated)     │
│  - Step labels + brief descriptions                      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Key capabilities                                        │
│  - 2-column grid (feature card left, visual right)       │
│  - 4-6 capabilities, alternating layout                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Integration points                                      │
│  - Logo grid of connected systems                        │
│  - Brief descriptions                                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Trust signals                                           │
│  - 3 metric cards (matching, precision, audit)           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Related product links                                   │
│  - 2-3 cards linking to related domains                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  CTA section                                             │
├──────────────────────────────────────────────────────────┤
│  Footer                                                  │
└──────────────────────────────────────────────────────────┘
```

**Scroll depth**: 5-6 screens.

### 2.3 Feature Page (e.g., `/ai/explainability`)

```
┌──────────────────────────────────────────────────────────┐
│  Navbar                                                  │
├──────────────────────────────────────────────────────────┤
│  Breadcrumb                                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Hero (compact)                                          │
│  - Headline + 2-sentence description                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Content body (max-w-3xl, centered, prose-style)        │
│  - H2 sections with supporting visuals                  │
│  - Code examples where relevant                         │
│  - Diagrams for architecture/flow                       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  "How it works" diagram section                          │
│  - Full-width diagram                                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Related pages                                           │
│  - 2-3 cards                                            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  CTA section                                             │
├──────────────────────────────────────────────────────────┤
│  Footer                                                  │
└──────────────────────────────────────────────────────────┘
```

**Scroll depth**: 3-4 screens.

### 2.4 Blog Post / Research Article (`/research/*`, `/engineering/*`)

```
┌──────────────────────────────────────────────────────────┐
│  Navbar                                                  │
├──────────────────────────────────────────────────────────┤
│  Breadcrumb                                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Article header                                          │
│  - Category badge (gold outline)                         │
│  - Title (40px, tracking-tight)                          │
│  - Meta: author, date, reading time (zinc-500)          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Article body (max-w-2xl, centered)                      │
│  - Prose typography (see §3.4)                           │
│  - Code blocks (dark, syntax-highlighted)                │
│  - Diagrams (see Illustration Guide)                     │
│  - Pull quotes (border-left gold)                        │
│  - Inline metrics (gold text)                            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Author card                                             │
│  - Name, role, brief bio                                 │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Related articles                                        │
│  - 2-3 cards in grid                                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Footer                                                  │
└──────────────────────────────────────────────────────────┘
```

**Scroll depth**: 4-6 screens (varies by content length).

### 2.5 Landing Page (`/design-partners`, `/careers`)

```
┌──────────────────────────────────────────────────────────┐
│  Navbar                                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Hero (full-bleed, max-w-5xl)                            │
│  - Large headline (64px)                                 │
│  - Supporting paragraph                                  │
│  - Primary CTA                                           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Benefits grid (3-column, icon + title + description)    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Process / how it works (step cards)                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Testimonial or social proof                             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  FAQ or details section                                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Final CTA                                               │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Footer                                                  │
└──────────────────────────────────────────────────────────┘
```

**Scroll depth**: 4-5 screens.

---

## 3. Typography Scale

### 3.1 Font Stack

```css
/* Primary — UI + body */
font-family: Inter, "Geist Sans", ui-sans-serif, system-ui, sans-serif;

/* Code — code blocks, inline code, technical values */
font-family: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
```

### 3.2 Display & Heading Scale

| Level | Class | Size (desktop) | Size (mobile) | Weight | Tracking | Line Height | Usage |
|---|---|---|---|---|---|---|---|
| Display | `text-5xl md:text-6xl` | 60px | 36px | 700 | `tracking-tight` | 1.1 | Homepage hero |
| H1 | `text-4xl md:text-5xl` | 48px | 30px | 700 | `tracking-tight` | 1.15 | Page titles |
| H2 | `text-3xl md:text-4xl` | 36px | 24px | 700 | `tracking-tight` | 1.2 | Section headings |
| H3 | `text-2xl md:text-3xl` | 30px | 22px | 600 | `tracking-tight` | 1.25 | Sub-section headings |
| H4 | `text-xl md:text-2xl` | 24px | 20px | 600 | — | 1.3 | Card headings |
| H5 | `text-lg md:text-xl` | 20px | 18px | 600 | — | 1.35 | Feature headings |
| H6 | `text-base md:text-lg` | 18px | 16px | 600 | — | 1.4 | Minor headings |

### 3.3 Body & UI Scale

| Level | Class | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| Lead | `text-lg md:text-xl` | 18-20px | 400 | 1.6 | Hero subtext, intros |
| Body | `text-base` | 16px | 400 | 1.6 | Page content |
| Body small | `text-sm` | 14px | 400 | 1.5 | Card descriptions, secondary text |
| Caption | `text-xs` | 12px | 500 | 1.5 | Metadata, timestamps, labels |
| Overline | `text-[10px] md:text-xs` | 10-12px | 600 | 1 | Category labels, badges |
| Code | `font-mono text-sm` | 14px | 400 | 1.6 | Inline code, code blocks |

### 3.4 Prose Typography (Blog/Research)

For long-form content, use prose-like spacing:

```css
.prose-h2 { @apply text-2xl md:text-3xl font-bold tracking-tight text-white mt-12 mb-4; }
.prose-h3 { @apply text-xl md:text-2xl font-semibold text-white mt-8 mb-3; }
.prose-p  { @apply text-base leading-relaxed text-zinc-300 mb-4; }
.prose-a  { @apply text-[#d4af37] underline underline-offset-2 hover:text-[#c7a961]; }
.prose-code { @apply font-mono text-sm bg-zinc-900/60 px-1.5 py-0.5 rounded text-zinc-300; }
.prose-pre { @apply bg-zinc-950 border border-white/[0.06] rounded-xl p-4 overflow-x-auto my-6; }
.prose-blockquote { @apply border-l-2 border-[#d4af37] pl-4 italic text-zinc-400 my-6; }
.prose-ul { @apply list-disc pl-6 space-y-2 text-zinc-300; }
.prose-ol { @apply list-decimal pl-6 space-y-2 text-zinc-300; }
.prose-li { @apply text-base leading-relaxed; }
.prose-strong { @apply text-white font-semibold; }
.prose-hr { @apply border-white/[0.06] my-12; }
```

---

## 4. Spacing System

### 4.1 Vertical Rhythm

All spacing uses a 4px base unit. Sections follow a consistent vertical rhythm.

| Token | Value | Usage |
|---|---|---|
| `space-xs` | 4px | Tight inline spacing |
| `space-sm` | 8px | Label-to-value, small gaps |
| `space-md` | 16px | Card internal spacing |
| `space-lg` | 24px | Between related elements |
| `space-xl` | 32px | Between subsections |
| `space-2xl` | 48px | Between content blocks |
| `space-3xl` | 64px | Section boundaries |
| `space-4xl` | 96px | Major page sections |
| `space-5xl` | 128px | Homepage hero-to-content |

### 4.2 Section Padding

| Section | Desktop | Mobile |
|---|---|---|
| Page container | `px-6 lg:px-8` | `px-5` |
| Section vertical | `py-24 md:py-32` | `py-16` |
| Hero section | `pt-24 pb-16 md:pt-32 md:pb-24` | `pt-16 pb-12` |
| Narrow content | `py-16 md:py-24` | `py-12` |
| CTA section | `py-20 md:py-28` | `py-16` |
| Footer | `py-12 md:py-16` | `py-10` |

### 4.3 Content Width

| Container | Max Width | Usage |
|---|---|---|
| Full bleed | 100% | Hero backgrounds, CTA backgrounds |
| Wide | `max-w-7xl` (1280px) | Card grids, feature sections |
| Standard | `max-w-5xl` (1024px) | Alternating content sections |
| Narrow | `max-w-3xl` (768px) | Blog posts, prose content |
| Compact | `max-w-2xl` (672px) | Article headers, centered text |

---

## 5. Grid System

### 5.1 Column Grid

| Layout | Columns | Gutter | Margin | Usage |
|---|---|---|---|---|
| Full width | 12 | — | `px-6 lg:px-8` | Hero, CTA sections |
| Feature grid | 3 | `gap-6 lg:gap-8` | Auto-centered | Product overview cards |
| Alternating | 2 | `gap-12 lg:gap-16` | Auto-centered | Feature showcases |
| Card grid | 2-3 | `gap-4 lg:gap-6` | Auto-centered | Related pages, resources |
| Metric strip | 4 | `gap-4 lg:gap-6` | Auto-centered | Homepage metrics |
| Sidebar + content | `300px + 1fr` | `gap-8 lg:gap-12` | Auto-centered | Documentation pages |

### 5.2 Responsive Breakpoints

| Breakpoint | Width | Grid | Behavior |
|---|---|---|---|
| Mobile | `< 640px` | 1 column | Stack everything. Full-width cards. Compact spacing. |
| Tablet | `640px – 1024px` | 2 columns | Feature grids collapse to 2-col. Alternating sections stack. |
| Desktop | `1024px – 1280px` | 3-4 columns | Full grid layouts. Sidebar visible if applicable. |
| Wide | `> 1280px` | 12-col fluid | Content stays at max-width. Extra space is breathing room. |

### 5.3 Image Handling

| Context | Treatment |
|---|---|
| Product screenshots | Dark frame, 8px radius, max-w-100%, `border border-white/[0.06]` |
| Architecture diagrams | SVG, full-width within container, transparent/zinc-950 background |
| Hero visuals | No images. Text + metrics + optional code block or diagram. |
| Team photos | Not used. No stock photography. |
| Logos (partner, cert) | Zinc-600 filter, grayscale, hover: zinc-400 |

---

## 6. Dark Mode Specifics

### 6.1 Surface Hierarchy

| Surface | Background | Border | Usage |
|---|---|---|---|
| Page | `#040404` | None | Base background |
| Section alt | `#090909` | None | Alternating sections |
| Card | `bg-gradient-to-b from-zinc-900/50 to-black/40` | `border-white/[0.06]` | Feature cards, content blocks |
| Elevated card | `bg-gradient-to-b from-zinc-800/40 to-black/40` | `border-white/[0.08]` | Hovered cards, active states |
| Code block | `#0c0c0c` | `border-white/[0.06]` | Code examples |
| Inline code | `bg-zinc-900/60` | `rounded px-1.5 py-0.5` | Inline technical values |
| Navbar | `bg-black/80 backdrop-blur-xl` | `border-b border-white/[0.06]` | Fixed top navigation |
| Footer | `#070707` | `border-t border-white/[0.06]` | Page footer |

### 6.2 Text Contrast Ratios

All combinations verified against WCAG 2.1 AA requirements.

| Text Role | Color | On Background | Contrast Ratio | WCAG |
|---|---|---|---|---|
| Primary (headlines) | `#f7f6f2` | `#040404` | 19.2:1 | AAA |
| Body text | `#f7f6f2` | `#0d0d0d` | 17.5:1 | AAA |
| Secondary text | `#b8b5ae` | `#0d0d0d` | 8.2:1 | AAA |
| Muted text | `#8f8a81` | `#0d0d0d` | 5.3:1 | AA |
| Faint text | `#6c6b67` | `#0d0d0d` | 3.5:1 | Large text only |
| Gold accent | `#d4af37` | `#040404` | 9.5:1 | AAA |
| Gold on card | `#d4af37` | `#121212` | 8.8:1 | AAA |
| Success | `#3ca16d` | `#040404` | 6.1:1 | AA |
| Error | `#b56b5e` | `#040404` | 4.8:1 | AA |
| Link text | `#d4af37` | `#0d0d0d` | 8.5:1 | AAA |

**Rules:**
- Never use `zinc-600` or lighter for text smaller than 16px on dark backgrounds
- Never place text on a gold background (gold is for accents, not surfaces)
- All status text must maintain minimum 4.5:1 contrast on its background
- Faint text (`zinc-600`) only for decorative labels, never for essential information

### 6.3 Border Treatments

| Border Type | Value | Usage |
|---|---|---|
| Default | `border-white/[0.06]` | Cards, dividers, inputs |
| Emphasis | `border-white/[0.08]` | Hovered cards, focused inputs |
| Strong | `border-white/[0.12]` | Active/selected states |
| Gold soft | `border-[#d4af37]/14` | Gold-tinted containers |
| Gold active | `border-[#d4af37]/30` | Active gold elements |
| Gold focus | `border-[#d4af37]/40` | Focus rings |
| Muted | `border-white/[0.04]` | Subtle dividers |
| None | No border | Sections, backgrounds |

---

## 7. Component Inventory

### 7.1 Hero Variants

| Variant | Structure | Usage |
|---|---|---|
| **Statement** | Overline + Display headline + Subtext + CTAs + Metric strip | Homepage, product overviews |
| **Compact** | H1 + Lead paragraph + CTA | Feature pages, security |
| **Minimal** | H1 + 2-line description | Research articles, blog posts |
| **Code-forward** | Headline + code block + subtext | Engineering posts, platform pages |

### 7.2 Feature Cards

| Variant | Structure | Usage |
|---|---|---|
| **Icon card** | Icon (gold container) + title + description | Product overview grids |
| **Metric card** | Large value (gold) + label + trend | Homepage metrics, trust sections |
| **Code card** | Title + code block + description | Platform/engineering pages |
| **Image card** | Title + screenshot + description | Product feature showcases |

**Card base styles** (from PEDL §7.1):
```
rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40
shadow-lg shadow-black/20 p-6 lg:p-8
```

### 7.3 Comparison Tables

| Variant | Structure | Usage |
|---|---|---|
| **Before/After** | Two columns with divider | "Old way" vs. "Perionyx way" |
| **Feature matrix** | Table with checkmarks/crosses | Capability comparison |
| **Competitor comparison** | Table with named competitors | If/when used (rare) |

**Rules:**
- Never name competitors negatively. "Traditional approach" not "Legacy tool X"
- Always show the outcome difference, not just the feature difference
- Use gold checkmarks (`CheckCircle2`) and zinc-500 crosses (`XCircle`)

### 7.4 Testimonial Blocks

| Variant | Structure | Usage |
|---|---|---|
| **Quote card** | Quote text + name + role + company | Customer quotes |
| **Logo grid** | Partner/customer logos in row | Social proof bar |
| **Video embed** | Thumbnail + play button + caption | Testimonial videos (if used) |

**Rules:**
- No testimonials without attribution
- Logo grid uses zinc-600 filter, hover: zinc-400
- Quote text: `text-lg italic text-zinc-300`
- Attribution: `text-sm text-zinc-500`

### 7.5 Stat Counters

```tsx
<div className="text-center">
  <p className="text-4xl md:text-5xl font-bold text-[#d4af37] tabular-nums">{value}</p>
  <p className="text-sm text-zinc-500 mt-2">{label}</p>
</div>
```

**Rules:**
- Gold color for values
- `tabular-nums` for aligned digits during count-up animation
- Labels in zinc-500, never gold
- Maximum 4 metrics in a row

### 7.6 Code Examples

```
┌────────────────────────────────────────────────────┐
│  filename.ts                        [Copy] [1-4]   │
├────────────────────────────────────────────────────┤
│  1  const precision = new Decimal('1234.56789');    │
│  2  const result = precision.times(0.01);           │
│  3  // Result: 12.34567890 (no rounding drift)     │
│  4  expect(result.toString()).toBe('12.3456789');   │
└────────────────────────────────────────────────────┘
```

**Rules:**
- Background: `bg-zinc-950 border border-white/[0.06] rounded-xl`
- Font: `JetBrains Mono text-sm`
- Line numbers: `text-zinc-600`, code: `text-zinc-300`
- Keywords: gold or emerald for emphasis
- Copy button in top-right (ghost button)
- Max-width: full container width
- Syntax highlighting: dark theme, minimal colors

### 7.7 Demo Embeds

| Type | Treatment |
|---|---|
| Interactive demo | Embedded iframe with dark border, 8px radius |
| Screenshot | Static image with device frame (optional), dark border |
| GIF/animation | Short loop (max 5s), mp4 preferred, auto-pause option |

**Rules:**
- All demos in a card with `rounded-xl border border-white/[0.06]`
- Caption below in `text-xs text-zinc-500`
- No auto-playing. User-initiated play button.
- Alt text always provided

### 7.8 CTAs

| Variant | Style | Usage |
|---|---|---|
| **Primary** | Gold bg, black text, shadow-lg shadow-gold/20 | Main action |
| **Secondary** | Outline gold, gold text | Secondary action |
| **Ghost** | Transparent, zinc-400 text, zinc border | Tertiary/learn more |
| **Full-width gold** | Gold bg, centered text, full section width | Bottom-of-page CTA |
| **Inline** | Link style (gold, underline-offset-4) | Within prose content |

**CTA section** (bottom of page):
```
<section className="relative py-24 md:py-32">
  <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/5 to-transparent" />
  <div className="relative max-w-3xl mx-auto text-center px-6">
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
      {headline}
    </h2>
    <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
      {subtext}
    </p>
    <div className="flex items-center justify-center gap-4">
      <Button size="lg">{primary CTA}</Button>
      <Button variant="secondary" size="lg">{secondary CTA}</Button>
    </div>
  </div>
</section>
```

---

## 8. Color Usage Rules

### 8.1 Gold (`#d4af37`)

| Allowed | Forbidden |
|---|---|
| Primary CTA buttons | Background fills |
| Active/selected states | Large text blocks |
| Focus rings | Card backgrounds |
| Metric values (numbers) | Border-only decoration |
| Category badges (secondary variant) | Hover states on non-interactive elements |
| Inline code emphasis (sparingly) | Gradients on gradients |
| Active nav indicator | |
| Progress indicators | |

### 8.2 Zinc Scale

| Token | Usage |
|---|---|
| `zinc-100` / `zinc-200` | Headlines on cards (rare, prefer `#f7f6f2`) |
| `zinc-300` | Body text, descriptions |
| `zinc-400` | Secondary text, metadata |
| `zinc-500` | Muted labels, placeholders |
| `zinc-600` | Faint text (large size only), decorative |
| `zinc-700` | Borders on light surfaces (rare on dark) |
| `zinc-800` | Card hover states, surface tints |
| `zinc-900` | Card backgrounds, code blocks, input fields |
| `zinc-950` | Page backgrounds, deepest surfaces |

### 8.3 Semantic Colors

Same as PEDL §2.2 — emerald for success, amber for warning, red for error, blue for info. Always with 10% background tint and 20% border tint.

---

## 9. Responsive Behavior

### 9.1 Content Stacking

| Desktop Layout | Mobile Collapse |
|---|---|
| 3-column card grid | Single column, stacked |
| 2-column alternating | Single column, image above text |
| Sidebar + content | Content only, sidebar hidden |
| 4-column metrics | 2-column grid |
| Horizontal nav items | Hamburger menu |
| Inline CTAs side-by-side | Stacked vertically |

### 9.2 Image Handling

| Context | Desktop | Mobile |
|---|---|---|
| Screenshots | Side-by-side with text | Full-width above text |
| Diagrams | Full container width | Scrollable horizontal or scaled down |
| Code blocks | Full container width | Scrollable horizontal |
| Logos | Full row | 2-3 per row, smaller |

### 9.3 Typography Scaling

All heading sizes scale down on mobile (see §3.2). Body text stays at `text-base` (16px) on all viewports.

---

## 10. Navbar Specification

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]  Product ▾  Platform ▾  Security  AI  Engineering  [Login] [Book a Demo]  │
└──────────────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Height | 64px |
| Background | `bg-black/80 backdrop-blur-xl` |
| Border | `border-b border-white/[0.06]` |
| Position | `fixed top-0 w-full z-50` |
| Max content | `max-w-7xl mx-auto px-6 lg:px-8` |
| Logo | 24px height, left-aligned |
| Nav items | `text-sm text-zinc-400 hover:text-white transition-colors` |
| Active nav | `text-white` |
| CTA button | Gold primary, `h-9` |
| Mega menu | Dropdown panels, `bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl shadow-2xl` |

### 10.1 Mobile Navbar

- Logo left, hamburger right
- Full-screen overlay on open (`bg-black/95 backdrop-blur-xl`)
- Stacked nav items, large touch targets (`py-4`)
- CTA button full-width at bottom

---

## 11. Footer Specification

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]                                                   │
│                                                          │
│  Product      Platform      Company      Legal          │
│  AP           Architecture  About        Privacy        │
│  AR           Ledger        Careers      Terms          │
│  Treasury     Security      Contact      Disclosure     │
│  ...          ...           ...          ...            │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│  © 2026 Perionyx    [GitHub] [LinkedIn] [Twitter]       │
└──────────────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Background | `#070707` |
| Border | `border-t border-white/[0.06]` |
| Padding | `py-12 md:py-16` |
| Columns | 4 (responsive: 2 on mobile) |
| Link color | `text-zinc-500 hover:text-zinc-300` |
| Section titles | `text-xs uppercase tracking-[0.15em] text-zinc-500 font-semibold` |
| Logo height | 20px |
| Social icons | 20px, `text-zinc-600 hover:text-zinc-400` |

---

## 12. Implementation Checklist

When building any public website page:

- [ ] Dark background applied (`#040404` base)
- [ ] Body gradient overlay present (atmospheric depth)
- [ ] Navbar fixed, glass effect, correct height
- [ ] Typography follows scale (no ad-hoc sizes)
- [ ] Spacing follows 4px grid
- [ ] Content max-width appropriate for page type
- [ ] Gold only on CTAs, metrics, active states
- [ ] All text meets WCAG AA contrast (4.5:1 min)
- [ ] Faint text only on large sizes (16px+)
- [ ] Responsive: tested at 375px, 768px, 1280px
- [ ] No stock photography
- [ ] No auto-playing media
- [ ] Focus rings visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Page loads under 2.5s LCP
- [ ] No layout shift (CLS < 0.1)
- [ ] SEO metadata complete (title, description, OG tags)
- [ ] Source Brain document referenced in content
