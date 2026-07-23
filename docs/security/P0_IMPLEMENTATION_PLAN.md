# P0 Implementation Plan — Pre-Remediation Analysis

**Phase**: 17.0 — Security Findings Validation
**Date**: 2026-07-20
**Purpose**: For each P0 item, explain why the current implementation exists, whether it is intentional, whether fixing it changes behaviour, what regression risks exist, and which constitutions are affected. No code changes until this document is reviewed.

---

## P0-1: CSRF Origin Bypass

### 1. Why the current implementation exists

The CSRF system has two layers:

**Layer A — `validateOrigin()` (active, used by proxy):** An origin-referer check. It reads the `Origin` HTTP header and compares against a hardcoded allowlist (`localhost:3000`, `localhost:3001`, `app.perionyx.com`, `staging.perionyx.com`). If `Origin` is absent, it returns `{ ok: true }`.

This was designed as a quick CSRF defense for browser-based form submissions. The CHANGELOG confirms the intentional choice: "CSRF protection via `validateOrigin`". The design assumption is that browsers always send `Origin` on cross-site requests.

**Layer B — `CSRFProtection` class (dead code):** A double-submit cookie pattern implementation with `generateToken()`, `validateToken()`, and `middleware()`. It was written but never wired into the proxy. It appears to be a planned future implementation that was abandoned.

**Why no Origin = allow:** The developer assumed that legitimate API clients (the Next.js frontend) always include the `Origin` header on mutations. Requests without `Origin` were treated as "same-origin" (e.g., same-tab form submissions, cURL). This is a common but incorrect assumption — HTML form submissions (`<form method="POST">`) do **not** send `Origin` in all browsers, and programmatic clients (cURL, fetch) can omit it at will.

### 2. Whether it is intentional

**Partially.** The origin allowlist check is intentional (CHANGELOG confirms). The "no Origin = allow" behavior is a **design oversight**, not an intentional security decision. The developer likely tested with browser-originated requests (which always include Origin) and concluded the check was sufficient.

The `CSRFProtection` class being dead code is unintentional — it was meant to be wired in but never was.

### 3. Whether fixing it changes behaviour

**Yes — it will break some clients.**

| Client Type | Current Behaviour | After Fix |
|-------------|-------------------|-----------|
| Next.js browser app (mutations) | Sends `Origin: http://localhost:3000` → allowed | Unchanged |
| Next.js browser app (same-origin form POST) | May omit `Origin` → allowed | **May be blocked** if Origin is absent |
| cURL / API clients without Origin | No Origin → allowed | **Will be blocked** unless they include `Origin` header |
| Third-party webhook callers | POST with no Origin → allowed | **Will be blocked** unless they include `Origin` |
| Health-check probes (GET) | Not checked (mutations only) | Unchanged |

**Critical concern:** The proxy only checks mutations (`POST/PUT/PATCH/DELETE`). GET requests are unaffected. But any API client that sends mutations without an `Origin` header will start receiving 403.

### 4. Whether existing tests cover it

**Yes — but the test asserts the vulnerable behavior as correct.**

`test/security.test.ts` line ~35:
```
"allows requests with no origin header" → POST with no Origin → ok: true
```

This test must be **updated** to expect `ok: false` when Origin is absent. The test currently validates the vulnerability as intended behavior.

Additionally, 3 route handlers duplicate the origin check:
- `src/app/api/auth/register/route.ts:38`
- `src/app/api/v1/transactions/transfer/route.ts:27`
- `src/app/api/v1/transactions/credit/route.ts:27`

These also need to be checked for consistency.

### 5. Regression risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API clients without Origin header get 403 | High | All mutation API calls fail | Add fallback: check `Referer` header when `Origin` is absent; only reject if both are missing |
| Third-party webhook integrations break | Medium | Outbound webhooks fail to deliver | Webhooks are server-to-server (no browser), so they should include `Origin` or be exempted |
| Same-origin form submissions blocked | Low | Legacy form POSTs fail | Modern browsers send `Origin` on form POST; only IE11 and very old browsers don't |
| Tests fail | Certain | CI breaks | Update `test/security.test.ts` to match new behavior |

