# Authorization Security Audit

**Audit Date:** 2026-07-20
**Scope:** RBAC enforcement, permission checks, API key authorization, role validation
**Total Findings:** 14 (3 Critical, 3 High, 5 Medium, 3 Low)

## Executive Summary

The CRM module has a complete absence of tenant isolation, and wallet/policy mutation routes lack any RBAC enforcement. API keys are hardcoded to ADMIN role, and the Owner role bypasses all permission checks entirely. These findings expose the platform to cross-tenant data access, unauthorized financial mutations, and privilege escalation.

## Findings

| Severity | ID | Title | File | Exploitability |
|----------|-----|-------|------|----------------|
| CRITICAL | AUTHZ-001 | CRM module — no tenant isolation | `crm.service.ts:145-239,244-248` | Cross-tenant read/write of CRM data |
| CRITICAL | AUTHZ-002 | Wallet mutation routes missing RBAC | `src/app/api/v1/wallets/` | Any authenticated user can create/update/delete wallets |
| CRITICAL | AUTHZ-003 | Policy mutation routes missing RBAC | `src/app/api/v1/policies/` | Unauthorized policy creation/modification |
| HIGH | AUTHZ-004 | API keys hardcoded to ADMIN role | `require-permission.ts:23,50` | API keys bypass least-privilege; every key is admin |
| HIGH | AUTHZ-005 | Owner role bypasses all permission checks | `rbac.service.ts:191` | Owner tenant members have unrestricted access |
| HIGH | AUTHZ-006 | Approval thread uses `as any` cast for role | Approval service | Role checking bypassed through type coercion |
| MEDIUM | AUTHZ-007 | No proxy-level authorization enforcement | `src/proxy.ts` | All authz relies on per-route checks; proxy only validates JWT |
| MEDIUM | AUTHZ-008 | Coarse workflow permissions | Orchestration permissions | Granular read/write per workflow type missing |
| MEDIUM | AUTHZ-009 | Queue cancel endpoint missing RBAC | Queue API | Any authenticated user can cancel any job |
| MEDIUM | AUTHZ-010 | Report export permission not validated | Export endpoint | Exported data access not checked against user permissions |
| MEDIUM | AUTHZ-011 | No resource-level permissions | Authorization model | Only route-level, not row-level, authorization |
| LOW | AUTHZ-012 | Integration audit captures no IP address | Audit logging | Cannot attribute authorization events to source |
| LOW | AUTHZ-013 | No authorization for webhook replay | Webhook admin | Replay webhook events without permission check |
| LOW | AUTHZ-014 | No authz on sandbox reset | Sandbox API | Unauthorized destruction of sandbox data |

## Key Remediation Actions

1. **AUTHZ-001**: Add `companyId` tenant filter to all CRM queries in `crm.service.ts`; validate user's tenant matches record tenant on mutations
2. **AUTHZ-002**: Apply `requirePermission('treasury:wallet:write')` to all wallet POST/PUT/DELETE routes in `src/app/api/v1/wallets/`
3. **AUTHZ-003**: Apply `requirePermission('governance:policy:write')` to all policy mutation routes in `src/app/api/v1/policies/`
4. **AUTHZ-005**: Remove Owner bypass in `rbac.service.ts:191`; apply explicit permission checks to all Owner operations
5. **AUTHZ-004**: Replace hardcoded ADMIN role with configurable role mapping; enforce minimum-scope API key permissions
