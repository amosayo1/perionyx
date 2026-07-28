---
title: "Success Metrics — AP Reference Workflow v1.0"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1
tags:
  - type/reference
  - domain/product
  - domain/ap
  - status/draft
owner: Product Architecture Board
authority: Phase 27.1
---

# Success Metrics — AP Reference Workflow v1.0

> **Classification**: Internal — Product & Engineering
> **Phase**: 27.1 — EPS Companion Documents
> **Status**: Draft for design partner review
> **Supersedes**: SUCCESS_METRICS.md (Phase 27.0A)

---

## 1. Measurement Philosophy

Enterprise software succeeds not when it is feature-rich but when it **reduces cognitive effort for trusted financial decisions**. Every metric in this document measures a dimension of that principle.

### Three Categories

| Category | Definition | Why It Matters |
|----------|-----------|----------------|
| **Operational Efficiency** | Speed and throughput of the AP workflow | CFOs and Controllers cannot close the books until every invoice is processed. Evidence: T5 (Month-End Close Is Universally Painful, 3 sources, Validated). Mohamed Gamal (E5): "delayed information collection... approval bottlenecks." |
| **Financial Control** | Accuracy, completeness, and auditability of every transaction | A single overpayment erodes trust in the entire system. Evidence: P3 (Trust Requires Accuracy, Validated with 3 sources). Platform Constitution Law 6: "Financial integrity is never compromised." |
| **User Trust** | Willingness of finance professionals to rely on system decisions | If the AP Accountant double-checks every AI recommendation, automation has failed. Evidence: T6 (AI Forecasting Is Interesting but Untrusted, 2 sources, Working). Adeel Aslam (E1): "manual oversight to ensure accuracy." |

### Measurement Cadence

| Cadence | Scope | Audience | Action |
|---------|-------|----------|--------|
| **Daily** | Operations dashboard | AP Manager, Controller | Detect anomalies, SLA breaches, queue buildup |
| **Weekly** | Trend report | AP Manager, Finance Manager | Identify emerging patterns, resource allocation |
| **Monthly** | Full metrics review | Controller, CFO | Month-end close assessment, process improvement |
| **Quarterly** | Strategic review | Product Team, Design Partners | Target calibration, product roadmap adjustments |

### Metric Format

Each metric follows this structure:

| Field | Definition |
|-------|-----------|
| **ID** | Unique identifier (M-01 through M-12) |
| **Name** | Human-readable metric name |
| **Category** | Operational Efficiency / Financial Control / User Trust |
| **Definition** | Precise mathematical or logical definition |
| **Target** | Acceptable performance threshold |
| **Baseline** | Current estimated performance [HYPOTHESIS or EVIDENCE] |
| **Data Source** | Where the measurement comes from |
| **Owner** | Who is responsible for the metric |
| **Evidence** | Customer or constitutional authority |
| **Risk Factors** | What could prevent hitting the target |

---

## 2. Operational Efficiency Metrics

### M-01: Invoice Processing Time

| Field | Value |
|-------|-------|
| **ID** | M-01 |
| **Name** | Invoice Processing Time |
| **Category** | Operational Efficiency |
| **Definition** | Median time from invoice receipt (Stage 1, status `CAPTURED`) to approval (Stage 5, status `APPROVED`). Excludes invoices sent to exception queue. |
| **Target** | **<48 hours for 80% of invoices** |
| **Stretch Target** | <24 hours for 80% |
| **Baseline** | [HYPOTHESIS: 5-7 days for manual-first processes, based on industry benchmarks for mid-market enterprises without AP automation] |
| **Data Source** | `ProcurementVendorInvoice.approvedAt` — `ProcurementVendorInvoice.capturedAt` (milliseconds). Stored in `APAuditRecord` timestamp differences. |
| **Owner** | AP Manager |
| **Reporting** | Daily queue dashboard. Weekly trend chart. Monthly p50/p80/p95 distribution. |
| **Evidence** | T1 (Manual Approval Workflows Delay Payments, 4 sources, Working). Mohamed Gamal (E5): "delayed information collection, approval bottlenecks." Adeel Aslam (E1): "manual oversight to ensure accuracy" — manual oversight is the root cause of delay. |
| **Risk Factors** | OCR accuracy below 85% increases manual review time. Three-way match exceptions exceeding 15% of invoices. Missing POs from ERP integration gaps. Approver availability during holidays. |
| **Phase Target (v1.0)** | <48h for 60% — conservative until AI confidence stabilises |
| **Phase Target (6-month)** | <48h for 80% — after exception rate drops below 15% |
| **Phase Target (12-month)** | <24h for 80% — with mature AI matching + supplier adoption |

