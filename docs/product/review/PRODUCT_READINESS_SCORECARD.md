# Product Readiness Scorecard — AP Reference Workflow v2.0

> **Classification**: Restricted — Internal Use Only
> **Review Date**: 2026-07-28
> **Reviewer**: Independent Product Review (Phase 27.1R)
> **Version Reviewed**: 2.0 (13 EPS documents, ~9,110 lines)

---

## 1. Scoring Methodology

Each dimension is scored 0–10 using the following scale:

| Score | Meaning |
|-------|---------|
| 0–3 | **Not Ready** — critical gaps prevent any production use |
| 4–5 | **Early** — concept exists but significant gaps remain |
| 6–7 | **Developing** — solid foundation with identifiable gaps |
| 8–9 | **Ready** — minor gaps, production-viable |
| 10 | **Complete** — no meaningful improvement possible |

Scores are based on evidence from the EPS documents, cross-referenced against the Phase 21A implementation layer, Phase 25.5 architecture review, and customer evidence base. Where a dimension depends on untested hypotheses, the score is capped at the lower bound of confidence.

**Weighted Average**: 6.75 / 10

---

## 2. Readiness Dimensions

### 2a. Customer Evidence — 7 / 10

**What works well**: The evidence traceability model is genuinely impressive. Every section of every EPS document cites evidence sources (E1–E10, T1–T8). [HYPOTHESIS] tagging is honest and consistent. Three themes are Validated (T3, T5) and four are Working (T1, T2, T4, T6). The specification does not pretend certainty where none exists.

**Gaps**:
- Only **1 formal discovery interview** (E1 — Adeel Aslam). The remaining 9 sources are CRM notes, which are inherently less reliable than structured interviews. CRM notes were not collected with product validation intent — they were collected as sales/relationship notes and retroactively mapped to product decisions.
- **Evidence density is uneven**: Stage 1 (Invoice Received) and Stage 5 (Approval Routing) have strong coverage via E1 and T1/T2. Stage 9 (GL Posting) and Stage 10 (Audit & Reconciliation) rely primarily on E5 (Mohamed Gamal — Junior GL Accountant, single source, Medium confidence). Stage 6 (Payment Readiness) and Stage 7 (Treasury Approval) are built on E3 (Medium) and E9 (Medium).
- **No direct evidence** for the 10-stage model being the right decomposition. H-013 is itself a hypothesis.
- **Department Manager persona**: zero direct evidence.
- **Vendor persona**: E7 (Ahmed Orabi) at Medium confidence — the portal strategy rests on a single source.
- 17 of 65 business rules (26%) are [HYPOTHESIS].

| Evidence Source | Confidence | Used For | Gap |
|----------------|------------|----------|-----|
| E1 Adeel Aslam | High | Stages 1–5 core | Single interview, single persona |
| E3–E10 | Medium | Various stages | CRM notes, not structured interviews |
| T1–T6 | Working/Validated | Theme validation | Themes are indirect — no direct feature validation |
| T7–T8 | Hypothesis | Multi-currency, compliance | Zero customer evidence |

---

### 2b. Workflow Completeness — 7 / 10

**What works well**: The 10-stage model covers the complete procure-to-pay lifecycle from invoice receipt to audit reconciliation. The decision to simplify from 14 stages is evidence-based (Phase 20.0 friction analysis). Cross-stage invariants (I-01 through I-17) provide structural integrity.

