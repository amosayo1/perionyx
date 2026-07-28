# Product Risk Register — AP Reference Workflow v2.0

> **Classification**: Restricted — Internal Use Only
> **Review Date**: 2026-07-28
> **Reviewer**: Independent Product Review (Phase 27.1R)
> **Version Reviewed**: 2.0 (13 EPS documents)

---

## 1. Risk Methodology

### Scoring

| Rating | Likelihood (L) | Impact (I) |
|--------|----------------|------------|
| 1 — Very Low | <10% probability | Negligible financial or schedule impact |
| 2 — Low | 10–25% probability | Minor schedule slip (<2 weeks), no financial impact |
| 3 — Medium | 25–50% probability | Schedule slip (2-6 weeks), moderate financial impact |
| 4 — High | 50–75% probability | Major schedule slip (6-12 weeks), significant financial impact |
| 5 — Very High | >75% probability | Critical — blocks delivery, >12 weeks delay, major financial loss |

**Risk Score = Likelihood × Impact** (Range: 1–25)

| Score Range | Rating | Response |
|-------------|--------|----------|
| 1–4 | Low | Accept — monitor quarterly |
| 5–9 | Medium | Monitor — assign risk owner, review monthly |
| 10–15 | High | Mitigate — active mitigation plan, review bi-weekly |
| 16–25 | Critical | Avoid or transfer — escalate to Product Architecture Board |

### Risk Categories

| Category | Scope |
|----------|-------|
| CR | Customer Validation Risks |
| WD | Workflow Design Risks |
| AT | AI Trust Risks |
| TR | Technical Risks |
| IR | Integration Risks |
| SR | Schedule Risks |
| AR | Adoption Risks |

---

## 2. Top 20 Risks — Ranked

---

### R-01: Multi-Currency Validates as Critical for v1.0

| Field | Value |
|-------|-------|
| **ID** | SR-01 |
| **Category** | Schedule |
| **Risk** | H-001 validates that multi-currency invoice processing (original currency, FX tracking, multi-currency payment) is a v1.0 requirement, not deferrable to v2.0. |
| **Likelihood** | 3 (Medium) — industry trend toward multi-currency operations |
| **Impact** | 5 (Very High) — 12-week schedule impact, schema redesign, payment execution re-architecture |
| **Score** | **15 — High** |
| **Trigger** | H-001 validation with design partners yields "cannot adopt without multi-currency" |
| **Early Warning** | Design partner interview asks "what about other currencies?" unprompted |
| **Mitigation** | (1) Define single-currency v1.0 scope clearly in design partner agreement. (2) Design schema for forward compatibility (multi-currency fields as nullable, defer FX tracking). (3) Validate H-001 in first 4 weeks, not 8 weeks. (4) Prepare contingency: multi-currency _display_ only in v1.0 (conversion at view time, no per-invoice tracking). |
| **Residual Risk** | L: 2, I: 4 — Score: 8 — Medium (if multi-currency display-only is acceptable fallback) |
| **Owner** | Product Director |

---

### R-02: Design Partners Decline or Deliver Low Engagement

| Field | Value |
|-------|-------|
| **ID** | CR-01 |
| **Category** | Customer Validation |
| **Risk** | Top design partner candidates (Khaleel, Ahmed Orabi) decline participation, or accept but provide <2 sessions/month feedback velocity. |
| **Likelihood** | 3 (Medium) — Khaleel expressed interest but has not committed. Ahmed Orabi has not been contacted. |
| **Impact** | 5 (Very High) — D-10 (Design Partner Programme) is a gate to Phase 21B. Without quality partners, the EPS cannot be validated before build. |
| **Score** | **15 — High** |
| **Trigger** | Khaleel does not respond to outreach within 2 weeks. Ahmed Orabi declines. |
| **Early Warning** | Any candidate who delays first meeting more than twice |
| **Mitigation** | (1) Engage top 4 candidates simultaneously, not sequentially. (2) Prepare fallback: conduct structured discovery interviews with 3 next-tier candidates even without formal design partner status. (3) Prepare NDA and participation agreement templates before first contact — reduce friction to commit. (4) If all design partners decline, build v1.0 based on EPS + structured interviews with 5+ finance professionals (not formal design partners). |
| **Residual Risk** | L: 2, I: 3 — Score: 6 — Medium (structured interviews acceptable fallback) |
| **Owner** | Product Director |

---

### R-03: 10-Stage Model Fails Real-User Validation

