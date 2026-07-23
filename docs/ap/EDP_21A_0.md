# Engineering Decision Packet — Phase 21A.0

> **Phase**: 21A.0 — AP Domain Architecture Specification
> **Status**: Complete — Documentation only, zero code changes
> **Date**: July 21, 2026
> **Predecessor**: Phase 21.0 — AP Capability Inventory (GAP_ANALYSIS, WORKFLOW, IMPLEMENTATION_PLAN, PERSONA_REVIEW, ENTERPRISE_SCORECARD, PHASE21_DECISION_PACKET)
> **Successor**: Phase 21A.1 — Prisma Models & Repositories

---

## Mission

Transform the Accounts Payable domain from a display-only scaffold into a formally specified, implementation-ready bounded context. Phase 21A.0 produces 10 architecture documents that define **every entity, every state machine, every event, every command, every business rule, and every integration point** needed to build a production AP system. No code is written. Every document is an authoritative contract that Phase 21A.1–21D must follow.

---

## Executive Summary

Phase 21.0 revealed that AP has **extensive scaffolding but zero runtime functionality** — 11 display-only pages, 12 in-memory services, 20 UI components with no mutation logic, zero Prisma models, zero API routes. The AP Manager persona scored 5/10, the joint-lowest of all 10 personas. Enterprise readiness was 3.7%.

Phase 21A.0 fixes this by producing a complete domain architecture from first principles: bounded context definition with explicit exclusions, 25 entities and 18 value objects, 11 aggregate roots with enforced invariants, 12 state machines, 63 domain events, 51 commands and 18 queries, 137 business rules, 10 integration points, and a role-based permission matrix covering 8 roles × 51 commands.

This is the largest documentation phase in Perionyx history — ~8,300 lines across 10 documents — because AP is the largest domain and the highest-impact investment. Getting the architecture right here eliminates rework in all four implementation phases.

---

## Deliverable Inventory

| # | Document | Lines | Purpose |
|---|---|---|---|
| 1 | `AP_DOMAIN_ARCHITECTURE.md` | 942 | Bounded context, context map, module structure, dependency rules, data ownership |
| 2 | `AP_DOMAIN_MODEL.md` | 294 | 25 entities, 18 value objects, field-level specifications, ER diagram |
| 3 | `AP_AGGREGATES.md` | 1,297 | 11 aggregate roots, invariants, lifecycle, relationships, audit requirements |
| 4 | `AP_STATE_MACHINES.md` | 935 | 12 state machines with transitions, authorities, SLAs, error handling |
| 5 | `AP_DOMAIN_EVENTS.md` | 1,489 | 63 domain events with payloads, subscribers, ordering, idempotency |
| 6 | `AP_COMMAND_QUERY_MODEL.md` | 1,525 | 51 commands + 18 queries with full specification (pre-conditions, business rules, side effects, post-conditions, error cases) |
| 7 | `AP_DOMAIN_INVARIANTS.md` | 569 | 137 business rules across 8 categories with severity, enforcement, and auto-fix |
| 8 | `AP_INTEGRATION_ARCHITECTURE.md` | 1,322 | 10 integration points with sequence diagrams, error handling, resilience patterns |
| 9 | AP_PERMISSION_MATRIX | — | 8 roles × 51 commands authorization matrix (embedded in AP_COMMAND_QUERY_MODEL.md) |
| 10 | `EDP_21A_0.md` | — | This document — decisions, trade-offs, rationale, metrics |
| **Total** | | **~8,373** | |

---

## Design Decisions

### Decision 1: VendorInvoice as Central Aggregate

**Choice**: VendorInvoice is the root aggregate of the AP bounded context. Every other entity exists to serve the invoice lifecycle.

**Rationale**: The invoice is the financial commitment that drives the entire AP workflow — matching validates it, approvals authorize it, payments settle it, GL posting records it, reconciliation closes it. Making it the central aggregate ensures all invariants are enforced at the transaction boundary where they matter most.

**Evidence**: Phase 21.0 workflow analysis shows all 14 workflow stages either originate from or terminate at the invoice. The InvoiceMatchingService (126 lines) is the only service with correct business logic — it was built around invoices, not around POs or GRNs.

**Trade-off**: The VendorInvoice aggregate is large (root + 5 child entities + 2 value objects). A larger aggregate means more work per transaction and more lock contention under high concurrency. This is acceptable because AP invoice volume is moderate (hundreds per day, not millions) and the consistency guarantees outweigh concurrency costs.

