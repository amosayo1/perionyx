# 16 — Architecture Principles

**Product System · Document 16 of 20**
**Authority: Architecture Principles is the product-facing architecture specification for Perionyx — the structure of capabilities, platforms, and integrations as they must appear to product and to the engineering constitution. It derives from the Platform Constitution (Phase 23.0), the Enterprise Principles (03), and Product Principles (02), and is binding on how capabilities are built, composed, and integrated.**
**Sources: The Platform Constitution (docs/platform/PLATFORM_CONSTITUTION.md) and its 15 Architectural Laws; the Phase 23.1 validation; the runtime and foundation layers (Phase 24.0/24.0B, 26.x); the four-product research program (Coupa S10.4 platform architecture, Stripe S17 platform discipline).**

---

## 1. The Architecture Doctrine

**Capabilities are platforms; platforms are replaceable** (Law 4, Law 14). Perionyx architecture is constitutional: business domains never import provider SDKs (Law 1), vendor terminology never enters the domain model (Law 2), every platform exposes capability contracts (Law 3), and every external dependency is observable (Law 5). Product builds on capabilities; engineering enforces the laws.

The research synthesis:
- **Stripe** proves platform discipline: a dashboard is composed of stable, observable primitives (Stripe S17).
- **Coupa** proves platform architecture at enterprise scale: capabilities (procurement, AP, analytics) compose into workflows (Coupa S10.4).
- **Ramp** proves intelligence as a horizontal layer over finance (Ramp S13).
- **Linear** proves the projection model: views are projections over work, never forks (PP-030).

## 2. The 15 Architectural Laws (Canonical, from Phase 23.0)

1. Business domains never import provider SDKs.
2. Vendor terminology never enters the domain model.
3. Every platform exposes capability contracts.
4. Provider drivers are replaceable.
5. Every external dependency is observable.
6. Financial integrity is never compromised.
7. Architecture is governed through automation.
8. Every platform is measurable.
9. Every platform is testable.
10. Every platform is replaceable.
11. Tenant isolation is absolute.
12. Zero trust is the default.
13. Data classification governs handling.
14. Events are vendor-neutral.
15. The constitution evolves through process.

## 3. The 15 Platforms (Canonical, from Phase 23.0)

1. **Integration** — providers, connectors, capability contracts.
2. **Banking** — balances, movements, statements, reconciliation.
3. **ERP** — the accounting system of record (GL, ledgers).
4. **Payments** — money movement with idempotency.
5. **Identity** — authentication, sessions, SSO, MFA.
6. **Notification** — async, templated, tenant-scoped.
7. **Document** — ingestion, storage, OCR.
8. **AI** — providers, models, health, usage.
9. **Workflow** — state machines, automation, approvals.
10. **Audit** — append-only, tamper-evident trail.
11. **Observability** — metrics, logs, traces, health.
12. **Search** — indexed, scoped, ranked.
13. **Storage** — classified, encrypted, retained.
14. **Security** — encryption, secrets, rate limits.
15. **Developer** — SDKs, API contracts, docs.

## 4. Platform Maturity

Each platform lives on a 0–4 maturity model (Phase 23.0):

- **0 Absent** — no capability.
- **1 Foundational** — capability exists, not certified.
- **2 Operational** — contract, telemetry, tests.
- **3 Certified** — independent verification (Phase 26.2).
- **4 Constitutional** — prevention-enforced, cross-cutting.

Certification is earned through evidence, never confidence (Phase 26.2, Lesson 51). A platform claim without a test is a hypothesis.

## 5. Product Architecture Rules

- **Every capability is a platform with a contract** (Law 3) — product consumes contracts, never providers.
- **Views are projections over the same work** (PP-030) — dashboards, queues, and exports share one source of truth; no forks.
- **Money lives on one boundary** (Money-Boundary Doctrine, 01) — optimistic views, server-confirmed money.
- **Events are vendor-neutral** (Law 14) — domain events typed, never provider-shaped.
- **Tenant isolation is absolute** (Law 11) — enforced at the context, verified by test.
- **Every platform is measured** (Law 8) — metrics, traces, health on all.
- **Zero trust is the default** (Law 12) — every request re-verified.
- **Data is classified** (Law 13) — handling follows classification (Phase 24.0).

## 6. Architecture Anti-Patterns

- **The SDK leak** — domain code importing a provider SDK (rejected: Law 1, Phase 23.1 tick.service finding).
- **The vendor vocabulary** — Plaid/QBO terms in the domain model (rejected: Law 2).
- **The contractless platform** — a capability with no contract, no tests (rejected: Law 3).
- **The data fork** — a dashboard or export with its own copy of the truth (rejected: PP-030).
- **The silent external call** — an integration with no telemetry (rejected: Law 5).
- **The unclassified field** — data without a classification decision (rejected: Law 13).

---

*Next: `17 Engineering Principles.md` — the engineering practice specification.*
