---
title: "Business Rule Library — AP Reference Workflow v2.0"
created: 2026-07-28
phase: "27.1"
version: "2.0"
authority: Product Architecture Board
classification: Internal — Engineering & Product
tags: [product, ap, business-rules, validation, compliance]
---

# Business Rule Library — AP Reference Workflow v2.0

## 1. Purpose

This document defines the **65 business rules** that govern the Accounts Payable Reference Workflow. Every rule is traceable to customer evidence or explicitly marked as a **[HYPOTHESIS]**. Rules are organised by category and prioritised by severity.

### Rule Format

Each rule includes:

| Field | Description |
|-------|-------------|
| **ID** | Unique identifier (BR-XXX) |
| **Name** | Human-readable name |
| **Description** | What the rule enforces |
| **Category** | Invoice / Match / Approval / Payment / Exception / Audit |
| **Evidence Source** | Customer evidence or [HYPOTHESIS] |
| **Validation Plan** | How to verify the rule works |
| **Severity** | Critical / High / Medium / Low |
| **Applicable Personas** | Who is affected by or must comply with this rule |
| **Implementation** | Where in the workflow this rule is enforced |

### Customer Evidence Index

| ID | Source | Date | Type | Confidence |
|----|--------|------|------|------------|
| E1 | Adeel Aslam | 2026-07-21 | Discovery interview | High |
| E3 | Ayman Shawky | TBD | CRM feedback | Medium |
| E4 | Muhammed Jamsheed | TBD | CRM feedback | Medium |
| E7 | Phase 20.0 Validation | 2026-07-21 | Internal audit | High |
| T1 | Manual Approval Workflows Delay Payments | 2026-07-21 | Theme (4 sources) | High |
| T2 | Vendor Invoice Reconciliation Is Manual | 2026-07-21 | Theme (4 sources) | High |
| T5 | Month-End Close Is Universally Painful | 2026-07-21 | Theme (3 sources) | High |
| Constitution | Platform Constitution | 2026-07-21 | Internal standard | High |

---

## 2. Rule Categories Overview

| Category | Rules | Count | Severity Range |
|----------|-------|-------|---------------|
| Invoice Validation | BR-001 to BR-012 | 12 | Critical–Medium |
| Three-Way Match | BR-013 to BR-025 | 13 | Critical–Low |
| Approval | BR-026 to BR-042 | 17 | Critical–Medium |
| Payment | BR-043 to BR-055 | 13 | Critical–Medium |
| Exception | BR-056 to BR-065 | 10 | High–Low |

---

## 3. Invoice Validation Rules (BR-001 to BR-012)

### BR-001: Required Invoice Fields

| Field | Value |
|-------|-------|
| **ID** | BR-001 |
| **Name** | Required Invoice Fields |
| **Description** | Every invoice must have: vendor ID, invoice number, invoice date, total amount. Without these fields, the invoice cannot be processed. |
| **Category** | Invoice Validation |
| **Evidence** | E1 (Adeel Aslam): "vendor invoice reconciliations... require manual oversight to ensure accuracy" — completeness is prerequisite for accuracy. T2: manual reconciliation implies missing fields cause errors. |
| **Validation Plan** | Test with 10 invoices missing each required field; verify rejection with clear error message |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Accountant, Vendor |
| **Implementation** | J1 (Invoice Receipt) — enforced during capture/review |

---

### BR-002: Invoice Date Not >90 Days in Past

| Field | Value |
|-------|-------|
| **ID** | BR-002 |
| **Name** | Invoice Date Recency |
| **Description** | Invoice date must not be more than 90 days in the past. Invoices older than 90 days are flagged for Controller review before processing. |
| **Category** | Invoice Validation |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from standard AP policy that invoices beyond 90 days may indicate errors, disputes, or stale claims. Industry standard varies (60-120 days). |
| **Validation Plan** | Interview 3+ AP managers: "What is your policy for invoices older than 60/90/120 days?" |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, Controller |
| **Implementation** | J1 (Invoice Receipt) — flagged during validation |

---

### BR-003: Invoice Amount Must Be Positive

| Field | Value |
|-------|-------|
| **ID** | BR-003 |
| **Name** | Positive Amount |
| **Description** | Invoice total amount must be greater than zero. Zero-amount invoices are rejected. Negative amounts indicate credit notes and are handled by a separate entity type. |
| **Category** | Invoice Validation |
| **Evidence** | Constitution: "Every number is precise" — zero is not a valid invoice amount. Financial integrity requires non-zero amounts for invoices. |
| **Validation Plan** | Test with zero, negative, and positive amounts; verify correct routing |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J1 (Invoice Receipt) — enforced during capture |

---

### BR-004: Tax Calculation Must Match Jurisdiction

| Field | Value |
|-------|-------|
| **ID** | BR-004 |
| **Name** | Tax Jurisdiction Compliance |
| **Description** | Tax amount on invoice must match the applicable jurisdiction's tax rate. System calculates expected tax and flags variances > $1 or > 1%. |
| **Category** | Invoice Validation |
| **Evidence** | E1 (Adeel Aslam): "ensure accuracy" — tax accuracy is part of financial accuracy. Constitution: financial integrity is never compromised. |
| **Validation Plan** | Test with invoices from 5 different tax jurisdictions; verify correct calculation and flagging |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, Controller |
| **Implementation** | J2 (Invoice Review) — verified during policy check |

---

### BR-005: Duplicate Invoice Detection

| Field | Value |
|-------|-------|
| **ID** | BR-005 |
| **Name** | Duplicate Detection |
| **Description** | Flag as potential duplicate if same vendor + same amount + same date within 30-day window. System must not auto-reject; must present for human review. |
| **Category** | Invoice Validation |
| **Evidence** | E1 (Adeel Aslam): "vendor invoice reconciliations" — duplicate detection is part of reconciliation. T2: manual checks miss duplicates. Industry pattern: 30-day window is standard. |
| **Validation Plan** | Test with 20 pairs of invoices: 10 true duplicates, 10 near-misses; verify detection rate > 95% and false positive rate < 5% |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J1 (Invoice Receipt) — checked during capture; J4 (Exception) — if flagged |

---

### BR-006: Vendor Status Must Be Active

| Field | Value |
|-------|-------|
| **ID** | BR-006 |
| **Name** | Active Vendor Check |
| **Description** | Invoice from a vendor with INACTIVE or SUSPENDED status is blocked and routed to AP Manager for vendor status review. |
| **Category** | Invoice Validation |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from standard AP controls: payments to inactive vendors represent compliance risk. |
| **Validation Plan** | Interview 3+ AP managers: "Do you block invoices from inactive vendors? How do you handle them?" |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, AP Manager |
| **Implementation** | J1 (Invoice Receipt) — checked during vendor lookup |