### Decision 2: PO and GRN as References (Not Aggregates)

**Choice**: PurchaseOrder and GoodsReceipt are reference entities within the invoice aggregate — AP stores an ID and denormalized display fields, not the full PO/GRN lifecycle.

**Rationale**: PO lifecycle is owned by the procurement context. Duplicating PO management would create sync issues — two systems updating the same PO would diverge. AP needs only enough PO data to perform matching: PO number, line items, quantities, prices. The procurement context owns the rest.

**Evidence**: The existing `src/server/procurement/types/index.ts` defines `PurchaseOrder` and `Receipt` types. These are already structured as reference objects (ID + display fields). The `InvoiceMatchingService` reads PO data but never writes it.

**Trade-off**: AP cannot enforce PO-side invariants (e.g., PO total budget check). This is intentional — budget enforcement belongs to procurement, not AP. If AP needs to validate budget, it calls the budget context via typed function call.

### Decision 3: ThreeWayMatch as Separate Aggregate

**Choice**: MatchResult is promoted from a value object to an independent aggregate root (`ThreeWayMatch`). Each match is its own transaction.

**Rationale**: Match results are independent of invoice state. An invoice can be matched, then re-matched if GRN data changes (partial shipment corrected, quantity adjusted). Keeping the match separate allows re-matching without invoice state mutation. The match aggregate owns its own invariants (variance calculations, tolerance checks, override authorization) that are distinct from invoice invariants.

**Evidence**: The `InvoiceMatchingService` already returns a `MatchResult` with independent fields (matchType, status, variances). Phase 21.0 identified "re-matching after GRN correction" as a common enterprise scenario that the current in-memory service cannot handle.

**Trade-off**: Two aggregates means two DB transactions per match operation. This is a minor cost — matching is not high-frequency, and the consistency benefit (independent match lifecycle) outweighs the transaction overhead.

### Decision 4: ApprovalChain as Reusable Aggregate

**Choice**: ApprovalChain is a standalone aggregate reused across invoices, payment proposals, and vendor changes. It is not specific to any one entity.

**Rationale**: Approval workflow is a cross-cutting concern. The approval matrix already exists in Automation Studio with threshold-based routing, delegation, and escalation. Building AP-specific approval logic would duplicate this. A single reusable approval aggregate means approval rules are defined once and consumed by all entities.

**Evidence**: `ApprovalMatrixEvaluator.evaluate()` already handles threshold routing. `ApprovalsService` in procurement already tracks approval status. The AP permission matrix specifies threshold-based routing ($50K → Controller, $100K → CFO) that maps directly to the existing matrix.

**Trade-off**: AP cannot have AP-specific approval UX (e.g., AP-specific approval screens with invoice preview). The approval UI must conform to Automation Studio patterns. This is acceptable because consistency across approval workflows is more valuable than AP-specific features.

### Decision 5: PaymentProposal vs PaymentBatch Separation

**Choice**: PaymentProposal (planning) and PaymentBatch (execution) are separate aggregates with distinct lifecycles.

**Rationale**: Proposal is planning — which invoices to pay, what discount windows to capture, what cash requirements to meet. Batch is execution — actual bank submission with idempotency keys and confirmation tracking. Separating them allows review and approval between planning and execution. A Controller may approve a proposal but reject a batch if bank details have changed.

**Evidence**: The existing `PaymentProposal` and `PaymentBatch` types in `src/server/procurement/types/index.ts` are already separated. Phase 21.0 identified "review/approval gate between proposal and execution" as a critical enterprise control that was missing from the scaffold.

**Trade-off**: Two aggregates means two DB transactions. The benefit — an approval gate between planning and execution — is a standard enterprise financial control that prevents unauthorized payments.

### Decision 6: Append-Only Audit Trail

**Choice**: Audit records are immutable — no UPDATE or DELETE operations. The `ProcurementAudit` model has no `updatedAt` field. Every state transition writes an audit record in the same DB transaction.

**Rationale**: SOX compliance and financial audit requirements mandate immutable audit records. An audit record that can be modified is not an audit record. The audit trail is the forensic backbone of the AP domain — it answers who did what, when, with what authority, and with what result.

**Evidence**: Phase 21.0 identified "zero audit integration" as a critical gap. The existing `recordAudit()` function exists but is never called by AP services. Phase 16.0 security audit flagged "audit records are read-only for all roles" as a mandatory control.

**Trade-off**: Higher storage cost (append-only grows faster) and no ability to correct erroneous audit entries. Both are acceptable — storage is cheap, and audit correction itself should be an audit event.

