---
title: "Enterprise Product Specification — Accounts Payable Reference Workflow v2.0"
created: 2026-07-28
updated: 2026-07-28
version: 2.0
tags:
  - type/specification
  - domain/product
  - domain/ap
  - status/active
owner: Product Team
authority: Phase 27.1
---

# Enterprise Product Specification — Accounts Payable Reference Workflow v2.0

> **Classification**: Restricted — Internal Use Only
> **Status**: Ready for finance professional review
> **Authority**: Phase 27.1 — Customer Evidence → Product Specification

---

## 1. Purpose

This is the master product specification for the Accounts Payable (AP) Reference Workflow in Perionyx — an Enterprise Financial Operating System. The AP Reference Workflow is the first complete financial workflow in Perionyx and serves as the canonical blueprint for every future financial workflow: Accounts Receivable, Treasury, General Ledger, Fixed Assets, and Financial Close. Every design decision in this document is traceable to customer evidence. Where evidence is insufficient, the assumption is explicitly marked **[HYPOTHESIS]**. This document provides an executive-level summary; every section links to a detailed companion document containing the full specification. **A CFO should be able to read this document and understand the entire AP workflow in 10 minutes.**

---

## 2. Evidence Basis

Every product decision in this specification is traceable to customer evidence. The table below lists all sources informing this spec.

| ID | Source | Date | Channel | Role | Region | Key Insights | Confidence |
|----|--------|------|---------|------|--------|-------------|------------|
| E1 | Adeel Aslam | 2026-07-21 | Discovery interview | Finance, Real Estate/Construction | — | "vendor invoice reconciliations and approval workflows... often require manual oversight to ensure accuracy"; reporting is adequate but operational tasks need automation | High |
| E2 | Ahmed Shatla | 2026-07-21 | Discovery call | Finance | — | Referenced vendor invoice reconciliations and approval workflows as key pain points | High |
| E3 | Ayman Shawky | CRM | CRM notes | Chief Accountant, SAP/Odoo/Dynamics | — | "Siloed systems create reconciliation overhead"; "Single source of truth for financial data"; "Need for instant view of cash positions across all accounts"; "Interest in ML-based cash flow predictions"; "Need for confidence scoring on forecasts" | Medium |
| E4 | Muhammed Jamsheed | CRM | CRM notes | Al Reef Agricultural | Saudi Arabia | "Inventory reconciliation still depends heavily on spreadsheets"; "Stock corrections require manual work"; "ERP systems lack strong integration between inventory and finance"; "Automated reconciliation is highly desired"; "Intelligent discrepancy alerts would reduce manual work" | Medium |
| E5 | Mohamed Gamal | CRM | CRM notes | Junior GL Accountant, Construction | — | Pain points: delayed information collection, approval bottlenecks, manual bank reconciliation, manual account reconciliation. Desired: automated reconciliations, automated approvals, faster month-end close | Medium |
| E6 | Khaleel Ur Rehman | CRM | CRM notes | Finance Manager, ADPA+CA | — | "What can I do to support you in building that operating system?" — strongest engagement signal, design partner candidate | Medium |
| E7 | Ahmed Orabi | CRM | CRM notes | AP/P2P at Hikma Pharmaceuticals | — | Requested Perionyx information, very high design partner potential for AP/P2P workflow | Medium |
| E8 | Eslam Sobhi | CRM | CRM notes | Cost Accountant, Dynamics 365 | — | Treasury operations feedback, cost accounting integration needs | Medium |
| E9 | Ahmed Abdelmoneim | CRM | CRM notes | Treasury, Odoo ERP, Power BI | — | Treasury and ERP integration feedback, Power BI analytics expectations | Medium |
| E10 | Mahmoud Shaker | CRM | CRM notes | Financial Analyst, FMVA | — | FP&A and forecasting requirements, financial planning integration | Medium |
| T1 | Theme | 2026-07-21 | Synthesis | — | — | Manual Approval Workflows Delay Payments (4 sources) | Working |
| T2 | Theme | 2026-07-21 | Synthesis | — | — | Vendor Invoice Reconciliation Is Manual and Error-Prone (4 sources) | Working |
| T3 | Theme | 2026-07-21 | Synthesis | — | — | ERP Silos Create Integration Overhead (3 sources) | Validated |
| T4 | Theme | 2026-07-21 | Synthesis | — | — | Real-Time Cash Visibility Is Expected (2 sources) | Working |
| T5 | Theme | 2026-07-21 | Synthesis | — | — | Month-End Close Is Universally Painful (3 sources) | Validated |
| T6 | Theme | 2026-07-21 | Synthesis | — | — | AI Forecasting Is Interesting but Untrusted (2 sources) | Working |
| T7 | Theme | 2026-07-21 | Synthesis | — | — | Multi-Currency Operations Are Complex [HYPOTHESIS] | Hypothesis |
| T8 | Theme | 2026-07-21 | Synthesis | — | — | Regulatory Compliance Varies by Jurisdiction [HYPOTHESIS] | Hypothesis |

### Evidence Confidence Tiers

