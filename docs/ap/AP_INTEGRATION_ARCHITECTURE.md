# Phase 21A.0 — Accounts Payable Integration Architecture

> **Status**: Authoritative — governs all Phase 21A–21D implementation
> **Type**: Documentation-only — integration architecture specification
> **Date**: July 21, 2026
> **Scope**: Complete integration landscape for the AP bounded context
> **Depends on**: AP_DOMAIN_ARCHITECTURE.md, AP_DOMAIN_MODEL.md, AP_DOMAIN_EVENTS.md, AP_STATE_MACHINES.md
> **Prerequisites**: Existing services — `GLIntegrationService`, `ApprovalsService`, `ApprovalMatrixEvaluator`, `NotificationService`, `WorkflowEngine`, `recordAudit()`

---

## Table of Contents

1. [Integration Architecture Overview](#1-integration-architecture-overview)
2. [GL Integration](#2-gl-integration)
3. [Treasury Integration](#3-treasury-integration)
4. [Approval Matrix Integration](#4-approval-matrix-integration)
5. [Notification Integration](#5-notification-integration)
6. [Budget Integration](#6-budget-integration)
7. [AI Integration](#7-ai-integration)
8. [Procurement Context Integration](#8-procurement-context-integration)
9. [Audit Trail Integration](#9-audit-trail-integration)
10. [Error Handling Across Integrations](#10-error-handling-across-integrations)
11. [Integration Sequence Diagrams](#11-integration-sequence-diagrams)
12. [Future Integration Points](#12-future-integration-points)

---

## 1. Integration Architecture Overview

### 1.1 AP's Position in the Integration Landscape

The Accounts Payable bounded context sits at the intersection of procurement, finance, and operations. It is the **transactional hub** that transforms vendor obligations into verified, approved, and executed payments with full GL posting.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AP INTEGRATION LANDSCAPE                                     │
│                                                                                           │
│  ┌─────────────────────────── PRODUCTION CONTEXTS ───────────────────────────┐            │
│  │                                                                            │            │
│  │  ┌──────────────┐        Customer-Supplier         ┌──────────────┐       │            │
│  │  │              │ ──────── AP posts journals ────→  │              │       │            │
│  │  │              │                                   │     GL /     │       │            │
│  │  │              │        Customer-Supplier          │  Accounting  │       │            │
│  │  │              │ ──── AP requests payment ──────→  │              │       │            │
│  │  │              │                                   └──────────────┘       │            │
│  │  │              │                                                         │            │
│  │  │     AP       │        Customer-Supplier         ┌──────────────┐       │            │
│  │  │  Bounded     │ ──── AP checks budget ────────→  │   Budget /   │       │            │
│  │  │  Context     │                                   │    FPA       │       │            │
│  │  │              │                                   └──────────────┘       │            │
│  │  │              │                                                         │            │
│  │  │              │        Customer-Supplier         ┌──────────────┐       │            │
│  │  │              │ ──── AP writes audit records ──→ │    Audit     │       │            │
│  │  │              │                                   │   Context    │       │            │
│  │  └──────────────┘                                   └──────────────┘       │            │
│  │         │                                                                  │            │
│  │         │ Partnership                                                      │            │
│  │         │ AP uses approval routing                                         │            │
│  │         ▼                                                                  │            │
│  │  ┌──────────────┐        Customer-Supplier         ┌──────────────┐       │            │
│  │  │  Automation  │                                   │              │       │            │
│  │  │   Studio     │        Customer-Supplier         │   Treasury   │       │            │
│  │  │  (Approval   │ ──── AP sends notifications ──→  │   Context    │       │            │
│  │  │   Matrix)    │                                   │              │       │            │
│  │  └──────────────┘                                   └──────────────┘       │            │
│  │                                                                            │            │
│  └────────────────────────────────────────────────────────────────────────────┘            │
│                                                                                           │
│  ┌─────────────────────── SUPPORTING CONTEXTS ──────────────────────────────┐            │
│  │                                                                           │            │
│  │  ┌──────────────┐  Customer-Supplier  ┌──────────────┐                   │            │
│  │  │ Notification │ ←── AP emits events │   Identity   │  Customer-Supplier│            │
│  │  │   Context    │                      │    / IAM     │ ──→ user lookup  │            │
│  │  └──────────────┘                      └──────────────┘                   │            │
│  │                                                                           │            │
│  │  ┌──────────────┐  Customer-Supplier  ┌──────────────┐                   │            │
│  │  │    Bank /    │ ←── AP refs acct    │ Intelligence │  Partnership      │            │
│  │  │  Banking     │                      │  / AI        │ ──→ detection     │            │
│  │  └──────────────┘                      └──────────────┘                   │            │
│  │                                                                           │            │
│  └───────────────────────────────────────────────────────────────────────────┘            │
│                                                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Integration Inventory

| # | Target Context | Relationship | Pattern | Interface Type | Current State |
|---|---|---|---|---|---|
| 1 | **GL / Accounting** | Customer-Supplier | Anti-Corruption Layer | Typed function calls | `GLIntegrationService` exists (126 lines), never called |
| 2 | **Treasury** | Customer-Supplier | Anti-Corruption Layer | Typed function calls | Treasury module exists, not wired to AP |
| 3 | **Approval Matrix** | Partnership | Open Host Service | Typed function calls | `ApprovalMatrixEvaluator` exists, not wired to AP |
| 4 | **Notification** | Customer-Supplier | Open Host Service | Typed function calls | `NotificationService` exists, not wired to AP events |
| 5 | **Audit** | Customer-Supplier | Conformist | Typed function calls | `recordAudit()` exists, not called in AP services |
| 6 | **Budget / FPA** | Customer-Supplier | Conformist | Typed function calls | Budget context exists, not wired to AP |
| 7 | **Intelligence / AI** | Partnership | Anti-Corruption Layer | Typed function calls | AI provider registry exists, not wired to AP |
| 8 | **Identity / IAM** | Customer-Supplier | Conformist | Typed function calls | Identity service exists, partially referenced |
| 9 | **Banking** | Customer-Supplier | Anti-Corruption Layer | Typed function calls | Banking context exists, not wired to AP |
| 10 | **Procurement** | Customer-Supplier | Conformist | Typed function calls (read-only) | In-memory procurement data exists |

### 1.3 Integration Principles

| # | Principle | Enforcement |
|---|---|---|
| 1 | **Typed function calls only** | Governance Constitution: Modular Monolith. No HTTP, no message queues between contexts. |
| 2 | **Anti-Corruption Layer at every boundary** | AP never exposes internal types. Each integration has an adapter that translates between AP domain types and target context types. |
| 3 | **Read-only across context boundaries** | AP never writes to other context's data stores. AP reads reference data (PO, GRN, budget, user); it writes only to its own tables and via published interfaces (GL posting, audit records). |
| 4 | **Idempotency on all mutations** | Every cross-context mutation (GL posting, payment execution) includes an idempotency key. Duplicate calls return existing results. |
| 5 | **Events are signals, not truth** | Domain events are transient in-process signals. The aggregate entity is the source of truth. Subscribers that need durable state must persist it. |
| 6 | **AI recommends, humans decide** | AI outputs are advisory only. No AI-generated state transition is executed without human approval. |
| 7 | **Failure is explicit** | Every integration has defined timeout, retry, fallback, and circuit breaker behavior. Silent failures are prohibited. |

---

## 2. GL Integration

### 2.1 Overview

AP generates draft journal entries that GL validates and posts to the ledger. AP owns the "what" (which accounts, which amounts); GL owns the "how" (posting, balancing, reconciliation). This separation is enforced by the Anti-Corruption Layer pattern — AP translates its domain events into GL's `JournalEntry` format.

### 2.2 Journal Entry Types

| Entry Type | Trigger | Debit Account | Credit Account | Amount Source |
|---|---|---|---|---|
| **Invoice Accrual** | Invoice approved (before payment) | Expense/Asset account (from invoice line coding) | AP Liability account (`2100-AP`) | Invoice total |
| **Payment** | Payment confirmed by bank | AP Liability account (`2100-AP`) | Bank/Cash account | Payment amount |
| **Credit Note** | Vendor credit applied | AP Liability account (`2100-AP`) | Expense/Asset account (original invoice line) | Credit amount |
| **Early Payment Discount** | Discount taken on payment | AP Liability account (`2100-AP`) | Discount Income account (`4200-Discount`) | Discount amount |
| **Reversal** | Invoice voided or payment reversed | Reversal of original entry (debit↔credit swap) | Reversal of original entry | Original amount |
| **Withholding Tax** | Payment with WHT | AP Liability account (`2100-AP`) | WHT Payable account (`2150-WHT`) | Withholding amount |

### 2.3 Journal Entry Format

Every AP-generated journal entry conforms to GL's `JournalEntry` interface:

| Field | Type | Description |
|---|---|---|
| `entryId` | `string` (CUID) | Unique identifier |
| `companyId` | `string` | Tenant scope |
| `entryType` | `enum` | `AP_INVOICE`, `AP_PAYMENT`, `AP_CREDIT`, `AP_DISCOUNT`, `AP_REVERSAL`, `AP_WHT` |
| `referenceType` | `string` | Source entity type (`"Invoice"`, `"Payment"`, `"CreditNote"`) |
| `referenceId` | `string` | Source entity ID |
| `idempotencyKey` | `string` | `{companyId}:{entryType}:{referenceId}:{paymentId?}` |
| `transactionDate` | `Date` | Business date of the transaction |
| `postingDate` | `Date` | Date the entry is posted (may differ from transaction date) |
| `periodKey` | `string` | Fiscal period (`YYYY-MM`) |
| `description` | `string` | Human-readable description |
| `lines` | `JournalLine[]` | Array of debit/credit lines |
| `source` | `"AP"` | Identifies AP as the source system |
| `createdAt` | `Date` | Entry creation timestamp |
| `createdBy` | `string` | User ID or `"system"` |

**JournalLine format:**

| Field | Type | Description |
|---|---|---|
| `accountId` | `string` | GL account ID |
| `accountCode` | `string` | GL account code (denormalized for readability) |
| `debit` | `Decimal(20,4)` | Debit amount (zero if credit) |
| `credit` | `Decimal(20,4)` | Credit amount (zero if debit) |
| `currency` | `string` | ISO 4217 currency code |
| `exchangeRate` | `Decimal(10,6)` | Exchange rate if multi-currency |
| `baseAmount` | `Decimal(20,4)` | Amount in base currency |
| `costCenter` | `string?` | Optional cost center code |
| `department` | `string?` | Optional department code |
| `projectId` | `string?` | Optional project reference |
| `description` | `string?` | Line-level description |

### 2.4 Posting Triggers

| Trigger | Timing | Entry Type | Rationale |
|---|---|---|---|
| **Invoice approved** | After final approval, before payment | `AP_INVOICE` (Accrual) | Recognize liability at approval, not at payment. Matches accrual accounting. |
| **Payment confirmed** | After bank confirmation received | `AP_PAYMENT` | Settle liability. Only posted after bank confirms execution. |
| **Credit note applied** | After credit matched to invoice | `AP_CREDIT` | Reduce liability. Posted immediately on application. |
| **Early payment discount** | At payment time, if discount taken | `AP_DISCOUNT` | Recognize discount income. Posted with payment entry. |
| **Invoice voided** | After void approval | `AP_REVERSAL` | Reverse original accrual. Requires approval for amounts > $1K. |
| **Payment reversed** | After bank returns/reversal confirmed | `AP_REVERSAL` | Restore liability and bank balance. |

### 2.5 Idempotency

| Property | Value |
|---|---|
| **Key format** | `{companyId}:{entryType}:{referenceId}:{paymentId?}` |
| **Constraint** | UNIQUE on `(companyId, idempotencyKey)` in `APJournalEntry` table |
| **Behavior** | Duplicate submission returns existing entry (no re-creation) |
| **Scope** | Per-company — same invoice in different companies produces different entries |
| **Payment-specific** | Payment entries include `paymentId` in key — multiple payments against same invoice produce distinct entries |
| **Reversal-specific** | Reversal entries include original `paymentId` — voided invoice + re-payment creates two separate reversals |

### 2.6 Reversal Mechanism

| Scenario | Reversal Type | Approval Required | GL Impact |
|---|---|---|---|
| **Invoice voided (pre-payment)** | Full reversal of accrual | Yes (AP Manager+) | Debit AP Liability, Credit Expense/Asset |
| **Invoice voided (post-payment)** | Two entries: reverse accrual + reverse payment | Yes (Controller+) | Both reversal entries posted atomically |
| **Payment returned/bounced** | Reverse payment entry | Yes (AP Manager+) | Debit AP Liability, Credit Bank |
| **Credit note reversal** | Reverse credit note entry | Yes (AP Manager+) | Debit Expense/Asset, Credit AP Liability |
| **Duplicate invoice correction** | Reverse duplicate accrual | Yes (AP Manager+) | Debit AP Liability, Credit Expense/Asset |

**Reversal rules:**
- Reversals are always full amounts (no partial reversals in GL — AP handles partial at its own level)
- Each reversal references the original entry via `reversalOfEntryId`
- Reversals create new entries, never modify existing ones (append-only ledger)
- Period-end validation ensures no un-reversed entries exist for voided invoices

### 2.7 Period-End Considerations

| Concern | Handling |
|---|---|
| **Accrual cutoff** | Invoices received before period end but not yet approved → accrual entry posted via period-end batch job |
| **AP aging freeze** | Aging snapshot taken at period end; subsequent payments adjust next period |
| **Closed period** | AP cannot post entries to closed periods. GL emits `PeriodClosed` event; AP blocks entry generation for that `periodKey` |
| **Multi-currency revaluation** | Unpaid foreign-currency invoices revalued at period-end exchange rate. AP generates adjustment entries via GL. |
| **Accrual reversal** | Accrual entries from prior period reversed in current period when invoice is fully processed |

### 2.8 Existing Service → Target Architecture

| Current | Target (Phase 21) | Change |
|---|---|---|
| `GLIntegrationService.generateGLEntry()` — 126 lines, never called | `APGLAdapter.toJournalEntry()` — ACL translating AP domain types to GL format | Replace with ACL adapter |
| Hardcoded account codes | Account code lookup from GL Context via `getAccountByCode()` | Dynamic lookup |
| No idempotency | `idempotencyKey` unique constraint on `APJournalEntry` | Add constraint |
| No period validation | Validate `periodKey` against GL before posting | Add pre-flight check |
| No reversal support | `reverseEntry(originalEntryId, reason, approvedBy)` method | Add reversal engine |

---

## 3. Treasury Integration

### 3.1 Overview

AP creates payment proposals; Treasury executes bank transfers. AP never calls bank APIs directly. This boundary is enforced by the Anti-Corruption Layer — AP provides structured payment instructions; Treasury translates them into bank-specific formats (ACH, wire, SEPA, etc.).

### 3.2 Payment Lifecycle

```
AP Context                              Treasury Context
    │                                        │
    ├──[1] Payment Proposal Created          │
    │     (invoice list, amounts, dates)     │
    │                                        │
    ├──[2] Submit for Treasury Approval ────→│
    │                                        │
    │                              ┌─────────┤
    │                              │ Treasury │
    │                              │ Reviews  │
    │                              │ Proposal │
    │                              └─────────┤
    │                                        │
    │←──[3] Treasury Approval Decision ──────┤
    │     (APPROVED / REJECTED / PENDING)    │
    │                                        │
    ├──[4] Record Treasury Decision          │
    │                                        │
    │                              ┌─────────┤
    │                              │ Treasury │
    │                              │ Executes │
    │                              │ Payment  │
    │                              └─────────┤
    │                                        │
    │←──[5] Bank Confirmation / Rejection ───┤
    │     (transactionRef, status, timestamp)│
    │                                        │
    ├──[6] Update Payment Status            │
    ├──[7] Post GL Entry (if confirmed)      │
    ├──[8] Record Audit                      │
    │                                        │
```

### 3.3 Payment Proposal Format

| Field | Type | Description |
|---|---|---|
| `proposalId` | `string` (CUID) | Unique proposal identifier |
| `companyId` | `string` | Tenant scope |
| `proposedDate` | `Date` | Requested payment date |
| `totalAmount` | `Decimal(20,4)` | Total payment amount |
| `currency` | `string` | Payment currency |
| `paymentMethod` | `enum` | `WIRE`, `ACH`, `CHECK`, `SEPA`, `SWIFT` |
| `priority` | `enum` | `STANDARD`, `URGENT`, `NEXT_DAY` |
| `payments` | `PaymentInstruction[]` | Individual payment instructions |
| `approvalRequired` | `boolean` | Whether Treasury must approve before execution |
| `requestedBy` | `string` | AP user who created the proposal |
| `idempotencyKey` | `string` | Unique per proposal |

**PaymentInstruction format:**

| Field | Type | Description |
|---|---|---|
| `paymentId` | `string` (CUID) | Unique payment identifier |
| `invoiceId` | `string` | AP invoice being paid |
| `vendorId` | `string` | Payee vendor |
| `vendorName` | `string` | Denormalized vendor name |
| `amount` | `Decimal(20,4)` | Payment amount |
| `currency` | `string` | ISO 4217 |
| `bankAccountId` | `string` | Vendor's bank account (reference) |
| `paymentReference` | `string` | AP's reference (e.g., `INV-2026-001`) |
| `description` | `string` | Payment description |
| `idempotencyKey` | `string` | `{companyId}:payment:{paymentId}` |
| `deductions` | `PaymentDeduction[]` | Any withholdings or deductions |

### 3.4 Dual-Signature Requirements

| Threshold | Signatures Required | Enforcement |
|---|---|---|
| **< $1,000** | 1 (AP Manager) | AP auto-approves, Treasury executes |
| **$1,000 – $10,000** | 1 (AP Manager + Treasury review) | Treasury reviews proposal before execution |
| **$10,000 – $50,000** | 2 (AP Manager + Controller) | Both must approve before Treasury execution |
| **> $50,000** | 3 (AP Manager + Controller + CFO) | Three signatures required |
| **> $250,000** | 3 + Board notification | Additional board notification event emitted |

**Implementation:**
- AP checks dual-signature requirements via Approval Matrix before submitting to Treasury
- Treasury validates signature count matches its own policy (defense in depth)
- If Treasury's policy differs from AP's, Treasury's policy wins (it has final authority on execution)
- Signature audit trail records each approver's identity, timestamp, and IP address

### 3.5 Payment Status Synchronization

| AP Status | Treasury Status | Trigger | AP Action |
|---|---|---|---|
| `PROPOSED` | — | Proposal created | Await Treasury intake |
| `SUBMITTED` | `RECEIVED` | AP submits to Treasury | Update status |
| `APPROVED` | `APPROVED` | Treasury approves | Update status, await execution |
| `REJECTED` | `REJECTED` | Treasury rejects | Create exception, notify AP |
| `EXECUTING` | `PROCESSING` | Treasury sends to bank | Update status |
| `CONFIRMED` | `COMPLETED` | Bank confirms | Post GL entry, record audit |
| `FAILED` | `FAILED` | Bank rejects | Create exception, notify AP, log error |
| `VOIDED` | `VOIDED` | Payment voided (pre-execution) | Reverse proposal, record audit |

### 3.6 Cash Position Impact

| Event | Cash Position Effect | Timing |
|---|---|---|
| **Payment proposed** | Reserved (soft hold) | At proposal creation |
| **Payment executed** | Committed (deducted from available) | At bank submission |
| **Payment confirmed** | Settled (reflected in balance) | At bank confirmation |
| **Payment failed** | Released (returned to available) | At failure notification |
| **Payment voided** | Released (removed from reserved) | At void confirmation |

AP does not directly update Treasury's cash position. Treasury derives position changes from payment status transitions. AP provides the events; Treasury interprets them.

### 3.7 Failure Handling

| Failure Type | AP Action | Treasury Action | Recovery |
|---|---|---|---|
| **Bank rejection** | Create `PaymentException`, notify AP Manager | Log rejection reason, update status | Resubmit with corrected details or void |
| **Timeout (no confirmation)** | Create `PaymentException`, escalate to Controller | Monitor pending payments, retry if safe | Manual investigation + resolution |
| **Duplicate detection** | Block payment (idempotency key match) | Block duplicate submission | Return existing result |
| **Bank account invalid** | Flag vendor for review, hold future payments | Reject proposal at intake | Vendor updates bank details |
| **Insufficient funds** | Reschedule payment, notify AP Manager | Queue for retry when funds available | Automatic retry on next available date |

---

## 4. Approval Matrix Integration

### 4.1 Overview

AP uses the Approval Matrix (defined in Automation Studio) to determine routing rules for invoice approval. The matrix is a partnership — AP sends entity metadata, the matrix returns routing decisions. Both contexts co-evolve through the shared `ApprovalRecord` type at the boundary.

### 4.2 Threshold-Based Routing

| Threshold Range | Approver | SLA | Auto-Escalate After |
|---|---|---|---|
| **< $1,000** | Auto-approve (no human) | Immediate | N/A |
| **$1,000 – $10,000** | AP Manager | 24 hours | Next level (Controller) |
| **$10,000 – $50,000** | Controller | 24 hours | CFO |
| **$50,000 – $250,000** | CFO | 48 hours | Board notification |
| **> $250,000** | CFO + Board | 72 hours | CEO |
| **Vendor > $50K cumulative (30d)** | Controller (regardless of single invoice) | 24 hours | CFO |
| **New vendor (first invoice)** | AP Manager + Controller (dual) | 24 hours | CFO |
| **Credit note > $10K** | Controller | 24 hours | CFO |

### 4.3 Routing Decision Request Format

| Field | Type | Description |
|---|---|---|
| `entityType` | `"Invoice"` | Entity requiring approval |
| `entityId` | `string` | Invoice ID |
| `companyId` | `string` | Tenant scope |
| `amount` | `Decimal(20,4)` | Invoice total amount |
| `currency` | `string` | ISO 4217 |
| `vendorId` | `string` | Vendor reference |
| `vendorRiskLevel` | `enum` | Vendor's risk classification |
| `vendorCumulative30d` | `Decimal(20,4)` | Vendor's total spend in last 30 days |
| `isNewVendor` | `boolean` | Whether this is the vendor's first invoice |
| `isCreditNote` | `boolean` | Whether this is a credit note |
| `hasPO` | `boolean` | Whether a PO backs this invoice |
| `poAmount` | `Decimal(20,4)?` | PO amount (for variance check) |
| `requestedBy` | `string` | AP user who submitted for approval |
| `context` | `ApprovalContext` | Additional metadata for routing decisions |

### 4.4 Routing Decision Response Format

| Field | Type | Description |
|---|---|---|
| `decisionId` | `string` (CUID) | Unique routing decision |
| `route` | `ApprovalRoute` | Resolved approval route |
| `approvers` | `Approver[]` | Ordered list of required approvers |
| `estimatedDuration` | `number` | Expected approval time (hours) |
| `escalationPlan` | `EscalationStep[]` | Escalation chain if SLA breached |
| `autoApprove` | `boolean` | Whether auto-approval applies |
| `reason` | `string` | Explanation of why this route was chosen |
| `rulesMatched` | `string[]` | IDs of rules that matched |

**Approver format:**

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | Approver's user ID |
| `role` | `string` | Required role (AP_MANAGER, CONTROLLER, CFO) |
| `name` | `string` | Denormalized display name |
| `email` | `string` | Notification email |
| `order` | `number` | Sequential order (1, 2, 3…) |
| `isDelegate` | `boolean` | Whether this is a delegated approver |
| `delegatedFrom` | `string?` | Original approver if delegated |

### 4.5 Segregation of Duties

| Rule | Enforcement | Violation Handling |
|---|---|---|
| **PO creator ≠ invoice approver** | AP checks `createdBy` on PO against proposed approvers | Exclude PO creator from approver list |
| **Invoice creator ≠ invoice approver** | AP checks `requestedBy` against proposed approvers | Block self-approval |
| **Same vendor ≠ same approver for PO + Invoice** | AP checks vendor relationship | Require additional approval level |
| **AP Manager cannot approve own department spend > $5K** | Matrix rule with department attribute | Escalate to Controller |

### 4.6 Delegation Rules

| Property | Behavior |
|---|---|
| **Primary unavailable** | Matrix returns delegate based on `UserRoleChanged` event or delegation table |
| **Delegation chain** | Primary → Delegate A → Delegate B → Escalate to next level |
| **Delegation scope** | Can be limited by amount, vendor, or department |
| **Delegation audit** | Every delegation recorded with `delegatedFrom` reference |
| **Delegation expiry** | Temporary delegations have start/end dates; expired delegations ignored |

### 4.7 SLA Tracking and Escalation

```
Invoice Submitted
    │
    ├──[0h] Route determined by matrix
    │
    ├──[0h] Notify approver (email + in-app)
    │
    ├──[12h] Warning notification (if not acted)
    │
    ├──[24h] Auto-escalate to next level
    │         ├── Record escalation in audit trail
    │         ├── Notify escalated approver
    │         └── Notify original approver (missed SLA)
    │
    ├──[48h] Second escalation (if still pending)
    │         ├── Notify Controller/CFO
    │         └── Flag in AP dashboard (red indicator)
    │
    └──[72h] Executive alert
              ├── Notify CFO + Controller
              └── Block further AP actions until resolved
```

### 4.8 Recording Approval Outcomes

After each approval decision (approve/reject/delegate), AP records:

| Field | Type | Description |
|---|---|---|
| `approvalId` | `string` (CUID) | Unique approval record |
| `invoiceId` | `string` | Invoice being approved |
| `decisionId` | `string` | Routing decision reference |
| `approverId` | `string` | User who made the decision |
| `action` | `enum` | `APPROVED`, `REJECTED`, `DELEGATED`, `ESCALATED` |
| `reason` | `string?` | Optional reason (required for rejection) |
| `timestamp` | `Date` | Decision timestamp |
| `level` | `number` | Approval level completed |
| `totalLevels` | `number` | Total levels required |
| `isFinal` | `boolean` | Whether this completes the approval chain |
| `delegatedTo` | `string?` | If delegated, the delegate's user ID |

---

## 5. Notification Integration

### 5.1 Overview

AP emits events; the Notification Context subscribes and delivers notifications via email, in-app, and Slack. AP never constructs email templates or manages delivery — it provides structured event data and lets the Notification Context handle presentation and delivery.

### 5.2 AP Events That Trigger Notifications

| Event | Channel | Recipients | Priority | Timing |
|---|---|---|---|---|
| **Invoice Submitted** | In-app + Email | AP Manager, assigned approver | Normal | Immediate |
| **Invoice Approved** | In-app + Email | AP Processor, vendor (if external portal exists) | Normal | Immediate |
| **Invoice Rejected** | In-app + Email + Slack | AP Processor, submitter | High | Immediate |
| **Match Exception Created** | In-app + Email + Slack | AP Manager, AP Processor | High | Immediate |
| **Exception Resolved** | In-app + Email | AP Manager, original submitter | Normal | Immediate |
| **Payment Proposed** | In-app + Email | AP Manager, Treasury | Normal | Immediate |
| **Payment Confirmed** | In-app + Email | AP Processor, vendor | Normal | Immediate |
| **Payment Failed** | In-app + Email + Slack | AP Manager, Controller | Critical | Immediate |
| **Approval Escalation** | In-app + Email + Slack | Escalated approver, original approver | High | Immediate |
| **SLA Warning (12h)** | In-app + Email | Pending approver | Normal | Batched (hourly) |
| **SLA Breach (24h)** | In-app + Email + Slack | Next-level approver, AP Manager | High | Immediate |
| **Vendor Suspended** | In-app + Email | AP Manager, Procurement | Normal | Immediate |
| **Period-End Accrual** | In-app + Email | Controller, AP Manager | Normal | Batch (period-end) |
| **Duplicate Detected** | In-app + Email + Slack | AP Manager, Controller | High | Immediate |

### 5.3 Notification Templates

| Template | Subject Pattern | Body Summary |
|---|---|---|
| `invoice_submitted` | "Invoice {invoiceNumber} from {vendorName} — ${amount} requires review" | Invoice details, vendor, amount, due date, action button |
| `invoice_approved` | "Invoice {invoiceNumber} approved — ready for payment" | Approval chain summary, approved amount, next steps |
| `invoice_rejected` | "Invoice {invoiceNumber} rejected — action required" | Rejection reason, rejected-by, remediation steps |
| `match_exception` | "Match exception: {exceptionType} on {invoiceNumber}" | Variance amount, expected vs. actual, resolution options |
| `payment_confirmed` | "Payment {paymentId} confirmed — ${amount} to {vendorName}" | Transaction reference, bank confirmation, GL entry ID |
| `payment_failed` | "Payment {paymentId} FAILED — {failureReason}" | Failure details, affected invoices, recovery steps |
| `approval_escalation` | "APPROVAL ESCALATED: {invoiceNumber} — ${amount} requires your decision" | Original approver, SLA breach time, approval action buttons |

### 5.4 Batch vs. Immediate

| Category | Strategy | Rationale |
|---|---|---|
| **Critical** (payment failed, fraud alert) | Immediate delivery | Requires instant attention |
| **High** (exceptions, rejections, escalations) | Immediate delivery | Time-sensitive workflow actions |
| **Normal** (approvals, confirmations) | Immediate delivery | Standard workflow progression |
| **Low** (SLA warnings, period-end accruals) | Batched hourly | Reduces notification fatigue |
| **Digest** (daily summary) | Daily batch at configurable time | Non-urgent informational |

---

## 6. Budget Integration

### 6.1 Overview

AP checks budget availability when invoices are submitted for approval — not at PO creation (that's Procurement's responsibility). AP conforms to Budget's interface for availability checks and reservations. AP does not own budget logic.

### 6.2 Budget Check Timing

| Event | Budget Action | Rationale |
|---|---|---|
| **Invoice submitted (no PO)** | Reserve budget against cost center | Ensure budget exists before approval workflow begins |
| **Invoice submitted (with PO)** | Validate PO reservation still valid | PO already reserved budget; invoice should match |
| **Invoice approved** | Convert reservation to actual consumption | Budget consumed upon approval (not at payment) |
| **Invoice rejected** | Release reservation | No consumption — reservation freed |
| **Invoice voided** | Release consumption (if post-approval) | Reverse budget consumption |
| **Credit note applied** | Release proportional consumption | Reduce consumed budget |

### 6.3 Budget Availability Query

| Field | Type | Description |
|---|---|---|
| `companyId` | `string` | Tenant scope |
| `budgetLineId` | `string` | Budget line identifier |
| `costCenter` | `string` | Cost center code |
| `department` | `string` | Department code |
| `periodKey` | `string` | Fiscal period (`YYYY-MM`) |
| `amount` | `Decimal(20,4)` | Amount to check/reserve |
| `currency` | `string` | ISO 4217 |
| `reservationId` | `string?` | Existing reservation ID (for validation) |

**Budget availability response:**

| Field | Type | Description |
|---|---|---|
| `available` | `boolean` | Whether budget is available |
| `totalBudget` | `Decimal(20,4)` | Total budget for the line |
| `committed` | `Decimal(20,4)` | Amount committed (approved but unpaid) |
| `reserved` | `Decimal(20,4)` | Amount reserved (pending approval) |
| `consumed` | `Decimal(20,4)` | Amount consumed (paid) |
| `availableBalance` | `Decimal(20,4)` | `totalBudget - committed - reserved - consumed` |
| `reservationId` | `string?` | Reservation ID if reservation was made |
| `warning` | `string?` | Warning if approaching limit (e.g., "80% consumed") |

### 6.4 Budget Exceeded Handling

| Threshold | Action | Approval Required | Escalation |
|---|---|---|---|
| **Available balance ≥ invoice amount** | Auto-approve budget check | None | None |
| **Available balance < invoice amount** | Block invoice submission | None | Notify Controller |
| **Available balance < 20% of total budget** | Warn (allow submission) | None | Notify Finance Manager |
| **Budget line not found** | Block invoice submission | None | Require cost center assignment |
| **Period not budgeted** | Block invoice submission | Controller override | Notify CFO |
| **Over-budget override** | Allow with override flag | Controller + CFO | Audit trail required |

### 6.5 Budget Line Mapping

AP maps invoices to budget lines through cost center and department:

```
Invoice Line Item
    ├── costCenter → Budget Line (via cost center mapping table)
    ├── department → Budget Line (via department mapping)
    └── projectId → Budget Line (if project-specific budget exists)
```

**Mapping priority:**
1. Project-specific budget line (if `projectId` set)
2. Cost center budget line (primary mapping)
3. Department budget line (fallback if no cost center)

---

## 7. AI Integration

### 7.1 Overview

AP uses the Intelligence / AI context for advisory functions only. AI outputs include confidence scores and source references. AI never decides, approves, or executes — it recommends. All AI recommendations require human review before state-changing actions.

### 7.2 AI Capabilities for AP

#### 7.2.1 Duplicate Invoice Detection

| Property | Specification |
|---|---|
| **Trigger** | `InvoiceSubmitted` event |
| **Exact matching** | Same vendor + same amount + same date (within 7 days) |
| **Fuzzy matching** | Same vendor + amount within 5% + date within 14 days |
| **Similarity scoring** | Levenshtein distance on invoice numbers, amount variance, date proximity |
| **Confidence threshold** | ≥ 90% → block for review, 70–89% → flag for review, < 70% → informational |
| **Response** | `{ isDuplicate: boolean, confidence: number, matches: DuplicateMatch[], explanation: string }` |
| **Action** | Block or flag invoice; AP Manager decides whether to proceed |

**DuplicateMatch format:**

| Field | Type | Description |
|---|---|---|
| `existingInvoiceId` | `string` | Matched invoice ID |
| `existingInvoiceNumber` | `string` | Matched invoice number |
| `vendorName` | `string` | Vendor name (for display) |
| `matchType` | `enum` | `EXACT`, `FUZZY`, `SIMILAR` |
| `confidence` | `number` | 0.00–1.00 confidence score |
| `varianceAmount` | `Decimal(20,4)?` | Amount difference (if fuzzy) |
| `varianceDays` | `number?` | Date difference (if fuzzy) |
| `sources` | `string[]` | Which fields matched |
| `explanation` | `string` | Human-readable explanation |

#### 7.2.2 Invoice Coding Suggestions

| Property | Specification |
|---|---|
| **Trigger** | `InvoiceSubmitted` event (with line items) |
| **Inputs** | Vendor history, line item descriptions, amounts, department, project |
| **Outputs** | Suggested GL account, cost center, department, project code |
| **Confidence** | Per-field confidence score (0.00–1.00) |
| **Historical basis** | Same vendor's past invoices, similar descriptions, similar amounts |
| **Response** | `CodingSuggestion[]` per line item |

**CodingSuggestion format:**

| Field | Type | Description |
|---|---|---|
| `lineItemIndex` | `number` | Which line item |
| `suggestedAccountId` | `string` | Suggested GL account |
| `suggestedAccountCode` | `string` | Account code for display |
| `suggestedCostCenter` | `string?` | Suggested cost center |
| `suggestedDepartment` | `string?` | Suggested department |
| `confidence` | `number` | 0.00–1.00 |
| `reasoning` | `string` | Why this suggestion (e.g., "Same vendor used this account 8/10 times") |
| `alternatives` | `CodingSuggestion[]` | Top 3 alternatives |

#### 7.2.3 Exception Summary Generation

| Property | Specification |
|---|---|
| **Trigger** | Daily batch or on-demand |
| **Inputs** | All open exceptions, resolution history, vendor context |
| **Outputs** | Prioritized exception list with recommended resolution actions |
| **Confidence** | Per-exception confidence score |
| **Response** | `ExceptionSummary` with ranked recommendations |

#### 7.2.4 Risk Scoring

| Property | Specification |
|---|---|
| **Vendor risk** | Based on payment history, credit references, news/sanctions, compliance status |
| **Payment risk** | Based on amount, vendor history, bank details, timing |
| **Fraud indicators** | Unusual patterns, duplicate submissions, amount anomalies |
| **Response** | `RiskAssessment` with score, factors, and recommendations |

### 7.3 AI Integration Principles

| Principle | Enforcement |
|---|---|
| **Recommendations only** | AI outputs are advisory. No AI output triggers automatic state changes. |
| **Confidence required** | Every AI output must include a confidence score. Below 70% flagged as low-confidence. |
| **Sources required** | Every AI output must reference data sources (invoice IDs, vendor history, etc.). |
| **Human review** | All AI-flagged duplicates and risk assessments require human review before action. |
| **Audit trail** | Every AI recommendation and its acceptance/rejection recorded in audit trail. |
| **No PII in prompts** | AI integration masks vendor bank details, personal information before sending to AI. |
| **Timeout** | AI calls timeout at 10 seconds. If timeout, AP proceeds without AI input (degraded mode). |

### 7.4 AI Response Envelope

| Field | Type | Description |
|---|---|---|
| `requestId` | `string` | Correlation ID for tracking |
| `modelId` | `string` | Which AI model was used |
| `confidence` | `number` | Overall confidence (0.00–1.00) |
| `latencyMs` | `number` | Response time in milliseconds |
| `recommendations` | `AIRecommendation[]` | Array of recommendations |
| `sources` | `AISource[]` | Data sources used |
| `warnings` | `string[]` | Any degradation warnings (timeout, low data, etc.) |

---

## 8. Procurement Context Integration

### 8.1 Overview

AP reads PO and GRN data from the Procurement context on a read-only basis. AP never creates, modifies, or deletes procurement records. AP references POs and GRNs by ID and denormalizes key fields for its own use.

### 8.2 Data AP Needs from Procurement

#### Purchase Order Data

| Field | Type | Description |
|---|---|---|
| `poId` | `string` | PO identifier |
| `poNumber` | `string` | Human-readable PO number |
| `vendorId` | `string` | Vendor reference |
| `status` | `enum` | `DRAFT`, `SENT`, `ACKNOWLEDGED`, `PARTIALLY_RECEIVED`, `FULLY_RECEIVED`, `CLOSED`, `CANCELLED` |
| `totalAmount` | `Decimal(20,4)` | PO total |
| `currency` | `string` | PO currency |
| `requestedBy` | `string` | PO creator (for segregation of duties) |
| `department` | `string` | Department |
| `costCenter` | `string` | Cost center |
| `items` | `POItem[]` | Line items with quantities and prices |
| `paymentTerms` | `string` | Payment terms code |

**POItem format:**

| Field | Type | Description |
|---|---|---|
| `itemId` | `string` | Line item ID |
| `description` | `string` | Item description |
| `quantity` | `Decimal(10,4)` | Ordered quantity |
| `unitPrice` | `Decimal(20,4)` | Unit price |
| `amount` | `Decimal(20,4)` | Line total |
| `receivedQuantity` | `Decimal(10,4)` | Quantity received (from GRN) |
| `billedQuantity` | `Decimal(10,4)` | Quantity previously billed |

#### Goods Receipt Data

| Field | Type | Description |
|---|---|---|
| `grnId` | `string` | GRN identifier |
| `grnNumber` | `string` | Human-readable GRN number |
| `poId` | `string` | Source PO reference |
| `vendorId` | `string` | Vendor reference |
| `receivedDate` | `Date` | Date goods were received |
| `status` | `enum` | `DRAFT`, `ACCEPTED`, `PARTIALLY_ACCEPTED`, `REJECTED` |
| `items` | `GRNItem[]` | Received items with accepted quantities |

**GRNItem format:**

| Field | Type | Description |
|---|---|---|
| `itemId` | `string` | Line item ID |
| `poItemId` | `string` | Source PO line item ID |
| `description` | `string` | Item description |
| `receivedQuantity` | `Decimal(10,4)` | Quantity received |
| `acceptedQuantity` | `Decimal(10,4)` | Quantity accepted |
| `rejectedQuantity` | `Decimal(10,4)` | Quantity rejected |
| `rejectionReason` | `string?` | Reason for rejection |

### 8.3 Matching Requirements

| Match Type | Invoice Fields | PO Fields | GRN Fields | Tolerance |
|---|---|---|---|---|
| **2-way (Invoice ↔ PO)** | Quantity, unit price, total | Quantity, unit price, total | — | ±2% or ±$50 (configurable) |
| **3-way (Invoice ↔ PO ↔ GRN)** | Quantity, unit price, total | Quantity, unit price, total | Accepted quantity | ±2% or ±50 units (configurable) |
| **Price match** | Unit price | Unit price | — | ±1% (configurable) |
| **Quantity match** | Quantity | Ordered quantity | Accepted quantity | 0% (exact match required) |

### 8.4 PO/GRN Not Found Handling

| Scenario | AP Action | User Impact |
|---|---|---|
| **PO not found by PO number** | Block invoice submission, require PO number correction | AP user must correct PO number |
| **PO found but cancelled** | Block invoice, notify AP Manager | AP user cannot proceed |
| **PO found but wrong vendor** | Block invoice, flag vendor mismatch | AP user must verify vendor |
| **GRN not found** | For 3-way match: create exception. For 2-way match: proceed without GRN | Depends on match type configured |
| **GRN partially received** | Allow invoice for received quantity only | AP user invoices partial quantity |
| **PO closed** | Block invoice, notify AP Manager | AP user must request PO reopening |

### 8.5 Cross-Context Data Consistency

| Concern | Mitigation |
|---|---|
| **PO modified during invoice processing** | AP snapshots PO data at invoice submission time. If PO changes, AP re-validates before approval. |
| **GRN recorded after invoice submitted** | AP checks for new GRNs before final approval. If 3-way match pending, approval waits for GRN. |
| **Vendor suspended after invoice approved** | AP re-checks vendor status before payment. If suspended, payment blocked. |
| **Currency mismatch (PO vs. invoice)** | AP uses invoice currency. PO currency used only for reference. FX rate applied at payment time. |

---

## 9. Audit Trail Integration

### 9.1 Overview

Every AP state transition produces an immutable audit record. The audit trail is append-only — records are never modified or deleted. AP calls `recordAudit()` with standardized payloads. AP does not own audit storage or retention.

### 9.2 Audit Record Format

| Field | Type | Description |
|---|---|---|
| `auditId` | `string` (CUID) | Unique audit identifier |
| `companyId` | `string` | Tenant scope |
| `timestamp` | `Date` | When the event occurred (transaction timestamp, not write time) |
| `actorId` | `string` | User ID who performed the action, or `"system"` for automated |
| `actorName` | `string` | Denormalized actor name |
| `actorRole` | `string` | Actor's role at time of action |
| `action` | `enum` | `CREATED`, `UPDATED`, `SUBMITTED`, `APPROVED`, `REJECTED`, `PAID`, `VOIDED`, `ESCALATED`, `DELEGATED`, `RESOLVED`, `EXPORTED` |
| `entityType` | `string` | `Vendor`, `Invoice`, `Payment`, `CreditNote`, `MatchException`, etc. |
| `entityId` | `string` | Entity being acted upon |
| `entityDisplayId` | `string` | Human-readable ID (e.g., `INV-2026-001`) |
| `changes` | `AuditChange[]` | What changed (before/after values) |
| `metadata` | `Record<string, unknown>` | Contextual data (approval level, exception type, etc.) |
| `ipAddress` | `string?` | Actor's IP address |
| `userAgent` | `string?` | Actor's user agent |
| `correlationId` | `string` | Links related audit records across a single transaction |

**AuditChange format:**

| Field | Type | Description |
|---|---|---|
| `field` | `string` | Field name |
| `previousValue` | `unknown` | Value before change |
| `newValue` | `unknown` | Value after change |
| `changeType` | `enum` | `ADDED`, `REMOVED`, `MODIFIED` |

### 9.3 Events That Produce Audit Records

| Event | Action | Key Changes Recorded |
|---|---|---|
| **Vendor created** | `CREATED` | All initial fields |
| **Vendor status changed** | `UPDATED` | `status`: old → new, `reason` |
| **Invoice created** | `CREATED` | All initial fields |
| **Invoice submitted for approval** | `SUBMITTED` | `status`: DRAFT → PENDING_APPROVAL |
| **Invoice approved** | `APPROVED` | `status`: PENDING_APPROVAL → APPROVED, approver, level |
| **Invoice rejected** | `REJECTED` | `status`: → REJECTED, reason, rejector |
| **Match exception created** | `CREATED` | Exception type, variance, amounts |
| **Exception resolved** | `RESOLVED` | Resolution type, resolution note, resolver |
| **Payment proposed** | `CREATED` | Proposal details, payment list |
| **Payment executed** | `PAID` | `status`: → CONFIRMED, bank reference, amount |
| **Payment failed** | `UPDATED` | `status`: → FAILED, failure reason |
| **Credit note applied** | `UPDATED` | Credit amount, linked invoice, balance impact |
| **Invoice voided** | `VOIDED` | Void reason, void approver, reversal entry ID |
| **AI recommendation** | `UPDATED` | AI input summary, AI output, human decision |
| **Budget check** | `UPDATED` | Budget available, reservation ID, over-budget flag |
| **Approval escalation** | `ESCALATED` | From approver → to approver, SLA breach time |

### 9.4 Audit Record Queries

| Query Pattern | Use Case | Index |
|---|---|---|
| By entity | Show audit trail for specific invoice/vendor | `(companyId, entityType, entityId, timestamp)` |
| By actor | Show all actions by a user | `(companyId, actorId, timestamp)` |
| By date range | Period-end audit report | `(companyId, timestamp)` |
| By action | Show all approvals, all payments | `(companyId, action, timestamp)` |
| By correlation | Trace a complete transaction flow | `(companyId, correlationId)` |
| By entity + action | Show all approvals for a specific invoice | `(companyId, entityType, entityId, action)` |

### 9.5 Audit Export

| Format | Use Case | Content |
|---|---|---|
| **CSV** | Spreadsheet analysis | Flat table with all fields, filterable |
| **PDF** | Formal audit report | Formatted report with headers, page numbers, digital signature |
| **JSON** | System integration | Structured data for external audit tools |

**Export scope:** Filtered by entity type, date range, actor, or action. Always company-scoped.

### 9.6 Completeness Guarantees

| Guarantee | Mechanism |
|---|---|
| **Every state transition produces an audit record** | Service layer writes audit BEFORE committing the business transaction |
| **Audit records are append-only** | No UPDATE or DELETE operations on audit table (enforced at ORM level) |
| **Audit records cannot be bypassed** | `recordAudit()` called in every service method that mutates state — code review checklist |
| **Audit records are company-scoped** | `companyId` on every record, enforced by composite index + service-layer WHERE |
| **Audit records survive data loss** | Audit table is backed up independently of business tables |
| **Audit timestamp is transaction time** | `timestamp` set at the moment of the business event, not at DB write time |

---

## 10. Error Handling Across Integrations

### 10.1 GL Integration Error Handling

| Concern | Specification |
|---|---|
| **Timeout** | 5 seconds. If GL context doesn't respond, AP queues the entry for retry. |
| **Retry** | 3 attempts with exponential backoff (1s, 2s, 4s). After 3 failures → dead letter queue. |
| **Fallback** | AP marks entry as `PENDING_GL` and continues processing. AP Manager notified. |
| **Circuit breaker** | Opens after 5 consecutive failures. Half-open after 30 seconds. |
| **Manual trigger** | Dead letter entries appear in AP dashboard with "Retry" and "Override" buttons. |

### 10.2 Treasury Integration Error Handling

| Concern | Specification |
|---|---|
| **Timeout** | 10 seconds for proposal submission. 30 seconds for payment status check. |
| **Retry** | 3 attempts for submission. No retry for status checks (poll instead). |
| **Fallback** | Payment proposal marked as `PENDING_TREASURY`. AP Manager notified. |
| **Circuit breaker** | Opens after 3 consecutive payment failures. Blocks new proposals. |
| **Manual trigger** | Treasury dashboard shows pending proposals with manual override capability. |

### 10.3 Approval Matrix Error Handling

| Concern | Specification |
|---|---|
| **Timeout** | 3 seconds for routing decision. |
| **Retry** | 1 retry (matrix evaluation is fast; failure usually indicates configuration issue). |
| **Fallback** | If matrix unreachable, AP uses default routing: all invoices → AP Manager. Emergency fallback logged. |
| **Circuit breaker** | Opens after 10 consecutive failures. All routing uses defaults until circuit closes. |
| **Manual trigger** | AP Manager can manually assign approvers when matrix is down. |

### 10.4 Notification Integration Error Handling

| Concern | Specification |
|---|---|
| **Timeout** | 5 seconds for notification dispatch. |
| **Retry** | 3 attempts. Notifications are non-blocking — AP doesn't wait. |
| **Fallback** | Failed notifications logged. In-app notifications always work (same DB). Email/Slack failures logged for retry. |
| **Circuit breaker** | Opens after 20 consecutive failures. Email/Slack delivery paused; in-app continues. |
| **Manual trigger** | Failed notifications appear in notification admin panel for manual retry. |

### 10.5 Budget Integration Error Handling

| Concern | Specification |
|---|---|
| **Timeout** | 3 seconds for availability check. |
| **Retry** | 1 retry. |
| **Fallback** | If budget context unreachable, AP blocks invoice submission and requires manual budget verification. |
| **Circuit breaker** | Opens after 5 consecutive failures. All invoices require manual budget sign-off. |
| **Manual trigger** | Controller can override budget check with documented reason. |

### 10.6 AI Integration Error Handling

| Concern | Specification |
|---|---|
| **Timeout** | 10 seconds. AI is advisory — AP proceeds without AI input on timeout. |
| **Retry** | 0 retries. AI calls are best-effort. |
| **Fallback** | AP processes invoice without duplicate detection or coding suggestions. Degraded mode logged. |
| **Circuit breaker** | Opens after 10 consecutive failures. AI features disabled for 5 minutes. |
| **Manual trigger** | AP Manager can manually trigger AI analysis from invoice detail page. |

### 10.7 Procurement Context Error Handling

| Concern | Specification |
|---|---|
| **Timeout** | 5 seconds for PO/GRN lookup. |
| **Retry** | 2 attempts. |
| **Fallback** | If PO data unavailable, AP blocks invoice for PO matching. GRN data unavailable creates exception. |
| **Circuit breaker** | Opens after 5 consecutive failures. 2-way matching only (skip 3-way). |
| **Manual trigger** | AP Manager can manually enter PO/GRN details when procurement context is down. |

### 10.8 Audit Trail Error Handling

| Concern | Specification |
|---|---|
| **Timeout** | 3 seconds for audit write. |
| **Retry** | 2 attempts. |
| **Fallback** | If audit write fails, the business transaction is ROLLED BACK. Audit failure = transaction failure. No exceptions. |
| **Circuit breaker** | Never opens. Audit is mandatory. If audit DB is down, system is unavailable. |
| **Manual trigger** | N/A — audit failure means system is degraded. |

---

## 11. Integration Sequence Diagrams

### 11.1 Flow 1: Invoice → Approval → Payment → GL

This is the primary AP workflow — the complete path from invoice receipt to GL posting.

```
┌───────┐  ┌─────┐  ┌──────┐  ┌────────┐  ┌──────────┐  ┌──────┐  ┌────┐  ┌──────────┐
│ AP    │  │ AI  │  │Budget│  │Approval│  │Treasury  │  │ GL   │  │Notif│  │Audit     │
│ User  │  │     │  │      │  │Matrix  │  │          │  │      │  │     │  │          │
└───┬───┘  └──┬──┘  └──┬───┘  └───┬────┘  └────┬─────┘  └──┬───┘  └──┬──┘  └────┬─────┘
    │         │        │          │             │            │         │          │
    │[1] Create Invoice          │             │            │         │          │
    │────────>│        │          │             │            │         │          │
    │         │        │          │             │            │         │          │
    │    [2] AI Duplicate Check  │             │            │         │          │
    │         │───────>│          │             │            │         │          │
    │         │  (confidence: 95%)│             │            │         │          │
    │<────────│        │          │             │            │         │          │
    │         │        │          │             │            │         │          │
    │    [3] AI Coding Suggestion │             │            │         │          │
    │         │───────>│          │             │            │         │          │
    │<────────│        │          │             │            │         │          │
    │         │        │          │             │            │         │          │
    │[4] Submit for Approval     │             │            │         │          │
    │────────────────────────>│   │             │            │         │          │
    │         │        │          │             │            │         │          │
    │    [5] Budget Check        │             │            │         │          │
    │         │    ────│────────>││             │            │         │          │
    │         │        │  (reserved)           │            │         │          │
    │         │        │          │             │            │         │          │
    │    [6] Route Determination │             │            │         │          │
    │         │        │     ────>│             │            │         │          │
    │         │        │  (Controller)          │            │         │          │
    │         │        │          │             │            │         │          │
    │    [7] Notify Approver     │             │            │         │          │
    │         │        │          │──────────────────────>│  │         │          │
    │         │        │          │             │            │         │          │
    │    [8] Record Audit (invoice submitted)   │            │         │          │
    │         │        │          │             │            │         │    ────> │
    │         │        │          │             │            │         │          │
    │    ════════════════════════ TIME PASSES ════════════════════════════════════│
    │         │        │          │             │            │         │          │
    │    [9] Controller Approves │             │            │         │          │
    │         │        │     <────│─────────────│            │         │          │
    │         │        │          │             │            │         │          │
    │    [10] Convert Budget Reservation → Consumption      │         │          │
    │         │    ────│────────>││             │            │         │          │
    │         │        │          │             │            │         │          │
    │    [11] Invoice Status → APPROVED        │            │         │          │
    │         │        │          │             │            │         │          │
    │    [12] Generate GL Accrual Entry        │            │         │          │
    │         │        │          │             │     ──────>│         │          │
    │         │        │          │             │  (AP_INVOICE)       │          │
    │         │        │          │             │            │         │          │
    │    [13] Record Audit (invoice approved)  │            │         │          │
    │         │        │          │             │            │         │    ────> │
    │         │        │          │             │            │         │          │
    │    [14] Notify AP Processor (invoice approved)        │         │          │
    │         │        │          │             │            │    ────>│          │
    │         │        │          │             │            │         │          │
    │    ════════════════════════ TIME PASSES ════════════════════════════════════│
    │         │        │          │             │            │         │          │
    │    [15] Create Payment Proposal          │            │         │          │
    │         │        │          │        ────>│            │         │          │
    │         │        │          │  (proposal)  │            │         │          │
    │         │        │          │             │            │         │          │
    │    [16] Treasury Reviews & Executes      │            │         │          │
    │         │        │          │             │──────>│    │         │          │
    │         │        │          │             │ (bank API)  │         │          │
    │         │        │          │             │            │         │          │
    │    [17] Bank Confirmation Received       │            │         │          │
    │         │        │          │        <────│            │         │          │
    │         │        │          │  (confirmed) │            │         │          │
    │         │        │          │             │            │         │          │
    │    [18] Payment Status → CONFIRMED       │            │         │          │
    │         │        │          │             │            │         │          │
    │    [19] Generate GL Payment Entry        │            │         │          │
    │         │        │          │             │     ──────>│         │          │
    │         │        │          │             │  (AP_PAYMENT)        │          │
    │         │        │          │             │            │         │          │
    │    [20] Record Audit (payment confirmed) │            │         │          │
    │         │        │          │             │            │         │    ────> │
    │         │        │          │             │            │         │          │
    │    [21] Notify vendor (payment sent)     │            │         │          │
    │         │        │          │             │            │    ────>│          │
    │         │        │          │             │            │         │          │
```

### 11.2 Flow 2: Exception → Resolution → Re-approval

```
┌───────┐  ┌─────┐  ┌────────┐  ┌──────────┐  ┌──────┐  ┌──────────┐
│ AP    │  │ AI  │  │Match   │  │Approval  │  │Notif │  │Audit     │
│ User  │  │     │  │Engine  │  │Matrix    │  │      │  │          │
└───┬───┘  └──┬──┘  └───┬────┘  └────┬─────┘  └──┬───┘  └────┬─────┘
    │         │         │            │            │           │
    │[1] Invoice submitted for matching          │           │
    │──────────────────>│            │            │           │
    │                   │            │            │           │
    │[2] 3-way match: variance exceeds tolerance  │           │
    │<──────────────────│            │            │           │
    │                   │ (exception │            │           │
    │                   │  created)  │            │           │
    │                   │            │            │           │
    │[3] Record Audit (match exception)          │           │
    │───────────────────────────────────────────────────────> │
    │                   │            │            │           │
    │[4] Notify AP Manager (exception)           │           │
    │──────────────────────────────────────────>│ │           │
    │                   │            │            │           │
    │[5] AI Risk Assessment of exception         │           │
    │────────>│         │            │            │           │
    │  (risk: medium,   │            │            │           │
    │   suggest: adjust │            │            │           │
    │   invoice qty)    │            │            │           │
    │<────────│         │            │            │           │
    │                   │            │            │           │
    │   ═══════════════ TIME PASSES (AP Manager reviews) ═══ │
    │                   │            │            │           │
    │[6] AP Manager adjusts invoice line item    │           │
    │────────>│         │            │            │           │
    │                   │            │            │           │
    │[7] Re-run match (now passes within tolerance)           │
    │──────────────────>│            │            │           │
    │<──────────────────│ (matched)  │            │           │
    │                   │            │            │           │
    │[8] Record Audit (exception resolved)       │           │
    │───────────────────────────────────────────────────────> │
    │                   │            │            │           │
    │[9] Re-route for approval (if required)     │           │
    │                   │       ─────│────────────│           │
    │                   │  (Controller approval)  │           │
    │                   │            │            │           │
    │[10] Notify Controller (re-approval needed) │           │
    │──────────────────────────────────────────>│ │           │
    │                   │            │            │           │
    │[11] Controller approves                    │           │
    │                   │       <────│────────────│           │
    │                   │            │            │           │
    │[12] Record Audit (invoice re-approved)     │           │
    │───────────────────────────────────────────────────────> │
    │                   │            │            │           │
```

### 11.3 Flow 3: Payment → Treasury → Confirmation → GL Post

```
┌───────┐  ┌──────┐  ┌──────────┐  ┌────────┐  ┌──────┐  ┌──────────┐
│ AP    │  │Treasury│  │Bank API  │  │ GL     │  │Notif │  │Audit     │
│ Mgr   │  │       │  │          │  │        │  │      │  │          │
└───┬───┘  └───┬───┘  └────┬─────┘  └───┬────┘  └──┬───┘  └────┬─────┘
    │          │           │            │           │           │
    │[1] Create Payment Proposal (batch of 12 invoices)       │
    │─────────>│           │            │           │           │
    │          │           │            │           │           │
    │[2] Treasury reviews proposal                       │    │
    │          │           │            │           │           │
    │    ┌─────│─── SIGNATURE CHECK ───┐            │           │
    │    │ Total: $75,000              │            │           │
    │    │ Required: 3 signatures      │            │           │
    │    │ (AP Mgr ✓, Controller ✓,    │            │           │
    │    │  CFO ✓)                     │            │           │
    │    └─────────────────────────────┘            │           │
    │          │           │            │           │           │
    │[3] Treasury approves, submits to bank         │           │
    │          │──────────>│            │           │           │
    │          │  (wire    │            │           │           │
    │          │  transfer)│            │           │           │
    │          │           │            │           │           │
    │[4] Payment status → EXECUTING     │           │           │
    │          │           │            │           │           │
    │[5] Notify AP (payment in progress)│           │           │
    │<───────────────────────────────────────────│  │           │
    │          │           │            │           │           │
    │[6] Record Audit (payment submitted)            │           │
    │───────────────────────────────────────────────────────>   │
    │          │           │            │           │           │
    │   ══════════════════ TIME PASSES (bank processing) ═════ │
    │          │           │            │           │           │
    │[7] Bank confirms payment          │           │           │
    │          │<──────────│            │           │           │
    │          │  (conf:   │            │           │           │
    │          │  TXN12345)│            │           │           │
    │          │           │            │           │           │
    │[8] Payment status → CONFIRMED     │           │           │
    │          │           │            │           │           │
    │[9] AP generates GL payment entry  │           │           │
    │          │           │       ─────│───────────│           │
    │          │           │  (AP_PAYMENT,          │           │
    │          │           │   idempotencyKey)      │           │
    │          │           │            │           │           │
    │[10] GL validates entry            │           │           │
    │          │           │       ─────│           │           │
    │          │           │  (balance  │           │           │
    │          │           │   check:   │           │           │
    │          │           │   debits = │           │           │
    │          │           │   credits) │           │           │
    │          │           │       ─────│           │           │
    │          │           │  (posted)  │           │           │
    │          │           │            │           │           │
    │[11] GL returns posting confirmation          │           │
    │          │           │       <────│───────────│           │
    │          │           │            │           │           │
    │[12] Invoice status → PAID         │           │           │
    │          │           │            │           │           │
    │[13] Notify vendor (payment sent)  │           │           │
    │          │           │            │       ────│──────────>│
    │          │           │            │           │           │
    │[14] Record Audit (payment confirmed, GL posted)│          │
    │───────────────────────────────────────────────────────>   │
    │          │           │            │           │           │
```

---

## 12. Future Integration Points

These integrations are planned but not yet implemented. They are included here for architectural completeness and to guide future development.

### 12.1 Vendor Portal (Self-Service)

| Property | Specification |
|---|---|
| **Purpose** | Allow vendors to submit invoices, check payment status, update bank details, and manage their profile |
| **Integration pattern** | Customer-Supplier (vendor is the customer) |
| **Interface** | REST API + Web UI (separate from main app) |
| **Authentication** | Vendor-specific credentials (email + magic link or password) |
| **Key features** | Invoice submission, payment status tracking, bank detail management, document upload, statement download |
| **Data flow** | Vendor portal → AP API (new vendor-facing API surface) |
| **Security** | Vendor-scoped access, no cross-vendor data, rate limiting, CAPTCHA on public forms |
| **Phase** | Phase 22+ |

### 12.2 OCR Invoice Capture

| Property | Specification |
|---|---|
| **Purpose** | Extract invoice data from PDF/image uploads automatically |
| **Integration pattern** | Partnership (AP provides document, AI extracts data) |
| **Interface** | `extractInvoiceData(document: Buffer, mimeType: string): ExtractedInvoice` |
| **AI capabilities** | Vendor name extraction, line item extraction, amount/date/PO number recognition, tax calculation |
| **Confidence scoring** | Per-field confidence, human review required below 85% |
| **Output** | Pre-populated invoice form with AI-extracted data + confidence indicators |
| **Fallback** | Manual data entry when OCR fails or confidence too low |
| **Phase** | Phase 22 |

### 12.3 Bank API for Payment Execution

| Property | Specification |
|---|---|
| **Purpose** | Direct bank API integration for payment execution (bypassing manual bank file upload) |
| **Integration pattern** | Anti-Corruption Layer (Treasury translates AP proposals to bank-specific formats) |
| **Standaries** | AP → Treasury → Bank API (AP never calls bank directly) |
| **Supported formats** | ACH (NACHA), Wire (SWIFT MT103), SEPA (pain.001), Check (positive pay file) |
| **Security** | Bank API credentials in secret manager, TLS 1.3, IP whitelisting |
| **Idempotency** | Bank-specific idempotency keys, duplicate detection at bank level |
| **Phase** | Phase 23 |

### 12.4 E-Invoicing Standards

| Property | Specification |
|---|---|
| **Purpose** | Support for structured e-invoicing formats mandated by various jurisdictions |
| **Standards** | Peppol BIS Billing 3.0, UBL 2.1, CIUS, XRechnung, Factur-X |
| **Integration pattern** | ACL (AP translates internal invoice to/from standard formats) |
| **Key features** | Generate e-invoices, validate incoming e-invoices, submit to Peppol network, receive via access point |
| **Compliance** | EU Directive 2014/55/EU, country-specific mandates |
| **Phase** | Phase 24 |

### 12.5 Withholding Tax Engines

| Property | Specification |
|---|---|
| **Purpose** | Calculate and apply withholding tax on payments based on jurisdiction, vendor type, and tax treaty |
| **Integration pattern** | Customer-Supplier (AP queries tax engine, applies result) |
| **Inputs** | Vendor country, tax residency, payment type, amount, applicable tax treaty |
| **Outputs** | WHT amount, tax rate, tax authority account, certificate requirements |
| **GL impact** | WHT amount reduces payment, creates WHT payable liability |
| **Compliance** | Country-specific WHT rules, tax certificate generation, regulatory reporting |
| **Phase** | Phase 24 |

### 12.6 Expense Management Integration

| Property | Specification |
|---|---|
| **Purpose** | Import employee expense reports as vendor invoices for unified AP processing |
| **Integration pattern** | Customer-Supplier (expense system submits to AP) |
| **Key features** | Auto-create vendor invoice from approved expense, match to budget, route for AP approval |
| **Data mapping** | Employee → vendor (internal), expense lines → invoice lines, receipts → attachments |
| **Phase** | Phase 25 |

### 12.7 Contract Management Integration

| Property | Specification |
|---|---|
| **Purpose** | Link invoices to contract terms for automated validation (pricing, quantities, renewal dates) |
| **Integration pattern** | Partnership (AP and Contract context share invoice-contract linkage) |
| **Key features** | Contract price validation, volume commitment tracking, renewal alerts, term compliance |
| **Phase** | Phase 25 |

---

## Appendix A: Integration Contract Summary

| Integration | AP Interface | Target Interface | Sync/Async | Idempotent | Reversible |
|---|---|---|---|---|---|
| **GL** | `APGLAdapter.toJournalEntry()` | `GLContext.postJournal()` | Sync | Yes | Yes (reversal entry) |
| **Treasury** | `APTreasuryAdapter.toPaymentProposal()` | `TreasuryContext.submitProposal()` | Sync | Yes | Yes (void proposal) |
| **Approval Matrix** | `APApprovalAdapter.toRoutingRequest()` | `ApprovalMatrix.evaluate()` | Sync | Yes | N/A (read-only) |
| **Notification** | `APNotificationAdapter.toNotificationPayload()` | `NotificationContext.send()` | Async | Best-effort | N/A (fire-and-forget) |
| **Budget** | `APBudgetAdapter.toBudgetCheckRequest()` | `BudgetContext.checkAvailability()` | Sync | Yes | Yes (release reservation) |
| **AI** | `APAIAdapter.toAIRequest()` | `IntelligenceContext.duplicateCheck()` | Sync | Best-effort | N/A (advisory) |
| **Procurement** | `APProcurementAdapter.toPOQuery()` | `ProcurementContext.getPO()` | Sync | Yes | N/A (read-only) |
| **Audit** | `APAuditAdapter.toAuditPayload()` | `recordAudit()` | Sync | Yes | No (append-only) |

## Appendix B: Data Ownership Map

| Data | Owner | AP's Relationship | AP's Responsibility |
|---|---|---|---|
| Vendor master | AP | Creates & owns | Full lifecycle |
| Purchase orders | Procurement | Read-only reference | Store reference + denormalized fields |
| Goods receipts | Procurement | Read-only reference | Store reference + denormalized fields |
| Invoices | AP | Creates & owns | Full lifecycle |
| Match results | AP | Creates & owns | Full lifecycle |
| Exceptions | AP | Creates & owns | Full lifecycle |
| Approval records | AP | Creates & owns (routing from matrix) | Record decisions |
| Payments | AP → Treasury | AP proposes, Treasury executes | AP owns proposal, Treasury owns execution |
| Journal entries | AP → GL | AP generates, GL posts | AP owns draft, GL owns posted entry |
| Audit records | Audit Context | AP writes, Audit stores | AP ensures completeness |
| Budget reservations | Budget Context | AP requests, Budget enforces | AP ensures budget checks happen |

## Appendix C: Glossary

| Term | Definition |
|---|---|
| **ACL** | Anti-Corruption Layer — adapter that translates between bounded context type systems |
| **AP** | Accounts Payable — the bounded context responsible for vendor financial obligations |
| **DPO** | Days Payable Outstanding — average time to pay vendor invoices |
| **GRN** | Goods Receipt Note — confirmation of physical goods received against a PO |
| **Idempotency** | Property where executing the same operation multiple times produces the same result |
| **Journal Entry** | Double-entry accounting record with at least one debit and one credit line |
| **Modular Monolith** | Architecture where bounded contexts communicate via typed function calls within a single process |
| **PO** | Purchase Order — formal document authorizing a purchase from a vendor |
| **Segregation of Duties** | Control requiring different individuals for complementary duties (e.g., PO creator ≠ invoice approver) |
| **SLA** | Service Level Agreement — maximum time allowed for an action (e.g., approval within 24h) |
| **WHT** | Withholding Tax — tax deducted at source on payments to vendors |

---

*Document version: 1.0.0 · Last updated: July 21, 2026 · Classification: Internal — Engineering*