---

### BR-007: Invoice Number Format Validation

| Field | Value |
|-------|-------|
| **ID** | BR-007 |
| **Name** | Invoice Number Format |
| **Description** | Invoice number must be non-empty, alphanumeric (with allowed special characters: hyphens, slashes, dots), and unique per vendor. Maximum 50 characters. |
| **Category** | Invoice Validation |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from data quality requirements. Invoice numbers are the primary vendor-side identifier. |
| **Validation Plan** | Test with 50 invoice number formats; verify correct acceptance/rejection |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J1 (Invoice Receipt) — validated during capture |

---

### BR-008: Currency Code Validation

| Field | Value |
|-------|-------|
| **ID** | BR-008 |
| **Name** | Valid Currency Code |
| **Description** | Invoice currency must be a valid ISO 4217 code. If currency differs from company's base currency, FX conversion rate must be applied at time of receipt. |
| **Category** | Invoice Validation |
| **Evidence** | Constitution: "Every number is precise" — currency precision requires valid codes. Industry standard: ISO 4217. |
| **Validation Plan** | Test with 10 valid currencies and 5 invalid codes; verify correct routing |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, Treasury Manager |
| **Implementation** | J1 (Invoice Receipt) — validated during capture |

---

### BR-009: Line Item Completeness

| Field | Value |
|-------|-------|
| **ID** | BR-009 |
| **Name** | Line Item Completeness |
| **Description** | Every invoice must have at least one line item with description, quantity, unit price, and line total. Line total must equal quantity × unit price (within rounding tolerance of $0.01). |
| **Category** | Invoice Validation |
| **Evidence** | E1 (Adeel Aslam): "ensure accuracy" — line item accuracy is fundamental. T2: manual reconciliation of line items is painful. |
| **Validation Plan** | Test with 20 invoices with various line item issues; verify detection and error messages |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J2 (Invoice Review) — verified during review |

---

### BR-010: Total Amount Reconciliation

| Field | Value |
|-------|-------|
| **ID** | BR-010 |
| **Name** | Total Must Match Line Items |
| **Description** | Invoice total must equal sum of line items + tax - discounts. Variance > $0.01 flagged for review. |
| **Category** | Invoice Validation |
| **Evidence** | Constitution: "Every number is precise" — Decimal(38,12) precision ensures accurate reconciliation. |
| **Validation Plan** | Test with 10 invoices with intentional rounding variances; verify correct flagging |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J2 (Invoice Review) — verified during review |

---

### BR-011: Duplicate Vendor Invoice Number

| Field | Value |
|-------|-------|
| **ID** | BR-011 |
| **Name** | Vendor Invoice Number Uniqueness |
| **Description** | Within the same vendor, invoice number must be unique. If a second invoice arrives with the same vendor + same invoice number, it is flagged as a duplicate regardless of amount or date. |
| **Category** | Invoice Validation |
| **Evidence** | E1 (Adeel Aslam): duplicate detection is part of "vendor invoice reconciliations". Industry standard: same invoice number from same vendor is always a duplicate. |
| **Validation Plan** | Test with same invoice number, different amounts; same invoice number, different dates; verify all are flagged |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J1 (Invoice Receipt) — checked during capture |

---

### BR-012: PO Reference Format Validation

| Field | Value |
|-------|-------|
| **ID** | BR-012 |
| **Name** | PO Reference Format |
| **Description** | If invoice references a PO, the PO number must match an existing PO in the system with status OPEN or PARTIALLY_RECEIVED. |
| **Category** | Invoice Validation |
| **Evidence** | T2: "Vendor Invoice Reconciliation Is Manual" — PO matching is central to reconciliation. E1: "require manual oversight" — automated PO validation reduces manual work. |
| **Validation Plan** | Test with valid PO, invalid PO, closed PO, and no PO; verify correct routing |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J1 (Invoice Receipt) — checked during capture |

---

## 4. Three-Way Match Rules (BR-013 to BR-025)

### BR-013: Price Tolerance

| Field | Value |
|-------|-------|
| **ID** | BR-013 |
| **Name** | Price Variance Tolerance |
| **Description** | Price variance between invoice and PO is auto-approved if within ±2% or ±$100 (whichever is lower). Variances outside tolerance are routed to exception queue. |
| **Category** | Three-Way Match |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Tolerances inferred from industry standards (2% is common in mid-market AP). Customer validation required: "What price variance do you tolerate without investigation?" |
| **Validation Plan** | Interview 3+ AP managers: "What price variance do you tolerate? Do you investigate variances under 2%? Under $100?" |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, AP Manager |
| **Implementation** | J3 (Three-Way Match) — applied during auto-match |

---

### BR-014: Quantity Tolerance

| Field | Value |
|-------|-------|
| **ID** | BR-014 |
| **Name** | Quantity Variance Tolerance |
| **Description** | Quantity variance between invoice and GRN is auto-approved if within ±1 unit or ±1% (whichever is lower). Variances outside tolerance are routed to exception queue. |
| **Category** | Three-Way Match |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Quantity tolerance inferred from industry patterns. Customer validation required: "What quantity discrepancy do you accept without investigation?" |
| **Validation Plan** | Interview 3+ AP managers: "What quantity variance do you tolerate? Do you investigate variances under 1%?" |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, AP Manager |
| **Implementation** | J3 (Three-Way Match) — applied during auto-match |

---

### BR-015: PO Line Item Mapping

| Field | Value |
|-------|-------|
| **ID** | BR-015 |
| **Name** | Mandatory PO Line Mapping |
| **Description** | Every invoice line item must map to a PO line item. Unmapped lines are exceptions. Partial PO line matches are allowed if quantity ≤ PO quantity. |
| **Category** | Three-Way Match |
| **Evidence** | T2: "Vendor Invoice Reconciliation Is Manual" — PO line mapping is the core of reconciliation. E1: manual oversight implies this is currently manual. |
| **Validation Plan** | Test with 20 invoices: 15 with complete mapping, 5 with unmapped lines; verify detection |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J3 (Three-Way Match) — enforced during match |

---

### BR-016: GRN Within 30 Days

| Field | Value |
|-------|-------|
| **ID** | BR-016 |
| **Name** | GRN Recency |
| **Description** | For PO-referenced invoices, a matching GRN must exist within 30 calendar days of the invoice date. Missing or stale GRNs are routed to exception queue. |
| **Category** | Three-Way Match |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. 30-day window is an industry standard. Customer validation: "How long after delivery do you expect GRN receipt?" |
| **Validation Plan** | Interview 3+ AP managers: "What is your GRN receipt window? Do you receive GRNs within 30 days?" |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, Warehouse |
| **Implementation** | J3 (Three-Way Match) — checked during match |