| Tier | Criteria | Roadmap Impact |
|------|----------|----------------|
| **High** | Direct discovery interview with transcript | Full confidence — informs roadmap |
| **Medium** | CRM notes, 1 source, or indirect evidence | Track and validate further |
| **Working** | 2-3 sources converging on same theme | Design with evidence in mind |
| **Validated** | 3+ independent sources confirming | High confidence |
| **Hypothesis** | No direct evidence; inferred from patterns | Do not act on without validation |

---

## 3. Scope

This specification covers the **10-stage procure-to-pay workflow**. The v2.0 workflow is simplified from v1.0's 14 stages. Stages were merged where the handoff added friction without adding control.

| Stage | Name | Owner | Description |
|-------|------|-------|-------------|
| 1 | Invoice Received | AP Clerk | Invoice capture via OCR, email, portal, or EDI. Zero manual re-keying. |
| 2 | Invoice Validated | System | Evidence assembly: PO, GRN, contract, vendor history linked automatically. |
| 3 | Three-Way Match | System | Invoice vs. PO vs. GRN matching within configurable tolerances. |
| 4 | Exception Queue | AP Clerk / AP Manager | Discrepancy classification, prioritisation, investigation, resolution. |
| 5 | Approval Routing | Approver (role-based) | Multi-level approval based on amount, department, vendor, with SoD enforcement. |
| 6 | Payment Readiness | Treasury Manager | Payment batch preparation, discount optimisation, cash flow alignment. |
| 7 | Treasury Approval | Treasury Manager | Cash availability verification, payment scheduling, bank confirmation. |
| 8 | Payment Execution | System + Treasury | Payment processing via banking integration, status tracking, confirmation. |
| 9 | GL Posting | System | Journal entry creation, subledger reconciliation, posting to general ledger. |
| 10 | Audit & Reconciliation | System + Controller | Bank reconciliation, audit trail verification, checksum chain, close preparation. |

### What This Specification Covers

- Complete workflow from invoice receipt to audit reconciliation (10 stages)
- All 9 personas that interact with the AP workflow (AP Clerk through Vendor)
- 5 state machines: Invoice (12 states), Payment (7 states), Approval (7 states), Exception (6 states), Vendor (4 states)
- AI behaviour for matching, exception resolution, and payment optimisation
- 65 business rules with evidence traceability
- Success metrics with baselines and targets
- 14 hypotheses with validation plans

### What This Specification Does NOT Cover

- Accounts Receivable workflow (separate specification)
- Treasury workflow (separate specification)
- General Ledger workflow (separate specification)
- Fixed Assets workflow (separate specification)
- Financial Close workflow (separate specification)
- Integration architecture (covered in `docs/platform/`)
- Database schema (covered in `docs/ap/AP_PRISMA_MODELS.md`)
- API contracts (covered in `docs/ap/AP_API_ARCHITECTURE.md`)
- Vendor onboarding as a standalone workflow (covered in future Phase 28)

---

## 4. Product Principles

This workflow is governed by the Perionyx Product Principles. Every decision in this spec can be justified by one or more principles. Principles are ordered by validation status.

### Validated Principles (3+ sources)

| ID | Principle | Application in AP | Evidence |
|----|-----------|-------------------|----------|
| VP4 | Every Action Is Auditable | 14-stage audit trail with timestamp, actor, decision, evidence | Platform Constitution Law 12 |
| VP5 | Financial Precision Is Non-Negotiable | Decimal(38,12) precision; banker's rounding; idempotent payments | Platform Constitution Law 6; Phase 19.1 |
| VP6 | One Financial Truth | Invoice → PO → Receipt → GL is a single traceable chain | E3 (Ayman Shawky), E4 (Muhammed Jamsheed) |

### Working Principles (1-2 sources)

| ID | Principle | Application in AP | Evidence |
|----|-----------|-------------------|----------|
| VP1 | Reporting Is Table Stakes | AP dashboard derived from workflow data, not entered separately | E1 (Adeel Aslam): "reporting...fairly well" |
| VP2 | Operational Automation Is the Gap | Invoice matching, exception routing, payment batching automated | E1 (Adeel Aslam): "manual oversight to ensure accuracy" |
| VP3 | Trust Requires Provable Accuracy | Every match shows source documents; every approval shows evidence | E1 (Adeel Aslam): "manual oversight to ensure accuracy" |
| WP1 | Exceptions Deserve Attention | Exception queue with AI-suggested resolutions, human approval | E1 + E2 (T1, T2) |
| WP2 | Context Before Action | Approval screens show invoice, PO, receipt, vendor, budget | E1 (Adeel Aslam): "manual oversight to ensure accuracy" |
| WP3 | Evidence Before Approval | Approval disabled until evidence is displayed | Constitution + E1 |

### Hypothesis Principles (no direct evidence)

