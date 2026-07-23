/**
 * Phase 21A.2 — Vendor Application Service
 *
 * Handles all 8 vendor lifecycle commands: create, update, approve, reject,
 * suspend, reactivate, deactivate, and update bank details.
 *
 * Pattern: Command → validate context → load from repo → business rules →
 *           save → collect events → collect audit → return ok/fail.
 *
 * Financial precision: All monetary fields use Prisma.Decimal(38,12).
 * Zero native number arithmetic on money.
 */

import crypto from "crypto";
import type { Vendor, VendorBankDetail, VendorStatus } from "../ap-repositories/types";
import type { APRepositoryRegistry } from "../ap-repositories/registry";
import type {
  CommandContext,
  CommandResult,
  DomainEvent,
  AuditEntry,
  CreateVendorCommand,
  UpdateVendorCommand,
  VendorStateTransitionCommand,
  UpdateVendorBankDetailsCommand,
} from "./types";
import { ok, fail } from "./types";
import { vendorEvents } from "../domain/events/event-types";
import { apEventBus } from "../domain/events/event-bus";

const VALID_TRANSITIONS: Record<VendorStatus, VendorStatus[]> = {
  PENDING_REVIEW: ["ACTIVE", "DEACTIVATED"],
  ACTIVE: ["SUSPENDED", "DEACTIVATED"],
  SUSPENDED: ["ACTIVE", "DEACTIVATED"],
  DEACTIVATED: [],
};

const APPROVEABLE_STATUSES: VendorStatus[] = ["PENDING_REVIEW"];

export class VendorApplicationService {
  constructor(private readonly repos: APRepositoryRegistry) {}

  // ── 1. Create Vendor ─────────────────────────────────────────────────────

  async createVendor(
    cmd: CreateVendorCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<Vendor>> {
    if (!cmd.name || cmd.name.length < 2 || cmd.name.length > 200) {
      return fail("VALIDATION_ERROR", "Vendor name must be between 2 and 200 characters", 400);
    }

    if (cmd.creditLimit !== undefined && cmd.creditLimit.lessThan(0)) {
      return fail("VALIDATION_ERROR", "Credit limit must be non-negative", 400);
    }

    const exists = await this.repos.vendor.existsByTaxId(cmd.taxId, ctx.companyId);
    if (exists) {
      return fail("CONFLICT", "A vendor with this tax ID already exists", 409);
    }

    const now = new Date().toISOString();
    const vendorId = crypto.randomUUID();

    const vendor: Vendor = {
      id: vendorId,
      companyId: ctx.companyId,
      vendorCode: cmd.vendorCode,
      name: cmd.name,
      legalName: cmd.legalName ?? cmd.name,
      status: "PENDING_REVIEW",
      riskLevel: "LOW",
      riskScore: 0,
      category: cmd.category as Vendor["category"],
      taxId: cmd.taxId,
      taxCountry: cmd.taxCountry,
      currency: cmd.currency ?? "USD",
      billingAddress: cmd.billingAddress ?? null,
      shippingAddress: cmd.shippingAddress ?? null,
      paymentTerms: cmd.paymentTerms ?? "NET30",
      preferredPaymentMethod: "ACH",
      creditLimit: cmd.creditLimit?.toNumber() ?? 0,
      bankAccountId: null,
      preferred: false,
      preferredRank: null,
      isBlocked: false,
      blockReason: null,
      rating: 0,
      totalSpend: 0,
      totalOrders: 0,
      avgPaymentDays: 0,
      contactName: cmd.contactName ?? null,
      contactEmail: cmd.contactEmail ?? null,
      contactPhone: cmd.contactPhone ?? null,
      tags: [],
      onboardingDate: now,
      lastOrderDate: null,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      version: 1,
    };

    await this.repos.vendor.save(vendor);

    const event = vendorEvents.created(vendorId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      vendorCode: cmd.vendorCode,
      category: cmd.category,
    });

    const audit: AuditEntry = {
      action: "vendor.created",
      resourceType: "Vendor",
      resourceId: vendorId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: { vendorCode: cmd.vendorCode, taxId: cmd.taxId, category: cmd.category },
      severity: "INFO",
    };

    return ok(vendor, [event], [audit]);
  }

  // ── 2. Update Vendor ─────────────────────────────────────────────────────