---

### M-02: Three-Way Match Rate

| Field | Value |
|-------|-------|
| **ID** | M-02 |
| **Name** | Three-Way Match Rate |
| **Category** | Operational Efficiency |
| **Definition** | Percentage of invoices that pass automated three-way matching (invoice vs. PO vs. GRN) without manual intervention. Match is successful when quantity variance ≤ tolerance AND unit price variance ≤ tolerance AND total variance ≤ tolerance. |
| **Target** | **>85% automated match rate** |
| **Baseline** | [HYPOTHESIS: <30% for organisations without automated matching. Industry data suggests 25-35% of invoices require manual intervention in mid-market enterprises.] |
| **Data Source** | `ProcurementThreeWayMatch.status`. Match status `MATCHED` or `MATCHED_WITH_TOLERANCE` counted as automated. |
| **Owner** | AP Manager |
| **Reporting** | Daily match rate percentage. Weekly breakdown by match category (exact, tolerance, mismatch). Monthly trend. |
| **Evidence** | T2 (Vendor Invoice Reconciliation Is Manual and Error-Prone, 4 sources, Working). Muhammed Jamsheed (E4): "Automated reconciliation is highly desired." Ayman Shawky (E3): "Siloed systems create reconciliation overhead." |
| **Risk Factors** | PO data quality from ERP sync (incomplete POs, mismatched units). GRN lag (goods received but not yet recorded). Tolerance settings that are too tight or too loose. Multi-line invoices with partial receipts. |
| **Phase Target (v1.0)** | >70% — starting tolerance ±5% quantity, ±3% price |
| **Phase Target (6-month)** | >85% — after AI learns vendor-specific patterns |
| **Phase Target (12-month)** | >92% — with predictive PO creation + automated GRN capture |

---

### M-03: Exception Rate

| Field | Value |
|-------|-------|
| **ID** | M-03 |
| **Name** | Exception Rate |
| **Category** | Operational Efficiency |
| **Definition** | Percentage of invoices that enter the exception queue (status `EXCEPTION_RAISED`) at any point in the workflow. Excludes invoices that recover via auto-resolution. |
| **Target** | **<10% of invoices require manual exception handling** |
| **Baseline** | [HYPOTHESIS: 25-30% for manual-first AP departments, based on AP Now 2024 benchmark data adjusted for mid-market] |
| **Data Source** | Count of distinct `ProcurementVendorInvoice.id` with at least one `ProcurementExceptionRecord` created, divided by total invoice count. |
| **Owner** | AP Manager |
| **Reporting** | Daily exception rate. Weekly breakdown by exception type (price, quantity, PO-missing, GRN-missing, duplicate, policy, tax). Monthly root cause analysis. |
| **Evidence** | Adeel Aslam (E1): "manual oversight to ensure accuracy" — manual oversight is required because exception handling is labour-intensive. T2 (4 sources). |
| **Risk Factors** | Tight tolerance settings increase exception count. Poor PO data quality increases PO-missing exceptions. GRN process delays increase GRN-missing exceptions. New vendor onboarding gaps. |
| **Phase Target (v1.0)** | <20% — tolerances looser to build confidence |
| **Phase Target (6-month)** | <10% — after AI auto-resolution handles common cases |
| **Phase Target (12-month)** | <7% — with vendor portal + PO compliance improving upstream data |

