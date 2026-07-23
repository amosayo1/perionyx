# Perionyx Public Website — Copywriting Guide

> **Status**: v1.0
> **Scope**: Voice, tone, and writing rules for all public-facing website copy
> **Principle**: Every sentence earns its place. Cut ruthlessly. Write clearly. Never hype.

---

## 1. Brand Voice Pillars

### 1.1 Confident (Not Arrogant)

We know what we're building and why. We don't hedge, qualify, or apologize. But we never dismiss competitors, never claim supremacy without evidence, and never use superlatives we can't back up.

| Do | Don't |
|---|---|
| "The ledger uses Decimal(38,12) precision." | "We believe our ledger might be more precise." |
| "Every API request is authenticated, authorized, and audited." | "Our best-in-class security is unmatched." |
| "Match PO, receipt, and invoice automatically." | "Our revolutionary matching engine transforms AP." |

### 1.2 Clear (Not Simplistic)

Every sentence serves a purpose. No filler words, no throat-clearing, no unnecessary qualifiers. But we don't dumb things down — we make complex things accessible without losing precision.

| Do | Don't |
|---|---|
| "32ms median response time, p99 under 120ms." | "Lightning-fast performance." |
| "64 permissions across 8 roles with 12 separation-of-duty rules." | "Robust access control." |
| "Match PO, receipt, and invoice automatically." | "Leverage intelligent matching capabilities." |

### 1.3 Enterprise (Not Stiff)

We speak the language of finance leaders — precise, measured, outcome-focused. But we're not corporate. We're direct. We avoid both startup-speak and management consulting jargon.

| Do | Don't |
|---|---|
| "SOC 2 Type II compliance roadmap." | "Bank-grade security for your business." |
| "Approvals that move at the speed of your business." | "Streamline your approval workflows." |
| "Every action logged. Every change traceable." | "We're on a mission to revolutionize financial governance." |

### 1.4 Technical (Not Jargon-Heavy)

We go deep when it matters. We don't avoid technical terms — we use them precisely and explain them once. We trust readers to be intelligent.

| Do | Don't |
|---|---|
| "Decimal(38,12) — not Float, not rounded Number." | "Our proprietary precision technology." |
| "Banker's rounding via `Intl.NumberFormat`." | "Advanced rounding algorithms." |
| "Append-only audit records. No UPDATE or DELETE permitted." | "Immutable audit logging infrastructure." |

### 1.5 Human (Not Casual)

We're building for people who have hard jobs. We acknowledge complexity without being cold. We're direct without being terse. We're professional without being stiff.

| Do | Don't |
|---|---|
| "Your team shouldn't have to chase approvals." | "Streamline your approval workflows." |
| "When the AI suggests a route, it shows its reasoning." | "AI-powered intelligent routing recommendations." |
| "Reconciliation at scale, not at scale of effort." | "Scale your reconciliation effortlessly." |

---

## 2. Writing Rules

### 2.1 Non-Negotiable Rules

1. **Active voice.** "The platform validates" not "validation is performed by the platform."
2. **Specific over vague.** "32ms p99" not "blazing fast." "392 API routes" not "hundreds of endpoints."
3. **Short sentences.** Hero sections: max 25 words. Body: max 2 sentences per paragraph.
4. **No jargon without explanation.** First use: "CQRS (Command Query Responsibility Segregation)." Subsequent uses: "CQRS."
5. **No superlatives without evidence.** Never "the most powerful" unless backed by a benchmark. Never "best-in-class" at all.
6. **Use "you" for the reader.** "Your team" not "the finance team." "Your data" not "customer data."
7. **Domain language first.** "Accounts payable" not "procure-to-pay solution." "Treasury" not "liquidity management platform."
8. **Every claim must be verifiable or labeled as representative.** "32ms median" (verifiable) or "Representative of typical performance" (labeled).

### 2.2 Sentence Construction

**Start with the subject.** Subject → verb → object. Don't bury the point.

| Weak | Strong |
|---|---|
| "With our platform, your team can automate AP workflows." | "Automate your AP workflows." |
| "In order to achieve financial precision, we use Decimal arithmetic." | "Decimal(38,12) precision. No Float." |
| "There are many benefits to using our reconciliation engine." | "Auto-match 10,000 transactions in minutes." |

