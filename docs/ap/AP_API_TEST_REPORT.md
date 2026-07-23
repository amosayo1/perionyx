# Phase 21A.3 — AP API Test Report

> **Status**: Complete
> **Type**: Documentation-only — test plan, categories, and verification status
> **Date**: July 22, 2026
> **Scope**: Test coverage for all 65 AP API endpoints
> **Depends on**: AP_API_ARCHITECTURE.md, AP_ENDPOINT_CATALOG.md, AP_API_SECURITY.md
> **Test file**: `src/__tests__/procurement/ap-api.test.ts`

---

## 1. Test Overview

### Test Categories

| # | Category | Tests | Scope |
|---|---|---|---|
| 1 | Authentication | 8 | JWT validation, API key, MFA, token expiry |
| 2 | Authorization | 37 | Permission checks for all 37 AP permissions |
| 3 | Validation | 20 | Zod schema tests for request body parsing |
| 4 | Idempotency | 15 | Mutation replay detection and deduplication |
| 5 | Tenant Isolation | 7 | Cross-tenant access rejection |
| 6 | Concurrency | 3 | Optimistic locking on version conflicts |
| 7 | Error Handling | 10 | Enterprise error contract compliance |
| 8 | Pagination | 5 | List endpoint pagination behavior |
| 9 | Rate Limiting | 3 | Throttle enforcement and response headers |
| **Total** | | **108** | |

### Current Status

| Metric | Value |
|---|---|
| Route compilation | ✓ Zero TypeScript errors |
| Production build | ✓ Passes |
| Zod schemas | ✓ Defined in `src/lib/validations/procurement.ts` |
| Route handlers | ✓ 65 route files created |
| Application services | ✓ 7 services, 51 commands (Phase 21A.2) |
| Integration tests | Planned — `src/__tests__/procurement/ap-api.test.ts` |

### Verification Approach

Phase 21A.3 focused on route file creation and TypeScript compilation. The test plan below specifies what needs to be verified in the integration test suite. Current verification:

1. **TypeScript compilation** — all 65 route files compile without errors (`pnpm typecheck` ✓)
2. **Production build** — all routes are included in the production build (`pnpm build` ✓)
3. **Schema validation** — Zod schemas are defined and importable (`src/lib/validations/procurement.ts`)
4. **Service integration** — route handlers import from `@/server/procurement/application` barrel

---

## 2. Authentication Tests (8)

| # | Test | Input | Expected | Notes |
|---|---|---|---|---|
| AUTH-01 | No token | GET `/vendors` (no Cookie, no API key) | 401 `UNAUTHORIZED` | |
| AUTH-02 | Expired JWT | Cookie with expired token | 401 `TOKEN_EXPIRED` | |
| AUTH-03 | Invalid JWT signature | Cookie with tampered token | 401 `UNAUTHORIZED` | |
| AUTH-04 | Valid session JWT | Cookie with valid token | 200 with response data | |
| AUTH-05 | Valid API key | `Authorization: Bearer va_...` | 200 with response data | |
| AUTH-06 | Invalid API key format | `Authorization: Bearer invalid` | 401 `INVALID_API_KEY` | Regex: `va_[0-9a-f]{64}` |
| AUTH-07 | Revoked API key | Valid format, revoked in DB | 401 `INVALID_API_KEY` | |
| AUTH-08 | MFA required without MFA | POST `/invoices/{id}/approve` (no `mfaVerified` claim) | 403 `MFA_REQUIRED` | |

---

## 3. Authorization Tests (37)

One test per unique AP permission. Each test verifies that:
- **Positive**: User with the permission can access the endpoint
- **Negative**: User without the permission gets 403 `FORBIDDEN`

