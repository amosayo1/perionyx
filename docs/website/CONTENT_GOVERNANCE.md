# Perionyx Public Platform — Content Governance

## Overview

Content governance ensures every public page is accurate, current, on-brand, and legally sound. The public website is a curated view of the Brain — governance maintains the integrity of that curation.

---

## Governance Model

### Roles and Responsibilities

| Role | Responsibility | Accountable For |
|---|---|---|
| **Content Owner** | Responsible for accuracy of each page section | Correctness of claims, data, and descriptions |
| **Editor** | Responsible for voice, tone, and quality | Brand consistency, clarity, readability |
| **Technical Reviewer** | Validates technical claims against source code/docs | Architecture accuracy, security claims, performance data |
| **Legal Reviewer** | Validates compliance, privacy, terms | Regulatory compliance, liability, data handling claims |
| **SEO Reviewer** | Validates search optimization | Keyword placement, meta data, schema markup |
| **Accessibility Reviewer** | Validates WCAG compliance | Contrast, labels, keyboard, screen reader |

### RACI Matrix

| Activity | Content Owner | Editor | Technical Reviewer | Legal Reviewer | SEO Reviewer |
|---|---|---|---|---|---|
| Draft creation | **R/A** | C | I | I | I |
| Technical review | C | I | **R/A** | I | I |
| Editorial review | I | **R/A** | C | I | C |
| Legal review | I | I | I | **R/A** | I |
| SEO optimization | I | C | I | I | **R/A** |
| Accessibility check | I | C | I | I | I |
| Publication | C | **R/A** | C | C | C |
| Refresh cycle | **R/A** | C | C | C | I |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

---

## Content Lifecycle

### Stage 1: Draft

**Entry criteria**: Brain source document identified, content brief approved.

**Activities**:
- Writer creates draft from curated Brain summary
- Writer includes "Source" field referencing Brain document
- Writer completes content checklist (voice, clarity, completeness)

**Exit criteria**: Draft complete, internal review self-check passed.

### Stage 2: Technical Review

**Entry criteria**: Draft complete.

**Activities**:
- Technical reviewer validates all claims against source code/docs
- Architecture diagrams reviewed for accuracy (conceptual only, no implementation topology)
- Performance claims verified with benchmarks
- Security claims verified against security audit findings
- API references verified against actual endpoints

**Exit criteria**: All technical claims verified or flagged for revision.

### Stage 3: Editorial Review

**Entry criteria**: Technical review complete.

**Activities**:
- Editor reviews voice, tone, clarity, readability
- SEO reviewer validates keyword placement, meta data, schema
- Accessibility reviewer checks contrast, labels, keyboard support
- Word count, sentence length, and structure reviewed
- Internal links verified

**Exit criteria**: Editorial and SEO standards met.

### Stage 4: Legal Review

**Entry criteria**: Editorial review complete. Triggered only when content includes:
- Compliance claims (SOC 2, PCI DSS, GDPR, ISO 27001)
- Customer quotes or case studies
- Performance benchmarks with specific numbers
- Competitive comparisons
- Privacy or data handling descriptions

**Activities**:
- Legal reviewer validates claims accuracy
- Legal reviewer checks regulatory compliance
- Legal reviewer reviews privacy implications
- Legal reviewer approves or requests changes

**Exit criteria**: Legal approval received or changes made.

### Stage 5: Publish

**Entry criteria**: All reviews complete and approved.

**Activities**:
- Content deployed to production
- SEO metadata verified in production
- Schema markup validated
- Open Graph / Twitter Card preview checked
- Internal links verified in production
- Analytics tracking confirmed

**Exit criteria**: Page live, analytics tracking, search engines notified.

### Stage 6: Monitor

**Entry criteria**: Content published.

**Activities**:
- Track organic traffic, impressions, click-through rate
- Monitor time on page, scroll depth, bounce rate
- Track CTA conversions
- Collect user feedback
- Monitor search ranking for target keywords
- Flag underperforming content for refresh

**Exit criteria**: Ongoing, monthly reporting.

### Stage 7: Refresh

**Entry criteria**: Refresh cycle triggered (scheduled or Brain update).

**Activities**:
- Compare current content against updated Brain source
- Identify stale claims, new capabilities, changed architecture
- Update content following Stage 2-5 pipeline
- Update publication date and changelog
- Re-submit for technical and editorial review

**Exit criteria**: Content current, review cycle complete.

### Stage 8: Archive

**Entry criteria**: Content no longer relevant (deprecated feature, restructured product).

**Activities**:
- Redirect URL to most relevant current page (301)
- Add deprecation notice if page receives traffic
- Remove from sitemap
- Preserve URL for external link equity
- Document archival reason and date

**Exit criteria**: URL redirected, sitemap updated, analytics monitored for residual traffic.

---

## Refresh Schedule

