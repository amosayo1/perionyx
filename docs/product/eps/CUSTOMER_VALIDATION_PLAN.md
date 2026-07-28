---
title: "Customer Validation Plan — AP Reference Workflow v2.0"
created: 2026-07-28
updated: 2026-07-28
version: 2.0
phase: 27.1
tags:
  - type/strategy
  - domain/product
  - domain/ap
  - domain/customer-intelligence
  - status/draft
owner: Product Team
authority: Phase 27.1
supersedes: none
inherited_by: ["AR", "Treasury", "Financial Close"]
---

# Customer Validation Plan — AP Reference Workflow v2.0

> **Classification**: Restricted — Internal Use Only
> **Status**: Draft — pending Product Architecture Board approval
> **Authority**: Phase 27.1 — Customer Evidence → Product Specification

---

## 1. Purpose

This document defines **how Perionyx validates product decisions with customers before building**. The AP Reference Workflow is the first complete financial workflow in the platform. Every design decision in the EPS is traceable to customer evidence. Where evidence was insufficient, assumptions were explicitly marked **[HYPOTHESIS]**. This plan closes those gaps.

### Why Validate Before Building

| Reason | Evidence |
|--------|----------|
| Building the wrong feature costs 3-6x more than validating the need first | Industry standard (Lean Startup, Continuous Discovery) |
| Enterprise finance buyers require proof, not promises | Phase 20.0: Product readiness 67% — insufficient for production deployment |
| Customer evidence increases design partner conversion | Khaleel Ur Rehman (CRM): "What can I do to support you?" — strongest signal came after evidence-sharing, not before |
| Market hypotheses (T7 multi-currency, T8 regulatory compliance) need validation before architecture commitment | 14 hypotheses currently at Working or Hypothesis status — none at Validated |

### Scope

This plan covers:

- **Design Partner Program**: Updated criteria, scoring, pipeline for 7 candidates
- **Validation Workflow**: 9 relationship stages from Prospect → Strategic Advisor
- **Interview Protocol**: Structured formats for context, discovery, prototype review, and prioritisation
- **Validation Goals by Stage**: What to validate at each of the 10 AP workflow stages
- **Evidence Grading**: How evidence quality is assessed and tracked
- **Hypothesis Validation**: 14 hypotheses with specific plans, targets, and costs
- **Ethics & Privacy**: Consent, data handling, opt-out, compensation

### Relationship to Other Documents

| Document | Relationship |
|----------|--------------|
| [[ENTERPRISE_PRODUCT_SPECIFICATION_AP]] | Master spec; this plan validates its assumptions |
| [[REFERENCE_WORKFLOW_AP]] | 7-stage workflow; this plan validates each stage |
| [[BUSINESS_RULE_LIBRARY]] | 65 rules; this plan validates the 17 [HYPOTHESIS] rules |
| [[PERIONYX_PRODUCT_PROPERTIES]] | 10 principles; this plan validates the 2 Hypothesis principles |
| `brain/03-Customer Intelligence/` | Source data for all evidence references |
| `docs/customer-intelligence/DESIGN_PARTNER_PIPELINE.md` | Superseded — this plan updates and replaces |

---

## 2. Design Partner Program

### 2.1 Updated Scoring Criteria

Every candidate is scored across 6 dimensions. The composite score determines engagement priority.

| Dimension | Weight | Description | Scoring |
|-----------|--------|-------------|---------|
| **Role Fit** | 25% | Does this person's role match a target persona in the AP workflow? | 5: AP Manager / Controller. 4: Treasury Manager / Procurement. 3: CFO/Finance Manager. 2: GL Accountant. 1: Analyst. 0: Non-finance |
| **Pain Alignment** | 20% | Does their organisation experience the validated pain points (T1-T6)? | 5: 3+ themes confirmed. 4: 2 themes. 3: 1 theme. 2: Implied but unconfirmed. 1: No pain alignment. 0: Counter-indicated |
| **Engagement Quality** | 20% | Depth of existing interaction history | 5: 2+ direct interactions, detailed CRM notes. 4: 1 direct interaction, good notes. 3: 1 callback/interaction, basic notes. 2: CRM contact only, no interaction. 1: Outbound target only. 0: No engagement |
| **Decision Authority** | 15% | Can this person influence or make purchasing decisions? | 5: Finance Manager or above with budget authority. 4: AP Manager or Controller. 3: Senior Accountant. 2: Accountant. 1: Analyst. 0: No authority |
| **Organisation Fit** | 10% | Is their organisation a good test environment for AP workflow? | 5: Mid-market (100-1000 employees), multi-entity. 4: Mid-market, single entity. 3: Enterprise (1000+ employees). 2: Small business (<50). 1: Micro. 0: Non-commercial |
| **Strategic Value** | 10% | Does this relationship provide long-term value beyond this workflow? | 5: Multi-workflow feedback potential, referral risk. 4: AP insights plus adjacent domain insights. 3: AP-only. 2: Limited scope. 1: Single interview. 0: No strategic value |

### 2.2 Candidate Scoring

#### Khaleel Ur Rehman — HIGHEST (Score: 4.55/5)

| Field | Value |
|-------|-------|
| **Company** | Unannounced (Saudi Arabia) |
| **Role** | Finance Manager |
| **Engagement History** | CRM interaction, direct request: "What can I do to support you in building that operating system?" |
| **Why Selected** | Highest engagement quality in the pipeline. Has requested to participate — no outbound required. Finance Manager role covers AP oversight, approval workflows, and payment readiness. Saudi Arabia aligns with multi-currency (T7) and Arabic-language (H-013) validation needs. |
| **Validation Scope** | Stages 4-8 (Exception Resolution through Payment Execution). Approval path validation. Multi-currency requirement validation. |
| **Expected Timeline** | Weeks 1-2: Onboard to design partner program. Weeks 3-4: Context interview. Weeks 5-8: Prototype review (Approval View, Exception Resolution). Weeks 9-12: Workflow validation. |
| **Compensation** | $200/month retainer + $100/structured interview + early access to all AP features |

| Dimension | Score | Weighted |
|-----------|-------|----------|
| Role Fit | 4 | 1.00 |
| Pain Alignment | 5 | 1.00 |
| Engagement Quality | 5 | 1.00 |
| Decision Authority | 4 | 0.60 |
| Organisation Fit | 4 | 0.40 |
| Strategic Value | 5 | 0.50 |
| **Total** | **4.55** | **4.50** |

#### Ahmed Orabi — VERY HIGH (Score: 4.20/5)

| Field | Value |
|-------|-------|
| **Company** | Hikma Pharmaceuticals |
| **Role** | AP/P2P |
| **Engagement History** | CRM interaction, requested Perionyx information |
| **Why Selected** | Direct AP/P2P role — ideal persona fit. Pharmaceutical industry has complex AP workflows (multiple entities, regulatory compliance, multi-currency). Hikma is a large enterprise — provides enterprise-scale validation. |
| **Validation Scope** | Stages 1-5 (Invoice Receipt through Approval Path). Exception resolution validation. AI matching validation. Regulatory compliance (T8) validation. |
| **Expected Timeline** | Weeks 2-3: Onboard. Weeks 4-5: Context interview. Weeks 6-10: Prototype review (Invoice capture, Three-way match). Weeks 11-16: Workflow validation. |
| **Compensation** | $200/month retainer + $100/structured interview + priority feature requests |

