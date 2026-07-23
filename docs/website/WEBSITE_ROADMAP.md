# Perionyx Public Website — Implementation Roadmap

> **Phase**: 22.0A — Public Platform Architecture
> **Status**: Architecture (no code)
> **Last Updated**: 2026-07-22
> **Total Duration**: 16 weeks (4 months)
> **Total Pages**: 97+ (71 static + dynamic blog)

---

## Overview

This roadmap phases the build of the Perionyx public website from zero to production-ready. Each phase has specific deliverables, success criteria, team requirements, dependencies, and risks. The plan assumes a small team (2-3 engineers + 1 designer + 1 content writer) working full-time.

**Tech stack**: Next.js 16, MDX, Tailwind CSS, framer-motion, Lucide icons
**Deployment**: Vercel (or self-hosted Next.js)
**Content**: MDX files with frontmatter schema, versioned in git

---

## Phase 1: Foundation (Weeks 1-3)

### Goal
Deployable shell with navigation, footer, and placeholder pages. Design system implemented. All infrastructure ready for content.

### Deliverables

| # | Deliverable | Files/Components | Est. Lines |
|---|---|---|---|
| 1 | Next.js 16 project setup | `next.config.ts`, `tsconfig.json`, `tailwind.config.ts` | ~100 |
| 2 | Design system tokens | `src/styles/tokens.css` — colors, typography, spacing, shadows | ~200 |
| 3 | PEDL component library | `src/components/ui/` — Button, Card, Badge, Container, Grid, Section | ~1,500 |
| 4 | Layout components | `src/components/layout/` — Navbar, Footer, MegaMenu, MobileDrawer, Breadcrumbs | ~2,000 |
| 5 | Mega menu system | `src/components/layout/mega-menu.tsx` — 7 mega menus with glass surface styling | ~800 |
| 6 | Page template | `src/components/layout/page-template.tsx` — consistent page wrapper | ~200 |
| 7 | MDX infrastructure | `src/lib/mdx.ts` — frontmatter schema, content pipeline, page generation | ~400 |
| 8 | Frontmatter schema | Zod validation: title, description, audience, section, lastUpdated, source | ~100 |
| 9 | SEO infrastructure | `src/lib/seo.ts` — metadata generation, structured data (JSON-LD), canonical URLs | ~300 |
| 10 | Sitemap generation | `src/app/sitemap.ts` — dynamic sitemap from MDX files | ~100 |
| 11 | Robots.txt | `src/app/robots.ts` — crawl rules, sitemap reference | ~30 |
| 12 | Search infrastructure | `src/components/search/` — Command palette (Cmd+K), full-text index | ~500 |
| 13 | Accessibility baseline | Skip link, focus management, ARIA landmarks, axe-core integration | ~200 |
| 14 | Placeholder pages | All 71 pages with correct titles and meta descriptions | ~500 |
| 15 | Redirect configuration | `next.config.ts` redirects from old URLs to new | ~50 |

### Success Criteria
- [ ] `pnpm build` passes with zero errors
- [ ] All 71 placeholder pages render with correct titles
- [ ] Navbar + mega menus functional on desktop and mobile
- [ ] Footer renders with all links and newsletter input
- [ ] Search (Cmd+K) returns results across all pages
- [ ] Skip link visible on focus, all interactive elements keyboard-accessible
- [ ] Lighthouse accessibility score ≥ 90
- [ ] Page loads under 2.5s LCP on 3G

### Team Requirements
- **Engineer 1**: Next.js setup, MDX infrastructure, SEO
- **Engineer 2**: Design system, component library, layout components
- **Designer**: Token definitions, mega menu layouts, mobile drawer

### Dependencies
- PEDL v1.0 design tokens (from `docs/website/DESIGN_LANGUAGE.md`)
- Navigation model (from `docs/website/NAVIGATION_MODEL.md`)
- Site map with all 97 URLs (from `docs/website/SITE_MAP.md`)

### Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| MDX pipeline complexity | Medium | High | Start with simple frontmatter, iterate |
| Mega menu accessibility | Medium | Medium | Test with screen readers early, use WAI-ARIA menu pattern |
| Mobile drawer focus trap | Low | Medium | Use existing enterprise drawer component as reference |
| Search performance with 71+ pages | Low | Low | Client-side search is sufficient for this scale |

---

## Phase 2: Core Pages (Weeks 4-6)

### Goal
15-20 pages live with real content. Homepage, product overview, security overview, engineering hub, and company pages complete.

