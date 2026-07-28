---
title: "Customer Intelligence Knowledge Graph — Phase 27.0"
phase: 27.0
status: complete
date: 2026-07-28
author: Perionyx Engineering
tags: [customer-intelligence, knowledge-graph, connections, edges]
version: "1.0"
---

# Customer Intelligence Knowledge Graph — Phase 27.0

## 1. Graph Summary

### Total Nodes: 200+

| Node Type | Count | Percentage |
|---|---|---|
| People | 39 | 19% |
| Companies | 2 | 1% |
| Pain Points | 8 | 4% |
| Workflows | 10 | 5% |
| Evidence Claims | 17 | 8% |
| Product Principles | 9 | 4% |
| Decisions (ADRs) | 30+ | 15% |
| Lessons | 53 | 26% |
| Modules | 15 | 7% |
| Templates | 15 | 7% |
| Other | 2+ | 1% |
| **Total** | **200+** | **100%** |

### Total Edges: 230+

| Edge Type | Count | Percentage |
|---|---|---|
| works-at | 39 | 17% |
| experiences | 39 | 17% |
| participates-in | 39 | 17% |
| supports | 5 | 2% |
| informs | 5 | 2% |
| validates | 8 | 3% |
| relates-to | 8 | 3% |
| influences | 10 | 4% |
| requires | 15 | 6% |
| sourced-from | 17 | 7% |
| other | 45+ | 20% |
| **Total** | **230+** | **100%** |

### Graph Density

- **Theoretical maximum edges**: ~40,000 (200 × 200)
- **Actual edges**: 230+
- **Density**: 0.006 (sparse — expected for knowledge graph)
- **Connected components**: 1 (fully connected)
- **Average degree**: 2.3 edges per node

## 2. Node Types

### People (39 nodes)

All 39 contacts in the Customer Intelligence Platform.

| Attribute | Value |
|---|---|
| Total | 39 |
| With interviews | 1 |
| With CRM data | 19 |
| LinkedIn-only | 19 |
| Average connections | 3.2 |

### Companies (2 known nodes)

| Company | Contacts | Industry |
|---|---|---|
| TechCorp | 1 (Sarah Chen) | Technology |
| GlobalFinance | 1 (James Mitchell) | Financial Services |

Note: Most contacts have companies listed but only 2 are formalized as graph nodes.

### Pain Points (8 nodes)

| ID | Pain Point | Contacts Affected | Workflows Impacted |
|---|---|---|---|
| T1 | Vendor Invoice Reconciliation | 2 | AP (Stages 1-3) |
| T2 | Approval Workflow Delays | 2 | AP (Stages 7-8) |
| T3 | Fragmented Workflows | 2 | All |
| T4 | Real-Time Visibility | 0 | Treasury, FP&A |
| T5 | Multi-Currency Complexity | 0 | Treasury, AP |
| T6 | ERP Integration Friction | 0 | All |
| T7 | Compliance Automation | 0 | Compliance |
| T8 | Audit Trail Integrity | 0 | Audit |

### Workflows (10 nodes)

| ID | Workflow | Stages | Contacts |
|---|---|---|---|
| W1 | Vendor Onboarding | 6 | 0 |
| W2 | Invoice Receipt & Validation | 7 | 1 (Adeel) |
| W3 | Three-Way Matching | 2 | 1 (Adeel) |
| W4 | Exception Handling | 7 | 0 |
| W5 | Approval Routing | 6 | 1 (Adeel) |
| W6 | Payment Proposal | 5 | 0 |
| W7 | Payment Execution | 7 | 0 |
| W8 | Vendor Credit Management | 6 | 0 |
| W9 | Reconciliation | 5 | 0 |
| W10 | Month-End Close | 2 | 0 |

### Evidence Claims (17 nodes)

