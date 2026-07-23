# AP Command Execution Model

> **Phase 21A.2** — Command Pipeline  
> 51 commands mapped across 7 layers  
> Input validation → Authorization → Business rules → Persistence → Events → Audit → Notification

---

## Pipeline

```
API Route (Zod validation)
  → Command Handler (authorization check)
    → Application Service (business rules, state machine)
      → Repository (persistence, DB constraints)
        → Domain Events (post-commit)
          → Audit Record (same transaction)
            → Notifications (async)
```

### Layer Responsibilities

| Layer | Responsibility | Failure Mode |
|---|---|---|
| **API Route** | Zod schema validation, HTTP status codes | 400 Bad Request |
| **Command Handler** | Authorization (SoD, role), context extraction | 403 Forbidden, 401 Unauthorized |
| **Application Service** | Business rules, state machine transitions, financial precision | 400/409 Business Rule Violation |
| **Repository** | Persistence, unique constraints, foreign keys | 409 Conflict, 500 DB Error |
| **Domain Events** | Post-commit notification dispatch | Non-blocking (logged, not thrown) |
| **Audit Record** | Append-only audit trail within transaction | Non-blocking |
| **Notifications** | Async email, Slack, connector delivery | Non-blocking |

---

## Command Execution Flow

### 1. API Route Layer

Validates incoming request against Zod schema. Extracts `CommandContext` from authenticated session.

```typescript
// POST /api/procurement/vendors
const body = createVendorSchema.parse(await request.json());
const ctx: CommandContext = {
  companyId: session.companyId,
  userId: session.userId,
  correlationId: crypto.randomUUID(),
  timestamp: new Date(),
};
```

### 2. Command Handler Layer

Checks authorization (role-based, SoD). Calls application service within unit of work.

```typescript
const result = await executeUnitOfWork(async (tx) => {
  return service.createVendor(body, ctx);
});
```

### 3. Application Service Layer

Core business logic. Validates preconditions, applies state transitions, collects events and audit entries.

```typescript
async createVendor(cmd: CreateVendorCommand, ctx: CommandContext): Promise<CommandResult<Vendor>> {
  // Validate
  if (cmd.name.length < 2) return fail("VALIDATION_ERROR", "...", 400);
  // Load
  const exists = await this.repos.vendor.existsByTaxId(cmd.taxId, ctx.companyId);
  if (exists) return fail("CONFLICT", "...", 409);
  // Business rules
  const vendor = { ...initial state ... };
  // Save
  await this.repos.vendor.save(vendor);
  // Events
  const event = vendorEvents.created(vendorId, { ... });
  // Audit
  const audit = { action: "vendor.created", ... };
  return ok(vendor, [event], [audit]);
}
```

### 4. Repository Layer

Persists domain objects via Prisma. Enforces unique constraints, foreign keys, tenant isolation.

### 5. Post-Commit

Domain events dispatched to subscribers. Audit records already persisted within transaction.

---

## Complete Command Map (51 Commands)

### Vendor Commands (8)

| Command | Input Type | Service Method | Repository Calls | Events Emitted | Audit Actions | Required Roles |
|---|---|---|---|---|---|---|
| createVendor | `CreateVendorCommand` | `createVendor` | `vendor.existsByTaxId`, `vendor.save` | `vendor.created` | `vendor.created` | AP_MANAGER, CONTROLLER |
| updateVendor | `UpdateVendorCommand` | `updateVendor` | `vendor.findById`, `vendor.save` | `vendor.updated` | `vendor.updated` | AP_MANAGER |
| approveVendor | `VendorStateTransitionCommand` | `approveVendor` | `vendor.findById`, `vendor.save` | `vendor.approved` | `vendor.approved` | CONTROLLER, CFO |
| rejectVendor | `VendorStateTransitionCommand & { reason }` | `rejectVendor` | `vendor.findById`, `vendor.save` | `vendor.rejected` | `vendor.rejected` | CONTROLLER, CFO |
| suspendVendor | `VendorStateTransitionCommand & { reason }` | `suspendVendor` | `vendor.findById`, `vendor.save` | `vendor.suspended` | `vendor.suspended` | AP_MANAGER, CONTROLLER |
| reactivateVendor | `VendorStateTransitionCommand` | `reactivateVendor` | `vendor.findById`, `vendor.save` | `vendor.reactivated` | `vendor.reactivated` | AP_MANAGER, CONTROLLER |
| deactivateVendor | `VendorStateTransitionCommand & { reason }` | `deactivateVendor` | `vendor.findById`, `vendor.save` | `vendor.deactivated` | `vendor.deactivated` | CONTROLLER, CFO |
| updateBankDetails | `UpdateVendorBankDetailsCommand` | `updateBankDetails` | `vendor.findById`, `vendor.getBankDetails`, `vendor.saveBankDetail`, `vendor.save` | `vendor.bank_updated` | `vendor.bank_updated` | AP_MANAGER |

