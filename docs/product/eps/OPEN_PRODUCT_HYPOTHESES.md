---
title: "Open Product Hypotheses — AP Reference Workflow v1.0"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1
tags:
  - type/reference
  - domain/product
  - domain/ap
  - domain/strategy
  - status/draft
owner: Product Team
authority: Phase 27.1
supersedes: "[[HYPOTHESIS_REGISTER]] (for AP scope)"
inherited_by: ["AR", "Treasury", "Financial Close"]
---

# Open Product Hypotheses — AP Reference Workflow v1.0

> **Classification**: Restricted — Internal Use Only
> **Status**: Draft — pending design partner validation
> **Authority**: Phase 27.1 — Customer Evidence → Product Specification

---

## 1. Purpose

This document is the **single register of every unvalidated product hypothesis** in the AP Reference Workflow. A hypothesis is any product decision, feature, or architectural assumption that lacks sufficient customer evidence. Every hypothesis has a structured definition, a validation plan, a risk assessment, and a decision gate that determines what happens downstream.

### Evidence Philosophy

| Principle | Application |
|-----------|-------------|
| Customer evidence is the highest authority | A hypothesis is not a fact until validated by 3+ independent customer sources |
| Hypotheses are not failures | Every product begins with assumptions. The goal is to validate them efficiently, not to avoid making them. |
| Hypotheses have a shelf life | An untested hypothesis is a risk. A hypothesis tested and invalidated is a success (we learned). A hypothesis tested and validated is a foundation. |
| Risk determines rigour | High-risk hypotheses (affecting architecture, API contracts, Prisma schema) require structured validation. Low-risk hypotheses (inferred from standard practice) can be validated inline during implementation. |

### How to Use This Document

| Role | Use Case |
|------|----------|
| **Product Manager** | Before prioritising a feature, check its hypothesis status. If Hypothesis, validate before committing. |
| **Engineer** | Before designing an API or schema, check if the feature depends on a hypothesis. If yes, design for replaceability. |
| **Designer** | Before investing in detailed UX, check if the workflow stage has open hypotheses. If yes, prototype at low fidelity first. |
| **Design Partner** | During interviews, reference the hypothesis register to focus validation on highest-risk assumptions. |
| **Investor / Advisor** | Review the register to understand what product decisions are evidence-based vs assumed. |

---

## 2. Hypothesis Register

### H-001: Multi-Currency Invoice Support

| Field | Value |
|-------|-------|
| **ID** | H-001 |
| **Hypothesis** | Finance professionals need a multi-currency invoice workflow that tracks original currency, functional currency, exchange rates, and FX gain/loss throughout the invoice lifecycle — not just multi-currency reporting. |
| **Risk Level** | **High** |
| **Evidence** | T7 (Hypothesis). Ayman Shawky (CRM): "multi-currency balance aggregation" — single source, indirect (reporting, not workflow). No customer has confirmed original-currency invoice processing is a pain point. |
| **Status** | Untested |
| **Assumptions** | (1) Organisations process invoices in currencies different from their functional currency. (2) Tracking original currency through the lifecycle is important (not just conversion at payment). (3) Exchange rate at invoice receipt time is the relevant rate (not payment time). (4) FX gain/loss tracking per invoice is valuable. |
| **Validation Approach** | Prototype review with Khaleel Ur Rehman (Saudi Arabia — cross-currency regional procurement) and Ahmed Orabi (Hikma Pharmaceuticals — multi-entity, likely multi-currency). Show multi-currency invoice creation with original currency + functional currency display. Measure understanding and perceived value. |
| **Success Criteria** | 2/2 design partners confirm: (a) they process invoices in currencies other than functional currency, (b) original currency tracking is essential, (c) functional currency conversion at invoice time is preferred over payment-only conversion, (d) FX gain/loss tracking per invoice would be useful. |
| **Risk Assessment** | If validated: All monetary fields must store `originalCurrency`, `originalAmount`, `functionalCurrency`, `functionalAmount`, `exchangeRate`, `rateSource`, `rateTimestamp`. Prisma schema addition ~15 fields across 6 tables. Architecture impact — significant. If invalidated: Multi-currency reporting only (no per-invoice tracking). Defer to post-v1. |
| **Priority** | P0 — Must validate before Phase 21B schema freeze |
| **Decision Gate** | H-001-GATE: Multi-currency Prisma schema. If Validated → add currency fields to Invoice, Payment, Vendor, Budget, Report aggregates. If Invalidated → single-currency schema, multi-currency reporting deferred to downstream aggregation. |
| **Interdependencies** | P10 (Multi-Currency Is First-Class), BR-007 (Currency Must Be Supported), H-012 (Regulatory compliance reporting — multi-currency compliance) |

---

### H-002: Batch Payment Proposals