---

### BR-017: Service Invoice Two-Way Match

| Field | Value |
|-------|-------|
| **ID** | BR-017 |
| **Name** | Service Invoice Match (No GRN) |
| **Description** | Service invoices (identified by PO category = "Service") skip GRN check. Two-way match (invoice ↔ PO) only. Service completion certificate is required instead of GRN. |
| **Category** | Three-Way Match |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from standard AP practice: service invoices don't have physical goods receipts. |
| **Validation Plan** | Test with 10 service invoices; verify GRN check is skipped and service certificate check is applied |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J3 (Three-Way Match) — conditional logic based on PO category |

---

### BR-018: Multi-Currency Match

| Field | Value |
|-------|-------|
| **ID** | BR-018 |
| **Name** | Multi-Currency Match Handling |
| **Description** | If invoice currency differs from PO currency, match is attempted using the exchange rate at PO creation date. If rate difference > 2%, route to Treasury for FX review. |
| **Category** | Three-Way Match |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from multi-currency AP requirements. Industry standard: PO exchange rate is reference point. |
| **Validation Plan** | Test with 5 multi-currency invoices at various rate differences; verify correct routing |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant, Treasury Manager |
| **Implementation** | J3 (Three-Way Match) — conditional on currency mismatch |

---

### BR-019: Partial GRN Match

| Field | Value |
|-------|-------|
| **ID** | BR-019 |
| **Name** | Partial Delivery Match |
| **Description** | If GRN shows partial delivery, invoice is matched against received quantity only. Remaining PO quantity is tracked. Partial match requires AP Manager approval. |
| **Category** | Three-Way Match |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from common procurement scenario: partial deliveries are standard. |
| **Validation Plan** | Test with 5 partial GRN scenarios; verify partial match and escalation |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, AP Manager |
| **Implementation** | J3 (Three-Way Match) — partial match path |

---

### BR-020: PO Amendment Match

| Field | Value |
|-------|-------|
| **ID** | BR-020 |
| **Name** | Amended PO Match |
| **Description** | If PO was amended after invoice date, match against the original PO terms (pre-amendment). Amendment history must be visible in match report. |
| **Category** | Three-Way Match |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from standard procurement practice: invoices reference PO at time of order. |
| **Validation Plan** | Test with 5 amended PO scenarios; verify correct original-vs-amended matching |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant, Procurement Manager |
| **Implementation** | J3 (Three-Way Match) — PO version lookup |

---

### BR-021: Multi-PO Invoice Split

| Field | Value |
|-------|-------|
| **ID** | BR-021 |
| **Name** | Multi-PO Invoice Split |
| **Description** | If a single invoice covers multiple POs, the system splits the match across POs. Each split is independently audited. All POs must be matched for the invoice to clear. |
| **Category** | Three-Way Match |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from common scenario: vendor consolidates multiple orders into one invoice. |
| **Validation Plan** | Test with 5 multi-PO invoices; verify correct split and audit trail |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J3 (Three-Way Match) — multi-PO split path |

---

### BR-022: Match Confidence Score

| Field | Value |
|-------|-------|
| **ID** | BR-022 |
| **Name** | Match Confidence Scoring |
| **Description** | Every match attempt generates a confidence score (0-100). Score < 80 requires AP Accountant review. Score < 50 requires AP Manager review. Score is displayed in match report. |
| **Category** | Three-Way Match |
| **Evidence** | E3 (Ayman Shawky): "Need for confidence scoring" — directly supports confidence scoring on match results. |
| **Validation Plan** | Test with 20 matches at various confidence levels; verify correct routing by threshold |
| **Severity** | **High** |
| **Applicable Personas** | AP Accountant, AP Manager |
| **Implementation** | J3 (Three-Way Match) — generated during match; J6 (Approval) — displayed in evidence package |

---

### BR-023: PO Price History Check

| Field | Value |
|-------|-------|
| **ID** | BR-023 |
| **Name** | PO Price History |
| **Description** | When match detects price variance, system shows PO price history (was price changed? when? by whom?). This provides context for exception resolution. |
| **Category** | Three-Way Match |
| **Evidence** | E4 (Muhammed Jamsheed): "Inventory reconciliation still depends heavily on spreadsheets" — price history lookup is exactly the kind of reconciliation that should be automated. |
| **Validation Plan** | Test with 5 POs with price change history; verify history is displayed correctly |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant, Procurement Manager |
| **Implementation** | J3 (Three-Way Match) — context in match report; J4 (Exception) — context in resolution |

---

### BR-024: Match Audit Trail

| Field | Value |
|-------|-------|
| **ID** | BR-024 |
| **Name** | Complete Match Audit |
| **Description** | Every match attempt (successful or not) generates an audit record with: invoice ID, PO ID, GRN ID, price variance, quantity variance, confidence score, outcome, timestamp, and actor. |
| **Category** | Three-Way Match |
| **Evidence** | Constitution: "Every action is auditable." T2: "manual oversight" implies audit trail is currently incomplete. |
| **Validation Plan** | Verify every match in test suite generates complete audit record; verify no orphaned match results |
| **Severity** | **Critical** |
| **Applicable Personas** | Auditor, AP Accountant |
| **Implementation** | J3 (Three-Way Match) — audit record on every attempt |

---

### BR-025: Match Timeout

| Field | Value |
|-------|-------|
| **ID** | BR-025 |
| **Name** | Match Processing Timeout |
| **Description** | If match processing exceeds 30 seconds (e.g., PO lookup slow), the system must not silently fail. Must log timeout, notify AP Accountant, and queue for retry. |
| **Category** | Three-Way Match |
| **Evidence** | Constitution: "Failure is expected" — every stage has defined recovery paths. System must handle performance degradation gracefully. |
| **Validation Plan** | Simulate slow PO lookup; verify timeout handling and retry |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J3 (Three-Way Match) — timeout guard |

---

## 5. Approval Rules (BR-026 to BR-042)

### BR-026: Self-Approval Threshold

| Field | Value |
|-------|-------|
| **ID** | BR-026 |
| **Name** | AP Accountant Self-Approval |
| **Description** | Invoices < $1,000 can be self-approved by the AP Accountant who processed them. Self-approval is logged but does not require a second approver. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. $1,000 threshold is a common starting point for AP self-approval. Customer validation required: "What threshold do you allow AP clerks to self-approve?" |
| **Validation Plan** | Interview 3+ AP managers: "What is your self-approval threshold? Should AP clerks approve their own invoices?" |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant |
| **Implementation** | J6 (Approval Routing) — threshold check |

---

### BR-027: Supervisor Approval Threshold

