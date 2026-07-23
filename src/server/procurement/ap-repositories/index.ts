/**
 * Phase 21A.2 — AP Repositories Barrel Export
 *
 * Exports all repository interfaces, InMemory implementations,
 * Prisma implementations, types, and registry.
 */

// ── Domain Types ────────────────────────────────────────────────────────────
export type {
  Vendor, VendorBankDetail, VendorPerformance, VendorDocument,
  VendorStatus, VendorRiskLevel, VendorCategory, VendorPreferredPaymentMethod,
  VendorBankAccountType, VendorDocumentStatus,
  VendorInvoice, InvoiceLineItem, InvoiceAttachment,
  VendorInvoiceStatus, VendorInvoiceSource, InvoiceLineItemTaxType,
  InvoiceLineItemMatchStatus, InvoiceAttachmentCategory, ThreeWayMatchResult,
  POReference, POReferenceLineItem, POReferenceStatus, POReferenceLineItemStatus,
  GRNReference, GRNReferenceLineItem, GRNReferenceStatus, GRNReferenceLineItemCondition,
  ThreeWayMatch, MatchLineItem, MatchLineItemStatus,
  InvoiceException, InvoiceExceptionType, InvoiceExceptionSeverity, InvoiceExceptionStatus,
  ApprovalRecord, ApprovalLevel, ApprovalRecordStatus, ApprovalRecordDecision,
  PaymentProposal, PaymentProposalItem, PaymentProposalStatus, PaymentProposalItemSelection,
  PaymentBatch, PaymentRecord, PaymentBatchStatus, PaymentRecordStatus,
  VendorCredit, VendorCreditStatus,
  VendorStatement, VendorStatementLine, VendorStatementStatus,
  VendorStatementLineTransactionType, VendorStatementLineMatchStatus,
  ReconciliationResult, ReconciliationResultStatus,
  APAuditRecord, APAuditAction,
  VendorQueryFilter, InvoiceQueryFilter, MatchQueryFilter, ExceptionQueryFilter,
  ApprovalQueryFilter, PaymentProposalQueryFilter, PaymentBatchQueryFilter,
  CreditQueryFilter, ReconciliationQueryFilter, AuditQueryFilter,
  PaginationParams, PaginatedResult, SortParams,
} from "./types";

// ── Repository Interfaces ──────────────────────────────────────────────────
export type { IVendorRepository } from "./vendor-repository";
export type { IInvoiceRepository } from "./invoice-repository";
export type { IMatchRepository } from "./match-repository";
export type { IExceptionRepository } from "./exception-repository";
export type { IApprovalRepository } from "./approval-repository";
export type { IPaymentProposalRepository, IPaymentBatchRepository } from "./payment-repository";
export type { ICreditRepository } from "./credit-repository";
export type { IReconciliationRepository } from "./reconciliation-repository";
export type { IAuditRepository } from "./audit-repository";

// ── InMemory Implementations ───────────────────────────────────────────────
export { InMemoryVendorRepository } from "./vendor-repository";
export { InMemoryInvoiceRepository } from "./invoice-repository";
export { InMemoryMatchRepository } from "./match-repository";
export { InMemoryExceptionRepository } from "./exception-repository";
export { InMemoryApprovalRepository } from "./approval-repository";
export { InMemoryPaymentProposalRepository, InMemoryPaymentBatchRepository } from "./payment-repository";
export { InMemoryCreditRepository } from "./credit-repository";
export { InMemoryReconciliationRepository } from "./reconciliation-repository";
export { InMemoryAuditRepository } from "./audit-repository";

// ── Prisma Implementations ─────────────────────────────────────────────────
export { PrismaVendorRepository } from "./prisma-vendor-repository";
export { PrismaInvoiceRepository } from "./prisma-invoice-repository";
export { PrismaMatchRepository } from "./prisma-match-repository";
export { PrismaExceptionRepository } from "./prisma-exception-repository";
export { PrismaApprovalRepository } from "./prisma-approval-repository";
export { PrismaPaymentProposalRepository, PrismaPaymentBatchRepository } from "./prisma-payment-repository";
export { PrismaCreditRepository } from "./prisma-credit-repository";
export { PrismaReconciliationRepository } from "./prisma-reconciliation-repository";
export { PrismaAuditRepository } from "./prisma-audit-repository";

// ── Registry ───────────────────────────────────────────────────────────────
export type { APRepositoryRegistry } from "./registry";
export { initializeAPRepositories, getAPRepositories, resetAPRepositories } from "./registry";
