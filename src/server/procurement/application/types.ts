/**
 * Phase 21A.2 — AP Application Layer Types
 *
 * Command inputs, command results, command context, domain events, and audit entries.
 * These are the typed contracts for every application service method.
 *
 * Financial precision: All monetary fields use Prisma.Decimal(38,12) at the domain
 * boundary. Zero native number arithmetic on money — convert via financial-precision.ts.
 */

import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Decimal = Prisma.Decimal;

// ── Command Context ──────────────────────────────────────────────────────────

export interface CommandContext {
  companyId: string;
  userId: string;
  correlationId: string;
  timestamp: Date;
}

// ── Command Results ──────────────────────────────────────────────────────────

export interface CommandResult<T = void> {
  success: boolean;
  data?: T;
  error?: CommandError;
  events: DomainEvent[];
  auditEntries: AuditEntry[];
}

export interface CommandError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export function ok<T>(data: T, events: DomainEvent[] = [], audits: AuditEntry[] = []): CommandResult<T> {
  return { success: true, data, events, auditEntries: audits };
}

export function fail(code: string, message: string, statusCode: number, details?: Record<string, unknown>): CommandResult<never> {
  return { success: false, error: { code, message, statusCode, details }, events: [], auditEntries: [] };
}

// ── Audit ────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  action: string;
  resourceType: string;
  resourceId: string;
  actorId: string;
  companyId: string;
  metadata: Record<string, unknown>;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

// ── Domain Events ────────────────────────────────────────────────────────────

export interface DomainEvent {
  eventType: string;
  companyId: string;
  aggregateType: string;
  aggregateId: string;
  actorId: string;
  timestamp: Date;
  payload: Record<string, unknown>;
  correlationId: string;
}

// ── Vendor Commands ──────────────────────────────────────────────────────────

export interface CreateVendorCommand {
  name: string;
  legalName?: string;
  vendorCode: string;
  taxId: string;
  taxCountry: string;
  category: string;
  currency?: string;
  billingAddress?: string;
  shippingAddress?: string;
  paymentTerms?: string;
  creditLimit?: Decimal;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateVendorCommand {
  vendorId: string;
  name?: string;
  legalName?: string;
  category?: string;
  currency?: string;
  billingAddress?: string;
  shippingAddress?: string;
  paymentTerms?: string;
  creditLimit?: Decimal;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface VendorStateTransitionCommand {
  vendorId: string;
  reason?: string;
}

export interface UpdateVendorBankDetailsCommand {
  vendorId: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankName: string;
  reason: string;
}

// ── Invoice Commands ─────────────────────────────────────────────────────────

export interface ReceiveInvoiceCommand {
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  currency?: string;
  subtotal: Decimal;
  taxAmount?: Decimal;
  discountAmount?: Decimal;
  description?: string;
  source?: string;
  lineItems: InvoiceLineItemInput[];
}

export interface InvoiceLineItemInput {
  lineNumber: number;
  description: string;
  quantity: Decimal;
  unitOfMeasure?: string;
  unitPrice: Decimal;
  taxRate?: Decimal;
  glAccountId?: string;
}

export interface UpdateInvoiceCommand {
  invoiceId: string;
  invoiceDate?: Date;
  dueDate?: Date;
  description?: string;
  lineItems?: InvoiceLineItemInput[];
}

export interface VoidInvoiceCommand {
  invoiceId: string;
  reason: string;
}

// ── Match Commands ───────────────────────────────────────────────────────────

export interface RunThreeWayMatchCommand {
  invoiceId: string;
}

export interface OverrideMatchCommand {
  matchId: string;
  reason: string;
}

// ── Exception Commands ───────────────────────────────────────────────────────

export interface CreateExceptionCommand {
  invoiceId: string;
  exceptionType: string;
  severity: string;
  description: string;
  varianceAmount?: Decimal;
}

export interface ResolveExceptionCommand {
  exceptionId: string;
  resolution: string;
  resolutionNotes: string;
  resolutionAmount?: Decimal;
}

export interface AssignExceptionCommand {
  exceptionId: string;
  assignedTo: string;
}

export interface EscalateExceptionCommand {
  exceptionId: string;
  reason: string;
}

// ── Approval Commands ────────────────────────────────────────────────────────

export interface RequestApprovalCommand {
  invoiceId: string;
}

export interface DecideApprovalCommand {
  approvalRecordId: string;
  decision: "APPROVED" | "REJECTED";
  comment?: string;
}

export interface DelegateApprovalCommand {
  approvalRecordId: string;
  delegatedTo: string;
  reason: string;
}

export interface EscalateApprovalCommand {
  approvalRecordId: string;
  reason: string;
}

// ── Payment Commands ─────────────────────────────────────────────────────────

export interface GeneratePaymentProposalCommand {
  paymentDate: Date;
  vendorIds?: string[];
  maxAmount?: Decimal;
  notes?: string;
}

export interface ApprovePaymentProposalCommand {
  proposalId: string;
  comments?: string;
}

export interface RejectPaymentProposalCommand {
  proposalId: string;
  reason: string;
}

export interface CreatePaymentBatchCommand {
  proposalId: string;
}

export interface ExecutePaymentCommand {
  batchId: string;
  paymentId: string;
}

export interface ConfirmPaymentCommand {
  batchId: string;
  paymentId: string;
  bankReference: string;
  confirmationNumber?: string;
}

export interface ReversePaymentCommand {
  batchId: string;
  paymentId: string;
  reason: string;
}

export interface CancelPaymentCommand {
  batchId: string;
  paymentId: string;
  reason: string;
}

// ── Reconciliation Commands ──────────────────────────────────────────────────

export interface ImportVendorStatementCommand {
  vendorId: string;
  statementDate: Date;
  period: string;
  openingBalance: Decimal;
  closingBalance: Decimal;
  currency?: string;
  lines: StatementLineInput[];
}

export interface StatementLineInput {
  lineNumber: number;
  transactionDate: Date;
  reference: string;
  description: string;
  debitAmount?: Decimal;
  creditAmount?: Decimal;
  balance: Decimal;
  transactionType: string;
}

export interface RunReconciliationCommand {
  reconciliationId: string;
}

export interface AdjustReconciliationCommand {
  reconciliationId: string;
  adjustments: ReconciliationAdjustment[];
}

export interface ReconciliationAdjustment {
  statementLineId: string;
  adjustmentType: string;
  amount: Decimal;
  reason: string;
  invoiceId?: string;
}

export interface CompleteReconciliationCommand {
  reconciliationId: string;
}

// ── Credit Commands ──────────────────────────────────────────────────────────

export interface ReceiveCreditNoteCommand {
  vendorId: string;
  creditNumber: string;
  creditDate: Date;
  creditAmount: Decimal;
  currency?: string;
  reason: string;
  relatedInvoiceId?: string;
}

export interface ApplyCreditNoteCommand {
  creditId: string;
  applications: CreditApplication[];
}

export interface CreditApplication {
  invoiceId: string;
  amount: Decimal;
}

export interface VoidCreditNoteCommand {
  creditId: string;
  reason: string;
}
