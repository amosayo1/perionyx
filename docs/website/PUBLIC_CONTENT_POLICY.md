# Perionyx Public Platform — Public Content Policy

## Overview

This policy defines what can and cannot be published on the Perionyx public website. Every published piece traces back to a Brain document. The Brain remains authoritative. The public website is a curated public view — never independent knowledge.

---

## What CAN Be Published

### Architecture Patterns

- High-level architecture concepts (CQRS, event sourcing, domain events)
- Design patterns used (aggregate roots, value objects, repository pattern)
- Technology choices (PostgreSQL, Prisma, Next.js, TypeScript) without configuration details
- Integration patterns (REST, webhooks, message queues) without internal topology
- Multi-tenancy approach and isolation guarantees

**Source Brain docs**: Architecture freeze document, platform primitives, module responsibility matrix.

### Security Approach and Philosophy

- Security-first engineering culture and principles
- Authentication methods (password, MFA, SSO) and their guarantees
- Authorization model (RBAC, ABAC) and permission structure
- Encryption standards (AES-256-GCM, key rotation)
- Audit trail design and tamper-evident guarantees
- Compliance posture and roadmap (SOC 2, PCI DSS, GDPR, ISO 27001)
- Dependency scanning and supply chain security approach

**Source Brain docs**: Security audit findings (public summary), compliance readiness, MFA architecture, error handling strategy.

### Design Principles and System

- Design philosophy (clarity, confidence, speed, beauty, trust)
- Component architecture and patterns
- Motion system principles
- Form system philosophy
- Accessibility standards and practices
- Mobile experience approach

**Source Brain docs**: Engineering constitution, UX accessibility audit, motion system documentation, enterprise forms philosophy.

### Engineering Principles and Culture

- Engineering values and practices
- Architecture decision-making process
- Code quality standards
- Testing philosophy
- Documentation approach
- Open-source contributions and philosophy

**Source Brain docs**: Engineering constitution, architecture decision records, lesson documents.

### Product Capabilities and Descriptions

- What each domain does (AP, AR, Treasury, Approvals, etc.)
- Workflow descriptions at the conceptual level
- Integration capabilities
- AI capabilities and approach
- Reporting and analytics capabilities

**Source Brain docs**: Domain architecture documents, workflow validation reports, product readiness assessments.

### Customer Discovery Insights (Anonymized)

- Aggregated pain points from customer interviews
- Industry trend observations
- Workflow friction patterns
- Technology adoption patterns
- All customer insights are anonymized and aggregated

**Source Brain docs**: Customer discovery pain points, workflow friction analysis, product readiness assessment.

### Industry Observations and Trends

- Enterprise finance technology trends
- AI adoption patterns in finance
- Regulatory changes affecting finance teams
- Market analysis and competitive landscape (fair comparisons only)

**Source Brain docs**: Enterprise workflow revalidation, enterprise scorecard, product readiness assessment.

### Performance Benchmarks (Anonymized)

- API response time targets and actuals (p50, p95, p99)
- Database query performance
- Page load performance (Core Web Vitals)
- System availability targets
- All benchmarks are anonymized and representative

**Source Brain docs**: Performance audit reports, database optimization reports, API optimization reports.

### Compliance Posture and Roadmap

- Current compliance status (SOC 2 readiness percentage, etc.)
- Compliance roadmap and timeline
- Security controls implemented
- Audit processes and procedures
- Data handling and privacy approach

**Source Brain docs**: Compliance readiness assessments, security audit findings.

---

## What CANNOT Be Published

### Source Code or Proprietary Algorithms

- No source code snippets (except public open-source)
- No proprietary algorithm implementations
- No internal library or framework code
- No configuration files or environment variables
- No database migration files
- No API key formats or authentication internals

**Exception**: Public open-source contributions under approved license.

### Internal Business Metrics or Financials

- Revenue, growth, or financial performance
- Customer count or specific customer names
- Employee count or organizational structure
- Funding details or investor information
- Internal KPIs or targets

### Customer Data or Identifiable Information

- Customer names, emails, or contact information
- Customer usage patterns or analytics
- Customer configuration details
- Customer workflow specifics
- Any data that could identify a customer

### Specific Security Vulnerabilities

- Detailed vulnerability descriptions
- Exploit details or proof-of-concept code
- Internal security testing results
- Penetration test findings
- Specific remediation timelines for active vulnerabilities

**Exception**: General security approach and philosophy is publishable.

### Internal Tooling or Infrastructure Details

- Internal CI/CD pipeline specifics
- Development environment configuration
- Internal monitoring tooling details
- Deployment scripts or procedures
- Infrastructure provider account details
- Internal DNS or network topology

### Competitive Intelligence Sources

- Sources of competitive intelligence
- Internal competitive analysis documents
- Pricing intelligence on competitors
- Employee testimonials about competitors

### Internal Decision-Making Processes

