# Known Limitations

**Phase:** 8E.5
**Last Updated:** July 8, 2026

---

## Purpose

This document catalogs all known product, infrastructure, and operational limitations at launch. Each limitation includes severity, workaround, and remediation timeline.

---

## Product Limitations

### L1 — No Month-End Close Workflow

| Field | Value |
|---|---|
| **Severity** | P1 — High |
| **Description** | No consolidated close checklist. Controllers must manually traverse 4+ domains (transactions, reconciliation, reports, audit-logs) to complete month-end close. |
| **Workaround** | Manual navigation across pages. Users can create a bookmark checklist. |
| **Remediation** | Month-end close dashboard — targeted for 12-month horizon. |
| **Evidence** | `docs/product/workflow-validation.md` — P1.3 |
| **Status** | Accepted — post-launch sprint |

### L2 — Dashboard Has No Loading Skeleton

| Field | Value |
|---|---|
| **Severity** | P1 — High |
| **Description** | CFO dashboard (10 zones) has no Suspense boundary. On slow connections, users see a blank page until all data fetches resolve. |
| **Workaround** | Fast connection mitigates this. No user-facing workaround. |
| **Remediation** | Add Suspense boundaries with per-zone skeleton loaders. |
| **Evidence** | `docs/product/workflow-validation.md` — P1.1 |
| **Status** | Accepted — post-launch sprint |

### L3 — Audit Log Hardcoded to 200 Entries

| Field | Value |
|---|---|
| **Severity** | P1 — High |
| **Description** | Audit log page loads a hardcoded 200 entries with no pagination, cursor, or date-range filtering. |
| **Workaround** | Use API directly with custom query parameters. |
| **Remediation** | Add server-side pagination with page-size selector. |
| **Evidence** | `docs/product/workflow-validation.md` — P1.4 |
| **Status** | Accepted — post-launch sprint |

### L4 — No Team Workload View in Approvals

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | Finance Manager cannot see per-team-member approval load. Aggregate count only. |
| **Workaround** | None. |
| **Remediation** | Add team-member breakdown to approvals page. |
| **Evidence** | `docs/product/workflow-validation.md` — P2.5 |
| **Status** | Accepted — post-launch refinement |

### L5 — KPI Values Not Clickable

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | Dashboard KPI cards display values but have no navigation links to underlying data sources. |
| **Workaround** | Use the sidebar or ⌘K palette to navigate to source pages. |
| **Remediation** | Add navigation links to all KPI cards. |
| **Evidence** | `docs/product/workflow-validation.md` — P2.1 |
| **Status** | Accepted — post-launch refinement |

### L6 — FX Rates Buried in Admin Section

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | FX rates page is under `/admin/fx` (Admin nav section), not linked from Treasury context. |
| **Workaround** | Navigate to Admin > FX Rates. |
| **Remediation** | Add FX rates widget to treasury dashboard. |
| **Evidence** | `docs/product/workflow-validation.md` — P2.2 |
| **Status** | Accepted — post-launch refinement |

### L7 — Reconciliation Exceptions Disconnected

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | Reconciliation exception items have no navigation links to source transactions. |
| **Workaround** | Copy transaction ID and search manually. |
| **Remediation** | Add transaction ID links on exception items. |
| **Evidence** | `docs/product/workflow-validation.md` — P2.4 |
| **Status** | Accepted — post-launch refinement |

### L8 — No Data Freshness Indicators

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | Aggregate views (dashboard, wallets, reconciliation) do not display "last updated" timestamps. Users cannot tell if data is current. |
| **Workaround** | Refresh the page to ensure latest data. |
| **Remediation** | Add "last updated Xm ago" badge to all aggregate views. |
| **Evidence** | `docs/product/workflow-validation.md` — P2.6 |
| **Status** | Accepted — post-launch refinement |

### L9 — Silent Failure on Approve/Reject

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | Transaction detail page logs approve/reject errors to console but shows no user-facing error message. User cannot tell if action succeeded. |
| **Workaround** | Check browser console or refresh and verify status. |
| **Remediation** | Surface API errors as toast notifications in both approval paths. |
| **Evidence** | `docs/product/workflow-validation.md` — P2.7 |
| **Status** | Accepted — post-launch refinement |

### L10 — Localization Adoption (0.4%)

| Field | Value |
|---|---|
| **Severity** | P1 — High (for MENA market entry) |
| **Description** | Only 5/1,241 files (0.4%) use the i18n system. ~3,500 hardcoded English strings remain. |
| **Workaround** | Platform is English-only at launch. |
| **Remediation** | Dedicated localization adoption sprint (estimated 3-4 sprints for full coverage). |
| **Evidence** | `docs/certification/final-enterprise-certification.md` |
| **Status** | Accepted — prioritized for post-launch |

---

## Infrastructure Limitations

### I1 — No Error Tracking

| Field | Value |
|---|---|
| **Severity** | P1 — High |
| **Description** | No Sentry or equivalent error tracking configured. Unhandled errors are invisible unless reported by users. |
| **Workaround** | Manual log inspection. |
| **Remediation** | Configure Sentry (free tier). Estimated 1 day. |
| **Status** | Planned — pre-GA sprint |