| Content Type | Refresh Frequency | Responsible | Trigger for Immediate Refresh |
|---|---|---|---|
| Product Pages | Quarterly | Product Team | Major feature release, API change, workflow change |
| Platform Pages | Per release | Engineering | Architecture change, new module, API version change |
| Security Pages | Monthly | Security Team | New vulnerability, security event, compliance update |
| AI Pages | Quarterly | AI Team | New provider, model change, capability update |
| Engineering Pages | Per post | Engineering | New post published, corrections needed |
| Research Posts | Semi-annually | Research | New research findings, methodology update |
| Changelog | Per release | Engineering | Every release |
| Legal Pages | Annually | Legal | Regulatory change, policy update |

### Refresh Tracking

Each content page includes metadata:

```yaml
last_reviewed: 2026-07-22
next_review: 2026-10-22
review_cycle: quarterly
brain_source: "docs/architecture/24-agent-framework.md"
content_owner: "Engineering Team"
technical_reviewer: "Security Team"
```

### Staleness Rules

| Staleness | Status | Action |
|---|---|---|
| Within refresh window | Current | No action |
| 1-2 months overdue | Aging | Flag for refresh, review priority |
| 3+ months overdue | Stale | Priority refresh required |
| 6+ months overdue | Critical | Consider archival or major update |

---

## Quality Assurance

### Pre-Publish Checklist

Every page must pass all checks before publication:

**Accuracy**
- [ ] All technical claims verified against source code/docs
- [ ] All numbers are verifiable or labeled as representative
- [ ] All comparisons are fair and sourced
- [ ] Architecture diagrams are conceptual, not implementation topology
- [ ] API references match actual endpoints
- [ ] Security claims match audit findings

**Voice & Tone**
- [ ] Confident, clear, enterprise, technical, human
- [ ] No buzzword stuffing
- [ ] No vague claims
- [ ] Active voice throughout
- [ ] Specific numbers, not adjectives

**SEO**
- [ ] Title tag: 60 chars max, primary keyword first
- [ ] Meta description: 155 chars max, compelling, includes keyword
- [ ] H1: one per page, includes primary keyword
- [ ] H2-H3 hierarchy with secondary keywords
- [ ] Schema markup validated
- [ ] Open Graph image and metadata
- [ ] Canonical URL set
- [ ] Internal links to 3-5 related pages

**Accessibility**
- [ ] Contrast ratio ≥ 4.5:1 for text
- [ ] All images have descriptive alt text
- [ ] All interactive elements are keyboard accessible
- [ ] Form fields have associated labels
- [ ] ARIA attributes used correctly
- [ ] Skip navigation link present

**Technical**
- [ ] Page loads under 2.5s LCP
- [ ] No layout shift (CLS < 0.1)
- [ ] Mobile responsive
- [ ] All links functional
- [ ] No console errors
- [ ] Analytics tracking confirmed

**Governance**
- [ ] Brain source document referenced
- [ ] Content owner identified
- [ ] Technical reviewer approved
- [ ] Legal review completed (if triggered)
- [ ] Publication date set
- [ ] Next review date set

### Post-Publish Monitoring

| Metric | Target | Threshold for Action |
|---|---|---|
| Organic traffic | Growth trend | Decline >20% for 2 consecutive months |
| Time on page | >2 minutes | <1 minute average |
| Scroll depth | >60% | <40% average |
| CTA conversion | >3% | <1% for 30 days |
| Bounce rate | <60% | >80% |
| Search ranking | Top 10 for target keyword | Drop below top 20 |
| Backlinks | Growth trend | Decline in referring domains |

---

## Content Versioning

### Version History Format

Every content page maintains a version history:

```yaml
versions:
  - version: 1.0
    date: 2026-07-22
    author: "Content Team"
    changes: "Initial publication"
    brain_source: "docs/architecture/24-agent-framework.md"
  - version: 1.1
    date: 2026-10-22
    author: "Content Team"
    changes: "Updated agent framework capabilities for v1.3 release"
    brain_source: "docs/architecture/24-agent-framework.md"
```

### Changelog Integration

Content changes are logged in the changelog:

```markdown
## [2026-10-22] Content Updates
- Updated `/ai` page with new provider support (Mistral, Grok)
- Refreshed `/platform/workflow-engine` with v1.3 architecture changes
- Updated `/security/authentication` with MFA recovery code details
```

---

## Escalation Protocol

### Accuracy Disputes

If technical review flags an accuracy issue:

1. Content Owner resolves with Technical Reviewer
2. If unresolved, escalate to Engineering Lead
3. Page is not published until resolved
4. Dispute and resolution documented in version history

### Voice/Tone Disputes

If editorial review conflicts with Content Owner:

1. Editor's judgment prevails on voice/tone
2. Content Owner retains final say on factual accuracy
3. Disagreements escalated to Marketing Lead
4. Resolution documented

### Legal Concerns

If legal review flags a concern:

1. Legal review is blocking — page cannot publish without resolution
2. Content Owner and Legal Reviewer collaborate on acceptable language
3. If material changes needed, page re-enters Stage 2
4. Legal approval documented in version history

### Emergency Updates

For time-sensitive corrections (incorrect pricing, security misinformation, regulatory error):

1. Fast-track through Stage 2 (technical review only)
2. Stage 3 (editorial) can be abbreviated
3. Stage 4 (legal) skipped unless compliance-related
4. Stage 5 (publish) within 24 hours
5. Full review cycle completed within 1 week
6. Incident documented in version history
