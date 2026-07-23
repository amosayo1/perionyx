# Phase 21A.0 — Accounts Payable Permission Matrix

> **Status**: Complete
> **Type**: Documentation-only — RBAC and authorization specification
> **Date**: July 21, 2026
> **Scope**: Every command, query, API route, and UI action in the AP domain with full permission mapping
> **Depends on**: AP_COMMAND_QUERY_MODEL.md, AP_DOMAIN_INVARIANTS.md, AP_STATE_MACHINES.md
> **Governed by**: Governance Constitution (Secure by Default, Tenant Isolation), IAM PermissionRegistry

---

## Overview

This document defines the complete authorization model for the Accounts Payable domain. Every command, query, API route, and UI action is mapped to a permission and a set of roles. The authorization model enforces:

1. **Secure by Default** — all access requires explicit permission; denied by default.
2. **Tenant Isolation** — every operation is scoped to `companyId`; cross-tenant access is blocked at the repository layer.
3. **Least Privilege** — each role receives only the permissions required for its function.
4. **Segregation of Duties** — no single individual can both initiate and approve the same financial transaction.
5. **Threshold Authority** — monetary amounts determine the minimum approval level required.
6. **Auditability** — every authorization decision is recorded in the audit trail.

### Permission Naming Convention

Permissions follow the pattern `{domain}.{action}`:

| Domain | Prefix | Scope |
|---|---|---|
| Vendor | `ap.vendors.` | Vendor master data lifecycle |
| Invoice | `ap.invoices.` | Invoice capture through payment |
| Match | `ap.match.` | Three-way match operations |
| Exception | `ap.exceptions.` | Exception queue management |
| Approval | `ap.approvals.` | Approval chain operations |
| Payment | `ap.payments.` | Payment proposal through execution |
| Reconciliation | `ap.reconciliation.` | Vendor statement reconciliation |
| Credit | `ap.credits.` | Credit note lifecycle |
| AP Admin | `ap.admin.` | AP configuration and settings |
| AP Reports | `ap.reports.` | AP analytics and reporting |

### Role Definitions

| Role ID | Role Name | Scope | Primary Function | Max Authority |
|---|---|---|---|---|
| `ap_clerk` | AP Clerk | Day-to-day operations | Invoice capture, exception resolution, matching, credits | $1,000 |
| `ap_manager` | AP Manager | Team oversight | Approvals, vendor management, proposals, exceptions | $100,000 |
| `controller` | Controller | Compliance & audit | Large approvals, SoD enforcement, voids, reversals | $500,000 |
| `treasury_manager` | Treasury Manager | Payment execution | Payment approval, batch execution, bank reconciliation | $1,000,000 |
| `procurement_manager` | Procurement Manager | Vendor/PO lifecycle | Vendor onboarding, PO management | $100,000 |
| `auditor` | Auditor | Read-only oversight | Audit trail review, control testing | Read-only |
| `budget_owner` | Budget Owner | Budget authority | Purchase request approval within budget | $50,000 |
| `system` | System | Automated operations | Auto-match, auto-escalate, auto-post, auto-resolve | Unlimited |

---

## Part 1: Permission Definitions

### 1.1 Vendor Commands

| Command | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| CreateVendor | `ap.vendors.create` | ✅ | ✅ | ❌ | ❌ | ✅ | 📖 | ❌ | ❌ |
| UpdateVendor | `ap.vendors.update` | 🔒¹ | 🔒² | ❌ | ❌ | ✅ | 📖 | ❌ | ❌ |
| ApproveVendor | `ap.vendors.approve` | ❌ | 🔒³ | 🔒⁴ | ❌ | ❌ | 📖 | ❌ | 🔒⁵ |
| RejectVendor | `ap.vendors.reject` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| SuspendVendor | `ap.vendors.suspend` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ReactivateVendor | `ap.vendors.reactivate` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| DeactivateVendor | `ap.vendors.deactivate` | ❌ | ❌ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| UpdateVendorBankDetails | `ap.vendors.update_bank` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |

### 1.2 Invoice Commands

| Command | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| ReceiveInvoice | `ap.invoices.create` | ✅ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | 🔒⁶ |
| UpdateInvoice | `ap.invoices.update` | 🔒⁷ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| DeleteInvoice | `ap.invoices.delete` | 🔒⁸ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ValidateInvoice | `ap.invoices.validate` | ✅ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| RunThreeWayMatch | `ap.match.execute` | ✅ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| OverrideMatchResult | `ap.match.override` | ❌ | 🔒⁹ | 🔒¹⁰ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ApproveInvoice | `ap.invoices.approve` | ❌ | 🔒¹¹ | 🔒¹² | 🔒¹³ | ❌ | 📖 | ❌ | 🔒¹⁴ |
| RejectInvoice | `ap.invoices.reject` | ❌ | 🔒¹¹ | 🔒¹² | 🔒¹³ | ❌ | 📖 | ❌ | ❌ |
| EscalateInvoice | `ap.invoices.escalate` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ✅ |
| ScheduleInvoiceForPayment | `ap.invoices.schedule_payment` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| BlockInvoice | `ap.invoices.block` | ❌ | 🔒¹⁵ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| UnblockInvoice | `ap.invoices.unblock` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| DisputeInvoice | `ap.invoices.dispute` | ✅ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ResolveDispute | `ap.invoices.dispute_resolve` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| VoidInvoice | `ap.invoices.void` | ❌ | ❌ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |

### 1.3 Exception Commands

| Command | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| CreateException | `ap.exceptions.create` | ✅ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| AssignException | `ap.exceptions.assign` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| ResolveException | `ap.exceptions.resolve` | 🔒¹⁶ | 🔒¹⁷ | 🔒¹⁸ | ❌ | ❌ | 📖 | ❌ | ❌ |
| EscalateException | `ap.exceptions.escalate` | ✅ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ✅ |
| AutoResolveException | `ap.exceptions.auto_resolve` | ❌ | ❌ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| BulkResolveExceptions | `ap.exceptions.bulk_resolve` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |

### 1.4 Approval Commands

| Command | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| RequestApproval | `ap.approvals.request` | ✅ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| GrantApproval | `ap.approvals.grant` | ❌ | 🔒¹¹ | 🔒¹² | 🔒¹³ | ❌ | 📖 | ❌ | 🔒¹⁴ |
| DenyApproval | `ap.approvals.deny` | ❌ | 🔒¹¹ | 🔒¹² | 🔒¹³ | ❌ | 📖 | ❌ | ❌ |
| DelegateApproval | `ap.approvals.delegate` | ❌ | 🔒¹⁹ | 🔒²⁰ | ❌ | ❌ | 📖 | ❌ | ✅ |
| EscalateApproval | `ap.approvals.escalate` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ✅ |
| RecallApproval | `ap.approvals.recall` | ❌ | ❌ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |

### 1.5 Payment Commands

| Command | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| GeneratePaymentProposal | `ap.payments.create_proposal` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| ReviewPaymentProposal | `ap.payments.review` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ApprovePaymentProposal | `ap.payments.approve` | ❌ | 🔒²¹ | 🔒²² | 🔒²³ | ❌ | 📖 | ❌ | ❌ |
| RejectPaymentProposal | `ap.payments.reject` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| CreatePaymentBatch | `ap.payments.create_batch` | ❌ | ❌ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| ExecutePayment | `ap.payments.execute` | ❌ | ❌ | ❌ | 🔒²⁴ | ❌ | 📖 | ❌ | ❌ |
| ConfirmPayment | `ap.payments.confirm` | ❌ | ❌ | ❌ | ✅ | ❌ | 📖 | ❌ | ✅ |
| ReversePayment | `ap.payments.reverse` | ❌ | ❌ | 🔒²⁵ | ❌ | ❌ | 📖 | ❌ | ❌ |
| CancelPayment | `ap.payments.cancel` | ❌ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ❌ |

### 1.6 Reconciliation Commands

| Command | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| ImportVendorStatement | `ap.reconciliation.import` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| RunReconciliation | `ap.reconciliation.execute` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ✅ |
| AdjustReconciliation | `ap.reconciliation.adjust` | 🔒²⁶ | 🔒²⁷ | 🔒²⁸ | ❌ | ❌ | 📖 | ❌ | ❌ |
| CompleteReconciliation | `ap.reconciliation.complete` | ❌ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |

