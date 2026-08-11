# Enterprise Readiness Survey — 2026-08-07 → 2026-08-08

**Scope:** Evidence-based readiness assessment of Perionyx (Next.js 16 / Prisma / PostgreSQL) for a CFO-facing demo and for production deployment. Nine audit objectives, five deep-dive audits, live-DB verification, and a remediation phase (28.1) that resolved every Critical and High finding.

## Verdict

| Surface | Verdict |
|---|---|
| **CFO demo (Sandbox tenant, after AP seed)** | **READY** — AP seeded (3,500 invoices live); all security blockers fixed; see checklist below |
| **CFO demo (Demo Company tenant)** | **CONDITIONALLY READY** — requires `seed-treasury.ts`; executive health reads ~50 on sparse data |
| **Production** | **NO SURVEY BLOCKERS REMAIN** — 3 Criticals + 4/5 Highs fixed and re-verified (28.1). Remaining items are hardening/architecture debt (see KNOWN_LIMITATIONS) |

## Deliverables

| Document | Objective | Contents |
|---|---|---|
| [ENTERPRISE_READINESS.md](./ENTERPRISE_READINESS.md) | Master scorecard | 9 dimensions, Phase 28.0 → 28.1 scores (overall **6.6 → 7.8**), verdict |
| [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) | Objective 3 | 21 findings with status column (3 Critical + 4 High **FIXED**), verified-fixed checklist |
| [PERFORMANCE_REVIEW.md](./PERFORMANCE_REVIEW.md) | Objective 4 | 33 findings; 9 N+1 loops + 9 unbounded queries + polling hammer + cache bugs **FIXED** |
| [UX_AUDIT.md](./UX_AUDIT.md) | Objective 2/6 | 17 dead ends, 12 placeholders; fabricated stubs replaced with real data |
| [DEMO_READINESS.md](./DEMO_READINESS.md) | Objective 5 | Live-DB data census, phantom-company-ID bug (fixed), pre-demo checklist |
| [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) | Objective 8 | Tech debt register + accepted risks + resolution history |
| [OPEN_DECISIONS.md](./OPEN_DECISIONS.md) | Governance | 6 of 8 decisions **RESOLVED** (28.1); D-04 treasury, D-05 seed remain |
| [PHASE_28_1_REMEDIATION_LOG.md](./PHASE_28_1_REMEDIATION_LOG.md) | 28.1 record | Finding-by-finding before/after evidence, files changed |
| [PHASE_28_1_VERIFICATION_REPORT.md](./PHASE_28_1_VERIFICATION_REPORT.md) | 28.1 proof | Commands + results: typecheck 0 errors, build pass, 50/50 touched tests, live-DB smoke |
| [source-audits/](./source-audits/) | Raw data | Full audit reports from the deep-dive agents (UX, security, performance, demo, tech-debt) |

## Fixes Applied (Phase 28.0 + 28.1)

### Phase 28.0 (survey round)
1. **AP seed phantom company ID (Demo-blocker)** — 8 generators hardcoded `cmqvfocev0001koor7ragb8bq` (0 rows existed); now parameterized and threaded from `ap-seed.ts`. **Verified live: 150 vendors / 3,500 invoices / 21,780 audit records written to Demo Company; 0 to the phantom ID.**
2. **`cacheHeaders()` dead-code bug (F-01 + M-06)** — `no-store` overrode TTLs (0 effective cached GETs) and `s-maxage` risked CDN cross-tenant leakage. Now `private, max-age=N`. `src/server/http/handle-route.ts:61`
3. **Sidebar role-filtering bypass (UX HIGH)** — `NAV_SECTIONS` now intersected with filtered `visibleNav`. `src/components/app-shell.tsx`
4. **Treasury hub dead ends (UX Critical)** — EBAM 404, hidden `/treasury/cash-forecast`, 6 dead CTAs, real CSV export + print wired.
5. **No-op keyboard shortcuts (UX HIGH)** — Cmd+N / Cmd+S removed from shortcuts dialog.
6. **Brand leak (UX Medium)** — 6 pages `| Vaulta` → `| Perionyx`.
7. **Legacy gold (EDL)** — 13× `#d4a843` → `#d4af37`.