| Dimension | Score | Weighted |
|-----------|-------|----------|
| Role Fit | 5 | 1.25 |
| Pain Alignment | 4 | 0.80 |
| Engagement Quality | 4 | 0.80 |
| Decision Authority | 3 | 0.45 |
| Organisation Fit | 5 | 0.50 |
| Strategic Value | 4 | 0.40 |
| **Total** | **4.20** | **4.20** |

#### Muhammed Jamsheed — HIGH (Score: 3.55/5)

| Field | Value |
|-------|-------|
| **Company** | Al Reef Agricultural (Saudi Arabia) |
| **Role** | Finance (reported by contact) |
| **Engagement History** | CRM notes: "Automated reconciliation is highly desired", "Intelligent discrepancy alerts would reduce manual work", "ERP integration gaps" |
| **Why Selected** | Validated pain points T2 (Reconciliation) and T3 (ERP Silos). Agricultural sector has specific GRN/inventory matching challenges. Saudi Arabia aligns with multi-currency and Arabic-first hypotheses. |
| **Validation Scope** | Stages 2-5 (Invoice Validation through Approval Path). Three-way match validation. ERP integration validation. |
| **Expected Timeline** | Weeks 3-4: Onboard. Weeks 5-6: Context interview. Weeks 7-12: Prototype review (Match view, Exception queue). |
| **Compensation** | $200/month retainer + $100/structured interview + early access |

| Dimension | Score | Weighted |
|-----------|-------|----------|
| Role Fit | 3 | 0.75 |
| Pain Alignment | 5 | 1.00 |
| Engagement Quality | 3 | 0.60 |
| Decision Authority | 3 | 0.45 |
| Organisation Fit | 4 | 0.40 |
| Strategic Value | 4 | 0.40 |
| **Total** | **3.55** | **3.60** |

#### Ayman Shawky — MEDIUM (Score: 3.00/5)

| Field | Value |
|-------|-------|
| **Company** | Unannounced |
| **Role** | Chief Accountant |
| **Engagement History** | CRM notes: multi-currency balance aggregation, instant cash visibility, confidence scoring interest |
| **Why Selected** | Chief Accountant role covers GL posting, reconciliation, and audit stages. SAP/Odoo/Dynamics experience provides multi-ERP perspective. Evidence on multi-currency and cash visibility is currently Hypothesis — he is our primary validator for these. |
| **Validation Scope** | Stages 9-10 (GL Posting, Audit & Reconciliation). Multi-currency validation. AI confidence scoring validation. |
| **Expected Timeline** | Weeks 4-6: Onboard. Weeks 7-8: Context interview. Weeks 9-16: Prototype review (GL posting, Audit trail). |
| **Compensation** | $150/month retainer + $75/structured interview |

| Dimension | Score | Weighted |
|-----------|-------|----------|
| Role Fit | 4 | 1.00 |
| Pain Alignment | 3 | 0.60 |
| Engagement Quality | 2 | 0.40 |
| Decision Authority | 4 | 0.60 |
| Organisation Fit | 3 | 0.30 |
| Strategic Value | 3 | 0.30 |
| **Total** | **3.00** | **3.20** |

#### Mohamed Gamal — MEDIUM (Score: 2.80/5)

| Field | Value |
|-------|-------|
| **Company** | Construction (unannounced) |
| **Role** | Junior GL Accountant |
| **Engagement History** | CRM notes: pain points in delayed information collection, approval bottlenecks, manual bank reconciliation, manual account reconciliation. Desired: automated reconciliations, automated approvals, faster month-end close. |
| **Why Selected** | Direct experience with month-end close pain (T5 — Validated). Junior perspective on current tooling gaps. Construction industry has project-based AP needs that differ from standard procurement. |
| **Validation Scope** | Stages 9-10 (GL Posting, Audit & Reconciliation). Month-end close workflow validation. |
| **Expected Timeline** | Weeks 5-7: Onboard. Weeks 8-9: Context interview. Weeks 10-16: Prototype review. |
| **Compensation** | $100/month retainer + $50/structured interview |

| Dimension | Score | Weighted |
|-----------|-------|----------|
| Role Fit | 2 | 0.50 |
| Pain Alignment | 4 | 0.80 |
| Engagement Quality | 2 | 0.40 |
| Decision Authority | 2 | 0.30 |
| Organisation Fit | 4 | 0.40 |
| Strategic Value | 2 | 0.20 |
| **Total** | **2.80** | **2.60** |

#### Eslam Sobhi — MEDIUM (Score: 2.75/5)

| Field | Value |
|-------|-------|
| **Company** | Unannounced |
| **Role** | Cost Accountant |
| **Engagement History** | CRM notes: Dynamics 365 feedback, treasury operations feedback, cost accounting integration needs |
| **Why Selected** | Cost accounting perspective on invoice allocation and GL coding. Dynamics 365 experience informs ERP integration validation (H-014). Treasury feedback provides cross-workflow validation. |
| **Validation Scope** | Stages 3 (Three-Way Match), 9 (GL Posting). Cost allocation validation. ERP sync validation. |
| **Expected Timeline** | Weeks 6-8: Onboard. Weeks 9-10: Context interview. Weeks 11-16: Prototype review. |
| **Compensation** | $100/month retainer + $50/structured interview |

| Dimension | Score | Weighted |
|-----------|-------|----------|
| Role Fit | 2 | 0.50 |
| Pain Alignment | 3 | 0.60 |
| Engagement Quality | 2 | 0.40 |
| Decision Authority | 2 | 0.30 |
| Organisation Fit | 4 | 0.40 |
| Strategic Value | 4 | 0.40 |
| **Total** | **2.75** | **2.60** |

#### Ahmed Abdelmoneim — LOW (Score: 2.15/5)

| Field | Value |
|-------|-------|
| **Company** | Unannounced |
| **Role** | Treasury |
| **Engagement History** | CRM notes: Odoo ERP, Power BI feedback. Treasury operations integration feedback. |
| **Why Selected** | Treasury perspective validates Stages 6-8 (Payment Readiness, Treasury Approval, Payment Execution). Power BI usage provides analytics integration expectations. |
| **Validation Scope** | Stages 6-8 (Payment workflow). Treasury reporting. BI/analytics integration. |
| **Expected Timeline** | Weeks 8-12: Onboard (pending higher-priority candidates). |
| **Compensation** | $100/month retainer + $50/structured interview |

