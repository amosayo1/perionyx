/**
 * Phase 21A.2 — AP Domain Event Types
 *
 * Typed event constructors for all 63 AP domain events.
 * Each returns a DomainEvent with proper type, payload, and metadata.
 */

import type { DomainEvent } from "../../application/types";

function makeEvent(
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  companyId: string,
  actorId: string,
  correlationId: string,
  payload: Record<string, unknown>,
): DomainEvent {
  return {
    eventType,
    companyId,
    aggregateType,
    aggregateId,
    actorId,
    timestamp: new Date(),
    payload,
    correlationId,
  };
}

// ── Vendor Events ────────────────────────────────────────────────────────────

export const vendorEvents = {
  created: (id: string, ctx: { companyId: string; userId: string; correlationId: string; vendorCode: string; category: string }) =>
    makeEvent("vendor.created", "Vendor", id, ctx.companyId, ctx.userId, ctx.correlationId, { vendorCode: ctx.vendorCode, category: ctx.category }),

  updated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; changedFields: string[] }) =>
    makeEvent("vendor.updated", "Vendor", id, ctx.companyId, ctx.userId, ctx.correlationId, { changedFields: ctx.changedFields }),

  approved: (id: string, ctx: { companyId: string; userId: string; correlationId: string; riskLevel: string; riskScore: number }) =>
    makeEvent("vendor.approved", "Vendor", id, ctx.companyId, ctx.userId, ctx.correlationId, { riskLevel: ctx.riskLevel, riskScore: ctx.riskScore }),

  rejected: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string }) =>
    makeEvent("vendor.rejected", "Vendor", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason }),

  suspended: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string }) =>
    makeEvent("vendor.suspended", "Vendor", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason }),

  reactivated: (id: string, ctx: { companyId: string; userId: string; correlationId: string }) =>
    makeEvent("vendor.reactivated", "Vendor", id, ctx.companyId, ctx.userId, ctx.correlationId, {}),

  deactivated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string }) =>
    makeEvent("vendor.deactivated", "Vendor", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason }),

  bankUpdated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; previousBankLast4: string; newBankLast4: string }) =>
    makeEvent("vendor.bank_updated", "Vendor", id, ctx.companyId, ctx.userId, ctx.correlationId, { previousBankLast4: ctx.previousBankLast4, newBankLast4: ctx.newBankLast4 }),
};

// ── Invoice Events ───────────────────────────────────────────────────────────

export const invoiceEvents = {
  captured: (id: string, ctx: { companyId: string; userId: string; correlationId: string; vendorId: string; amount: number; currency: string; source: string }) =>
    makeEvent("invoice.captured", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { vendorId: ctx.vendorId, amount: ctx.amount, currency: ctx.currency, source: ctx.source }),

  updated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; changedFields: string[] }) =>
    makeEvent("invoice.updated", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { changedFields: ctx.changedFields }),

  voided: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string; previousState: string }) =>
    makeEvent("invoice.voided", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason, previousState: ctx.previousState }),

  validated: (id: string, ctx: { companyId: string; userId: string; correlationId: string }) =>
    makeEvent("invoice.validated", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, {}),

  validationFailed: (id: string, ctx: { companyId: string; userId: string; correlationId: string; errors: string[] }) =>
    makeEvent("invoice.validation_failed", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { errors: ctx.errors }),

  matched: (id: string, ctx: { companyId: string; userId: string; correlationId: string; matchId: string; matchType: string; totalVariance: number }) =>
    makeEvent("invoice.matched", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { matchId: ctx.matchId, matchType: ctx.matchType, totalVariance: ctx.totalVariance }),

  matchException: (id: string, ctx: { companyId: string; userId: string; correlationId: string; matchId: string }) =>
    makeEvent("invoice.match.exception", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { matchId: ctx.matchId }),

  matchOverride: (id: string, ctx: { companyId: string; userId: string; correlationId: string; matchId: string; reason: string }) =>
    makeEvent("invoice.match.override", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { matchId: ctx.matchId, reason: ctx.reason }),

  blocked: (id: string, ctx: { companyId: string; userId: string; correlationId: string; blockType: string; reason: string }) =>
    makeEvent("invoice.blocked", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { blockType: ctx.blockType, reason: ctx.reason }),

  unblocked: (id: string, ctx: { companyId: string; userId: string; correlationId: string; previousState: string }) =>
    makeEvent("invoice.unblocked", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { previousState: ctx.previousState }),

  disputed: (id: string, ctx: { companyId: string; userId: string; correlationId: string; disputeReason: string }) =>
    makeEvent("invoice.disputed", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { disputeReason: ctx.disputeReason }),

  disputeResolved: (id: string, ctx: { companyId: string; userId: string; correlationId: string; resolution: string }) =>
    makeEvent("invoice.dispute_resolved", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { resolution: ctx.resolution }),

  paymentScheduled: (id: string, ctx: { companyId: string; userId: string; correlationId: string; proposalId: string }) =>
    makeEvent("invoice.payment.scheduled", "VendorInvoice", id, ctx.companyId, ctx.userId, ctx.correlationId, { proposalId: ctx.proposalId }),
};

