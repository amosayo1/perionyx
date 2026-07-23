/**
 * Phase 21A.2 — Credit Application Service
 *
 * Handles all 3 credit note lifecycle commands: receive, apply, and void.
 *
 * Pattern: Command → validate context → load from repo → business rules →
 *           save → collect events → collect audit → return ok/fail.
 *
 * Financial precision: All monetary fields use Prisma.Decimal(38,12).
 * Zero native number arithmetic on money.
 */

import crypto from "crypto";
import { Prisma } from "@prisma/client";
import type { VendorCredit, VendorInvoice } from "../ap-repositories/types";
import type { APRepositoryRegistry } from "../ap-repositories/registry";
import type {
  CommandContext,
  CommandResult,
  AuditEntry,
  ReceiveCreditNoteCommand,
  ApplyCreditNoteCommand,
  VoidCreditNoteCommand,
} from "./types";
import { ok, fail } from "./types";
import { creditEvents } from "../domain/events/event-types";
import { toDecimal, sumDecimals } from "@/lib/financial-precision";

type CreditStatus = VendorCredit["status"];

const RECEIVABLE_STATUSES: CreditStatus[] = ["ISSUED", "PARTIALLY_APPLIED"] as CreditStatus[];

export class CreditApplicationService {
  constructor(private readonly repos: APRepositoryRegistry) {}

  // ── 1. Receive Credit Note ──────────────────────────────────────────────

  async receiveCreditNote(
    cmd: ReceiveCreditNoteCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<VendorCredit>> {
    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }

    const existing = await this.repos.credit.findByCreditNumber(
      cmd.creditNumber,
      cmd.vendorId,
      ctx.companyId,
    );
    if (existing) {
      return fail(
        "CONFLICT",
        `Credit note ${cmd.creditNumber} already exists for this vendor`,
        409,
      );
    }

    const creditAmount = toDecimal(cmd.creditAmount);
    if (creditAmount.lte(0)) {
      return fail("VALIDATION_ERROR", "Credit amount must be greater than zero", 400);
    }

    if (!cmd.reason || cmd.reason.length < 10) {
      return fail(
        "VALIDATION_ERROR",
        "Credit reason is mandatory and must be at least 10 characters",
        400,
      );
    }

    if (cmd.relatedInvoiceId) {
      const invoice = await this.repos.invoice.findById(cmd.relatedInvoiceId, ctx.companyId);
      if (!invoice) {
        return fail("NOT_FOUND", "Related invoice not found", 404);
      }
      if (invoice.vendorId !== cmd.vendorId) {
        return fail(
          "VALIDATION_ERROR",
          "Related invoice does not belong to the same vendor",
          400,
        );
      }
    }

    const now = new Date().toISOString();
    const creditId = crypto.randomUUID();

    const credit: VendorCredit = {
      id: creditId,
      companyId: ctx.companyId,
      vendorId: cmd.vendorId,
      creditNumber: cmd.creditNumber,
      creditDate: cmd.creditDate.toISOString(),
      creditAmount: creditAmount.toNumber(),
      appliedAmount: 0,
      currency: cmd.currency ?? "USD",
      status: "ISSUED" as CreditStatus,
      appliedToInvoiceId: cmd.relatedInvoiceId ?? null,
      expiryDate: null,
      reason: cmd.reason,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      version: 1,
    };

    await this.repos.credit.save(credit);

    const event = creditEvents.received(creditId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      vendorId: cmd.vendorId,
      creditAmount: creditAmount.toNumber(),
      creditNumber: cmd.creditNumber,
    });

    const audit: AuditEntry = {
      action: "credit.received",
      resourceType: "VendorCredit",
      resourceId: creditId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: {
        creditNumber: cmd.creditNumber,
        vendorId: cmd.vendorId,
        creditAmount: creditAmount.toNumber(),
        currency: credit.currency,
        relatedInvoiceId: cmd.relatedInvoiceId ?? null,
      },
      severity: "INFO",
    };