### 1.7 Credit Commands

| Command | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| ReceiveCreditNote | `ap.credits.create` | ✅ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ApplyCreditNote | `ap.credits.apply` | ✅ | ✅ | ❌ | ❌ | ❌ | 📖 | ❌ | ❌ |
| VoidCreditNote | `ap.credits.void` | ❌ | ❌ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |

### 1.8 AP Admin Commands

| Command | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| ConfigureToleranceRules | `ap.admin.tolerance` | ❌ | ❌ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ConfigureApprovalMatrix | `ap.admin.approval_matrix` | ❌ | ❌ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ConfigurePaymentSchedule | `ap.admin.payment_schedule` | ❌ | ❌ | ✅ | ✅ | ❌ | 📖 | ❌ | ❌ |
| ConfigureAutoMatchRules | `ap.admin.auto_match` | ❌ | ❌ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |
| ConfigureDuplicateDetection | `ap.admin.duplicate_detection` | ❌ | ❌ | ✅ | ❌ | ❌ | 📖 | ❌ | ❌ |

### 1.9 AP Report Queries

| Query | Permission ID | AP Clerk | AP Manager | Controller | Treasury | Procurement | Auditor | Budget Owner | System |
|---|---|---|---|---|---|---|---|---|---|
| GetInvoiceDetails | `ap.reports.invoice_detail` | ✅ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetInvoiceList | `ap.reports.invoice_list` | ✅ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetVendorAging | `ap.reports.vendor_aging` | ✅ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetPaymentCalendar | `ap.reports.payment_calendar` | ✅ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetExceptionQueue | `ap.reports.exception_queue` | ✅ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ✅ |
| GetApprovalQueue | `ap.reports.approval_queue` | ✅ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetOutstandingLiabilities | `ap.reports.outstanding_liabilities` | ❌ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetDiscountAvailable | `ap.reports.discount_available` | ❌ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetCashRequirements | `ap.reports.cash_requirements` | ❌ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetVendorDetail | `ap.reports.vendor_detail` | ✅ | ✅ | ✅ | ❌ | ✅ | 📖 | ❌ | ✅ |
| GetVendorList | `ap.reports.vendor_list` | ✅ | ✅ | ✅ | ❌ | ✅ | 📖 | ❌ | ✅ |
| GetMatchDetails | `ap.reports.match_detail` | ✅ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ✅ |
| GetApprovalChain | `ap.reports.approval_chain` | ✅ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetPaymentHistory | `ap.reports.payment_history` | ❌ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetReconciliationStatus | `ap.reports.reconciliation_status` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ✅ |
| GetAuditTrail | `ap.reports.audit_trail` | ❌ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetAPAnalytics | `ap.reports.analytics` | ❌ | ✅ | ✅ | ✅ | ❌ | 📖 | ❌ | ✅ |
| GetDuplicateDetection | `ap.reports.duplicate_detection` | ❌ | ✅ | ✅ | ❌ | ❌ | 📖 | ❌ | ✅ |

### Legend

| Symbol | Meaning |
|---|---|
| ✅ | Can execute without conditions |
| ❌ | Cannot execute — 403 Forbidden returned |
| 🔒 | Can execute with documented conditions (see Part 2) |
| 📖 | Read-only access — can view data but not execute commands |

---

## Part 2: Conditional Permissions

Every 🔒 entry in Part 1 is documented here with its conditions, authority requirements, and SoD rules.

### 🔒¹ UpdateVendor (AP Clerk)

| Field | Detail |
|---|---|
| **Condition** | AP Clerk can update only `name`, `email`, `phone`, and `address` fields on vendors they created. |
| **Restriction** | Cannot modify `paymentTerms`, `category`, `creditLimit`, `taxId`, or bank details. |
| **SoD Rule** | N/A — updates only, no approval involved. |
| **Invariant** | INV-S020 — only Controller can deactivate; Clerk cannot change vendor state. |

### 🔒² UpdateVendor (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | AP Manager can update all non-financial fields. `paymentTerms` and `category` changes require AP Manager authority. |
| **Restriction** | `taxId` changes require deactivate + recreate (AP_COMMAND_QUERY_MODEL §2.2). |
| **SoD Rule** | N/A — update only. |
| **Invariant** | None — administrative update. |

### 🔒³ ApproveVendor (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | Risk score must be < 50. Risk score ≥ 50 requires Controller. Risk score ≥ 80 requires CFO. |
| **Restriction** | Cannot approve vendor if risk score is 50–79 (must escalate to Controller). |
| **SoD Rule** | SoD-004: Same user who created the vendor cannot approve it. |
| **Invariant** | INV-A009 — vendor activation requires appropriate authority for risk level. |

### 🔒⁴ ApproveVendor (Controller)

| Field | Detail |
|---|---|
| **Condition** | Risk score must be 50–79. Risk score ≥ 80 requires CFO approval. |
| **Restriction** | Cannot approve vendor if risk score is ≥ 80. |
| **SoD Rule** | SoD-004: Same user who created the vendor cannot approve it. |
| **Invariant** | INV-A009 — Controller authority sufficient for medium-risk vendors. |

### 🔒⁵ ApproveVendor (System — Auto)

| Field | Detail |
|---|---|
| **Condition** | Risk score < 20 AND credit limit < $10,000. |
| **Restriction** | Auto-approval only for low-risk, low-credit vendors. Produces audit record with `isAutomated = true`. |
| **SoD Rule** | N/A — system-initiated, no human actor. |
| **Invariant** | INV-A015 — auto-approvals produce immutable audit record. |

### 🔒⁶ ReceiveInvoice (System — Auto)

| Field | Detail |
|---|---|
| **Condition** | System receives invoices via email parser, OCR pipeline, or API integration. |
| **Restriction** | System-created invoices are flagged with `source: "api"` / `"ocr"` / `"email"` in audit trail. |
| **SoD Rule** | N/A — system-initiated. |
| **Invariant** | INV-P001 — system-initiated capture still follows full lifecycle. |

### 🔒⁷ UpdateInvoice (AP Clerk)

| Field | Detail |
|---|---|
| **Condition** | AP Clerk can only update invoices they personally captured (`capturedBy === currentUser`). Invoice must be in `received` state. |
| **Restriction** | Cannot update invoices in `validated` or later states. Cannot modify vendor reference. |
| **SoD Rule** | N/A — update only, no approval involved. |
| **Invariant** | INV-S004 — paid/posted invoices cannot be edited. |

### 🔒⁸ DeleteInvoice (AP Clerk)

| Field | Detail |
|---|---|
| **Condition** | AP Clerk can only void invoices in `received` state (before validation). |
| **Restriction** | Cannot void invoices in `validated` or later states — requires AP Manager or Controller. |
| **SoD Rule** | N/A — destructive action but no approval chain involved. |
| **Invariant** | INV-S014 — void only from `received`, `validated` states for Clerk. |

### 🔒⁹ OverrideMatchResult (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | Price variance must be ≤ $500 or ≤ 1%. Total variance must be ≤ $10 or ≤ 1%. |
| **Restriction** | Variance > $500 requires Controller authority. |
| **SoD Rule** | SoD-001: The user who captured the invoice cannot override the match result. |
| **Invariant** | INV-A011 — override > $500 requires Controller. |

### 🔒¹⁰ OverrideMatchResult (Controller)

| Field | Detail |
|---|---|
| **Condition** | Price variance > $500 or total variance > $10, or > 1% on any dimension. |
| **Restriction** | None beyond SoD — Controller has full override authority. |
| **SoD Rule** | SoD-001: The user who captured the invoice cannot override the match result. |
| **Invariant** | INV-A011 — Controller authority sufficient for large variances. |

### 🔒¹¹ ApproveInvoice / RejectInvoice / GrantApproval / DenyApproval (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | Must be assigned as approver for the applicable approval level (Level 1–2). Amount must be within AP Manager authority limit ($1K–$100K). |
| **Restriction** | Cannot approve invoices > $100K (requires Controller). Cannot approve if assigned approver does not match current user. |
| **SoD Rule** | SoD-001: PO creator cannot approve same PO's invoice. SoD-002: Invoice capturer cannot approve own invoice. |
| **Invariant** | INV-A002 — capturer ≠ approver. INV-A001 — PO creator ≠ approver. INV-A008 — each level requires different person. |