| # | Permission | Endpoint Tested | Positive Role | Negative Role |
|---|---|---|---|---|
| AUTHZ-01 | `ap.vendors.create` | POST `/vendors` | ap_clerk | auditor |
| AUTHZ-02 | `ap.vendors.update` | PUT `/vendors/{id}` | ap_clerk | auditor |
| AUTHZ-03 | `ap.vendors.approve` | POST `/vendors/{id}/approve` | ap_manager | ap_clerk |
| AUTHZ-04 | `ap.vendors.reject` | POST `/vendors/{id}/reject` | ap_manager | ap_clerk |
| AUTHZ-05 | `ap.vendors.suspend` | POST `/vendors/{id}/suspend` | ap_manager | ap_clerk |
| AUTHZ-06 | `ap.vendors.reactivate` | POST `/vendors/{id}/reactivate` | ap_manager | ap_clerk |
| AUTHZ-07 | `ap.vendors.deactivate` | POST `/vendors/{id}/deactivate` | controller | ap_manager |
| AUTHZ-08 | `ap.vendors.update_bank` | PUT `/vendors/{id}/bank-details` | ap_manager | ap_clerk |
| AUTHZ-09 | `ap.invoices.create` | POST `/invoices` | ap_clerk | auditor |
| AUTHZ-10 | `ap.invoices.update` | PUT `/invoices/{id}` | ap_clerk | auditor |
| AUTHZ-11 | `ap.invoices.delete` | POST `/invoices/{id}/void` | ap_manager | ap_clerk |
| AUTHZ-12 | `ap.invoices.validate` | POST `/invoices/{id}/validate` | ap_clerk | auditor |
| AUTHZ-13 | `ap.invoices.approve` | POST `/invoices/{id}/approve` | ap_manager | ap_clerk |
| AUTHZ-14 | `ap.invoices.reject` | POST `/invoices/{id}/reject` | ap_manager | ap_clerk |
| AUTHZ-15 | `ap.invoices.escalate` | POST `/invoices/{id}/escalate` | ap_manager | ap_clerk |
| AUTHZ-16 | `ap.invoices.schedule_payment` | POST `/invoices/{id}/schedule-payment` | ap_manager | ap_clerk |
| AUTHZ-17 | `ap.invoices.block` | POST `/invoices/{id}/block` | ap_manager | ap_clerk |
| AUTHZ-18 | `ap.invoices.unblock` | POST `/invoices/{id}/unblock` | ap_manager | ap_clerk |
| AUTHZ-19 | `ap.invoices.dispute` | POST `/invoices/{id}/dispute` | ap_clerk | auditor |
| AUTHZ-20 | `ap.invoices.dispute_resolve` | POST `/invoices/{id}/resolve-dispute` | ap_manager | ap_clerk |
| AUTHZ-21 | `ap.invoices.void` | POST `/invoices/{id}/void` | controller | ap_manager |
| AUTHZ-22 | `ap.match.execute` | POST `/invoices/{id}/match` | ap_clerk | auditor |
| AUTHZ-23 | `ap.match.override` | POST `/invoices/{id}/override` | ap_manager | ap_clerk |
| AUTHZ-24 | `ap.exceptions.create` | POST `/exceptions` | ap_clerk | auditor |
| AUTHZ-25 | `ap.exceptions.assign` | PUT `/exceptions/{id}` | ap_manager | ap_clerk |
| AUTHZ-26 | `ap.exceptions.resolve` | POST `/exceptions/{id}/resolve` | ap_manager | ap_clerk |
| AUTHZ-27 | `ap.exceptions.escalate` | POST `/exceptions/{id}/escalate` | ap_clerk | auditor |
| AUTHZ-28 | `ap.exceptions.auto_resolve` | (System only) | system | ap_manager |
| AUTHZ-29 | `ap.exceptions.bulk_resolve` | POST `/exceptions/bulk-resolve` | ap_manager | ap_clerk |
| AUTHZ-30 | `ap.approvals.view` | GET `/approvals` | ap_clerk | — (authenticated) |
| AUTHZ-31 | `ap.approvals.approve` | POST `/approvals/{id}/approve` | ap_manager | ap_clerk |
| AUTHZ-32 | `ap.approvals.reject` | POST `/approvals/{id}/reject` | ap_manager | ap_clerk |
| AUTHZ-33 | `ap.approvals.delegate` | POST `/approvals/{id}/delegate` | ap_manager | ap_clerk |
| AUTHZ-34 | `ap.approvals.escalate` | POST `/approvals/{id}/escalate` | ap_manager | ap_clerk |
| AUTHZ-35 | `ap.approvals.recall` | POST `/approvals/{id}/recall` | ap_manager | ap_clerk |
| AUTHZ-36 | `ap.payments.read` | GET `/payments/proposals` | ap_clerk | — (authenticated) |
| AUTHZ-37 | `ap.payments.execute_batch` | POST `/payments/batches/{id}/execute` | controller | ap_manager |