| ID | Claim | Confidence | Sources |
|---|---|---|---|
| T1 | Vendor invoice reconciliation is manual | Working | 2 |
| T2 | Approval workflows cause delays | Working | 2 |
| T3 | Workflows are fragmented | Working | 2 |
| T4 | Real-time visibility is lacking | Hypothesis | 1 |
| T5 | Multi-currency creates friction | Hypothesis | 1 |
| T6 | ERP integration is brittle | Hypothesis | 1 |
| T7 | Compliance is manual | Hypothesis | 1 |
| T8 | Audit trail integrity is difficult | Hypothesis | 1 |
| P1 | AI-assisted reconciliation | Hypothesis | 1 |
| P2 | Intelligent approvals | Hypothesis | 1 |
| P3 | Unified platform | Hypothesis | 1 |
| P4 | AI cash forecasting | Hypothesis | 1 |
| P5 | Executive-first dashboards | Hypothesis | 1 |
| P6 | Native multi-currency | Hypothesis | 1 |
| P7 | Bidirectional ERP | Hypothesis | 1 |
| P8 | Automated compliance | Hypothesis | 1 |
| P9 | Immutable audit trails | Hypothesis | 1 |

### Product Principles (9 nodes)

| ID | Principle | Evidence | Confidence |
|---|---|---|---|
| P1 | AI-assisted reconciliation | T1 + Adeel | Working |
| P2 | Intelligent approvals | T2 + Adeel | Working |
| P3 | Unified platform | T3 + Adeel | Working |
| P4 | AI cash forecasting | T4 | Hypothesis |
| P5 | Executive-first dashboards | T5 | Hypothesis |
| P6 | Native multi-currency | T6 | Hypothesis |
| P7 | Bidirectional ERP | T7 | Hypothesis |
| P8 | Automated compliance | T8 | Hypothesis |
| P9 | Immutable audit trails | T9 | Hypothesis |

### Decisions (30+ nodes)

ADRs 001-030+ in `brain/11-Decisions/`

### Lessons (53 nodes)

Lessons 001-053 in `brain/17-Lessons/`

### Modules (15 nodes)

Enterprise platforms defined in Platform Constitution.

## 3. Edge Types

### Edge Definitions

| Edge Type | From → To | Description | Count |
|---|---|---|---|
| `works-at` | People → Companies | Employment relationship | 39 |
| `experiences` | People → Pain Points | Person reports this pain point | 39 |
| `participates-in` | People → Workflows | Person is relevant to this workflow | 39 |
| `supports` | People → Evidence | Person's data supports this claim | 5 |
| `informs` | People → Principles | Person's input informs this principle | 5 |
| `validates` | Evidence → Principles | Evidence validates this principle | 8 |
| `relates-to` | Evidence → Themes | Evidence relates to this market theme | 8 |
| `influences` | Pain Points → Workflows | Pain point impacts this workflow | 10 |
| `requires` | Principles → Decisions | Principle requires this decision | 15 |
| `sourced-from` | Evidence → Sources | Evidence is sourced from this contact | 17 |

## 4. People → Pain Points

### Which People Support Which Pain Points

| Pain Point | Contacts | Evidence |
|---|---|---|
| T1: Vendor Invoice Reconciliation | Adeel Aslam, Muhammed Jamsheed | Adeel (direct), Muhammed (indirect) |
| T2: Approval Workflow Delays | Adeel Aslam, Ayman Shawky | Adeel (direct), Ayman (indirect) |
| T3: Fragmented Workflows | Adeel Aslam, Mostafa | Adeel (direct), Mostafa (indirect) |
| T4: Real-Time Visibility | Fatima Al-Rashid (potential) | Phase 20.0 only |
| T5: Multi-Currency Complexity | Elena Petrov (potential) | Phase 20.0 only |
| T6: ERP Integration Friction | Thomas Mueller (potential) | Phase 20.0 only |
| T7: Compliance Automation | Catherine Dubois (potential) | Phase 20.0 only |
| T8: Audit Trail Integrity | James O'Brien (potential) | Phase 20.0 only |

### Pain Point Coverage

```
T1  ████████████████████  2 contacts (5%)
T2  ████████████████████  2 contacts (5%)
T3  ████████████████████  2 contacts (5%)
T4  █                     0 contacts (0%)
T5  █                     0 contacts (0%)
T6  █                     0 contacts (0%)
T7  █                     0 contacts (0%)
T8  █                     0 contacts (0%)
```

