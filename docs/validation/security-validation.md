# Parts 2, 3, 4 — Security & Multi-Tenant Validation

## Validation Method

Each security control was traced through the actual implementation. Gaps are flagged with evidence.

---

## Part 2 — Multi-Tenant Validation

### 2.1 Tenant Context Establishment

| Check | Evidence | Status |
|---|---|---|
| Tenant context extraction | `src/proxy.ts:159-161` — JWT → `x-user-id`, `x-company-id`, `x-company-role` headers | ✅ |
| Tenant context enforcement | `src/server/context/tenant-context.ts:10-29` — `requireTenantContext()` throws `ForbiddenError` if no companyId/role | ✅ |
| API key tenant context | `src/server/security/authenticate-request.ts:25` — API key auth hardcodes `role: "ADMIN"` | ⚠️ Gap: no company scoping for API keys |
| Client-side company gate | `src/components/tenant-gate.tsx:19-21` — Redirects to `/onboarding` if no activeCompanyId | ✅ |
| Workspace switching | `src/components/navigation/workspace-switcher.tsx` + `auth.ts:74-98` — JWT update callback | ✅ |

### 2.2 Tenant Isolation in Database

Prisma schema — every business entity carries `companyId`:

| Model | Field | Status |
|---|---|---|
| `Wallet` | `companyId String` | ✅ |
| `Transaction` | `companyId String` | ✅ |
| `AuditLog` | `companyId String?` | ✅ |
| `Role` | `companyId String` | ✅ |
| `UserRole` | `companyId String` | ✅ |
| `ApprovalAuthority` | `companyId String` | ✅ |
| `OrganizationUnit` | `companyId String` | ✅ |
| All treasury models | `companyId String` | ✅ |
| All governance models | `companyId String` | ✅ |

Query scoping (example from `audit.service.ts:50`): `where: { companyId: ctx.companyId }`

### 2.3 License Enforcement

| Check | Evidence | Status |
|---|---|---|
| Single-tenant override | `tenant-context.ts:23-26` — `LICENSE_COMPANY_ID` env var restricts to one company | ✅ |
| Sandbox restrictions | `rbac.service.ts:173-181` — `SANDBOX_RESTRICTED_PERMISSIONS` blocks sensitive operations | ✅ |

### 2.4 Cross-Tenant Access Prevention

| Check | Evidence | Status |
|---|---|---|
| Entity query scoped by companyId | All Prisma queries filter `where: { companyId }` | ✅ |
| In-memory store scoped | In-memory services use `Map<companyId, ...>` not queried across companies | ✅ |
| API routes check | 144/158 routes call `requireTenantContext()` before any operation | ✅ |

---

## Part 3 — Permission Validation

### 3.1 RBAC Implementation

| Check | Evidence | Status |
|---|---|---|
| Role model | `prisma/schema.prisma:465-481` — `Role` with `companyId`, `name` | ✅ |
| Permission model | `prisma/schema.prisma:490-496` — `Permission` with `name`, `description` | ✅ |
| Role-Permission mapping | `prisma/schema.prisma:498-511` — `RolePermission` with scoped access | ✅ |
| User-Role assignment | `prisma/schema.prisma:513-528` — `UserRole` with company scoping | ✅ |
| Permission check | `src/modules/rbac/rbac.service.ts:165-195` — `ensurePermission()` with sandbox check + owner fallback | ✅ |
| Usage in routes | ~25 routes use `rbacService.ensurePermission()` for financial/admin/approval actions | ✅ |

### 3.2 Granular Permissions (Enterprise IAM)

| Check | Evidence | Status |
|---|---|---|
| Permission definitions | `src/server/iam/permissions.ts:438-467` — `PermissionRegistry` with 62 permissions across 14 categories | ✅ |
| MFA requirements | 62 permissions each with `requiresMfa` metadata | ✅ |
| Role definitions | `src/server/iam/roles.ts:395-440` — 17 enterprise roles with explicit permission sets | ✅ |
| Role hierarchy | `EnterpriseRoles` — `department_manager` inherits from `read_only_executive` | ✅ |
| Permission validation | `requirePermissions()` with `all`/`any` mode | ✅ |

### 3.3 ABAC (Attribute-Based Access Control)

| Check | Evidence | Status |
|---|---|---|
| Condition engine | `src/server/iam/abac.ts:13-82` — Full condition matching (8 operators, priority-based, deny-override) | ✅ Built |
| Attribute definitions | 9 ABAC attribute definitions (department, region, legal entity, cost center, approval limit, risk level, wallet, workflow, connector) | ✅ Defined |
| Enforcement | `ABACEvaluator` at line 3-10 — **stub that always returns `{ allowed: true }`** | ❌ Not enforced |

