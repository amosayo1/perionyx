---
title: "Design Partner Pipeline — Phase 27.0"
phase: 27.0
status: complete
date: 2026-07-28
author: Perionyx Engineering
tags: [customer-intelligence, design-partners, pipeline, scoring]
version: "1.0"
---

# Design Partner Pipeline — Phase 27.0

## 1. Pipeline Overview

### Current State

| Metric | Value |
|---|---|
| Total Contacts | 39 |
| Pre-Scored Candidates | 7 |
| Fully Scored (post-interview) | 0 |
| Formal Design Partners | 0 |
| Target (Q4 2026) | 5 |

### Pipeline Funnel

```
39 Total Contacts
  └─ 7 Pre-Scored Candidates (18%)
       └─ 3 Tier 1-2 (high potential)
       └─ 4 Tier 3 (moderate potential)
  └─ 32 Not Yet Scored (82%)
       └─ 4 Connected (ready for interview)
       └─ 28 Prospects (need engagement)
```

### Pipeline Velocity

- **Stage 1**: Prospect → Connected: 4/30 (13%)
- **Stage 2**: Connected → Interview Scheduled: 2/4 (50%)
- **Stage 3**: Interview Scheduled → Interview Completed: 1/2 (50%)
- **Stage 4**: Interview Completed → Design Partner: 0/1 (0%)
- **Overall Conversion**: 0/39 (0%)

## 2. Scoring Framework

### 5 Dimensions

| Dimension | Weight | Description | Scoring (1-10) |
|---|---|---|---|
| **Engagement** | 25% | Frequency and quality of interactions | 1=rare, 10=daily |
| **Expertise** | 25% | Domain knowledge and seniority | 1=junior, 10=C-suite+ |
| **Feedback Quality** | 20% | Depth and constructiveness of feedback | 1=surface, 10=actionable |
| **Strategic Fit** | 20% | Alignment with product vision | 1=misaligned, 10=perfect fit |
| **Availability** | 10% | Time commitment potential | 1=unavailable, 10=always |

### Scoring Formula

```
Design Partner Score = (Engagement × 0.25) + (Expertise × 0.25) + (Feedback × 0.20) + (Strategic × 0.20) + (Availability × 0.10)
```

### Tier Thresholds

| Tier | Score Range | Meaning | Action |
|---|---|---|---|
| **Tier 1** | 7.5-10.0 | Highest potential | Prioritize interview, fast-track partnership |
| **Tier 2** | 6.5-7.4 | Very high potential | Schedule interview within 2 weeks |
| **Tier 3** | 5.5-6.4 | High potential | Schedule interview within 4 weeks |
| **Tier 4** | 4.5-5.4 | Medium potential | Schedule interview within 8 weeks |
| **Tier 5** | 3.5-4.4 | Low potential | Monitor, engage opportunistically |
| **Not Rated** | < 3.5 | None | No active engagement |

## 3. Pre-Scored Candidates

### Detailed Scoring

| Rank | Name | Role | Company | Engagement | Expertise | Feedback | Strategic | Availability | **Total** | Tier |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Adeel Aslam | CFO | N/A | 8 | 9 | 8 | 7 | 7 | **7.8** | Tier 1 |
| 2 | Ayman Shawky | Finance Director | N/A | 7 | 8 | 7 | 7 | 7 | **7.2** | Tier 2 |
| 3 | Muhammed Jamsheed | AP Manager | N/A | 7 | 8 | 7 | 6 | 7 | **7.0** | Tier 2 |
| 4 | Mostafa | Finance Lead | N/A | 6 | 7 | 6 | 7 | 7 | **6.6** | Tier 3 |
| 5 | Sarah Chen | CFO | TechCorp | 5 | 8 | 5 | 8 | 6 | **6.4** | Tier 3 |
| 6 | Fatima Al-Rashid | Treasury Manager | MenaHoldings | 5 | 7 | 5 | 7 | 7 | **6.2** | Tier 3 |
| 7 | Michael Torres | AP Director | LatamCorp | 5 | 7 | 5 | 7 | 6 | **6.0** | Tier 3 |

### Scoring Notes

