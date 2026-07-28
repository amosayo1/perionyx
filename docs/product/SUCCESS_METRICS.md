---
title: "Success Metrics"
created: 2026-07-28
phase: "27.0A"
tags: [product, ap, metrics, success]
---

# Success Metrics

## Purpose

How we measure whether Perionyx improves AP work. Every metric has a baseline (current state), a target (what "good" looks like), and a measurement method.

## Metric Categories

| Category | Focus | Example |
|----------|-------|---------|
| **Efficiency** | Time and effort reduction | Time to process invoice |
| **Quality** | Error and exception reduction | Match rate, duplicate detection |
| **Trust** | User confidence in the system | Confidence survey score |
| **Adoption** | Usage and engagement | Daily active users, feature adoption |
| **Financial** | Direct financial impact | Discount capture, DPO optimisation |

---

## Efficiency Metrics

### E1: Time to Process Invoice

| Field | Value |
|-------|-------|
| **Definition** | Elapsed time from invoice receipt to payment-ready (approved for payment) |
| **Baseline** | 2-5 days (manual: enter, match, resolve, approve) — Phase 21.0 gap analysis |
| **Target 30-day** | <4 hours (automated match + same-day approval for routine invoices) |
| **Target 90-day** | <2 hours |
| **Target 180-day** | <1 hour for auto-matched invoices |
| **Measurement** | Timestamp difference: invoice.captured → invoice.approved |
| **Anti-Gaming** | Do not count invoices as "processed" if they bypass matching |

### E2: Approval Cycle Time

| Field | Value |
|-------|-------|
| **Definition** | Elapsed time from invoice approval submission to final approval decision |
| **Baseline** | 1-3 days (email-based, manual routing) |
| **Target 30-day** | <4 hours |
| **Target 90-day** | <2 hours |
| **Target 180-day** | <1 hour for auto-approved invoices |
| **Measurement** | Timestamp difference: approval.submitted → approval.decided |
| **Anti-Gaming** | Auto-approval counts only if all business rules are satisfied |

### E3: Payment Cycle Time

| Field | Value |
|-------|-------|
| **Definition** | Elapsed time from invoice approval to payment execution |
| **Baseline** | 3-7 days (manual batching, weekly payment runs) |
| **Target 30-day** | <24 hours |
| **Target 90-day** | <12 hours |
| **Target 180-day** | <8 hours for routine payments |
| **Measurement** | Timestamp difference: invoice.approved → payment.completed |
| **Anti-Gaming** | Must include bank confirmation timestamp |

### E4: Investigation Time per Exception

| Field | Value |
|-------|-------|
| **Definition** | Average time an AP clerk spends resolving a single exception |
| **Baseline** | 30-60 minutes (manual investigation: check PO, call vendor, verify GRN) |
| **Target 30-day** | <15 minutes (AI evidence package reduces investigation) |
| **Target 90-day** | <10 minutes |
| **Target 180-day** | <5 minutes for routine exceptions |
| **Measurement** | Timestamp difference: exception.created → exception.resolved, weighted by clerk time |
| **Anti-Gaming** | Do not count "auto-resolved" exceptions (those are quality metrics) |

---

## Quality Metrics

### Q1: Match Rate

| Field | Value |
|-------|-------|
| **Definition** | Percentage of invoices matched automatically (without manual intervention) |
| **Baseline** | 0% (matching not wired to UI) |
| **Target 30-day** | >70% |
| **Target 90-day** | >85% |
| **Target 180-day** | >90% |
| **Measurement** | (Invoices with match.status = "matched" / total invoices) × 100 |
| **Anti-Gaming** | Must include all invoices, not just PO-based invoices |

### Q2: Exception Rate

| Field | Value |
|-------|-------|
| **Definition** | Percentage of invoices requiring manual intervention (exception queue) |
| **Baseline** | 100% (all invoices are manual) |
| **Target 30-day** | <25% |
| **Target 90-day** | <15% |
| **Target 180-day** | <10% |
| **Measurement** | (Invoices entering exception queue / total invoices) × 100 |
| **Anti-Gaming** | Do not suppress exceptions to improve rate |

### Q3: Duplicate Detection Rate

| Field | Value |
|-------|-------|
| **Definition** | Percentage of duplicate invoices caught before payment |
| **Baseline** | 0% (no duplicate detection) |
| **Target 30-day** | >95% |
| **Target 90-day** | >99% |
| **Target 180-day** | >99.5% |
| **Measurement** | (Duplicates caught / total duplicates presented) × 100 |
| **Anti-Gaming** | Must include false positive tracking |

### Q4: GL Posting Accuracy

| Field | Value |
|-------|-------|
| **Definition** | Percentage of GL postings that are correct (no reversing entries required) |
| **Baseline** | N/A (GL integration not wired) |
| **Target 30-day** | >98% |
| **Target 90-day** | >99.5% |
| **Target 180-day** | >99.9% |
| **Measurement** | (Postings without reversal / total postings) × 100 |
| **Anti-Gaming** | Reversals are counted even if corrected same-day |

---

## Trust Metrics

### T1: User Confidence Score