- Internal meeting notes or决策 documents
- Strategic planning documents
- Internal priority disputes or disagreements
- Personnel decisions or organizational changes

### Employee Personal Information

- Employee names, titles, or contact information (without explicit consent)
- Employee social media accounts
- Employee personal projects or side work

### Unreleased Product Features

- Features in development not yet public
- Roadmap items not yet announced
- Internal feature names or codenames
- Beta features not yet generally available

**Exception**: General roadmap themes may be referenced in appropriate context.

### Internal Architecture Diagrams That Reveal Attack Surface

- Detailed network topology
- Specific IP addresses or hostnames
- Database connection strings or credentials
- Internal service mesh or communication patterns
- Specific port numbers or service endpoints

**Exception**: Conceptual architecture diagrams that show patterns without revealing implementation topology.

---

## Brain → Public Content Rules

### Rule 1: Source Traceability

Every public page must reference a Brain document as its source. The reference is stored in page metadata and visible in the content governance system.

**Format**: `Source: {Brain document path} — {section or topic referenced}`

### Rule 2: Curated Summary, Never Copy

Public content is a curated summary of Brain knowledge. It is never a verbatim copy. The public version is written for a different audience (external evaluators vs. internal engineers) and uses different language, structure, and depth.

**Test**: If the public page reads like internal documentation, it needs rewriting.

### Rule 3: Appropriate Technical Depth

Technical depth is appropriate for the audience — not dumbed down, not exposing internals. A platform page for CTOs should be technically credible. A product page for CFOs should be workflow-focused.

**Guidelines**:
- Product pages: conceptual depth, workflow focus
- Platform pages: architectural depth, pattern focus
- Security pages: method depth, guarantee focus
- AI pages: approach depth, transparency focus
- Engineering pages: principle depth, culture focus

### Rule 4: Customer Quotes Require Consent

Any customer quote, case study, or testimonial requires explicit written consent from the customer. Consent must cover:
- Specific quote or data point
- Publication channel (website, blog, etc.)
- Duration of use
- Right to revoke

### Rule 5: Architecture Diagrams Show Concepts

Architecture diagrams show concepts and patterns, not implementation topology. Diagrams should be understandable without knowledge of internal systems.

**Allowed**: Box-and-arrow diagrams showing domains, flows, and patterns.
**Not allowed**: Detailed implementation diagrams with specific technologies, endpoints, or configurations.

### Rule 6: Security Pages Require Security Review

All security-related pages require review by the security team before publication. This includes:
- Security overview and philosophy pages
- Authentication and authorization pages
- Encryption and compliance pages
- Any page making security claims

### Rule 7: All Numbers Must Be Verifiable

Every specific number in public content must be either:
- Verifiable by the reader (public benchmarks, public standards)
- Labeled as representative or typical
- Dated (e.g., "as of Q3 2026")
- Sourced to a specific internal measurement

**Not allowed**: Vague claims like "blazing fast", "industry-leading", or "best-in-class" without supporting data.

---

## Review Workflow

```
Author drafts content from Brain source
  ↓
Technical Review (accuracy, claims, diagrams)
  ↓
Editorial Review (voice, tone, clarity, SEO)
  ↓
Legal Review (if triggered: compliance, claims, privacy)
  ↓
Accessibility Review (contrast, labels, keyboard)
  ↓
SEO Review (metadata, schema, keywords)
  ↓
Publish
  ↓
Monitor (analytics, feedback, search performance)
  ↓
Refresh (quarterly or per Brain update)
```

### Review SLA

| Review Type | SLA | Blocking? |
|---|---|---|
| Technical Review | 3 business days | Yes |
| Editorial Review | 2 business days | Yes |
| Legal Review | 5 business days | Yes (when triggered) |
| Accessibility Review | 2 business days | Yes |
| SEO Review | 1 business day | Yes |
| Emergency Fast-track | 24 hours | Abbreviated |

### Approval Authority

| Content Type | Final Approval |
|---|---|
| Product Pages | Product Lead |
| Platform Pages | Engineering Lead |
| Security Pages | Security Lead |
| AI Pages | AI Lead |
| Engineering Pages | Engineering Lead |
| Research Posts | Research Lead |
| Changelog | Engineering Lead |
| Blog Posts | Marketing Lead |
| Legal Pages | Legal Lead |

---

## Content Exceptions

### Thought Leadership

Individual author bylines are allowed on engineering blog posts and research posts. The author's name and title are published. The author's personal social media accounts are NOT linked without explicit consent.

### Conference Talks

Conference talk materials (slides, recordings) may be published with:
- Speaker consent
- Slide review for content policy compliance
- Attribution to conference and speaker

### Open Source

Open-source contributions follow the open-source contribution policy. Source code published under approved license is exempt from the "no source code" rule.

### Partner Content

Partner content (co-authored blog posts, case studies) requires:
- Partner review and approval
- Legal review of partnership terms
- Content policy compliance review
