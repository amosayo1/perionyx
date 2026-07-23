# Perionyx Website — Information Architecture

> **Phase**: 22.0A — Public Platform Architecture  
> **Status**: Architecture (no code)  
> **Principle**: The Brain is the source of truth. The website is a curated public view.

---

## 1. IA Philosophy

The information architecture mirrors how enterprise buyers think, not how the company is organized. Every page answers a question the visitor arrived with. Every path leads to confidence.

**Core IA Principles:**
1. **Question-first navigation** — Pages are named after the questions they answer
2. **Progressive disclosure** — Simple on the surface, technical underneath
3. **Audience-aware routing** — Multiple paths to the same truth, optimized per persona
4. **Trust accumulation** — Every page visit adds evidence, never removes it
5. **Zero dead ends** — Every page has a clear next step

---

## 2. Content Hierarchy

### 2.1 Primary Navigation (Top-Level)

| Level | Section | Purpose | Primary Audience |
|---|---|---|---|
| 1 | Product | What Perionyx does | CFO, Finance Director, Controller |
| 2 | Platform | How Perionyx is built | Engineer, Security, Enterprise Architect |
| 3 | Security | Why Perionyx is safe | Security Professional, CFO, Compliance |
| 4 | AI | What intelligence Perionyx provides | CFO, Controller, Treasury |
| 5 | Engineering | How we build | Engineer, Future Employee |
| 6 | Research | What we've learned | Investor, Finance Leader, Engineer |
| 7 | Company | Who we are | All audiences |

### 2.2 Secondary Navigation

| Section | Sub-pages |
|---|---|
| Product | Accounts Payable, Accounts Receivable, Treasury, Approvals, Risk, Compliance, Reconciliation, Audit, Executive Intelligence, AI Copilot, Workflow Engine, Financial Intelligence |
| Platform | Architecture, Workflow Engine, Ledger, Financial Core, Decision Engine, AI Platform, Integration Layer, Observability, Security, Multi-tenancy, Infrastructure |
| Security | Philosophy, Architecture, Identity, Access Control, Audit, Financial Precision, Encryption, Tenant Isolation, Responsible Disclosure, Compliance Roadmap |
| AI | Evidence-First AI, Human in Control, Explainability, Confidence, Recommendations, Executive Briefings, Decision Intelligence, What AI Will Not Do |
| Engineering | Principles, Architecture Philosophy, Financial Precision, Workflow Design, Performance, Security Engineering, AI Principles, Developer Culture |
| Company | About, Careers, Design Partners, Contact, Privacy, Terms, Responsible Disclosure, Status |

### 2.3 Utility Navigation

| Element | Purpose |
|---|---|
| Login | Existing customer access |
| Book a Demo | Primary conversion CTA |
| Changelog | Product updates |
| Roadmap | Public roadmap |
| Status | System status |

---

## 3. Content Depth Map

```
Home (1 screen)
├── Product
│   ├── Overview (1 scroll)
│   ├── Accounts Payable (3-4 scrolls)
│   ├── Accounts Receivable (3-4 scrolls)
│   ├── Treasury (3-4 scrolls)
│   ├── Approvals (2-3 scrolls)
│   ├── Risk (2-3 scrolls)
│   ├── Compliance (2-3 scrolls)
│   ├── Reconciliation (2-3 scrolls)
│   ├── Audit (2-3 scrolls)
│   ├── Executive Intelligence (3-4 scrolls)
│   ├── AI Copilot (3-4 scrolls)
│   ├── Workflow Engine (3-4 scrolls)
│   └── Financial Intelligence (3-4 scrolls)
├── Platform
│   ├── Overview (1 scroll)
│   ├── Architecture (4-5 scrolls)
│   ├── Ledger (3-4 scrolls)
│   ├── Security (linked from /security)
│   ├── AI Platform (linked from /ai)
│   └── [Individual pages: 2-3 scrolls each]
├── Security (5-6 scrolls — deep, comprehensive)
├── AI (4-5 scrolls)
├── Engineering (3-4 scrolls per page)
├── Research (2-3 scrolls per article)
├── Company
│   ├── About (2-3 scrolls)
│   ├── Careers (3-4 scrolls)
│   ├── Design Partners (3-4 scrolls — critical page)
│   └── Legal pages (1-2 scrolls each)
├── Changelog (continuous scroll)
├── Roadmap (2-3 scrolls)
└── Status (1 screen)
```