### 🔒¹² ApproveInvoice / RejectInvoice / GrantApproval / DenyApproval (Controller)

| Field | Detail |
|---|---|
| **Condition** | Must be assigned as approver for Level 2–3. Amount $10K–$500K. |
| **Restriction** | Cannot approve invoices > $500K (requires CFO + Treasury Manager). |
| **SoD Rule** | SoD-001, SoD-002 — same SoD rules apply. Additionally, INV-A008 requires each level has different individual. |
| **Invariant** | INV-A004 — > $50K requires Controller. INV-A008 — different person per level. |

### 🔒¹³ ApproveInvoice / RejectInvoice / GrantApproval / DenyApproval (Treasury Manager)

| Field | Detail |
|---|---|
| **Condition** | Must be assigned as approver for Level 4–5 (highest). Amount > $100K. Dual-signature with CFO for amounts > $500K. |
| **Restriction** | Treasury Manager approval is the final human gate before payment execution. |
| **SoD Rule** | SoD-001, SoD-002, SoD-003 — Treasury Manager who approves payment proposal cannot have approved the invoice. |
| **Invariant** | INV-A005 — > $100K requires CFO + Treasury dual. |

### 🔒¹⁴ ApproveInvoice / GrantApproval (System — Auto)

| Field | Detail |
|---|---|
| **Condition** | Invoice < $1,000, matched to single PO, vendor risk score < 20%, trusted vendor. |
| **Restriction** | Auto-approval produces immutable record with `isAutomated = true`. Cannot auto-approve > $1K. |
| **SoD Rule** | N/A — system-initiated. |
| **Invariant** | INV-A015 — auto-approvals produce audit record. |

### 🔒¹⁵ BlockInvoice (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | Can only block invoices in `received` or `validated` state (pre-approval). |
| **Restriction** | Cannot block invoices in post-approval states (`matched`, `approved`, `scheduled`) — requires Controller. |
| **SoD Rule** | N/A — blocking is a hold action, not an approval. |
| **Invariant** | INV-S022 — blocking requires explicit action with reason. |

### 🔒¹⁶ ResolveException (AP Clerk)

| Field | Detail |
|---|---|
| **Condition** | Variance must be within tolerance: price variance < $0.01, quantity variance < 1 unit. Resolution type must be `accept`, `correct_quantity`, or `correct_price`. |
| **Restriction** | Cannot override price variance > $0.01. Cannot resolve `critical` severity exceptions (auto-escalated to AP Manager). |
| **SoD Rule** | SoD-005: Exception resolver cannot be the same person who created the exception. |
| **Invariant** | INV-A013 — exception > $5K requires Controller. |

### 🔒¹⁷ ResolveException (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | Variance between $0.01 and $5,000. All resolution types available. |
| **Restriction** | Cannot resolve exceptions > $5,000 variance — requires Controller. Cannot resolve `void`-related exceptions (requires Controller). |
| **SoD Rule** | SoD-005 — resolver ≠ exception creator. |
| **Invariant** | INV-A013 — > $5K variance requires Controller authority. |

### 🔒¹⁸ ResolveException (Controller)

| Field | Detail |
|---|---|
| **Condition** | All variances. `void`-related exceptions require Controller. |
| **Restriction** | None — Controller has full resolution authority. |
| **SoD Rule** | SoD-005 — resolver ≠ exception creator. |
| **Invariant** | INV-A013 — Controller authority sufficient for any variance. |

### 🔒¹⁹ DelegateApproval (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | Can delegate only for Level 1–2 approvals. Delegate must have authority ≥ invoice amount. |
| **Restriction** | Cannot delegate for Level 3+ (requires Controller). Cannot create circular delegation chains. |
| **SoD Rule** | SoD-006: Delegate cannot be the invoice capturer or PO creator. INV-A016: No circular delegation chains. INV-A017: Delegate authority ≤ original authority limit. |
| **Invariant** | INV-A016 — circular delegation detection. INV-A017 — authority limit respected. |

### 🔒²⁰ DelegateApproval (Controller)

| Field | Detail |
|---|---|
| **Condition** | Can delegate for Level 3+ approvals. Same authority constraints as AP Manager delegation. |
| **Restriction** | Cannot create circular chains. Delegate must have sufficient authority. |
| **SoD Rule** | SoD-006, INV-A016, INV-A017 — same rules. |
| **Invariant** | INV-A016, INV-A017 — delegation integrity. |

### 🔒²¹ ApprovePaymentProposal (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | Proposal total amount < $100K. |
| **Restriction** | Cannot approve proposals ≥ $100K — requires Controller. |
| **SoD Rule** | SoD-003: Proposal creator cannot approve own proposal. |
| **Invariant** | INV-A003 — proposal creator ≠ executor/approver boundary. |

### 🔒²² ApprovePaymentProposal (Controller)

| Field | Detail |
|---|---|
| **Condition** | Proposal total amount $100K–$500K. |
| **Restriction** | Cannot approve proposals > $500K — requires CFO + Treasury Manager dual approval. |
| **SoD Rule** | SoD-003 — same proposal creator SoD. |
| **Invariant** | Threshold routing — Controller authority for mid-range proposals. |

### 🔒²³ ApprovePaymentProposal (Treasury Manager)

| Field | Detail |
|---|---|
| **Condition** | Proposal total amount > $500K. Requires dual approval: Treasury Manager + CFO. |
| **Restriction** | Treasury Manager cannot unilaterally approve > $500K — CFO signature required. |
| **SoD Rule** | SoD-003 — proposal creator cannot be Treasury approver. SoD-007: Treasury Manager who executes payment cannot approve the proposal. |
| **Invariant** | INV-A005 — > $100K requires Treasury Manager involvement. |

### 🔒²⁴ ExecutePayment (Treasury Manager)

| Field | Detail |
|---|---|
| **Condition** | Batch must be in `validated` state. Payment amount determines authority level. |
| **Amount Authority** | Treasury Analyst: up to $10K. Treasury Manager: $10K–$100K. > $100K requires dual-signature with Controller. |
| **SoD Rule** | SoD-003: Proposal creator cannot execute payment. SoD-008: Invoice capturer cannot execute payment for same invoice. |
| **Invariant** | INV-A020 — Treasury execution authority limits per role. |

### 🔒²⁵ ReversePayment (Controller)

| Field | Detail |
|---|---|
| **Condition** | Payment must be in `confirmed` or `completed` state. Amount ≤ $50K — Controller can reverse unilaterally. |
| **Restriction** | Amount > $50K requires Controller + CFO dual approval for reversal. |
| **SoD Rule** | SoD-009: Person who executed the payment cannot reverse it. |
| **Invariant** | INV-A006 — reversal requires Controller. INV-A007 — > $50K reversal requires Controller + CFO. |

### 🔒²⁶ AdjustReconciliation (AP Clerk)

| Field | Detail |
|---|---|
| **Condition** | Adjustment amount per line must be < $50. |
| **Restriction** | Cannot make adjustments ≥ $50 — requires AP Manager. Cannot make write-offs. |
| **SoD Rule** | SoD-010: Person who imported the vendor statement cannot approve the adjustment. |
| **Invariant** | INV-A021 — adjustment thresholds enforced. |

### 🔒²⁷ AdjustReconciliation (AP Manager)

| Field | Detail |
|---|---|
| **Condition** | Adjustment amount $50–$500 per line. |
| **Restriction** | Cannot make adjustments > $500 — requires Controller. Write-offs > $500 require Controller. |
| **SoD Rule** | SoD-010 — same statement importer SoD. |
| **Invariant** | INV-A021 — > $500 requires Controller with root cause. |

### 🔒²⁸ AdjustReconciliation (Controller)

| Field | Detail |
|---|---|
| **Condition** | Adjustment amount > $500. Write-offs at any amount. |
| **Restriction** | Must document root cause for all adjustments > $500. |
| **SoD Rule** | SoD-010 — same statement importer SoD. |
| **Invariant** | INV-A021 — Controller authority with documented root cause. |

---

## Part 3: Segregation of Duties Rules

Segregation of Duties (SoD) rules prevent a single individual from controlling both sides of a financial transaction. These rules are enforced at the service layer and are **never bypassable** — not even by Controller or System roles.

### 3.1 SoD Rule Registry