| Dimension | Score | Weighted |
|-----------|-------|----------|
| Role Fit | 3 | 0.75 |
| Pain Alignment | 2 | 0.40 |
| Engagement Quality | 2 | 0.40 |
| Decision Authority | 2 | 0.30 |
| Organisation Fit | 2 | 0.20 |
| Strategic Value | 2 | 0.20 |
| **Total** | **2.15** | **2.25** |

### 2.3 Pipeline Priority

| Priority | Candidate | Score | Next Action | Target Date |
|----------|-----------|-------|-------------|-------------|
| P0 | Khaleel Ur Rehman | 4.55 | Onboard to design partner program | Week 1 |
| P0 | Ahmed Orabi | 4.20 | Send program invitation | Week 2 |
| P1 | Muhammed Jamsheed | 3.55 | Re-engage with discovery update | Week 3 |
| P1 | Ayman Shawky | 3.00 | Schedule context interview | Week 4 |
| P2 | Mohamed Gamal | 2.80 | Schedule context interview | Week 6 |
| P2 | Eslam Sobhi | 2.75 | Schedule context interview | Week 7 |
| P3 | Ahmed Abdelmoneim | 2.15 | Monitor; re-engage post-v1 prototype | Week 12 |

---

## 3. Validation Workflow

### 3.1 Relationship Stages

Every customer relationship progresses through 9 stages. Each stage has defined entry criteria, activities, and outcomes.

| Stage | Name | Entry Criteria | Activities | Outcome | Estimated Duration |
|-------|------|----------------|------------|---------|-------------------|
| 1 | Prospect | Outbound target identified or inbound inquiry received | Record in CRM, classify pain points, score for fit | CRM record created | 1-3 days |
| 2 | Connected | First interaction completed (call, email, or meeting) | Document context, share product vision, assess enthusiasm | CRM notes updated, engagement score assigned | 1-2 weeks |
| 3 | Interview Scheduled | Design partner score >= 2.0, agreed to interview | Send calendar invite, share interview prep docs, confirm consent | Interview date in calendar | 1-2 weeks |
| 4 | Interview Completed | Structured interview conducted | Transcribe, extract evidence, update theme confidence, grade evidence | Evidence record created, theme confidence updated | 1-2 sessions |
| 5 | Prototype Reviewer | Interview completed, evidence graded Strong+, candidate willing | Share interactive prototype (Figma + clickable), capture feedback, iterate | Prototype feedback logged, design changes made | 2-6 weeks |
| 6 | Design Partner | Prototype reviewed and validated, candidate committed to ongoing feedback | Monthly check-ins, feature previews, workflow walkthroughs, quarterly reviews | Ongoing evidence stream, validated feature decisions | 3-12 months |
| 7 | Pilot Customer | Design partner phase complete, product ready for deployment | Paid pilot (discounted), dedicated support, success metrics tracked, NPS measured | Pilot metrics report, validation report, case study | 3-6 months |
| 8 | Reference Customer | Pilot successful, NPS >= 40, willing to provide public reference | Case study published, reference calls scheduled, speaking opportunities | Published case study, referral generation | Ongoing |
| 9 | Strategic Advisor | Reference customer stage completed + demonstrated strategic insight | Quarterly strategy sessions, product roadmap input, board-level feedback | Strategic guidance, multi-workflow validation | Ongoing |

### 3.2 Stage Transition Rules

| Transition | Rule | Evidence Required |
|------------|------|-------------------|
| Prospect → Connected | Outbound: 2+ attempts. Inbound: Auto. | Initial context note |
| Connected → Interview Scheduled | Design partner score >= 2.0 | Completed CRM profile |
| Interview Scheduled → Interview Completed | Actual interview conducted | Transcript or detailed notes |
| Interview Completed → Prototype Reviewer | Evidence graded Strong+ from interview | Evidence record |
| Prototype Reviewer → Design Partner | 2+ prototype review sessions completed | Design change log |
| Design Partner → Pilot Customer | Product readiness >= 75% (Phase 20.0 assessment) | Product readiness report |
| Pilot Customer → Reference Customer | Pilot success metrics met, NPS >= 40 | Pilot metrics report |
| Reference Customer → Strategic Advisor | 6+ months as reference + strategic insight demonstrated | Strategic contribution record |

### 3.3 Current Pipeline Status (Week 0)

| Candidate | Current Stage | Target Stage | Target Date | Blockers |
|-----------|---------------|--------------|-------------|----------|
| Khaleel Ur Rehman | Connected | Design Partner | Week 8 | None — ready for interview scheduling |
| Ahmed Orabi | Connected | Design Partner | Week 10 | Needs AP-specific prototype |
| Muhammed Jamsheed | Connected | Prototype Reviewer | Week 8 | Re-engagement needed |
| Ayman Shawky | Interview Completed | Prototype Reviewer | Week 12 | Evidence graded Medium — needs follow-up |
| Mohamed Gamal | Interview Completed | Prototype Reviewer | Week 12 | Evidence graded Medium — needs follow-up |
| Eslam Sobhi | Connected | Interview Scheduled | Week 10 | Context interview not yet conducted |
| Ahmed Abdelmoneim | Connected | Interview Scheduled | Week 16 | Low priority — no immediate action |

---

## 4. Interview Protocol

### 4.1 Interview Types

Four interview types are used throughout the validation lifecycle. Each has a structured format with time-boxed sections.

| Type | Purpose | Duration | Participants |
|------|---------|----------|--------------|
| **Context** | Understand the person's role, organisation, current workflow, and pain points | 45-60 min | 1 interviewer + 1 participant |
| **Workflow Discovery** | Deep-dive into a specific workflow stage or process | 45-60 min | 1 interviewer + 1 participant |
| **Prototype Review** | Validate a specific feature or interface against real work patterns | 30-45 min | 1 interviewer + 1 participant (may include 1 observer) |
| **Prioritisation** | Rank competing features or decisions by business value | 30 min | 1 interviewer + 1 participant |

### 4.2 Context Interview (45-60 min)

| Section | Duration | Questions | Purpose |
|---------|----------|-----------|---------|
| **Introduction** | 5 min | "Thank you for your time. I'm [interviewer], and I work on the product team at Perionyx. We're building a financial operating system, and I want to understand how you handle accounts payable today. There are no right or wrong answers — I'm here to learn from your experience. Is it OK if I record this for note-taking purposes?" | Establish safety, confirm consent |
| **Role Context** | 5 min | "Tell me about your role. What does a typical day look like? Who do you interact with most frequently? What are the top 3 things you spend your time on?" | Understand persona fit |
| **Current Workflow** | 20 min | "Walk me through how an invoice arrives, gets approved, and gets paid in your organisation. From start to finish, what happens? Who touches it? Where does it get stuck? What tools do you use at each step?" | Map current state workflow |
| **Pain Points** | 10 min | "If you could wave a magic wand and change one thing about your AP process, what would it be? What's the most frustrating part of your day? What keeps you up at night during month-end close?" | Identify unmet needs |
| **Outcome Desires** | 5 min | "Imagine it's 6 months from now and your AP process is working perfectly. What's different? What metrics would improve?" | Define success criteria |
| **Closing** | 5 min | "Is there anything I haven't asked that you think I should know? Would you be open to a follow-up conversation?" | Uncover blind spots, confirm next steps |