---

## 4. Page Relationships

### 4.1 Cross-Linking Rules

| From | To | Link Type |
|---|---|---|
| Home → Product overview | Every product page | Section cards |
| Product pages → Platform details | Relevant platform pages | "How it works" links |
| Security → Compliance pages | Compliance roadmap | Inline links |
| AI → Evidence pages | Engineering AI principles | "Learn more" |
| Engineering → Architecture | Platform overview | "Read the docs" |
| Research → Product pages | Relevant product features | "See it in action" |
| Design Partners → Product pages | Relevant features | "What you'll shape" |
| Careers → Engineering pages | Engineering principles | "How we build" |

### 4.2 Breadcrumb Strategy

```
Home
Home > Product
Home > Product > Accounts Payable
Home > Platform
Home > Platform > Architecture
Home > Security
Home > AI
Home > Engineering
Home > Engineering > Principles
Home > Company
Home > Company > Careers
Home > Company > Design Partners
```

---

## 5. URL Architecture

| Pattern | Example | Purpose |
|---|---|---|
| `/` | Home | Single homepage |
| `/product` | Product overview | Hub page |
| `/product/{module}` | `/product/accounts-payable` | Product detail |
| `/platform` | Platform overview | Hub page |
| `/platform/{component}` | `/platform/architecture` | Platform detail |
| `/security` | Security overview | Deep single page |
| `/ai` | AI overview | Hub page |
| `/ai/{topic}` | `/ai/explainability` | AI detail |
| `/engineering` | Engineering overview | Hub page |
| `/engineering/{topic}` | `/engineering/principles` | Engineering detail |
| `/research` | Research hub | Blog-like listing |
| `/research/{slug}` | `/research/month-end-close` | Article |
| `/company` | About | Company overview |
| `/careers` | Careers | Job listings |
| `/design-partners` | Design Partners | Program page |
| `/contact` | Contact | Form |
| `/changelog` | Changelog | Product updates |
| `/roadmap` | Roadmap | Public roadmap |
| `/status` | Status page | System health |
| `/privacy` | Privacy Policy | Legal |
| `/terms` | Terms of Service | Legal |
| `/responsible-disclosure` | Security disclosure | Legal |

---

## 6. Content Freshness Model

| Content Type | Update Frequency | Source |
|---|---|---|
| Product pages | Monthly | Product team |
| Security page | Quarterly + as needed | Security team |
| Engineering pages | Quarterly | Engineering team |
| Research | Bi-weekly | Research team |
| Changelog | Per release | Product team |
| Roadmap | Monthly | Product team |
| Status | Real-time | Automated |
| Careers | As needed | HR |
| Legal | As needed | Legal |

---

## 7. IA Anti-Patterns (What We Avoid)

| Anti-Pattern | Why We Avoid It |
|---|---|
| Carousel-heavy home page | CFOs don't carousel. One message, one scroll. |
| Feature dumping | We explain outcomes, not feature lists |
| Jargon-first navigation | "Accounts Payable" not "Procure-to-Pay Solution" |
| Login-gated information | Everything public is public. No hidden pages. |
| Infinite scroll without structure | Every scroll section has a clear header and purpose |
| Pop-ups and modals for CTAs | CTAs are in the flow, not interrupting it |
| Stock photography | We use purposeful illustration, never stock |
| Auto-playing video | Video plays when the user chooses to watch |