### Phase 28.1 (remediation round — full detail in REMEDIATION_LOG)
8. **C-01 header-spoofing bypass (Critical)** — proxy strips `x-user-id`/`x-company-id`/`x-company-role`, derives identity from verified JWT/API key only; `withRuntimeContext` re-verifies claims.
9. **C-02 unguarded tick (Critical)** — mandatory `CRON_SECRET` (≥16 chars), `timingSafeEqual`, fail-closed 503/401.
10. **C-03 API-key ADMIN (Critical)** — `roleFromApiKeyScopes()` single source of truth (ADMIN only for `admin:all`).
11. **H-01 MFA enforcement (High)** — `enforceMfa()` in require-permission: fresh TOTP/recovery (12h window) for enrolled users on privileged permissions.
12. **H-02 webhook mutations (High)** — `webhooks.manage` + Zod schemas on POST/PATCH/DELETE.
13. **H-03 unguarded v1 routes (High)** — 7 gated, 6 documented as correctly open.
14. **F-02 typecheck gate (High)** — `ignoreBuildErrors` removed; `docs/site` excluded; `seed-fresh.ts` fixed. **`pnpm typecheck` = 0 errors.**
15. **F-03 approval polling hammer** — 30s polls (was 10s+15s), `select` instead of `include`, take 100, `cacheHeaders(10)`.
16. **F-04…F-12 N+1 loops ×9** — reconciliation-engine, approval-thread, trend.engine ×2, scenario-modeling ×2, calendar, risk, multi-company-builder ×2, automation-engine, anomaly-detection: all single-query batched.
17. **F-13…F-17 unbounded queries** — take/skip on admin users/roles/connectors/webhooks + financial-reports ×4.
18. **F-20…F-22 cache headers** — cfo/dashboard 30s, ap/invoices 15s, ledger 15s.
19. **UX Critical stubs** — `/invoices` + `/audit-trail` rebuilt on live Prisma data (fabricated figures removed).
20. **UX Highs** — `/reports` enabled; deprecated `/accounting` tree removed from nav; Guidance Start/Resume/Retake wired; report Export → real CSV.
21. **Test regression** — `ForbiddenError` message now includes permission name (satisfies authorization suite).

**Verification:** typecheck **0 errors** · production build **passes** · touched-area suites **50/50** · live-DB smoke on Demo Company (1,673 open invoices / 21,780 AP audit records).

## Pre-Demo Checklist (ordered)

1. ✅ AP seed run (Demo Company: 150 vendors / 3,500 invoices / 21,780 audit records)
2. Run `npx tsx prisma/seed-treasury.ts` for the Demo Company tenant (treasury + executive cash position currently empty)
3. Demo on the **Sandbox tenant** if a rich surface is preferred (5,000 txs, 10,000 ledger entries; add `SEED_COMPANY_ID` env to re-run AP seed per company)
4. ✅ All security release blockers fixed (C-01…C-03, H-01…H-03) — network-exposed demo is now safe; demo bootstrap IDs are public by design (seed-only tenant)
5. Demoable now: `/invoices`, `/audit-trail`, `/reports`, AP work queue, Decision Workspace — all live data
6. Avoid demoing: `/mobile-dashboard`, `/mobile/treasury` (stubs), treasury hub KPIs (`MOCK_*` — D-04), executive health ~50 on sparse tenants (default, not fabricated)

## Related Documentation

- Product System: `docs/product-system/` (20 documents — the consistency baseline for Objective 6)
- Phase 22.2 Dashboard v2: `docs/dashboard/` · Phase 22.3 Decision Workspace: `docs/decision-workspace/`
- Security history: `docs/security/` (audit + remediation phases 16/17/17.2)