| Field | Value |
|-------|-------|
| **ID** | BR-027 |
| **Name** | AP Supervisor Approval |
| **Description** | Invoices $1,000–$10,000 require AP Supervisor approval. Delegation: AP Manager if Supervisor unavailable. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Thresholds inferred from mid-market AP structure. Customer validation required: "What approval thresholds do you use?" |
| **Validation Plan** | Interview 3+ AP managers: "What approval thresholds do you use? Who approves at each level?" |
| **Severity** | **High** |
| **Applicable Personas** | AP Supervisor, AP Manager |
| **Implementation** | J6 (Approval Routing) — threshold routing |

---

### BR-028: Manager Approval Threshold

| Field | Value |
|-------|-------|
| **ID** | BR-028 |
| **Name** | AP Manager Approval |
| **Description** | Invoices $10,000–$50,000 require AP Manager approval. Delegation: Controller if Manager unavailable. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — same as BR-027. Thresholds are a package — validated together. |
| **Validation Plan** | Same as BR-027 |
| **Severity** | **High** |
| **Applicable Personas** | AP Manager, Controller |
| **Implementation** | J6 (Approval Routing) — threshold routing |

---

### BR-029: Controller Approval Threshold

| Field | Value |
|-------|-------|
| **ID** | BR-029 |
| **Name** | Controller Approval |
| **Description** | Invoices $50,000–$250,000 require Controller approval. Delegation: CFO if Controller unavailable. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — same as BR-027. |
| **Validation Plan** | Same as BR-027 |
| **Severity** | **High** |
| **Applicable Personas** | Controller, CFO |
| **Implementation** | J6 (Approval Routing) — threshold routing |

---

### BR-030: CFO Approval Threshold

| Field | Value |
|-------|-------|
| **ID** | BR-030 |
| **Name** | CFO Approval |
| **Description** | Invoices > $250,000 require CFO approval. No delegation — CFO must approve directly or board-level exception. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — same as BR-027. CFO threshold is the highest approval level. |
| **Validation Plan** | Same as BR-027 |
| **Severity** | **Critical** |
| **Applicable Personas** | CFO |
| **Implementation** | J6 (Approval Routing) — threshold routing |

---

### BR-031: SoD — PO Creator ≠ Invoice Approver

| Field | Value |
|-------|-------|
| **ID** | BR-031 |
| **Name** | Segregation of Duties — PO Creator |
| **Description** | The person who created the PO cannot approve the invoice against that PO. System must check and reject if SoD violated. |
| **Category** | Approval |
| **Evidence** | Constitution: "Every action is auditable" / "Zero Trust is the default." SoD is a fundamental financial control. Industry standard: no single person should both order and approve payment. |
| **Validation Plan** | Test with same user as PO creator and approver; verify rejection |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Accountant, Auditor |
| **Implementation** | J6 (Approval Routing) — SoD check before approval |

---

### BR-032: SoD — Invoice Approver ≠ Payment Releaser

| Field | Value |
|-------|-------|
| **ID** | BR-032 |
| **Name** | Segregation of Duties — Payment |
| **Description** | The person who approved the invoice cannot release the payment. System must check and reject if SoD violated. |
| **Category** | Approval |
| **Evidence** | Constitution: "Zero Trust is the default." Industry standard: approval and payment must be separated. |
| **Validation Plan** | Test with same user as approver and payment releaser; verify rejection |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Manager, Treasury Manager |
| **Implementation** | J8 (Payment Release) — SoD check before execution |

---

### BR-033: SoD — Vendor Creator ≠ Invoice Approver

| Field | Value |
|-------|-------|
| **ID** | BR-033 |
| **Name** | Segregation of Duties — Vendor |
| **Description** | The person who created the vendor record cannot approve invoices from that vendor. System must check and reject if SoD violated. |
| **Category** | Approval |
| **Evidence** | Constitution: "Zero Trust is the default." Industry standard: vendor creation and invoice approval must be separated to prevent fraud. |
| **Validation Plan** | Test with same user as vendor creator and approver; verify rejection |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Accountant, Auditor |
| **Implementation** | J6 (Approval Routing) — SoD check |

---

### BR-034: SoD — Approver Cannot Approve Own Department Exception

| Field | Value |
|-------|-------|
| **ID** | BR-034 |
| **Name** | Segregation of Duties — Department |
| **Description** | If an exception was raised due to a policy violation in the approver's own department, the approver cannot resolve it. Must escalate to a different department's authority. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from audit best practices: self-approval of own exceptions defeats the purpose of controls. |
| **Validation Plan** | Interview 3+ controllers: "Can a department head approve exceptions for their own department?" |
| **Severity** | **High** |
| **Applicable Personas** | Approver, Controller |
| **Implementation** | J4 (Exception Resolution) — SoD check during resolution |

---

### BR-035: SLA — Approval Turnaround

| Field | Value |
|-------|-------|
| **ID** | BR-035 |
| **Name** | Approval SLA |
| **Description** | Approval SLA: < $10K = 4 hours; $10K-$50K = 8 hours; $50K-$250K = 24 hours; > $250K = 48 hours. SLA breach triggers auto-escalation to delegate. |
| **Category** | Approval |
| **Evidence** | T1: "Manual Approval Workflows Delay Payments" (4 sources) — SLA enforcement directly addresses this pain point. E1: approval bottlenecks are a core problem. |
| **Validation Plan** | Simulate SLA breaches at each threshold; verify auto-escalation fires correctly |
| **Severity** | **High** |
| **Applicable Personas** | Approver, AP Manager |
| **Implementation** | J6 (Approval Routing) — SLA monitoring |

---

### BR-036: Delegation Chain

| Field | Value |
|-------|-------|
| **ID** | BR-036 |
| **Name** | Delegation Chain |
| **Description** | Each approver must have a registered delegate. If primary approver is on leave or SLA-breached, the system automatically routes to delegate. Delegation must be pre-registered and time-bounded. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Industry pattern: delegation chains prevent approval bottlenecks. Customer validation required: "How do you handle approvals when someone is on leave?" |
| **Validation Plan** | Interview 3+ AP managers: "Do you have delegation chains? How do you handle approvals during leave?" |
| **Severity** | **High** |
| **Applicable Personas** | Approver, AP Manager |
| **Implementation** | J6 (Approval Routing) — delegation logic |

---

### BR-037: Approval Evidence Requirement

| Field | Value |
|-------|-------|
| **ID** | BR-037 |
| **Name** | Evidence Before Approval |
| **Description** | Approver must view the evidence package (invoice + PO + GRN + match report) before the approve/reject action is enabled. System tracks evidence view timestamp. |
| **Category** | Approval |
| **Evidence** | E1 (Adeel Aslam): "manual oversight to ensure accuracy" — oversight requires seeing evidence. Constitution: "Every action is auditable" — evidence view is part of audit trail. |
| **Validation Plan** | Test with approver who tries to approve without viewing evidence; verify rejection |
| **Severity** | **Critical** |
| **Applicable Personas** | Approver |
| **Implementation** | J6 (Approval Routing) — evidence view gate |

