---
title: "Phase 20 Findings — Product Roadmap Impact"
created: 2026-07-21
tags:
  - type/roadmap
  - domain/product
  - status/active
phase: Phase 20.0
---

# Phase 20 Findings — Product Roadmap Impact

How the Phase 20.0 workflow validation reshapes the product roadmap. The validation proved that Perionyx has extraordinary building blocks but needs focused workflow completion before it can ship to customers.

---

## Current Status

| Dimension | Score | Verdict |
|-----------|-------|---------|
| Product readiness | 3.34/5 (67%) | Conditional |
| Workflow trust | 6.4/10 | Needs improvement |
| Experience compliance | 4.8/10 | Below threshold |
| Persona coverage | 6.2/10 | Inconsistent |

## Readiness Matrix

| Milestone | Ready? | Blocker |
|-----------|--------|---------|
| Internal demo | **Yes** | — |
| Beta | **Conditional** | Top 5 workflows need wiring |
| Production | **No** | Dual GL, in-memory stores, workflow orchestration |
| Enterprise | **No** | MFA, distributed rate limiting, audit completeness |

## Recommended Next Steps

### P0 — Workflow Completion (Weeks 1–12)

Focus exclusively on wiring existing modules into complete workflows. No new modules.

| Priority | Workflow | Effort | Impact |
|----------|----------|--------|--------|
| 1 | Month-End Close | 4 weeks | Enables Controller persona |
| 2 | Payment Lifecycle (approval → bank → reconcile) | 3 weeks | Enables Treasurer persona |
| 3 | Morning Briefing (with data freshness) | 2 weeks | Completes CFO daily workflow |
| 4 | Policy Exception Handling | 2 weeks | Enables Compliance persona |
| 5 | Financial Report Generation | 1 week | Completes CFO reporting workflow |

### P1 — Data Persistence (Weeks 5–16)

Replace in-memory stores with Postgres-backed persistence for critical data.

| Item | Effort | Impact |
|------|--------|--------|
| Business rules → Postgres | 2 weeks | Survives restart, enables multi-instance |
| Approval matrix → Postgres | 2 weeks | Survives restart, enables audit |
| Scheduler state → Postgres | 1 week | Survives restart, enables monitoring |
| Dual GL consolidation | 4 weeks | Eliminates confusion, enables reliable close |

### P2 — Trust & Compliance (Weeks 13–24)

Raise Experience Constitution compliance from 4.8/10 to ≥7.0/10.

| Item | Effort | Impact |
|------|--------|--------|
| Data freshness indicators on all dashboards | 2 weeks | CFOs know if data is stale |
| Error recovery UX on all workflows | 3 weeks | Users can retry failed steps |
| Audit trail completeness | 3 weeks | Every action logged end-to-end |
| Workflow progress persistence | 2 weeks | Users can resume interrupted workflows |

### P3 — Enterprise Readiness (Weeks 20–36)

Address enterprise blockers for production deployment.

| Item | Effort | Impact |
|------|--------|--------|
| ERP connector (first working integration) | 6 weeks | Unblocks Controller persona |
| Distributed rate limiting | 2 weeks | Production-ready API protection |
| MFA enforcement | 2 weeks | Enterprise security requirement |
| Postgres read replicas | 2 weeks | Performance at scale |

## Timeline to Production

```
Week 1–12:   P0 — Workflow Completion (top 5 workflows)
Week 5–16:   P1 — Data Persistence (in-memory → Postgres)
Week 13–24:  P2 — Trust & Compliance (Experience Constitution ≥7.0)
Week 20–36:  P3 — Enterprise Readiness (ERP, MFA, rate limiting)
```

**Estimated production readiness**: ~36 weeks from Phase 20.0 (April 2027)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Workflow wiring takes longer than estimated | High | Delays production by 4–8 weeks | Prioritize top 5 only; defer lower workflows |
| Dual GL consolidation breaks existing functionality | Medium | Blocks month-end close workflow | Feature flag, extensive testing, rollback plan |
| ERP integration more complex than estimated | High | Blocks Controller persona permanently | Start with one ERP (e.g., SAP), build adapter pattern |
| Team velocity lower than assumed | Medium | Timeline extends to 48 weeks | Reduce scope to top 3 workflows for MVP |

## What NOT to Build

Based on the validation, these items should be deferred:

- New modules (investments, risk, compliance) — complete existing workflows first
- New UI components — the component library is sufficient
- New AI features — wire existing AI into workflows instead
- Mobile-first features — desktop workflows must work before mobile

## Key Insight

> "A-grade building blocks assembled into a B-minus product."

The platform has extraordinary breadth (460 routes, 64 modules, 402 APIs) but the validation revealed a gap between architectural ambition and end-to-end workflow completeness. The fix is not more building — it's more wiring.

## Related

- [[13-Knowledge/WorkflowKnowledge/validated-workflows|Validated Workflows]] — detailed workflow scores and gaps
- [[12-Roadmaps/evolution-timeline|Evolution Timeline]] — Phase 20.0 entry
- [[05-Engineering/Lessons/28-modules-are-not-workflows|Modules Are Not Workflows]] — the lesson
- [[09-Customer-Discovery/index|Customer Discovery]] — validated pain points