| Field | Value |
|-------|-------|
| **ID** | H-002 |
| **Hypothesis** | AP teams prefer batch payment proposals (processed weekly/fortnightly) over individual invoice payment execution. Batching reduces cognitive load, improves cash flow planning, and enables discount optimisation. |
| **Risk Level** | **Medium** |
| **Evidence** | Adeel Aslam (2026-07-21): "approval workflow workflow exists, which often require manual oversight to ensure accuracy" — approval workflow is confirmed, but batch preference is weakly inferred. No customer has explicitly said "we batch payments." |
| **Status** | Untested |
| **Assumptions** | (1) AP teams process payments in cycles, not continuously. (2) Batch processing enables discount capture (early-pay). (3) Emergency individual payments are a secondary path. (4) Payment batch approval is a distinct workflow stage. |
| **Validation Approach** | Workflow discovery with Khaleel Ur Rehman (Finance Manager) and Ahmed Abdelmoneim (Treasury). Ask: "Walk me through how a payment goes from approved invoice to money leaving your bank account. How often do you process payments? How do you decide which invoices to pay now vs later?" |
| **Success Criteria** | 2/2 confirm: (a) they batch payments today (weekly/fortnightly cycle), (b) batch processing saves time over individual processing, (c) they need an emergency individual payment option for urgent items, (d) batch approval by Treasury is a distinct step. |
| **Risk Assessment** | If validated: PaymentProposal aggregate is P1. ProposalCreated / ProposalApproved / ProposalRejected / ProposalModified events. Batch-level approval routing. Treasury dashboard shows pending batches. If invalidated: Individual payment execution is the primary path. Batch is a grouping UI concept, not a domain entity. |
| **Priority** | P1 |
| **Decision Gate** | H-002-GATE: Payment service batch commands. If Validated → PaymentProposal with state machine, batch events, batch approval UI. If Invalidated → individual payment execution only. |
| **Interdependencies** | H-006 (Cash flow prediction), Stage 6 (Payment Readiness), Stage 7 (Treasury Approval) |

---

### H-003: Vendor Self-Service Portal

| Field | Value |
|-------|-------|
| **ID** | H-003 |
| **Hypothesis** | Vendors will use a self-service portal to submit invoices, check payment status, and update their information — reducing AP clerk workload from phone calls and email inquiries. |
| **Risk Level** | **Medium** |
| **Evidence** | No direct customer evidence. Industry pattern observed in Bill.com, Tipalti, Coupa. Adeel Aslam did not mention vendor portal. No CRM contact has requested vendor-facing functionality. |
| **Status** | Untested |
| **Assumptions** | (1) Vendors frequently call/email to check payment status. (2) AP clerks spend significant time responding to vendor inquiries. (3) Vendors are willing to use a portal instead of phone/email. (4) Vendor portal reduces AP clerk workload by 25%+. |
| **Validation Approach** | Prioritisation interview with Khaleel Ur Rehman, Ahmed Orabi, and Muhammed Jamsheed. Present 5 features (portal, OCR, batch payments, AI coding, compliance reports). Ask: "If you had 100 points to distribute across these 5 features, how would you allocate them?" Measure portal ranking. Follow up: "How many hours per week does your team spend answering vendor payment-status questions?" |
| **Success Criteria** | 2/3 confirm: (a) their vendors frequently ask about payment status, (b) they believe a portal would reduce AP clerk inquiries, (c) they would invest time in vendor onboarding for portal access. Portal is not invalidated simply because it ranks below other features — it may be P2 rather than P0. |
| **Risk Assessment** | If validated: Portal is P1 in Phase 21C. Vendor aggregate includes portal access fields, invitation workflow, portal activity audit trail. If invalidated: Portal is P3 deferred. Vendor communication remains email/phone. |
| **Priority** | P2 |
| **Decision Gate** | H-003-GATE: Vendor portal feature scope. If Validated → portal wireframes, portal API design, vendor-facing UX research. If Invalidated → no portal investment in v1. |
| **Interdependencies** | Stage 1 (Invoice Received — portal as intake channel), Stage 8 (Payment Execution — payment status visibility) |

---

### H-004: OCR for Paper Invoices

| Field | Value |
|-------|-------|
| **ID** | H-004 |
| **Hypothesis** | OCR invoice capture is a primary requirement for reducing manual data entry. Paper and scanned invoice volume justifies OCR investment. |
| **Risk Level** | **High** |
| **Evidence** | Muhammed Jamsheed (CRM): "automated reconciliation is highly desired" — automated reconciliation implies automated capture, but this is an inference. T2: manual reconciliation is painful (Working, 4 sources) — manual data entry is part of reconciliation pain, but entry volume is not quantified. No customer has quantified paper invoice volume. |
| **Status** | Untested |
| **Assumptions** | (1) Paper/scanned invoice volume exceeds 20% of total invoices in target market. (2) Manual data entry takes 10+ minutes per invoice. (3) OCR accuracy >= 95% is achievable and will be trusted. (4) Invoice formats are standardised enough for OCR. (5) Email-attachment invoices are also candidates for OCR-like extraction. |
| **Validation Approach** | Context interview with Ahmed Orabi (pharmaceutical — likely high paper volume from diverse suppliers) and Mohamed Gamal (construction — historically paper-heavy). Ask: "How do invoices arrive at your organisation? What percentage are paper? What percentage are PDF attachments? What percentage are EDI?" Follow up: "How long does it take to enter a typical invoice manually?" |
| **Success Criteria** | (a) Paper + scanned invoice volume >= 20% of total, OR manual data entry time >= 10 min/invoice. (b) Both respondents agree that automated capture would reduce errors. (c) Both respondents would trust OCR extraction with accuracy >= 95%. (d) Neither respondent has a fully automated capture solution today. |
| **Risk Assessment** | If validated: OCR integration is P0 in Phase 21B Stage 1. Requires AI service integration for document parsing, confidence scoring, human review queue. Vendor-neutral provider driver per Platform Constitution (Law 1). If invalidated: Manual entry with smart defaults (vendor lookup, PO autocomplete) is sufficient for v1. OCR deferred. |
| **Priority** | P0 |
| **Decision Gate** | H-004-GATE: OCR integration priority. If Validated → provision OCR provider driver, confidence-scored extraction UI, human review workflow. If Invalidated → manual capture with smart defaults. |
| **Interdependencies** | Stage 1 (Invoice Received), AI provider platform, Document platform |

