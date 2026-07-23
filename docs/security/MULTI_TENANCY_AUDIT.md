# Multi-Tenancy Security Audit

**Audit Date:** 2026-07-20
**Scope:** Tenant isolation across workflow engine, persistence layer, webhooks, sync jobs, caching, and queues
**Total Findings:** 9 (2 Critical, 3 High, 3 Medium, 1 Low)

## Executive Summary

The workflow engine queries steps without a `companyId` filter, and the persistence service permits cross-tenant reads on automation resources. Webhooks and sync scheduling both lack tenant-scoped delivery/mutation checks. These gaps allow any tenant to access, modify, or receive data belonging to other tenants.

## Findings

| Severity | ID | Title | File | Exploitability |
|----------|-----|-------|------|----------------|
| CRITICAL | MT-001 | Workflow engine steps query without companyId | `engine.ts:399-407,424-425` | Cross-tenant read of arbitrary workflow data |
| CRITICAL | MT-002 | Persistence service cross-tenant read | Persistence service | Any tenant can query automation resources from other tenants |
| HIGH | MT-003 | Cross-tenant webhook delivery | Webhook service | Webhooks deliver events to URLs registered by other tenants |
| HIGH | MT-004 | Cross-tenant sync scheduling mutation | Sync API | Modify sync schedules of other tenants |
| HIGH | MT-005 | FX sync job missing companyId | FX sync handler | FX sync processes without tenant boundary |
| MEDIUM | MT-006 | Cache keys lack tenant isolation | Cache layer | Cache hits serve wrong tenant's data |
| MEDIUM | MT-007 | Job payloads store companyId but cancel doesn't verify | Queue cancel | Cancel a job belonging to another tenant |
| MEDIUM | MT-008 | Notification delivery lacks tenant check | Notification service | Notifications delivered to wrong tenant's channels |
| LOW | MT-009 | No row-level security at database level | Database schema | All tenant isolation is application-level only |

## Key Remediation Actions

1. **MT-001**: Add `WHERE companyId = :companyId` to all workflow step queries in `engine.ts:399-407,424-425`; parameterize via query builder
2. **MT-002**: Implement `requireTenantContext()` guard on all persistence service methods; reject queries without tenant scope
3. **MT-003**: Verify webhook destination URL's tenant ownership before delivery; reject cross-tenant delivery with 403
4. **MT-005**: Add `companyId` filter to FX sync job query; validate against authenticated user's tenant
5. **MT-006**: Prefix all cache keys with `tenant:{companyId}:` namespace; flush cache on tenant context switch