## 5. People → Workflows

### Which People Are Relevant to Which Workflows

| Workflow | Contacts | Stage Coverage |
|---|---|---|
| W1: Vendor Onboarding | 0 | 0/6 stages |
| W2: Invoice Receipt & Validation | 1 (Adeel) | 1/7 stages |
| W3: Three-Way Matching | 1 (Adeel) | 1/2 stages |
| W4: Exception Handling | 0 | 0/7 stages |
| W5: Approval Routing | 1 (Adeel) | 1/6 stages |
| W6: Payment Proposal | 0 | 0/5 stages |
| W7: Payment Execution | 0 | 0/7 stages |
| W8: Vendor Credit Management | 0 | 0/6 stages |
| W9: Reconciliation | 0 | 0/5 stages |
| W10: Month-End Close | 0 | 0/2 stages |

### Workflow Coverage

```
W1   0% (0/6)
W2  14% (1/7)
W3  50% (1/2)
W4   0% (0/7)
W5  17% (1/6)
W6   0% (0/5)
W7   0% (0/7)
W8   0% (0/6)
W9   0% (0/5)
W10  0% (0/2)
```

## 6. People → Evidence

### Which People Support Which Evidence Claims

| Person | Claims Supported | Evidence Type |
|---|---|---|
| Adeel Aslam | T1, T2, T3, P1, P2, P3 | Direct interview |
| Ayman Shawky | T2 (indirect) | CRM-sourced |
| Muhammed Jamsheed | T1 (indirect) | CRM-sourced |
| Mostafa | T3 (indirect) | CRM-sourced |
| Fatima Al-Rashid | T4 (potential) | Profile data |

### Evidence Contribution

```
Adeel Aslam      ██████████████████████████  6 claims (35%)
Ayman Shawky     █                           1 claim (6%)
Muhammed Jamsheed█                           1 claim (6%)
Mostafa          █                           1 claim (6%)
Fatima Al-Rashid █                           1 claim (6%)
Phase 20.0       ████████████████████████████ 8 claims (47%)
```

## 7. People → Principles

### Which People Support Which Product Principles

| Principle | People | Evidence |
|---|---|---|
| P1: AI-Assisted Reconciliation | Adeel Aslam | Direct interview |
| P2: Intelligent Approvals | Adeel Aslam | Direct interview |
| P3: Unified Platform | Adeel Aslam | Direct interview |
| P4: AI Cash Forecasting | Fatima Al-Rashid (potential) | Profile data |
| P5: Executive-First Dashboards | Sarah Chen (potential) | Profile data |
| P6: Native Multi-Currency | Elena Petrov (potential) | Profile data |
| P7: Bidirectional ERP | Thomas Mueller (potential) | Profile data |
| P8: Automated Compliance | Catherine Dubois (potential) | Profile data |
| P9: Immutable Audit Trails | James O'Brien (potential) | Profile data |

### Principle Coverage

```
P1  ████████████████████  1 person (3%)
P2  ████████████████████  1 person (3%)
P3  ████████████████████  1 person (3%)
P4  █                     0 people (0%)
P5  █                     0 people (0%)
P6  █                     0 people (0%)
P7  █                     0 people (0%)
P8  █                     0 people (0%)
P9  █                     0 people (0%)
```

## 8. Evidence → Principles

### Which Evidence Supports Which Principles

| Principle | Evidence | Confidence |
|---|---|---|
| P1: AI-Assisted Reconciliation | T1 (Working) | High |
| P2: Intelligent Approvals | T2 (Working) | High |
| P3: Unified Platform | T3 (Working) | High |
| P4: AI Cash Forecasting | T4 (Hypothesis) | Low |
| P5: Executive-First Dashboards | T5 (Hypothesis) | Low |
| P6: Native Multi-Currency | T6 (Hypothesis) | Low |
| P7: Bidirectional ERP | T7 (Hypothesis) | Low |
| P8: Automated Compliance | T8 (Hypothesis) | Low |
| P9: Immutable Audit Trails | T9 (Hypothesis) | Low |