---

### H-005: AI-Powered GL Coding

| Field | Value |
|-------|-------|
| **ID** | H-005 |
| **Hypothesis** | AI-suggested GL account codes reduce manual coding time and errors. Finance professionals will trust AI coding with confidence thresholds. |
| **Risk Level** | **Medium** |
| **Evidence** | T6: AI Trust is Working (2 sources: Ayman Shawky "confidence scoring", interest in ML-based predictions). HP1: AI Must Explain Itself (Hypothesis). No customer has explicitly validated AI GL coding. |
| **Status** | Untested |
| **Assumptions** | (1) Manual GL coding is time-consuming and error-prone. (2) AI can achieve >= 90% accuracy on GL coding for routine invoices. (3) Controllers are willing to review AI-suggested codes rather than selecting manually. (4) AI coding errors are easy to catch (obvious when wrong). (5) Explaining the coding reason ("this vendor is typically coded to 5120") increases trust. |
| **Validation Approach** | Prototype review with Ayman Shawky (confidence scoring interest), Ahmed Orabi (AP — coding complexity), and Eslam Sobhi (cost accounting — coding accuracy). Show: (a) invoice line items with AI-suggested GL codes and confidence percentages, (b) accept/suggested/manual options, (c) explanation link: "Why this code?". Measure: willingness to accept AI suggestions at various confidence levels. |
| **Success Criteria** | 2/3: (a) willing to accept AI suggestions at >= 90% confidence without review, (b) would review suggestions below 90% before accepting, (c) would NOT want auto-posting for any confidence level (human review always required), (d) explanation feature increases trust. |
| **Risk Assessment** | If validated: AI GL coding with confidence threshold is P1. Integration with AI platform. Evidence-reasoning UI component. Coding audit trail includes AI suggestion + human decision. If invalidated: Manual GL coding with search/autocomplete. Defer AI integration. |
| **Priority** | P1 |
| **Decision Gate** | H-005-GATE: AI coding feature architecture. If Validated → AI coding provider driver, confidence-threshold UI, explanation component, coding audit trail. If Invalidated → manual GL coding with smart search. |
| **Interdependencies** | Stage 2 (Invoice Validated), Stage 9 (GL Posting), AI platform, AI Behaviour Guide (transparency requirements) |

---

### H-006: Cash Flow Prediction

| Field | Value |
|-------|-------|
| **ID** | H-006 |
| **Hypothesis** | ML-based cash flow predictions from AP data would improve Treasury planning and decision-making. |
| **Risk Level** | **High** |
| **Evidence** | Ayman Shawky (CRM): "interest in ML-based cash flow predictions" — single CRM mention, not explored. T4: Real-time cash visibility is needed (Working, 2 sources: Ayman Shawky, Adeel Aslam "reporting is fairly well" — weak link to prediction). No customer has validated that they would trust or use ML predictions. |
| **Status** | Untested |
| **Assumptions** | (1) Treasury Managers currently forecast cash position manually using spreadsheets. (2) Manual forecasting takes 5+ hours/month. (3) ML predictions with confidence scores >= 70% would be trusted. (4) AP data (approved invoices, payment schedules) is a primary input to cash forecasting. (5) Prediction accuracy improves with more AP workflow adoption. |
| **Validation Approach** | Workflow discovery with Ahmed Abdelmoneim (Treasury) and Khaleel Ur Rehman (Finance Manager with cash flow responsibility). Ask: "How do you forecast cash position today? What data do you use? How long does it take? How accurate is it?" Then present concept: "What if Perionyx showed you a 30-day cash flow prediction based on approved invoices, payment schedules, and historical patterns?" |
| **Success Criteria** | 2/2: (a) currently forecast cash position manually, (b) spend 5+ hours/month on cash flow forecasting, (c) would trust ML predictions with confidence score >= 70%, (d) would adjust payment timing based on ML recommendations. |
| **Risk Assessment** | If validated: Cash flow prediction is P2 for Phase 21C (Intelligence). Requires ML model training from AP workflow data. Prediction dashboard component. If invalidated: Defer until post-v2. No ML investment in v1 product. |
| **Priority** | P1 |
| **Decision Gate** | H-006-GATE: Cash flow prediction feature. If Validated → prediction model service, cash forecast dashboard, recommendation engine. If Invalidated → no prediction feature in scope. |
| **Interdependencies** | Stage 6 (Payment Readiness — discount optimisation input), Stage 7 (Treasury Approval — cash availability verification), T4 (Real-time Cash Visibility) |

---

### H-007: Budget Check Integration

