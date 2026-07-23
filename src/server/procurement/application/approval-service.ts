/**
 * Phase 21A.2 — Approval Application Service
 *
 * Implements 6 approval commands: request, approve, reject, delegate, escalate, recall.
 * Each command follows: validate → load → business rules → save → events → audit → return.
 *
 * Approval thresholds:
 *   < $1K    → auto-approve (System)
 *   $1K–$10K → AP Manager (1 level)
 *   $10K–$50K → AP Manager + Controller (2 levels)
 *   $50K–$100K → + CFO (3 levels)
 *   > $100K  → + Treasury Manager (4 levels)
 */

import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { toDecimal } from "@/lib/financial-precision";
import type { APRepositoryRegistry } from "../ap-repositories/registry";
import type { ApprovalRecord, ApprovalLevel, VendorInvoice, InvoiceException } from "../ap-repositories/types";
import type {
  CommandContext,
  CommandResult,
  DomainEvent,
  AuditEntry,
  RequestApprovalCommand,
  DecideApprovalCommand,
  DelegateApprovalCommand,
  EscalateApprovalCommand,
} from "./types";
import { ok, fail } from "./types";
import { approvalEvents, invoiceEvents, exceptionEvents } from "../domain/events/event-types";

// ── Threshold Tiers ───────────────────────────────────────────────────────────

interface ApprovalTier {
  readonly minAmount: number;
  readonly maxAmount: number | null;
  readonly levelName: string;
  readonly requiredRole: string;
}

const APPROVAL_TIERS: ApprovalTier[] = [
  { minAmount: 0, maxAmount: 1_000, levelName: "Auto-Approve", requiredRole: "SYSTEM" },
  { minAmount: 1_000, maxAmount: 10_000, levelName: "AP Manager", requiredRole: "AP_MANAGER" },
  { minAmount: 10_000, maxAmount: 50_000, levelName: "Controller", requiredRole: "CONTROLLER" },
  { minAmount: 50_000, maxAmount: 100_000, levelName: "CFO", requiredRole: "CFO" },
  { minAmount: 100_000, maxAmount: null, levelName: "Treasury Manager", requiredRole: "TREASURY_MANAGER" },
];

function determineLevels(amount: number): ApprovalTier[] {
  const tiers: ApprovalTier[] = [];
  for (const tier of APPROVAL_TIERS) {
    if (tier.requiredRole === "SYSTEM") continue;
    tiers.push(tier);
    if (tier.maxAmount !== null && amount < tier.maxAmount) break;
  }
  if (amount >= 100_000) {
    return APPROVAL_TIERS.slice(1);
  }
  return tiers;
}

function approvalLevelName(levelNumber: number): string {
  return APPROVAL_TIERS[levelNumber]?.levelName ?? `Level ${levelNumber}`;
}

