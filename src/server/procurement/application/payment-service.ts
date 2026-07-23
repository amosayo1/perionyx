/**
 * Phase 21A.2 — Payment Application Service
 *
 * Orchestrates the full payment lifecycle: proposal generation → review →
 * approval → batch creation → execution → confirmation, plus reversal
 * and cancellation safety valves.
 *
 * Every command follows: validate → load → business rules → save → events → audit → return
 * Financial precision: ALL monetary arithmetic via financial-precision.ts helpers.
 */

import crypto from "crypto";
import { Prisma } from "@prisma/client";

import type { APRepositoryRegistry } from "../ap-repositories/registry";
import type {
  PaymentProposal,
  PaymentProposalItem,
  PaymentBatch,
  PaymentRecord,
  VendorInvoice,
  VendorInvoiceStatus,
  PaymentBatchStatus,
  PaymentRecordStatus,
  PaymentProposalStatus,
} from "../ap-repositories/types";

import {
  paymentEvents,
} from "../domain/events/event-types";

import type {
  CommandContext,
  CommandResult,
  DomainEvent,
  AuditEntry,
  GeneratePaymentProposalCommand,
  ApprovePaymentProposalCommand,
  RejectPaymentProposalCommand,
  CreatePaymentBatchCommand,
  ExecutePaymentCommand,
  ConfirmPaymentCommand,
  ReversePaymentCommand,
  CancelPaymentCommand,
} from "./types";

import { ok, fail } from "./types";
import { toDecimal, sumDecimals, financialRound } from "@/lib/financial-precision";

// ── Helpers ──────────────────────────────────────────────────────────────────

function auditEntry(
  action: string,
  resourceType: string,
  resourceId: string,
  ctx: CommandContext,
  metadata: Record<string, unknown> = {},
  severity: AuditEntry["severity"] = "INFO",
): AuditEntry {
  return {
    action,
    resourceType,
    resourceId,
    actorId: ctx.userId,
    companyId: ctx.companyId,
    metadata,
    severity,
  };
}