---

### M-04: Duplicate Detection Rate

| Field | Value |
|-------|-------|
| **ID** | M-04 |
| **Name** | Duplicate Detection Rate |
| **Category** | Operational Efficiency |
| **Definition** | Percentage of actual duplicate invoices detected **before** payment execution. True duplicates confirmed by manual investigation divided by total confirmed duplicates (detected + missed). |
| **Target** | **>95% of actual duplicates detected before payment** |
| **Baseline** | [HYPOTHESIS: Unknown — without a system, duplicates are only caught during reconciliation or audit. Industry estimates suggest 0.1-0.5% of invoices are duplicates in manual systems.] |
| **Data Source** | `ProcurementDuplicateDetection.matchResults` with confidence score. Confirmed by `APAuditRecord` where `action = 'duplicate.detected'` or `action = 'duplicate.paid'` (missed). |
| **Owner** | AP Manager |
| **Reporting** | Monthly duplicate detection rate. Quarterly: false positive rate (important — too aggressive causes AP Clerk frustration). |
| **Evidence** | AP domain analysis (Phase 21.0 gap analysis). While no customer explicitly mentioned duplicate invoices, the combination of T1 (manual approvals delay payments) and T2 (reconciliation is manual) makes duplicate detection a fundamental control. [HYPOTHESIS] on baseline prevalence. |
| **Risk Factors** | False positive rate if thresholds are too tight. Identical invoice numbers from different vendors. PDF text extraction errors introducing noise. Vendor reuse of invoice numbers across entities. |
| **Phase Target (v1.0)** | >85% detection, <5% false positive rate |
| **Phase Target (6-month)** | >95% detection, <2% false positive — after AI learns vendor patterns |
| **Phase Target (12-month)** | >98% detection, <1% false positive — with network-level dedup |

---

### M-05: Approval Cycle Time

| Field | Value |
|-------|-------|
| **ID** | M-05 |
| **Name** | Approval Cycle Time |
| **Category** | Operational Efficiency |
| **Definition** | Median time from invoice entering approval routing (Stage 5, status `AWAITING_APPROVAL`) to final approval decision (status `APPROVED`). Multi-level approvals measure total chain time. |
| **Target** | **<24 hours for 90% of invoices under threshold** (invoices below $10K or configured threshold) |
| **Stretch Target** | <12 hours for 90% |
| **Baseline** | [HYPOTHESIS: 3-5 days for multi-level manual approval chains. Mohamed Gamal specifically identifies "approval bottlenecks" — suggesting systemic delays beyond individual approver availability.] |
| **Data Source** | `APAuditRecord` for approval chain: timestamp of first `approval.pending` to last `approval.granted`. |
| **Owner** | Financial Controller |
| **Reporting** | Daily: SLA breach count. Weekly: approval time distribution by amount tier. Monthly: approver-level bottlenecks. |
| **Evidence** | T1 (Manual Approval Workflows Delay Payments, 4 sources, Working). Mohamed Gamal (E5): "approval bottlenecks" — explicitly identified. Adeel Aslam (E1): "approval workflows require manual oversight." |
| **Risk Factors** | Approver out of office without delegation. Multi-level chains requiring sequential approval. High-value invoices requiring CFO approval create long tail. Cross-department approval coordination. |
| **Phase Target (v1.0)** | <48h for 80% — allowing for initial delegation configuration |
| **Phase Target (6-month)** | <24h for 90% — after delegation rules + mobile approvals |
| **Phase Target (12-month)** | <12h for 90% — with AI-driven approver prediction + automatic escalation |

---

### M-06: Payment On-Time Rate