### Deliverables

| # | Deliverable | Pages | Est. Words |
|---|---|---|---|
| 1 | Homepage | `/` | 800-1,200 |
| 2 | Product overview | `/product` | 1,500-2,000 |
| 3 | Security overview | `/security` | 1,500-2,000 |
| 4 | Platform overview | `/platform` | 1,500-2,000 |
| 5 | Engineering hub | `/engineering` | 800-1,200 |
| 6 | AI overview | `/ai` | 1,000-1,500 |
| 7 | Research hub | `/research` | 800-1,200 |
| 8 | Company about | `/company` | 1,000-1,500 |
| 9 | Company mission | `/company/mission` | 800-1,200 |
| 10 | Company team | `/company/team` | 600-1,000 |
| 11 | Company careers | `/company/careers` | 1,000-1,500 |
| 12 | Company contact | `/company/contact` | 400-600 |
| 13 | Changelog | `/changelog` | 500 (template) |
| 14 | Roadmap | `/roadmap` | 500 (template) |
| 15 | System status | `/status` | 300 (template) |
| 16 | Privacy policy | `/privacy` | 1,500-2,000 |
| 17 | Terms of service | `/terms` | 2,000-3,000 |
| 18 | Responsible disclosure | `/responsible-disclosure` | 800-1,200 |

### Content Guidelines
- All content follows `CONTENT_STRATEGY.md` voice and tone rules
- All pages follow `PAGE_HIERARCHY.md` section structure
- All SEO metadata follows `KEYWORD_STRATEGY.md` target keywords
- All CTAs follow `CALL_TO_ACTION_STRATEGY.md` patterns
- Every page references its Brain source document in frontmatter

### Success Criteria
- [ ] 18 pages live with real content (not placeholder text)
- [ ] Homepage passes the "10-second test": visitor knows what Perionyx is, who it's for, why it's different
- [ ] All pages have complete SEO metadata (title, description, OG image, structured data)
- [ ] All pages pass axe-core accessibility check
- [ ] All internal links resolve correctly
- [ ] Lighthouse performance score ≥ 90
- [ ] Content reviewed by at least one finance domain expert

### Team Requirements
- **Engineer 1**: Homepage implementation, component development
- **Engineer 2**: MDX pages, SEO structured data, analytics setup
- **Designer**: Homepage layout, product overview layout, icon selection
- **Content writer**: All 18 pages of copy, following copywriting guide

### Dependencies
- Phase 1 complete (shell, design system, layout)
- Brand assets (logo, favicon, OG images)
- Company information (team bios, founding story, legal text)
- Content strategy document finalized

### Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Homepage hero copy iteration | High | Medium | Write 3 options, A/B test after launch |
| Content quality with tight timeline | Medium | High | Use content briefs from CONTENT_BRIEFS.md |
| Legal page accuracy | Low | High | Have legal review privacy/terms before publish |
| OG image design bottleneck | Medium | Low | Use template-based OG images initially |

---

## Phase 3: Product Deep Dives (Weeks 7-10)

### Goal
All 12 product sub-pages and 12 platform sub-pages live. Product section complete. Code examples and API documentation pages functional.

### Deliverables

| # | Deliverable | Pages | Est. Words |
|---|---|---|---|
| **Product Pages (12)** | | | |
| 1 | Accounts Payable | `/product/accounts-payable` | 1,500-2,000 |
| 2 | Accounts Receivable | `/product/accounts-receivable` | 1,500-2,000 |
| 3 | Treasury | `/product/treasury` | 1,500-2,000 |
| 4 | Approvals | `/product/approvals` | 1,500-2,000 |
| 5 | Risk | `/product/risk` | 1,500-2,000 |
| 6 | Compliance | `/product/compliance` | 1,500-2,000 |
| 7 | Reconciliation | `/product/reconciliation` | 1,500-2,000 |
| 8 | Audit | `/product/audit` | 1,500-2,000 |
| 9 | Executive Intelligence | `/product/executive-intelligence` | 1,500-2,000 |
| 10 | General Ledger | `/product/general-ledger` | 1,500-2,000 |
| 11 | Cash Management | `/product/cash-management` | 1,500-2,000 |
| 12 | Reporting | `/product/reporting` | 1,500-2,000 |
| **Platform Pages (12)** | | | |
| 13 | Architecture | `/platform/architecture` | 2,000-3,000 |
| 14 | Performance | `/platform/performance` | 2,000-3,000 |
| 15 | Reliability | `/platform/reliability` | 1,500-2,000 |
| 16 | Integrations | `/platform/integrations` | 1,500-2,000 |
| 17 | Connectors | `/platform/connectors` | 1,500-2,000 |
| 18 | API Docs | `/platform/api` | 3,000-5,000 |
| 19 | Developer Experience | `/platform/developer` | 2,000-3,000 |
| 20 | Deployment | `/platform/deployment` | 1,500-2,000 |
| 21 | Infrastructure | `/platform/infrastructure` | 2,000-3,000 |
| 22 | Observability | `/platform/observability` | 1,500-2,000 |
| 23 | Security Architecture | `/platform/security` | 2,000-3,000 |
| **Components** | | | |
| 24 | Product page template | Reusable for all 12 product pages | ~500 |
| 25 | Platform page template | Reusable for all 12 platform pages | ~500 |
| 26 | Code block component | Syntax-highlighted code examples | ~300 |
| 27 | Architecture diagram component | SVG-based architecture diagrams | ~200 |
| 28 | Metric card component | Animated metric counters | ~150 |
| 29 | Workflow diagram component | Step-by-step workflow visuals | ~400 |

