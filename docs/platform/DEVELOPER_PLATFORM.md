# Developer Platform

**Platform**: DeveloperPlatform
**Contract**: `DeveloperContract`
**Mission**: Provide external developers with a world-class API experience — SDKs, documentation, sandbox environments, webhook management, and developer tooling — enabling third-party integrations, partner ecosystems, and custom solutions built on the Perionyx financial operating system.
**Status**: Not started (API platform exists at `src/server/api-platform/` but no developer portal)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 3 ("Every Platform Exposes Capability Contracts"), Law 7 ("Architecture Is Governed Through Automation")

---

## Responsibilities

1. **API Versioning** — Maintain stable, versioned APIs with clear deprecation policies and migration paths.
2. **OpenAPI Spec Generation** — Auto-generate OpenAPI 3.1 specifications from route definitions and Zod schemas.
3. **SDK Generation** — Produce typed client SDKs (TypeScript, Python, Go) from OpenAPI specs.
4. **Developer Portal** — Self-service portal with documentation, API explorer, key management, and usage dashboards.
5. **Sandbox Environment** — Isolated test environment with seeded data for integration development.
6. **Rate Limiting per API Key** — Per-key rate limits with tiered plans (free, pro, enterprise).
7. **Authentication** — API key management and OAuth 2.0 for third-party integrations.
8. **Webhook Management** — Register, manage, and deliver webhooks with retry, signing, and event filtering.
9. **Error Contract** — Consistent, documented error responses across all API versions.
10. **API Changelog** — Versioned changelog with breaking change notifications.
11. **Deprecation Policy** — Minimum 6-month deprecation window with migration guides.
12. **Developer Onboarding** — Quickstart guides, tutorials, and reference documentation.
13. **Testing Tools** — API explorer, mock servers, and integration test helpers.
14. **Documentation Generation** — Auto-generated API docs from OpenAPI specs and code comments.

---

## Public API (Capability Contract)

```typescript
interface DeveloperContract {
  // ── API Key Management ────────────────────────────────────────
  createAPIKey(ctx: TenantContext, input: CreateAPIKeyInput): Promise<APIKey>;
  listAPIKeys(ctx: TenantContext): Promise<APIKeySummary[]>;
  revokeAPIKey(ctx: TenantContext, keyId: string): Promise<void>;
  rotateAPIKey(ctx: TenantContext, keyId: string): Promise<APIKey>;

  // ── OAuth 2.0 ─────────────────────────────────────────────────
  registerOAuthClient(input: RegisterOAuthClientInput): Promise<OAuthClient>;
  authorizeOAuthClient(input: OAuthAuthorizationInput): Promise<OAuthAuthorizationResult>;
  exchangeOAuthCode(code: string, clientId: string, clientSecret: string): Promise<OAuthToken>;
  refreshOAuthToken(refreshToken: string): Promise<OAuthToken>;
  revokeOAuthToken(token: string): Promise<void>;

  // ── Webhooks ──────────────────────────────────────────────────
  registerWebhook(ctx: TenantContext, input: RegisterWebhookInput): Promise<Webhook>;
  listWebhooks(ctx: TenantContext): Promise<WebhookSummary[]>;
  updateWebhook(ctx: TenantContext, webhookId: string, input: UpdateWebhookInput): Promise<Webhook>;
  deleteWebhook(ctx: TenantContext, webhookId: string): Promise<void>;
  testWebhook(ctx: TenantContext, webhookId: string): Promise<WebhookTestResult>;
  listWebhookEvents(): Promise<WebhookEventDefinition[]>;

  // ── Developer Portal ──────────────────────────────────────────
  getAPIExplorer(ctx: TenantContext): Promise<APIExplorerConfig>;
  getAPIUsage(ctx: TenantContext, period: UsagePeriod): Promise<APIUsageReport>;
  getAPIChangelog(version?: string): Promise<ChangelogEntry[]>;

  // ── Documentation ─────────────────────────────────────────────
  getOpenAPISpec(version: string): Promise<OpenAPISpec>;
  getSDKDownloadURL(language: string, version: string): Promise<DownloadURL>;
}
```

---

## Internal API

### Module Architecture

| Module | Location | Purpose | Files |
|---|---|---|---|
| **API Platform** | `src/server/api-platform/` | API configuration, registry, versioning, request/response pipeline | 17 files |
| **OpenAPI** | `src/server/api-platform/openapi/` | OpenAPI spec generation | 3+ files |
| **SDK** | `src/server/api-platform/sdk/` | SDK generation | 2+ files |
| **Webhooks** | `src/server/api-platform/webhooks/` | Webhook management and delivery | 2+ files |
| **Auth** | `src/server/api-platform/auth/` | API key and OAuth management | 2+ files |
| **Observability** | `src/server/api-platform/observability/` | API metrics and monitoring | 2+ files |

