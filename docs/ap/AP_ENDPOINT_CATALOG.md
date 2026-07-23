# Phase 21A.3 — Accounts Payable Endpoint Catalog

> **Status**: Complete
> **Type**: Documentation-only — full REST endpoint catalog
> **Date**: July 22, 2026
> **Scope**: All 65 endpoints under `/api/v1/ap/`
> **Depends on**: AP_COMMAND_QUERY_MODEL.md, AP_PERMISSION_MATRIX.md, AP_API_ARCHITECTURE.md

---

## Overview

This document catalogs every API endpoint in the Accounts Payable domain. Endpoints are grouped by aggregate and sorted by HTTP method within each group.

### Legend

| Column | Values |
|---|---|
| **Method** | `GET` (read), `POST` (action/command), `PUT` (update) |
| **Idempotent** | `✓` = accepts `Idempotency-Key` header, `—` = not idempotent |
| **MFA** | `✓` = requires MFA verification for financial mutations |

---

## 1. Vendor Endpoints (10)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 1 | `GET` | `/vendors` | ListVendors | `ap.vendors.read` | — | — | List vendors with filtering, sorting, pagination |
| 2 | `POST` | `/vendors` | CreateVendor | `ap.vendors.create` | — | — | Register a new vendor with due diligence data |
| 3 | `GET` | `/vendors/{vendorId}` | GetVendor | `ap.vendors.read` | — | — | Get vendor detail with documents and performance |
| 4 | `PUT` | `/vendors/{vendorId}` | UpdateVendor | `ap.vendors.update` | ✓ | — | Update vendor master data (name, contact, address) |
| 5 | `POST` | `/vendors/{vendorId}/approve` | ApproveVendor | `ap.vendors.approve` | ✓ | — | Approve pending vendor for active use |
| 6 | `POST` | `/vendors/{vendorId}/reject` | RejectVendor | `ap.vendors.approve` | ✓ | — | Reject vendor application with reason |
| 7 | `POST` | `/vendors/{vendorId}/suspend` | SuspendVendor | `ap.vendors.suspend` | ✓ | — | Temporarily block vendor from new POs/invoices |
| 8 | `POST` | `/vendors/{vendorId}/reactivate` | ReactivateVendor | `ap.vendors.suspend` | ✓ | — | Restore suspended vendor to active |
| 9 | `POST` | `/vendors/{vendorId}/deactivate` | DeactivateVendor | `ap.vendors.deactivate` | ✓ | — | Permanently deactivate vendor (irreversible) |
| 10 | `PUT` | `/vendors/{vendorId}/bank-details` | UpdateVendorBankDetails | `ap.vendors.update_bank` | ✓ | ✓ | Update bank account (triggers 24h payment hold) |

---

## 2. Invoice Endpoints (15)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 11 | `GET` | `/invoices` | ListInvoices | `ap.invoices.read` | — | — | List invoices with status/vendor/date filters |
| 12 | `POST` | `/invoices` | ReceiveInvoice | `ap.invoices.create` | — | — | Capture new vendor invoice with line items |
| 13 | `GET` | `/invoices/{invoiceId}` | GetInvoice | `ap.invoices.read` | — | — | Get invoice detail with items, match, exceptions |
| 14 | `PUT` | `/invoices/{invoiceId}` | UpdateInvoice | `ap.invoices.update` | ✓ | — | Correct invoice data before validation |
| 15 | `POST` | `/invoices/{invoiceId}/validate` | ValidateInvoice | `ap.invoices.validate` | ✓ | — | Run automated format/tax/date validation |
| 16 | `POST` | `/invoices/{invoiceId}/match` | RunThreeWayMatch | `ap.match.execute` | ✓ | — | Execute 2-way or 3-way matching |
| 17 | `POST` | `/invoices/{invoiceId}/approve` | ApproveInvoice | `ap.invoices.approve` | ✓ | ✓ | Approve invoice for payment (threshold-gated) |
| 18 | `POST` | `/invoices/{invoiceId}/reject` | RejectInvoice | `ap.invoices.reject` | ✓ | — | Reject invoice with reason |
| 19 | `POST` | `/invoices/{invoiceId}/escalate` | EscalateInvoice | `ap.invoices.escalate` | ✓ | — | Escalate to higher approval authority |
| 20 | `POST` | `/invoices/{invoiceId}/schedule-payment` | ScheduleInvoiceForPayment | `ap.invoices.schedule_payment` | ✓ | — | Queue invoice for next payment batch |
| 21 | `POST` | `/invoices/{invoiceId}/block` | BlockInvoice | `ap.invoices.block` | ✓ | — | Block invoice from payment processing |
| 22 | `POST` | `/invoices/{invoiceId}/unblock` | UnblockInvoice | `ap.invoices.unblock` | ✓ | — | Remove payment block |
| 23 | `POST` | `/invoices/{invoiceId}/dispute` | DisputeInvoice | `ap.invoices.dispute` | ✓ | — | Flag invoice for dispute resolution |
| 24 | `POST` | `/invoices/{invoiceId}/resolve-dispute` | ResolveDispute | `ap.invoices.dispute_resolve` | ✓ | — | Mark dispute as resolved |
| 25 | `POST` | `/invoices/{invoiceId}/override` | OverrideMatchResult | `ap.match.override` | ✓ | ✓ | Override match exception with justification |
| 26 | `POST` | `/invoices/{invoiceId}/void` | VoidInvoice | `ap.invoices.void` | ✓ | — | Permanently void invoice (pre-payment only) |

