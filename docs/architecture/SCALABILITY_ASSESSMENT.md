---
title: "Scalability Assessment — Phase 25.5"
created: 2026-07-27
updated: 2026-07-27
tags: [type/report, domain/scalability, status/complete]
owner: Architecture Team
---

# Scalability Assessment — Phase 25.5

**Overall Score: 5.5/10**

## Executive Summary

The Perionyx platform demonstrates strong foundational architecture (circuit breakers, graceful shutdown, tiered caching) but has significant scalability constraints that limit it to single-tenant or small multi-tenant deployments. The primary bottlenecks are: (1) in-memory state in Maps and singletons prevents horizontal scaling, (2) no database partitioning or connection pool tuning, (3) the Company God Object (346 fields) creates query overhead, and (4) no multi-region consideration. The platform can support ~50 concurrent users per process; beyond that, memory pressure and cache fragmentation degrade performance. Achieving enterprise scale (1,000+ concurrent users) requires addressing the 5 Critical bottlenecks identified below.

## 1. Database

### Current State

| Metric | Value | Assessment |
|--------|-------|------------|
| Prisma Models | 389 | Heavy — many could be consolidated |
| Indexes | 974 | Well-indexed but index maintenance overhead grows with write volume |
| Migrations | 56 | Mature migration history |
| Schema Lines | 12,000+ | Large schema, compile times impact DX |
| Monetary Fields | 96 Decimal(38,12) | Correct precision but storage-heavy |

### Bottlenecks

**Company God Object (346 fields)**
The `Company` model has accumulated 346 fields across all domains (identity, treasury, banking, ERP, compliance, preferences, settings). Every query touching Company loads a massive row regardless of which fields are needed. This creates:
- Slow row-level operations (large tuples = more I/O)
- ORM hydration overhead (346 fields → JavaScript object)
- Migration complexity (adding any domain field touches the largest table)
- Index bloat (covering indexes on frequently-queried fields become enormous)

**No Partitioning**
All data lives in unpartitioned tables. The `ProcurementAPAuditRecord` (append-only, projected 100K+ rows/year per tenant), `AuditLog`, and transaction history tables will degrade as they grow. No table-level partitioning strategy exists.

**No Soft Delete**
Hard deletes on financial records violate audit requirements. No `deletedAt` pattern or archival strategy exists. Active queries must scan the full table.

**Connection Pooling**
Prisma uses default connection pool settings (`connection_limit=num_cpus * 2 + 1`). No explicit configuration for:
- Pool sizing based on deployment environment
- Connection timeout tuning
- Idle connection management
- Read replica routing

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P0 | Decompose Company into domain-specific config tables (CompanyIdentity, CompanyTreasury, CompanyBanking, etc.) | 10x query performance on Company-touching operations |
| P1 | Add soft delete (`deletedAt` DateTime?) to all mutable entities | Audit compliance + safe recovery |
| P1 | Implement table partitioning for audit logs, transactions, and time-series data | Query performance stays constant as data grows |
| P2 | Configure Prisma pool: `connection_limit`, `pool_timeout`, `idle_timeout` | Prevent connection exhaustion under load |
| P3 | Add read replica routing for GET-heavy workloads | Horizontal read scaling |

## 2. API & HTTP Layer

### Current State

| Feature | Status | Notes |
|---------|--------|-------|
| Cache-Control headers | Partial | 18 read endpoints have tiered TTL; most routes do not |
| Response compression | Absent | No gzip/brotli; large JSON payloads transfer uncompressed |
| ETag support | Absent | Clients cannot cache; repeated full downloads |
| Request validation | Mixed | ~60% Zod, ~40% manual parsing |
| Rate limiting | IP-based only | No per-user or per-tenant limiting |
| Request logging | Structured | Correlation IDs, timing; no sampling |

### Bottlenecks

**Missing Cache Headers on Most Routes**
Only 18 of 272+ endpoints have Cache-Control headers. Browser and CDN caching is largely unused. Repeated page loads trigger full server-side rendering.

**No Response Compression**
API responses average 5-15KB for list endpoints, 50-200KB for dashboard aggregations. Without compression, these transfer at full size. Over slow mobile connections (executive mobile users), this creates perceptible lag.

