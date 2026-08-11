---
title: "Lesson 58 — Remediation Is Verification"
created: 2026-08-08
updated: 2026-08-08
tags:
  - type/lesson
  - domain/security
  - domain/performance
  - domain/quality
  - status/active
  - phase/28.1
lesson_number: 58
---

# Lesson 58 — Remediation Is Verification

## Statement

A remediation phase is complete only when every claim has been re-verified through execution: typecheck on the final state, production build, the full test suite, and live database queries. Fixing a defect and writing "fixed" in a document are different events — and only the evidence closes the loop.

## Context

Phase 28.1 remediated every Critical and High finding from the Phase 28.0 survey: 3 Critical security findings (header-spoofing auth bypass, unguarded global tick, API-key → ADMIN escalation), 4 High security findings, 10 performance findings, and 5 UX findings. Verification then exposed several things the fixes themselves did not:

1. **A build gate is a detector, not a configuration.** `ignoreBuildErrors: true` had hidden 11 pre-existing type errors. Removing it surfaced errors in `prisma/seed-fresh.ts` (fixed) and a `docs/site` Docusaurus project (excluded from the root tsconfig — it is a separate application with its own toolchain). Result: `pnpm typecheck` = 0 errors — a gate that actually gates.
2. **The environment is part of the test result.** `pnpm test` is vitest watch mode (hangs CI); `pnpm vitest run` is the real gate. The full suite shows 47 failures — every one pre-existing and environmental (workflow tests depend on dev-DB state; ai-provider/secrets tests depend on env vars). Zero failures in suites importing changed modules. Reporting "47 failures" without that attribution would have been dishonest; attributing them without running the targeted suites would have been sloppy.
3. **Test suites catch what compilers cannot.** The authorization suite expected `ForbiddenError` to contain the permission name — a contract that existed only in the test. One-line fix; a regression the typechecker would never see.
4. **Live data validates surface claims.** `/invoices` and `/audit-trail` were rebuilt as server components; a tsx smoke run against the demo tenant confirmed 1,673 open invoices and 21,780 AP audit records render — the fabricated "100% Verified" stat is gone and the real count is verifiable.
5. **Some fixes have honest limits.** MFA is enforced for enrolled users but not forced on un-enrolled ones (product decision, documented). Inbound webhook verification stays un-wired because no inbound source exists — wiring a route with no caller would recreate the dead-code defect the finding described. Both are documented accepted risks with plans, not silent gaps.

## Evidence

- `pnpm typecheck`: 0 errors (was 11 pre-existing at 28.0) · `pnpm build`: passes (12 GB heap; 8 GB OOMs a worker)
- `pnpm vitest run`: 47 failures, all pre-existing environmental; touched-area suites 50/50
- Live-DB smoke: 1,673 open invoices / 21,780 AP audit records on Demo Company
- Readiness: 6.6/10 → 7.8/10 (Security 6.2→8.4, Performance 5.5→7.6, UX 6.0→8.0)
- 11 documents at `docs/readiness/` including REMEDIATION_LOG + VERIFICATION_REPORT

## Generalization

1. **Re-run every gate on the final state** — the last edit is the one that ships; it must be the one verified.
2. **Attribute test failures honestly** — pre-existing environmental failures are a fact, not an excuse; zero-regression in touched modules is the claim that matters.
3. **Document limits with the fix** — accepted risks with plans (MFA forced enrollment, inbound webhook wiring) keep the loop honest without pretending completion.
4. **A remediation log is a contract with the future** — every entry names the finding, the change, and the evidence; a future audit can re-run it.

## Application

- Every future phase: end with typecheck + build + full suite + live smoke on the final commit, recorded in a verification report.
- Every accepted risk: exists in OPEN_DECISIONS.md / KNOWN_LIMITATIONS.md with a named owner and trigger (e.g., "wire H-04 with the first real inbound integration").
- Every "fixed" claim: traceable to the remediation log entry and its verification command.

## Related

- Principle #35 (Re-verify every claim after remediation) — Phase 28.1
- Principle #34 (Documentation claims must be verified against running code before they are trusted) — Phase 28.0
- Lesson 57 (Demo Readiness Is Earned Through Live-DB Verification) — Phase 28.0
- Lesson 52 (Prevention Outlasts Remediation) — Phase 26.3
- AGENTS.md Phase 28.1 entry; evolution timeline entry
