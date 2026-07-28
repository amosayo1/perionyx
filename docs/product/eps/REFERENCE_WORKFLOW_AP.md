---
title: "AP Reference Workflow — Complete Procure-to-Pay Lifecycle v2.0"
created: 2026-07-28
updated: 2026-07-28
version: 2.0
tags:
  - type/workflow
  - domain/ap
  - status/active
owner: Product Team
authority: Phase 27.1
---

# AP Reference Workflow — Complete Procure-to-Pay Lifecycle v2.0

> **Classification**: Restricted — Internal Use Only
> **Status**: Ready for finance professional review
> **Authority**: Phase 27.1 — Customer Evidence → Product Specification

---

## 1. Purpose

This document is the **single source of truth** for how vendor invoices flow from receipt to reconciliation in Perionyx. It defines every stage, control point, decision, audit event, and failure mode in the 10-stage procure-to-pay lifecycle. Every design decision is traceable to customer evidence. Where evidence is insufficient, the assumption is explicitly marked **[HYPOTHESIS]**.

This workflow is designed for **CFOs, Controllers, AP Managers, Treasury Managers, and Auditors** who need confidence that every dollar leaving the organisation is authorised, documented, and reconciled.

### Design Principles

1. **Every stage has a clear owner** — no orphaned decisions
2. **Every transition is audited** — immutable append-only trail with SHA-256 checksum chain
3. **Every number is precise** — Decimal(38,12), no native arithmetic
4. **AI prepares, humans decide** — AI never approves, never pays, never overrides controls
5. **Failure is expected** — every stage has defined recovery paths
6. **Multi-tenancy is absolute** — companyId on every record, no exceptions

### Customer Evidence

- Adeel Aslam (E1): "vendor invoice reconciliations and approval workflows... often require manual oversight to ensure accuracy"
- Ayman Shawky (E3): "Siloed systems create reconciliation overhead" / "Need for instant view of cash positions"
- Muhammed Jamsheed (E4): "Automated reconciliation is highly desired" / "Intelligent discrepancy alerts would reduce manual work"
- Mohamed Gamal (E5): "manual bank reconciliation, manual account reconciliation" / "automated reconciliations, automated approvals"
- Theme T1: Manual Approval Workflows Delay Payments (4 sources, Working)
- Theme T2: Vendor Invoice Reconciliation Is Manual and Error-Prone (4 sources, Working)

---

## 2. Financial Precision

All monetary calculations in this workflow use `Decimal(38,12)` precision via the `financial-precision.ts` helper library. **Native JavaScript number arithmetic is never used for financial amounts.**

| Operation | Method | Rounding |
|-----------|--------|----------|
| Summation | `sumDecimals()` | Accumulator at each step |
| Multiplication | `multiplyDecimals()` | Full precision, round at end |
| Division | `divideDecimals()` | Full precision, round at end |
| Allocation | `allocateAmount()` | Last target receives residual |
| Tax calculation | `calculateTax()` | Banker's rounding (half-to-even) |
| Display | `formatDecimalCurrency()` | Locale-aware formatting |
| Comparison | `decimalEquals()` | Epsilon-based, never `===` |

**Invariant**: Every monetary field in every Prisma model uses `Decimal(38,12)`. No Float, no Number, no integer-cents representation. This is established by Platform Constitution Law 6: "Financial integrity is never compromised." Validated by Phase 19.1 migration of 4 Float monetary fields to Decimal.

---

## 3. Multi-Tenancy

Every record in the AP workflow carries a `companyId` field. Queries are scoped to the current tenant via RuntimeContext. Cross-tenant access is blocked at the repository layer.

**Invariant**: No AP query executes without a `companyId` filter. This is enforced by the `PrismaRepository` base class and verified by RuntimeContext propagation in every API route. Established by Platform Constitution Law 11: "Tenant isolation is absolute."

---

## 4. Audit Chain

Every state transition, approval, payment, and correction generates an append-only audit record:

```typescript
interface APAuditRecord {
  id: string;
  companyId: string;
  entityType: 'invoice' | 'payment' | 'approval' | 'vendor' | 'credit';
  entityId: string;
  action: string;           // e.g., 'invoice.validated', 'payment.executed'
  actorId: string;          // userId or 'system'
  actorType: 'user' | 'system' | 'ai';
  timestamp: Date;
  previousState: string;
  newState: string;
  reason?: string;          // Required for rejections, voids, corrections
  metadata?: Record<string, unknown>;
  checksum: string;         // SHA-256 of previous record + this record
}
```

**Invariant**: Audit records cannot be updated or deleted. The SHA-256 checksum chain makes tampering detectable. Established by Platform Constitution Law 4: "Every action is auditable." Evidence: E5 (Mohamed Gamal) requires "faster month-end close" — complete audit trails enable continuous close.

---

## 5. The 10 Stages

### Stage 1: Invoice Received

> **Why This Stage Exists**: Every payment begins with a vendor's demand for money. The system must capture the demand completely, immediately, and without loss. A lost invoice means a lost vendor relationship, a missed discount, or a surprise liability at month-end. Evidence: E1 (Adeel Aslam): "vendor invoice reconciliations... require manual oversight to ensure accuracy" — the oversight starts at capture.

| Field | Detail |
|-------|--------|
| **Owner** | AP Clerk |
| **Goal** | Vendor invoice enters the system with zero manual re-keying |
| **Evidence** | E1 (Adeel Aslam): "manual oversight to ensure accuracy" — T2: "Vendor Invoice Reconciliation Is Manual and Error-Prone" (4 sources) |
| **Inputs** | Email attachment (PDF), manual upload (PDF/Image), API submission (JSON), vendor portal upload, EDI transmission |
| **Outputs** | `ProcurementVendorInvoice` record (status: `DRAFT` → `CAPTURED`), OCR-extracted fields, unique invoice ID, workflow start timestamp |
| **Required Information** | Vendor ID, invoice number, invoice date, total amount, currency, line items (for 3-way match) |
| **Dependencies** | Vendor must exist in system (or flagged as new for approval) |
| **Business Rules** | BR-001: Required fields. BR-002: Date recency (≤90 days past). BR-003: Positive amount. BR-004: Supported currency. BR-005: Amount reasonableness. BR-006: Duplicate detection (vendor + invoice number + date). BR-007: Currency validation. BR-010: OCR confidence review if <85%. |
| **Exception Paths** | Duplicate detected → surface to AP Clerk with evidence. New vendor → flag for AP Manager approval. OCR confidence low → manual review. Corrupted file → re-upload. |
| **Success Criteria** | 100% of invoices captured; 0% silently dropped; OCR accuracy >95% |
| **Failure Modes** | OCR misreads amount. Duplicate not detected. Vendor not matched. Email attachment corrupted. |
| **Recovery** | Manual correction of OCR fields. Override duplicate flag with reason. Create new vendor with approval. Re-upload corrupted file. |
| **Audit Events** | `invoice.received`, `invoice.captured`, `invoice.ocr.completed`, `invoice.duplicate.detected`, `invoice.duplicate.dismissed` |
| **Classification** | CONFIDENTIAL — contains vendor banking details, amounts, terms |
| **Platform Services** | DocumentPlatform (OCR), IntegrationPlatform (EDI), NotificationPlatform (acknowledgment) |
| **AI Responsibilities** | OCR field extraction, vendor matching, duplicate probability scoring, payment term inference |
| **Human Responsibilities** | Confirm OCR results if confidence <85%. Review flagged duplicates. Approve new vendor creation. |

