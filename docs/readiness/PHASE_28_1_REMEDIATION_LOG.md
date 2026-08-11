# Phase 28.1 — Enterprise Readiness Remediation Log

**Date:** 2026-08-08 · **Phase:** 28.1 (post-survey remediation) · **Constraint:** no new features, no new platform modules, no speculative refactoring — every change maps to a documented Phase 28.0 finding.

**First principle:** resolve Critical + High findings with evidence; re-verify; document honestly.

---

## Security Findings

### C-01 (Critical) — Auth bypass via forged identity headers
**Fixed.** The proxy is now the sole identity authority.

- `src/proxy.ts`: strips `x-user-id` / `x-company-id` / `x-company-role` from **all** requests, then re-derives them for `/api/*` paths from a verified JWT (`token.sub` / `activeCompanyId` / `companyRole`) or an API key (`ApiKeyService.validate` + `roleFromApiKeyScopes`). The `/api/v1` guard no longer copies or overwrites headers — it enforces authentication (`401` when neither JWT nor API key is present) and passes identity through `requestHeaders`.
- Defense-in-depth (`src/server/http/init-runtime-context.ts`): `verifyHeaderIdentity()` re-verifies the claimed identity inside `withRuntimeContext` — JWT via `getToken()` (must match `sub`/`companyRole`) or API key via a DB-backed `ApiKeyService.validate`. Claims that fail verification are rejected (`UnauthorizedError`). `VALID_ROLES = {OWNER, ADMIN, TREASURER, MEMBER, VIEWER}` enforced in `validateTenantContext` — unknown roles are rejected with `ForbiddenError`.
- **Evidence:** `git diff` on proxy.ts shows the identity block moved from "copy headers" to "strip + derive"; init-runtime-context.ts adds `verifyHeaderIdentity` (JWT + API-key paths) and role validation.
- **Residual (accepted):** `/api/demo/bootstrap` still returns the demo user + company IDs publicly — required for the demo login flow; demo tenant contains seed data only (documented in OPEN_DECISIONS.md D-01 note).

### C-02 (Critical) — Unguarded `/api/v1/tick`
**Fixed.** `src/app/api/v1/tick/route.ts` now fails closed:
- Missing or short `CRON_SECRET` (< 16 chars) → `503` (cannot verify).
- Signature compared with `crypto.timingSafeEqual`.
- Mismatch → `401`. Success → `200`.

### C-03 (Critical) — API key → ADMIN escalation
**Fixed.** Single source of truth `roleFromApiKeyScopes(scopes)` in `src/modules/api-keys/api-keys.service.ts`:
- `admin:all` → `ADMIN`; any `write:*` → `MEMBER`; otherwise `VIEWER`.
- Consumed by: proxy identity derivation, `authenticate-request.ts`, `require-permission.ts` (hardcoded `"ADMIN"` removed).

### H-01 (High) — MFA never enforced server-side
**Fixed.** `src/server/security/require-permission.ts` rewritten:
- `enforceMfa(permission)`: when `PermissionRegistry.requiresMfa(permission)` is true and the user has MFA enrolled, a fresh TOTP/recovery verification (`mfaLastVerifiedAt` within `MFA_VERIFICATION_WINDOW_MS = 12h`) is required; otherwise `ForbiddenError`.
- Users **without** MFA enrolled are not blocked — forced enrollment is a product-policy decision (accepted risk, tracked in OPEN_DECISIONS.md).
- API-key callers skip MFA (key possession is the credential; documented).
- `requireAuth` rewritten to use derived API-key roles.

### H-02 (High) — Unpermissioned webhook mutations
**Fixed.** `src/app/api/v1/webhooks/route.ts`:
- POST / PATCH / DELETE now require `webhooks.manage` via `rbacService.ensurePermission`.
- Zod schemas added: `createWebhookSchema` / `updateWebhookSchema` / `deleteWebhookSchema` (idempotency key preserved); validation errors via `zodErrorResponse`.

### H-03 (High) — 13 v1 routes without permission checks
**Fixed (7 enforced, 6 documented):**

