---
title: "Lesson 57 — Demo Readiness Is Earned Through Live-DB Verification"
created: 2026-08-07
updated: 2026-08-07
tags:
  - type/lesson
  - domain/demo
  - domain/data
  - domain/security
  - status/active
  - phase/28.0
lesson_number: 57
---

# Lesson 57 — Demo Readiness Is Earned Through Live-DB Verification

## Statement

Demo readiness is a property of running code against a real database, not of code that compiles. Every claim that a surface "works" or that data "exists" must be verified live before it is trusted — the most dangerous gaps are silent: seeds that target phantom IDs, caches that never cache, and fixes that are written but never wired.

## Context

Phase 28.0 ran five parallel deep-dive audits (UX, security, performance, demo, tech debt) against the Perionyx codebase to answer "can we demo to a CFO, and are we production-ready?" The audits read 400+ route files, verified 12 security-remediation claims, and — critically — checked the running database.

Three findings could not have been discovered without live verification:

1. **The phantom company ID (demo blocker).** All 8 AP seed generators hardcoded `companyId: "cmqvfocev0001koor7ragb8bq"` — an ID with zero rows. The seed "succeeded" silently and produced zero demo data. Only a `SELECT count(*)` against the live DB revealed it. After parameterization (`SEED_COMPANY_ID` / `--company-id`): 150 vendors, 3,500 invoices, 21,780 audit records landed on the real tenant; phantom count = 0.
2. **The cache that never cached (performance F-01).** `cacheHeaders()` emitted `Cache-Control: private, no-store, s-maxage=N` — per RFC 9111 `no-store` overrides everything, so 0 of 212 "cached" GETs were ever cached, while `s-maxage` invited CDN cross-tenant leakage. A static read looked correct; the behavior was dead.
3. **The verifiers that were never wired (security H-04).** `docs/security` claimed webhook HMAC and Plaid JWS verification were fixed — the utilities exist and are correct, but no inbound route calls them. Documentation claim verified against source: PARTIAL, not FIXED.

## Evidence

- 8 deliverables + 5 raw audit reports at `docs/readiness/`
- 7 fixes applied in one survey session; typecheck zero new errors
- 21,780 AP audit records verified live on Demo Company; 0 on the phantom ID
- 12 security claims re-verified: 9 fixed, 2 partial, 1 still present
- Overall readiness 6.6/10 — demo-ready with caveats, not production-ready

## Generalization

1. **Seeds must be self-verifying** — assert row counts for the intended tenant at the end of every seed run.
2. **Cache/timing behavior must be tested, not read** — a directive can be dead while looking correct.
3. **"Implemented" ≠ "wired"** — a verifier no route calls is a doc claim, not a defense.
4. **Audit claims against running code** — the security docs' confidence (all "fixed") exceeded the code's reality (12/12 → 9/12).

## Application

- Every demo: run the readiness checklist in `docs/readiness/README.md` — including `SELECT` counts.
- Every seed change: verify against the intended tenant and assert the phantom ID is not targeted.
- Every security claim: update the verified-fixed checklist in `docs/readiness/SECURITY_REVIEW.md` with evidence.

## Related

- Principle #34 (Documentation claims must be verified against running code before they are trusted)
- Principle #23 (Every major platform expansion must be preceded by an evidence-based architecture readiness review) — Phase 25.5
- Lesson 52 (Prevention Outlasts Remediation) — Phase 26.3
- AGENTS.md Phase 28.0 entry; evolution timeline entry
