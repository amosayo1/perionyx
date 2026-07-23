# Resource Disclosure Policy

**Phase**: 17.1 — P0 Security Remediation
**Date**: 2026-07-20
**Purpose**: Define how Perionyx handles error messages to prevent information disclosure about resource existence, tenant boundaries, authorization details, and internal system state.
**Status**: Policy Document — Code changes pending approval

---

## 1. Problem Statement

### 1.1 Root Cause

`handleRouteError()` in `src/server/http/handle-route.ts:9` serializes `error.message` **verbatim** to HTTP responses:

```typescript
// src/server/http/handle-route.ts:8-18
export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }
  // Non-AppError → generic message (safe)
  return NextResponse.json(
    { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } },
    { status: 500 }
  );
}
```

**Every `ForbiddenError`, `NotFoundError`, `ValidationError`, and `AppError` message is returned as-is to external clients.** This creates information disclosure across multiple attack vectors.

### 1.2 Attack Vectors

| Vector | Example Message | Information Disclosed |
|--------|----------------|----------------------|
| **Tenant enumeration** | `"Access denied: contact belongs to another organization."` | Confirms contact exists in another tenant |
| **User enumeration** | `"User not found"` vs `"Current password is incorrect"` | Distinguishes invalid email from wrong password |
| **Authorization detail** | `"You are not authorized to approve this step. Required roles: CFO, CONTROLLER. Your role: VIEWER."` | Reveals approval configuration and user's role |
| **Internal state** | `"Step "step_abc123" is not awaiting approval (current status: COMPLETED)."` | Reveals step existence and exact internal status |
| **Company ID exposure** | `"No clearing wallet found for USD in company cmabc123xyz"` | Exposes internal company ID |
| **Workflow structure** | `"User lacks approval authority for transactions of type TRANSFER with amount $50,000.00"` | Reveals transaction type and exact amount |
| **Permission granularity** | `"Missing permission: approvals.approve"` | Reveals exact permission names |

### 1.3 Scope

This policy covers:
- All `AppError` subclasses (`ForbiddenError`, `NotFoundError`, `ValidationError`, `ConflictError`, `AuthenticationError`)
- Raw `NextResponse.json()` calls in route handlers
- Error messages in `getErrorMessage()` on the client side
- Stack traces in `ErrorBoundary` components

---

## 2. OWASP Guidance

### 2.1 OWASP Top 10 (2021) — A01:2021 Broken Access Control

> "Attackers can abuse these limitations to access unauthorized functionality and data, such as other accounts, other users' sensitive files, modification of other users' data."

**Relevance**: Error messages that distinguish "not found" from "access denied" allow attackers to enumerate resources. Returning `"Access denied"` when a user lacks permission to a resource they shouldn't know exists is safer than `"Resource not found"`.

### 2.2 OWASP Authentication Cheat Sheet — Information Leakage

> "Ensure that error messages do not reveal any information about the system's internal state, user existence, or resource location."

**Relevant patterns**:
- **Login forms**: Never distinguish between "user not found" and "wrong password" → use `"Invalid credentials"`
- **Resource access**: Never distinguish between "resource not found" and "access denied" → use `"Access denied"` (even for non-existent resources)
- **API errors**: Never expose internal IDs, tenant IDs, or system architecture in error messages

### 2.3 OWASP API Security Top 10 — API2:2023 Broken Object Level Authorization (BOLA)

> "Attackers can manipulate the identifiers of resources they have access to, to gain access to other resources belonging to other users."

**Relevance**: When an API returns `"Access denied: contact belongs to another organization"`, it confirms the resource exists and belongs to a different tenant. The safe pattern is `"Access denied"` without explaining why.

### 2.4 OWASP Input Validation Cheat Sheet

> "Use generic error messages that do not disclose internal implementation details."