**Gaps**:
- **Vendor onboarding** is explicitly out of scope but is a prerequisite for Stage 1. An invoice cannot be processed without an existing vendor record (BR-012: Vendor status must be ACTIVE). The EPS acknowledges this ("covered in future Phase 28") but does not address the bootstrap problem: how does the first invoice get processed?
- **10-stage completeness is hypothesis H-013** — not validated. The simplification merged Evidence Collection→Exception and Coordination→Approval. This may have removed valid control points.
- **Stage 2 (Invoice Validated) and Stage 3 (Three-Way Match) separation feels artificial**. Validation includes evidence assembly and PO/GRN linking. Matching IS validation for goods invoices. The boundary between "evidence assembled" and "matching complete" is a system handoff with no human intervention at either stage. If both are automated, why are they separate stages? The EDP D-01 acknowledges this concern in its consequence note.
- **Stage 9 (GL Posting) and Stage 10 (Audit & Reconciliation) overlap**. Audit is not a terminal stage — it is a continuous property that applies across all stages. The checksum chain is built incrementally, not at Stage 10. Calling Audit a "stage" creates the impression that audit begins when the invoice is paid, when in fact audit began at capture.
- **No credit note workflow** is defined as a distinct path. Credit notes are mentioned but handled through the Invoice state machine (negative amounts → credit note entity type). This conflates two semantically different financial instruments.

| Stage | Completeness | Gap |
|-------|-------------|-----|
| 1. Invoice Received | Strong | OCR accuracy for non-English untested (H-009) |
| 2. Invoice Validated | Strong | Artificial boundary with Stage 3 |
| 3. Three-Way Match | Strong | Depends on PO/GRN data quality (H-010) |
| 4. Exception Queue | Strong | Resolution suggestions unvalidated |
| 5. Approval Routing | Strong | Department Manager persona unvalidated |
| 6. Payment Readiness | Moderate | Batch preference is H-006 (Hypothesis) |
| 7. Treasury Approval | Moderate | Cash flow prediction is H-006 dependent |
| 8. Payment Execution | Strong | Bank API stability unproven at scale |
| 9. GL Posting | Moderate | Auto-coding unvalidated with real GL structures |
| 10. Audit & Reconciliation | Weak | Stage boundary is conceptually wrong |

---

### 2c. Persona Coverage — 6 / 10

**What works well**: 9 personas are identified with clear role boundaries, primary stages, current/target scores, and evidence sources. The persona-to-stage ownership matrix is well-defined.

**Gaps**:
- **Evidence basis is uneven**: Only AP Clerk (E1), AP Manager (E1, E2), and Approver (T1) have High confidence. Controller, Treasury Manager, Procurement Manager, CFO, and Vendor are all Medium. Auditor is Constitutional (not customer-derived).
- **Department Manager persona**: explicitly marked [HYPOTHESIS] (D-03). This persona drives the cross-department approval routing that is central to Stage 5. If this persona does not exist in customer organisations, the entire multi-level routing model may be over-engineered.
- **Vendor persona is under-developed**: Current score 2/10, target 6/10 is the lowest improvement target. The vendor portal is a core workflow component (invoice submission, payment status, communication) but the vendor persona has the weakest evidence basis (E7 — single Medium source).
- **No IT/Systems persona**: ERP integration, PO/GRN data quality, connector configuration, and system health are all critical to workflow success but no persona owns them. The assumption that these "just work" is implicit.
- **No Bank persona**: Payment execution depends on banking API availability. A bank API failure is a CRITICAL event. Yet no persona represents the bank relationship.

| Persona | Current Score | Target | Evidence Confidence | Gap |
|---------|-------------|--------|-------------------|-----|
| AP Clerk | 3/10 | 8/10 | High | None significant |
| AP Manager | 5/10 | 8/10 | High | None significant |
| Controller | 6/10 | 9/10 | Medium | E5 single source |
| Treasury Manager | 7/10 | 8/10 | Medium | E3, E9 — CRM notes |
| Procurement Manager | 5/10 | 7/10 | Medium | E4 single source |
| CFO | 5/10 | 8/10 | Medium | E3 — CRM notes |
| Approver | 4/10 | 8/10 | High | Generic, Department Mgr unclear |
| Auditor | 4/10 | 9/10 | Constitutional | No customer validation |
| Vendor | 2/10 | 6/10 | Medium | E7 single source |

---

### 2d. Cognitive Load — 7 / 10

