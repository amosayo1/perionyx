# Known Limitations — Technical Debt Register (2026-08-08)

Evidence-based inventory from the deep-dive audits, updated for Phase 28.1 remediation. Items marked 🔒 are documented in the Product System but deferred to a named phase; items marked ⚠️ are unplanned drift. Resolved 28.0/28.1 items are struck through and moved to the Resolution History section.

## Duplication

| Item | Occurrences | Note |
|---|---|---|
| `formatCurrency` local implementations | **650** (120 local defs) | **Zero** import canonical `src/lib/format.ts`. 62% of pages define their own inline; single-currency USD/`$` 80% of the time. 🔒 Phase 19.0/19.1 created the canonical module; adoption is a dedicated effort |
| `as any` | **803** (up from 763 at Phase 25.5) | 0 `@ts-ignore`. Foundation-critical (runtime/context, config) does not use it |
| `CurrencyService` vs `FxService` | 2 near-duplicate services | Different APIs, same fallback rates — Phase 19.0 finding, still open |
| Event buses | 5 implementations | 🔒 Phase 18.1A consolidation partially done; AP/agent/workflow buses remain |
| Workflow engines | 3 live (`workflow/engine.ts`, `orchestration/workflow-engine.ts`, `workflow-engine.service.ts`) | Two run on different Prisma tables — Phase 18.0 finding, still open |
| `SUPPORTED_CURRENCIES` sets | 3 conflicting (3 / 12 / 34) | Phase 19.0 finding, still open |

## Dead Code (zero consumers)

| Module | Files | Recommendation |
|---|---|---|
| `src/server/persistence/` | 31 files (~3.5k lines) | 🔒 Phase 7E artifact; foundation superseded it; safe to archive |
| `src/server/locks/` | 5 files | Same — dead |
| `src/server/identity/` (legacy) | 13 files | 🔒 Blocked deletion: 9 `/system/identity/` pages consume it (Phase 18.1A). ⚠️ Contains fake security (`verifyMFA` accepts "000000", `verifyPasskey` accepts any signature ≥10 chars, `Math.random()` reset tokens) — **must not be wired into any real path** |
| `src/components/enterprise/table/virtualized-table.tsx` (legacy) | 1 file | Superseded by EnterpriseTable |
| `src/server/foundation/` | ~1,500 lines | ⚠️ Zero adoption (Phase 24.0 built it; runtime/config/secrets are the actual used layer) — Phase 25.5 finding, still open |

## Placeholder / Stub Surfaces (with fabricated figures where noted)

| Surface | Status | Fabricated? |
|---|---|---|
| ~~`/invoices` (primary nav)~~ | ✅ **FIXED (28.1)** — live Prisma server component (outstanding/due/overdue by currency, status breakdown, recent-8 table, CTA to AP work queue) | Removed |
| ~~`/audit-trail` (primary nav)~~ | ✅ **FIXED (28.1)** — merged AuditLog + ProcurementAPAuditRecord feed, real counts, append-only labeling; fabricated "100% Verified" stat removed | Removed |
| `/mobile-dashboard` | All metrics `value="—"` | No (honest empties) |
| `/mobile/treasury` | 100% static `MOCK` data | **YES** |
| Treasury hub KPIs/health/scorecards | `MOCK_EXECUTIVE_KPIS` / `MOCK_TREASURY_HEALTH` / `MOCK_*_SUMMARY` in `command-center/data.ts` | **YES** — most heavily trafficked demo surface |
| 12 P-items cataloged (P1-P12) | See `source-audits/ux-audit.md` | mixed |

## Fragility & Untracked State

- **In-memory stores** (onboarding sessions, automation rules/schedules, approval matrix, agent decisions, webhook platform, mailbox, notifications, CFO advisor summary): data resets on restart; multi-instance deployments will see divergent state. 🔒 Named phases: 7D persistence, 21A/B.
- **Demo bootstrap** (`/api/demo/bootstrap`): returns demo user + company IDs in plaintext — required by the demo login flow; demo tenant holds seed data only (accepted, was Security C-01 prerequisite).
- **No automated E2E / load / chaos tests** in the normal suite (test/framework exists, `pnpm test` is the gate).
- **Remaining test-suite failures are environmental:** 47 failures in `pnpm vitest run` are dev-DB-state-dependent workflow tests + env-dependent ai-provider/secrets/connector tests. Verified: zero failures in suites importing Phase 28.1-changed modules.
- **`calendar.service.ts` batched dedupe (F-08):** dedupe lookup uses two `in` clauses (title AND startDate) rather than per-event composite matching — potential over-match false-dedupe; accepted for demo scale, flagged for review at scale.