**Detailed Flow**:
1. Invoice arrives via email/upload/API/portal
2. DocumentPlatform extracts text via OCR (or parses JSON/EDI)
3. System matches vendor by name, tax ID, or email domain
4. Duplicate check runs against `(vendorId, invoiceNumber, invoiceDate)` tuple
5. If new vendor: flag for AP Manager approval before proceeding
6. If duplicate: surface to AP Clerk with confidence score and evidence
7. Invoice record created in `DRAFT`, immediately promoted to `CAPTURED`
8. Workflow clock starts: SLA timer begins (configurable, default 5 business days)
9. Notification sent to AP Clerk: "Invoice [INV-2026-001] from [Vendor] captured"

---

### Stage 2: Invoice Validated

> **Why This Stage Exists**: An invoice without context is just a number. Approving a number without evidence is gambling. The system must gather every piece of evidence that justifies (or challenges) the invoice before any human sees it. Evidence: E1 (Adeel Aslam): "manual oversight to ensure accuracy" — accuracy requires evidence.

| Field | Detail |
|-------|--------|
| **Owner** | System (automated) |
| **Goal** | System assembles all supporting evidence automatically |
| **Evidence** | E1 (Adeel Aslam): "manual oversight to ensure accuracy" — evidence collection reduces need for manual oversight. E4 (Muhammed Jamsheed): "Automated reconciliation is highly desired" |
| **Inputs** | Invoice record from Stage 1, PO database, GRN database, contract store, vendor history |
| **Outputs** | Evidence package: linked PO(s), GRN(s), contract terms, vendor payment history, price comparison, prior invoice variance |
| **Required Information** | At least PO or contract linked for the invoice to proceed |
| **Dependencies** | PO database, GRN database, contract store must be available |
| **Business Rules** | BR-008: Due date calculated from payment terms. BR-009: Tax validation. BR-011: Policy compliance check. BR-012: Vendor status must be ACTIVE. |
| **Exception Paths** | PO not found → flag "No PO Found" for manual review. GRN not yet created → queue GRN creation. Contract expired → alert contract expiry. Vendor inactive → block processing. |
| **Success Criteria** | 100% of invoices have evidence package; <1% require manual evidence gathering |
| **Failure Modes** | PO not found in system. GRN not yet created. Contract expired. Vendor history incomplete. |
| **Recovery** | Flag for manual review. Queue GRN creation. Alert contract expiry. Load available history. |
| **Audit Events** | `evidence.po.linked`, `evidence.grn.linked`, `evidence.contract.extracted`, `evidence.history.loaded`, `evidence.package.complete` |
| **Classification** | CONFIDENTIAL — PO contains pricing, quantities, delivery terms |
| **Platform Services** | IntegrationPlatform (ERP sync), AIDocumentAnalysis (clause extraction), WorkflowPlatform (evidence assembly) |
| **AI Responsibilities** | Fuzzy PO matching, contract clause extraction, price anomaly flagging, vendor reliability scoring |
| **Human Responsibilities** | None in normal flow. AP Clerk reviews if fuzzy match confidence <80%. |

**Detailed Flow**:
1. Evidence collector queries PO database by invoice PO reference
2. If exact PO match: link immediately. If fuzzy: surface candidates to AP Clerk
3. Query GRN database for received quantities against matched PO
4. Extract contract terms (payment terms, discount %, pricing)
5. Load vendor payment history (last 12 months, average days-to-pay, dispute rate)
6. Calculate price variance: invoice price vs PO price vs 90-day average
7. Build evidence summary: "This invoice matches PO-4521, GRN received 3 days ago, price matches PO, vendor usually pays in 32 days"
8. Attach all evidence to invoice record. Promotion: `CAPTURED` → `VALIDATED`

---

### Stage 3: Three-Way Match

> **Why This Stage Exists**: Three-way matching is the fundamental control that prevents overpayment, duplicate payment, and fraudulent payment. It answers one question: "Did we order this, did we receive it, and is the price right?" Evidence: E1, E2 (T2): "Vendor Invoice Reconciliation Is Manual and Error-Prone" — manual matching is the core pain.

| Field | Detail |
|-------|--------|
| **Owner** | System (automated) |
| **Goal** | Automated match confirms (or challenges) that invoice, PO, and GRN agree |
| **Evidence** | E1, E2 (T2): "Vendor Invoice Reconciliation Is Manual and Error-Prone" (4 sources). E4 (Muhammed Jamsheed): "Automated reconciliation is highly desired" |
| **Inputs** | Invoice line items, PO line items, GRN received quantities, tolerance rules |
| **Outputs** | Match result: MATCHED (green), TOLERANCE (yellow), EXCEPTION (red). Line-item variance table. |
| **Required Information** | At least 2-way (Invoice ↔ PO) for services; 3-way (Invoice ↔ PO ↔ GRN) for goods |
| **Dependencies** | Stage 2 evidence package must be complete |
| **Business Rules** | BR-013: 3-way match for goods. BR-014: 2-way match for services [HYPOTHESIS]. BR-015: Overall result classification. BR-016: Line-item classification (GREEN/YELLOW/RED). BR-017: Price tolerance configurable per vendor/category (default: 2%). BR-018: Quantity tolerance configurable (default: 0 for goods, 5% for services). BR-019: Auto-promote MATCHED invoices. BR-020: Create exception for any RED line. BR-021: Partial delivery handling. |
| **Exception Paths** | All GREEN → auto-promote to `MATCHED`. ANY RED → create `ProcurementException`, route to Stage 4. ALL YELLOW → `TOLERANCE` state, AP Clerk review. |
| **Success Criteria** | >90% match rate at 180-day target; <2 sec processing time per invoice |
| **Failure Modes** | Tolerance too tight (false exceptions). Tolerance too loose (misses overpayment). GRN not posted. Partial delivery not handled. |
| **Recovery** | Adjust tolerance per vendor/category. Queue GRN creation. Split invoice for partial deliveries. |
| **Audit Events** | `match.started`, `match.line.evaluated`, `match.completed`, `match.exception.raised`, `match.override.applied` |
| **Classification** | CONFIDENTIAL — pricing, quantities, variance data |
| **Platform Services** | APMatchingEngine, ApprovalMatrix (tolerance configuration), AIPatternDetection (anomaly flagging) |
| **AI Responsibilities** | Anomaly detection on variance patterns, historical tolerance learning, vendor-specific tolerance suggestion |
| **Human Responsibilities** | Override match result with documented reason if business justification exists |