| ID | Principle | Application in AP | Evidence |
|----|-----------|-------------------|----------|
| HP1 | AI Must Explain Itself | AI recommendations include reasoning chain, confidence, source data | E3 (Ayman Shawky): "Need for confidence scoring" [HYPOTHESIS] |
| HP2 | Approval Delegation | Approval matrix supports delegation, escalation, absence handling | Industry patterns [HYPOTHESIS] |
| HP3 | Arabic-First Design | Arabic RTL support: layout, number formatting, date formatting | CRM profiles (Saudi Arabia contacts) [HYPOTHESIS] |
| HP4 | Real-Time Visibility | Real-time AP aging; stale data labelled; no nightly batch reports | E3 (Ayman Shawky): "instant view of cash positions" [HYPOTHESIS] |
| HP5 | Month-End Close Pain | Continuous close preferred over batch reconciliation | T5: 3 sources [HYPOTHESIS] |

### Principle Hierarchy (Conflict Resolution)

| Priority | Principle | Rationale |
|----------|-----------|-----------|
| 1 | VP5: Financial Precision | Without correct numbers, nothing else matters |
| 2 | VP4: Every Action Is Auditable | Without audit trails, trust collapses |
| 3 | VP3: Trust Requires Provable Accuracy | Without trust, adoption fails |
| 4 | WP4: Human Accountability | Without accountability, compliance fails |
| 5 | VP2: Operational Automation | Without automation, the product does not differentiate |
| 6 | WP2: Context Before Action | Without context, decisions are guesses |
| 7 | VP1: Reporting Is Table Stakes | Without reporting, decisions lack data |

**Full specification**: [[PERIONYX_PRODUCT_PRINCIPLES]]

---

## 5. Workflow Overview

The AP workflow is a 10-stage procure-to-pay process with clear state transitions, ownership boundaries, and control points.

### Workflow Flow

```
Invoice Received → Invoice Validated → Three-Way Match ──→ Exception Queue
                                          │                      │
                                          │ (matched)            │ (resolved)
                                          ▼                      │
                                    Approval Routing ←───────────┘
                                          │
                                          │ (approved)
                                          ▼
                              Payment Readiness → Treasury Approval → Payment Execution
                                                                          │
                                                                          │ (confirmed)
                                                                          ▼
                                                              GL Posting → Audit & Reconciliation
```

### Key Control Points

| Control Point | Stage | Purpose | Evidence |
|---------------|-------|---------|----------|
| Duplicate Detection | 1 | Prevent duplicate payments before they enter the system | E1 (T2): "error-prone" reconciliation |
| Evidence Assembly | 2 | Gather all supporting documents before any human sees the invoice | E1 (Adeel): "manual oversight to ensure accuracy" |
| Three-Way Match | 3 | Automated verification of invoice vs. PO vs. receipt | E1 (T2): manual matching is the pain |
| Exception Classification | 4 | Prioritise discrepancies by financial impact | WP1: "Exceptions Deserve Attention" |
| SoD Enforcement | 5 | PO creator ≠ invoice approver ≠ payment releaser | Constitution Law 12, SOX compliance |
| Threshold Approval | 5 | Multi-level approval: <$1K AP Clerk, <$10K AP Manager, <$50K Controller, <$250K CFO, >$250K CFO + Board | E1 (T1): "approval workflows...delay payments" |
| Cash Availability | 7 | Verify funds before payment execution | E3 (Ayman Shawky): "instant view of cash positions" |
| Idempotency | 8 | Prevent duplicate payments via unique keys | VP5: Financial Precision |
| GL Reconciliation | 9 | Verify AP subledger = GL balance | E5 (Mohamed Gamal): "manual account reconciliation" |
| Checksum Chain | 10 | Tamper-evident audit trail | VP4: Every Action Is Auditable |

### Stage Ownership Matrix

| Stage | Primary Owner | Secondary Owner | System Role |
|-------|--------------|-----------------|-------------|
| 1. Invoice Received | AP Clerk | Vendor (portal) | OCR, capture, duplicate detection |
| 2. Invoice Validated | System | AP Clerk (review) | Evidence assembly, PO/GRN linking |
| 3. Three-Way Match | System | AP Clerk (override) | Automated matching, tolerance evaluation |
| 4. Exception Queue | AP Clerk / AP Manager | Procurement | Classification, routing, escalation |
| 5. Approval Routing | Approver (role-based) | AP Manager (override) | Routing, SoD enforcement, delegation |
| 6. Payment Readiness | System + Treasury Manager | AP Manager | Batch creation, discount optimisation |
| 7. Treasury Approval | Treasury Manager | CFO (high-value) | Cash verification, scheduling |
| 8. Payment Execution | System + Treasury Manager | — | Banking API, status tracking |
| 9. GL Posting | System | Controller (review) | Journal entry creation, subledger update |
| 10. Audit & Reconciliation | System + Controller | Auditor (read-only) | Bank matching, checksum verification |

---

## 6. State Machines Summary

Every entity in the AP workflow has a defined lifecycle with explicit state transitions. No state transition is permitted without a valid trigger and authority. **5 state machines** govern the AP workflow.

