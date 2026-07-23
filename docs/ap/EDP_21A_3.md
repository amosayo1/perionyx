# EDP_21A_3 — Engineering Decision Packet

> **Phase 21A.3** — AP Enterprise API Layer  
> 10 key decisions with rationale, alternatives, and trade-offs  
> Status: All Accepted

---

## Decision 1: REST over GraphQL

### Context

The AP domain has 65 endpoints across 7 aggregates. The question is whether to expose these as REST resources or as a GraphQL schema with queries and mutations.

### Decision

Use REST. All endpoints follow resource-oriented URL design with standard HTTP methods (GET, POST, PUT). No GraphQL schema.

### Rationale

1. **Consistency with existing 402 routes** — the platform already has 402 REST API endpoints. Adding GraphQL for one domain creates two mental models for API consumers.
2. **HTTP semantics are sufficient** — REST maps naturally to the AP workflow: resources (vendors, invoices), actions (approve, reject, void), and standard status codes (200, 201, 409, 422).
3. **Simpler infrastructure** — no GraphQL server, no schema stitching, no query complexity analysis, no N+1 resolver protection.
4. **Better caching** — REST GET endpoints are cacheable by default. GraphQL queries are POST-only and bypass HTTP caching.
5. **API gateway compatibility** — REST works with existing proxy.ts rate limiting, CSRF, and auth middleware without adaptation.

### Alternatives Considered

1. **GraphQL with Apollo Server** — Rejected: would require a separate GraphQL server process, schema design, resolver architecture, and N+1 protection (DataLoader). Adds complexity for 65 endpoints that don't benefit from GraphQL's strengths (client-specified queries, nested resource traversal).
2. **tRPC** — Rejected: tight coupling between client and server TypeScript code. Not suitable for external API consumers or future API key integrations.
3. **OpenAPI/Swagger (future)** — Deferred: can be generated from Zod schemas at any time without changing the API surface.

### Trade-offs

- **Accepted**: No client-specified field selection (must use fixed response shapes per endpoint)
- **Mitigated**: Report endpoints accept query parameters for filtering; list endpoints support pagination with page/limit

### Status: Accepted

---

## Decision 2: /api/v1/ Versioned Routing

### Context

The AP API needs a versioning strategy that supports breaking changes in the future without disrupting existing consumers.

### Decision

Embed the version in the URL path: `/api/v1/ap/`. Future breaking changes use `/api/v2/ap/`. No header-based or query-parameter versioning.

### Rationale

1. **Explicit and visible** — version is in the URL, visible in logs, browser, and API documentation.
2. **Route-level isolation** — Next.js file-based routing means v1 and v2 can coexist as separate directory trees (`api/v1/ap/` and `api/v2/ap/`).
3. **Proxy compatibility** — `src/proxy.ts` can match on path prefix to apply version-specific middleware.
4. **Industry standard** — Stripe, GitHub, Twilio all use URL-based versioning for their APIs.

### Alternatives Considered

1. **Header-based versioning** (`Accept: application/vnd.perionyx.v1+json`) — Rejected: invisible in logs, harder to test with curl, browser can't navigate directly.
2. **Query parameter versioning** (`?version=1`) — Rejected: pollutes query space, easy to forget, inconsistent with REST semantics.
3. **No versioning (break gracefully)** — Rejected: breaking changes would silently break existing integrations.

### Trade-offs

- **Accepted**: URL duplication if v1 and v2 share many endpoints (v2 directory mirrors v1 structure)
- **Mitigated**: Only breaking changes require new version; additive changes (new fields, new endpoints) don't need v2

### Status: Accepted

---

## Decision 3: In-Memory Idempotency Store

### Context

Financial mutations need idempotency to prevent duplicate execution. The idempotency store must persist keys and results for replay detection.

### Decision

Use an in-memory `Map` with 24-hour TTL. No Redis or database-backed persistence.

### Rationale

1. **Single-process architecture** — the application runs as a single Node.js process. In-memory is sufficient for process-scoped deduplication.
2. **Zero infrastructure dependency** — no Redis setup, no connection management, no failure modes.
3. **Simple implementation** — `Map<string, { result: unknown; expiresAt: number }>` with periodic cleanup.
4. **24h TTL is generous** — accidental double-submits happen within seconds; 24h covers network retries, client bugs, and slow connections.

### Alternatives Considered

1. **Redis-backed store** — Deferred: requires Redis setup, adds latency (network round-trip), and is overkill for single-process deployment. The `IdempotencyStore` interface is designed for swappable backends.
2. **Database-backed store** — Deferred: adds DB writes on every idempotent request, increases latency, and requires schema for idempotency keys.
3. **No idempotency (DB constraints only)** — Rejected: DB constraints prevent duplicates but return 409 errors instead of the original response. Clients can't distinguish "already done" from "conflict."

