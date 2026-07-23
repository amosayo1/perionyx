# Perionyx Brand Guidelines

> **Status**: v1.0
> **Scope**: Brand identity system for all public-facing materials
> **Principle**: The brand is earned through product quality, not applied through decoration.

---

## 1. Brand Essence

**Perionyx** builds enterprise financial intelligence. The brand communicates precision, trust, and technical depth. Every visual element must justify its existence.

**Brand attributes**: Precise. Confident. Technical. Human. Enterprise.

**What the brand is NOT**: Flashy. Consumer. Playful. Generic. Hype-driven.

---

## 2. Logo

### 2.1 Logo Mark

The Perionyx logo is a wordmark. No abstract symbol. The name itself is the mark.

```
Perionyx
```

**Typography**: Inter, 700 weight, `tracking-tight` (-0.02em).

### 2.2 Logo Variants

| Variant | Usage | Specification |
|---|---|---|
| **Primary (horizontal)** | Navbar, footer, general use | Wordmark, horizontal, default |
| **Monochrome white** | On dark backgrounds, watermarks | Single color white (`#f7f6f2`) |
| **Monochrome dark** | Light contexts (PDFs, prints) | Single color `#040404` |
| **Icon-only** | Favicon, app icon, small spaces | "P" ligature or abstract mark |
| **Stacked** | Print materials, certificates | Wordmark centered, optional tagline below |

### 2.3 Logo Lockup Variants

**Horizontal lockup** (primary):
```
[Icon] Perionyx
```
- Icon: 24px height
- Wordmark: 24px height equivalent
- Gap: 8px

**Stacked lockup**:
```
   [Icon]
 Perionyx
```
- Icon: 32px height
- Wordmark: centered below
- Gap: 12px

**Icon-only**:
```
[P]
```
- Used at 16px-32px only
- Minimum 16px for legibility

### 2.4 Clear Space

Minimum clear space around the logo equals the height of the "P" character (cap height). No elements may intrude into this space.

```
┌─────────────────────┐
│     ↕ clear space    │
│  ↔  [LOGO]  ↔       │
│     ↕ clear space    │
└─────────────────────┘
```

### 2.5 Minimum Size

| Context | Minimum Width |
|---|---|
| Digital (screen) | 80px |
| Print | 25mm |
| Favicon | 16px (icon only) |
| Social media avatar | 40px (icon only) |

### 2.6 Favicon

- Format: SVG preferred, PNG fallback (32x32, 16x16)
- Design: "P" monogram on dark background
- Background: `#040404`
- Mark: `#d4af37` (gold) or `#f7f6f2` (white)

---

## 3. Color Palette

### 3.1 Primary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Perionyx Black** | `#040404` | 4, 4, 4 | Primary background, brand foundation |
| **Perionyx Gold** | `#d4af37` | 212, 175, 55 | Primary accent, CTAs, metrics, brand identity |
| **Perionyx White** | `#f7f6f2` | 247, 246, 242 | Primary text on dark, logo (light variant) |

### 3.2 Gold Palette

| Name | Hex | Usage |
|---|---|---|
| Gold 50 | `#fdf8e8` | Light tint (rare, print only) |
| Gold 100 | `#f5e6a3` | Light accent (rare) |
| Gold 200 | `#e8cc6a` | Hover state (light contexts) |
| Gold 300 | `#d4af37` | **Primary gold** — CTAs, metrics, brand |
| Gold 400 | `#c7a961` | Hover state (dark contexts) |
| Gold 500 | `#b8972f` | Active/pressed state |
| Gold 600 | `#8b6b2e` | Deep accent, borders |
| Gold 700 | `#6b5220` | Muted gold (rare) |
| Gold 800 | `#4a3815` | Background tints |
| Gold 900 | `#2a1f0b` | Deepest tint |

### 3.3 Zinc Palette (Neutrals)