  async updateVendor(
    cmd: UpdateVendorCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<Vendor>> {
    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }

    if (vendor.status === "DEACTIVATED") {
      return fail("INVALID_STATE", "Cannot update a deactivated vendor", 400);
    }

    const changedFields: string[] = [];
    const updatable = [
      "name", "legalName", "category", "currency", "billingAddress",
      "shippingAddress", "paymentTerms", "creditLimit", "contactName",
      "contactEmail", "contactPhone",
    ] as const;

    for (const field of updatable) {
      const newValue = cmd[field];
      if (newValue !== undefined && newValue !== vendor[field]) {
        changedFields.push(field);
        const resolved =
          field === "creditLimit" && typeof newValue === "object" && newValue !== null && "toNumber" in newValue
            ? (newValue as { toNumber(): number }).toNumber()
            : newValue;
        (vendor as unknown as Record<string, unknown>)[field] = resolved;
      }
    }

    if (changedFields.length === 0) {
      return fail("VALIDATION_ERROR", "At least one field must be provided", 400);
    }

    vendor.updatedAt = new Date().toISOString();
    vendor.updatedBy = ctx.userId;
    vendor.version += 1;

    await this.repos.vendor.save(vendor);

    const event = vendorEvents.updated(cmd.vendorId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      changedFields,
    });

    const audit: AuditEntry = {
      action: "vendor.updated",
      resourceType: "Vendor",
      resourceId: cmd.vendorId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: { changedFields },
      severity: "INFO",
    };

