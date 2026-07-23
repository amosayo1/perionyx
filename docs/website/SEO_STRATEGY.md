# Perionyx Public Platform — SEO Strategy

## Overview

Enterprise SEO is not about gaming algorithms. It's about being the definitive answer to enterprise finance questions. Every page should be the best answer to a specific question a CFO, Controller, or Treasurer would ask.

**Platform scope**: 392 API routes, 67 modules, 338 Prisma models. 10 product domains, 12 platform pages, 11 security pages, 10 AI pages.

---

## SEO Philosophy

### Principles

1. **Be the best answer**: Every page targets a specific question. If a finance leader types this question into Google, our page should be the most helpful result.

2. **Depth over breadth**: One comprehensive page beats five shallow pages. Enterprise buyers do deep research — match their depth.

3. **Technical credibility**: Enterprise buyers are sophisticated. They can tell when content is thin. Technical depth signals credibility.

4. **Freshness matters**: Enterprise software changes fast. Stale content signals abandonment. Keep everything current.

5. **Structure enables discovery**: Clear hierarchy, internal links, and schema markup help search engines understand what we offer.

---

## Technical SEO

### Rendering Strategy

| Page Type | Rendering | Revalidation | Rationale |
|---|---|---|---|
| Product Pages | Static (SSG) | Per release | Core content, rarely changes |
| Platform Pages | Static (SSG) | Per release | Technical content, stable |
| Security Pages | Static (SSG) | Monthly | Trust content, needs freshness |
| AI Pages | Static (SSG) | Quarterly | Philosophy content, stable |
| Engineering Blog | ISR | 60 minutes | Frequent updates |
| Research Posts | ISR | 24 hours | New posts, stable once published |
| Changelog | ISR | 1 hour | Changes with every release |
| Blog Posts | ISR | 60 minutes | Frequent updates |

### Structured Data (JSON-LD)

Every page includes appropriate schema markup:

**Organization Schema** (all pages):
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Perionyx",
  "description": "Enterprise financial operating system",
  "url": "https://perionyx.com",
  "logo": "https://perionyx.com/logo.png",
  "sameAs": []
}
```

**Product Schema** (product pages):
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Perionyx — Accounts Payable",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Enterprise accounts payable automation",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Contact for pricing"
  }
}
```

**BreadcrumbList Schema** (all pages):
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://perionyx.com" },
    { "@type": "ListItem", "position": 2, "name": "Product", "item": "https://perionyx.com/product" },
    { "@type": "ListItem", "position": 3, "name": "Accounts Payable" }
  ]
}
```

**FAQPage Schema** (product and security pages):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does three-way matching work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

**Article Schema** (blog and research):
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "author": { "@type": "Person", "name": "..." },
  "datePublished": "2026-07-22",
  "dateModified": "2026-07-22"
}
```

### Sitemap Strategy

**Auto-generated XML sitemap** with priority weighting:

| URL Pattern | Priority | Change Frequency |
|---|---|---|
| `/` | 1.0 | Weekly |
| `/product/*` | 0.9 | Monthly |
| `/platform/*` | 0.8 | Monthly |
| `/security/*` | 0.8 | Monthly |
| `/ai/*` | 0.8 | Monthly |
| `/engineering/*` | 0.7 | Weekly |
| `/research/*` | 0.7 | Monthly |
| `/blog/*` | 0.6 | Weekly |
| `/changelog` | 0.5 | Daily |

### robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /system/
Disallow: /_next/
Disallow: /mobile/

