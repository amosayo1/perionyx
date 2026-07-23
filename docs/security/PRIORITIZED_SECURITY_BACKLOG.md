# Prioritized Security Backlog

**Phase**: 17.0 — Security Findings Validation
**Date**: 2026-07-20
**Purpose**: Deduplicated, ranked remediation list for all validated Critical and High findings.

---

## Prioritization Criteria

| Factor | Weight | Description |
|--------|--------|-------------|
| Exploitability | 30% | How easy is it to exploit? (Network-accessible, no auth required = highest) |
| Impact | 30% | What's the blast radius? (All tenants, financial data = highest) |
| Effort | 20% | How complex is the fix? (Config change < code change < architecture change) |
| Risk reduction | 20% | How much does this fix reduce overall risk? |

---

## P0 — Fix Immediately (Week 1)

These are exploitable right now with minimal effort and maximum blast radius.

| # | Root Cause | Severity | Effort | Files | Fix Summary |
|---|-----------|----------|--------|-------|-------------|
| 1 | **CSRF Origin Bypass** | Critical | Low | `src/server/security/csrf.ts` | Reject mutations with no Origin header. Fix broken double-submit pattern. Wire `CSRFProtection.middleware()` or rewrite `validateOrigin()`. |
| 2 | **Workflow Approval No Authz** | Critical | Low | `src/modules/workflow/engine.ts:714` | Add check: `ctx.userId` must be in `step.requiredApprovers` or `step.approvalGroups` before granting. |
| 3 | **CRM Missing Tenant Isolation** | Critical | Medium | `src/modules/crm/crm.service.ts` | Add `companyId: ctx.companyId` to every Prisma query in all 10 methods. |
| 4 | **K8s Secrets in Plaintext** | Critical | Low | `k8s/secrets/app-secrets.yaml` | Replace with sealed-secrets or external-secrets-operator reference. Add `.gitignore` for the file or use placeholder values. |
| 5 | **Session Fail-Open** | High | Medium | `src/proxy.ts:154-158` | Change to fail-closed. Add 30-second in-memory cache of recently-revoked token versions. |

**Estimated P0 effort**: 2-3 days

---

## P1 — Fix This Sprint (Week 2)

Exploitable but slightly harder, or lower blast radius.

| # | Root Cause | Severity | Effort | Files | Fix Summary |
|---|-----------|----------|--------|-------|-------------|
| 6 | **Health Endpoint Info Disclosure** | High | Low | `src/app/api/health/route.ts` | Return only `{ status: "ok" }` or `{ status: "degraded" }`. Move detailed diagnostics to `/api/admin/health` (authenticated). |
| 7 | **Plaid Webhook No-Op** | High | Medium | `src/modules/connector-platform/webhooks/plaid-webhook-handler.ts:40-47` | Implement proper Plaid webhook verification using their documented approach. |
| 8 | **Webhook Signature Broken** | High | Medium | `src/server/providers/sdk/webhook.ts:29-57` | Implement HMAC-SHA256 verification. Fix `buildWebhookHeaders()` to compute signature correctly. |
| 9 | **No Body Size Limit** | High | Low | `src/server/http/handle-route.ts:40-46` | Add `Content-Length` check before `request.json()`. Max 1MB for API, 100KB for mutations. |
| 10 | **SSRF on Webhook URLs** | High | Medium | `src/modules/webhooks/webhooks.service.ts:27` | Validate URL scheme (https only). Block RFC 1918 / loopback / link-local / cloud metadata IPs. |
| 11 | **In-Memory Rate Limiter** | High | Low | `src/server/security/rate-limit.ts:8-26` | Add `Map` max size (100K entries). Add periodic cleanup of expired entries. Require Redis in production. |
| 12 | **Demo Credentials Hardcoded** | High | Low | `src/app/api/demo/bootstrap/route.ts:15-16` | Generate random password on bootstrap. Return credentials in response only. Don't store in code. |
| 13 | **Sandbox Credentials Hardcoded** | High | Low | `src/modules/sandbox/sandbox-context.ts:23-24` | Generate random password. Remove exported constants. |
| 14 | **Cache Headers Public** | High | Low | `src/server/http/handle-route.ts:48-53` | Change default to `private`. Audit all `cacheHeaders()` call sites — use `noCacheHeaders()` for authenticated endpoints. |

**Estimated P1 effort**: 3-4 days

---

## P2 — Fix Next Sprint (Week 3-4)

Important but requires more architecture work, or has mitigating controls.

