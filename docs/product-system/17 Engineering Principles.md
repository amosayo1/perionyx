# 17 — Engineering Principles

**Product System · Document 17 of 20**
**Authority: Engineering Principles is the engineering-practice specification for Perionyx — how features are built, verified, and shipped. It derives from the AGENTS.md build gates, the Platform Constitution, Product Principles (02), and the accumulated phase lessons, and is binding on all engineering work.**
**Sources: AGENTS.md build gates (`pnpm typecheck`, `pnpm build`, `pnpm test`); the Security Review checklist; the constitutional security and data laws; the engineering lessons of the Brain; the four-product research program.**

---

## 1. The Engineering Doctrine

**Nothing ships unverified** (PP-130, AGENTS.md). Every change passes typecheck, build, and test before commit; every new action passes the ten-question Security Review (AGENTS.md). Verification is a gate, not a suggestion — and the gate is automated (Law 7).

The research synthesis:
- **Stripe** proves deterministic shipping: type systems, contracts, and small safe steps (Stripe S17).
- **Linear** proves velocity with quality: keyboards, tests, and fast iteration (Linear S14).
- **Ramp** proves shipping trust: the AI contract is enforced in code, not copy (Ramp S13).
- **Coupa** proves enterprise engineering: migrations, indexes, and auditability as engineering concerns (Coupa S10.4).

## 2. The Build Gates (Mandatory, from AGENTS.md)

1. `pnpm typecheck` — TypeScript strict; must pass before commit.
2. `pnpm build` — production build; must pass before commit.
3. `pnpm test` — the suite; must pass before merge.

A change that fails a gate is not ready. A change that passes all gates is not automatically good — gates are the floor (PP-130).

## 3. The Security Review (Mandatory Pre-Commit Checklist, from AGENTS.md)

Every feature, edit, or optimization answers all ten questions:

1. Does this expose sensitive financial data? — No, or encrypted + audited + permissioned.
2. Does this require a new permission? — No or explicit grant in PermissionRegistry.
3. Can another tenant access this? — No; `requireTenantContext()` or equivalent.
4. Does this need audit logging? — Yes for security/finance/approvals/config.
5. Is encryption required? — Yes for PII, financial, credentials, tokens.
6. Is the operation reversible? — Documented; destructive ops confirmed or elevated.
7. Could this be abused through privilege escalation? — No; checks at the endpoint.
8. Does it introduce new secrets? — No; env vars + secret manager.
9. Is rate limiting required? — Yes for auth, mutation, financial, public.
10. Does it comply with our security architecture? — Yes; IAM, tenant isolation, audit.

## 4. Engineering Standards

- **Types before code** — the type contract is written first (Phase 21A.2).
- **Commands encode business rules** — application services, not controllers (Phase 21A.2).
- **Tests prove claims** — a claim without a test is a hypothesis (Phase 23.1, Lesson 42).
- **Integration tests catch interaction bugs** — unit tests don't (Phase 21A.4, Lesson 37).
- **Deterministic seeds reveal gaps** — seed data validates the schema (Phase 21B.2, Lesson 39).
- **Prevention outlasts remediation** — a recurring defect class is fixed at the tooling level (Phase 26.3, Lesson 52).
- **Deep imports over barrels** where the barrel breaks the client (H-01).
- **No hardcoded values** — EDL tokens, shared constants, no duplicated primitives (Phase 22.0B.5).
- **Zero secrets in code** — env + secret manager, never committed (Phase 17.2).

## 5. The Financial Engineering Bar

Financial code is held to the highest bar (F-01, F-05, F-06):

- **Decimal(38,12)** money; never Float (Phase 19.1, Phase 21A.1).
- **Banker's rounding**; residuals handled explicitly (Phase 19.1).
- **Idempotent writes** — request keys, no double-execution (F-05).
- **Unit-of-work transactions** (F-06, Phase 21A.2).
- **Optimistic concurrency** — versioned aggregate roots (F-09, Phase 21A.1).
- **Append-only audit** — tamper-evident trails (F-08).
- **Fail-closed money** — doubt means no (F-10).

## 6. Engineering Anti-Patterns

- **The green-but-wrong** — passing gates with bad design (rejected: PP-130).
- **The untyped payload** — `any` at the boundary (rejected: Phase 23.1 `as any` debt).
- **The duplicated primitive** — three currency services (rejected: Phase 18.0/19.0 consolidation).
- **The skipped gate** — a merge without typecheck/build/test (rejected: AGENTS.md).
- **The untested claim** — "works" without a test (rejected: Lesson 42).
- **The Float money** — monetary values in floating point (rejected: Phase 19.1).

---

*Next: `18 Competitive Advantages.md` — the durable differentiation specification.*