### Invoice Commands (15)

| Command | Input Type | Service Method | Repository Calls | Events Emitted | Audit Actions | Required Roles |
|---|---|---|---|---|---|---|
| receiveInvoice | `ReceiveInvoiceCommand` | `receiveInvoice` | `vendor.findById`, `invoice.existsByInvoiceNumber`, `invoice.save`, `invoice.saveLineItems` | `invoice.captured` | `invoice.received` | AP_CLERK, AP_MANAGER |
| updateInvoice | `UpdateInvoiceCommand` | `updateInvoice` | `invoice.findById`, `invoice.deleteLineItemsByInvoice`, `invoice.saveLineItems`, `invoice.save` | `invoice.updated` | `invoice.updated` | AP_CLERK, AP_MANAGER |
| voidInvoice | `VoidInvoiceCommand` | `voidInvoice` | `invoice.findById`, `invoice.save` | `invoice.voided` | `invoice.voided` | AP_MANAGER |
| validateInvoice | `{ invoiceId }` | `validateInvoice` | `invoice.findById`, `invoice.getLineItems`, `exception.save` (on failure), `invoice.save` | `invoice.validated` or `invoice.validation_failed` + `exception.created` | `invoice.validated` or `invoice.validation_failed` | SYSTEM, AP_MANAGER |
| runThreeWayMatch | `RunThreeWayMatchCommand` | `runThreeWayMatch` | `invoice.findById`, `invoice.getLineItems`, `match.save`, `match.saveLineItems`, `exception.save` (on failure), `invoice.save` | `invoice.matched` or `invoice.match.exception` + `exception.created` | `invoice.matched` or `invoice.match_exception` | SYSTEM, AP_MANAGER |
| overrideMatchResult | `OverrideMatchCommand` | `overrideMatchResult` | `match.findById`, `match.save`, `invoice.findById`, `invoice.save` | `invoice.match.override` | `invoice.match_override` | CONTROLLER, CFO |
| approveInvoice | `{ invoiceId }` | `approveInvoice` | `invoice.findById`, `invoice.save` | `invoice.captured` (reuse) | `invoice.approved` | CONTROLLER, CFO |
| rejectInvoice | `{ invoiceId; reason }` | `rejectInvoice` | `invoice.findById`, `invoice.save` | — | `invoice.rejected` | CONTROLLER, CFO |
| escalateInvoice | `{ invoiceId; reason }` | `escalateInvoice` | `invoice.findById`, `invoice.save` | — | `invoice.escalated` | AP_MANAGER, CONTROLLER |
| scheduleForPayment | `{ invoiceId }` | `scheduleForPayment` | `invoice.findById`, `vendor.findById`, `invoice.save` | `invoice.payment.scheduled` | `invoice.payment_scheduled` | AP_MANAGER |
| blockInvoice | `{ invoiceId; reason; blockType }` | `blockInvoice` | `invoice.findById`, `invoice.save` | `invoice.blocked` | `invoice.blocked` | AP_MANAGER, CONTROLLER |
| unblockInvoice | `{ invoiceId; reason }` | `unblockInvoice` | `invoice.findById`, `invoice.save` | `invoice.unblocked` | `invoice.unblocked` | CONTROLLER |
| disputeInvoice | `{ invoiceId; disputeReason }` | `disputeInvoice` | `invoice.findById`, `invoice.save` | `invoice.disputed` | `invoice.disputed` | AP_MANAGER |
| resolveDispute | `{ invoiceId; resolution; resolutionNotes }` | `resolveDispute` | `invoice.findById`, `invoice.save` | `invoice.dispute_resolved` | `invoice.dispute_resolved` | CONTROLLER, CFO |
| deleteInvoice | `{ invoiceId; reason }` | `deleteInvoice` | `invoice.findById`, `invoice.save` | `invoice.voided` | `invoice.deleted` | AP_MANAGER |

### Exception Commands (6)