**Relevant patterns**:
- **Validation errors**: Return `"Invalid input"` or field-level errors (which are expected) — never expose internal state
- **Business rule violations**: Return `"Request cannot be processed"` — never expose internal rules or thresholds
- **Database errors**: Return `"Service temporarily unavailable"` — never expose table names, column names, or query details

---

## 3. Enterprise SaaS Best Practices

### 3.1 Stripe Pattern

Stripe's API error responses:
```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "resource_missing",
    "message": "No such customer: cus_xxx"
  }
}
```

**Stripe's approach**: Returns the resource type and ID for valid API keys. This works because Stripe's authentication model is per-resource (API key → specific account). Perionyx's multi-tenant model is different — a user should never learn about resources in other tenants.

### 3.2 AWS Pattern

AWS error responses:
```json
{
  "Error": {
    "Code": "AccessDeniedException",
    "Message": "User: arn:aws:iam::123456789012:user/bob is not authorized to perform: s3:GetObject on resource: arn:aws:s3:::bucket/key"
  }
}
```

**AWS's approach**: Returns detailed errors including resource ARN and user ARN. This works because AWS uses IAM policies where the user already has some level of access. Perionyx should be more restrictive — cross-tenant access should never be confirmed.

### 3.3 Azure Pattern

Azure error responses:
```json
{
  "error": {
    "code": "AuthorizationFailed",
    "message": "The client 'object-id' does not have authorization to perform action 'Microsoft.Storage/storageAccounts/read' over scope '/subscriptions/subscription-id/resourceGroups/resource-group/providers/Microsoft.Storage/storageAccounts/account-name'."
  }
}
```

**Azure's approach**: Returns detailed authorization failures. This is acceptable for single-tenant cloud environments but not for multi-tenant SaaS where users should not learn about resources they cannot access.

### 3.4 Google Cloud Pattern

Google Cloud error responses:
```json
{
  "error": {
    "code": 403,
    "message": "The caller does not have permission",
    "status": "PERMISSION_DENIED"
  }
}
```

**Google Cloud's approach**: Generic permission denied message. This is the pattern Perionyx should follow for multi-tenant resource access.

### 3.5 Industry Consensus for Multi-Tenant SaaS

| Scenario | Safe Pattern | Unsafe Pattern |
|----------|-------------|----------------|
| Resource not found | `"Access denied"` (403) | `"Resource not found"` (404) |
| Wrong password | `"Invalid credentials"` | `"Password incorrect"` or `"User not found"` |
| Cross-tenant access | `"Access denied"` | `"Resource belongs to another organization"` |
| Authorization failure | `"You do not have permission"` | `"Missing permission: approvals.approve"` |
| Workflow step status | `"Access denied"` | `"Step is not awaiting approval (current: COMPLETED)"` |
| Internal IDs | Omit entirely | `"No clearing wallet for company cmabc123xyz"` |

---

## 4. Multi-Tenant Security Considerations

### 4.1 Tenant Enumeration Prevention

**Principle**: Never confirm that a resource exists in another tenant.

**Unsafe**: `"Access denied: contact belongs to another organization."`
**Safe**: `"Access denied."`

The unsafe message confirms:
1. A contact with that ID exists (resource enumeration)
2. It belongs to a different organization (cross-tenant access possible)
3. The user has some level of access (authorization partially works)

The safe message reveals nothing about other tenants.

### 4.2 User Enumeration Prevention

**Principle**: Never distinguish between "user not found" and "wrong password" for login attempts.

**Unsafe**: `"Invalid credentials"` (could still distinguish via timing)
**Safe**: `"Invalid credentials"` with constant-time comparison

**Unsafe**: `"User not found"` vs `"Current password is incorrect"`
**Safe**: `"Invalid credentials"` for all authentication failures

### 4.3 Resource Existence Prevention

**Principle**: Return the same response for "resource doesn't exist" and "user lacks access to resource."