---

### BR-038: Rejection Reason Required

| Field | Value |
|-------|-------|
| **ID** | BR-038 |
| **Name** | Rejection Must Have Reason |
| **Description** | Any rejection or escalation must include a free-text reason (minimum 10 characters). Reason is recorded in audit trail and visible to AP Accountant. |
| **Category** | Approval |
| **Evidence** | Constitution: "Every action is auditable" — rejections without reasons are audit gaps. E1: "manual oversight" implies explanations are needed. |
| **Validation Plan** | Test rejection without reason; verify system requires input |
| **Severity** | **High** |
| **Applicable Personas** | Approver, AP Accountant |
| **Implementation** | J6 (Approval Routing) — reason gate |

---

### BR-039: Approval Digital Signature

| Field | Value |
|-------|-------|
| **ID** | BR-039 |
| **Name** | Digital Signature on Approval |
| **Description** | Every approval records a digital signature: user ID, timestamp, IP address, and evidence package hash. Signature is immutable. |
| **Category** | Approval |
| **Evidence** | Constitution: "Tamper-evident design" — digital signatures are the mechanism. J9 (Audit) requires verifiable approvals. |
| **Validation Plan** | Verify all approvals in test suite have complete signature data; verify signature cannot be modified |
| **Severity** | **Critical** |
| **Applicable Personas** | Approver, Auditor |
| **Implementation** | J6 (Approval Routing) — signature capture |

---

### BR-040: Bulk Approval Limit

| Field | Value |
|-------|-------|
| **ID** | BR-040 |
| **Name** | Bulk Approval Cap |
| **Description** | Approver can approve up to 10 invoices in a single bulk action. Bulk approvals > 10 require individual confirmation for each. Prevents rubber-stamping. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from audit concern: bulk approvals without review undermine controls. |
| **Validation Plan** | Interview 3+ controllers: "Do you limit bulk approvals? Should approvers confirm each invoice individually?" |
| **Severity** | **Medium** |
| **Applicable Personas** | Approver, Auditor |
| **Implementation** | J6 (Approval Routing) — bulk action guard |

---

### BR-041: Approval Timeout Void

| Field | Value |
|-------|-------|
| **ID** | BR-041 |
| **Name** | Approval Timeout |
| **Description** | If an invoice remains in approval queue > 30 days without decision, it is automatically voided. System notifies AP Manager and Controller before voiding. |
| **Category** | Approval |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. 30-day timeout is a reasonable default. Customer validation: "How long do you let invoices sit in approval?" |
| **Validation Plan** | Interview 3+ AP managers: "What happens to invoices that sit in approval for 30+ days?" |
| **Severity** | **Medium** |
| **Applicable Personas** | Approver, AP Manager |
| **Implementation** | J6 (Approval Routing) — timeout monitor |

---

### BR-042: Approval Notification Channels

| Field | Value |
|-------|-------|
| **ID** | BR-042 |
| **Name** | Multi-Channel Approval Notification |
| **Description** | Approval notifications must be sent via at least 2 channels: push notification + email. If approver has mobile app: push + in-app. Escalation notifications use all registered channels. |
| **Category** | Approval |
| **Evidence** | T1: "Manual Approval Workflows Delay Payments" — multi-channel notifications reduce delay. E1: "approval workflows... manual oversight" — notifications enable timely oversight. |
| **Validation Plan** | Test notification delivery across push, email, and in-app; verify escalation uses all channels |
| **Severity** | **High** |
| **Applicable Personas** | Approver |
| **Implementation** | J6 (Approval Routing) — notification dispatch |

---

## 6. Payment Rules (BR-043 to BR-055)

### BR-043: Treasury Approval Required

| Field | Value |
|-------|-------|
| **ID** | BR-043 |
| **Name** | Treasury Approval Gate |
| **Description** | No payment can be executed without Treasury Manager approval. Approval must include cash availability confirmation. |
| **Category** | Payment |
| **Evidence** | Constitution: "Financial integrity is never compromised" — treasury approval is a fundamental control. Industry standard: treasury controls all cash outflows. |
| **Validation Plan** | Test payment without Treasury approval; verify rejection |
| **Severity** | **Critical** |
| **Applicable Personas** | Treasury Manager, AP Manager |
| **Implementation** | J8 (Payment Release) — approval gate |

---

### BR-044: Duplicate Payment Check

| Field | Value |
|-------|-------|
| **ID** | BR-044 |
| **Name** | Duplicate Payment Prevention |
| **Description** | Before payment execution, system checks: same vendor + same invoice number + same amount within 60 days. If duplicate detected, payment is blocked and AP Manager notified. |
| **Category** | Payment |
| **Evidence** | E1 (Adeel Aslam): "vendor invoice reconciliations... require manual oversight" — duplicate payment prevention is critical oversight. Industry standard: duplicate payment is the #1 AP fraud risk. |
| **Validation Plan** | Test with 10 duplicate payment scenarios; verify 100% detection and blocking |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Manager, Treasury Manager |
| **Implementation** | J8 (Payment Release) — pre-execution check |

---

### BR-045: Payment Terms Default

| Field | Value |
|-------|-------|
| **ID** | BR-045 |
| **Name** | Default Payment Terms |
| **Description** | If no payment terms specified on PO or vendor record, default to Net 30. Payment terms are always displayed in the evidence package. |
| **Category** | Payment |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Net 30 is the most common default in mid-market AP. Customer validation: "What are your standard payment terms?" |
| **Validation Plan** | Interview 3+ AP managers: "What are your standard payment terms? Do you default to Net 30?" |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Accountant, AP Manager |
| **Implementation** | J7 (Payment Readiness) — terms lookup |

---

### BR-046: Early-Pay Discount Capture

| Field | Value |
|-------|-------|
| **ID** | BR-046 |
| **Name** | Early-Pay Discount |
| **Description** | If vendor offers early-pay discount (e.g., 2/10 Net 30), system calculates potential savings and recommends payment within discount window if cash position allows. |
| **Category** | Payment |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. H13: "Early-Pay Discount Capture Is a Measurable Financial Benefit" — hypothesis not yet validated. Customer validation required. |
| **Validation Plan** | Interview 3+ AP managers: "Do your vendors offer early-pay discounts? What percentage do you capture?" |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Manager, Treasury Manager |
| **Implementation** | J7 (Payment Readiness) — discount analysis |

---