**Recommended approach:** Fall back to `Referer` header when `Origin` is absent. If both are absent, reject with 403. This is the standard OWASP-recommended pattern and has minimal breakage risk.

### 6. Constitution impact

| Constitution | Section | Impact |
|-------------|---------|--------|
| **Engineering Constitution** | §Security — "defense in depth: authentication → authorization → tenant isolation → rate limiting → input validation → audit logging" | CSRF is part of the authorization layer. Fixing it strengthens the defense-in-depth chain. |
| **Governance Constitution** | §Security — "No shortcut is worth a data breach" | Current implementation is a shortcut. Fix aligns with governance mandate. |
| **Product Constitution** | §8.4 — "Does this respect tenant isolation?" | CSRF bypass can enable cross-origin state-changing attacks that affect tenant data. |

### 7. Workflow changes

- **Frontend**: No changes needed — browser requests always include `Origin`.
- **API clients**: Must include `Origin` header on mutations, or use the `Referer` fallback.
- **Webhooks**: Server-to-server delivery must include `Origin` or `Referer`.
- **Health probes**: Unaffected (GET only).
- **Demo bootstrap**: The `POST /api/demo/bootstrap` endpoint is rate-limited and environment-gated. It would be affected if called without Origin.

---

## P0-2: Workflow Approval — No Authorization Check

### 1. Why the current implementation exists

The workflow engine has **two separate approval systems**:

**System A — Ledger's `ApprovalWorkflowEngine`:** Handles transaction-specific approvals with full RBAC: `rbacService.ensurePermission()`, `ApprovalAuthorityService.userHasApprovalAuthority()`, role-level checks, and `ForbiddenError` on unauthorized access. This system is mature and properly secured.

**System B — Workflow Engine's `respondToApproval`:** A generic approval system for arbitrary workflow steps. It validates tenant ownership (`companyId: ctx.companyId`) and step existence, but **never checks that the approving user is authorized to approve**.

The root cause is architectural: the `respondToApproval` method was built as a simple "any user in the company can approve" system. The approval authorization data (`requiredApprovers`, `approvalGroups`) exists in the step's `config` JSON blob but is only read by `ApprovalStepExecutor.execute()` — it is **never read by `respondToApproval`**.

Additionally, the Prisma schema stores approval config in an opaque `config Json?` column on `WorkflowStepInstance`. There are no dedicated columns for `requiredApprovers` or `approvalGroups`, making it impossible to do a database-level authorization check without deserializing JSON.

### 2. Whether it is intentional

**No.** The Enterprise Workflow Constitution explicitly requires authorization on every approval:

> "Every link has an owner, a deadline, an approval gate, and an audit trail."
> — `docs/ENTERPRISE_WORKFLOW_CONSTITUTION.md:30`

> "No irreversible actions without approval. Every irreversible financial action requires explicit human approval through the approval engine."
> — `docs/ENTERPRISE_WORKFLOW_CONSTITUTION.md:1708`

> "Can every approval be audited? Approval record with actor, timestamp, conditions, and delegation chain."
> — `docs/ENTERPRISE_WORKFLOW_CONSTITUTION.md:1723`

The missing authorization is a gap between the constitution's requirements and the implementation.

### 3. Whether fixing it changes behaviour

**Yes — significantly.**

| User Role | Current Behaviour | After Fix |
|-----------|-------------------|-----------|
| Any authenticated user in same company | Can approve any workflow step | Can only approve steps where they are in `requiredApprovers` or `approvalGroups` |
| CFO approving a transfer | Works (if CFO is the logged-in user) | Works (CFO is in approver list) |
| Junior accountant approving a $1M transfer | **Works (bug)** | **Blocked** (not in approver list) |
| Admin approving any step | Works | Works (if admin role is in approver groups) |

**The key behaviour change:** Approval authorization becomes enforced. Steps without `requiredApprovers` or `approvalGroups` configured would have **no one authorized to approve** — this needs a fallback (e.g., COMPANY_OWNER role always has approval authority).

