---
title: "Terminology Audit — Enterprise Product Specification v2.0"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1S
type: audit
domain: ap, product
author: Product Architecture Board
classification: Internal — Engineering & Product
---

# Terminology Audit — Enterprise Product Specification v2.0

## 1. Purpose

Eliminate all terminology inconsistencies across the 13 EPS documents. Every business term must have exactly one canonical definition used consistently across all documents. Any term with multiple definitions, ambiguous usage, or conflicting labels is flagged and resolved below.

## 2. Terminology Resolution Table

| # | Term | Inconsistency | Used In | Canonical Definition | Resolution |
|---|------|---------------|---------|---------------------|------------|
| T-01 | "Invoice Validated" vs "VALIDATED" | Stage 2 name vs Invoice State Machine state — same concept, different labels | REFERENCE_WORKFLOW_AP, WORKFLOW_STATE_MACHINE | **VALIDATED**: The state an invoice reaches after evidence collection (PO, GRN, contract, history) is complete and all required fields are verified. | Merge Stage 2 into "Validation & Match". Cross-reference: "Invoice enters VALIDATED state when evidence collection completes. See WORKFLOW_STATE_MACHINE §2." |
| T-02 | "Exception Queue" (Stage 4) vs "EXCEPTION" (state) | Same concept described as a stage AND a state machine state with different names | REFERENCE_WORKFLOW_AP, WORKFLOW_STATE_MACHINE | **EXCEPTION_RAISED**: The invoice state when a matching, validation, or policy discrepancy has been detected. The Exception Queue is the UI screen that displays invoices in EXCEPTION_RAISED state. | Remove "Exception Queue" as a workflow stage name. Rename Stage 4 to "Exception Resolution". Keep EXCEPTION_RAISED as the state machine state. Exception Queue is a UI term only. |
| T-03 | "Payment Readiness" (Stage 6) vs "PROPOSED" (Payment State) | Stage name uses product terminology, state machine uses technical terminology | REFERENCE_WORKFLOW_AP, WORKFLOW_STATE_MACHINE | **PROPOSED**: The payment state when invoices have been batched into a payment proposal awaiting treasury review. | Merge Stage 6+7 into "Treasury Review & Approval". Retain PROPOSED as the implementation-level state. Product documentation uses "Payment Proposal". Add cross-reference table. |
| T-04 | Persona count: 9 vs 10 | Master Spec lists 9 personas; EDP lists 10; User Journey Library uses different naming | ENTERPRISE_PRODUCT_SPECIFICATION_AP, EDP_27_1, USER_JOURNEY_LIBRARY | **10 canonical personas**: AP Clerk, AP Accountant, AP Manager, Controller, Treasury Manager, Procurement Manager, CFO, Approver, Auditor, Vendor. | Adopt EDP D-03 set (10 personas). Update Master Spec §11 from 9 to 10. Standardise names across all 13 documents. Add persona mapping table (product persona → technical persona → permission role). |
| T-05 | "AI Explains But Never Decides" has 3 phrasings | Three different formulations of the same principle appear across documents | AI_BEHAVIOUR_GUIDE, PRODUCT_PRINCIPLES | **Canonical**: "AI Explains But Never Decides". This is the single canonical statement of AI's boundary. P2 ("Automate Preparation, Not Decisions") and P3 ("Preserve Human Judgement") are supporting principles, not alternative phrasings. | Update PRODUCT_PRINCIPLES to reference the canonical statement. Add a "Canonical Statement" box at the top of AI_BEHAVIOUR_GUIDE. Remove alternative phrasings from cross-references. |
| T-06 | "AP Clerk" vs "AP Accountant" vs "AP Specialist" | Three different labels for the entry-level AP role | ENTERPRISE_PRODUCT_SPECIFICATION_AP, USER_JOURNEY_LIBRARY, BUSINESS_RULE_LIBRARY | **AP Clerk**: The canonical name for the entry-level role responsible for invoice receipt, data verification, and exception resolution. | Standardise to "AP Clerk" everywhere. "AP Accountant" is too senior (implies ability to post journals). "AP Specialist" is ambiguous. |
| T-07 | "Stage" vs "Phase" vs "Step" | Used interchangeably across documents to refer to workflow stages | REFERENCE_WORKFLOW_AP, ENTERPRISE_PRODUCT_SPECIFICATION_AP, INFORMATION_ARCHITECTURE | **Stage**: A user-visible milestone in the procure-to-pay workflow with a defined owner, entry criteria, decision point, and exit criteria. "Phase" and "Step" are not used for workflow decomposition. | Replace "Phase" and "Step" with "Stage" when referring to workflow decomposition. Reserve "Phase" for build phases (Phase 21B, Phase 21C). Reserve "Step" for UI wizards. |
| T-08 | "Exception" vs "Discrepancy" vs "Variance" | Used interchangeably for matching differences | REFERENCE_WORKFLOW_AP, BUSINESS_RULE_LIBRARY, AI_BEHAVIOUR_GUIDE | **Exception**: Any invoice that fails automated processing and requires human intervention. **Variance**: A specific line-level difference between invoice, PO, and GRN values. **Discrepancy**: Use "Exception" only. Variance is a sub-type. | Standardise: all human-intervention items are "Exceptions". Line-level differences are "Variances". Remove "Discrepancy" from workflow documentation (keep in AI context for duplicate detection). |
| T-09 | "Three-Way Match" vs "3-Way Match" vs "3WM" | Abbreviation inconsistency | REFERENCE_WORKFLOW_AP, BUSINESS_RULE_LIBRARY, AI_BEHAVIOUR_GUIDE | **Three-Way Match**: The full name. "3WM" is acceptable in technical documentation and diagrams only. | Standardise to "Three-Way Match" in all product documentation. Allow "3WM" in architecture documents. |
| T-10 | "Strict" vs "Mandatory" vs "Required" for field validation | Three different terms used for mandatory field states across IA and rule documents | INFORMATION_ARCHITECTURE, BUSINESS_RULE_LIBRARY | **Required**: A field that must have a value for the record to be saved. **Mandatory**: A field that must have a value for the workflow to proceed. "Strict" is not a validation level. | Use "Required" for schema-level constraints. Use "Mandatory" for workflow-level gates (e.g., "Mandatory evidence review before approval"). Remove "Strict" from validation terminology. |
| T-11 | "Approval Chain" vs "Approval Routing" vs "Approval Path" | Three terms for the same concept | REFERENCE_WORKFLOW_AP, USER_JOURNEY_LIBRARY, WORKFLOW_STATE_MACHINE | **Approval Routing**: The process of determining which approvers must act on an invoice. **Approval Chain**: The ordered list of approvers for a specific invoice. **Approval Path**: Deprecated — use "Approval Chain". | Standardise: "Approval Routing" for the system process. "Approval Chain" for the per-instance list. Remove "Approval Path". |
| T-12 | "GL Posting" vs "Journal Entry Creation" vs "General Ledger Posting" | Three names for Stage 9 activity | REFERENCE_WORKFLOW_AP, INFORMATION_ARCHITECTURE, USER_JOURNEY_LIBRARY | **GL Posting**: The system action of creating journal entries from paid invoices and posting to the general ledger. | Standardise to "GL Posting" in all documents. Merge Stage 9 into "Post-Payment Reconciliation" so the term appears in context, not as a standalone stage name. |
| T-13 | "Audit Trail" vs "Audit Log" vs "Audit Record" | Used interchangeably | REFERENCE_WORKFLOW_AP, WORKFLOW_STATE_MACHINE, AI_BEHAVIOUR_GUIDE | **Audit Trail**: The complete chronological sequence of all events for one entity. **Audit Record**: A single event entry. **Audit Log**: The database table storing audit records. | Standardise: "Audit Trail" for the user-facing view. "Audit Record" for the data model. "Audit Log" for the implementation table. |
| T-14 | "Evidence Panel" vs "Evidence Section" vs "Evidence Tab" | Used interchangeably in IA document | INFORMATION_ARCHITECTURE | **Evidence Panel**: The UI component that displays supporting information for a decision. | Standardise to "Evidence Panel" everywhere. "Evidence Tab" is a sub-component within an invoice detail. "Evidence Section" is deprecated. |
| T-15 | "Functional Currency" vs "Base Currency" vs "Company Currency" | Three terms for the same concept | REFERENCE_WORKFLOW_AP, BUSINESS_RULE_LIBRARY | **Functional Currency**: The currency in which the company maintains its financial records (ISO 4217). This is the Platform Constitution term (Canonical Financial Model). | Standardise to "Functional Currency" everywhere. Remove "Base Currency" and "Company Currency". |