- **Adeel Aslam**: Highest score due to completed interview, direct evidence, CFO-level expertise
- **Ayman Shawky**: Strong score due to finance director role, interview scheduled, strategic fit
- **Muhammed Jamsheed**: Strong score due to AP manager role, interview scheduled, operational expertise
- **Mostafa**: Good score due to finance lead role, connected status, strategic alignment
- **Sarah Chen**: High expertise (CFO) but lower engagement (Prospect), high strategic fit
- **Fatima Al-Rashid**: Treasury expertise fills module gap, good availability
- **Michael Torres**: AP director role, fills Latin America geographic gap

## 4. Tier Assignments

### Tier 1: Highest Potential (1 candidate)

| Name | Role | Score | Key Strengths |
|---|---|---|---|
| Adeel Aslam | CFO | 7.8 | Interview completed, 3 evidence claims, direct product feedback |

### Tier 2: Very High Potential (2 candidates)

| Name | Role | Score | Key Strengths |
|---|---|---|---|
| Ayman Shawky | Finance Director | 7.2 | Interview scheduled, finance director expertise, strategic fit |
| Muhammed Jamsheed | AP Manager | 7.0 | Interview scheduled, AP domain expertise, operational focus |

### Tier 3: High Potential (4 candidates)

| Name | Role | Score | Key Strengths |
|---|---|---|---|
| Mostafa | Finance Lead | 6.6 | Connected, strategic alignment, good availability |
| Sarah Chen | CFO | 6.4 | CFO-level expertise, strategic importance, TechCorp scale |
| Fatima Al-Rashid | Treasury Manager | 6.2 | Treasury expertise, Middle East representation, good availability |
| Michael Torres | AP Director | 6.0 | AP expertise, Latin America representation, operational focus |

### Tier 4-5: Not Yet Scored (0 candidates)

No candidates scored in Tier 4-5 — all scored candidates are Tier 3 or above.

### Not Rated (32 candidates)

32 contacts have not been scored. Priority for scoring:
1. 4 Connected contacts (Aman, Karim E., Karim A., plus the 7 already scored)
2. Top 5 Prospect contacts by strategic importance

## 5. Qualification Criteria

### Why Each Candidate Qualifies

#### Adeel Aslam (Tier 1)
- **CFO-level** — Direct decision-maker for finance software
- **Interview completed** — Provided 3 evidence claims
- **Product feedback** — Identified vendor invoice reconciliation pain
- **Strategic alignment** — Shares product vision for AI-powered finance
- **Availability** — Willing to participate in design sessions

#### Ayman Shawky (Tier 2)
- **Finance Director** — Senior role with budget authority
- **Interview scheduled** — Committed to sharing expertise
- **Strategic fit** — Organization likely faces similar pain points
- **Expertise** — Finance director-level knowledge of workflows
- **Availability** — Committed to interview process

#### Muhammed Jamsheed (Tier 2)
- **AP Manager** — Direct user of AP workflows (our first workflow)
- **Interview scheduled** — Committed to sharing expertise
- **Operational expertise** — Hands-on knowledge of invoice processing
- **Strategic fit** — AP is our reference implementation
- **Availability** — Committed to interview process

#### Mostafa (Tier 3)
- **Finance Lead** — Senior finance role
- **Connected** — Already engaged
- **Strategic alignment** — Shares vision for modern finance tools
- **Availability** — Good availability for design sessions
- **Expertise** — Finance lead-level knowledge

#### Sarah Chen (Tier 3)
- **CFO** — Highest-level finance role
- **TechCorp** — Technology company, likely early adopter
- **Strategic importance** — CFO perspective is critical for product
- **Expertise** — Deep finance knowledge
- **Availability** — Moderate (CFO schedule constraints)

#### Fatima Al-Rashid (Tier 3)
- **Treasury Manager** — Treasury module expertise
- **MenaHoldings** — Middle East representation
- **Module gap fill** — Treasury is underrepresented
- **Geographic diversity** — Adds Middle East perspective
- **Availability** — Good availability

#### Michael Torres (Tier 3)
- **AP Director** — AP expertise at scale
- **LatamCorp** — Latin America representation
- **Module fill** — AP is our reference workflow
- **Geographic diversity** — Adds Latin America perspective
- **Availability** — Moderate

## 6. Engagement Plan

### Immediate Actions (This Week)

1. **Adeel Aslam**: Schedule design partner kickoff call
2. **Ayman Shawky**: Confirm interview date, send prep materials
3. **Muhammed Jamsheed**: Confirm interview date, send prep materials

### Short-Term (This Month)

