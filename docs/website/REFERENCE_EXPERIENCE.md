# Perionyx Public Website — Reference Experiences

> **Phase**: 22.0A — Public Platform Architecture
> **Status**: Architecture (no code)
> **Last Updated**: 2026-07-22
> **Purpose**: Curated collection of the best web experiences to draw from — NOT a competitor analysis

---

## 1. Enterprise SaaS Homepages

### 1.1 Stripe.com — Homepage

**URL**: https://stripe.com

**What they do well**:
- Hero leads with a bold statement ("Financial infrastructure for the internet") followed by a live code example — the product IS the proof
- Metric callouts appear immediately below the fold: "Billions of dollars processed" — specific, verifiable, trust-building
- Progressive disclosure depth: 6 product tiles on homepage, each leading to a deep page; technical details one click away, never forced

**What to adopt for Perionyx**:
- The code-as-hero pattern. Perionyx should show a real API call (e.g., `POST /api/v1/procurement/invoices` with Decimal(38,12) response) on the homepage or platform page
- Progressive disclosure: homepage shows 6 capability tiles → product overview shows 12 → sub-pages show full depth
- Metric callouts below hero: "392 API routes. 67 modules. 338 data models." — verifiable numbers that build credibility

**What to avoid**:
- Stripe's homepage speaks almost exclusively to developers. Perionyx must speak to CFOs AND engineers — dual-audience hero structure
- Stripe's gradient-based visual language is consumer-tech, not enterprise finance. Perionyx's dark+gold is more trustworthy for finance buyers

**Perionyx adaptation**: Homepage hero with "The finance platform your team will actually use" → code snippet showing a Decimal(38,12) calculation → metric strip (392 APIs, 67 modules, 338 models) → 6 capability tiles. Same progressive depth, different audience.

---

### 1.2 Linear.app — Homepage

**URL**: https://linear.app

**What they do well**:
- One of the cleanest SaaS websites: hero + 3 feature sections + CTA. Nothing wasted, nothing decorative
- Motion as communication: smooth fade transitions, scroll-triggered reveals, keyboard-first interactions. Every animation serves comprehension
- Speed as brand: "Linear is fast" is the promise, and every page demonstrates it. The product itself IS the marketing

**What to adopt for Perionyx**:
- Purposeful motion: use framer-motion (already in stack) for scroll-triggered reveals on product pages — capability cards fade in as you scroll
- Clean layout: hero → 3 proof points → feature grid → CTA. No carousels, no auto-play video
- Speed proof: show actual API response times (32ms median) on platform pages, not just "blazing fast"

**What to avoid**:
- Linear's homepage has almost no text — too minimal for enterprise buyers. CFOs need more information before they click
- No social proof: Linear doesn't show customer logos or metrics prominently. Enterprise buyers need trust signals
- Developer-only audience: Linear speaks to engineers. Perionyx has 5 personas to serve

**Perionyx adaptation**: Adopt Linear's clean section rhythm (hero → proof → features → CTA) and scroll-triggered motion, but add enterprise depth: metric callouts, compliance badges, persona-specific paths.

---

### 1.3 Vercel.com — Homepage

**URL**: https://vercel.com

**What they do well**:
- Technical hero with a deploy button — the primary action IS the hero. Users see the product working before they read about it
- Speed messaging is always present: response times, build times, edge latency — specific numbers, not adjectives
- Engineering blog quality is among the best in the industry: deep, narrative-driven, code-heavy

**What to adopt for Perionyx**:
- Developer credibility signals: show the tech stack prominently (Next.js 16, PostgreSQL, Redis) — same stack, different domain
- Engineering blog format: Perionyx's `/engineering` should match Vercel's blog quality — deep dives with architecture diagrams
- Open source presence: public repos, contributing guides, transparent development

**What to avoid**:
- Vercel's entire identity is "deploy." Perionyx's identity is "run your finance operations" — broader scope
- Framework lock-in perception: Vercel = Next.js. Perionyx is framework-agnostic at the integration layer
- Technical jargon density: Vercel's docs assume deep technical knowledge. Perionyx must serve non-technical finance buyers too