**Use parallel structure.** Lists, features, benefits — keep them grammatically parallel.

| Weak | Strong |
|---|---|
| "Three-way matching, you can set up tolerance rules, and approval routing is automated." | "Three-way matching. Configurable tolerance rules. Automated approval routing." |

**Vary sentence length for rhythm.** Short sentences punch. Longer sentences explain. Alternate.

```
Good: "Every monetary calculation uses banker's rounding via `Intl.NumberFormat`. No phantom cents. No accumulation drift. Just precise financial data, every time."

Bad: "Our platform uses banker's rounding via Intl.NumberFormat which is a very precise method of rounding that eliminates phantom cents and prevents accumulation drift so your financial data is always accurate."
```

### 2.3 Paragraph Rules

- **Body paragraphs**: 2-3 sentences maximum. One idea per paragraph.
- **Feature descriptions**: 1-2 sentences. Feature → Benefit → Outcome.
- **Hero sections**: 1 sentence. Under 25 words. Period.
- **Subheadings**: 3-7 words. Active verb or clear noun phrase.
- **Never**: 4+ sentence paragraphs. Walls of text. Run-on explanations.

---

## 3. Headline Formulas

### 3.1 Formula 1: [Number] + [Outcome]

Leads with specificity. Works for metrics, platform pages, and proof points.

| Page | Headline |
|---|---|
| Home | "392 API routes. 67 modules. One platform." |
| Performance | "32ms median response time. Here's how." |
| API | "392 REST endpoints. Fully documented." |
| Platform | "338 data models. Zero phantom cents." |

### 3.2 Formula 2: [Verb] + [Domain]

Action-first. Works for product pages and capability statements.

| Page | Headline |
|---|---|
| AP | "Accounts payable without the manual" |
| AR | "Collections that work while you sleep" |
| Reconciliation | "Reconciliation at scale, not at scale of effort" |
| Compliance | "Compliance that runs itself" |

### 3.3 Formula 3: [Pain Point] → [Solution]

Acknowledges the problem, implies the fix. Works for pages targeting specific frustrations.

| Page | Headline |
|---|---|
| Approvals | "Approvals that move at the speed of your business" |
| Treasury | "Real-time cash visibility across every bank" |
| Audit | "Every action logged. Every change traceable." |
| General Ledger | "The ledger your auditors will thank you for" |

### 3.4 Formula 4: [Declarative Statement]

Confident, no hedging. Works for security, trust, and authority pages.

| Page | Headline |
|---|---|
| Security | "Your data is protected at every layer" |
| Encryption | "AES-256-GCM. Key rotation. No shortcuts." |
| AI | "AI that explains itself. Humans that stay in control." |
| Multi-tenancy | "Your data never touches another tenant's" |

### 3.5 Formula 5: [Question as Statement]

Implies the answer. Works for platform and engineering pages.

| Page | Headline |
|---|---|
| AI Providers | "Multiple providers. Zero lock-in." |
| Observability | "See everything. Miss nothing." |
| Deployment | "Ship with confidence" |
| Infrastructure | "From cache to queues, built for scale" |

---

## 4. Subheadline Patterns

Subheadlines support the headline by adding specificity without repeating the same words.

### Pattern A: Expand the Headline

| Headline | Subheadline |
|---|---|
| "Accounts payable without the manual" | "Automate invoice receipt, three-way matching, approval routing, and payment execution." |
| "Real-time cash visibility across every bank" | "Multi-bank connectivity, cash positioning, forecasting, and payment orchestration." |
| "AI that explains itself" | "Every recommendation shows its reasoning, confidence, and source." |

### Pattern B: Add Specificity

| Headline | Subheadline |
|---|---|
| "32ms median response time" | "CDN strategy, 79+ indexes, tiered caching (5s–600s TTL), and query parallelization." |
| "AES-256-GCM. Key rotation. No shortcuts." | "All sensitive data encrypted at rest and in transit. Automatic key rotation." |
| "99.9% uptime with graceful degradation" | "Circuit breakers, auto-reconnect, health probes, and graceful shutdown." |