### Trade-offs

- **Accepted**: After process restart, idempotency keys are lost. Worst case: duplicate execution for requests in flight during restart.
- **Mitigated**: Database unique constraints (e.g., `(companyId, invoiceNumber)`) provide a second line of defense. Duplicate financial mutations are caught at the DB level.

### Status: Accepted

---

## Decision 4: In-Memory Repository Registry

### Context

The AP domain has 10 repository interfaces (Vendor, Invoice, Match, Exception, ApprovalChain, PaymentProposal, PaymentBatch, Payment, CreditNote, Reconciliation). Consumers need a way to obtain repository instances.

### Decision

Use a simple in-memory registry that maps entity names to repository instances. Prisma adapters are the default; in-memory adapters exist for testing.

### Rationale

1. **Simple lookup** — `getRepository("vendor")` returns the Prisma-backed vendor repository.
2. **Testable** — tests swap Prisma adapters for in-memory adapters without changing service code.
3. **No DI framework** — avoids introducing a dependency injection container (InversifyJS, tsyringe) for 10 repositories.
4. **Consistent with existing patterns** — the platform already uses singleton registries (e.g., `connectorPlatformRegistry`, `aiProviderRegistry`).

### Alternatives Considered

1. **Constructor injection** — Rejected: would require every service to accept 10 repository constructors, creating verbose initialization chains.
2. **DI container (InversifyJS)** — Rejected: adds a dependency, requires decorators, and is overkill for 10 repositories in a modular monolith.
3. **Static imports** — Rejected: creates tight coupling between services and Prisma implementations; harder to test.

### Trade-offs

- **Accepted**: Global mutable state (registry is populated at startup)
- **Mitigated**: Registry is populated once during initialization, never modified at runtime. Prisma adapters are stateless.

### Status: Accepted

---

## Decision 5: Zod over Custom Validation

### Context

Every endpoint needs input validation: request body parsing, path parameter format checking, query parameter bounds, and error formatting.

### Decision

Use Zod for all validation. Schemas are defined in `src/lib/validations/procurement.ts` and imported by route handlers.

### Rationale

1. **Type inference** — `z.infer<typeof schema>` generates TypeScript types from validation schemas. Single source of truth for types and validation.
2. **Rich error messages** — Zod produces structured error trees with field paths, expected types, and custom error messages.
3. **Ecosystem** — 17M+ weekly npm downloads. Well-documented, actively maintained, widely understood.
4. **Composability** — `z.object()`, `z.array()`, `z.union()`, `z.discriminatedUnion()` handle complex nested structures.
5. **Already in use** — the platform uses Zod extensively (`src/lib/validations/` has 20+ schema files). AP validation is consistent.

### Alternatives Considered

1. **io-ts** — Rejected: similar type inference but less readable error messages and smaller ecosystem.
2. **Yup** — Rejected: no runtime type inference (requires separate `InferType`), slower than Zod.
3. **Joi** — Rejected: no TypeScript type inference, older API design.
4. **Manual validation** — Rejected: error-prone, verbose, no structured error output.

### Trade-offs

- **Accepted**: Zod adds ~15KB to bundle size (minimal for server-side)
- **Mitigated**: Zod is already a dependency; no new package addition

### Status: Accepted

---

## Decision 6: Offset Pagination

### Context

All 8 list endpoints (vendors, invoices, approvals, proposals, batches, exceptions, reconciliations, credits) need pagination. The choice is between offset-based and cursor-based.

### Decision

Offset-based pagination with `page` and `limit` query parameters. Cursor-based pagination is deferred.

### Rationale

1. **Consistency with existing patterns** — all 402 existing API endpoints use `page`/`limit`. AP endpoints should follow the same convention.
2. **Simpler implementation** — `SKIP / LIMIT` in Prisma is straightforward. No cursor encoding, no cursor validation.
3. **Total count** — offset pagination returns `total` count, which UIs need for page number display and progress indicators.
4. **Adequate for current scale** — AP data volumes (thousands to low millions of records) don't stress offset pagination performance.

### Alternatives Considered

1. **Cursor-based pagination** — Deferred: better for large datasets and real-time feeds, but adds complexity (cursor encoding, `hasMore` inference, no total count). Can be added as an optional `cursor` parameter in a future version.
2. **Keyset pagination** — Deferred: same trade-offs as cursor-based; requires a sortable, unique column as the key.
3. **No pagination** — Rejected: unbounded result sets are a security risk (DoS via large responses) and performance risk.

### Trade-offs

- **Accepted**: Offset pagination has O(n) performance on large offsets (page=10000 with limit=25 scans 250K rows)
- **Mitigated**: UI pattern is to navigate near-current pages, not deep offsets. Cursor pagination can be added without breaking changes.