### 6.1 Invoice State Machine (12 states, 23 transitions)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `DRAFT` | Invoice created, not yet complete | No |
| `CAPTURED` | OCR/EDI extraction complete, awaiting validation | No |
| `VALIDATED` | Fields validated, evidence linked, awaiting match | No |
| `MATCHED` | Three-way match passed, awaiting approval | No |
| `EXCEPTION` | Match failed or anomaly detected, awaiting resolution | No |
| `APPROVED` | All approval levels passed, awaiting payment | No |
| `PAYMENT_SCHEDULED` | Payment batch created, awaiting execution | No |
| `PAID` | Payment executed, awaiting bank confirmation | No |
| `RECONCILED` | Bank confirmed, GL posted, awaiting close | No |
| `CLOSED` | Fully reconciled, audit trail complete | **Yes** |
| `VOIDED` | Invoice cancelled before payment | **Yes** |
| `DISPUTED` | Vendor disputes invoice, awaiting resolution | No |

### 6.2 Payment State Machine (7 states)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `PROPOSED` | Payment batch created, awaiting Treasury approval | No |
| `APPROVED` | Treasury approved, awaiting execution | No |
| `PROCESSING` | Submitted to bank, awaiting confirmation | No |
| `COMPLETED` | Bank confirmed payment successful | **Yes** |
| `CONFIRMED` | Reconciled with bank statement | **Yes** |
| `FAILED` | Bank rejected or timeout | No |
| `VOIDED` | Payment cancelled before execution | **Yes** |

### 6.3 Approval State Machine (7 states per level)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `PENDING` | Awaiting approver action | No |
| `APPROVED` | Approver authorised the invoice | **Yes** |
| `REJECTED` | Approver denied the invoice | **Yes** |
| `ESCALATED` | Forwarded to higher authority | No |
| `DELEGATED` | Forwarded to pre-registered delegate | No |
| `TIMED_OUT` | SLA breached without action | No |
| `SKIPPED` | Level not required for this invoice | **Yes** |

### 6.4 Exception State Machine (6 states)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `OPEN` | Exception detected, awaiting classification | No |
| `CLASSIFIED` | Severity and type assigned, routed to resolver | No |
| `IN_PROGRESS` | Resolver investigating | No |
| `RESOLVED` | Resolution applied, awaiting verification | No |
| `VERIFIED` | Resolution verified, exception closed | **Yes** |
| `ESCALATED` | Cannot resolve, forwarded to management | No |

### 6.5 Vendor State Machine (4 states)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `PENDING_REVIEW` | New vendor, awaiting verification | No |
| `ACTIVE` | Vendor verified, can receive invoices and payments | No |
| `SUSPENDED` | Vendor suspended, invoices blocked from payment | No |
| `DEACTIVATED` | Vendor deactivated, no further transactions | **Yes** |

**Full specification**: [[WORKFLOW_STATE_MACHINE]]

---

## 7. AI Boundary

AI in the AP workflow assists human decision-making. It never replaces human judgement. This table is the contract between the AI system and the humans who trust it.

### What AI Does

| Capability | Stage | Behaviour | Human Override |
|-----------|-------|-----------|----------------|
| OCR field extraction | 1 | Extract line items, amounts, vendor from invoice image | Manual correction always available |
| Duplicate detection | 1 | Flag invoices matching existing invoices (vendor, amount, date) | AP Clerk can dismiss with reason |
| Evidence collection | 2 | Link PO, GRN, contract, vendor history automatically | No override needed (automated) |
| Three-way match | 3 | Automated matching with tolerance application | Exception raised for human resolution |
| Exception classification | 4 | Classify type, severity, suggest resolution | AP Manager must approve resolution |
| Risk scoring | 5 | Score invoice risk 0-100 based on 5 factors | Approver interprets score |
| Recommendation generation | 5 | Recommend approve/review/reject with reasoning | Human makes final decision |
| Payment optimisation | 6 | Recommend payment timing based on discount terms and cash position | Treasury Manager makes final decision |
| GL auto-coding | 9 | Suggest GL account codes based on invoice category | Controller confirms coding |
| Reconciliation matching | 10 | Match bank statement to payments | Review exceptions only |

### What AI Never Does

| Restriction | Reason | Fallback |
|------------|--------|----------|
| Approve invoices | Legal authority requires human decision | Route to human approver |
| Execute payments | Financial authority requires human decision | Route to Treasury Manager |
| Override approval thresholds | Compliance and SoD controls | Block override, log attempt |
| Modify vendor banking details | Fraud prevention | Route to AP Manager |
| Delete audit records | Tamper-evident audit trail | Block deletion, log attempt |
| Skip approval levels | Compliance and authority controls | Block skip, log attempt |
| Make decisions without evidence | Accountability requires evidence | Flag insufficient evidence |

### AI Transparency Requirements

Every AI-generated recommendation must include:

1. **Reasoning Chain**: Why this recommendation was made (which rules, which data, which patterns)
2. **Confidence Level**: 0-100% confidence score with explanation of factors
3. **Source Data**: Links to the invoices, POs, receipts, and vendor records that informed the recommendation
4. **Override Option**: Clear path for the human to reject or modify the recommendation
5. **Audit Trail**: The recommendation, the human decision, and the timestamp are all recorded

### AI Guardrails

- AI confidence below 70% triggers mandatory human review
- AI recommendations are labelled as recommendations, never as decisions
- AI training data must not include PII beyond what is necessary
- Every AI action is logged with full reasoning audit trail
- AI fails gracefully — when uncertain, it falls back to manual processing, not guesses