**No ETag / Conditional Requests**
Every GET request returns the full payload even when data hasn't changed. This wastes bandwidth and DB read capacity.

**Rate Limiting Is IP-Only**
Corporate environments share egress IPs. One user's legitimate load can rate-limit an entire office. Per-user or per-tenant limiting is absent.

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P0 | Add Cache-Control headers to all GET endpoints (tiered by data volatility) | 60-70% reduction in server-side work for repeat views |
| P1 | Enable gzip/brotli compression in Next.js + proxy | 60-80% reduction in payload size |
| P1 | Add ETag support for entity endpoints | Eliminate redundant transfers for unchanged data |
| P1 | Add per-user + per-tenant rate limiting | Fair resource allocation in multi-tenant scenarios |
| P2 | Add response streaming for AI/analytics endpoints | First-byte latency improvement for large responses |
| P3 | Implement API versioning strategy | Enable backward-compatible evolution |

## 3. Memory & In-Memory State

### Current State

| Metric | Count | Assessment |
|--------|-------|------------|
| In-Memory Maps | ~120 | Business state stored in process memory |
| Singletons | 32 | Shared mutable state across requests |
| Event Log Buffers | Unbounded | Capability registry events grow without limit |
| Cache Entries | LRU-bounded | Max 100K entries with 10% eviction |

### Bottlenecks

**120 In-Memory Maps**
Core business data (business rules, approval matrix, automation schedules, template library, connector configs, agent registry) lives in `Map<id, data>` objects. These:
- Reset on process restart (data loss)
- Cannot be shared across processes (single-process only)
- Grow unbounded within a process
- Have no eviction strategy

**32 Singletons with Mutable State**
WorkflowEngine, QueueService, GovernanceService, DecisionService, IntelligenceService, OperationsService, and 26 others maintain internal state as module-level variables. This prevents:
- Horizontal scaling (each process has its own state)
- Graceful rolling restarts (state lost during drain)
- Multi-worker deployments (state inconsistency)

**Unbounded Event Logs in CapabilityRegistry**
The `CapabilityRegistry` maintains an event history that grows with every capability health check, discovery, and status change. No rotation, no max size, no archival.

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P0 | Migrate in-memory Maps to Prisma persistence (Phase 7E models exist) | Enables multi-process, survives restarts |
| P1 | Replace singletons with request-scoped or Prisma-backed instances | Enables horizontal scaling |
| P1 | Add ring-buffer or TTL eviction to CapabilityRegistry events | Prevents memory growth |
| P2 | Audit all 120 Maps; classify as (a) process-cache (OK in-memory), (b) shared-state (must persist) | Targeted migration effort |

## 4. Caching

### Current State

| Layer | Implementation | Status |
|-------|---------------|--------|
| L1 (In-Memory LRU) | `CacheManager` | Working — max 100K entries |
| L2 (Redis) | `CacheManager` optional | Partially configured — not all deployments |
| Cache Keys | Namespaced (entity/query/aggregation/dashboard/metrics/forecast/permission/config/session) | Working |
| TTL Tiers | Critical 5s → Short 30s → Medium 60s → Long 300s → Stale 600s | Defined but not consistently applied |
| Invalidation | Manual per-key | No tag-based invalidation |

### Bottlenecks

**Inconsistent Cache Usage**
Only 18 endpoints use `cacheHeaders()`. The rest bypass the cache tier entirely. Dashboard aggregation, ledger queries, and analytics computations — the most expensive operations — are often uncached.

**No Tag-Based Invalidation**
When a transaction is created, related caches (balance, cash position, ledger) must be individually invalidated. No bulk or tag-based invalidation exists, leading to stale reads.

**LRU Only (No TTL on L1)**
The in-memory LRU evicts on capacity but has no TTL-based expiration. Stale entries can persist until evicted by newer entries. This is acceptable for pure caches but problematic for configuration data that must be fresh.

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P0 | Apply `cacheHeaders()` to all safe GET endpoints | Immediate reduction in compute |
| P1 | Implement tag-based cache invalidation | Correctness on writes |
| P2 | Add TTL to L1 cache entries | Consistency across cache tiers |
| P3 | Consider write-through caching for hot entities | Sub-millisecond reads for frequently accessed data |