### 4.3 Workflow Discovery (45-60 min)

| Section | Duration | Questions | Purpose |
|---------|----------|-----------|---------|
| **Context Check** | 10 min | "Since we last spoke, has anything changed in your workflow? Have you encountered a situation that made you think differently about [topic]?" | Update context |
| **Workflow Deep-Dive** | 20 min | "Let's focus on [specific stage]. Last time you mentioned [specific statement]. Can you walk me through the last time this happened in detail? What was the trigger? What information did you need? Who did you need to talk to? How long did it take? What was the outcome?" | Validate specific workflow assumptions |
| **Exception Scenarios** | 10 min | "What happens when something goes wrong? Can you give me an example of the last time there was a discrepancy or exception in this process? How was it resolved? How long did it take?" | Validate exception handling design |
| **Tool Evaluation** | 10 min | "Thinking about the tool you use for this process today: what does it do well? What does it do poorly? If you could add one feature or remove one feature, what would it be?" | Inform feature priorities |
| **Closing** | 5 min | "What would make this conversation more valuable for you? Is there someone else I should talk to?" | Improve process, expand network |

### 4.4 Prototype Review (30-45 min)

| Section | Duration | Questions | Purpose |
|---------|----------|-----------|---------|
| **Context Refresh** | 5 min | "Last time we talked about [topic]. Today I'm going to show you a prototype of how we're thinking about solving that problem. Remember: this is a rough draft. You can't hurt my feelings — I need your honest feedback." | Set expectations, reduce politeness bias |
| **Task Walkthrough** | 20 min | "Starting from this screen, show me how you would [specific task]. Please think out loud as you go. What are you looking for? What are you expecting to happen if you click here? Is the information you need visible?" | Validate task flow |
| **Specific Validation** | 10 min | "On this screen, I want to call your attention to [specific design decision]. What do you think of this approach? Would this work in your organisation? What's missing?" | Validate targeted assumptions |
| **Closing** | 5 min | "On a scale of 1-10, how well does this solution address the problem we discussed last time? What would make it a 10?" | Quantify satisfaction |

### 4.5 Prioritisation (30 min)

| Section | Duration | Questions | Purpose |
|---------|----------|-----------|---------|
| **Feature List** | 5 min | "Here are 5 things we're considering building next. I want to understand which ones would be most valuable to you." | Present options |
| **Ranking Exercise** | 15 min | "If you had 100 points to distribute across these 5 features, how would you allocate them? Walk me through your reasoning." (Use forced-trade-off to reveal true priorities) | Quantify relative value |
| **Willingness to Pay** | 5 min | "If we built [top-ranked feature] and it cost [amount] more per month, would your organisation pay for it? Why or why not?" | Validate business value |
| **Closing** | 5 min | "Is there anything on this list that you think we should remove entirely? Is there something missing that should be here?" | Validate completeness |

---

## 5. Validation Goals by Stage

What to validate at each AP workflow stage. Each goal has a validation method, target evidence level, and priority.

### Stage 1 — Invoice Received

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| OCR accuracy expectations | Prototype review with 3+ AP clerks | Strong | P0 | OCR accuracy >= 95% required before user will trust |
| Document formats used | Context interview | Working | P1 | Invoice formats support: PDF, scanned image, email attachment, EDI, portal upload |
| Duplicate detection threshold | Prototype review | Working | P1 | "High confidence duplicate" blocks entry; "Possible duplicate" flags with warning |
| Email-based invoice receipt prevalence | Context interview | Strong | P0 | X% of invoices arrive by email — determines whether email ingestion is P0 or P1 |
| Vendor portal expectations | Prioritisation interview | Hypothesis | P2 | H-003: Is vendor self-service portal valuable enough to build? |

### Stage 2 — Invoice Validated

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Field validation rules | Workflow discovery with AP Manager | Working | P1 | Required fields match real-world invoice data (vendor, PO, amount, date, currency, GL code) |
| Evidence assembly expectation | Prototype review | Strong | P1 | Users expect PO + GRN + contract to be linked automatically |
| Vendor history relevance | Prototype review | Working | P2 | Last 12-month payment history helps validation decisions |
| PO matching without receipt for services | Workflow discovery | Hypothesis | P2 | H-014: Two-way match for services vs three-way for goods |

### Stage 3 — Three-Way Match

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Tolerance levels per vendor | Workflow discovery with AP Manager | Strong | P0 | Price tolerance: 0-10% configurable. Quantity tolerance: 0-5% configurable. Default: 5% price / 0% quantity |
| Match failure handling | Prototype review | Working | P1 | Users prefer auto-exception over manual override |
| Two-way vs three-way preference | Context interview | Hypothesis | P2 | H-014: Services invoices use 2-way match (invoice vs PO); Goods invoices use 3-way match (invoice vs PO vs GRN) |
| Partial receipt matching | Workflow discovery | Hypothesis | P1 | H-009: Partial shipments should not block matching of received quantities |

### Stage 4 — Exception Resolution

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Exception classification | Prototype review with AP Manager | Strong | P1 | Price mismatch, quantity mismatch, missing PO, duplicate, policy violation, vendor mismatch, GRN mismatch |
| SLA enforcement expectations | Workflow discovery | Working | P2 | Exceptions should have configurable SLAs by severity (critical 24h, high 48h, medium 5d, low 10d) |
| AI resolution suggestions | Prototype review | Working | P0 | Muhammed Jamsheed: "Intelligent discrepancy alerts would reduce manual work" |
| Bulk resolution actions | Prototype review | Hypothesis | P2 | H-002: Batch resolution preferred over individual processing |
| Exception priority sorting | Prototype review | Strong | P1 | Sort by SLA deadline first, then by financial impact — never chronology alone |

### Stage 5 — Approval Path

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Approval threshold tiers | Context interview with Controller | Working | P0 | Adeel Aslam: "approval workflows...delay payments" — validate thresholds: <$1K AP clerk, <$10K AP Manager, <$50K Controller, <$250K CFO, >$250K CFO+Board |
| Delegation requirements | Workflow discovery | Hypothesis | P1 | H-002: Approval delegation is critical for mid-market companies |
| Mobile approval expectations | Prioritisation interview | Hypothesis | P2 | Is mobile approval (P0) or desktop-only sufficient (P2)? |
| Simultaneous vs sequential approval | Workflow discovery | Hypothesis | P1 | Sequential may be required for compliance; parallel may be desired for speed |
| SoD enforcement expectations | Context interview with Controller | Strong | P1 | PO creator cannot approve invoice. Invoice approver cannot execute payment. SoD is non-negotiable. |