| Rule ID | Rule Name | Description | Severity | Enforcement Point | Invariant |
|---|---|---|---|---|---|
| SoD-001 | PO Creator ≠ Invoice Approver | The user who created a purchase order cannot approve an invoice referencing that same PO. Prevents self-approval of purchasing commitments. | Critical | Approval chain routing — SoD check before level assignment | INV-A001 |
| SoD-002 | Invoice Capturer ≠ Invoice Approver | The user who captured (created) an invoice cannot approve that same invoice at any level of the approval chain. Prevents self-approval of payables. | Critical | Approval chain routing — SoD check before level assignment | INV-A002 |
| SoD-003 | Proposal Creator ≠ Payment Executor | The user who created or reviewed a payment proposal cannot execute, approve, or confirm the resulting payment batch. Prevents end-to-end payment control. | Critical | Payment batch execution — SoD check at ExecutePayment | INV-A003 |
| SoD-004 | Vendor Creator ≠ Vendor Approver | The user who created a vendor record cannot approve that vendor for active use. Prevents fraudulent vendor onboarding. | High | ApproveVendor command — SoD check before status transition | INV-A009 |
| SoD-005 | Exception Creator ≠ Exception Resolver | The user who created or is assigned an exception cannot resolve the same exception. Prevents exception suppression. | High | ResolveException command — SoD check before resolution | New |
| SoD-006 | Delegation SoD | An approval delegate cannot be the invoice capturer or PO creator for the invoice being delegated. Prevents delegation to conflicted parties. | High | DelegateApproval command — SoD check on delegate identity | INV-A016 |
| SoD-007 | Payment Proposal Approver ≠ Payment Executor | The user who approved the payment proposal cannot execute or confirm the resulting payment. Separates authorization from execution. | Critical | ExecutePayment command — SoD check against proposal approver | INV-A003 |
| SoD-008 | Invoice Capturer ≠ Payment Executor | The user who captured an invoice cannot execute the payment for that invoice. Prevents end-to-end invoice-to-payment control by one person. | Critical | ExecutePayment command — SoD check against invoice capturedBy | New |
| SoD-009 | Payment Executor ≠ Payment Reverser | The user who executed a payment cannot reverse that same payment. Prevents reversal of own payments without independent review. | High | ReversePayment command — SoD check against payment executedBy | New |
| SoD-010 | Statement Importer ≠ Adjustment Approver | The user who imported a vendor statement for reconciliation cannot approve adjustments on that reconciliation. Prevents fraudulent reconciliation adjustments. | High | AdjustReconciliation command — SoD check against reconciliation importedBy | New |
| SoD-011 | Credit Recipient ≠ Credit Approver | The user who received a credit note cannot approve its application to invoices > $1,000. Prevents unauthorized credit application. | Medium | ApplyCreditNote — SoD check for amounts > $1K | New |
| SoD-012 | Approval Level Separation | Each level in an approval chain must be assigned to a different individual. No single person can approve at multiple levels of the same chain. | High | Approval chain routing — uniqueness check on assigned approvers | INV-A008 |

### 3.2 SoD Conflict Detection Matrix

This matrix shows which role combinations create SoD conflicts for each entity lifecycle:

| Lifecycle Stage | Conflicting Roles | Rule | Consequence |
|---|---|---|---|
| PO → Invoice Approval | PO creator / Invoice approver | SoD-001 | Approval blocked, escalated to next available approver |
| Invoice Capture → Approval | Invoice capturer / Invoice approver | SoD-002 | Approval blocked, escalated to next available approver |
| Proposal → Payment | Proposal creator / Payment executor | SoD-003 | Payment blocked, requires independent executor |
| Vendor Create → Approval | Vendor creator / Vendor approver | SoD-004 | Approval blocked, escalated to Controller |
| Exception Create → Resolution | Exception creator / Exception resolver | SoD-005 | Resolution blocked, re-assigned to different clerk |
| Approval Delegation | Delegated-to / Invoice capturer/PO creator | SoD-006 | Delegation rejected, alternative delegate required |
| Proposal Approval → Execution | Proposal approver / Payment executor | SoD-007 | Execution blocked, requires independent executor |
| Invoice Capture → Payment | Invoice capturer / Payment executor | SoD-008 | Execution blocked, requires independent executor |
| Payment Execute → Reverse | Payment executor / Payment reverser | SoD-009 | Reversal blocked, requires independent reverser |
| Statement Import → Adjustment | Statement importer / Adjustment approver | SoD-010 | Adjustment blocked, re-assigned to different manager |
| Credit Receive → Apply (> $1K) | Credit recipient / Credit applier | SoD-011 | Application blocked, requires AP Manager |
| Multi-level Approval | Same person at multiple levels | SoD-012 | Routing blocked, re-routed to different approver |

### 3.3 SoD Violation Response Protocol

When a SoD violation is detected:

| Step | Action | Audit |
|---|---|---|
| 1 | **Reject Operation** — the command is not executed | `sod_violation` audit event logged |
| 2 | **Notify User** — human-readable message: "You cannot perform this action because [SoD rule] prevents [conflict description]" | Included in 403 response |
| 3 | **Notify Manager** — AP Manager receives notification of SoD attempt | Async notification |
| 4 | **Record for Compliance** — SoD violation counted in monthly compliance report | Aggregated in audit analytics |
| 5 | **Escalation** — if same SoD violation attempted 3+ times by same user → security alert to Controller | Security incident |

### 3.4 SoD Override Policy

SoD rules **cannot** be overridden by any role, including Controller and CFO. In exceptional circumstances:

| Override Type | Authority Required | Audit Requirement |
|---|---|---|
| Emergency Override | CFO + Controller + Security Officer | Security incident report, full audit trail, 30-day review |
| System Workaround | N/A — System role is exempt from SoD because it has no human identity | System audit with `actorId = "system"` |
| Temporary Exemption | Controller + CFO, time-limited (max 72 hours) | Audit event with expiry timestamp, auto-enforcement resumes |

---

## Part 4: Threshold Authority Matrix

Approval authority is determined by the monetary amount of the transaction. Thresholds are **cumulative** — each level adds to the previous. Amounts are evaluated at the time of approval, not at the time of invoice creation.

### 4.1 Invoice Approval Thresholds

| Amount Range | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 | Auto-Approve |
|---|---|---|---|---|---|---|
| < $1,000 | System (auto) | — | — | — | — | Yes, if: matched to single PO + vendor risk < 20% |
| $1,000 – $10,000 | AP Manager | — | — | — | — | No |
| $10,000 – $50,000 | AP Manager | Controller | — | — | — | No |
| $50,000 – $100,000 | AP Manager | Controller | Controller | — | — | No |
| $100,000 – $500,000 | AP Manager | Controller | Controller | CFO | — | No |
| > $500,000 | AP Manager | Controller | Controller | CFO | Treasury Manager | No |

### 4.2 Payment Proposal Approval Thresholds

| Amount Range | Approver | Dual Signature Required | Cash Position Check |
|---|---|---|---|
| < $100,000 | AP Manager | No | Warning only (not block) |
| $100,000 – $500,000 | Controller | No | Warning only |
| > $500,000 | CFO + Treasury Manager | Yes | Warning + hold if insufficient |

### 4.3 Payment Execution Thresholds

| Amount Range | Executor | Dual Signature | Bank Verification |
|---|---|---|---|
| < $10,000 | Treasury Analyst | No | Standard |
| $10,000 – $100,000 | Treasury Manager | No | Enhanced |
| $100,000 – $500,000 | Treasury Manager + Controller | Yes | Full verification |
| > $500,000 | Treasury Manager + CFO | Yes | Full verification + cash wire |

### 4.4 Payment Reversal Thresholds

| Amount Range | Authorizer | Additional Requirement |
|---|---|---|
| < $50,000 | Controller | Documented root cause |
| > $50,000 | Controller + CFO | Documented root cause + incident report |

### 4.5 Vendor Approval Thresholds (by Risk Score)

| Risk Score | Approver | Additional Checks |
|---|---|---|
| < 20 | System (auto-approve) | Credit limit < $10K required |
| 20 – 49 | AP Manager | Standard due diligence |
| 50 – 79 | Controller | Enhanced due diligence required |
| ≥ 80 | CFO | Full compliance review required |