| Name | Hex | Primary Usage |
|---|---|---|
| Zinc 50 | `#fafafa` | — (not used on dark) |
| Zinc 100 | `#f4f4f5` | Headlines on cards (rare) |
| Zinc 200 | `#e4e4e7` | Hover headlines |
| Zinc 300 | `#d4d4d8` | Body text on dark |
| Zinc 400 | `#a1a1aa` | Secondary text, descriptions |
| Zinc 500 | `#71717a` | Muted labels, metadata |
| Zinc 600 | `#52525b` | Faint text (large only), borders |
| Zinc 700 | `#3f3f46` | Card hover tints |
| Zinc 800 | `#27272a` | Surface tints, code blocks |
| Zinc 900 | `#18181b` | Card backgrounds, panels |
| Zinc 950 | `#09090b` | Deep backgrounds, sections |

### 3.4 Semantic Colors

| Name | Hex | Text | Background | Border | Usage |
|---|---|---|---|---|---|
| Success | `#3ca16d` | `emerald-400` | `emerald-500/10` | `emerald-500/20` | Pass, complete, live |
| Warning | `#d4af37` | `amber-400` | `amber-500/10` | `amber-500/20` | Attention, pending |
| Error | `#b56b5e` | `red-400` | `red-500/10` | `red-500/20` | Fail, blocked, destructive |
| Info | `#60a5fa` | `blue-400` | `blue-500/10` | `blue-500/20` | Informational |

### 3.5 Color Rules

1. **Gold never fills backgrounds.** It is an accent color only.
2. **Never place text on a gold background.** Gold is for small elements (buttons, icons, badges, numbers).
3. **Zinc-600 is the minimum text color.** Anything lighter must be 16px or larger.
4. **Semantic colors always use 10% background tint.** Never full-opacity backgrounds.
5. **The dark gradient is sacred.** Every page uses the PEDL atmospheric background. No flat black.
6. **No other accent colors.** Gold is the single accent. No purple, no blue, no green accents.

---

## 4. Typography

### 4.1 Font Families

| Font | Usage | Weights |
|---|---|---|
| **Inter** | Body text, headings, UI, navigation | 400 (regular), 500 (medium), 600 (semibold), 700 (bold) |
| **JetBrains Mono** | Code blocks, inline code, technical values | 400 (regular) |

### 4.2 Fallback Stack

```css
/* Primary */
font-family: Inter, "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Code */
font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace;
```

### 4.3 Font Loading Strategy

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
```

- Use `font-display: swap` to prevent FOIT
- Inter loads first (critical), JetBrains Mono loads async
- System font fallback while web fonts load

### 4.4 Line Heights

| Context | Line Height | Rationale |
|---|---|---|
| Display / H1-H2 | 1.1–1.15 | Tight for impact |
| H3-H6 | 1.2–1.35 | Progressive relaxation |
| Body text | 1.5–1.6 | Readability |
| Code blocks | 1.6–1.7 | Vertical scanning |
| Captions / labels | 1.3–1.4 | Compact |
| Overlines | 1 | All-caps, single line |

### 4.5 Letter Spacing

| Context | Tracking | Usage |
|---|---|---|
| Display | `tracking-tight` (-0.02em) | Large headlines |
| Body | Default (0) | Normal text |
| Overlines | `tracking-[0.15em]` | Uppercase labels |
| Badges | `tracking-[0.15em]` | Status/category badges |
| Form labels | `tracking-[0.24em]` | Input labels |
| Sidebar sections | `tracking-[0.2em]` | Section group labels |

---

## 5. Imagery Guidelines

### 5.1 Photography

**Rule: No stock photography. Never.**

Perionyx does not use stock photos. No smiling people at computers. No handshakes. No skyline photos. No abstract "technology" imagery.

### 5.2 Product Screenshots

| Rule | Specification |
|---|---|
| Frame | Dark frame (`border border-white/[0.06]`), `rounded-xl` |
| Background | Match product background (`#040404` or `#0d0d0d`) |
| Resolution | 2x for retina displays |
| Max width | `max-w-100%` within container |
| Caption | `text-xs text-zinc-500` centered below |
| Annotation | Gold callout arrows/boxes if highlighting features |
| Cropping | Show meaningful UI sections, not full-page screenshots |

### 5.3 Diagrams

Diagrams are the primary visual content type. See `ILLUSTRATION_GUIDE.md` for full specification.

| Rule | Specification |
|---|---|
| Style | Technical, clean, node-based |
| Colors | Zinc-300 text, zinc-800 borders, gold for highlights |
| Background | Transparent or `zinc-950` |
| Format | SVG (inline or component) |
| Animation | Path drawing on scroll reveal |

