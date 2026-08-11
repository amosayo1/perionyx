# 03 — Enterprise Principles

**Product System · Document 03 of 20**
**Authority: Enterprise Principles scope the platform's behavior at company scale. They derive from the Vision (00), Philosophy (01), and Product Principles (02) and are binding on multi-tenant, multi-entity, multi-user, and multi-jurisdiction behavior.**
**Sources: The four-product research program; the Platform Constitution (`docs/platform/`); the Engineering Constitution (`AGENTS.md`); the Identity, Security, and Multi-Tenancy architecture documents; the EPS.**

---

## 1. What an Enterprise Principle Is

The previous documents define what Perionyx *is* (Vision), how it *thinks* (Philosophy), and what it *does* (Principles). This document defines how Perionyx behaves when the organization is a company: many users, many roles, many entities, many jurisdictions, many customers (tenants), and one audit trail that must survive all of it.

An enterprise principle answers questions like:

- When two users edit the same vendor, who wins, and who is told?
- When a finance user is in a hurry, why does the platform still require two signatures?
- When a multinational runs ten entities in five currencies, what does "the cash position" mean?
- When the platform learns, whose data does it learn from?
- When an auditor asks "who changed this threshold, and why?", how complete is the answer?

Enterprise principles are the discipline that makes "company scale" safe. Without them, a platform that is delightful for one team becomes dangerous for ten.

## 2. The Enterprise Operating Model

Perionyx's enterprise model has six layers. Every enterprise principle maps to one of these layers:

1. **Tenant (customer company).** The isolated unit of data and intelligence. Absolute sovereignty (PP-011, PP-189, PP-198).
2. **Entity (legal entity / fund / cost center).** The scoped container for money, approvals, and views (PP-038).
3. **User.** An identity with roles, permissions, and preferences (PP-196).
4. **Role.** A job-shaped bundle of permissions (AP Manager, Treasurer, Controller, CFO, Auditor).
5. **Permission.** A granular, auditable capability to read or mutate (PP-197).
6. **Policy.** A versioned, tenant-editable rule object that governs behavior (PP-186).

The six layers compose: a user belongs to a tenant, acts within entities, holds roles that grant permissions, and behaves according to policies. Every decision in the product system should be expressible in terms of these six layers.

## 3. Tenant Sovereignty

**The tenant is the atom of the platform.** Everything a tenant sees, every insight Perionyx gives them, every benchmark, and every recommendation is computed from that tenant's own data. This is not a privacy feature; it is the constitutional core (Platform Constitution Law 11).

Principles already established in Document 02 and reinforced here:

- **PP-011 — Tenant sovereignty is absolute.** No cross-tenant learning, no community intelligence.
- **PP-189 — No cross-tenant learning, ever.** The isolation is enforced at the query and training layers.
- **PP-198 — Tenant isolation is enforced at the query layer.** RuntimeContext scopes every query.
- **PP-263 — Search is tenant-scoped.** The search index is a tenant partition, not a shared corpus.

The enterprise consequences:

- A tenant's data is never a training input for any model that serves another tenant.
- Benchmarks are self-referential or opt-in-cohort, never anonymous-peer (PP-274).
- "Community intelligence" is a rejected business model, explicitly (Coupa's moat rejected).
- An auditor or CISO can *verify* isolation: the platform documents its isolation architecture and the query-path guarantees.
- The isolation is structural, not aspirational: it is enforced in the data-access layer, not by policy document.

**Why this is a competitive advantage, not a sacrifice:** Coupa's community intelligence creates a data moat that increasingly repels procurement scrutiny. Perionyx's provable isolation is the modern buyer's answer to "what happens to our data?" The intelligence is less pooled but more trustworthy — and trust is the harder moat to copy (Document 18).

## 4. Multi-Entity Scoping

**Money and decisions are entity-scoped.** Every money object knows its entity; every consolidated view labels its entity composition; every approval route respects entity thresholds (PP-038, PP-204, PP-079).

Enterprise consequences:

- A Treasurer looking at "cash position" sees either one entity or a consolidated view explicitly labeled as consolidated.
- Approval thresholds are per-entity; a $250K limit in one legal entity is not a $250K limit in another (AP Permission Matrix).
- Inter-entity transfers are explicit transactions with their own approvals — never silent reallocations.
- A user's view defaults to the entities they are authorized for; entity expansion is a permissioned, labeled action.
- Consolidation and elimination entries are first-class objects with their own audit trails.

The failure mode this prevents: a global dashboard that shows a blended number nobody can decompose. The Ramp extraction (P-110 "multi-entity scoping before global UI") and the Coupa multi-entity governance model both push this way; Perionyx makes it a principle.

## 5. Identity, Roles, and Permissions

**Access is role-based plus attribute-based, with granular permissions.** The Identity Platform (Phase 11C), the IAM permission model (Phase 18.1B), and the PermissionRegistry govern all access.

Enterprise principles:

- **Roles are job-shaped, not title-shaped.** A "Treasurer" role grants treasury operations; a "CFO" role grants treasury *visibility* plus approval authority above thresholds — not the same permissions. Roles are composed of granular permissions (PP-196).
- **Permissions are granular and auditable.** Every new action that mutates or exposes data registers a GranularPermission (PP-197). No permission is implicit.
- **Separation of duties is enforced at the API layer** (PP-164). Initiator ≠ approver ≠ releaser is a *check*, not a convention.
- **Least privilege is the default.** Users start with the minimum; permissions are granted, never assumed. Visibility is granted like mutation — reading a threshold is a permission, not a side effect of being logged in.
- **Delegation is explicit, temporary, and audited.** A treasurer delegates approval authority for a vacation window; the delegation has an expiry and a full audit trail (Coupa's four-type delegation, refined).
- **Termination is immediate and complete.** Offboarding revokes all sessions, tokens, and API keys; the platform's IAM makes revocation synchronous with the revocation cache (Phase 17.1).

The audit consequence: every permission grant, delegation, revocation, and use is recorded. "Who can do what, when, and who said so" is a query, not an investigation.

## 6. Governance in the Interface

**Where practical, governance is exercised in the interface where the work happens — not only in a settings module** (Linear S13.3, PP-205).

Enterprise consequences:

- A Controller reviewing an exception can adjust the policy that caused it, in context, with the change recorded as a versioned policy edit (PP-186).
- Approval limits, delegation, and escalation are adjustable from the queue where they bite — with the change documented, approved where required, and reversible.
- The audit trail is a first-class, filterable, exportable page (PP-200), not a buried log.

The balance: interface-embedded governance improves *adoption*; burying it in settings improves *safety* by friction. Perionyx's position is that the friction should come from *appropriate approval* (elevated permissions, SoD, PP-199) rather than from *discoverability*. Users should find the control; the control should then require the right authority.

## 7. Multi-Jurisdiction and Global Readiness

**Statutory variance is legitimate variance.** Tax forms, statutory reporting, RTL, currency, and jurisdiction-specific controls are capability contracts, not hardcoded features (PP-210, PP-287).

Enterprise principles:

- **Statutory capabilities are configurable via the CapabilityRegistry** — a tax form for one jurisdiction is a capability, not a code fork.
- **Currency is a platform primitive** (PP-286): one currency service, Decimal-based, locale-correct, rate-sourced.
- **RTL readiness ships with any new workflow surface** (PP-209).
- **Local rails plug in as provider drivers** (PP-287) with consistent control semantics.
- **Global rollout is a configuration exercise, not a re-platforming exercise.** Adding an entity in a new jurisdiction adds capabilities, permissions, and drivers — the spine does not change.

The enterprise failure this prevents: a platform that works in California and breaks in Riyadh. Perionyx treats "the world" as the default surface from day one (Ramp's global readiness, Coupa's global footprint, applied constitutionally).

## 8. The Enterprise Audit Trail

**The audit trail is the enterprise's memory, and it is append-only.** Every enterprise principle above assumes a trustworthy memory.

Enterprise principles:

- **Append-only and tamper-evident** (PP-201): financial decisions and money records are append-only with integrity checks.
- **Complete:** the audit records not just what changed but who, when, from what permission, in which entity, against which policy, and why (the audit narrative).
- **Filterable and exportable:** the audit log is a designed surface (PP-200) and exports screen-reader-usable artifacts (PP-279).
- **Versioned:** policy, workflow, and configuration changes are versioned, diffable, and reversible (PP-119, PP-285).
- **Dual-role in the interface:** audit is both a security instrument (who did what) and a product instrument (how is the organization operating — violation rates, bottleneck trends, PP-053).

The Auditor persona's requirement — "chronological integrity, tamper-evident design, screen-reader-friendly exports" (AGENTS.md) — is the enterprise audit principle made concrete. Every other enterprise behavior depends on it.

## 9. Multi-User Concurrency

**Concurrent work is safe, visible, and resolved — never silent.**

Enterprise principles:

- **Optimistic concurrency on money aggregates** (PP-170): version fields reject stale writes.
- **Idempotency for all mutations** (PP-169): retries are safe.
- **Co-edit is visible:** when two users work on the same object, the platform shows presence and conflict where it matters — not on every field, but on money and reference data.
- **Draft isolation:** a user's draft of a shared object is private until submitted; submission is conflict-checked.
- **Resolution is explicit:** a conflict surfaces both versions and requires a choice; it is never auto-merged for money.

The failure this prevents: the "last writer wins" silence that has corrupted ledgers since spreadsheets. Ramp's optimistic-concurrency-safe payments (P-058) and Coupa's transactional integrity both point here; Perionyx makes concurrency honesty a principle.

## 10. Enterprise Integration

**The ERP is both a sync target and an intake channel** (Ramp P-062). Perionyx orchestrates, renders, and decides; it does not duplicate the general ledger (Vision §8).

Enterprise principles:

- **Provider drivers are replaceable, observable, and contract-tested** (PP-288): Plaid, QuickBooks, SAP, NetSuite, Dynamics all plug in behind capability contracts.
- **Integrations are observable:** connector health, sync metrics, and queue status are standing surfaces (OperationsService).
- **Integration failures fail visibly and recover deterministically:** a failed sync renders a status, retries with backoff, and never silently drops data.
- **The canonical financial model translates vendor terminology** (Platform Constitution): the domain never imports provider SDKs; provider terms never enter the domain model.

The enterprise consequence: Perionyx is the trustworthy middle layer between the ERP of record and the finance team — it never competes with the ERP, and it never silently diverges from it. This is the positioning that lets Perionyx sell *into* enterprises that already run SAP (Vision §7).

## 11. Scale and Performance at Enterprise Load

**Enterprise scale is a design input, not a surprise.**

Enterprise principles:

- **Server-side filtering, pagination, and virtualization at scale** (PP-066, PP-249): client slicing lies at scale.
- **Rendering discipline** (PP-250): minimal re-render, virtualized rows, memoized pipelines.
- **Tiered caching with stale-while-revalidate** (PP-246): fresh-but-fast reads.
- **Measured performance budgets** (PP-251): LCP/CLS/INP enforced in CI.
- **Deterministic financial actions** (PP-253): money behavior is identical at any load.

The failure this prevents: a dashboard that is beautiful for a demo with 400 rows and unusable for a real tenant with 400,000 invoices. Enterprise scale is the point of the platform, so scale is a first-class design constraint (Linear's rendering discipline and Stripe's caching model, both adopted).

## 12. Enterprise Security

**Security is an enterprise principle, not a feature.** The Security Review checklist (AGENTS.md) and the Security Platform apply to every enterprise behavior:

- **No exposure of sensitive financial data** without encryption, audit, and permission checks (Review #1).
- **Every new mutation/exposure registers a permission** (Review #2, PP-197).
- **Tenant isolation blocks all cross-tenant access** (Review #3, PP-198).
- **Audit logging on every security/finance/approval/config action** (Review #4, PP-173).
- **Encryption where PII/financial/credentials live** (Review #5).
- **Reversibility documented or confirmation elevated** (Review #6, PP-166).
- **No privilege escalation:** permission checks at the endpoint, not skipped (Review #7).
- **No committed secrets** (Review #8).
- **Rate limiting on auth, mutation, financial, and public endpoints** (Review #9, PP-172).
- **Compliance with the security architecture** (Review #10).

The enterprise audit, SSO, MFA, and IAM capabilities (Phases 11C, 17.2) are the security principles made operational. A Perionyx deployment is a *trusted* deployment, and trust is enforced, not requested.

## 13. Enterprise Onboarding and Adoption

**Onboarding ends in value, not blank screens** (PP-266).

Enterprise principles:

- **Day-zero automation:** setup concludes with working policy, seeded rules, and visible active automation (PP-275).
- **Policy ingestion is a wizard step** (PP-267): upload → rules → decisions.
- **Role-aware first-run** (PP-271): onboarding shapes to the user's role.
- **Templates teach by example** (PP-269): common financial routes ship as templates before custom builders.
- **Education at the moment of friction** (PP-268): help lives where the user is stuck.
- **Adoption is measured:** activation, time-to-first-decision, and workflow adoption are product metrics, not vanity dashboards.

The enterprise consequence: a new tenant goes from signup to *decision-making automation* in the setup session, and a new user goes from login to *their first decision surface* without a manual. This is the Ramp extraction (P-117) and the Coupa lesson (config depth must not become an adoption cliff).

## 14. Enterprise Pricing and Packaging

**Controls and auditability are never paywalled** (PP-208).

Enterprise principles:

- Security, SoD, audit, and export parity exist on every tier. Gating safety is a constitutional failure.
- Pricing tiers differ on *scale and breadth* (entities, users, workflows), never on *safety and trust*.
- Every tier is auditable; every tier honors tenant sovereignty.
- Self-serve → enterprise is a continuum, not a bait-and-switch: what a trial tenant configures works at scale.

The enterprise consequence: the platform can be evaluated honestly at small scale and trusted identically at large scale — the "demo vs. production" boundary is about data volume, never about integrity.

## 15. Enterprise Evolution and Lifecycle

**The enterprise platform evolves deliberately, with evidence, and without breaking trust** (PP-294, PP-296, PP-299).

Enterprise principles:

- **Evolution is documented:** changes cite rationale and preserve compatibility or migrate explicitly.
- **Design debt is intentional and scheduled** (PP-296): the reset is planned, never emergent.
- **Evidence sets direction** (PP-207): roadmap priority comes from customer evidence, not opinions.
- **Competitors inform, never dictate** (PP-299).
- **The Product System is the reference** (PP-295): all product work cites doctrine before implementation.

The enterprise consequence: a decade in, the platform's evolution is as coherent as its day-one design — because the doctrine outlives any feature campaign (the Brain's evolution timeline is the living record).

---

*Next: `04 Finance Principles.md` — the financial-integrity and money-handling principles that govern every monetary surface.*