| Field | Value |
|-------|-------|
| **Definition** | Survey score: "I trust the data in this system to make financial decisions" (1-5 scale) |
| **Baseline** | N/A (no survey yet) |
| **Target 30-day** | >3.5/5 |
| **Target 90-day** | >4.0/5 |
| **Target 180-day** | >4.2/5 |
| **Measurement** | Monthly in-app survey (1 question, optional) |
| **Anti-Gaming** | Survey must be anonymous and optional |

### T2: AI Recommendation Adoption Rate

| Field | Value |
|-------|-------|
| **Definition** | Percentage of AI recommendations that users act on (accept or override with reason) |
| **Baseline** | N/A (no AI recommendations yet) |
| **Target 30-day** | >60% |
| **Target 90-day** | >75% |
| **Target 180-day** | >85% |
| **Measurement** | (Recommendations with user action / total recommendations) × 100 |
| **Anti-Gaming** | "Ignore" without reading counts as non-adoption |

### T3: Audit Readiness Score

| Field | Value |
|-------|-------|
| **Definition** | Percentage of transactions with complete audit trail (who/when/why for every state transition) |
| **Baseline** | 0% (no AP audit trail) |
| **Target 30-day** | >95% |
| **Target 90-day** | >99% |
| **Target 180-day** | 100% |
| **Measurement** | (Transactions with complete audit chain / total transactions) × 100 |
| **Anti-Gaming** | Must include all transition types, not just approvals |

---

## Adoption Metrics

### A1: Daily Active AP Users

| Field | Value |
|-------|-------|
| **Definition** | Number of unique users who perform at least one AP action per day |
| **Baseline** | 0 (no functional AP workflow) |
| **Target 30-day** | >5 |
| **Target 90-day** | >10 |
| **Target 180-day** | >20 |
| **Measurement** | Unique user IDs with AP actions in last 24 hours |

### A2: Feature Adoption Rate

| Field | Value |
|-------|-------|
| **Definition** | Percentage of AP users who use each core feature at least once per week |
| **Baseline** | N/A |
| **Target 30-day** | >50% for invoice entry, >30% for matching, >20% for exception resolution |
| **Target 90-day** | >70% for invoice entry, >50% for matching, >40% for exception resolution |
| **Measurement** | Feature usage events per user per week |

---

## Financial Metrics

### F1: Early-Pay Discount Capture Rate

| Field | Value |
|-------|-------|
| **Definition** | Percentage of available early-pay discounts that are captured |
| **Baseline** | 0% (no discount tracking) |
| **Target 30-day** | >50% |
| **Target 90-day** | >70% |
| **Target 180-day** | >80% |
| **Measurement** | (Discounts captured / discounts available) × 100 |
| **Anti-Gaming** | Must track all available discounts, not just captured ones |

### F2: Days Payable Outstanding (DPO)

| Field | Value |
|-------|-------|
| **Definition** | Average number of days between invoice receipt and payment |
| **Baseline** | N/A (no measurement) |
| **Target 30-day** | Within vendor payment terms (e.g., 30 days for net-30 vendors) |
| **Target 90-day** | Optimised: pay early when discount available, on-time otherwise |
| **Target 180-day** | Cash-flow optimised: balance discount capture with cash preservation |
| **Measurement** | Average (payment.completed.timestamp - invoice.captured.timestamp) in days |

### F3: AP Automation Savings

| Field | Value |
|-------|-------|
| **Definition** | Estimated labour cost savings from AP automation (hours saved × hourly rate) |
| **Baseline** | $0 |
| **Target 30-day** | Track hours saved, no cost target yet |
| **Target 90-day** | >$5K/month estimated savings |
| **Target 180-day** | >$15K/month estimated savings |
| **Measurement** | (Hours saved per invoice × invoices processed × hourly rate) |

---

## Anti-Metrics (What We Explicitly Do NOT Measure)

| Anti-Metric | Why We Don't Measure It |
|-------------|------------------------|
| **Number of invoices entered** | Encourages speed over accuracy |
| **Number of approvals per hour** | Encourages rubber-stamping |
| **AI accuracy percentage in isolation** | Without context, accuracy is meaningless |
| **Time spent in system** | Longer time may mean more thorough review, not inefficiency |
| **Number of features used** | Feature count ≠ value delivered |

---

## Measurement Infrastructure

### Data Collection
- All timestamps recorded at state transitions (Prisma createdAt/updatedAt)
- Audit log captures who/when/why for every action
- Survey responses stored anonymously
- Feature usage tracked via API call logging

### Reporting Cadence
| Report | Frequency | Audience |
|--------|-----------|----------|
| AP Dashboard | Real-time | AP Clerk, AP Manager |
| Weekly AP Summary | Weekly | Controller, CFO |
| Monthly AP Metrics | Monthly | CFO, Board |
| Quarterly Review | Quarterly | All stakeholders |

### Baseline Establishment
Before launch, establish baselines by:
1. Measuring current manual process times (interview-based)
2. Counting current exception resolution times (if trackable)
3. Surveying current trust levels (pre-launch survey)
4. Documenting current discount capture rates (if available)