### I2 — No APM / Performance Monitoring

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | No application performance monitoring. Cannot detect slow queries, memory leaks, or performance regressions proactively. |
| **Workaround** | Manual log analysis. |
| **Remediation** | Configure Sentry Performance or Grafana. Estimated 2 days. |
| **Status** | Planned — post-GA |

### I3 — No Log Aggregation

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | Logs go to stdout only. No centralized log search, no retention policy, no alerting from logs. |
| **Workaround** | Direct docker log access. |
| **Remediation** | Configure log shipping (Axiom, Grafana Loki, Datadog). Estimated 1 day. |
| **Status** | Planned — post-GA |

### I4 — No Load Testing Baseline

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | No load testing has been performed. Performance under concurrent user load is unknown. |
| **Workaround** | None. |
| **Remediation** | Run k6 or Artillery load tests. Establish baseline. Estimated 2 days. |
| **Status** | Planned — pre-GA |

### I5 — No CI/CD Pipeline

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | No automated CI/CD. All deployments are manual. Increases risk of human error. |
| **Workaround** | Manual deploy per runbook. |
| **Remediation** | Configure GitHub Actions CI/CD. Estimated 1-2 days. |
| **Status** | Planned — pre-GA sprint |

### I6 — Health Check Only Checks Database

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | `/api/health` only pings the database. Does not verify PgBoss, Redis, or external dependencies. |
| **Workaround** | Manual check of each dependency. |
| **Remediation** | Enhance health check to include PgBoss, Redis, external integrations. Estimated 1 day. |
| **Status** | Planned — pre-GA sprint |

---

## Operational Limitations

### O1 — No On-Call Schedule

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | No formal on-call rotation. P0 incidents rely on whoever is available. |
| **Workaround** | Slack group notification. |
| **Remediation** | Establish on-call rotation with pager notification. Estimated 1 day. |
| **Status** | Planned — pre-GA |

### O2 — No Status Page

| Field | Value |
|---|---|
| **Severity** | P3 — Low |
| **Description** | No public status page for incident communication. |
| **Workaround** | Email and Slack for incident updates. |
| **Remediation** | Set up status page (Better Uptime, Instatus). Estimated 1 day. |
| **Status** | Planned — post-GA |

### O3 — No Formal Backup Verification Cadence

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | Backup strategy is documented but restore verification is not on a regular schedule. |
| **Workaround** | Manual restore test before major releases. |
| **Remediation** | Schedule weekly automated restore tests. Estimated 1 day. |
| **Status** | Planned — pre-GA |

---

## Security Limitations

### S1 — No Automated Vulnerability Scanning

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | No automated dependency vulnerability scanning in CI/CD. |
| **Workaround** | Manual `pnpm audit` before releases. |
| **Remediation** | Add Trivy/Docker Scout to CI pipeline. Estimated 1 day. |
| **Status** | Planned — pre-GA |

### S2 — No Penetration Testing

| Field | Value |
|---|---|
| **Severity** | P2 — Medium |
| **Description** | No external penetration testing has been performed. |
| **Workaround** | Internal security review per SSDLC. |
| **Remediation** | Schedule third-party penetration test before GA launch. Estimated 2-3 weeks. |
| **Status** | Planned — pre-GA |

---

## Limitation Summary

### By Severity

| Severity | Count | Key Items |
|---|---|---|
| P1 — High | 5 | L1 (close workflow), L2 (skeletons), L3 (audit pagination), L10 (localization), I1 (error tracking) |
| P2 — Medium | 15 | L4-L9 (UX refinements), I2-I6 (monitoring/deploy), O1/O3 (ops), S1/S2 (security) |
| P3 — Low | 1 | O2 (status page) |

### By Domain

| Domain | Count |
|---|---|
| Product UX | 10 |
| Infrastructure/Monitoring | 6 |
| Operations | 3 |
| Security | 2 |

### Launch Impact Assessment

| Limitation | Launch Blocker? | Rationale |
|---|---|---|
| P1 product limitations (L1-L3, L10) | No | Workarounds exist; English-only is acceptable for initial pilot |
| P1 infrastructure (I1 — error tracking) | **Recommended** | Without error tracking, critical bugs may go undetected |
| P2 infrastructure (I2-I6) | No | Acceptable risk for pilot; address before GA |
| P2 operations (O1, O3) | No | Manual processes sufficient for pilot |
| P2 security (S1, S2) | No | Acceptable risk for pilot; address before GA |

---

## References

- `docs/launch/enterprise-launch-certification.md` — Launch certification with risk register
- `docs/launch/production-readiness.md` — Production readiness assessment
- `docs/product/workflow-validation.md` — Workflow validation findings
- `docs/certification/final-enterprise-certification.md` — Certification report
- `docs/product/feature-validation-matrix.md` — Feature validation
- `docs/product/future-roadmap.md` — Remediation timeline