### Stage 6 — Payment Readiness

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Batch vs individual payment preference | Workflow discovery with Treasury Manager | Hypothesis | P2 | H-002: Batch payments preferred. Target: batch once per week for routine, individual for urgent |
| Discount capture value | Context interview | Hypothesis | P1 | H-006: Is early-pay discount capture a measurable financial benefit? |
| Cash flow alignment needs | Context interview with Treasury Manager | Working | P1 | Ayman Shawky: "Need for instant view of cash positions" |

### Stage 7 — Treasury Approval

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Dual-signature thresholds | Context interview with Controller | Hypothesis | P1 | H-008: Dual-signature for payments >$50K. Validate threshold and signer roles |
| Cash availability verification | Workflow discovery | Working | P1 | Ayman Shawky: "instant view of cash positions" — Treasury requires real-time cash data before approving |
| Payment timing optimisation | Prototype review | Hypothesis | P2 | H-006: AI-optimised payment timing based on discount terms and cash position |

### Stage 8 — Payment Execution

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Payment method preferences | Context interview | Hypothesis | P2 | Wire, ACH, cheque — per vendor or per payment region |
| Confirmation expectations | Workflow discovery | Hypothesis | P1 | Real-time confirmation expected? Or daily batch confirmation acceptable? |
| Failure handling | Workflow discovery | Working | P1 | Auto-retry expectation, notification on failure, manual intervention path |

### Stage 9 — GL Posting

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Auto-coding accuracy expectations | Prototype review with Controller | Working | P1 | AI-suggested GL codes should be >= 90% accurate before users trust auto-posting |
| Review-before-post vs auto-post preference | Workflow discovery | Hypothesis | P1 | H-005: Do controllers want to review every posting, or trust-and-verify-exceptions? |
| Subledger reconciliation needs | Context interview | Strong | P1 | Mohamed Gamal: "manual account reconciliation" — automated subledger-to-GL reconciliation is expected |
| Period close locking | Workflow discovery with Controller | Working | P2 | Lock period after close to prevent changes. Support re-opening with audit trail. |

### Stage 10 — Audit & Reconciliation

| Goal | Validation Method | Target Evidence | Priority | Success Criterion |
|------|-------------------|-----------------|----------|-------------------|
| Audit trail expectations | Context interview with Auditor | Strong | P0 | Every action recorded with timestamp, actor, decision, evidence hash. Immutable. |
| Bank reconciliation automation | Workflow discovery with Treasury | Working | P1 | Mohamed Gamal: "manual bank reconciliation" — automated matching expected for >90% of transactions |
| Month-end close workflow | Context interview with Controller | Strong | P1 | T5: Month-end close is painful — validate continuous close approach |
| Checksum verification reference | Prototype review | Hypothesis | P2 | Do auditors trust checksum chains or require additional verification? |

---

## 6. Evidence Grading

### 6.1 Evidence Levels

Every customer evidence record is graded on a 5-level scale.

| Level | Name | Definition | Example | Action |
|-------|------|------------|---------|--------|
| **0** | Pending | No evidence collected. Hypothesis or assumption. | "Multi-currency is important" — no customer has said this | Design with caution; do not invest heavily |
| **1** | Weak | Single mention in passing. Not validated in context. | "I guess multi-currency would be helpful" — mentioned once, not explored | Treat as signal, seek confirmation |
| **2** | Moderate | Specific statement with context. One source. | "We have 3 suppliers in USD and 2 in EUR, and reconciling them is painful" — specific, contextual | Design with this evidence in mind |
| **3** | Strong | Specific, contextual, consequential. One source with clear implications. | "Multi-currency reconciliation costs us 8 hours per month. If an automated tool could do this, I could redeploy that time to analysis." — quantified impact | High confidence — influences architecture |
| **4** | Validated | 3+ independent sources at Moderate or above. Pattern confirmed across segments. | 4 AP managers in different industries independently confirm multi-currency reconciliation takes 5-10 hours/month | Full confidence — informs roadmap and architecture |

### 6.2 Evidence Decay

Evidence decays over time if not refreshed. The decay rate depends on the evidence type.

| Type | Decay Half-Life | Refresh Requirement |
|------|-----------------|---------------------|
| Workflow pain point | 12 months | Re-confirm annually |
| Feature preference | 6 months | Re-confirm at prototype stage |
| Tool satisfaction | 6 months | Re-confirm at major version changes |
| Organisational context | 3 months | Check for changes before each prototype review |
| Workflow sequence | 12 months | Re-confirm annually |
| Quantitative claim (hours, cost) | 3 months | Volatile — re-verify at each interaction |
| Stated priority | 1 month | Priorities shift rapidly — validate before acting |
| Willingness to pay | 1 month | Validate within sprint of feature commitment |

### 6.3 Evidence Record Template

Every customer interaction produces an evidence record:

```yaml
id: EVID-XXXX
source: [Name]
source_id: [CRM record ID]
date: YYYY-MM-DD
interview_type: [Context|Workflow Discovery|Prototype Review|Prioritisation]
evidence_level: [Pending|Weak|Moderate|Strong|Validated]
themes: [T1, T2, ...]
hypotheses: [H-001, H-002, ...]
workflow_stages: [1, 2, ...]
principles: [P1, P2, ...]
quotes:
  - quote: "..."
    context: "Said while discussing approval workflow"
    implications: "Approval delegation should support multi-level chain"
action_items:
  - "Update approval delegation design to support escalation path"
```

---

## 7. Hypothesis Validation

### 7.1 Hypothesis Validation Plans

Each of the 14 open hypotheses has a structured validation plan. Plans are prioritised by risk level and impact on architecture decisions.

### H-001: Multi-Currency Invoice Support

| Field | Value |
|-------|-------|
| **Hypothesis** | Finance professionals need a multi-currency invoice workflow (not just reporting) |
| **Risk Level** | High |
| **Current Evidence** | T7 Hypothesis. Ayman Shawky: "multi-currency balance aggregation" (Moderate — single CRM source). |
| **Validation Method** | Prototype review with Khaleel Ur Rehman (Saudi Arabia) + Ahmed Orabi (Hikma pharmaceuticals) |
| **Success Criteria** | 2/2 design partners confirm: (a) they process invoices in multiple currencies, (b) original currency tracking is essential, (c) functional currency conversion at invoice time is preferred over payment time |
| **Customer Targets** | Khaleel Ur Rehman (Saudi — multi-currency regional), Ahmed Orabi (pharma — cross-border procurement) |
| **Estimated Cost** | 2 prototype reviews × $200 + 2 interviews × $200 = $800 |
| **Timeline** | Weeks 3-6 |
| **Decision Gate** | H-001: Multi-currency tables in Prisma schema. If Validated, all monetary fields store original currency + exchange rate + functional currency equivalent. If Invalidated, defer to post-v1. |

### H-002: Batch Payment Proposals