| Field | Value |
|-------|-------|
| **ID** | WD-01 |
| **Category** | Workflow Design |
| **Risk** | Design partners do not recognise the 10-stage decomposition. Their mental model is 4-5 stages. The EPS adds complexity without benefit. |
| **Likelihood** | 3 (Medium) — The EPS acknowledges H-013. The 10-stage model was simplified from 14 but never validated with users. |
| **Impact** | 4 (High) — Workflow redesign, screen re-architecture, state machine changes, metrics redefinition. Estimated 8-12 weeks rework. |
| **Score** | **12 — High** |
| **Trigger** | First workflow walkthrough with design partner yields "why is this a separate stage?" |
| **Early Warning** | Design partner describes their workflow in significantly fewer stages than the EPS |
| **Mitigation** | (1) Test the 10-stage model in the FIRST design partner session — do not wait until prototype review. Show a workflow diagram and ask: "Is this how you think about the process?" (2) Prepare a 5/6-stage simplified model as fallback architecture. (3) Ensure state machine design does not hard-code 10 stages into the database (use configurable stage mappings). |
| **Residual Risk** | L: 2, I: 3 — Score: 6 — Medium (if configurable stage mapping exists) |
| **Owner** | Product Director |

---

### R-04: Evidence Before Approval Scroll/Acknowledge Causes Power-User Revolt

| Field | Value |
|-------|-------|
| **ID** | WD-02 |
| **Category** | Workflow Design |
| **Risk** | The "Evidence Before Approval" mechanism (minimum 3-second scroll/acknowledge before approve button enables) generates significant resistance from high-volume approvers processing 50+ invoices/day. |
| **Likelihood** | 4 (High) — Power users in enterprise finance optimise for throughput. Any mandatory wait time per invoice will be opposed. |
| **Impact** | 3 (Medium) — UX change, not architecture change. But could block adoption if mandatory. |
| **Score** | **12 — High** |
| **Trigger** | First usability test with a Controller processing 10+ invoices shows frustration |
| **Early Warning** | Any user says "can I turn this off?" during prototype testing |
| **Mitigation** | (1) Test the mechanism with design partners in the first usability round — do not ship without validation. (2) Design configurable "evidence review mode": Strict (mandatory scroll) / Standard (evidence visible, no forced delay) / Trusted (evidence shown but skippable for trusted approvers). Default to Standard, not Strict. (3) Ensure power users have keyboard shortcut to acknowledge evidence (e.g., "E" to expand evidence, "Space" to acknowledge). |
| **Residual Risk** | L: 2, I: 2 — Score: 4 — Low (if configurable) |
| **Owner** | Design Lead |

---

### R-05: AI Confidence Model Overconfidence / Hallucination

| Field | Value |
|-------|-------|
| **ID** | AT-01 |
| **Category** | AI Trust |
| **Risk** | The 5-level confidence model assumes AI can accurately estimate its own confidence. In practice, LLMs exhibit overconfidence — a 90% confidence prediction may be wrong. A confident-sounding but incorrect recommendation erodes trust. |
| **Likelihood** | 4 (High) — Overconfidence in LLMs is well-documented. The EPS assumes the AI model can provide calibrated confidence scores, which is a known unsolved problem in production ML systems. |
| **Impact** | 4 (High) — If users cannot trust the confidence scores, the entire AI trust model collapses. AI recommendation adoption rate (T2 metric) drops below 60%. |
| **Score** | **16 — Critical** |
| **Trigger** | Production incident: AI recommends "approve" with 94% confidence on a fraudulent invoice |
| **Early Warning** | Model calibration audit shows >10% of predictions in the 90-100% confidence band are incorrect |
| **Mitigation** | (1) Implement confidence calibration monitoring from day one — track precision per confidence band. (2) If overconfidence detected, apply post-hoc calibration (temperature scaling, Platt scaling). (3) Never ship AI recommendations without a human-in-the-loop override (already designed, but verify enforcement). (4) Consider dropping "confidence" from the UI entirely and replacing with "risk level" (low/medium/high) — less precise but less likely to be misinterpreted. |
| **Residual Risk** | L: 2, I: 3 — Score: 6 — Medium (if risk level replaces confidence) |
| **Owner** | AI/ML Lead |

---

### R-06: OCR Accuracy for Non-English Scripts Insufficient