| Field | Value |
|-------|-------|
| **ID** | M-06 |
| **Name** | Payment On-Time Rate |
| **Category** | Operational Efficiency |
| **Definition** | Percentage of payments executed on or before the scheduled payment date (based on negotiated payment terms or agreed schedule). Late payments due to system failure vs. deliberate cash management strategy are tracked separately. |
| **Target** | **>98% within payment terms** |
| **Baseline** | [HYPOTHESIS: Varies widely by organisation size and cash position. 70-85% on-time is common without automated payment scheduling.] |
| **Data Source** | `ProcurementPayment.confirmedAt` vs `ProcurementInvoicePaymentSchedule.scheduledDate`. |
| **Owner** | Treasury Manager |
| **Reporting** | Weekly on-time rate. Monthly: late payment reasons breakdown, early payment discount capture rate. |
| **Evidence** | Adeel Aslam (E1): workflow pain related to approval delays cascading into payment timing. T1. While no customer directly measured on-time payment rate, the cascading effect of approval bottlenecks (T1, E5) on payment timing is well-established in AP operations. |
| **Risk Factors** | Approval delays cascade into payment delays. Cash position constraints override automated scheduling. Bank integration failures (ACH rejection, wire cut-off times). Weekends and holidays. Payment run cadence (weekly vs. daily). |
| **Phase Target (v1.0)** | >95% — manual oversight still present for edge cases |
| **Phase Target (6-month)** | >98% — after treasury integration + cash forecasting |
| **Phase Target (12-month)** | >99.5% — with real-time balance checking + auto-retry |

---

## 3. Financial Control Metrics

### M-07: Payment Accuracy

| Field | Value |
|-------|-------|
| **ID** | M-07 |
| **Name** | Payment Accuracy |
| **Category** | Financial Control |
| **Definition** | Percentage of payment transactions that are correct in amount, vendor, bank account, currency, and timing. A payment is incorrect if any of: wrong amount (including over/under), wrong vendor, wrong bank account, wrong currency, duplicate payment. |
| **Target** | **99.9% — no more than 1 error per 1,000 payments** |
| **Baseline** | [HYPOTHESIS: Unknown without systematic measurement. Industry estimates: 0.5-2% error rate for manual AP processes, predominantly overpayments and duplicates.] |
| **Data Source** | `ProcurementReconciliationResult` from bank statement reconciliation. Manual investigation reports for confirmed errors. |
| **Owner** | Financial Controller |
| **Reporting** | Monthly: total payments, errors, error rate, error value. Quarterly breakdown by error type. Audit committee reporting. |
| **Evidence** | P3 (Trust Requires Accuracy, Validated with 3 sources). Platform Constitution Law 6: "Financial integrity is never compromised." Adeel Aslam (E1): "manual oversight to ensure accuracy" — the cost of inaccuracy is trust. |
| **Risk Factors** | Decimal precision errors (mitigated by Decimal(38,12) everywhere). Bank account routing changes. Currency conversion errors for multi-currency invoices. Batch payment processing errors. Wire reversal processing. |
| **Phase Target (v1.0)** | 99.5% — tolerating edge cases during initial operation |
| **Phase Target (6-month)** | 99.9% — after reconciliation automation + anomaly detection |
| **Phase Target (12-month)** | 99.99% — with pre-payment verification + AI fraud detection |

---

### M-08: Audit Trail Completeness