| Route | Action |
|---|---|
| `/api/v1/admin/approval-analytics` | + `approvals.view` |
| `/api/v1/transactions/[id]/matching-rules` | + `approvals.view` |
| `/api/v1/transactions/[id]/approvals/approve` | + `approvals.approve` |
| `/api/v1/transactions/[id]/approvals/reject` | + `approvals.reject` |
| `/api/v1/sandbox/scenario` GET | + `analytics.read` |
| `/api/v1/sandbox/scenario` POST | + `admin.settings` (mutation class, consistent with sibling `sandbox/reset`) |
| `/api/v1/enterprise/health` | + `admin.settings`; `node` version removed from `meta` (data minimization) |
| `/api/v1/tick` | fail-closed auth (C-02) |
| `/api/v1/companies` | already `requireSession`-gated — documented sufficient |
| `/api/v1/invites/[token]` + `/accept` | token-authenticated by design (invitation token is the credential) — documented |
| `/api/v1/realtime/stats` | already session + `companyRole === "ADMIN"` — documented |
| `/api/v1/realtime/health` | already session-gated — documented |
| `/api/v1/demo-requests` | intentionally public (lead-gen form) — documented accepted |

### H-04 (High) — Inbound webhook verification is unwired
**Decision: documented accepted risk with wiring plan (no new feature).**
- Both verifiers are production-grade and unit-complete: HMAC `verifySignature` (timing-safe, `webhook-platform.ts:286`) and Plaid JWS ES256/JWKS `verifyPlaidWebhook` (`plaid-webhook-handler.ts:36`).
- No inbound HTTP source exists today: no Plaid webhook destination is configured, and no platform-to-platform delivery targets this instance. A route with no caller would be untestable dead code — the same defect class the finding describes.
- **Wiring plan (bundle with first real inbound integration):** add `POST /api/v1/connectors/plaid/webhooks` (verify `Plaid-Verification` JWS → resolve `item_id` → connectorConfig/company → `handlePlaidWebhookEvent`) and `POST /api/v1/webhooks/receive` (HMAC verify → route to registered handlers), each with rate limiting + audit.

### H-05 (High) — Legacy identity module fake security
**Unchanged — accepted risk (documented).** `src/server/identity/` is a zero-consumer module (Phase 18.1A BLOCKED on 9 `system/identity` page consumers) with no routes wired to it. Deletion/replacement is tracked as architectural debt; no production code path executes `verifyMFA`/`verifyPasskey`.

---

## Performance Findings

### F-02 (Critical) — `ignoreBuildErrors: true`
**Fixed.** Removed from `next.config.ts`; `prisma/seed-fresh.ts` 3 type errors fixed (wallet `kind`, approval-matrix-rule schema, audit-log field names); `docs/site` (separate Docusaurus project with its own toolchain) excluded from root tsconfig. **Result: `pnpm typecheck` = 0 errors** (was 11 documented pre-existing). Production build passes.

### F-03 (Critical) — approval polling hammer
**Fixed.** `/api/v1/admin/pending-approvals`: `include: {transaction}` → `select`, `take: 200` → `100`, + `cacheHeaders(10)`. Client polls: PendingApprovalsClient 10s → 30s; app-shell 15s → 30s.

### F-04…F-12 — N+1 loops
**All fixed.** Single-query batching + in-memory grouping:

| Finding | File | Before → After |
|---|---|---|
| F-04 | `reconciliation-engine.ts` | `findFirst`+`update` per report item → 1 `findMany (in:)` + 1 `updateMany` |
| F-05 | `approval-thread.service.ts` | `findMany` per mention → 1 query `role: { in }` + user dedupe |
| F-06 | `trend.engine.ts` (×2) | `findMany` per scoreType/kpiKey (6-12 queries) → 1 batched query + Map grouping |
| F-07 | `scenario-modeling.ts` (×2) | `findFirst` per scenario (2 loops) → 1 query, latest-per-scenario Map |
| F-08 | `calendar.service.ts` | `findFirst`+`create` per event → batched dedupe lookup, create-missing only |
| F-09 | `risk.service.ts` | `findFirst` per alert → 1 `findMany (in: titles)` + Set |
| F-10 | `multi-company-builder.ts` (×2) | `findMany` per company (2 loops, + O(n²) find) → **1 total query** + account Map |
| F-11 | `automation-engine.ts` | `findFirst` per rule (cooldown) → 1 batched `workflowLog` query |
| F-12 | `anomaly-detection.service.ts` | 11 sequential queries → `Promise.all` parallel (bounded take 50 each) |

### F-13…F-17 — Unbounded admin queries
**All fixed.** Default `take: 200` (users default 500), `max 1000`, `orderBy createdAt asc`, skip/limit params: admin/users, admin/roles, admin/connectors, admin/webhooks, financial-reports ×4 (definitions, schedules, views, board-packs).

### F-20…F-22 — Cache headers on hot read endpoints
**Fixed.** cfo/dashboard → `cacheHeaders(30)`; `/api/v1/ap/invoices` → `cacheSeconds: 15` via `applyCommonHeaders` (new param in procurement middleware, default no-store); `/api/v1/ledger` → `cacheHeaders(15)`.