## Accepted Risks (28.1 — documented, not blocked)

| Risk | Note |
|---|---|
| MFA not forced for un-enrolled users | Enforced for enrolled users on privileged permissions; forced enrollment = Phase 28.2 product decision (OPEN_DECISIONS D-02) |
| Inbound webhook verification not wired (H-04) | Verifiers unit-complete; no inbound source exists; wiring plan in REMEDIATION_LOG (bundle with first real integration) |
| Legacy identity module (H-05) | Zero-consumer; deletion blocked by 9 `/system/identity/` page consumers |
| `/api/demo/bootstrap` ID disclosure | Required for demo login; seed-only tenant |
| Sandbox OWNER membership fallback | `ensurePermission` honors ownership with zero role records (legacy path demo relies on) |

## Mechanical Hygiene (good)

- TODO/FIXME in `src/`: **4** — all `src/runtime/secrets/providers/vault.ts` throwing stubs (by design)
- lorem ipsum: **0** · `window.confirm`/`alert`: **0** · hardcoded secrets in src/prisma/k8s: **0**
- 339 `console.*` — concentrated in CLI/seed/test paths; a handful of runtime handlers (tick, agents) could migrate to Pino

## Top 10 Registers (with effort) — post-28.1

1. P0 Treasury hub mock → live API (most-demoed surface; OPEN_DECISIONS D-04)
2. P0 One-command demo seed (`seed-treasury.ts` parameterization; D-05)
3. P1 `formatCurrency` consolidation (650 → `src/lib/format.ts`)
4. P1 Dead-code archive (`persistence/`, `locks/`, legacy identity)
5. P1 Medium-severity security hardening: CSP `'unsafe-inline'`, rate-limit keying, chunked-body size bypass, ~44 mutation routes without Zod (SECURITY_REVIEW.md M-01/M-03/M-04/M-05)
6. P1 Forced MFA enrollment policy (D-02 remainder)
7. P1 Inbound webhook wiring (H-04 plan)
8. P2 `server-only` guards on 100+ prisma-importing module barrels
9. P2 Mobile stubs (`/mobile-dashboard`, `/mobile/treasury`)
10. P2 Workflow-engine consolidation (3 → 1)

## Resolution History (Phase 28.0 + 28.1)

| Item | Status |
|---|---|
| AP seed phantom company ID | ✅ FIXED (28.0) — parameterized; verified live 150 vendors / 3,500 invoices / 21,780 audit records on Demo Company |
| `cacheHeaders` no-store bug (all 212 cached GETs uncached) | ✅ FIXED (28.0) — `private, max-age=N` |
| Security C-01 header spoofing | ✅ FIXED (28.1) — proxy strip + derive + re-verify |
| Security C-02 unguarded tick | ✅ FIXED (28.1) — mandatory secret, timing-safe, fail-closed |
| Security C-03 API-key ADMIN | ✅ FIXED (28.1) — `roleFromApiKeyScopes` |
| Security H-01 MFA enforcement | ✅ FIXED (28.1) — permission-layer enforcement for enrolled users |
| Security H-02 webhook mutations | ✅ FIXED (28.1) — `webhooks.manage` + Zod |
| Security H-03 13 unguarded v1 routes | ✅ FIXED (28.1) — 7 gated, 6 documented |
| `ignoreBuildErrors` + 11 pre-existing type errors | ✅ FIXED (28.1) — flag removed, docs/site excluded, seed-fresh fixed; typecheck 0 errors |
| N+1 loops ×9 (read-path) | ✅ FIXED (28.1) — single-query batches (F-04…F-12) |
| Unbounded admin queries ×9 | ✅ FIXED (28.1) — take/skip bounded (F-13…F-17) |
| Approval polling hammer | ✅ FIXED (28.1) — 30s polls, 100 take, cached (F-03) |
| `/invoices` + `/audit-trail` fabricated stubs | ✅ FIXED (28.1) — real Prisma surfaces |
| `/reports` hidden "Coming soon" | ✅ FIXED (28.1) — enabled in nav |
| Deprecated `/accounting` tree nav-promoted | ✅ FIXED (28.1) — removed from nav (routes kept) |
| Guidance Start/Resume/Retake no-ops | ✅ FIXED (28.1) — wired to `useOnboarding().startTour()` |
| Report viewer Export no-op | ✅ FIXED (28.1) — real CSV export |
| Cache headers on hot reads (cfo/dashboard, ap/invoices, ledger) | ✅ FIXED (28.1) — F-20…F-22 |