**Perionyx adaptation**: Match Vercel's engineering blog quality and developer credibility signals, but add finance domain depth. "How we built a financial workflow engine" is more compelling than "How we optimized build times."

---

## 2. Product Pages

### 2.1 Notion.so — Product Pages

**URL**: https://www.notion.so/product

**What they do well**:
- Use-case driven navigation: "Notion for Product Teams," "Notion for Startups" — pages organized by WHO uses it, not WHAT it does
- Template gallery: user-created templates promoted as marketing. Users see use cases before features
- Visual product: screenshots, GIFs, embedded demos everywhere. The product is always visible

**What to adopt for Perionyx**:
- Use-case page structure: "Perionyx for CFOs," "Perionyx for Controllers," "Perionyx for Treasury" — persona-first navigation
- Template gallery concept: workflow templates, approval templates, report templates that show real finance use cases
- Visual product: dashboard mockups, workflow diagrams, matching engine screenshots — the product is always visible

**What to avoid**:
- Notion's playful, casual tone. Perionyx is enterprise and precise
- Feature overwhelm: Notion's website can feel overwhelming. Perionyx should focus on outcomes
- No enterprise trust: Notion added enterprise features late. Perionyx is enterprise-first

**Perionyx adaptation**: Adopt Notion's use-case pages and template gallery concept while maintaining enterprise tone. "Perionyx for CFOs" speaks to the persona, not the feature.

---

### 2.2 Figma.com — Product Pages

**URL**: https://www.figma.com/products

**What they do well**:
- Feature comparison across plans is clear and scannable
- Collaboration focus: every feature shown in context of teamwork, not solo use
- Embeddable previews: you can see a Figma file without leaving the page

**What to adopt for Perionyx**:
- Interactive product demo pattern: show the approval workflow or matching engine in a live-ish preview
- Feature comparison: clear capability matrix across personas or deployment options
- Collaboration context: show how AP, Treasury, and Approvals work together, not in isolation

**What to avoid**:
- Figma's consumer-friendly, colorful aesthetic. Perionyx is dark-first, gold-accented
- Design-tool language. Perionyx speaks finance, not design

**Perionyx adaptation**: Interactive demo concept for product pages — click through the AP workflow from invoice receipt to payment, seeing each step in context.

---

## 3. Security/Trust Pages

### 3.1 Vercel.com — Security Page

**URL**: https://vercel.com/security

**What they do well**:
- Compliance badges (SOC 2, ISO 27001) placed prominently at the top — immediate trust signal
- Architecture diagrams show security layers visually, not just textually
- Specific controls listed: not "we take security seriously" but "AES-256-GCM encryption at rest, TLS 1.3 in transit"

**What to adopt for Perionyx**:
- Trust signal placement: compliance badges, MFA, encryption standards at the top of `/security`
- Architecture diagram: visual representation of auth → authz → encryption → audit → isolation layers
- Specific controls: list every control with its implementation detail

**What to avoid**:
- Vercel's security page is developer-focused. Perionyx must also serve CISOs and procurement teams who aren't engineers
- Generic trust statements. Every claim on Perionyx's security pages must be verifiable

**Perionyx adaptation**: Security overview page with visual layer diagram at top, compliance badges below, then deep-dive cards for each security domain. Dual-audience: technical summary for engineers, compliance summary for procurement.

---

### 3.2 Cloudflare.com — Magic Firewall Product Page

**URL**: https://www.cloudflare.com/products/magic-firewall

**What they do well**:
- Technical product page with architecture diagram + pricing on the same page
- Clear before/after: "Before Cloudflare: X. After Cloudflare: Y."
- Technical credibility: specific protocols, specific performance numbers, specific integrations