## 3. Persona Reconciliation

### 3.1 Current State

| Source | Personas Listed | Count |
|--------|-----------------|-------|
| ENTERPRISE_PRODUCT_SPECIFICATION_AP §11 | AP Clerk, AP Manager, Controller, Treasury Manager, Procurement Manager, CFO, Approver, Auditor, Vendor | 9 |
| EDP_27_1 (D-03) | AP Accountant, Senior Accountant, Financial Controller, Finance Manager, Treasury, Approver, Procurement, Department Manager, Auditor, CFO | 10 |
| USER_JOURNEY_LIBRARY | AP Accountant, AP Supervisor, AP Manager, Controller, Treasury Manager, Procurement Manager, CFO, Department Approver, Auditor, Vendor | 10 (different names) |
| BUSINESS_RULE_LIBRARY | AP Accountant, Vendor, Approver, AP Manager, Controller, Treasury Manager, CFO | 7 (subset) |

### 3.2 Canonical Persona Set

Adopt the 10-persona set from EDP D-03 with standardised names:

| Canonical Name | Aliases | Role Description | Evidence |
|----------------|---------|-----------------|----------|
| **AP Clerk** | AP Accountant, AP Specialist | Entry-level role: invoice receipt, data verification, exception resolution | E1, T1, T2 |
| **AP Manager** | AP Supervisor, Senior AP Accountant | Supervises AP team, configures rules, reviews exceptions | E4, T1 |
| **Controller** | Financial Controller | Oversees financial close, GL integrity, audit readiness | E5 |
| **Treasury Manager** | Treasury, Finance Manager | Manages cash position, payment scheduling, bank relationships | E3 |
| **Procurement Manager** | Procurement | Manages POs and vendor relationships | E4 |
| **CFO** | Chief Financial Officer | Strategic financial oversight, high-value approval authority | Constitutional |
| **Approver** | Department Approver, Senior Accountant | Role-based invoice approval within authority limits | T1 |
| **Auditor** | — | Verifies audit trail compliance, reviews exceptions | Constitutional (VP4) |
| **Vendor** | Supplier | Submits invoices, receives payments, views status | Inferred (H-003) |
| **Department Manager** | Budget Owner | Approves department-level invoices, manages budget | [HYPOTHESIS] (E-01) |