### BR-047: Dual Signature for Large Payments

| Field | Value |
|-------|-------|
| **ID** | BR-047 |
| **Name** | Dual Signature Threshold |
| **Description** | Payments > $50,000 require dual Treasury Manager signatures. First signature authorises; second signature confirms. Both are recorded in audit trail. |
| **Category** | Payment |
| **Evidence** | E6 (Industry pattern): dual-signature for large payments is standard treasury control. [HYPOTHESIS] on threshold amount ($50K). |
| **Validation Plan** | Interview 3+ Treasury managers: "What threshold requires dual signature? How do you implement dual control?" |
| **Severity** | **High** |
| **Applicable Personas** | Treasury Manager |
| **Implementation** | J8 (Payment Release) — dual signature gate |

---

### BR-048: Bank Account Verification

| Field | Value |
|-------|-------|
| **ID** | BR-048 |
| **Name** | Bank Account Validation |
| **Description** | Payment bank account must match vendor's registered bank details. Any change in bank details triggers a 48-hour hold and requires re-verification via phone callback. |
| **Category** | Payment |
| **Evidence** | Constitution: "Zero Trust is the default" — bank detail changes are high-risk. Industry standard: callback verification prevents BEC fraud. |
| **Validation Plan** | Test payment with changed bank details; verify hold and callback requirement |
| **Severity** | **Critical** |
| **Applicable Personas** | Treasury Manager, AP Manager |
| **Implementation** | J8 (Payment Release) — bank detail verification |

---

### BR-049: Payment Batch Integrity

| Field | Value |
|-------|-------|
| **ID** | BR-049 |
| **Name** | Batch Total Verification |
| **Description** | Payment batch total must equal sum of individual invoice amounts. Any rounding difference > $0.01 must be explained and logged. Batch cannot be submitted with unreconciled difference. |
| **Category** | Payment |
| **Evidence** | Constitution: "Every number is precise" — Decimal(38,12) precision. Batch integrity prevents orphaned payments. |
| **Validation Plan** | Test with 10 batches at various sizes; verify total reconciliation |
| **Severity** | **High** |
| **Applicable Personas** | AP Manager, Treasury Manager |
| **Implementation** | J7 (Payment Readiness) — batch validation |

---

### BR-050: Payment Execution Retry

| Field | Value |
|-------|-------|
| **ID** | BR-050 |
| **Name** | Payment Retry Logic |
| **Description** | Failed payments are retried 3 times with exponential backoff (30s, 2m, 10m). After 3 failures, payment is flagged for manual intervention. Vendor and AP Manager notified. |
| **Category** | Payment |
| **Evidence** | Constitution: "Failure is expected" — every stage has defined recovery paths. Retry logic is a standard recovery mechanism. |
| **Validation Plan** | Simulate bank API failures; verify retry count and escalation |
| **Severity** | **High** |
| **Applicable Personas** | Treasury Manager, AP Manager |
| **Implementation** | J8 (Payment Release) — retry handler |

---

### BR-051: Payment Status Tracking

| Field | Value |
|-------|-------|
| **ID** | BR-051 |
| **Name** | Real-Time Payment Status |
| **Description** | Payment status must be tracked in real-time from submission to bank confirmation. Status updates: SUBMITTED → PROCESSING → COMPLETED/FAILED. Vendor receives status update at each stage. |
| **Category** | Payment |
| **Evidence** | E3 (Ayman Shawky): "Need for instant view of cash positions" — real-time status is part of cash visibility. E5 (Eslam Sobhi): treasury feedback [CRM]. |
| **Validation Plan** | Test payment lifecycle; verify status updates at each stage |
| **Severity** | **High** |
| **Applicable Personas** | Treasury Manager, AP Manager, Vendor |
| **Implementation** | J8 (Payment Release) — status tracker |

---

### BR-052: Payment Void Process

| Field | Value |
|-------|-------|
| **ID** | BR-052 |
| **Name** | Payment Void Controls |
| **Description** | Voiding a payment requires: (1) reason documented, (2) Controller approval, (3) bank recall initiated (if possible), (4) original payment record preserved (not deleted). Void is irreversible. |
| **Category** | Payment |
| **Evidence** | Constitution: "Every action is auditable" — void is an action that must be fully documented. Financial integrity requires preserving the original payment record. |
| **Validation Plan** | Test void process; verify all 4 requirements met; verify original record preserved |
| **Severity** | **Critical** |
| **Applicable Personas** | Controller, Treasury Manager |
| **Implementation** | J8 (Payment Release) — void workflow |

---

### BR-053: FX Rate Lock

| Field | Value |
|-------|-------|
| **ID** | BR-053 |
| **Name** | Foreign Exchange Rate Lock |
| **Description** | For multi-currency payments, FX rate is locked at the time of Treasury approval (not payment execution). Rate lock duration: 24 hours. If execution exceeds lock, re-approval required at new rate. |
| **Category** | Payment |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from standard treasury practice: FX exposure must be managed. |
| **Validation Plan** | Interview 3+ Treasury managers: "How do you manage FX risk on international payments?" |
| **Severity** | **Medium** |
| **Applicable Personas** | Treasury Manager |
| **Implementation** | J8 (Payment Release) — FX lock mechanism |

---

### BR-054: Payment Audit Trail

| Field | Value |
|-------|-------|
| **ID** | BR-054 |
| **Name** | Complete Payment Audit |
| **Description** | Every payment generates audit records for: proposal creation, Treasury approval, bank submission, bank confirmation (or failure), vendor notification. All records are immutable and checksum-linked. |
| **Category** | Payment |
| **Evidence** | Constitution: "Every action is auditable" / "Tamper-evident design." J9 (Audit) requires complete payment trail. |
| **Validation Plan** | Verify every payment in test suite generates complete audit chain; verify checksum integrity |
| **Severity** | **Critical** |
| **Applicable Personas** | Auditor, Treasury Manager |
| **Implementation** | J8 (Payment Release) — audit records at each stage |

---

### BR-055: Payment Cut-Off Time

| Field | Value |
|-------|-------|
| **ID** | BR-055 |
| **Name** | Payment Cut-Off |
| **Description** | Payments submitted after bank cut-off time (typically 3:00 PM local) are scheduled for next business day. System displays expected execution date. Weekend/holiday submissions are queued. |
| **Category** | Payment |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from banking operational constraints. Cut-off times vary by bank. |
| **Validation Plan** | Interview 3+ Treasury managers: "What is your bank cut-off time? How do you handle late submissions?" |
| **Severity** | **Medium** |
| **Applicable Personas** | Treasury Manager, AP Manager |
| **Implementation** | J8 (Payment Release) — cut-off check |

---

## 7. Exception Rules (BR-056 to BR-065)