| Field | Value |
|-------|-------|
| **ID** | M-08 |
| **Name** | Audit Trail Completeness |
| **Category** | Financial Control |
| **Definition** | Percentage of state transitions, approvals, payments, corrections, and configuration changes that have a corresponding, unbroken append-only audit record. A gap exists if any action occurs without an audit entry, or if the SHA-256 checksum chain is verifiably broken. |
| **Target** | **100% — zero gaps, zero silent actions** |
| **Baseline** | [CONSTITUTION: Must be 100%. Platform Constitution Law 4: "Every action is auditable." Law 6: "Financial integrity is never compromised."] |
| **Data Source** | `ProcurementAPAuditRecord` table. SHA-256 checksum verification job (daily cron). Gap detection: compare invoice state machine history against audit records. |
| **Owner** | Auditor (internal/external) |
| **Reporting** | Daily: checksum verification pass/fail. Weekly: gap analysis report. Monthly: audit trail completeness certificate for Controller. Quarterly: external audit preparation. |
| **Evidence** | Platform Constitution Law 4 (Every action is auditable). Law 6 (Financial integrity is never compromised). P7 (Audit Readiness — every action leaves a verifiable trail). T5 (Month-End Close, Validated — complete audit trails enable continuous close). E5 (Mohamed Gamal): months-end close requires "faster" execution — audit readiness accelerates close. |
| **Risk Factors** | Race conditions between transaction commit and audit record insert. Database replication lag. Audit table corruption. Manual bypass of system (e.g., direct database modification). |
| **Phase Target (v1.0)** | 100% for all system-initiated actions. Manual action auditing requires explicit UI enforcement. |
| **Phase Target (6-month)** | 100% — including offline/mobile actions queued and synced |
| **Phase Target (12-month)** | 100% — real-time checksum verification on every transition |

---

### M-09: Month-End Close Time

| Field | Value |
|-------|-------|
| **ID** | M-09 |
| **Name** | Month-End Close Time |
| **Category** | Financial Control |
| **Definition** | Number of business days from month-end to completion of all AP-related close activities: all invoices processed, all exceptions resolved or provisioned, all payments reconciled, all GL postings confirmed, subledger balanced to GL. |
| **Target** | **<3 business days** |
| **Baseline** | [HYPOTHESIS: 7-10 business days for mid-market organisations with manual AP processes. Larger enterprises: 10-15 days.] |
| **Data Source** | Close checklist system (manual sign-off per step). `ProcurementReconciliationResult.closedAt` timestamp. GL reconciliation date from `GeneralLedgerAccount`. |
| **Owner** | Financial Controller |
| **Reporting** | Monthly close report with step-by-step timing. Quarterly close trend. Annual benchmark. |
| **Evidence** | T5 (Month-End Close Is Universally Painful, 3 sources, Validated). Mohamed Gamal (E5): "faster month-end close" explicitly desired. Ayman Shawky (E3): "Single source of truth for financial data" — a unified AP system eliminates the reconciliation overhead that delays close. |
| **Risk Factors** | Volume surge at month-end. Unresolved exceptions requiring manual judgement. Bank statement availability (bank holidays). Intercompany transactions complexity. Currency revaluation for multi-currency entities. |
| **Phase Target (v1.0)** | <5 business days — initial target with partial automation |
| **Phase Target (6-month)** | <3 business days — after exception auto-resolution + bank integration |
| **Phase Target (12-month)** | <2 business days — continuous close capability with real-time reconciliation |

---

## 4. User Trust Metrics

### M-10: AI Recommendation Acceptance Rate

| Field | Value |
|-------|-------|
| **ID** | M-10 |
| **Name** | AI Recommendation Acceptance Rate |
| **Category** | User Trust |
| **Definition** | Percentage of AI-generated recommendations (match suggestions, coding suggestions, exception resolution suggestions, approval routing predictions) that are accepted by the human user without modification. Tracked per recommendation type. |
| **Target** | **>80% overall acceptance** |
| **Stretch Target** | >85% for match suggestions specifically |
| **Baseline** | [HYPOTHESIS: No baseline — AI is new to Perionyx AP. Industry benchmarks for AI-assisted AP suggest 60-75% initial acceptance for coding suggestions, 70-80% for match suggestions.] |
| **Data Source** | `AIRecommendationLog` (new model): recommendationId, type, confidence, userAction (accept/reject/modify), timestamp. Aggregated weekly. |
| **Owner** | Product Team (AI Product Manager) |
| **Reporting** | Weekly acceptance rate by type. Monthly: rejection reasons analysis, confidence calibration, model improvement backlog. |
| **Evidence** | T6 (AI Forecasting Is Interesting but Untrusted, 2 sources, Working). P5 (AI Explains But Never Decides). Ayman Shawky (E3): "Need for confidence scoring on forecasts" — confidence scoring directly affects acceptance. The "explainability" requirement (P5) is designed to increase acceptance by showing users *why* the AI recommends something. |
| **Risk Factors** | Low confidence calibration (AI says 90% but is wrong 30% of the time). Poor explainability (users cannot understand why). Over-reliance (users stop verifying). Under-reliance (users ignore good recommendations due to past bad experience). |
| **Phase Target (v1.0)** | >70% — conservative, with explainability visible |
| **Phase Target (6-month)** | >80% — after confidence calibration + user training |
| **Phase Target (12-month)** | >88% — with personalised recommendation models |

