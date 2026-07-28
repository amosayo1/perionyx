# Deployment Architecture

**Document Type**: Cross-Cutting Architecture
**Mission**: Define all deployment models, infrastructure requirements, release strategies, and operational procedures for Perionyx — from shared SaaS to customer-managed cloud to future on-premises.
**Status**: Partially Built (Dockerfile, docker-compose, K8s manifests, CI/CD pipelines)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 5 ("Every External Dependency Is Observable"), Law 7 ("Architecture Is Governed Through Automation"), Law 8 ("Every Platform Is Measurable")

---

## Deployment Models

### Model Overview

| Model | Isolation | Control | Cost | Status |
|---|---|---|---|---|
| **Shared SaaS** | Shared DB, row-level tenant isolation | Perionyx managed | Lowest | Current |
| **Dedicated SaaS** | Dedicated DB instance | Perionyx managed | Medium | Planned |
| **Private Cloud** | Dedicated cluster | Customer managed | High | Planned |
| **Customer Managed Cloud** | Customer's cloud account | Joint | High | Planned |
| **On-Premises** | Customer's infrastructure | Customer managed | Highest | Future |

### 1. Shared SaaS (Current)

**Infrastructure**:
- **Compute**: Next.js 16 on Node.js (single process, multi-threaded)
- **Database**: PostgreSQL 15+ (shared instance, row-level isolation)
- **Cache**: Redis 7+ (shared, namespaced by tenant)
- **Queue**: PgBoss (PostgreSQL-based, shared)
- **Storage**: Object storage (S3-compatible, bucket-per-tenant)
- **CDN**: Edge caching for static assets

**Configuration**:
- `DATABASE_URL` — Shared PostgreSQL connection string
- `REDIS_URL` — Shared Redis connection string
- `ENCRYPTION_KEY` — Shared encryption key (AES-256-GCM)
- `LICENSE_COMPANY_ID` — Optional: restrict to single tenant

**Scaling**:
- Vertical: Increase Node.js memory, DB instance size
- Horizontal: Multiple Node.js instances behind load balancer
- DB: Read replicas for read-heavy workloads

**Security**:
- Tenant isolation via `requireTenantContext()` at every data access
- Row-level security in PostgreSQL
- Namespace isolation in Redis
- Encryption at rest for all sensitive data

### 2. Dedicated SaaS

**Infrastructure**:
- **Compute**: Dedicated Node.js process per tenant
- **Database**: Dedicated PostgreSQL instance per tenant
- **Cache**: Dedicated Redis instance per tenant
- **Queue**: Dedicated PgBoss per tenant

**Configuration**:
- Per-tenant environment variables
- Per-tenant encryption keys
- Per-tenant database credentials

**Scaling**:
- Independent scaling per tenant
- No noisy-neighbor risk
- Tenant-specific performance tuning

### 3. Private Cloud

**Infrastructure**:
- **Compute**: Kubernetes cluster (customer-managed)
- **Database**: Customer-managed PostgreSQL
- **Cache**: Customer-managed Redis
- **Queue**: PgBoss on customer PostgreSQL
- **Storage**: Customer-managed S3-compatible storage
- **Networking**: Customer VPC, private subnets

**Configuration**:
- Customer-provided secrets via Kubernetes Secrets or external secrets manager
- Customer-managed TLS certificates
- Customer-controlled network policies

**Security**:
- Customer controls network access
- Customer manages encryption keys (optionally with BYOK)
- Customer controls audit log retention

### 4. Customer Managed Cloud

**Infrastructure**:
- Perionyx deploys into customer's cloud account (AWS/Azure/GCP)
- Customer retains infrastructure ownership
- Perionyx provides managed deployment and updates

**Configuration**:
- Terraform/Pulumi modules for infrastructure provisioning
- Customer IAM roles for deployment access
- Customer-managed secrets with cross-account access

### 5. On-Premises (Future)

**Infrastructure**:
- Docker containers on customer hardware
- Customer-managed PostgreSQL
- Customer-managed Redis
- Air-gapped deployment option

**Configuration**:
- Offline license validation
- Local Docker registry
- Customer-managed updates

---

## Regional Deployment

### Region Strategy

| Region | Location | Latency Target | Status |
|---|---|---|---|
| `us-east-1` | US East (Virginia) | < 100ms | Current |
| `eu-west-1` | EU (Ireland) | < 100ms | Planned |
| `ap-southeast-1` | Asia Pacific (Singapore) | < 150ms | Planned |

### Data Residency

| Regulation | Requirement | Implementation |
|---|---|---|
| GDPR | EU data stays in EU | Region-locked database + storage |
| SOC 2 | Data location documented | Region metadata in tenant config |
| PCI DSS | Card data in compliant regions | Encryption + region restriction |

---

## Release Strategy

### Blue-Green Deployment

```
Current (Blue) ←── Traffic
                   ↓ (cutover)
New (Green)    ←── Traffic
                   ↓ (cleanup)
Old (Blue)     ←── Decommissioned
```