| Field | Value |
|-------|-------|
| **ID** | TR-01 |
| **Category** | Technical |
| **Risk** | OCR accuracy for Arabic, Urdu, and other non-Latin scripts falls below the 85% confidence threshold, requiring >50% manual review for organisations in MENA region. |
| **Likelihood** | 4 (High) — Arabic OCR accuracy is a known industry challenge. Most OCR vendors achieve 80-90% for printed Arabic, lower for handwritten or mixed-language documents. |
| **Impact** | 3 (Medium) — Does not block v1.0 (manual review fallback exists), but reduces value proposition for MENA customers and invalidates the single-architecture global product assumption. |
| **Score** | **12 — High** |
| **Trigger** | OCR benchmark with 100 Arabic invoices from design partner shows <80% field accuracy |
| **Early Warning** | Vendor OCR accuracy benchmarks for Arabic script show <90% |
| **Mitigation** | (1) Validate with Khaleel (Urdu) and Ahmed Orabi (Arabic) in first 8 weeks. (2) Support multiple OCR vendors (Google Vision, Azure OCR, AWS Textract) with language-based routing. (3) If accuracy is insufficient for v1.0, launch with English/Latin-only OCR, mark Arabic as beta feature. |
| **Residual Risk** | L: 2, I: 2 — Score: 4 — Low (English-only v1.0 is acceptable for market entry) |
| **Owner** | Engineering Lead |

---

### R-07: PO / GRN Data Quality Insufficient for 85% Match Rate

| Field | Value |
|-------|-------|
| **ID** | IR-01 |
| **Category** | Integration |
| **Risk** | ERP integration returns incomplete, delayed, or inconsistent PO/GRN data. Match rate (Q1 metric target: >85% at 180 days) cannot be achieved because source data is unreliable. |
| **Likelihood** | 4 (High) — Phase 21.0 gap analysis found that PO/GRN data quality in mid-market ERPs is highly variable. The EPS acknowledges this (H-010). |
| **Impact** | 4 (High) — The entire value proposition of automated matching depends on match rate. If match rate is <70%, AP clerks must manually match most invoices — the core workflow automation fails. |
| **Score** | **16 — Critical** |
| **Trigger** | Design partner ERP data shows >30% of POs missing critical fields or >20% of GRNs not posted |
| **Early Warning** | Any design partner says "our POs are not always in the system" during first interview |
| **Mitigation** | (1) Implement data quality dashboard for PO/GRN health before launching matching. (2) Design "graceful degradation": if PO data is missing, fall back to 2-way match (invoice vs GRN). If GRN is missing, fall back to 2-way match (invoice vs PO). If both missing, route to exception. (3) Set customer expectations: match rate targets are phased (70% at 30 days, 85% at 180 days) — reflect realistic improvement as data quality improves. (4) Consider data quality improvement services (ERS, evaluated receipt settlement) as part of the product, not just the integration. |
| **Residual Risk** | L: 2, I: 3 — Score: 6 — Medium (graceful degradation exists but value prop is weaker) |
| **Owner** | Integrations Lead |

---

### R-08: Phase 21B Implementation Discovers 5 Modifications Are More Complex Than Estimated

| Field | Value |
|-------|-------|
| **ID** | TR-02 |
| **Category** | Technical |
| **Risk** | The 5 modifications to Phase 21A architecture (command validation with rule references, idempotency TTL, event bus subscriber recovery, audit checksum scheduled job, standardised correlation IDs) each take 1-3 weeks instead of the estimated 1-2 weeks total. |
| **Likelihood** | 3 (Medium) — Architecture modifications in a codebase with 30 outstanding architectural debt items (Phase 25.5) often uncover additional issues during implementation. |
| **Impact** | 3 (Medium) — 3-6 week schedule slip on Phase 21B, which cascades to v1.0 timeline. |
| **Score** | **9 — Medium** |
| **Trigger** | First modification (command validation) reveals deeper architectural issue |
| **Early Warning** | Code review of first modification requires significant refactoring |
| **Mitigation** | (1) Implement modifications as a dedicated Phase 21B.0 sub-phase with explicit timebox (3 weeks max). (2) Document acceptance criteria before starting each modification. (3) If any modification exceeds its estimate by >50%, escalate to Product Architecture Board for scope decision (defer or re-plan). |
| **Residual Risk** | L: 2, I: 2 — Score: 4 — Low (if timeboxed) |
| **Owner** | Engineering Lead |

---

### R-09: Audit Storage Costs Exceed Budget at Scale

