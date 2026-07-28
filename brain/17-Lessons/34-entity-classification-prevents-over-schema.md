---
title: "Prisma Model Classification Prevents Over-Schema"
created: 2026-07-21
tags:
  - type/lesson
  - domain/persistence
  - phase/21a.1
  - status/active
aliases:
  - Entity Classification
  - Over-Schema Prevention
---

# Prisma Model Classification Prevents Over-Schema

Classifying every domain entity into persistence categories (model, embedded value object, transient, computed) before writing any Prisma schema prevents creating tables that don't represent real persistence needs.

## The Problem

When translating a domain model directly into Prisma models, every entity becomes a table. This leads to:

1. **Over-normalization** — Value objects like `Money`, `Address`, `TaxRate` become separate tables requiring joins for every read
2. **Table proliferation** — 25 entities become 25+ tables when some should be embedded fields
3. **Migration complexity** — More tables means more indexes, more foreign keys, more schema drift risk
4. **Query overhead** — Simple reads require multi-table joins instead of single-row access

## What We Did

Phase 21A.0 defined 25 entities and 18 value objects. Phase 21A.1 classified each before writing the schema:

| Category | Count | Examples |
|----------|-------|----------|
| **Prisma Model (table)** | 25 | Vendor, VendorInvoice, ThreeWayMatch, PaymentRecord |
| **Embedded Value Object** | 18 | Money, Currency, TaxRate, PaymentTerms, Address |
| **Transient (not persisted)** | 0 | — |
| **Computed (derived at query time)** | 0 | — |

The 25 models break down further:

| Sub-Category | Count | Purpose |
|--------------|-------|---------|
| Aggregate Roots | 12 | Vendor, VendorInvoice, ThreeWayMatch, InvoiceException, ApprovalRecord, ApprovalLevel, PaymentProposal, PaymentBatch, PaymentRecord, VendorStatement, ReconciliationResult, VendorCredit |
| Child Entities | 10 | VendorBankDetail, VendorPerformance, VendorDocument, InvoiceLineItem, InvoiceAttachment, MatchLineItem, PaymentProposalItem, VendorStatementLine |
| Reference Entities | 2 | POReference, GRNReference (read-only snapshots from other bounded contexts) |
| Audit Entities | 1 | APAuditRecord (append-only, no update/delete) |

The 18 value objects were embedded as fields:

| Value Object | Embedded In | Fields |
|--------------|-------------|--------|
| Money | Multiple models | amount (Decimal), currency (String) |
| VendorInvoiceFinancial | VendorInvoice | subtotal, taxAmount, totalAmount, withholdingTax, netPayable, amountPaid, creditApplied, balanceDue |
| VendorInvoiceMatching | VendorInvoice | lastMatchedAt, matchStatus, matchResult, autoMatchScore |
| VendorInvoiceApproval | VendorInvoice | approvalStatus, submittedForApprovalAt, approvedAt, approvedBy, rejectedAt, rejectedBy, rejectionReason |
| VendorInvoicePayment | VendorInvoice | paymentStatus, paymentBatchId, paymentProposalId, paidAt, paidBy, paymentReference, paymentMethod, idempotencyKey |
| VendorInvoiceGL | VendorInvoice | glPosted, glPostedAt, glJournalEntryId, glAccountCode, glPeriod |
| VendorInvoiceProcessing | VendorInvoice | ocrScanId, ocrConfidence, requiresManualReview, assignedTo, dueDate, agingBucket, isRecurring |
| ThreeWayMatchResult | ThreeWayMatch | overallStatus, quantityVariance, quantityVariancePercent, amountVariance, amountVariancePercent, toleranceApplied |
| ThreeWayMatchThresholds | ThreeWayMatch | quantityTolerancePercent, amountTolerancePercent, autoApproveThreshold |
| PaymentProposalSummary | PaymentProposal | totalAmount, totalInvoices, totalVendors, estimatedPaymentDate, batchCount, submittedBy, submittedAt |
| VendorAddress | Vendor | street, city, state, postalCode, country |
| VendorContact | Vendor | name, email, phone, title |
| VendorPerformanceMetrics | VendorPerformance | onTimeDeliveryRate, qualityScore, responsivenessDays, invoiceAccuracy |
| VendorBankInfo | VendorBankDetail | bankName, swiftCode, routingNumber, accountNumber, iban |
| MatchEvidence | MatchLineItem | lineNumber, poLineMatched, grnLineMatched, quantityMatch, amountMatch, varianceReason |
| ApprovalDecision | ApprovalRecord | decision, decisionAt, comments, delegateId, escalationLevel |
| VendorCreditBalance | VendorCredit | originalAmount, appliedAmount, availableBalance |
| AuditContext | APAuditRecord | ipAddress, userAgent, sessionId, requestId |

## The Rule

**Before writing any Prisma schema, classify every domain entity:**

1. **Is it a persistence root?** → Prisma model with its own table
2. **Is it a value object?** → Embedded as fields on the parent model
3. **Is it a reference from another context?** → Read-only model with snapshot semantics
4. **Is it transient?** → Do not create a Prisma model
5. **Is it computed?** → Do not store; derive at query time

This classification prevents over-schema: creating tables for concepts that should be fields, or storing data that should be computed.

## Where This Applies

- **Phase 21A.1** — 25 models + 18 embedded VOs (not 25+25 = 50 tables)
- **Any future bounded context** — Apply classification before schema authoring
- **Refactoring existing schemas** — When a table has mostly read-only fields, consider embedding

## Counter-Examples (What NOT to Do)

- Creating a separate `Money` table with `amount` and `currency` columns, then joining it on every read
- Creating a `VendorAddress` table for 5 fields that always load with the vendor
- Creating a `MatchEvidence` table for 6 boolean fields that always display with the match line item
- Creating tables for computed fields like `agingBucket` or `balanceDue` that can be derived

## Metrics

| Metric | Before Classification | After |
|--------|----------------------|-------|
| Potential tables | 43 (25 entities + 18 VOs) | 25 |
| Tables created | — | 25 |
| Embedded fields | 0 | ~80 across all models |
| Join reduction | — | ~18 fewer joins per invoice read |

## Related

- [[32-domain-scaffolding-is-not-domain]] — Scaffolding is not functionality
- [[33-domain-architecture-precedes-implementation]] — Architecture before code
- Principle #10 in [[11-ADR/decision-network]] — Entity Classification Before Schema