**Unsafe**: 404 `"User not found"` for non-existent user, 403 `"Access denied"` for existing user without access
**Safe**: 403 `"Access denied"` for both cases

This prevents attackers from using error responses to map resources.

### 4.4 Authorization Detail Prevention

**Principle**: Never reveal what permissions or roles would be required.

**Unsafe**: `"Missing permission: approvals.approve"`
**Safe**: `"You do not have permission to perform this action"`

The unsafe message reveals the exact permission name, which helps attackers:
1. Craft requests that satisfy the permission
2. Identify permission naming conventions
3. Find related permissions

### 4.5 Internal State Prevention

**Principle**: Never reveal the internal state of a resource.

**Unsafe**: `"Step is not awaiting approval (current status: COMPLETED)"`
**Safe**: `"Access denied"`

The unsafe message reveals:
1. The step exists (resource enumeration)
2. Its exact internal status (workflow state disclosure)
3. What state it should be in (authorization logic disclosure)

---

## 5. Recommended Perionyx Standard

### 5.1 Error Response Format

```typescript
// Safe error response
{
  "error": {
    "code": "FORBIDDEN",  // Use HTTP-level codes, not business codes
    "message": "Access denied."  // Generic, never reveals resource/tenant/user details
  }
}
```

### 5.2 Error Message Rules

| Rule | Description | Example |
|------|-------------|---------|
| **R1** | Never expose tenant/company IDs | ~~`"company cmabc123xyz"`~~ → `"this company"` |
| **R2** | Never expose user IDs or emails in auth errors | ~~`"User user_abc123 not found"`~~ → `"Access denied"` |
| **R3** | Never distinguish "not found" from "access denied" | ~~`"Resource not found"`~~ → `"Access denied"` |
| **R4** | Never expose required permissions/roles | ~~`"Missing permission: approvals.approve"`~~ → `"You do not have permission"` |
| **R5** | Never expose resource internal state | ~~`"Step is not awaiting approval"`~~ → `"Access denied"` |
| **R6** | Never expose transaction amounts/types in auth errors | ~~`"Authority for TRANSFER of $50,000"`~~ → `"You do not have authority"` |
| **R7** | Never expose validation internals | ~~`"No clearing wallet for USD"`~~ → `"Invalid request"` |
| **R8** | Never expose user roles in error messages | ~~`"Your role: VIEWER"`~~ → `"Access denied"` |
| **R9** | Never expose workflow structure | ~~`"Required roles: CFO, CONTROLLER"`~~ → `"Access denied"` |
| **R10** | Never expose internal IDs | ~~`"Wallet wallet_abc123 not found"`~~ → `"Invalid request"` |

### 5.3 Error Code Mapping