| Field | Value |
|-------|-------|
| **ID** | TR-03 |
| **Category** | Technical |
| **Risk** | 7-year retention of full audit records (including 10KB of input data per event) at 31.5M events/year exceeds infrastructure budget. Cold storage costs alone may be $5K-15K/year per tenant. |
| **Likelihood** | 3 (Medium) — 315 GB/year incoming data growth is significant |
| **Impact** | 3 (Medium) — Budget overrun, not product blocker |
| **Score** | **9 — Medium** |
| **Trigger** | Storage cost projection at launch shows >10% of infrastructure budget consumed by audit logs |
| **Early Warning** | Monthly audit log growth rate exceeds projections by >20% in first quarter |
| **Mitigation** | (1) Model storage costs before launch (hot: 30 days, warm: 1 year, cold: 7 years). Budget accordingly. (2) Implement configurable retention policies (regulatory-driven — some jurisdictions require 5 years, others 10). (3) Compress input data at write time (gzip before storage). (4) Store full input data in blob storage, not database — database stores only hashes and references. |
| **Residual Risk** | L: 1, I: 2 — Score: 2 — Low (if blob storage separation implemented) |
| **Owner** | Engineering Lead |

---

### R-10: AI Recommendation Adoption Rate Below 60%

| Field | Value |
|-------|-------|
| **ID** | AT-02 |
| **Category** | AI Trust |
| **Risk** | Users override or ignore >40% of AI recommendations, invalidating the automation value proposition. T2 metric (AI Recommendation Adoption) fails to meet the 30-day target of >60%. |
| **Likelihood** | 3 (Medium) — T6 (AI Trust) is at Working confidence (2 sources). Customer evidence shows AI is "interesting but untrusted." |
| **Impact** | 4 (High) — If AI recommendations are not trusted, the AI investment (8 capabilities, significant engineering) does not deliver ROI. Core automation story collapses. |
| **Score** | **12 — High** |
| **Trigger** | First month of design partner usage shows <50% AI recommendation acceptance rate |
| **Early Warning** | Any design partner says "I need to double-check everything the AI does" during prototype review |
| **Mitigation** | (1) Ship explainability UI before AI recommendations — give users time to build trust by understanding AI outputs before relying on them. (2) Track per-capability acceptance rate (not just aggregate) — some capabilities may be trusted while others are not. (3) Implement "trust mode": start new users in High-Review mode (AI recommends, human confirms everything), graduate to Standard mode as trust builds. (4) Publish AI accuracy metrics internally so users can verify trustworthiness with data. |
| **Residual Risk** | L: 2, I: 3 — Score: 6 — Medium (graduated trust mode mitigates) |
| **Owner** | Product Director + AI/ML Lead |

---

### R-11: In-Memory Stores Used by AP Workflow Cause Data Loss

| Field | Value |
|-------|-------|
| **ID** | TR-04 |
| **Category** | Technical |
| **Risk** | The AP workflow relies on one or more in-memory data stores (following the pattern established by automation studio modules). A process restart causes loss of workflow state, exceptions, or pending approvals. |
| **Likelihood** | 3 (Medium) — Phase 25.5 identified 73 in-memory stores across the platform. The AP workflow is designed to use Prisma persistence, but if any sub-system (business rules, scheduling, monitoring) retains in-memory state, data loss is possible. |
| **Impact** | 5 (Very High) — Invoiced amounts, approval decisions, or payment state lost on restart is a critical production incident. Financial impact, regulatory implications. |
| **Score** | **15 — High** |
| **Trigger** | Production incident: server restart causes loss of partially-processed invoice state |
| **Early Warning** | Code audit finds `Map<>` or in-memory cache for any AP entity lifecycle |
| **Mitigation** | (1) Audit all AP workflow code for in-memory state before launch. (2) All workflow state must persist to Prisma before acknowledging the operation. (3) Implement crash-recovery: on restart, any in-flight invoice in DRAFT/CAPTURED state is re-queued for evidence collection. (4) Graceful shutdown must flush in-memory queues to database (Phase 26.1 graceful shutdown already wired, verify AP integration). |
| **Residual Risk** | L: 1, I: 4 — Score: 4 — Low (if audit confirms zero in-memory AP state) |
| **Owner** | Engineering Lead |

---

### R-12: 5-Question Framework Increases Screen Complexity

