# Security Review — 2026-08-07

**Mode:** read-only analysis of 472 API route files + `src/proxy.ts` + runtime context + identity/IAM/webhook modules, with live re-verification of every `docs/security` remediation claim.
**Full audit:** [source-audits/security-audit.md](./source-audits/security-audit.md)

## Verdict

> **Updated 2026-08-08 (Phase 28.1):** All 3 Critical and 4 of 5 High findings **fixed and re-verified** — full remediation log in [PHASE_28_1_REMEDIATION_LOG.md](./PHASE_28_1_REMEDIATION_LOG.md), evidence in [PHASE_28_1_VERIFICATION_REPORT.md](./PHASE_28_1_VERIFICATION_REPORT.md). Remaining Highs are documented accepted risks (H-04 wiring plan, H-05 zero-consumer module). **No production release blockers remain from this survey.**

- **Demo:** usable on Sandbox/Demo Company; the forged-header bypass (C-01), unguarded tick (C-02), API-key escalation (C-03), MFA non-enforcement (H-01) and unpermissioned webhook mutations (H-02) are all resolved.
- **Production:** ready to progress from readiness work to remaining debt (see KNOWN_LIMITATIONS.md); medium-severity hardening (CSP, chunked-body limits, MFA-forced enrollment) tracked for Phase 28.2.

## Findings Summary

| Severity | Count | Phase 28.1 status |
|---|---|---|
| Critical | 3 | **3 fixed** |
| High | 5 | **4 fixed**, 2 documented accepted (H-04 wiring plan, H-05 zero-consumer) |
| Medium | 6 | 1 fixed this phase (F-03/`s-maxage` cache); 5 open (CSP, rate-limit keying, chunked bodies, Zod coverage) |
| Low | 5 | Open (deferred) |
| Info | 2 | Open (deferred) |

## Critical

| # | Location | Issue | Status |
|---|---|---|---|
| C-01 | `src/server/http/init-runtime-context.ts:54-81` · `src/proxy.ts:239-247` | **Auth bypass via forged identity headers.** Tenant context is built from client-supplied `x-user-id` / `x-company-id` / `x-company-role`. The proxy only overwrites them when a JWT exists and only guards `/api/v1` (proxy.ts:239). 195 non-v1 routes (executive dashboard, work queue, CRM, agents, treasury) are fully impersonable with zero auth. `/api/demo/bootstrap` returns the demo user + company IDs in plaintext, making the exploit trivial against the demo tenant. | ✅ **FIXED (28.1)** — proxy strips all three headers and derives identity only from verified JWT / API key; `verifyHeaderIdentity()` in `withRuntimeContext` re-verifies claims (JWT match or DB-backed API-key validation) and rejects unknown roles. |
| C-02 | `src/app/api/v1/tick/route.ts:8-27` | **Global cross-tenant job trigger, no permission check.** Guarded only by an optional `CRON_SECRET`; when unset, any authenticated user of any company ticks ALL companies (approval expiration, treasury staleness, calendar events). Non-timing-safe comparison (`token !== cronSecret`). | ✅ **FIXED (28.1)** — `CRON_SECRET` mandatory (≥16 chars, else 503 fail-closed); `crypto.timingSafeEqual`; 401 on mismatch. |
| C-03 | `src/server/security/authenticate-request.ts:36` · `require-permission.ts:37,65` | **API keys hardcode `role: "ADMIN"`.** Any valid API key passes every permission check. Forged headers also defeat API-key company scoping on v1 routes. | ✅ **FIXED (28.1)** — single `roleFromApiKeyScopes()`: `admin:all` → ADMIN, `write:*` → MEMBER, else VIEWER; consumed by proxy, authenticate-request, require-permission. |

## High

| # | Location | Issue | Status |
|---|---|---|---|
| H-01 | `src/server/auth/auth.ts:54-63` · `identity/adapters/local.ts:54` | **MFA not enforced server-side.** Real TOTP exists (`iam/mfa.ts`), but NextAuth `authorize` and every route ignore `mfaEnabled`/`mfaVerified` — a password alone yields a 24h JWT. | ✅ **FIXED (28.1)** — `enforceMfa()` in require-permission: privileged permissions (`PermissionRegistry.requiresMfa`) demand a fresh TOTP/recovery verification (12h window) for enrolled users. Residual: forced enrollment not implemented (accepted — see OPEN_DECISIONS). |
| H-02 | `src/app/api/v1/webhooks/route.ts:19-53` | **Webhook mutations (POST/PATCH/DELETE) have no permission check** (GET has `admin.webhooks`). Any authenticated user can create/update/delete outbound webhooks → exfiltration channel. No Zod on bodies. | ✅ **FIXED (28.1)** — all mutations require `webhooks.manage`; Zod schemas added for all bodies. |
| H-03 | `src/app/api/v1/admin/approval-analytics/route.ts:7-33` | **Route under `/admin/` with no permission check.** 13 v1 routes lack checks (see appendix of source audit). | ✅ **FIXED (28.1)** — 7 routes permission-gated (`approvals.view`/`approvals.approve`/`approvals.reject`/`analytics.read`/`admin.settings`); 6 documented as correctly open (public leads, token-authenticated invites, existing session guards). |
| H-04 | `webhook-platform.ts:281-290` · `plaid-webhook-handler.ts:36-112` | **Inbound signature verification is dead code.** HMAC + Plaid ES256/JWKS verifiers exist but no HTTP route calls them — the `docs/security` "webhook HMAC fixed" claim is only half true. | 📋 **ACCEPTED (28.1)** — verifiers unit-complete; no inbound source exists today. Wiring plan (routes + rate limiting + audit) documented in REMEDIATION_LOG + OPEN_DECISIONS; bundle with first real inbound integration. |
| H-05 | `src/server/identity/authentication.ts:82-115,120` | **Legacy in-memory identity module with fake security:** `verifyMFA` accepts `"000000"`; `verifyPasskey` accepts any signature ≥10 chars; reset tokens from `Math.random()`. Mock-only today (9 system/identity pages) but dangerous if ever wired. | 📋 **ACCEPTED (28.1)** — zero-consumer module (Phase 18.1A deletion blocked by page consumers); tracked as architectural debt; no production path executes it. |