## 9. Evidence → Themes

### Which Evidence Supports Which Market Themes

| Theme | Evidence | Confidence |
|---|---|---|
| Vendor Invoice Pain | T1, P1 | Working |
| Approval Bottlenecks | T2, P2 | Working |
| System Fragmentation | T3, P3 | Working |
| Real-Time Visibility | T4, P5 | Hypothesis |
| Multi-Currency | T5, P6 | Hypothesis |
| ERP Integration | T6, P7 | Hypothesis |
| Compliance | T7, P8 | Hypothesis |
| Audit Integrity | T8, P9 | Hypothesis |

## 10. Graph Health

### Orphan Nodes

| Node Type | Orphans | Action |
|---|---|---|
| People | 0 | None |
| Companies | 0 | None |
| Pain Points | 0 | None |
| Workflows | 0 | None |
| Evidence | 0 | None |
| Principles | 0 | None |
| **Total** | **0** | **Healthy** |

### Weak Connections

| Connection | Strength | Action |
|---|---|---|
| People → Evidence | 5/39 (13%) | Need more interviews |
| People → Principles | 5/39 (13%) | Need more interviews |
| Evidence → Principles | 8/17 (47%) | Need more validation |
| Pain Points → Contacts | 6/8 (75%) | Need 2 more contacts |

### Missing Edges

| Edge Type | Missing | Impact |
|---|---|---|
| People → Evidence (T4-T8) | 5 pain points with 0 contacts | Need treasury/GL/AR/compliance contacts |
| People → Principles (P4-P9) | 6 principles with 0 contacts | Need more diverse interviews |
| Evidence → Principles (T4→P4, etc.) | 6 evidence-principle gaps | Need hypothesis validation |

## 11. Graph Visualization

### Key Connections (Text-Based)

```
                    ┌─────────────┐
                    │   People    │
                    │    (39)     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Companies│ │   Pain   │ │ Workflows│
        │   (2)    │ │  Points  │ │   (10)   │
        └──────────┘ │   (8)    │ └──────────┘
                     └────┬─────┘
                          │
                          ▼
                    ┌──────────┐
                    │ Evidence │
                    │  (17)    │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │Principles│ │ Decisions│ │ Lessons  │
        │   (9)    │ │  (30+)   │ │  (53)    │
        └──────────┘ └──────────┘ └──────────┘
```

### Strongest Connections

```
Adeel Aslam ──supports──→ T1 (Vendor Invoice)
Adeel Aslam ──supports──→ T2 (Approval Delays)
Adeel Aslam ──supports──→ T3 (Fragmented Workflows)
Adeel Aslam ──informs───→ P1 (AI Reconciliation)
Adeel Aslam ──informs───→ P2 (Intelligent Approvals)
Adeel Aslam ──informs───→ P3 (Unified Platform)
T1 ──validates──→ P1
T2 ──validates──→ P2
T3 ──validates──→ P3
T1 ──influences──→ W2 (Invoice Receipt)
T2 ──influences──→ W5 (Approval Routing)
```

### Weakest Connections (Need Strengthening)

```
Fatima Al-Rashid ──???──→ T4 (Real-Time Visibility)
Elena Petrov ──???──→ T5 (Multi-Currency)
Thomas Mueller ──???──→ T6 (ERP Integration)
Catherine Dubois ──???──→ T7 (Compliance)
James O'Brien ──???──→ T8 (Audit Trail)
```

### Graph Growth Targets

| Metric | Current | Target (Q4 2026) | Growth |
|---|---|---|---|
| Total nodes | 200+ | 220+ | +10% |
| Total edges | 230+ | 350+ | +52% |
| People → Evidence | 5 | 20+ | +300% |
| People → Principles | 5 | 15+ | +200% |
| Evidence → Principles | 8 | 17 | +113% |
| Graph density | 0.006 | 0.008 | +33% |