**Detailed Flow**:
1. For each invoice line item, find matching PO line item
2. Compare: invoice qty vs PO qty, invoice price vs PO price, invoice total vs PO total
3. Calculate variance: absolute ($) and relative (%)
4. Apply tolerance rules (vendor-specific > category-specific > global default)
5. If GRN required: compare invoice qty vs GRN received qty
6. Classify each line: GREEN (within tolerance), YELLOW (marginal), RED (exception)
7. Overall result: ALL GREEN → MATCHED. ANY RED → EXCEPTION. ALL YELLOW → TOLERANCE
8. For MATCHED: auto-promote to `MATCHED` state, proceed to Stage 5
9. For EXCEPTION: create `ProcurementException` record, route to Stage 4

---

### Stage 4: Exception Queue

> **Why This Stage Exists**: Exceptions are not failures — they are the system protecting the organisation. Every exception is a potential overpayment, duplicate, or fraud caught before money leaves the account. The system must make exceptions easy to resolve, not easy to ignore. Evidence: E4 (Muhammed Jamsheed): "Intelligent discrepancy alerts would reduce manual work."

| Field | Detail |
|-------|--------|
| **Owner** | AP Clerk (LOW/MEDIUM), AP Manager (all severities) |
| **Goal** | Understand exactly what is wrong and what action to take |
| **Evidence** | WP1: "Exceptions Deserve Attention, Not Automation" — E4 (Muhammed Jamsheed): "Intelligent discrepancy alerts would reduce manual work". E5 (Mohamed Gamal): "approval bottlenecks" |
| **Inputs** | Match exceptions from Stage 3, duplicate detection results, anomaly flags from AI |
| **Outputs** | Classified exception with severity, suggested resolution, routed to appropriate resolver |
| **Required Information** | Exception type, severity, evidence package, suggested resolution |
| **Dependencies** | Stage 3 match result; resolver availability |
| **Business Rules** | BR-056: Exception SLA enforcement (CRITICAL 1 day, HIGH 2 days, MEDIUM 5 days). BR-057: CRITICAL requires AP Manager. BR-058: Duplicates blocked from payment. BR-059: Resolution requires reason. BR-060: Auto-escalate on SLA breach. BR-061: Resolution audit trail. BR-063: Exception types: PRICE_MISMATCH, QUANTITY_MISMATCH, MISSING_GRN, DUPLICATE_INVOICE, MISSING_PO, VENDOR_MISMATCH, CURRENCY_MISMATCH. |
| **Exception Paths** | Exception ignored beyond SLA → auto-escalate. Wrong person assigned → reassign. Resolution creates new exception → chain exceptions. |
| **Success Criteria** | <10% exception rate at 180-day target; <5 min average resolution for routine exceptions |
| **Failure Modes** | Exception ignored beyond SLA. Wrong person assigned. Root cause misidentified. Resolution creates new exception. |
| **Recovery** | Auto-escalation. Reassignment. Additional evidence collection. Secondary review. |
| **Audit Events** | `exception.created`, `exception.classified`, `exception.routed`, `exception.resolved`, `exception.escalated`, `exception.verified` |
| **Classification** | CONFIDENTIAL — financial discrepancy details |
| **Platform Services** | ExceptionService, NotificationPlatform (escalation), AIDiagnosis (root cause), VendorPortal (communication) |
| **AI Responsibilities** | Root cause analysis, resolution recommendation, similar exception history, impact assessment |
| **Human Responsibilities** | Choose resolution: accept (adjust PO), reject (return to vendor), dispute (query vendor), credit (request credit note) |

**Detailed Flow**:
1. Exception created with type, severity, and evidence
2. AI analyses root cause: price changed? quantity wrong? GRN not posted? Duplicate?
3. System suggests resolution based on similar historical exceptions
4. Exception routed to appropriate resolver based on type and amount
5. Resolver reviews evidence, AI recommendation, and takes action
6. If resolution creates new exception (e.g., credit note), new exception created
7. Exception closed only when all linked items resolved
8. Invoice state: `EXCEPTION` → (after resolution) → `MATCHED` or `DRAFT` (if returned to vendor)

---

### Stage 5: Approval Routing

> **Why This Stage Exists**: Approval is the moment of commitment. A human being, with all evidence before them, authorises the organisation to pay money. This stage ensures the right person approves, has the authority to approve, and their decision is recorded immutably. Evidence: E1, E2 (T1): "Manual Approval Workflows Delay Payments" (4 sources).