| Field | Value |
|-------|-------|
| **ID** | H-007 |
| **Hypothesis** | Invoice approval should check available budget before routing. Organisations want invoice-stage budget control in addition to PO-stage budget control. |
| **Risk Level** | **Medium** |
| **Evidence** | No direct customer evidence. Inferred from P7 (One Financial Truth) — if AP is the single source of truth, budget status should be visible at invoice stage. T3: ERP Silos (Validated, 3 sources) — budget is typically in ERP, not AP. |
| **Status** | Untested |
| **Assumptions** | (1) Organisations have budget controls at PO creation. (2) They do NOT have budget controls at invoice stage (invoice is matched to PO, so PO budget check is sufficient). (3) An additional invoice-stage budget check would surface budget overruns earlier. (4) Budget data integration is feasible (connect to ERP for budget data). |
| **Validation Approach** | Workflow discovery with Khaleel Ur Rehman and Ahmed Orabi. Ask: "Where do you track budgets? Do you check budget before approving an invoice? If your PO has budget but the department budget is exceeded, would you want to know before approving?" |
| **Success Criteria** | 2/2: (a) confirm their current system does NOT check budget at invoice stage, (b) confirm an invoice-stage budget warning would be valuable, (c) confirm they would not want invoice-stage budget to block approval (only warn). |
| **Risk Assessment** | If validated: Budget check integration is P2 for Phase 21D. BudgetWarning domain event. Budget service integration (ERP or internal). Warning UI on approval screen. If invalidated: No budget integration. PO budget check is sufficient. |
| **Priority** | P2 |
| **Decision Gate** | H-007-GATE: Budget integration feature. If Validated → budget check at Stage 5 (Approval). If Invalidated → no budget integration in scope. |
| **Interdependencies** | Stage 5 (Approval Routing), ERP Platform, Budget domain |

---

### H-008: Withholding Tax Automation

| Field | Value |
|-------|-------|
| **ID** | H-008 |
| **Hypothesis** | Withholding tax calculation and reporting should be automated in the AP workflow for MENA markets. |
| **Risk Level** | **Medium** |
| **Evidence** | No direct customer evidence. Regulatory knowledge: Saudi Arabia WHT: 5-20% (dividends, royalties, services). Egypt WHT: 20%. UAE: 0% WHT but 5% VAT. Zakat: 2.5% (Saudi). Corporate tax: 9% (UAE 2023+), 20% (Egypt), 20% (Saudi). T8: Regulatory Compliance (Hypothesis). |
| **Status** | Untested |
| **Assumptions** | (1) WHT is a manual process in target market organisations. (2) Automated WHT would save significant time during month-end and quarter-end. (3) WHT rates vary by vendor type, invoice category, and jurisdiction. (4) WHT reporting is required by tax authorities (frequency varies by country). (5) MENA market organisations consider WHT automation a factor in AP tool selection. |
| **Validation Approach** | Context interview with Khaleel Ur Rehman (Saudi Arabia) and Ahmed Orabi (Egypt, pharma). Ask: "How do you handle withholding tax on vendor payments? Is it automated or manual? How much time does it take to prepare WHT reports? Would automated WHT calculation be a factor in choosing an AP platform?" |
| **Success Criteria** | (a) 2/2 confirm WHT is a manual process today, (b) 2/2 confirm automated WHT would save time, (c) 1/2 confirms WHT automation would influence purchasing decision. |
| **Risk Assessment** | If validated: WHT automation is P2 for Phase 21D. WHT domain entity with configurable rates by vendor/category/jurisdiction. WHT report generation. Regulatory compliance module integration. If invalidated: Defer WHT automation. Manual WHT handling via GL coding. |
| **Priority** | P2 |
| **Decision Gate** | H-008-GATE: WHT automation feature. If Validated → WHT engine, rate configuration, report generation. If Invalidated → manual WHT via GL coding. |
| **Interdependencies** | Stage 7 (Treasury Approval — WHT impacts net payment), Stage 9 (GL Posting — WHT entries), H-012 (Regulatory compliance), T8 (Regulatory Compliance) |

---

### H-009: Partial Payment Support

| Field | Value |
|-------|-------|
| **ID** | H-009 |
| **Hypothesis** | AP teams need to pay a portion of an invoice while disputing, investigating, or delaying the remainder. Partial payment is a common requirement, not an edge case. |
| **Risk Level** | **Medium** |
| **Evidence** | Adeel Aslam (2026-07-21): "manual oversight to ensure accuracy" — weak inference that partial scenarios occur during manual oversight. T2: manual reconciliation is painful — partial payments add reconciliation complexity. No direct statement. |
| **Status** | Untested |
| **Assumptions** | (1) Partial payments occur routinely (not just exception cases). (2) Partial payment handling is manual and error-prone today. (3) Automated partial payment support would reduce reconciliation errors. (4) Partial payments require separate approval (not full invoice approval). (5) Open balance tracking is essential for partial payment scenarios. |
| **Validation Approach** | Workflow discovery with Ahmed Orabi (AP/P2P) and Khaleel Ur Rehman (Finance Manager). Ask: "Do you ever pay only part of an invoice? If so, walk me through that process. Who approves the partial payment? How do you track the remaining balance? How does this affect reconciliation?" |
| **Success Criteria** | 2/2: (a) confirm they have experience processing partial payments, (b) confirm partial payment handling is currently manual and error-prone, (c) confirm automated partial payment support would reduce errors. |
| **Risk Assessment** | If validated: Partial payment support is P2 for Phase 21D. Partially-paid invoice state. Open balance computation. Partial payment approval routing (amount-based threshold may differ from full invoice). If invalidated: Full-payment-only is sufficient for v1. |
| **Priority** | P2 |
| **Decision Gate** | H-009-GATE: Partial payment feature. If Validated → invoice state machine expanded for partial payment, open balance tracking, partial approval flow. If Invalidated → full-payment-only v1. |
| **Interdependencies** | Stage 8 (Payment Execution), Invoice state machine, Balance tracking |