Note: "Department Manager" remains [HYPOTHESIS] pending design partner validation (E-01, P0 gate).

### 3.3 Persona Consistency Check Results

| Document | Status | Action Required |
|----------|--------|-----------------|
| ENTERPRISE_PRODUCT_SPECIFICATION_AP | MISMATCH (9 personas) | Update §11 to 10 personas, add Department Manager |
| USER_JOURNEY_LIBRARY | MISMATCH (names) | Rename AP Accountant→AP Clerk, AP Supervisor→AP Manager, Department Approver→Department Manager |
| BUSINESS_RULE_LIBRARY | PARTIAL (subset only) | Add applicable personas for all rules (currently 7/10 covered, missing Treasury Manager, Procurement Manager, Department Manager references) |
| REFERENCE_WORKFLOW_AP | MISMATCH (Stage 6+7 owner) | Change Stage 6+7 owner to Treasury Manager (currently "Treasury Manager" on both — correct, but needs verification after merge) |
| WORKFLOW_STATE_MACHINE | CORRECT (system roles) | No change — state machines use system roles, not user personas |
| AI_BEHAVIOUR_GUIDE | PARTIAL | Update "AP Accountant" references to "AP Clerk" |
| SUCCESS_METRICS | PARTIAL | Verify persona-specific metrics reference correct canonical names |
| INFORMATION_ARCHITECTURE | PARTIAL | Update persona references in navigation model and screen descriptions |
| DESIGN_SYSTEM_GUIDE | CORRECT | Uses generic "user" — no persona-specific content |
| PRODUCT_PRINCIPLES | CORRECT | Principles apply to all personas equally |
| CUSTOMER_VALIDATION_PLAN | PARTIAL | Update persona references |
| OPEN_PRODUCT_HYPOTHESES | CORRECT | Uses EDP D-03 set |

## 4. Workflow Stage Terminology

### 4.1 Pre-Stabilisation