### Decision 7: Idempotent Payments

**Choice**: Every payment operation requires an `idempotencyKey` stored persistently. Duplicate execution returns the same result without re-executing the payment.

**Rationale**: Duplicate payments are the #1 AP fraud vector. An idempotency key on every payment prevents double-execution regardless of the failure mode — network retry, user double-click, system restart. The key is generated before execution and stored permanently.

**Evidence**: The existing `Payment` type in `src/server/procurement/types/index.ts` does not have an `idempotencyKey` field. Phase 21.0 identified "no idempotency" as a critical financial risk. The `Payment.idempotencyKey` is a unique DB constraint — the database is the last line of defense.

**Trade-off**: Slightly more complex payment creation (must generate and store key before execution). This is negligible compared to the risk of duplicate payments.

### Decision 8: Decimal(38,12) for All Monetary Values

**Choice**: All monetary fields use `Prisma.Decimal(38, 12)`. All calculations use `financial-precision.ts` helpers. Native `number` arithmetic is prohibited for monetary values.

**Rationale**: Phase 19.1 established the Financial Precision Rule after discovering 84 unsafe `Number()` conversions across financial paths. `Decimal(38, 12)` provides exact arithmetic with sufficient precision for any currency. The `financial-precision.ts` library provides `sumDecimals`, `multiplyDecimals`, `divideDecimals`, `allocateAmount`, and `financialRound` — all operating on `Prisma.Decimal`.

**Evidence**: Phase 19.1 migrated 4 Prisma Float fields to Decimal. Phase 21.0 identified PO totals stored as native `number` in procurement types. The existing `InvoiceMatchingService` uses `Math.abs(diff) < tolerance` — native number comparison on what should be Decimal.

**Trade-off**: More verbose code (explicit `sumDecimals()` instead of `a + b`). Financial precision is non-negotiable — the verbosity is the cost of correctness.

### Decision 9: Typed Function Calls for Domain Events (Not Message Queue)

**Choice**: Domain events are typed function calls within the process. Intra-AP events fire synchronously. Cross-module events (AP → GL, AP → Treasury, AP → Notification) fire asynchronously via a wrapper that delays dispatch until after the originating transaction commits.

**Rationale**: Modular monolith architecture — the Governance Constitution specifies state-based persistence within modules and typed function calls between modules. A message queue would add infrastructure complexity (separate broker, dead-letter queues, ordering guarantees), eventual consistency issues, and debugging difficulty for a system that doesn't need it.

**Evidence**: Phase 18.0 identified 7 event bus implementations that were all identical `Map<EventType, Set<Handler>>` patterns. Phase 18.1A consolidated to 2 buses. The AP domain follows this consolidated pattern. Cross-module async is handled by wrapping subscriber calls in `setTimeout` or `process.nextTick` to ensure they run after the transaction commits.

**Trade-off**: Synchronous coupling means a failing subscriber can block the publisher (intra-AP). This is mitigated by try/catch in subscriber handlers — a failing notification does not block invoice processing.

### Decision 10: Separate Read Models for Queries

**Choice**: AP commands use aggregates for write consistency. AP queries use read-optimized models (pre-shaped data, computed fields, cached aggregations). CQRS with same-database read models.

**Rationale**: AP queries have different access patterns than commands. Aging reports need `GROUP BY vendor, bucket`. Payment calendars need date-range scans. Dashboards need aggregated KPIs. These queries are expensive against aggregate roots that are optimized for write consistency. Read models pre-compute and cache the data these queries need.

**Evidence**: Phase 21.0 identified 5 query-heavy use cases: aging (4 buckets per vendor), payment calendar (date-range scan), cash requirements (outstanding + due-date), discount analysis (discount window tracking), and exception queue (severity + SLA). None of these map cleanly to aggregate root queries.

**Trade-off**: Eventual consistency — read models may lag behind writes by milliseconds. This is acceptable for reads (dashboards, reports) and unacceptable for writes (commands use aggregates). The architecture explicitly separates these concerns.

---

## Alternatives Considered

### Alternative A: Single Aggregate for Everything

| Aspect | Assessment |
|---|---|
| **Description** | One god aggregate containing all AP entities (vendors, invoices, matches, exceptions, payments, reconciliations). |
| **Why Rejected** | Would create a single transaction boundary for every operation — any invoice change locks the entire AP domain. Too many invariants in one place makes the system brittle. Adding a new entity (e.g., credit notes) requires modifying the god aggregate. Violates Single Responsibility at the aggregate level. |
| **Risk if Chosen** | Performance bottleneck under concurrent invoice processing. Merge conflicts in the aggregate root. Impossible to evolve independently. |