---

## UX Findings

### UX-2 (Critical) — `/invoices` + `/audit-trail` stubs with fabricated figures
**Fixed.** Both rewritten as honest server components over real Prisma data (verified live: 1,673 open invoices / 21,780 AP audit records for Demo Company):
- `/invoices`: outstanding / due-this-week / overdue computed from `netBalance` sums by currency, status breakdown from `groupBy`, recent invoices table, CTA to the AP work queue. No fabricated values.
- `/audit-trail`: merged recent entries from `AuditLog` + `ProcurementAPAuditRecord` (chronological, top 20), real counts. The fabricated "100% Verified" stat removed — replaced with honest "AP Append-Only Records" count and append-only labeling.

### UX-5 (High) — Reports hidden as "Coming soon"
**Fixed.** Removed `disabled: true` from both `/reports` nav entries (ALL_NAV + NAV_SECTIONS). Page is fully built (`report-layout`, dashboard, library, builder, scheduled, export center); Cmd+K already listed it — now consistent.

### UX-6 (High) — Deprecated `/accounting` tree nav-promoted
**Fixed.** Both `/accounting` entries removed from nav-config (ALL_NAV + NAV_SECTIONS). `/general-ledger` is the single accounting destination; deprecation banners still present on the legacy pages themselves.

### UX-7 (High) — Guidance Start/Resume/Retake no-ops
**Fixed.** New `GuidanceTourButton` client component wires all three states to `useOnboarding().startTour()`, which launches the GuidedTourOverlay (mounted in app-shell).

### UX-8 (High) — Report viewer Export no-op
**Fixed.** `report-viewer.tsx` `onClick={() => {}}` → real CSV export (UTF-8 BOM, per-section flattening, label + value columns, `reportType-id.csv`).

---

## Platform Validation

- `src/modules/rbac/rbac.service.ts`: `ensurePermission` ForbiddenError now includes the permission name (`You do not have permission to perform this action (X).`) — satisfies `test/security/authorization.test.ts` and improves operator debugging.

## Files Changed (this phase)

**Security:** `src/proxy.ts`, `src/server/http/init-runtime-context.ts`, `src/modules/api-keys/api-keys.service.ts`, `src/server/security/require-permission.ts`, `src/server/security/authenticate-request.ts`, `src/app/api/v1/tick/route.ts`, `src/app/api/v1/webhooks/route.ts`, `src/app/api/v1/sandbox/scenario/route.ts`, `src/app/api/v1/enterprise/health/route.ts`, `src/app/api/v1/admin/approval-analytics/route.ts`, `src/app/api/v1/transactions/[id]/{matching-rules,approvals/approve,approvals/reject}/route.ts`, `src/modules/rbac/rbac.service.ts`

**Performance:** `next.config.ts`, `tsconfig.json`, `prisma/seed-fresh.ts`, `src/app/api/v1/admin/pending-approvals/route.ts`, `src/app/api/v1/admin/{users,roles,connectors,webhooks}/route.ts`, `src/app/api/v1/financial-reports/{route,schedules,views,board-pack}/route.ts`, `src/app/api/cfo/dashboard/route.ts`, `src/app/api/v1/{ap/invoices,ledger}/route.ts`, `src/server/procurement/api/middleware.ts`, `src/modules/ledger/reconciliation-engine.ts`, `src/modules/approval-thread/approval-thread.service.ts`, `src/modules/intelligence-platform/trend.engine.ts`, `src/modules/fpa-specialist/scenario-modeling.ts`, `src/modules/calendar/calendar.service.ts`, `src/modules/risk/risk.service.ts`, `src/modules/financial-reporting/statement-builders/multi-company-builder.ts`, `src/modules/orchestration/automation-engine.ts`, `src/modules/intelligence/anomaly-detection.service.ts`

**UX:** `src/app/(shell)/invoices/page.tsx` (rewrite), `src/app/(shell)/audit-trail/page.tsx` (rewrite), `src/components/navigation/nav-config.ts`, `src/components/sandbox/guidance-tour-button.tsx` (new), `src/app/(shell)/guidance/page.tsx`, `src/components/financial-reports/report-viewer.tsx`

**Docs:** this log, PHASE_28_1_VERIFICATION_REPORT.md, updated SECURITY_REVIEW.md / ENTERPRISE_READINESS.md / OPEN_DECISIONS.md / KNOWN_LIMITATIONS.md / README.md / AGENTS.md / brain.
