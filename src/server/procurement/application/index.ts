/**
 * Phase 21A.2 — AP Application Layer Barrel Export
 *
 * Exports all application services, command types, context, result helpers,
 * and domain event infrastructure.
 */

// ── Command Types ────────────────────────────────────────────────────────────
export type {
  CommandContext,
  CommandResult,
  CommandError,
  AuditEntry,
  DomainEvent,
  CreateVendorCommand,
  UpdateVendorCommand,
  VendorStateTransitionCommand,
  UpdateVendorBankDetailsCommand,
  ReceiveInvoiceCommand,
  InvoiceLineItemInput,
  UpdateInvoiceCommand,
  VoidInvoiceCommand,
  RunThreeWayMatchCommand,
  OverrideMatchCommand,
  CreateExceptionCommand,
  ResolveExceptionCommand,
  AssignExceptionCommand,
  EscalateExceptionCommand,
  RequestApprovalCommand,
  DecideApprovalCommand,
  DelegateApprovalCommand,
  EscalateApprovalCommand,
  GeneratePaymentProposalCommand,
  ApprovePaymentProposalCommand,
  RejectPaymentProposalCommand,
  CreatePaymentBatchCommand,
  ExecutePaymentCommand,
  ConfirmPaymentCommand,
  ReversePaymentCommand,
  CancelPaymentCommand,
  ImportVendorStatementCommand,
  StatementLineInput,
  RunReconciliationCommand,
  AdjustReconciliationCommand,
  ReconciliationAdjustment,
  CompleteReconciliationCommand,
  ReceiveCreditNoteCommand,
  ApplyCreditNoteCommand,
  CreditApplication,
  VoidCreditNoteCommand,
} from "./types";

export { ok, fail } from "./types";

// ── Application Services ─────────────────────────────────────────────────────
export { VendorApplicationService } from "./vendor-service";
export { InvoiceApplicationService } from "./invoice-service";
export { ExceptionApplicationService } from "./exception-service";
export { ApprovalApplicationService } from "./approval-service";
export { PaymentApplicationService } from "./payment-service";
export { ReconciliationApplicationService } from "./reconciliation-service";
export { CreditApplicationService } from "./credit-service";

// ── Unit of Work ─────────────────────────────────────────────────────────────
export { executeUnitOfWork, unitOfWorkResult } from "./unit-of-work";
export type { UnitOfWorkResult, TransactionalOperation } from "./unit-of-work";

// ── Workflow Orchestrator ────────────────────────────────────────────────────
export { executeWithUnitOfWork } from "./workflow-orchestrator";

// ── Event Handlers ───────────────────────────────────────────────────────────
export { registerAllAPEventHandlers } from "../domain/event-handlers";