| Field | Value |
|-------|-------|
| **ID** | WD-03 |
| **Category** | Workflow Design |
| **Risk** | The 5-question design framework (What needs attention? Why? Evidence? Decision? Next?) forces every screen to answer 5 questions, which may lead to information-dense, cluttered screens that are harder to scan than purpose-built single-question screens. |
| **Likelihood** | 3 (Medium) — The framework is reasonable but rigid. Not all screens need to answer all 5 questions with equal prominence. |
| **Impact** | 2 (Low) — Screen redesign, not architecture change. |
| **Score** | **6 — Medium** |
| **Trigger** | First usability test shows user scanning for the primary action and ignoring 3 of 5 zones |
| **Early Warning** | Wireframe review shows every screen has identical structure with 5 labelled zones |
| **Mitigation** | (1) Apply the 5-question framework as a _checklist_ during design (does this screen answer these questions?), not a _template_ (every screen must have 5 labelled boxes). (2) Allow screen-specific emphasis: some screens foreground "What needs attention?" (Exception Queue), others foreground "What is the decision?" (Approval View). The framework should guide, not constrain. |
| **Residual Risk** | L: 2, I: 1 — Score: 2 — Low (if applied as checklist, not template) |
| **Owner** | Design Lead |

---

### R-13: Department Manager Persona Does Not Exist in Target Market

| Field | Value |
|-------|-------|
| **ID** | CR-02 |
| **Category** | Customer Validation |
| **Risk** | Design partner interviews reveal that cross-department approval is handled by the AP Manager, not a separate "Department Manager" persona. The multi-level approval routing (Stage 5) is over-engineered for the actual organisational structure. |
| **Likelihood** | 3 (Medium) — H-002 is explicitly marked [HYPOTHESIS]. In mid-market organisations (100-500 employees), the AP Manager often serves as the cross-department routing point. |
| **Impact** | 3 (Medium) — Approval routing simplification. Less architectural impact, more UX impact. |
| **Score** | **9 — Medium** |
| **Trigger** | Design partner describes approval process: "The AP Manager sends it to me" — routing is mediated, not direct |
| **Early Warning** | Any design partner has <3 identifiable department heads who approve invoices |
| **Mitigation** | (1) Validate H-002 early (weeks 1-4) in design partner interviews. (2) Design approval routing as configurable: enable/disable department-level routing. (3) If Department Manager is not a distinct persona, simplify the approval chain model. |
| **Residual Risk** | L: 1, I: 2 — Score: 2 — Low (configurable routing makes this a non-event) |
| **Owner** | Product Director |

---

### R-14: Single-Currency v1.0 Rejected by First Customers

| Field | Value |
|-------|-------|
| **ID** | AR-01 |
| **Category** | Adoption |
| **Risk** | First prospective customers (especially MENA region) require multi-currency support for v1.0 adoption. Single-currency v1.0 cannot be sold. |
| **Likelihood** | 3 (Medium) — Top design partner candidates are in Saudi Arabia and UAE. Khaleel (Saudi Arabia) may process invoices in SAR, USD, and AED. |
| **Impact** | 4 (High) — If first customer requires multi-currency, either delay launch by 12 weeks or lose the customer. |
| **Score** | **12 — High** |
| **Trigger** | Khaleel's validation session reveals he processes invoices in 3+ currencies daily |
| **Early Warning** | Any design partner asks "does it handle USD and SAR invoices?" during first meeting |
| **Mitigation** | (1) Ask about currency requirements in the FIRST design partner interview (not the 8-week validation plan). (2) Prepare a "multi-currency light" scope: original currency + functional currency display, no FX tracking, no multi-currency payment. (3) If multi-currency is a deal-breaker, delay v1.0 launch by 8-10 weeks rather than 12 — ship multi-currency _display_ and _invoice-level_ support, defer _payment-level_ and _FX tracking_ to v2.0. |
| **Residual Risk** | L: 2, I: 3 — Score: 6 — Medium (multi-currency light is acceptable fallback) |
| **Owner** | Product Director |

---

### R-15: Vendor Portal Adoption Below 20%

| Field | Value |
|-------|-------|
| **ID** | AR-02 |
| **Category** | Adoption |
| **Risk** | Vendors do not use the self-service portal. AP clerks continue receiving invoices via email, which OCR handles but defeats the portal's value proposition. |
| **Likelihood** | 4 (High) — Industry data suggests vendor portal adoption rates of 15-30% in the first year. Change management for thousands of vendor organisations is a known challenge. |
| **Impact** | 2 (Low) — OCR can handle email invoices. Portal is additive, not critical. |
| **Score** | **8 — Medium** |
| **Trigger** | First 6 months show <20% of invoices received via portal |
| **Early Warning** | Design partners say "our vendors won't use a portal" |
| **Mitigation** | (1) Vendor portal is designed as an _additional_ channel, not _the_ channel. Email/EDI/API are the primary channels. (2) Do not invest in portal features beyond basic invoice submission + payment status until adoption validates demand. (3) Incentivise portal adoption: offer faster payment processing for portal-submitted invoices. |
| **Residual Risk** | L: 2, I: 1 — Score: 2 — Very Low (portal is non-critical) |
| **Owner** | Product Director |