    return ok(credit, [event], [audit]);
  }

  // ── 2. Apply Credit Note ────────────────────────────────────────────────

  async applyCreditNote(
    cmd: ApplyCreditNoteCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<VendorCredit>> {
    const credit = await this.repos.credit.findById(cmd.creditId, ctx.companyId);
    if (!credit) {
      return fail("NOT_FOUND", "Credit note not found", 404);
    }

    if (!RECEIVABLE_STATUSES.includes(credit.status)) {
      return fail(
        "INVALID_STATE",
        `Cannot apply credit note in ${credit.status} status. Must be ISSUED or PARTIALLY_APPLIED.`,
        400,
      );
    }

    if (!cmd.applications || cmd.applications.length === 0) {
      return fail("VALIDATION_ERROR", "At least one application is required", 400);
    }

    const creditAmount = toDecimal(credit.creditAmount);
    const appliedAmount = toDecimal(credit.appliedAmount);
    const remainingBalance = creditAmount.minus(appliedAmount);

    const totalRequested = sumDecimals(cmd.applications.map((a) => a.amount));
    if (totalRequested.gt(remainingBalance)) {
      return fail(
        "VALIDATION_ERROR",
        `Total application amount (${totalRequested.toString()}) exceeds remaining credit balance (${remainingBalance.toString()})`,
        400,
      );
    }

    const invoicesToUpdate: VendorInvoice[] = [];
    for (const application of cmd.applications) {
      const invoice = await this.repos.invoice.findById(application.invoiceId, ctx.companyId);
      if (!invoice) {
        return fail("NOT_FOUND", `Invoice ${application.invoiceId} not found`, 404);
      }
      if (invoice.vendorId !== credit.vendorId) {
        return fail(
          "VALIDATION_ERROR",
          `Invoice ${invoice.invoiceNumber} does not belong to the same vendor as the credit note`,
          400,
        );
      }
      if (invoice.currency !== credit.currency) {
        return fail(
          "VALIDATION_ERROR",
          `Invoice currency ${invoice.currency} does not match credit currency ${credit.currency}`,
          400,
        );
      }

      const applicationAmount = toDecimal(application.amount);
      if (applicationAmount.lte(0)) {
        return fail("VALIDATION_ERROR", "Application amount must be greater than zero", 400);
      }

      const invoiceOutstanding = toDecimal(invoice.balanceDue);
      if (applicationAmount.gt(invoiceOutstanding)) {
        return fail(
          "VALIDATION_ERROR",
          `Application amount (${applicationAmount.toString()}) exceeds invoice outstanding balance (${invoiceOutstanding.toString()}) for invoice ${invoice.invoiceNumber}`,
          400,
        );
      }

      invoicesToUpdate.push(invoice);
    }

    const newAppliedAmount = appliedAmount.plus(totalRequested);
    const isFullyApplied = newAppliedAmount.gte(creditAmount);

    credit.appliedAmount = newAppliedAmount.toNumber();
    credit.status = isFullyApplied ? "FULLY_APPLIED" as CreditStatus : "PARTIALLY_APPLIED" as CreditStatus;
    credit.updatedAt = new Date().toISOString();
    credit.updatedBy = ctx.userId;
    credit.version += 1;

    await this.repos.credit.save(credit);

    for (let i = 0; i < cmd.applications.length; i++) {
      const application = cmd.applications[i];
      const invoice = invoicesToUpdate[i];
      const applicationAmount = toDecimal(application.amount);

      invoice.balanceDue = applicationAmount.minus(toDecimal(invoice.balanceDue)).negated().toNumber();
      invoice.creditApplied = toDecimal(invoice.creditApplied).plus(applicationAmount).toNumber();
      invoice.updatedAt = new Date().toISOString();
      invoice.updatedBy = ctx.userId;
      invoice.version += 1;

      await this.repos.invoice.save(invoice);
    }

    const remaining = creditAmount.minus(newAppliedAmount);
    const event = isFullyApplied
      ? creditEvents.applied(credit.id, {
          companyId: ctx.companyId,
          userId: ctx.userId,
          correlationId: ctx.correlationId,
          totalApplied: totalRequested.toNumber(),
          applicationCount: cmd.applications.length,
        })
      : creditEvents.partiallyApplied(credit.id, {
          companyId: ctx.companyId,
          userId: ctx.userId,
          correlationId: ctx.correlationId,
          totalApplied: totalRequested.toNumber(),
          remaining: remaining.toNumber(),
        });

    const audit: AuditEntry = {
      action: isFullyApplied ? "credit.applied" : "credit.partially_applied",
      resourceType: "VendorCredit",
      resourceId: credit.id,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: {
        totalApplied: totalRequested.toNumber(),
        applicationCount: cmd.applications.length,
        invoiceIds: cmd.applications.map((a) => a.invoiceId),
        previousStatus: isFullyApplied ? "ISSUED" : "PARTIALLY_APPLIED",
        newStatus: credit.status,
        remaining: remaining.toNumber(),
      },
      severity: "INFO",
    };

    return ok(credit, [event], [audit]);
  }

  // ── 3. Void Credit Note ─────────────────────────────────────────────────

  async voidCreditNote(
    cmd: VoidCreditNoteCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<VendorCredit>> {
    const credit = await this.repos.credit.findById(cmd.creditId, ctx.companyId);
    if (!credit) {
      return fail("NOT_FOUND", "Credit note not found", 404);
    }

    const VOIDABLE_STATUSES: CreditStatus[] = ["ISSUED", "PARTIALLY_APPLIED", "FULLY_APPLIED"];
    if (!VOIDABLE_STATUSES.includes(credit.status)) {
      return fail(
        "INVALID_STATE",
        `Cannot void credit note in ${credit.status} status. Must be ISSUED, PARTIALLY_APPLIED, or FULLY_APPLIED.`,
        400,
      );
    }

    if (!cmd.reason || cmd.reason.length < 20) {
      return fail(
        "VALIDATION_ERROR",
        "Void reason is mandatory and must be at least 20 characters",
        400,
      );
    }

    const reversedAmount = toDecimal(credit.appliedAmount);

    if (reversedAmount.gt(0)) {
      const appliedInvoices = await this.repos.invoice.findByFilter(
        { companyId: ctx.companyId, vendorId: credit.vendorId },
      );

      for (const invoice of appliedInvoices.items) {
        if (invoice.creditApplied > 0) {
          const creditOnInvoice = toDecimal(invoice.creditApplied);
          invoice.balanceDue = toDecimal(invoice.balanceDue).plus(creditOnInvoice).toNumber();
          invoice.creditApplied = 0;
          invoice.updatedAt = new Date().toISOString();
          invoice.updatedBy = ctx.userId;
          invoice.version += 1;

          await this.repos.invoice.save(invoice);
        }
      }

      credit.appliedAmount = 0;
      credit.appliedToInvoiceId = null;
    }

    const previousStatus = credit.status;
    credit.status = "EXPIRED" as CreditStatus;
    credit.updatedAt = new Date().toISOString();
    credit.updatedBy = ctx.userId;
    credit.version += 1;

    await this.repos.credit.save(credit);

    const event = creditEvents.voided(credit.id, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      reason: cmd.reason,
      reversedAmount: reversedAmount.toNumber(),
    });

    const audit: AuditEntry = {
      action: "credit.voided",
      resourceType: "VendorCredit",
      resourceId: credit.id,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: {
        previousStatus,
        reason: cmd.reason,
        reversedAmount: reversedAmount.toNumber(),
        terminal: true,
      },
      severity: "WARNING",
    };

    return ok(credit, [event], [audit]);
  }
}
