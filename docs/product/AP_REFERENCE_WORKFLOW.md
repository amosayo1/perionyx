# AP Reference Workflow — Perionyx Enterprise Financial Operating System

> Phase 27.0A — Enterprise Product Architecture & Workflow Design
> Version: 1.0 | Date: 2026-07-28
> Authority: Product Architecture Board
> Classification: Internal — Engineering & Product

---

## 1. Purpose

This document defines the **Accounts Payable Reference Workflow** — the canonical procure-to-pay lifecycle that Perionyx implements. It is the single source of truth for how vendor invoices flow from receipt to reconciliation, covering every decision point, audit event, and human interaction.

This workflow is designed for **CFOs, Controllers, AP Managers, Treasury Managers, and Auditors** who need confidence that every dollar leaving the organisation is authorised, documented, and reconciled.

### Design Principles

1. **Every stage has a clear owner** — no orphaned decisions
2. **Every transition is audited** — immutable append-only trail
3. **Every number is precise** — Decimal(38,12), no native arithmetic
4. **AI prepares, humans decide** — AI never approves, never pays, never overrides controls
5. **Failure is expected** — every stage has defined recovery paths
6. **Multi-tenancy is absolute** — companyId on every record, no exceptions

### Customer Evidence

- Adeel Aslam: "vendor invoice reconciliations and approval workflows... often require manual oversight to ensure accuracy"
- Ayman Shawky: "Siloed systems create reconciliation overhead" / "Need for instant view of cash positions"
- Theme T1: Manual Approval Workflows Delay Payments (2 sources)
- Theme T2: Vendor Invoice Reconciliation Is Manual and Error-Prone (2 sources)

### Current State (Phase 21.0 Audit)

- 11 procurement pages, 20 components, 12 domain services — ALL display-only
- Zero Prisma models, zero API routes, zero mutation methods
- 14 workflow stages defined, 0 production-ready
- Matching engine exists (126 lines) but not wired to UI
- GL integration exists but not called
- 17 feature gaps, 8 integration gaps

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

**Invariant**: Every monetary field in every Prisma model uses `Decimal(38,12)`. No Float, no Number, no integer-cents representation.

---

## 3. Multi-Tenancy

Every record in the AP workflow carries a `companyId` field. Queries are scoped to the current tenant via RuntimeContext. Cross-tenant access is blocked at the repository layer.

**Invariant**: No AP query executes without a `companyId` filter. This is enforced by the `PrismaRepository` base class.

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

**Invariant**: Audit records cannot be updated or deleted. The checksum chain makes tampering detectable.

---

## 5. The 10 Stages

### Stage 1: Invoice Received

> **Why This Stage Exists**: Every payment begins with a vendor's demand for money. The system must capture the demand completely, immediately, and without loss. A lost invoice means a lost vendor relationship, a missed discount, or a surprise liability at month-end.

| Field | Detail |
|-------|--------|
| **User Goal** | Vendor invoice enters the system with zero manual re-keying |
| **System Goal** | Capture invoice data, assign unique ID, start the workflow clock |
| **Inputs** | Email attachment (PDF), manual upload (PDF/Image), API submission (JSON), vendor portal upload, EDI transmission |
| **Outputs** | `ProcurementVendorInvoice` record (status: `DRAFT` → `CAPTURED`), OCR-extracted fields, unique invoice ID, workflow start timestamp |
| **Business Rules** | BR-1.1: Duplicate detection (vendor + invoice number + date). BR-1.2: Invoice number format validated against vendor profile. BR-1.3: Amount and currency extracted with confidence score. BR-1.4: Vendor matched to existing record or flagged as new. BR-1.5: Due date calculated from payment terms. |
| **Security** | Roles: AP Clerk, AP Manager, Vendor (portal). Permission: `invoices.create`. Rate limit: 100 uploads/hour. |
| **Audit Events** | `invoice.received`, `invoice.captured`, `invoice.ocr.completed`, `invoice.duplicate.detected` |
| **Classification** | CONFIDENTIAL — contains vendor banking details, amounts, terms |
| **AI Assistance** | OCR field extraction, vendor matching, duplicate probability scoring, payment term inference |
| **Human Decision** | Confirm OCR results if confidence < 85%. Review flagged duplicates. Approve new vendor creation. |
| **Platform Services** | DocumentPlatform (OCR), IntegrationPlatform (EDI), NotificationPlatform (acknowledgment) |
| **Expected Time Reduction** | Manual: 15-30 min/invoice → Perionyx: 2-5 min/invoice (70-85% reduction) |
| **Failure Modes** | OCR misreads amount. Duplicate invoice not detected. Vendor not matched. Email attachment corrupted. |
| **Recovery** | Manual correction of OCR fields. Override duplicate flag with reason. Create new vendor with approval. Re-upload corrupted file. |

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