---

### M-11: User Task Completion Rate

| Field | Value |
|-------|-------|
| **ID** | M-11 |
| **Name** | User Task Completion Rate |
| **Category** | User Trust |
| **Definition** | Percentage of user-initiated tasks (approve invoice, resolve exception, schedule payment, review vendor) that are completed successfully without the user abandoning the task or reporting confusion. Measured via UI telemetry (task started vs. task completed within same session or same workflow step). |
| **Target** | **>95% task completion rate** |
| **Baseline** | [HYPOTHESIS: No baseline for Perionyx AP — new workflow. Industry benchmark for enterprise B2B workflow UX: 85-92% task completion on first attempt.] |
| **Data Source** | UI telemetry events (`workflow.task.started`, `workflow.task.completed`, `workflow.task.abandoned`). User session recordings (opt-in for design partner phase). Support ticket analysis. |
| **Owner** | Product Designer |
| **Reporting** | Weekly completion rate by task type. Monthly: abandonment analysis (where do users drop off?), confusion points. |
| **Evidence** | Phase 27.0A Enterprise Product Specification (workflow validation). P8 (Decision Readiness — every screen answers 5 questions). The 5-question framework is specifically designed to reduce cognitive friction and improve task completion. |
| **Risk Factors** | Complex approval chains with unclear next steps. Information overload on the exception queue screen. Confusing navigation between workflow stages. Mobile UI compromises (small screen, limited interaction). |
| **Phase Target (v1.0)** | >90% — with desktop-first design + guided workflows |
| **Phase Target (6-month)** | >95% — after mobile optimisation + user testing |
| **Phase Target (12-month)** | >98% — with predictive next-action + keyboard efficiency |

---

### M-12: Data Freshness Trust

| Field | Value |
|-------|-------|
| **ID** | M-12 |
| **Name** | Data Freshness Trust |
| **Category** | User Trust |
| **Definition** | Users can determine the age of displayed data within 5 seconds of viewing any screen without clicking or hovering. Measured by: (a) presence of timestamp/age indicator on every data display, (b) user testing pass rate for "how old is this data?" question. |
| **Target** | **100% of screens show data age. 95% of users can identify age within 5 seconds.** |
| **Baseline** | [HYPOTHESIS: Current Perionyx screens partially meet this via DataFreshnessIndicator (Phase 8B.6) but not universally applied. Target: every AP screen.] |
| **Data Source** | Design audit pass/fail per screen. User testing sessions (design partner programme). |
| **Owner** | Product Designer |
| **Reporting** | Per-screen audit results. User testing session reports. |
| **Evidence** | Phase 8B.6 DataFreshnessIndicator component. P9 (Data Honesty — stale data is labelled, cached data is marked). The principle was established in Phase 8B.6 for executive dashboards and now extends to AP. Without data freshness indicators, users cannot trust the numbers they approve. |
| **Risk Factors** | Real-time data availability limitations (bank feeds, ERP sync). Cached dashboard metrics with short TTLs. Mobile screen real estate constraints. |
| **Phase Target (v1.0)** | 100% of invoice detail, payment queue, and dashboard screens show data age |
| **Phase Target (6-month)** | 100% of all AP screens — real-time indicator or last-sync timestamp |
| **Phase Target (12-month)** | 100% — with colour-coded freshness bands (fresh <30s, ok <5min, stale >5min) |