### Pattern C: Address the Reader

| Headline | Subheadline |
|---|---|
| "The finance platform your team will actually use" | "Purpose-built for CFOs, Controllers, and Treasury teams. 392 API routes, 67 modules, 338 data models." |
| "Ship with confidence" | "Docker multi-stage builds, Kubernetes manifests, CI/CD pipelines, and automated rollback." |
| "Everything you need to build on Perionyx" | "TypeScript SDK, API reference, webhook guides, testing utilities." |

---

## 5. Body Copy

### 5.1 Structure

Every body section follows: **Context → Detail → Implication**.

```
Context: "Perionyx uses Decimal(38,12) for all monetary fields."
Detail: "Every calculation uses banker's rounding via `Intl.NumberFormat`."
Implication: "No phantom cents. No accumulation drift. Your auditors will thank you."
```

### 5.2 Transitions

Use short, clear transitions. No filler.

| Use | Don't Use |
|---|---|
| "Here's why." | "It is important to note that..." |
| "This means." | "As a result of this..." |
| "For example." | "In order to illustrate..." |
| "But." (standalone) | "However, it should be noted that..." |

### 5.3 Rhythm

Alternate short and long sentences. Break up lists with punctuation. Never let more than 3 sentences pass without a visual break (heading, bullet, image, or paragraph break).

---

## 6. Feature Descriptions

Use the **Feature → Benefit → Outcome** structure consistently.

### Format

```
[Feature name]. [What it does in 1 sentence]. [What that means for the reader].
```

### Examples

| Feature | Benefit | Outcome |
|---|---|---|
| Three-way matching | Automatically compares PO, receipt, and invoice | Discrepancies caught before they reach your desk |
| Tolerance rules | Configurable thresholds for acceptable variances | Small differences auto-resolve, large ones escalate |
| Tamper-evident audit | Append-only records with cryptographic verification | Every action logged, nothing deleted, auditors trust the data |
| TOTP-based MFA | Time-based one-time passwords with 10 recovery codes | Strong authentication without lockout risk |
| Decimal(38,12) precision | 38 digits, 12 decimal places for monetary values | No phantom cents, no accumulation drift, auditors thank you |

### Feature Card Template

For use in feature grids (6-8 cards per product page):

```
**[Feature Name]**
[One sentence: what it does.]
[One sentence: why it matters.]
```

Example:
```
**Duplicate Detection**
Scans incoming invoices against existing records before processing.
Catches duplicates before payment — not after.
```

---

## 7. Social Proof Copy

### 7.1 Metric Callouts

Metrics must be verifiable or clearly labeled as representative.

| Format | Example |
|---|---|
| Platform stats (verifiable) | "392 API routes. 67 modules. 338 data models." |
| Performance (verifiable) | "32ms median response time, p99 under 120ms." |
| Process metrics (representative) | "31 of 47 finance leaders said their AP process has 3+ manual handoffs." |

### 7.2 Customer Quotes

- Use real quotes when available. If not yet available, label as representative.
- Always include: name, role, company (or "Finance Leader, Enterprise" if anonymized).
- Keep quotes under 2 sentences.

| Do | Don't |
|---|---|
| "Perionyx replaced three tools we used for AP, treasury, and approvals." — Sarah Chen, CFO, Meridian Corp | "Perionyx is the best financial platform we've ever used." |
| "We cut our month-end close from 8 days to 3." — Finance Director, Fortune 500 (representative) | "Amazing product, highly recommended!" |

### 7.3 Case Study Blurbs

Structure: **Situation → Action → Result** in 2-3 sentences.

```
Meridian Corp managed AP across spreadsheets and email. Perionyx automated their three-way matching and approval routing. Month-end close dropped from 8 days to 3.
```

---

## 8. Technical Copy

### 8.1 API Documentation Style