### Stage 2: Evidence Collection

> **Why This Stage Exists**: An invoice without context is just a number. Approving a number without evidence is gambling. The system must gather every piece of evidence that justifies (or challenges) the invoice before any human sees it.

| Field | Detail |
|-------|--------|
| **User Goal** | System assembles all supporting evidence automatically |
| **System Goal** | Link PO, GRN, contract, vendor history, and prior invoices to this invoice |
| **Inputs** | Invoice record from Stage 1, PO database, GRN database, contract store, vendor history |
| **Outputs** | Evidence package: linked PO(s), GRN(s), contract terms, vendor payment history, price comparison, prior invoice variance |
| **Business Rules** | BR-2.1: PO linked by PO number (exact) or amount+vendor (fuzzy). BR-2.2: GRN linked by PO line items received. BR-2.3: Contract terms extracted (payment terms, discount, pricing). BR-2.4: Vendor history includes last 12 months of invoices and payment dates. BR-2.5: Price variance calculated against PO and market benchmarks. |
| **Security** | Roles: System (automated). AP Clerk (read). Audit role (read). Permission: `invoices.read`, `evidence.collect`. |
| **Audit Events** | `evidence.po.linked`, `evidence.grn.linked`, `evidence.contract.extracted`, `evidence.history.loaded` |
| **Classification** | CONFIDENTIAL — PO contains pricing, quantities, delivery terms |
| **AI Assistance** | Fuzzy PO matching, contract clause extraction, price anomaly flagging, vendor reliability scoring |
| **Human Decision** | None in normal flow. AP Clerk reviews if fuzzy match confidence < 80%. |
| **Platform Services** | IntegrationPlatform (ERP sync), AIDocumentAnalysis (clause extraction), WorkflowPlatform (evidence assembly) |
| **Expected Time Reduction** | Manual: 45-90 min/invoice → Perionyx: 30 sec (automated) — 99% reduction |
| **Failure Modes** | PO not found in system. GRN not yet created. Contract expired. Vendor history incomplete. |
| **Recovery** | Flag "No PO Found" for manual review. Queue GRN creation. Alert contract expiry. Load available history. |

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

> **Why This Stage Exists**: Three-way matching is the fundamental control that prevents overpayment, duplicate payment, and fraudulent payment. It answers one question: "Did we order this, did we receive it, and is the price right?"

| Field | Detail |
|-------|--------|
| **User Goal** | Automated match confirms (or challenges) that invoice, PO, and GRN agree |
| **System Goal** | Compare invoice line items against PO and GRN within configurable tolerances |
| **Inputs** | Invoice line items, PO line items, GRN received quantities, tolerance rules |
| **Outputs** | Match result: MATCHED (green), TOLERANCE (yellow), EXCEPTION (red). Line-item variance table. |
| **Business Rules** | BR-3.1: 2-way match (Invoice ↔ PO) if GRN not required. BR-3.2: 3-way match (Invoice ↔ PO ↔ GRN) for goods. BR-3.3: Price tolerance configurable per vendor/category (default: 2%). BR-3.4: Quantity tolerance configurable (default: 0 — exact match for goods, 5% for services). BR-3.5: If all line items within tolerance → MATCHED. If any line outside tolerance → EXCEPTION. |
| **Security** | Roles: System (automated). AP Clerk (read, override with reason). Permission: `invoices.match`, `invoices.override`. |
| **Audit Events** | `match.started`, `match.line.evaluated`, `match.completed`, `match.exception.raised` |
| **Classification** | CONFIDENTIAL — pricing, quantities, variance data |
| **AI Assistance** | Anomaly detection on variance patterns, historical tolerance learning, vendor-specific tolerance suggestion |
| **Human Decision** | Override match result with documented reason if business justification exists |
| **Platform Services** | AP Matching Engine, ApprovalMatrix (tolerance configuration), AIPatternDetection (anomaly flagging) |
| **Expected Time Reduction** | Manual: 30-60 min/invoice → Perionyx: 2 sec (automated) — 99% reduction |
| **Failure Modes** | Tolerance threshold too tight (false exceptions). Tolerance too loose (misses overpayment). GRN not yet posted. Partial delivery not handled. |
| **Recovery** | Adjust tolerance per vendor/category. Queue GRN creation. Split invoice for partial deliveries. |

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