### 4.6 Match Override Thresholds

| Variance Amount | Approver | Reason Requirement |
|---|---|---|
| ≤ $0.01 (within tolerance) | AP Clerk | Minimum 10 chars |
| $0.01 – $500 | AP Manager | Minimum 20 chars — must explain business justification |
| > $500 | Controller | Minimum 20 chars — must explain business justification + root cause |

### 4.7 Exception Resolution Thresholds

| Variance Amount | Resolver | Notes |
|---|---|---|
| < $0.01 (within tolerance) | AP Clerk | Direct resolution |
| $0.01 – $5,000 | AP Manager | Standard resolution |
| > $5,000 | Controller | Enhanced resolution with investigation |
| Critical severity (any amount) | AP Manager (after auto-escalation) | Auto-escalated at creation |

### 4.8 Reconciliation Adjustment Thresholds

| Adjustment Amount | Approver | Documentation |
|---|---|---|
| < $50 | AP Clerk | Reason required |
| $50 – $500 | AP Manager | Reason + category |
| > $500 | Controller | Root cause + investigation report |

### 4.9 Credit Note Void Thresholds

| Credit Amount | Authorizer | Notes |
|---|---|---|
| Any amount | Controller | All credit note voids require Controller authority |

---

## Part 5: Delegation Rules

Delegation allows an approver to transfer approval responsibility to another qualified individual. Delegation is governed by strict rules to maintain SoD compliance and audit integrity.

### 5.1 Delegation Chain

When an approver is unavailable (out of office, SLA breach, or manual delegation), the system follows this escalation chain:

```
Primary Approver
  → Alternate Approver (designated backup)
    → Manager of Primary Approver
      → Controller (final fallback)
```

| Level | Trigger | Maximum SLA | Authority Check |
|---|---|---|---|
| Primary | Direct assignment | 12 hours | Authority ≥ invoice amount |
| Alternate | Primary unavailable / SLA breach (12h) | 12 hours | Authority ≥ invoice amount |
| Manager | Primary + Alternate unavailable / SLA breach (24h) | 24 hours | Authority ≥ invoice amount |
| Controller | All above unavailable / SLA breach (48h) | 48 hours | Controller has universal authority |

### 5.2 Delegation SLA Schedule

| Time Elapsed | Action | Notification |
|---|---|---|
| 0h | Approval assigned to primary approver | Primary notified |
| 12h | SLA warning — notification to primary + alternate | Primary + alternate notified |
| 24h | First escalation — auto-delegate to alternate | Primary, alternate, AP Manager notified |
| 36h | Second escalation — auto-delegate to manager | All stakeholders notified |
| 48h | Final escalation — auto-delegate to Controller | Controller, AP Manager, CFO notified |

### 5.3 Delegation Constraints

| Constraint | Rule | Invariant |
|---|---|---|
| No Circular Chains | Delegation cannot create a cycle: A→B→C→A is prohibited. Cycle detection runs at delegation creation. | INV-A016 |
| Authority Limit | Delegate authority must be ≥ invoice amount. If delegate's authority is insufficient, escalation continues up the chain. | INV-A017 |
| SoD Compliance | Delegate cannot be the invoice capturer, PO creator, or proposal creator for the same transaction. | SoD-006 |
| Audit Trail | Every delegation records: delegator, delegate, reason, timestamp, original authority level, authority limit. | INV-AU003 |
| Maximum Delegation Depth | Maximum 3 delegation hops (Primary → Alt → Manager → Controller). No further delegation beyond Controller. | Policy |
| Time-Limited | Auto-delegations expire after 72 hours. Manual delegations expire after the configured period. | Policy |
| Recall Right | Original approver can recall a delegation if they return before the delegate has acted. | Policy |

### 5.4 Delegation Recording

Every delegation event produces the following audit record:

```json
{
  "event": "approval.delegated",
  "chainId": "appr_chain_abc123",
  "invoiceId": "inv_xyz789",
  "level": 2,
  "delegatedFrom": "user_ap_manager_001",
  "delegatedTo": "user_controller_001",
  "reason": "AP Manager out of office — SLA breach at 24h",
  "authorityLimit": 500000.00,
  "timestamp": "2026-07-21T14:30:00Z",
  "delegationType": "auto",
  "slaBreached": true,
  "companyId": "company_acme"
}
```

---

## Part 6: API Route Permission Mapping

Every planned API route in the AP domain is mapped to its required permission and the roles that may access it.

### 6.1 Vendor API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/vendors` | GET | `ap.reports.vendor_list` | AP Clerk, AP Manager, Controller, Procurement Manager, Auditor, System | No |
| `/api/v1/ap/vendors` | POST | `ap.vendors.create` | AP Clerk, AP Manager, Procurement Manager | No |
| `/api/v1/ap/vendors/[id]` | GET | `ap.reports.vendor_detail` | AP Clerk, AP Manager, Controller, Procurement Manager, Auditor, System | No |
| `/api/v1/ap/vendors/[id]` | PUT | `ap.vendors.update` | AP Clerk (own vendors), AP Manager, Procurement Manager | No |
| `/api/v1/ap/vendors/[id]/approve` | POST | `ap.vendors.approve` | AP Manager, Controller, System | Yes |
| `/api/v1/ap/vendors/[id]/reject` | POST | `ap.vendors.reject` | AP Manager, Controller | Yes |
| `/api/v1/ap/vendors/[id]/suspend` | POST | `ap.vendors.suspend` | AP Manager, Controller | Yes |
| `/api/v1/ap/vendors/[id]/reactivate` | POST | `ap.vendors.reactivate` | AP Manager | Yes |
| `/api/v1/ap/vendors/[id]/deactivate` | POST | `ap.vendors.deactivate` | Controller | Yes |
| `/api/v1/ap/vendors/[id]/bank` | PUT | `ap.vendors.update_bank` | AP Manager | Yes |
| `/api/v1/ap/vendors/[id]/performance` | GET | `ap.reports.vendor_detail` | AP Manager, Controller, Procurement Manager, Auditor | No |

### 6.2 Invoice API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/invoices` | GET | `ap.reports.invoice_list` | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/invoices` | POST | `ap.invoices.create` | AP Clerk, AP Manager, System | No |
| `/api/v1/ap/invoices/[id]` | GET | `ap.reports.invoice_detail` | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/invoices/[id]` | PUT | `ap.invoices.update` | AP Clerk (own invoices), AP Manager | No |
| `/api/v1/ap/invoices/[id]` | DELETE | `ap.invoices.delete` | AP Clerk (received only), AP Manager, Controller | Yes |
| `/api/v1/ap/invoices/[id]/validate` | POST | `ap.invoices.validate` | AP Clerk, AP Manager, System | No |
| `/api/v1/ap/invoices/[id]/match` | POST | `ap.match.execute` | AP Clerk, AP Manager, System | No |
| `/api/v1/ap/invoices/[id]/match/override` | POST | `ap.match.override` | AP Manager, Controller | Yes |
| `/api/v1/ap/invoices/[id]/approve` | POST | `ap.invoices.approve` | AP Manager, Controller, Treasury Manager, System | Yes |
| `/api/v1/ap/invoices/[id]/reject` | POST | `ap.invoices.reject` | AP Manager, Controller, Treasury Manager | Yes |
| `/api/v1/ap/invoices/[id]/escalate` | POST | `ap.invoices.escalate` | AP Manager, Controller, System | No |
| `/api/v1/ap/invoices/[id]/schedule-payment` | POST | `ap.invoices.schedule_payment` | AP Manager | Yes |
| `/api/v1/ap/invoices/[id]/block` | POST | `ap.invoices.block` | AP Manager (pre-approval), Controller (any) | Yes |
| `/api/v1/ap/invoices/[id]/unblock` | POST | `ap.invoices.unblock` | AP Manager, Controller | Yes |
| `/api/v1/ap/invoices/[id]/dispute` | POST | `ap.invoices.dispute` | AP Clerk, AP Manager | No |
| `/api/v1/ap/invoices/[id]/dispute/resolve` | POST | `ap.invoices.dispute_resolve` | AP Manager | Yes |
| `/api/v1/ap/invoices/[id]/void` | POST | `ap.invoices.void` | Controller | Yes |

### 6.3 Match API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/matches/[id]` | GET | `ap.reports.match_detail` | AP Clerk, AP Manager, Controller, Auditor, System | No |
| `/api/v1/ap/matches/[id]/override` | POST | `ap.match.override` | AP Manager, Controller | Yes |