### Alternative B: Event Sourcing

| Aspect | Assessment |
|---|---|
| **Description** | Store all state changes as an immutable event log. Reconstruct entity state by replaying events. |
| **Why Rejected** | The Governance Constitution specifies "state-based persistence" (ARCHITECTURE.md §8). Event sourcing adds projection complexity, eventual consistency for reads, and a steeper learning curve for the team. AP needs audit trails — but append-only audit records provide this without the full event sourcing infrastructure. |
| **Risk if Chosen** | Team unfamiliarity with event sourcing patterns. Projection lag causes stale reads. Rebuild-on-failure adds operational complexity. |

### Alternative C: CQRS with Separate Databases

| Aspect | Assessment |
|---|---|
| **Description** | Command database and query database are separate Postgres instances. Read models are physically separated from write models. |
| **Why Rejected** | Modular monolith uses a single database. Separate databases add operational complexity (two connection pools, two backup strategies, two migration pipelines, data synchronization). CQRS with same-database read models (materialized views, indexed queries) provides sufficient separation without the operational burden. |
| **Risk if Chosen** | Data synchronization issues between databases. Higher operational cost. Migration complexity. |

### Alternative D: Message Queue for Domain Events

| Aspect | Assessment |
|---|---|
| **Description** | Publish domain events to PgBoss or similar message queue. Subscribers process events asynchronously via queue workers. |
| **Why Rejected** | Modular monolith uses typed function calls. Message queue adds infrastructure complexity (broker management, dead-letter routing, retry policies, message ordering), eventual consistency issues (GL posting may lag invoice approval by seconds), and debugging difficulty (tracing a payment through queue hops). |
| **Risk if Chosen** | GL posting lag causes stale dashboards. Queue failures block downstream processing. Debugging requires tracing across multiple queue consumers. |

---

## Trade-off Analysis

| Decision | Trade-off | Mitigation | Justification |
|---|---|---|---|
| Separate aggregates (11 roots) | More inter-aggregate references; cross-aggregate coordination requires saga pattern | Saga pattern with compensation; denormalized display fields for references | Cleaner boundaries, independent lifecycle, concurrent evolution |
| Append-only audit trail | Higher storage cost; no correction of erroneous entries | Audit correction events; storage monitoring | SOX compliance is non-negotiable |
| Decimal(38,12) arithmetic | More verbose code; unfamiliar to many developers | `financial-precision.ts` helpers with clear API; ESLint rule | Financial precision is non-negotiable |
| Typed function calls (no MQ) | Synchronous coupling; subscriber failure can block publisher | Try/catch in subscriber handlers; async wrapper for cross-module | Simpler debugging, sufficient for monolith, Governance Constitution compliance |
| Read models (CQRS same-DB) | Eventual consistency for reads; more code to maintain | Read model refresh on write; staleness indicator in UI | Commands use aggregates for consistency, queries use models for performance |
| PaymentProposal/PaymentBatch split | Two aggregates for one logical flow; two DB transactions | Saga pattern connects proposal → batch | Review/approval gate between planning and execution is a critical enterprise control |
| PO/GRN as references | Cannot enforce PO-side invariants; limited PO data in AP | Typed function call to procurement context for PO validation | Ownership clarity; no sync issues between contexts |

---

## Business Rules Discovered

These rules were discovered during domain analysis and are enforced by the 137 invariants in `AP_DOMAIN_INVARIANTS.md`.