### Key Services

| Service | Location | Responsibility |
|---|---|---|
| `APIPlatform` | `src/server/api-platform/api-platform.ts` | Unified API platform facade |
| `APIRegistry` | `src/server/api-platform/api-registry.ts` | Route registration and discovery |
| `APIVersionManager` | `src/server/api-platform/api-version-manager.ts` | Version negotiation and routing |
| `APIConfiguration` | `src/server/api-platform/api-configuration.ts` | Global API configuration |
| `RequestPipeline` | `src/server/api-platform/request-pipeline.ts` | Request preprocessing |
| `ResponsePipeline` | `src/server/api-platform/response-pipeline.ts` | Response postprocessing |
| `EndpointMetadata` | `src/server/api-platform/endpoint-metadata.ts` | Route metadata extraction |
| `RouteRegistry` | `src/server/api-platform/route-registry.ts` | Route catalog |
| `APIService` | `src/server/api-platform/api-service.ts` | Core API operations |

---

## Capability Contract

### APIVersion

```typescript
type APIVersion = "v1" | "v2" | "v3";

interface VersionConfig {
  version: APIVersion;
  status: "current" | "deprecated" | "sunset";
  releasedAt: Date;
  deprecatedAt?: Date;
  sunsetAt?: Date;
  migrationGuide?: string;
}
```

### RateLimitTier

```typescript
type RateLimitTier = "free" | "pro" | "enterprise";

interface RateLimitConfig {
  tier: RateLimitTier;
  requestsPerMinute: number;
  requestsPerDay: number;
  burstLimit: number;
  concurrentConnections: number;
}
```

---

## Events

### Developer Platform Events

| Event | Type | Description |
|---|---|---|
| `developer.api_key.created` | Domain | API key created |
| `developer.api_key.rotated` | Domain | API key rotated |
| `developer.api_key.revoked` | Domain | API key revoked |
| `developer.oauth.authorized` | Domain | OAuth authorization granted |
| `developer.oauth.token_issued` | Domain | OAuth token issued |
| `developer.oauth.token_revoked` | Domain | OAuth token revoked |
| `developer.webhook.registered` | Domain | Webhook registered |
| `developer.webhook.delivery.success` | Domain | Webhook delivered successfully |
| `developer.webhook.delivery.failed` | Domain | Webhook delivery failed |
| `developer.webhook.delivery.retrying` | Domain | Webhook delivery retrying |
| `developer.api.version.deprecated` | Domain | API version marked deprecated |
| `developer.api.version.sunset` | Domain | API version sunset reached |

---

## Commands

| Command | Description | Permission |
|---|---|---|
| `CreateAPIKey` | Generate new API key | `developer.keys.create` |
| `RotateAPIKey` | Rotate existing API key | `developer.keys.rotate` |
| `RevokeAPIKey` | Revoke API key | `developer.keys.revoke` |
| `RegisterOAuthClient` | Register OAuth 2.0 client | `developer.oauth.register` |
| `RegisterWebhook` | Register webhook endpoint | `developer.webhooks.create` |
| `UpdateWebhook` | Modify webhook configuration | `developer.webhooks.update` |
| `DeleteWebhook` | Remove webhook | `developer.webhooks.delete` |
| `TestWebhook` | Send test event to webhook | `developer.webhooks.test` |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `GetOpenAPISpec` | Fetch OpenAPI specification | Yes (1hr) |
| `GetSDKDownloadURL` | SDK download link | Yes (24hr) |
| `GetAPIUsage` | API usage metrics for period | No |
| `GetAPIChangelog` | Versioned changelog | Yes (1hr) |
| `ListAPIKeys` | List active API keys | No |
| `ListWebhooks` | List registered webhooks | No |
| `ListWebhookEvents` | Available webhook event types | Yes (24hr) |

---

## Errors

| Code | Description | HTTP Status |
|---|---|---|
| `DEV_INVALID_API_KEY` | API key is invalid or revoked | 401 |
| `DEV_API_KEY_EXPIRED` | API key has expired | 401 |
| `DEV_RATE_LIMITED` | Rate limit exceeded for tier | 429 |
| `DEV_OAUTH_INVALID_CLIENT` | OAuth client not found | 401 |
| `DEV_OAUTH_INVALID_GRANT` | OAuth grant is invalid | 400 |
| `DEV_OAUTH_TOKEN_EXPIRED` | OAuth token has expired | 401 |
| `DEV_OAUTH_INSUFFICIENT_SCOPE` | Missing required OAuth scope | 403 |
| `DEV_WEBHOOK_NOT_FOUND` | Webhook not found | 404 |
| `DEV_WEBHOOK_UNREACHABLE` | Webhook endpoint unreachable | 502 |
| `DEV_WEBHOOK_SIGNATURE_INVALID` | Webhook signature verification failed | 401 |
| `DEV_VERSION_NOT_FOUND` | API version not found | 404 |
| `DEV_VERSION_DEPRECATED` | API version is deprecated | 410 |
| `DEV_VERSION_SUNSET` | API version has been sunset | 410 |