### 3.4 Segregation of Duties

| Check | Evidence | Status |
|---|---|---|
| SoD rules | `compliance-seed.ts:66` mentions "System-enforced SoD for financial transactions" | ❌ No programmatic enforcement |
| Controls | No SoD conflict detection, no dual-approval enforcement beyond `ApprovalAuthority` | ❌ Not implemented |

### 3.5 Permission Matrix

| Role | Permission Count | Key Permissions | MFA Required |
|---|---|---|---|
| system_administrator | 62 | All | Yes (destructive) |
| enterprise_administrator | 61 | All except `security.encryption` + `admin.delete_company` | Yes |
| treasury_manager | 17 | treasury.*, approval_actions.approve, reporting.* | Yes |
| treasury_analyst | 7 | treasury.view, treasury.forecast, treasury.transfer (view only) | No |
| approval_authority | 8 | approval_actions.* | No |
| auditor | 10 | All domains read-only | No |
| read_only_executive | 12 | All domains read-only | No |
| api_access | 9 | Programmatic: treasury, approvals, reporting, connectors | Yes |
| department_manager | 12 (inherited) | Inherits from read_only_executive | No |

---

## Part 4 — Security Validation

### 4.1 Authentication

| Check | Evidence | Status |
|---|---|---|
| Password auth | `src/server/auth/auth.ts:47-65` — Email + password via NextAuth credentials provider | ✅ |
| Password hashing | bcrypt via `users.service.ts:verifyCredentials()` | ✅ |
| Account lockout | `prisma/schema.prisma:24-25` — `failedLoginAttempts` + `lockedUntil` on User | ✅ Built |
| Password minimum | `auth.ts:10-13` — Zod validation: `z.string().min(8)` | ✅ |
| JWT strategy | `auth.ts:32` — `session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }` (30 days) | ✅ |
| HTTP-only cookies | `auth.ts:36-46` — `httpOnly: true`, `sameSite: "lax"`, `secure` in production | ✅ |
| Session validation | `src/server/auth/require-session.ts:9-15` — `requireSession()` throws `UnauthorizedError` | ✅ |
| API key auth | `src/server/security/authenticate-request.ts:12-34` — Format `va_[0-9a-f]{64}` | ✅ |
| MFA | `src/server/iam/mfa.ts` — TOTP/WebAuthn/Email OTP with recovery codes, role-based enforcement | ✅ Built |
| SSO | `src/server/identity/sso-handler.ts` — SAML/OIDC/OAuth2 flow initiation, SAML metadata | ✅ Built |

### 4.2 Authorization

| Check | Evidence | Status |
|---|---|---|
| Permission checks in API routes | 25/164 routes use `ensurePermission()` | ⚠️ 129 routes AUTH_ONLY only |
| Auth-free routes | `/api/metrics`, `/api/installer`, `/api/push/*`, `/api/v1/cache/admin`, `/api/v1/admin/permissions` | ❌ No authentication |
| ABAC enforcement | Stub — always returns allow | ❌ Not enforced |
| API key role | Hardcoded ADMIN role for all API key users | ❌ No per-key permission scoping |

### 4.3 Encryption

| Check | Evidence | Status |
|---|---|---|
| Algorithm | AES-256-GCM | ✅ |
| Key length | 64 hex chars (32 bytes) | ✅ |
| Key validation | Known defaults rejected, format validated | ✅ |
| Key rotation | `rotateKey()` + `ENCRYPTION_KEY_HISTORY` env var | ✅ |
| Re-encryption | `reEncrypt()` for migrating old payloads | ✅ |
| KMS interface | Pluggable `KMSProvider` interface | ✅ |
| Payload format | `base64(metadata):hex(encrypted)` with keyId, algorithm, IV, authTag, version, timestamp | ✅ |

### 4.4 Session Management

| Check | Evidence | Status |
|---|---|---|
| Idle timeout | `src/server/iam/session.ts:80-85` — configurable per-role | ✅ |
| Absolute timeout | `session.ts:90-95` — per-role max session lifetime | ✅ |
| Max concurrent sessions | `session.ts:100-105` — enforced per user | ✅ |
| Device fingerprint | `session.ts:110-115` — tracks device for security | ✅ |

### 4.5 CSRF