| # | Rule | Source | Invariant(s) |
|---|---|---|---|
| 1 | Invoice number uniqueness is per-vendor, not global — same invoice# from different vendors is valid | Phase 21.0 workflow analysis | INV-D002, INV-D004 |
| 2 | Payment terms affect early-pay discount windows — must be checked during proposal generation | AP_DOMAIN_ARCHITECTURE §5 | INV-T002, INV-P009 |
| 3 | Vendor bank detail changes require re-approval before use in payment — security control | Phase 16.0 security audit | INV-A010, INV-AU001 |
| 4 | Partial payments are allowed but create complex reconciliation — outstanding balance tracking | AP_AGGREGATES §4.4 | INV-F008, INV-F011 |
| 5 | Credit notes can only apply to invoices from the same vendor — cross-vendor credits are prohibited | AP_DOMAIN_INVARIANTS Part 8 | INV-P013 |
| 6 | SoD rules prevent PO creator from approving own PO's invoice — segregation of duties | Phase 16.0 security audit, AP_STATE_MACHINES §5 | INV-A001, INV-A002, INV-A003 |
| 7 | SLA escalation is time-based, not workload-based — deadline triggers, not queue-depth triggers | AP_STATE_MACHINES §5 | INV-T006, INV-T012 |
| 8 | Auto-approved invoices (below threshold) still produce immutable approval records — audit trail completeness | AP_DOMAIN_INVARIANTS Part 3 | INV-A015 |
| 9 | Vendor deactivation is permanent — no reactivation path from `deactivated` state | AP_STATE_MACHINES §1 | INV-S010 |
| 10 | Voiding an invoice is irreversible — use reversal for paid invoices, void only for unpaid | AP_STATE_MACHINES §2 | INV-S010, INV-S014 |

---

## Aggregate Architecture Summary

| # | Aggregate Root | Prisma Model | Child Entities | Value Objects | Invariants |
|---|---|---|---|---|---|
| 1 | Vendor | `ProcurementVendor` | VendorDocument, VendorPerformance, VendorBankDetail | Address, VendorCategory | V-1 through V-8 |
| 2 | VendorInvoice | `ProcurementInvoice` | InvoiceLineItem, InvoiceTaxDetail, InvoiceValidationResult | POReference, GRNReference | INV-1 through INV-13 |
| 3 | ThreeWayMatch | `ProcurementMatch` | MatchVariance | MatchType, MatchStatus | M-1 through M-6 |
| 4 | InvoiceException | `ProcurementException` | ExceptionActivity | ExceptionType, ExceptionSeverity | E-1 through E-5 |
| 5 | ApprovalChain | `ProcurementApprovalChain` | ApprovalRecord | ApprovalLevel, ApprovalDecision | A-1 through A-7 |
| 6 | PaymentProposal | `ProcurementPaymentProposal` | ProposalItem | ProposalStatus | PP-1 through PP-5 |
| 7 | PaymentBatch | `ProcurementPaymentBatch` | Payment | BatchStatus, PaymentMethod | PB-1 through PB-6 |
| 8 | VendorCredit | `ProcurementCreditNote` | — | CreditStatus | VC-1 through VC-4 |
| 9 | PurchaseRequest | `ProcurementPR` | PurchaseRequestItem | PRStatus | PR-1 through PR-3 |
| 10 | PurchaseOrder | `ProcurementPO` | PurchaseOrderItem | POStatus | PO-1 through PO-4 |
| 11 | GoodsReceipt | `ProcurementGRN` | GoodsReceiptItem | GRNStatus | GR-1 through GR-3 |

---

## State Machine Inventory

| # | Entity | States | Transitions | Terminal States |
|---|---|---|---|---|
| 1 | Vendor | 6 | 11 | Deactivated |
| 2 | VendorInvoice | 12 | 20 | Cancelled, Voided, Reconciled |
| 3 | ThreeWayMatch | 5 | 7 | Failed, Overridden |
| 4 | InvoiceException | 5 | 8 | Resolved, AutoResolved |
| 5 | ApprovalChain | 5 | 6 | Completed, Cancelled, TimedOut |
| 6 | PaymentProposal | 5 | 7 | Rejected, Executed |
| 7 | PaymentBatch | 5 | 7 | Confirmed, Failed, Cancelled |
| 8 | VendorCredit | 5 | 6 | FullyApplied, Expired, Voided |
| 9 | PurchaseRequest | 5 | 6 | Rejected, Converted |
| 10 | PurchaseOrder | 5 | 7 | Closed, Cancelled |
| 11 | GoodsReceipt | 3 | 4 | Rejected |
| 12 | Payment | 4 | 5 | Confirmed, Reversed |

---

## Domain Event Catalog

| Category | Events | Cross-Module | Intra-Module |
|---|---|---|---|
| Vendor | 7 | 6 | 1 |
| Invoice | 15 | 12 | 3 |
| Matching | 5 | 2 | 3 |
| Exception | 6 | 4 | 2 |
| Approval | 7 | 5 | 2 |
| Payment | 9 | 8 | 1 |
| Reconciliation | 5 | 2 | 3 |
| Credit | 4 | 1 | 3 |
| GL | 3 | 3 | 0 |
| Notification | 2 | 2 | 0 |
| **Total** | **63** | **45** | **18** |

---

## Command & Query Model Summary