---

## Security Model

### API Key Security

1. **Key Generation**: Cryptographically random, 32-byte keys, SHA-256 hashed at rest
2. **Key Format**: `pyx_live_` or `pyx_test_` prefix + base64url-encoded random bytes
3. **Key Storage**: Only hashed key stored in DB; plaintext shown once at creation
4. **Key Rotation**: Previous key valid for 24h after rotation for zero-downtime migration
5. **Key Revocation**: Immediate invalidation; all in-flight requests rejected

### OAuth 2.0 Security

1. **Flows**: Authorization Code (with PKCE), Client Credentials
2. **Token Expiry**: Access tokens 1 hour, Refresh tokens 30 days
3. **Scope Enforcement**: Per-endpoint scope validation
4. **Client Authentication**: Client secret or private key JWT
5. **Token Revocation**: RFC 7009 compliant

### Webhook Security

1. **Signing**: HMAC-SHA256 signature in `X-Perionyx-Signature` header
2. **Replay Protection**: Timestamp-based, 5-minute tolerance
3. **IP Allowlisting**: Optional IP range restrictions
4. **TLS Required**: Only HTTPS endpoints accepted

---

## Permission Model

### Developer Permissions

| Permission | Scope | Description |
|---|---|---|
| `developer.keys.create` | Company | Create API keys |
| `developer.keys.rotate` | Company | Rotate API keys |
| `developer.keys.revoke` | Company | Revoke API keys |
| `developer.keys.read` | Company | View API keys |
| `developer.oauth.register` | Company | Register OAuth clients |
| `developer.oauth.manage` | Company | Manage OAuth clients |
| `developer.webhooks.create` | Company | Create webhooks |
| `developer.webhooks.update` | Company | Update webhooks |
| `developer.webhooks.delete` | Company | Delete webhooks |
| `developer.webhooks.test` | Company | Test webhooks |
| `developer.docs.read` | Public | Read API documentation |
| `developer.usage.read` | Company | View API usage metrics |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `developer_api_requests_total` | Counter | version, endpoint, method, status |
| `developer_api_latency_ms` | Histogram | version, endpoint, method |
| `developer_api_errors_total` | Counter | version, error_code |
| `developer_api_key_usage_total` | Counter | key_id, endpoint |
| `developer_oauth_token_issued_total` | Counter | grant_type, scope |
| `developer_oauth_token_revoked_total` | Counter | reason |
| `developer_webhook_deliveries_total` | Counter | event_type, status |
| `developer_webhook_delivery_latency_ms` | Histogram | event_type |
| `developer_webhook_retry_total` | Counter | attempt |
| `developer_rate_limit_hits_total` | Counter | tier, endpoint |
| `developer_sdk_downloads_total` | Counter | language, version |

---

## Rate Limiting

### Per-Tier Limits

| Tier | Requests/Min | Requests/Day | Burst | Concurrent | Price |
|---|---|---|---|---|---|
| Free | 60 | 10,000 | 10 | 5 | $0/mo |
| Pro | 600 | 100,000 | 50 | 25 | $99/mo |
| Enterprise | 6,000 | 1,000,000 | 200 | 100 | Custom |

### Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Upgrade your plan for higher limits.",
    "retryAfter": 45,
    "limit": 60,
    "remaining": 0,
    "reset": "2026-07-24T12:00:00Z"
  }
}
```

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

---

## Retry Policy

### Webhook Delivery

| Attempt | Delay | Max Attempts |
|---|---|---|
| 1 | Immediate | — |
| 2 | 30 seconds | — |
| 3 | 2 minutes | — |
| 4 | 15 minutes | — |
| 5 | 1 hour | — |
| 6 (final) | 4 hours | 6 total |

After 6 failures: webhook marked as `failing`, notification sent to developer.

---

## Caching

| Data | TTL | Scope |
|---|---|---|
| OpenAPI spec | 1 hour | Per version |
| SDK download URL | 24 hours | Per language+version |
| API changelog | 1 hour | Global |
| Webhook event definitions | 24 hours | Global |
| API usage metrics | 5 minutes | Per tenant |

---

## Versioning

### API Versioning Strategy

| Aspect | Strategy |
|---|---|
| Version identifier | `v1`, `v2`, `v3` (URL path prefix) |
| Breaking change | New major version (v2, v3) |
| Non-breaking change | Added to current version |
| Deprecation notice | 6-month minimum before sunset |
| Sunset response | `410 Gone` with migration guide URL |
| Version negotiation | `Accept` header or query param fallback |

### Deprecation Lifecycle

```
Current → Deprecated (6 months) → Sunset (410 Gone)
```

- **Deprecated**: Still fully functional; warnings in response headers (`Sunset`, `Deprecation`)
- **Sunset**: Returns `410 Gone` with `Link` header to migration guide

### Breaking Change Examples

- Removing or renaming a field
- Changing field type
- Removing an endpoint
- Changing authentication requirement
- Changing error code format

### Non-Breaking Change Examples

- Adding new optional fields
- Adding new endpoints
- Adding new webhook event types
- Adding new query parameters

---

## SDK Generation

### Supported Languages

| Language | Package | Status |
|---|---|---|
| TypeScript | `@perionyx/sdk` | Not started |
| Python | `perionyx-sdk` | Not started |
| Go | `perionyx-go` | Not started |

### SDK Features

1. **Auto-generated** from OpenAPI spec via `openapi-generator`
2. **Type-safe** with full TypeScript/Python type annotations
3. **Retries** built-in with exponential backoff
4. **Rate limiting** client-side awareness
5. **Webhook verification** helpers
6. **Pagination** helpers for list endpoints
7. **Idempotency key** generation

---

## Webhook Architecture

### Event Delivery

```
Domain Event → Webhook Dispatcher
  → Filter (event type, tenant subscriptions)
    → Sign (HMAC-SHA256)
      → Deliver (POST to HTTPS endpoint)
        → Verify (HTTP 2xx response)
          → Retry (if failed, exponential backoff)
            → Dead Letter (after max retries)
```

### Webhook Payload

```json
{
  "id": "evt_abc123",
  "type": "invoice.created",
  "apiVersion": "v1",
  "createdAt": "2026-07-24T12:00:00Z",
  "tenantId": "company_abc",
  "data": {
    "object": { "id": "inv_123", "amount": 5000.00, "currency": "USD" }
  }
}
```

### Webhook Headers

```
X-Perionyx-Event: invoice.created
X-Perionyx-Signature: sha256=...
X-Perionyx-Delivery: del_abc123
X-Perionyx-Timestamp: 1690000000
X-Perionyx-API-Version: v1
```

---

## Extension Model

### Adding a New API Endpoint

1. **Define** route in `src/app/api/` with Zod validation
2. **Register** in API registry with metadata (version, permissions, rate limit tier)
3. **Add** OpenAPI annotations (description, parameters, response schema)
4. **Write** endpoint tests (happy path + error cases)
5. **Update** changelog if breaking change

### Adding a New Webhook Event

1. **Define** event type in webhook event registry
2. **Emit** event from domain logic
3. **Add** to `ListWebhookEvents` query response
4. **Document** payload schema in webhook docs

---

## Developer Onboarding Flow

```
1. Sign up → Developer account created
2. Create API key → Key shown once, stored hashed
3. Quickstart guide → First API call in < 5 minutes
4. Sandbox access → Test environment with seeded data
5. Explore API → Interactive API explorer
6. Integrate → SDK + documentation
7. Go live → Switch to production keys
8. Monitor → Usage dashboard + alerts
```

---

## Testing Tools

| Tool | Description |
|---|---|
| API Explorer | Interactive API testing with authentication |
| Mock Server | Local mock of Perionyx API for offline development |
| Webhook Tester | Send test events to registered webhooks |
| Integration Test Helpers | Pre-built test utilities for common patterns |
| Contract Tests | Validate SDK compatibility with API spec |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/server/api-platform/api-platform.ts` | API platform facade |
| `src/server/api-platform/api-registry.ts` | Route registration |
| `src/server/api-platform/api-version-manager.ts` | Version negotiation |
| `src/server/api-platform/api-configuration.ts` | Configuration |
| `src/server/api-platform/request-pipeline.ts` | Request preprocessing |
| `src/server/api-platform/response-pipeline.ts` | Response postprocessing |
| `src/server/api-platform/endpoint-metadata.ts` | Route metadata |
| `src/server/api-platform/route-registry.ts` | Route catalog |
| `src/server/api-platform/types.ts` | Type definitions |
| `src/server/api-platform/openapi/` | OpenAPI generation |
| `src/server/api-platform/sdk/` | SDK generation |
| `src/server/api-platform/webhooks/` | Webhook management |
| `src/server/api-platform/auth/` | API key + OAuth |
| `src/server/api-platform/observability/` | API metrics |
| `src/app/api/openapi/` | OpenAPI spec endpoint |

---

*The Developer Platform turns Perionyx's internal power into external possibility.*