// ── Exception Events ─────────────────────────────────────────────────────────

export const exceptionEvents = {
  created: (id: string, ctx: { companyId: string; userId: string; correlationId: string; invoiceId: string; type: string; severity: string }) =>
    makeEvent("exception.created", "InvoiceException", id, ctx.companyId, ctx.userId, ctx.correlationId, { invoiceId: ctx.invoiceId, type: ctx.type, severity: ctx.severity }),

  assigned: (id: string, ctx: { companyId: string; userId: string; correlationId: string; assignedTo: string }) =>
    makeEvent("exception.assigned", "InvoiceException", id, ctx.companyId, ctx.userId, ctx.correlationId, { assignedTo: ctx.assignedTo }),

  resolved: (id: string, ctx: { companyId: string; userId: string; correlationId: string; resolution: string }) =>
    makeEvent("exception.resolved", "InvoiceException", id, ctx.companyId, ctx.userId, ctx.correlationId, { resolution: ctx.resolution }),

  escalated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string }) =>
    makeEvent("exception.escalated", "InvoiceException", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason }),

  bulkResolved: (id: string, ctx: { companyId: string; userId: string; correlationId: string; count: number; exceptionIds: string[] }) =>
    makeEvent("exception.bulk_resolved", "InvoiceException", id, ctx.companyId, ctx.userId, ctx.correlationId, { count: ctx.count, exceptionIds: ctx.exceptionIds }),
};

// ── Approval Events ──────────────────────────────────────────────────────────

export const approvalEvents = {
  created: (id: string, ctx: { companyId: string; userId: string; correlationId: string; invoiceId: string; levels: number }) =>
    makeEvent("approval.created", "ApprovalChain", id, ctx.companyId, ctx.userId, ctx.correlationId, { invoiceId: ctx.invoiceId, levels: ctx.levels }),

  levelDecided: (id: string, ctx: { companyId: string; userId: string; correlationId: string; level: number; decision: string }) =>
    makeEvent("approval.level.decided", "ApprovalChain", id, ctx.companyId, ctx.userId, ctx.correlationId, { level: ctx.level, decision: ctx.decision }),

  chainApproved: (id: string, ctx: { companyId: string; userId: string; correlationId: string; invoiceId: string }) =>
    makeEvent("approval.chain.approved", "ApprovalChain", id, ctx.companyId, ctx.userId, ctx.correlationId, { invoiceId: ctx.invoiceId }),

  chainRejected: (id: string, ctx: { companyId: string; userId: string; correlationId: string; invoiceId: string }) =>
    makeEvent("approval.chain.rejected", "ApprovalChain", id, ctx.companyId, ctx.userId, ctx.correlationId, { invoiceId: ctx.invoiceId }),

  delegated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; level: number; delegatedTo: string }) =>
    makeEvent("approval.delegated", "ApprovalChain", id, ctx.companyId, ctx.userId, ctx.correlationId, { level: ctx.level, delegatedTo: ctx.delegatedTo }),

  escalated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; level: number; reason: string }) =>
    makeEvent("approval.level.escalated", "ApprovalChain", id, ctx.companyId, ctx.userId, ctx.correlationId, { level: ctx.level, reason: ctx.reason }),

  recalled: (id: string, ctx: { companyId: string; userId: string; correlationId: string; level: number; reason: string }) =>
    makeEvent("approval.recalled", "ApprovalChain", id, ctx.companyId, ctx.userId, ctx.correlationId, { level: ctx.level, reason: ctx.reason }),
};

// ── Payment Events ───────────────────────────────────────────────────────────

