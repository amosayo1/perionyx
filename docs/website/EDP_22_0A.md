# Engineering Decision Packet — Phase 22.0A

## Public Platform Architecture

| Field | Value |
|---|---|
| **Decision Title** | Phase 22.0A — Perionyx Public Platform Architecture |
| **Date** | July 2026 |
| **Status** | Complete |
| **Author** | Perionyx Engineering |
| **Phase** | 22.0A — Architecture (no code) |

---

## 1. Context

Perionyx had 392 API routes, 67 modules, 338 Prisma models, 79 Brain lessons, 13 principles, 10 rules — but no public-facing website. The platform was invisible to the outside world. Enterprise buyers, CTOs, security evaluators, and finance leaders had no way to understand what Perionyx does, how it's built, or why it's different.

We needed a comprehensive architecture document set to guide the build of a public website that:

1. Communicates 12 product domains to 5 personas
2. Shows technical depth for CTOs and engineers
3. Builds trust with CISOs and procurement teams
4. Explains AI philosophy to skeptical finance leaders
5. Ranks for 50+ target keywords across 6 categories
6. Maintains consistency across 97+ pages

The Brain was the source of truth for all content, but it wasn't designed for public consumption. We needed a curation layer — not a copy-paste layer.

---

## 2. Decision

We chose a **25-document architecture-first approach** covering information architecture, content strategy, design language, copywriting, competitive analysis, and implementation roadmap. All 25 documents were created before any code was written.

### Document Set (25 Documents)

| # | Document | Purpose |
|---|---|---|
| 1 | `SITE_MAP.md` | Complete URL inventory: 97 URLs across 9 sections with metadata |
| 2 | `PAGE_HIERARCHY.md` | Detailed page specs: audience, goal, content sections, SEO, CTAs |
| 3 | `NAVIGATION_MODEL.md` | Navigation system: mega menus, mobile drawer, breadcrumbs, search |
| 4 | `CONTENT_STRATEGY.md` | 6 content pillars, pipeline rules, voice/tone framework |
| 5 | `COPYWRITING_GUIDE.md` | Writing rules, sentence construction, word lists |
| 6 | `DESIGN_LANGUAGE.md` | Visual system: tokens, layouts, page templates, component specs |
| 7 | `BRANDING_GUIDELINES.md` | Logo usage, color palette, typography, spacing |
| 8 | `VISUAL_DIRECTION.md` | Photography style, illustration approach, iconography |
| 9 | `ICONOGRAPHY_GUIDE.md` | Icon library, usage rules, size/weight specifications |
| 10 | `ILLUSTRATION_GUIDE.md` | Diagram style, architecture illustration, workflow visuals |
| 11 | `MOTION_SYSTEM.md` | Animation tokens, easing, duration, component-level specs |
| 12 | `COMPETITOR_WEBSITE_ANALYSIS.md` | 8 competitor websites: patterns, lessons, differentiation |
| 13 | `REFERENCE_EXPERIENCE.md` | Best web experiences across categories for design inspiration |
| 14 | `KEYWORD_STRATEGY.md` | 100+ keywords mapped to pages with priority and intent |
| 15 | `SEO_STRATEGY.md` | Technical SEO, structured data, sitemap, robots.txt |
| 16 | `ACCESSIBILITY_GUIDE.md` | WCAG 2.1 AA compliance, keyboard nav, screen reader |
| 17 | `USER_JOURNEYS.md` | 5 persona paths through the website |
| 18 | `CALL_TO_ACTION_STRATEGY.md` | CTA hierarchy, placement, A/B testing |
| 19 | `MICROCOPY_GUIDE.md` | Button labels, error messages, form labels, tooltips |
| 20 | `CONTENT_GOVERNANCE.md` | RACI matrix, review process, freshness rules |
| 21 | `PUBLIC_CONTENT_POLICY.md` | Brain → public content pipeline, traceability |
| 22 | `WEBSITE_INFORMATION_ARCHITECTURE.md` | IA rationale, grouping logic, findability |
| 23 | `WEBSITE_ROADMAP.md` | 16-week phased implementation plan |
| 24 | `EDP_22_0A.md` | This document — phase summary and decisions |
| 25 | `CONTENT_BRIEFS.md` | Production-ready briefs for 10 highest-priority pages |

