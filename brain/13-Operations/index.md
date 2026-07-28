---
title: Operations
created: 2026-07-26
updated: 2026-07-26
tags: [index, operations, deployment, monitoring, runbooks, incident-response]
owner: platform-team
status: active
---

# Operations

## Purpose

Deployment, monitoring, incident response, and operational runbooks for running Perionyx in production. Covers Docker, Kubernetes, CI/CD pipelines, observability, and maintenance procedures.

**Authority:** Medium — operational procedures evolve with infrastructure; always verify against current deployment state.

## Summary

The Operations folder consolidates everything required to deploy, monitor, and maintain Perionyx. Includes 11 deployment docs, 8 operational runbooks, Docker/K8s configuration, CI/CD pipeline definitions, and monitoring setup from Phase 7F and Phase 11B.

## Content Map

| File | Description | Size |
|------|-------------|------|
| [[13-Operations/deployment-guides\|Deployment Guides]] | Production deployment procedures, Docker, K8s | Large |
| [[13-Operations/docker-configuration\|Docker Configuration]] | Multi-stage Dockerfile, docker-compose (dev + prod) | Medium |
| [[13-Operations/kubernetes\|Kubernetes]] | Deploy, ingress, secrets, HPA, PDB, network policies | Medium |
| [[13-Operations/cicd-pipelines\|CI/CD Pipelines]] | GitHub Actions: ci.yml, deploy.yml — typecheck, lint, test, build, security, deploy | Medium |
| [[13-Operations/monitoring\|Monitoring Setup]] | Prometheus metrics, structured logging, OpenTelemetry | Medium |
| [[13-Operations/incident-response\|Incident Response]] | Escalation procedures, severity levels, communication templates | Medium |
| [[13-Operations/runbooks\|Runbooks]] | 8 operational runbooks (deploy, rollback, recovery, monitoring, scaling, maintenance, oncall, checklist) | Large |
| [[13-Operations/maintenance\|Maintenance Procedures]] | Scheduled maintenance, dependency updates, database migrations | Small |
| [[13-Operations/on-call\|On-Call Guides]] | On-call rotation, escalation, diagnostic procedures | Small |

### Operational Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| Dockerfile | `Dockerfile` (multi-stage, healthcheck) | Production |
| Docker Compose | `docker-compose` (dev + prod profiles) | Production |
| Kubernetes | `k8s/` (deploy, ingress, secrets, ConfigMap, HPA, PDB, network policies, PVC) | Production |
| CI Pipeline | `.github/workflows/ci.yml` | Production |
| Deploy Pipeline | `.github/workflows/deploy.yml` | Production |
| Observability | `src/server/observability/` (metrics, tracing, logging) | Production |
| Health Checks | `src/server/ha/` (health, readiness, liveness) | Production |

## Navigation

| Folder | Relationship |
|--------|-------------|
| [[08-Security/index\|08-Security]] | Security policies govern operational access |
| [[05-Architecture/index\|05-Architecture]] | Architecture decisions shape deployment topology |
| [[06-Platform/index\|06-Platform]] | Platform capabilities determine operational requirements |

## Related

- [[08-Security/index\|08-Security]] — Security audit findings that affect operations
- [[12-Roadmaps/index\|12-Roadmaps]] — Phase 7F (Production Readiness) and 11B (Installation & Deployment)
- [[17-Lessons/index\|17-Lessons]] — Operational lessons learned
- [[00-Constitution/index\|00-Constitution]] — Deployment Constitution (5 models, blue-green, canary)
