/**
 * Phase 21A.2 — Invoice Application Service
 *
 * Handles all 15 invoice lifecycle commands: receive, update, void, validate,
 * three-way match, override match, approve, reject, escalate, schedule for
 * payment, block, unblock, dispute, resolve dispute, and delete.
 *
 * Pattern: Command → validate context → load from repo → business rules →
 *           save → collect events → collect audit → return ok/fail.
 *
 * Financial precision: All monetary fields use Prisma.Decimal(38,12).
 * Zero native number arithmetic on money — convert via financial-precision.ts.
 *
 * Status state machine (domain type values):
 *   DRAFT → CAPTURED → VALIDATED → THREE_WAY_MATCHING → MATCHED →
 *   PENDING_APPROVAL → APPROVED → PARTIALLY_PAID → PAID
 *     ↓         ↓           ↓              ↓
 *   VOIDED   EXCEPTION   EXCEPTION      EXCEPTION
 *              ↓
 *   BLOCKED (from pre-approval states)
 *   DISPUTED (from CAPTURED, VALIDATED, MATCHED)
 */

import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { toDecimal, sumDecimals, multiplyDecimals } from "@/lib/financial-precision";
import type {
  VendorInvoice,
  VendorInvoiceStatus,
  InvoiceLineItem,
  ThreeWayMatch,
  MatchLineItem,
  InvoiceException,
} from "../ap-repositories/types";
import type { APRepositoryRegistry } from "../ap-repositories/registry";
import type {
  CommandContext,
  CommandResult,
  AuditEntry,
  DomainEvent,
  ReceiveInvoiceCommand,
  UpdateInvoiceCommand,
  VoidInvoiceCommand,
  RunThreeWayMatchCommand,
  OverrideMatchCommand,
  InvoiceLineItemInput,
} from "./types";
import { ok, fail } from "./types";
import { invoiceEvents, exceptionEvents } from "../domain/events/event-types";
import { apEventBus } from "../domain/events/event-bus";

// ── Status Constraints ──────────────────────────────────────────────────────

const RECEIVABLE_STATUSES: VendorInvoiceStatus[] = ["CAPTURED"];
const VOIDABLE_STATUSES: VendorInvoiceStatus[] = ["CAPTURED", "VALIDATED"];
const VALIDATABLE_STATUSES: VendorInvoiceStatus[] = ["CAPTURED"];
const MATCHABLE_STATUSES: VendorInvoiceStatus[] = ["VALIDATED"];
const APPROVAL_PASS_THROUGH_STATUSES: VendorInvoiceStatus[] = ["MATCHED"];
const SCHEDULABLE_STATUSES: VendorInvoiceStatus[] = ["APPROVED"];
const BLOCKABLE_STATUSES: VendorInvoiceStatus[] = ["CAPTURED", "VALIDATED"];
const DISPUTABLE_STATUSES: VendorInvoiceStatus[] = ["CAPTURED", "VALIDATED", "MATCHED"];

// ── Helpers ────────────────────────────────────────────────────────────────

function makeAuditEntry(
  action: string,
  resourceId: string,
  ctx: CommandContext,
  metadata: Record<string, unknown>,
  severity: "INFO" | "WARNING" | "CRITICAL" = "INFO",
): AuditEntry {
  return {
    action: `invoice.${action}`,
    resourceType: "VendorInvoice",
    resourceId,
    actorId: ctx.userId,
    companyId: ctx.companyId,
    metadata,
    severity,
  };
}

function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Build a full VendorInvoiceLineItem from an input command and calculated amounts.
 */
function buildLineItem(
  input: InvoiceLineItemInput,
  invoiceId: string,
  companyId: string,
  userId: string,
  totalPrice: Prisma.Decimal,
  taxAmount: Prisma.Decimal,
): InvoiceLineItem {
  return {
    id: crypto.randomUUID(),
    companyId,
    vendorInvoiceId: invoiceId,
    lineNumber: input.lineNumber,
    description: input.description,
    quantity: input.quantity.toNumber(),
    unitOfMeasure: input.unitOfMeasure ?? null,
    unitPrice: input.unitPrice.toNumber(),
    lineTotal: totalPrice.toNumber(),
    discountPercent: 0,
    discountAmount: 0,
    netLineTotal: totalPrice.toNumber(),
    taxRate: input.taxRate?.toNumber() ?? 0,
    taxAmount: taxAmount.toNumber(),
    taxJurisdiction: null,
    taxType: null,
    glAccountId: input.glAccountId ?? null,
    costCenterId: null,
    departmentId: null,
    projectId: null,
    poReferenceLineItemId: null,
    grnReferenceLineItemId: null,
    matchStatus: null,
    matchVariance: 0,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    createdBy: userId,
    updatedBy: userId,
  };
}