**What to adopt for Perionyx**:
- Technical credibility pattern: architecture diagram + specific numbers on platform pages
- Before/after framing: "Before Perionyx: 3 manual handoffs for AP approval. After Perionyx: automated routing in 32ms"
- Integration listing: show exactly which systems connect and how

**What to avoid**:
- Cloudflare's network-focused language. Perionyx speaks finance
- Overwhelming technical depth on the first scroll. Progressive disclosure is key

**Perionyx adaptation**: Platform pages show architecture diagram at top, specific metrics below, then integration details. Same credibility pattern, finance domain.

---

## 4. Engineering/Blog

### 4.1 Stripe.com — Engineering Blog

**URL**: https://stripe.com/blog/engineering

**What they do well**:
- Long-form technical content with code examples — essays, not listicles
- Research papers published alongside blog posts — academic credibility
- Real engineering decisions documented: "Why we chose X over Y"

**What to adopt for Perionyx**:
- Technical writing standard: 1,500-3,000 word essays with code examples, architecture diagrams, and decision rationale
- Decision documentation: "Why Decimal(38,12) instead of Float" — real engineering decisions with trade-offs
- Research depth: publish findings from customer discovery alongside engineering posts

**What to avoid**:
- Stripe's blog assumes payments-domain knowledge. Perionyx must be accessible to finance-domain readers too
- Over-indexing on internal tooling. Posts should be useful to readers, not just showcase Stripe

**Perionyx adaptation**: Engineering blog with essay-format posts: "How we built a financial workflow engine," "Why we chose banker's rounding," "From 900ms to 32ms: our performance story."

---

### 4.2 Vercel.com — Engineering Blog

**URL**: https://vercel.com/blog

**What they do well**:
- Engineering deep dives with architecture diagrams — visual + textual
- Open development: public roadmap, GitHub activity, transparent decision-making
- Product announcements integrated into engineering narrative — not separate marketing

**What to adopt for Perionyx**:
- Architecture diagrams in blog posts — every engineering post should have at least one visual
- Transparent development: public roadmap, changelog, architecture decision records
- Product + engineering integration: "We shipped X because Y engineering problem needed solving"

**What to avoid**:
- Vercel's blog is framework-centric. Perionyx's blog is finance-centric
- Over-indexing on Next.js features. Perionyx should focus on domain problems, not framework features

**Perionyx adaptation**: Engineering blog posts always include architecture diagrams, code snippets, and decision rationale. Posts connect engineering decisions to finance outcomes.

---

## 5. Design Systems

### 5.1 Linear.app — Design System

**URL**: https://linear.app

**What they do well**:
- Motion specs are documented: timing, easing, duration for every animation
- Component patterns are consistent: same card structure, same spacing, same interaction model
- Design principles are visible in the product: clarity, speed, keyboard-first

**What to adopt for Perionyx**:
- Internal design system documentation approach: document motion tokens, component patterns, and design principles
- Consistency: same page structure for all product pages, same card structure for all feature grids
- Design principles visible in the website: clarity first, speed proof, technical depth

**What to avoid**:
- Linear's minimal aesthetic doesn't serve enterprise buyers who need more context
- No trust signals in the design system. Perionyx must integrate compliance badges, security indicators, and metrics into the design language

**Perionyx adaptation**: Document PEDL tokens for the public site, maintain consistency across 97+ pages, and ensure every design decision is traceable to an enterprise buyer need.

---

## 6. Design Principles Derived from References

### Principle 1: Show, Don't Tell

| Do | Don't |
|---|---|
| Show a real API response with Decimal(38,12) values | Say "we have financial precision" |
| Show the approval workflow in a live diagram | Say "automated approval routing" |
| Display "32ms median response time" with a chart | Say "blazing fast performance" |

### Principle 2: Progressive Disclosure by Default

| Do | Don't |
|---|---|
| Hero (30 seconds) → expandable deep-dive (5 minutes) → full docs | Dump all technical details above the fold |
| Product overview shows 12 tiles; click reveals full workflow | Show full workflow on the overview page |
| Security overview shows layer diagram; sub-pages show controls | List every control on the overview page |