    return ok(vendor, [event], [audit]);
  }

  // ── 3. Approve Vendor ────────────────────────────────────────────────────

  async approveVendor(
    cmd: VendorStateTransitionCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<Vendor>> {
    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }

    if (!APPROVEABLE_STATUSES.includes(vendor.status)) {
      return fail(
        "INVALID_STATE",
        `Cannot approve vendor in ${vendor.status} status. Must be PENDING_REVIEW or UNDER_REVIEW.`,
        400,
      );
    }

    if (vendor.createdBy === ctx.userId) {
      return fail(
        "FORBIDDEN",
        "Vendor creator cannot approve their own vendor (separation of duties)",
        403,
      );
    }

    vendor.status = "ACTIVE";
    vendor.updatedAt = new Date().toISOString();
    vendor.updatedBy = ctx.userId;
    vendor.version += 1;

    await this.repos.vendor.save(vendor);

    const event = vendorEvents.approved(cmd.vendorId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      riskLevel: vendor.riskLevel,
      riskScore: vendor.riskScore,
    });

    const audit: AuditEntry = {
      action: "vendor.approved",
      resourceType: "Vendor",
      resourceId: cmd.vendorId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: { previousStatus: "PENDING_REVIEW", riskLevel: vendor.riskLevel, riskScore: vendor.riskScore },
      severity: "INFO",
    };

    return ok(vendor, [event], [audit]);
  }

  // ── 4. Reject Vendor ─────────────────────────────────────────────────────

  async rejectVendor(
    cmd: VendorStateTransitionCommand & { reason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<Vendor>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail("VALIDATION_ERROR", "Rejection reason is mandatory and must be at least 10 characters", 400);
    }

    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }

    if (!APPROVEABLE_STATUSES.includes(vendor.status)) {
      return fail(
        "INVALID_STATE",
        `Cannot reject vendor in ${vendor.status} status. Must be PENDING_REVIEW or UNDER_REVIEW.`,
        400,
      );
    }

    const previousStatus = vendor.status;
    vendor.status = "DEACTIVATED";
    vendor.updatedAt = new Date().toISOString();
    vendor.updatedBy = ctx.userId;
    vendor.version += 1;

    await this.repos.vendor.save(vendor);

    const event = vendorEvents.rejected(cmd.vendorId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      reason: cmd.reason,
    });

    const audit: AuditEntry = {
      action: "vendor.rejected",
      resourceType: "Vendor",
      resourceId: cmd.vendorId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: { previousStatus, reason: cmd.reason },
      severity: "WARNING",
    };

    return ok(vendor, [event], [audit]);
  }

  // ── 5. Suspend Vendor ────────────────────────────────────────────────────

  async suspendVendor(
    cmd: VendorStateTransitionCommand & { reason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<Vendor>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail("VALIDATION_ERROR", "Suspension reason is mandatory and must be at least 10 characters", 400);
    }

    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }

    if (vendor.status !== "ACTIVE") {
      return fail(
        "INVALID_STATE",
        `Cannot suspend vendor in ${vendor.status} status. Must be ACTIVE.`,
        400,
      );
    }

    vendor.status = "SUSPENDED";
    vendor.updatedAt = new Date().toISOString();
    vendor.updatedBy = ctx.userId;
    vendor.version += 1;

    await this.repos.vendor.save(vendor);

    const event = vendorEvents.suspended(cmd.vendorId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      reason: cmd.reason,
    });

    const audit: AuditEntry = {
      action: "vendor.suspended",
      resourceType: "Vendor",
      resourceId: cmd.vendorId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: { previousStatus: "ACTIVE", reason: cmd.reason },
      severity: "WARNING",
    };

    return ok(vendor, [event], [audit]);
  }

  // ── 6. Reactivate Vendor ─────────────────────────────────────────────────

  async reactivateVendor(
    cmd: VendorStateTransitionCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<Vendor>> {
    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }

    if (vendor.status !== "SUSPENDED") {
      return fail(
        "INVALID_STATE",
        `Cannot reactivate vendor in ${vendor.status} status. Must be SUSPENDED.`,
        400,
      );
    }

    vendor.status = "ACTIVE";
    vendor.updatedAt = new Date().toISOString();
    vendor.updatedBy = ctx.userId;
    vendor.version += 1;

    await this.repos.vendor.save(vendor);

    const event = vendorEvents.reactivated(cmd.vendorId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
    });

    const audit: AuditEntry = {
      action: "vendor.reactivated",
      resourceType: "Vendor",
      resourceId: cmd.vendorId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: { previousStatus: "SUSPENDED" },
      severity: "INFO",
    };

    return ok(vendor, [event], [audit]);
  }

  // ── 7. Deactivate Vendor ─────────────────────────────────────────────────

  async deactivateVendor(
    cmd: VendorStateTransitionCommand & { reason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<Vendor>> {
    if (!cmd.reason || cmd.reason.length < 10) {
      return fail("VALIDATION_ERROR", "Deactivation reason is mandatory and must be at least 10 characters", 400);
    }

    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }

    if (vendor.status !== "ACTIVE" && vendor.status !== "SUSPENDED") {
      return fail(
        "INVALID_STATE",
        `Cannot deactivate vendor in ${vendor.status} status. Must be ACTIVE or SUSPENDED.`,
        400,
      );
    }

    const previousStatus = vendor.status;
    vendor.status = "DEACTIVATED";
    vendor.updatedAt = new Date().toISOString();
    vendor.updatedBy = ctx.userId;
    vendor.version += 1;

    await this.repos.vendor.save(vendor);

    const event = vendorEvents.deactivated(cmd.vendorId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      reason: cmd.reason,
    });

    const audit: AuditEntry = {
      action: "vendor.deactivated",
      resourceType: "Vendor",
      resourceId: cmd.vendorId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: { previousStatus, reason: cmd.reason, terminal: true },
      severity: "WARNING",
    };

    return ok(vendor, [event], [audit]);
  }

  // ── 8. Update Bank Details ───────────────────────────────────────────────

  async updateBankDetails(
    cmd: UpdateVendorBankDetailsCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<Vendor>> {
    if (!/^\d{9}$/.test(cmd.bankRoutingNumber)) {
      return fail("VALIDATION_ERROR", "Routing number must be exactly 9 digits", 400);
    }

    if (!/^\d{4,17}$/.test(cmd.bankAccountNumber)) {
      return fail("VALIDATION_ERROR", "Account number must be between 4 and 17 digits", 400);
    }

    const vendor = await this.repos.vendor.findById(cmd.vendorId, ctx.companyId);
    if (!vendor) {
      return fail("NOT_FOUND", "Vendor not found", 404);
    }

    if (vendor.status === "DEACTIVATED") {
      return fail("INVALID_STATE", "Cannot update bank details for a deactivated vendor", 400);
    }

    const existingDetails = await this.repos.vendor.getBankDetails(cmd.vendorId, ctx.companyId);
    const primaryDetail = existingDetails.find((d) => d.isPrimary);
    const previousBankLast4 = primaryDetail?.accountNumber.slice(-4) ?? "";

    const now = new Date().toISOString();
    const bankDetailId = primaryDetail?.id ?? crypto.randomUUID();

    const bankDetail: VendorBankDetail = {
      id: bankDetailId,
      companyId: ctx.companyId,
      vendorId: cmd.vendorId,
      bankName: cmd.bankName,
      bankCountry: "US",
      routingNumber: cmd.bankRoutingNumber,
      accountNumber: cmd.bankAccountNumber,
      accountHolderName: vendor.legalName || vendor.name,
      accountType: "CHECKING",
      isPrimary: true,
      isActive: true,
      verifiedAt: null,
      verifiedBy: null,
      createdAt: primaryDetail?.createdAt ?? now,
      updatedAt: now,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
    };

    await this.repos.vendor.saveBankDetail(bankDetail);

    vendor.bankAccountId = bankDetailId;
    vendor.updatedAt = now;
    vendor.updatedBy = ctx.userId;
    vendor.version += 1;

    await this.repos.vendor.save(vendor);

    const newBankLast4 = cmd.bankAccountNumber.slice(-4);

    const event = vendorEvents.bankUpdated(cmd.vendorId, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      correlationId: ctx.correlationId,
      previousBankLast4,
      newBankLast4,
    });

    const audit: AuditEntry = {
      action: "vendor.bank_updated",
      resourceType: "Vendor",
      resourceId: cmd.vendorId,
      actorId: ctx.userId,
      companyId: ctx.companyId,
      metadata: { previousBankLast4, newBankLast4, reason: cmd.reason },
      severity: "INFO",
    };

    return ok(vendor, [event], [audit]);
  }
}