- **Endpoint descriptions**: Verb + noun. "Create a vendor" not "Vendor creation endpoint."
- **Parameter descriptions**: Type + purpose + constraints. "amount (Decimal, required) — Payment amount in base currency. Min: 0.01."
- **Error descriptions**: Condition + cause + resolution. "403 Forbidden — Your API key lacks the `payments.execute` scope. Request elevated permissions."
- **Code examples**: Always include request and response. Use realistic data, not `foo`/`bar`.

### 8.2 Code Example Captions

Format: What the code does + why it matters.

```tsx
// Allocate $10,000 across two targets with residual handling
const result = allocateAmount({
  total: new Decimal('10000.00'),
  targets: [{ id: 'a', weight: 0.6 }, { id: 'b', weight: 0.4 }],
  precision: 2
});
// → { a: '6000.00', b: '4000.00' }
```

Caption: "Weighted allocation with automatic residual handling. The last target receives the remainder, preventing rounding errors."

### 8.3 Integration Descriptions

Format: What connects → what flows → what it enables.

```
Perionyx connects to your ERP via REST API. Invoice data, GL entries, and vendor records sync automatically. Your team gets real-time visibility without manual data entry.
```

---

## 9. Page-Specific Guidance

### 9.1 Home Page

**Tone**: Bold, metric-driven, one powerful sentence.

- Hero: 1 sentence. Under 25 words. No CTA in the hero text itself.
- Problem statement: 2-3 sentences. Acknowledge the pain without being preachy.
- Solution overview: 6 capability tiles, each with a 5-10 word value prop.
- Architecture callout: Lead with a specific number (Decimal(38,12)).
- Social proof: 1 metric or 1 quote. Not both competing for attention.

**Example hero**: "Financial intelligence that earns trust."
**Not**: "Welcome to Perionyx, the world's most comprehensive enterprise financial operating system."

### 9.2 Product Pages

**Tone**: Clear, workflow-focused, outcome-oriented.

- Hero: Verb + domain or pain → solution.
- Workflow: 3-5 steps, each with a verb and an outcome.
- Capabilities: 6-8 cards, Feature → Benefit → Outcome.
- Integration points: Name the connected modules. No vague "integrates with your stack."
- Trust signals: One specific technical fact (Decimal precision, append-only audit).

### 9.3 Security Pages

**Tone**: Precise, specific, evidence-backed.

- Lead with the guarantee, not the feature. "Your data never touches another tenant's" not "Multi-tenant data isolation."
- Every claim backed by a specific: algorithm (AES-256-GCM), count (64 permissions), or mechanism (row-level isolation).
- No marketing language. No "bank-grade." No "military-grade." Use the actual standard.
- Include what's NOT done honestly. "We don't store passwords in plaintext. We don't use MD5."

### 9.4 Engineering Pages

**Tone**: Thoughtful, technical, narrative-driven.

- Lead with the problem, not the solution. "We needed 32ms p99. Here's how we got there."
- Include design decisions and trade-offs. "We chose PgBoss over BullMQ because..."
- Show code. The code IS the content.
- Name the technologies honestly. "Next.js 16, Prisma ORM, PostgreSQL 16, Redis."

### 9.5 AI Pages

**Tone**: Transparent, honest about limitations, human-centered.

- Lead with what AI does, then immediately say what it doesn't. "AI suggests approval routes. Humans approve them."
- Every recommendation mentions confidence levels and source tracking.
- Be honest about limitations. "AI won't replace your CFO. It will replace the spreadsheet your CFO uses for morning briefings."
- Never promise autonomy. Always emphasize human control.

### 9.6 Research Pages

**Tone**: Factual, methodical, insight-forward.

- Lead with methodology. "We spoke with 47 finance leaders across 12 industries."
- Use exact numbers. "31 said..." not "most said..."
- Label findings clearly. "Finding:" or "Key insight:"
- No thought leadership fluff. Findings speak for themselves.

### 9.7 Blog Posts

**Tone**: Conversational but precise. Technical depth with narrative flow.

- Lead with the hook. "We deleted 11 files and improved our architecture."
- Use subheadings every 200-300 words.
- Include code examples where relevant.
- End with a clear takeaway, not a CTA.

---

## 10. Terminology

### 10.1 Approved Terms