## 5. Background Jobs

### Current State

| Component | Status |
|-----------|--------|
| Queue System | PgBoss (Postgres-backed) |
| Active Queues | 8 (sync, forecast, payment, notification, alert, metrics, audit, recommendation) |
| Dead Letter Handling | Working |
| Job Monitoring | API at `/api/v1/queue/jobs` |
| Worker Concurrency | Configurable per queue |

### Assessment

The background job system is the strongest scalability component. PgBoss leverages Postgres for persistence (survives restarts), supports FIFO/priority/delayed/scheduled patterns, and has proper dead-letter routing. 

### Remaining Gaps

- **No job deduplication** — duplicate enqueue creates duplicate work
- **No job priority preemption** — high-priority jobs wait behind queued low-priority jobs
- **No multi-worker coordination** — PgBoss handles this, but the application layer doesn't use `FOR UPDATE SKIP LOCKED` patterns consistently
- **No metrics on job duration** — queue depth is monitored but execution time is not

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P2 | Add idempotency keys to job payloads | Prevent duplicate processing |
| P2 | Add job duration metrics (histogram per job type) | Performance visibility |
| P3 | Implement job priority preemption via separate queues | Critical jobs execute faster |

## 6. Connection Pooling & Network

### Current State

| Component | Configuration |
|-----------|--------------|
| Prisma Connection Pool | Default (`connection_limit = num_cpus * 2 + 1`) |
| PostgreSQL | Single instance, no read replicas |
| Redis | Optional, not required for core functionality |
| HTTP Keep-Alive | Browser default (no explicit config) |
| DNS | No custom resolver |

### Bottlenecks

**No Explicit Pool Configuration**
Default pool sizing doesn't account for:
- Deployment container size (4GB RAM vs 16GB RAM)
- Concurrent request volume
- Long-running queries (analytics, report generation)
- Transaction isolation requirements

**Single PostgreSQL Instance**
No read replica routing. All reads and writes go to the primary. Under load, read-heavy workloads (dashboards, reports, list views) compete with writes for connection pool slots.

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P1 | Configure Prisma pool: `connection_limit=20, pool_timeout=10, idle_timeout=300` | Prevent connection exhaustion |
| P2 | Add read replica for GET endpoints | Offload 70%+ of DB queries from primary |
| P3 | Add connection pool monitoring to observability metrics | Proactive capacity management |

## 7. Horizontal Scaling

### Current State

| Factor | Status | Blocker? |
|--------|--------|----------|
| Stateless HTTP handlers | Mostly yes | — |
| In-memory state in Maps | 120 instances | **Yes** |
| Singleton services | 32 instances | **Yes** |
| Shared file system | Not required | — |
| Session store | In-memory | **Yes** |
| Rate limiter state | In-memory | Minor |

### Assessment

The platform **cannot horizontally scale** in its current state. Running 2+ instances of the Next.js server would create:
- State divergence (each instance has its own Maps, singletons, sessions)
- Cache inconsistency (L1 caches diverge across instances)
- Rate limiting gaps (each instance has independent counters)
- Duplicate job processing (if PgBoss is not configured for leader election)

### Requirements for Horizontal Scaling

| Requirement | Current | Needed |
|-------------|---------|--------|
| External session store | In-memory | Redis or Postgres-backed |
| Shared cache | L1 only | L1 + L2 (Redis) with invalidation |
| External rate limiter | In-memory | Redis-backed sliding window |
| Process state | In-memory Maps | Prisma persistence |
| Job coordination | PgBoss (single leader) | Verify multi-instance PgBoss |

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P0 | Persist in-memory Maps to Prisma | Enables multi-process |
| P1 | Add Redis-backed session store | Enables horizontal scaling |
| P1 | Add Redis-backed rate limiter | Consistent rate limiting across instances |
| P2 | Load test with 2+ instances to validate | Confirm scaling behavior |

## 8. Multi-Region

### Current State

**No consideration.** The platform is designed for single-region deployment. No data residency controls, no cross-region replication, no region-aware routing.