**Process**:
1. Deploy new version to Green environment
2. Run smoke tests against Green
3. Switch traffic from Blue to Green
4. Monitor Green for errors
5. Keep Blue as rollback target (24h)
6. Decommission Blue after validation

### Canary Releases

```
Traffic Split:
  95% → Current version (Stable)
   5% → New version (Canary)
       ↓ (monitor for 1h)
  If healthy: 25% → 50% → 100%
  If errors:  Rollback to Stable
```

**Monitoring During Canary**:
- Error rate < 0.1%
- p95 latency < 500ms
- No new error types
- CPU/memory within normal range

### Rollback Strategy

| Scenario | Rollback | Time | Data Impact |
|---|---|---|---|
| Deployment failure | Blue-green cutover | < 1 min | None |
| Database migration failure | Restore from backup | 5-30 min | Data loss window |
| Configuration error | Revert config + restart | < 5 min | None |
| Code regression | Blue-green cutover | < 1 min | None |
| Security incident | Immediate rollback + session revocation | < 1 min | Depends on incident |

---

## Database Migration Strategy

### Migration Rules

1. **Forward-only**: Migrations are never reversed; new migrations fix issues
2. **Backward compatible**: New columns have defaults; old code works with new schema
3. **Zero-downtime**: Migrations run without blocking reads/writes
4. **Tested**: Every migration tested in staging before production
5. **Reversible design**: Every destructive change has a recovery path

### Migration Workflow

```
1. Write migration (forward-only)
2. Test in staging (pnpm prisma migrate dev)
3. Review migration SQL
4. Deploy application (backward compatible)
5. Run migration (pnpm prisma migrate deploy)
6. Validate (pnpm prisma validate)
7. Monitor (check metrics, error rates)
```

### Large Table Migrations

For tables with millions of rows:
1. Add new column (nullable)
2. Backfill in batches (1000 rows/batch)
3. Add NOT NULL constraint with DEFAULT
4. Remove old column in next release

---

## Zero-Downtime Deploys

### Requirements

1. **No breaking schema changes** — New columns have defaults; old columns removed in next release
2. **No breaking API changes** — New fields are additive; removed fields deprecated first
3. **Health check passes** — New instance passes health check before traffic switch
4. **Graceful shutdown** — Old instance drains connections before termination

### Health Checks

```
Liveness:  GET /api/health/live   → { status: "live" }
Readiness: GET /api/health/ready  → { status: "ready", ready: true/false }
```

- **Liveness**: Process is running (always 200 unless deadlocked)
- **Readiness**: Process can accept traffic (DB connected, cache available, migrations complete)

### Connection Draining

```
1. SIGTERM received
2. Stop accepting new connections
3. Complete in-flight requests (30s timeout)
4. Close database connections
5. Close Redis connections
6. Flush metrics
7. Exit
```

---

## Feature Flags

### Architecture

Feature flags control runtime behavior without deployment:

```typescript
interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
  conditions?: {
    tenants?: string[];     // Specific tenants
    percentage?: number;    // Percentage rollout
    dateRange?: {           // Time-based
      start: Date;
      end: Date;
    };
  };
}
```

### Flag Categories

| Category | Purpose | Example |
|---|---|---|
| **Kill Switch** | Disable feature instantly | `disable_webhooks` |
| **Rollout** | Gradual feature exposure | `enable_ap_v2` (10% → 50% → 100%) |
| **Experiment** | A/B testing | `checkout_flow_v2` |
| **Maintenance** | Temporarily disable | `disable_sync_during_migration` |

---

## Configuration Management

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | No | — | Redis connection string |
| `ENCRYPTION_KEY` | Yes | — | AES-256-GCM key (64 hex chars) |
| `ENCRYPTION_KEY_ID` | No | `v1` | Current key version |
| `ENCRYPTION_KEY_HISTORY` | No | — | Comma-separated historical keys |
| `LICENSE_COMPANY_ID` | No | — | Restrict to single tenant |
| `NEXTAUTH_SECRET` | Yes | — | Session signing secret |
| `NEXTAUTH_URL` | Yes | — | Application URL |
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port |
| `LOG_LEVEL` | No | `info` | Logging level |
| `CACHE_PROVIDER` | No | `memory` | Cache backend |
| `LOCK_PROVIDER` | No | `memory` | Lock backend |
| `PERSISTENCE_PROVIDER` | No | `postgres` | Database adapter |

### Secrets Management

1. **Never commit secrets** — Use environment variables or secret managers
2. **Startup validation** — `src/server/security/secrets.ts` validates all required secrets
3. **Rotation** — Encryption keys support rotation via `ENCRYPTION_KEY_HISTORY`
4. **KMS integration** — Pluggable `KMSProvider` interface for AWS KMS, Azure Key Vault, HashiCorp Vault

---

## CI/CD Pipeline

### Pipeline Stages

```
Source → Build → Test → Security → Deploy → Verify
```