| Field | Value |
|-------|-------|
| **Hypothesis** | AP teams prefer batch payment proposals over individual invoice processing |
| **Risk Level** | Medium |
| **Current Evidence** | Adeel Aslam: "approval workflow workflow exists" (Weak — approval is confirmed but batch preference is inferred). |
| **Validation Method** | Workflow discovery with Khaleel Ur Rehman + Ahmed Abdelmoneim |
| **Success Criteria** | 2/2 confirm: (a) they batch payments today (weekly/fortnightly cycle), (b) batch processing would save time over individual, (c) they need emergency individual payment option |
| **Customer Targets** | Khaleel Ur Rehman (Finance Manager — batch perspective), Ahmed Abdelmoneim (Treasury — execution perspective) |
| **Estimated Cost** | 2 workflow discovery sessions × $100 = $200 |
| **Timeline** | Weeks 4-8 |
| **Decision Gate** | H-002: Batch command in Payment Service. If Validated, PaymentProposal aggregate and ProposalApproved event are P1. If Invalidated, individual payment execution is the primary path. |

### H-003: Vendor Self-Service Portal

| Field | Value |
|-------|-------|
| **Hypothesis** | Vendors will use a self-service portal to submit invoices and check payment status |
| **Risk Level** | Medium |
| **Current Evidence** | No direct customer evidence. Industry pattern. |
| **Validation Method** | Prioritisation interview with Khaleel Ur Rehman + Ahmed Orabi + 1 additional |
| **Success Criteria** | 2/3 confirm: (a) their vendors frequently ask about payment status, (b) they believe a portal would reduce AP clerk inquiries by 25%+, (c) they would invest time in vendor onboarding for portal access |
| **Customer Targets** | Khaleel Ur Rehman, Ahmed Orabi, Muhammed Jamsheed |
| **Estimated Cost** | 3 prioritisation interviews × $100 = $300 |
| **Timeline** | Weeks 8-12 |
| **Decision Gate** | H-003: Vendor portal feature scope. If Validated, portal is P1 in Phase 21B. If Invalidated, portal is P3 deferred. |

### H-004: OCR for Paper Invoices

| Field | Value |
|-------|-------|
| **Hypothesis** | OCR invoice capture is a primary requirement for reducing manual data entry |
| **Risk Level** | High |
| **Current Evidence** | Muhammed Jamsheed: "automated reconciliation is highly desired" (Moderate — automated reconciliation implies automated capture). T2: manual reconciliation is painful (Working — 4 sources). |
| **Validation Method** | Context interview with AP Clerks: quantify paper invoice volume + how invoices arrive today |
| **Success Criteria** | Validate that (a) paper/scanned invoice volume exceeds 20% of total invoices, (b) manual data entry time per invoice exceeds 10 minutes, (c) OCR extraction would be trusted if accuracy >= 95% |
| **Customer Targets** | Ahmed Orabi (pharma — likely high paper invoice volume), Mohamed Gamal (construction — likely high paper volume) |
| **Estimated Cost** | 2 context interviews × $100 + 1 prototype review × $200 = $400 |
| **Timeline** | Weeks 4-8 |
| **Decision Gate** | H-004: OCR integration priority. If Validated, OCR is P0 in Phase 21B Stage 1. If Invalidated, defer to manual capture first. |

### H-005: AI-Powered GL Coding

| Field | Value |
|-------|-------|
| **Hypothesis** | AI-suggested GL account codes reduce manual coding time and errors |
| **Risk Level** | Medium |
| **Current Evidence** | T6: AI Trust is Working (2 sources — interest exists but is cautious). Ayman Shawky: "confidence scoring" (Moderate). |
| **Validation Method** | Prototype review: show AI-suggested GL codes with confidence scores. Measure trust through willingness to use. |
| **Success Criteria** | 2/3 design partners: (a) willing to let AI suggest GL codes with >= 90% confidence, (b) would review codes below 90% confidence, (c) would NOT want auto-posting for any confidence level |
| **Customer Targets** | Ayman Shawky (Confidence scoring interest), Ahmed Orabi (AP/P2P — coding complexity), Eslam Sobhi (Cost accounting — coding accuracy needs) |
| **Estimated Cost** | 3 prototype reviews × $200 = $600 |
| **Timeline** | Weeks 8-16 |
| **Decision Gate** | H-005: AI coding feature. If Validated, AI GL coding with confidence threshold is P1. If Invalidated, manual GL coding with lookup/search is P0. |

### H-006: Cash Flow Prediction

| Field | Value |
|-------|-------|
| **Hypothesis** | ML-based cash flow predictions from AP data would improve Treasury planning |
| **Risk Level** | High |
| **Current Evidence** | Ayman Shawky: "interest in ML-based cash flow predictions" (Weak — single CRM mention, not explored). T4: Real-time cash needed (Working). |
| **Validation Method** | Context interview + workflow discovery with Treasury Managers |
| **Success Criteria** | 2/2 Treasury Managers: (a) currently forecast cash position manually, (b) spend 5+ hours/month on cash flow forecasting, (c) would trust ML predictions with confidence score >= 70% |
| **Customer Targets** | Ahmed Abdelmoneim (Treasury), Khaleel Ur Rehman (Finance Manager — cash flow responsibility) |
| **Estimated Cost** | 2 workflow discovery sessions × $100 = $200 |
| **Timeline** | Weeks 8-14 |
| **Decision Gate** | H-006: Cash flow prediction feature. If Validated, P2 for Phase 21C (Intelligence phase). If Invalidated, defer until post-v2. |

### H-007: Budget Check Integration

| Field | Value |
|-------|-------|
| **Hypothesis** | Invoice approval should check available budget before routing |
| **Risk Level** | Medium |
| **Current Evidence** | No direct customer evidence. Inferred from P7 (One Financial Truth). |
| **Validation Method** | Workflow discovery + prioritisation interview |
| **Success Criteria** | 2/2 Finance Managers: (a) currently have budget checks in procurement before PO creation, (b) do NOT have budget checks at invoice stage, (c) believe invoice-stage budget check would be valuable |
| **Customer Targets** | Khaleel Ur Rehman, Ahmed Orabi |
| **Estimated Cost** | 2 workflow discovery sessions × $100 = $200 |
| **Timeline** | Weeks 10-16 |
| **Decision Gate** | H-007: Budget integration feature. If Validated, P2 for Phase 21D. If Invalidated, defer. |

### H-008: Withholding Tax Automation

| Field | Value |
|-------|-------|
| **Hypothesis** | Withholding tax calculation and reporting should be automated in the AP workflow |
| **Risk Level** | Medium |
| **Current Evidence** | No direct customer evidence. Regulatory requirement in MENA (Saudi Arabia: 5-20% WHT, Egypt: 20% WHT). |
| **Validation Method** | Context interview + regulatory research |
| **Success Criteria** | (a) 2/2 design partners from KSA or Egypt confirm WHT is a manual process today, (b) 2/2 confirm automated WHT would save time, (c) Regulatory research confirms WHT rates and rules for target markets |
| **Customer Targets** | Khaleel Ur Rehman (Saudi Arabia), Muhammed Jamsheed (Saudi Arabia) |
| **Estimated Cost** | 2 context interviews × $100 = $200 |
| **Timeline** | Weeks 6-12 |
| **Decision Gate** | H-008: WHT automation feature. If Validated, P2 for Phase 21D. If Invalidated, defer. |