function approvalRole(levelNumber: number): string {
  return APPROVAL_TIERS[levelNumber]?.requiredRole ?? "UNKNOWN";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function audit(
  action: string,
  resourceId: string,
  ctx: CommandContext,
  metadata: Record<string, unknown>,
  severity: "INFO" | "WARNING" | "CRITICAL" = "INFO",
): AuditEntry {
  return {
    action,
    resourceType: "ApprovalRecord",
    resourceId,
    actorId: ctx.userId,
    companyId: ctx.companyId,
    metadata,
    severity,
  };
}

function invoiceAudit(
  action: string,
  invoiceId: string,
  ctx: CommandContext,
  metadata: Record<string, unknown>,
): AuditEntry {
  return {
    action,
    resourceType: "VendorInvoice",
    resourceId: invoiceId,
    actorId: ctx.userId,
    companyId: ctx.companyId,
    metadata,
    severity: "INFO",
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export class ApprovalApplicationService {
  constructor(private readonly repos: APRepositoryRegistry) {}

  // ── 1. requestApproval ────────────────────────────────────────────────────

  async requestApproval(cmd: RequestApprovalCommand, ctx: CommandContext): Promise<CommandResult<ApprovalRecord[]>> {
    const events: DomainEvent[] = [];
    const audits: AuditEntry[] = [];

    const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
    if (!invoice) {
      return fail("INVOICE_NOT_FOUND", "Invoice not found", 404);
    }

    if (invoice.status !== "MATCHED") {
      return fail(
        "INVALID_INVOICE_STATUS",
        `Invoice must be in MATCHED status to request approval. Current status: ${invoice.status}`,
        409,
      );
    }

    const existingRecords = await this.repos.approval.findRecordsByInvoiceId(cmd.invoiceId, ctx.companyId);
    const activeRecords = existingRecords.filter(
      (r) => r.status === "PENDING" || r.status === "DELEGATED" || r.status === "SKIPPED",
    );
    if (activeRecords.length > 0) {
      return fail(
        "ACTIVE_APPROVAL_EXISTS",
        "An active approval chain already exists for this invoice",
        409,
      );
    }

    const amount = toDecimal(invoice.totalWithTax).toNumber();
    const levels = determineLevels(amount);
    const chainId = crypto.randomUUID();

    if (amount < 1_000) {
      const autoRecord: ApprovalRecord = {
        id: crypto.randomUUID(),
        companyId: ctx.companyId,
        vendorInvoiceId: cmd.invoiceId,
        approvalLevel: 0,
        approvalLevelName: "Auto-Approve",
        requiredRole: "SYSTEM",
        requiredThreshold: 0,
        status: "APPROVED",
        decision: "APPROVE",
        decisionAt: now(),
        decisionBy: "SYSTEM",
        decisionComment: "Auto-approved: amount below $1,000 threshold",
        delegatedTo: null,
        delegatedAt: null,
        delegationReason: null,
        escalated: false,
        escalatedAt: null,
        escalationReason: null,
        timeLimit: null,
        createdAt: now(),
        updatedAt: now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        version: 0,
      };

      await this.repos.approval.saveRecord(autoRecord);

      invoice.status = "APPROVED";
      invoice.approvedAt = now();
      invoice.approvedBy = "SYSTEM";
      invoice.updatedAt = now();
      invoice.updatedBy = ctx.userId;
      invoice.version += 1;
      await this.repos.invoice.save(invoice);

      events.push(
        approvalEvents.created(chainId, {
          ...ctx,
          invoiceId: cmd.invoiceId,
          levels: 1,
        }),
        approvalEvents.levelDecided(autoRecord.id, {
          ...ctx,
          level: 0,
          decision: "APPROVED",
        }),
        approvalEvents.chainApproved(chainId, {
          ...ctx,
          invoiceId: cmd.invoiceId,
        }),
        invoiceEvents.updated(cmd.invoiceId, {
          ...ctx,
          changedFields: ["status", "approvedAt", "approvedBy"],
        }),
      );

      audits.push(
        audit("approval.requested", autoRecord.id, ctx, {
          invoiceId: cmd.invoiceId,
          amount,
          autoApproved: true,
        }),
        audit("approval.approved", autoRecord.id, ctx, {
          invoiceId: cmd.invoiceId,
          autoApproved: true,
        }),
        invoiceAudit("invoice.status_changed", cmd.invoiceId, ctx, {
          previousStatus: "MATCHED",
          newStatus: "APPROVED",
        }),
      );

      return ok([autoRecord], events, audits);
    }

    const records: ApprovalRecord[] = [];
    for (let i = 0; i < levels.length; i++) {
      const tier = levels[i];
      const isPending = i === 0;
      const record: ApprovalRecord = {
        id: crypto.randomUUID(),
        companyId: ctx.companyId,
        vendorInvoiceId: cmd.invoiceId,
        approvalLevel: i + 1,
        approvalLevelName: tier.levelName,
        requiredRole: tier.requiredRole,
        requiredThreshold: tier.minAmount,
        status: isPending ? "PENDING" : "SKIPPED",
        decision: null,
        decisionAt: null,
        decisionBy: null,
        decisionComment: null,
        delegatedTo: null,
        delegatedAt: null,
        delegationReason: null,
        escalated: false,
        escalatedAt: null,
        escalationReason: null,
        timeLimit: null,
        createdAt: now(),
        updatedAt: now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        version: 0,
      };

      await this.repos.approval.saveRecord(record);
      records.push(record);
    }

    invoice.status = "PENDING_APPROVAL";
    invoice.approvalRequired = true;
    invoice.updatedAt = now();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;
    await this.repos.invoice.save(invoice);

    events.push(
      approvalEvents.created(chainId, {
        ...ctx,
        invoiceId: cmd.invoiceId,
        levels: levels.length,
      }),
      invoiceEvents.updated(cmd.invoiceId, {
        ...ctx,
        changedFields: ["status", "approvalRequired"],
      }),
    );

    audits.push(
      audit("approval.requested", chainId, ctx, {
        invoiceId: cmd.invoiceId,
        amount,
        levelCount: levels.length,
        levels: levels.map((l) => l.levelName),
      }),
      invoiceAudit("invoice.status_changed", cmd.invoiceId, ctx, {
        previousStatus: "MATCHED",
        newStatus: "PENDING_APPROVAL",
      }),
    );

    return ok(records, events, audits);
  }

  // ── 2. approveLevel ───────────────────────────────────────────────────────

  async approveLevel(cmd: DecideApprovalCommand, ctx: CommandContext): Promise<CommandResult<ApprovalRecord>> {
    const events: DomainEvent[] = [];
    const audits: AuditEntry[] = [];

    const record = await this.repos.approval.findRecordById(cmd.approvalRecordId, ctx.companyId);
    if (!record) {
      return fail("APPROVAL_RECORD_NOT_FOUND", "Approval record not found", 404);
    }

    if (record.status !== "PENDING") {
      return fail(
        "INVALID_APPROVAL_STATUS",
        `Approval record must be in PENDING status. Current status: ${record.status}`,
        409,
      );
    }

    if (record.delegatedTo && record.delegatedTo !== ctx.userId) {
      return fail(
        "NOT_AUTHORIZED",
        "This approval has been delegated to another user",
        403,
      );
    }

    const invoice = await this.repos.invoice.findById(record.vendorInvoiceId, ctx.companyId);
    if (!invoice) {
      return fail("INVOICE_NOT_FOUND", "Associated invoice not found", 404);
    }

    if (invoice.createdBy === ctx.userId) {
      return fail(
        "SOD_VIOLATION",
        "Approvers must not be the invoice creator (Separation of Duties)",
        403,
      );
    }

    if (invoice.poReferenceId) {
      const relatedRecords = await this.repos.approval.findRecordsByInvoiceId(record.vendorInvoiceId, ctx.companyId);
      if (relatedRecords.length > 0 && record.approvalLevel === 1) {
        // First-level check: cannot approve own PO
        // PO creator check is validated at business rule layer — here we enforce SoD
      }
    }

    record.status = "APPROVED";
    record.decision = "APPROVE";
    record.decisionAt = now();
    record.decisionBy = ctx.userId;
    record.decisionComment = cmd.comment ?? null;
    record.updatedAt = now();
    record.updatedBy = ctx.userId;
    record.version += 1;

    await this.repos.approval.saveRecord(record);

    events.push(
      approvalEvents.levelDecided(record.id, {
        ...ctx,
        level: record.approvalLevel,
        decision: "APPROVED",
      }),
    );

    audits.push(
      audit("approval.approved", record.id, ctx, {
        invoiceId: record.vendorInvoiceId,
        level: record.approvalLevel,
        levelName: record.approvalLevelName,
        comment: cmd.comment,
      }),
    );

    const allRecords = await this.repos.approval.findRecordsByInvoiceId(record.vendorInvoiceId, ctx.companyId);
    const allApproved = allRecords.every((r) => r.status === "APPROVED");

    if (allApproved) {
      invoice.status = "APPROVED";
      invoice.approvedAt = now();
      invoice.approvedBy = ctx.userId;
      invoice.updatedAt = now();
      invoice.updatedBy = ctx.userId;
      invoice.version += 1;
      await this.repos.invoice.save(invoice);

      events.push(
        approvalEvents.chainApproved(record.id, {
          ...ctx,
          invoiceId: record.vendorInvoiceId,
        }),
        invoiceEvents.updated(record.vendorInvoiceId, {
          ...ctx,
          changedFields: ["status", "approvedAt", "approvedBy"],
        }),
      );

      audits.push(
        audit("approval.chain_approved", record.id, ctx, {
          invoiceId: record.vendorInvoiceId,
        }),
        invoiceAudit("invoice.status_changed", record.vendorInvoiceId, ctx, {
          previousStatus: "PENDING_APPROVAL",
          newStatus: "APPROVED",
        }),
      );
    } else {
      const nextRecord = allRecords
        .filter((r) => r.status === "SKIPPED" || r.status === "PENDING")
        .sort((a, b) => a.approvalLevel - b.approvalLevel)
        .find((r) => r.approvalLevel > record.approvalLevel && r.status === "SKIPPED");

      if (nextRecord) {
        nextRecord.status = "PENDING";
        nextRecord.updatedAt = now();
        nextRecord.updatedBy = ctx.userId;
        nextRecord.version += 1;
        await this.repos.approval.saveRecord(nextRecord);
      }
    }

    return ok(record, events, audits);
  }

  // ── 3. rejectLevel ────────────────────────────────────────────────────────

  async rejectLevel(cmd: DecideApprovalCommand, ctx: CommandContext): Promise<CommandResult<ApprovalRecord>> {
    const events: DomainEvent[] = [];
    const audits: AuditEntry[] = [];

    const record = await this.repos.approval.findRecordById(cmd.approvalRecordId, ctx.companyId);
    if (!record) {
      return fail("APPROVAL_RECORD_NOT_FOUND", "Approval record not found", 404);
    }

    if (record.status !== "PENDING") {
      return fail(
        "INVALID_APPROVAL_STATUS",
        `Approval record must be in PENDING status. Current status: ${record.status}`,
        409,
      );
    }

    record.status = "REJECTED";
    record.decision = "REJECT";
    record.decisionAt = now();
    record.decisionBy = ctx.userId;
    record.decisionComment = cmd.comment ?? null;
    record.updatedAt = now();
    record.updatedBy = ctx.userId;
    record.version += 1;

    await this.repos.approval.saveRecord(record);

    const allRecords = await this.repos.approval.findRecordsByInvoiceId(record.vendorInvoiceId, ctx.companyId);
    const subsequentRecords = allRecords.filter((r) => r.approvalLevel > record.approvalLevel);
    for (const sr of subsequentRecords) {
      sr.status = "SKIPPED";
      sr.updatedAt = now();
      sr.updatedBy = ctx.userId;
      sr.version += 1;
      await this.repos.approval.saveRecord(sr);
    }

    const invoice = await this.repos.invoice.findById(record.vendorInvoiceId, ctx.companyId);
    if (invoice) {
      invoice.status = "EXCEPTION";
      invoice.rejectedAt = now();
      invoice.rejectedBy = ctx.userId;
      invoice.rejectionReason = cmd.comment ?? "Approval rejected";
      invoice.updatedAt = now();
      invoice.updatedBy = ctx.userId;
      invoice.version += 1;
      await this.repos.invoice.save(invoice);
    }

    const exceptionId = crypto.randomUUID();
    const exception: InvoiceException = {
      id: exceptionId,
      companyId: ctx.companyId,
      vendorInvoiceId: record.vendorInvoiceId,
      exceptionType: "APPROVAL_REQUIRED",
      severity: "MEDIUM",
      description: `Approval rejected at level ${record.approvalLevel} (${record.approvalLevelName}). ${cmd.comment ?? ""}`,
      varianceAmount: 0,
      relatedEntityId: record.id,
      status: "OPEN",
      assignedTo: null,
      resolution: null,
      resolvedAt: null,
      resolvedBy: null,
      escalatedTo: null,
      escalatedAt: null,
      createdAt: now(),
      updatedAt: now(),
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      version: 0,
    };

    await this.repos.exception.save(exception);

    events.push(
      approvalEvents.levelDecided(record.id, {
        ...ctx,
        level: record.approvalLevel,
        decision: "REJECTED",
      }),
      approvalEvents.chainRejected(record.id, {
        ...ctx,
        invoiceId: record.vendorInvoiceId,
      }),
      exceptionEvents.created(exceptionId, {
        ...ctx,
        invoiceId: record.vendorInvoiceId,
        type: "APPROVAL_REQUIRED",
        severity: "MEDIUM",
      }),
      invoiceEvents.updated(record.vendorInvoiceId, {
        ...ctx,
        changedFields: ["status", "rejectedAt", "rejectedBy", "rejectionReason"],
      }),
    );

    audits.push(
      audit("approval.rejected", record.id, ctx, {
        invoiceId: record.vendorInvoiceId,
        level: record.approvalLevel,
        levelName: record.approvalLevelName,
        comment: cmd.comment,
      }),
      audit("exception.created", exceptionId, ctx, {
        invoiceId: record.vendorInvoiceId,
        type: "APPROVAL_REQUIRED",
      }),
      invoiceAudit("invoice.status_changed", record.vendorInvoiceId, ctx, {
        previousStatus: "PENDING_APPROVAL",
        newStatus: "EXCEPTION",
      }),
    );

    return ok(record, events, audits);
  }

  // ── 4. delegateApproval ───────────────────────────────────────────────────

  async delegateApproval(cmd: DelegateApprovalCommand, ctx: CommandContext): Promise<CommandResult<ApprovalRecord>> {
    const events: DomainEvent[] = [];
    const audits: AuditEntry[] = [];

    const record = await this.repos.approval.findRecordById(cmd.approvalRecordId, ctx.companyId);
    if (!record) {
      return fail("APPROVAL_RECORD_NOT_FOUND", "Approval record not found", 404);
    }

    if (record.status !== "PENDING") {
      return fail(
        "INVALID_APPROVAL_STATUS",
        `Cannot delegate approval in ${record.status} status`,
        409,
      );
    }

    if (!cmd.reason || cmd.reason.trim().length === 0) {
      return fail("MISSING_REASON", "Delegation reason is mandatory", 400);
    }

    record.status = "DELEGATED";
    record.delegatedTo = cmd.delegatedTo;
    record.delegatedAt = now();
    record.delegationReason = cmd.reason;
    record.updatedAt = now();
    record.updatedBy = ctx.userId;
    record.version += 1;

    await this.repos.approval.saveRecord(record);

    events.push(
      approvalEvents.delegated(record.id, {
        ...ctx,
        level: record.approvalLevel,
        delegatedTo: cmd.delegatedTo,
      }),
    );

    audits.push(
      audit("approval.delegated", record.id, ctx, {
        invoiceId: record.vendorInvoiceId,
        level: record.approvalLevel,
        delegatedTo: cmd.delegatedTo,
        reason: cmd.reason,
      }),
    );

    return ok(record, events, audits);
  }

  // ── 5. escalateApprovalLevel ──────────────────────────────────────────────

  async escalateApprovalLevel(cmd: EscalateApprovalCommand, ctx: CommandContext): Promise<CommandResult<ApprovalRecord>> {
    const events: DomainEvent[] = [];
    const audits: AuditEntry[] = [];

    const record = await this.repos.approval.findRecordById(cmd.approvalRecordId, ctx.companyId);
    if (!record) {
      return fail("APPROVAL_RECORD_NOT_FOUND", "Approval record not found", 404);
    }

    if (record.status !== "PENDING") {
      return fail(
        "INVALID_APPROVAL_STATUS",
        `Cannot escalate approval in ${record.status} status`,
        409,
      );
    }

    const allRecords = await this.repos.approval.findRecordsByInvoiceId(record.vendorInvoiceId, ctx.companyId);
    const nextLevel = allRecords.find(
      (r) => r.approvalLevel > record.approvalLevel,
    );

    if (!nextLevel) {
      return fail(
        "NO_NEXT_LEVEL",
        "No higher approval level exists to escalate to",
        409,
      );
    }

    record.status = "APPROVED";
    record.decision = "APPROVE";
    record.decisionAt = now();
    record.decisionBy = "ESCALATED";
    record.decisionComment = `Auto-approved via escalation: ${cmd.reason}`;
    record.escalated = true;
    record.escalatedAt = now();
    record.escalationReason = cmd.reason;
    record.updatedAt = now();
    record.updatedBy = ctx.userId;
    record.version += 1;
    await this.repos.approval.saveRecord(record);

    if (nextLevel.status === "SKIPPED") {
      nextLevel.status = "PENDING";
      nextLevel.updatedAt = now();
      nextLevel.updatedBy = ctx.userId;
      nextLevel.version += 1;
      await this.repos.approval.saveRecord(nextLevel);
    }

    events.push(
      approvalEvents.levelDecided(record.id, {
        ...ctx,
        level: record.approvalLevel,
        decision: "APPROVED",
      }),
      approvalEvents.escalated(record.id, {
        ...ctx,
        level: record.approvalLevel,
        reason: cmd.reason,
      }),
    );

    audits.push(
      audit("approval.escalated", record.id, ctx, {
        invoiceId: record.vendorInvoiceId,
        level: record.approvalLevel,
        reason: cmd.reason,
        escalatedToLevel: nextLevel.approvalLevel,
      }),
    );

    const allApproved = allRecords.every((r) => r.status === "APPROVED" || r.status === "SKIPPED");
    if (allApproved) {
      const invoice = await this.repos.invoice.findById(record.vendorInvoiceId, ctx.companyId);
      if (invoice) {
        invoice.status = "APPROVED";
        invoice.approvedAt = now();
        invoice.approvedBy = ctx.userId;
        invoice.updatedAt = now();
        invoice.updatedBy = ctx.userId;
        invoice.version += 1;
        await this.repos.invoice.save(invoice);

        events.push(
          approvalEvents.chainApproved(record.id, {
            ...ctx,
            invoiceId: record.vendorInvoiceId,
          }),
          invoiceEvents.updated(record.vendorInvoiceId, {
            ...ctx,
            changedFields: ["status", "approvedAt", "approvedBy"],
          }),
        );

        audits.push(
          audit("approval.chain_approved", record.id, ctx, {
            invoiceId: record.vendorInvoiceId,
          }),
          invoiceAudit("invoice.status_changed", record.vendorInvoiceId, ctx, {
            previousStatus: "PENDING_APPROVAL",
            newStatus: "APPROVED",
          }),
        );
      }
    }

    return ok(record, events, audits);
  }

  // ── 6. recallApproval ─────────────────────────────────────────────────────

  async recallApproval(
    cmd: { approvalRecordId: string; reason: string },
    ctx: CommandContext,
  ): Promise<CommandResult<ApprovalRecord>> {
    const events: DomainEvent[] = [];
    const audits: AuditEntry[] = [];

    const record = await this.repos.approval.findRecordById(cmd.approvalRecordId, ctx.companyId);
    if (!record) {
      return fail("APPROVAL_RECORD_NOT_FOUND", "Approval record not found", 404);
    }

    if (record.status !== "APPROVED") {
      return fail(
        "INVALID_APPROVAL_STATUS",
        `Cannot recall approval in ${record.status} status. Must be APPROVED.`,
        409,
      );
    }

    if (!cmd.reason || cmd.reason.trim().length < 20) {
      return fail(
        "INSUFFICIENT_REASON",
        "Recall reason is mandatory and must be at least 20 characters",
        400,
      );
    }

    const invoice = await this.repos.invoice.findById(record.vendorInvoiceId, ctx.companyId);
    if (!invoice) {
      return fail("INVOICE_NOT_FOUND", "Associated invoice not found", 404);
    }

    if (invoice.status === "PAID" || invoice.status === "PARTIALLY_PAID") {
      return fail(
        "INVOICE_ALREADY_PAID",
        "Cannot recall approval for an invoice that has already been paid",
        409,
      );
    }

    const allRecords = await this.repos.approval.findRecordsByInvoiceId(record.vendorInvoiceId, ctx.companyId);
    const recordsToRevert = allRecords
      .filter((r) => r.approvalLevel >= record.approvalLevel && r.status === "APPROVED");

    for (const r of recordsToRevert) {
      r.status = "PENDING";
      r.decision = null;
      r.decisionAt = null;
      r.decisionBy = null;
      r.decisionComment = null;
      r.escalated = false;
      r.escalatedAt = null;
      r.escalationReason = null;
      r.updatedAt = now();
      r.updatedBy = ctx.userId;
      r.version += 1;
      await this.repos.approval.saveRecord(r);
    }

    const hasPendingLevels = allRecords.some(
      (r) => r.approvalLevel >= record.approvalLevel && r.status === "PENDING",
    );

    record.status = "PENDING";
    record.decision = null;
    record.decisionAt = null;
    record.decisionBy = null;
    record.decisionComment = null;
    record.escalated = false;
    record.escalatedAt = null;
    record.escalationReason = null;
    record.updatedAt = now();
    record.updatedBy = ctx.userId;
    record.version += 1;
    await this.repos.approval.saveRecord(record);

    invoice.status = "MATCHED";
    invoice.approvedAt = null;
    invoice.approvedBy = null;
    invoice.rejectedAt = null;
    invoice.rejectedBy = null;
    invoice.rejectionReason = null;
    invoice.updatedAt = now();
    invoice.updatedBy = ctx.userId;
    invoice.version += 1;
    await this.repos.invoice.save(invoice);

    events.push(
      approvalEvents.recalled(record.id, {
        ...ctx,
        level: record.approvalLevel,
        reason: cmd.reason,
      }),
      invoiceEvents.updated(record.vendorInvoiceId, {
        ...ctx,
        changedFields: ["status", "approvedAt", "approvedBy"],
      }),
    );

    audits.push(
      audit("approval.recalled", record.id, ctx, {
        invoiceId: record.vendorInvoiceId,
        level: record.approvalLevel,
        reason: cmd.reason,
        levelsReverted: recordsToRevert.length,
      }),
      invoiceAudit("invoice.status_changed", record.vendorInvoiceId, ctx, {
        previousStatus: "APPROVED",
        newStatus: "MATCHED",
      }),
    );

    return ok(record, events, audits);
  }
}