### Stage 4: Exception Detection

> **Why This Stage Exists**: Exceptions are not failures — they are the system protecting the organisation. Every exception is a potential overpayment, duplicate, or fraud caught before money leaves the account. The system must make exceptions easy to resolve, not easy to ignore.

| Field | Detail |
|-------|--------|
| **User Goal** | Understand exactly what is wrong and what action to take |
| **System Goal** | Classify, prioritise, and route exceptions for resolution |
| **Inputs** | Match exceptions from Stage 3, duplicate detection results, anomaly flags from AI |
| **Outputs** | Classified exception with severity, suggested resolution, routed to appropriate resolver |
| **Business Rules** | BR-4.1: Exceptions classified as CRITICAL (amount > threshold), HIGH (amount variance > 10%), MEDIUM (amount variance 2-10%), LOW (administrative). BR-4.2: CRITICAL exceptions require AP Manager resolution. BR-4.3: Duplicate invoices blocked from payment. BR-4.4: Exception SLA: CRITICAL 1 day, HIGH 2 days, MEDIUM 5 days. BR-4.5: Auto-escalate if SLA breached. |
| **Security** | Roles: AP Clerk (resolve LOW/MEDIUM), AP Manager (resolve all), Procurement (resolve PO-related). Permission: `exceptions.resolve`. |
| **Audit Events** | `exception.created`, `exception.classified`, `exception.routed`, `exception.resolved`, `exception.escalated` |
| **Classification** | CONFIDENTIAL — financial discrepancy details |
| **AI Assistance** | Root cause analysis, resolution recommendation, similar exception history, impact assessment |
| **Human Decision** | Choose resolution: accept (adjust PO), reject (return to vendor), dispute (query vendor), credit (request credit note) |
| **Platform Services** | ExceptionService, NotificationPlatform (escalation), AIDiagnosis (root cause), VendorPortal (communication) |
| **Expected Time Reduction** | Manual: 2-5 days/exception → Perionyx: 4-8 hours/exception (60-80% reduction) |
| **Failure Modes** | Exception ignored beyond SLA. Wrong person assigned. Root cause misidentified. Resolution creates new exception. |
| **Recovery** | Auto-escalation. Reassignment. Additional evidence collection. Secondary review. |

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

### Stage 5: AI Context Building

> **Why This Stage Exists**: A human reviewing an invoice needs context — vendor history, payment patterns, contract terms, budget impact, similar invoices. Gathering this manually takes 30-60 minutes. AI does it in seconds, presenting a structured decision package.