---

## 3. Alternatives Considered

### 3.1 Build Website First, Document After

**Approach**: Start coding immediately. Write docs as needed or after launch.

**Why rejected**: Inconsistent page structure, no design language, no SEO strategy, copy drift. The website would need to be rewritten once patterns emerged.

**Risk realized elsewhere**: Most startup websites go through 3-4 full redesigns in year 1 because they didn't establish patterns first.

### 3.2 Hire Agency, Hand Off Specs

**Approach**: Brief an agency on requirements, let them design and build.

**Why rejected**: No internal knowledge capture. The team wouldn't understand why decisions were made. Maintenance and iteration would require the agency for every change. Content updates would be blocked by agency availability.

### 3.3 Design-As-You-Go

**Approach**: Build pages one at a time, making design decisions per page.

**Why rejected**: No coherence across pages. Each page would look slightly different. Mega menu, navigation, and footer would evolve inconsistently. SEO strategy would be fragmented.

### 3.4 Comprehensive Architecture-First (Chosen)

**Approach**: Design the entire system before building any page. 25 documents covering every aspect of the website.

**Why chosen**: Consistent public voice, reusable design system, clear page ownership, SEO strategy locked in upfront. Every page follows the same template. Every piece of copy follows the same rules. Every design decision is traceable.

**Trade-off accepted**: Upfront investment of 3-4 weeks before any pages exist. May need iteration once real content is written and real users arrive.

---

## 4. Consequences

### 4.1 Positive

- **Consistent public voice**: Every page follows the same copywriting rules, tone, and structure
- **Reusable design system**: 40+ components built once, used across 97+ pages
- **Clear page ownership**: Every page has a defined audience, goal, and content structure
- **SEO strategy locked in**: 100+ keywords mapped to specific pages with priority levels
- **Brain traceability**: Every public page traces to a Brain source document
- **Accessibility baseline**: WCAG 2.1 AA compliance designed in, not bolted on
- **Competitive differentiation**: 5 unique advantages identified and positioned
- **Scalable content pipeline**: New pages follow established templates and governance

### 4.2 Negative

- **Upfront investment**: 3-4 weeks of documentation before any pages exist
- **Potential over-specification**: Some decisions may need iteration once real content is written
- **Design drift risk**: PEDL tokens may need adjustment for public site context
- **Content volume**: 80,000-120,000 words of content to write across 97+ pages

### 4.3 Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Over-documentation without execution | Medium | High | Time-box Phase 22.0A to 2 weeks; move to implementation in 22.0B |
| Design drift from PEDL | Low | Medium | Public site tokens extend PEDL, never contradict it |
| Content freshness with 97+ pages | High | Medium | Quarterly audit cycle, Brain → public sync pipeline |
| Keyword competition for primary terms | High | Medium | Long-tail strategy, depth over breadth, engineering blog for authority |
| Agency/team turnover | Low | High | All decisions documented in EDP format, Brain-aligned |

---

## 5. Key Decisions

### Decision 1: Brain as Source of Truth

The website is a curated public view of the Brain. Never a verbatim copy. Never independent knowledge. When the Brain updates, public content is flagged for refresh.

**Rationale**: The Brain has 79 lessons, 13 principles, 10 rules — accumulated through 20+ phases of engineering. This institutional knowledge must be the foundation of public content. Marketing copy that contradicts engineering reality destroys trust.

**Trade-off**: Content pipeline is slower (curate → summarize → publish) but more accurate.

### Decision 2: Dark-First (#040404) with Gold Accent (#d4af37)

The public site uses the same color palette as the product. `#040404` primary background. `#d4af37` gold for CTAs, metrics, and active states. Glass surfaces with translucent borders.

**Rationale**: The website IS the product aesthetic. Enterprise finance buyers should feel the same visual language on the website as they will in the product. Continuity builds trust.

**Trade-off**: Dark backgrounds require careful contrast management for accessibility. White text on `#040404` passes WCAG AAA.

### Decision 3: No Stock Imagery

