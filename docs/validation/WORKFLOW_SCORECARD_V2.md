# Phase 20.2 — Workflow Scorecard V2

> **Status**: Complete
> **Type**: Documentation-only — zero code changes
> **Baseline**: Phase 20.0 Scorecard
> **Revalidation**: Phase 20.2

---

## Trust Score Progression

### By Workflow

| # | Workflow | 20.0 Score | 20.2 Score | Delta | Maturity |
|---|---|---|---|---|---|
| 1 | Month-End Close | 6 | 6 | 0 | Functional |
| 2 | Journal Entry Approval | 7 | 7 | 0 | Functional |
| 3 | Treasury Payment Approval | 5 | 5 | 0 | Partial |
| 4 | Cash Forecast Review | 5 | 5.5 | +0.5 | Partial |
| 5 | Bank Reconciliation | 8 | 8 | 0 | Production-Ready |
| 6 | Budget Variance Investigation | 5 | 5.5 | +0.5 | Partial |
| 7 | Compliance Investigation | 6 | 6 | 0 | Functional |
| 8 | Audit Preparation | 5 | 5 | 0 | Partial |
| 9 | Executive Briefing | 7 | **8** | **+1** | **Production-Ready** |
| 10 | Policy Exception | 6 | 6 | 0 | Functional |
| 11 | Financial Reporting | 7 | 7 | 0 | Functional |
| 12 | Order-to-Cash | 7 | 7 | 0 | Functional |
| 13 | Approval Escalation | 6 | 6 | 0 | Functional |
| 14 | Risk Alert Handling | 8 | 8 | 0 | Production-Ready |

### Aggregate

| Metric | Phase 20.0 | Phase 20.2 | Delta | Target |
|---|---|---|---|---|
| Average Trust Score | 6.4 | **6.8** | **+0.4** | 8.0 |
| Production-Ready (8+) | 2 | **3** | **+1** | 12 |
| Functional (6-7) | 7 | 7 | 0 | — |
| Partial (4-5) | 5 | **4** | **-1** | 0 |
| Conceptual (1-3) | 0 | 0 | 0 | 0 |

### Workflows That Improved

| Workflow | Change | Driver |
|---|---|---|
| Executive Briefing | 7 → 8 (+1) | ConfidenceBadge on recommendations, timestamps on KPIs, source labels |
| Cash Forecast Review | 5 → 5.5 (+0.5) | ConfidenceBadge available on insight items |
| Budget Variance Investigation | 5 → 5.5 (+0.5) | ConfidenceBadge available on insight items |

### Workflows Unchanged (11 of 14)

No Phase 20.1 fix directly impacted these workflows:
- Month-End Close, Journal Entry, Treasury Payment, Bank Reconciliation, Compliance Investigation, Audit Preparation, Policy Exception, Financial Reporting, Order-to-Cash, Approval Escalation, Risk Alert Handling

---

## Dimension Scores

### Evidence Visibility (D7)

| Workflow | Phase 20.0 | Phase 20.2 | Change |
|---|---|---|---|
| Executive Briefing | Medium | **High** | **+1** — ConfidenceBadge + source labels |
| Cash Forecast Review | Low | Medium | **+1** — ConfidenceBadge on insights |
| Budget Variance Investigation | Low | Medium | **+1** — ConfidenceBadge on insights |
| All others | unchanged | unchanged | — |

### Confidence (D12)

| Workflow | Phase 20.0 | Phase 20.2 | Change |
|---|---|---|---|
| Executive Briefing | 7 | **8** | **+1** — Confidence scores on recommendations |
| Cash Forecast Review | 5 | 5.5 | **+0.5** — ConfidenceBadge available |
| Budget Variance Investigation | 5 | 5.5 | **+0.5** — ConfidenceBadge available |
| All others | unchanged | unchanged | — |

### Manual Work (D5)

| Workflow | Phase 20.0 | Phase 20.2 | Change |
|---|---|---|---|
| Order-to-Cash | 5/10 | **4/10** | **+1** — Procurement GL integration automates journal entries |
| All others | unchanged | unchanged | — |

---

## Question Pass Rate Progression