---

## 5. Measurement Approach

### Data Collection

| Metric | Primary Source | Validation Source | Collection Method |
|--------|---------------|-------------------|-------------------|
| M-01 (Processing Time) | `APAuditRecord` timestamps | `ProcurementVendorInvoice` status timestamps | Cron job: hourly aggregation to metrics table |
| M-02 (Match Rate) | `ProcurementThreeWayMatch.status` | Reconciliation audit | Event-driven: update on each match attempt |
| M-03 (Exception Rate) | `ProcurementExceptionRecord` | Audit trail cross-reference | Event-driven: update on exception create/resolve |
| M-04 (Duplicate Detection) | `ProcurementDuplicateDetection` | Manual confirmation audit | Daily batch: calculate missed duplicates |
| M-05 (Approval Cycle) | `APAuditRecord` approval chain | `ProcurementApproval` timestamps | Event-driven: update on each approval action |
| M-06 (On-Time Payment) | `ProcurementPayment.confirmedAt` | Bank statement confirmation | Daily batch: compare to scheduled dates |
| M-07 (Payment Accuracy) | `ProcurementReconciliationResult` | Manual investigation reports | Monthly: bank statement reconciliation |
| M-08 (Audit Completeness) | `APAuditRecord` checksum verification | Gap detection query | Cron job: hourly checksum verification |
| M-09 (Close Time) | Close checklist system | GL reconciliation date | Monthly: manual close sign-off |
| M-10 (AI Acceptance) | `AIRecommendationLog` | User action audit | Event-driven: update on each recommendation |
| M-11 (Task Completion) | UI telemetry events | Support ticket correlation | Real-time: analytics pipeline |
| M-12 (Data Freshness) | Design audit | User testing | Quarterly: manual audit |

### Reporting

| Audience | Report | Cadence | Metrics |
|----------|--------|---------|---------|
| AP Manager | Operations Dashboard | Daily | M-01 (p50/p80), M-02, M-03, M-05, queue depth |
| Finance Manager | Weekly Review | Weekly | M-01 trend, M-03 breakdown, M-06, exception causes |
| Financial Controller | Close Report | Monthly | M-01-M-09 summary, trend analysis, anomaly alerts |
| CFO | Executive Summary | Monthly | M-06, M-07, M-09, M-10 (headline) |
| Auditor | Audit Trail Report | Monthly | M-08 (completeness certificate), M-07 |
| Product Team | Product Health | Quarterly | M-10, M-11, M-12, design partner feedback |

---

## 6. Targets by Phase

| Metric | v1.0 (Immediate) | 6-Month | 12-Month |
|--------|------------------|---------|----------|
| M-01: Processing Time | <48h for 60% | <48h for 80% | <24h for 80% |
| M-02: Match Rate | >70% | >85% | >92% |
| M-03: Exception Rate | <20% | <10% | <7% |
| M-04: Duplicate Detection | >85% det, <5% FP | >95% det, <2% FP | >98% det, <1% FP |
| M-05: Approval Cycle | <48h for 80% | <24h for 90% | <12h for 90% |
| M-06: Payment On-Time | >95% | >98% | >99.5% |
| M-07: Payment Accuracy | 99.5% | 99.9% | 99.99% |
| M-08: Audit Completeness | 100% (system) | 100% | 100% real-time |
| M-09: Close Time | <5 business days | <3 business days | <2 business days |
| M-10: AI Acceptance | >70% | >80% | >88% |
| M-11: Task Completion | >90% | >95% | >98% |
| M-12: Data Freshness | 100% key screens | 100% all screens | 100% + bands |