Sitemap: https://perionyx.com/sitemap.xml
```

### Core Web Vitals Targets

| Metric | Target | Measurement |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | PageSpeed Insights |
| FID (First Input Delay) | < 100ms | Chrome UX Report |
| CLS (Cumulative Layout Shift) | < 0.1 | PageSpeed Insights |
| INP (Interaction to Next Paint) | < 200ms | Chrome UX Report |

**Optimization strategies**:
- Static generation eliminates server-side rendering latency
- Image optimization with Next.js Image component
- Font loading with `font-display: swap`
- Minimal JavaScript bundle (no heavy frameworks)
- CSS-in-JS avoided — Tailwind CSS for zero-runtime styling
- Lazy loading for below-fold content

### URL Structure

Clean, hierarchical URLs that describe content:

```
/                                    — Home
/product                             — Product overview
/product/accounts-payable            — AP product page
/product/treasury                    — Treasury product page
/platform                            — Platform overview
/platform/workflow-engine            — Workflow engine architecture
/security                            — Security overview
/security/authentication             — Authentication and MFA
/ai                                  — AI overview
/ai/decision-intelligence            — Decision intelligence
/engineering                         — Engineering blog
/engineering/financial-precision     — Financial precision post
/research                            — Research index
/research/finance-pain-points        — Pain points research
/blog                                — Blog index
/changelog                           — Changelog
```

**Rules**:
- Lowercase only
- Hyphens for spaces
- No trailing slashes (except root)
- No query parameters in canonical URLs
- Descriptive, keyword-rich slugs

### Canonical URLs

Every page includes a canonical URL tag:

```html
<link rel="canonical" href="https://perionyx.com/product/accounts-payable" />
```

**Rules**:
- Always absolute URLs
- Always HTTPS
- No trailing slash
- Self-referencing (page canonicals to itself)

### Internationalization (Future)

When i18n is implemented:

```html
<link rel="alternate" hreflang="en" href="https://perionyx.com/product" />
<link rel="alternate" hreflang="ar" href="https://perionyx.com/ar/product" />
<link rel="alternate" hreflang="x-default" href="https://perionyx.com/product" />
```

---

## On-Page SEO

### Title Tags

**Formula**: `{Primary Keyword} — {Secondary Context} | Perionyx`

**Rules**:
- 60 characters max
- Primary keyword first
- Brand name last (pipe separator)
- Unique per page
- Compelling, not clickbait

**Examples**:
| Page | Title Tag |
|---|---|
| Home | `Enterprise Financial Operating System | Perionyx` |
| AP | `Accounts Payable Automation Software | Perionyx` |
| Treasury | `Treasury Management System | Perionyx` |
| Security | `Enterprise Financial Security | Perionyx` |
| AI | `AI for CFOs — Financial Decision Intelligence | Perionyx` |
| Workflow Engine | `Financial Workflow Engine — Architecture | Perionyx` |

### Meta Descriptions

**Formula**: `{Value proposition} {Key differentiator} {Call to action}`

**Rules**:
- 155 characters max
- Includes primary keyword naturally
- Compelling and specific
- Ends with clear CTA or benefit
- Unique per page

**Examples**:
| Page | Meta Description |
|---|---|
| Home | `Perionyx is the enterprise financial operating system. AP, AR, Treasury, Approvals, Risk, Compliance — one platform, zero duplication. Schedule a demo.` |
| AP | `Automate three-way matching, approval routing, and payment processing. Decimal precision. Tamper-evident audit. See how Perionyx AP works.` |
| Security | `AES-256-GCM encryption. RBAC+ABAC. MFA. Tamper-evident audit trails. Perionyx security architecture for enterprise finance.` |

### Heading Hierarchy

**Rules**:
- One H1 per page (includes primary keyword)
- H2 sections for major topics (includes secondary keywords)
- H3 subsections for details
- No skipped levels (H1 → H3 is invalid)
- Keywords flow naturally, never stuffed

**Example structure**:
```
H1: Accounts Payable Automation Software
  H2: How Three-Way Matching Works
    H3: Purchase Order Matching
    H3: Receipt Verification
    H3: Invoice Validation
  H2: Approval Workflow
    H3: Multi-Level Approval Chains
    H3: Threshold-Based Routing
  H2: Payment Processing
    H3: Batch Payments
    H3: Multi-Currency Support
  H2: Audit Trail
  H2: Integration Points
  H2: Security and Compliance
