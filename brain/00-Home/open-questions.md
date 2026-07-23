---
title: "Open Questions"
created: 2026-07-20
updated: 2026-07-20
tags:
  - type/tracking
  - status/active
aliases:
  - Open Questions
  - Unresolved Decisions
  - Deferred Decisions
---

# Open Questions

A living register of every unresolved question across the Perionyx project. Questions are organized by domain, each with context, options, priority, and status. Questions without owners get stale fast — if you own an open question, update it or close it.

> [!warning] House Rules
> 1. Every open question must have a **Priority** (High/Medium/Low)
> 2. Every open question must have a **Owner** or at minimum a **Target Phase**
> 3. Questions older than 30 days without an update get flagged in the weekly audit
> 4. Closing a question requires documenting the decision and linking to the ADR

---

## Architecture Questions

| Question | Context | Options | Priority | Status |
|----------|---------|---------|----------|--------|
| Should we extract an ISessionValidationStore interface? | [[Phase 17]] P0-5 uses concrete class; Redis swap needs interface | Extract interface vs leave as-is | Medium | Open |
| Should we unify the two approval systems? | Ledger [[Approval Workflow Engine]] vs [[Workflow Engine]] `respondToApproval` — two distinct approval paths exist for different contexts | Unify vs keep separate | High | Open |
| When should we move from in-memory stores to [[Prisma]]? | [[Business Rules Builder]], [[Automation Scheduler]], [[Approval Matrix Evaluator]] are ephemeral per-process | Prisma vs Redis vs keep in-memory | High | Open |
| Should we add [[Postgres]] read replicas? | GET endpoints hit primary; high read volume expected at scale | Read replicas vs cache-only | Medium | Open |
| How should we handle versioning of workflow definitions? | Workflow definitions evolve but running instances reference a snapshot | Copy-on-write vs reference + migration vs version field | Medium | Open |
| Should [[Agent Framework]] agents share a process or run isolated? | Each agent currently runs in-process; safety implications at scale | Shared process vs worker threads vs child processes | High | Open |
| Should we adopt tRPC for internal service calls? | Server components call services directly; no typed boundary | tRPC vs keep direct calls | Low | Open |
| How should we handle multi-region data residency? | Financial data may have jurisdictional storage requirements | Region pinning vs data partitioning vs encryption-at-rest | High | Open |

---

## Security Questions

| Question | Context | Options | Priority | Status |
|----------|---------|---------|----------|--------|
| When to implement MFA? | No MFA exists; P0-6 in [[Phase 16]] backlog | TOTP vs WebAuthn vs both | High | Open |
| Should we implement row-level security in [[Postgres]]? | Currently service-level filtering via `requireTenantContext()`; DB-level would be stronger | RLS vs keep service-level | Medium | Open |
| How to handle CSRF on webhook endpoints? | Webhooks are server-to-server; CSRF doesn't apply but currently enforced uniformly | Downgrade to Info vs add Origin check | Low | Open |
| Should API keys have per-key rate limits? | Currently global 120/60s for all API keys in [[Proxy]] | Per-key vs global | Medium | Open |
| How should we rotate encryption keys without downtime? | [[AES-256-GCM]] encryption with key rotation; rotation currently requires restart | Dual-key window vs seamless rotation vs HSM | High | Open |
| Should we adopt a secrets manager beyond env vars? | K8s secrets are plaintext placeholders; env vars are local-only | AWS Secrets Manager vs Vault vs SOPS | Medium | Open |
| Do we need a WAF in front of the app? | Rate limiting exists at proxy level; no layer-7 filtering | Cloudflare/AWS WAF vs rely on proxy | Medium | Open |
| How should we handle session fixation on SSO login? | SSO sessions created by external IdP; session token regeneration unclear | Regenerate on SSO callback vs maintain IdP session | Medium | Open |

---

## Product Questions

| Question | Context | Options | Priority | Status |
|----------|---------|---------|----------|--------|
| What is the minimum viable pilot? | No pilot criteria defined yet in [[15-Pilot-Readiness]] | Feature set, user count, data requirements | High | Open |
| Should we build a mobile app or stay PWA? | [[Executive Mobile Experience]] exists as PWA | PWA vs React Native vs Flutter | Medium | Open |
| How do we handle multi-currency reconciliation? | Current reconciliation is single-currency in [[Treasury Module]] | Multi-currency vs single-currency focus | High | Open |
| What vertical do we pilot first? | No customer segment prioritized | Mid-market CFO, startup finance, enterprise treasury, nonprofit | High | Open |
| How do we handle regulatory differences across jurisdictions? | Compliance module not yet built; regulations vary dramatically | Jurisdiction profiles vs single-jurisdiction vs configurable rules | High | Open |
| Should the onboarding wizard have a "skip all" option? | [[Onboarding Wizard]] currently requires stepping through | Skip-all vs guided-only vs optional steps | Low | Open |
| How do we price the product? | No pricing model defined | Per-seat vs usage-based vs flat tier vs hybrid | High | Open |
| Should we offer a free tier? | No freemium strategy defined | Free tier vs trial-only vs demo-only | Medium | Open |