---

## 4. Validation Tests (20)

| # | Test | Input | Expected | Notes |
|---|---|---|---|---|
| VAL-01 | Missing required field | POST `/vendors` with `{}` | 400 `VALIDATION_ERROR` | `name` required |
| VAL-02 | Invalid UUID format | GET `/vendors/not-a-uuid` | 400 `VALIDATION_ERROR` | Path param validation |
| VAL-03 | Invalid email format | POST `/vendors` with `email: "not-an-email"` | 400 `VALIDATION_ERROR` | |
| VAL-04 | Negative amount | POST `/invoices` with `unitPrice: -100` | 400 `VALIDATION_ERROR` | `unitPrice ≥ 0` |
| VAL-05 | Date before invoice date | POST `/invoices` with `dueDate < invoiceDate` | 400 `VALIDATION_ERROR` | |
| VAL-06 | Empty line items array | POST `/invoices` with `lineItems: []` | 400 `VALIDATION_ERROR` | `lineItems.length ≥ 1` |
| VAL-07 | Page < 1 | GET `/vendors?page=0` | 400 `VALIDATION_ERROR` | `page ≥ 1` |
| VAL-08 | Limit > 200 | GET `/vendors?limit=500` | Capped to 200 | Not an error; silently capped |
| VAL-09 | Invalid sort field | GET `/vendors?sort=unknown_field` | 400 `VALIDATION_ERROR` | Whitelist enforced |
| VAL-10 | Invalid Idempotency-Key | POST `/invoices` with `Idempotency-Key: "not-uuid"` | 400 `VALIDATION_ERROR` | UUID format required |
| VAL-11 | Body > 1 MB | POST `/invoices` with 1.1 MB body | 413 `PAYLOAD_TOO_LARGE` | Proxy-level check |
| VAL-12 | Missing Content-Type | POST `/vendors` without Content-Type header | 400 or auto-detected | Next.js behavior |
| VAL-13 | Invalid currency code | POST `/invoices` with `currency: "INVALID"` | 400 `VALIDATION_ERROR` | ISO 4217 format |
| VAL-14 | String too long | POST `/vendors` with `name` > 200 chars | 400 `VALIDATION_ERROR` | Max length enforced |
| VAL-15 | String too short | POST `/vendors/{id}/deactivate` with `reason` < 10 chars | 400 `VALIDATION_ERROR` | Min length enforced |
| VAL-16 | Invalid enum value | POST `/vendors` with `category: "invalid"` | 400 `VALIDATION_ERROR` | Enum whitelist |
| VAL-17 | Null required field | POST `/invoices` with `vendorId: null` | 400 `VALIDATION_ERROR` | |
| VAL-18 | Wrong type | POST `/invoices` with `invoiceDate: "not-a-date"` | 400 `VALIDATION_ERROR` | |
| VAL-19 | Unexpected extra field | POST `/vendors` with `unknownField: "value"` | Stripped by Zod | Not an error; extra fields removed |
| VAL-20 | Valid full request | POST `/vendors` with all valid fields | 201 with created vendor | Happy path validation |

---

## 5. Idempotency Tests (15)

