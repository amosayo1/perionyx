---
title: "Enterprise Product Specification — Accounts Payable Reference Workflow"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
tags:
  - type/specification
  - domain/product
  - domain/ap
  - status/active
owner: Product Team
authority: Product Constitution
---

# Enterprise Product Specification — Accounts Payable Reference Workflow

> **Classification**: Restricted — Internal Use Only
> **Review Required**: CFO, Controller, AP Manager, Treasury Manager
> **Status**: Draft for finance professional review

---

## 1. Purpose

This is the master product specification for the Accounts Payable (AP) Reference Workflow in Perionyx — an Enterprise Financial Operating System.

The AP Reference Workflow is the first complete financial workflow in Perionyx. It serves as the blueprint for every future financial workflow: Accounts Receivable, Treasury, General Ledger, Fixed Assets, and Financial Close.

This document provides an executive-level summary of the complete AP workflow. Every section links to a detailed companion document that contains the full specification.

**A CFO should be able to read this document and understand the entire AP workflow in 10 minutes.**

---

## 2. Scope

This specification covers the complete 14-stage procure-to-pay workflow:

| Stage | Name | Description |
|-------|------|-------------|
| 1 | Vendor Onboarding | Vendor registration, due diligence, risk assessment |
| 2 | Purchase Request | Internal request creation, budget check, department approval |
| 3 | Purchase Order | PO creation, vendor confirmation, terms negotiation |
| 4 | Goods Receipt | Physical receipt, quality inspection, GRN creation |
| 5 | Invoice Receipt | Invoice capture (manual, email, OCR), initial validation |
| 6 | Invoice Validation | Tax validation, duplicate detection, policy compliance |
| 7 | Three-Way Match | Invoice vs. PO vs. Receipt matching with tolerance |
| 8 | Exception Queue | Discrepancy management, investigation, resolution |
| 9 | Approval Routing | Multi-level approval based on amount, department, vendor |
| 10 | Payment Proposal | Batch preparation, payment method selection, cash impact |
| 11 | Treasury Approval | Cash availability check, payment scheduling, bank confirmation |
| 12 | Payment Execution | Payment processing, bank file generation, status tracking |
| 13 | GL Posting | Journal entry creation, subledger reconciliation, posting |
| 14 | Reconciliation & Audit | Bank reconciliation, audit trail verification, close preparation |

### What This Specification Covers

- Complete workflow from vendor onboarding to GL posting
- All 7 personas that interact with AP (AP Clerk through CFO)
- State machines for invoice, payment, and approval lifecycle
- AI behaviour for matching, exception resolution, and payment optimisation
- UX information architecture for every screen in the workflow
- Design system guidelines for every component
- Success metrics with baselines and targets
- Customer evidence traceability for every decision
- Hypothesis register for unvalidated assumptions

### What This Specification Does NOT Cover

- Accounts Receivable workflow (separate specification)
- Treasury workflow (separate specification)
- General Ledger workflow (separate specification)
- Fixed Assets workflow (separate specification)
- Financial Close workflow (separate specification)
- Integration architecture (covered in `docs/platform/`)
- Database schema (covered in `docs/ap/`)
- API contracts (covered in `docs/ap/AP_API_ARCHITECTURE.md`)

---

## 3. Design Principles

This workflow is designed according to the Perionyx Product Principles.

| Principle | Application in AP Workflow |
|-----------|---------------------------|
| **VP1: Reporting Is Table Stakes** | AP dashboard is derived from workflow data, not entered separately |
| **VP2: Operational Automation** | Invoice matching, exception routing, payment batching are automated |
| **VP3: Trust Requires Provable Accuracy** | Every match shows source documents; every approval shows evidence |
| **VP4: Every Action Is Auditable** | 14-stage audit trail with timestamp, actor, decision, evidence |
| **VP5: Financial Precision** | Decimal(38,12) precision; banker's rounding; idempotent payments |
| **VP6: One Financial Truth** | Invoice → PO → Receipt → GL is a single traceable chain |
| **WP1: Exceptions Deserve Attention** | Exception queue with AI-suggested resolutions, human approval |
| **WP2: Context Before Action** | Approval screens show invoice, PO, receipt, vendor, budget |
| **WP3: Evidence Before Approval** | Approval disabled until evidence is displayed |
| **WP4: Human Accountability** | Named human authorisation for every payment |
| **WP5: Separation of Concerns** | SoD enforced: PO creator ≠ invoice approver ≠ payment releaser |