---

## Finance Questions

| Question | Context | Options | Priority | Status |
|----------|---------|---------|----------|--------|
| What ERP integrations are highest priority? | No ERP connectors built yet in [[Connector Platform]] | SAP vs QuickBooks vs Xero vs NetSuite | High | Open |
| Should we support IFRS and US GAAP simultaneously? | Accounting standards vary by region | Multi-standard vs single-standard | Medium | Open |
| How do we handle inter-company eliminations? | Multi-entity support planned but not built | Automated vs manual elimination | Medium | Open |
| What is the minimum viable treasury module? | Treasury has cash positioning, FX, forecasting but not fully integrated | Cash-only vs cash + payments vs full treasury | High | Open |
| How do we handle bank connectivity in the pilot? | Real bank APIs require partnerships; sandbox data is sufficient for demo | Mock data only vs sandbox API vs Plaid/Yodlee | High | Open |
| Should we support real-time FX rates? | Current FX is static; real-time requires API subscription | Real-time API vs daily rates vs manual entry | Medium | Open |
| How do we handle chart of accounts mapping? | ERP integration requires mapping CoA to internal structure | Auto-mapping vs manual mapping vs hybrid | Medium | Open |
| Should we build budgeting or forecasting first? | Both are planned for [[Phase 9]] | Budgeting first (CFO need) vs forecasting first (AI differentiator) | Medium | Open |

---

## AI Questions

| Question | Context | Options | Priority | Status |
|----------|---------|---------|----------|--------|
| Which AI provider should be the default? | [[AI Provider Registry]] supports multiple; no default configured | OpenAI vs Anthropic vs local models | High | Open |
| Should agents have persistent memory across sessions? | [[Agent Memory]] is currently per-session | Persistent vs session-scoped | Medium | Open |
| How do we validate AI outputs for financial accuracy? | AI recommendations affect real money in [[Decision Engine]] | Human review vs automated checks vs hybrid | High | Open |
| How do we handle AI provider cost spikes? | Multiple providers with different pricing; no budget caps | Hard cap vs soft alert vs provider fallback | High | Open |
| Should we support local/on-premise models? | Some enterprises cannot send data to cloud AI providers | Cloud-only vs local model support vs hybrid | Medium | Open |
| How do we prevent prompt injection in agent workflows? | Agents process user inputs that could contain malicious prompts | Input sanitization vs sandboxing vs output validation | High | Open |
| Should we fine-tune models on customer data? | Could improve accuracy for specific financial domains | Fine-tune vs RAG vs prompt engineering only | Low | Open |

---

## Infrastructure Questions

| Question | Context | Options | Priority | Status |
|----------|---------|---------|----------|--------|
| Redis or no Redis? | Currently in-memory; [[Redis]] planned in [[ADR-015]] | Redis vs keep in-memory | High | Open |
| Should we use External Secrets Operator? | K8s secrets are plaintext placeholders | ESO vs SOPS vs manual | Medium | Open |
| Blue-green or rolling deployment? | No deployment strategy defined in [[Docker]] / [[Kubernetes]] | Blue-green vs rolling vs canary | Medium | Open |
| Do we need a service mesh? | Single monolith; no inter-service communication yet | Istio/Linkerd vs skip until microservices | Low | Open |
| How do we handle database migrations at scale? | Prisma Migrate works for small schemas; 338 models may be slow | Prisma vs golang-migrate vs custom | Medium | Open |
| Should we use connection pooling at the app level? | Prisma manages connections; PgBouncer could help | PgBouncer vs Prisma pool vs both | Medium | Open |
| What is our log retention policy? | Structured JSON logging exists; no retention defined | 30 days vs 90 days vs tiered (hot/cold) | Medium | Open |
| Do we need CDN for static assets? | Next.js serves assets; no CDN configured | Cloudflare vs CloudFront vs skip for now | Low | Open |

---

## Decision Log

When a question is resolved, log it here before closing:

| Resolved | Question | Decision | ADR | Date |
|----------|----------|----------|-----|------|
| — | — | — | — | — |

---

## Related

- [[11-ADR/index|Architecture Decision Records]] — Decisions that resolved past open questions
- [[12-Roadmaps/index|Roadmaps]] — Phases that address high-priority questions
- [[04-Security/index|Security]] — Security-specific open questions
- [[08-AI-Workforce/index|AI Workforce]] — AI domain questions
- [[03-Architecture/index|Architecture]] — Architecture domain questions
- [[Brain Constitution]] — Governing principles for this vault

---

*Last updated: 2026-07-20*