**What works well**: P8 (Decision Readiness) is a strong principle. The 5-question framework ("What needs attention? Why? Evidence? Decision? Next?") is a good heuristic for screen design. The Exception First sorting (SLA deadline → financial impact → exception count) prioritises attention correctly. "Two-click maximum" from any screen to actionable detail is a measurable constraint.

**Gaps**:
- **5-question framework is unvalidated**. No user study has tested whether this framework actually reduces cognitive load for AP professionals. It is a design hypothesis that sounds correct but has zero empirical support.
- **"Evidence Before Approval" scroll/acknowledge mechanism** (P6: minimum 3 seconds visible, scroll required) may frustrate power users who process 50+ invoices per day. A Controller approving 10 invoices at month-end will find a 3-second delay per invoice to be 30 seconds of friction. In aggregate at 500 invoices/month, this is 25 minutes of forced wait time. The intent is correct; the implementation mechanism may need adjustment.
- **10 stages is a lot for a human mental model**. A typical AP professional likely thinks in 4–5 phases: Capture → Match → Approve → Pay → Close. The EPS's 10-stage model is architecturally precise but may not match the user's mental model. Cognitive load is not just about what's on screen — it's about how the user organises the workflow in their head.
- **Exception Queue as a separate "stage"** creates a parallel track that users must monitor independently. If 15% of invoices go to exception (Q2 target), the user must manage two queues: the main invoice queue and the exception queue. This is necessary complexity, but it is real complexity.
- **Multi-level approval tracking** introduces cognitive overhead for the AP Manager who must monitor who is holding up which invoice at which level.

| Cognitive Factor | Assessment | Risk |
|-----------------|-----------|-------|
| 5-question framework | Plausible but untested | Medium — could increase friction for power users |
| Evidence scroll/acknowledge | Good intent, risky mechanism | Medium — power user frustration |
| 10 stages | Architecturally correct, maybe too many | Low-Medium — users may ignore stage boundaries |
| Exception queue | Necessary complexity | Low — parallels exist in all AP systems |
| Multi-level approval | High complexity for AP Manager | Medium — escalation management is real work |

---

### 2e. AI Trust & Transparency — 8 / 10

**What works well**: This is the strongest-designed dimension in the EPS. The AI boundary is clearly defined (Section 7 of the master spec, entire AI Behaviour Guide). "AI explains but never decides" is principled and consistently applied. The 5-level confidence model (Very High → Very Low) with degradation over time is thorough. The explainability contract (5 questions every AI output must answer) is excellent. 8 AI actions with detailed specifications (AP-AI-01 through AP-AI-08) are well-defined.

**Gaps**:
- **70% confidence threshold is arbitrary**. The threshold that triggers mandatory human review is set at 70% with no evidence that this is the right calibration. Different AI capabilities have different baseline accuracies. A 70% threshold for OCR extraction (which should be 95%+) is too low. A 70% threshold for cash flow prediction (which is inherently uncertain) may be too high.
- **AI recommendation adoption rate target of 85%** (T2 metric) is aspirational. No comparable enterprise AP product has published such numbers. Industry data suggests 60-70% adoption for AI-assisted matching in mature deployments.
- **8 AI actions may be too many for v1.0**. Cash flow prediction (AP-AI-06) and vendor risk scoring (AP-AI-07) are both marked [HYPOTHESIS]. Building eight AI capabilities simultaneously risks spreading ML engineering too thin.
- **LLM hallucination risk** is not addressed. The AI Behaviour Guide covers model unavailability and low confidence gracefully, but does not address the case where the AI produces a confident-sounding but wrong recommendation. The 5-level confidence model assumes the AI can accurately estimate its own confidence — which is itself a known problem (overconfidence in LLMs).
- **No mention of AI training data privacy**: AI recommendations are based on invoice data, vendor records, and payment history — all financially sensitive. The EPS does not specify whether this data is used for model training, stored in third-party AI providers, or ring-fenced.