### Content Guidelines
- Product pages follow the template: hero → workflow diagram → capabilities → how it works → integrations → trust signals → CTA
- Platform pages follow: hero → architecture diagram → key metrics → deep-dive sections → design decisions → CTA
- Code examples are real, not synthetic — actual API calls with actual responses
- Architecture diagrams use real component names from the codebase

### Success Criteria
- [ ] 24 new pages live (12 product + 12 platform)
- [ ] All product pages have workflow diagrams
- [ ] All platform pages have architecture diagrams
- [ ] API documentation page lists all 392 endpoints (at least categorized)
- [ ] Code examples render with syntax highlighting
- [ ] All pages pass axe-core accessibility check
- [ ] All internal cross-links between product and platform sections work
- [ ] Lighthouse performance score ≥ 90 on all new pages

### Team Requirements
- **Engineer 1**: Product page template, components, diagram components
- **Engineer 2**: Platform pages, API documentation, code block rendering
- **Designer**: Workflow diagrams, architecture diagrams, metric cards
- **Content writer**: 24 pages of copy, code example validation

### Dependencies
- Phase 2 complete (core pages, design system proven)
- Brain architecture documents for platform page accuracy
- Brain domain architecture documents for product page accuracy
- Real API examples from existing codebase

### Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API docs accuracy with 392 endpoints | High | Medium | Auto-generate endpoint list from route files |
| Architecture diagram creation time | Medium | High | Use text-based diagrams initially, upgrade to SVG later |
| Content volume (24 pages in 4 weeks) | High | Medium | Use page templates to parallelize writing |
| Code example validity over time | Medium | Low | Version code examples, test in CI |

---

## Phase 4: Intelligence & Research (Weeks 11-13)

### Goal
AI section complete (9 sub-pages). Research section complete (4 sub-pages). Initial blog posts published. Changelog and roadmap functional.

### Deliverables