| Stage | Current Name | Owner | Problem |
|-------|-------------|-------|---------|
| 1 | Invoice Received | AP Clerk | Correct |
| 2 | Invoice Validated | System | No human interaction — not a real stage |
| 3 | Three-Way Match | System | No human interaction — not a real stage |
| 4 | Exception Queue | AP Clerk / AP Manager | "Queue" is a UI term, not a stage name |
| 5 | Approval Routing | Approver | Correct |
| 6 | Payment Readiness | Treasury Manager | Same owner as Stage 7 |
| 7 | Treasury Approval | Treasury Manager | Same owner as Stage 6 |
| 8 | Payment Execution | System + Treasury | Correct |
| 9 | GL Posting | System | No human interaction — not a real stage |
| 10 | Audit & Reconciliation | System + Controller | Audit is continuous, not terminal |

### 4.2 Post-Stabilisation

| Stage | Canonical Name | Owner | Merge Rationale |
|-------|---------------|-------|-----------------|
| 1 | Invoice Received | AP Clerk | Keep as-is |
| 2 | Validation & Match | System | Merged Stage 2+3 — single automated operation |
| 3 | Exception Resolution | AP Clerk / AP Manager | Renamed from "Exception Queue" — action-oriented |
| 4 | Approval Routing | Approver | Renumbered (was Stage 5) |
| 5 | Treasury Review & Approval | Treasury Manager | Merged Stage 6+7 — single Treasury operation |
| 6 | Payment Execution | System + Treasury | Renumbered (was Stage 8) |
| 7 | Post-Payment Reconciliation | System + Controller | Merged Stage 9+10 — single close activity |

## 5. Version Status Reconciliation

| Document | Current Version | Current Status | Corrected Version | Corrected Status |
|----------|----------------|----------------|-------------------|-------------------|
| ENTERPRISE_PRODUCT_SPECIFICATION_AP | v2.0 | active | v2.0 | active |
| REFERENCE_WORKFLOW_AP | v2.0 | active | v2.0 | active |
| BUSINESS_RULE_LIBRARY | v2.0 | active | v2.0 | active |
| USER_JOURNEY_LIBRARY | v2.0 | active | v2.0 | active |
| PRODUCT_PRINCIPLES | v2.0 | active | v2.0 | active |
| AI_BEHAVIOUR_GUIDE | v1.0 | active | v2.0 | active |
| INFORMATION_ARCHITECTURE | v1.0 | draft | v2.0 | active |
| DESIGN_SYSTEM_GUIDE | v1.0 | active | v2.0 | active |
| CUSTOMER_VALIDATION_PLAN | v1.0 | active | v2.0 | active |
| OPEN_PRODUCT_HYPOTHESES | v1.0 | active | v2.0 | active |
| SUCCESS_METRICS | v1.0 | active | v2.0 | active |
| WORKFLOW_STATE_MACHINE | v1.0 | draft | v2.0 | active |
| EDP_27_1 | v1.0 | active | v2.0 | active |

## 6. Cross-Reference Table: Stages ↔ State Machines ↔ Business Rules

| Workflow Stage | Primary State Machine | Entry State | Exit State | Core Business Rules |
|----------------|----------------------|-------------|------------|---------------------|
| 1. Invoice Received | Invoice | DRAFT | CAPTURED | BR-001, BR-003, BR-005, BR-008, BR-010 |
| 2. Validation & Match | Invoice | CAPTURED | MATCHED / EXCEPTION_RAISED | BR-013, BR-015, BR-022, BR-024 |
| 3. Exception Resolution | Exception | EXCEPTION_RAISED | RESOLVED / ESCALATED | BR-057, BR-058, BR-065 |
| 4. Approval Routing | Approval + Invoice | AWAITING_APPROVAL | APPROVED | BR-031, BR-032, BR-037, BR-039 |
| 5. Treasury Review & Approval | Payment | PROPOSED | APPROVED | BR-043, BR-048, BR-049 |
| 6. Payment Execution | Payment | APPROVED | PAID / FAILED | BR-050, BR-051, BR-052, BR-054 |
| 7. Post-Payment Reconciliation | Invoice + Payment | PAID | CLOSED / RECONCILED | BR-024, BR-054, BR-065 |

## 7. Acceptance

The terminology above is the canonical authority for all EPS documents. Any document that uses a term not matching this table must be corrected. All corrections are logged in PRODUCT_CHANGELOG.md.

---

*End of Terminology Audit — Phase 27.1S*