### H-009: Partial Payment Support

| Field | Value |
|-------|-------|
| **Hypothesis** | AP teams need to pay a portion of an invoice while disputing or delaying the remainder |
| **Risk Level** | Medium |
| **Current Evidence** | Adeel Aslam: "manual oversight" (Weak — infers partial scenarios exist). T2: reconciliation is manual (Weak — partial payments increase reconciliation complexity). |
| **Validation Method** | Workflow discovery with AP Managers |
| **Success Criteria** | 2/2 AP Managers: (a) have experience with partial payments in their current workflow, (b) partial payment handling is manual and error-prone today, (c) automated partial payment support would reduce reconciliation errors |
| **Customer Targets** | Ahmed Orabi (AP/P2P), Khaleel Ur Rehman (Finance Manager) |
| **Estimated Cost** | 2 workflow discovery sessions × $100 = $200 |
| **Timeline** | Weeks 8-14 |
| **Decision Gate** | H-009: Partial payment feature. If Validated, P2 for Phase 21D. If Invalidated, defer. |

### H-010: Vendor Credit Note Workflow

| Field | Value |
|-------|-------|
| **Hypothesis** | A structured vendor credit note workflow is necessary for returns, corrections, and adjustments |
| **Risk Level** | Low |
| **Current Evidence** | Standard accounting practice. No customer evidence collected because the need is well-established. |
| **Validation Method** | Validate through standard workflow discovery — credit note handling is expected to be confirmed |
| **Success Criteria** | 2/2 AP Managers confirm they process credit notes at least weekly |
| **Customer Targets** | Any 2 design partners |
| **Estimated Cost** | Covered within existing workflow discovery sessions |
| **Timeline** | Weeks 4-10 (low priority — validate inline with other sessions) |
| **Decision Gate** | H-010: Credit note workflow. Low risk — proceed with standard implementation unless invalidated. |

### H-011: Recurring Invoice Automation

| Field | Value |
|-------|-------|
| **Hypothesis** | Automated recurring invoice generation (rent, subscriptions, leases) reduces manual work |
| **Risk Level** | Low |
| **Current Evidence** | Standard accounting practice. No customer evidence collected because need is well-established. |
| **Validation Method** | Validate through standard workflow discovery |
| **Success Criteria** | 2/2 AP Managers confirm they process recurring invoices and currently enter them manually each period |
| **Customer Targets** | Any 2 design partners |
| **Estimated Cost** | Covered within existing workflow discovery sessions |
| **Timeline** | Weeks 4-10 |
| **Decision Gate** | H-011: Recurring invoice feature. Low risk — proceed with standard implementation unless invalidated. |

### H-012: Regulatory Compliance Reporting

| Field | Value |
|-------|-------|
| **Hypothesis** | AP teams need automated compliance reporting for local tax and regulatory requirements |
| **Risk Level** | Medium |
| **Current Evidence** | T8: Regulatory Compliance Hypothesis. No direct customer evidence. |
| **Validation Method** | Context interview with Finance Managers + regulatory research per target market |
| **Success Criteria** | (a) 2/2 design partners confirm they spend 5+ hours/month on compliance reporting from AP data, (b) confirm specific compliance requirements (VAT, WHT, Zakat, Corporate Tax), (c) regulatory research validates variable requirements |
| **Customer Targets** | Khaleel Ur Rehman (Saudi — Zakat/VAT), Ahmed Orabi (Egypt — VAT/WHT), Ayman Shawky (multi-jurisdiction) |
| **Estimated Cost** | 3 context interviews × $100 + regulatory research (internal) = $500 |
| **Timeline** | Weeks 6-16 |
| **Decision Gate** | H-012: Compliance reporting feature. If Validated, P1 for Phase 21D. If Invalidated, defer. |

### H-013: Arabic-Language Interface

| Field | Value |
|-------|-------|
| **Hypothesis** | Arabic-language and RTL interface significantly increases MENA adoption |
| **Risk Level** | Medium |
| **Current Evidence** | HP3: Arabic-First Design (Hypothesis). CRM profiles include Saudi Arabia and Egypt contacts. No direct evidence that language is a barrier or differentiator. |
| **Validation Method** | Context interview + prioritisation interview with Saudi/Egypt design partners |
| **Success Criteria** | 2/2 design partners from Arabic-speaking countries: (a) confirm Arabic interface would accelerate adoption, (b) rate Arabic support as "Important" or "Critical" in purchasing decision, (c) confirm English-only interface is not a blocker but Arabic would be a differentiator |
| **Customer Targets** | Khaleel Ur Rehman (Saudi), Muhammed Jamsheed (Saudi), Ahmed Orabi (Egypt), Ayman Shawky (Egypt) |
| **Estimated Cost** | 2 prioritisation interviews × $100 = $200 |
| **Timeline** | Weeks 6-12 |
| **Decision Gate** | H-013: Arabic/RTL feature. If Validated, P1 investment. If Invalidated, P3 deferred. Note: i18n infrastructure (next-intl, locale routing) is already built in Phase 8B.6 — H-013 validates whether to invest in Arabic translation content. |

### H-014: ERP Bidirectional Sync

| Field | Value |
|-------|-------|
| **Hypothesis** | Perionyx must synchronise bidirectionally with existing ERPs (SAP, Oracle, Dynamics, Odoo) rather than replace them |
| **Risk Level** | High |
| **Current Evidence** | P8: ERP Bidirectional (Hypothesis). T3: ERP Silos are real (3 sources — Validated). Ayman Shawky uses SAP/Odoo/Dynamics. Eslam Sobhi uses Dynamics 365. Ahmed Abdelmoneim uses Odoo. Muhammed Jamsheed reports "ERP systems lack strong integration." 4 sources confirm ERP usage but do NOT confirm bidirectional sync need specifically. |
| **Validation Method** | Prioritisation interview with 3+ design partners: present three options — (a) Perionyx as standalone AP system with one-way export to ERP, (b) Perionyx with bidirectional sync, (c) Perionyx as ERP-replacement. Forced trade-off ranking. |
| **Success Criteria** | (a) 2/3 rank bidirectional sync (b) above standalone, (b) 2/3 confirm their organisation will NOT replace their ERP with Perionyx in the next 2 years, (c) 2/3 confirm sync latency of up to 1 hour is acceptable |
| **Customer Targets** | All 7 design partners |
| **Estimated Cost** | 3 prioritisation interviews × $100 = $300 |
| **Timeline** | Weeks 4-10 |
| **Decision Gate** | H-014: ERP sync architecture. If Validated, integration platform strategic investment (per Platform Constitution) is P0 — architecture decision affects all 15 platforms. If Invalidated, one-way export is sufficient for v1. |

### 7.2 Hypothesis Validation Summary