### 4. Whether existing tests cover it

**No tests exist for `respondToApproval`.**

All existing approval tests exercise the **Ledger's** `ApprovalWorkflowEngine`, not the workflow engine's `respondToApproval`. The test files under `test/workflow/` test ledger approval flows, not generic workflow step approvals.

This means there is **zero regression risk from existing tests** — but also **zero safety net** for the fix.

### 5. Regression risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Steps without configured approvers become un-approvable | High | Workflow instances stall forever on approval steps | Add fallback: COMPANY_OWNER role always has approval authority; steps with empty `requiredApprovers`/`approvalGroups` allow any company member |
| Existing workflow instances with stale config break | Medium | In-flight workflows can't be approved | Read config from `WorkflowStepInstance.config` (which was enriched at creation time) |
| Two approval systems diverge further | Medium | Ledger approvals and workflow approvals have different authz rules | Document the split clearly; plan to unify in Phase 9 |
| Approval matrix rules not wired to authorization | Low | `ApprovalMatrixEvaluator` resolves config but `respondToApproval` doesn't enforce it | The enricher injects `approverRoles` into config; the fix reads these roles |

**Recommended approach:**
1. Read `config.requiredApprovers` and `config.approvalGroups` from the step instance
2. If both are empty, fall back to: allow if `ctx.role === "COMPANY_OWNER"`
3. If configured, check `ctx.userId` is in `requiredApprovers` OR `ctx.role` is in `approvalGroups`
4. Throw `ForbiddenError` if not authorized

### 6. Constitution impact

| Constitution | Section | Impact |
|-------------|---------|--------|
| **Enterprise Workflow Constitution** | §1 — "Every link has an owner, a deadline, an approval gate, and an audit trail" | Direct violation. Fix restores the approval gate. |
| **Enterprise Workflow Constitution** | §8 — "No irreversible actions without approval" | Approval without authorization is not a real approval gate. |
| **Enterprise Workflow Constitution** | §12 — "Every approval be audited" | The audit trail exists (who approved), but the authorization check doesn't. Fix adds the missing link. |
| **Governance Constitution** | §Security — "authentication → authorization (RBAC) → tenant isolation" | Authorization check is missing from workflow approvals. |
| **Product Constitution** | §6.5 — "No Autonomous Action" | An unauthorized user approving is equivalent to autonomous action — no governance gate. |
| **Engineering Constitution** | §Security — "Each participant accesses only what their role requires" | Any user can approve any step, violating least privilege. |

### 7. Workflow changes

- **Existing in-flight workflows**: Steps that are in `WAITING_APPROVAL` status will become harder to approve (authorization enforced). If the step has no `requiredApprovers`/`approvalGroups` configured, the fallback (COMPANY_OWNER) ensures they're still approvable.
- **Workflow definition creation**: No change — definitions already support `config.requiredApprovers` and `config.approvalGroups`.
- **Approval matrix integration**: The `ApprovalMatrixEvaluator` already resolves approver roles. The fix reads these resolved values from the step config.
- **UI**: The approval UI should show who is authorized to approve. If the current user is not authorized, the approve button should be disabled with an explanation.

---

## P0-3: CRM Missing Tenant Isolation

### 1. Why the current implementation exists

The CRM module was built as a **single-user personal relationship management tool** for the Perionyx founder. Evidence:

- The seed data (`crm-seed.ts`) contains 19 LinkedIn contacts from the founder's actual professional network
- The module was designed for a single-user, single-tenant scenario
- It was never architecturally prepared for multi-tenant deployment
- There are **zero tests** for the CRM module
- The Prisma `Contact` model has `companyId String?` (nullable, optional) — the field exists but is never populated
- Child models (`Interaction`, `Opportunity`, `Task`, `ContactIntelligence`, etc.) have **no** `companyId` field at all

The CRM was likely built quickly as a demo/internal tool and was never hardened for production multi-tenant use.

### 2. Whether it is intentional

**No.** The entire codebase follows a strict tenant isolation pattern:

- `src/server/context/tenant-context.ts` enforces `companyId` on every request
- Every other service (`IntelligencePlatformService`, `FxService`, `ApprovalThreadService`, etc.) includes `companyId` in every Prisma query
- The Product Constitution §8.4 asks: "Does this respect tenant isolation?"
- The Engineering Constitution §114: "All tenant data must be isolated by `companyId`. Cross-tenant data access is forbidden."

The CRM is an **outlier** — the only module that extracts `ctx` but throws away `ctx.companyId`.

### 3. Whether fixing it changes behaviour

**Yes — it will hide cross-tenant data.**

| Scenario | Current Behaviour | After Fix |
|----------|-------------------|-----------|
| User in Company A queries contacts | Returns ALL contacts from ALL companies | Returns only Company A's contacts |
| User in Company B queries contacts | Returns ALL contacts from ALL companies | Returns only Company B's contacts |
| Seed data (crm-seed.ts) | Creates contacts without `companyId` | Must be updated to include `companyId` |
| Existing CRM data in production | All contacts have `companyId: null` | All contacts must be backfilled with correct `companyId` |

**Critical concern:** Existing CRM data has `companyId: null` on all contacts. A naive fix (adding `companyId` to the WHERE clause) would **hide all existing data** because no contacts have a `companyId` set. The fix requires:
1. Add `companyId` to all CRM service method signatures (or accept `TenantContext`)
2. Add `companyId` to all Prisma queries
3. Backfill existing data with the correct `companyId`
4. Update `addContact()` to write `companyId`
5. Update seed data to include `companyId`

### 4. Whether existing tests cover it

**No tests exist for the CRM module.** Zero test files. Zero test cases.

This means:
- No regression risk from tests breaking
- No safety net for the fix
- Manual testing required

### 5. Regression risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Existing contacts disappear (companyId: null) | Certain | All CRM data becomes invisible | Backfill migration: `UPDATE crm_contacts SET companyId = (SELECT companyId FROM users WHERE ...)` before adding the filter |
| Child models (Interaction, etc.) have no companyId | Certain | Even after fixing Contact, child records can't be filtered by company | Requires schema migration: add `companyId` to Interaction, Opportunity, Task, ContactIntelligence, etc. |
| Seed data breaks | Certain | Demo/seed contacts have no companyId | Update `crm-seed.ts` to pass companyId |
| Other CRM services (RelationshipIntelligence, PainPoint, etc.) also lack isolation | Certain | Partial fix still leaks data | Must fix ALL 6 CRM service classes, not just `CRMService` |
| API routes throw away `ctx` | Certain | Routes extract ctx but don't pass it to services | Must update all 9 CRM route handlers to pass `ctx` to services |

**Recommended approach (2 phases):**
1. **Quick fix (P0):** Add `companyId` to `CRMService` methods and `Contact` queries. Add `companyId` to `Contact` writes. Update seed data. This protects the most sensitive data (contact names, profiles).
2. **Schema migration (P1):** Add `companyId` to `Interaction`, `Opportunity`, `Task`, `ContactIntelligence` models. Backfill from `Contact.companyId`. This completes the isolation.

### 6. Constitution impact

| Constitution | Section | Impact |
|-------------|---------|--------|
| **Engineering Constitution** | §114 — "All tenant data must be isolated by `companyId`" | Direct violation. |
| **Engineering Constitution** | §142 — "Preserve tenant isolation — no cross-company data leakage" | Cross-tenant CRM data leakage. |
| **Governance Constitution** | §Security — "tenant isolation, and audit logging are non-negotiable" | Tenant isolation is non-negotiable but missing. |
| **Product Constitution** | §8.4 — "Does this respect tenant isolation?" | CRM does not. |
| **GDPR** | Personal data exposure across tenants | CRM contains PII (names, emails, WhatsApp, professional profiles). Cross-tenant exposure is a GDPR violation. |

### 7. Workflow changes

