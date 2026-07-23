# Phase 21A.1 — AP Entity Relationship Diagram (V2)

> **Status**: Complete
> **Type**: Text-based ER diagram — ASCII art notation
> **Date**: July 21, 2026
> **Scope**: 25 Prisma models, cross-aggregate FK references, field-level detail, cardinality, financial field inventory
> **Predecessor**: AP_DOMAIN_MODEL.md, AP_AGGREGATES.md, AP_DATABASE_DECISIONS.md

---

## Table of Contents

1. [Aggregate Boundary Diagram](#1-aggregate-boundary-diagram)
2. [Cross-Aggregate FK References](#2-cross-aggregate-fk-references)
3. [Field-Level Detail for Key Tables](#3-field-level-detail-for-key-tables)
4. [Cardinality Summary](#4-cardinality-summary)
5. [Financial Field Inventory](#5-financial-field-inventory)

---

## 1. Aggregate Boundary Diagram

13 aggregates (11 roots + 2 reference entities). Each box is one Prisma model.
Lines between boxes = foreign key references. Indentation shows ownership.

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          ACCOUNTS PAYABLE — AGGREGATE BOUNDARY MAP                                      ║
║                          25 models · 13 aggregates · 12 roots                                           ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 1: VENDOR (Root)                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementVendor                                                    │                           │
│  │  ├─ vendorCode, name, legalName, status, riskLevel, riskScore        │                           │
│  │  ├─ category, taxId, taxCountry, currency, paymentTerms              │                           │
│  │  ├─ creditLimit [D38,12], totalSpend [D38,12], rating [D3,1]         │                           │
│  │  ├─ billingAddress, shippingAddress, bankAccountId                   │                           │
│  │  ├─ preferred, preferredRank, isBlocked, blockReason                 │                           │
│  │  ├─ totalOrders, avgPaymentDays, contactName, contactEmail           │                           │
│  │  ├─ tags [Json], onboardingDate, lastOrderDate                       │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementVendorBankDetail      (child — encrypted banking)                      │
│       │           └─ bankName, routingNumber(enc), accountNumber(enc), accountType, isPrimary        │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementVendorPerformance     (child — immutable per period)                   │
│       │           └─ period, onTimeDelivery, qualityScore, responseTime, overallScore [D5,2]        │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementVendorDocument        (child — compliance docs)                        │
│       │           └─ type, name, expiryDate, status, fileUrl                                        │
│       │                                                                                             │
│       └── 1:N ──► ProcurementVendorCredit          (SIBLING ROOT — see Aggregate 2)                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 2: VENDOR CREDIT (Root)                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementVendorCredit                                              │                           │
│  │  ├─ vendorId FK ► Vendor                                             │                           │
│  │  ├─ creditNumber, creditDate, currency                               │                           │
│  │  ├─ creditAmount [D38,12], appliedAmount [D38,12], remainingAmount [D38,12]                     │
│  │  ├─ status                                                           │                           │
│  │  └─ appliedToInvoiceId FK ► VendorInvoice (optional)                 │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 3: PO REFERENCE (Read-only snapshot)                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementPOReference                                               │                           │
│  │  ├─ poNumber, poId (source), vendorId FK ► Vendor                    │                           │
│  │  ├─ status, orderDate, expectedDeliveryDate, currency                 │                           │
│  │  ├─ totalAmount [D38,12], receivedAmount [D38,12]                    │                           │
│  │  ├─ taxAmount [D38,12], shippingAmount [D38,12]                      │                           │
│  │  ├─ paymentTerms, requestedBy, approvedBy, approvalDate               │                           │
│  │  └─ syncedAt                                                          │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
│       │                                                                                             │
│       └── 1:N ──► ProcurementPOReferenceLineItem  (child — line-level PO snapshot)                  │
│                   └─ lineNumber, quantity [D20,4], unitPrice [D38,12], lineTotal [D38,12]           │
│                      taxRate [D5,4], receivedQuantity [D20,4], invoicedQuantity [D20,4]             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 4: GRN REFERENCE (Read-only snapshot)                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementGRNReference                                              │                           │
│  │  ├─ grnNumber, grnId (source)                                        │                           │
│  │  ├─ poReferenceId FK ► POReference                                   │                           │
│  │  ├─ vendorId FK ► Vendor                                             │                           │
│  │  ├─ receiptDate, status, receivedBy, warehouseLocation               │                           │
│  │  ├─ totalValue [D38,12], totalTax [D38,12]                          │                           │
│  │  └─ syncedAt                                                          │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
│       │                                                                                             │
│       └── 1:N ──► ProcurementGRNReferenceLineItem (child — line-level GRN snapshot)                 │
│                   └─ poReferenceLineItemId FK ► POReferenceLineItem                                 │
│                      quantityReceived [D20,4], quantityAccepted [D20,4], unitPrice [D38,12]         │
│                      lineTotal [D38,12], condition                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 5: VENDOR INVOICE ★ (CORE ROOT)                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  ProcurementVendorInvoice (60+ fields — the central table of AP)                             │   │
│  │                                                                                              │   │
│  │  ┌─ IDENTITY ──────────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │  vendorId FK ► Vendor, invoiceNumber, invoiceDate, dueDate, receivedDate               │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                              │   │
│  │  ┌─ STATUS & LIFECYCLE ───────────────────────────────────────────────────────────────────┐  │   │
│  │  │  status [Enum: DRAFT→CAPTURED→VALIDATED→MATCHED→APPROVED→PAID→VOIDED]                  │  │   │
│  │  │  previousStatus, statusChangedAt                                                       │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                              │   │
│  │  ┌─ CROSS-AGGREGATE REFERENCES ──────────────────────────────────────────────────────────┐  │   │
│  │  │  poReferenceId FK ► POReference (optional)                                            │  │   │
│  │  │  grnReferenceId FK ► GRNReference (optional)                                          │  │   │
│  │  │  paymentBatchId FK ► PaymentBatch (optional)                                          │  │   │
│  │  │  paymentProposalId FK ► PaymentProposal (optional)                                    │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                              │   │
│  │  ┌─ FINANCIAL [all Decimal(38,12)] ───────────────────────────────────────────────────────┐  │   │
│  │  │  currency, exchangeRate [D20,8], baseCurrency                                         │  │   │
│  │  │  subtotal, taxAmount, discountAmount, shippingAmount                                  │  │   │
│  │  │  totalAmount (derived), totalWithTax (derived)                                        │  │   │
│  │  │  amountPaid, balanceDue (derived), creditApplied                                      │  │   │
│  │  │  netBalance (derived), varianceAmount, varianceThreshold [D5,2]                       │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                              │   │
│  │  ┌─ MATCHING & DUPLICATE ────────────────────────────────────────────────────────────────┐  │   │
│  │  │  matchResult, ocrConfidence [D5,2], ocrRawText                                        │  │   │
│  │  │  isDuplicateSuspicion, duplicateConfidence [D5,2], duplicateOfInvoiceId FK (self)      │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                              │   │
│  │  ┌─ APPROVAL ────────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │  approvalRequired, approvedAt, approvedBy, rejectedAt, rejectedBy, rejectionReason     │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                              │   │
│  │  ┌─ GL & PAYMENT ────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │  glAccountId, costCenterId, departmentId, projectId                                   │  │   │
│  │  │  accrualPosted, accrualReversed, glPosted, glPostedAt, periodId                       │  │   │
│  │  │  paymentDate, paymentReference, checkNumber                                           │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                              │   │
│  │  ┌─ META ────────────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │  description, vendorMemo, internalMemo, source [Enum]                                │  │   │
│  │  │  idempotencyKey (unique), version [Int] — optimistic concurrency                     │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementInvoiceLineItem     (child — line items with tax/GL/match)             │
│       │           └─ lineNumber, quantity [D20,4], unitPrice [D38,12], lineTotal [D38,12]           │
│       │              discountPercent [D5,2], discountAmount [D38,12], netLineTotal [D38,12]          │
│       │              taxRate [D5,4], taxAmount [D38,12], taxJurisdiction, taxType                    │
│       │              glAccountId, costCenterId, departmentId, projectId                              │
│       │              poReferenceLineItemId FK ► POReferenceLineItem                                  │
│       │              grnReferenceLineItemId FK ► GRNReferenceLineItem                                │
│       │              matchStatus, matchVariance [D38,12]                                            │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementInvoiceAttachment   (child — documents/OCR)                            │
│       │           └─ fileName, fileType, fileSize, storageUrl, category, ocrExtracted               │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementApprovalRecord      (SIBLING ROOT — see Aggregate 6)                   │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementInvoiceException    (SIBLING ROOT — see Aggregate 7)                   │
│       │                                                                                             │
│       ├── 1:1 ──► ProcurementThreeWayMatch       (SIBLING ROOT — see Aggregate 8)                   │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementPaymentProposalItem (child of PaymentProposal — see Aggregate 9)       │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementPaymentRecord       (SIBLING ROOT — see Aggregate 11)                  │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementVendorStatementLine (child of VendorStatement — cross-ref)             │
│       │                                                                                             │
│       └── 1:N ──► ProcurementVendorCredit        (reverse — appliedToInvoiceId)                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 6: APPROVAL RECORD (Root — per-invoice chain)                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementApprovalRecord                                            │                           │
│  │  ├─ vendorInvoiceId FK ► VendorInvoice                              │                           │
│  │  ├─ approvalLevel [Int], approvalLevelName, requiredRole             │                           │
│  │  ├─ requiredThreshold [D38,12]                                       │                           │
│  │  ├─ status [Enum: PENDING/APPROVED/REJECTED/DELEGATED/SKIPPED]       │                           │
│  │  ├─ decision, decisionAt, decisionBy, decisionComment                │                           │
│  │  ├─ delegatedTo, delegatedAt, delegationReason                       │                           │
│  │  ├─ escalated, escalatedAt, escalationReason                         │                           │
│  │  ├─ timeLimit                                                        │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 7: INVOICE EXCEPTION (Root)                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementInvoiceException                                          │                           │
│  │  ├─ vendorInvoiceId FK ► VendorInvoice                              │                           │
│  │  ├─ exceptionType [Enum: 9 types], severity [Enum: LOW→CRITICAL]    │                           │
│  │  ├─ description, varianceAmount [D38,12], relatedEntityId            │                           │
│  │  ├─ status [Enum: OPEN/IN_REVIEW/RESOLVED/WAIVED/ESCALATED]         │                           │
│  │  ├─ assignedTo, resolution, resolvedAt, resolvedBy                   │                           │
│  │  ├─ escalatedTo, escalatedAt                                         │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 8: THREE-WAY MATCH (Root)                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementThreeWayMatch                                             │                           │
│  │  ├─ vendorInvoiceId FK ► VendorInvoice (UNIQUE)                     │                           │
│  │  ├─ poReferenceId FK ► POReference                                   │                           │
│  │  ├─ grnReferenceId FK ► GRNReference                                 │                           │
│  │  ├─ matchResult [Enum: FULL/PARTIAL/PRICE/QTY/NO_MATCH]             │                           │
│  │  ├─ overallConfidence [D5,2]                                         │                           │
│  │  ├─ priceVarianceTotal [D38,12], quantityVarianceTotal [D38,12]      │                           │
│  │  ├─ totalVariance [D38,12] (derived), variancePercent [D5,2]         │                           │
│  │  ├─ autoApproved, approvalThreshold [D5,2]                           │                           │
│  │  ├─ matchedAt, matchedBy                                             │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
│       │                                                                                             │
│       └── 1:N ──► ProcurementMatchLineItem     (child — per-line match result)                      │
│                   └─ invoiceLineItemId FK ► InvoiceLineItem                                         │
│                      poReferenceLineItemId FK ► POReferenceLineItem (optional)                       │
│                      grnReferenceLineItemId FK ► GRNReferenceLineItem (optional)                     │
│                      matchStatus, invoiceQuantity [D20,4], invoiceUnitPrice [D38,12]                │
│                      poQuantity [D20,4]?, poUnitPrice [D38,12]?                                     │
│                      grnQuantity [D20,4]?, priceVariance [D38,12]                                   │
│                      quantityVariance [D20,4], confidence [D5,2]                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 9: PAYMENT PROPOSAL (Root)                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementPaymentProposal                                           │                           │
│  │  ├─ proposalNumber, status, proposalDate, paymentDate                │                           │
│  │  ├─ currency, paymentMethod                                           │                           │
│  │  ├─ totalAmount [D38,12] (derived), totalInvoices, totalVendors      │                           │
│  │  ├─ prioritizeDiscounts, includePartialPayments                      │                           │
│  │  ├─ submittedBy, submittedAt, reviewedBy, reviewedAt                 │                           │
│  │  ├─ approvedBy, approvedAt, rejectedBy, rejectionReason              │                           │
│  │  ├─ paymentBatchId FK ► PaymentBatch (optional)                      │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
│       │                                                                                             │
│       └── 1:N ──► ProcurementPaymentProposalItem (child — one per invoice in proposal)              │
│                   └─ vendorInvoiceId FK ► VendorInvoice                                             │
│                      vendorId FK ► Vendor                                                           │
│                      amount [D38,12], discountTaken [D38,12], creditApplied [D38,12]               │
│                      netPayment [D38,12] (derived), paymentPriority, selectedBy, notes              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 10: PAYMENT BATCH (Root)                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementPaymentBatch                                              │                           │
│  │  ├─ batchNumber, paymentProposalId FK ► PaymentProposal (UNIQUE)     │                           │
│  │  ├─ status [Enum: PENDING→GENERATING→READY→SUBMITTED→COMPLETED]      │                           │
│  │  ├─ paymentMethod, bankAccountId                                      │                           │
│  │  ├─ totalPayments, totalAmount [D38,12] (derived)                    │                           │
│  │  ├─ totalFees [D38,12], netDisbursement [D38,12] (derived)           │                           │
│  │  ├─ fileUrl, fileName, submittedAt, completedAt, confirmedBy         │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
│       │                                                                                             │
│       └── 1:N ──► ProcurementPaymentRecord      (SIBLING ROOT — see Aggregate 11)                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 11: PAYMENT RECORD (Root)                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementPaymentRecord                                             │                           │
│  │  ├─ paymentNumber                                                    │                           │
│  │  ├─ paymentBatchId FK ► PaymentBatch                                 │                           │
│  │  ├─ vendorInvoiceId FK ► VendorInvoice                               │                           │
│  │  ├─ vendorId FK ► Vendor                                             │                           │
│  │  ├─ paymentDate, amount [D38,12], discountTaken [D38,12]            │                           │
│  │  ├─ creditApplied [D38,12], netPayment [D38,12] (derived)           │                           │
│  │  ├─ currency, exchangeRate [D20,8], baseCurrencyAmount [D38,12]     │                           │
│  │  ├─ paymentMethod, bankAccountId, transactionReference, checkNumber  │                           │
│  │  ├─ status [Enum: PROCESSED/CLEARED/VOIDED/FAILED/REVERSED]         │                           │
│  │  ├─ glPosted, glPostedAt, glReversalPosted                           │                           │
│  │  ├─ idempotencyKey (unique)                                          │                           │
│  │  ├─ voidedAt, voidedBy, voidReason                                   │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 12: VENDOR STATEMENT (Root)                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementVendorStatement                                           │                           │
│  │  ├─ vendorId FK ► Vendor                                             │                           │
│  │  ├─ statementNumber, statementDate, periodStart, periodEnd           │                           │
│  │  ├─ openingBalance [D38,12], totalInvoices [D38,12]                 │                           │
│  │  ├─ totalPayments [D38,12], totalCredits [D38,12]                   │                           │
│  │  ├─ closingBalance [D38,12] (derived), currency                     │                           │
│  │  ├─ status [Enum: RECEIVED→PARSING→PARSED→RECONCILING→RECONCILED]   │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
│       │                                                                                             │
│       ├── 1:N ──► ProcurementVendorStatementLine (child — parsed transactions)                      │
│       │           └─ transactionDate, reference, description                                        │
│       │              debitAmount [D38,12], creditAmount [D38,12], balance [D38,12]                   │
│       │              transactionType [Enum]                                                          │
│       │              matchedInvoiceId FK ► VendorInvoice (optional)                                 │
│       │              matchedPaymentId FK ► PaymentRecord (optional)                                 │
│       │              matchStatus [Enum]                                                             │
│       │                                                                                             │
│       └── 1:1 ──► ProcurementReconciliationResult (SIBLING ROOT — see Aggregate 13)                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 13: RECONCILIATION RESULT (Root)                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementReconciliationResult                                      │                           │
│  │  ├─ vendorStatementId FK ► VendorStatement (UNIQUE)                 │                           │
│  │  ├─ vendorId FK ► Vendor                                             │                           │
│  │  ├─ reconciliationDate                                               │                           │
│  │  ├─ apBalance [D38,12], vendorBalance [D38,12]                      │                           │
│  │  ├─ balanceVariance [D38,12] (derived)                               │                           │
│  │  ├─ totalLines, matchedLines, unmatchedLines (derived)              │                           │
│  │  ├─ matchRate [D5,2] (derived)                                       │                           │
│  │  ├─ status [Enum: IN_PROGRESS/COMPLETED/EXCEPTION/ADJUSTED]          │                           │
│  │  ├─ adjustmentAmount [D38,12], adjustmentReason, adjustedBy          │                           │
│  │  ├─ resolvedBy, resolvedAt                                            │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE 14: CONFIGURATION — APPROVAL LEVEL (Root — company-wide config)                          │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementApprovalLevel                                             │                           │
│  │  ├─ levelNumber [Int, UNIQUE per company]                            │                           │
│  │  ├─ levelName, minAmount [D38,12], maxAmount [D38,12]?              │                           │
│  │  ├─ requiredRole [String[]], requiredDepartment?                     │                           │
│  │  ├─ canDelegate, canEscalate, timeLimitHours                         │                           │
│  │  ├─ isActive                                                         │                           │
│  │  └─ version [Int] — optimistic concurrency                           │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  CROSS-CUTTING: AUDIT TRAIL (Append-Only — no version, no updatedAt)                                │
│  ┌──────────────────────────────────────────────────────────────────────┐                           │
│  │  ProcurementAPAuditRecord                                             │                           │
│  │  ├─ entityType, entityId                                              │                           │
│  │  ├─ action [Enum: 12 audit actions]                                   │                           │
│  │  ├─ field?, oldValue? [Text], newValue? [Text]                       │                           │
│  │  ├─ amount [D38,12]?                                                  │                           │
│  │  ├─ description [Text], reason? [Text]                                │                           │
│  │  ├─ userId, userRole, ipAddress?, userAgent?, correlationId?          │                           │
│  │  ├─ metadata [Json?]                                                  │                           │
│  │  └─ createdAt (ONLY timestamp — no updatedAt)                         │                           │
│  └──────────────────────────────────────────────────────────────────────┘                           │
│  Reads from ALL aggregates — never updated, never deleted.                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cross-Aggregate FK References

All FK references between aggregates (by definition, ID-only — never embed objects).

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                     CROSS-AGGREGATE FOREIGN KEY MAP                                   │
│                                                                                       │
│  Legend:  ──FK──►  foreign key reference                                             │
│          [U]       unique constraint on FK                                           │
│          [opt]     nullable FK                                                       │
│          [self]    self-referential FK                                                │
└───────────────────────────────────────────────────────────────────────────────────────┘

VENDOR INVOICE (hub — most FK references)
  │
  ├── vendorId FK ►────────────────── ProcurementVendor                    [required]
  ├── poReferenceId FK [opt] ►─────── ProcurementPOReference               [optional]
  ├── grnReferenceId FK [opt] ►────── ProcurementGRNReference              [optional]
  ├── paymentBatchId FK [opt] ►────── ProcurementPaymentBatch              [optional]
  ├── paymentProposalId FK [opt] ►─── ProcurementPaymentProposal           [optional]
  ├── duplicateOfInvoiceId FK [self] ► ProcurementVendorInvoice            [optional]
  │
  ├── ◄── ProcurementThreeWayMatch.vendorInvoiceId [U]                     [required]
  ├── ◄── ProcurementInvoiceException.vendorInvoiceId                      [required]
  ├── ◄── ProcurementApprovalRecord.vendorInvoiceId                        [required]
  ├── ◄── ProcurementPaymentProposalItem.vendorInvoiceId                   [required]
  ├── ◄── ProcurementPaymentRecord.vendorInvoiceId                         [required]
  ├── ◄── ProcurementVendorCredit.appliedToInvoiceId                       [optional]
  └── ◄── ProcurementVendorStatementLine.matchedInvoiceId                  [optional]

VENDOR
  │
  ├── ◄── ProcurementVendorBankDetail.vendorId                              [required]
  ├── ◄── ProcurementVendorPerformance.vendorId                             [required]
  ├── ◄── ProcurementVendorDocument.vendorId                                [required]
  ├── ◄── ProcurementVendorCredit.vendorId                                  [required]
  ├── ◄── ProcurementPOReference.vendorId                                   [required]
  ├── ◄── ProcurementGRNReference.vendorId                                  [required]
  ├── ◄── ProcurementPaymentProposalItem.vendorId                           [required]
  ├── ◄── ProcurementPaymentRecord.vendorId                                 [required]
  ├── ◄── ProcurementVendorStatement.vendorId                               [required]
  └── ◄── ProcurementReconciliationResult.vendorId                          [required]

PO REFERENCE
  │
  ├── ◄── ProcurementPOReferenceLineItem.poReferenceId                      [required]
  ├── ◄── ProcurementGRNReference.poReferenceId                             [required]
  └── ◄── ProcurementThreeWayMatch.poReferenceId                            [required]

PO REFERENCE LINE ITEM
  │
  ├── ◄── ProcurementGRNReferenceLineItem.poReferenceLineItemId             [required]
  └── ◄── ProcurementInvoiceLineItem.poReferenceLineItemId                  [optional]

GRN REFERENCE
  │
  ├── ◄── ProcurementGRNReferenceLineItem.grnReferenceId                    [required]
  └── ◄── ProcurementThreeWayMatch.grnReferenceId                           [required]

GRN REFERENCE LINE ITEM
  │
  └── ◄── ProcurementMatchLineItem.grnReferenceLineItemId                   [optional]

INVOICE LINE ITEM
  │
  └── ◄── ProcurementMatchLineItem.invoiceLineItemId                        [required]

THREE-WAY MATCH
  │
  └── ◄── ProcurementMatchLineItem.threeWayMatchId                          [required]

PAYMENT PROPOSAL
  │
  ├── ◄── ProcurementPaymentProposalItem.paymentProposalId                  [required]
  └── ◄── ProcurementPaymentBatch.paymentProposalId [U]                     [required]

PAYMENT BATCH
  │
  └── ◄── ProcurementPaymentRecord.paymentBatchId                           [required]

PAYMENT RECORD
  │
  └── ◄── ProcurementVendorStatementLine.matchedPaymentId                   [optional]

VENDOR STATEMENT
  │
  ├── ◄── ProcurementVendorStatementLine.vendorStatementId                  [required]
  └── ◄── ProcurementReconciliationResult.vendorStatementId [U]             [required]
```

### FK Summary Table

| Source Model | FK Field | Target Model | Required? | Unique? |
|---|---|---|---|---|
| ProcurementVendorBankDetail | vendorId | ProcurementVendor | Yes | No |
| ProcurementVendorPerformance | vendorId | ProcurementVendor | Yes | No |
| ProcurementVendorDocument | vendorId | ProcurementVendor | Yes | No |
| ProcurementVendorCredit | vendorId | ProcurementVendor | Yes | No |
| ProcurementVendorCredit | appliedToInvoiceId | ProcurementVendorInvoice | No | No |
| ProcurementPOReference | vendorId | ProcurementVendor | Yes | No |
| ProcurementPOReferenceLineItem | poReferenceId | ProcurementPOReference | Yes | No |
| ProcurementGRNReference | poReferenceId | ProcurementPOReference | Yes | No |
| ProcurementGRNReference | vendorId | ProcurementVendor | Yes | No |
| ProcurementGRNReferenceLineItem | grnReferenceId | ProcurementGRNReference | Yes | No |
| ProcurementGRNReferenceLineItem | poReferenceLineItemId | ProcurementPOReferenceLineItem | Yes | No |
| ProcurementVendorInvoice | vendorId | ProcurementVendor | Yes | No |
| ProcurementVendorInvoice | poReferenceId | ProcurementPOReference | No | No |
| ProcurementVendorInvoice | grnReferenceId | ProcurementGRNReference | No | No |
| ProcurementVendorInvoice | paymentBatchId | ProcurementPaymentBatch | No | No |
| ProcurementVendorInvoice | paymentProposalId | ProcurementPaymentProposal | No | No |
| ProcurementVendorInvoice | duplicateOfInvoiceId | ProcurementVendorInvoice | No | No |
| ProcurementInvoiceLineItem | vendorInvoiceId | ProcurementVendorInvoice | Yes | No |
| ProcurementInvoiceLineItem | poReferenceLineItemId | ProcurementPOReferenceLineItem | No | No |
| ProcurementInvoiceLineItem | grnReferenceLineItemId | ProcurementGRNReferenceLineItem | No | No |
| ProcurementInvoiceAttachment | vendorInvoiceId | ProcurementVendorInvoice | Yes | No |
| ProcurementThreeWayMatch | vendorInvoiceId | ProcurementVendorInvoice | Yes | **Yes** |
| ProcurementThreeWayMatch | poReferenceId | ProcurementPOReference | Yes | No |
| ProcurementThreeWayMatch | grnReferenceId | ProcurementGRNReference | Yes | No |
| ProcurementMatchLineItem | threeWayMatchId | ProcurementThreeWayMatch | Yes | No |
| ProcurementMatchLineItem | invoiceLineItemId | ProcurementInvoiceLineItem | Yes | No |
| ProcurementMatchLineItem | poReferenceLineItemId | ProcurementPOReferenceLineItem | No | No |
| ProcurementMatchLineItem | grnReferenceLineItemId | ProcurementGRNReferenceLineItem | No | No |
| ProcurementInvoiceException | vendorInvoiceId | ProcurementVendorInvoice | Yes | No |
| ProcurementApprovalRecord | vendorInvoiceId | ProcurementVendorInvoice | Yes | No |
| ProcurementPaymentProposal | paymentBatchId | ProcurementPaymentBatch | No | No |
| ProcurementPaymentProposalItem | paymentProposalId | ProcurementPaymentProposal | Yes | No |
| ProcurementPaymentProposalItem | vendorInvoiceId | ProcurementVendorInvoice | Yes | No |
| ProcurementPaymentProposalItem | vendorId | ProcurementVendor | Yes | No |
| ProcurementPaymentBatch | paymentProposalId | ProcurementPaymentProposal | Yes | **Yes** |
| ProcurementPaymentRecord | paymentBatchId | ProcurementPaymentBatch | Yes | No |
| ProcurementPaymentRecord | vendorInvoiceId | ProcurementVendorInvoice | Yes | No |
| ProcurementPaymentRecord | vendorId | ProcurementVendor | Yes | No |
| ProcurementVendorStatement | vendorId | ProcurementVendor | Yes | No |
| ProcurementVendorStatementLine | vendorStatementId | ProcurementVendorStatement | Yes | No |
| ProcurementVendorStatementLine | matchedInvoiceId | ProcurementVendorInvoice | No | No |
| ProcurementVendorStatementLine | matchedPaymentId | ProcurementPaymentRecord | No | No |
| ProcurementReconciliationResult | vendorStatementId | ProcurementVendorStatement | Yes | **Yes** |
| ProcurementReconciliationResult | vendorId | ProcurementVendor | Yes | No |

**Total**: 44 FK references across 25 models.

---

## 3. Field-Level Detail for Key Tables

### 3.1 ProcurementVendor (Identity + Financial + Status)

```
ProcurementVendor
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PK   id                    String          @id @default(cuid())                 │
│ FK   companyId             String          (→ Company)                          │
│      ─── Identity ───────────────────────────────────────────────────────────── │
│      vendorCode            String          UNIQUE(companyId, vendorCode)        │
│      name                  String          1–255 chars                          │
│      legalName             String          1–255 chars                          │
│      status                VendorStatus    @default(PENDING_REVIEW)             │
│      riskLevel             VendorRiskLevel @default(LOW)                        │
│      riskScore             Decimal(5,2)    @default(0)                          │
│      category              VendorCategory                                      │
│      ─── Tax & Compliance ──────────────────────────────────────────────────── │
│      taxId                 String          UNIQUE(companyId, taxId)             │
│      taxCountry            String          ISO 3166-1 alpha-2                   │
│      ─── Financial Defaults ────────────────────────────────────────────────── │
│      currency              String          @default("USD") ISO 4217             │
│      paymentTerms          String          @default("NET30")                    │
│      preferredPaymentMethod VendorPreferredPaymentMethod @default(ACH)          │
│      creditLimit           Decimal(38,12)  @default(0) ≥0                      │
│      totalSpend            Decimal(38,12)  @default(0) ≥0   [aggregate]        │
│      totalOrders           Int             @default(0) ≥0    [aggregate]        │
│      avgPaymentDays        Int             @default(0) ≥0    [aggregate]        │
│      rating                Decimal(3,1)    @default(0) 0.0–5.0                 │
│      ─── Contact ───────────────────────────────────────────────────────────── │
│      contactName           String?                                              │
│      contactEmail          String?                                              │
│      contactPhone          String?                                              │
│      ─── Address ───────────────────────────────────────────────────────────── │
│      billingAddress        String?                                              │
│      shippingAddress       String?                                              │
│      ─── Banking ───────────────────────────────────────────────────────────── │
│      bankAccountId         String?         (→ Banking context)                 │
│      ─── Ranking ───────────────────────────────────────────────────────────── │
│      preferred             Boolean         @default(false)                      │
│      preferredRank         Int?            ≥1                                   │
│      ─── Blocking ──────────────────────────────────────────────────────────── │
│      isBlocked             Boolean         @default(false)                      │
│      blockReason           String?                                              │
│      ─── Meta ──────────────────────────────────────────────────────────────── │
│      tags                  String[]        @default([]) [Json]                  │
│      onboardingDate        DateTime        @default(now())                      │
│      lastOrderDate         DateTime?                                            │
│      ─── Audit ─────────────────────────────────────────────────────────────── │
│      createdAt             DateTime        @default(now())                      │
│      updatedAt             DateTime        @updatedAt                           │
│      createdBy             String                                             │
│      updatedBy             String                                             │
│      ─── Concurrency ──────────────────────────────────────────────────────── │
│      version               Int             @default(0)                          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 ProcurementVendorInvoice (Central — 60+ fields)

```
ProcurementVendorInvoice
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PK   id                    String          @id @default(cuid())                 │
│ FK   companyId             String          (→ Company)                          │
│      ─── Identity ───────────────────────────────────────────────────────────── │
│ FK   vendorId              String          (→ Vendor)                           │
│      invoiceNumber         String          UNIQUE(companyId,vendorId,inv#)      │
│      invoiceDate           DateTime                                             │
│      dueDate               DateTime                                             │
│      receivedDate          DateTime        @default(now())                      │
│      ─── Status ────────────────────────────────────────────────────────────── │
│      status                VendorInvoiceStatus @default(DRAFT)  [14 states]     │
│      previousStatus        VendorInvoiceStatus?                                │
│      statusChangedAt       DateTime?                                            │
│      ─── Cross-Aggregate References ────────────────────────────────────────── │
│ FK   poReferenceId         String?         (→ POReference)                     │
│ FK   grnReferenceId        String?         (→ GRNReference)                    │
│ FK   paymentBatchId        String?         (→ PaymentBatch)                    │
│ FK   paymentProposalId     String?         (→ PaymentProposal)                 │
│      ─── Currency & FX ────────────────────────────────────────────────────── │
│      currency              String          ISO 4217 @default("USD")            │
│      exchangeRate          Decimal(20,8)   @default(1.0) >0                    │
│      baseCurrency          String          ISO 4217 @default("USD")            │
│      ─── Financial [all Decimal(38,12)] ────────────────────────────────────── │
│      subtotal              Decimal(38,12)  ≥0                                   │
│      taxAmount             Decimal(38,12)  @default(0) ≥0                       │
│      discountAmount        Decimal(38,12)  @default(0) ≥0                       │
│      shippingAmount        Decimal(38,12)  @default(0) ≥0                       │
│      totalAmount           Decimal(38,12)  DERIVED: sub+tax+ship-disc          │
│      totalWithTax          Decimal(38,12)  DERIVED: sub+tax                    │
│      amountPaid            Decimal(38,12)  @default(0) ≥0                       │
│      balanceDue            Decimal(38,12)  DERIVED: total-paid                 │
│      creditApplied         Decimal(38,12)  @default(0) ≥0                       │
│      netBalance            Decimal(38,12)  DERIVED: balance-credit             │
│      ─── Matching ─────────────────────────────────────────────────────────── │
│      matchResult           VendorInvoiceMatchResult?                           │
│      varianceAmount        Decimal(38,12)  @default(0)                          │
│      varianceThreshold     Decimal(5,2)    @default(5.00)                       │
│      ─── Duplicate Detection ──────────────────────────────────────────────── │
│      isDuplicateSuspicion  Boolean         @default(false)                      │
│      duplicateConfidence   Decimal(5,2)    0.00–100.00                         │
│ FK   duplicateOfInvoiceId  String?         (→ self)                            │
│      ─── OCR ──────────────────────────────────────────────────────────────── │
│      ocrConfidence         Decimal(5,2)    0.00–100.00                         │
│      ocrRawText            String?         @db.Text                             │
│      ─── Approval ─────────────────────────────────────────────────────────── │
│      approvalRequired      Boolean         @default(false)                      │
│      approvedAt            DateTime?                                            │
│      approvedBy            String?                                             │
│      rejectedAt            DateTime?                                            │
│      rejectedBy            String?                                             │
│      rejectionReason       String?                                              │
│      ─── GL Coding ────────────────────────────────────────────────────────── │
│      glAccountId           String?                                             │
│      costCenterId          String?                                             │
│      departmentId          String?                                             │
│      projectId             String?                                             │
│      accrualPosted         Boolean         @default(false)                      │
│      accrualReversed       Boolean         @default(false)                      │
│      glPosted              Boolean         @default(false)                      │
│      glPostedAt            DateTime?                                            │
│      periodId              String?                                              │
│      ─── Payment Info ─────────────────────────────────────────────────────── │
│      paymentMethod         VendorInvoicePaymentMethod?                         │
│      paymentDate           DateTime?                                            │
│      paymentReference      String?                                              │
│      checkNumber           String?                                              │
│      ─── Memo ─────────────────────────────────────────────────────────────── │
│      description           String?         @db.Text                             │
│      vendorMemo            String?                                              │
│      internalMemo          String?                                              │
│      ─── Source ───────────────────────────────────────────────────────────── │
│      source                VendorInvoiceSource @default(MANUAL)                │
│      ─── Idempotency ──────────────────────────────────────────────────────── │
│      idempotencyKey        String?         @unique                              │
│      ─── Audit ────────────────────────────────────────────────────────────── │
│      createdAt             DateTime        @default(now())                      │
│      updatedAt             DateTime        @updatedAt                           │
│      createdBy             String                                             │
│      updatedBy             String                                             │
│      ─── Concurrency ──────────────────────────────────────────────────────── │
│      version               Int             @default(0)                          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 ProcurementThreeWayMatch (Result + Variances)

```
ProcurementThreeWayMatch
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PK   id                    String          @id @default(cuid())                 │
│ FK   companyId             String          (→ Company)                          │
│ FK   vendorInvoiceId       String          UNIQUE(companyId,vendorInvoiceId)    │
│ FK   poReferenceId         String          (→ POReference)                      │
│ FK   grnReferenceId        String          (→ GRNReference)                     │
│      ─── Result ────────────────────────────────────────────────────────────── │
│      matchResult           ThreeWayMatchResult   [FULL/PARTIAL/PRICE/QTY/NO]   │
│      overallConfidence     Decimal(5,2)    0.00–100.00                          │
│      autoApproved          Boolean         @default(false)                       │
│      approvalThreshold     Decimal(5,2)    @default(5.00)                        │
│      ─── Variances [all Decimal(38,12)] ────────────────────────────────────── │
│      priceVarianceTotal    Decimal(38,12)  @default(0) ≥0                        │
│      quantityVarianceTotal Decimal(38,12)  @default(0) ≥0                        │
│      totalVariance         Decimal(38,12)  DERIVED: price+qty                   │
│      variancePercent       Decimal(5,2)    @default(0)                           │
│      ─── Audit ─────────────────────────────────────────────────────────────── │
│      matchedAt             DateTime        @default(now())                       │
│      matchedBy             String          "SYSTEM" or userId                    │
│      createdAt             DateTime        @default(now())                       │
│      updatedAt             DateTime        @updatedAt                            │
│      createdBy             String                                              │
│      updatedBy             String                                              │
│      ─── Concurrency ──────────────────────────────────────────────────────── │
│      version               Int             @default(0)                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 ProcurementPaymentRecord (Financial Evidence)

```
ProcurementPaymentRecord
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PK   id                    String          @id @default(cuid())                 │
│ FK   companyId             String          (→ Company)                          │
│      paymentNumber         String          UNIQUE(companyId,paymentNumber)      │
│ FK   paymentBatchId        String          (→ PaymentBatch)                     │
│ FK   vendorInvoiceId       String          (→ VendorInvoice)                    │
│ FK   vendorId              String          (→ Vendor)                           │
│      ─── IMMUTABLE after creation ───────────────────────────────────────────── │
│      paymentDate           DateTime                                             │
│      amount                Decimal(38,12)  >0                                   │
│      discountTaken         Decimal(38,12)  @default(0) ≥0                       │
│      creditApplied         Decimal(38,12)  @default(0) ≥0                       │
│      netPayment            Decimal(38,12)  DERIVED: amt-disc-credit            │
│      currency              String          ISO 4217 @default("USD")            │
│      exchangeRate          Decimal(20,8)   @default(1.0) >0                     │
│      baseCurrencyAmount    Decimal(38,12)  DERIVED: net × rate                 │
│      paymentMethod         PaymentRecordStatus                                  │
│      bankAccountId         String                                              │
│      transactionReference  String?                                             │
│      checkNumber           String?                                             │
│      idempotencyKey        String?         @unique                              │
│      ─── MUTABLE (status transitions) ──────────────────────────────────────── │
│      status                PaymentRecordStatus @default(PROCESSED)              │
│      glPosted              Boolean         @default(false)                       │
│      glPostedAt            DateTime?                                            │
│      glReversalPosted      Boolean         @default(false)                      │
│      voidedAt              DateTime?                                            │
│      voidedBy              String?                                              │
│      voidReason            String?                                              │
│      ─── Audit ─────────────────────────────────────────────────────────────── │
│      createdAt             DateTime        @default(now())                       │
│      updatedAt             DateTime        @updatedAt                            │
│      createdBy             String                                              │
│      updatedBy             String                                              │
│      ─── Concurrency ──────────────────────────────────────────────────────── │
│      version               Int             @default(0)                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 ProcurementAPAuditRecord (Append-Only Audit Trail)

```
ProcurementAPAuditRecord
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PK   id                    String          @id @default(cuid())                 │
│ FK   companyId             String          (→ Company)                          │
│      ─── Entity Reference ──────────────────────────────────────────────────── │
│      entityType            String          "VendorInvoice", "PaymentRecord"…    │
│      entityId              String          ID of affected entity                │
│      ─── Action ────────────────────────────────────────────────────────────── │
│      action                APAuditAction   [12 actions: CREATED→CONFIG_CHANGED] │
│      field                 String?         Changed field (UPDATE actions)        │
│      oldValue              String? @db.Text  Previous value (JSON stringified)   │
│      newValue              String? @db.Text  New value (JSON stringified)        │
│      amount                Decimal(38,12)? Financial amount (if applicable)     │
│      ─── Description ───────────────────────────────────────────────────────── │
│      description           String  @db.Text  Human-readable description         │
│      reason                String? @db.Text  Business reason                    │
│      ─── Actor ─────────────────────────────────────────────────────────────── │
│      userId                String          Actor userId                         │
│      userRole              String          Actor role at time of action          │
│      ipAddress             String?         Request IP                           │
│      userAgent             String?         Request user agent                   │
│      correlationId         String?         Request correlation ID               │
│      ─── Metadata ──────────────────────────────────────────────────────────── │
│      metadata              Json?           Action-specific structured data      │
│      ─── Timestamp (ONLY createdAt — no updatedAt) ────────────────────────── │
│      createdAt             DateTime        @default(now())                       │
│      ─── NO version field (append-only — never updated) ────────────────────── │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Cardinality Summary

| Parent | Child | Relationship | Parent PK → Child FK | Cascade |
|---|---|---|---|---|
| ProcurementVendor | ProcurementVendorBankDetail | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementVendorPerformance | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementVendorDocument | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementVendorCredit | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementVendorInvoice | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementPOReference | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementGRNReference | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementPaymentProposalItem | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementPaymentRecord | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementVendorStatement | 1:N | id → vendorId | Restrict |
| ProcurementVendor | ProcurementReconciliationResult | 1:N | id → vendorId | Restrict |
| ProcurementPOReference | ProcurementPOReferenceLineItem | 1:N | id → poReferenceId | Cascade |
| ProcurementPOReference | ProcurementGRNReference | 1:N | id → poReferenceId | Restrict |
| ProcurementGRNReference | ProcurementGRNReferenceLineItem | 1:N | id → grnReferenceId | Cascade |
| ProcurementVendorInvoice | ProcurementInvoiceLineItem | 1:N | id → vendorInvoiceId | Cascade |
| ProcurementVendorInvoice | ProcurementInvoiceAttachment | 1:N | id → vendorInvoiceId | Cascade |
| ProcurementVendorInvoice | ProcurementThreeWayMatch | 1:1 | id → vendorInvoiceId | Restrict |
| ProcurementVendorInvoice | ProcurementInvoiceException | 1:N | id → vendorInvoiceId | Restrict |
| ProcurementVendorInvoice | ProcurementApprovalRecord | 1:N | id → vendorInvoiceId | Restrict |
| ProcurementVendorInvoice | ProcurementPaymentProposalItem | 1:N | id → vendorInvoiceId | Restrict |
| ProcurementVendorInvoice | ProcurementPaymentRecord | 1:N | id → vendorInvoiceId | Restrict |
| ProcurementVendorInvoice | ProcurementVendorCredit | 1:N | id → appliedToInvoiceId | Restrict |
| ProcurementThreeWayMatch | ProcurementMatchLineItem | 1:N | id → threeWayMatchId | Cascade |
| ProcurementPaymentProposal | ProcurementPaymentProposalItem | 1:N | id → paymentProposalId | Cascade |
| ProcurementPaymentBatch | ProcurementPaymentRecord | 1:N | id → paymentBatchId | Restrict |
| ProcurementVendorStatement | ProcurementVendorStatementLine | 1:N | id → vendorStatementId | Cascade |
| ProcurementVendorStatement | ProcurementReconciliationResult | 1:1 | id → vendorStatementId | Restrict |
| ProcurementInvoiceLineItem | ProcurementMatchLineItem | 1:N | id → invoiceLineItemId | Restrict |
| ProcurementPOReferenceLineItem | ProcurementGRNReferenceLineItem | 1:N | id → poReferenceLineItemId | Restrict |
| ProcurementPOReferenceLineItem | ProcurementInvoiceLineItem | 1:N | id → poReferenceLineItemId | Restrict |
| ProcurementGRNReferenceLineItem | ProcurementMatchLineItem | 1:N | id → grnReferenceLineItemId | Restrict |
| ProcurementPaymentRecord | ProcurementVendorStatementLine | 1:N | id → matchedPaymentId | Restrict |
| ProcurementVendorInvoice | ProcurementVendorStatementLine | 1:N | id → matchedInvoiceId | Restrict |

### Cascade Behavior Summary

| Cascade Rule | Count | Models |
|---|---|---|
| **Restrict** (prevent deletion if children exist) | 36 | Vendor, Invoice, Payment, Match, Exception, Approval, Batch, Proposal, Statement |
| **Cascade** (delete children when parent deleted) | 10 | Line items, attachments, match line items, proposal items, statement lines |

**Design rationale**: Restrict on aggregate roots preserves referential integrity. Cascade on child entities ensures orphaned line items don't accumulate.

---

## 5. Financial Field Inventory

All monetary fields use `Decimal` with the specified precision.

### Decimal(38,12) — Monetary Amounts (~101 fields)

| Model | Field | Purpose |
|---|---|---|
| ProcurementVendor | creditLimit | Max outstanding AP balance |
| ProcurementVendor | totalSpend | Aggregated vendor spend |
| ProcurementVendorPerformance | totalAmount | Total spend in period |
| ProcurementVendorCredit | creditAmount | Total credit value |
| ProcurementVendorCredit | appliedAmount | Running total of applications |
| ProcurementVendorCredit | remainingAmount | Derived: credit − applied |
| ProcurementPOReference | totalAmount | PO total (snapshot) |
| ProcurementPOReference | receivedAmount | Accumulated receipt value |
| ProcurementPOReference | taxAmount | Tax on PO |
| ProcurementPOReference | shippingAmount | Shipping/freight |
| ProcurementPOReferenceLineItem | unitPrice | PO unit price |
| ProcurementPOReferenceLineItem | lineTotal | Derived: qty × price |
| ProcurementPOReferenceLineItem | taxAmount | Tax on line |
| ProcurementGRNReference | totalValue | Total value received |
| ProcurementGRNReference | totalTax | Tax on receipt |
| ProcurementGRNReferenceLineItem | unitPrice | PO unit price (snapshot) |
| ProcurementGRNReferenceLineItem | lineTotal | Derived: accepted qty × price |
| ProcurementVendorInvoice | subtotal | Sum of line totals before tax |
| ProcurementVendorInvoice | taxAmount | Total tax |
| ProcurementVendorInvoice | discountAmount | Early payment discount |
| ProcurementVendorInvoice | shippingAmount | Freight charges |
| ProcurementVendorInvoice | totalAmount | Derived: primary financial field |
| ProcurementVendorInvoice | totalWithTax | Derived: subtotal + tax |
| ProcurementVendorInvoice | amountPaid | Running payment total |
| ProcurementVendorInvoice | balanceDue | Derived: total − paid |
| ProcurementVendorInvoice | creditApplied | Vendor credit offset |
| ProcurementVendorInvoice | netBalance | Derived: balance − credit |
| ProcurementVendorInvoice | varianceAmount | Match variance |
| ProcurementInvoiceLineItem | unitPrice | Per-unit cost |
| ProcurementInvoiceLineItem | lineTotal | Derived: qty × price |
| ProcurementInvoiceLineItem | discountAmount | Line-level discount |
| ProcurementInvoiceLineItem | netLineTotal | Derived: line − discount |
| ProcurementInvoiceLineItem | taxAmount | Derived: net × rate |
| ProcurementInvoiceLineItem | matchVariance | Price/qty variance from PO |
| ProcurementThreeWayMatch | priceVarianceTotal | Total price variance |
| ProcurementThreeWayMatch | quantityVarianceTotal | Total quantity variance |
| ProcurementThreeWayMatch | totalVariance | Derived: price + qty |
| ProcurementMatchLineItem | invoiceUnitPrice | Invoice unit price |
| ProcurementMatchLineItem | poUnitPrice | PO unit price (optional) |
| ProcurementMatchLineItem | priceVariance | Per-line price variance |
| ProcurementInvoiceException | varianceAmount | Financial impact of exception |
| ProcurementApprovalRecord | requiredThreshold | Amount threshold for level |
| ProcurementPaymentProposal | totalAmount | Derived: sum of items |
| ProcurementPaymentProposalItem | amount | Amount to pay |
| ProcurementPaymentProposalItem | discountTaken | Early payment discount |
| ProcurementPaymentProposalItem | creditApplied | Vendor credit offset |
| ProcurementPaymentProposalItem | netPayment | Derived: amount − disc − credit |
| ProcurementPaymentBatch | totalAmount | Derived: sum of payments |
| ProcurementPaymentBatch | totalFees | Bank processing fees |
| ProcurementPaymentBatch | netDisbursement | Derived: total + fees |
| ProcurementPaymentRecord | amount | Gross payment amount |
| ProcurementPaymentRecord | discountTaken | Cash discount captured |
| ProcurementPaymentRecord | creditApplied | Vendor credit offset |
| ProcurementPaymentRecord | netPayment | Derived: amount − disc − credit |
| ProcurementPaymentRecord | baseCurrencyAmount | Derived: net × rate |
| ProcurementVendorStatement | openingBalance | Balance at period start |
| ProcurementVendorStatement | totalInvoices | New invoices in period |
| ProcurementVendorStatement | totalPayments | Payments applied |
| ProcurementVendorStatement | totalCredits | Credits in period |
| ProcurementVendorStatement | closingBalance | Derived: opening + inv − pay − credit |
| ProcurementVendorStatementLine | debitAmount | Debit (increases balance) |
| ProcurementVendorStatementLine | creditAmount | Credit (decreases balance) |
| ProcurementVendorStatementLine | balance | Running balance |
| ProcurementReconciliationResult | apBalance | AP's recorded balance |
| ProcurementReconciliationResult | vendorBalance | Vendor's stated balance |
| ProcurementReconciliationResult | balanceVariance | Derived: AP − vendor |
| ProcurementReconciliationResult | adjustmentAmount | Manual adjustment |
| ProcurementAPAuditRecord | amount | Financial amount (if applicable) |

**Total Decimal(38,12)**: 64 fields across 25 models

### Decimal(20,8) — Exchange Rates (~5 fields)

| Model | Field | Purpose |
|---|---|---|
| ProcurementVendorInvoice | exchangeRate | FX rate at invoice date |
| ProcurementPaymentRecord | exchangeRate | FX rate at payment time |

### Decimal(20,4) — Quantities (~15 fields)

| Model | Field | Purpose |
|---|---|---|
| ProcurementPOReferenceLineItem | quantity | Ordered quantity |
| ProcurementPOReferenceLineItem | receivedQuantity | Accumulated receipt qty |
| ProcurementPOReferenceLineItem | invoicedQuantity | Accumulated invoice qty |
| ProcurementGRNReferenceLineItem | quantityReceived | Qty received |
| ProcurementGRNReferenceLineItem | quantityAccepted | Qty accepted |
| ProcurementGRNReferenceLineItem | quantityRejected | Qty rejected |
| ProcurementInvoiceLineItem | quantity | Quantity |
| ProcurementMatchLineItem | invoiceQuantity | Invoice qty |
| ProcurementMatchLineItem | poQuantity | PO qty (optional) |
| ProcurementMatchLineItem | grnQuantity | GRN accepted qty (optional) |
| ProcurementMatchLineItem | quantityVariance | Per-line qty variance |

**Total Decimal(20,4)**: 11 fields

### Decimal(5,4) — Tax Rates (~5 fields)

| Model | Field | Purpose |
|---|---|---|
| ProcurementPOReferenceLineItem | taxRate | Tax rate snapshot |
| ProcurementInvoiceLineItem | taxRate | Tax rate |

**Total Decimal(5,4)**: 2 fields

### Decimal(5,2) — Percentage Scores (~20 fields)

| Model | Field | Purpose |
|---|---|---|
| ProcurementVendor | riskScore | Risk score (0–100) |
| ProcurementVendorPerformance | onTimeDelivery | % on-time |
| ProcurementVendorPerformance | qualityScore | Quality score |
| ProcurementVendorPerformance | responseTime | Response score |
| ProcurementVendorPerformance | invoiceAccuracy | Accuracy % |
| ProcurementVendorPerformance | returnRate | Return rate |
| ProcurementVendorPerformance | overallScore | Weighted composite |
| ProcurementInvoiceLineItem | discountPercent | Line-level discount % |
| ProcurementThreeWayMatch | overallConfidence | Match confidence |
| ProcurementThreeWayMatch | variancePercent | Variance as % of PO |
| ProcurementThreeWayMatch | approvalThreshold | Auto-approve threshold |
| ProcurementVendorInvoice | ocrConfidence | OCR confidence |
| ProcurementVendorInvoice | duplicateConfidence | Duplicate score |
| ProcurementVendorInvoice | varianceThreshold | Auto-approval threshold |
| ProcurementMatchLineItem | confidence | Line-level match confidence |
| ProcurementReconciliationResult | matchRate | Match rate % |

**Total Decimal(5,2)**: 16 fields

### Decimal(3,1) — Ratings (~1 field)

| Model | Field | Purpose |
|---|---|---|
| ProcurementVendor | rating | Vendor rating (0.0–5.0) |

**Total Decimal(3,1)**: 1 field

### Grand Total — All Decimal Fields

| Precision | Count | Storage per Field |
|---|---|---|
| Decimal(38,12) | 64 | 16 bytes |
| Decimal(20,8) | 2 | 12 bytes |
| Decimal(20,4) | 11 | 12 bytes |
| Decimal(5,4) | 2 | 6 bytes |
| Decimal(5,2) | 16 | 6 bytes |
| Decimal(3,1) | 1 | 6 bytes |
| **Total** | **96** | ~1,008 bytes per full-width row |

---

*End of Phase 21A.1 — AP Entity Relationship Diagram (V2)*
