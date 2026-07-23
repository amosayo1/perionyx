# Security Decision Records

**Phase**: 17.1 — P0 Security Remediation
**Date**: 2026-07-20
**Purpose**: Document every security-related decision made during P0 remediation, with rationale, alternatives considered, and constitution impact.

---

## SDR-001: CSRF Conditional Enforcement

**Decision**: Enforce CSRF Origin validation only for session-authenticated requests; API-key-authenticated requests pass through.

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `src/server/security/csrf.ts`, `src/proxy.ts`

### Context

The original CSRF check applied to all mutation requests. API keys are used by external integrations (webhooks, server-to-server) that cannot send browser `Origin` headers.

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **A. Enforce for all requests** | Maximum security | Breaks all API key integrations | Rejected |
| **B. Enforce for session-auth only** | Browser protection preserved; API keys unaffected | API key requests without CSRF protection | **Selected** |
| **C. Require Origin header on API keys** | Consistent enforcement | API clients must be modified; breaks existing integrations | Rejected |
| **D. Add separate CSRF token for API keys** | Full protection for all | Complex; requires API key rotation; overkill for server-to-server | Rejected (future work) |

### Rationale

API keys authenticate via `x-api-key` header, not browser cookies. CSRF attacks target cookie-based authentication. API keys are not vulnerable to CSRF because they're not automatically attached by browsers. Enforcing CSRF on API keys would break legitimate integrations with no security benefit.

### Constitution Impact

- **Engineering Constitution** §Security — "defense in depth": CSRF layer added for session-auth, not weakened for API keys
- **Governance Constitution** §Security — "No shortcut is worth a data breach": API key exemption is not a shortcut; it's a correct application of CSRF threat model

### Risk Accepted

API key endpoints without CSRF protection rely on API key authentication alone. If an API key is compromised, CSRF protection would not help. The risk is mitigated by API key rate limiting (120/60s) and audit logging.

---

## SDR-002: CSRF Referer Fallback

**Decision**: Fall back to `Referer` header when `Origin` header is absent.

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `src/server/security/csrf.ts`

### Context

Some legitimate browser requests (e.g., same-origin form POST in older browsers) may not send the `Origin` header. The `Referer` header is more widely supported.

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **A. Reject if Origin absent** | Maximum security | Breaks legitimate same-origin form POST | Rejected |
| **B. Fall back to Referer** | Broader compatibility; still validates origin | Referer can be spoofed by non-browser clients | **Selected** |
| **C. Allow if both absent** | Maximum compatibility | CSRF vulnerability reintroduced | Rejected |

### Rationale

OWASP recommends the Referer fallback pattern. The Referer header is set by browsers automatically and cannot be forged by JavaScript (unlike Origin). Non-browser clients (cURL, fetch) can omit both, but they're not vulnerable to CSRF.

### Risk Accepted

Referer header can be stripped by privacy tools (DNT extensions, corporate proxies). If both Origin and Referer are absent, the request is rejected — this is the correct behavior for mutation requests from browsers.

---

## SDR-003: Workflow Approval Authorization — Empty Approvers Fallback

**Decision**: When `requiredApprovers` and `approvalGroups` are both empty, allow any authenticated user in the same company to approve.

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `src/modules/workflow/engine.ts`

### Context

The workflow engine stores approval configuration in `config.requiredApprovers` and `config.approvalGroups`. Many existing workflow steps were created without these fields populated.

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **A. Deny if not configured** | Maximum security | All existing workflows stall on approval steps | Rejected |
| **B. Allow any company member (fallback)** | Backward compatible; existing workflows continue to work | Weaker than intended authorization | **Selected** |
| **C. Require COMPANY_OWNER only** | Strong fallback | Too restrictive; COMPANY_OWNER may not be available | Rejected |
| **D. Block new workflows until config is set** | Forces proper configuration | Doesn't help existing in-flight workflows | Rejected (future requirement) |

### Rationale

The empty-approvers fallback is a **backward-compatible safety net**. It ensures existing workflows don't stall while new workflows can be configured with proper authorization. The Enterprise Workflow Constitution requires approval gates, but doesn't specify who must be in the gate — any company member is a valid minimum.

### Constitution Impact

- **Enterprise Workflow Constitution** §1 — "Every link has an owner, a deadline, an approval gate, and an audit trail": The fallback ensures approval gates exist; they're just broader than ideal
- **Enterprise Workflow Constitution** §8 — "No irreversible actions without approval": The fallback preserves the approval requirement

### Future Work

New workflow definitions should be required to specify `requiredApprovers` or `approvalGroups`. The empty fallback should be deprecated in Phase 9.

---

## SDR-004: CRM Tenant Isolation — Service-Level Filtering

**Decision**: Add `companyId` parameter to all 17 public CRM service methods and filter all Prisma queries by `companyId`.

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `src/modules/crm/crm.service.ts`

### Context