| AI Capability | v1.0 Readiness | Confidence | Risk |
|--------------|---------------|------------|-------|
| AP-AI-01: OCR Extraction | Ready | High | Non-English scripts (H-009) |
| AP-AI-02: Three-Way Match | Ready | High | PO/GRN data quality |
| AP-AI-03: Duplicate Detection | Ready | High | False positive rate |
| AP-AI-04: Anomaly Detection | Ready | Medium | Alert fatigue |
| AP-AI-05: GL Coding | Conditional | Medium | Complex GL structures |
| AP-AI-06: Cash Flow Prediction | Not Ready | Hypothesis | Defer to v2.0 |
| AP-AI-07: Vendor Risk Scoring | Not Ready | Hypothesis | Defer to v2.0 |
| AP-AI-08: Audit Trail Analysis | Ready | High | Unproven at scale |

---

### 2f. Financial Integrity — 9 / 10

**What works well**: This is the strongest dimension. Decimal(38,12) precision, banker's rounding via `financial-precision.ts`, zero native arithmetic, idempotent payments, optimistic locking with version fields, residual handling in allocation — every financial integrity concern is addressed at a foundational level. Platform Constitution Law 6 ("Financial integrity is never compromised") is enforced through architecture, not policy.

**Gaps**:
- **Decimal(38,12) performance at scale is unproven**. 38,12 precision on 96+ monetary fields across 25 Prisma models with 500K invoice rows may introduce query performance issues. Aggregation queries (SUM, AVG) on high-precision decimals are slower than integer or double arithmetic. The EPS acknowledges this as a Low-Medium risk.
- **Four Prisma Float fields were migrated to Decimal in Phase 19.1**, but no audit confirms all monetary fields across the entire Prisma schema use Decimal. The financial-precision.ts library exists but its adoption across the codebase is not verified in the EPS.
- **Rounding strategy for multi-currency conversions** is not specified. When converting $12,400.00 USD to SAR at 3.7500, the result is 46,500.000000000000 — but what if the rate has more decimal places? At what precision are intermediate FX calculations performed? The EPS specifies that exchange rates are "locked at invoice receipt time" but does not specify the rounding rules for multi-currency scenarios.

---

### 2g. Audit Readiness — 8 / 10

**What works well**: SHA-256 checksum chain, append-only audit records, immutable history, 63 domain events across 6 categories. The audit record schema is comprehensive (entityType, action, actorId, actorType, previousState, newState, checksum). The meta-audit (audit of the audit system by external firm quarterly) is a strong governance measure.

**Gaps**:
- **Audit persistence is not wired to production**. Phase 23.1 (Constitutional Validation) found that AP audit entries are not persisted to a production audit store. The `ProcurementAPAuditRecord` table exists in the Prisma schema but the event handlers that write to it may not be connected. This is a P0 architectural debt item.
- **SHA-256 chain verification at scale is unproven**. The EPS acknowledges this (Low-Medium risk). At 10M+ audit records, verifying the entire chain would be computationally expensive. The mitigation (offline batch verification, paginated verification) is plausible but not tested.
- **Audit record retention at 7 years** is mentioned but no storage cost estimate is provided. Each audit record includes `inputData` (truncated at 10KB) and `outputData`. At 500K invoices/year with 63 events each, that's 31.5M audit records/year. At 10KB each, that's 315 GB/year for input data alone. Hot storage for 30 days + cold storage for 7 years is a significant infrastructure cost not accounted for.

| Audit Property | Readiness | Gap |
|----------------|-----------|-----|
| SHA-256 checksum chain | Designed | Not verified at scale |
| Append-only enforcement | Designed | DB-level triggers not confirmed |
| 7-year retention | Planned | Storage cost not estimated |
| External auditor verification | Designed | Quarterly audit not scheduled |
| Meta-audit | Designed | System not yet operational |

---

### 2h. Multi-Tenancy — 9 / 10

**What works well**: companyId on every record, RuntimeContext scoping via AsyncLocalStorage, PrismaRepository base class enforcement. The EPS states: "No AP query executes without a companyId filter." Constitutional backing from Platform Constitution Law 11.