| Stage | Tools | Gate |
|---|---|---|
| **Source** | Git, GitHub | Branch protection |
| **Build** | pnpm, Next.js | `pnpm build` passes |
| **Test** | Vitest | `pnpm test` passes (443+ tests) |
| **Type Check** | TypeScript | `pnpm typecheck` passes |
| **Lint** | ESLint | No errors |
| **Security** | pnpm audit, dependency scanner | No high/critical vulns |
| **Docker** | Multi-stage Dockerfile | Image builds successfully |
| **Deploy** | Kubernetes | Rolling update |
| **Verify** | Health checks, smoke tests | All checks pass |

### Pipeline Files

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | CI pipeline (typecheck, lint, test, build, security) |
| `.github/workflows/deploy.yml` | CD pipeline (deploy to staging/production) |
| `Dockerfile` | Multi-stage production Docker image |
| `docker-compose.yml` | Local development environment |
| `docker/development/` | Development-specific Docker config |
| `docker/production/` | Production-specific Docker config |

### Kubernetes Manifests

| Directory | Purpose |
|---|---|
| `k8s/deployments/` | Application deployment specs |
| `k8s/services/` | Service definitions |
| `k8s/ingress/` | Ingress controller config |
| `k8s/hpa/` | Horizontal pod autoscaler |
| `k8s/pdb/` | Pod disruption budget |
| `k8s/secrets/` | Kubernetes secrets |
| `k8s/configmaps/` | Configuration maps |
| `k8s/namespaces/` | Namespace definitions |
| `k8s/network-policies/` | Network policy rules |
| `k8s/jobs/` | Batch jobs (migrations, seed) |
| `k8s/pv/` | Persistent volume claims |

---

## Observability

### Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `deploy_version_info` | Gauge | version, commit | Current deployment version |
| `deploy_duration_seconds` | Histogram | stage | Deployment stage duration |
| `deploy_success_total` | Counter | environment | Successful deployments |
| `deploy_failure_total` | Counter | environment, reason | Failed deployments |
| `deploy_rollback_total` | Counter | environment, reason | Rollbacks performed |
| `deploy_migration_duration_seconds` | Histogram | migration_name | Migration execution time |

### Deployment Monitoring

1. **Pre-deploy**: Health check baseline, error rate baseline
2. **During deploy**: Pod readiness, connection draining, migration progress
3. **Post-deploy**: Error rate delta, latency delta, custom business metrics
4. **Rollback trigger**: Error rate > 5% increase, p95 latency > 2x baseline

---

## Disaster Recovery

### Backup Strategy

| Component | Frequency | Retention | Method |
|---|---|---|---|
| PostgreSQL | Daily full, hourly incremental | 30 days | `pg_dump` / WAL archiving |
| Redis | Every 6 hours | 7 days | RDB snapshots |
| Object storage | Continuous | 30 days | Versioning + cross-region replication |
| Configuration | On change | 90 days | Git |

### Recovery Objectives

| Metric | Target | Description |
|---|---|---|
| RPO (Recovery Point Objective) | < 1 hour | Maximum data loss |
| RTO (Recovery Time Objective) | < 4 hours | Maximum downtime |
| MTTR (Mean Time To Repair) | < 2 hours | Average repair time |

### Recovery Procedures

| Scenario | Procedure | RTO |
|---|---|---|
| Single pod failure | Kubernetes auto-restart | < 1 min |
| Database failure | Promote read replica | < 5 min |
| Full cluster failure | Restore from backup | < 4 hours |
| Region failure | Cross-region failover | < 1 hour |
| Data corruption | Point-in-time recovery | < 1 hour |

---

## Testing Strategy

| Test Type | Scope | Frequency |
|---|---|---|
| Smoke tests | Critical user flows | Every deployment |
| Integration tests | API endpoints, DB operations | Every deployment |
| Load tests | 1000 concurrent users | Weekly |
| Chaos tests | Pod failure, network partition | Monthly |
| Recovery tests | Backup restore, failover | Quarterly |
| Security scans | Dependency audit, container scan | Every deployment |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Pod crash | Request failures | Kubernetes auto-restart, health checks |
| Database outage | All reads/writes fail | Read replica promotion, connection pooling |
| Redis outage | Cache miss, rate limit degradation | In-memory fallback, graceful degradation |
| Migration failure | Deployment blocked | Rollback migration, fix forward |
| DNS failure | Service unreachable | Health check DNS, multi-AZ |
| Certificate expiry | HTTPS broken | Auto-renewal (cert-manager), monitoring |
| Config error | Application misbehavior | Config validation at startup |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Deployment failure | Blue-green rollback (< 1 min) |
| Database corruption | Point-in-time restore from WAL |
| Full data loss | Restore from daily backup + WAL replay |
| Region outage | Cross-region failover |
| Security incident | Immediate rollback + session revocation + audit |
| Configuration drift | Re-apply from Git (infrastructure as code) |

---

*The Deployment Architecture ensures Perionyx can be delivered reliably, recovered quickly, and scaled confidently across any infrastructure model.*