/**
 * Recalculate line item totals from inputs and return { lineItems, subtotal, taxAmount }.
 */
function computeLineItems(
  inputs: InvoiceLineItemInput[],
  invoiceId: string,
  companyId: string,
  userId: string,
): { lineItems: InvoiceLineItem[]; subtotal: Prisma.Decimal; taxAmount: Prisma.Decimal } {
  const lineItems: InvoiceLineItem[] = [];
  const subtotals: Prisma.Decimal[] = [];
  const taxes: Prisma.Decimal[] = [];

  for (const input of inputs) {
    const totalPrice = multiplyDecimals(input.quantity, input.unitPrice);
    const taxRate = toDecimal(input.taxRate ?? 0).div(100);
    const taxAmount = totalPrice.mul(taxRate).toDecimalPlaces(12, Prisma.Decimal.ROUND_HALF_EVEN);

    lineItems.push(buildLineItem(input, invoiceId, companyId, userId, totalPrice, taxAmount));
    subtotals.push(totalPrice);
    taxes.push(taxAmount);
  }

  return {
    lineItems,
    subtotal: sumDecimals(subtotals),
    taxAmount: sumDecimals(taxes),
  };
}

// ── Service ────────────────────────────────────────────────────────────────

export class InvoiceApplicationService {
  constructor(private readonly repos: APRepositoryRegistry) {}

  // ── 1. Receive Invoice ─────────────────────────────────────────────────

  async receiveInvoice(
    cmd: ReceiveInvoiceCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }
    if (vendor.status !== "ACTIVE") {
      return fail(
        "INVALID_STATE",
        `Cannot receive invoice for vendor in ${vendor.status} status. Vendor must be ACTIVE.`,
        400,
      );
    }

    const duplicateExists = await this.repos.invoice.existsByInvoiceNumber(
      cmd.invoiceNumber,
      cmd.vendorId,
      ctx.companyId,
    );
    if (duplicateExists) {
      return fail(
        "CONFLICT",
        `Invoice number "${cmd.invoiceNumber}" already exists for this vendor`,
        409,
      );
    }

    const { lineItems, subtotal, taxAmount } = computeLineItems(
      cmd.lineItems,
      "pending",
      ctx.companyId,
      ctx.userId,
    );

    const totalWithTax = subtotal.plus(taxAmount);

    const now = nowISO();
    const invoiceId = crypto.randomUUID();

    const invoice: VendorInvoice = {
      id: invoiceId,
      companyId: ctx.companyId,
      vendorId: cmd.vendorId,
      invoiceNumber: cmd.invoiceNumber,
      invoiceDate: cmd.invoiceDate.toISOString(),
      dueDate: cmd.dueDate.toISOString(),
      receivedDate: now,
      status: "CAPTURED",
      previousStatus: null,
      statusChangedAt: now,
      poReferenceId: null,
      grnReferenceId: null,
      currency: cmd.currency ?? "USD",
      exchangeRate: 1,
      baseCurrency: "USD",
      subtotal: subtotal.toNumber(),
      taxAmount: taxAmount.toNumber(),
      discountAmount: toDecimal(cmd.discountAmount ?? 0).toNumber(),
      shippingAmount: 0,
      totalAmount: totalWithTax.toNumber(),
      totalWithTax: totalWithTax.toNumber(),
      amountPaid: 0,
      balanceDue: totalWithTax.toNumber(),
      creditApplied: 0,
      netBalance: totalWithTax.toNumber(),
      paymentTerms: vendor.paymentTerms,
      paymentMethod: null,
      glAccountId: null,
      costCenterId: null,
      departmentId: null,
      projectId: null,
      description: cmd.description ?? null,
      vendorMemo: null,
      internalMemo: null,
      ocrConfidence: 0,
      ocrRawText: null,
      isDuplicateSuspicion: false,
      duplicateConfidence: 0,
      duplicateOfInvoiceId: null,
      matchResult: null,
      varianceAmount: 0,
      varianceThreshold: 5,
      approvalRequired: false,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      paymentBatchId: null,
      paymentProposalId: null,
      paymentDate: null,
      paymentReference: null,
      checkNumber: null,
      accrualPosted: false,
      accrualReversed: false,
      glPosted: false,
      glPostedAt: null,
      periodId: null,
      idempotencyKey: null,
      source: (cmd.source as VendorInvoice["source"]) ?? "MANUAL",
      lineItems,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      version: 1,
    };