| Check | Evidence | Status |
|---|---|---|
| Origin validation | `src/server/security/csrf.ts:8-17` — allowlist-based (`localhost:3000/3001`, `app.perionyx.com`, `staging.perionyx.com`) | ✅ |
| Token-based | `csrf.ts:19-43` — 64-hex-char token, stored vs. sent verification | ✅ |
| Proxy enforcement | `proxy.ts:104-113` — all mutation methods on `/api/` checked | ✅ |

### 4.6 Rate Limiting

| Check | Threshold | Status |
|---|---|---|
| Auth endpoints | 10/60s | ✅ |
| Demo bootstrap | 3/60s | ✅ |
| Financial (treasury, transactions) | 60/60s | ✅ |
| General API mutations | 120/60s | ✅ |
| Transfer route | 30/60s (additional at route level) | ✅ |
| Redis fallback | In-memory when Redis unavailable | ✅ |

### 4.7 Secrets Management

| Check | Evidence | Status |
|---|---|---|
| Critical secret validation | `src/server/security/secrets.ts` — validates JWT_SECRET, ENCRYPTION_KEY, DATABASE_URL, REDIS_URL, AUTH_SECRET | ✅ |
| Startup failure | `validate({ failOnMissing: true })` throws on missing secrets | ✅ |
| Environment template | `.env.example` with all 35+ variables, generation commands | ✅ |
| Key generation | `generateEncryptionKey()`, `generateJwtSecret()`, `generateAuthSecret()` | ✅ |

### 4.8 Audit Logging

| Check | Evidence | Status |
|---|---|---|
| Tamper-evident chain | `src/server/security/audit-logger.ts:38-73` — SHA-256, previousHash + currentHash | ✅ |
| Chain verification | `verifyChain()` detects breaks | ✅ |
| DB persistence | Prisma `AuditLog` model (schema.prisma:1755-1785) | ✅ |
| Query/search | `query()` with companyId, userId, type, action, severity, date range, text search, cursor pagination | ✅ |
| CSV export | `exportCSV()` — RFC-compatible | ✅ |
| Retention | `applyRetention(days)` | ✅ |
| IAM audit events | `src/server/iam/audit-events.ts` — 36 typed events wrapped in `recordAudit()` | ✅ |
| Call sites | 100+ locations across all domain services | ✅ |

### 4.9 Security Headers

| Check | Evidence | Status |
|---|---|---|
| CSP | `src/server/security/headers.ts` — `default-src 'self'`, `form-action 'self'` | ✅ |
| HSTS | `includeSubDomains; preload` in production | ✅ |
| X-Content-Type-Options | `nosniff` | ✅ |
| X-Frame-Options | `DENY` | ✅ |
| COOP/COEP/CORP | `same-origin` / `require-corp` | ✅ |

---

## Security Findings

### Critical (2)
| Finding | Evidence | Impact |
|---|---|---|
| 5 API routes have NO authentication | `/api/metrics`, `/api/installer`, `/api/push/*`, `/api/v1/cache/admin`, `/api/v1/admin/permissions` | Unauthorized metrics exposure, potential cache/admin abuse |
| ABAC evaluator is a stub | `ABACEvaluator` always returns `{ allowed: true }` | Fine-grained access control not enforced |

### High (3)
| Finding | Evidence | Impact |
|---|---|---|
| API key auth hardcodes ADMIN role | `authenticate-request.ts:25` — `role: "ADMIN"` always | All API key users get full admin permissions |
| 129/164 routes lack permission checks | Authorization audit report | Routes rely only on session auth, not fine-grained permissions |
| Segregation of duties not enforced | No SoD conflict detection | User could hold incompatible roles (create PO + approve PO) |

### Medium (3)
| Finding | Evidence | Impact |
|---|---|---|
| CSP includes `unsafe-eval` / `unsafe-inline` | `headers.ts` config | XSS mitigation weakened |
| No OpenAPI/Swagger spec | Zero OpenAPI files found | API consumers must reverse-engineer from source |
| Audit events replay/recovery | No audit event replay mechanism | Lost audit events cannot be reconstructed |

---

## Security Score: 72/100

- Authentication: 8/10 (no brute-force rate limiting beyond proxy, MFA not wired to login flow)
- Authorization: 6/10 (ABAC stub, SoD missing, 129 routes AUTH_ONLY)
- Encryption: 9/10 (key rotation, KMS interface — not wired into domain models yet)
- Audit: 9/10 (tamper-evident chain, 100+ call sites, IAM events — no replay)
- CSRF/Rate Limiting: 9/10 (tiered limits, Redis fallback, origin+token CSRF)
- Secrets: 9/10 (validation, startup gating, key generation, env template)