**Gap**: None significant. This is a well-implemented cross-cutting concern with architectural enforcement, not just policy.

---

### 2i. Multi-Currency — 3 / 10

**What works well**: The EPS acknowledges this is a weakness. P10 (Multi-Currency Is First-Class) is explicitly marked [HYPOTHESIS]. H-001 is P0 priority with a clear validation plan and decision gate. The design rules (display original currency + functional currency, lock exchange rate at invoice receipt, track FX gain/loss) are well-specified.

**Gaps**:
- **Not a single customer has validated multi-currency workflow requirements**. T7 (Multi-Currency Operations Are Complex) has zero direct evidence — it is a Hypothesis theme based on inference from Ayman Shawky's "multi-currency balance aggregation" comment, which is a reporting need, not a workflow need.
- **The entire Prisma schema assumes multi-currency**: 15+ additional fields across 6 tables if H-001 validates. If H-001 invalidates, these fields are dead columns. The EPS correctly identifies this as a P0 decision gate before Phase 21B schema freeze — but the decision is unmade.
- **FX gain/loss tracking per invoice** is a significant complexity driver. It requires exchange rate locking, rate source tracking, realized vs. unrealized gain computation, and gain/loss GL entries. This alone could be a v2.0 feature.
- **Multi-currency payment execution** (paying a USD invoice from a EUR account) is not addressed. The EPS assumes functional currency invoices paid from functional currency accounts — which defeats the purpose of multi-currency if the currency is the same.

| Multi-Currency Aspect | Readiness | Dependency |
|-----------------------|-----------|------------|
| Display (original + functional) | Designed | Low complexity |
| Exchange rate locking | Designed | Medium complexity |
| Per-invoice FX tracking | Designed | High complexity |
| Multi-currency payment execution | Not addressed | Very high complexity |
| Multi-currency GL posting | Not addressed | Very high complexity |

---

### 2j. Enterprise Scalability — 5 / 10

**What works well**: The architecture is a modular monolith with bounded contexts, which is appropriate for the target scale (500K invoices/tenant). Optimistic locking provides concurrency safety. PgBoss queue is production-proven. The Phase 21A architecture passed 139/139 tests.

**Gaps**:
- **500K invoices/tenant is aspirational, not validated**. H-012 (Performance at 500K) is a P2 hypothesis scheduled for weeks 20-28 — after implementation begins. If performance degrades at scale, architectural rework would be required post-launch.
- **In-memory stores are a known concern**. Phase 25.5 identified "in-memory stores (data loss on restart)" as a critical finding. The automation studio modules, business rules, and approval matrices use in-memory stores. If the AP workflow relies on any in-memory state (beyond cache), data loss on restart is a production blocker.
- **Decimal(38,12) performance overhead** is formally acknowledged as a Low-Medium risk with no benchmark data. At 500K invoices with 96+ monetary fields, complex aggregation queries could become a bottleneck.
- **No read replicas or CQRS** for query-heavy dashboard views. The EPS explicitly rejected CQRS as premature optimisation (EDP D-01). For a CFO dashboard that aggregates 500K invoices across multiple dimensions, materialised views or read replicas may be necessary.
- **PgBoss queue throughput at scale** is unproven. Payment execution, notification delivery, and async matching all depend on queue throughput. No throughput targets or benchmarks are documented.

| Scalability Factor | Assessment | Target | Risk |
|-------------------|-----------|--------|-------|
| Invoice volume | Designed for 500K | 500K/tenant | Validated at weeks 20-28 |
| Concurrency | Optimistic locking | 10K invoices/day | Retry overhead at scale |
| Query performance | No CQRS | Dashboard < 2s | Aggregation at 500K may be slow |
| Queue throughput | PgBoss unbenchmarked | 1K msgs/hour | Payment batch delays |
| Storage growth | 7-year audit logs | >315 GB/year | Cost not estimated |

---

### 2k. Design Partner Readiness — 6 / 10

