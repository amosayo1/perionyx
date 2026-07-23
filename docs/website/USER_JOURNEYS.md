# Perionyx Public Website — User Journeys

> **Phase**: 22.0A — Public Platform Architecture
> **Status**: Architecture (no code)
> **Last Updated**: 2026-07-22
> **Conversion Goal**: Demo request (`/demo`)

---

## Journey 1: CFO Evaluating Platform

### Persona
**Sarah**, CFO at a mid-market manufacturing company ($500M revenue). Currently using NetSuite + spreadsheets. Evaluating a new finance platform. Risk-averse, time-poor, needs to justify the decision to the board.

### Journey Map

| Stage | Page | Emotion | CTA | Conversion Metric |
|---|---|---|---|---|
| 1. Discovery | Google search: "enterprise finance platform CFO" | Skeptical, overwhelmed by options | — | Impressions, CTR from SERP |
| 2. First impression | `/` (Home) | Curious — "Is this relevant to me?" | "See the Product" | Bounce rate, time on page |
| 3. Product exploration | `/product` | Interested — "12 modules, that's comprehensive" | Click "Treasury" (her biggest pain) | Click-through rate |
| 4. Specific need | `/product/treasury` | Engaged — "This matches my workflow" | "Book a Demo" | CTA click rate |
| 5. Trust verification | `/security` | Cautious — "Can I trust this with my data?" | "Read the Full Security Docs" | Scroll depth, time on page |
| 6. Social proof | `/research/customer-stories` | Reassured — "Other CFOs are using this" | "Book a Demo" | CTA click rate |
| 7. Conversion | `/demo` (Book a Demo form) | Committed — ready to talk | Submit form | Form completion rate |

### Key Touchpoints
- **Home page**: Must answer "Is this for me?" within 3 seconds. CFO sees "Enterprise Finance Platform" in hero, not feature lists.
- **Product page**: Treasury page shows workflow diagram — CFO maps it to her current process mentally.
- **Security page**: Trust signals (AES-256, MFA, audit trail) remove the #1 objection: "Is it secure?"
- **Customer stories**: Seeing a peer CFO's quote removes remaining doubt.

### Emotions Arc
Skepticism (Google) -> Curiosity (Home) -> Interest (Product) -> Engagement (Treasury) -> Caution (Security) -> Confidence (Stories) -> Commitment (Demo)

### Success Criteria
- Time from first visit to demo request: < 7 days
- Pages visited before demo: 4-6 (not 1, not 20)
- Security page visited: 80%+ of demo requesters
- Customer stories visited: 60%+ of demo requesters

---

## Journey 2: Controller Researching Compliance

### Persona
**Michael**, Controller at a financial services firm. Audit season approaching. Current compliance process is manual — spreadsheets, email approvals, ad-hoc evidence gathering. Needs to show the audit committee a better approach.

### Journey Map

| Stage | Page | Emotion | CTA | Conversion Metric |
|---|---|---|---|---|
| 1. Discovery | Google search: "compliance automation software audit trail" | Urgent — "Audit is in 3 months" | — | Impressions, CTR from SERP |
| 2. Compliance overview | `/security/compliance` | Hopeful — "There's a roadmap" | "Read the Full Security Docs" | Time on page, scroll depth |
| 3. Security overview | `/security` | Impressed — "This is comprehensive" | "See Tamper-Evident Audit" | Navigation click-through |
| 4. Audit trail | `/product/audit` | Convinced — "This is exactly what auditors need" | "Book a Demo" | CTA click rate |
| 5. Product overview | `/product` | Curious — "What else does this do?" | Explore other modules | Pages per session |
| 6. Conversion | `/demo` | Ready — "I need to show this to my CFO" | Submit form | Form completion rate |

### Key Touchpoints
- **Compliance page**: Current % status (SOC 2 52%, ISO 27001 45%) shows honesty — not claiming compliance, showing the journey.
- **Audit trail page**: "Append-only, cryptographically verified" — answers the auditor's #1 question.
- **Product overview**: Controller discovers this isn't just audit — it's the whole finance stack.

### Emotions Arc
Urgency (Search) -> Hope (Compliance) -> Impression (Security) -> Conviction (Audit) -> Expansion (Product) -> Action (Demo)

### Success Criteria
- Compliance page to demo conversion: > 5% (high-intent traffic)
- Audit trail page time on page: > 3 minutes (deep reading)
- Controller role in demo request: > 30% of all demo requests

---

## Journey 3: Engineer Evaluating Stack

### Persona
**Priya**, Senior Engineer at a fintech startup. Evaluating Perionyx as a potential integration partner or employment opportunity. Wants to understand the technical depth and engineering culture.

### Journey Map