The website uses diagrams, code snippets, and metrics only. No stock photos of people in suits. No generic cityscape backgrounds. No handshakes.

**Rationale**: Stock imagery signals "we didn't build anything worth showing." Perionyx has real architecture, real code, real metrics. Show those instead.

**Trade-off**: Diagrams and code require more creation effort than stock photos.

### Decision 4: Inter + JetBrains Mono

Typography: Inter for body text, JetBrains Mono for code and metrics. Already used in the product.

**Rationale**: Consistency between product and website. Inter is highly legible at all sizes. JetBrains Mono is optimized for code readability. Both are available via `next/font`.

**Trade-off**: Limited typographic personality. Acceptable for enterprise finance.

### Decision 5: WCAG 2.1 AA Minimum

Accessibility is designed in, not bolted on. Skip links, focus management, ARIA landmarks, keyboard navigation, screen reader testing — all from Phase 1.

**Rationale**: Enterprise buyers include procurement teams who evaluate accessibility compliance. Finance teams include people with disabilities. Legal risk of inaccessible websites is increasing.

**Trade-off**: Accessibility adds ~15% to component development time.

### Decision 6: 97 URLs Across 9 Sections

The site map covers 71 static pages, 6 utility pages, and dynamic blog posts. 9 sections: Home, Product (12), Platform (12), Security (11), AI (9), Engineering (8), Research (4), Company (8), Utility (6).

**Rationale**: Comprehensive coverage of all 12 product domains, all technical architecture, all security controls, and all AI capabilities. Enterprise buyers need depth, not breadth.

**Trade-off**: Large content volume. Mitigated by page templates and consistent structure.

### Decision 7: 5 Persona-Targeted Journeys

The website supports 5 persona paths: CFO, Controller, Treasury Manager, Security Professional, Engineer. Each path leads through different sections of the site.

**Rationale**: Enterprise buying decisions involve multiple stakeholders. The CFO sees the business case. The CTO sees the architecture. The CISO sees the security. The Controller sees the workflow. Each needs a tailored journey.

**Trade-off**: More complex navigation and content structure. Mitigated by mega menus and persona paths on the product overview page.

### Decision 8: Content Governance via RACI

Every page has a content owner (R), reviewer (A), contributor (C), and informed party (I). Quarterly freshness audits. Brain → public sync pipeline.

**Rationale**: 97+ pages will decay without governance. Stale content is worse than no content for enterprise buyers.

**Trade-off**: Governance overhead. Mitigated by automation (Brain update → flag for review).

### Decision 9: 16-Week Phased Rollout

Phase 1 (Weeks 1-3): Foundation. Phase 2 (Weeks 4-6): Core pages. Phase 3 (Weeks 7-10): Product deep dives. Phase 4 (Weeks 11-13): Intelligence & research. Phase 5 (Weeks 14-16): Polish & launch.

**Rationale**: Incremental delivery allows early feedback. Foundation-first ensures consistency. Content-heavy phases get more time.

**Trade-off**: 4 months before public launch. Acceptable for enterprise-grade quality.

### Decision 10: No External Dependencies for Design

The design system uses PEDL tokens (already in the product), Lucide icons (already in the product), and framer-motion (already in the product). No new design dependencies.

**Rationale**: The public site should feel like an extension of the product, not a separate entity. Same tokens, same icons, same motion library.

**Trade-off**: Limited to existing tool capabilities. Acceptable — PEDL was designed for enterprise-grade interfaces.

---

## 6. Brain Integration

### Lessons Informing This Phase

| Lesson | How It Informed |
|---|---|
| Lesson 1: Build the website as a curated window into the Brain | Content pipeline: Brain → curation → public content |
| Lesson 8: Domain scaffolding ≠ domain functionality | Product pages show real workflows, not feature lists |
| Lesson 26: Financial precision is non-negotiable | Decimal(38,12) is a headline, not a footnote |
| Lesson 32: Domain architecture design precedes implementation | Architecture-first: 25 docs before any code |

### Principles Applied