### Principle 3: Numbers Over Adjectives

| Do | Don't |
|---|---|
| "392 API routes, 67 modules, 338 data models" | "A comprehensive platform" |
| "64 permissions, 8 roles, 12 SoD rules" | "Robust access control" |
| "SOC 2 at 52%, ISO 27001 at 45%" | "We're working on compliance" |

### Principle 4: Dual-Audience Hero Structure

| Do | Don't |
|---|---|
| Hero speaks to CFO ("finance platform your team will actually use") + metric strip speaks to engineers | Hero speaks only to developers (like Vercel) or only to buyers (like Palantir) |
| Product pages have 30-second summary AND 5-minute deep-dive | Force everyone through the same content depth |

### Principle 5: Motion Serves Comprehension

| Do | Don't |
|---|---|
| Scroll-triggered reveals: capability cards fade in as you scroll | Auto-playing carousels or video backgrounds |
| Page transitions: smooth fade between pages (framer-motion) | Slide-in pop-ups or attention-grabbing animations |
| Metric counters animate on scroll-into-view | Static metrics that don't draw attention |

### Principle 6: Trust Signals Are Structural, Not Decorative

| Do | Don't |
|---|---|
| Compliance badges in the security hero section | Compliance badges hidden in the footer |
| "AES-256-GCM" stated explicitly on encryption page | "Industry-standard encryption" |
| Append-only audit records explained with Prisma schema | "Comprehensive audit logging" |

### Principle 7: Code Is Content

| Do | Don't |
|---|---|
| Show a real API request/response on platform pages | Show a stock photo of someone coding |
| Show Decimal(38,12) in a code block on the GL page | Describe precision in marketing copy |
| Architecture diagrams use real component names | Abstract bubble diagrams with no technical content |

### Principle 8: Dark-First, Gold for Action

| Do | Don't |
|---|---|
| `#040404` background with `#d4af37` CTAs | White backgrounds with colorful gradients |
| Glass-surface cards with translucent borders | Flat white cards with drop shadows |
| Gold reserved for: CTAs, metrics, active states, key accents | Gold used decoratively (backgrounds, borders, icons) |

### Principle 9: Every Page Answers One Question

| Do | Don't |
|---|---|
| `/product/treasury` answers: "Can Perionyx handle my treasury operations?" | `/product/treasury` tries to explain the entire platform |
| `/security/encryption` answers: "How is my data encrypted?" | `/security/encryption` is a general security overview |
| `/ai/explainability` answers: "Can I see why AI made this recommendation?" | `/ai/explainability` lists all AI features |

### Principle 10: Enterprise Confidence, Not Startup Excitement

| Do | Don't |
|---|---|
| "Approvals that move at the speed of your business" | "Revolutionize your approval workflows!" |
| "Every action logged. Every change traceable." | "We're on a mission to transform financial governance" |
| "No phantom cents. No accumulation drift." | "Our cutting-edge precision technology" |

---

## 7. Cross-Reference: Perionyx Design System Alignment

| Reference Source | Perionyx Component | PEDL Token Mapping |
|---|---|---|
| Stripe metric callouts | Homepage metric strip | `text-[#d4af37]` on numbers, `text-zinc-400` on labels |
| Linear scroll reveals | Product page capability cards | `framer-motion` `whileInView` with `fadeInUp` variant |
| Vercel architecture diagrams | Platform page diagrams | SVG on `#040404` background, gold accent lines |
| Notion use-case pages | Persona paths on `/product` | Section cards: "For CFOs" / "For Controllers" |
| Cloudflare before/after | Product page workflow diagrams | Left: manual process, Right: Perionyx automated |
| Stripe blog format | Engineering blog posts | 1,500-3,000 words, code blocks, architecture diagrams |
| Linear design consistency | All 97 pages | Same page template, same card structure, same spacing |

---

*Last updated: 2026-07-22*