---

### H-010: Vendor Credit Note Workflow

| Field | Value |
|-------|-------|
| **ID** | H-010 |
| **Hypothesis** | A structured vendor credit note workflow (receive → validate → apply → reconcile) is necessary for returns, corrections, and adjustments. |
| **Risk Level** | **Low** |
| **Evidence** | Standard accounting practice. Credit notes are a universal AP workflow component. No customer evidence collected because need is well-established. Debit notes and credit notes are standards in IFRS/GAAP. |
| **Status** | Untested |
| **Assumptions** | (1) Organisations process vendor credit notes at least monthly. (2) Credit notes are currently entered manually. (3) A structured credit note workflow would reduce errors. (4) Credit note matching against original invoice is valuable. (5) Credit notes can be applied to open invoices or issued as refunds. |
| **Validation Approach** | Validate inline during standard workflow discovery sessions. Add to interview protocol: "How do you handle vendor credit notes? Is the process different from regular invoices? How do you track credit notes against invoices?" |
| **Success Criteria** | 2/2 AP Managers confirm they process credit notes at least monthly and that a structured workflow would improve accuracy. |
| **Risk Assessment** | Low risk — proceed with standard implementation. Credit note flow mirrors invoice flow with mirrored impact. CreditNote aggregate, CreditNoteApplied event. Integration with invoice open balance. If invalidated (unlikely): Credit notes handled as negative invoices. |
| **Priority** | P3 |
| **Decision Gate** | H-010-GATE: Credit note workflow. Low risk — included in Phase 21B implementation plan unless invalidated. |
| **Interdependencies** | Stage 3 (Three-Way Match — matching against returns), Stage 9 (GL Posting — credit note journal entries) |

---

### H-011: Recurring Invoice Automation

| Field | Value |
|-------|-------|
| **ID** | H-011 |
| **Hypothesis** | Automated recurring invoice generation (rent, subscriptions, leases, service contracts) reduces manual data entry for repetitive invoices. |
| **Risk Level** | **Low** |
| **Evidence** | Standard accounting practice. Most organisations have recurring invoices. No customer evidence collected because need is well-established. |
| **Status** | Untested |
| **Assumptions** | (1) Organisations have regular recurring invoices (rent, lease, subscription, maintenance). (2) These invoices are currently entered manually each period. (3) Automated generation with review-before-send is preferred over fully automatic. (4) Recurring template management is acceptable overhead for automation gain. |
| **Validation Approach** | Validate inline during standard workflow discovery. Add to interview protocol: "What recurring invoices do you process? Rent? Leases? Subscriptions? How do you handle them currently — manual entry each time, or is there automation?" |
| **Success Criteria** | 2/2 AP Managers confirm they process recurring invoices and currently enter them manually each period. |
| **Risk Assessment** | Low risk — proceed with standard implementation. RecurringInvoiceDefinition aggregate. InvoiceGenerationScheduled event. GenerationService that creates invoices from template at schedule. If invalidated (unlikely): Manual entry with copy-from-previous. |
| **Priority** | P3 |
| **Decision Gate** | H-011-GATE: Recurring invoice feature. Low risk — included in Phase 21B or Phase 21C depending on implementation capacity. |
| **Interdependencies** | Stage 1 (Invoice Received — auto-generation), Automation Scheduler (cron-based generation) |

---

### H-012: Regulatory Compliance Reporting

| Field | Value |
|-------|-------|
| **ID** | H-012 |
| **Hypothesis** | AP teams need automated compliance reporting for local tax and regulatory requirements (VAT, WHT, Zakat, Corporate Tax, VAT returns, audit-ready AP reports). |
| **Risk Level** | **Medium** |
| **Evidence** | T8: Regulatory Compliance (Hypothesis). No direct customer evidence. Market context: Saudi Arabia Zakat (2.5%), VAT (15%), Corporate Tax (20% for oil/gas). Egypt VAT (14%), WHT (20%). UAE VAT (5%), Corporate Tax (9% from 2023). IFRS/GAAP audit requirements are universal. |
| **Status** | Untested |
| **Assumptions** | (1) Organisations spend 5+ hours/month on compliance reporting from AP data. (2) Compliance requirements vary significantly by jurisdiction. (3) Automated compliance report generation would save time and reduce errors. (4) Audit-ready AP reports are a purchasing factor for midsize organisations. |
| **Validation Approach** | Context interview with Khaleel Ur Rehman (Saudi Arabia), Ahmed Orabi (Egypt/pharma), and Ayman Shawky (multi-jurisdiction). Ask: "What compliance reports do you generate from AP data? How often? How long does it take? Is compliance reporting a factor in tool selection?" |
| **Success Criteria** | (a) 2/3 confirm they spend 5+ hours/month generating compliance reports from AP data, (b) 2/3 confirm report generation is manual/spreadsheet-based today, (c) 1/3 confirms compliance reporting would influence tool selection. |
| **Risk Assessment** | If validated: Compliance reporting module is P1 for Phase 21D. Report template configuration per jurisdiction. VAT return generation. WHT certificate generation. Audit-ready AP package (aging, payment history, exception log, approval log). If invalidated: Standard AP reporting (aging, volume, cycle times) without jurisdiction-specific compliance. |
| **Priority** | P1 |
| **Decision Gate** | H-012-GATE: Compliance reporting architecture. If Validated → compliance report templates, jurisdiction configuration, regulatory calculation engine. If Invalidated → standard AP reporting only. |
| **Interdependencies** | Stage 10 (Audit & Reconciliation), H-008 (Withholding tax automation), T8 (Regulatory Compliance), Platform Constitution (audit trail requirements) |