**Full specification**: [[PERIONYX_PRODUCT_PRINCIPLES]]

---

## 4. Persona Summary

Seven personas interact with the AP workflow. Each has distinct needs, current pain points, and target improvement.

| Persona | Role | Current | Target | Primary Stages |
|---------|------|---------|--------|----------------|
| **AP Clerk** | Daily operations | 3/10 | 8/10 | Stages 5-8 (Invoice → Exception) |
| **AP Manager** | Oversight & strategy | 5/10 | 8/10 | Stages 8-11 (Exception → Payment Proposal) |
| **Controller** | Compliance & audit | 6/10 | 8/10 | Stages 10, 12-14 (Approval → Audit) |
| **Treasury Manager** | Cash & payments | 7/10 | 8/10 | Stages 10-12 (Payment Proposal → Execution) |
| **Procurement Manager** | Vendor & PO management | 5/10 | 7/10 | Stages 1-4 (Vendor → Receipt) |
| **Budget Owner** | Spend authorisation | 5/10 | 7/10 | Stages 2-3 (Purchase Request → PO) |
| **Vendor** | External supplier | 0/10 | 3/10 | Stages 1, 5, 12 (Onboarding, Invoice, Payment Status) |

**Full specification**: `docs/ap/AP_PERSONA_REVIEW.md`

---

## 5. Workflow Summary

The AP workflow is a 14-stage procure-to-pay process with clear state transitions, ownership boundaries, and control points.

### Workflow Flow

```
Vendor Onboarding → Purchase Request → Purchase Order → Goods Receipt
                                                            ↓
Reconciliation & Audit ← GL Posting ← Payment Execution ← Treasury Approval
                                                            ↑
                    Invoice Receipt → Validation → 3-Way Match → Exception Queue → Approval → Payment Proposal
```

### Key Control Points

| Control Point | Stage | Purpose |
|---------------|-------|---------|
| Budget Check | Stage 2 | Verify budget availability before PO creation |
| Three-Way Match | Stage 7 | Automated verification of invoice vs. PO vs. receipt |
| SoD Enforcement | Stage 9 | Ensure PO creator ≠ invoice approver |
| Threshold Approval | Stage 9 | Multi-level approval based on amount ($1K/$10K/$50K/$250K) |
| Cash Availability | Stage 11 | Verify funds before payment execution |
| Idempotency | Stage 12 | Prevent duplicate payments |
| GL Reconciliation | Stage 13 | Verify AP subledger = GL balance |

### State Machines

The workflow contains 3 primary state machines:

1. **Invoice State Machine**: Draft → Received → Validating → Matched → Approved → Paid → Reconciled (12 states, 23 transitions)
2. **Payment State Machine**: Proposed → Approved → Scheduled → Processing → Completed → Confirmed (7 states)
3. **Approval State Machine**: Pending → Under Review → Approved/Rejected/Delegated/Escalated (7 states per level)

**Full specification**: `docs/ap/AP_REFERENCE_WORKFLOW.md`, `docs/ap/AP_STATE_MACHINES.md`

---

## 6. State Machine Summary

Every entity in the AP workflow has a defined lifecycle with explicit state transitions. No state transition is permitted without a valid trigger and authority.

### Invoice Lifecycle

| From | To | Trigger | Authority |
|------|----|---------|-----------|
| Draft | Received | Invoice submitted (manual, email, OCR) | AP Clerk |
| Received | Validating | Validation initiated | System (automated) |
| Validating | Matched | Three-way match passes | System (automated) |
| Validating | Exception | Match fails tolerance | System (automated) |
| Exception | Matched | Exception resolved | AP Clerk or AP Manager |
| Matched | Approved | Approval granted | Approver (role-based) |
| Matched | Rejected | Approval denied | Approver (role-based) |
| Approved | Paid | Payment executed | Treasury Manager |
| Paid | Reconciled | Bank reconciliation matches | System (automated) |

