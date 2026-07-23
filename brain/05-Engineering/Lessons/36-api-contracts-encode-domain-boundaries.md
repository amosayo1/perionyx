# Lesson 36: API Contracts Encode Domain Boundaries

**Date**: July 22, 2026
**Phase**: 21A.3 — AP Enterprise API Layer
**Context**: Building 65 REST endpoints with 37 permissions, 40+ Zod schemas, idempotency, and enterprise error contract

## The Lesson

The API surface is NOT a 1:1 mapping of the application layer — it's a curated boundary. Every endpoint must answer: WHO can do WHAT to WHICH resource under WHAT conditions. The API contract is the trust boundary between external consumers and internal domain logic.

Key insights:
1. **Permission granularity enables precise access control** — 37 AP permissions (not 8 role-level toggles) prevent over-provisioning. An AP Clerk can view invoices but cannot approve payments. A Controller can approve payments but cannot create vendors.
2. **Idempotency at the API boundary protects against network-level retries** without business-level duplication. The idempotency key is stored for 24h and checked before the request reaches the application layer.
3. **The enterprise error contract is the API's voice** — `{ code, message, category, correlationId, recoverability, userMessage }` speaks to both machines (code, category for programmatic handling) and humans (userMessage for UI display, recoverability for action guidance).
4. **Zod schemas at the API boundary are the LAST line of defense** — domain validation happens in the application layer (state machine, invariants, SoD), API validation ensures type safety and structural integrity.
5. **REST conventions reduce cognitive load** — plural nouns (`/vendors`), nested resources (`/vendors/:id/invoices`), HTTP verbs (GET/POST/PUT/PATCH/DELETE) mean API consumers don't need to learn a custom language.

## The Anti-Pattern

The anti-pattern is treating the API as a transparent pass-through:
- One endpoint per application method (leaks internal service boundaries)
- No permission granularity (all-or-nothing access)
- Error messages that expose stack traces or DB errors
- No idempotency (network retries cause duplicate invoices, duplicate payments)
- Validation only in the application layer (structural errors reach business logic before being caught)

## The Principle

Every API endpoint is a trust boundary. The four layers of defense at this boundary are:
```
Authentication (WHO) → Authorization (WHAT) → Validation (INTENT) → Idempotency (UNIQUENESS)
     ↓                      ↓                    ↓                      ↓
  JWT/API Key          Permission check      Zod schema             Key lookup
  Identity proof       Role + SoD rules      Type safety            24h dedup
```

The correlation ID (`x-correlation-id`) is the thread that ties the entire request lifecycle together — from proxy through middleware through application service through database and back.

## Evidence

In Phase 21A.3, we built 65 endpoints with:
- 37 permissions mapped to endpoint-level authorization (view: 14, create: 8, update: 6, delete: 3, execute: 6)
- 40+ Zod schemas covering input, query params, path params, and response shapes
- Idempotency middleware on all POST endpoints (invoice creation, payment submission, approval actions)
- Enterprise error contract on every error response (400, 401, 403, 404, 409, 422, 429, 500)
- Correlation ID propagated from proxy through all middleware to response header

Zero business logic leaked into API routes. Zero authorization checks skipped. Zero unvalidated inputs reaching application services.