**Full specification**: [[AI_BEHAVIOUR_GUIDE]]

---

## 8. Business Rules Summary

The AP workflow is governed by **65 business rules** across 6 categories. The top 20 rules (by severity) are listed below. The full rule library is in the companion document.

### Top 20 Rules by Severity

| ID | Rule | Category | Severity | Evidence | Hypothesis? |
|----|------|----------|----------|----------|-------------|
| BR-001 | Required Invoice Fields | Invoice | Critical | E1 (T2): completeness prerequisite for accuracy | No |
| BR-006 | Duplicate Invoice Block | Invoice | Critical | E1 (T2): "error-prone" implies duplicates slip through | No |
| BR-013 | Three-Way Match Required for Goods | Match | Critical | E1 (T2): manual matching is the pain point | No |
| BR-026 | SoD: Creator Cannot Approve | Approval | Critical | Constitution Law 12, SOX | No |
| BR-030 | Threshold-Based Approval | Approval | Critical | E1 (T1): "approval workflows...delay payments" | No |
| BR-043 | Payment Requires Treasury Approval | Payment | Critical | VP5: Financial Precision | No |
| BR-046 | Idempotent Payment Execution | Payment | Critical | VP5: Financial Precision | No |
| BR-056 | Exception SLA Enforcement | Exception | High | WP1: "Exceptions Deserve Attention" | No |
| BR-014 | Two-Way Match for Services | Match | High | [HYPOTHESIS] — no direct evidence for 2-way vs 3-way preference | **Yes** |
| BR-002 | Invoice Date Not >90 Days Past | Invoice | High | [HYPOTHESIS] — industry standard varies | **Yes** |
| BR-033 | Approval Delegation Chain | Approval | High | HP2: Approval Delegation [HYPOTHESIS] | **Yes** |
| BR-035 | Escalation on SLA Breach | Approval | High | E1 (T1): approval delays are the pain | No |
| BR-048 | Dual-Signature for Payments >$50K | Payment | High | [HYPOTHESIS] — industry pattern, no direct evidence | **Yes** |
| BR-050 | Payment Failure Auto-Retry | Payment | High | E9 (Ahmed Abdelmoneim): treasury reliability expectations | No |
| BR-007 | Currency Must Be Supported | Invoice | High | T7: Multi-Currency [HYPOTHESIS] | **Yes** |
| BR-017 | Price Tolerance Configurable per Vendor | Match | Medium | [HYPOTHESIS] — inferred from tolerance needs varying by vendor | **Yes** |
| BR-059 | Exception Resolution Requires Reason | Exception | Medium | VP4: Every Action Is Auditable | No |
| BR-003 | Invoice Amount Must Be Positive | Invoice | Medium | VP5: Financial Precision | No |
| BR-062 | Audit Record Checksum Chain | Audit | Medium | VP4: Every Action Is Auditable | No |
| BR-010 | OCR Confidence Review Threshold | Invoice | Medium | VP3: Trust Requires Provable Accuracy | No |

### Rules by Category

| Category | Rules | Count | Evidence Coverage |
|----------|-------|-------|-------------------|
| Invoice Validation | BR-001 to BR-012 | 12 | 9 with evidence, 3 [HYPOTHESIS] |
| Three-Way Match | BR-013 to BR-025 | 13 | 10 with evidence, 3 [HYPOTHESIS] |
| Approval | BR-026 to BR-042 | 17 | 13 with evidence, 4 [HYPOTHESIS] |
| Payment | BR-043 to BR-055 | 13 | 10 with evidence, 3 [HYPOTHESIS] |
| Exception | BR-056 to BR-065 | 10 | 8 with evidence, 2 [HYPOTHESIS] |

**Full specification**: [[BUSINESS_RULE_LIBRARY]]

---

## 9. Success Metrics

The AP workflow is measured against specific, quantifiable metrics with baselines and targets. Every metric is measured through workflow timestamps embedded in the application. No manual measurement is required.

### Efficiency Metrics

| Metric | Baseline | Target (30-day) | Target (90-day) | Target (180-day) | Measurement |
|--------|----------|-----------------|-----------------|-------------------|-------------|
| **E1: Time to Process Invoice** | 2-5 days | <4 hours | <2 hours | <1 hour (auto-matched) | invoice.captured → invoice.approved |
| **E2: Approval Cycle Time** | 1-3 days | <4 hours | <2 hours | <1 hour (auto-approved) | approval.submitted → approval.decided |
| **E3: Payment Cycle Time** | 3-7 days | <24 hours | <12 hours | <8 hours | invoice.approved → payment.completed |
| **E4: Investigation Time/Exception** | 30-60 min | <15 min | <10 min | <5 min (routine) | exception.created → exception.resolved |

### Quality Metrics

| Metric | Baseline | Target (30-day) | Target (90-day) | Target (180-day) | Measurement |
|--------|----------|-----------------|-----------------|-------------------|-------------|
| **Q1: Match Rate** | 0% | >70% | >85% | >90% | Auto-matched / total invoices |
| **Q2: Exception Rate** | 100% | <25% | <15% | <10% | Exceptions / total invoices |
| **Q3: Duplicate Detection** | 0% | >95% | >99% | >99.5% | Caught / total duplicates |
| **Q4: GL Posting Accuracy** | N/A | >98% | >99.5% | >99.9% | Correct / total postings |