| # | Deliverable | Pages | Est. Words |
|---|---|---|---|
| **AI Pages (9)** | | | |
| 1 | AI Capabilities | `/ai/capabilities` | 1,500-2,000 |
| 2 | AI Providers | `/ai/providers` | 1,500-2,000 |
| 3 | AI Models | `/ai/models` | 2,000-3,000 |
| 4 | AI Governance | `/ai/governance` | 1,500-2,000 |
| 5 | AI Privacy | `/ai/privacy` | 1,000-1,500 |
| 6 | AI Explainability | `/ai/explainability` | 1,500-2,000 |
| 7 | AI Benchmarks | `/ai/benchmarks` | 1,500-2,000 |
| 8 | AI Roadmap | `/ai/roadmap` | 800-1,200 |
| **Security Pages (11)** | | | |
| 9 | Authentication & MFA | `/security/authentication` | 1,500-2,000 |
| 10 | Access Control | `/security/authorization` | 1,500-2,000 |
| 11 | Data Encryption | `/security/encryption` | 1,500-2,000 |
| 12 | Tamper-Evident Audit | `/security/audit-trail` | 1,500-2,000 |
| 13 | Tenant Isolation | `/security/multi-tenancy` | 1,500-2,000 |
| 14 | API Security | `/security/api-security` | 1,500-2,000 |
| 15 | Infrastructure Security | `/security/infrastructure` | 1,500-2,000 |
| 16 | Compliance Roadmap | `/security/compliance` | 2,000-3,000 |
| 17 | Dependency Security | `/security/dependency-scanning` | 1,000-1,500 |
| 18 | Incident Response | `/security/incident-response` | 1,500-2,000 |
| **Research Pages (4)** | | | |
| 19 | Research Insights | `/research/insights` | 2,000-3,000 |
| 20 | Customer Stories | `/research/customer-stories` | 1,500-2,000 |
| 21 | Market Analysis | `/research/market` | 2,000-3,000 |
| **Engineering Pages (7)** | | | |
| 22 | Architecture Decisions | `/engineering/architecture` | 2,000-3,000 |
| 23 | Performance Engineering | `/engineering/performance` | 2,000-3,000 |
| 24 | Testing Strategy | `/engineering/testing` | 1,500-2,000 |
| 25 | Infrastructure Engineering | `/engineering/infrastructure` | 2,000-3,000 |
| 26 | Open Source | `/engineering/open-source` | 1,000-1,500 |
| 27 | Contribute | `/engineering/contribute` | 1,500-2,000 |
| 28 | Blog listing | `/engineering/blog` | 500 (template) |
| **Blog Posts** | | | |
| 29 | "Why Decimal(38,12)" | `/engineering/blog/decimal-precision` | 2,000-2,500 |
| 30 | "From 900ms to 32ms" | `/engineering/blog/performance-journey` | 2,000-2,500 |
| 31 | "How We Built Our Workflow Engine" | `/engineering/blog/workflow-engine` | 2,000-2,500 |
| 32 | "47 Finance Leaders Told Us" | `/research/finance-pain-points` | 2,000-2,500 |
| 33 | "AI Governance in Finance" | `/engineering/blog/ai-governance` | 2,000-2,500 |
| **Infrastructure** | | | |
| 34 | Blog post MDX template | Reusable template with frontmatter | ~200 |
| 35 | Blog listing with filtering | Category, date, search | ~400 |
| 36 | Changelog data source | Structured changelog entries | ~300 |

### Success Criteria
- [ ] 28+ new pages live (9 AI + 11 security + 4 research + 7 engineering + blog posts)
- [ ] AI section shows provider grid, model registry, governance model
- [ ] Security section shows all 11 sub-pages with deep technical content
- [ ] Research section has at least 3 data-driven posts
- [ ] Engineering blog has at least 5 posts
- [ ] Blog listing filters by category and date
- [ ] All pages pass axe-core accessibility check
- [ ] Lighthouse performance score ≥ 90

### Team Requirements
- **Engineer 1**: Blog infrastructure, changelog system, filtering
- **Engineer 2**: Security pages, AI pages, research pages
- **Designer**: AI provider grid, security layer diagrams, research data visualizations
- **Content writer**: 28+ pages of copy, 5 blog posts

### Dependencies
- Phase 3 complete (product and platform sections proven)
- Brain AI architecture documents for AI page accuracy
- Brain security audit documents for security page accuracy
- Brain customer discovery documents for research page accuracy
- Real benchmark data for AI benchmarks page

### Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Security page accuracy | Medium | High | Cross-reference with security audit documents |
| AI benchmark data availability | High | Medium | Use representative data with clear labeling |
| Blog post quality bar | Medium | Medium | Write 2 posts in Phase 2 as practice runs |
| Content freshness for rapidly evolving AI section | Medium | Low | Mark AI pages with "last verified" dates |

---

## Phase 5: Polish & Launch (Weeks 14-16)

### Goal
Production-ready public website. Performance optimized. Accessibility audited. Analytics configured. Soft launch → public launch.

### Deliverables