---

### R-16: Decimal(38,12) Performance Overhead Blocks Dashboard Queries

| Field | Value |
|-------|-------|
| **ID** | TR-05 |
| **Category** | Technical |
| **Risk** | SUM/AVG aggregation queries on 96+ Decimal(38,12) monetary fields across 500K invoices exceed acceptable response time for CFO dashboard (<2s). |
| **Likelihood** | 2 (Low) — Postgres `numeric(38,12)` is well-optimised. Indexing mitigates most aggregation concerns. But unindexed queries or complex joins could be slow. |
| **Impact** | 3 (Medium) — Performance optimisation, not product blocker. Could require materialised views or read replicas. |
| **Score** | **6 — Medium** |
| **Trigger** | Benchmark at 100K invoices shows dashboard query >3s |
| **Early Warning** | Query plan for dashboard shows sequential scans on monetary fields |
| **Mitigation** | (1) Index all monetary fields used in aggregation queries. (2) Benchmark at 50K, 100K, 250K, 500K during implementation — do not wait until production. (3) Prepare materialised view or pre-aggregation strategy if needed. |
| **Residual Risk** | L: 1, I: 2 — Score: 2 — Low (materialised views work) |
| **Owner** | Engineering Lead |

---

### R-17: Concurrent Invoice Approval Race Conditions at High Volume

| Field | Value |
|-------|-------|
| **ID** | TR-06 |
| **Category** | Technical |
| **Risk** | Optimistic locking retries cause user-facing errors when multiple approvers act on the same invoice simultaneously or when system auto-escalation triggers at the same moment as manual approval. |
| **Likelihood** | 2 (Low) — Multi-level approval chains with system auto-escalation create genuine concurrency edge cases. |
| **Impact** | 3 (Medium) — User confusion ("I approved it but it says rejected"), possibly invalid approval states. |
| **Score** | **6 — Medium** |
| **Trigger** | Integration test reveals race condition in X-05 (Payment confirmed → Invoice PAID) |
| **Early Warning** | Concurrency test at 100 concurrent approvals shows >5% version conflict rate |
| **Mitigation** | (1) Implement deterministic priority: human approval > system escalation. (2) Add conflict resolution: if two concurrent approvals occur, first wins, second gets "already approved" with link to first approval. (3) Extensively test concurrency scenarios in Phase 21A.4 pattern (87 integration tests already exist — add concurrency-specific tests). |
| **Residual Risk** | L: 1, I: 2 — Score: 2 — Low (deterministic priority resolves most cases) |
| **Owner** | Engineering Lead |

---

### R-18: Phase 26.3 Foundation Conditions Not Fully Remediated

| Field | Value |
|-------|-------|
| **ID** | TR-07 |
| **Category** | Technical |
| **Risk** | The 6 conditions from Phase 26.3 certification (singleton lifecycle, cross-tenant audit, memory bounds, exception discipline, API validation, secret safety) have been addressed but may have regressions or edge cases affecting AP workflow. |
| **Likelihood** | 2 (Low) — Phase 26.3 remediation was thorough (class-level prevention, ESLint rules, CI validation). Regression is possible but tested (60/60 runtime tests passing). |
| **Impact** | 4 (High) — If cross-tenant audit access regresses in AP context, sensitive financial data could be exposed across tenants. |
| **Score** | **8 — Medium** |
| **Trigger** | AP integration test discovers tenant isolation gap |
| **Early Warning** | Runtime test failure after code merge related to AP repositories |
| **Mitigation** | (1) Add AP-specific tenant isolation tests in Phase 21B (not just runtime tests). (2) Verify all 6 conditions pass before AP production deployment. (3) CI pipeline must run AP tests before merging any AP-related code. |
| **Residual Risk** | L: 1, I: 3 — Score: 3 — Low (with CI enforcement) |
| **Owner** | Engineering Lead |

---

### R-19: EPS Does Not Address Bank API Failure Recovery