---

### H-013: Arabic-Language Interface

| Field | Value |
|-------|-------|
| **ID** | H-013 |
| **Hypothesis** | Arabic-language and RTL interface support significantly increases MENA market adoption and is a competitive differentiator in the region. |
| **Risk Level** | **Medium** |
| **Evidence** | HP3: Arabic-First Design (Hypothesis). CRM profiles include Saudi Arabia (Khaleel Ur Rehman, Muhammed Jamsheed) and Egypt (Ahmed Orabi, Ayman Shawky). No customer has been asked about language preference. Phase 8B.6 (next-intl, locale routing, ar.json) already invested — infrastructure exists but content is empty. |
| **Status** | Untested |
| **Assumptions** | (1) Arabic-speaking finance professionals prefer Arabic interfaces for finance software. (2) English-only interface is a barrier to adoption in Saudi and Egypt mid-market. (3) Arabic RTL support would be a competitive differentiator against SAP/Oracle (English-first) and a parity requirement against local competitors. (4) Translation investment (est. 2-4 weeks for AP module) is justified by adoption uplift. |
| **Validation Approach** | Prioritisation interview with Khaleel Ur Rehman (Saudi) and Ahmed Orabi (Egypt). Ask: "When you evaluate financial software, does Arabic language support affect your decision? How important is it compared to features, price, and support?" Also test: would Arabic interface alone justify choosing Perionyx over a competitor? |
| **Success Criteria** | 2/2 from Arabic-speaking countries: (a) rate Arabic support as "Important" or "Critical" in purchasing decision, (b) confirm English-only interface is not a blocker, (c) confirm Arabic would be a positive differentiator — not a requirement but a competitive advantage. |
| **Risk Assessment** | If validated: P1 investment in Arabic translation for AP workflow. ~2-4 weeks translation effort. RTL layout verification for all AP screens. Number formatting (Arabic-Indic digits optional). Date formatting (Islamic calendar optional). If invalidated: English-only for v1. Arabic content deferred. Existing i18n infrastructure maintained (no need to remove). |
| **Priority** | P1 |
| **Decision Gate** | H-013-GATE: Arabic translation investment. If Validated → Arabic content for AP module, RTL verification for AP screens. If Invalidated → English-only for v1. |
| **Interdependencies** | i18n infrastructure (Phase 8B.6 — already complete), RTL layout system, HP3 (Arabic-First Design) |

---

### H-014: ERP Bidirectional Sync

| Field | Value |
|-------|-------|
| **ID** | H-014 |
| **Hypothesis** | Perionyx must synchronise bidirectionally with existing ERPs (SAP, Oracle, Dynamics, Odoo) rather than replace them. Customers will not adopt a standalone AP system that requires manual data transfer. |
| **Risk Level** | **High** |
| **Evidence** | T3: ERP Silos (Validated, 3 sources): Ayman Shawky "Siloed systems create reconciliation overhead", Muhammed Jamsheed "ERP systems lack strong integration", Eslam Sobhi "Dynamics 365," Ahmed Abdelmoneim "Odoo." P8: ERP Bidirectional (Hypothesis). Four sources confirm ERP usage in target market. None have explicitly stated they need bidirectional sync. None have stated whether they would prefer Perionyx as standalone or integrated. |
| **Status** | Untested |
| **Assumptions** | (1) Target organisations will NOT replace their ERP with Perionyx in the next 2 years. (2) Target organisations WILL adopt Perionyx as a complementary AP system. (3) Integration must be bidirectional (AP → ERP for GL/PO/GRN, ERP → AP for vendor master/contracts). (4) One-way export (AP → ERP) is insufficient for adoption. (5) Sync latency up to 1 hour is acceptable for AP data. |
| **Validation Approach** | Prioritisation interview with all design partners. Present three integration options: (a) Perionyx as standalone AP with one-way export (CSV/API to ERP), (b) Perionyx with bidirectional sync (real-time or near-real-time), (c) Perionyx as ERP-replacement (migrate AP domain entirely). Forced trade-off ranking. Follow-up: "Would you adopt Perionyx if it required manual data transfer to your ERP?" |
| **Success Criteria** | (a) 3/4 rank bidirectional sync (b) above standalone (a) — validates integration-first approach. (b) 3/4 confirm their organisation will NOT replace their ERP with Perionyx in the next 2 years. (c) 2/4 confirm they would NOT adopt Perionyx with only one-way export. (d) 2/4 confirm sync latency up to 1 hour is acceptable. |
| **Risk Assessment** | If validated: Integration platform (per Platform Constitution, Phase 23.0) is P0 strategic investment. ERP provider drivers (SAP, Oracle, NetSuite, Dynamics, Odoo) are P1. Sync engine with conflict resolution. Bidirectional entity mapping. This is an architecture-level decision affecting all 15 platforms. If invalidated: One-way export is sufficient. Perionyx operates as standalone AP with export capability. Dramatically simpler architecture. |
| **Priority** | P0 |
| **Decision Gate** | H-014-GATE: Integration platform strategy. If Validated → strategic investment in bidirectional sync architecture, ERP provider drivers, conflict resolution. If Invalidated → one-way export, standalone AP positioning. |
| **Interdependencies** | Platform Constitution (Integration Platform, ERP Platform — 2 of 15 platforms), P7 (One Financial Truth — reconciliation with external systems), T3 (ERP Silos — the problem sync solves) |

