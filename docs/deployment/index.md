# Perionyx Enterprise Deployment Platform — Documentation

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

This documentation set covers all aspects of deploying, operating, and maintaining the Perionyx Enterprise Finance Platform. It is intended for DevOps engineers, system administrators, and platform operators responsible for production deployments.

## Documentation Map

| # | Document | Audience | Description |
|---|---|---|---|
| 1 | [Installation Guide](./installation-guide.md) | Administrators | System requirements, prerequisites, fresh/upgrade/repair installation, CLI setup, post-installation verification |
| 2 | [Production Deployment](./production-deployment.md) | DevOps | Environment preparation, security hardening, database tuning, Redis, storage, load balancing, SSL/TLS, monitoring, backup |
| 3 | [Docker Guide](./docker-guide.md) | Developers/DevOps | Development and production Docker setup, Compose configuration, health checks, volumes, multi-stage builds |
| 4 | [Kubernetes Guide](./kubernetes-guide.md) | DevOps | Namespace setup, deployments, ConfigMaps, Secrets, PVCs, HPA, ingress, network policies, zero-downtime deployment |
| 5 | [Upgrade Guide](./upgrade-guide.md) | Administrators | Version detection, pre-upgrade checks, migration planning, backup, execution, verification, rollback |
| 6 | [Rollback Guide](./rollback-guide.md) | Administrators | When to rollback, full/partial rollback, database rollback, configuration rollback, verification |
| 7 | [Disaster Recovery](./disaster-recovery.md) | Administrators | Backup strategy, recovery procedures, data restoration, system reconstruction, DR testing, RTOs |
| 8 | [Troubleshooting](./troubleshooting.md) | All | Installation issues, migration failures, connection problems, performance issues, error messages, support |
| 9 | [Operations Manual](./operations-manual.md) | Operators | Daily operations, monitoring checks, backup verification, log management, performance monitoring, capacity planning |
| 10 | [Administrator Guide](./administrator-guide.md) | Administrators | User management, RBAC, security configuration, audit logging, system configuration, feature flags, maintenance |

## Architecture Overview

```
                              ┌──────────────────────────────────────┐
                              │         CDN / CloudFront             │
                              │   Static assets, caching, SSL       │
                              └────────────────┬─────────────────────┘
                                               │
                              ┌──────────────────────────────────────┐
                              │      Load Balancer / Ingress         │
                              │   nginx / AWS ALB / GCP HTTP LB     │
                              └────────────────┬─────────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
         ┌──────────▼──────────┐   ┌──────────▼──────────┐   ┌──────────▼──────────┐
         │   App Pod (x3-10)   │   │   App Pod (x3-10)   │   │   App Pod (x3-10)   │
         │  - Next.js SSR      │   │  - Next.js SSR      │   │  - Next.js SSR      │
         │  - API Routes       │   │  - API Routes       │   │  - API Routes       │
         │  - Queue Workers    │   │  - Queue Workers    │   │  - Queue Workers    │
         └──────────┬──────────┘   └──────────┬──────────┘   └──────────┬──────────┘
                    │                          │                          │
         ┌──────────┴────────────────────────────────────────────────────┴──────────┐
         │                           Internal Network                              │
         └──────────┬────────────────────────────────┬────────────────┬────────────┘
                    │                                 │                │
         ┌──────────▼──────────┐          ┌──────────▼──────────┐     │
         │   PostgreSQL 16     │          │     Redis 7         │     │
         │  - Primary + Replicas│          │  - Cache + Rate Limit│    │
         │  - PgBoss Queue     │          │  - Session Store    │     │
         │  - Read replicas    │          └─────────────────────┘     │
         └─────────────────────┘                                     │
                                                          ┌──────────▼──────────┐
                                                          │   Object Storage    │
                                                          │  - S3 / GCS / Azure│
                                                          │  - Backups / Exports│
                                                          └─────────────────────┘
```

## Environments

| Environment | URL | Postgres | Redis | Scaling |
|---|---|---|---|---|
| Development | `http://localhost:3000` | Local 16 | Local 7 | 1 pod |
| Staging | `https://staging.perionyx.com` | Managed PG (db.t3.medium) | Managed (1GB) | 2 pods |
| Production | `https://app.perionyx.com` | Managed PG (db.r6g.large + replica) | Managed (5GB cluster) | 3-10 pods (HPA) |

## Container Images

| Property | Value |
|---|---|
| Registry | `ghcr.io/organization/perionyx` |
| Tags | `latest`, `v{major}.{minor}.{patch}`, `sha-{commit}` |
| Base | `node:22-alpine` |
| Strategy | Multi-stage (deps → builder → runner) |

## Deployment Workflow

```
Developer Push → CI (typecheck + lint + test + build)
    → Security Scan (Trivy) + Dependency Audit
    → Migration Verification
    → Docker Build + Push
    → Deploy Staging
    → Smoke Tests Pass
    → Deploy Production (rolling update)
    → Health Check + Monitoring Verification
```

## Quick Links

- **CI Pipeline**: `.github/workflows/ci.yml`
- **CD Pipeline**: `.github/workflows/deploy.yml`
- **Docker Compose**: `docker-compose.yml`
- **K8s Manifests**: `k8s/`
- **Infrastructure Config**: `src/server/persistence/config.ts`
- **Health Endpoint**: `GET /api/v1/enterprise/health`
- **Metrics Endpoint**: `GET /api/metrics`
