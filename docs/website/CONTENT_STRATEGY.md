# Perionyx Public Platform — Content Strategy

## Overview

Every published piece of content traces back to a Brain document. The Brain remains authoritative. The public website is a curated public view — never a verbatim copy, never independent knowledge. When the Brain updates, public content is flagged for refresh.

**Platform scope**: 392 API routes, 67 modules, 338 Prisma models. Serves CFOs, Treasurers, Controllers, Finance Managers, Auditors. Core domains: AP, AR, Treasury, Approvals, Risk, Compliance, Reconciliation, Audit, Executive Intelligence, AI.

---

## Content Pillars

### 1. Product Clarity

Every feature explained in terms of what it does for finance teams. No feature dumps. No internal jargon. A CFO reading a product page should immediately understand the workflow, the outcome, and the time saved.

**Source Brain docs**: Domain architecture documents, workflow validation reports, persona validation reports, product readiness assessments.

**Example**: Not "Our three-way matching engine uses configurable tolerance rules with multi-currency support." Instead: "Match PO, receipt, and invoice automatically. Tolerance rules catch discrepancies before they reach your desk."

### 2. Technical Credibility

Architecture, engineering principles, security depth. For the CTO who evaluates the platform alongside the CFO. Technical pages have two layers: a 30-second summary and a 5-minute deep dive.

**Source Brain docs**: Architecture freeze document, persistence architecture, infrastructure documentation, database decisions, API standards.

**Example**: "Our ledger uses Decimal(38,12) precision — not Float, not rounded Number. Every monetary calculation uses banker's rounding via `Intl.NumberFormat`. No phantom cents. No accumulation drift."

### 3. Enterprise Trust

Security, compliance, audit trails, financial precision. Enterprise buyers don't buy features — they buy confidence that the platform won't fail, leak, or lie.

**Source Brain docs**: Security audit findings, compliance readiness assessments, MFA architecture, error handling strategy, session security review.

**Example**: "Every API request is authenticated, authorized, and audited. RBAC checks at the endpoint, not the handler. Session tokens are cryptographically random. MFA is TOTP-based with 10 recovery codes."

### 4. AI Transparency

Evidence-first AI, human control, explainability. Finance teams don't trust black boxes. Every AI recommendation shows its reasoning, its confidence, and its source.

**Source Brain docs**: AI platform architecture, AI security audit, decision engine architecture, evidence engine documentation.

**Example**: "When the AI suggests an approval route, it shows: the precedent decisions it referenced, the confidence level, the policy it's applying, and who to ask if you disagree."

### 5. Industry Insight

Research, customer discovery, enterprise finance trends. Not thought leadership fluff — actual findings from real conversations with finance teams.

**Source Brain docs**: Customer discovery pain points, workflow friction analysis, product readiness assessment, enterprise scorecard.

**Example**: "We spoke with 47 finance leaders. 31 said their AP process involves at least 3 manual handoffs. 18 couldn't tell you their average approval cycle time without checking email."

### 6. Company Culture

Engineering culture, design philosophy, design partners. Why we build the way we build. Who we're building with.

**Source Brain docs**: Engineering constitution, design principles, UX accessibility audit, motion system documentation, enterprise forms philosophy.

**Example**: "Our design principle: clarity first, beauty through restraint. A CFO doesn't need a gradient. They need to know which invoice is overdue and by how much."

---

## Content Types

### Product Pages (12)

**Purpose**: One page per product domain. Explain what it does, how it works, why it matters for finance teams.

**Format**: Hero (1 sentence), workflow overview (3-5 steps), key capabilities (6-8), integration points, trust signals. Each page: 1,200-2,000 words.

**Frequency**: Updated quarterly or per major release.

**Source Brain docs**: Domain architecture documents, workflow validation reports, persona validation reports, integration architecture.

**Target audience**: CFOs, Treasurers, Controllers evaluating the platform.

**Pages**:
| Page | Domain | Primary Keyword |
|---|---|---|
| `/product/accounts-payable` | AP | Accounts payable automation software |
| `/product/accounts-receivable` | AR | AR collections software |
| `/product/treasury` | Treasury | Treasury management software |
| `/product/approvals` | Approvals | Enterprise approval workflow software |
| `/product/risk` | Risk | Financial risk management |
| `/product/compliance` | Compliance | Compliance automation software |
| `/product/reconciliation` | Reconciliation | Enterprise reconciliation software |
| `/product/audit` | Audit | Audit trail software |
| `/product/executive-intelligence` | Executive | Executive financial dashboard |
| `/product/general-ledger` | GL | Enterprise general ledger |
| `/product/cash-management` | Cash | Cash management platform |
| `/product/reporting` | Reporting | Enterprise financial reporting |

### Platform Pages (12)

**Purpose**: Technical architecture pages. Diagrams, capability descriptions. For the CTO, architect, or senior engineer evaluating the platform.

