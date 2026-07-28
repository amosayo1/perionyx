---
title: "Validated Workflows"
created: 2026-07-21
tags:
  - type/knowledge
  - domain/workflows
  - domain/product
phase: Phase 20.0
---

# Validated Workflows

Results from the Phase 20.0 enterprise workflow validation — the first product-level evaluation of Perionyx. 14 core workflows evaluated across 10 personas. Only 3 are production-ready.

---

## Summary

| Metric | Value |
|--------|-------|
| Workflows evaluated | 14 |
| Production-ready | 3 (21%) |
| Near-ready (minor gaps) | 4 (29%) |
| Partial (significant gaps) | 5 (36%) |
| Broken (major blockers) | 2 (14%) |
| Average trust score | 6.4/10 |

## Production-Ready Workflows (3)

These workflows are end-to-end functional with proper error handling, audit logging, and state persistence.

| # | Workflow | Persona | Trust Score | Notes |
|---|----------|---------|-------------|-------|
| 1 | View Cash Dashboard | CFO, Treasurer | 8.2/10 | Real-time data, proper formatting, responsive |
| 2 | View Audit Logs | Auditor | 7.8/10 | Complete trail, search, export, filter |
| 3 | Manage Business Rules | Finance Manager | 7.1/10 | CRUD works, in-memory (data loss on restart) |

## Near-Ready Workflows (4)

These workflows function but have minor gaps — missing data freshness indicators, incomplete error recovery, or UX friction.

| # | Workflow | Persona | Trust Score | Gap |
|---|----------|---------|-------------|-----|
| 4 | Morning Briefing | CFO | 6.9/10 | Missing data freshness indicators |
| 5 | Approve Payment | Treasurer | 6.5/10 | Approval works but submission to bank is disconnected |
| 6 | View Approval Matrix | Finance Manager | 6.3/10 | Matrix evaluation works but escalation paths incomplete |
| 7 | Configure Scheduler | Finance Manager | 6.1/10 | Scheduling works but PgBoss integration has edge cases |

## Partial Workflows (5)

These workflows have significant gaps — module outputs don't connect to next module inputs, state doesn't persist, or critical steps are missing.

| # | Workflow | Persona | Trust Score | Gap |
|---|----------|---------|-------------|-----|
| 8 | Month-End Close | Controller | 5.8/10 | Manual checklist, no persistence, no automation |
| 9 | Reconcile Transactions | Controller | 5.5/10 | Matching algorithm exists but workflow orchestration missing |
| 10 | Submit Expense Report | Finance Manager | 5.2/10 | Form works but approval routing and GL posting disconnected |
| 11 | Generate Financial Report | CFO | 5.0/10 | Data aggregation works but formatting and distribution broken |
| 12 | Policy Exception Handling | Compliance | 4.8/10 | Detection works but resolution workflow has no orchestration |

## Broken Workflows (2)

These workflows have major blockers — they cannot be completed end-to-end.

| # | Workflow | Persona | Trust Score | Blocker |
|---|----------|---------|-------------|---------|
| 13 | Full Payment Lifecycle | Treasurer | 4.2/10 | Approval → bank submission → reconciliation chain is broken |
| 14 | ERP Data Sync | Controller | 3.8/10 | Connector framework exists but no working ERP integration |

## Persona Coverage

| Persona | Workflows Covered | Average Score | Coverage |
|---------|-------------------|---------------|----------|
| CFO | 3 | 6.7/10 | Partial — strong dashboard, weak workflows |
| Treasurer | 2 | 5.4/10 | Weak — payment lifecycle broken |
| Controller | 3 | 5.0/10 | Weak — month-end close manual |
| Finance Manager | 3 | 6.5/10 | Moderate — rules/matrix work, expense disconnected |
| Auditor | 1 | 7.8/10 | Strong — audit logs are solid |
| Compliance Officer | 1 | 4.8/10 | Weak — exception handling incomplete |
| Finance Analyst | 1 | 5.0/10 | Weak — reporting partially broken |

## Top Blockers by Priority

1. **Dual GL architecture** — Two separate GL implementations make month-end close unreliable
2. **In-memory data stores** — Business rules, approval matrix, scheduler data lost on restart
3. **Missing workflow orchestration** — No service tracks multi-step workflow state
4. **Disconnected payment flow** — Approval works, bank submission doesn't
5. **No ERP integration** — Connector framework exists but zero working integrations

## Related

- [[07-Enterprise-Workflows/index|Enterprise Workflows]] — the workflow automation layer
- [[09-Customer-Discovery/index|Customer Discovery]] — personas and pain points
- [[05-Engineering/Lessons/28-modules-are-not-workflows|Modules Are Not Workflows]] — the lesson from this validation
- [[12-Roadmaps/ProductRoadmap/phase-20-findings|Phase 20 Findings]] — product roadmap implications
