# Open Decisions — Items Requiring Sign-Off (2026-08-07)

Findings from this readiness survey that need a team/architecture decision before the next phase. Each item lists options and a recommendation.

> **Phase 28.1 update (2026-08-08):** D-01, D-03, D-06, D-07, D-08 are **RESOLVED**. D-02 resolved (enforced at permission layer for enrolled users; forced enrollment deferred to Phase 28.2). D-04, D-05 remain open (demo-quality, non-blocking). See sign-off sheet below.

---

## D-01 — Identity-header trust boundary (Security C-01) — RELEASE BLOCKER — ✅ RESOLVED (28.1)

**Problem:** `x-user-id` / `x-company-id` / `x-company-role` headers from the client build the tenant context on ~195 routes; the proxy only overwrites them when a JWT exists and only enforces on `/api/v1`. Any anonymous caller can impersonate the demo user.

**Resolution (Option 1 applied):** proxy strips all three headers from every inbound request and re-derives identity exclusively from a verified JWT (`token.sub` / `activeCompanyId` / `companyRole`) or a DB-backed API key (`roleFromApiKeyScopes`). Defense-in-depth: `verifyHeaderIdentity()` inside `withRuntimeContext` re-verifies claims and rejects unknown roles (`VALID_ROLES`).
- **Residual:** `/api/demo/bootstrap` still returns the demo user + company IDs — required by the demo login flow; demo tenant holds seed data only. Accepted.

---

## D-02 — MFA enforcement policy (Security H-01) — ✅ RESOLVED (28.1, partial)

**Problem:** TOTP exists (enroll/verify/recovery) but no route enforces it; password alone yields a 24h JWT.

**Resolution:** `enforceMfa()` in `require-permission.ts` — permissions flagged `requiresMfa` in `PermissionRegistry` demand a fresh TOTP/recovery verification (`mfaLastVerifiedAt` within 12h) for enrolled users; verified at every privileged call.
- **Deferred to Phase 28.2:** forced enrollment for users without MFA (product-policy decision), and per-route `mfaRequired` nuance.

---

## D-03 — `/invoices` and `/audit-trail` stub pages (UX Critical) — ✅ RESOLVED (28.1)

**Problem:** primary-nav pages show fabricated figures ("100% Verified" audit stat, $284.5k invoice totals).

**Resolution (Option 1 both):** both pages rebuilt as honest server components over live Prisma data — `/invoices` (outstanding/due/overdue by currency, status breakdown, recent-8 table, CTA to AP work queue), `/audit-trail` (merged AuditLog + ProcurementAPAuditRecord feed, real counts, append-only labeling).

---

## D-04 — Treasury hub mock → live (UX/trust) — OPEN (demo-quality)

**Problem:** `/treasury` hub KPIs/health/scorecards render `MOCK_*` constants — the most-demoed surface.

**Options**
1. Wire to existing `/api/treasury/...` endpoints (cash-position, accounts, forecasts — all live) (Recommended).
2. Keep mocks but label "Sample data" (⚠️ trust violation; stale-number rule).
3. Defer until treasury seed.

**Recommendation:** Option 1 — the endpoints already exist; the hub is the last unmigrated surface.

---

## D-05 — Seed strategy (Demo Readiness) — OPEN (demo-quality)

**Problem:** AP seed is company-parameterized; `seed-treasury.ts` is not run per-tenant for Demo Company; Sandbox tenant has no AP.

**Options**
1. Parameterize `seed-treasury.ts` with `SEED_COMPANY_ID` and add both to a single `seed-demo.sh` (Recommended).
2. Keep manual: run treasury seed + pass `SEED_COMPANY_ID` when AP-seeding Sandbox.

**Recommendation:** Option 1 — one command reproduces the demo.

---

## D-06 — Webhook signature verification wiring (Security H-04) — ✅ RESOLVED (28.1, as documented risk)

**Problem:** HMAC-SHA256 + Plaid ES256/JWKS verifiers exist (`webhook-platform.ts:281`, `plaid-webhook-handler.ts:36`) but no route calls them; the security doc's claim is half-true.

**Resolution (Option 2 chosen, with wiring plan):** verifiers are unit-complete; no inbound HTTP source exists in the platform today (no configured Plaid webhook destination, no inbound delivery). A route with no caller would be untestable dead code — the defect class this finding describes. **Wiring plan:** `POST /api/v1/connectors/plaid/webhooks` (JWS verify → resolve item → `handlePlaidWebhookEvent`) and `POST /api/v1/webhooks/receive` (HMAC verify → handlers), each with rate limiting + audit; bundle with the first real inbound integration.
- **Rationale:** respects the Phase 28.1 constraint of no untestable features; the claim gap is now documented in SECURITY_REVIEW.md instead of silently claimed fixed.

---

## D-07 — Legacy `/accounting` nav de-duplication (UX High) — ✅ RESOLVED (28.1)

**Problem:** 14 deprecated `/accounting` pages (banner → `/general-ledger`) remain promoted in nav alongside live surfaces; duplicate trees (forecasts vs cash-forecast, risk vs risks, integrations vs connectors).

**Resolution (Option 1 applied):** both `/accounting` entries removed from nav-config (ALL_NAV + NAV_SECTIONS); routes remain for deep links; `/reports` un-disabled (was `disabled: true` "Coming soon" while fully built). Full delete deferred to the deprecated-surface audit.

---

## D-08 — Typecheck gate (Performance F-02) — ✅ RESOLVED (28.1)

**Problem:** `ignoreBuildErrors: true` ships type errors to production; the only blockers are 11 pre-existing errors in `docs/site` + `prisma/seed-fresh.ts`.

**Resolution (Option 1 applied):** flag removed from `next.config.ts`; `docs/site` (separate Docusaurus project, its own toolchain) excluded from root tsconfig; `seed-fresh.ts` errors fixed. **`pnpm typecheck` = 0 errors; production build passes.**

---

## Sign-off sheet

| # | Decision | Blocker? | Recommended | Owner | Status |
|---|---|---|---|---|---|
| D-01 | Header trust boundary | Production + network demo | Option 1 (strip at proxy) | Security | ✅ RESOLVED (28.1) |
| D-02 | MFA enforcement | Production | Option 1 (session claim) | Security | ✅ RESOLVED (28.1) — forced enrollment deferred to 28.2 |
| D-03 | Stub pages | Demo | Build both on live data | Product | ✅ RESOLVED (28.1) |
| D-04 | Treasury hub live data | Demo quality | Option 1 (wire endpoints) | Frontend | ⏳ OPEN — Phase 28.2 candidate |
| D-05 | Seed strategy | Demo | One-command demo seed | Data | ⏳ OPEN — Phase 28.2 candidate |
| D-06 | Webhook verification | Claims hygiene | Option 2 (document + wiring plan) | Security | ✅ RESOLVED (28.1) |
| D-07 | Accounting nav de-dup | Demo polish | Hide deprecated entries | Frontend | ✅ RESOLVED (28.1) |
| D-08 | Typecheck gate | Engineering | Remove flag + exclusions | Platform | ✅ RESOLVED (28.1) |