**Format**: Architecture diagram (conceptual, not implementation topology), capability list, design decisions, integration points. Each page: 1,500-3,000 words.

**Frequency**: Updated per release or architecture change.

**Source Brain docs**: Architecture freeze document, persistence architecture, infrastructure documentation, database decisions, API standards, module responsibility matrix.

**Target audience**: CTOs, architects, senior engineers, technical evaluators.

**Pages**:
| Page | Topic |
|---|---|
| `/platform/workflow-engine` | Workflow engine architecture |
| `/platform/ledger` | Financial data ledger |
| `/platform/multi-tenancy` | Multi-tenant isolation |
| `/platform/integration-layer` | Integration and API layer |
| `/platform/event-system` | Domain event architecture |
| `/platform/caching` | Cache strategy and invalidation |
| `/platform/queue-system` | Background job processing |
| `/platform/observability` | Metrics, tracing, health checks |
| `/platform/database` | Database schema and precision |
| `/platform/security-architecture` | Security architecture overview |
| `/platform/deployment` | Deployment and infrastructure |
| `/platform/agent-framework` | Agent framework architecture |

### Security Pages (11)

**Purpose**: Trust-building pages. Deep technical security documentation. Enterprise buyers need to know exactly how their data is protected.

**Format**: Security overview, specific domain deep-dives, compliance posture. Each page: 1,000-2,500 words.

**Frequency**: Updated monthly or after security events.

**Source Brain docs**: Security audit findings, compliance readiness assessments, MFA architecture, error handling strategy, session security review, dependency security, OWASP compliance report.

**Target audience**: Security teams, CISOs, compliance officers, procurement.

**Pages**:
| Page | Topic |
|---|---|
| `/security` | Security overview |
| `/security/authentication` | Authentication and MFA |
| `/security/authorization` | RBAC and ABAC |
| `/security/encryption` | Data encryption (AES-256-GCM) |
| `/security/audit-trail` | Tamper-evident audit |
| `/security/multi-tenancy` | Tenant isolation |
| `/security/api-security` | API security practices |
| `/security/infrastructure` | Infrastructure security |
| `/security/compliance` | Compliance roadmap |
| `/security/dependency-scanning` | Dependency security |
| `/security/incident-response` | Incident response |

### AI Pages (10)

**Purpose**: Philosophy and capability pages. Explain AI approach, not just AI features. Finance teams need to trust AI before they use it.

**Format**: Philosophy overview, capability deep-dives, explainability documentation. Each page: 1,000-2,000 words.

**Frequency**: Updated quarterly.

**Source Brain docs**: AI platform architecture, AI security audit, decision engine architecture, evidence engine documentation, provider health monitoring.

**Target audience**: CFOs, Controllers, AI evaluators, technical decision-makers.

**Pages**:
| Page | Topic |
|---|---|
| `/ai` | AI overview and philosophy |
| `/ai/decision-intelligence` | Decision support and recommendations |
| `/ai/explainability` | How AI explains its reasoning |
| `/ai/evidence` | Evidence tracking and sourcing |
| `/ai/copilot` | AI copilot for finance teams |
| `/ai/ap-automation` | AI for accounts payable |
| `/ai/anomaly-detection` | AI anomaly detection |
| `/ai/providers` | AI provider architecture |
| `/ai/security` | AI security and governance |
| `/ai/roadmap` | AI capability roadmap |

### Engineering Pages (8)

**Purpose**: Public engineering blog. Principles, culture, deep-dives. Show how we think, not just what we build.

**Format**: Essay-style, 1,500-3,000 words. Technical depth with clear narrative.

**Frequency**: Bi-weekly or per major engineering milestone.

**Source Brain docs**: Engineering constitution, architecture decisions, consolidation reports, financial precision implementation, lesson documents.

**Target audience**: Engineers, technical leaders, design partners, open-source community.

**Pages**:
| Page | Topic |
|---|---|
| `/engineering` | Engineering blog index |
| `/engineering/financial-precision` | Decimal arithmetic and banker's rounding |
| `/engineering/workflow-engine` | Building a financial workflow engine |
| `/engineering/domain-events` | Domain events in financial systems |
| `/engineering/security-first` | Security-first engineering culture |
| `/engineering/architecture-decisions` | Architecture decision records |
| `/engineering/ai-integration` | Integrating AI into financial workflows |
| `/engineering/accessibility` | Enterprise accessibility practices |

### Research Posts (4+)

**Purpose**: Customer discovery summaries, industry insights. Actual findings, not thought leadership.

**Format**: Research summary with methodology, findings, implications. 1,000-2,000 words.

**Frequency**: Semi-annually.

**Source Brain docs**: Customer discovery pain points, workflow friction analysis, product readiness assessment, enterprise scorecard, enterprise workflow revalidation.