### Commands (51)

| Category | Count | Idempotent | Examples |
|---|---|---|---|
| Vendor | 8 | Partial | CreateVendor, UpdateVendor, ApproveVendor, RejectVendor, SuspendVendor, ReactivateVendor, DeactivateVendor, UpdateVendorBankDetails |
| Invoice | 15 | Yes | ReceiveInvoice, UpdateInvoice, VoidInvoice, ValidateInvoice, RunThreeWayMatch, OverrideMatchResult, ApproveInvoice, RejectInvoice, EscalateInvoice, ScheduleInvoiceForPayment, BlockInvoice, UnblockInvoice, DisputeInvoice, ResolveDispute, DeleteInvoice |
| Exception | 6 | Partial | CreateException, AssignException, ResolveException, EscalateException, AutoResolveException, BulkResolveExceptions |
| Approval | 6 | Yes | RequestApproval, GrantApproval, DenyApproval, DelegateApproval, EscalateApproval, RecallApproval |
| Payment | 9 | Yes | GeneratePaymentProposal, ReviewPaymentProposal, ApprovePaymentProposal, RejectPaymentProposal, CreatePaymentBatch, ExecutePayment, ConfirmPayment, ReversePayment, CancelPayment |
| Reconciliation | 4 | Partial | ImportVendorStatement, RunReconciliation, AdjustReconciliation, CompleteReconciliation |
| Credit | 3 | Yes | ReceiveCreditNote, ApplyCreditNote, VoidCreditNote |
| **Total** | **51** | | |

### Queries (18)

| Category | Count | Examples |
|---|---|---|
| Invoice | 3 | GetInvoiceDetails, GetInvoiceList, GetMatchDetails |
| Vendor | 2 | GetVendorDetail, GetVendorList |
| Aging & Cash | 3 | GetVendorAging, GetOutstandingLiabilities, GetCashRequirements |
| Payment | 3 | GetPaymentCalendar, GetPaymentProposalDetails, GetPaymentBatchDetails |
| Queue | 2 | GetExceptionQueue, GetApprovalQueue |
| Discount | 1 | GetDiscountAvailable |
| Analytics | 2 | GetAPDashboard, GetAPAnalytics |
| Audit | 1 | GetAPAuditTrail |
| Approval | 1 | GetApprovalChain |
| **Total** | **18** | |

---

## Integration Architecture

| # | Integration Point | Direction | Interface Type | Existing Service | Status |
|---|---|---|---|---|---|
| 1 | GL / Accounting | AP → GL | Typed function call | `GLIntegrationService` | Exists, never called |
| 2 | Treasury | AP → Treasury | Typed function call | Treasury API | No existing wiring |
| 3 | Approval Workflow | AP ↔ Automation Studio | Typed function call | `ApprovalMatrixEvaluator` | Exists, partially wired |
| 4 | Notification | AP → Notification | Typed function call | `NotificationService` | Exists, partially wired |
| 5 | Budget / FPA | AP → Budget | Typed function call | Budget API | No existing wiring |
| 6 | AI / Intelligence | AP ↔ Intelligence | Typed function call | `aiProviderRegistry` | Exists for other modules |
| 7 | Procurement Context | AP ↔ Procurement | Typed function call | `ProcurementService` | Exists (in-memory) |
| 8 | Audit Trail | AP → Audit | Typed function call | `recordAudit()` | Exists, never called by AP |
| 9 | Identity / IAM | AP → Identity | Typed function call | `identityFacade` | Exists |
| 10 | Banking | AP → Banking | Typed function call | Banking API | No existing wiring |

### Integration Error Handling Strategy

| Error Type | Strategy | User Impact |
|---|---|---|
| GL posting failure | Retry 3×, then hold payment, alert Controller | Payment delayed, invoice stays in `paid` state |
| Treasury API timeout | Retry 2× with exponential backoff, then queue for manual execution | Payment delayed |
| Approval matrix unavailable | Fail closed — approval cannot proceed without routing | User sees "Approval system unavailable, try again" |
| Notification failure | Best-effort — log failure, continue processing | User may not receive notification, processing continues |
| Budget check failure | Fail closed — invoice cannot be approved without budget validation | User sees "Budget validation unavailable" |
| Duplicate detection failure | Fail open — allow invoice, flag for manual review | Slight risk of duplicate, mitigated by manual review |

---

## Permission Matrix