### 6.4 Exception API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/exceptions` | GET | `ap.reports.exception_queue` | AP Clerk, AP Manager, Controller, Auditor, System | No |
| `/api/v1/ap/exceptions` | POST | `ap.exceptions.create` | AP Clerk, AP Manager, System | No |
| `/api/v1/ap/exceptions/[id]` | GET | `ap.reports.exception_queue` | AP Clerk, AP Manager, Controller, Auditor, System | No |
| `/api/v1/ap/exceptions/[id]/assign` | POST | `ap.exceptions.assign` | AP Manager, System | No |
| `/api/v1/ap/exceptions/[id]/resolve` | POST | `ap.exceptions.resolve` | AP Clerk (tolerance), AP Manager, Controller | No |
| `/api/v1/ap/exceptions/[id]/escalate` | POST | `ap.exceptions.escalate` | AP Clerk, AP Manager, Controller, System | No |
| `/api/v1/ap/exceptions/bulk-resolve` | POST | `ap.exceptions.bulk_resolve` | AP Manager, Controller | Yes |

### 6.5 Approval API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/approvals` | GET | `ap.reports.approval_queue` | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/approvals/[id]` | GET | `ap.reports.approval_chain` | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/approvals/[id]/approve` | POST | `ap.approvals.grant` | AP Manager, Controller, Treasury Manager, System | Yes |
| `/api/v1/ap/approvals/[id]/reject` | POST | `ap.approvals.deny` | AP Manager, Controller, Treasury Manager | Yes |
| `/api/v1/ap/approvals/[id]/delegate` | POST | `ap.approvals.delegate` | AP Manager, Controller, System | Yes |
| `/api/v1/ap/approvals/[id]/escalate` | POST | `ap.approvals.escalate` | AP Manager, Controller, System | No |
| `/api/v1/ap/approvals/[id]/recall` | POST | `ap.approvals.recall` | Controller | Yes |

### 6.6 Payment API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/payments/proposals` | GET | `ap.reports.payment_history` | AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/payments/proposals` | POST | `ap.payments.create_proposal` | AP Manager, System | Yes |
| `/api/v1/ap/payments/proposals/[id]` | GET | `ap.reports.payment_history` | AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/payments/proposals/[id]/review` | POST | `ap.payments.review` | AP Manager | Yes |
| `/api/v1/ap/payments/proposals/[id]/approve` | POST | `ap.payments.approve` | AP Manager, Controller, Treasury Manager + CFO | Yes |
| `/api/v1/ap/payments/proposals/[id]/reject` | POST | `ap.payments.reject` | AP Manager, Controller | Yes |
| `/api/v1/ap/payments/batches` | GET | `ap.reports.payment_history` | AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/payments/batches/[id]` | GET | `ap.reports.payment_history` | AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/payments/batches/[id]/execute` | POST | `ap.payments.execute` | Treasury Analyst, Treasury Manager | Yes |
| `/api/v1/ap/payments/batches/[id]/confirm` | POST | `ap.payments.confirm` | Treasury Manager, System | Yes |
| `/api/v1/ap/payments/batches/[id]/reverse` | POST | `ap.payments.reverse` | Controller, CFO | Yes |
| `/api/v1/ap/payments/batches/[id]/cancel` | POST | `ap.payments.cancel` | AP Manager, Treasury Manager, Controller | Yes |

### 6.7 Reconciliation API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/reconciliation` | GET | `ap.reports.reconciliation_status` | AP Manager, Controller, Auditor, System | No |
| `/api/v1/ap/reconciliation/import` | POST | `ap.reconciliation.import` | AP Manager | Yes |
| `/api/v1/ap/reconciliation/[id]` | GET | `ap.reports.reconciliation_status` | AP Manager, Controller, Auditor, System | No |
| `/api/v1/ap/reconciliation/[id]/run` | POST | `ap.reconciliation.execute` | AP Manager, System | No |
| `/api/v1/ap/reconciliation/[id]/adjust` | POST | `ap.reconciliation.adjust` | AP Clerk (< $50), AP Manager, Controller | No |
| `/api/v1/ap/reconciliation/[id]/complete` | POST | `ap.reconciliation.complete` | AP Manager | Yes |

### 6.8 Credit API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/credits` | GET | `ap.reports.invoice_list` | AP Clerk, AP Manager, Controller, Auditor | No |
| `/api/v1/ap/credits` | POST | `ap.credits.create` | AP Clerk, AP Manager | No |
| `/api/v1/ap/credits/[id]` | GET | `ap.reports.invoice_detail` | AP Clerk, AP Manager, Controller, Auditor | No |
| `/api/v1/ap/credits/[id]/apply` | POST | `ap.credits.apply` | AP Clerk, AP Manager | No |
| `/api/v1/ap/credits/[id]/void` | POST | `ap.credits.void` | Controller | Yes |

### 6.9 AP Admin API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/admin/tolerance` | GET/PUT | `ap.admin.tolerance` | Controller | Yes |
| `/api/v1/ap/admin/approval-matrix` | GET/PUT | `ap.admin.approval_matrix` | Controller | Yes |
| `/api/v1/ap/admin/payment-schedule` | GET/PUT | `ap.admin.payment_schedule` | Controller, Treasury Manager | Yes |
| `/api/v1/ap/admin/auto-match` | GET/PUT | `ap.admin.auto_match` | Controller | Yes |
| `/api/v1/ap/admin/duplicate-detection` | GET/PUT | `ap.admin.duplicate_detection` | Controller | Yes |

### 6.10 AP Reports API Routes