**What works well**: 7 design partner candidates are identified, scored, and prioritised. Khaleel Ur Rehman (Score: 4.55/5, HIGHEST) has actively requested participation. The scoring criteria (Role Fit, Pain Alignment, Engagement Quality, Decision Authority, Organisation Fit, Strategic Value) are thoughtful. A fallback plan exists if top 2 decline.

**Gaps**:
- **No design partner agreements exist**. No NDA, no participation agreement, no data handling consent, no compensation structure has been documented beyond a placeholder ($200/month retainer + $100/interview). Legal preparation is not started.
- **The 4-6 week engagement delay** is acknowledged but the cost is not budgeted. The EPS says "engineering start delayed by 4-6 weeks for design partner engagement" — this means the entire Phase 21B timeline slips by 4-6 weeks before a single line of UI code is written.
- **Design partner feedback velocity is itself a hypothesis** (H-011). The plan assumes >2 sessions/month per partner. If partners are slower, validation takes longer. If partners drop out, the fallback list is thin beyond the top 4.
- **Data privacy for design partner validation** is not addressed. Validating with live ERP data (H-010) requires design partners to share production financial data. This is a significant ask that requires security review, data handling agreements, and potentially GDPR compliance.

| Candidate | Score | Status | Risk |
|-----------|-------|--------|-------|
| Khaleel Ur Rehman | 4.55/5 | Not engaged | Highest value, may decline |
| Ahmed Orabi | ~4.2/5* | Not engaged | AP/P2P at Hikma, strong fit |
| Muhammed Jamsheed | 4.10/5 | CRM contact | Saudi Arabia, multi-currency |
| Mohamed Gamal | ~3.8/5* | CRM contact | Construction, middle-east |
| Ayman Shawky | ~3.5/5* | CRM contact | SAP/Odoo/Dynamics experience |
| *estimated from scoring criteria |

---

### 2l. Implementation Feasibility — 6 / 10

**What works well**: The EPS adopts the existing Phase 21A architecture (25 Prisma models, 51 commands, 63 events, 10 repos, 65 endpoints, 139/139 tests passing). This is the right decision — it avoids re-architecture and leverages proven code. The 5 modifications required are estimated at 1-2 weeks. D-08 effectively saves ~6 weeks vs. building from scratch.

**Gaps**:
- **5 modifications to Phase 21A are necessary but unspecified in detail**. The EPS lists them (command validation with rule references, idempotency TTL, event bus subscriber recovery, audit checksum scheduled job, standardised correlation IDs) but provides no implementation plan, no acceptance criteria, and no ownership assignment for these changes.
- **Design partner engagement delays engineering start by 4-6 weeks** (D-10). This is a strategic decision that the EPS embraces, but it means v1.0 timeline is at least 4-6 weeks longer than the architecture alone would require.
- **Multi-currency scope change risk** (H-001) could add 12 weeks if validated as critical for v1.0. The EPS acknowledges this but has no contingency plan beyond "re-plan."
- **Metrics infrastructure requires ~2 engineering weeks** that is not yet allocated. The EPS identifies this as a dependency for D-07 (12 success metrics) but does not assign budget or timeline.
- **No UI wireframes exist**. The Information Architecture document defines 25 screens at a structural level but no visual designs, no interaction prototypes, and no user flow diagrams. The EPS is a product specification, not an implementation blueprint. The gap between EPS and Phase 21B wireframes is not trivial.

| Implementation Dependency | Status | Estimated Effort | Risk |
|--------------------------|--------|-----------------|-------|
| Phase 21A modifications | Defined, unscheduled | 1-2 weeks | Low — well-understood |
| Design partner engagement | Planned | 4-6 weeks (pre-build) | Medium — partner availability |
| Multi-currency schema (if validated) | Undefined | +12 weeks | High — scope change |
| Metrics infrastructure | Identified | 2 weeks | Medium — unbudgeted |
| UI wireframes | Not started | 4-6 weeks | Medium — depends on design partners |
| H-001 decision gate | Pending validation | 8 weeks parallel | High — blocks schema freeze |