| Field | Detail |
|-------|--------|
| **User Goal** | Receive a complete decision package before being asked to approve |
| **System Goal** | Assemble evidence, calculate risk, generate recommendation with explainability |
| **Inputs** | Invoice, evidence package, match results, exceptions, vendor history, budget data, approval matrix |
| **Outputs** | AI Decision Package: risk score (0-100), recommendation (approve/review/reject), confidence (%), evidence summary, comparable invoices, budget impact, cash flow projection |
| **Business Rules** | BR-5.1: AI never approves — only recommends. BR-5.2: Confidence score must be displayed with every recommendation. BR-5.3: Every recommendation must answer: Why? Based on what? How confident? BR-5.4: AI package available for human review but does not block workflow. BR-5.5: AI training data must not include PII beyond what is necessary. |
| **Security** | Roles: System (build package). Approver (read). AI Auditor (read all AI reasoning). Permission: `invoices.read`, `ai.recommend`. |
| **Audit Events** | `ai.package.built`, `ai.risk.scored`, `ai.recommendation.generated` |
| **Classification** | CONFIDENTIAL — financial analysis, risk assessment |
| **AI Assistance** | Risk scoring, recommendation generation, evidence summarisation, comparable analysis, budget impact projection |
| **Human Decision** | Accept or override AI recommendation. Request additional evidence. Escalate to different approver. |
| **Platform Services** | AIDecisionEngine, AIPatternDetection, AIForecastEngine, WorkflowPlatform, NotificationPlatform |
| **Expected Time Reduction** | Manual: 30-60 min/invoice → Perionyx: 5 min review of AI package (90% reduction) |
| **Failure Modes** | AI confidence miscalibrated. Evidence incomplete. Risk score misleading. Recommendation biased by historical data. |
| **Recovery** | Human override with reason. Additional evidence request. Secondary AI model review. Audit of AI reasoning. |

**Detailed Flow**:
1. AI reads invoice, evidence, match results, and exceptions
2. Calculates risk score: vendor reliability (30%), price variance (25%), match quality (20%), budget impact (15%), payment timing (10%)
3. Generates recommendation: if risk < 30 and match = GREEN → "Approve". If risk 30-70 → "Review". If risk > 70 → "Reject".
4. Assembles evidence summary: "Invoice from [Vendor] for $12,450.00 matches PO-4521. Price is 1.2% above PO (within tolerance). Vendor paid on time 8 of last 10 invoices. Budget remaining: $45,000."
5. Attaches comparable invoices: "Similar invoices from this vendor: INV-2025-089 ($11,200), INV-2025-072 ($13,100)"
6. Projects cash flow impact: "If approved today, payment due [date]. Cash position after payment: $[amount]."
7. Package presented to approver with confidence score and reasoning chain

---

### Stage 6: Cross-Department Coordination

> **Why This Stage Exists**: Invoices rarely involve just AP. Procurement needs to confirm the PO. The receiving department needs to confirm delivery. Finance needs to confirm budget. This stage coordinates those inputs without email chains or hallway conversations.

| Field | Detail |
|-------|--------|
| **User Goal** | All necessary departments provide input without delay |
| **System Goal** | Route to correct departments, track responses, escalate non-responses, aggregate input |
| **Inputs** | Invoice, AI package, approval matrix, department mapping, SLA configuration |
| **Outputs** | Departmental inputs (confirmations, questions, objections), coordination status, resolved queries |
| **Business Rules** | BR-6.1: Departments identified by invoice category and amount. BR-6.2: SLA per department: 2 business days. BR-6.3: Auto-escalate after SLA. BR-6.4: All department inputs required before approval. BR-6.5: Questions must be answered within SLA or escalated. |
| **Security** | Roles: AP Clerk (initiate), Department Heads (respond), AP Manager (override). Permission: `invoices.coordinate`, `departments.respond`. |
| **Audit Events** | `coordination.initiated`, `coordination.department.notified`, `coordination.input.received`, `coordination.question.asked`, `coordination.question.answered`, `coordination.completed` |
| **Classification** | INTERNAL — department-level coordination, not vendor-visible |
| **AI Assistance** | Route optimisation, SLA prediction, similar invoice routing history, bottleneck detection |
| **Human Decision** | Department heads confirm or object. AP Manager resolves disputes. |
| **Platform Services** | WorkflowPlatform (routing), NotificationPlatform (department alerts), AIPrediction (SLA forecasting) |
| **Expected Time Reduction** | Manual: 3-7 days (email chains) → Perionyx: 1-2 days (structured routing) — 50-70% reduction |
| **Failure Modes** | Wrong department routed. Non-response beyond SLA. Conflicting department inputs. Routing logic outdated. |
| **Recovery** | Manual reassignment. Escalation to AP Manager. Conflict resolution meeting. Routing rule update. |