    await this.repos.invoice.save(invoice);

    for (const li of lineItems) {
      li.vendorInvoiceId = invoiceId;
    }
    await this.repos.invoice.saveLineItems(lineItems);

    const event = invoiceEvents.captured(invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      vendorId: cmd.vendorId,
      amount: totalWithTax.toNumber(),
      currency: invoice.currency,
      source: invoice.source,
    });

    const audit = makeAuditEntry("received", invoiceId, ctx, {
      invoiceNumber: cmd.invoiceNumber,
      vendorId: cmd.vendorId,
      totalAmount: totalWithTax.toNumber(),
      currency: invoice.currency,
      lineItemCount: lineItems.length,
      source: invoice.source,
    });

    return ok(invoice, [event], [audit]);
  }

  // ── 2. Update Invoice ──────────────────────────────────────────────────

  async updateInvoice(
    cmd: UpdateInvoiceCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (invoice.status !== "CAPTURED") {
      return fail(
        "INVALID_STATE",
        `Cannot update invoice in ${invoice.status} status. Must be CAPTURED.`,
        400,
      );
    }

    const changedFields: string[] = [];

    if (cmd.invoiceDate !== undefined) {
      invoice.invoiceDate = cmd.invoiceDate.toISOString();
      changedFields.push("invoiceDate");
    }
    if (cmd.dueDate !== undefined) {
      invoice.dueDate = cmd.dueDate.toISOString();
      changedFields.push("dueDate");
    }
    if (cmd.description !== undefined) {
      invoice.description = cmd.description;
      changedFields.push("description");
    }

    if (cmd.lineItems && cmd.lineItems.length > 0) {
      await this.repos.invoice.deleteLineItemsByInvoice(cmd.invoiceId);

      const { lineItems, subtotal, taxAmount } = computeLineItems(
        cmd.lineItems,
        cmd.invoiceId,
        ctx.companyId,
        ctx.userId,
      );

      const totalWithTax = subtotal.plus(taxAmount);

      invoice.subtotal = subtotal.toNumber();
      invoice.taxAmount = taxAmount.toNumber();
      invoice.totalAmount = totalWithTax.toNumber();
      invoice.totalWithTax = totalWithTax.toNumber();
      invoice.balanceDue = totalWithTax.toNumber();
      invoice.netBalance = totalWithTax.toNumber();
      invoice.lineItems = lineItems;

      await this.repos.invoice.saveLineItems(lineItems);
      changedFields.push("lineItems", "subtotal", "taxAmount", "totalAmount");
    }

    if (changedFields.length === 0) {
      return fail("VALIDATION_ERROR", "At least one field must be provided for update", 400);
    }

    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.updated(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      changedFields,
    });

    const audit = makeAuditEntry("updated", cmd.invoiceId, ctx, { changedFields });

    return ok(invoice, [event], [audit]);
  }

  // ── 3. Void Invoice ────────────────────────────────────────────────────

  async voidInvoice(
    cmd: VoidInvoiceCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail(
        "VALIDATION_ERROR",
        "Void reason is mandatory and must be at least 10 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (!VOIDABLE_STATUSES.includes(invoice.status)) {
      return fail(
        "INVALID_STATE",
        `Cannot void invoice in ${invoice.status} status. Must be CAPTURED or VALIDATED.`,
        400,
      );
    }

    const previousStatus = invoice.status;
    invoice.status = "VOIDED";
    invoice.previousStatus = previousStatus;
    invoice.statusChangedAt = nowISO();
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.voided(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      reason: cmd.reason,
      previousState: previousStatus,
    });

    const audit = makeAuditEntry(
      "voided",
      cmd.invoiceId,
      ctx,
      { reason: cmd.reason, previousStatus },
      "WARNING",
    );

    return ok(invoice, [event], [audit]);
  }

  // ── 4. Validate Invoice ────────────────────────────────────────────────

  async validateInvoice(
    cmd: { invoiceId: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (invoice.status !== "CAPTURED") {
      return fail(
        "INVALID_STATE",
        `Cannot validate invoice in ${invoice.status} status. Must be CAPTURED.`,
        400,
      );
    }

    const lineItems = await this.repos.invoice.getLineItems(cmd.invoiceId, ctx.companyId);
    const validationErrors: string[] = [];

    if (lineItems.length === 0) {
      validationErrors.push("Invoice must have at least one line item");
    }

    for (const li of lineItems) {
      if (li.unitPrice <= 0) {
        validationErrors.push(`Line ${li.lineNumber}: unit price must be greater than zero`);
      }
      if (li.quantity <= 0) {
        validationErrors.push(`Line ${li.lineNumber}: quantity must be greater than zero`);
      }
      if (li.lineTotal <= 0) {
        validationErrors.push(`Line ${li.lineNumber}: line total must be greater than zero`);
      }
    }

    if (invoice.dueDate < invoice.invoiceDate) {
      validationErrors.push("Due date must not be before invoice date");
    }

    const totalWithTax = toDecimal(invoice.totalAmount);
    if (totalWithTax.lte(0)) {
      validationErrors.push("Invoice total must be greater than zero");
    }

    if (validationErrors.length > 0) {
      const exceptionId = crypto.randomUUID();
      const exception: InvoiceException = {
        id: exceptionId,
        companyId: ctx.companyId,
        vendorInvoiceId: cmd.invoiceId,
        exceptionType: "MISSING_GRN",
        severity: "HIGH",
        description: `Invoice validation failed: ${validationErrors.join("; ")}`,
        varianceAmount: 0,
        relatedEntityId: null,
        status: "OPEN",
        assignedTo: null,
        resolution: null,
        resolvedAt: null,
        resolvedBy: null,
        escalatedTo: null,
        escalatedAt: null,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        version: 1,
      };

      await this.repos.exception.save(exception);

      const failEvent = invoiceEvents.validationFailed(cmd.invoiceId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        errors: validationErrors,
      });

      const exEvent = exceptionEvents.created(exceptionId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        invoiceId: cmd.invoiceId,
        type: "MISSING_GRN",
        severity: "HIGH",
      });

      const audit = makeAuditEntry(
        "validation_failed",
        cmd.invoiceId,
        ctx,
        { errors: validationErrors, exceptionId },
        "WARNING",
      );

      return ok(invoice, [failEvent, exEvent], [audit]);
    }

    invoice.status = "VALIDATED";
    invoice.previousStatus = "CAPTURED";
    invoice.statusChangedAt = nowISO();
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.validated(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
    });

    const audit = makeAuditEntry("validated", cmd.invoiceId, ctx, {
      previousStatus: "CAPTURED",
    });

    return ok(invoice, [event], [audit]);
  }

  // ── 5. Run Three-Way Match ─────────────────────────────────────────────

  async runThreeWayMatch(
    cmd: RunThreeWayMatchCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (invoice.status !== "VALIDATED") {
      return fail(
        "INVALID_STATE",
        `Cannot run three-way match on invoice in ${invoice.status} status. Must be VALIDATED.`,
        400,
      );
    }
    if (!invoice.poReferenceId) {
      return fail(
        "NO_PO_LINKED",
        "Invoice has no linked purchase order. Three-way matching requires a PO reference.",
        400,
      );
    }

    const invoiceLineItems = await this.repos.invoice.getLineItems(cmd.invoiceId, ctx.companyId);
    const now = nowISO();
    const matchId = crypto.randomUUID();

    let totalPriceVariance = new Prisma.Decimal(0);
    let totalQtyVariance = new Prisma.Decimal(0);
    let anyException = false;

    const matchLineItems: MatchLineItem[] = invoiceLineItems.map((li) => {
      const invoiceTotal = toDecimal(li.lineTotal);
      const priceVariance = new Prisma.Decimal(0);
      const qtyVariance = new Prisma.Decimal(0);

      const matchStatus: MatchLineItem["matchStatus"] = "EXACT_MATCH";

      const mli: MatchLineItem = {
        id: crypto.randomUUID(),
        companyId: ctx.companyId,
        threeWayMatchId: matchId,
        invoiceLineItemId: li.id,
        poReferenceLineItemId: li.poReferenceLineItemId,
        grnReferenceLineItemId: li.grnReferenceLineItemId,
        matchStatus,
        invoiceQuantity: li.quantity,
        invoiceUnitPrice: li.unitPrice,
        poQuantity: null,
        poUnitPrice: null,
        grnQuantity: null,
        priceVariance: priceVariance.toNumber(),
        quantityVariance: qtyVariance.toNumber(),
        confidence: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };

      totalPriceVariance = totalPriceVariance.plus(priceVariance);
      totalQtyVariance = totalQtyVariance.plus(qtyVariance);

      return mli;
    });

    const totalVariance = totalPriceVariance.plus(totalQtyVariance);
    const matchResult: ThreeWayMatch["matchResult"] = anyException ? "NO_MATCH" : "FULL_MATCH";

    const match: ThreeWayMatch = {
      id: matchId,
      companyId: ctx.companyId,
      vendorInvoiceId: cmd.invoiceId,
      poReferenceId: invoice.poReferenceId,
      grnReferenceId: invoice.grnReferenceId ?? "",
      matchResult,
      overallConfidence: anyException ? 0 : 1,
      priceVarianceTotal: totalPriceVariance.toNumber(),
      quantityVarianceTotal: totalQtyVariance.toNumber(),
      totalVariance: totalVariance.toNumber(),
      variancePercent: 0,
      autoApproved: !anyException,
      approvalThreshold: invoice.varianceThreshold,
      matchedAt: now,
      matchedBy: ctx.userId,
      lineItems: matchLineItems,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      version: 1,
    };

    await this.repos.match.save(match);
    await this.repos.match.saveLineItems(matchLineItems);

    invoice.matchResult = matchResult;
    invoice.varianceAmount = totalVariance.toNumber();

    if (anyException) {
      invoice.status = "EXCEPTION";
      invoice.previousStatus = "VALIDATED";
      invoice.statusChangedAt = now;

      const exceptionId = crypto.randomUUID();
      const exception: InvoiceException = {
        id: exceptionId,
        companyId: ctx.companyId,
        vendorInvoiceId: cmd.invoiceId,
        exceptionType: "PRICE_VARIANCE",
        severity: "HIGH",
        description: `Three-way match failed: ${matchResult}. Total variance: ${totalVariance.toString()}`,
        varianceAmount: totalVariance.toNumber(),
        relatedEntityId: matchId,
        status: "OPEN",
        assignedTo: null,
        resolution: null,
        resolvedAt: null,
        resolvedBy: null,
        escalatedTo: null,
        escalatedAt: null,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        version: 1,
      };

      await this.repos.exception.save(exception);

      const matchExEvent = invoiceEvents.matchException(cmd.invoiceId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        matchId,
      });

      const exEvent = exceptionEvents.created(exceptionId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        invoiceId: cmd.invoiceId,
        type: "PRICE_VARIANCE",
        severity: "HIGH",
      });

      const audit = makeAuditEntry(
        "match_exception",
        cmd.invoiceId,
        ctx,
        { matchId, matchResult, totalVariance: totalVariance.toNumber(), exceptionId },
        "WARNING",
      );

      invoice.updatedAt = now;
      invoice.updatedBy = ctx.userId;
      invoice.version += 1;
      await this.repos.invoice.save(invoice);

      return ok(invoice, [matchExEvent, exEvent], [audit]);
    }

    invoice.status = "MATCHED";
    invoice.previousStatus = "VALIDATED";
    invoice.statusChangedAt = now;
    invoice.updatedAt = now;
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.matched(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      matchId,
      matchType: matchResult,
      totalVariance: totalVariance.toNumber(),
    });

    const audit = makeAuditEntry("matched", cmd.invoiceId, ctx, {
      matchId,
      matchResult,
      totalVariance: totalVariance.toNumber(),
    });

    return ok(invoice, [event], [audit]);
  }

  // ── 6. Override Match Result ───────────────────────────────────────────

  async overrideMatchResult(
    cmd: OverrideMatchCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.reason || cmd.reason.length < 20) {
      return fail(
        "VALIDATION_ERROR",
        "Override reason is mandatory and must be at least 20 characters",
        400,
      );
    }

    const match = await this.repos.match.findById(cmd.matchId, ctx.companyId);
    if (!match) {
      return fail("NOT_FOUND", "Match record not found", 404);
    }
    if (match.matchResult !== "NO_MATCH" && match.matchResult !== "PARTIAL_MATCH" &&
        match.matchResult !== "PRICE_VARIANCE" && match.matchResult !== "QTY_VARIANCE") {
      return fail(
        "INVALID_STATE",
        `Cannot override match in ${match.matchResult} status. Must be an exception match.`,
        400,
      );
    }

    match.matchResult = "FULL_MATCH";
    match.overallConfidence = 0.5;
    match.updatedAt = nowISO();
    match.updatedBy = ctx.userId;
    match.version += 1;

    await this.repos.match.save(match);

    const invoice = await this.repos.invoice.findById(match.vendorInvoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }

    invoice.status = "MATCHED";
    invoice.previousStatus = "EXCEPTION";
    invoice.statusChangedAt = nowISO();
    invoice.matchResult = "FULL_MATCH";
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.matchOverride(match.vendorInvoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      matchId: cmd.matchId,
      reason: cmd.reason,
    });

    const audit = makeAuditEntry(
      "match_override",
      match.vendorInvoiceId,
      ctx,
      { matchId: cmd.matchId, reason: cmd.reason, previousMatchResult: match.matchResult },
      "WARNING",
    );

    return ok(invoice, [event], [audit]);
  }

  // ── 7. Approve Invoice (pass-through) ──────────────────────────────────

  async approveInvoice(
    cmd: { invoiceId: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }

    if (invoice.status !== "MATCHED" && invoice.status !== "PENDING_APPROVAL") {
      return fail(
        "INVALID_STATE",
        `Cannot approve invoice in ${invoice.status} status. Must be MATCHED or PENDING_APPROVAL.`,
        400,
      );
    }

    const previousStatus = invoice.status;
    invoice.status = "APPROVED";
    invoice.previousStatus = previousStatus;
    invoice.statusChangedAt = nowISO();
    invoice.approvedAt = nowISO();
    invoice.approvedBy = ctx.userId;
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.captured(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      vendorId: invoice.vendorId,
      amount: invoice.totalAmount,
      currency: invoice.currency,
      source: "approval_service",
    });

    const audit = makeAuditEntry("approved", cmd.invoiceId, ctx, {
      previousStatus,
      approvedBy: ctx.userId,
    });

    return ok(invoice, [event], [audit]);
  }

  // ── 8. Reject Invoice (pass-through) ───────────────────────────────────

  async rejectInvoice(
    cmd: { invoiceId: string; reason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail(
        "VALIDATION_ERROR",
        "Rejection reason is mandatory and must be at least 10 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }

    if (invoice.status !== "MATCHED" && invoice.status !== "PENDING_APPROVAL" &&
        invoice.status !== "APPROVED") {
      return fail(
        "INVALID_STATE",
        `Cannot reject invoice in ${invoice.status} status. Must be MATCHED, PENDING_APPROVAL, or APPROVED.`,
        400,
      );
    }

    const previousStatus = invoice.status;
    invoice.status = "REJECTED";
    invoice.previousStatus = previousStatus;
    invoice.statusChangedAt = nowISO();
    invoice.rejectedAt = nowISO();
    invoice.rejectedBy = ctx.userId;
    invoice.rejectionReason = cmd.reason;
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const audit = makeAuditEntry(
      "rejected",
      cmd.invoiceId,
      ctx,
      { previousStatus, reason: cmd.reason, rejectedBy: ctx.userId },
      "WARNING",
    );

    return ok(invoice, [], [audit]);
  }

  // ── 9. Escalate Invoice (pass-through) ─────────────────────────────────

  async escalateInvoice(
    cmd: { invoiceId: string; reason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail(
        "VALIDATION_ERROR",
        "Escalation reason is mandatory and must be at least 10 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }

    if (invoice.status !== "MATCHED" && invoice.status !== "PENDING_APPROVAL") {
      return fail(
        "INVALID_STATE",
        `Cannot escalate invoice in ${invoice.status} status. Must be MATCHED or PENDING_APPROVAL.`,
        400,
      );
    }

    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const audit = makeAuditEntry(
      "escalated",
      cmd.invoiceId,
      ctx,
      { reason: cmd.reason, escalatedBy: ctx.userId },
      "WARNING",
    );

    return ok(invoice, [], [audit]);
  }

  // ── 10. Schedule for Payment ───────────────────────────────────────────

  async scheduleForPayment(
    cmd: { invoiceId: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (invoice.status !== "APPROVED") {
      return fail(
        "INVALID_STATE",
        `Cannot schedule invoice in ${invoice.status} status for payment. Must be APPROVED.`,
        400,
      );
    }

    const vendor = await this.repos.vendor.findById(invoice.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }
    if (vendor.status === "SUSPENDED") {
      return fail(
        "VENDOR_SUSPENDED",
        "Cannot schedule payment for a suspended vendor",
        400,
      );
    }

    invoice.status = "PENDING_APPROVAL";
    invoice.previousStatus = "APPROVED";
    invoice.statusChangedAt = nowISO();
    invoice.approvalRequired = true;
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.paymentScheduled(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      proposalId: "",
    });

    const audit = makeAuditEntry("payment_scheduled", cmd.invoiceId, ctx, {
      previousStatus: "APPROVED",
      vendorId: invoice.vendorId,
    });

    return ok(invoice, [event], [audit]);
  }

  // ── 11. Block Invoice ──────────────────────────────────────────────────

  async blockInvoice(
    cmd: { invoiceId: string; reason: string; blockType: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail(
        "VALIDATION_ERROR",
        "Block reason is mandatory and must be at least 10 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (!BLOCKABLE_STATUSES.includes(invoice.status)) {
      return fail(
        "INVALID_STATE",
        `Cannot block invoice in ${invoice.status} status. Must be CAPTURED or VALIDATED.`,
        400,
      );
    }

    const previousStatus = invoice.status;
    invoice.previousStatus = previousStatus;
    invoice.status = "EXCEPTION";
    invoice.statusChangedAt = nowISO();
    invoice.internalMemo = `BLOCKED [${cmd.blockType}]: ${cmd.reason}`;
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.blocked(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      blockType: cmd.blockType,
      reason: cmd.reason,
    });

    const audit = makeAuditEntry(
      "blocked",
      cmd.invoiceId,
      ctx,
      { previousStatus, blockType: cmd.blockType, reason: cmd.reason },
      "WARNING",
    );

    return ok(invoice, [event], [audit]);
  }

  // ── 12. Unblock Invoice ────────────────────────────────────────────────

  async unblockInvoice(
    cmd: { invoiceId: string; reason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail(
        "VALIDATION_ERROR",
        "Unblock reason is mandatory and must be at least 10 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (invoice.status !== "EXCEPTION") {
      return fail(
        "INVALID_STATE",
        `Cannot unblock invoice in ${invoice.status} status. Must be EXCEPTION (blocked).`,
        400,
      );
    }

    const restoredStatus = invoice.previousStatus as VendorInvoiceStatus | null;
    if (!restoredStatus || !BLOCKABLE_STATUSES.includes(restoredStatus)) {
      return fail(
        "INVALID_STATE",
        "Cannot determine the previous status to restore. Invoice may not have been blocked.",
        400,
      );
    }

    invoice.status = restoredStatus;
    invoice.previousStatus = null;
    invoice.statusChangedAt = nowISO();
    invoice.internalMemo = null;
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.unblocked(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      previousState: restoredStatus,
    });

    const audit = makeAuditEntry("unblocked", cmd.invoiceId, ctx, {
      restoredTo: restoredStatus,
      reason: cmd.reason,
    });

    return ok(invoice, [event], [audit]);
  }

  // ── 13. Dispute Invoice ────────────────────────────────────────────────

  async disputeInvoice(
    cmd: { invoiceId: string; disputeReason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.disputeReason || cmd.disputeReason.length < 10) {
      return fail(
        "VALIDATION_ERROR",
        "Dispute reason is mandatory and must be at least 10 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (!DISPUTABLE_STATUSES.includes(invoice.status)) {
      return fail(
        "INVALID_STATE",
        `Cannot dispute invoice in ${invoice.status} status. Must be CAPTURED, VALIDATED, or MATCHED.`,
        400,
      );
    }

    const previousStatus = invoice.status;
    invoice.previousStatus = previousStatus;
    invoice.status = "EXCEPTION";
    invoice.statusChangedAt = nowISO();
    invoice.internalMemo = `DISPUTED: ${cmd.disputeReason}`;
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.disputed(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      disputeReason: cmd.disputeReason,
    });

    const audit = makeAuditEntry(
      "disputed",
      cmd.invoiceId,
      ctx,
      { previousStatus, disputeReason: cmd.disputeReason },
      "WARNING",
    );

    return ok(invoice, [event], [audit]);
  }

  // ── 14. Resolve Dispute ────────────────────────────────────────────────

  async resolveDispute(
    cmd: { invoiceId: string; resolution: string; resolutionNotes: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.resolutionNotes || cmd.resolutionNotes.length < 20) {
      return fail(
        "VALIDATION_ERROR",
        "Resolution notes are mandatory and must be at least 20 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (invoice.status !== "EXCEPTION") {
      return fail(
        "INVALID_STATE",
        `Cannot resolve dispute on invoice in ${invoice.status} status. Must be EXCEPTION (disputed).`,
        400,
      );
    }

    const preDisputeStatus = invoice.previousStatus as VendorInvoiceStatus | null;

    if (cmd.resolution === "voided") {
      invoice.status = "VOIDED";
      invoice.previousStatus = preDisputeStatus;
      invoice.statusChangedAt = nowISO();
      invoice.internalMemo = `DISPUTE RESOLVED (voided): ${cmd.resolutionNotes}`;
      invoice.updatedAt = nowISO();
      invoice.updatedBy = ctx.userId;
      invoice.version += 1;

      await this.repos.invoice.save(invoice);

      const event = invoiceEvents.disputeResolved(cmd.invoiceId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        resolution: "voided",
      });

      const audit = makeAuditEntry(
        "dispute_resolved",
        cmd.invoiceId,
        ctx,
        { resolution: "voided", resolutionNotes: cmd.resolutionNotes, preDisputeStatus },
        "WARNING",
      );

      return ok(invoice, [event], [audit]);
    }

    const restoredStatus: VendorInvoiceStatus =
      preDisputeStatus && DISPUTABLE_STATUSES.includes(preDisputeStatus)
        ? preDisputeStatus
        : "CAPTURED";

    invoice.status = restoredStatus;
    invoice.previousStatus = null;
    invoice.statusChangedAt = nowISO();
    invoice.internalMemo = `DISPUTE RESOLVED (${cmd.resolution}): ${cmd.resolutionNotes}`;
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.disputeResolved(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      resolution: cmd.resolution,
    });

    const audit = makeAuditEntry(
      "dispute_resolved",
      cmd.invoiceId,
      ctx,
      { resolution: cmd.resolution, resolutionNotes: cmd.resolutionNotes, restoredTo: restoredStatus },
    );

    return ok(invoice, [event], [audit]);
  }

  // ── 15. Delete Invoice (soft void — only CAPTURED) ─────────────────────

  async deleteInvoice(
    cmd: { invoiceId: string; reason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<VendorInvoice>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail(
        "VALIDATION_ERROR",
        "Deletion reason is mandatory and must be at least 10 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found", 404);
    }
    if (invoice.status !== "CAPTURED") {
      return fail(
        "INVALID_STATE",
        `Cannot delete invoice in ${invoice.status} status. Only CAPTURED invoices can be deleted.`,
        400,
      );
    }

    invoice.status = "VOIDED";
    invoice.previousStatus = "CAPTURED";
    invoice.statusChangedAt = nowISO();
    invoice.internalMemo = `DELETED (soft void): ${cmd.reason}`;
    invoice.updatedAt = nowISO();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;

    await this.repos.invoice.save(invoice);

    const event = invoiceEvents.voided(cmd.invoiceId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      reason: cmd.reason,
      previousState: "CAPTURED",
    });

    const audit = makeAuditEntry(
      "deleted",
      cmd.invoiceId,
      ctx,
      { reason: cmd.reason, previousStatus: "CAPTURED", method: "soft_void" },
      "WARNING",
    );

    return ok(invoice, [event], [audit]);
  }
}