### Status: Accepted

---

## Decision 7: No API Gateway

### Context

The platform already has `src/proxy.ts` handling edge concerns (auth, rate limiting, CSRF, correlation IDs). The question is whether AP endpoints need an additional API gateway layer.

### Decision

No separate API gateway. `proxy.ts` handles all edge concerns. AP route handlers focus purely on business logic.

### Rationale

1. **Single responsibility** — `proxy.ts` already handles auth, rate limiting, CSRF, and correlation IDs. Adding another layer duplicates these concerns.
2. **Next.js architecture** — the proxy is the natural edge layer in Next.js 16. No need for Kong, AWS API Gateway, or custom gateway.
3. **Simplicity** — one fewer infrastructure component to deploy, monitor, and maintain.
4. **Performance** — zero additional network hops between proxy and route handler.

### Alternatives Considered

1. **Kong / AWS API Gateway** — Rejected: adds infrastructure complexity, latency, and cost for a modular monolith that doesn't need request transformation, protocol conversion, or service mesh features.
2. **Custom AP-specific middleware** — Rejected: would duplicate auth and rate limiting already in `proxy.ts`.
3. **AP route-level middleware** — Deferred: if AP endpoints need different rate limits or auth than other endpoints, route-level middleware in the handler is sufficient.

### Trade-offs

- **Accepted**: `proxy.ts` handles all endpoints uniformly; no AP-specific edge behavior
- **Mitigated**: Rate limit tiers (general/financial/auth) are already configured per-path in `proxy.ts`

### Status: Accepted

---

## Decision 8: Placeholder Report Endpoints

### Context

The 8 report endpoints (aging, payment calendar, duplicates, audit trail, outstanding liabilities, cash requirements, analytics, discount available) are specified but the underlying domain services are not yet fully wired.

### Decision

Implement report endpoints as placeholder routes that return `501 NOT_IMPLEMENTED` with a structured response. The endpoints exist in the API catalog and can be wired as domain services become available.

### Rationale

1. **API contract completeness** — the 65-endpoint catalog is the contract. Consumers can integrate against the endpoints even before the data is ready.
2. **Graceful degradation** — `501 NOT_IMPLEMENTED` is a standard HTTP status that tells clients "this feature is coming."
3. **Incremental delivery** — report services can be wired one at a time without changing the API surface.
4. **Documentation alignment** — the endpoint catalog documents all 65 endpoints. Placeholder routes prevent "this endpoint doesn't exist" confusion.

### Alternatives Considered

1. **Omit report endpoints entirely** — Rejected: breaks the 65-endpoint catalog promise; consumers can't prepare integration code.
2. **Return mock data** — Rejected: misleading; consumers might build on fake data that changes when real services are wired.
3. **Wire to existing services** — Deferred: some reports (aging, outstanding) could use existing Prisma queries, but the full report services are Phase 21C scope.

### Trade-offs

- **Accepted**: 8 endpoints return 501 until Phase 21C (intelligence services)
- **Mitigated**: 501 response includes `estimatedAvailable: "Phase 21C"` for consumer planning

### Status: Accepted

---

## Decision 9: Enterprise Error Contract

### Context

The platform has 272 existing API endpoints that use `handleRouteError()` / `zodErrorResponse()` from `src/server/http/handle-route.ts`. AP endpoints need a consistent error format that integrates with the existing error system.

### Decision

Use the enterprise error contract with 6 fields: `code`, `message`, `category`, `correlationId`, `recoverable`, `userMessage`.

### Rationale

1. **Consistency** — all platform endpoints return the same error structure. AP endpoints don't introduce a different format.
2. **User-friendly** — `userMessage` provides actionable text for UI toasts. `message` is for logging/debugging.
3. **Machine-readable** — `code` enables programmatic error handling (`if (error.code === "DUPLICATE_INVOICE")`).
4. **Recoverable flag** — tells the UI whether to show a "Retry" button.
5. **Correlation ID** — every error is traceable to the originating request.

### Error Categories

| Category | HTTP Status | Examples |
|---|---|---|
| `validation` | 400 | `INVALID_INPUT`, `MISSING_REQUIRED_FIELD` |
| `authentication` | 401 | `UNAUTHORIZED`, `TOKEN_EXPIRED` |
| `authorization` | 403 | `FORBIDDEN`, `SOD_VIOLATION` |
| `not_found` | 404 | `VENDOR_NOT_FOUND`, `INVOICE_NOT_FOUND` |
| `conflict` | 409 | `DUPLICATE_INVOICE`, `VERSION_CONFLICT` |
| `business_rule` | 422 | `VENDOR_NOT_ACTIVE`, `STATE_MACHINE_VIOLATION` |
| `rate_limit` | 429 | `TOO_MANY_REQUESTS` |
| `internal` | 500 | `INTERNAL_ERROR` |

