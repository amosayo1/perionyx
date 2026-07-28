---
title: "Hypothesis Register"
created: 2026-07-28
phase: "27.0A"
tags: [product, ap, hypotheses, validation]
---

# Hypothesis Register

## Purpose

Every assumption without direct customer evidence is a hypothesis. This register tracks all hypotheses, their validation status, and the risk if they prove wrong.

## Hypothesis Format

Each hypothesis follows:
- **Statement**: What we believe to be true
- **Evidence For**: Supporting data (even indirect)
- **Evidence Against**: Contradicting data
- **Risk if Wrong**: Impact on product/workflow
- **Validation Method**: How to test
- **Priority**: How urgently we need to validate
- **Status**: Not Started / In Progress / Validated / Invalidated

---

## Product Hypotheses

### H1: Finance Professionals Prefer Investigation Over Transaction Entry

| Field | Value |
|-------|-------|
| **Statement** | AP clerks and managers spend more time investigating discrepancies than entering data. Optimising investigation yields more value than optimising data entry. |
| **Evidence For** | Adeel Aslam: "these operational tasks often require manual oversight to ensure accuracy" — "oversight" implies investigation, not entry |
| **Evidence Against** | None — but limited to 1 interview |
| **Risk if Wrong** | We build an investigation-optimised workflow when users actually need faster data entry |
| **Validation Method** | Interview 3+ AP clerks: "What do you spend most of your time on — entering data or investigating discrepancies?" |
| **Priority** | High |
| **Status** | In Progress |

### H2: AI Recommendations Increase Trust When They Explain Their Reasoning

| Field | Value |
|-------|-------|
| **Statement** | Finance professionals will trust AI recommendations more if the AI explains why it made the recommendation, shows confidence scores, and cites evidence. |
| **Evidence For** | Ayman Shawky: "Need for confidence scoring on forecasts" / P5: "AI Must Explain Itself" |
| **Evidence Against** | None — but no direct interview on AP AI trust |
| **Risk if Wrong** | We over-invest in AI explainability when users don't care or don't read explanations |
| **Validation Method** | Prototype test: Show 5 finance professionals AI recommendations with and without explanations. Measure trust and adoption. |
| **Priority** | High |
| **Status** | Not Started |

### H3: Multi-Level Approval Is Better Than Single-Level Approval for Compliance

| Field | Value |
|-------|-------|
| **Statement** | Multi-level threshold-based approval provides better compliance and audit readiness than single-level approval, even though it's slower. |
| **Evidence For** | E1: Adeel mentions "approval workflows" as pain point — implies current single-level is insufficient / Constitution: "Every action is auditable" |
| **Evidence Against** | None |
| **Risk if Wrong** | We add complexity (multi-level) when users prefer speed (single-level with audit trail) |
| **Validation Method** | Interview 3+ controllers: "Do you require multi-level approval? Why? What thresholds?" |
| **Priority** | Medium |
| **Status** | Not Started |

### H4: Batch Payment Processing Is Preferred Over Individual Payment Execution

| Field | Value |
|-------|-------|
| **Statement** | AP managers prefer to batch multiple approved invoices into a single payment run rather than paying invoices one at a time. |
| **Evidence For** | Industry pattern — most AP systems batch payments |
| **Evidence Against** | None — no customer evidence either way |
| **Risk if Wrong** | We force batching when some users prefer immediate individual payment |
| **Validation Method** | Interview 3+ AP managers: "How do you currently pay invoices — one at a time or in batches? Why?" |
| **Priority** | High |
| **Status** | Not Started |

### H5: Exception Queues Reduce Investigation Time vs Inline Resolution

| Field | Value |
|-------|-------|
| **Statement** | A dedicated exception queue with categorisation and SLA tracking reduces investigation time compared to resolving exceptions inline within the invoice view. |
| **Evidence For** | Phase 20.0: exception count (51) shown as KPI but no action possible — current inline approach fails |
| **Evidence Against** | None |
| **Risk if Wrong** | We split investigation across two screens when users prefer one unified view |
| **Validation Method** | A/B test: Compare task completion time for exception resolution in dedicated queue vs inline |
| **Priority** | Medium |
| **Status** | Not Started |