### Trust Metrics

| Metric | Baseline | Target (30-day) | Target (90-day) | Target (180-day) | Measurement |
|--------|----------|-----------------|-----------------|-------------------|-------------|
| **T1: User Confidence Score** | N/A | >3.5/5 | >4.0/5 | >4.2/5 | Monthly in-app survey |
| **T2: AI Recommendation Adoption** | N/A | >60% | >75% | >85% | Actions / total recommendations |
| **T3: Audit Readiness Score** | 0% | >95% | >99% | 100% | Complete trails / total transactions |

### Financial Metrics

| Metric | Baseline | Target (30-day) | Target (90-day) | Target (180-day) | Measurement |
|--------|----------|-----------------|-----------------|-------------------|-------------|
| **F1: Discount Capture Rate** | 0% | >50% | >70% | >80% | Captured / available discounts |

### Anti-Metrics (What We Do NOT Measure)

| Anti-Metric | Why |
|-------------|-----|
| Number of invoices entered | Encourages speed over accuracy |
| Number of approvals per hour | Encourages rubber-stamping |
| Time spent in system | Longer time may mean more thorough review |
| Number of features used | Feature count does not equal value delivered |

**Full specification**: [[SUCCESS_METRICS]]

---

## 10. Hypothesis Register

The following assumptions in this specification are unvalidated. Every hypothesis has a validation plan and a risk-if-wrong assessment.

| ID | Hypothesis | Evidence | Validation Plan | Risk if Wrong | Priority | Status |
|----|-----------|----------|----------------|---------------|----------|--------|
| H-01 | Finance professionals prefer automated matching with manual override over fully manual matching | E1, E2 (T1, T2) — "manual oversight" implies need for automation with escape valve | Beta testing with AP clerks | Low adoption of matching feature | High | Working |
| H-02 | Approval delegation is critical for mid-market companies | HP2 — industry patterns only [HYPOTHESIS] | Interview 3+ finance managers | Approval workflow too rigid | Medium | Not Started |
| H-03 | AI exception resolution suggestions will be trusted after 3 months | E3 (Ayman Shawky): "confidence scoring" + HP1 [HYPOTHESIS] | Measure override rate over time | AI suggestions ignored | High | Not Started |
| H-04 | Real-time AP aging is more valuable than nightly batch reports | E3 (Ayman Shawky): "instant view of cash positions" [HYPOTHESIS] | A/B test real-time vs batch | No adoption difference | Medium | Not Started |
| H-05 | Arabic-first design increases MENA adoption | HP3 — CRM profiles, no direct evidence [HYPOTHESIS] | Interview 3+ MENA finance pros | No MENA adoption | Low | Not Started |
| H-06 | Three-way match automation reduces AP processing time by 60%+ | E1 (T2): manual matching is the pain [Working] | Measure before/after processing time | Insufficient time savings | High | Working |
| H-07 | Exception queue prioritised by financial impact reduces resolution time | WP1: "Exceptions Deserve Attention" | Measure resolution time by priority | No improvement | Medium | Not Started |
| H-08 | Batch payment processing is preferred over individual payment execution | H4 — industry pattern [HYPOTHESIS] | Interview 3+ AP managers | Batching forced when users prefer individual | High | Not Started |
| H-09 | Multi-level approval is better than single-level for compliance | H3 — inferred from audit needs [HYPOTHESIS] | Interview 3+ controllers | Complexity added without compliance benefit | Medium | Not Started |
| H-10 | Vendor self-service portal reduces AP clerk workload | H7 — industry pattern [HYPOTHESIS] | Interview 3+ AP clerks | Portal built but unused | Low | Not Started |
| H-11 | Unified platform reduces context switching vs best-of-breed | E3 (Ayman Shawky), E4 (Muhammed Jamsheed): "siloed systems" [Working] | Interview 3+ finance managers | Users prefer best-of-breed with integrations | Medium | Working |
| H-12 | Early-pay discount capture is a measurable financial benefit | H13 — industry pattern [HYPOTHESIS] | Interview 3+ AP managers | Discount optimisation built for discounts vendors do not offer | Medium | Not Started |
| H-13 | Real-time match results are better than batch matching | E3 (Ayman Shawky): "instant view" [HYPOTHESIS] | Interview 3+ AP clerks | Real-time adds latency when batch acceptable | Medium | Not Started |
| H-14 | AP analytics drive behaviour change | E1 (Adeel): "reporting...fairly well" — analytics already adequate [HYPOTHESIS] | Track behaviour change after viewing dashboards | Analytics built but ignored | Low | Not Started |

### Hypothesis Lifecycle

| Stage | Criteria | Action |
|-------|----------|--------|
| **Hypothesis** | No direct evidence | Track, do not act on |
| **Working** | 1-2 sources, or 1 very detailed source | Design with hypothesis in mind |
| **Validated** | 3+ independent sources | Full confidence in product decisions |

**Full specification**: [[HYPOTHESIS_REGISTER]]

---