| Field | Detail |
|-------|--------|
| **Owner** | Approver (role-based per authority level) |
| **Goal** | Route to authorised approver based on amount, capture decision, enforce SoD, record audit |
| **Evidence** | E1, E2 (T1): "Manual Approval Workflows Delay Payments" (4 sources). E5 (Mohamed Gamal): "approval bottlenecks" |
| **Inputs** | Invoice, evidence package, approval matrix, authority limits |
| **Outputs** | Approval decision (APPROVED/REJECTED/ESCALATED/DELEGATED), digital signature, audit record |
| **Required Information** | Complete evidence package displayed; approver has authority for this amount |
| **Dependencies** | Invoice must be in `MATCHED` state; approval matrix configured |
| **Business Rules** | BR-026: SoD — creator cannot approve. BR-027: SoD — same person cannot approve at multiple levels. BR-028: SoD — approver must have role authority. BR-029: Self-invoice dual approval. BR-030: Threshold-based approval (<$1K AP Clerk, <$10K AP Manager, <$50K Controller, <$250K CFO, >$250K CFO + Board). BR-031: Approval delegation to pre-registered delegates. BR-032: Partial approval not allowed. BR-033: Delegation chain must preserve SoD. BR-034: Approval deadline configurable. BR-035: Escalation on SLA breach. BR-036: Rejection requires reason. BR-037: Approval is non-repudiable (digital signature). |
| **Exception Paths** | SoD violation → block, log. Approver on leave → delegation chain. SLA breached → auto-escalate. All levels must approve or skip before promotion. |
| **Success Criteria** | <4 hours approval cycle at 30-day target; 100% SoD compliance |
| **Failure Modes** | Wrong approver selected. SoD violation not detected. Approval SLA breached. Delegation chain broken. |
| **Recovery** | Manual reassignment. SoD override with justification. Auto-escalation. Delegation chain repair. |
| **Audit Events** | `approval.requested`, `approval.routed`, `approval.approved`, `approval.rejected`, `approval.escalated`, `approval.delegated`, `approval.timed_out`, `approval.skipped` |
| **Classification** | CONFIDENTIAL — authority limits, approval decisions, financial commitments |
| **Platform Services** | ApprovalMatrix, ApprovalStepExecutor, NotificationPlatform, AIDecisionSupport, AuditPlatform |
| **AI Responsibilities** | Suggest optimal approver, flag authority boundary cases, predict approval time, detect unusual approval patterns |
| **Human Responsibilities** | Final approval or rejection. Delegation to another approver. Escalation to higher authority. |

**Detailed Flow**:
1. System determines approval chain from approval matrix (amount × department × vendor category)
2. Invoice routed to first approver in chain
3. Approver reviews: invoice, evidence, AI package, department inputs
4. Decision: APPROVE → next level (if multi-level) or Stage 6. REJECT → return to AP Clerk with reason. ESCALATE → higher authority. DELEGATE → pre-registered delegate.
5. If multi-level: each level must approve before next level is notified
6. If all levels approved: invoice promoted to `APPROVED`, proceed to Stage 6
7. Digital signature recorded (user ID, timestamp, IP address, session ID)
8. Vendor notified: "Invoice [INV-2026-001] approved for payment"

---

### Stage 6: Payment Readiness

> **Why This Stage Exists**: Paying one invoice at a time is wasteful. Payment readiness batches invoices, captures early-payment discounts, aligns with cash flow, and ensures the organisation pays optimally — not just correctly. Evidence: E3 (Ayman Shawky): "Need for instant view of cash positions" — payment timing requires cash awareness.

| Field | Detail |
|-------|--------|
| **Owner** | Treasury Manager (review and approve batch) |
| **Goal** | Approved invoices batched for payment at the optimal time |
| **Evidence** | E3 (Ayman Shawky): "instant view of cash positions". H-08: Batch payment preferred [HYPOTHESIS]. H-12: Early-pay discount capture [HYPOTHESIS]. |
| **Inputs** | Approved invoices, payment terms, discount windows, cash position, bank details, payment calendar |
| **Outputs** | Payment proposal: batch of invoices, total amount, payment date, discount captured, cash flow impact |
| **Required Information** | Batch total, payment method, bank account, payment date, discount analysis |
| **Dependencies** | Invoices in `APPROVED` state; Treasury cash position available |
| **Business Rules** | BR-043: Payment requires Treasury approval. BR-044: Batch by payment method (ACH, wire, check, SEPA). BR-045: Capture discount if discount amount > cost of early payment [HYPOTHESIS]. BR-046: Idempotent payment execution. BR-047: Minimum payment threshold per batch [HYPOTHESIS]. BR-048: Dual-signature for >$50K [HYPOTHESIS]. |
| **Exception Paths** | Insufficient cash → split batch. Discount window missed → flag. Bank details unverified → block. |
| **Success Criteria** | >80% discount capture at 180-day target; payment proposal generated in <30 sec |
| **Failure Modes** | Insufficient cash for batch. Discount window missed. Bank details incorrect. Duplicate payment risk. |
| **Recovery** | Split batch. Reschedule. Bank detail verification. Duplicate detection before execution. |
| **Audit Events** | `payment.proposal.created`, `payment.batch.optimized`, `payment.discount.captured`, `payment.proposal.submitted`, `payment.proposal.approved` |
| **Classification** | CONFIDENTIAL — cash position, payment amounts, bank details |
| **Platform Services** | PaymentService, TreasuryService, AIForecastEngine, BankingPlatform, NotificationPlatform |
| **AI Responsibilities** | Discount optimisation, cash flow alignment, payment timing recommendation, bank fee estimation |
| **Human Responsibilities** | Treasury Manager approves payment batch. AP Manager overrides batch composition. |

**Detailed Flow**:
1. System queries all `APPROVED` invoices due within payment window
2. Groups by payment method and currency
3. For each group: calculate total, check discount eligibility, estimate bank fees
4. If discount available: calculate NPV of early payment vs delayed payment
5. Query cash position and forecast from TreasuryService
6. Generate payment proposal with: invoices, amounts, dates, bank details, cash impact
7. Treasury Manager reviews and approves (or modifies) proposal
8. Approved proposal moves to Stage 7

---

### Stage 7: Treasury Approval

> **Why This Stage Exists**: Payment execution must align with the organisation's cash position. Treasury ensures that payments do not create liquidity crises, that bank accounts have sufficient funds, and that payment timing is optimal. Evidence: E3 (Ayman Shawky): "instant view of cash positions". E9 (Ahmed Abdelmoneim): Treasury integration feedback.

| Field | Detail |
|-------|--------|
| **Owner** | Treasury Manager |
| **Goal** | Verify cash availability, schedule payment, confirm bank readiness |
| **Evidence** | E3 (Ayman Shawky): "instant view of cash positions across all accounts". E9 (Ahmed Abdelmoneim): Treasury-ERP integration. |
| **Inputs** | Payment proposal from Stage 6, real-time bank balances, cash flow forecast, payment calendar |
| **Outputs** | Approved payment schedule, bank confirmation readiness, cash impact projection |
| **Required Information** | Bank balance confirmation, cash flow projection for next 30 days, payment schedule |
| **Dependencies** | Banking API availability; cash position data freshness |
| **Business Rules** | BR-049: Cash availability check before execution. BR-050: Payment failure auto-retry (1 attempt). BR-051: Payment status real-time tracking. BR-052: Failed payment escalation. BR-053: Payment cancellation if not yet executed. |
| **Exception Paths** | Insufficient funds → reschedule or split. Bank API down → queue for retry. Cash flow projection negative → escalate to CFO. |
| **Success Criteria** | 100% of approved payments scheduled; cash projection accuracy >95% |
| **Failure Modes** | Bank API down. Insufficient funds. Cash projection inaccurate. Payment scheduling conflict. |
| **Recovery** | Queue for retry. Reschedule payment. Escalate to CFO. Manual wire initiation. |
| **Audit Events** | `treasury.approved`, `treasury.scheduled`, `treasury.cash.verified`, `treasury.cash.insufficient` |
| **Classification** | RESTRICTED — banking credentials, cash positions, account numbers |
| **Platform Services** | TreasuryService, BankingPlatform, AIForecastEngine, NotificationPlatform |
| **AI Responsibilities** | Cash flow projection, optimal payment timing, liquidity risk detection |
| **Human Responsibilities** | Treasury Manager authorises payment schedule. CFO intervenes for liquidity crises. |