| Route | Method | Required Permission | Roles | MFA Required |
|---|---|---|---|---|
| `/api/v1/ap/reports/aging` | GET | `ap.reports.vendor_aging` | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/reports/cash-requirements` | GET | `ap.reports.cash_requirements` | AP Manager, Controller, Treasury Manager, System | No |
| `/api/v1/ap/reports/discount-available` | GET | `ap.reports.discount_available` | AP Manager, Controller, Treasury Manager, System | No |
| `/api/v1/ap/reports/payment-calendar` | GET | `ap.reports.payment_calendar` | AP Clerk, AP Manager, Controller, Treasury Manager, System | No |
| `/api/v1/ap/reports/outstanding-liabilities` | GET | `ap.reports.outstanding_liabilities` | AP Manager, Controller, Treasury Manager, Auditor, System | No |
| `/api/v1/ap/reports/analytics` | GET | `ap.reports.analytics` | AP Manager, Controller, Treasury Manager, System | No |
| `/api/v1/ap/reports/duplicates` | GET | `ap.reports.duplicate_detection` | AP Manager, Controller, System | No |
| `/api/v1/ap/reports/audit-trail` | GET | `ap.reports.audit_trail` | AP Manager, Controller, Treasury Manager, Auditor, System | No |

---

## Part 7: UI Component Permission Mapping

Every user-facing action in the AP UI is mapped to a required permission. UI elements are hidden or disabled based on the user's permission set.

### 7.1 Vendor UI Components

| Component | Action | Required Permission | UI Behavior (No Permission) |
|---|---|---|---|
| VendorList | View vendors | `ap.reports.vendor_list` | Page not accessible |
| VendorList | Create vendor button | `ap.vendors.create` | Button hidden |
| VendorList | Export vendors | `ap.reports.vendor_list` | Button hidden |
| VendorDetail | View vendor | `ap.reports.vendor_detail` | Page not accessible |
| VendorDetail | Edit vendor | `ap.vendors.update` | Edit button hidden |
| VendorDetail | Approve vendor | `ap.vendors.approve` | Approve button hidden |
| VendorDetail | Reject vendor | `ap.vendors.reject` | Reject button hidden |
| VendorDetail | Suspend vendor | `ap.vendors.suspend` | Suspend button hidden |
| VendorDetail | Deactivate vendor | `ap.vendors.deactivate` | Deactivate button hidden |
| VendorDetail | Edit bank details | `ap.vendors.update_bank` | Bank edit button hidden |
| VendorForm | Create form fields | `ap.vendors.create` | Form not rendered |
| VendorPerformance | View performance | `ap.reports.vendor_detail` | Tab hidden |

### 7.2 Invoice UI Components

| Component | Action | Required Permission | UI Behavior (No Permission) |
|---|---|---|---|
| InvoiceList | View invoices | `ap.reports.invoice_list` | Page not accessible |
| InvoiceList | Create invoice button | `ap.invoices.create` | Button hidden |
| InvoiceList | Bulk actions menu | `ap.invoices.delete` | Menu hidden |
| InvoiceDetail | View invoice | `ap.reports.invoice_detail` | Page not accessible |
| InvoiceDetail | Edit invoice | `ap.invoices.update` | Edit button hidden (disabled if not `received` state) |
| InvoiceDetail | Void invoice | `ap.invoices.void` | Void button hidden |
| InvoiceDetail | Block invoice | `ap.invoices.block` | Block button hidden |
| InvoiceDetail | Dispute invoice | `ap.invoices.dispute` | Dispute button hidden |
| InvoiceMatch | View match results | `ap.reports.match_detail` | Match tab hidden |
| InvoiceMatch | Run match | `ap.match.execute` | Run Match button hidden |
| InvoiceMatch | Override match | `ap.match.override` | Override button hidden |
| InvoiceApproval | View approval chain | `ap.reports.approval_chain` | Approval tab hidden |
| InvoiceApproval | Approve | `ap.invoices.approve` | Approve button hidden or disabled (SoD check) |
| InvoiceApproval | Reject | `ap.invoices.reject` | Reject button hidden or disabled (SoD check) |
| InvoiceApproval | Delegate | `ap.approvals.delegate` | Delegate button hidden |
| InvoiceApproval | Escalate | `ap.invoices.escalate` | Escalate button hidden |
| InvoiceSchedule | Schedule for payment | `ap.invoices.schedule_payment` | Schedule button hidden |
| InvoiceExceptions | View exceptions | `ap.reports.exception_queue` | Exceptions section hidden |

### 7.3 Exception UI Components

| Component | Action | Required Permission | UI Behavior (No Permission) |
|---|---|---|---|
| ExceptionQueue | View queue | `ap.reports.exception_queue` | Page not accessible |
| ExceptionQueue | Assign exception | `ap.exceptions.assign` | Assign action hidden |
| ExceptionQueue | Bulk resolve | `ap.exceptions.bulk_resolve` | Bulk action hidden |
| ExceptionDetail | View exception | `ap.reports.exception_queue` | Detail not accessible |
| ExceptionDetail | Resolve exception | `ap.exceptions.resolve` | Resolve button hidden or disabled (SoD + threshold check) |
| ExceptionDetail | Escalate exception | `ap.exceptions.escalate` | Escalate button hidden |

### 7.4 Payment UI Components

| Component | Action | Required Permission | UI Behavior (No Permission) |
|---|---|---|---|
| PaymentProposals | View proposals | `ap.reports.payment_history` | Page not accessible |
| PaymentProposals | Generate proposal | `ap.payments.create_proposal` | Generate button hidden |
| PaymentProposalDetail | Review proposal | `ap.payments.review` | Review button hidden |
| PaymentProposalDetail | Approve proposal | `ap.payments.approve` | Approve button hidden or disabled (SoD + threshold check) |
| PaymentProposalDetail | Reject proposal | `ap.payments.reject` | Reject button hidden |
| PaymentBatches | View batches | `ap.reports.payment_history` | Page not accessible |
| PaymentBatchDetail | Execute payment | `ap.payments.execute` | Execute button hidden or disabled (SoD check) |
| PaymentBatchDetail | Confirm payment | `ap.payments.confirm` | Confirm button hidden |
| PaymentBatchDetail | Reverse payment | `ap.payments.reverse` | Reverse button hidden |
| PaymentBatchDetail | Cancel payment | `ap.payments.cancel` | Cancel button hidden |

### 7.5 Reconciliation UI Components

| Component | Action | Required Permission | UI Behavior (No Permission) |
|---|---|---|---|
| ReconciliationList | View reconciliations | `ap.reports.reconciliation_status` | Page not accessible |
| ReconciliationDetail | View reconciliation | `ap.reports.reconciliation_status` | Detail not accessible |
| ReconciliationDetail | Import statement | `ap.reconciliation.import` | Import button hidden |
| ReconciliationDetail | Run reconciliation | `ap.reconciliation.execute` | Run button hidden |
| ReconciliationDetail | Post adjustments | `ap.reconciliation.adjust` | Adjust button hidden or disabled (threshold check) |
| ReconciliationDetail | Complete | `ap.reconciliation.complete` | Complete button hidden |

### 7.6 Credit UI Components

| Component | Action | Required Permission | UI Behavior (No Permission) |
|---|---|---|---|
| CreditNotes | View credits | `ap.reports.invoice_list` | Page not accessible |
| CreditNotes | Create credit note | `ap.credits.create` | Create button hidden |
| CreditNoteDetail | Apply credit | `ap.credits.apply` | Apply button hidden or disabled (SoD check) |
| CreditNoteDetail | Void credit | `ap.credits.void` | Void button hidden |

### 7.7 Reports & Analytics UI Components

| Component | Action | Required Permission | UI Behavior (No Permission) |
|---|---|---|---|
| APDashboard | View dashboard | `ap.reports.analytics` | Dashboard shows "Access Denied" |
| AgingReport | View aging | `ap.reports.vendor_aging` | Report tab hidden |
| AgingReport | Export aging | `ap.reports.vendor_aging` | Export button hidden |
| CashRequirements | View forecast | `ap.reports.cash_requirements` | Report tab hidden |
| DiscountReport | View discounts | `ap.reports.discount_available` | Report tab hidden |
| PaymentCalendar | View calendar | `ap.reports.payment_calendar` | Report tab hidden |
| DuplicateDetection | View duplicates | `ap.reports.duplicate_detection` | Report tab hidden |
| AuditTrail | View audit trail | `ap.reports.audit_trail` | Report tab hidden |
| AuditTrail | Export audit log | `ap.reports.audit_trail` | Export button hidden (also requires `audit.export`) |

### 7.8 UI Permission Enforcement Strategy

| Layer | Mechanism | Fallback |
|---|---|---|
| **Route Guard** | Next.js layout checks permission against user session; redirects to `/unauthorized` if missing | Server-side check on page load |
| **Component Render** | `usePermission()` hook returns boolean; components conditionally render based on permission | Disabled state with tooltip "Insufficient permissions" |
| **API Response** | Every API route checks permission before execution; returns 403 Forbidden | Client catches 403 and shows "Access Denied" toast |
| **Optimistic UI** | Button visibility matches permission set; no hidden-to-visible flash on slow connections | Permission loaded from session before first render |

---

## Part 8: Permission Escalation

### 8.1 Unauthorized Access Attempt (403 Forbidden)

When a user attempts to execute a command without the required permission:

| Step | System Response |
|---|---|
| 1 | API route receives request and extracts user identity from session/JWT |
| 2 | `requirePermissions()` checks user's permission set against required permission |
| 3 | If missing: returns `403 Forbidden` with error body |
| 4 | Audit record created: `permission.denied` with user, permission, entity, timestamp |
| 5 | Client displays "Access Denied — you do not have permission to [action]" toast |

**Error Response Format:**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to approve invoices. Required: ap.invoices.approve",
    "requiredPermission": "ap.invoices.approve",
    "userRoles": ["ap_clerk"],
    "contactAdmin": true
  }
}
```

### 8.2 Threshold Exceeded Escalation

When a user attempts an action within their permission but exceeds their threshold authority:

| Scenario | Response |
|---|---|
| AP Manager approves invoice > $100K | System returns 403 with `INSUFFICIENT_AUTHORITY` — message: "Invoice amount ($150,000) exceeds your approval limit ($100,000). Approval requires Controller authority." |
| AP Manager approves proposal > $100K | System returns 403 with `INSUFFICIENT_AUTHORITY` — message: "Proposal amount ($200,000) exceeds your limit. Controller approval required." |
| Treasury Analyst executes payment > $10K | System returns 403 with `INSUFFICIENT_AUTHORITY` — message: "Payment amount ($25,000) requires Treasury Manager authority." |

**Threshold Escalation Protocol:**