**Detailed Flow**:
1. System determines required departments from invoice category, amount, and approval matrix
2. Each department receives notification with invoice summary and AI package
3. Department provides input: Confirm (no issues), Question (needs clarification), Object (has concern)
4. Questions routed to AP Clerk or vendor for response
5. Objections routed to AP Manager for resolution
6. All inputs tracked with timestamps and SLA countdown
7. When all inputs received (or SLA breached with escalation): proceed to Stage 7
8. Coordination summary attached to invoice record

---

### Stage 7: Approval

> **Why This Stage Exists**: Approval is the moment of commitment. A human being, with all evidence before them, authorises the organisation to pay money. This stage ensures the right person approves, has the authority to approve, and their decision is recorded immutably.

| Field | Detail |
|-------|--------|
| **User Goal** | Approve (or reject) with full context and confidence |
| **System Goal** | Route to authorised approver based on amount, capture decision, enforce SoD, record audit |
| **Inputs** | Invoice, AI package, department inputs, approval matrix, authority limits |
| **Outputs** | Approval decision (APPROVED/REJECTED/ESCALATED/DELEGATED), digital signature, audit record |
| **Business Rules** | BR-7.1: Approval required per threshold: <$1K = AP Clerk, <$10K = AP Manager, <$50K = Controller, <$250K = CFO, >$250K = CFO + Board. BR-7.2: Segregation of duties: invoice creator cannot approve. BR-7.3: Approval delegation allowed to pre-registered delegates. BR-7.4: Escalation if SLA breached (configurable, default 3 days). BR-7.5: Partial approval not allowed — full invoice amount must be authorised. |
| **Security** | Roles: Approver (per authority level). AP Manager (override with audit). Permission: `approvals.approve`, `approvals.escalate`, `approvals.delegate`. |
| **Audit Events** | `approval.requested`, `approval.routed`, `approval.approved`, `approval.rejected`, `approval.escalated`, `approval.delegated`, `approval.timed_out` |
| **Classification** | CONFIDENTIAL — authority limits, approval decisions, financial commitments |
| **AI Assistance** | Suggest optimal approver, flag authority boundary cases, predict approval time, detect unusual approval patterns |
| **Human Decision** | Final approval or rejection. Delegation to another approver. Escalation to higher authority. |
| **Platform Services** | ApprovalMatrix, ApprovalStepExecutor, NotificationPlatform, AIDecisionSupport, AuditPlatform |
| **Expected Time Reduction** | Manual: 2-5 days (paper-based) → Perionyx: 4-8 hours (digital) — 60-80% reduction |
| **Failure Modes** | Wrong approver selected. SoD violation not detected. Approval SLA breached. Delegation chain broken. |
| **Recovery** | Manual reassignment. SoD override with justification. Auto-escalation. Delegation chain repair. |

**Detailed Flow**:
1. System determines approval chain from approval matrix (amount × department × vendor category)
2. Invoice routed to first approver in chain
3. Approver reviews: invoice, evidence, AI package, department inputs
4. Decision: APPROVE → next level (if multi-level) or Stage 8. REJECT → return to AP Clerk with reason. ESCALATE → higher authority. DELEGATE → pre-registered delegate.
5. If multi-level: each level must approve before next level is notified
6. If all levels approved: invoice promoted to `APPROVED`, proceed to Stage 8
7. Digital signature recorded (user ID, timestamp, IP address, session ID)
8. Vendor notified: "Invoice [INV-2026-001] approved for payment"

---

### Stage 8: Payment Readiness

> **Why This Stage Exists**: Paying one invoice at a time is wasteful. Payment readiness batches invoices, captures early-payment discounts, aligns with cash flow, and ensures the organisation pays optimally — not just correctly.

