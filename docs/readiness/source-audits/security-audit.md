# Perionyx Runtime Security Audit
**Date:** 2026-08-07 | **Mode:** READ-ONLY | **Surface:** Live API routes, authn/authz, tenant isolation, CSRF, rate limiting, validation, sessions, secrets
**Scope:** 472 API route files (261 under /api/v1, 211 outside), src/proxy.ts, src/server/http/init-runtime-context.ts, src/server/security/*, src/server/identity/*, src/server/iam/*, src/server/api-platform/webhooks/*, src/modules/connector-platform/webhooks/*, docs/security claims re-verification

---

## 1. Executive Summary

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 5 |
| Medium | 6 |
| Low | 5 |
| Info | 2 |

**Verdict for demo:** Demo/sandbox is broadly usable, but a **complete authentication bypass exists on ~195 API routes** via forged identity headers — any anonymous caller can read the demo tenant's full financial data (and in production, any tenant whose user/company IDs are known). Demo bootstrap publicly discloses the demo user + company IDs required for the exploit.

**Verdict for production:** **NOT production-ready.** The header-trust bypass, missing MFA enforcement, unguarded global `/api/v1/tick` trigger, unpermissioned webhook mutations, and API-key → ADMIN role escalation are release blockers. Several "fixed" claims in docs/security are only partially true (webhook HMAC/Plaid JWS verification utilities exist but are wired to no HTTP route).

---

## 2. Findings Table

| # | File:Line | Issue | Severity | Evidence |
|---|---|---|---|---|
| C-01 | src/server/http/init-runtime-context.ts:54-81 | **Auth bypass: tenant identity built from client-supplied `x-user-id`/`x-company-id`/`x-company-role` headers.** Proxy (src/proxy.ts:70-71) copies all incoming headers into the forwarded request and only **overwrites** them when a JWT token exists (proxy.ts:243-247). For the 211 API routes NOT under `/api/v1`, the proxy never enforces auth (guard is `pathname.startsWith("/api/v1")`, proxy.ts:239) and never strips/overwrites these headers → any unauthenticated caller sends forged headers → `extractContextFromHeaders` creates a tenant → `validateTenantContext` (init-runtime-context.ts:91-111) only checks presence + LICENSE_COMPANY_ID, never verifies header values against the DB. | Critical | 195 non-v1 routes use `withRuntimeContext` (e.g. src/app/api/executive/dashboard/route.ts:7,10-11 returns cash positions/approvals per `ctx.tenant.companyId`; src/app/api/work-queue/route.ts:7,20; src/app/api/crm/contacts/route.ts:9). Demo bootstrap returns the demo user.id + company.id in plaintext (src/app/api/demo/bootstrap/route.ts:487-492), providing a ready-made impersonation target (demo owner = OWNER role). |
| C-02 | src/app/api/v1/tick/route.ts:8-27 | **Global cross-tenant job trigger with no permission check.** Guard is `if (cronSecret)` — if `CRON_SECRET` is unset (not in .env.example) the endpoint is callable by ANY authenticated user of ANY company and ticks **all** companies: auto-expires transaction approvals (src/modules/tick/tick.service.ts:62-107), marks treasury accounts stale (140-165), fires calendar events (166-181). Also uses non-timing-safe `token !== cronSecret` (route:18). | Critical | tick/route.ts:12-18; tick.service.ts:41 `prisma.company.findMany()` (no tenant filter) |
| C-03 | src/server/security/authenticate-request.ts:36; require-permission.ts:37,65 | **API key fallback hardcodes `role: "ADMIN"`** — any valid API key passes `rbacService.ensurePermission` as ADMIN (require-permission.ts:38). Additionally, when an API-key caller also sends forged `x-user-id` headers, `extractContextFromHeaders` wins over API-key scoping on /api/v1 routes, bypassing key company/scope constraints. | Critical | authenticate-request.ts:36 `return { userId: apiKeyResult.keyId, companyId: apiKeyResult.companyId, role: "ADMIN" as const }` |
| H-01 | src/server/auth/auth.ts:54-63; src/modules/identity/adapters/local.ts:54 | **MFA is not enforced server-side.** `mfaRequired` is only surfaced to the UI (local.ts:54); NextAuth `authorize` never checks `user.mfaEnabled`/`mfaVerified`; no API route checks `mfaVerified` (grep across src/app/api: only /api/auth/mfa itself references MFA). A user with MFA enrolled can obtain a full 24h JWT with password only; every endpoint is reachable without a TOTP challenge. | High | auth.ts:54-63 (no MFA branch); no `ensureMfa`/`mfaVerified` checks in any route file |
| H-02 | src/app/api/v1/webhooks/route.ts:19-53 | **Webhook mutations (POST/PATCH/DELETE) have NO permission check** — only GET checks `admin.webhooks` (route:10). Any authenticated user (or spoofed tenant, per C-01) can create/update/delete outbound webhooks → data exfiltration channel. No Zod schema on bodies (parseJsonBody only). | High | webhooks/route.ts:19-53 (no ensurePermission in mutations); GET at :10 has it |
| H-03 | src/app/api/v1/admin/approval-analytics/route.ts:7-33 | **Route under `/admin/` with no permission check** — any authenticated user reads approval rule usage, bottlenecks, recent activity. 13 of 261 v1 routes have no permission check (approval-analytics, transactions/[id]/approvals/approve+reject, transactions/[id]/matching-rules, companies, tick, sandbox/scenario, invites/*, enterprise/realtime health, demo-requests). | High | approval-analytics/route.ts:7-33 (no ensurePermission) |
| H-04 | src/server/api-platform/webhooks/webhook-platform.ts:281-290; src/modules/connector-platform/webhooks/plaid-webhook-handler.ts:36-112 | **Inbound webhook signature verification is dead code.** HMAC `verifySignature` (timing-safe) exists; Plaid ES256/JWKS verifier exists — but **no HTTP route calls either** (grep: verifyPlaidWebhook referenced only in its own barrel; no route.ts matches any signature header). docs/security CRIT-01 claim ("webhook HMAC … fixed") is therefore un-wired. | High | No `route.ts` references `verifySignature`/`Plaid-Verification`/`x-webhook-signature` (verified by grep); webhook-platform.ts:286-290 |
| H-05 | src/server/identity/authentication.ts:82-115,120 | **Legacy in-memory identity module (9 system/identity pages) contains fake security:** `verifyMFA` accepts code `"000000"` (line 85); `verifyPasskey` accepts any signature ≥10 chars (line 104); password-reset token built from `Math.random()` + 8 base36 chars (line 120). Mock/demo surface, but dangerous if ever wired to a route. | High | authentication.ts:82-115,120 (in-memory users Map at :10) |
| M-01 | src/proxy.ts:82; src/app/api/auth/sandbox-login/route.ts:10; src/app/api/auth/mfa/route.ts:20; src/app/api/auth/register/route.ts:28; src/app/api/demo/bootstrap/route.ts:461 | **Rate limiting keyed on client-controlled `x-forwarded-for`** — attacker supplies arbitrary IP values to rotate keys and bypass all proxy + route rate limits (auth 10/min, financial 60/min, api 120/min). | Medium | proxy.ts:82-102; multiple route-level `request.headers.get("x-forwarded-for")` |
| M-02 | next.config.ts:16 | **`typescript: { ignoreBuildErrors: true }`** — production builds pass with type errors, weakening the type-level security invariants (e.g. `as any` in role/scope code). | Medium | next.config.ts:15-17 |
| M-03 | next.config.ts:19-21 | **CSP allows `'unsafe-inline'` in `script-src` in production** — weakens XSS containment (inline handlers/scripts execute). | Medium | next.config.ts:20-21 |
| M-04 | ~44 mutation routes lack Zod validation (e.g. src/app/api/v1/cache/admin/route.ts:28-39, src/app/api/v1/connectors/events/route.ts:35-42, src/app/api/crm/contacts/route.ts POST) | **POST/PUT/PATCH without schema validation** — raw `request.json()` parsed into services; type/shape mistakes or mass-assignment risk. Many are action endpoints (no body) but several parse untrusted JSON directly. | Medium | cache/admin/route.ts:31-37; connectors/events/route.ts:35-42; full list in appendix |
| M-05 | src/server/http/handle-route.ts:47-53 | **Body-size limit only enforced when `content-length` is present** — chunked requests (no content-length) bypass the 1MB/10MB caps. | Medium | handle-route.ts:47-53 |
| M-06 | src/server/http/handle-route.ts:61-67 | **`cacheHeaders` sets `s-maxage` + `stale-while-revalidate` on authenticated data** (executive/dashboard 30s, work-queue 15s, CRM 15s). If deployed behind a shared CDN, private per-tenant responses can be cached/shared across tenants (cross-tenant leak risk). | Medium | handle-route.ts:63-66; executive/dashboard/route.ts:11; work-queue/route.ts:21 |
| L-01 | src/app/api/openapi/route.ts:5-15 | Public unauthenticated OpenAPI spec — full API contract, endpoint inventory, schemas disclosed. | Low | openapi/route.ts:5-15 |
| L-02 | src/app/api/health/report/route.ts:7-21 | Public full health report (all checks, queue state) — operational detail disclosure. | Low | health/report/route.ts:20-21 |
| L-03 | src/app/api/demo/bootstrap/route.ts:452-496 | Public bootstrap returns demo user id, company id and — on first run — the **plaintext generated password** (route:491). Rate-limited 3/min and gated by DISABLE_DEMO/LICENSE_COMPANY_ID (route:454) but if deployed with demo enabled, credential is disclosed. | Low | bootstrap/route.ts:487-492 |
| L-04 | prisma/seed.ts:10 | Default seed password `"password12345"` (env-overridable) — dev seed only. | Low | seed.ts:10 |
| L-05 | src/modules/sandbox/sandbox-context.ts:29-41; src/app/api/auth/sandbox-login/route.ts:22-26 | Sandbox backdoor account `sandbox-guest@perionyx.dev` with deterministic password derived from AUTH_SECRET; login route rate-limited 10/min but no env gate — active in any deployment that runs the sandbox tenant. | Low | sandbox-context.ts:29-41; sandbox-login/route.ts:11,22-26 |
| I-01 | src/server/identity/* (13 files) | In-memory identity module consumed only by 9 system/identity pages — mock surface, zero persistence; sessions/login attempts lost on restart. | Info | pages: src/app/(shell)/system/identity/* |
| I-02 | src/server/api-platform/webhooks/webhook-platform.ts:8-10 | Webhook subscriptions/deliveries in-memory Maps — lost on restart, no durable audit of outbound deliveries. | Info | webhook-platform.ts:8-10 |

---

## 3. Verified-Fixed Checklist (docs/security claims vs code)

| Claim (doc) | Status | Evidence |
|---|---|---|
| P0-1 CSRF Origin Bypass fixed | **FIXED** | csrf.ts:22-57 (Origin→Referer fallback, rejectMissingOrigin); enforced in proxy.ts:128-143 for all /api/* mutations except NextAuth callback. |
| P0-2 Workflow Approval No Authz fixed | **FIXED** | approval-workflow.ts:244 `rbacService.ensurePermission(..., "approvals.approve")` before approval mutation. (Caveat: approval LEVEL is derived from client-supplied role header — see appendix note.) |
| P0-3 CRM tenant isolation fixed | **FIXED** | crm.service.ts:152-159 (companyId ownership check), all methods take companyId. |
| P0-4 K8s secrets plaintext fixed | **FIXED** | k8s/secrets/app-secrets.yaml gitignored; app-secrets.yaml.example uses CHANGE_ME placeholders. |
| P0-5 Session fail-open fixed | **FIXED (as designed)** | proxy.ts:181-193 fail-open on DB error with 30s in-memory revocation cache (session-validation-store.ts:44-64). Fail-open remains a documented residual risk. |
| CRIT-01 Webhook HMAC (FNV-1a → HMAC-SHA256) | **PARTIAL — utility exists, NOT wired** | webhook-platform.ts:281-290 (timingSafeEqual) and quickbooks-webhook-handler.ts:61 use HMAC; but no inbound webhook receiver route verifies signatures (grep found zero route.ts calls). |
| CRIT-02 Plaintext passwords → bcrypt | **FIXED** | users.service.ts:5,25,49 (bcryptjs, 12 rounds, 5-attempt lockout); identity/authentication.ts:5,20,43 (bcrypt 12). |
| CRIT-03 Plaid JWS/ES256 verification | **PARTIAL — implemented, never called** | plaid-webhook-handler.ts:36-112 correct ES256+JWKS flow; no HTTP route invokes `verifyPlaidWebhook`. |
| MFA (TOTP, recovery codes, timing-safe) | **IMPLEMENTED but NOT ENFORCED** | iam/mfa.ts:32-47 TOTP, :59-72 SHA-256 recovery codes, :335 timingSafeEqual — real; but no server-side gate (see H-01). |
| Body size limits (1MB/10MB) | **PARTIAL** | handle-route.ts:40-53 content-length only; chunked bypass (M-05). |
| Rate limiter memory leak fixed | **FIXED** | rate-limit.ts:12-17 (60s cleanup), :27-36 (100K cap, 10% eviction). |
| Health endpoint info disclosure fixed | **FIXED** | health/route.ts:31-33 returns only {status, ready, live}. |
| API keys must not hardcode ADMIN | **STILL PRESENT** | authenticate-request.ts:36; require-permission.ts:37,65 → `role: "ADMIN"` (C-03). |

---

## 4. Top Risks Ranked

1. **CRITICAL — Identity-header spoofing auth bypass** (C-01): anonymous access to ~195 non-v1 API routes incl. executive dashboards, work queue, CRM, agents, treasury. Demo IDs publicly obtainable via bootstrap. *Fix: proxy must strip inbound x-user-id/x-company-id/x-company-role and set them only from a verified token; or verify header values against DB membership in validateTenantContext.*
2. **CRITICAL — Unguarded global tick** (C-02): any authenticated user triggers cross-tenant approval expiration/treasury/calendar processing; CRON_SECRET absent by default.
3. **HIGH — MFA not enforced** (H-01): 24h JWTs issued on password alone; TOTP verification is client-optional. Release blocker for a finance product claiming MFA.
4. **HIGH — API key → ADMIN escalation + key-scope bypass** (C-03): any valid key (or forged headers on key requests) yields ADMIN; key company scoping defeated.
5. **HIGH — Unpermissioned webhook mutations** (H-02): authenticated/forged callers can create webhooks to exfiltrate event data; admin/approval-analytics and 11 more v1 routes lack permission checks (H-03).

**Demo risk:** High (bypass trivial; all demo data readable without login).
**Production risk:** Critical (same bypass + tick + MFA + webhook + API-key issues; CDN caching of authenticated payloads M-06 adds cross-tenant exposure if s-maxage honored by a shared cache).

---

## Appendix A — v1 routes without permission checks (13)
demo-requests, enterprise/health, admin/approval-analytics, realtime/health, realtime/stats, transactions/[id]/matching-rules, transactions/[id]/approvals/reject, transactions/[id]/approvals/approve, sandbox/scenario, invites/[token]/accept, invites/[token], companies, tick

## Appendix B — Representative mutation routes without Zod (~44)
v1/calendar/generate, v1/calendar/[eventId]/complete, v1/cache/admin, v1/ap/invoices/[invoiceId]/{validate,match,schedule-payment,approve}, v1/ap/reports/duplicates/{dismiss,scan}, v1/copilot/conversations/[id], v1/fx/sync, v1/admin/identity/[id]/{test,sync}, v1/admin/settlements/[id]/retry, v1/admin/deliveries/[id]/retry, v1/api-keys/[keyId]/rotate, v1/integrations/connectors[/...], v1/transactions/[id]/{approve,request-approval}, v1/transactions/[id]/approvals/approve, v1/sandbox/{intelligence,reset}, v1/financial-reports/[id]/execute, v1/orchestration/executions/[id], v1/plaid/link-token, v1/invites/[token]/accept, v1/risk/alerts/[...], demo/bootstrap, automation-studio/setup, auth/sandbox-login, crm/{insights,seed,knowledge-graph,contacts,discovery,pain-points}, agents/[id]/stop, fpa/budgets/[id] (action endpoints with no body are lower risk; those calling `request.json()` unchecked are flagged)

## Appendix C — Method
- Enumerated all 472 route.ts files; classified by auth import (withRuntimeContext / authenticateRequest / requirePermission / requireAuth / requireSession / auth()) and permission call (ensurePermission / apRequirePermission / requirePermission).
- Verified proxy header pass-through logic (src/proxy.ts) and RuntimeContext header extraction (init-runtime-context.ts).
- Verified docs/security claims against current code (section 3).
- Secret scan of src/ + prisma/ + k8s/ for common key patterns: **no hardcoded production secrets found**; .env/.env.production gitignored; .env.example uses placeholders.
