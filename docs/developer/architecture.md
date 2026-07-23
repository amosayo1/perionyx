# Developer Platform Architecture

## Overview

The Perionyx Developer Platform provides a production-grade API experience for enterprise customers, partners, and third-party systems. Every API is secure, versioned, observable, documented, discoverable, rate limited, permission aware, and tenant aware.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Developer Portal                    │
│  /developer/* (Static + Dynamic Pages)              │
├─────────────────────────────────────────────────────┤
│                   OpenAPI 3.1 Spec                   │
│  /api/openapi.json (Auto-generated)                 │
├─────────────────────────────────────────────────────┤
│                   API Platform Core                  │
│  src/server/api-platform/                           │
│                                                     │
│  APIPlatform    → Entry point / Facade              │
│  APIRegistry    → Endpoint discovery                │
│  RouteRegistry  → Route registration                │
│  EndpointMeta   → Per-endpoint metadata             │
│  APIService     → Business operations               │
│  VersionManager → v1/v2 lifecycle                   │
│  RequestPipeline→ Validation, correlation, etc.     │
│  ResponsePipeline→ Response formatting              │
│  APIConfig      → Platform configuration            │
├─────────────────────────────────────────────────────┤
│              Auth & Authorization                    │
│  api-auth.ts      → API Keys, OAuth2, PATs, etc.    │
│  api-authorization.ts → Scope-check, tenant-enforce │
├─────────────────────────────────────────────────────┤
│                 Webhook Platform                     │
│  webhook-platform.ts → Subs, delivery, retry        │
├─────────────────────────────────────────────────────┤
│               SDK Architecture                       │
│  sdk-architecture.ts → TypeScript/JS/Python/Go...   │
├─────────────────────────────────────────────────────┤
│               API Observability                      │
│  api-observability.ts → Metrics, latency, errors    │
├─────────────────────────────────────────────────────┤
│                Existing API Layer                    │
│  src/app/api/v1/* (35+ resource groups)             │
│  src/proxy.ts (Edge: rate-limit, CSRF, auth)        │
│  src/server/security/ (Rate-limit, CSRF, audit)     │
│  src/server/identity/ (Auth, sessions, SSO)         │
│  src/server/iam/ (RBAC, Permissions, ABAC)          │
│  src/modules/rbac/ (Role/permission checks)         │
└─────────────────────────────────────────────────────┘
```

## Layers

### 1. Edge Proxy (`src/proxy.ts`)
- Rate limiting per tier (auth: 10/60s, financial: 60/60s, general: 120/60s)
- CSRF validation for mutations
- Auth token extraction (JWT + API keys)
- Correlation ID generation
- Locale detection
- Protected route enforcement

### 2. API Platform (`src/server/api-platform/`)
- **APIPlatform**: Facade coordinating all platform services
- **APIRegistry**: Endpoint discovery, summary, health
- **RouteRegistry**: Route registration with metadata
- **EndpointMetadata**: Per-endpoint metadata with builder pattern
- **APIService**: Version negotiation, pagination, error formatting
- **VersionManager**: Version lifecycle (current → deprecated → sunset)
- **RequestPipeline**: Pagination, filtering, sorting, field selection
- **ResponsePipeline**: Standardized JSON responses, paginated responses, errors

### 3. Authentication & Authorization
- **API Keys**: Prefixed (`va_`), hashed, scoped, expirable, revocable
- **Personal Access Tokens**: User-bound, prefixed (`pat_`), scoped
- **Service Accounts**: Client ID + secret, IP allowlisting, machine-to-machine
- **Scoped Tokens**: Time-limited, one-time-use, resource-specific
- **OAuth2**: Authorization code + client credentials flows
- **Scope-based Authorization**: Check against required scopes
- **Tenant Isolation**: Enforce tenant boundaries on all requests
- **Resource Ownership**: Check user owns requested resource

### 4. Webhook Platform
- Subscription management (CRUD, pause, activate)
- Event matching and filtering
- HMAC-SHA256 signature signing/verification
- Exponential backoff retry (up to 5 attempts)
- Dead-letter queue for failed deliveries
- Delivery health monitoring

### 5. OpenAPI 3.1
- Auto-generated from registered endpoint metadata
- Per-version specification
- Full schema definitions
- Security scheme definitions (API Key, Bearer, OAuth2)
- Standard error responses (400, 401, 403, 429)
- Downloadable at `/api/openapi.json`

### 6. SDK Architecture
- Architecture defined for TypeScript, JavaScript, Python, Go, Java, .NET
- Base client with configurable auth, retry, timeout
- Pagination helpers for list endpoints
- Webhook signature verification utilities
- Typed models for all major entities

## Versioning Strategy

| Version | Status | Release | Notes |
|---------|--------|---------|-------|
| v1 | Current | July 2026 | Initial release |
| v2 | Future | TBD | Announced 6 months before release |

- URL-based versioning (`/api/v1/`, `/api/v2/`)
- Header-based negotiation (`Accept-Version: v1`)
- 6-month deprecation notice before sunset
- Breaking changes in new versions only
- CHANGELOG per version

## Security Model

- Every endpoint requires at least one auth strategy
- Permission scopes checked before processing
- Tenant isolation enforced for multi-tenant data
- All mutations audited
- Rate limiting at edge (proxy) and application level
- Input validation via Zod schemas
- Sensitive data masked in responses
- CORS, CSP, HSTS headers applied