| Field | Detail |
|-------|--------|
| **User Goal** | Approved invoices batched for payment at the optimal time |
| **System Group** | Create payment proposals, optimise batch, capture discounts, align with cash position |
| **Inputs** | Approved invoices, payment terms, discount windows, cash position, bank details, payment calendar |
| **Outputs** | Payment proposal: batch of invoices, total amount, payment date, discount captured, cash flow impact |
| **Business Rules** | BR-8.1: Batch by payment method (ACH, wire, check, SEPA). BR-8.2: Capture early-payment discount if discount amount > cost of early payment. BR-8.3: Align payment date with cash flow forecast. BR-8.4: Minimum payment threshold per batch (configurable). BR-8.5: Payment proposal requires Treasury Manager approval before execution. |
| **Security** | Roles: System (generate proposals), Treasury Manager (approve), AP Manager (override). Permission: `payments.propose`, `payments.approve`. |
| **Audit Events** | `payment.proposal.created`, `payment.batch.optimized`, `payment.discount.captured`, `payment.proposal.submitted` |
| **Classification** | CONFIDENTIAL — cash position, payment amounts, bank details |
| **AI Assistance** | Discount optimisation, cash flow alignment, payment timing recommendation, bank fee estimation |
| **Human Decision** | Treasury Manager approves payment batch. AP Manager overrides batch composition. |
| **Platform Services** | PaymentService, TreasuryService, AIForecastEngine, BankingPlatform, NotificationPlatform |
| **Expected Time Reduction** | Manual: 1-2 days (manual batching) → Perionyx: 30 min (automated proposals) — 80% reduction |
| **Failure Modes** | Insufficient cash for batch. Discount window missed. Bank details incorrect. Duplicate payment risk. |
| **Recovery** | Split batch. Reschedule. Bank detail verification. Duplicate detection before execution. |

**Detailed Flow**:
1. System queries all `APPROVED` invoices due within payment window
2. Groups by payment method and currency
3. For each group: calculate total, check discount eligibility, estimate bank fees
4. If discount available: calculate NPV of early payment vs. delayed payment
5. Query cash position and forecast from TreasuryService
6. Generate payment proposal with: invoices, amounts, dates, bank details, cash impact
7. Treasury Manager reviews and approves (or modifies) proposal
8. Approved proposal moves to Stage 9

---

### Stage 9: Payment

> **Why This Stage Exists**: This is the moment money leaves the organisation. Every control, every approval, every audit trail leads to this point. Payment execution must be precise, confirmed, and irrecoverable only after explicit verification.

| Field | Detail |
|-------|--------|
| **User Goal** | Payment executed correctly, confirmed, and recorded |
| **System Goal** | Execute payment via banking integration, confirm receipt, update records, notify stakeholders |
| **Inputs** | Approved payment proposal, bank credentials, payment gateway, compliance rules |
| **Outputs** | Payment confirmation, bank reference number, GL journal entries, vendor notification, audit record |
| **Business Rules** | BR-9.1: Payment executed only after Treasury Manager approval. BR-9.2: Dual-signature required for payments > $50K. BR-9.3: Idempotency key prevents duplicate payments. BR-9.4: Payment status tracked in real-time (processing → completed/failed). BR-9.5: Failed payments auto-retry once, then escalate. |
| **Security** | Roles: Treasury Manager (execute), System (banking API). Permission: `payments.execute`. Banking credentials encrypted at rest. |
| **Audit Events** | `payment.initiated`, `payment.submitted`, `payment.processing`, `payment.completed`, `payment.failed`, `payment.confirmed` |
| **Classification** | RESTRICTED — banking credentials, payment amounts, account numbers |
| **AI Assistance** | Payment failure prediction, optimal payment timing, fraud detection on payment patterns |
| **Human Decision** | Treasury Manager authorises execution. Manual intervention on payment failure. |
| **Platform Services** | BankingPlatform (ACH/wire/SEPA), PaymentGateway, AuditPlatform, NotificationPlatform |
| **Expected Time Reduction** | Manual: 1-3 days (check printing, wire initiation) → Perionyx: 15 min (digital execution) — 90% reduction |
| **Failure Modes** | Bank API down. Payment rejected by bank. Insufficient funds. Incorrect bank details. Fraudulent payment detected. |
| **Recovery** | Retry with backoff. Manual wire initiation. Fund transfer from reserve. Bank investigation. Fraud alert freeze. |

**Detailed Flow**:
1. Payment proposal received from Stage 8
2. System validates: approval complete, bank details verified, idempotency check passed
3. Payment submitted to banking platform (ACH/wire/SEPA)
4. Real-time status tracking: submitted → processing → completed/failed
5. On completion: bank reference number recorded, GL journal entries generated
6. On failure: retry once (if transient), then escalate to Treasury Manager
7. Vendor notified: "Payment of [amount] sent on [date], reference [ref]"
8. Invoice promoted to `PAID`