### Assessment

Multi-region is not required for initial launch but must be planned for:
- GDPR data residency (EU customers may require EU-only data storage)
- Latency for global executive users
- Disaster recovery (region failover)

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P3 | Design region-aware tenant configuration (data residency) | GDPR compliance |
| P3 | Plan Postgres logical replication for cross-region DR | Business continuity |
| P3 | Add region identifier to telemetry | Multi-region observability |

## 9. Disaster Recovery

### Current State

| Component | Status |
|-----------|--------|
| Backup Manager | Exists (`src/server/recovery/backup-manager.ts`) |
| Restore Manager | Exists (`src/server/recovery/restore-manager.ts`) |
| Snapshot Manager | Exists (`src/server/recovery/snapshot-manager.ts`) |
| Recovery Drills | Exist but **untested** |
| RPO/RTO | Not defined |
| Backup Encryption | Not implemented |
| Backup Testing | Not automated |

### Assessment

DR infrastructure is architecturally present but operationally unvalidated. The backup manager can take snapshots, the restore manager can apply them, and the drill framework can simulate failures — but none of this has been tested end-to-end against real data. Backup encryption is missing, meaning backup files contain plaintext sensitive data.

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P1 | Execute first recovery drill; document RPO/RTO | Validate DR capability |
| P1 | Encrypt backup files (AES-256-GCM, separate key) | Backup confidentiality |
| P2 | Automate recovery drill in CI (weekly) | Continuous DR validation |
| P2 | Define RPO (1h) and RTO (4h) SLAs | Business commitment |

## 10. Tenant Growth & Resource Isolation

### Current State

| Factor | Status |
|--------|--------|
| Tenant isolation | Logical (companyId filter) |
| Resource limits per tenant | None |
| Noisy neighbor protection | None |
| Tenant-level quotas | None |
| Per-tenant metrics | None |

### Assessment

All tenants share the same compute, memory, database connections, and cache space. A single tenant generating high load (large batch imports, complex analytics, heavy approval workflows) degrades performance for all other tenants. There is no mechanism to:
- Limit a tenant's API call rate beyond IP-based limiting
- Restrict a tenant's database query patterns
- Prioritize one tenant's requests over another's
- Monitor per-tenant resource consumption

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P1 | Add per-tenant rate limiting (tiered by plan) | Prevent noisy neighbor |
| P1 | Add per-tenant metrics (requests, DB queries, job count) | Usage visibility |
| P2 | Implement tenant-level resource quotas | Enforce fair usage |
| P2 | Add tenant-aware connection pool routing | Isolate DB impact |
| P3 | Implement plan-based feature gating | Commercial model support |

## Bottleneck Summary

| # | Bottleneck | Severity | Impact | Estimated Effort |
|---|-----------|----------|--------|-----------------|
| 1 | In-memory Maps (120) prevent horizontal scaling | Critical | Cannot run 2+ instances; data loss on restart | 4-6 weeks |
| 2 | Company God Object (346 fields) | Critical | Slow queries, large joins, migration pain | 2-3 weeks |
| 3 | No database partitioning | High | Query degradation at 100K+ rows per table | 2-3 weeks |
| 4 | Missing cache headers on most routes | High | Unnecessary server-side rendering | 1 week |
| 5 | No response compression | High | Large payloads over slow connections | 1-2 days |

## Target Architecture

For 1,000+ concurrent users:

```
                    ┌─────────────┐
                    │   CDN/Edge   │
                    │  (Cache +    │
                    │  Compression)│
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  Next.js     │
                    │  (2+ workers)│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────┴──────┐ ┌──┴───┐ ┌─────┴─────┐
       │  PostgreSQL  │ │Redis │ │  PgBoss   │
       │  Primary +   │ │Cache │ │  Queue    │
       │  Read Replica│ │      │ │           │
       └─────────────┘ └──────┘ └───────────┘
```

Key changes required:
1. Externalize all in-memory state (Redis or Postgres)
2. Decompose Company God Object
3. Add database partitioning for time-series data
4. Enable compression and caching on all safe endpoints
5. Configure Prisma pool for target concurrency