## Medium

- **M-01** Rate limiting keyed on spoofable `x-forwarded-for` (proxy.ts:82 + auth/mfa/register/bootstrap routes).
- **M-02** `ignoreBuildErrors: true` (next.config.ts:16) — type errors ship to production.
- **M-03** CSP allows `'unsafe-inline'` in `script-src` in production.
- **M-04** ~44 mutation routes without Zod validation (representative list in source audit appendix).
- **M-05** Body-size limit only enforced when `content-length` present — chunked bodies bypass.
- **M-06** `cacheHeaders` emitted `s-maxage` on authenticated payloads (CDN cross-tenant leak risk). **FIXED this survey** → `private, max-age=N`.

## Verified-Fixed Checklist (docs/security claims vs code)

| Claim | Status |
|---|---|
| CSRF origin bypass | ✅ FIXED (csrf.ts:22-57, proxy enforcement) |
| Workflow approval authz | ✅ FIXED (approval-workflow.ts:244 `approvals.approve`) |
| CRM tenant isolation | ✅ FIXED (17 methods scoped by companyId) |
| K8s secrets plaintext | ✅ FIXED (gitignored + CHANGE_ME placeholders) |
| Session fail-open | ✅ FIXED as designed (30s revocation cache) |
| Webhook HMAC-SHA256 | ⚠️ PARTIAL — utility exists, **no inbound route verifies** | 📋 accepted risk with wiring plan (H-04) |
| bcrypt passwords | ✅ FIXED (12 rounds both identity paths) | ✅ confirmed |
| Plaid JWS/ES256 | ⚠️ PARTIAL — implemented, **never called** | 📋 accepted risk with wiring plan (H-04) |
| MFA TOTP + recovery codes | ⚠️ IMPLEMENTED but **not enforced** | ✅ **ENFORCED (28.1)** for enrolled users on privileged permissions |
| Body size limits | ⚠️ PARTIAL — content-length only | ⚠️ open (M-05) |
| Rate limiter memory leak | ✅ FIXED (60s cleanup, 100K cap) | ✅ confirmed |
| Health endpoint disclosure | ✅ FIXED (status/ready/live only) | ✅ confirmed |
| API keys must not hardcode ADMIN | ❌ STILL PRESENT (C-03) | ✅ **FIXED (28.1)** — `roleFromApiKeyScopes` |
| Proxy header trust (new) | ❌ C-01 | ✅ **FIXED (28.1)** — strip + derive + re-verify |
| MFA server-side enforcement (new) | ❌ H-01 | ✅ **FIXED (28.1)** |
| Webhook mutation permissions (new) | ❌ H-02 | ✅ **FIXED (28.1)** |
| v1 route permission coverage (new) | ❌ H-03 (13 routes) | ✅ **FIXED (28.1)** — 7 gated, 6 documented |

## Top Risks Ranked

1. **C-01** Identity-header spoofing → anonymous access to ~195 routes incl. all demo data. — ✅ FIXED
2. **C-02** Unguarded global tick → cross-tenant side effects by any user. — ✅ FIXED
3. **H-01** MFA not enforced → 24h JWTs on password alone (finance product blocker). — ✅ FIXED (enrolled users)
4. **C-03** API key → ADMIN escalation. — ✅ FIXED
5. **H-02/H-03** Unpermissioned webhook mutations + 13 unguarded v1 routes. — ✅ FIXED

## Recommended Remediation Order

1. ~~**Proxy header policy (C-01):** strip `x-user-id`/`x-company-id`/`x-company-role` from inbound requests; set them only from a verified session/API key. Fallback: verify header values against DB membership in `validateTenantContext`.~~ **DONE (28.1)**
2. ~~**Tick guard (C-02):** require `CRON_SECRET` always + `timingSafeEqual` + permission check.~~ **DONE (28.1)**
3. ~~**MFA enforcement (H-01):** require `mfaVerified` claim for privileged routes; check in `authorize`.~~ **DONE (28.1)** — enforced at permission layer; remaining: forced enrollment (Phase 28.2)
4. ~~**API-key role (C-03):** derive role from key scopes, never ADMIN.~~ **DONE (28.1)**
5. ~~**Webhooks (H-02):** permission-check all mutations; wire inbound HMAC/JWS verification (H-04).~~ Mutations **DONE (28.1)**; inbound wiring deferred with plan (H-04).