---

### Stage 10: Audit Completion

> **Why This Stage Exists**: Payment is not the end. The organisation needs to know: was the payment correct? Is the GL accurate? Is the audit trail complete? Can we prove this to an auditor? Audit completion closes the loop.

| Field | Detail |
|-------|--------|
| **User Goal** | Complete audit trail, reconciled GL, provable compliance |
| **System Goal** | Generate GL entries, reconcile bank statement, close audit trail, update financial intelligence |
| **Inputs** | Payment confirmation, bank statement, GL account codes, cost centres, audit requirements |
| **Outputs** | GL journal entries, bank reconciliation record, closed audit trail, financial reports updated, vendor statement updated |
| **Business Rules** | BR-10.1: GL entries generated automatically from invoice coding. BR-10.2: Bank reconciliation matches payment to bank statement line. BR-10.3: Audit trail closed with final checksum. BR-10.4: Vendor statement updated with payment. BR-10.5: Financial reports (AP aging, cash flow) updated immediately. |
| **Security** | Roles: System (automated), Auditor (read), Controller (override). Permission: `reconciliation.post`, `audit.read`. |
| **Audit Events** | `gl.posted`, `reconciliation.matched`, `audit.trail.closed`, `statement.updated`, `reports.refreshed` |
| **Classification** | CONFIDENTIAL — GL entries, reconciliation data, audit trail |
| **AI Assistance** | Auto-coding suggestions, reconciliation matching, anomaly detection in GL entries, audit completeness check |
| **Human Decision** | Controller reviews GL entries. Auditor verifies audit trail. Reconciliation exceptions resolved manually. |
| **Platform Services** | GLIntegrationService, ReconciliationService, AuditPlatform, FinancialReporting, AIAutoCoding |
| **Expected Time Reduction** | Manual: 1-2 days (manual GL posting, reconciliation) → Perionyx: 15 min (automated) — 90% reduction |
| **Failure Modes** | GL entry coding wrong. Bank statement delayed. Audit trail incomplete. Reconciliation mismatch. |
| **Recovery** | GL adjustment entry. Manual reconciliation. Audit trail repair. Statement investigation. |

**Detailed Flow**:
1. Payment confirmed → GL journal entries generated (debit AP, credit Bank)
2. Entries posted to GL with full traceability to invoice and payment
3. Bank statement received (automated or manual upload)
4. System matches payment to bank statement line (amount, date, reference)
5. Matched: reconciliation complete. Unmatched: exception raised for investigation
6. Audit trail closed: final record with checksum linking all previous records
7. Vendor statement updated: invoice shown as PAID with payment date and reference
8. Financial reports refreshed: AP aging, cash flow, vendor balance
9. Invoice promoted to `RECONCILED` → `CLOSED`

---

## 6. Notification Map

| Stage | Recipient | Channel | Event |
|-------|-----------|---------|-------|
| 1. Invoice Received | AP Clerk | Email + In-App | Invoice captured |
| 1. Invoice Received | Vendor | Portal | Upload confirmed |
| 2. Evidence Collection | System | Internal | Evidence assembled |
| 3. Three-Way Match | AP Clerk | In-App | Match result (green/yellow/red) |
| 4. Exception Detection | AP Manager | Email + In-App | Exception raised |
| 5. AI Context | Approver | In-App | Decision package ready |
| 6. Coordination | Department Heads | Email + In-App | Input required |
| 7. Approval | Approver | Email + In-App | Approval required |
| 7. Approval | Vendor | Portal | Invoice approved |
| 8. Payment Readiness | Treasury Manager | Email + In-App | Payment proposal ready |
| 9. Payment | Treasury Manager | In-App | Payment status update |
| 9. Payment | Vendor | Portal + Email | Payment sent |
| 10. Audit | Controller | In-App | GL posted, reconciled |
| 10. Audit | Auditor | In-App | Audit trail complete |

---

## 7. Error Recovery Matrix