### BR-056: Auto-Escalation on SLA Breach

| Field | Value |
|-------|-------|
| **ID** | BR-056 |
| **Name** | Exception SLA Escalation |
| **Description** | Unresolved exceptions auto-escalate after: Critical = 4 hours; High = 24 hours; Medium = 72 hours; Low = 7 days. Escalation routes to next authority level. |
| **Category** | Exception |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. SLA thresholds inferred from industry patterns. E4 (Muhammed Jamsheed): "Intelligent discrepancy alerts would reduce manual work" — escalation is a form of intelligent alerting. |
| **Validation Plan** | Interview 3+ AP managers: "How long do exceptions sit before escalation? What thresholds work for you?" |
| **Severity** | **High** |
| **Applicable Personas** | AP Supervisor, AP Manager |
| **Implementation** | J4 (Exception Resolution) — SLA monitor |

---

### BR-057: Exception Categorisation

| Field | Value |
|-------|-------|
| **ID** | BR-057 |
| **Name** | Mandatory Exception Category |
| **Description** | Every exception must be assigned a category: PRICE_VARIANCE, QUANTITY_VARIANCE, DUPLICATE, MISSING_PO, MISSING_GRN, POLICY_VIOLATION, TAX_MISMATCH, CURRENCY_MISMATCH. Category determines resolution path. |
| **Category** | Exception |
| **Evidence** | E4 (Muhammed Jamsheed): "Intelligent discrepancy alerts" — categorisation enables intelligence. E7 (Phase 20.0): exception count shown as KPI but no action possible — categorisation is prerequisite for action. |
| **Validation Plan** | Test with 8 exception types; verify correct categorisation and resolution path routing |
| **Severity** | **High** |
| **Applicable Personas** | AP Supervisor |
| **Implementation** | J4 (Exception Resolution) — categorisation |

---

### BR-058: Exception Resolution Reason

| Field | Value |
|-------|-------|
| **ID** | BR-058 |
| **Name** | Resolution Must Have Reason |
| **Description** | Every exception resolution must include: resolution type (approve_override / reject / void / correct), reason (minimum 10 characters), and supporting evidence (document reference or communication log). |
| **Category** | Exception |
| **Evidence** | Constitution: "Every action is auditable" — resolutions without reasons are audit gaps. E1: "manual oversight" implies documented reasoning. |
| **Validation Plan** | Test resolution without reason; verify system requires input |
| **Severity** | **Critical** |
| **Applicable Personas** | AP Supervisor, Auditor |
| **Implementation** | J4 (Exception Resolution) — reason gate |

---

### BR-059: Exception Re-Open Limit

| Field | Value |
|-------|-------|
| **ID** | BR-059 |
| **Name** | Exception Re-Open Limit |
| **Description** | A resolved exception can be re-opened maximum 2 times. After 2 re-opens, it is escalated to Controller for final determination. Prevents infinite exception loops. |
| **Category** | Exception |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from process control: infinite loops indicate systemic issues requiring higher authority. |
| **Validation Plan** | Test with 3 re-open attempts; verify escalation after 2nd |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Supervisor, Controller |
| **Implementation** | J4 (Exception Resolution) — re-open counter |

---

### BR-060: Exception Vendor History

| Field | Value |
|-------|-------|
| **ID** | BR-060 |
| **Name** | Vendor Exception History |
| **Description** | When an exception is raised, system displays: vendor's exception rate (last 90 days), top exception types for this vendor, and whether this vendor has been flagged for review. |
| **Category** | Exception |
| **Evidence** | E4 (Muhammed Jamsheed): "Intelligent discrepancy alerts" — vendor history provides intelligence. T2: "manual oversight" — history lookup is currently manual. |
| **Validation Plan** | Test with 5 vendors at various exception rates; verify history display |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Supervisor |
| **Implementation** | J4 (Exception Resolution) — history context |

---

### BR-061: Exception Bulk Resolution

| Field | Value |
|-------|-------|
| **ID** | BR-061 |
| **Name** | Bulk Exception Resolution |
| **Description** | AP Supervisor can resolve multiple exceptions of the same category in bulk (up to 20). Each bulk resolution requires a single reason applied to all. Individual audit records created for each. |
| **Category** | Exception |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. Inferred from efficiency: AP Supervisors resolve similar exceptions in batches (e.g., 10 GRN delays from same shipment). |
| **Validation Plan** | Interview 3+ AP managers: "Do you resolve exceptions in bulk? How many at a time?" |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Supervisor |
| **Implementation** | J4 (Exception Resolution) — bulk action |

---

### BR-062: Exception Notification

| Field | Value |
|-------|-------|
| **ID** | BR-062 |
| **Name** | Exception Notifications |
| **Description** | New exception: notify assigned resolver (push + email). SLA warning (50% elapsed): notify resolver (push). SLA breach: notify resolver + manager (push + email). Resolution: notify AP Accountant (push). |
| **Category** | Exception |
| **Evidence** | T1: "Manual Approval Workflows Delay Payments" — notifications reduce delay across all workflow stages, including exceptions. |
| **Validation Plan** | Test all 4 notification triggers; verify correct recipients and channels |
| **Severity** | **High** |
| **Applicable Personas** | AP Supervisor, AP Manager, AP Accountant |
| **Implementation** | J4 (Exception Resolution) — notification dispatch |

---

### BR-063: Exception Reporting

| Field | Value |
|-------|-------|
| **ID** | BR-063 |
| **Name** | Exception Metrics |
| **Description** | System must track and display: exception count by category, average resolution time by category, SLA compliance %, exception rate by vendor, trend (vs. previous period). |
| **Category** | Exception |
| **Evidence** | E7 (Phase 20.0): exception count (51) shown as KPI — this is the starting point. Metrics must be actionable, not just visible. |
| **Validation Plan** | Verify all 5 metrics are calculated correctly from test data |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Manager, Controller |
| **Implementation** | J4 (Exception Resolution) — metrics dashboard |

---

### BR-064: Exception Vendor Flag

| Field | Value |
|-------|-------|
| **ID** | BR-064 |
| **Name** | Vendor Exception Flagging |
| **Description** | If a vendor's exception rate exceeds 20% over 90 days, the vendor is automatically flagged for review. Flagged vendors: all new invoices require AP Manager review before processing. |
| **Category** | Exception |
| **Evidence** | [HYPOTHESIS] — no direct customer evidence. 20% threshold is a starting point. Customer validation: "What exception rate triggers a vendor review for you?" |
| **Validation Plan** | Interview 3+ AP managers: "At what exception rate do you flag a vendor for review?" |
| **Severity** | **Medium** |
| **Applicable Personas** | AP Manager, Procurement Manager |
| **Implementation** | J4 (Exception Resolution) — vendor flagging |