### Payment Lifecycle

| From | To | Trigger | Authority |
|------|----|---------|-----------|
| Proposed | Approved | Treasury Manager approves | Treasury Manager |
| Approved | Scheduled | Payment date set | System (automated) |
| Scheduled | Processing | Payment initiated with bank | System (automated) |
| Processing | Completed | Bank confirms payment | System (bank callback) |
| Completed | Confirmed | Reconciliation verified | System (automated) |

### Approval Lifecycle

| From | To | Trigger | Authority |
|------|----|---------|-----------|
| Pending | Under Review | Approver opens approval | Approver |
| Under Review | Approved | Approver clicks approve | Approver |
| Under Review | Rejected | Approver clicks reject (with reason) | Approver |
| Under Review | Delegated | Approver delegates to substitute | Approver |
| Pending | Escalated | Deadline exceeded or approver unavailable | System (automated) |

**Full specification**: `docs/ap/AP_STATE_MACHINES.md`

---

## 7. AI Behaviour Summary

AI in the AP workflow assists human decision-making. It never replaces human judgement.

### AI Capabilities

| Capability | Stage | Behaviour | Override |
|-----------|-------|-----------|----------|
| **Invoice OCR** | Stage 5 | Extract line items, amounts, vendor from invoice image | Manual correction always available |
| **Duplicate Detection** | Stage 6 | Flag invoices matching existing invoices (vendor, amount, date) | AP Clerk can dismiss with reason |
| **Three-Way Match** | Stage 7 | Automated matching with tolerance application | Exception raised for human resolution |
| **Exception Resolution** | Stage 8 | Suggest resolution based on historical patterns | AP Manager must approve resolution |
| **Payment Optimisation** | Stage 10 | Recommend payment timing based on discount terms and cash position | Treasury Manager makes final decision |
| **Vendor Risk Scoring** | Stage 1 | Score vendor risk based on payment history, compliance, financial health | Procurement Manager reviews |

### AI Transparency Requirements

Every AI-generated recommendation must include:

1. **Reasoning Chain**: Why this recommendation was made (which rules, which data, which patterns)
2. **Confidence Level**: 0-100% confidence score with explanation of factors
3. **Source Data**: Links to the invoices, POs, receipts, and vendor records that informed the recommendation
4. **Override Option**: Clear path for the human to reject or modify the recommendation
5. **Audit Trail**: The recommendation, the human decision, and the timestamp are all recorded

### AI Guardrails

- AI never executes payments — humans authorise all financial transactions
- AI never approves invoices — humans approve all financial commitments
- AI never modifies financial records — humans make all data changes
- AI recommendations are labelled as recommendations, never as decisions
- AI confidence below 70% triggers mandatory human review

**Full specification**: `docs/product/AI_BEHAVIOUR_GUIDE.md`

---

## 8. UX Summary

The AP workflow UX is designed for finance professionals who make financial decisions under time pressure.

### Screen Architecture

| Screen | Purpose | Primary User | Key Metric |
|--------|---------|-------------|------------|
| AP Dashboard | Today's AP status at a glance | AP Manager | DPO, exception rate, aging |
| Invoice Inbox | New invoices requiring action | AP Clerk | Unprocessed count, oldest invoice |
| Three-Way Match | Match results and exceptions | AP Clerk | Match rate, exception rate |
| Exception Queue | Discrepancies requiring investigation | AP Clerk, AP Manager | Open exceptions, aging, financial impact |
| Approval Centre | Pending approvals with full context | Approver (any role) | Pending count, oldest approval, total value |
| Payment Proposals | Batched payments for review | Treasury Manager | Total value, discount capture rate |
| Vendor Registry | Vendor management and risk | Procurement Manager | Active vendors, risk distribution |
| Audit Trail | Complete transaction history | Controller | Coverage %, reconstruction time |