### 5.4 Abstract Patterns

Permitted sparingly as background decoration:

| Pattern | Usage | Rules |
|---|---|---|
| Dot grid | Section backgrounds | `zinc-800/50`, 2px dots, 24px spacing |
| Line pattern | Hero backgrounds | `zinc-800/30`, 1px lines, 45-degree angle |
| Geometric shapes | Section dividers | Circles, hexagons in `zinc-900/50` |
| Gradient mesh | Hero backgrounds | Subtle gold radial gradient (PEDL body gradient) |

**Rules for abstract patterns:**
- Always `zinc-800/900` palette. Never gold. Never colored.
- Always behind content. Never in front of text.
- Always subtle. If you notice the pattern, it's too strong.
- Maximum opacity: 50% of the zinc color

### 5.5 Code as Visual Content

Code blocks serve as visual content on technical pages:

```tsx
// This IS the illustration for a technical page
const result = calculateAllocation({
  total: new Decimal('10000.00'),
  targets: [{ id: 'a', weight: 0.6 }, { id: 'b', weight: 0.4 }],
  precision: 2
});
// → { a: '6000.00', b: '4000.00' }
```

---

## 6. Tone of Voice

### 6.1 Voice Attributes

| Attribute | In Practice | Never |
|---|---|---|
| **Confident** | "The ledger uses Decimal(38,12) precision." | "We believe our ledger might be more precise." |
| **Clear** | "Match PO, receipt, and invoice automatically." | "Leverage intelligent matching capabilities." |
| **Enterprise** | "SOC 2 Type II compliance roadmap." | "Bank-grade security for your business." |
| **Technical** | "32ms average API response time, p99." | "Lightning-fast performance." |
| **Human** | "Your team shouldn't have to chase approvals." | "Streamline your approval workflows." |

### 6.2 Tone by Context

| Context | Tone | Example |
|---|---|---|
| **Homepage hero** | Bold, minimal | "Financial intelligence that earns trust." |
| **Product pages** | Clear, workflow-focused | "Three-way matching catches discrepancies before they reach your desk." |
| **Security pages** | Precise, evidence-backed | "AES-256-GCM encryption at rest. TLS 1.3 in transit. No exceptions." |
| **AI pages** | Transparent, honest | "When the AI recommends a route, it shows its reasoning." |
| **Engineering** | Thoughtful, technical | "We chose banker's rounding because financial precision isn't negotiable." |
| **Research** | Factual, insight-forward | "31 of 47 finance leaders said their AP process has 3+ manual handoffs." |

### 6.3 Writing Rules

**DO:**
- Use active voice. "The platform validates" not "validation is performed"
- Use specific numbers. "32ms p99" not "blazing fast"
- Use "you" and "your team" for the reader
- Use domain language. "Accounts payable" not "procure-to-pay solution"
- Keep hero sentences under 25 words
- Every claim must be verifiable or clearly labeled as representative

**DO NOT:**
- Use buzzwords: "revolutionary", "best-in-class", "industry-leading", "game-changing", "seamless", "cutting-edge", "next-generation"
- Use vague claims: "many customers", "significant improvement", "vast majority"
- Use startup speak: "we're on a mission to", "we're disrupting", "we're reimagining"
- Use jargon-first navigation: "Procure-to-Pay Solution" (use "Accounts Payable")
- Use superlatives without evidence: "the most powerful", "the fastest"
- Exceed 25 words in hero section sentences

### 6.4 Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Product domains | Proper nouns | "Accounts Payable", "Treasury" |
| Features | Lowercase descriptive | "three-way matching", "approval routing" |
| Platform components | Technical names | "workflow engine", "decision engine" |
| Pages | Sentence case | "How AI explains its reasoning" |
| CTAs | Verb + noun | "See how it works", "Book a demo" |

---

## 7. Co-Branding Rules

### 7.1 Partner Logos

| Rule | Specification |
|---|---|
| Placement | Below social proof section or dedicated "Partners" section |
| Treatment | Grayscale filter (`grayscale brightness-[0.6]`), hover: full brightness |
| Size | Uniform height (40-60px), proportional width |
| Spacing | Equal gaps between logos, minimum 32px |
| Background | Transparent, on dark background |
| Maximum | 6 logos per row |