| Stage | Page | Emotion | CTA | Conversion Metric |
|---|---|---|---|---|
| 1. Discovery | Link from HN / Twitter / blog post | Curious — "What's under the hood?" | — | Referral traffic, social shares |
| 2. Engineering hub | `/engineering` | Intrigued — "This is a serious engineering team" | "Read Architecture Decisions" | Click-through rate |
| 3. Architecture deep-dive | `/engineering/architecture` | Impressed — "Decimal(38,12), that's real precision" | "See Performance Numbers" | Time on page, scroll depth |
| 4. Performance | `/engineering/performance` | Convinced — "32ms median, that's legit" | "Explore the Stack" | Navigation click-through |
| 5. Platform overview | `/platform` | Full picture — "Next.js 16, 392 routes, 338 models" | "Read the API Docs" | Click-through rate |
| 6. API docs | `/platform/api` | Practical — "I could build on this" | "Get Started" | CTA click rate |
| 7. Fork / Star | GitHub (external) | Aligned — "This is how I'd build it" | Star / Fork / Open issue | GitHub stars, forks |

### Key Touchpoints
- **Engineering blog**: Essay-style content shows depth, not marketing. "From 900ms to 32ms" is a story engineers relate to.
- **Architecture page**: ADR index shows maturity — decisions are documented, not improvised.
- **API page**: Consistent error contract, Zod validation, idempotency keys — signs of a well-built API.

### Emotions Arc
Curiosity (Discovery) -> Intrigue (Engineering) -> Impression (Architecture) -> Respect (Performance) -> Alignment (Platform) -> Action (GitHub)

### Success Criteria
- Engineering pages average time on page: > 4 minutes
- GitHub referral traffic: > 20% of engineering page visitors
- Engineering blog subscribers: growing 10% month-over-month

---

## Journey 4: Design Partner Discovery

### Persona
**James**, VP of Product at a large enterprise software company. Exploring AI capabilities for potential partnership. Evaluating whether Perionyx's AI approach is genuine or marketing.

### Journey Map

| Stage | Page | Emotion | CTA | Conversion Metric |
|---|---|---|---|---|
| 1. Discovery | Google search: "explainable AI finance" or conference mention | Skeptical — "Everyone claims explainable AI" | — | Impressions, CTR from SERP |
| 2. AI overview | `/ai` | Cautiously interested — "Evidence-first, that's different" | "See AI Capabilities" | Click-through rate |
| 3. AI capabilities | `/ai/capabilities` | Engaged — "Real examples, not vaporware" | "See Explainability" | Time on page |
| 4. Explainability | `/ai/explainability` | Convinced — "They show the reasoning, not just the answer" | "See Governance" | Scroll depth |
| 5. AI governance | `/ai/governance` | Trusting — "Permission-scoped, human-in-the-loop" | "Explore the Platform" | Navigation click-through |
| 6. Partner page | `/company/partners` | Interested — "Partnership is possible" | "Become a Partner" | CTA click rate |
| 7. Conversion | `/company/contact` (Partnership inquiry) | Ready — "Let's explore this" | Submit form | Form completion rate |

### Key Touchpoints
- **AI overview**: "What AI will NOT do" section builds trust through honesty — not overselling.
- **Explainability page**: The "who to ask if you disagree" path shows human-centered design.
- **Governance page**: Permission-scoped AI actions show enterprise maturity.

### Emotions Arc
Skepticism (Search) -> Cautious interest (AI overview) -> Engagement (Capabilities) -> Conviction (Explainability) -> Trust (Governance) -> Action (Partnership)

### Success Criteria
- AI section pages visited: 4+ pages average for partnership leads
- Partnership form completion rate: > 10%
- Time from first AI visit to partnership inquiry: < 14 days

---

## Journey 5: Investor Due Diligence

### Persona
**David**, Partner at a venture capital firm. Conducting due diligence on Perionyx for a potential Series A investment. Evaluates team, market, traction, and technical moat.

### Journey Map

| Stage | Page | Emotion | CTA | Conversion Metric |
|---|---|---|---|---|
| 1. Discovery | Warm intro or Crunchbase | Analytical — "Let me understand this company" | — | Referral traffic |
| 2. Company overview | `/company` | Evaluating — "Who are these people?" | "See Our Mission" | Time on page |
| 3. Mission | `/company/mission` | Impressed — "Clear thesis, clear market" | "Meet the Team" | Click-through rate |
| 4. Team | `/company/team` | Assessing — "Domain experts + engineers" | "See the Product" | Navigation click-through |
| 5. Product overview | `/product` | Convinced — "12 modules, this is comprehensive" | "See the Architecture" | Click-through rate |
| 6. Platform architecture | `/platform/architecture` | Deeply impressed — "This is a real technical moat" | "View Metrics" | Scroll depth |
| 7. Research | `/research/insights` | Validated — "Market data supports the thesis" | Contact team | Referral to email |