### Design Principles Applied

- **Clarity**: Every screen answers one question (VP1)
- **Context**: Approval screens are context-complete — invoice, PO, receipt, vendor, budget in one view (WP2)
- **Speed**: Metric values render first, charts second (VP2)
- **Confidence**: Every automated action shows its work (VP3)
- **Trust**: Data freshness is labelled; stale data is flagged (VP4)

### Mobile Considerations

- Approval actions available on mobile (approval is time-sensitive)
- Exception queue viewable on mobile (investigation may happen away from desk)
- Dashboard summary available on mobile (executive check-in)
- Invoice entry NOT on mobile (data entry is not optimised)

**Full specification**: `docs/product/UX_INFORMATION_ARCHITECTURE.md`

---

## 9. Design System Summary

The AP workflow uses the Perionyx Enterprise Design Language (EDL).

### Visual Identity

| Element | Value | Application |
|---------|-------|-------------|
| Base surface | `#0a0a0f` | Page backgrounds |
| Card surface | `#111118` | Content cards, panels |
| Elevated surface | `#1a1a24` | Modals, dropdowns |
| Gold accent | `#d4af37` | Active states, key metrics, currency values |
| Typography | Inter + JetBrains Mono | Body text + financial figures |
| Spacing | 4px base | All spacing multiples of 4 |
| Radius | 4px (small), 8px (medium), 12px (large) | Buttons, cards, modals |

### Component Usage in AP

| Component | Used For | EDL Source |
|-----------|----------|-----------|
| EnterpriseForm | Invoice entry, vendor creation, payment setup | `src/components/enterprise/forms/` |
| EnterpriseTable | Invoice list, exception queue, audit trail | `src/components/enterprise/table/` |
| EnterpriseWizard | Vendor onboarding (multi-step) | `src/components/enterprise/forms/` |
| MetricCard | Dashboard KPIs, aging summary | `src/components/enterprise/` |
| StatusBadge | Invoice status, payment status, match status | EDL tokens |
| ApprovalPreview | Approval path visualization | `src/components/enterprise/forms/` |

### Financial Display Standards

- Currency: `$1,234,567.89` (negative: `($12,345.67)` in red)
- Large amounts: `$1.2M`, `$345K` (compact display)
- Percentages: `94.2%` (one decimal)
- Dates: `Jul 28, 2026` (short format) or `3 months ago` (relative)
- Durations: `2h 15m` (hours and minutes)

**Full specification**: `docs/product/DESIGN_SYSTEM_GUIDELINES.md`

---

## 10. Success Metrics

The AP workflow is measured against specific, quantifiable metrics with baselines and targets.

| Metric | Baseline (Current) | Target (Phase 21) | Method |
|--------|-------------------|-------------------|--------|
| **Time-to-Decision** | 15-45 min | < 3 min | Workflow timestamps |
| **Invoice Processing Time** | 3-5 days | < 4 hours | Invoice lifecycle timestamps |
| **Match Rate** | ~60% (manual) | > 90% (automated) | Three-way match results |
| **Exception Rate** | ~40% | < 10% | Exception queue metrics |
| **Exception Resolution Time** | 3-7 days | < 4 hours | Exception lifecycle timestamps |
| **Approval Cycle Time** | 1-3 days | < 2 hours | Approval lifecycle timestamps |
| **Days Payable Outstanding** | 45-60 days | 30-40 days | AP aging calculation |
| **Early-Pay Discount Capture** | ~20% | > 80% | Discount analysis |
| **Audit Readiness** | ~60% | 100% | Audit trail coverage |
| **On-Time Payment Rate** | ~70% | > 95% | Payment timing analysis |
| **Duplicate Invoice Rate** | ~5% (manual detection) | < 0.1% (automated) | Duplicate detection results |
| **Confidence Score** | 2.8/5 (estimated) | 4.2/5 | User surveys |

### Measurement Framework

Every metric is measured through workflow timestamps embedded in the application. No manual measurement is required. Metrics are computed in real-time and available on the AP dashboard.

