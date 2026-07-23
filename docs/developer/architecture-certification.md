# Architecture Certification — Developer Platform

## Certification Question

> If tomorrow Perionyx had:
> - **5,000 developers**
> - **500 enterprise customers**
> - **100 million API requests/day**
> - **Public SDKs**
> - **Public documentation**
> - **Hundreds of webhook subscriptions**
>
> Would any architectural redesign be required?

## Assessment

### API Platform Core

| Concern | Assessment | Verdict |
|---------|-----------|---------|
| Route registration | O(1) Map lookups; no enumeration | ✅ |
| Endpoint metadata | In-memory Map; 5K endpoints ~1MB | ✅ |
| Version negotiation | Simple string comparison; O(1) | ✅ |
| Request pipeline | Pipeline is synchronous transform chain | ✅ |
| Response pipeline | JSON serialization; standard | ✅ |

### Authentication

| Concern | Assessment | Verdict |
|---------|-----------|---------|
| API key validation | O(1) hash lookup; no enumeration | ✅ |
| Token introspection | O(1) hash lookup per token type | ✅ |
| OAuth2 flows | Out of process (next-auth); scalable | ✅ |
| Token storage | In-memory; needs DB for 500K+ tokens | ⚠️ See below |
| Key generation | Web Crypto API; negligible cost | ✅ |

### Webhook Platform

| Concern | Assessment | Verdict |
|---------|-----------|---------|
| Subscription matching | Filter through all subs; O(n) for each event | ⚠️ See below |
| Delivery execution | `fetch()` per webhook; parallel by default | ✅ |
| Retry scheduling | `setTimeout` per retry; 100s of subs OK | ⚠️ See below |
| Signature generation | Simple HMAC; negligible cost | ✅ |

### SDK Architecture

| Concern | Assessment | Verdict |
|---------|-----------|---------|
| SDK packages | Not yet built; architecture defined | ✅ Architecture-ready |
| Client generation | OpenAPI spec enables code gen | ✅ |
| Migration path | Versioned API + SDK version pinning | ✅ |

### Developer Portal

| Concern | Assessment | Verdict |
|---------|-----------|---------|
| Pages | Static content via Next.js SSG | ✅ |
| OpenAPI Explorer | Static JSON download | ✅ |
| Documentation | Static markdown | ✅ |

### Observability

| Concern | Assessment | Verdict |
|---------|-----------|---------|
| Metric collection | Ring buffer (10K max); needs persistence for scale | ⚠️ See below |
| Latency tracking | In-memory per request; O(1) | ✅ |
| Error rate calculation | Aggregation over ring buffer | ⚠️ See below |

### Security

| Concern | Assessment | Verdict |
|---------|-----------|---------|
| Tenant isolation | Enforced at platform + business layers | ✅ |
| Rate limiting | Edge + application; Redis-backed | ✅ |
| Audit logging | In-memory + Prisma; scalable | ✅ |
| Input validation | Zod schemas per endpoint | ✅ |

## Issues Requiring Attention (Not Redesign)

### 1. Token Storage → Database (Medium)
Current in-memory token storage works for development. At 500+ customers and 5K+ API keys, move to Prisma persistence.

**Mitigation**: The existing `api-keys.service.ts` already uses Prisma. The Developer Platform auth layer should integrate with Prisma-backed storage when deployed. No architectural redesign — only a storage backend swap.

### 2. Webhook Subscription Matching → Indexed (Low)
Current O(n) iteration over all subscriptions works for hundreds of subs. At 10K+, add an event→subscription index.

**Mitigation**: Add a `Map<string, Set<string>>` index mapping event types to subscription IDs. This is an optimization, not a redesign. The existing `matchSubscriptions()` function can be extended without API changes.

### 3. Retry Scheduling → Queue-backed (Low)
Current `setTimeout`-based retry works for hundreds of subs. At 10K+ concurrent deliveries, move retry scheduling to PgBoss queue.

**Mitigation**: The existing `pg-boss` queue is already in the project. Webhook retries can be enqueued as jobs. No architectural change — only delivery mechanism swap.

### 4. Metrics Persistence → Prometheus (Medium)
Current ring buffer is development-only. At production scale, metrics should be exported to Prometheus via `prom-client`.

**Mitigation**: The existing observability module already supports `prom-client`. The API observability `recordApiMetric()` function should push to Prometheus histograms/counters instead of the ring buffer. Existing API unchanged.

## Certification Verdict

**✅ PASSED — No architectural redesign required.**

The Developer Platform architecture is sound at the specified scale. Four implementation concerns were identified, all of which are:

- **Storage/optimization swaps**, not architectural changes
- **Non-breaking** — existing API contracts unchanged
- **Already supported** by existing infrastructure (Prisma, PgBoss, prom-client)
- **Addressable as operational improvements** post-deployment

The architecture handles 5,000 developers, 500 enterprise customers, 100M requests/day, public SDKs, public documentation, and hundreds of webhook subscriptions without requiring a redesign of the API Platform Core, Authentication system, Webhook Platform, or Developer Portal.