| Question | Phase 20.0 | Phase 20.2 | Delta |
|---|---|---|---|
| Q1 — First-time usability | 21% (3/14) | 21% (3/14) | 0 |
| Q2 — Auditor reconstruction | 71% (10/14) | 71% (10/14) | 0 |
| Q3 — CFO evidence understanding | 29% (4/14) | 29% (4/14) | 0 |
| Q4 — Recommendation explainability | 14% (2/14) | **21% (3/14)** | **+7%** |
| Q5 — Approval traceability | 86% (12/14) | 86% (12/14) | 0 |
| Q6 — Interruption recovery | 79% (11/14) | 79% (11/14) | 0 |

### Analysis

Only Q4 (recommendation explainability) improved — from 2/14 to 3/14 Yes answers. This is because ConfidenceBadge provides a confidence score, which is a form of explainability. However, the full rule→evidence→recommendation chain is still missing for most workflows.

Q1 (first-time usability) remains the weakest at 21%. 11 of 14 workflows still lack guided wizards.

---

## Friction Issue Progression

| Category | Phase 20.0 | Phase 20.2 | Resolved | Remaining |
|---|---|---|---|---|
| Critical (WF-001, WF-021, WF-022, WF-002) | 4 | **0** | **4** | 0 |
| High (WF-005-016) | 8 | **4** | **4** | 4 |
| Medium | 8 | 8 | 0 | 8 |
| Low | 5 | 5 | 0 | 5 |
| **Total** | **25** | **17** | **8** | **17** |

### Resolved Issues

| ID | Issue | Severity | Resolution |
|---|---|---|---|
| WF-001 | Dual GL architecture | Critical | Deprecation banners on all 14 `/accounting/` pages |
| WF-021 | No GL integration for procurement/treasury/fixed-assets | Critical | 3 new GLIntegrationService implementations |
| WF-022 | No data freshness indicators | Critical | DataFreshnessIndicator + seededAt timestamps |
| WF-005 | No "What changed?" on KPIs | High | previousValue wired into all 5 dashboard KPIs |
| WF-006 | No timestamps on financial figures | High | lastUpdated + source on all KPI cards |
| WF-007 | No demo data indicator | High | "Demo Data · Seeded · not persisted" badge in sidebar |
| WF-008 | No evidence links on recommendations | High | ConfidenceBadge + sourceUrl/sourceLabel on InsightPanel |
| WF-010 | No undo for destructive actions | High | Global UndoProvider with 8s toast |

### Remaining High Issues

| ID | Issue | Impact |
|---|---|---|
| WF-012 | 19 raw table pages (Fixed Assets + Identity) | EnterpriseTable not applied everywhere |
| WF-003 | In-memory stores lose data on restart | Business rules vanish on restart |
| WF-004 | Disconnected workflows | No end-to-end orchestration |
| WF-009 | No workflow progress indicators | Multi-step workflows lack progress bars |

---

## Path to 8.0 Trust Score

To reach the 8.0 target, the following workflows need improvement:

| Workflow | Current | Target | Gap | Required Fix |
|---|---|---|---|---|
| Month-End Close | 6 | 8 | +2 | Guided wizard + session resume + evidence panel |
| Journal Entry | 7 | 8 | +1 | Source document attachment + batch approve |
| Treasury Payment | 5 | 8 | +3 | Payment wizard + cash context + idempotency + confirmation |
| Cash Forecast | 5.5 | 8 | +2.5 | Guided workflow + methodology recording + AI explanation |
| Budget Variance | 5.5 | 8 | +2.5 | Investigation wizard + drill-down + AI root cause |
| Compliance Investigation | 6 | 8 | +2 | Guided workflow + evidence attachment + health score formula |
| Audit Preparation | 5 | 8 | +3 | Preparation wizard + evidence-to-finding linkage |
| Policy Exception | 6 | 8 | +2 | Guided workflow + risk assessment + impact analysis |
| Financial Reporting | 7 | 8 | +1 | Report approval workflow + drill-down |
| Order-to-Cash | 7 | 8 | +1 | Guided O2C workflow + pipeline progress indicator |
| Approval Escalation | 6 | 8 | +2 | Configuration wizard + analytics + intelligent routing |

**Estimated effort to reach 8.0**: 40-50 person-weeks across backend and frontend engineering.

---

*End of Phase 20.2 — Workflow Scorecard V2*