**Detailed Flow**:
1. Treasury Manager receives payment proposal from Stage 6
2. System queries real-time bank balances via BankingPlatform
3. Cash flow projection generated: current balance + receivables - committed payments
4. If sufficient funds: approve schedule, set payment date
5. If insufficient funds: suggest split (partial payment now, remainder later)
6. Payment schedule confirmed with bank reference window
7. Treasury Manager approves or modifies schedule
8. Approved schedule moves to Stage 8

---

### Stage 8: Payment Execution

> **Why This Stage Exists**: This is the moment money leaves the organisation. Every control, every approval, every audit trail leads to this point. Payment execution must be precise, confirmed, and irrecoverable only after explicit verification. Evidence: VP5: Financial Precision Is Non-Negotiable.

| Field | Detail |
|-------|--------|
| **Owner** | System (automated) + Treasury Manager (oversight) |
| **Goal** | Execute payment via banking integration, confirm receipt, update records |
| **Evidence** | VP5: Financial Precision. E9 (Ahmed Abdelmoneim): Treasury reliability expectations. |
| **Inputs** | Approved payment proposal, bank credentials, payment gateway, compliance rules |
| **Outputs** | Payment confirmation, bank reference number, GL journal entries, vendor notification, audit record |
| **Required Information** | Bank credentials (encrypted), payment amount, recipient bank details, idempotency key |
| **Dependencies** | Treasury approval from Stage 7; banking API availability |
| **Business Rules** | BR-043: Treasury approval required. BR-046: Idempotent execution (unique key). BR-050: Auto-retry once on transient failure. BR-051: Real-time status tracking. BR-052: Escalate after retry failure. BR-054: Bank reference recorded. BR-055: Vendor notified on completion. |
| **Exception Paths** | Bank API failure → retry once, then escalate. Payment rejected → investigate, notify vendor. Insufficient funds (race condition) → halt, escalate. Fraudulent pattern detected → freeze, alert. |
| **Success Criteria** | <0.5% payment failure rate; <15 min average execution time |
| **Failure Modes** | Bank API down. Payment rejected by bank. Insufficient funds. Incorrect bank details. Fraudulent payment detected. |
| **Recovery** | Retry with backoff. Manual wire initiation. Fund transfer from reserve. Bank investigation. Fraud alert freeze. |
| **Audit Events** | `payment.initiated`, `payment.submitted`, `payment.processing`, `payment.completed`, `payment.failed`, `payment.confirmed`, `payment.retried` |
| **Classification** | RESTRICTED — banking credentials, payment amounts, account numbers |
| **Platform Services** | BankingPlatform (ACH/wire/SEPA), PaymentGateway, AuditPlatform, NotificationPlatform |
| **AI Responsibilities** | Payment failure prediction, fraud detection on payment patterns |
| **Human Responsibilities** | Treasury Manager authorises execution. Manual intervention on payment failure. |

**Detailed Flow**:
1. Payment proposal received from Stage 7
2. System validates: approval complete, bank details verified, idempotency check passed
3. Payment submitted to banking platform (ACH/wire/SEPA)
4. Real-time status tracking: submitted → processing → completed/failed
5. On completion: bank reference number recorded, GL journal entries generated
6. On failure: retry once (if transient), then escalate to Treasury Manager
7. Vendor notified: "Payment of [amount] sent on [date], reference [ref]"
8. Invoice promoted to `PAID`

---

### Stage 9: GL Posting

> **Why This Stage Exists**: Payment is not the end of the financial record. The general ledger must reflect the payment accurately, completely, and traceably. GL posting creates the journal entries that accountants and auditors rely on. Evidence: E5 (Mohamed Gamal): "manual account reconciliation" — automated posting eliminates manual reconciliation.

| Field | Detail |
|-------|--------|
| **Owner** | System (automated) + Controller (review) |
| **Goal** | Generate accurate GL entries, update subledger, maintain financial integrity |
| **Evidence** | E5 (Mohamed Gamal): "manual account reconciliation" — auto-posting eliminates this. VP6: "One Financial Truth". |
| **Inputs** | Payment confirmation, invoice coding, cost centres, GL account mapping, audit requirements |
| **Outputs** | GL journal entries (debit AP, credit Bank), subledger updated, financial reports refreshed |
| **Required Information** | Invoice coding (GL account, cost centre, project), payment reference, bank account |
| **Dependencies** | Payment completion from Stage 8; GL account mapping configured |
| **Business Rules** | BR-062: Audit record checksum chain. BR-063: GL entries generated from invoice coding. BR-064: Subledger reconciliation on every posting. BR-065: Financial reports updated immediately. |
| **Exception Paths** | GL coding wrong → flag for Controller review. Subledger mismatch → block close, investigate. Duplicate posting detected → reverse, alert. |
| **Success Criteria** | >98% GL posting accuracy at 30-day target; subledger = GL balance within $0.01 |
| **Failure Modes** | GL entry coding wrong. Subledger mismatch. Duplicate posting. Report staleness. |
| **Recovery** | GL adjustment entry with approval. Manual reconciliation. Duplicate reversal. Report refresh. |
| **Audit Events** | `gl.entry.created`, `gl.entry.posted`, `gl.subledger.updated`, `gl.reconciliation.checked`, `gl.report.refreshed` |
| **Classification** | CONFIDENTIAL — GL entries, account balances, financial reports |
| **Platform Services** | GLIntegrationService, FinancialReporting, AIAutoCoding, AuditPlatform |
| **AI Responsibilities** | Auto-coding suggestions, anomaly detection in GL entries, completeness check |
| **Human Responsibilities** | Controller reviews GL entries. Auditor verifies audit trail. |

