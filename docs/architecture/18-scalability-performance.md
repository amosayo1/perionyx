---
title: Scalability & Performance
version: 1.0.0
last_updated: 2026-07-16
status: published
audience: Engineering, DevOps, SRE
---

# Scalability & Performance

## Caching Architecture

Perionyx uses a tiered caching system via `CacheManager` in `src/server/cache/`.

### Cache Tiers

| Tier | Provider | Latency | Eviction | Use Case |
|------|----------|---------|----------|----------|
| L1 | LRU in-memory (`Map`) | <1ms | LRU | Session data, permissions, feature flags |
| L2 | Redis | <5ms | TTL-based | Metrics, dashboard data, cached queries |

### TTL Strategy

TTLs are tiered by data freshness requirements:

| Category | TTL | Stale TTL | Examples |
|----------|-----|-----------|----------|
| Critical | 5s | 600s | Wallet balances, cash positions |
| Fast | 30s | 300s | Transaction lists, approval queues |
| Standard | 120s | 600s | Audit logs, report data |
| Stale | 600s | 1800s | Historical metrics, static config |

Graceful degradation: if Redis is unreachable, CacheManager falls back to LRU in-memory only. All operations continue — at reduced performance — with no data loss.

### Cache Namespaces

Keys are namespaced by purpose for isolation and targeted invalidation:

- `entity:*` — Database entity caches
- `query:*` — Query result caches
- `aggregation:*` — Aggregated metric caches
- `dashboard:*` — Dashboard snapshot caches
- `metrics:*` — Performance metric caches
- `forecast:*` — Forecast result caches
- `permission:*` — Permission evaluation caches
- `config:*` — Configuration caches
- `session:*` — User session caches

## Queue System

Background processing uses PgBoss via the `QueueManager` in `src/server/queues/`.

### Queue Types

| Queue | Type | Concurrency | Jobs |
|-------|------|-------------|------|
| `sync` | FIFO | 5 | Connector data sync |
| `forecast` | Delayed | 2 | Cash flow forecasting |
| `payment` | Priority | 3 | Payment processing |
| `notification` | FIFO | 10 | Email, Slack, in-app |
| `alert` | Priority | 3 | Risk alert processing |
| `metrics` | Scheduled | 2 | Metrics aggregation |
| `audit` | FIFO | 5 | Audit log persistence |
| `recommendation` | Delayed | 1 | Recommendation generation |

### Features

- **Dead-letter routing**: Failed jobs are moved to a DLQ after configurable retries
- **Exponential backoff**: Retry intervals increase (1s, 4s, 15s, 60s, 300s)
- **Concurrency control**: Per-queue worker limits prevent resource exhaustion
- **Job scheduling**: Cron-based and delayed execution via `AutomationScheduler`
- **Batch enqueue**: Bulk job submission for connector syncs

## Database Optimization

### Indexes

18 performance indexes are applied across high-query tables:
- `Transaction`: status + companyId, createdAt, counterpartyId
- `Approval`: status + targetType, approverId + status
- `AuditLog`: companyId + createdAt, actorId, targetType + targetId
- `Wallet`: companyId + currency, accountId
- `RiskAlert`: status + severity + companyId
- `LedgerEntry`: companyId + accountId + period

### JSONB for Flexible Fields

JSONB columns are used where schema flexibility is required:
- Connector configurations
- Report templates
- Workflow step parameters
- Approval matrix conditions
- Policy rule definitions

### Pagination

All list endpoints use cursor-based pagination:
- `cursor` parameter (opaque cursor string)
- `limit` parameter (default 25, max 200)
- Response includes `nextCursor` and `hasMore`

Offset-based pagination is used only for audit logs and historical searches where cursor state is not meaningful.

## Lazy Loading

### React Server Components

All data-fetching pages use React Server Components (RSC):
- Metrics values render first, charts render second
- Page shell renders immediately; data sections render as streams arrive
- Zero client-side data fetching overhead for initial page loads

### Dynamic Imports

Client components use dynamic imports for heavy dependencies:
- Chart components
- Data tables with inline editing
- Form wizards
- AI insight panels
- Analytics dashboards

### Code Splitting

The Next.js App Router automatically code-splits by route segment. Each page bundle includes only the components used on that page.

## Async Processing

### Parallel Database Queries

Nine independent read queries across services are executed in parallel via `Promise.all`. All are read-only operations against different tables — no transaction concern.

### Background Jobs

Non-critical operations are offloaded to background queues:
- Notification delivery (email, Slack, in-app)
- Report generation
- Data export preparation
- Analytics metric aggregation
- Connector health checks

### Response Streaming

AI responses and large report exports use streaming:
- AI commentary uses `ReadableStream` for token-by-token output
- CSV/Excel exports stream rows as they're generated

## CDN Readiness

### Cache Headers

18 read endpoints apply `Cache-Control` headers via `cacheHeaders(ttl)`:

| Endpoint Group | TTL | Cache-Control |
|---------------|-----|---------------|
| Dashboard metrics | 30s | `public, max-age=30, stale-while-revalidate=300` |
| Transaction lists | 15s | `public, max-age=15, stale-while-revalidate=120` |
| Approval queues | 15s | `public, max-age=15, stale-while-revalidate=120` |
| Static analytics | 120s | `public, max-age=120, stale-while-revalidate=600` |

### Stale-While-Revalidate

The `stale-while-revalidate` directive allows CDN edge caches to serve stale content while the origin refreshes in the background. This ensures:
- Instant page loads during traffic spikes
- Background refresh for financial data (stale data labeled in UI)
- Reduced origin load for read-heavy workloads

## Future Scalability

### Read Replicas (Planned)
- Postgres read replicas for GET endpoints
- Connection routing based on query type
- Replica lag monitoring and stale data labeling

### Schema-Based Sharding (Planned)
- Shard by tenant group for multi-region deployments
- Shard key: `companyId` hash
- Cross-shard queries limited to admin/audit operations

### Distributed Rate Limiting (Planned)
- Redis-backed sliding window rate limiter
- Per-tenant, per-endpoint, and per-user quotas
- Distributed counter synchronization