| # | Deliverable | Effort | Details |
|---|---|---|---|
| **Performance** | | | |
| 1 | Core Web Vitals optimization | 2 days | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| 2 | Image optimization | 1 day | Next.js Image component, WebP/AVIF, lazy loading |
| 3 | Font optimization | 0.5 days | `next/font` for Inter + JetBrains Mono, subset, preconnect |
| 4 | Bundle analysis | 0.5 days | `@next/bundle-analyzer`, remove unused deps |
| 5 | CDN configuration | 0.5 days | Edge caching, stale-while-revalidate, cache headers |
| **Accessibility** | | | |
| 6 | WCAG 2.1 AA audit | 2 days | axe-core automated + manual keyboard/screen reader testing |
| 7 | Color contrast fixes | 0.5 days | Verify all text meets 4.5:1 ratio on `#040404` |
| 8 | Focus management fixes | 0.5 days | Mega menu, mobile drawer, search, modals |
| 9 | Screen reader testing | 1 day | NVDA + VoiceOver on all page templates |
| **SEO** | | | |
| 10 | Technical SEO audit | 1 day | Screaming Frog crawl, redirect chain check, canonical validation |
| 11 | Structured data validation | 0.5 days | JSON-LD for Organization, Product, FAQ, BreadcrumbList |
| 12 | Sitemap submission | 0.5 days | Google Search Console, Bing Webmaster Tools |
| 13 | robots.txt validation | 0.25 days | Ensure all public paths crawlable, no accidental noindex |
| **Analytics** | | | |
| 14 | Analytics setup | 1 day | Google Analytics 4 or Plausible, event tracking |
| 15 | Conversion events | 0.5 days | Demo requests, contact form submissions, newsletter signups |
| 16 | Funnel tracking | 0.5 days | Homepage → Product → Demo funnel |
| 17 | UTM parameter support | 0.25 days | Campaign tracking for marketing |
| **Cross-browser** | | | |
| 18 | Chrome, Firefox, Safari, Edge testing | 1 day | All page templates, all breakpoints |
| 19 | Mobile testing | 1 day | iOS Safari, Android Chrome, real devices |
| **Launch** | | | |
| 20 | Soft launch (beta) | 1 day | Invite-only, design partners, feedback collection |
| 21 | Feedback iteration | 2 days | Address critical feedback from soft launch |
| 22 | Public launch | 1 day | Remove beta gates, announce on social, email list |

### Success Criteria
- [ ] Lighthouse Performance ≥ 95 (all pages)
- [ ] Lighthouse Accessibility ≥ 95 (all pages)
- [ ] Lighthouse SEO = 100 (all pages)
- [ ] Lighthouse Best Practices ≥ 95 (all pages)
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1 (all pages)
- [ ] WCAG 2.1 AA compliance verified
- [ ] Zero axe-core critical or serious violations
- [ ] All redirects working (no redirect chains or loops)
- [ ] Google Search Console: no crawl errors
- [ ] Analytics events firing correctly
- [ ] Conversion funnel tracking verified
- [ ] Soft launch feedback: zero critical usability issues
- [ ] Cross-browser: no rendering or interaction bugs

### Team Requirements
- **Engineer 1**: Performance optimization, analytics, CDN
- **Engineer 2**: Accessibility fixes, cross-browser testing, SEO
- **Designer**: Visual polish, OG images, final design QA
- **Content writer**: Final copy review, SEO metadata review

### Dependencies
- Phases 1-4 complete (all pages live)
- Analytics account configured
- Google Search Console access
- Domain DNS configured
- SSL certificate provisioned

### Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Performance regression from content-heavy pages | Medium | Medium | Optimize images, lazy load below-fold content |
| Accessibility issues in mega menus | Medium | High | Test with screen readers in Phase 1, fix early |
| Cross-browser rendering differences | Low | Medium | Use Tailwind's built-in browser support |
| Soft launch feedback volume | Medium | Low | Prioritize critical issues only, defer polish |
| SEO indexing delay | High | Low | Submit sitemap immediately, request indexing for key pages |

---

## Timeline Summary

```
Week  1-3:  ████████████████████ Phase 1: Foundation
Week  4-6:  ████████████████████ Phase 2: Core Pages (18 pages)
Week  7-10: ████████████████████████████████ Phase 3: Product Deep Dives (24 pages)
Week 11-13: ████████████████████████████ Phase 4: Intelligence & Research (33+ pages)
Week 14-16: ████████████████████ Phase 5: Polish & Launch
```

**Total pages at launch**: 75+ (71 static + blog posts)
**Total content**: ~80,000-120,000 words
**Total components**: ~40 (layout, UI, page-specific)

---

## Post-Launch Maintenance

| Activity | Frequency | Owner |
|---|---|---|
| Content freshness audit | Quarterly | Content writer |
| SEO performance review | Monthly | Engineer |
| Accessibility re-audit | Quarterly | Engineer |
| Performance monitoring | Weekly | Engineer |
| Blog post publication | Bi-weekly | Content writer + Engineer |
| Changelog updates | Per release | Engineer |
| Competitor website review | Quarterly | Designer + Content writer |
| Brain → public content sync | Per Brain update | Content writer |

---

*Last updated: 2026-07-22*