**Detailed Flow**:
1. Payment confirmed → GL journal entries generated (debit AP, credit Bank)
2. Entries posted to GL with full traceability to invoice and payment
3. Subledger updated: AP balance reduced by payment amount
4. Financial reports refreshed: AP aging, cash flow, vendor balance
5. Controller reviews GL entries (automated sampling or manual trigger)
6. If GL coding incorrect: adjustment entry with approval and audit trail

---

### Stage 10: Audit & Reconciliation

> **Why This Stage Exists**: The loop must close. The organisation needs to know: was the payment correct? Is the GL accurate? Is the audit trail complete? Can we prove this to an auditor? Audit completion ensures every dollar is accounted for and every decision is traceable. Evidence: E5 (Mohamed Gamal): "manual bank reconciliation" — automation is the solution.

| Field | Detail |
|-------|--------|
| **Owner** | System (automated) + Controller (oversight) |
| **Goal** | Bank reconciliation, audit trail verification, checksum chain validation, close preparation |
| **Evidence** | E5 (Mohamed Gamal): "manual bank reconciliation, manual account reconciliation" — both automated here. VP4: Every Action Is Auditable. |
| **Inputs** | Payment confirmation from Stage 8, bank statement, GL entries from Stage 9, audit trail |
| **Outputs** | Bank reconciliation record, checksum chain verified, audit trail closed, financial reports finalised, vendor statement updated |
| **Required Information** | Bank statement line matching payment; all audit records present and checksum-valid |
| **Dependencies** | GL posting from Stage 9; bank statement availability |
| **Business Rules** | BR-062: Audit record checksum chain verified. BR-064: Bank reconciliation matches payment to statement line within $0.01. BR-065: Vendor statement updated. BR-066: Financial reports finalised for period. |
| **Exception Paths** | Bank statement delayed → queue for matching. Reconciliation mismatch → investigate, resolve. Checksum chain broken → alert Controller, freeze records. Audit trail incomplete → block close. |
| **Success Criteria** | 100% audit trail completeness; <0.1% reconciliation mismatches; checksum chain 100% pass |
| **Failure Modes** | Bank statement delayed. Reconciliation mismatch. Checksum chain broken. Audit trail incomplete. |
| **Recovery** | Manual reconciliation entry. Bank investigation. Checksum repair with audit trail. |
| **Audit Events** | `reconciliation.matched`, `reconciliation.exception`, `audit.trail.closed`, `audit.checksum.verified`, `statement.updated`, `reports.finalised` |
| **Classification** | CONFIDENTIAL — GL entries, reconciliation data, audit trail |
| **Platform Services** | ReconciliationService, AuditPlatform, FinancialReporting, NotificationPlatform |
| **AI Responsibilities** | Reconciliation matching, anomaly detection in GL entries, audit completeness check |
| **Human Responsibilities** | Controller reviews reconciliation exceptions. Auditor verifies checksum chain. |

**Detailed Flow**:
1. Payment confirmed (Stage 8) + GL posted (Stage 9) → reconciliation eligible
2. System receives bank statement (automated feed or manual upload)
3. System matches payment to bank statement line (amount, date, reference)
4. Matched: reconciliation complete. Unmatched: exception raised for investigation
5. Checksum chain verified: each audit record links to previous via SHA-256
6. If chain valid: audit trail closed. If invalid: alert Controller, freeze records
7. Vendor statement updated: invoice shown as PAID with payment date and reference
8. Financial reports refreshed: AP aging, cash flow, vendor balance
9. Invoice promoted to `RECONCILED` → `CLOSED`

---

## 6. Cross-Stage Invariants

These invariants hold across all 10 stages. Violation of any invariant is a system defect.

| Invariant | Description | Enforcement |
|-----------|-------------|-------------|
| **I-01: Multi-Tenancy** | Every record carries `companyId`; no query executes without tenant filter | RuntimeContext + PrismaRepository |
| **I-02: Financial Precision** | All monetary values are `Decimal(38,12)`; no native arithmetic | TypeScript type system + linting |
| **I-03: Audit Trail** | Every state transition creates an append-only audit record | Event handlers on every state machine |
| **I-04: Checksum Chain** | Each audit record includes SHA-256 of previous + current record | Audit record creation logic |
| **I-05: Idempotency** | Every mutation is idempotent; duplicate submissions produce same result | Idempotency keys on all POST endpoints |
| **I-06: Optimistic Locking** | Every aggregate root has `version` field; concurrent modifications rejected | Prisma update with version check |
| **I-07: SoD Enforcement** | Creator ≠ approver ≠ payment releaser; same person cannot approve at multiple levels | Approval matrix guards |
| **I-08: SoD Blocking** | SoD violations are blocked, not merely logged | API-level enforcement |
| **I-09: Approval Required** | No payment executes without approval; no invoice approved without evidence | State machine guards |
| **I-10: Treasury Approval** | No payment executes without Treasury Manager approval | Payment state machine guard |
| **I-11: Human Accountability** | Every payment has a named human authoriser; AI never approves | AI permission matrix |
| **I-12: Evidence Before Action** | Approval actions disabled until evidence displayed | UI + API enforcement |
| **I-13: Classification** | Data classified as CONFIDENTIAL or RESTRICTED; encryption at rest | ClassificationRegistry + AES-256-GCM |
| **I-14: Rate Limiting** | API endpoints rate-limited per user and per tenant | Proxy rate limiting |
| **I-15: No Implicit State Changes** | Every state transition defined in this document; code that deviates is a defect | State machine implementation |
| **I-16: Recovery Is Explicit** | Void, cancel, dispute, reversal are first-class transitions with audit trails | Recovery transition definitions |
| **I-17: Terminal States** | VOIDED, CLOSED, DEACTIVATED, CONFIRMED are terminal; no transitions out | State machine guards |

---

## 7. Integration Points

| Integration | Direction | Protocol | Purpose | Evidence |
|-------------|-----------|----------|---------|----------|
| ERP System | Bidirectional | REST API | PO sync, GL posting, vendor master | E4 (Muhammed Jamsheed): "ERP systems lack strong integration" |
| Banking Platform | Outbound | REST API | ACH, wire, SEPA payment execution | E3 (Ayman Shawky): "instant view of cash positions" |
| OCR Engine | Inbound | REST API | Invoice text extraction | E1 (T2): "error-prone" manual extraction |
| Email Gateway | Bidirectional | SMTP/API | Invoice receipt, notifications | E1 (T1): email-based approvals cause delays |
| Vendor Portal | Bidirectional | REST API | Self-service invoice upload, status | E7 (Ahmed Orabi): AP/P2P workflow needs |
| Treasury System | Bidirectional | REST API | Cash position, forecast, payment scheduling | E3, E9: Treasury integration |
| Budget System | Inbound | REST API | Budget availability check | VP3: Trust Requires Provable Accuracy |
| Audit System | Outbound | REST API | Audit trail export | VP4: Every Action Is Auditable |
| Notification Platform | Outbound | Internal API | Email, Slack, in-app notifications | E1 (T1): approval delays require proactive notification |
| AI Platform | Bidirectional | Internal API | Recommendations, risk scoring, auto-coding | HP1: AI Must Explain Itself [HYPOTHESIS] |