---

## 3. Approval Endpoints (6)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 27 | `GET` | `/approvals` | ListPendingApprovals | `ap.approvals.view` | — | — | List approval chains pending user action |
| 28 | `GET` | `/approvals/{approvalChainId}` | GetApprovalDetail | `ap.approvals.view` | — | — | Get full approval chain with history |
| 29 | `POST` | `/approvals/{approvalChainId}/approve` | ApproveApprovalChain | `ap.approvals.approve` | ✓ | ✓ | Approve current level of chain |
| 30 | `POST` | `/approvals/{approvalChainId}/reject` | RejectApprovalChain | `ap.approvals.reject` | ✓ | — | Reject approval chain with reason |
| 31 | `POST` | `/approvals/{approvalChainId}/delegate` | DelegateApproval | `ap.approvals.delegate` | ✓ | — | Delegate approval to another user |
| 32 | `POST` | `/approvals/{approvalChainId}/escalate` | EscalateApproval | `ap.approvals.escalate` | ✓ | — | Escalate to next authority level |
| 33 | `POST` | `/approvals/{approvalChainId}/recall` | RecallDelegation | `ap.approvals.recall` | ✓ | — | Recall a delegated approval |

---

## 4. Payment Endpoints (10)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 34 | `GET` | `/payments/proposals` | ListPaymentProposals | `ap.payments.read` | — | — | List payment proposals with status filters |
| 35 | `GET` | `/payments/proposals/{proposalId}` | GetPaymentProposal | `ap.payments.read` | — | — | Get proposal detail with invoices and approvals |
| 36 | `POST` | `/payments/proposals/{proposalId}/review` | ReviewPaymentProposal | `ap.payments.review_proposal` | ✓ | — | Review proposal before approval |
| 37 | `POST` | `/payments/proposals/{proposalId}/approve` | ApprovePaymentProposal | `ap.payments.approve_proposal` | ✓ | ✓ | Approve proposal for batch creation |
| 38 | `POST` | `/payments/proposals/{proposalId}/reject` | RejectPaymentProposal | `ap.payments.reject_proposal` | ✓ | — | Reject proposal with reason |
| 39 | `GET` | `/payments/batches` | ListPaymentBatches | `ap.payments.read` | — | — | List payment batches with status/date filters |
| 40 | `GET` | `/payments/batches/{batchId}` | GetPaymentBatch | `ap.payments.read` | — | — | Get batch detail with payments and execution log |
| 41 | `POST` | `/payments/batches/{batchId}/execute` | ExecutePaymentBatch | `ap.payments.execute_batch` | ✓ | ✓ | Execute payment batch (initiate transfers) |
| 42 | `POST` | `/payments/batches/{batchId}/confirm` | ConfirmPaymentBatch | `ap.payments.confirm_batch` | ✓ | ✓ | Confirm successful bank execution |
| 43 | `POST` | `/payments/batches/{batchId}/reverse` | ReversePaymentBatch | `ap.payments.reverse_batch` | ✓ | ✓ | Reverse executed batch (create reversal entries) |
| 44 | `POST` | `/payments/batches/{batchId}/cancel` | CancelPaymentBatch | `ap.payments.cancel_batch` | ✓ | — | Cancel pending batch before execution |

---

## 5. Exception Endpoints (5)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 45 | `GET` | `/exceptions` | ListExceptions | `ap.exceptions.read` | — | — | List exception queue with severity/assignee filters |
| 46 | `GET` | `/exceptions/{exceptionId}` | GetException | `ap.exceptions.read` | — | — | Get exception detail with activity history |
| 47 | `PUT` | `/exceptions/{exceptionId}` | AssignException | `ap.exceptions.assign` | ✓ | — | Assign exception to team member |
| 48 | `POST` | `/exceptions/{exceptionId}/escalate` | EscalateException | `ap.exceptions.escalate` | ✓ | — | Escalate exception severity |
| 49 | `POST` | `/exceptions/{exceptionId}/resolve` | ResolveException | `ap.exceptions.resolve` | ✓ | — | Resolve exception with resolution notes |

---