| Role | Vendor | Invoice | Exception | Approval | Payment | Reconciliation | Credit | Total |
|---|---|---|---|---|---|---|---|---|
| AP Clerk | Create, Update | Receive, Update, Delete, OverrideMatch, ResolveException | Create, Assign | — | — | Import | Receive | 8 |
| AP Manager | All vendor ops | All invoice ops | All exception ops | Request, Delegate | Generate, Review, ApproveProposal | All recon ops | All credit ops | 30 |
| Controller | Approve (high-risk), Deactivate | Approve ($50K+), Void, Block | Escalate ($5K+) | Grant ($50K+) | ApproveProposal ($100K+), Reverse ($50K+) | Adjust ($500+) | — | 12 |
| Treasury Manager | — | — | — | — | CreateBatch, Execute, Confirm | — | — | 3 |
| Procurement Manager | Create, Update | — | — | — | — | — | — | 2 |
| CFO | — | Approve ($100K+) | — | Grant ($100K+) | Approve ($100K+), Reverse ($50K+) | — | — | 4 |
| Auditor | Read-only | Read-only | Read-only | Read-only | Read-only | Read-only | Read-only | 0 |
| Budget Owner | — | Read-only | Read-only | Read-only | — | — | — | 0 |

---

## Enforcement Architecture

| Layer | Role | Invariants Enforced | Failure Mode |
|---|---|---|---|
| **API Boundary** | First defense — reject invalid input | Format, required fields, type, range | 400 Bad Request |
| **Service Layer** | Business rules — evaluate against full entity context | State transitions, SoD, thresholds, duplicates | 422 Unprocessable |
| **Aggregate Root** | Invariant recalculation — ensure derived values correct | Financial totals, derived fields, line consistency | 422 Unprocessable |
| **Repository** | Persistence guard — DB constraints, tenant isolation | Unique constraints, FK, `companyId` injection | 409 Conflict |
| **Database** | Last resort — physical constraints | Unique indexes, FK, NOT NULL, Decimal precision | 500 Internal Error |

---

## Future Implementation Guidance

### Phase 21A.1 — Prisma Models & Repositories

| Input Document | Usage |
|---|---|
| `AP_AGGREGATES.md` | Schema design — aggregate boundaries define table relationships |
| `AP_DOMAIN_MODEL.md` | Field types, constraints, defaults, mutability |
| `AP_DOMAIN_INVARIANTS.md` | Unique constraints, check constraints, composite indexes |

**Deliverables**: 12+ Prisma models, 8 repository classes, 1 migration, seed data.

### Phase 21A.2 — Services & State Machines

| Input Document | Usage |
|---|---|
| `AP_STATE_MACHINES.md` | State transition logic — each state machine maps to a service method |
| `AP_COMMAND_QUERY_MODEL.md` | Command handlers — each command maps to a service method |
| `AP_AGGREGATES.md` | Aggregate boundary enforcement — transaction scope |

**Deliverables**: 8 service classes, 12 state machine implementations, read model queries.

### Phase 21A.3 — API Routes & Authorization

| Input Document | Usage |
|---|---|
| `AP_COMMAND_QUERY_MODEL.md` | Endpoint design — each command/query maps to an API route |
| AP_PERMISSION_MATRIX | Authorization — role-based access per endpoint |
| `AP_DOMAIN_EVENTS.md` | Event emission — which events fire from which endpoints |

**Deliverables**: 51 command endpoints (POST/PUT/PATCH), 18 query endpoints (GET), Zod validation schemas.

### Phase 21B — Core Workflow

| Input Document | Usage |
|---|---|
| `AP_STATE_MACHINES.md` | Service layer state machine implementation |
| `AP_INTEGRATION_ARCHITECTURE.md` | Cross-context wiring (GL posting, Treasury payment, approval routing) |
| `AP_DOMAIN_EVENTS.md` | Event handler implementation (notification, escalation, audit) |
| `AP_DOMAIN_INVARIANTS.md` | Business rule enforcement at every service method |

**Deliverables**: End-to-end invoice lifecycle (capture → validate → match → approve → pay → post → reconcile), payment processing, GL integration, exception management.

---

## What Phase 21A.0 Does NOT Do

| Exclusion | Reason |
|---|---|
| No Prisma schema changes | Phase 21A.1 designs the schema using these documents as input |
| No API routes | Phase 21A.3 designs routes using the command/query model |
| No UI changes | Phase 21B+ wires existing 11 pages to new API routes |
| No migration scripts | Phase 21A.1 creates the migration |
| No seed data updates | Phase 21A.1 updates seed data for new Prisma models |
| No test changes | Tests are written after implementation phases |
| No dependency additions | No new npm packages required |