---

## 8. Notification Map

Every stage triggers notifications to specific stakeholders. Notifications are sent via the NotificationPlatform and routed to the appropriate channel (email, Slack, in-app, vendor portal).

| Stage | Recipient | Channel | Event | Evidence |
|-------|-----------|---------|-------|----------|
| 1. Invoice Received | AP Clerk | Email + In-App | Invoice captured, OCR complete | E1 (T2): no silent drops |
| 1. Invoice Received | Vendor | Portal | Upload confirmed, invoice received | E7 (Ahmed Orabi): AP/P2P workflow |
| 2. Invoice Validated | System | Internal | Evidence package assembled | Automated — no notification needed |
| 3. Three-Way Match | AP Clerk | In-App | Match result (green/yellow/red) | E4 (Muhammed): "intelligent discrepancy alerts" |
| 4. Exception Queue | AP Manager | Email + In-App | Exception raised, resolution needed | WP1: "Exceptions Deserve Attention" |
| 4. Exception Queue | Procurement | In-App | PO-related exception requiring input | E4: ERP integration gaps |
| 5. Approval Routing | Approver | Email + In-App | Approval required, evidence ready | E1 (T1): "approval workflows...delay payments" |
| 5. Approval Routing | Vendor | Portal | Invoice under review | E7: vendor visibility |
| 6. Payment Readiness | Treasury Manager | Email + In-App | Payment proposal ready for review | E3 (Ayman): "instant view of cash positions" |
| 7. Treasury Approval | Treasury Manager | In-App | Cash availability check result | E9 (Ahmed Abdelmoneim): treasury integration |
| 8. Payment Execution | Treasury Manager | In-App | Payment status update (processing/completed/failed) | E9: treasury reliability |
| 8. Payment Execution | Vendor | Portal + Email | Payment sent, reference provided | E7: vendor visibility |
| 9. GL Posting | Controller | In-App | GL entries posted, subledger updated | E5 (Mohamed): "manual account reconciliation" |
| 10. Audit | Controller | In-App | Reconciliation complete, audit trail verified | VP4: Every Action Is Auditable |
| 10. Audit | Auditor | In-App | Audit package ready for review | VP4: audit readiness |

### Notification SLAs

| Priority | Response Expected | Escalation |
|----------|-------------------|------------|
| CRITICAL (payment failure, SoD violation) | Immediate | CFO + Controller within 1 hour |
| HIGH (exception, approval request) | 4 hours | Auto-escalate after SLA |
| MEDIUM (status update, reconciliation) | 24 hours | Weekly digest |
| LOW (report generated, audit complete) | No response needed | Log only |

---

## 9. Error Recovery Matrix

Every failure mode in the workflow has a defined recovery path. Recovery transitions are first-class operations with full audit trails.

| Failure Mode | Stage | Severity | Recovery Action | SLA | Owner | Audit Event |
|-------------|-------|----------|-----------------|-----|-------|-------------|
| OCR misread amount | 1 | HIGH | Manual correction with audit trail | 4 hours | AP Clerk | `invoice.corrected` |
| Duplicate invoice not detected | 1 | CRITICAL | Block payment, investigate | 1 hour | AP Manager | `invoice.duplicate.investigated` |
| New vendor without approval | 1 | HIGH | Block processing, notify AP Manager | 4 hours | AP Manager | `vendor.pending.review` |
| PO not found | 2 | MEDIUM | Flag for manual PO lookup | 2 days | Procurement | `evidence.po.missing` |
| GRN not posted | 2 | MEDIUM | Queue GRN creation | 1 day | Warehouse | `evidence.grn.pending` |
| Contract expired | 2 | MEDIUM | Alert contract expiry, continue processing | 1 day | Procurement | `evidence.contract.expired` |
| Match tolerance too tight | 3 | LOW | Adjust tolerance, re-run match | 1 day | AP Manager | `match.tolerance.adjusted` |
| False positive exception | 3 | LOW | Override match with reason | 4 hours | AP Clerk | `match.override.applied` |
| Exception ignored beyond SLA | 4 | HIGH | Auto-escalate to AP Manager | Per SLA | AP Manager | `exception.escalated` |
| Wrong exception resolver | 4 | MEDIUM | Reassign with audit trail | 4 hours | AP Manager | `exception.reassigned` |
| AI confidence low on recommendation | 5 | LOW | Route to manual review | 1 day | AP Clerk | `ai.confidence.low` |
| Department non-response | 5 | MEDIUM | Auto-escalate after SLA | Per SLA | AP Manager | `coordination.escalated` |
| Wrong approver selected | 5 | HIGH | Reassign with audit trail | 4 hours | AP Manager | `approval.reassigned` |
| SoD violation detected | 5 | CRITICAL | Block approval, audit | Immediate | Controller | `sod.violation.blocked` |
| Approval SLA breached | 5 | HIGH | Auto-escalate to next authority | Per SLA | System | `approval.auto.escalated` |
| Insufficient cash for batch | 6 | HIGH | Split batch, reschedule | 1 day | Treasury | `payment.batch.split` |
| Discount window missed | 6 | MEDIUM | Flag for next cycle, log | 1 day | Treasury | `payment.discount.missed` |
| Bank API failure | 7-8 | CRITICAL | Manual wire, retry | 2 hours | Treasury | `payment.bank.failure` |
| Payment failed after retry | 8 | HIGH | Escalate to Treasury Manager | 4 hours | Treasury | `payment.escalated` |
| Fraudulent payment pattern | 8 | CRITICAL | Freeze, alert CFO + Controller | Immediate | Treasury + Controller | `payment.fraud.alert` |
| GL entry coding wrong | 9 | MEDIUM | Adjustment entry with approval | 2 days | Controller | `gl.adjustment.posted` |
| Subledger mismatch | 9 | HIGH | Block close, investigate | 1 day | Controller | `gl.subledger.mismatch` |
| Bank statement delayed | 10 | MEDIUM | Queue for matching when received | 3 days | Controller | `reconciliation.pending` |
| Reconciliation mismatch | 10 | HIGH | Investigate, resolve | 3 days | Controller | `reconciliation.exception` |
| Checksum chain broken | 10 | CRITICAL | Alert Controller, freeze records | Immediate | Controller | `audit.checksum.broken` |