---

## 3. Decision Gates

Each hypothesis unlocks a downstream decision. Gates are ordered by validation priority.

| Gate | Hypothesis | Decision | Trigger | Blocked Until |
|------|-----------|----------|---------|---------------|
| H-001-GATE | H-001 (Multi-currency) | Prisma schema: add original currency, exchange rate, FX fields to 6+ tables | 2/2 Khaleel + Ahmed O. validate | Validated |
| H-014-GATE | H-014 (ERP sync) | Integration platform architecture: bidirectional provider drivers vs one-way export | 3/4 design partners validate | Validated |
| H-004-GATE | H-004 (OCR) | OCR provider driver investment vs manual capture-first | 2/2 Ahmed O. + Mohamed validate | Validated |
| H-005-GATE | H-005 (AI coding) | AI coding feature architecture with confidence thresholds | 2/3 Ayman + Ahmed O. + Eslam validate | Validated |
| H-002-GATE | H-002 (Batch payments) | PaymentProposal aggregate and batch commands | 2/2 Khaleel + Ahmed A. validate | Validated |
| H-012-GATE | H-012 (Compliance reports) | Compliance report template architecture | 2/3 Khaleel + Ahmed O. + Ayman validate | Validated |
| H-013-GATE | H-013 (Arabic UI) | Arabic translation content investment | 2/2 Khaleel + Ahmed O. validate | Validated |
| H-006-GATE | H-006 (Cash prediction) | ML prediction model service investment | 2/2 Ahmed A. + Khaleel validate | Validated |
| H-007-GATE | H-007 (Budget check) | Budget integration service | 2/2 Khaleel + Ahmed O. validate | Validated |
| H-008-GATE | H-008 (WHT automation) | WHT calculation engine | 2/2 Khaleel + Ahmed O. validate | Validated |
| H-009-GATE | H-009 (Partial payment) | Partial payment state machine and open balance tracking | 2/2 Ahmed O. + Khaleel validate | Validated |
| H-003-GATE | H-003 (Vendor portal) | Portal wireframes and API design | 2/3 Khaleel + Ahmed O. + Muhammed validate | Validated |
| H-010-GATE | H-010 (Credit notes) | Credit note workflow implementation | Inline validation | Phase 21B |
| H-011-GATE | H-011 (Recurring invoices) | Recurring invoice automation implementation | Inline validation | Phase 21B |

---

## 4. Risk Matrix

### 4.1 5x5 Risk Matrix

Impact (rows) × Probability (columns). Risk score = Impact × Probability. Scores >= 12 are critical.

```
                    Probability
              Very Low  Low  Medium  High  Very High
                 1       2      3      4       5
     Critical   5 │   5     10     15     20      25
     High       4 │   4      8     12     16      20
IMP  Medium     3 │   3      6      9     12      15
     Low        2 │   2      4      6      8      10
     Very Low   1 │   1      2      3      4       5
```

### 4.2 Hypothesis Placement

| ID | Hypothesis | Impact | Probability | Score | Zone |
|----|-----------|--------|-------------|-------|------|
| H-001 | Multi-currency invoice support | 5 (Critical) | 3 (Medium) | **15** | ⚠ Red |
| H-014 | ERP bidirectional sync | 5 (Critical) | 3 (Medium) | **15** | ⚠ Red |
| H-004 | OCR for paper invoices | 4 (High) | 3 (Medium) | **12** | ⚠ Red |
| H-006 | Cash flow prediction | 3 (Medium) | 3 (Medium) | **9** | 🟡 Amber |
| H-005 | AI-powered GL coding | 4 (High) | 2 (Low) | **8** | 🟡 Amber |
| H-012 | Regulatory compliance reporting | 3 (Medium) | 3 (Medium) | **9** | 🟡 Amber |
| H-013 | Arabic-language interface | 3 (Medium) | 2 (Low) | **6** | 🟢 Green |
| H-002 | Batch payment proposals | 3 (Medium) | 2 (Low) | **6** | 🟢 Green |
| H-007 | Budget check integration | 2 (Low) | 3 (Medium) | **6** | 🟢 Green |
| H-008 | Withholding tax automation | 3 (Medium) | 2 (Low) | **6** | 🟢 Green |
| H-009 | Partial payment support | 2 (Low) | 2 (Low) | **4** | 🟢 Green |
| H-003 | Vendor self-service portal | 2 (Low) | 2 (Low) | **4** | 🟢 Green |
| H-010 | Vendor credit note workflow | 1 (Very Low) | 4 (High) | **4** | 🟢 Green |
| H-011 | Recurring invoice automation | 1 (Very Low) | 4 (High) | **4** | 🟢 Green |

### 4.3 Risk Zones