| AppError Type | HTTP Status | Safe Message | Code |
|---------------|-------------|--------------|------|
| `ForbiddenError` (any reason) | 403 | `"Access denied."` | `FORBIDDEN` |
| `NotFoundError` (resource may exist but user lacks access) | 403 | `"Access denied."` | `FORBIDDEN` |
| `NotFoundError` (resource genuinely doesn't exist) | 404 | `"Resource not found."` | `NOT_FOUND` |
| `ValidationError` (input invalid) | 400 | Field-level errors only | `VALIDATION_ERROR` |
| `ValidationError` (business rule violation) | 400 | `"Invalid request."` | `VALIDATION_ERROR` |
| `ConflictError` (state conflict) | 409 | `"Request cannot be processed."` | `CONFLICT` |
| `AuthenticationError` (login failure) | 401 | `"Invalid credentials."` | `UNAUTHORIZED` |
| Database/system failure | 500 | `"Internal server error."` | `INTERNAL_SERVER_ERROR` |

### 5.4 The 403 vs 404 Decision

**Default to 403 for all resource access failures.** Only use 404 when:
1. The endpoint is explicitly for resource retrieval (GET)
2. The resource type is public knowledge (e.g., "users" is a known resource type)
3. The user has no way to learn about the resource through other means

**Examples**:
- GET `/api/crm/contacts/{id}` where user lacks access → 403 `"Access denied"` (not 404)
- GET `/api/crm/contacts/{id}` where contact doesn't exist → 403 `"Access denied"` (not 404)
- GET `/api/users/{id}` where user doesn't exist → 404 `"User not found"` (resource type is public)

### 5.5 Client-Side Handling

```typescript
// src/lib/client-api.ts — Safe error extraction
export function getErrorMessage(body: any): string {
  // Never display error.message to users — only log it
  if (body?.error?.code === 'FORBIDDEN') {
    return 'You do not have permission to perform this action.';
  }
  if (body?.error?.code === 'NOT_FOUND') {
    return 'Resource not found.';
  }
  if (body?.error?.code === 'UNAUTHORIZED') {
    return 'Please sign in again.';
  }
  // For other errors, show generic message
  return body?.error?.message ?? 'Request failed';
}
```

**Key principle**: The client should map error codes to user-friendly messages, never display the raw `error.message` from the API.

### 5.6 Logging (Server-Side)

Error messages should be **detailed in logs** even when sanitized for clients:

```typescript
// Safe logging pattern
console.error('Access denied', {
  userId: ctx.userId,
  companyId: ctx.companyId,
  resource: 'contact',
  resourceId: contactId,
  reason: 'cross_tenant_access',
  requestedBy: ctx.email,
});
```

---

## 6. Migration Strategy

### 6.1 Scope of Changes

Based on the audit (2026-07-20), the following files require error message sanitization:

| Priority | File | Finding | Current Message | Safe Message |
|----------|------|---------|-----------------|--------------|
| **P0** | `src/modules/crm/crm.service.ts:160` | A2 | `"Access denied: contact belongs to another organization."` | `"Access denied."` |
| **P0** | `src/modules/workflow/engine.ts:733-734` | A15 | `"You are not authorized to approve this step. Required roles: ... Your role: ..."` | `"You are not authorized to approve this step."` |
| **P0** | `src/modules/ledger/approval-workflow.ts:270-272` | A10 | `"User lacks approval authority for transactions of type ${type} with amount ${amount}"` | `"You do not have authority for this approval."` |
| **P0** | `src/modules/ledger/approval-workflow.ts:349-350` | A12 | `"User lacks authority to reject transactions of type ${type} with amount ${amount}"` | `"You do not have authority for this rejection."` |
| **P0** | `src/modules/ledger/ledger.service.ts:219,302` | D1/D2 | `"No clearing wallet found for ${currency} in company ${companyId}"` | `"Invalid request."` |
| **P0** | `src/modules/users/users.service.ts:70,75` | B6/B7 | Distinguishable `"User not found"` vs `"Current password is incorrect"` | `"Invalid credentials"` |
| **P0** | `src/app/api/v1/admin/users/[userId]/assign-role/route.ts:29` | B8 | `"User not found"` | `"Access denied."` |
| **P1** | `src/modules/rbac/rbac.service.ts:194` | A5 | `` `Missing permission: ${permissionName}` `` | `"You do not have permission to perform this action."` |
| **P1** | `src/server/iam/admin.ts:188` | A17 | `"User is not a member of this company"` | `"Access denied."` |
| **P1** | `src/modules/workflow/engine.ts:717-718` | A14 | `` `Step "${stepId}" is not awaiting approval (current status: ${status}).` `` | `"This step cannot be approved."` |
| **P1** | `src/modules/ledger/approval-workflow.ts:287-288` | A11 | `` `No pending approval found for user with role ${userRole}` `` | `"No pending approval found."` |
| **P1** | `src/modules/ledger/approval-workflow.ts:363-364` | A13 | `` `Cannot reject: no pending approval for user role ${userRole}` `` | `"No pending approval found."` |
| **P1** | `src/server/iam/admin.ts:51` | A16 | `` `Role "${name}" already exists in this company` `` | `"Role already exists."` |
| **P1** | `src/modules/transactions/transactions.service.ts:251-252` | D11 | `` `Cross-currency conversion rate validation failed: ${rate} × ${fromAmount} = ${expected}, got ${toAmount}` `` | `"Conversion rate validation failed."` |
| **P1** | `src/server/http/money.ts:7,13,16` | D18-D20 | `` `${fieldName} is required` ``, `` `${fieldName} must be a valid decimal` ``, `` `${fieldName} must be greater than zero` `` | Keep as-is (field names in validation are acceptable) |
| **P2** | `src/server/context/tenant-context.ts:25` | A19 | `"This instance is licensed for a different company. Access denied."` | `"Access denied."` |
| **P2** | `src/server/security/authenticate-request.ts:22` | A20 | `` `API key does not have scope: ${requiredScope}` `` | `"API key does not have required permissions."` |
| **P2** | `src/app/api/v1/export/route.ts:25` | D22 | `` `Invalid export type. Valid: ${Object.keys(EXPORTERS).join(", ")}` `` | `"Invalid export type."` |
| **P2** | Various `ConflictError` messages | C5-C12 | State disclosure (e.g., `"Board pack is already approved"`) | `"Request cannot be processed."` |
| **P2** | `src/modules/agent-framework/agent-runtime.ts:262,318` | C14-C15 | `` `Agent must be ACTIVE to execute tasks (current: ${status})` `` | `"Agent is not in the correct state."` |
| **P2** | `src/modules/policies/policies.service.ts:73` | D14 | `` `Policy "${name}" already exists` `` | `"Policy already exists."` |

### 6.2 Implementation Approach

**Phase 1: Safe Error Wrapper (Immediate)**

Create a `sanitizeError()` function that wraps `handleRouteError()`:

```typescript
// src/server/http/handle-route.ts
function sanitizeErrorMessage(error: AppError): string {
  switch (error.code) {
    case 'FORBIDDEN':
      return 'Access denied.';
    case 'NOT_FOUND':
      return 'Resource not found.';
    case 'CONFLICT':
      return 'Request cannot be processed.';
    case 'VALIDATION_ERROR':
      return error.message; // Validation messages are expected to be descriptive
    default:
      return error.message;
  }
}
```

**Pros**: Single point of change, affects all endpoints immediately
**Cons**: Loses all specific error messages, may break legitimate use cases (e.g., validation errors that need to be specific)

**Phase 2: Per-Endpoint Sanitization (Recommended)**

Update each error message individually to follow the safe pattern:

1. Start with Critical findings (A2, A10, A12, A15, D1, D2, B8)
2. Then High findings (A5, A11, A13, A14, A17, E1, E3, E4, D6, D11)
3. Then Medium findings

**Pros**: Surgical, preserves useful validation messages, no regression risk
**Cons**: More files to change, requires testing each endpoint

**Phase 3: Client-Side Error Mapping (Complementary)**

Update `getErrorMessage()` in `src/lib/client-api.ts` to map error codes to user-friendly messages:

```typescript
export function getErrorMessage(body: any): string {
  const code = body?.error?.code;
  const message = body?.error?.message;
  
  // Map codes to safe user-facing messages
  if (code === 'FORBIDDEN') return 'You do not have permission to perform this action.';
  if (code === 'NOT_FOUND') return 'Resource not found.';
  if (code === 'UNAUTHORIZED') return 'Please sign in again.';
  if (code === 'CONFLICT') return 'This action cannot be completed. Please try again.';
  
  // For validation errors, show the message (it's expected to be descriptive)
  if (code === 'VALIDATION_ERROR') return message ?? 'Invalid input.';
  
  // Fallback
  return 'Something went wrong. Please try again.';
}
```

### 6.3 Testing Strategy

For each sanitized endpoint:
1. **Positive test**: Valid request succeeds → unchanged
2. **Negative test (auth)**: Unauthorized request → returns generic `"Access denied"` (not specific reason)
3. **Negative test (tenant)**: Cross-tenant request → returns generic `"Access denied"` (not `"belongs to another organization"`)
4. **Negative test (state)**: Invalid state → returns generic message (not internal state)
5. **Log verification**: Verify detailed error info is still logged server-side

### 6.4 Rollback Plan

If error sanitization breaks legitimate functionality:
1. Revert the specific endpoint change
2. Log the regression
3. Add the endpoint to a "needs investigation" list
4. Re-implement with a more targeted fix

---

## 7. Exceptions

The following are **acceptable** to include in error messages:

| Exception | Rationale |
|-----------|-----------|
| **Field names in validation errors** | Users need to know which field is invalid (e.g., `"Email is required"`) |
| **Enum values in Zod errors** | Users need to know valid options (e.g., `"Invalid status: must be ACTIVE, INACTIVE, or PENDING"`) |
| **Business rule violation details** | When the rule itself is public knowledge (e.g., `"Amount must be greater than zero"`) |
| **Rate limit messages** | `"Rate limit exceeded. Please try again in 60 seconds."` — expected and safe |
| **CSRF token messages** | `"Invalid or missing CSRF token"` — expected and safe |

---

## 8. Constitution Compliance

| Constitution | Section | Policy Alignment |
|-------------|---------|------------------|
| **Governance Constitution** | §Security — "No shortcut is worth a data breach" | Error sanitization prevents information leakage that could lead to breaches |
| **Engineering Constitution** | §Security — "defense in depth" | Error messages are a defense layer — they should not weaken other layers |
| **Engineering Constitution** | §114 — "All tenant data must be isolated" | Error messages must not confirm cross-tenant resource existence |
| **Product Constitution** | §8.4 — "Does this respect tenant isolation?" | Error messages must not leak tenant boundaries |
| **Enterprise Workflow Constitution** | §12 — "Every approval be audited" | Error messages must not reveal approval workflow internals |

---

## 9. References

- OWASP Top 10 (2021) — A01:2021 Broken Access Control
- OWASP Authentication Cheat Sheet — Information Leakage
- OWASP API Security Top 10 — API2:2023 Broken Object Level Authorization
- OWASP Input Validation Cheat Sheet
- CWE-209: Generation of Error Message Containing Sensitive Information
- CWE-200: Exposure of Sensitive Information
- CWE-203: Observable Discrepancy

---

## Appendix A: Complete Audit Findings

See the error message audit conducted on 2026-07-20 for the full categorized list of all findings (Categories A-E, 50+ instances across 30+ files).

## Appendix B: Client-Side Error Display Audit

See the UI error display audit conducted on 2026-07-20 for findings on how API error messages are consumed by React components, toasts, and error boundaries.

**Key findings**:
- `getErrorMessage()` extracts `error.message` verbatim → shown to users
- `toast.error()` in 10+ locations displays raw API error messages
- `ErrorBoundary` shows `error.message` + `error.stack` in collapsible details
- Mobile components have zero error handling

## Appendix C: Pre-Existing Bugs Found

During the audit, the following bugs were identified that should be fixed alongside error sanitization:

1. **`integrations/[id]/client.tsx:56`** — `toast.error(err.error ?? "fallback")` passes an object to toast, rendering `[object Object]`
2. **`integration-header.tsx:174`** — Same issue
3. **`scheduler-client.tsx:178`** — `new Error(err.error)` wraps an object in Error, showing `[object Object]`
4. **`business-rules-client.tsx:124`** — Same issue
5. **`approval-matrix-client.tsx:141`** — Same issue
6. **`error-boundary.tsx:54`** — Shows `error.stack` to users in production

---

**Document Version**: 1.0
**Last Updated**: 2026-07-20
**Next Review**: After P1 remediation completion