**Full specification**: `docs/product/SUCCESS_METRICS.md`

---

## 11. Customer Evidence

Every product decision in this specification is traceable to customer evidence.

### Primary Evidence Sources

| Source | Date | Channel | Key Insights |
|--------|------|---------|-------------|
| Adeel Aslam | 2026-07-21 | LinkedIn DM | Vendor invoice reconciliation, approval workflows, reporting is adequate |
| Ahmed Shatla | 2026-07-21 | Discovery call | Approval workflows, vendor reconciliation |
| Ayman Shawky | CRM contact | CRM notes | Siloed systems, real-time cash, AI confidence scoring |
| Muhammed Jamsheed | CRM contact | CRM notes | ERP integration gaps, inventory-finance disconnect |

### Evidence Traceability

| Product Decision | Evidence Source | Confidence |
|-----------------|----------------|------------|
| Focus on operational automation, not analytics | Adeel Aslam: "reporting...fairly well" | Working |
| Build three-way match with show-your-work | Adeel Aslam: "manual oversight to ensure accuracy" | Working |
| Exception queue as first-class feature | Adeel Aslam + Ahmed Shatla (T1, T2) | Working |
| Real-time dashboard (not nightly batch) | Ayman Shawky: "instant view of cash positions" | Hypothesis |
| AI confidence scoring on recommendations | Ayman Shawky: "need for confidence scoring" | Hypothesis |
| Unified platform (not best-of-breed) | Ayman Shawky + Muhammed Jamsheed (T3) | Hypothesis |

**Full specification**: `docs/product/CUSTOMER_EVIDENCE_TRACEABILITY.md`

---

## 12. Hypotheses

The following assumptions in this specification are unvalidated and must be confirmed before implementation.

### Active Hypotheses

| ID | Hypothesis | Evidence | Validation Plan | Risk if Wrong |
|----|-----------|----------|----------------|---------------|
| H-01 | Finance professionals prefer automated matching with manual override over fully manual matching | Inferred from T1, T2 | Beta testing with AP clerks | Low adoption of matching feature |
| H-02 | Approval delegation is a critical requirement for mid-market companies | Industry patterns (P7) | Interview 3+ finance managers | Approval workflow too rigid |
| H-03 | AI exception resolution suggestions will be trusted after 3 months of use | Inferred from T6 | Measure override rate over time | AI suggestions ignored |
| H-04 | Real-time AP aging is more valuable than nightly batch reports | Ayman Shawky (T4) | A/B test real-time vs. batch | No adoption difference |
| H-05 | Arabic-first design will increase MENA market adoption | CRM profiles | Interview 3+ MENA finance pros | No MENA adoption |
| H-06 | Three-way match automation will reduce AP processing time by 60%+ | Industry benchmarks | Measure before/after processing time | Insufficient time savings |
| H-07 | Exception queue prioritised by financial impact reduces resolution time | Inferred from WP1 | Measure resolution time by priority | No improvement |

### Hypothesis Lifecycle

| Stage | Criteria | Action |
|-------|----------|--------|
| Hypothesis | No direct evidence | Track, do not act on |
| Working | 1-2 sources | Design with hypothesis in mind |
| Validated | 3+ sources | Full confidence in product decisions |

**Full specification**: `docs/product/HYPOTHESIS_REGISTER.md`

---

## 13. What This Specification Is NOT

This specification is a product document, not an engineering document.

### This Specification Is

- A complete description of what the AP workflow does and why
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

### Companion Documents