```

### Image Alt Text

**Rules**:
- Descriptive, not keyword-stuffed
- Includes context of what the image shows
- Under 125 characters
- Every image has alt text

**Examples**:
- `Dashboard showing accounts payable queue with 23 pending invoices`
- `Three-way matching workflow diagram with PO, receipt, and invoice`
- `Approval chain with three levels and threshold-based routing`

### Internal Linking

**Rules**:
- 3-5 internal links per page
- Descriptive anchor text (not "click here")
- Links to related content (product → platform, platform → security)
- Links to deeper content (overview → specific feature)
- Breadcrumb navigation on every page

**Link hierarchy**:
```
Home → Product → Specific Domain
Home → Platform → Specific Architecture
Home → Security → Specific Topic
Home → AI → Specific Capability
Product ↔ Platform (cross-links)
Product ↔ Security (trust signals)
AI ↔ Product (AI capabilities per domain)
Engineering ↔ Platform (technical depth)
Research ↔ Product (evidence for claims)
```

---

## Content SEO Strategy

### Keyword Mapping

Each page targets ONE primary keyword cluster. Secondary keywords appear in H2s and body text naturally.

#### Product Keywords (High Intent)

| Keyword | Page | Search Intent | Priority |
|---|---|---|---|
| Enterprise financial operating system | `/` | Platform overview | P1 |
| Accounts payable automation software | `/product/accounts-payable` | AP evaluation | P1 |
| Treasury management system | `/product/treasury` | Treasury evaluation | P1 |
| Enterprise approval workflow software | `/product/approvals` | Approval evaluation | P1 |
| Financial workflow automation | `/` | Platform overview | P1 |
| Enterprise reconciliation software | `/product/reconciliation` | Reconciliation evaluation | P2 |
| Enterprise AR automation | `/product/accounts-receivable` | AR evaluation | P2 |
| Financial risk management software | `/product/risk` | Risk evaluation | P2 |
| Compliance automation software | `/product/compliance` | Compliance evaluation | P2 |
| Audit trail software | `/product/audit` | Audit evaluation | P1 |
| Executive financial dashboard | `/product/executive-intelligence` | Executive evaluation | P1 |
| Enterprise general ledger software | `/product/general-ledger` | GL evaluation | P2 |
| Cash management platform | `/product/cash-management` | Cash evaluation | P1 |

#### Platform Keywords (Technical)

| Keyword | Page | Search Intent | Priority |
|---|---|---|---|
| Financial workflow engine | `/platform/workflow-engine` | Technical evaluation | P1 |
| Enterprise financial API | `/platform/integration-layer` | Integration evaluation | P2 |
| Multi-tenant financial platform | `/platform/multi-tenancy` | Architecture evaluation | P2 |
| Financial data ledger | `/platform/ledger` | Data architecture | P2 |
| Enterprise financial security | `/security` | Security evaluation | P1 |

#### Trust Keywords (Enterprise Buyers)

| Keyword | Page | Search Intent | Priority |
|---|---|---|---|
| Enterprise financial security | `/security` | Security evaluation | P1 |
| SOC 2 compliant financial software | `/security/compliance` | Compliance check | P1 |
| Financial data encryption | `/security/encryption` | Encryption evaluation | P1 |
| Enterprise audit compliance | `/security/audit-trail` | Audit compliance | P1 |

#### AI Keywords (Emerging)

| Keyword | Page | Search Intent | Priority |
|---|---|---|---|
| AI for CFOs | `/ai` | AI overview | P1 |
| Financial decision intelligence | `/ai/decision-intelligence` | Decision AI evaluation | P1 |
| AI accounts payable | `/ai/ap-automation` | AP AI evaluation | P2 |
| Enterprise AI copilot | `/ai/copilot` | Copilot evaluation | P2 |
| Explainable AI finance | `/ai/explainability` | AI transparency | P1 |

#### Long-tail Keywords (Research/Engineering)

| Keyword | Page | Search Intent | Priority |
|---|---|---|---|
| How to automate accounts payable | `/research/finance-pain-points` | Educational | P2 |
| Enterprise financial workflow best practices | `/research/workflow-friction` | Educational | P2 |
| Financial precision decimal arithmetic | `/engineering/financial-precision` | Technical deep-dive | P3 |
| Enterprise approval chain design | `/platform/workflow-engine` | Architecture deep-dive | P3 |

---

## Link Building Strategy

### Internal Linking

The primary link building strategy is internal linking. Every page links to 3-5 related pages, creating a dense knowledge graph that search engines can crawl.

### External Link Building

| Strategy | Content Type | Distribution Channel | Target |
|---|---|---|---|
| Engineering blog | Technical deep-dives | LinkedIn, Hacker News, Twitter | Engineers, CTOs |
| Research insights | Customer discovery | Industry publications, LinkedIn | Finance leaders |
| Security documentation | Trust content | Compliance guides, security communities | CISOs, security teams |
| Conference talks | Technical presentations | Conference platforms, YouTube | Engineers, architects |
| Open-source | Code contributions | GitHub, npm | Developer community |
| Design partner stories | Case studies | LinkedIn, industry publications | CFOs, finance leaders |

### Content Distribution

| Channel | Content Type | Frequency | Goal |
|---|---|---|---|
| LinkedIn | Blog posts, research, product updates | Weekly | Professional audience |
| Hacker News | Engineering deep-dives | Bi-weekly | Technical credibility |
| Twitter/X | Product updates, engineering insights | Daily | Community building |
| YouTube | Product demos, conference talks | Monthly | Visual demonstration |
| Industry publications | Research, thought leadership | Quarterly | Authority building |

---

## Measurement

### KPIs

| Metric | Target | Measurement |
|---|---|---|
| Organic traffic | 20% QoQ growth | Google Analytics |
| Organic impressions | 15% QoQ growth | Google Search Console |
| Click-through rate | >3% average | Google Search Console |
| Average position | Top 10 for P1 keywords | Google Search Console |
| Backlinks | 10 new referring domains/month | Ahrefs / Moz |
| Domain authority | Steady growth | Ahrefs / Moz |
| Core Web Vitals | All "Good" | PageSpeed Insights |
| Conversion rate | >2% organic to demo | Google Analytics |

### Reporting Cadence

| Report | Frequency | Focus |
|---|---|---|
| Keyword rankings | Weekly | P1 keyword positions |
| Traffic analysis | Monthly | Organic traffic trends |
| Content performance | Monthly | Per-page engagement |
| Technical SEO audit | Quarterly | Core Web Vitals, crawl errors |
| Competitive analysis | Quarterly | Ranking vs. competitors |
| Link building report | Monthly | New backlinks, referring domains |

### SEO Health Checks

**Weekly**:
- Check for crawl errors in Google Search Console
- Monitor keyword ranking changes
- Review new content indexing status

**Monthly**:
- Analyze organic traffic trends
- Review page performance (LCP, CLS, FID)
- Check internal link health
- Review meta data accuracy

**Quarterly**:
- Full technical SEO audit
- Content freshness audit
- Competitive ranking analysis
- Schema markup validation
- Core Web Vitals assessment