---

### BR-065: Exception Audit Trail

| Field | Value |
|-------|-------|
| **ID** | BR-065 |
| **Name** | Exception Audit Trail |
| **Description** | Every exception generates audit records for: creation, investigation, resolution (or escalation), re-open (if applicable), and SLA metrics. All records are immutable and checksum-linked. |
| **Category** | Exception |
| **Evidence** | Constitution: "Every action is auditable." J9 (Audit) requires complete exception trail. |
| **Validation Plan** | Verify every exception in test suite generates complete audit chain |
| **Severity** | **Critical** |
| **Applicable Personas** | Auditor, AP Supervisor |
| **Implementation** | J4 (Exception Resolution) — audit records |

---

## 8. Rule Summary Matrix

### By Severity

| Severity | Rules | Count |
|----------|-------|-------|
| **Critical** | BR-001, BR-003, BR-005, BR-011, BR-015, BR-024, BR-031, BR-032, BR-033, BR-037, BR-039, BR-043, BR-044, BR-048, BR-052, BR-054, BR-058, BR-065 | **18** |
| **High** | BR-002, BR-004, BR-006, BR-008, BR-009, BR-010, BR-012, BR-013, BR-014, BR-016, BR-019, BR-022, BR-027, BR-028, BR-029, BR-034, BR-035, BR-036, BR-038, BR-042, BR-047, BR-049, BR-050, BR-051, BR-056, BR-057, BR-062 | **27** |
| **Medium** | BR-007, BR-017, BR-018, BR-020, BR-021, BR-023, BR-025, BR-026, BR-040, BR-041, BR-045, BR-046, BR-053, BR-055, BR-059, BR-060, BR-061, BR-063, BR-064 | **19** |
| **Low** | — | **0** |

### By Evidence Confidence

| Confidence | Rules | Count |
|------------|-------|-------|
| **High** (E1, T1, T2, T5, Constitution) | BR-001, BR-003, BR-004, BR-005, BR-009, BR-010, BR-011, BR-012, BR-015, BR-024, BR-031, BR-032, BR-033, BR-035, BR-037, BR-038, BR-039, BR-042, BR-043, BR-044, BR-048, BR-052, BR-054, BR-057, BR-058, BR-062, BR-063, BR-065 | **28** |
| **Medium** (E3, E4, E7) | BR-008, BR-022, BR-023, BR-051, BR-060, BR-064 | **6** |
| **Low** (E6, industry) | BR-047 | **1** |
| **[HYPOTHESIS]** (no evidence) | BR-002, BR-006, BR-007, BR-013, BR-014, BR-016, BR-017, BR-018, BR-019, BR-020, BR-021, BR-025, BR-026, BR-027, BR-028, BR-029, BR-030, BR-034, BR-036, BR-040, BR-041, BR-045, BR-046, BR-053, BR-055, BR-056, BR-059, BR-061 | **28** |

### Hypotheses Requiring Validation

| Rule | Hypothesis | Validation Method | Priority |
|------|-----------|-------------------|----------|
| BR-002 | 90-day past date limit | Interview 3+ AP managers | High |
| BR-006 | Block inactive vendor invoices | Interview 3+ AP managers | Medium |
| BR-013 | 2% / $100 price tolerance | Interview 3+ AP managers | High |
| BR-014 | 1 unit / 1% quantity tolerance | Interview 3+ AP managers | High |
| BR-016 | 30-day GRN window | Interview 3+ AP managers | High |
| BR-026 | $1,000 self-approval threshold | Interview 3+ AP managers | High |
| BR-027-030 | Approval threshold ladder | Interview 3+ controllers | High |
| BR-036 | Delegation chain requirement | Interview 3+ AP managers | High |
| BR-045 | Net 30 default terms | Interview 3+ AP managers | Medium |
| BR-046 | Early-pay discount capture | Interview 3+ AP managers | Medium |
| BR-056 | 4h/24h/72h/7d escalation SLAs | Interview 3+ AP managers | Medium |
| BR-064 | 20% vendor exception flag threshold | Interview 3+ AP managers | Low |

---

## 9. Rule Implementation Map

| Workflow Stage | Rules Enforced |
|---------------|---------------|
| J1 (Invoice Receipt) | BR-001, BR-002, BR-003, BR-005, BR-006, BR-007, BR-008, BR-011, BR-012 |
| J2 (Invoice Review) | BR-004, BR-009, BR-010 |
| J3 (Three-Way Match) | BR-013, BR-014, BR-015, BR-016, BR-017, BR-018, BR-019, BR-020, BR-021, BR-022, BR-023, BR-024, BR-025 |
| J4 (Exception Resolution) | BR-034, BR-056, BR-057, BR-058, BR-059, BR-060, BR-061, BR-062, BR-063, BR-064, BR-065 |
| J5 (Supporting Docs) | — (documentation rules are implicit in other rules) |
| J6 (Approval Routing) | BR-026, BR-027, BR-028, BR-029, BR-030, BR-031, BR-032, BR-033, BR-035, BR-036, BR-037, BR-038, BR-039, BR-040, BR-041, BR-042 |
| J7 (Payment Readiness) | BR-045, BR-046, BR-049 |
| J8 (Payment Release) | BR-043, BR-044, BR-047, BR-048, BR-050, BR-051, BR-052, BR-053, BR-054, BR-055 |
| J9 (Audit Review) | BR-024, BR-054, BR-065 (verification of all audit trails) |
| J10 (Month-End Close) | All rules verified as part of reconciliation |

---

## 10. Next Steps

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| 1 | Validate 28 [HYPOTHESIS] rules via interviews (12 interviews) | Product | Q3 2026 |
| 2 | Confirm approval threshold ladder with 3+ controllers | Product | Q3 2026 |
| 3 | Confirm tolerance thresholds (BR-013, BR-014) with 3+ AP managers | Product | Q3 2026 |
| 4 | Prototype BR-037 (evidence-before-approval gate) with 5 users | Design | Q3 2026 |
| 5 | Load test BR-044 (duplicate payment check) at scale | Engineering | Q4 2026 |

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | BUSINESS_RULE_LIBRARY_v2.0 |
| Phase | 27.1 |
| Author | Perionyx Product Architecture Board |
| Reviewers | Customer Advisory Board, Engineering Leads, Compliance |
| Status | Draft |
| Next Review | Phase 27.2 |
| Classification | Internal — Engineering & Product |
| Total Lines | ~700 |
| Rules Defined | 65 |
| Critical Rules | 18 |
| High Rules | 27 |
| Medium Rules | 19 |
| Hypotheses Flagged | 28 (43%) |
| Evidence-Backed | 37 (57%) |