### H6: Real-Time Match Results Are Better Than Batch Matching

| Field | Value |
|-------|-------|
| **Statement** | Matching invoices immediately upon capture (real-time) produces better outcomes than matching in nightly batches. |
| **Evidence For** | E3: Ayman: "Need for instant view" — preference for real-time / Phase 21.0: matching engine exists but not wired |
| **Evidence Against** | None |
| **Risk if Wrong** | Real-time matching adds latency to invoice capture when batch would be acceptable |
| **Validation Method** | Interview 3+ AP clerks: "When do you want to see match results — immediately or at end of day?" |
| **Priority** | Medium |
| **Status** | Not Started |

### H7: Vendor Self-Service Reduces AP Clerk Workload

| Field | Value |
|-------|-------|
| **Statement** | A vendor portal where vendors can check payment status and submit invoices reduces AP clerk workload by eliminating status inquiry calls. |
| **Evidence For** | Industry pattern — vendor portals reduce AP inquiries |
| **Evidence Against** | None — no customer evidence of demand |
| **Risk if Wrong** | We build a vendor portal that vendors don't use, wasting engineering effort |
| **Validation Method** | Interview 3+ AP clerks: "How often do vendors call asking about payment status? What percentage of your time does this consume?" |
| **Priority** | Low |
| **Status** | Not Started |

### H8: Unified Platform Reduces Context Switching vs Best-of-Breed

| Field | Value |
|-------|-------|
| **Statement** | A unified finance platform (AP + AR + Treasury + GL in one system) reduces context switching and reconciliation overhead compared to using separate best-of-breed tools. |
| **Evidence For** | E3: Ayman: "Siloed systems create reconciliation overhead" / E4: Muhammed: "Weak integration between inventory and finance" |
| **Evidence Against** | None — but only CRM notes, not direct interviews |
| **Risk if Wrong** | We build a unified platform when users actually prefer best-of-breed with integrations |
| **Validation Method** | Interview 3+ finance managers: "How many systems do you use for finance? How often do you switch between them?" |
| **Priority** | Medium |
| **Status** | Not Started |

### H9: Arabic-First Design Is Required for MENA Market Adoption

| Field | Value |
|-------|-------|
| **Statement** | Arabic RTL support is not just translation — it's layout, number formatting, date formatting, and cultural alignment. Without it, MENA adoption will be limited. |
| **Evidence For** | Multiple CRM contacts in Saudi Arabia / P6: "MENA Market Needs Arabic-First Design" |
| **Evidence Against** | None — no direct evidence either way |
| **Risk if Wrong** | We over-invest in Arabic support when English-first is sufficient for MENA finance professionals |
| **Validation Method** | Interview 3+ MENA finance professionals: "Do you work in Arabic or English? Would you use a finance platform in Arabic?" |
| **Priority** | Low |
| **Status** | Not Started |

### H10: Confidence Scoring on AI Recommendations Increases Adoption

| Field | Value |
|-------|-------|
| **Statement** | Showing a confidence score (e.g., "87% confident this is a duplicate") alongside AI recommendations increases the likelihood that users will act on them. |
| **Evidence For** | E3: Ayman: "Need for confidence scoring on forecasts" / P5: "AI Must Explain Itself" |
| **Evidence Against** | None |
| **Risk if Wrong** | We add confidence scores that users ignore, adding UI clutter |
| **Validation Method** | Prototype test: Show 5 finance professionals AI recommendations with and without confidence scores. Measure action rate. |
| **Priority** | High |
| **Status** | Not Started |

---

## Technical Hypotheses

### H11: Prisma Interactive Transactions Are Sufficient for AP Operations