---

## 7. Risk Factors

### Execution Risks

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| OCR accuracy insufficient for target match rate | M-01, M-02 miss targets | Multiple OCR vendors, human-in-the-loop for low confidence | Engineering |
| ERP integration gaps (PO/GRN data quality) | M-02, M-03 miss targets | Staged rollout by ERP maturity, data quality dashboard | Integrations |
| AI model confidence calibration poor | M-10 below target | Continuous confidence logging, human override tracking | AI/ML |
| Mobile approval UX inadequate | M-05, M-11 miss targets | Mobile-first redesign for approval flow, user testing | Design |
| Design partner feedback insufficient | All metrics | Khaleel Ur Rehman + Ahmed Orabi confirmed, pipeline of 7 | Product |

### Market Risks

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Customer baseline assumptions wrong | All baselines invalid | Measure systematically from first deployment, update targets | Product |
| Multi-currency complexity underestimated | M-06, M-07, M-09 | Defer to 12-month target, single-currency for v1.0 | Engineering |
| Regulatory requirements differ by jurisdiction | M-08, compliance | Jurisdiction-specific audit configuration, modular compliance | Compliance |

### Technology Risks

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Decimal(38,12) performance overhead at scale | All transaction metrics | Benchmark at 50K/100K/500K invoices, index tuning | Engineering |
| SHA-256 checksum chain verification slow | M-08 completeness | Offline verification, batch verification job | Engineering |
| Bank integration failures affect payment metrics | M-06, M-07 | Retry logic, fallback manual process, bank health monitoring | Engineering |

---

## Appendix A: Metric Dependencies

```
M-01 (Processing Time) ← M-02 (Match Rate) — higher match reduces processing time
                          M-03 (Exception Rate) — fewer exceptions speeds processing
                          M-05 (Approval Cycle) — faster approval speeds processing
M-02 (Match Rate)      ← M-04 (Duplicate Detection) — false positives increase exceptions
                          OCR accuracy — better OCR improves match
M-03 (Exception Rate)  ← Tolerance settings — tighter = more exceptions
                          PO/GRN data quality — better data = fewer exceptions
M-05 (Approval Cycle)  ← M-10 (AI Acceptance) — trusted AI routing reduces bottlenecks
                          Mobile UX (M-11) — easier approval = faster approval
M-06 (On-Time Payment) ← M-05 (Approval Cycle) — approval delay cascades
                          Treasury integration — bank connectivity
M-09 (Close Time)      ← M-01 through M-06 — every operational metric feeds close
M-10 (AI Acceptance)   ← M-12 (Data Freshness) — trust in data affects trust in AI
                          Explainability quality — user understanding
```

---

## Appendix B: Evidence Index

| Reference | Source | Role | Metrics Directly Informed |
|-----------|--------|------|---------------------------|
| E1 | Adeel Aslam | Finance, Real Estate/Construction | M-01, M-03, M-05, M-06, M-07 |
| E3 | Ayman Shawky | Chief Accountant | M-02, M-09, M-10 |
| E4 | Muhammed Jamsheed | Al Reef Agricultural | M-02, M-03 |
| E5 | Mohamed Gamal | Junior GL Accountant | M-01, M-05, M-08, M-09 |
| T1 | Theme (4 sources) | — | M-01, M-05, M-06 |
| T2 | Theme (4 sources) | — | M-02, M-03, M-04 |
| T5 | Theme (3 sources, Validated) | — | M-08, M-09 |
| T6 | Theme (2 sources, Working) | — | M-10 |
| P3 | Trust Requires Accuracy (Validated) | — | M-07 |
| P5 | AI Explains But Never Decides | — | M-10 |
| P7 | Audit Readiness | — | M-08 |
| P8 | Decision Readiness | — | M-11 |
| P9 | Data Honesty | — | M-12 |

---

*End of Success Metrics — AP Reference Workflow v1.0*