### Key Touchpoints
- **Company page**: Founding story must articulate the "why now" — why this market, why this team.
- **Team page**: Investors look for domain expertise + technical depth combination.
- **Architecture page**: Decimal(38,12), 338 models, 392 APIs — these numbers signal scale and commitment.
- **Research page**: "47 finance leader conversations" shows customer discovery rigor.

### Emotions Arc
Analysis (Company) -> Evaluation (Mission) -> Assessment (Team) -> Convinced (Product) -> Impressed (Architecture) -> Validated (Research)

### Success Criteria
- Time on site: > 10 minutes (deep reading)
- Pages visited: 6+ (thorough evaluation)
- Return visits: 2+ (due diligence takes time)
- Email contact from investor: trackable referral

---

## Journey 6: Security Professional Audit

### Persona
**Lisa**, CISO at a healthcare company. Conducting a security assessment of Perionyx before recommending it to the CIO. Needs to verify security claims against real evidence.

### Journey Map

| Stage | Page | Emotion | CTA | Conversion Metric |
|---|---|---|---|---|
| 1. Discovery | Google search: "Perionyx security" or vendor security questionnaire | Methodical — "Show me the evidence" | — | Impressions, CTR from SERP |
| 2. Security overview | `/security` | Evaluating — "Let's see the layers" | "Read the Full Security Docs" | Scroll depth |
| 3. Authentication | `/security/authentication` | Impressed — "TOTM MFA, timing-safe comparison, that's real" | "See Access Control" | Time on page |
| 4. Encryption | `/security/encryption` | Satisfied — "AES-256-GCM, key rotation" | "See Compliance Roadmap" | Navigation click-through |
| 5. Compliance | `/security/compliance` | Honest — "52% SOC 2, not claiming full compliance yet" | "Read the Architecture" | Click-through rate |
| 6. Platform security | `/platform/security` | Deep validation — "Security is architectural, not bolted on" | "View Audit Trail" | Scroll depth |
| 7. Audit trail | `/product/audit` | Convinced — "Append-only, cryptographically verified" | "Book a Demo" | CTA click rate |
| 8. Conversion | `/demo` | Ready — "I can recommend this to the CIO" | Submit form | Form completion rate |

### Key Touchpoints
- **Security overview**: Layer diagram shows defense-in-depth, not a single wall.
- **Authentication page**: Timing-safe comparison, 30s revocation cache — specific, verifiable claims.
- **Compliance page**: Honest current percentages (not "fully compliant") builds trust with security professionals who know what "fully compliant" actually means.

### Emotions Arc
Methodical (Search) -> Evaluation (Security) -> Impression (Auth) -> Satisfaction (Encryption) -> Trust (Compliance) -> Validation (Platform) -> Conviction (Audit) -> Action (Demo)

### Success Criteria
- Security section pages visited: 5+ pages (thorough audit)
- Average time on security pages: > 3 minutes (deep reading)
- Compliance page viewed: 90%+ of security leads
- Security professional role in demo: > 15% of all demo requests

---

## Journey 7: Treasury Manager Research

### Persona
**Tom**, Treasury Manager at a multinational corporation. Managing cash across 12 entities, 8 banks, 5 currencies. Current process: daily bank portal logins + Excel. Pain: no real-time visibility.

### Journey Map

| Stage | Page | Emotion | CTA | Conversion Metric |
|---|---|---|---|---|
| 1. Discovery | Google search: "multi-bank treasury management" or "cash visibility software" | Frustrated — "I spend 2 hours daily just checking balances" | — | Impressions, CTR from SERP |
| 2. Treasury product | `/product/treasury` | Hopeful — "Real-time across every bank, that's what I need" | "Book a Demo" | CTA click rate |
| 3. Cash management | `/product/cash-management` | Engaged — "Multi-currency, forecasting, sweeps" | "See the Architecture" | Navigation click-through |
| 4. Connectors | `/platform/connectors` | Practical — "Do they connect to my banks?" | "Read the API Docs" | Click-through rate |
| 5. Reconciliation | `/product/reconciliation` | Excited — "Auto-matching, that would save 3 days per month" | "Book a Demo" | CTA click rate |
| 6. AI capabilities | `/ai/capabilities` | Intrigued — "Cash forecasting with AI? Let me see" | "Book a Demo" | CTA click rate |
| 7. Conversion | `/demo` | Committed — "This could transform my team" | Submit form | Form completion rate |