| Command | Input Type | Service Method | Repository Calls | Events Emitted | Audit Actions | Required Roles |
|---|---|---|---|---|---|---|
| createException | `CreateExceptionCommand` | `createException` | `invoice.findById`, `exception.findOpenByInvoiceId`, `exception.save` | `exception.created` | `exception.created` | SYSTEM, AP_MANAGER |
| assignException | `AssignExceptionCommand` | `assignException` | `exception.findById`, `exception.save` | `exception.assigned` | `exception.assigned` | AP_MANAGER |
| resolveException | `ResolveExceptionCommand` | `resolveException` | `exception.findById`, `exception.save`, `invoice.findById`, `invoice.save` | `exception.resolved` | `exception.resolved` | AP_MANAGER, CONTROLLER |
| escalateException | `EscalateExceptionCommand` | `escalateException` | `exception.findById`, `exception.save` | `exception.escalated` | `exception.escalated` | AP_MANAGER |
| autoResolveException | `{ exceptionId; patternId; confidence }` | `autoResolveException` | `exception.findById`, `exception.save` | `exception.bulk_resolved` | `exception.autoResolved` | SYSTEM |
| bulkResolveExceptions | `{ exceptionIds[]; resolution; resolutionNotes }` | `bulkResolveExceptions` | `exception.findById` (×N), `exception.save` (×N) | `exception.bulk_resolved` | `exception.bulkResolved` | AP_MANAGER, CONTROLLER |

### Approval Commands (6)

| Command | Input Type | Service Method | Repository Calls | Events Emitted | Audit Actions | Required Roles |
|---|---|---|---|---|---|---|
| requestApproval | `RequestApprovalCommand` | `requestApproval` | `invoice.findById`, `approval.findRecordsByInvoiceId`, `approval.saveRecord` (×N), `invoice.save` | `approval.created`, `invoice.updated` | `approval.requested`, `invoice.status_changed` | AP_MANAGER |
| approveLevel | `DecideApprovalCommand` | `approveLevel` | `approval.findRecordById`, `approval.saveRecord`, `invoice.findById`, `approval.findRecordsByInvoiceId`, `approval.saveRecord` (next), `invoice.save` | `approval.level.decided`, `approval.chain.approved` | `approval.approved`, `approval.chain_approved` | CONTROLLER, CFO |
| rejectLevel | `DecideApprovalCommand` | `rejectLevel` | `approval.findRecordById`, `approval.saveRecord`, `approval.findRecordsByInvoiceId`, `approval.saveRecord` (×N skip), `invoice.findById`, `invoice.save`, `exception.save` | `approval.level.decided`, `approval.chain.rejected`, `exception.created`, `invoice.updated` | `approval.rejected`, `exception.created` | CONTROLLER, CFO |
| delegateApproval | `DelegateApprovalCommand` | `delegateApproval` | `approval.findRecordById`, `approval.saveRecord` | `approval.delegated` | `approval.delegated` | AP_MANAGER, CONTROLLER |
| escalateApprovalLevel | `EscalateApprovalCommand` | `escalateApprovalLevel` | `approval.findRecordById`, `approval.findRecordsByInvoiceId`, `approval.saveRecord` (×2), `invoice.findById`, `invoice.save` | `approval.level.decided`, `approval.level.escalated`, `approval.chain.approved` | `approval.escalated`, `approval.chain_approved` | CONTROLLER, CFO |
| recallApproval | `{ approvalRecordId; reason }` | `recallApproval` | `approval.findRecordById`, `invoice.findById`, `approval.findRecordsByInvoiceId`, `approval.saveRecord` (×N), `invoice.save` | `approval.recalled`, `invoice.updated` | `approval.recalled`, `invoice.status_changed` | CONTROLLER, CFO |

### Payment Commands (9)

| Command | Input Type | Service Method | Repository Calls | Events Emitted | Audit Actions | Required Roles |
|---|---|---|---|---|---|---|
| generatePaymentProposal | `GeneratePaymentProposalCommand` | `generatePaymentProposal` | `invoice.findApprovedUnscheduled`, `paymentProposal.save`, `paymentProposal.saveItems` | `proposal.generated` | `payment.proposal.generated` | AP_MANAGER |
| reviewPaymentProposal | `{ proposalId; notes? }` | `reviewPaymentProposal` | `paymentProposal.findById`, `paymentProposal.save` | `proposal.reviewed` | `payment.proposal.reviewed` | AP_MANAGER |
| approvePaymentProposal | `ApprovePaymentProposalCommand` | `approvePaymentProposal` | `paymentProposal.findById`, `paymentProposal.save` | `proposal.approved` | `payment.proposal.approved` | CONTROLLER, CFO |
| rejectPaymentProposal | `RejectPaymentProposalCommand` | `rejectPaymentProposal` | `paymentProposal.findById`, `paymentProposal.save` | `proposal.rejected` | `payment.proposal.rejected` | CONTROLLER, CFO |
| createPaymentBatch | `CreatePaymentBatchCommand` | `createPaymentBatch` | `paymentProposal.findById`, `paymentBatch.findByProposalId`, `paymentProposal.getItems`, `paymentBatch.save`, `paymentBatch.savePaymentRecord` (×N), `paymentProposal.save` | `batch.created` | `payment.batch.created` | AP_MANAGER |
| executePayment | `ExecutePaymentCommand` | `executePayment` | `paymentBatch.findById`, `paymentBatch.findPaymentRecordById`, `paymentBatch.findByIdempotencyKey`, `paymentBatch.findByInvoiceId`, `paymentBatch.savePaymentRecord` | `payment.submitted` | `payment.submitted` | AP_MANAGER |
| confirmPayment | `ConfirmPaymentCommand` | `confirmPayment` | `paymentBatch.findById`, `paymentBatch.findPaymentRecordById`, `paymentBatch.savePaymentRecord`, `invoice.findById`, `invoice.save`, `paymentBatch.getPaymentRecords`, `paymentBatch.save` | `payment.confirmed` | `payment.confirmed` | AP_MANAGER, CONTROLLER |
| reversePayment | `ReversePaymentCommand` | `reversePayment` | `paymentBatch.findById`, `paymentBatch.findPaymentRecordById`, `paymentBatch.savePaymentRecord`, `invoice.findById`, `invoice.save` | `payment.reversed` | `payment.reversed` | CONTROLLER, CFO |
| cancelPayment | `CancelPaymentCommand` | `cancelPayment` | `paymentBatch.findById`, `paymentBatch.findPaymentRecordById`, `paymentBatch.savePaymentRecord`, `invoice.findById`, `invoice.save` | `payment.cancelled` | `payment.cancelled` | AP_MANAGER |