### 7.2 Certification Badges

| Rule | Specification |
|---|---|
| Placement | Security page, footer, trust section |
| Treatment | Original colors permitted, consistent size |
| Size | Maximum 80px height |
| Spacing | 16px between badges |
| Grouping | By category (security, compliance, technology) |

### 7.3 Co-Branded Materials

- Perionyx logo always appears first (left or top)
- Partner logo is same height or smaller
- Gold accent may not be used on partner materials
- Clear space rules apply to both logos

---

## 8. Misuse Examples

### 8.1 Logo Misuse

| Don't | Why |
|---|---|
| Rotate the logo | Destroys readability |
| Add effects (shadow, glow, 3D) | Undermines minimalism |
| Change the logo colors | Brand integrity |
| Place logo on busy backgrounds | Legibility |
| Stretch or distort | Proportional integrity |
| Use below minimum size | Legibility |
| Recreate the logo in a different font | Brand consistency |
| Add tagline to the logo lockup | Keep it clean |

### 8.2 Color Misuse

| Don't | Why |
|---|---|
| Use gold as a background fill | Gold is accent only |
| Place white text on gold | Insufficient contrast |
| Use gradients on gradients | Visual noise |
| Use colored shadows | Not part of the system |
| Use non-zinc neutrals | Brand consistency |
| Use neon or saturated colors | Enterprise tone |
| Apply gold to all text | Gold is reserved for emphasis |

### 8.3 Typography Misuse

| Don't | Why |
|---|---|
| Use fonts other than Inter + JetBrains Mono | Consistency |
| Use decorative or script fonts | Enterprise tone |
| Set body text below 14px | Readability |
| Use all-caps for body text | Accessibility |
| Justify body text | Readability on screen |
| Use colored text for large sections | Distraction |

### 8.4 Imagery Misuse

| Don't | Why |
|---|---|
| Use stock photography | Brand principle: no stock |
| Use hand-drawn illustrations | Technical precision |
| Use 3D renders or mockups | Clean, flat aesthetic |
| Use gradient backgrounds behind images | Visual noise |
| Crop screenshots arbitrarily | Show meaningful content |
| Use image filters (blur, vignette) | Clean presentation |

### 8.5 Motion Misuse

| Don't | Why |
|---|---|
| Auto-play animations on load | Wait for scroll or user action |
| Animate decorative elements | Motion is functional only |
| Use bounce or elastic easing | Enterprise tone |
| Exceed 600ms for any animation | Stay snappy |
| Animate text readability | Never make text hard to read |
| Use motion to convey required information | Accessibility |

---

## 9. Brand Applications

### 9.1 Social Media

| Platform | Avatar | Banner | Post Style |
|---|---|---|---|
| Twitter/X | Icon-only (gold on dark) | Product screenshot | Dark background, gold accents |
| LinkedIn | Wordmark (white on dark) | Product screenshot | Professional, metric-focused |
| GitHub | Icon-only | N/A | Code-focused, technical |
| Discord | Icon-only | N/A | Community, engineering tone |

### 9.2 Presentation Templates

- Dark backgrounds (`#040404`)
- Gold accent on headers and key metrics
- Inter font throughout
- Code examples use JetBrains Mono
- No animations in slides

### 9.3 PDF / Documents

- Dark mode preferred (matches digital brand)
- Light mode permitted for formal documents (legal, compliance)
- Gold accent preserved in both modes
- Logo placement: top-left or centered header

---

## 10. Brand Checklist

Before publishing any public-facing material:

- [ ] Logo uses correct variant and meets minimum size
- [ ] Clear space maintained around logo
- [ ] Gold used only for accents, CTAs, metrics
- [ ] No text placed on gold backgrounds
- [ ] All text meets WCAG AA contrast
- [ ] Typography uses Inter + JetBrains Mono only
- [ ] No stock photography used
- [ ] Tone matches the context (hero vs. engineering vs. security)
- [ ] No prohibited buzzwords used
- [ ] Specific numbers or clearly labeled estimates used
- [ ] Active voice throughout
- [ ] Hero sentences under 25 words
- [ ] Co-branding follows placement rules
- [ ] All claims verifiable or labeled as representative