| # | Test | Scenario | Expected | Notes |
|---|---|---|---|---|
| IDEM-01 | First request with key | POST `/vendors/{id}/approve` with unique key | 200, key stored | |
| IDEM-02 | Replay within TTL | Same key, same company, within 24h | 200, `x-idempotent-replay: true` | Same response as IDEM-01 |
| IDEM-03 | Different company, same key | Different companyId, same Idempotency-Key | 200 (new execution) | Key is company-scoped |
| IDEM-04 | No key header | POST without `Idempotency-Key` | 200 (no deduplication) | |
| IDEM-05 | Create is not idempotent | POST `/vendors` with duplicate key | 200 (new vendor created) | Creates are not deduped |
| IDEM-06 | Invoice create with same number | POST `/invoices` with duplicate `(companyId, vendorId, invoiceNumber)` | 409 `DUPLICATE_INVOICE` | DB constraint, not idempotency |
| IDEM-07 | Payment batch execute | POST `/payments/batches/{id}/execute` with key | Idempotent (financial) | |
| IDEM-08 | Approval chain approve | POST `/approvals/{id}/approve` with key | Idempotent | |
| IDEM-09 | Resolve exception | POST `/exceptions/{id}/resolve` with key | Idempotent | |
| IDEM-10 | Apply credit | POST `/credits/{id}/apply` with key | Idempotent | |
| IDEM-11 | Void invoice | POST `/invoices/{id}/void` with key | Idempotent | |
| IDEM-12 | Key format validation | `Idempotency-Key: "not-a-uuid"` | 400 `VALIDATION_ERROR` | UUID format required |
| IDEM-13 | Multiple replays | Same key, 3 consecutive requests | All return same response | |
| IDEM-14 | Concurrent replays | Two requests with same key simultaneously | One executes, one gets cached result | Race condition handling |
| IDEM-15 | Response header check | Any idempotent replay | `x-idempotent-replay: true` header present | |

---

## 6. Tenant Isolation Tests (7)

| # | Test | Scenario | Expected | Notes |
|---|---|---|---|---|
| TENANT-01 | Read cross-tenant entity | GET `/invoices/{other-company-invoice-id}` | 404 `INVOICE_NOT_FOUND` | |
| TENANT-02 | Update cross-tenant entity | PUT `/vendors/{other-company-vendor-id}` | 404 `VENDOR_NOT_FOUND` | |
| TENANT-03 | Approve cross-tenant invoice | POST `/invoices/{other-company-id}/approve` | 404 `INVOICE_NOT_FOUND` | |
| TENANT-04 | Execute cross-tenant batch | POST `/payments/batches/{other-company-id}/execute` | 404 `PAYMENT_NOT_FOUND` | |
| TENANT-05 | List with tenant filter | GET `/vendors` (company A user) | Only company A vendors | No cross-tenant leakage |
| TENANT-06 | companyId in body ignored | POST `/vendors` with `companyId: "other"` in body | Uses JWT companyId | Body value ignored |
| TENANT-07 | Report scoped to tenant | GET `/reports/aging` (company A user) | Only company A data | |

---

## 7. Concurrency Tests (3)

| # | Test | Scenario | Expected | Notes |
|---|---|---|---|---|
| CONC-01 | Version conflict on update | Two PUT `/vendors/{id}` with stale version | First succeeds, second gets 409 `VERSION_CONFLICT` | |
| CONC-02 | Version increment | PUT `/vendors/{id}` succeeds | Response includes incremented version | `version: N → N+1` |
| CONC-03 | Optimistic lock on approve | POST `/invoices/{id}/approve` on concurrently modified invoice | 409 `VERSION_CONFLICT` if version changed | |

---

## 8. Error Handling Tests (10)

| # | Test | Scenario | Expected | Notes |
|---|---|---|---|---|
| ERR-01 | Error contract structure | Any 4xx response | `{ error: { code, message, category, correlationId, recoverable, userMessage } }` | 6-field contract |
| ERR-02 | Correlation ID in error | Any error response | `x-correlation-id` header matches `error.correlationId` | |
| ERR-03 | No stack trace | Any 500 error | Response has no stack trace or internal path | |
| ERR-04 | No DB details | Prisma error | Response says `INTERNAL_ERROR`, not table/column names | |
| ERR-05 | 404 for missing entity | GET `/vendors/nonexistent-id` | 404 `VENDOR_NOT_FOUND` | |
| ERR-06 | 409 for duplicate | POST `/vendors` with existing taxId | 409 `DUPLICATE_VENDOR` | |
| ERR-07 | 422 for business rule | POST `/invoices/{id}/void` on paid invoice | 422 `INVOICE_NOT_VOIDABLE` | |
| ERR-08 | 413 for oversized body | POST with 2 MB body | 413 `PAYLOAD_TOO_LARGE` | |
| ERR-09 | 429 for rate limit | 121 GET requests in 1 minute from same IP | 429 `TOO_MANY_REQUESTS` | |
| ERR-10 | User message present | Any 4xx response | `error.userMessage` is human-readable | |