| Field | Value |
|-------|-------|
| **ID** | IR-02 |
| **Category** | Integration |
| **Risk** | The EPS defines error recovery for bank API failure (retry once, escalate) but does not specify the manual payment execution workflow. If the banking platform is down for hours (not minutes), the organisation cannot pay any invoices. |
| **Likelihood** | 2 (Low) — Major banking platforms (Plaid, Stripe, direct bank APIs) have >99.9% uptime. But regional banks may have lower reliability. |
| **Impact** | 5 (Very High) — Inability to pay invoices is an existential operational risk for the customer's business. |
| **Score** | **10 — High** |
| **Trigger** | Banking API outage >4 hours during payment run |
| **Early Warning** | Any bank API health check fails >2 times in a month |
| **Mitigation** | (1) Define the manual payment execution workflow: export payment batch as instruction file, upload to banking portal, reconcile manually. (2) Document this in the EPS as a recovery path (not a software feature — a process). (3) For high-value payments, support dual-bank configuration (primary + fallback bank account). |
| **Residual Risk** | L: 1, I: 4 — Score: 4 — Low (if manual fallback process is documented) |
| **Owner** | Product Director |

---

### R-20: Success Metrics Data Collection Infrastructure Not Funded

| Field | Value |
|-------|-------|
| **ID** | SR-02 |
| **Category** | Schedule |
| **Risk** | The ~2 engineering weeks required to build metrics infrastructure (audit log queries, UI telemetry, cron jobs, metrics dashboard) have not been allocated. Phase 21B begins without metrics collection in place, so no baseline data exists at launch. |
| **Likelihood** | 3 (Medium) — The EPS acknowledges this as a dependency (D-07 impact: "~2 weeks engineering investment") but does not assign schedule or budget. |
| **Impact** | 3 (Medium) — No baseline data means no measurement of success metrics for the first weeks of operation. Targets cannot be validated. |
| **Score** | **9 — Medium** |
| **Trigger** | Phase 21B planning does not include metrics infrastructure as a sprint |
| **Early Warning** | No metrics-related user stories in first Phase 21B sprint |
| **Mitigation** | (1) Make metrics infrastructure a formal Phase 21B.0 deliverable (before feature implementation). (2) Instrument generation of events from day one — even if the dashboard is built later, the data is captured. (3) Define minimum viable metrics: capture timestamps for M-01 (Invoice Processing Time) and M-07 (Audit Completeness) — these two metrics cover 80% of measurement value. |
| **Residual Risk** | L: 1, I: 2 — Score: 2 — Low (if event generation is implemented even without dashboard) |
| **Owner** | Engineering Lead |

---

## 3. Risk Summary

| Rank | ID | Risk Name | Category | L | I | Score | Rating |
|------|----|-----------|----------|---|----|--------|--------|
| 1 | AT-01 | AI confidence model overconfidence | AI Trust | 4 | 4 | **16** | Critical |
| 2 | IR-01 | PO/GRN data quality insufficient | Integration | 4 | 4 | **16** | Critical |
| 3 | SR-01 | Multi-currency validates as critical | Schedule | 3 | 5 | **15** | High |
| 4 | CR-01 | Design partners decline | Customer Val. | 3 | 5 | **15** | High |
| 5 | TR-04 | In-memory stores cause data loss | Technical | 3 | 5 | **15** | High |
| 6 | WD-01 | 10-stage model fails validation | Workflow | 3 | 4 | **12** | High |
| 7 | WD-02 | Scroll/acknowledge power-user revolt | Workflow | 4 | 3 | **12** | High |
| 8 | TR-01 | OCR for non-English insufficient | Technical | 4 | 3 | **12** | High |
| 9 | AT-02 | AI adoption below 60% | AI Trust | 3 | 4 | **12** | High |
| 10 | AR-01 | Single-currency v1.0 rejected | Adoption | 3 | 4 | **12** | High |
| 11 | IR-02 | Bank API failure recovery undefined | Integration | 2 | 5 | **10** | High |
| 12 | TR-02 | Phase 21A modifications complex | Technical | 3 | 3 | **9** | Medium |
| 13 | TR-03 | Audit storage costs over budget | Technical | 3 | 3 | **9** | Medium |
| 14 | CR-02 | Department Manager persona absent | Customer Val. | 3 | 3 | **9** | Medium |
| 15 | SR-02 | Metrics infrastructure unfunded | Schedule | 3 | 3 | **9** | Medium |
| 16 | AR-02 | Vendor portal adoption below 20% | Adoption | 4 | 2 | **8** | Medium |
| 17 | TR-07 | Phase 26 conditions regression | Technical | 2 | 4 | **8** | Medium |
| 18 | WD-03 | 5-question framework clutters UX | Workflow | 3 | 2 | **6** | Medium |
| 19 | TR-05 | Decimal(38,12) performance overhead | Technical | 2 | 3 | **6** | Medium |
| 20 | TR-06 | Concurrency race conditions | Technical | 2 | 3 | **6** | Medium |