## 6. Reconciliation Endpoints (5)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 50 | `GET` | `/reconciliations` | ListReconciliations | `ap.reconciliation.read` | — | — | List vendor statement reconciliations |
| 51 | `POST` | `/reconciliations` | ImportReconciliation | `ap.reconciliation.import` | — | — | Import vendor statement (CSV/OFX/QIF) |
| 52 | `GET` | `/reconciliations/{reconciliationId}` | GetReconciliation | `ap.reconciliation.read` | — | — | Get reconciliation detail with matched/unmatched |
| 53 | `POST` | `/reconciliations/{reconciliationId}/run` | RunReconciliation | `ap.reconciliation.run` | ✓ | — | Execute automatic statement matching |
| 54 | `POST` | `/reconciliations/{reconciliationId}/adjust` | AdjustReconciliation | `ap.reconciliation.adjust` | ✓ | — | Manually adjust reconciliation entries |
| 55 | `POST` | `/reconciliations/{reconciliationId}/complete` | CompleteReconciliation | `ap.reconciliation.complete` | ✓ | — | Finalize and close reconciliation |

---

## 7. Credit Note Endpoints (4)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 56 | `GET` | `/credits` | ListCreditNotes | `ap.credits.read` | — | — | List vendor credit notes with status filters |
| 57 | `POST` | `/credits` | CreateCreditNote | `ap.credits.create` | — | — | Record new vendor credit note |
| 58 | `GET` | `/credits/{creditId}` | GetCreditNote | `ap.credits.read` | — | — | Get credit note detail with application history |
| 59 | `POST` | `/credits/{creditId}/apply` | ApplyCredit | `ap.credits.apply` | ✓ | — | Apply credit to specific invoice(s) |
| 60 | `POST` | `/credits/{creditId}/void` | VoidCredit | `ap.credits.void` | ✓ | — | Void unapplied credit note |

---

## 8. Report Endpoints (8)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 61 | `GET` | `/reports/aging` | APAgingReport | `ap.reports.aging` | — | — | AP aging by vendor (current/30/60/90/120+ buckets) |
| 62 | `GET` | `/reports/payment-calendar` | PaymentCalendarReport | `ap.reports.payment_calendar` | — | — | Upcoming payments by due date |
| 63 | `GET` | `/reports/duplicates` | DuplicateDetectionReport | `ap.reports.duplicates` | — | — | Potential duplicate invoices detected by AI |
| 64 | `GET` | `/reports/audit-trail` | AuditTrailReport | `ap.reports.audit_trail` | — | — | Full AP audit trail export |
| 65 | `GET` | `/reports/outstanding-liabilities` | OutstandingLiabilitiesReport | `ap.reports.outstanding` | — | — | Total outstanding AP by vendor/age |
| 66 | `GET` | `/reports/cash-requirements` | CashRequirementsReport | `ap.reports.cash_requirements` | — | — | Cash needed for upcoming payment runs |
| 67 | `GET` | `/reports/analytics` | APAnalyticsReport | `ap.reports.analytics` | — | — | DPO, avg days to pay, approval cycle time |
| 68 | `GET` | `/reports/discount-available` | DiscountAvailableReport | `ap.reports.discount_available` | — | — | Early payment discounts available |

---

## 9. Dashboard Endpoints (1)

| # | Method | Path | Command/Query | Permission | Idempotent | MFA | Description |
|---|---|---|---|---|---|---|---|
| 69 | `GET` | `/dashboard` | APDashboardQuery | `ap.dashboard.view` | — | — | AP summary: total outstanding, aging buckets, pending approvals, recent activity |

---

## Summary Statistics

| Metric | Count |
|---|---|
| **Total Endpoints** | 69 |
| **GET (Queries)** | 22 |
| **POST (Commands)** | 37 |
| **PUT (Updates)** | 4 |
| **DELETE** | 0 |
| **Idempotent Endpoints** | 35 |
| **MFA-Required Endpoints** | 8 |
| **Unique Permissions** | 37 |
| **Aggregates** | 7 + Reports + Dashboard |

### By HTTP Method

| Method | Count | % |
|---|---|---|
| GET | 22 | 32% |
| POST | 37 | 54% |
| PUT | 4 | 6% |
| DELETE | 0 | 0% |

> Note: No `DELETE` endpoints. Destructive operations use `POST /void`, `POST /deactivate`, or `POST /cancel` with mandatory reason fields and audit trails. This aligns with the append-only audit philosophy.

### By Idempotency

| Idempotent | Count | % |
|---|---|---|
| Yes | 35 | 51% |
| No | 34 | 49% |

All financial mutations are idempotent. Non-idempotent endpoints are either read-only (GET) or create operations (POST) where duplicate detection is handled via unique constraints.

### By MFA Requirement

| MFA Required | Count | Endpoints |
|---|---|---|
| Yes | 8 | update bank details, approve invoice, override match, approve proposal, execute batch, confirm batch, reverse batch, approve chain |
| No | 61 | All others |

### Permission Coverage

Every endpoint requires exactly one AP permission. The 37 unique permissions map to the 8 roles defined in AP_PERMISSION_MATRIX.md. Zero endpoints are publicly accessible without authentication.

---

*Document generated as part of Phase 21A.3 — AP Enterprise API Layer.*
