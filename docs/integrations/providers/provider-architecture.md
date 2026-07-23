# Provider Framework Architecture (Phase 12A.2)

## Overview

The Provider Framework is the reusable foundation that every future connector inherits from. It extends the Integration Core (Phase 12A.1) with abstract base classes, standardized capabilities, reusable authentication strategies, canonical data models, mapping infrastructure, retry framework, errors, SDK helpers, and production-quality mock providers.

## Architecture

```
src/server/providers/
├── base/
│   └── base-provider.ts              → BaseProvider (abstract, implements IntegrationProvider)
├── category/
│   └── erp-provider.ts               → 14 abstract category providers
├── auth/
│   ├── auth-framework.ts             → authenticate(), refreshAuth(), validateAuth()
│   └── strategies/                   → OAuth2, Client Credentials, Auth Code, API Key,
│                                        Bearer Token, JWT, Basic Auth, Mutual TLS
├── capabilities/
│   └── capability-registry.ts        → buildCapabilities(), CAPABILITY_FLAGS, BUSINESS_CAPABILITIES
├── models/
│   └── canonical-models.ts           → 14 canonical data models
├── mapping/
│   └── mapping-framework.ts          → Mapper, MappingRegistry, TRANSFORMERS
├── errors/
│   └── provider-errors.ts            → 10 typed error classes
├── retry/
│   └── retry-framework.ts            → RetryCircuitBreaker, withRetry(), RetryPolicy
├── sdk/
│   ├── pagination.ts                 → Paginate all, cursor/page state
│   ├── request.ts                    → makeRequest(), makePaginatedRequest()
│   ├── auth.ts                       → getAuthHeaders(), isTokenExpired()
│   ├── webhook.ts                    → Build webhook payloads, verify signatures
│   ├── polling.ts                    → pollUntil(), pollJobStatus()
│   ├── mapping.ts                    → mapToCanonical(), mapFromCanonical()
│   ├── validation.ts                 → validate(), validateOrThrow(), isEmail, isUrl...
│   ├── metrics.ts                    → trackProviderMetric(), trackApiCall()
│   └── logging.ts                    → logProviderInfo/Warn/Error
├── mock/
│   └── mock-providers.ts             → 14 mock providers (one per category)
└── index.ts                          → Barrel exports
```

## Inheritance Hierarchy

```
IntegrationProvider (interface from src/server/integrations/)
└── BaseProvider (abstract class)
    ├── ERPProviderBase          → implements ERPProvider
    ├── BankProviderBase         → implements BankProvider
    ├── AccountingProviderBase   → implements AccountingProvider
    ├── CRMProviderBase          → implements CRMProvider
    ├── PayrollProviderBase      → implements PayrollProvider
    ├── HRProviderBase           → implements HRProvider
    ├── IdentityProviderBase     → implements IdentityProvider
    ├── EmailProviderBase        → implements EmailProvider
    ├── StorageProviderBase      → implements StorageProvider
    ├── PaymentProviderBase      → implements PaymentProvider
    ├── TaxProviderBase          → implements TaxProvider
    ├── AIProviderBase           → implements AIProvider
    ├── MessagingProviderBase    → implements MessagingProvider
    └── DocumentProviderBase     → implements DocumentProvider
```

## BaseProvider Responsibilities

| Concern | Implementation |
|---|---|
| Lifecycle | `initialize()`, `destroy()` |
| Auth | `authenticate()`, `validateConnection()`, `refreshConnection()` |
| Health | `checkHealth()`, `diagnose()` |
| Sync | `sync()`, `syncFull()`, `syncIncremental()` |
| Capabilities | Abstract `getCapabilities()` |
| Metrics | `recordMetric()`, `recordHistogram()` |
| Logging | `log()` at info/warn/error |
| Tracing | `createSpan()` for distributed tracing |
| Retry | `withRetry()` with configurable policy + circuit breaker |
| Events | `emitEvent()` for domain events |
| Discovery | `discover()`, `test()` |

## Authentication Strategies

| Strategy | File | Methods |
|---|---|---|
| OAuth2 | `strategies/oauth2.ts` | authorizeClient, authorizeCode, refreshAccessToken, storeTokens, getValidToken |
| Client Credentials | `strategies/client-credentials.ts` | obtainToken, getCachedToken, cacheToken |
| Authorization Code | `strategies/authorization-code.ts` | buildAuthorizationUrl, exchangeAuthorizationCode |
| API Key | `strategies/api-key.ts` | buildAuthHeader, validateApiKey, maskApiKey |
| Bearer Token | `strategies/bearer-token.ts` | buildAuthHeader, extractBearerToken |
| JWT | `strategies/jwt.ts` | sign, verify |
| Basic Auth | `strategies/basic-auth.ts` | buildAuthHeader, decodeAuthHeader |
| Mutual TLS | `strategies/mutual-tls.ts` | getTlsOptions, isMutualTlsConfigured |

## Canonical Models

14 models in `models/canonical-models.ts`:
- Customer, Vendor, Invoice, Payment, PurchaseOrder, Journal
- BankAccount, Transaction, Employee, Asset, TaxRecord, Attachment
- PaymentTerms, Address

## Error Classes

| Error | Retryable | When |
|---|---|---|
| AuthenticationError | No | Auth failures |
| ConnectionError | Yes | Network/connectivity |
| RateLimitError | Yes | API rate limits |
| ValidationError | No | Invalid data |
| ConflictError | No | Version conflicts |
| SyncError | Yes | Sync failures |
| WebhookError | Yes | Webhook delivery |
| TimeoutError | Yes | Request timeout |
| SerializationError | No | Data format issues |

## Retry Framework

- `RetryPolicy`: maxRetries, baseDelayMs, maxDelayMs, jitter, exponentialBase
- `calculateBackoff()`: exponential + jitter
- `shouldRetry()`: check attempt count
- `RetryCircuitBreaker`: threshold-based with cooldown
- `withRetry()`: full pipeline with policy, circuit breaker, onRetry callback, dead-letter

## Mock Providers

14 production-quality mocks (one per category) that fully exercise the framework:
- Return realistic fake data with proper types
- Exercise capabilities discovery, sync, and category-specific methods
- Ready for integration tests without real provider credentials

## Vendor Integration Checklist

To add a new vendor connector:
1. Read existing mock provider as template
2. Extend the appropriate category base class (e.g., `ERPProviderBase`)
3. Implement all abstract methods
4. Register provider config via `IntegrationRegistry`
5. Register field mappings via `MappingRegistry`
6. Done — no framework changes needed