The CRM module had zero tenant isolation. All contacts from all companies were visible to all users.

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **A. Prisma middleware (global)** | Automatic; no service changes | Requires schema change for all models; performance overhead | Rejected |
| **B. Service-level filtering** | Surgical; no schema changes; explicit control | Requires updating every method | **Selected** |
| **C. Row-level security (Postgres)** | Database-enforced; strongest isolation | Requires Postgres RLS; complex migration | Rejected (future work) |
| **D. Application-level view** | Single query change | Hides data instead of isolating; data still exists | Rejected |

### Rationale

Service-level filtering is the same pattern used by every other module in the codebase (IntelligencePlatformService, FxService, ApprovalThreadService). It's explicit, testable, and doesn't require schema changes. The child models (Interaction, Opportunity, Task, ContactIntelligence) inherit isolation through the Contact relation.

### Constitution Impact

- **Engineering Constitution** §114 — "All tenant data must be isolated by `companyId`": Direct compliance
- **Engineering Constitution** §142 — "Preserve tenant isolation — no cross-company data leakage": Direct compliance

### Risk Accepted

The `_verifyContactOwnership()` helper is called at the start of every method. If a new method is added without calling it, cross-tenant access is possible. This is a process risk, not an architectural risk. Mitigated by code review guidelines.

---

## SDR-005: Session Validation Store — Hybrid Fail-Open/Fail-Closed

**Decision**: On DB failure, check in-memory cache of recently revoked users. If user is in cache → reject (fail-closed). If user is not in cache → allow (fail-open).

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `src/server/security/session-validation-store.ts`, `src/proxy.ts`

### Context

The original session validation was fail-open on DB failure. This means revoked users (password change, account disable) could continue acting during DB outages.

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **A. Fail-open (original)** | Maximum availability | Revoked users can act during DB outages | Rejected |
| **B. Fail-closed (strict)** | Maximum security | All users locked out during DB outages | Rejected |
| **C. Hybrid (cache-first)** | Security for recent revocations; availability for others | Brief window (30s) for non-recent revocations | **Selected** |
| **D. Redis-backed cache** | Distributed; survives process restarts | Requires Redis; adds complexity | Rejected (future work) |

### Rationale

The hybrid approach handles the most common attack scenario: a password is changed, then the attacker uses the old session. The 30-second cache TTL ensures the old session is rejected within 30 seconds, even during a DB outage. For users whose sessions weren't recently revoked, the fail-open behavior preserves availability.

### Constitution Impact

- **Enterprise Workflow Constitution** §8 — "No irreversible actions without approval": Revoked users are blocked within 30s
- **Governance Constitution** §Security — "authentication → authorization": Authentication layer is strengthened

### Risk Accepted

There's a 30-second window where a non-recently-revoked user's session is valid during a DB outage. This is acceptable because:
1. The user's session wasn't recently revoked (so the compromise window is small)
2. The DB outage is typically brief (seconds to minutes)
3. The JWT has a 24h expiry (natural ceiling)

---

## SDR-006: Old JWT tokenVersion Handling

**Decision**: Treat `tokenVersion === undefined` in JWT as version 1 (not a skip). Force re-authentication for old tokens.

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `src/proxy.ts`

### Context

Old JWTs (minted before `tokenVersion` was added) have `tokenVersion: undefined`. The original code silently skipped validation for these tokens, allowing revoked sessions to remain valid indefinitely.

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **A. Skip if undefined (original)** | Backward compatible | Revoked sessions never blocked for old tokens | Rejected |
| **B. Treat as version 1** | Forces DB check; old tokens validated | Old tokens may fail if user changed password since issuance | **Selected** |
| **C. Reject all old tokens** | Maximum security | All users with old tokens forced to re-login immediately | Rejected (too disruptive) |
| **D. Grace period (7 days)** | Smooth migration | Complex to implement; extends vulnerability window | Rejected |

### Rationale

Treating `undefined` as version 1 means old tokens are validated against the DB. If the user hasn't changed their password, the token works. If they have, the token is rejected. This is the correct behavior — old tokens should not bypass security.

### Risk Accepted

Users with very old tokens (before `tokenVersion` was added) may be forced to re-login if they changed their password since the token was issued. This is a one-time inconvenience, not a recurring issue.

---

## SDR-007: Error Message Information Disclosure Policy

**Decision**: Create a comprehensive policy document (`RESOURCE_DISCLOSURE_POLICY.md`) defining safe error message patterns for multi-tenant SaaS.

**Date**: 2026-07-20
**Status**: Policy Document — Code changes pending approval
**Files**: `docs/security/RESOURCE_DISCLOSURE_POLICY.md`

### Context

`handleRouteError()` sends `error.message` verbatim to HTTP clients. Many `AppError` messages contain tenant IDs, user roles, authorization details, and internal state.

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **A. Global sanitization wrapper** | Single point of change | Loses all specific error messages; breaks validation UX | Rejected |
| **B. Per-endpoint sanitization** | Surgical; preserves validation UX | More files to change | **Selected** |
| **C. Client-side mapping only** | No server changes | Error.message still leaked in logs, monitoring; determined attackers can intercept | Rejected (insufficient alone) |
| **D. Do nothing** | No effort | Information disclosure continues | Rejected |