export const paymentEvents = {
  proposalGenerated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; invoiceCount: number; totalAmount: number }) =>
    makeEvent("proposal.generated", "PaymentProposal", id, ctx.companyId, ctx.userId, ctx.correlationId, { invoiceCount: ctx.invoiceCount, totalAmount: ctx.totalAmount }),

  proposalReviewed: (id: string, ctx: { companyId: string; userId: string; correlationId: string }) =>
    makeEvent("proposal.reviewed", "PaymentProposal", id, ctx.companyId, ctx.userId, ctx.correlationId, {}),

  proposalApproved: (id: string, ctx: { companyId: string; userId: string; correlationId: string; totalAmount: number }) =>
    makeEvent("proposal.approved", "PaymentProposal", id, ctx.companyId, ctx.userId, ctx.correlationId, { totalAmount: ctx.totalAmount }),

  proposalRejected: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string }) =>
    makeEvent("proposal.rejected", "PaymentProposal", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason }),

  batchCreated: (id: string, ctx: { companyId: string; userId: string; correlationId: string; proposalId: string; paymentCount: number; totalAmount: number }) =>
    makeEvent("batch.created", "PaymentBatch", id, ctx.companyId, ctx.userId, ctx.correlationId, { proposalId: ctx.proposalId, paymentCount: ctx.paymentCount, totalAmount: ctx.totalAmount }),

  submitted: (id: string, ctx: { companyId: string; userId: string; correlationId: string; vendorId: string; amount: number; method: string }) =>
    makeEvent("payment.submitted", "PaymentBatch", id, ctx.companyId, ctx.userId, ctx.correlationId, { vendorId: ctx.vendorId, amount: ctx.amount, method: ctx.method }),

  confirmed: (id: string, ctx: { companyId: string; userId: string; correlationId: string; bankReference: string; amount: number }) =>
    makeEvent("payment.confirmed", "PaymentBatch", id, ctx.companyId, ctx.userId, ctx.correlationId, { bankReference: ctx.bankReference, amount: ctx.amount }),

  reversed: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string; amount: number }) =>
    makeEvent("payment.reversed", "PaymentBatch", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason, amount: ctx.amount }),

  cancelled: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string }) =>
    makeEvent("payment.cancelled", "PaymentBatch", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason }),
};

// ── Reconciliation Events ────────────────────────────────────────────────────

export const reconciliationEvents = {
  imported: (id: string, ctx: { companyId: string; userId: string; correlationId: string; vendorId: string; period: string; lineCount: number }) =>
    makeEvent("reconciliation.imported", "Reconciliation", id, ctx.companyId, ctx.userId, ctx.correlationId, { vendorId: ctx.vendorId, period: ctx.period, lineCount: ctx.lineCount }),

  matched: (id: string, ctx: { companyId: string; userId: string; correlationId: string; matchedCount: number; discrepancyCount: number; variance: number }) =>
    makeEvent("reconciliation.matched", "Reconciliation", id, ctx.companyId, ctx.userId, ctx.correlationId, { matchedCount: ctx.matchedCount, discrepancyCount: ctx.discrepancyCount, variance: ctx.variance }),

  adjusted: (id: string, ctx: { companyId: string; userId: string; correlationId: string; adjustmentCount: number; totalAdjustment: number }) =>
    makeEvent("reconciliation.adjusted", "Reconciliation", id, ctx.companyId, ctx.userId, ctx.correlationId, { adjustmentCount: ctx.adjustmentCount, totalAdjustment: ctx.totalAdjustment }),

  completed: (id: string, ctx: { companyId: string; userId: string; correlationId: string; vendorId: string; period: string; finalVariance: number }) =>
    makeEvent("reconciliation.completed", "Reconciliation", id, ctx.companyId, ctx.userId, ctx.correlationId, { vendorId: ctx.vendorId, period: ctx.period, finalVariance: ctx.finalVariance }),
};

// ── Credit Events ────────────────────────────────────────────────────────────

export const creditEvents = {
  received: (id: string, ctx: { companyId: string; userId: string; correlationId: string; vendorId: string; creditAmount: number; creditNumber: string }) =>
    makeEvent("credit.received", "VendorCredit", id, ctx.companyId, ctx.userId, ctx.correlationId, { vendorId: ctx.vendorId, creditAmount: ctx.creditAmount, creditNumber: ctx.creditNumber }),

  applied: (id: string, ctx: { companyId: string; userId: string; correlationId: string; totalApplied: number; applicationCount: number }) =>
    makeEvent("credit.applied", "VendorCredit", id, ctx.companyId, ctx.userId, ctx.correlationId, { totalApplied: ctx.totalApplied, applicationCount: ctx.applicationCount }),

  partiallyApplied: (id: string, ctx: { companyId: string; userId: string; correlationId: string; totalApplied: number; remaining: number }) =>
    makeEvent("credit.partially_applied", "VendorCredit", id, ctx.companyId, ctx.userId, ctx.correlationId, { totalApplied: ctx.totalApplied, remaining: ctx.remaining }),

  voided: (id: string, ctx: { companyId: string; userId: string; correlationId: string; reason: string; reversedAmount: number }) =>
    makeEvent("credit.voided", "VendorCredit", id, ctx.companyId, ctx.userId, ctx.correlationId, { reason: ctx.reason, reversedAmount: ctx.reversedAmount }),
};