| Field | Value |
|-------|-------|
| **Statement** | Prisma interactive transactions provide adequate performance and isolation for all AP operations (invoice creation, matching, approval, payment). |
| **Evidence For** | Phase 21A.2: UnitOfWork pattern validated with 87 integration tests |
| **Evidence Against** | None |
| **Risk if Wrong** | Transaction timeouts or deadlocks under production load |
| **Validation Method** | Load test with 100 concurrent invoice operations |
| **Priority** | Low |
| **Status** | Not Started |

### H12: In-Process Event Bus Is Sufficient for AP Domain Events

| Field | Value |
|-------|-------|
| **Statement** | An in-process typed event bus (APDomainEventBus) is sufficient for AP domain events because all AP operations are transactional and within a single service boundary. |
| **Evidence For** | Phase 21A.2: APDomainEventBus validated in integration tests |
| **Evidence Against** | None — but future cross-domain events may need persistence |
| **Risk if Wrong** | Events lost on process restart, no event replay capability |
| **Validation Method** | Architecture review at Phase 27.0B implementation |
| **Priority** | Low |
| **Status** | Not Started |

---

## Business Hypotheses

### H13: Early-Pay Discount Capture Is a Measurable Financial Benefit

| Field | Value |
|-------|-------|
| **Statement** | Capturing early-pay discounts (e.g., 2/10 net 30) provides measurable financial benefit that justifies the engineering investment in payment timing optimisation. |
| **Evidence For** | Industry pattern — 1-2% discount on millions of AP spend is significant |
| **Evidence Against** | None — no customer evidence of current discount capture rates |
| **Risk if Wrong** | We build payment optimisation for discounts that vendors don't offer or users don't value |
| **Validation Method** | Interview 3+ AP managers: "Do your vendors offer early-pay discounts? What percentage do you capture?" |
| **Priority** | Medium |
| **Status** | Not Started |

### H14: AP Analytics Drive Behaviour Change

| Field | Value |
|-------|-------|
| **Statement** | Showing AP managers analytics (aging trends, exception rates, approval cycle times) drives measurable behaviour change (faster processing, fewer exceptions). |
| **Evidence For** | E1: Adeel mentions "reporting and cash flow planning fairly well" — existing analytics are adequate |
| **Evidence Against** | P1: "Reporting Is Table Stakes, Not a Differentiator" — analytics don't differentiate |
| **Risk if Wrong** | We invest in AP analytics that users view but don't act on |
| **Validation Method** | Track whether AP managers change behaviour after viewing analytics dashboards |
| **Priority** | Low |
| **Status** | Not Started |

---

## Validation Backlog (Priority Order)

| # | Hypothesis | Validation Method | Target Date |
|---|-----------|-------------------|-------------|
| 1 | H1: Investigation > Entry | Interview 3+ AP clerks | Q3 2026 |
| 2 | H4: Batch payments preferred | Interview 3+ AP managers | Q3 2026 |
| 3 | H2: AI explainability builds trust | Prototype test | Q3 2026 |
| 4 | H10: Confidence scores increase adoption | Prototype test | Q3 2026 |
| 5 | H3: Multi-level approval for compliance | Interview 3+ controllers | Q3 2026 |
| 6 | H8: Unified platform reduces switching | Interview 3+ finance managers | Q4 2026 |
| 7 | H6: Real-time matching preferred | Interview 3+ AP clerks | Q4 2026 |
| 8 | H5: Exception queue vs inline | A/B test | Q4 2026 |
| 9 | H13: Early-pay discount value | Interview 3+ AP managers | Q4 2026 |
| 10 | H7: Vendor portal demand | Interview 3+ AP clerks | Q4 2026 |
| 11 | H9: Arabic-first design | Interview 3+ MENA professionals | Q1 2027 |
| 12 | H14: Analytics drive change | Usage analytics | Post-launch |
| 13 | H11: Prisma transactions sufficient | Load test | Implementation |
| 14 | H12: In-process events sufficient | Architecture review | Implementation |