| Zone | Criteria | Hypotheses | Action |
|------|----------|------------|--------|
| ⚠ **Red** (Score >= 12) | Architecture-level impact, significant probability | H-001, H-014, H-004 | Must validate before Phase 21B implementation. Design for reversibility until validated. |
| 🟡 **Amber** (Score 7-11) | Feature-level impact, moderate probability | H-006, H-005, H-012 | Validate before Phase 21C (later implementation phase). Design as replaceable components. |
| 🟢 **Green** (Score <= 6) | Implementation-level impact, low probability | H-013, H-002, H-007, H-008, H-009, H-003, H-010, H-011 | Validate inline during implementation. Default assumption is Validated unless invalidated. |

### 4.4 Validation Sequencing by Risk Zone

| Phase | Zone | Hypotheses | Timeline | Method |
|-------|------|------------|----------|--------|
| Phase 21A (Weeks 1-4) | ⚠ Red | H-001, H-004, H-014 | W1-6 | Context interviews + prototype reviews |
| Phase 21B (Weeks 5-10) | 🟡 Amber | H-005, H-006, H-012 | W4-10 | Workflow discovery + prototype reviews |
| Phase 21B (Weeks 5-10) | 🟢 Green | H-002, H-003, H-007, H-008, H-009, H-013 | W4-10 | Inline in existing sessions |
| Phase 21C (Weeks 11-16) | 🟢 Green | H-010, H-011 | W8-16 | Inline in existing sessions |

---

## 5. Hypothesis Lifecycle

| Stage | Definition | Criteria | Action |
|-------|-----------|----------|--------|
| **Hypothesis** | No direct evidence. Assumption based on industry pattern or inference. | No customer source confirms or denies. | Track. Do not act on. Design for reversibility if low cost. |
| **Working** | 1-2 sources provide indirect or partial evidence. Not yet validated. | 1-2 sources at Moderate level or above. | Design with hypothesis in mind. Validate before architecture commitment. |
| **Validated** | 3+ independent sources confirm at Moderate level or above. Pattern confirmed across segments. | 3 sources at Moderate+ or 2 sources at Strong+. | Full confidence. Inform roadmap and architecture. |
| **Invalidated** | Sufficient evidence contradicts the hypothesis. | 2+ sources provide contradictory evidence at Moderate+ level. | Stop investment. Document learning. Consider alternative approach. |

### Current Status (Week 0)

| ID | Hypothesis | Status | Confidence | Next Action |
|----|-----------|--------|-----------|-------------|
| H-001 | Multi-currency invoice support | **Untested** | 0/5 | Schedule context interview |
| H-002 | Batch payment proposals | **Untested** | 0/5 | Schedule workflow discovery |
| H-003 | Vendor self-service portal | **Untested** | 0/5 | Schedule prioritisation interview |
| H-004 | OCR for paper invoices | **Untested** | 0/5 | Schedule context interview |
| H-005 | AI-powered GL coding | **Untested** | 0/5 | Build low-fi prototype |
| H-006 | Cash flow prediction | **Untested** | 0/5 | Schedule workflow discovery |
| H-007 | Budget check integration | **Untested** | 0/5 | Schedule workflow discovery |
| H-008 | Withholding tax automation | **Untested** | 0/5 | Schedule context interview |
| H-009 | Partial payment support | **Untested** | 0/5 | Schedule workflow discovery |
| H-010 | Vendor credit note workflow | **Untested** | 4/5 | Add to interview protocol |
| H-011 | Recurring invoice automation | **Untested** | 4/5 | Add to interview protocol |
| H-012 | Regulatory compliance reporting | **Untested** | 0/5 | Schedule context interview |
| H-013 | Arabic-language interface | **Untested** | 0/5 | Schedule prioritisation interview |
| H-014 | ERP bidirectional sync | **Untested** | 0/5 | Schedule prioritisation interview |

---

## 6. Document Metadata

| Field | Value |
|-------|-------|
| Document ID | OPH_AP_v1.0 |
| Phase | 27.1 |
| Authority | Product Team |
| Supersedes | `docs/product/HYPOTHESIS_REGISTER.md` (for AP scope) |
| Hypotheses Count | 14 |
| Untested | 14 |
| Validated | 0 |
| Invalidated | 0 |
| Red Zone (Risk >= 12) | 3 (H-001, H-004, H-014) |
| Amber Zone (Risk 7-11) | 3 (H-005, H-006, H-012) |
| Green Zone (Risk <= 6) | 8 (H-002, H-003, H-007, H-008, H-009, H-010, H-011, H-013) |
| Total Validation Budget | ~$8,800 (see [[CUSTOMER_VALIDATION_PLAN]]) |
| Status | Draft |
| Next Review | Week 4 (post first context interviews) |

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Foundation | [[ENTERPRISE_PRODUCT_SPECIFICATION_AP]] | Master spec containing these hypotheses |
| Workflow | [[REFERENCE_WORKFLOW_AP]] | 10-stage workflow these hypotheses affect |
| Validation | [[CUSTOMER_VALIDATION_PLAN]] | Detailed validation plans for each hypothesis |
| Principles | [[PERIONYX_PRODUCT_PRINCIPLES]] | Product principles this register inherits from |
| Evidence | `brain/03-Customer Intelligence/` | Source data for customer evidence references |
| Superseded | `docs/product/HYPOTHESIS_REGISTER.md` | Superseded for AP scope by this document |
| Risk | Platform Constitution | Constitutional constraints affecting hypothesis decisions |

---

**Version History**

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0 | 2026-07-28 | Initial hypothesis register for AP Reference Workflow — 14 hypotheses, 3 risk zones, 14 decision gates | Product Team |
