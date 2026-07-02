# Phase 9 — Productionization & Connectors

Goal: transform Perionyx from a hardened prototype into a production-ready treasury OS focused on connectors, secret management, reliability, observability, and operator runbooks.

Priorities (MVP -> Nice-to-have):
- Secrets & Keys
  - Vault/KMS integration and rotation workflows (seed, rotate, revoke)
  - Store webhook signing secrets + connector credentials in Vault
  - Add a rotation CLI and automation (rotate-webhook-secret.ts)
- Connectors
  - Implement concrete adapters (ACH, API-based bank connectors, test harness)
  - Connector config encryption and per-company credentials
  - Settlement idempotency + reconciliation store
- Reliability
  - Harden webhook worker: batching, backpressure, metrics, circuit-breaker
  - Dead-letter replay UI + admin controls
  - Delivery SLA monitoring + alerts
- Observability
  - Add structured logs, request tracing, Prometheus metrics, dashboards
  - Export delivery and settlement metrics (attempts, latencies, failures)
- Security & Compliance
  - RBAC review, approval flows, audit trails for settlements
  - Data retention, PI/PCI considerations, secrets rotation policy
- Developer Experience
  - Integration test harness with mock connectors and local Vault (dev container)
  - CI pipeline to run worker-runonce & integration tests
- Ops
  - Terraform templates for DB, app, Vault, and worker
  - Runbooks: incident response, rotation, and replay procedures

Immediate next steps (this session):
1. Finalize Phase 9 plan file (created).
2. Start `Phase 9: Secure secret rotation + KMS/Vault ops` (implement rotation scripts, documented in `docs/phase9-plan.md`).
3. Begin production connector scaffold (interface -> sample adapters) and add integration tests.

Next: start implementing a real connector adapter, scaffold Prometheus metrics, and add delivery/settlement counters.