| Threshold Violation | Auto-Escalation Target | Notification |
|---|---|---|
| AP Manager → exceeds $100K | Controller | AP Manager + Controller notified |
| Controller → exceeds $500K | CFO | Controller + CFO notified |
| Treasury Analyst → exceeds $10K | Treasury Manager | Treasury Analyst + Treasury Manager notified |
| Treasury Manager → exceeds $100K (execution) | Dual-signature with Controller | Treasury Manager + Controller notified |
| Treasury Manager → exceeds $500K (proposal) | Dual-signature with CFO | Treasury Manager + CFO notified |

### 8.3 Missing Approver Escalation

When the system cannot find an available approver for a required level:

| Step | Action |
|---|---|
| 1 | Check primary approver availability (last active within 4h) |
| 2 | If unavailable: check alternate approver (designated backup) |
| 3 | If alternate unavailable: check manager of primary approver |
| 4 | If manager unavailable: auto-escalate to Controller |
| 5 | If Controller unavailable: alert CFO directly |
| 6 | All escalation events recorded in audit trail |

**Escalation SLA enforcement:**

| SLA Breach | Auto-Action | Notification |
|---|---|---|
| 12 hours | Warning + nudge notification to primary | Primary, alternate |
| 24 hours | Auto-delegate to alternate | Primary, alternate, AP Manager |
| 36 hours | Auto-delegate to manager | All stakeholders |
| 48 hours | Auto-delegate to Controller | Controller, AP Manager, CFO |

### 8.4 SoD Violation Escalation

When a SoD violation blocks an action:

| Step | System Response |
|---|---|
| 1 | Operation blocked — no partial execution |
| 2 | Error message explains which SoD rule was violated |
| 3 | System suggests alternative: "This action requires an independent reviewer. [Alternate Approver Name] has been notified." |
| 4 | If no alternative available: auto-escalate to Controller |
| 5 | Audit record: `sod.violation` with full context |
| 6 | If 3+ SoD violations by same user in 30 days: security alert to Controller |

### 8.5 System Role Escalation

The System role operates without human authorization but produces full audit records:

| System Action | Trigger | Audit Record |
|---|---|---|
| Auto-approve invoice | Invoice < $1K, matched, trusted vendor | `approval.auto_approved` with `isAutomated = true` |
| Auto-match invoice | Invoice validated + PO reference present | `invoice.auto_matched` |
| Auto-resolve exception | Low variance (< $10), high confidence (> 85%) pattern | `exception.auto_resolved` with pattern ID |
| Auto-generate proposal | Daily at 6:00 AM | `proposal.auto_generated` |
| Auto-create batch | After proposal approval | `batch.auto_created` |
| Auto-confirm payment | Bank webhook received | `payment.auto_confirmed` |
| Auto-escalate on SLA | SLA deadline breached | `approval.auto_escalated` |
| Auto-delegate on absence | Primary approver unavailable 24h+ | `approval.auto_delegated` |

**System Role Constraints:**

| Constraint | Rule |
|---|---|
| No destructive actions | System cannot void, reverse, deactivate, or delete |
| No approval chain manipulation | System cannot override match results or escalate approvals manually |
| Amount limits | Auto-approve only < $1K; no system-initiated payments > $10K |
| Audit mandatory | Every system action produces an audit record with `actorId = "system"` |

---

## Part 9: MFA Requirements

Commands that require Multi-Factor Authentication are flagged in the API route mapping (Part 6). MFA is required for all commands that:

| Category | Examples | MFA Required |
|---|---|---|
| Financial mutations | Approve, execute, reverse, void | Yes |
| Vendor bank changes | Update bank details | Yes |
| Delegation | Delegate approval authority | Yes |
| Configuration | Tolerance rules, approval matrix, payment schedule | Yes |
| Destructive actions | Void, deactivate, bulk operations | Yes |
| Approval chain modifications | Approve, reject, recall | Yes |
| Payment execution | Execute, confirm, reverse, cancel | Yes |

Commands that do **not** require MFA:

| Category | Examples |
|---|---|
| Read-only queries | View invoices, view vendors, view reports |
| Data entry (pre-approval) | Receive invoice, update invoice, create exception |
| Exception escalation | Escalate exceptions (escalation is not a financial mutation) |
| Credit note receipt | Receive credit note (receipt only, application may require MFA for large amounts) |

---

## Part 10: Complete Permission Summary

### 10.1 Permission Count by Domain

| Domain | Permissions | Commands | Queries |
|---|---|---|---|
| Vendor | 8 | 8 | 2 |
| Invoice | 10 | 15 | 3 |
| Match | 2 | 2 | 1 |
| Exception | 4 | 6 | 1 |
| Approval | 5 | 6 | 2 |
| Payment | 5 | 9 | 3 |
| Reconciliation | 3 | 4 | 1 |
| Credit | 3 | 3 | 0 |
| AP Admin | 5 | 5 | 0 |
| AP Reports | 9 | 0 | 18 |
| **Total** | **54** | **58** | **31** |

### 10.2 Permission Count by Role

| Role | Full Access (✅) | Conditional (🔒) | Read-Only (📖) | No Access (❌) |
|---|---|---|---|---|
| AP Clerk | 14 | 5 | 0 | 35 |
| AP Manager | 22 | 10 | 0 | 22 |
| Controller | 18 | 12 | 0 | 24 |
| Treasury Manager | 6 | 8 | 0 | 40 |
| Procurement Manager | 3 | 0 | 0 | 51 |
| Auditor | 0 | 0 | 54 | 0 |
| Budget Owner | 0 | 0 | 0 | 54 |
| System | 15 | 5 | 0 | 34 |

### 10.3 MFA-Required Permission Count

| Role | MFA-Required Permissions | % of Total Access |
|---|---|---|
| AP Clerk | 0 | 0% |
| AP Manager | 12 | 55% |
| Controller | 16 | 89% |
| Treasury Manager | 8 | 100% |
| Procurement Manager | 0 | 0% |
| System | 0 | 0% |

---

## Part 11: Invariant Cross-Reference

Every SoD rule and authorization condition maps to one or more domain invariants from `AP_DOMAIN_INVARIANTS.md`.

| Permission Matrix Rule | Domain Invariant | Severity | Enforcement |
|---|---|---|---|
| SoD-001: PO creator ≠ invoice approver | INV-A001 | Critical | Approval chain routing |
| SoD-002: Invoice capturer ≠ invoice approver | INV-A002 | Critical | Approval chain routing |
| SoD-003: Proposal creator ≠ payment executor | INV-A003 | Critical | Payment batch execution |
| SoD-004: Vendor creator ≠ vendor approver | INV-A009 | High | Vendor state transition |
| SoD-006: Delegation SoD | INV-A016, INV-A017 | High | Delegation creation |
| SoD-007: Proposal approver ≠ payment executor | INV-A003 | Critical | Payment batch execution |
| SoD-012: Each level different person | INV-A008 | High | Approval chain routing |
| Invoice > $50K → Controller | INV-A004 | Critical | Approval matrix |
| Invoice > $100K → CFO + Treasury | INV-A005 | Critical | Approval matrix |
| Reversal → Controller | INV-A006 | Critical | Reversal authorization |
| Reversal > $50K → Controller + CFO | INV-A007 | Critical | Reversal authorization |
| Vendor deactivation → Controller | INV-A009 | High | Vendor state transition |
| Bank detail change → re-verification | INV-A010 | Critical | Payment execution |
| Match override > $500 → Controller | INV-A011 | High | Override authorization |
| Critical exception → auto-escalate | INV-A012 | High | Exception creation |
| Exception > $5K → Controller | INV-A013 | High | Exception resolution |
| Void → Controller | INV-A014 | Critical | Void action |
| Auto-approval audit record | INV-A015 | High | Auto-approval logic |
| No circular delegation | INV-A016 | High | Delegation creation |
| Delegation ≤ authority limit | INV-A017 | High | Delegation creation |
| Audit read-only | INV-A018 | Critical | Repository guard |
| Voided = permanent | INV-A019 | Critical | State machine |
| Treasury authority limits | INV-A020 | Critical | Payment execution |
| Reconciliation > $500 → Controller | INV-A021 | High | Adjustment guard |

---

*End of Phase 21A.0 — Accounts Payable Permission Matrix*