| # | Root Cause | Severity | Effort | Files | Fix Summary |
|---|-----------|----------|--------|-------|-------------|
| 15 | **Identity Module In-Memory Auth** | Critical | High | `src/server/identity/authentication.ts` | Decision: (a) Delete module if unused, or (b) Refactor to use Prisma + bcrypt. Module appears to be development scaffold for Enterprise IAM. |
| 16 | **Identity Module In-Memory Audit** | Critical | High | `src/server/identity/audit-service.ts` | Decision: Same as #15 — delete or refactor to Prisma persistence. |
| 17 | **AI Proxy No Validation** | High | Medium | `src/app/api/automation-studio/ai/route.ts` | Add prompt injection filters, token counting, response sanitization, cost tracking. |
| 18 | **Ingress No Rate Limiting** | High | Low | `k8s/ingress/production.yaml` | Add `nginx.ingress.kubernetes.io/limit-rps: "50"` and `limit-connections: "20"`. |
| 19 | **K8s Network Policy Permissive** | High | Low | `k8s/network-policies/default.yaml` | Restrict `namespaceSelector` to only ingress controller namespace. |
| 20 | **Permission Cache 10min TTL** | High | Medium | `src/server/cache/cache-config.ts:63` | Verify if RBAC service uses this cache. If yes, reduce to 60s or implement event-driven invalidation on permission changes. |
| 21 | **vitest CVE** | High | Low | `package.json:89` | Run `pnpm audit`. Update vitest to patched version. |

**Estimated P2 effort**: 4-5 days

---

## P3 — Track and Schedule (Month 2+)

Requires architectural decisions or is low-priority relative to effort.

| # | Root Cause | Severity | Effort | Files | Fix Summary |
|---|-----------|----------|--------|-------|-------------|
| 22 | **Docker Compose Port Exposure** | High | Low | `docker-compose.yml` | Add `profiles: [dev]` to postgres/redis services. Document that production should use K8s. |
| 23 | **Webhook Optional Signature** | High | Low | `src/modules/webhooks/webhooks.service.ts` | Make `secret` required on webhook creation. Add warning UI when creating webhook without secret. |
| 24 | **Ingress No Rate Limiting (DDoS)** | High | High | Architecture | Consider CloudFlare/AWS WAF for L3/L4 DDoS protection. Nginx rate limiting is L7 only. |

**Estimated P3 effort**: 2-3 days + infrastructure decisions

---

## Remediation Tracking

| Priority | Items | Status | Target |
|----------|-------|--------|--------|
| P0 | 5 | Not started | Week 1 |
| P1 | 9 | Not started | Week 2 |
| P2 | 7 | Not started | Week 3-4 |
| P3 | 3 | Not started | Month 2+ |
| **Total** | **24** | | |

---

## Medium & Low Findings (For Reference)

The 107 Medium and 62 Low findings are tracked in the original audit documents. Key categories:

| Category | Medium | Low | Notes |
|----------|--------|-----|-------|
| Input Validation | 18 | 5 | Missing Zod on admin routes, XSS via dangerouslySetInnerHTML (none found), etc. |
| Information Disclosure | 12 | 8 | Verbose errors, stack traces in dev mode, debug headers |
| Authentication | 8 | 5 | No MFA (Enterprise IAM), weak password policy (Enterprise IAM), session fixation |
| Authorization | 10 | 4 | Missing RBAC on some endpoints, role escalation paths |
| Cryptography | 6 | 3 | Weak key derivation, missing encryption on some fields |
| Configuration | 15 | 12 | Debug mode in production, verbose logging, CORS misconfiguration |
| Infrastructure | 18 | 15 | Docker security, K8s pod security, missing network segmentation |
| Dependencies | 12 | 8 | Outdated packages, known CVEs in dev dependencies |
| Compliance | 8 | 2 | GDPR data retention, SOC 2 audit trail gaps |

These should be addressed in the P2-P3 timeframe or as part of regular maintenance.

---

## Appendix: CVSS Scores (Estimated)

| # | Root Cause | CVSS | Vector |
|---|-----------|------|--------|
| 1 | CSRF Origin Bypass | 9.1 | AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N |
| 2 | Workflow Approval No Authz | 9.8 | AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H |
| 3 | CRM Missing Tenant Isolation | 9.1 | AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N |
| 4 | K8s Secrets in Plaintext | 9.0 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N |
| 5 | Session Fail-Open | 7.2 | AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N |
| 6 | Health Endpoint Info Disclosure | 7.5 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N |
| 7 | Plaid Webhook No-Op | 7.5 | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N |
| 8 | Webhook Signature Broken | 7.5 | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N |
| 9 | No Body Size Limit | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H |
| 10 | SSRF on Webhook URLs | 7.2 | AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:N/A:N |
| 11 | In-Memory Rate Limiter | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H |
| 12 | Demo Credentials Hardcoded | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N |
| 13 | Sandbox Credentials Hardcoded | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N |
| 14 | Cache Headers Public | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N |
| 15 | Identity In-Memory Auth | 9.1 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N |
| 16 | Identity In-Memory Audit | 8.6 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N |
| 17 | AI Proxy No Validation | 7.2 | AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N |
| 18 | Ingress No Rate Limiting | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H |
| 19 | K8s Network Policy Permissive | 7.5 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N |
| 20 | Permission Cache 10min | 7.2 | AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N |
| 21 | vitest CVE | 7.2 | AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N |
| 22 | Docker Port Exposure | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N |
| 23 | Webhook Optional Signature | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N |
| 24 | Ingress No Rate Limiting | 7.2 | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H |