---

## 10. Cross-Cutting Concerns

### Idempotency

Every mutation in the workflow is idempotent. Duplicate submissions produce the same result. Payment submissions use a unique idempotency key (UUID v4) to prevent double-payment. The idempotency key is stored with the payment record and checked before execution.

**Invariant**: No payment executes without an idempotency check. Evidence: VP5 (Financial Precision).

### Optimistic Locking

Every aggregate root (Invoice, Payment, Approval, Exception, Vendor) has a `version` field (integer, default 0, auto-increment on update). Concurrent modifications are detected via version mismatch and rejected with a conflict error. The user must refresh and retry.

**Invariant**: No update executes without a version check. Evidence: VP4 (Every Action Is Auditable).

### Rate Limiting

API endpoints are rate-limited per user and per tenant. Payment endpoints have stricter limits (10/minute). Bulk operations have separate limits (1000/hour). Rate limiting prevents abuse and ensures fair resource allocation.

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Read (GET) | 100 requests | per minute |
| Write (POST/PUT/PATCH) | 30 requests | per minute |
| Payment execution | 10 requests | per minute |
| Bulk import | 5 requests | per minute |
| Authentication | 5 requests | per minute |

### Encryption

All banking credentials, payment details, and PII are encrypted at rest using AES-256-GCM. Encryption keys are rotated quarterly via the SecretManager. Data classification determines encryption requirements:

| Classification | Encryption | Key Rotation |
|---------------|------------|-------------|
| RESTRICTED (banking, credentials) | AES-256-GCM | 90 days |
| CONFIDENTIAL (invoices, approvals, GL) | AES-256-GCM | 180 days |
| INTERNAL (coordination, notifications) | AES-256-GCM | 365 days |

### Concurrent Modification Handling

When two users attempt to modify the same entity simultaneously, the second update is rejected:

```
ConflictError: "Invoice was modified by another user. Please refresh and retry."
```

The response includes the current version, allowing the client to refresh and retry without data loss.

### Tenant Isolation

Every AP query is scoped to the current tenant. The RuntimeContext propagates `companyId` via AsyncLocalStorage. Cross-tenant access is blocked at the repository layer:

```typescript
// Every repository method includes companyId filter
async findAll(companyId: string, filters?: APFilters) {
  return this.prisma.procurementVendorInvoice.findMany({
    where: { companyId, ...filters }
  });
}
```

---

## 11. Expected Total Time Reduction

| Stage | Manual (Average) | Perionyx (Target) | Reduction | Evidence |
|-------|------------------|--------------------|-----------|----------|
| 1. Invoice Received | 20 min | 3 min | 85% | E1 (T2): "error-prone" manual entry |
| 2. Invoice Validated | 60 min | 30 sec | 99% | E4 (Muhammed): "automated reconciliation is highly desired" |
| 3. Three-Way Match | 45 min | 2 sec | 99% | E1, E2 (T2): "manual matching is the pain" |
| 4. Exception Queue | 30 min | 5 min | 83% | E4: "intelligent discrepancy alerts" |
| 5. Approval Routing | 2-5 days | 4-8 hours | 75% | E1, E2 (T1): "approval workflows delay payments" |
| 6. Payment Readiness | 1-2 days | 30 min | 90% | E3 (Ayman): "instant view of cash positions" |
| 7. Treasury Approval | 1 day | 2 hours | 83% | E9 (Ahmed Abdelmoneim): treasury integration |
| 8. Payment Execution | 1-3 days | 15 min | 95% | VP5: Financial Precision |
| 9. GL Posting | 1 day | 15 min | 93% | E5 (Mohamed): "manual account reconciliation" |
| 10. Audit & Reconciliation | 2-3 days | 30 min | 93% | E5: "manual bank reconciliation" |
| **Total** | **10-17 days** | **2-3 days** | **80-85%** | — |

### Expected Financial Impact

| Metric | Manual | Perionyx | Impact |
|--------|--------|----------|--------|
| Duplicate payment rate | ~5% | <0.1% | 98% reduction |
| Early-pay discount capture | ~20% | >80% | 4x improvement |
| Late payment penalties | $50K/year (est.) | <$5K/year | 90% reduction |
| Audit preparation time | 2 weeks | 2 days | 85% reduction |
| Cost per invoice | $15-25 | <$5 | 60-80% reduction |

---

## 12. What This Workflow Is NOT

### This Workflow Is

- A complete description of how vendor invoices flow from receipt to reconciliation
- Grounded in customer evidence from 10 sources
- Designed for finance professionals who need confidence in every payment
- The blueprint for all future Perionyx financial workflows

### This Workflow Is NOT

- **Not a 14-stage workflow**: v2.0 simplified to 10 stages by merging handoffs that added friction without adding control (evidence-based staging: E1, E5 — "manual oversight" implies unnecessary handoffs are the problem)
- **Not fully validated**: 14 of 65 business rules are marked [HYPOTHESIS] — they need customer validation before implementation
- **Not a replacement for vendor onboarding**: Vendor onboarding is a separate workflow (planned Phase 28). This workflow assumes vendors are already in the system or flagged during Stage 1.
- **Not a replacement for purchase order creation**: PO creation is upstream of this workflow. This workflow receives invoices that reference existing POs.
- **Not a replacement for Treasury management**: Treasury is a separate workflow. This workflow interfaces with Treasury at Stages 6-8.
- **Not a replacement for General Ledger management**: GL is a separate workflow. This workflow posts to GL at Stage 9.

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | REFERENCE_WORKFLOW_AP_v2.0 |
| Phase | 27.1 |
| Author | Perionyx Product Architecture Board |
| Reviewers | CFO Advisory Board, Engineering Leads |
| Status | Draft — pending finance professional review |
| Next Review | Phase 27.0B (Implementation) |
| Classification | Internal — Engineering & Product |
| Version History | See below |

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0 | 2026-07-28 | Initial AP reference workflow (14 stages) | Product Team |
| 2.0 | 2026-07-28 | Simplified to 10 stages, 5 state machines, 10 evidence sources, [HYPOTHESIS] tagging | Product Team |