### Distribution

| Rating | Count | Action |
|--------|-------|--------|
| Critical (16-25) | 2 | Immediate escalation to Product Architecture Board |
| High (10-15) | 9 | Active mitigation plan, bi-weekly review |
| Medium (5-9) | 9 | Assign risk owner, monthly review |
| Low (1-4) | 0 | Accept |

---

## 4. Risk Response Plan

### Critical Risks (Score 16+)

**R-01 (AT-01): AI Confidence Model Overconfidence**
- Response: **Avoid** — Ship risk-level labels (low/medium/high) instead of confidence percentages until model calibration is verified at production scale. Implement calibration monitoring before public launch. Confidence percentages are an internal metric, not a UI element.

**R-02 (IR-01): PO/GRN Data Quality Insufficient**
- Response: **Mitigate** — Implement data quality dashboard as part of Phase 21B (not post-launch). Phased match rate targets (70% > 85%) set realistic expectations. Graceful degradation to 2-way matching when data quality is insufficient.

### High Risks (Score 10-15)

| ID | Response | Action |
|----|----------|--------|
| SR-01 | Avoid | Validate H-001 in first 4 weeks. If multi-currency critical, scope "multi-currency light" (display + invoice-level, no FX tracking, no multi-currency payment). |
| CR-01 | Avoid | Engage top 4 candidates simultaneously. Prepare NDAs before first contact. Have interview-based fallback ready by week 4. |
| TR-04 | Avoid | Audit all AP state for in-memory usage before launch. Enforce Prisma-only persistence for all workflow-critical state. |
| WD-01 | Mitigate | Test 10-stage model in first design partner session. Prepare 5/6-stage fallback architecture. Make stage mapping configurable. |
| WD-02 | Mitigate | Test scroll/acknowledge with power users. Implement configurable review modes (Strict/Standard/Trusted). Default to Standard, not Strict. |
| TR-01 | Mitigate | Validate with Arabic/Urdu invoices in first 8 weeks. Support multi-vendor OCR with language routing. Launch English-only if insufficient. |
| AT-02 | Mitigate | Implement graduated trust mode (High-Review → Standard). Ship explainability before recommendations. Publish accuracy metrics internally. |
| AR-01 | Mitigate | Ask about currency needs in first interview. Prepare "multi-currency light" scope. Multi-currency display + invoice-level support, defer FX tracking. |
| IR-02 | Transfer | Document manual payment execution workflow (export + upload + reconcile). Explore dual-bank configuration for high-value payments. |

---

## 5. Risk Owners

| Category | Owner | Top Risk |
|----------|-------|----------|
| Customer Validation (CR) | Product Director | Design partners decline |
| Workflow Design (WD) | Product Director + Design Lead | 10-stage model fails validation |
| AI Trust (AT) | AI/ML Lead + Product Director | AI confidence overconfidence |
| Technical (TR) | Engineering Lead | In-memory stores/data loss |
| Integration (IR) | Integrations Lead | PO/GRN data quality |
| Schedule (SR) | Engineering Lead + Product Director | Multi-currency scope change |
| Adoption (AR) | Product Director + GTM Lead | Single-currency v1.0 rejected |

---

## 6. Risk Review Cadence

| Review Type | Frequency | Participants | Scope |
|-------------|-----------|-------------|-------|
| **Product Architecture Board** | Bi-weekly (weeks 1-16) | Product Director, Engineering Lead, Design Lead, AI/ML Lead | Critical + High risks; escalation decisions |
| **Risk Review** | Monthly | All risk owners | Full register review; new risks; risk score updates |
| **Design Partner Sync** | Per session | Product Director + relevant design partner | Customer validation risks (CR-01, CR-02, WD-01) |
| **Technical Deep Dive** | Per phase milestone | Engineering Lead + Tech Leads | Technical risks (TR-01 through TR-07) |
| **Quarterly Refresh** | Every 3 months | Product Architecture Board + risk owners | Full reassessment; closed risks archived; new risks added |

### Risk Review Agenda (Monthly)

1. Review all risks with score >9 (High + Critical)
2. Check early warning indicators for each
3. Update likelihood/impact if evidence changes
4. Add new risks identified during implementation
5. Close risks where mitigation is complete
6. Escalate any risk whose score has increased by >3 points since last review

---

*End of Product Risk Register — Phase 27.1R*