- **CRM data model**: Contacts, interactions, opportunities, tasks, and intelligence records will be scoped to a company. Data from other companies becomes invisible.
- **Seed data**: Must be updated to create contacts with `companyId`.
- **Existing data**: A one-time backfill migration is required before the code fix is deployed.
- **UI**: No changes needed — the CRM UI already runs in the context of a single company.
- **No other modules are affected**: The CRM is self-contained (only its 9 routes import it).

---

## P0-4: K8s Secrets in Plaintext

### 1. Why the current implementation exists

The `k8s/secrets/app-secrets.yaml` file was created as part of Phase 11B (Enterprise Installation & Deployment Platform). It provides a working K8s Secret manifest that allows the application to start in a K8s cluster without additional configuration.

The file uses `stringData` (plaintext YAML that K8s base64-encodes automatically) with **placeholder values**:
- `DATABASE_URL: postgresql://postgres:changeme@perionyx-db:5432/perionyx`
- `REDIS_PASSWORD: changeme`
- `JWT_SECRET: replace-with-64-char-hex-string`
- `ENCRYPTION_KEY: replace-with-32-char-string`
- `NEXTAUTH_SECRET: replace-with-64-char-hex-string`

These are clearly placeholder values — `changeme` and `replace-with-*` are not real secrets. The file was created to demonstrate the K8s deployment architecture and provide a starting point for production deployment.

### 2. Whether it is intentional

**The file structure is intentional. The placeholder values are intentional. The risk is that someone deploys it as-is.**

The `.env.example` file follows the same pattern — placeholder values with generation instructions. However, `.env.example` is excluded from git via `.gitignore` exception (`!.env.example`). The K8s secrets file has **no such protection**.

The `.gitignore` does NOT cover `k8s/secrets/`. Currently the file is untracked by git (never committed), but a future `git add .` would commit it.

### 3. Whether fixing it changes behaviour

**No — it's a configuration change, not a code change.**

| Fix | Behaviour Change |
|-----|-----------------|
| Add `.gitignore` rule for `k8s/secrets/` | File won't be accidentally committed. No runtime change. |
| Replace placeholder values with `CHANGE-ME-FOR-PRODUCTION` | Clearer signal that values must be replaced. No runtime change. |
| Add comment explaining how to generate secrets | Documentation only. No runtime change. |
| Integrate External Secrets Operator | Requires infrastructure change. Production deployment only. |

### 4. Whether existing tests cover it

**No tests cover K8s manifests.** This is infrastructure configuration, not application code.

### 5. Regression risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| .gitignore rule accidentally excludes other k8s files | Low | Important config files not tracked | Be specific: `k8s/secrets/app-secrets.yaml` not `k8s/secrets/*` |
| Placeholder values removed but deployment docs reference them | Low | Deploy instructions broken | Update docs simultaneously |
| External Secrets Operator integration breaks existing deployment | Medium | Production K8s cluster can't start | Don't integrate ESO in P0 — just protect the file and add documentation |

**Recommended approach (minimal risk):**
1. Add `k8s/secrets/app-secrets.yaml` to `.gitignore`
2. Add prominent warning comments at the top of the file
3. Replace `changeme` with `CHANGE-ME-FOR-PRODUCTION` to make it obvious
4. Add a `k8s/secrets/README.md` explaining how to generate real secrets

### 6. Constitution impact

| Constitution | Section | Impact |
|-------------|---------|--------|
| **Engineering Constitution** | §142 — "API keys, database credentials, and third-party tokens must never appear in source code, logs, or error messages. All secrets must be managed through environment variables or a secrets management service." | Plaintext secrets in a YAML file that could be committed to source control. |
| **Governance Constitution** | §Security — "No shortcut is worth a data breach" | Using placeholder secrets in production is a shortcut. |

### 7. Workflow changes

- **Development**: No change — developers use `.env.example` and local Docker.
- **Deployment**: Operators must generate real secrets before deploying. The existing `docker-entrypoint.sh` and K8s deployment docs should be updated to reference the new approach.
- **CI/CD**: If secrets are needed in CI, they must come from CI environment variables, not the YAML file.

---

## P0-5: Session Validation Fail-Open

### 1. Why the current implementation exists