---

## 9. Pagination Tests (5)

| # | Test | Scenario | Expected | Notes |
|---|---|---|---|---|
| PAGE-01 | Default pagination | GET `/vendors` (no params) | `page: 1, limit: 25` defaults | |
| PAGE-02 | Custom page/limit | GET `/vendors?page=2&limit=10` | 10 items, offset 10 | |
| PAGE-03 | Total count | GET `/vendors` with 47 vendors | `pagination.total: 47, totalPages: 5` | |
| PAGE-04 | Empty page | GET `/vendors?page=100` | `{ data: [], pagination: { total: 47, page: 100 } }` | |
| PAGE-05 | Limit cap | GET `/vendors?limit=500` | Capped to 200 | Not an error |

---

## 10. Rate Limiting Tests (3)

| # | Test | Scenario | Expected | Notes |
|---|---|---|---|---|
| RL-01 | General tier | 121 GET requests in 60s from same IP | 120 succeed, 1 gets 429 | |
| RL-02 | Financial tier | 61 POST requests to `/invoices` in 60s | 60 succeed, 1 gets 429 | |
| RL-03 | Response headers | Any successful request | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` present | |

---

## 11. Test File Location

```
src/__tests__/procurement/
  └── ap-api.test.ts
        ├── describe("Authentication")          — 8 tests
        ├── describe("Authorization")           — 37 tests
        ├── describe("Validation")              — 20 tests
        ├── describe("Idempotency")             — 15 tests
        ├── describe("Tenant Isolation")        — 7 tests
        ├── describe("Concurrency")             — 3 tests
        ├── describe("Error Handling")          — 10 tests
        ├── describe("Pagination")              — 5 tests
        └── describe("Rate Limiting")           — 3 tests
```

### Test Utilities

| Utility | Purpose |
|---|---|
| `createTestUser(roles, companyId)` | Creates authenticated user with specified roles |
| `createTestVendor(companyId)` | Creates a vendor for use in tests |
| `createTestInvoice(companyId, vendorId)` | Creates an invoice for use in tests |
| `makeRequest(method, path, body, headers)` | Makes authenticated API request |
| `assertError(response, code, category)` | Asserts error contract structure |
| `assertPagination(response, total, page, limit)` | Asserts pagination structure |

---

## 12. Verification Checklist

| Check | Status | Notes |
|---|---|---|
| `pnpm typecheck` passes | ✓ | Zero TypeScript errors across 65 route files |
| `pnpm build` passes | ✓ | Production build includes all routes |
| Zod schemas defined | ✓ | `src/lib/validations/procurement.ts` |
| Application services imported | ✓ | Routes import from `@/server/procurement/application` |
| Error handler used | ✓ | Routes use `handleRouteError()` from `src/server/http/handle-route.ts` |
| apAuth() used | ✓ | All routes extract companyId from JWT |
| Permission checks | ✓ | All routes call `requirePermission()` |
| Correlation ID propagated | ✓ | Routes pass correlationId to service calls |
| Cache headers set | ✓ | GET routes set `Cache-Control: private, max-age=30` |
| Audit records generated | ✓ | Services emit audit entries via CommandResult |

---

## 13. Recommendations for Next Phase

1. **Write integration tests** — implement the 108 planned tests in `src/__tests__/procurement/ap-api.test.ts`
2. **Wire report endpoints** — replace 501 placeholders with real domain service calls (Phase 21C)
3. **Add OpenAPI spec** — generate from Zod schemas for API documentation
4. **Load testing** — validate rate limiting and pagination under concurrent load
5. **Security scan** — run OWASP ZAP or similar against the AP endpoints

---

*Document generated as part of Phase 21A.3 — AP Enterprise API Layer.*