| Failure Mode | Stage | Severity | Recovery Action | SLA | Owner |
|-------------|-------|----------|-----------------|-----|-------|
| OCR misread amount | 1 | HIGH | Manual correction with audit trail | 4 hours | AP Clerk |
| Duplicate invoice not detected | 1 | CRITICAL | Block payment, investigate | 1 hour | AP Manager |
| PO not found | 2 | MEDIUM | Flag for manual PO lookup | 2 days | Procurement |
| GRN not posted | 2 | MEDIUM | Queue GRN creation | 1 day | Warehouse |
| Match tolerance too tight | 3 | LOW | Adjust tolerance, re-run match | 1 day | AP Manager |
| Exception ignored | 4 | HIGH | Auto-escalate after SLA | Per SLA | AP Manager |
| AI confidence low | 5 | LOW | Route to manual review | 1 day | AP Clerk |
| Department non-response | 6 | MEDIUM | Auto-escalate after SLA | Per SLA | AP Manager |
| Wrong approver | 7 | HIGH | Reassign with audit trail | 4 hours | AP Manager |
| SoD violation | 7 | CRITICAL | Block approval, audit | Immediate | Controller |
| Insufficient cash | 8 | HIGH | Split batch, reschedule | 1 day | Treasury |
| Bank API failure | 9 | CRITICAL | Manual wire, retry | 2 hours | Treasury |
| Payment failed | 9 | HIGH | Retry once, escalate | 4 hours | Treasury |
| GL entry wrong | 10 | MEDIUM | Adjustment entry with approval | 2 days | Controller |
| Reconciliation mismatch | 10 | HIGH | Investigate, resolve | 3 days | Controller |

---

## 8. Cross-Cutting Concerns

### Idempotency

Every mutation in the workflow is idempotent. Duplicate submissions produce the same result. Payment submissions use a unique idempotency key to prevent double-payment.

### Optimistic Locking

Every aggregate root has a `version` field. Concurrent modifications are detected and rejected with a conflict error. The user must refresh and retry.

### Rate Limiting

API endpoints are rate-limited per user and per tenant. Payment endpoints have stricter limits (10/minute). Bulk operations have separate limits (1000/hour).

### Encryption

All banking credentials, payment details, and PII are encrypted at rest using AES-256-GCM. Encryption keys are rotated quarterly.

---

## 9. Expected Total Time Reduction

| Stage | Manual (Average) | Perionyx (Target) | Reduction |
|-------|------------------|--------------------|-----------|
| 1. Invoice Received | 20 min | 3 min | 85% |
| 2. Evidence Collection | 60 min | 30 sec | 99% |
| 3. Three-Way Match | 45 min | 2 sec | 99% |
| 4. Exception Detection | 15 min | 5 min | 67% |
| 5. AI Context Building | 45 min | 5 min | 89% |
| 6. Cross-Dept Coordination | 3-7 days | 1-2 days | 65% |
| 7. Approval | 2-5 days | 4-8 hours | 75% |
| 8. Payment Readiness | 1-2 days | 30 min | 90% |
| 9. Payment | 1-3 days | 15 min | 95% |
| 10. Audit Completion | 1-2 days | 15 min | 93% |
| **Total** | **10-17 days** | **2-3 days** | **80-85%** |

---

## 10. Integration Points

| Integration | Direction | Protocol | Purpose |
|-------------|-----------|----------|---------|
| ERP System | Bidirectional | REST API | PO sync, GL posting, vendor master |
| Banking Platform | Outbound | REST API | ACH, wire, SEPA payment execution |
| OCR Engine | Inbound | REST API | Invoice text extraction |
| Email Gateway | Bidirectional | SMTP/API | Invoice receipt, notifications |
| Vendor Portal | Bidirectional | REST API | Self-service invoice upload, status |
| Treasury System | Bidirectional | REST API | Cash position, forecast, payment scheduling |
| Budget System | Inbound | REST API | Budget availability check |
| Audit System | Outbound | REST API | Audit trail export |

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | AP_REFERENCE_WORKFLOW_v1.0 |
| Phase | 27.0A |
| Author | Perionyx Product Architecture Board |
| Reviewers | CFO Advisory Board, Engineering Leads |
| Status | Draft |
| Next Review | Phase 27.0B |
| Classification | Internal — Engineering & Product |