function proposalNumber(): string {
  const d = new Date();
  const ts = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `PROP-${ts}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function batchNumber(): string {
  const d = new Date();
  const ts = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `BATCH-${ts}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function payNumber(): string {
  return `PAY-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
}

/** Days between two ISO date strings. */
function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

// ── Service ──────────────────────────────────────────────────────────────────

export class PaymentApplicationService {
  constructor(private readonly repos: APRepositoryRegistry) {}

  // ── 1. Generate Payment Proposal ───────────────────────────────────────────

  async generatePaymentProposal(
    cmd: GeneratePaymentProposalCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentProposal>> {
    if (!cmd.paymentDate) {
      return fail("VALIDATION_ERROR", "paymentDate is required", 400);
    }

    const paymentDateStr = cmd.paymentDate.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    // Load approved unscheduled invoices with dueDate <= paymentDate
    const approvedInvoices = await this.repos.invoice.findApprovedUnscheduled(ctx.companyId);

    let eligible = approvedInvoices.filter(
      (inv) => inv.dueDate <= paymentDateStr && inv.balanceDue > 0,
    );

    // Filter by vendorIds if provided
    if (cmd.vendorIds && cmd.vendorIds.length > 0) {
      const vendorSet = new Set(cmd.vendorIds);
      eligible = eligible.filter((inv) => vendorSet.has(inv.vendorId));
    }

    if (eligible.length === 0) {
      return fail("NOT_FOUND", "No eligible invoices found for payment proposal", 404);
    }

    // Prioritize early-pay discount invoices (discount within 5 days)
    eligible.sort((a, b) => {
      const aDays = daysBetween(today, a.dueDate);
      const bDays = daysBetween(today, b.dueDate);
      const aDiscountEligible = aDays <= 5 && a.discountAmount > 0 ? 0 : 1;
      const bDiscountEligible = bDays <= 5 && b.discountAmount > 0 ? 0 : 1;
      if (aDiscountEligible !== bDiscountEligible) return aDiscountEligible - bDiscountEligible;
      return a.dueDate.localeCompare(b.dueDate);
    });

    // Apply maxAmount cap if provided
    if (cmd.maxAmount) {
      let runningTotal = toDecimal(0);
      const maxDec = toDecimal(cmd.maxAmount);
      eligible = eligible.filter((inv) => {
        if (runningTotal.gte(maxDec)) return false;
        runningTotal = runningTotal.add(toDecimal(inv.balanceDue));
        return true;
      });
    }

    if (eligible.length === 0) {
      return fail("NOT_FOUND", "No eligible invoices found after maxAmount filter", 404);
    }

    // Group by vendor for metadata
    const byVendor = new Map<string, VendorInvoice[]>();
    for (const inv of eligible) {
      const list = byVendor.get(inv.vendorId) ?? [];
      list.push(inv);
      byVendor.set(inv.vendorId, list);
    }

    // Build proposal items
    let totalAmount = toDecimal(0);
    let priority = 1;
    const items: PaymentProposalItem[] = [];
    const proposalId = crypto.randomUUID();

    for (const inv of eligible) {
      const discountTaken = toDecimal(inv.discountAmount);
      const creditApplied = toDecimal(inv.creditApplied);
      const netPayment = toDecimal(inv.balanceDue).sub(discountTaken).sub(creditApplied);

      items.push({
        id: crypto.randomUUID(),
        companyId: ctx.companyId,
        paymentProposalId: proposalId,
        vendorInvoiceId: inv.id,
        vendorId: inv.vendorId,
        amount: financialRound(toDecimal(inv.balanceDue).toNumber(), 2),
        discountTaken: financialRound(discountTaken.toNumber(), 2),
        creditApplied: financialRound(creditApplied.toNumber(), 2),
        netPayment: financialRound(netPayment.toNumber(), 2),
        paymentPriority: priority++,
        selectedBy: discountTaken.gt(0) ? "DISCOUNT_OPTIMIZED" : "AUTO",
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      });

      totalAmount = totalAmount.add(netPayment);
    }

    const proposal: PaymentProposal = {
      id: proposalId,
      companyId: ctx.companyId,
      proposalNumber: proposalNumber(),
      proposalDate: today,
      paymentDate: paymentDateStr,
      currency: "USD",
      totalAmount: financialRound(totalAmount.toNumber(), 2),
      totalInvoices: items.length,
      totalVendors: byVendor.size,
      paymentMethod: "ACH",
      prioritizeDiscounts: true,
      includePartialPayments: false,
      status: "DRAFT",
      submittedBy: null,
      submittedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      version: 1,
    };

    await this.repos.paymentProposal.save(proposal);
    await this.repos.paymentProposal.saveItems(items);

    const events: DomainEvent[] = [
      paymentEvents.proposalGenerated(proposalId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        invoiceCount: items.length,
        totalAmount: totalAmount.toNumber(),
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.proposal.generated", "PaymentProposal", proposalId, ctx, {
        proposalNumber: proposal.proposalNumber,
        invoiceCount: items.length,
        vendorCount: byVendor.size,
        totalAmount: totalAmount.toNumber(),
        paymentDate: paymentDateStr,
      }),
    ];

    return ok(proposal, events, audits);
  }

  // ── 2. Review Payment Proposal ─────────────────────────────────────────────

  async reviewPaymentProposal(
    cmd: { proposalId: string; notes?: string },
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentProposal>> {
    if (!cmd.proposalId) {
      return fail("VALIDATION_ERROR", "proposalId is required", 400);
    }

    const proposal = await this.repos.paymentProposal.findById(cmd.proposalId, ctx.companyId);
    if (!proposal) {
      return fail("NOT_FOUND", "Payment proposal not found", 404);
    }

    if (proposal.status !== "DRAFT") {
      return fail(
        "CONFLICT",
        `Proposal must be in DRAFT status to review. Current status: ${proposal.status}`,
        409,
      );
    }

    const now = new Date().toISOString();
    proposal.status = "REVIEWED";
    proposal.reviewedBy = ctx.userId;
    proposal.reviewedAt = now;
    proposal.updatedBy = ctx.userId;
    proposal.updatedAt = now;
    proposal.version += 1;

    await this.repos.paymentProposal.save(proposal);

    const events: DomainEvent[] = [
      paymentEvents.proposalReviewed(proposal.id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.proposal.reviewed", "PaymentProposal", proposal.id, ctx, {
        proposalNumber: proposal.proposalNumber,
        notes: cmd.notes,
      }),
    ];

    return ok(proposal, events, audits);
  }

  // ── 3. Approve Payment Proposal ────────────────────────────────────────────

  async approvePaymentProposal(
    cmd: ApprovePaymentProposalCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentProposal>> {
    if (!cmd.proposalId) {
      return fail("VALIDATION_ERROR", "proposalId is required", 400);
    }

    const proposal = await this.repos.paymentProposal.findById(cmd.proposalId, ctx.companyId);
    if (!proposal) {
      return fail("NOT_FOUND", "Payment proposal not found", 404);
    }

    if (proposal.status !== "REVIEWED") {
      return fail(
        "CONFLICT",
        `Proposal must be in REVIEWED status to approve. Current status: ${proposal.status}`,
        409,
      );
    }

    // SoD: creator != approver
    if (proposal.createdBy === ctx.userId) {
      return fail(
        "FORBIDDEN",
        "Creator of a proposal cannot approve it (segregation of duties)",
        403,
      );
    }

    // Amount authority: < $100K → AP Manager, $100K–$500K → Controller, > $500K → CFO
    const total = toDecimal(proposal.totalAmount);
    const threshold100K = toDecimal(100_000);
    const threshold500K = toDecimal(500_000);
    let requiredRole: string;
    if (total.gte(threshold500K)) {
      requiredRole = "CFO";
    } else if (total.gte(threshold100K)) {
      requiredRole = "CONTROLLER";
    } else {
      requiredRole = "AP_MANAGER";
    }

    const now = new Date().toISOString();
    proposal.status = "APPROVED";
    proposal.approvedBy = ctx.userId;
    proposal.approvedAt = now;
    proposal.updatedBy = ctx.userId;
    proposal.updatedAt = now;
    proposal.version += 1;

    await this.repos.paymentProposal.save(proposal);

    const events: DomainEvent[] = [
      paymentEvents.proposalApproved(proposal.id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        totalAmount: total.toNumber(),
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.proposal.approved", "PaymentProposal", proposal.id, ctx, {
        proposalNumber: proposal.proposalNumber,
        totalAmount: total.toNumber(),
        requiredRole,
        comments: cmd.comments,
      }),
    ];

    return ok(proposal, events, audits);
  }

  // ── 4. Reject Payment Proposal ─────────────────────────────────────────────

  async rejectPaymentProposal(
    cmd: RejectPaymentProposalCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentProposal>> {
    if (!cmd.proposalId) {
      return fail("VALIDATION_ERROR", "proposalId is required", 400);
    }
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail("VALIDATION_ERROR", "Rejection reason is mandatory and must be at least 10 characters", 400);
    }

    const proposal = await this.repos.paymentProposal.findById(cmd.proposalId, ctx.companyId);
    if (!proposal) {
      return fail("NOT_FOUND", "Payment proposal not found", 404);
    }

    if (proposal.status !== "REVIEWED") {
      return fail(
        "CONFLICT",
        `Proposal must be in REVIEWED status to reject. Current status: ${proposal.status}`,
        409,
      );
    }

    const now = new Date().toISOString();
    proposal.status = "REJECTED";
    proposal.rejectedBy = ctx.userId;
    proposal.rejectionReason = cmd.reason;
    proposal.updatedBy = ctx.userId;
    proposal.updatedAt = now;
    proposal.version += 1;

    await this.repos.paymentProposal.save(proposal);

    const events: DomainEvent[] = [
      paymentEvents.proposalRejected(proposal.id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        reason: cmd.reason,
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.proposal.rejected", "PaymentProposal", proposal.id, ctx, {
        proposalNumber: proposal.proposalNumber,
        reason: cmd.reason,
      }, "WARNING"),
    ];

    return ok(proposal, events, audits);
  }

  // ── 5. Create Payment Batch ────────────────────────────────────────────────

  async createPaymentBatch(
    cmd: CreatePaymentBatchCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentBatch>> {
    if (!cmd.proposalId) {
      return fail("VALIDATION_ERROR", "proposalId is required", 400);
    }

    const proposal = await this.repos.paymentProposal.findById(cmd.proposalId, ctx.companyId);
    if (!proposal) {
      return fail("NOT_FOUND", "Payment proposal not found", 404);
    }

    if (proposal.status !== "APPROVED") {
      return fail(
        "CONFLICT",
        `Proposal must be in APPROVED status to create a batch. Current status: ${proposal.status}`,
        409,
      );
    }

    const existingBatch = await this.repos.paymentBatch.findByProposalId(proposal.id, ctx.companyId);
    if (existingBatch) {
      return fail(
        "CONFLICT",
        `A payment batch already exists for this proposal: ${existingBatch.batchNumber}`,
        409,
      );
    }

    const proposalItems = await this.repos.paymentProposal.getItems(proposal.id, ctx.companyId);
    if (proposalItems.length === 0) {
      return fail("CONFLICT", "Proposal has no items to pay", 409);
    }

    const batchId = crypto.randomUUID();
    const totalAmount = sumDecimals(proposalItems.map((i) => i.netPayment));

    const batch: PaymentBatch = {
      id: batchId,
      companyId: ctx.companyId,
      batchNumber: batchNumber(),
      paymentProposalId: proposal.id,
      paymentMethod: proposal.paymentMethod,
      bankAccountId: "DEFAULT_BANK",
      totalPayments: proposalItems.length,
      totalAmount: financialRound(totalAmount.toNumber(), 2),
      totalFees: 0,
      netDisbursement: financialRound(totalAmount.toNumber(), 2),
      fileUrl: null,
      fileName: null,
      status: "PENDING" as PaymentBatchStatus,
      submittedAt: null,
      completedAt: null,
      confirmedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      version: 1,
    };

    await this.repos.paymentBatch.save(batch);

    const paymentRecords: PaymentRecord[] = [];
    for (const item of proposalItems) {
      const record: PaymentRecord = {
        id: crypto.randomUUID(),
        companyId: ctx.companyId,
        paymentNumber: payNumber(),
        paymentBatchId: batchId,
        vendorInvoiceId: item.vendorInvoiceId,
        vendorId: item.vendorId,
        paymentDate: proposal.paymentDate,
        amount: item.amount,
        discountTaken: item.discountTaken,
        creditApplied: item.creditApplied,
        netPayment: item.netPayment,
        currency: proposal.currency,
        exchangeRate: 1,
        baseCurrencyAmount: item.netPayment,
        paymentMethod: proposal.paymentMethod,
        bankAccountId: batch.bankAccountId,
        transactionReference: null,
        checkNumber: null,
        status: "PROCESSED" as PaymentRecordStatus,
        glPosted: false,
        glPostedAt: null,
        glReversalPosted: false,
        idempotencyKey: crypto.randomUUID(),
        voidedAt: null,
        voidedBy: null,
        voidReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        version: 1,
      };

      await this.repos.paymentBatch.savePaymentRecord(record);
      paymentRecords.push(record);
    }

    const now = new Date().toISOString();
    proposal.status = "EXECUTED";
    proposal.updatedBy = ctx.userId;
    proposal.updatedAt = now;
    proposal.version += 1;
    await this.repos.paymentProposal.save(proposal);

    const events: DomainEvent[] = [
      paymentEvents.batchCreated(batchId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        proposalId: proposal.id,
        paymentCount: paymentRecords.length,
        totalAmount: totalAmount.toNumber(),
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.batch.created", "PaymentBatch", batchId, ctx, {
        batchNumber: batch.batchNumber,
        proposalNumber: proposal.proposalNumber,
        paymentCount: paymentRecords.length,
        totalAmount: totalAmount.toNumber(),
      }),
    ];

    return ok(batch, events, audits);
  }

  // ── 6. Execute Payment ─────────────────────────────────────────────────────

  async executePayment(
    cmd: ExecutePaymentCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentRecord>> {
    if (!cmd.batchId || !cmd.paymentId) {
      return fail("VALIDATION_ERROR", "batchId and paymentId are required", 400);
    }

    const batch = await this.repos.paymentBatch.findById(cmd.batchId, ctx.companyId);
    if (!batch) {
      return fail("NOT_FOUND", "Payment batch not found", 404);
    }

    // Batch must be ready or pending
    const validBatchStatuses: PaymentBatchStatus[] = ["READY", "PENDING"];
    if (!validBatchStatuses.includes(batch.status)) {
      return fail(
        "CONFLICT",
        `Batch must be in PENDING or READY status to execute. Current status: ${batch.status}`,
        409,
      );
    }

    const payment = await this.repos.paymentBatch.findPaymentRecordById(cmd.paymentId, ctx.companyId);
    if (!payment) {
      return fail("NOT_FOUND", "Payment record not found", 404);
    }

    if (payment.paymentBatchId !== batch.id) {
      return fail("VALIDATION_ERROR", "Payment does not belong to the specified batch", 400);
    }

    if (payment.status !== "PROCESSED") {
      return fail(
        "CONFLICT",
        `Payment must be in PROCESSED status to execute. Current status: ${payment.status}`,
        409,
      );
    }

    // Idempotency check
    if (payment.idempotencyKey) {
      const existing = await this.repos.paymentBatch.findByIdempotencyKey(
        payment.idempotencyKey,
        ctx.companyId,
      );
      if (existing && existing.id !== payment.id) {
        return ok(existing);
      }
    }

    // Double-payment check: no other pending/completed for same invoice
    const existingPayment = await this.repos.paymentBatch.findByInvoiceId(
      payment.vendorInvoiceId,
      ctx.companyId,
    );
    if (existingPayment && existingPayment.id !== payment.id) {
      const blockingStatuses: PaymentRecordStatus[] = ["PROCESSED", "CLEARED"];
      if (blockingStatuses.includes(existingPayment.status)) {
        return fail(
          "CONFLICT",
          `Invoice already has a pending/completed payment: ${existingPayment.paymentNumber}`,
          409,
        );
      }
    }

    const now = new Date().toISOString();
    payment.status = "CLEARED" as PaymentRecordStatus;
    payment.updatedBy = ctx.userId;
    payment.updatedAt = now;
    payment.version += 1;

    await this.repos.paymentBatch.savePaymentRecord(payment);

    const events: DomainEvent[] = [
      paymentEvents.submitted(batch.id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        vendorId: payment.vendorId,
        amount: payment.netPayment,
        method: payment.paymentMethod,
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.submitted", "PaymentBatch", batch.id, ctx, {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        vendorInvoiceId: payment.vendorInvoiceId,
        amount: payment.netPayment,
      }),
    ];

    return ok(payment, events, audits);
  }

  // ── 7. Confirm Payment ─────────────────────────────────────────────────────

  async confirmPayment(
    cmd: ConfirmPaymentCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentRecord>> {
    if (!cmd.batchId || !cmd.paymentId) {
      return fail("VALIDATION_ERROR", "batchId and paymentId are required", 400);
    }
    if (!cmd.bankReference || cmd.bankReference.trim().length === 0) {
      return fail("VALIDATION_ERROR", "bankReference is mandatory", 400);
    }

    const batch = await this.repos.paymentBatch.findById(cmd.batchId, ctx.companyId);
    if (!batch) {
      return fail("NOT_FOUND", "Payment batch not found", 404);
    }

    const payment = await this.repos.paymentBatch.findPaymentRecordById(cmd.paymentId, ctx.companyId);
    if (!payment) {
      return fail("NOT_FOUND", "Payment record not found", 404);
    }

    if (payment.paymentBatchId !== batch.id) {
      return fail("VALIDATION_ERROR", "Payment does not belong to the specified batch", 400);
    }

    const confirmableStatuses: PaymentRecordStatus[] = ["PROCESSED", "CLEARED"];
    if (!confirmableStatuses.includes(payment.status)) {
      return fail(
        "CONFLICT",
        `Payment must be in PROCESSED or CLEARED status to confirm. Current status: ${payment.status}`,
        409,
      );
    }

    const now = new Date().toISOString();
    payment.status = "CLEARED";
    payment.transactionReference = cmd.bankReference.trim();
    payment.updatedBy = ctx.userId;
    payment.updatedAt = now;
    payment.version += 1;

    await this.repos.paymentBatch.savePaymentRecord(payment);

    // Update invoice status → PAID
    const invoice = await this.repos.invoice.findById(payment.vendorInvoiceId, ctx.companyId);
    if (invoice) {
      const newAmountPaid = financialRound(
        toDecimal(invoice.amountPaid).add(toDecimal(payment.netPayment)).toNumber(),
        2,
      );
      const newBalance = financialRound(
        toDecimal(invoice.totalWithTax).sub(toDecimal(newAmountPaid)).toNumber(),
        2,
      );

      invoice.amountPaid = newAmountPaid;
      invoice.balanceDue = Math.max(0, newBalance);
      invoice.status = newBalance <= 0 ? "PAID" : "PARTIALLY_PAID";
      invoice.paymentBatchId = batch.id;
      invoice.paymentDate = payment.paymentDate;
      invoice.paymentReference = cmd.bankReference.trim();
      invoice.updatedBy = ctx.userId;
      invoice.updatedAt = now;
      invoice.version += 1;

      await this.repos.invoice.save(invoice);
    }

    // Check if all payments in batch confirmed → batch status COMPLETED
    const allPayments = await this.repos.paymentBatch.getPaymentRecords(batch.id, ctx.companyId);
    const allConfirmed = allPayments.every(
      (p) => p.status === "CLEARED" || p.id === payment.id,
    );
    if (allConfirmed) {
      batch.status = "COMPLETED";
      batch.completedAt = now;
      batch.confirmedBy = ctx.userId;
      batch.updatedBy = ctx.userId;
      batch.updatedAt = now;
      batch.version += 1;
      await this.repos.paymentBatch.save(batch);
    }

    const events: DomainEvent[] = [
      paymentEvents.confirmed(batch.id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        bankReference: cmd.bankReference.trim(),
        amount: payment.netPayment,
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.confirmed", "PaymentBatch", batch.id, ctx, {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        vendorInvoiceId: payment.vendorInvoiceId,
        bankReference: cmd.bankReference.trim(),
        confirmationNumber: cmd.confirmationNumber,
        amount: payment.netPayment,
        batchCompleted: allConfirmed,
      }),
    ];

    return ok(payment, events, audits);
  }

  // ── 8. Reverse Payment ─────────────────────────────────────────────────────

  async reversePayment(
    cmd: ReversePaymentCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentRecord>> {
    if (!cmd.batchId || !cmd.paymentId) {
      return fail("VALIDATION_ERROR", "batchId and paymentId are required", 400);
    }
    if (!cmd.reason || cmd.reason.length < 20) {
      return fail("VALIDATION_ERROR", "Reversal reason is mandatory and must be at least 20 characters", 400);
    }

    const batch = await this.repos.paymentBatch.findById(cmd.batchId, ctx.companyId);
    if (!batch) {
      return fail("NOT_FOUND", "Payment batch not found", 404);
    }

    const payment = await this.repos.paymentBatch.findPaymentRecordById(cmd.paymentId, ctx.companyId);
    if (!payment) {
      return fail("NOT_FOUND", "Payment record not found", 404);
    }

    if (payment.paymentBatchId !== batch.id) {
      return fail("VALIDATION_ERROR", "Payment does not belong to the specified batch", 400);
    }

    const reversibleStatuses: PaymentRecordStatus[] = ["CLEARED", "PROCESSED"];
    if (!reversibleStatuses.includes(payment.status)) {
      return fail(
        "CONFLICT",
        `Payment must be in CLEARED or PROCESSED status to reverse. Current status: ${payment.status}`,
        409,
      );
    }

    const now = new Date().toISOString();
    payment.status = "REVERSED";
    payment.voidedAt = now;
    payment.voidedBy = ctx.userId;
    payment.voidReason = cmd.reason;
    payment.updatedBy = ctx.userId;
    payment.updatedAt = now;
    payment.version += 1;

    await this.repos.paymentBatch.savePaymentRecord(payment);

    // Restore invoice → APPROVED
    const invoice = await this.repos.invoice.findById(payment.vendorInvoiceId, ctx.companyId);
    if (invoice) {
      const restoredAmountPaid = Math.max(
        0,
        financialRound(
          toDecimal(invoice.amountPaid).sub(toDecimal(payment.netPayment)).toNumber(),
          2,
        ),
      );

      invoice.amountPaid = restoredAmountPaid;
      invoice.balanceDue = financialRound(
        toDecimal(invoice.totalWithTax).sub(toDecimal(invoice.amountPaid)).toNumber(),
        2,
      );
      invoice.status = "APPROVED" as VendorInvoiceStatus;
      invoice.paymentBatchId = null;
      invoice.paymentDate = null;
      invoice.paymentReference = null;
      invoice.updatedBy = ctx.userId;
      invoice.updatedAt = now;
      invoice.version += 1;

      await this.repos.invoice.save(invoice);
    }

    const events: DomainEvent[] = [
      paymentEvents.reversed(batch.id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        reason: cmd.reason,
        amount: payment.netPayment,
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.reversed", "PaymentBatch", batch.id, ctx, {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        vendorInvoiceId: payment.vendorInvoiceId,
        reason: cmd.reason,
        amount: payment.netPayment,
      }, "WARNING"),
    ];

    return ok(payment, events, audits);
  }

  // ── 9. Cancel Payment ──────────────────────────────────────────────────────

  async cancelPayment(
    cmd: CancelPaymentCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<PaymentRecord>> {
    if (!cmd.batchId || !cmd.paymentId) {
      return fail("VALIDATION_ERROR", "batchId and paymentId are required", 400);
    }
    if (!cmd.reason || cmd.reason.trim().length === 0) {
      return fail("VALIDATION_ERROR", "Cancellation reason is mandatory", 400);
    }

    const batch = await this.repos.paymentBatch.findById(cmd.batchId, ctx.companyId);
    if (!batch) {
      return fail("NOT_FOUND", "Payment batch not found", 404);
    }

    const payment = await this.repos.paymentBatch.findPaymentRecordById(cmd.paymentId, ctx.companyId);
    if (!payment) {
      return fail("NOT_FOUND", "Payment record not found", 404);
    }

    if (payment.paymentBatchId !== batch.id) {
      return fail("VALIDATION_ERROR", "Payment does not belong to the specified batch", 400);
    }

    if (payment.status !== "PROCESSED") {
      return fail(
        "CONFLICT",
        `Payment must be in PROCESSED status to cancel. Current status: ${payment.status}`,
        409,
      );
    }

    const now = new Date().toISOString();
    payment.status = "VOIDED";
    payment.voidedAt = now;
    payment.voidedBy = ctx.userId;
    payment.voidReason = cmd.reason;
    payment.updatedBy = ctx.userId;
    payment.updatedAt = now;
    payment.version += 1;

    await this.repos.paymentBatch.savePaymentRecord(payment);

    // Restore invoice → APPROVED
    const invoice = await this.repos.invoice.findById(payment.vendorInvoiceId, ctx.companyId);
    if (invoice) {
      invoice.status = "APPROVED" as VendorInvoiceStatus;
      invoice.paymentBatchId = null;
      invoice.updatedBy = ctx.userId;
      invoice.updatedAt = now;
      invoice.version += 1;

      await this.repos.invoice.save(invoice);
    }

    const events: DomainEvent[] = [
      paymentEvents.cancelled(batch.id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        reason: cmd.reason,
      }),
    ];

    const audits: AuditEntry[] = [
      auditEntry("payment.cancelled", "PaymentBatch", batch.id, ctx, {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        vendorInvoiceId: payment.vendorInvoiceId,
        reason: cmd.reason,
      }, "WARNING"),
    ];

    return ok(payment, events, audits);
  }
}