### Alternatives Considered

1. **RFC 7807 Problem Details** — Rejected: more verbose (`type`, `title`, `detail`, `instance`), less user-friendly, and doesn't include `recoverable` or `userMessage`.
2. **Stripe-style errors** — Rejected: similar but uses `type` instead of `code`, and doesn't include `category` or `correlationId`.
3. **Custom per-endpoint errors** — Rejected: inconsistency across endpoints; harder for UI to handle uniformly.

### Trade-offs

- **Accepted**: 6-field error object is larger than minimal error responses (2-3 fields)
- **Mitigated**: the extra fields (`category`, `correlationId`, `recoverable`, `userMessage`) provide genuine value for UI integration and debugging

### Status: Accepted

---

## Decision 10: Permission Granularity

### Context

The AP domain has 51 commands and 18 queries. The question is whether to create fine-grained permissions (one per command) or coarse-grained permissions (one per aggregate).

### Decision

Fine-grained: 37 unique permissions across 10 domains. Each command maps to exactly one permission. Shared commands (e.g., `ap.vendors.approve` covers both ApproveVendor and RejectVendor) use the same permission.

### Rationale

1. **Least privilege** — AP Clerks can create invoices but not approve them. Fine-grained permissions enable this separation.
2. **SoD enforcement** — Segregation of Duties requires knowing which specific action a user performed. Granular permissions make SoD rules enforceable.
3. **Audit completeness** — every permission check is logged. Granular permissions provide a clear audit trail of who was authorized to do what.
4. **Role flexibility** — custom roles can be created by combining fine-grained permissions. Coarse permissions would require all-or-nothing assignment.
5. **Compliance** — SOC 2, ISO 27001, and PCI DSS all require documented access control with least privilege. Fine-grained permissions satisfy this requirement.

### Permission Count by Domain

| Domain | Permissions | Rationale |
|---|---|---|
| `ap.vendors.*` | 8 | Each lifecycle action (create, update, approve, reject, suspend, reactivate, deactivate, bank) is distinct |
| `ap.invoices.*` | 13 | Invoice lifecycle is the most complex (15 commands) with 13 unique permissions |
| `ap.match.*` | 2 | Execute and override are distinct risk levels |
| `ap.exceptions.*` | 6 | Exception management has 6 distinct actions |
| `ap.approvals.*` | 6 | Approval chain has 6 actions (view through recall) |
| `ap.payments.*` | 9 | Payment is highest risk; 9 permissions for proposal + batch lifecycle |
| `ap.reconciliation.*` | 4 | Import, run, adjust, complete are distinct |
| `ap.credits.*` | 3 | Create, apply, void cover the credit lifecycle |
| `ap.reports.*` | 8 | Each report type is independently permissioned |
| `ap.dashboard.*` | 1 | Single permission for dashboard access |
| **Total** | **60** | **37 unique after deduplication** |

### Alternatives Considered

1. **Coarse-grained (one per aggregate)** — Rejected: `ap.vendors.*` would give AP Clerks vendor approval power, violating least privilege.
2. **Per-command (51 permissions)** — Rejected: too granular; some commands share the same risk level (e.g., approve and reject vendor are the same permission).
3. **Hierarchical permissions** — Deferred: `ap.invoices.*` → `ap.invoices.create` hierarchy would be cleaner but adds complexity to the permission registry.

### Trade-offs

- **Accepted**: 37 permissions is more to manage than 7-10 coarse permissions
- **Mitigated**: Permission assignment is per-role, not per-user. 8 roles × 37 permissions is manageable in the admin UI.

### Status: Accepted

---

## Summary

| # | Decision | Key Trade-off | Status |
|---|---|---|---|
| 1 | REST over GraphQL | No client-specified fields, but consistent with 402 existing routes | Accepted |
| 2 | /api/v1/ versioned routing | URL duplication on v2, but explicit and visible | Accepted |
| 3 | In-memory idempotency store | Lost on restart, but zero infrastructure dependency | Accepted |
| 4 | In-memory repository registry | Global mutable state, but simple and testable | Accepted |
| 5 | Zod over custom validation | 15KB bundle (already a dependency), but type-safe and composable | Accepted |
| 6 | Offset pagination | O(n) on deep offsets, but consistent and simple | Accepted |
| 7 | No API gateway | No AP-specific edge behavior, but zero added complexity | Accepted |
| 8 | Placeholder report endpoints | 8 endpoints return 501, but API contract is complete | Accepted |
| 9 | Enterprise error contract | 6 fields per error, but user-friendly and machine-readable | Accepted |
| 10 | Permission granularity (37) | More permissions to manage, but least privilege and SoD compliant | Accepted |

---

*Document generated as part of Phase 21A.3 — AP Enterprise API Layer.*