---

## 3. Scoring Summary Grid

| # | Dimension | Score | Category | Critical Gaps |
|---|-----------|-------|----------|---------------|
| 1 | Customer Evidence | 7/10 | Foundation | Only 1 formal interview; 26% rules are Hypothesis |
| 2 | Workflow Completeness | 7/10 | Product | Stage 9+10 boundary wrong; vendor onboarding excluded |
| 3 | Persona Coverage | 6/10 | Product | Department Mgr Hypothesis; Vendor evidence weak; IT/Bank missing |
| 4 | Cognitive Load | 7/10 | UX | 5-question framework unvalidated; scroll/acknowledge risky |
| 5 | AI Trust & Transparency | 8/10 | AI | 70% threshold arbitrary; 8 actions too many for v1.0 |
| 6 | Financial Integrity | 9/10 | Financial | Decimal performance at scale unproven |
| 7 | Audit Readiness | 8/10 | Financial | Audit persistence not wired; storage cost not estimated |
| 8 | Multi-Tenancy | 9/10 | Infrastructure | No gaps |
| 9 | Multi-Currency | 3/10 | Product | Zero customer validation; 12-week schedule risk if required |
| 10 | Enterprise Scalability | 5/10 | Infrastructure | 500K unvalidated; in-memory stores; no read replicas |
| 11 | Design Partner Readiness | 6/10 | Process | No agreements exist; 4-6 week schedule delay accepted |
| 12 | Implementation Feasibility | 6/10 | Engineering | 5 modifications unspecified; UI wireframes not started |
| | **Weighted Average** | **6.75/10** | | |

---

## 4. Critical Gaps — Blocking Production Readiness

These gaps must be resolved before Phase 21B implementation begins. They are ranked by impact on production viability.

| # | Gap | Dimension(s) | Impact | Resolution Required |
|---|-----|-------------|--------|-------------------|
| **G-01** | **Multi-currency decision unmade** | 2, 9, 12 | If multi-currency is critical for v1.0, 12-week schedule impact. If schema freeze happens before validation, wrong schema is built. | Complete H-001 validation (weeks 1-8). Freeze schema only after decision gate passes. |
| **G-02** | **Only 1 formal customer interview** | 1, 3, 4 | Product decisions for 9 personas, 10 stages, and 65 rules rest primarily on CRM notes retroactively mapped to evidence. CRM notes were not collected for product validation. | Execute design partner programme. Complete 3+ structured discovery interviews before Phase 21B. |
| **G-03** | **10-stage model is hypothesis H-013** | 2, 3, 4 | The central design decision (10 stages) is itself unvalidated. If users think in 5 stages, the workflow model adds complexity without benefit. | Validate 10-stage model with design partners. User-test stage boundaries. |
| **G-04** | **Audit persistence not wired to production** | 7 | Append-only audit trail is a constitutional requirement (Law 4) and is specified in the EPS. Phase 23.1 found it is not wired. This is a P0 architectural debt item. | Connect AP domain events to audit record persistence before any production AP transaction. |
| **G-05** | **Stage 9+10 boundary is conceptually wrong** | 2, 4 | Audit is continuous, not terminal. Calling it Stage 10 creates incorrect mental model. GL Posting and Audit overlap in purpose. | Redesign Stage 10 as "Period Close" or distribute audit responsibility across all stages. |
| **G-06** | **In-memory stores risk data loss** | 10 | If any AP workflow state is held in memory (not just cache), a process restart causes data loss. Phase 25.5 identified this as a critical finding across the platform. | Verify all AP state is persisted in Prisma. If in-memory stores exist for AP, migrate before launch. |
| **G-07** | **5 modifications to Phase 21A unspecified** | 12 | The EPS identifies needed changes but provides no implementation plan. These modifications (rule integration, idempotency TTL, event subscriber recovery, etc.) are prerequisite to Phase 21B. | Document and schedule all 5 modifications before beginning UI implementation. |
| **G-08** | **UI wireframes do not exist** | 4, 12 | 25 screens defined structurally but no visual designs, no interaction prototypes. The EPS describes what screens show but not how users interact with them. | Produce wireframes for all 25 screens. Test with design partners before implementation. |