**Target audience**: Finance leaders, product leaders, industry analysts.

**Pages**:
| Page | Topic |
|---|---|
| `/research` | Research index |
| `/research/finance-pain-points` | Top pain points from 47 finance leaders |
| `/research/workflow-friction` | Where enterprise finance workflows break |
| `/research/ai-adoption` | AI adoption in enterprise finance |

### Changelog (Ongoing)

**Purpose**: Every release documented. Transparency builds trust.

**Format**: Date, version, changes (Added/Changed/Fixed/Removed). Grouped by domain.

**Frequency**: Per release.

**Source Brain docs**: Release notes, version documentation.

**Target audience**: Existing users, evaluators tracking development velocity.

### Blog Posts (Ongoing)

**Purpose**: Technical deep-dives, product announcements, industry commentary.

**Format**: Essay or tutorial, 800-2,500 words.

**Frequency**: Weekly or bi-weekly.

**Source Brain docs**: Any Brain document, curated for public consumption.

**Target audience**: Engineers, finance professionals, industry watchers.

---

## Content Pipeline

### Brain → Public Content

```
Brain (source of truth)
  ↓
Content team curates which Brain docs become public
  ↓
Public version created as curated summary (never copy-paste)
  ↓
Every public page has a "Source" field tracing to Brain doc
  ↓
When Brain updates, public content is flagged for refresh
  ↓
Quarterly audit verifies all public content is current
```

### Pipeline Rules

1. **Source of truth**: The Brain is authoritative. Public content is derived.
2. **Curated summary**: Public content summarizes and translates, never copies verbatim.
3. **Traceability**: Every public page references its Brain source document.
4. **Refresh triggers**: Brain update → automatic flag for content review.
5. **Quarterly audit**: Full review of all public content against current Brain state.
6. **Deprecation**: When Brain doc is archived, public content is archived or rewritten.

---

## Voice & Tone Framework

### Voice Attributes

| Attribute | What it means | What it doesn't mean |
|---|---|---|
| **Confident** | We know what we're building and why. We don't hedge or apologize. | Arrogant, dismissive, or unapproachable |
| **Clear** | Every sentence serves a purpose. No filler words. | Robotic, telegraphic, or dumbed-down |
| **Enterprise** | We speak the language of finance leaders. Not startup-speak. | Stiff, jargon-heavy, or corporate |
| **Technical** | We go deep when it matters. We don't dumb things down. | Inaccessible, academic, or jargon-first |
| **Human** | We're building for people. We acknowledge complexity without being cold. | Casual, informal, or overly emotional |

### Tone by Context

| Context | Tone |
|---|---|
| Hero sections | Confident, minimal, one powerful sentence |
| Product pages | Clear, workflow-focused, outcome-oriented |
| Security pages | Precise, specific, evidence-backed |
| AI pages | Transparent, honest about limitations, human-centered |
| Engineering blog | Thoughtful, technical, narrative-driven |
| Research | Factual, methodical, insight-forward |
| Changelog | Direct, factual, no marketing language |

### Writing Rules

- No buzzword stuffing ("revolutionary", "best-in-class", "industry-leading", "game-changing")
- No vague claims ("many customers", "significant improvement", "vast majority")
- Every number is verifiable or clearly labeled as representative
- Every comparison is fair and sourced
- No sentence exceeds 25 words in hero sections
- Use active voice. "The platform validates" not "validation is performed"
- Use specific numbers. "32ms average response time" not "blazing fast"
- Use "you" for the reader. "Your team" not "the finance team"

---

## Content Quality Standards

### Page Quality Checklist

Every published page must satisfy:

- [ ] Answers: "Who is this for?" within the first 3 seconds
- [ ] Answers: "What should they do next?" with a clear CTA
- [ ] Hero section: one sentence, under 25 words
- [ ] No claim without evidence or clear labeling as representative
- [ ] Technical pages have both 30-second summary and 5-minute deep-dive
- [ ] All numbers are verifiable or labeled as representative
- [ ] All comparisons are fair and sourced
- [ ] Internal links to 3-5 related pages
- [ ] Source Brain document referenced
- [ ] SEO metadata complete (title, description, OG, schema)
- [ ] Passes accessibility check (contrast, labels, keyboard)
- [ ] Mobile responsive
- [ ] Loads under 2.5s LCP

### Quality Metrics

| Metric | Target | Measurement |
|---|---|---|
| Technical accuracy | 100% | Quarterly technical review |
| Freshness | 95% within refresh window | Automated freshness check |
| SEO performance | Organic traffic growth per page | Monthly analytics |
| Engagement | >2 min average time on page | Analytics |
| Scroll depth | >60% average | Analytics |
| CTA conversion | >3% | Analytics |
| Source traceability | 100% pages with Brain source | Manual audit |