## 11. Persona Summary

**9 personas** interact with the AP workflow. Each has distinct needs, current pain points, and target improvement. Every feature in the AP workflow must serve at least one persona.

| # | Persona | Role | Primary Stages | Current | Target | Key Pain Point | Key Perionyx Solution |
|---|---------|------|----------------|---------|--------|---------------|----------------------|
| 1 | AP Clerk | Daily operations | 1-4 | 3/10 | 8/10 | Manual data entry, email chasing | OCR + auto-match + AI exception context |
| 2 | AP Manager | Oversight & escalation | 4-6 | 5/10 | 8/10 | System hopping, firefighting | Real-time dashboard + AI pre-classification |
| 3 | Financial Controller | Compliance & audit | 9-10 | 6/10 | 9/10 | Manual GL reconciliation, audit prep | Auto GL posting + immutable audit trail |
| 4 | Treasury Manager | Cash & payments | 6-8 | 7/10 | 8/10 | Stale cash data, payment failures | Real-time banking + payment optimisation |
| 5 | Procurement Manager | Vendor & PO | 2-3 | 5/10 | 7/10 | Constant AP interruptions | Auto-match + exception routing to procurement |
| 6 | CFO | Strategy & reporting | Executive | 5/10 | 8/10 | No real-time visibility | CFO dashboard + board-ready reports |
| 7 | Approver (Dept Head) | Invoice approval | 5 | 4/10 | 8/10 | Email-based approvals, no context | One-tap approval with full evidence package |
| 8 | Auditor | Compliance verification | 10 | 4/10 | 9/10 | Manual evidence gathering | Automated audit package + checksum verification |
| 9 | Vendor (External) | Invoice submission | 1, 8 | 2/10 | 6/10 | No payment visibility | Vendor portal + proactive notifications |

### Evidence Basis for Personas

| Persona | Evidence Source | Confidence |
|---------|----------------|------------|
| AP Clerk | E1 (Adeel Aslam): "manual oversight to ensure accuracy" | High |
| AP Manager | E1, E2 (T1): approval delays, firefighting | High |
| Controller | E5 (Mohamed Gamal): "manual bank reconciliation, manual account reconciliation" | Medium |
| Treasury Manager | E3 (Ayman Shawky): "instant view of cash positions"; E9 (Ahmed Abdelmoneim) | Medium |
| Procurement Manager | E4 (Muhammed Jamsheed): "ERP systems lack strong integration" | Medium |
| CFO | E3 (Ayman Shawky): "single source of truth" | Medium |
| Approver | E1 (T1): "approval workflows...delay payments" | High |
| Auditor | VP4: "Every Action Is Auditable" — constitutional requirement | Constitutional |
| Vendor | E7 (Ahmed Orabi): AP/P2P workflow needs | Medium |

**Full specification**: [[PERSONA_GUIDE]]

---

## 12. Companion Documents

This specification is the executive summary. The full specification is distributed across 12 companion documents.

| # | Document | Purpose | Location |
|---|----------|---------|----------|
| 1 | **Enterprise Product Specification AP v2.0** | This document — master summary | `docs/product/eps/ENTERPRISE_PRODUCT_SPECIFICATION_AP.md` |
| 2 | **AP Reference Workflow v2.0** | Complete 10-stage workflow with all controls | `docs/product/eps/REFERENCE_WORKFLOW_AP.md` |
| 3 | **Business Rule Library v2.0** | 65 business rules with evidence traceability | `docs/product/eps/BUSINESS_RULE_LIBRARY.md` |
| 4 | **User Journey Library v2.0** | 10 user journeys with decision points | `docs/product/eps/USER_JOURNEY_LIBRARY.md` |
| 5 | **Perionyx Product Principles** | 15 product principles with evidence | `docs/product/PERIONYX_PRODUCT_PRINCIPLES.md` |
| 6 | **Product Philosophy** | Core product beliefs | `docs/product/PRODUCT_PHILOSOPHY.md` |
| 7 | **Persona Guide** | 9 persona profiles with day-in-the-life | `docs/product/PERSONA_GUIDE.md` |
| 8 | **Workflow State Machine** | 5 state machines with complete transitions | `docs/product/WORKFLOW_STATE_MACHINE.md` |
| 9 | **AI Behaviour Guide** | AI capabilities, transparency, guardrails | `docs/product/AI_BEHAVIOUR_GUIDE.md` |
| 10 | **UX Information Architecture** | Screen layouts, navigation, interaction patterns | `docs/product/UX_INFORMATION_ARCHITECTURE.md` |
| 11 | **Design System Guidelines** | EDL component usage, financial display standards | `docs/product/DESIGN_SYSTEM_GUIDELINES.md` |
| 12 | **Success Metrics** | Metrics, baselines, targets, measurement framework | `docs/product/SUCCESS_METRICS.md` |
| 13 | **Customer Evidence Traceability** | Evidence → decision mapping | `docs/product/CUSTOMER_EVIDENCE_TRACEABILITY.md` |
| 14 | **Hypothesis Register** | Active hypotheses, validation plans | `docs/product/HYPOTHESIS_REGISTER.md` |

### Implementation References