| Term | Use For | Never Substitute With |
|---|---|---|
| Perionyx | Brand name | "the platform" (in first reference), "Perionyx Platform" |
| platform | The product | "solution", "tool", "app", "system" |
| workflow | Business process automation | "process orchestration", "business process management" |
| automation | Automated tasks | "intelligent automation", "smart automation" |
| module | Product domain (AP, Treasury, etc.) | "component", "plugin", "package" |
| engine | Core processing system | "engine" is fine — don't say "processing engine" |
| ledger | Financial data store | "general ledger" (unless referring to the specific GL module) |
| tenant | Customer organization | "client", "account", "workspace" |
| connector | Integration with external systems | "integration", "plugin", "adaptor" |
| approval matrix | Role/threshold approval rules | "approval workflow" (use for the process, not the rules) |

### 10.2 Prohibited Terms

Never use these on the website:

| Prohibited | Why | Use Instead |
|---|---|---|
| revolutionary | Hyperbole | (delete the sentence) |
| cutting-edge | Cliché | "current" or name the technology |
| game-changing | Hyperbole | (delete the sentence) |
| best-in-class | Unverifiable | Name the specific capability |
| industry-leading | Unverifiable | State the metric or omit |
| seamless | Overused | "automated" or "integrated" |
| next-generation | Vague | Name what's new |
| leverage (verb) | Corporate jargon | "use" |
| utilize | Corporate jargon | "use" |
| empower | Corporate jargon | "enable" or "let" |
| streamline | Overused | Describe the specific improvement |
| world-class | Unverifiable | (delete the sentence) |
| robust | Vague | Name the specific quality |
| innovative | Cliché | Describe what's different |
| disruption / disrupt | Startup cliché | (delete the sentence) |
| mission to | Startup cliché | State what you do |
| reimagining | Startup cliché | "building" or "redesigning" |
| bank-grade | Misleading | Name the actual standard |
| military-grade | Misleading | Name the actual standard |
| blazing fast | Cliché | State the actual speed |

---

## 11. Edit Checklist

Before publishing any copy, verify all 10 items:

### The 10-Point Copy Checklist

- [ ] **1. Active voice.** Every sentence uses subject → verb → object. No "is performed by" constructions.
- [ ] **2. Specific numbers.** Every metric is verifiable or labeled "representative." No vague claims ("many," "significant," "vast majority").
- [ ] **3. Hero under 25 words.** The hero sentence is one sentence, under 25 words, and makes the reader stop scrolling.
- [ ] **4. No prohibited terms.** No buzzwords from the prohibited list. No jargon without explanation.
- [ ] **5. Feature → Benefit → Outcome.** Every feature description follows the structure. No feature dumps.
- [ ] **6. Paragraph length.** Body paragraphs are 2-3 sentences max. No walls of text.
- [ ] **7. Tone matches context.** Homepage is bold. Product is clear. Security is precise. Engineering is thoughtful. AI is transparent.
- [ ] **8. "You" not "the."** Reader is addressed as "you." "Your team" not "the finance team."
- [ ] **9. No hype.** No superlatives without evidence. No promises we can't verify. No "revolutionary" or "game-changing."
- [ ] **10. One idea per sentence.** No compound-complex sentences. No semicolons joining unrelated clauses.

### Bonus Checks

- [ ] Would a CFO understand this in 10 seconds?
- [ ] Would a security professional trust this claim?
- [ ] Would an engineer respect this technical description?
- [ ] Does every page answer: "Who is this for?" and "What should I do next?"
- [ ] Are internal links descriptive (not "click here")?

---

## 12. Content Review Process

### Step 1: Self-Edit
Run through the 10-point checklist. Fix violations before requesting review.

### Step 2: Peer Review
One reviewer checks for: accuracy, tone, clarity, keyword usage, CTA alignment.

### Step 3: Technical Review
For product/platform/security pages: one engineer verifies all technical claims.

### Step 4: Final Pass
Copy editor checks: grammar, style guide compliance, prohibited terms, link validity.

### Step 5: Publish
Content meets all quality standards in `CONTENT_STRATEGY.md`. Source Brain document referenced.