The session validation in `src/proxy.ts:127-158` checks three things on every authenticated request:
1. Does the user still exist? (line 133)
2. Has the tokenVersion changed? (line 140 — password change, account disable, etc.)
3. Is the account locked? (line 147)

All three checks are inside a single `try/catch`. If the database query fails (DB down, connection timeout, pool exhausted), the `catch` block logs the error and **allows the request to proceed**.

The developer's reasoning is stated in the comment:
```
// On DB failure, allow request through (fail-open for availability)
// The 24h JWT expiry provides a natural ceiling
```

This is a deliberate **availability-over-security** tradeoff. The rationale:
- If the DB is down, the entire application is likely degraded anyway
- Blocking all authenticated requests during a DB outage would be a complete denial of service
- The JWT has a 24h expiry, so the blast window is bounded
- The DB outage is typically brief (seconds to minutes)

### 2. Whether it is intentional

**Yes, the fail-open behavior is explicitly intentional.** The comment says so. The developer made a conscious tradeoff.

However, there's a **second, unintentional fail-open path**: if `tokenVersion` is `undefined` in the JWT (line 127: `token.tokenVersion !== undefined`), the entire version validation is silently skipped. This happens for:
- Old tokens minted before `tokenVersion` was added to the JWT
- Tokens from the Enterprise IAM module (which doesn't set `tokenVersion`)

This second path is **not intentional** — it's a guard clause that has the side effect of skipping validation.

### 3. Whether fixing it changes behaviour

**Yes — it will block requests during DB outages.**

| Scenario | Current Behaviour | After Fix |
|----------|-------------------|-----------|
| DB healthy | Session validated, revoked sessions blocked | Unchanged |
| DB down (brief) | All requests proceed, including revoked sessions | **All requests blocked** (401/503) |
| DB down (extended) | All requests proceed for hours | **All requests blocked** |
| Old token without tokenVersion | Validation skipped, request proceeds | **Validation skipped** (unchanged — need separate fix) |

**The key question:** Is it worse to (a) allow revoked sessions during a DB outage, or (b) block all users during a DB outage?

For a financial platform:
- **Option (a)** means a compromised/disabled user can act during outages
- **Option (b)** means legitimate users can't work during outages

The Enterprise Workflow Constitution says: "No irreversible actions without approval." If a user's session should be revoked (password change, account disable), allowing them to continue acting during an outage violates this principle.

### 4. Whether existing tests cover it

**No tests exist for session validation in the proxy.** Zero test files cover:
- The `tokenVersion` mismatch rejection
- The `lockedUntil` rejection
- The fail-open DB failure path
- The `user not found` rejection
- The `tokenVersion === undefined` skip

### 5. Regression risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| DB outage causes complete auth failure for all users | Medium | All users locked out during DB outage | Add 30-second in-memory cache of recently-revoked token versions; serve from cache during brief DB outages |
| Brief DB blip (connection reset) blocks all requests | High | Momentary service disruption | Use a short cache TTL (30-60 seconds) to handle transient failures |
| Old tokens without tokenVersion always fail | Low | Users with old JWTs can't authenticate | Add migration: force re-login for tokens without tokenVersion; or treat missing tokenVersion as "version 1" |
| Cache stale data allows revoked sessions | Low | Brief window (30s) where revoked session works | Acceptable tradeoff — bounded by cache TTL |

**Recommended approach (hybrid fail-open/fail-closed):**
1. Add a 30-second in-memory `Map<userId, revokedTokenVersion>` cache
2. On successful `tokenVersion` increment (password change, disable, lock), add to cache
3. On DB failure, check cache first. If cache has the user, reject. If cache doesn't have the user, allow (fail-open for users not in cache).
4. This handles the common case (password change → immediate rejection) while still allowing brief DB outages for users whose sessions weren't recently revoked.
5. For the `tokenVersion === undefined` path: treat as version 1 (require DB check).

### 6. Constitution impact

| Constitution | Section | Impact |
|-------------|---------|--------|
| **Enterprise Workflow Constitution** | §8 — "No irreversible actions without approval" | A revoked user acting during fail-open can take irreversible actions. |
| **Enterprise Workflow Constitution** | §7 — "Every participant has a defined role, scope, and access boundary" | A disabled user's access boundary is not enforced during fail-open. |
| **Governance Constitution** | §Security — "authentication → authorization → tenant isolation" | Authentication is bypassed during fail-open. |
| **Engineering Constitution** | §Security — "defense in depth" | Fail-open removes one layer of defense. |

### 7. Workflow changes

- **Password changes**: Currently, after a password change, old sessions remain valid until the JWT expires (24h) OR until the next DB check succeeds. After the fix, old sessions are rejected within 30 seconds (cache TTL).
- **Account disabling**: Currently, a disabled user's existing sessions remain valid during DB outages. After the fix, disabled users are rejected within 30 seconds.
- **Account lockout**: Currently, a locked user's existing sessions remain valid during DB outages. After the fix, locked users are rejected within 30 seconds.
- **DB outages**: Currently transparent to users. After the fix, users may see brief auth failures during DB outages (bounded by cache TTL).

---

## Cross-Cutting Concerns

### Test Coverage Gap

All 5 P0 items have **zero or near-zero test coverage**:
- P0-1 (CSRF): 1 test, but it asserts the vulnerable behavior
- P0-2 (Workflow approval): 0 tests
- P0-3 (CRM tenant isolation): 0 tests
- P0-4 (K8s secrets): N/A (infrastructure)
- P0-5 (Session fail-open): 0 tests

**Recommendation:** Write tests for each P0 item **before** implementing the fix. This creates a baseline that verifies the fix works and prevents regressions.

### Constitution Compliance Summary

| P0 | Engineering Const. | Governance Const. | Product Const. | Workflow Const. |
|----|-------------------|-------------------|----------------|-----------------|
| P0-1 CSRF | §Security (defense in depth) | §Security (no shortcuts) | §8.4 (tenant isolation) | — |
| P0-2 Approval | §Security (least privilege) | §Security (RBAC) | §6.5 (no autonomous action) | §1, §8, §12 (approval gates) |
| P0-3 CRM | §114, §142 (tenant isolation) | §Security (non-negotiable) | §8.4 (tenant isolation) | — |
| P0-4 Secrets | §142 (no secrets in code) | §Security (no shortcuts) | — | — |
| P0-5 Session | §Security (defense in depth) | §Security (authentication) | — | §7, §8 (access boundaries) |

### Deployment Order

The 5 P0 items should be implemented in this order to minimize regression risk:

1. **P0-4 (K8s secrets)** — Zero code change, zero runtime change. Infrastructure-only. Ship immediately.
2. **P0-1 (CSRF)** — Low code change, one test update. Well-understood fix. Ship after test update.
3. **P0-5 (Session fail-open)** — Medium code change, new in-memory cache. Requires careful testing of DB outage scenario. Ship after cache implementation and testing.
4. **P0-2 (Workflow approval)** — Medium code change, new authorization check. Requires understanding of all approval step configs. Ship after reading step config and adding authorization.
5. **P0-3 (CRM tenant isolation)** — High code change, schema migration, data backfill. Most complex fix. Ship last, after backfill migration is tested.

---

## Appendix: Source File Reference

| P0 | Primary File | Lines | Secondary Files |
|----|-------------|-------|-----------------|
| P0-1 | `src/server/security/csrf.ts` | 12, 37-38, 21-47 | `src/proxy.ts:104-113`, `test/security.test.ts:34-62` |
| P0-2 | `src/modules/workflow/engine.ts` | 698-781 | `src/modules/workflow/types.ts:51-61`, `prisma/schema.prisma:2483-2518` |
| P0-3 | `src/modules/crm/crm.service.ts` | All (537 lines) | `prisma/schema.prisma:9443+`, `src/app/api/crm/*/route.ts` (9 files) |
| P0-4 | `k8s/secrets/app-secrets.yaml` | All (13 lines) | `.gitignore`, `docker-compose.yml:25,52` |
| P0-5 | `src/proxy.ts` | 127-158 | `src/modules/users/users.service.ts:62-177` |