| Document | Purpose | Location |
|----------|---------|----------|
| AP Domain Architecture | Bounded context, module structure | `docs/ap/AP_DOMAIN_ARCHITECTURE.md` |
| AP Prisma Models | 25 Procurement* models, 33 enums | `docs/ap/AP_PRISMA_MODELS.md` |
| AP API Architecture | 65 REST endpoints, 37 permissions | `docs/ap/AP_API_ARCHITECTURE.md` |
| AP State Machines | Complete transition tables | `docs/ap/AP_STATE_MACHINES.md` |
| AP Domain Events | 63 typed events | `docs/ap/AP_DOMAIN_EVENTS.md` |
| AP Application Services | 7 services, 51 commands | `docs/ap/AP_APPLICATION_SERVICES.md` |
| Platform Constitution | Highest engineering authority | `docs/platform/PLATFORM_CONSTITUTION.md` |

---

## 13. What This Specification Is NOT

### This Specification Is

- A complete description of what the AP workflow does and why
- Grounded in customer evidence from 10 sources across 3 channels
- A reference for finance professionals to review before implementation
- A blueprint for UX designers and engineers to implement
- A source of truth for product decisions and their evidence

### This Specification Is NOT

- **Not code**: This does not describe implementation details, file paths, or database schemas
- **Not a database design**: The Prisma schema is in `docs/ap/AP_PRISMA_MODELS.md`
- **Not an API contract**: API endpoints are in `docs/ap/AP_API_ARCHITECTURE.md`
- **Not a UX mockup**: Visual designs are in the EDL component library
- **Not final**: This is a draft for review. Changes will be made based on finance professional feedback
- **Not a replacement for the Constitution**: The Platform Constitution (`docs/platform/PLATFORM_CONSTITUTION.md`) is the highest authority. This specification inherits from it.

---

## 14. How to Review

### For CFOs (5-minute review)

1. Read Section 3 (Scope) — does this cover the AP workflow you need?
2. Read Section 9 (Success Metrics) — are these the outcomes you care about?
3. Read Section 2 (Evidence Basis) — is this based on real feedback?
4. Read Section 10 (Hypothesis Register) — what assumptions are we making?

### For Controllers (10-minute review)

1. Read Section 4 (Product Principles) — does this align with your compliance requirements?
2. Read Section 6 (State Machines) — are the approval controls adequate?
3. Read Section 8 (Business Rules) — are the top 20 rules the right ones?
4. Read Section 9 (Success Metrics) — is audit readiness measured?

### For AP Managers (10-minute review)

1. Read Section 5 (Workflow Overview) — does this match your current workflow?
2. Read Section 11 (Persona Summary) — is the AP Manager persona accurately described?
3. Read Section 7 (AI Boundary) — are you comfortable with AI in matching and exception resolution?
4. Read Section 3 (Scope) — are the 10 stages the right stages?

### For Treasury Managers (5-minute review)

1. Read Section 5 (Workflow Overview) — focus on Stages 6-8 (Payment Readiness → Execution)
2. Read Section 9 (Success Metrics) — DPO and payment timing targets
3. Read Section 7 (AI Boundary) — payment optimisation AI

### Review Feedback Process

1. Mark questions, concerns, and suggestions directly in the document
2. Flag any metric that seems unrealistic or any workflow stage that seems incomplete
3. Identify any missing persona needs or control points
4. Submit feedback to the Product Team
5. Feedback will be incorporated into v2.1 of this specification

---

## 15. Version History

| Version | Date | Change | Author | Review Status |
|---------|------|--------|--------|--------------|
| 1.0 | 2026-07-28 | Initial enterprise product specification (14 stages, 3 state machines) | Product Team | Superseded |
| 2.0 | 2026-07-28 | Simplified to 10 stages, 5 state machines, expanded to 10 evidence sources, 65 business rules, 14 hypotheses, [HYPOTHESIS] tagging | Product Team | Draft — pending finance professional review |

### Planned Versions

| Version | Date | Change |
|---------|------|--------|
| 2.1 | TBD | Incorporate finance professional review feedback |
| 2.2 | TBD | Post-Phase 27.0B implementation learnings |
| 3.0 | TBD | Post-Phase 21B workflow execution learnings |

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Foundation | [[PRODUCT_PHILOSOPHY]] | Product beliefs this workflow implements |
| Principles | [[PERIONYX_PRODUCT_PRINCIPLES]] | Decision rules governing this workflow |
| Authority | [[PLATFORM_CONSTITUTION]] | Engineering laws this workflow inherits from |
| Workflow | [[REFERENCE_WORKFLOW_AP]] | Complete 10-stage lifecycle specification |
| Implementation | `docs/ap/AP_DOMAIN_ARCHITECTURE.md` | Domain model and bounded context |
| Implementation | `docs/ap/AP_PRISMA_MODELS.md` | Database schema |
| Implementation | `docs/ap/AP_API_ARCHITECTURE.md` | API endpoint contracts |
| Evidence | `brain/03-Customer Intelligence/` | Customer discovery source data |

---

**Version History**

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 2.0 | 2026-07-28 | Phase 27.1 — Canonical product specification for AP workflow | Product Team |
