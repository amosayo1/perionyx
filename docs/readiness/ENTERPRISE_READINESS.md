# Enterprise Readiness — Master Scorecard

**Date:** 2026-08-08 (Phase 28.1 remediation applied) · **Method:** evidence-based; every score backed by file:line citations in `source-audits/`. Deep audits: UX & consistency, security, performance, demo readiness, tech debt & platform validation. Product-system comparison: `docs/product-system/` (20 documents). Remediation evidence: [PHASE_28_1_REMEDIATION_LOG.md](./PHASE_28_1_REMEDIATION_LOG.md) + [PHASE_28_1_VERIFICATION_REPORT.md](./PHASE_28_1_VERIFICATION_REPORT.md).

## Scorecard

| Dimension | Phase 28.0 | Phase 28.1 | Evidence basis | Verdict |
|---|---|---|---|---|
| **Demo Readiness** | 7.5/10 | **8.5/10** | AP seed fixed (150 vendors / 3,500 invoices / 21,780 audit records live); 2 of 4 stub screens now real data | Ready on Sandbox with checklist |
| **UX & Consistency** | 6.0/10 | **8.0/10** | Both fabricated-figure stubs replaced with live data; Reports un-hidden; deprecated `/accounting` tree un-promoted; guidance + export wired | Weak hubs gone from primary nav |
| **Security** | 6.2/10 | **8.4/10** | 3 Critical + 4 High fixed; MFA enforced server-side; proxy is sole identity authority; 2 Highs documented accepted | No release blockers |
| **Performance** | 5.5/10 | **7.6/10** | All 9 N+1 loops → single-query batches; 9 unbounded queries bounded; polling hammer resolved; cache headers live; `ignoreBuildErrors` removed | Batch jobs safe at demo scale |
| **Product Consistency** | ~7.0/10 | ~7.0/10 | Unchanged (spec still exceeds implementation in DI / navigation coverage) | Spec exceeds implementation |
| **Platform Validation** | 7.5/10 | **8.5/10** | Typecheck **0 errors** (was 11 pre-existing); build passes; canonical execution path holds; touched-area tests 50/50 | Canonical path + gates restored |
| **Technical Debt** | 4.5/10 | 4.5/10 | Unchanged: 650 `formatCurrency`, 803 `as any`, zero-consumer `persistence/` + `locks/`, 3 workflow engines | Accumulating; no new functionality risk |
| **Mechanical Hygiene** | 8.5/10 | 8.5/10 | Unchanged | Strong baseline |
| **Overall** | **6.6/10** | **7.8/10** | Weighted toward demo + security + performance | **Demo-ready; no production release blockers from survey** |

## Per-Dimension Detail

### 1. Demo Readiness — 8.5/10
- **Fixed (28.0):** AP seed phantom company ID → 150 vendors / 3,500 invoices / 21,780 audit records now live on Demo Company.
- **Fixed (28.1):** `/invoices` and `/audit-trail` rebuilt on live Prisma data — no fabricated figures anywhere in primary navigation.
- **Remaining:** Demo Company has 0 treasury accounts / 0 ledger entries (run `prisma/seed-treasury.ts`); executive health defaults to 50 on sparse data; `/mobile-dashboard`, `/mobile/treasury` remain stubs.
- **Strength:** Zero fabricated server-side metrics (dashboard v2 `pctDelta: null` when previous = 0; CFO advisor sums real `treasuryCashPosition` rows; sandbox scenarios execute real business logic).

### 2. UX & Consistency — 8.0/10
- **Fixed (28.0):** treasury hub 404 + 6 dead buttons; role-filter bypass; no-op Cmd+N/S; "Vaulta" tab titles; legacy gold.
- **Fixed (28.1):** `/invoices` + `/audit-trail` real data (fabricated "100% Verified" stat removed); `/reports` un-disabled (was hidden as "Coming soon"); deprecated `/accounting` tree removed from nav; Guidance Start/Resume/Retake wired to the tour; report Export now produces real CSV.
- **Remaining:** 369/465 routes unreferenced by nav; deep-surface consistency debt (WF-012 raw tables).

### 3. Security — 8.4/10 (no release blockers)
- **C-01 (Critical):** forged `x-user-id`/`x-company-id`/`x-company-role` bypass — **FIXED**: proxy strips and re-derives identity from verified JWT/API key; `withRuntimeContext` re-verifies claims.
- **C-02 (Critical):** unguarded `/api/v1/tick` — **FIXED**: mandatory `CRON_SECRET`, timing-safe compare, fail-closed.
- **C-03 (Critical):** API-key ADMIN escalation — **FIXED**: `roleFromApiKeyScopes`.
- **H-01:** MFA enforced server-side for enrolled users on privileged permissions (12h verification window).
- **H-02/H-03:** webhook mutations permissioned (`webhooks.manage`); 7 v1 routes gated, 6 documented.
- **Accepted (documented):** H-04 inbound webhook verification wiring plan; H-05 legacy identity module (zero-consumer); MFA not forced for un-enrolled users.
- **Open Mediums:** CSP `'unsafe-inline'`, rate-limit keying on `x-forwarded-for`, chunked-body size bypass, ~44 mutation routes without Zod.

### 4. Performance — 7.6/10
- **Fixed (28.0):** `cacheHeaders` `no-store` bug → 212 cached GETs now cached (`private, max-age=N`).
- **Fixed (28.1):** 9 N+1 loops → single-query batches; 9 unbounded admin queries → `take`-bounded; approval polling 10s→30s + cached 10s; financial-reports bounded; cfo/dashboard + ledger cached.
- **Remaining:** treasury hub `MOCK_*` data; 650 `formatCurrency` (0 canonical); deeper scale work (read replicas, distributed rate limiting) unchanged.

### 5. Product Consistency — ~7.0/10 (estimate, unchanged this phase)

### 6. Platform Validation — 8.5/10
- `requireTenantContext` imports: **0**; `withRuntimeContext` in 461 files; 3 legacy `auth()` routes remain (realtime/stats, realtime/health, invites/[token]/accept) — all verified session-gated.
- Typecheck: **0 errors** (baseline 11 fixed: docs/site excluded + seed-fresh repaired); production build **passes**.
- UI-owned reasoning: 2 violations (`portfolio-overview.tsx:37-39`, `fpa-rolling-forecast.tsx:49-50` aggregate in-browser).

### 7. Technical Debt — 4.5/10 (details in KNOWN_LIMITATIONS.md)
- 650 `formatCurrency` occurrences; **zero** import the canonical `src/lib/format.ts`.
- 803 `as any` (up from 763 at Phase 25.5); 0 `@ts-ignore`.
- Zero-consumer modules: `src/server/persistence/` (31 files), `src/server/locks/` (5 files).
- 3 live workflow engines; CurrencyService vs FxService duplicate; 5 event buses.

### 8. Mechanical Hygiene — 8.5/10
- TODO/FIXME: exactly 4 (Vault provider stubs) · lorem ipsum: 0 · `window.confirm`/`alert`: 0 · hardcoded secrets in src/prisma/k8s: 0 · 339 `console.*` concentrated in CLI/seed/test (a few runtime handlers could move to Pino).

## Overall Verdict

- **CFO demo:** doable now — Sandbox tenant or Demo Company + treasury seed. See DEMO_READINESS.md checklist.
- **Production:** no survey release blockers remain. Next hardening (not blockers): CSP tightening, forced MFA enrollment, H-04 inbound webhook wiring, chunked-body limits.
- **Next phase recommendation:** Phase 28.2 — medium-severity security hardening + remaining performance debt, then AP work-queue adoption of migrated pages.