### Key Touchpoints
- **Treasury page**: The workflow diagram (Bank Feed -> Position -> Forecast -> Decision -> Action -> Reconciliation) maps directly to Tom's daily routine.
- **Connectors page**: "50+ financial systems" with specific bank logos — Tom needs to see his bank.
- **Reconciliation page**: "Auto-match at scale" directly addresses the 3-day manual process.

### Emotions Arc
Frustration (Search) -> Hope (Treasury) -> Engagement (Cash) -> Practicality (Connectors) -> Excitement (Reconciliation) -> Intrigue (AI) -> Commitment (Demo)

### Success Criteria
- Treasury product page CTA click rate: > 5% (high intent)
- Connectors page visited: 70%+ of treasury leads
- Treasury + reconciliation page combo: indicates high-intent prospect
- Demo form "treasury" as primary interest: > 25% of all requests

---

## Journey 8: Future Employee

### Persona
**Aisha**, mid-career software engineer. Interested in fintech. Wants to join a company with strong engineering culture, meaningful work, and growth opportunities.

### Journey Map

| Stage | Page | Emotion | CTA | Conversion Metric |
|---|---|---|---|---|
| 1. Discovery | Job posting, LinkedIn, referral, or blog post | Curious — "What is Perionyx?" | — | Referral traffic, job board clicks |
| 2. Company overview | `/company` | Interested — "Finance platform built by finance people" | "See Our Mission" | Click-through rate |
| 3. Mission | `/company/mission` | Aligned — "Earn trust, not demand it. I like this." | "Meet the Team" | Click-through rate |
| 4. Team | `/company/team` | Excited — "Domain experts + strong engineers" | "See Open Positions" | Click-through rate |
| 5. Careers | `/company/careers` | Evaluating — "Is there a role for me?" | "Apply Now" | CTA click rate |
| 6. Engineering blog | `/engineering` | Impressed — "443 tests, Decimal precision, they take this seriously" | "Read Architecture Decisions" | Time on page, scroll depth |
| 7. Architecture | `/engineering/architecture` | Convinced — "This is how I'd build it" | "Apply Now" | Return to careers |
| 8. Conversion | `/company/careers` (Apply) | Committed — "I want to work here" | Submit application | Application completion rate |

### Key Touchpoints
- **Company page**: Founding story and values resonate with engineers who care about craft.
- **Careers page**: Role descriptions must be specific — not "rockstar" or "ninja" but real responsibilities.
- **Engineering blog**: Shows the culture in action — "We document decisions, we test everything, we build for precision."

### Emotions Arc
Curiosity (Discovery) -> Interest (Company) -> Alignment (Mission) -> Excitement (Team) -> Evaluation (Careers) -> Impression (Engineering) -> Conviction (Architecture) -> Action (Apply)

### Success Criteria
- Careers page to application conversion: > 8% (strong for job pages)
- Engineering blog as entry point for candidates: > 30%
- Average time on engineering pages from career seekers: > 5 minutes
- Application quality: 50%+ pass initial screen

---

## 9. Cross-Journey Patterns

### 9.1 Common High-Intent Sequences

| Sequence | Intent | Priority |
|---|---|---|
| `/product/*` -> `/security` -> `/demo` | Evaluation + trust verification | Highest |
| `/ai/*` -> `/ai/explainability` -> `/demo` | AI evaluation + trust | High |
| `/engineering/*` -> `/platform/*` -> GitHub | Technical evaluation | High |
| `/company/careers` -> `/engineering/*` -> Apply | Talent acquisition | Medium |
| `/security/*` -> `/product/audit` -> `/demo` | Compliance evaluation | High |
| `/company` -> `/company/team` -> `/company/careers` | Investor or candidate | Medium |

### 9.2 Drop-Off Risk Points

| Risk Point | Cause | Mitigation |
|---|---|---|
| Home -> Bounce | "Not for me" signal | Hero must say "Enterprise Finance" in first line |
| Product -> Leave | Too many modules, no clear path | Persona-based quick links on product page |
| Security -> Leave | "Too much detail" or "not enough detail" | 30-second summary + 5-minute deep dive structure |
| Demo form -> Abandon | Too many fields | 4 fields max: name, email, company, role |

### 9.3 Conversion Attribution Model

| Touch | Weight | Rationale |
|---|---|---|
| `/demo` form visit | 10% | Shows intent |
| `/security` pages visited | 15% | Trust verification = high-intent |
| 3+ product pages visited | 15% | Deep exploration |
| `/research/customer-stories` visited | 10% | Social proof seeking |
| Return visit (2+ sessions) | 20% | Deliberation = serious |
| `/engineering` -> `/platform` | 10% | Technical evaluation |
| CTA click on any page | 10% | Active interest |
| Newsletter subscribe | 5% | Long-term interest |
| `/company/careers` | 5% | Talent pipeline |