| Document | Purpose | Location |
|----------|---------|----------|
| PERSONA_GUIDE.md | Detailed persona profiles, pain points, journeys | `docs/product/PERSONA_GUIDE.md` |
| AP_REFERENCE_WORKFLOW.md | Complete 14-stage workflow specification | `docs/ap/AP_REFERENCE_WORKFLOW.md` |
| WORKFLOW_STATE_MACHINE.md | State machines for all entities | `docs/ap/AP_STATE_MACHINES.md` |
| AI_BEHAVIOUR_GUIDE.md | AI capabilities, transparency, guardrails | `docs/product/AI_BEHAVIOUR_GUIDE.md` |
| UX_INFORMATION_ARCHITECTURE.md | Screen layouts, navigation, interaction patterns | `docs/product/UX_INFORMATION_ARCHITECTURE.md` |
| DESIGN_SYSTEM_GUIDELINES.md | EDL component usage, financial display standards | `docs/product/DESIGN_SYSTEM_GUIDELINES.md` |
| SUCCESS_METRICS.md | Metrics, baselines, targets, measurement framework | `docs/product/SUCCESS_METRICS.md` |
| CUSTOMER_EVIDENCE_TRACEABILITY.md | Evidence → decision mapping | `docs/product/CUSTOMER_EVIDENCE_TRACEABILITY.md` |
| HYPOTHESIS_REGISTER.md | Active hypotheses, validation plans | `docs/product/HYPOTHESIS_REGISTER.md` |

---

## 14. How to Review

This specification is written for finance professionals who will review it before implementation. Here is how to review it effectively.

### For CFOs (5-minute review)

1. Read Section 2 (Scope) — does this cover the AP workflow you need?
2. Read Section 10 (Success Metrics) — are these the outcomes you care about?
3. Read Section 11 (Customer Evidence) — is this based on real feedback?
4. Read Section 12 (Hypotheses) — what assumptions are we making?

### For Controllers (10-minute review)

1. Read Section 3 (Design Principles) — does this align with your compliance requirements?
2. Read Section 6 (State Machine Summary) — are the approval controls adequate?
3. Read Section 4 (Persona Summary) — is the Controller persona adequately served?
4. Read Section 10 (Success Metrics) — is audit readiness measured?

### For AP Managers (10-minute review)

1. Read Section 5 (Workflow Summary) — does this match your current workflow?
2. Read Section 4 (Persona Summary) — is the AP Manager persona accurately described?
3. Read Section 7 (AI Behaviour Summary) — are you comfortable with AI in matching and exception resolution?
4. Read Section 8 (UX Summary) — do the screens match your mental model?

### For Treasury Managers (5-minute review)

1. Read Section 5 (Workflow Summary) — focus on Stages 10-12 (Payment Proposal → Execution)
2. Read Section 10 (Success Metrics) — DPO and payment timing targets
3. Read Section 7 (AI Behaviour Summary) — payment optimisation AI

### Review Feedback Process

1. Mark questions, concerns, and suggestions directly in the document
2. Flag any metric that seems unrealistic or any workflow stage that seems incomplete
3. Identify any missing persona needs or control points
4. Submit feedback to the Product Team by [date TBD]
5. Feedback will be incorporated into v1.1 of this specification

---

## 15. Version History

| Version | Date | Change | Author | Review Status |
|---------|------|--------|--------|--------------|
| 1.0 | 2026-07-28 | Initial enterprise product specification | Product Team | Draft — pending finance professional review |

### Planned Versions

| Version | Date | Change |
|---------|------|--------|
| 1.1 | TBD | Incorporate finance professional review feedback |
| 2.0 | TBD | Post-Phase 21A update with implementation learnings |
| 3.0 | TBD | Post-Phase 21B update with workflow execution learnings |

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Foundation | [[PRODUCT_PHILOSOPHY]] | Product beliefs this workflow implements |
| Principles | [[PERIONYX_PRODUCT_PRINCIPLES]] | Decision rules governing this workflow |
| Authority | [[PLATFORM_CONSTITUTION]] | Engineering laws this workflow inherits from |
| Implementation | `docs/ap/AP_DOMAIN_ARCHITECTURE.md` | Domain model and bounded context |
| Implementation | `docs/ap/AP_PRISMA_MODELS.md` | Database schema |
| Implementation | `docs/ap/AP_API_ARCHITECTURE.md` | API endpoint contracts |
| Implementation | `docs/ap/AP_STATE_MACHINES.md` | State machine specifications |
| Evidence | `brain/03-Customer Intelligence/` | Customer discovery source data |

---

**Version History**

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0 | 2026-07-28 | Initial enterprise product specification | Product Team |