---

## Metrics

| Metric | Value |
|---|---|
| Deliverables | 10 documents |
| Total lines | ~8,373 |
| Entities | 25 |
| Value Objects | 18 |
| Aggregates | 11 |
| State Machines | 12 |
| Domain Events | 63 |
| Commands | 51 |
| Queries | 18 |
| Invariants | 137 |
| Integration Points | 10 |
| Roles | 8 |
| Commands × Roles | 408 authorization decisions |
| Invariant Categories | 8 (Financial, State, Authorization, Temporal, Data Integrity, Audit, Multi-Tenant, Process) |
| Cross-Module Events | 45 (71% of total) |
| Intra-Module Events | 18 (29% of total) |

---

## Invariant Distribution by Category

| Category | ID Prefix | Count | Critical | High | Medium | Low |
|---|---|---|---|---|---|---|
| Financial | INV-F | 27 | 12 | 8 | 6 | 1 |
| State Transition | INV-S | 25 | 8 | 10 | 5 | 2 |
| Authorization | INV-A | 21 | 8 | 9 | 3 | 1 |
| Temporal | INV-T | 12 | 2 | 5 | 4 | 1 |
| Data Integrity | INV-D | 20 | 10 | 5 | 4 | 1 |
| Audit | INV-AU | 11 | 6 | 3 | 1 | 1 |
| Multi-Tenant | INV-M | 8 | 7 | 1 | 0 | 0 |
| Process | INV-P | 13 | 4 | 5 | 3 | 1 |
| **Total** | | **137** | **57** | **46** | **26** | **8** |

---

## Phase 21A.0 ↔ Existing Codebase Impact

| Existing File | Impact |
|---|---|
| `src/server/procurement/types/index.ts` | Types remain — new Prisma models extend, not replace |
| `src/server/procurement/services/invoice-matching.service.ts` | Matching algorithms preserved; wired to Prisma in 21A.2 |
| `src/server/procurement/services/gl-integration.service.ts` | GL integration logic preserved; called from payment confirmation in 21B |
| `src/lib/financial-precision.ts` | Used directly — no changes needed |
| `src/server/audit/recordAudit()` | Called from every AP state transition in 21A.2 |
| `src/modules/automation-studio/approval-matrix-evaluator.ts` | Consumed by AP approval routing in 21A.2 |
| 11 AP pages (`src/app/(shell)/accounts-payable/`) | Rewired to new API routes in 21B |
| 20 AP components (`src/components/accounts-payable/`) | Enhanced with mutation capabilities in 21B |

---

## Brain

### Lesson 33: Domain Architecture Before Implementation

**Observation**: Phase 21A.0 produced ~8,400 lines of architecture documentation before writing a single line of implementation code. This is 10× the documentation density of any previous phase. The reason: AP is the largest domain, the highest-impact investment, and the domain with the most cross-cutting concerns (GL, Treasury, Approval, Budget, Audit, Notification, AI). Getting the architecture wrong here would cascade rework across 4 implementation phases and 8+ integration points.

**Principle**: For enterprise financial domains with >10 entities, >5 integration points, and >50 commands, invest in complete domain architecture documentation before implementation. The upfront cost (1–2 weeks) is recovered 3–5× in reduced rework during implementation phases.

**Contrast**: Phase 21.0 discovered that AP had 12 in-memory services averaging 54 lines each — thin wrappers around Maps with no business logic, no state machines, no event emission, and no audit integration. This scaffolding was built without domain architecture and ended up being 100% throwaway. Phase 21A.0 ensures the implementation is built to specification.

### Lesson 34: Invariants Are the Contract

**Observation**: The 137 invariants in `AP_DOMAIN_INVARIANTS.md` are the authoritative contract between architecture and implementation. Every service method, every API endpoint, every state machine transition must enforce its applicable invariants. When an invariant is violated, the operation is rejected, the violation is logged, and the user is notified. No exceptions.

**Principle**: Business rules are not suggestions — they are enforced propositions. An invariant without enforcement is a suggestion, not a rule. Every invariant must have exactly one enforcement point (API boundary, service layer, aggregate root, repository, or database).

**Contrast**: The existing `InvoiceMatchingService` has a tolerance check (`Math.abs(diff) < 0.01`) but no enforcement mechanism — it returns a result, but nothing rejects the invoice if the tolerance is exceeded. Phase 21A.0's INV-F011 requires explicit rejection with audit trail.