4. **Mostafa**: Schedule interview, prepare questions
5. **Sarah Chen**: Send introduction email, request interview
6. **Fatima Al-Rashid**: Send introduction email, request interview
7. **Michael Torres**: Send introduction email, request interview

### Medium-Term (This Quarter)

8. Score all 7 candidates post-interview
9. Formalize top 5 as design partners
10. Begin regular design sessions (bi-weekly)

### Engagement Cadence

| Tier | Interview | Design Sessions | Check-ins |
|---|---|---|---|
| Tier 1 | Immediate | Weekly | Weekly |
| Tier 2 | Within 2 weeks | Bi-weekly | Bi-weekly |
| Tier 3 | Within 4 weeks | Monthly | Monthly |
| Tier 4-5 | Within 8 weeks | Quarterly | Quarterly |

## 7. Gap Analysis

### What's Missing

| Gap | Current | Target | Action |
|---|---|---|---|
| Formal interviews | 1 | 12 | Schedule 11 interviews |
| Fully scored candidates | 0 | 7 | Score after interviews |
| Formal design partners | 0 | 5 | Formalize partnerships |
| Evidence claims per contact | 0.13 avg | 2+ avg | Extract from interviews |
| Module coverage | 2/8 modules | 8/8 modules | Target underrepresented modules |
| Geographic coverage | 1/6 regions | 6/6 regions | Target underrepresented regions |

### 2+ Interview Threshold

To validate a claim, we need 2+ independent sources. Current status:

| Claim | Sources | Threshold Met? |
|---|---|---|
| T1: Vendor Invoice Reconciliation | 2 (Adeel + Phase 20.0) | Yes |
| T2: Approval Workflow Delays | 2 (Adeel + Phase 20.0) | Yes |
| T3: Fragmented Workflows | 2 (Adeel + Phase 20.0) | Yes |
| T4: Real-Time Visibility | 1 (Phase 20.0) | No |
| T5: Multi-Currency Complexity | 1 (Phase 20.0) | No |
| T6: ERP Integration Friction | 1 (Phase 20.0) | No |
| T7: Compliance Automation | 1 (Phase 20.0) | No |
| T8: Audit Trail Integrity | 1 (Phase 20.0) | No |

### Module Gap Analysis

| Module | Contacts | Interviews | Gap |
|---|---|---|---|
| Accounts Payable | 2 (Adeel, Muhammed) | 1 | Need 2+ more interviews |
| Treasury | 1 (Fatima) | 0 | Need 2+ interviews |
| General Ledger | 0 | 0 | Need 3+ contacts + interviews |
| Accounts Receivable | 0 | 0 | Need 3+ contacts + interviews |
| Fixed Assets | 0 | 0 | Need 2+ contacts + interviews |
| Compliance | 0 | 0 | Need 2+ contacts + interviews |
| FP&A | 0 | 0 | Need 2+ contacts + interviews |
| Risk Management | 0 | 0 | Need 2+ contacts + interviews |

## 8. Target: 5 Design Partners by Q4 2026

### Current Progress

| Milestone | Status | Date |
|---|---|---|
| 7 candidates pre-scored | Complete | 2026-07-28 |
| 11 interviews scheduled | Pending | — |
| 11 interviews completed | Pending | — |
| 7 candidates fully scored | Pending | — |
| 5 design partners formalized | Pending | — |

### Path to 5 Design Partners

```
July 2026:    7 pre-scored candidates ← Current
August 2026:  4 interviews completed (Tier 1-2)
September 2026: 11 interviews completed (all tiers)
October 2026:  7 candidates fully scored
November 2026: 5 design partners formalized
December 2026: 5 design partners active ← Target
```

### Formalization Requirements

To formalize a design partner, we need:
1. ✅ Completed interview (2+ sessions)
2. ✅ Score ≥ 6.0 across all dimensions
3. ⬜ Design partner agreement signed
4. ⬜ First design session completed
5. ⬜ Feature request submitted
6. ⬜ Feedback loop established

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Interview cancellations | Medium | High | Over-schedule by 20% |
| Low engagement post-interview | Medium | Medium | Tier-based engagement cadence |
| Score below threshold | Low | Medium | 7 candidates, need 5 (43% buffer) |
| Geographic concentration | Medium | Low | Prioritize underrepresented regions |
| Module concentration | High | Medium | Target AP, Treasury, GL specifically |