| ID | Hypothesis | Risk | Cost | Timeline | Decision Gate | Priority |
|----|-----------|------|------|----------|---------------|----------|
| H-001 | Multi-currency invoice support | High | $800 | W3-6 | Prisma schema multi-currency fields | P0 |
| H-002 | Batch payment proposals | Medium | $200 | W4-8 | Payment service batch commands | P1 |
| H-003 | Vendor self-service portal | Medium | $300 | W8-12 | Portal feature scope | P2 |
| H-004 | OCR for paper invoices | High | $400 | W4-8 | OCR integration priority | P0 |
| H-005 | AI-powered GL coding | Medium | $600 | W8-16 | AI coding feature arch | P1 |
| H-006 | Cash flow prediction | High | $200 | W8-14 | Prediction feature scope | P1 |
| H-007 | Budget check integration | Medium | $200 | W10-16 | Budget integration scope | P2 |
| H-008 | Withholding tax automation | Medium | $200 | W6-12 | WHT automation feature | P2 |
| H-009 | Partial payment support | Medium | $200 | W8-14 | Partial payment feature | P2 |
| H-010 | Vendor credit note workflow | Low | $0* | W4-10 | Credit note workflow | P3 |
| H-011 | Recurring invoice automation | Low | $0* | W4-10 | Recurring invoice feature | P3 |
| H-012 | Regulatory compliance reporting | Medium | $500 | W6-16 | Compliance reporting arch | P1 |
| H-013 | Arabic-language interface | Medium | $200 | W6-12 | Arabic translation investment | P1 |
| H-014 | ERP bidirectional sync | High | $300 | W4-10 | Integration platform strategy | P0 |

*Covered within existing sessions.

### 7.3 Total Validation Budget

| Category | Cost |
|----------|------|
| Design partner retainers (3 × $200/month + 4 × $100/month) | $1,000/month |
| Structural interview compensation | $2,600 (one-time) |
| Prototype review compensation | $1,600 (one-time) |
| Regulatory research (internal) | $200 (one-time) |
| **Total estimated cost (16-week validation cycle)** | **~$8,800** |

---

## 8. Ethics & Privacy

### 8.1 Consent Requirements

| Interaction Type | Consent Required | Method | Recording |
|------------------|------------------|--------|-----------|
| Context interview | Written consent | Email or form signed before interview | Consent record in CRM |
| Workflow discovery | Written or verbal consent | Verbal consent recorded at start of session | Consent confirmation in interview notes |
| Prototype review | Written or verbal consent | Verbal consent recorded at start of session | Consent confirmation in prototype feedback |
| Prioritisation interview | Written or verbal consent | Verbal consent recorded at start of session | Consent confirmation in interview notes |

### 8.2 Consent Form Template

```
PERIONYX — CUSTOMER RESEARCH CONSENT FORM

Thank you for participating in Perionyx customer research.

What we will do:
- Record this session for note-taking purposes
- Store notes in our secure CRM (encrypted at rest)
- Use anonymised insights to inform product decisions
- Attribute quotes to you by name only with your explicit permission

What we will NOT do:
- Share your name, organisation, or identifying details publicly without your permission
- Use session recordings for marketing or sales purposes
- Share raw notes with anyone outside the product team

Your rights:
- You may stop the session at any time
- You may request deletion of your data at any time
- You may request a copy of your data at any time
- You may opt out of future research at any time

Compensation:
- Research participants receive compensation as agreed in the design partner agreement
- Compensation is not contingent on providing positive feedback
- Negative feedback is equally valuable and equally compensated

By participating in this session, you acknowledge that you have read and understood this form.
```

### 8.3 Data Handling

| Data Type | Storage | Retention | Access |
|-----------|---------|-----------|--------|
| Session recordings | Encrypted storage (AES-256-GCM) | 12 months, then deleted | Product team only |
| Interview notes | CRM (Prisma backend, encrypted) | Duration of engagement + 24 months | Product team + CRM admin |
| Anonymised evidence | Brain knowledge platform | Permanent (no PII) | All Brain users |
| Consent records | CRM | Permanent | Product team + compliance |
| Compensation records | Finance system | 7 years (tax/compliance) | Finance team |

### 8.4 Opt-Out Process

1. Participant requests opt-out via email or direct message
2. Product team confirms receipt within 48 hours
3. All session recordings deleted within 7 days
4. CRM notes anonymised (replace name with "Participant [ID]") within 7 days
5. Consent record retained (proof of deletion request)
6. Brain evidence records reviewed and PII removed within 7 days
7. Participant receives confirmation of completion

### 8.5 Compensation Policy

| Role | Retainer (monthly) | Per Interview |
|------|--------------------|---------------|
| Design Partner (High) | $200 | $100 |
| Design Partner (Medium) | $150 | $75 |
| Design Partner (Low) | $100 | $50 |
| One-time interviewee | N/A | $50 |
| Prototype-only reviewer | N/A | $75 |

Compensation is paid via gift card, bank transfer, or charitable donation — participant's choice. Compensation does not require a signed NDA.

### 8.6 Conflict of Interest

- Design partners must not be current Perionyx employees, contractors, or investors
- Design partners must not be employed by a direct competitor (enterprise financial software: SAP, Oracle, NetSuite, QuickBooks, Xero, Bill.com, Tipalti)
- Design partners may be employed by integration partners (banks, ERPs, consultancies) — disclose the relationship and recuse from relevant decisions

---

## 9. Document Metadata

| Field | Value |
|-------|-------|
| Document ID | CVP_AP_v2.0 |
| Phase | 27.1 |
| Authority | Product Team |
| Supersedes | `docs/customer-intelligence/DESIGN_PARTNER_PIPELINE.md` |
| Validation Coverage | 14 hypotheses with plans, 10 workflow stages with goals, 7 candidates scored |
| Total Validation Budget | ~$8,800 (16-week cycle) |
| Total Design Partner Slots | 3 active (P0-P1) + 3 monitoring (P2) + 1 deferred (P3) |
| Status | Draft |
| Next Review | Week 4 (post first context interviews) |

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Foundation | [[ENTERPRISE_PRODUCT_SPECIFICATION_AP]] | Master spec this plan validates |
| Workflow | [[REFERENCE_WORKFLOW_AP]] | 7-stage workflow this plan validates per stage |
| Principles | [[PERIONYX_PRODUCT_PRINCIPLES]] | Principles this plan validates |
| Evidence | `brain/03-Customer Intelligence/` | Source data for all customer references |
| Implementation | `docs/customer-intelligence/DESIGN_PARTNER_PIPELINE.md` | Superseded — this document replaces |
| Authority | `docs/customer-intelligence/CUSTOMER_INTELLIGENCE_COMPLETION_REPORT.md` | CI platform completion report |
| Source | `brain/03-Customer Intelligence/VALIDATED_MARKET_THEMES.md` | Market theme definitions (T1-T8) |
| Source | `brain/03-Customer Intelligence/PRODUCT_EVIDENCE_MATRIX.md` | Evidence-to-claim mapping |

---

**Version History**

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0 | 2026-07-28 | Initial customer validation plan for AP Reference Workflow | Product Team |