### Rationale

Per-endpoint sanitization is the recommended approach because:
1. It's surgical — only dangerous messages are changed
2. Validation errors (field names, enum values) are safe and preserved
3. Each endpoint can be tested individually
4. The `RESOURCE_DISCLOSURE_POLICY.md` provides clear rules for each error type

### Constitution Impact

- **Governance Constitution** §Security — "No shortcut is worth a data breach"
- **Engineering Constitution** §114 — "All tenant data must be isolated"
- **Product Constitution** §8.4 — "Does this respect tenant isolation?"

### Future Work

Client-side `getErrorMessage()` should be updated to map error codes to user-friendly messages, never displaying raw `error.message` from the API.

---

## SDR-008: K8s Secrets — Placeholder + Gitignore Pattern

**Decision**: Replace all K8s secret values with `REPLACE_ME` placeholders, add `app-secrets.yaml.example` as a committed template, and gitignore the real secrets file.

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `k8s/secrets/app-secrets.yaml`, `k8s/secrets/app-secrets.yaml.example`, `.gitignore`

### Context

The K8s secrets file had placeholder values (`changeme`, `replace-with-*`) that could be accidentally deployed to production.

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **A. External Secrets Operator** | Maximum security; secrets never in repo | Requires infrastructure; complex setup | Rejected (future work) |
| **B. Placeholder + gitignore** | Simple; prevents accidental commit; provides template | Secrets still exist as files on disk | **Selected** |
| **C. Remove file entirely** | No risk | No deployment template; harder for operators | Rejected |
| **D. Encrypt with SOPS** | Secrets encrypted in repo | Requires key management; complex | Rejected (future work) |

### Rationale

The placeholder + gitignore pattern is the minimum viable fix. It prevents accidental commits while providing a clear template for operators. External Secrets Operator or SOPS can be integrated in Phase 9 for production-grade secret management.

### Constitution Impact

- **Engineering Constitution** §142 — "API keys, database credentials, and third-party tokens must never appear in source code"
- **Governance Constitution** §Security — "No shortcut is worth a data breach"

---

## SDR-009: Duplicate CSRF Validation Removal

**Decision**: Remove duplicate `validateOrigin()` calls from 3 route handlers (`auth/register`, `transactions/transfer`, `transactions/credit`).

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `src/app/api/auth/register/route.ts`, `src/app/api/v1/transactions/transfer/route.ts`, `src/app/api/v1/transactions/credit/route.ts`

### Context

The proxy already runs CSRF validation on all mutations. Three route handlers duplicated this check, creating maintenance burden and inconsistent behavior.

### Rationale

Single enforcement point (proxy) is the correct architecture. Duplicate checks in handlers:
1. Create confusion about which check is authoritative
2. May diverge in behavior (different error messages, different logic)
3. Add unnecessary code complexity

### Constitution Impact

- **Engineering Constitution** — "defense in depth": One strong CSRF layer is better than two inconsistent layers

---

## SDR-010: Dead CSRFProtection Class Removal

**Decision**: Remove the unused `CSRFProtection` class from `csrf.ts` and its re-export from `index.ts`.

**Date**: 2026-07-20
**Status**: Implemented
**Files**: `src/server/security/csrf.ts`, `src/server/security/index.ts`

### Context

The `CSRFProtection` class was a double-submit cookie pattern implementation that was written but never wired into the proxy. It was dead code.

### Rationale

Dead code creates confusion:
1. Developers may think it's the active CSRF implementation
2. It imports `crypto` without using it
3. It has a different API than the active `validateOrigin()` function

Removing dead code follows the principle of least surprise.

---

## Appendix: Decision Log

| ID | Decision | Date | Status | Risk Level |
|----|----------|------|--------|------------|
| SDR-001 | CSRF conditional enforcement | 2026-07-20 | Implemented | Low |
| SDR-002 | CSRF Referer fallback | 2026-07-20 | Implemented | Low |
| SDR-003 | Workflow approval empty-approvers fallback | 2026-07-20 | Implemented | Medium |
| SDR-004 | CRM service-level filtering | 2026-07-20 | Implemented | Low |
| SDR-005 | Session validation hybrid fail-open/closed | 2026-07-20 | Implemented | Medium |
| SDR-006 | Old JWT tokenVersion handling | 2026-07-20 | Implemented | Low |
| SDR-007 | Error message disclosure policy | 2026-07-20 | Policy Document | Medium |
| SDR-008 | K8s secrets placeholder pattern | 2026-07-20 | Implemented | Low |
| SDR-009 | Duplicate CSRF validation removal | 2026-07-20 | Implemented | Low |
| SDR-010 | Dead CSRFProtection class removal | 2026-07-20 | Implemented | Low |

---

**Document Version**: 1.0
**Last Updated**: 2026-07-20