| Principle | Application |
|---|---|
| #1: Clarity over beauty | Every page answers one question; no decorative elements |
| #5: Modules are not workflows | Product pages show end-to-end workflows, not module lists |
| #8: Scaffolding ≠ functionality | Website shows real capabilities, not planned features |
| #9: Architecture before code | 25-document architecture before any implementation |

### Rules Followed

| Rule | Application |
|---|---|
| Rule 1: One implementation per primitive | Design system components used consistently across all pages |
| Rule 3: Financial precision is non-negotiable | All monetary values shown with Decimal(38,12) |
| Rule 7: Cross-cutting UX has broad but shallow impact | Mega menu, search, and navigation benefit all personas |

---

## 7. Next Steps

### Phase 22.0B — Home Page Implementation

- Implement homepage with hero, metric strip, capability tiles, trust signals
- Deploy to staging for internal review
- A/B test hero copy (3 options)

### Phase 22.0C — Product Pages

- Implement product page template
- Build first 3 product pages (AP, Treasury, Approvals)
- Validate content with finance domain experts

### Phase 22.0D — Platform Pages

- Implement platform page template
- Build architecture and performance pages
- Create architecture diagram components

### Phase 22.0E — Security & AI Sections

- Implement security page template
- Build all 11 security sub-pages
- Build AI section with provider grid and governance model

### Phase 22.0F — Engineering, Research & Launch

- Implement blog infrastructure
- Build engineering and research sections
- Performance optimization and accessibility audit
- Soft launch → public launch

---

## 8. Files Reference

| File | Description |
|---|---|
| `docs/website/SITE_MAP.md` | 97 URLs across 9 sections with full metadata |
| `docs/website/PAGE_HIERARCHY.md` | Page specs: audience, goal, sections, SEO, CTAs for all 71 pages |
| `docs/website/NAVIGATION_MODEL.md` | Global nav, mega menus, mobile drawer, breadcrumbs, search |
| `docs/website/CONTENT_STRATEGY.md` | 6 content pillars, pipeline rules, voice/tone framework |
| `docs/website/COPYWRITING_GUIDE.md` | Writing rules, sentence construction, word lists, examples |
| `docs/website/DESIGN_LANGUAGE.md` | Visual system: tokens, layouts, page templates, components |
| `docs/website/BRANDING_GUIDELINES.md` | Logo, colors, typography, spacing rules |
| `docs/website/VISUAL_DIRECTION.md` | Photography, illustration, iconography approach |
| `docs/website/ICONOGRAPHY_GUIDE.md` | Icon library, usage rules, size specifications |
| `docs/website/ILLUSTRATION_GUIDE.md` | Diagram style, architecture illustration |
| `docs/website/MOTION_SYSTEM.md` | Animation tokens, easing, duration, component specs |
| `docs/website/COMPETITOR_WEBSITE_ANALYSIS.md` | 8 competitor websites analyzed |
| `docs/website/REFERENCE_EXPERIENCE.md` | Best web experiences for design inspiration |
| `docs/website/KEYWORD_STRATEGY.md` | 100+ keywords mapped to pages |
| `docs/website/SEO_STRATEGY.md` | Technical SEO, structured data, sitemap |
| `docs/website/ACCESSIBILITY_GUIDE.md` | WCAG 2.1 AA compliance guide |
| `docs/website/USER_JOURNEYS.md` | 5 persona paths through the website |
| `docs/website/CALL_TO_ACTION_STRATEGY.md` | CTA hierarchy, placement, testing |
| `docs/website/MICROCOPY_GUIDE.md` | Button labels, error messages, tooltips |
| `docs/website/CONTENT_GOVERNANCE.md` | RACI matrix, review process, freshness rules |
| `docs/website/PUBLIC_CONTENT_POLICY.md` | Brain → public content pipeline |
| `docs/website/WEBSITE_INFORMATION_ARCHITECTURE.md` | IA rationale, grouping logic |
| `docs/website/WEBSITE_ROADMAP.md` | 16-week phased implementation plan |
| `docs/website/EDP_22_0A.md` | This document — phase summary |
| `docs/website/CONTENT_BRIEFS.md` | Production-ready briefs for 10 pages |

---

*Last updated: 2026-07-22*