### Reconciliation Commands (4)

| Command | Input Type | Service Method | Repository Calls | Events Emitted | Audit Actions | Required Roles |
|---|---|---|---|---|---|---|
| importVendorStatement | `ImportVendorStatementCommand` | `importVendorStatement` | `vendor.findById`, `reconciliation.findStatementsByVendor`, `reconciliation.saveStatementLines`, `reconciliation.saveStatement`, `reconciliation.saveReconciliationResult` | `reconciliation.imported` | `reconciliation.imported` | AP_MANAGER |
| runReconciliation | `RunReconciliationCommand` | `runReconciliation` | `reconciliation.findReconciliationResultById`, `reconciliation.findStatementById`, `reconciliation.getStatementLines`, `invoice.findByVendorId`, `reconciliation.saveStatementLines`, `reconciliation.saveReconciliationResult` | `reconciliation.matched` | `reconciliation.run` | AP_MANAGER |
| adjustReconciliation | `AdjustReconciliationCommand` | `adjustReconciliation` | `reconciliation.findReconciliationResultById`, `reconciliation.getStatementLines`, `reconciliation.saveStatementLines`, `reconciliation.saveReconciliationResult` | `reconciliation.adjusted` | `reconciliation.adjusted` | AP_MANAGER, CONTROLLER |
| completeReconciliation | `CompleteReconciliationCommand` | `completeReconciliation` | `reconciliation.findReconciliationResultById`, `reconciliation.saveReconciliationResult`, `reconciliation.findStatementById` | `reconciliation.completed` | `reconciliation.completed` | AP_MANAGER |

### Credit Commands (3)

| Command | Input Type | Service Method | Repository Calls | Events Emitted | Audit Actions | Required Roles |
|---|---|---|---|---|---|---|
| receiveCreditNote | `ReceiveCreditNoteCommand` | `receiveCreditNote` | `vendor.findById`, `credit.findByCreditNumber`, `invoice.findById` (if related), `credit.save` | `credit.received` | `credit.received` | AP_CLERK, AP_MANAGER |
| applyCreditNote | `ApplyCreditNoteCommand` | `applyCreditNote` | `credit.findById`, `invoice.findById` (×N), `credit.save`, `invoice.save` (×N) | `credit.applied` or `credit.partially_applied` | `credit.applied` or `credit.partially_applied` | AP_MANAGER |
| voidCreditNote | `VoidCreditNoteCommand` | `voidCreditNote` | `credit.findById`, `invoice.findByFilter`, `invoice.save` (×N), `credit.save` | `credit.voided` | `credit.voided` | AP_MANAGER, CONTROLLER |

---

## Event-to-Notification Mapping

| Event Category | Notification Type | Delivery |
|---|---|---|
| `invoice.captured` | AP team notification | Async (PgBoss) |
| `invoice.match.exception` | Exception queue alert | Async |
| `invoice.blocked` | Finance team alert | Async |
| `approval.created` | Approver notification | Async |
| `approval.chain.approved` | Invoice owner notification | Async |
| `approval.chain.rejected` | AP team alert | Async |
| `proposal.generated` | Payment approver notification | Async |
| `proposal.approved` | Treasury notification | Async |
| `payment.confirmed` | Vendor payment confirmation | Async |
| `payment.reversed` | Finance team alert (CRITICAL) | Async |
| `exception.created` | Exception queue alert | Async |
| `exception.escalated` | Manager notification | Async |
| `reconciliation.completed` | AP team notification | Async |
| `credit.received` | AP team notification | Async |