---

## 5. Recommended Remediation

### Pre-Phase 21B (Must Fix Before Engineering Starts)

1. **Execute design partner programme (weeks 1-8)**: Complete H-001 (multi-currency), H-013 (10-stage completeness), and H-002 (Department Manager persona) validation. These three decisions gate the schema, workflow model, and permission model.
2. **Wire audit persistence**: Connect AP domain events to `ProcurementAPAuditRecord`. This is a P0 constitutional compliance issue.
3. **Specify 5 Phase 21A modifications**: Document implementation plans, ownership, and acceptance criteria for each of the five identified changes.
4. **Produce wireframes for critical screens**: Invoice Detail, Approval View, Exception Queue, Dashboard, Payment Proposal. Test with design partners.

### Phase 21B (Early Implementation)

5. **Verify all AP state is persisted**: Audit every in-memory store used by AP workflow. Migrate to Prisma if found.
6. **Benchmark Decimal(38,12) at scale**: Run aggregation queries against 500K seeded invoices. Publish performance baseline.
7. **Calibrate AI confidence thresholds**: Run A/B tests with design partners to validate the 70% threshold before shipping AI features.
8. **Produce storage cost model for 7-year audit retention**: Estimate hot/cold storage costs at projected scale. Validate budget.

### Deferred (Post-v1.0)

9. **Multi-currency payment execution**: If H-001 validates only invoice-level multi-currency (not payment-level), defer multi-currency payment execution to v2.0.
10. **AP-AI-06 (Cash Flow Prediction) and AP-AI-07 (Vendor Risk Scoring)**: Marked [HYPOTHESIS]. Defer to v2.0 unless design partners validate as critical.
11. **Credit note as separate workflow**: If credit note complexity increases in practice, spin out as a distinct workflow in v2.0.
12. **Read replicas / CQRS**: Monitor dashboard query performance. Implement only if >2s response time at 500K invoices.

---

## 6. Overall Readiness Verdict

> ## CONDITIONALLY READY FOR PROTOTYPING
> 
> **Conditional on resolving G-01 through G-05 before Phase 21B engineering begins.**

The EPS v2.0 is the most thorough product specification in Perionyx's history. The evidence traceability model, AI boundary definition, financial integrity foundation, and audit architecture are genuinely strong — scoring 8-9/10 in their respective dimensions. The team has been honest about uncertainty (14 hypotheses, 26% of rules marked [HYPOTHESIS]), which is a strength, not a weakness.

However, the weighted average score of **6.75/10** reflects real and significant gaps:

1. **The evidence base is thinner than it appears**: 10 sources sounds comprehensive, but only 1 is a formal discovery interview. The remaining 9 are CRM notes retroactively mapped to product decisions. This is acceptable for Phase 27.1 (specification) but insufficient for Phase 21B (implementation).

2. **The 10-stage model is unvalidated**: The central design decision — the decomposition of procure-to-pay into 10 stages — is itself hypothesis H-013. If users do not recognise this decomposition, the workflow will add complexity without benefit.

3. **Multi-currency is a critical unresolved decision**: The entire Prisma schema assumes multi-currency readiness. But no customer has validated that multi-currency workflow support is needed (as opposed to multi-currency reporting). If H-001 invalidates, the schema is over-engineered. If it validates, the schema freeze is blocked until the design is finalised.

4. **Audit persistence is not wired**: The constitutional requirement for an append-only audit trail exists in specification but not in production. Every AP transaction executed before this is fixed will have gaps in the audit chain.

**The EPS is ready for design partner review. It is not ready for engineering implementation. Resolve G-01 through G-05, execute the first 8 weeks of design partner validation, then re-score.**

---

*End of Product Readiness Scorecard — Phase 27.1R*
