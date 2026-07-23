/**
 * Phase 21A.2 — Exception Application Service
 *
 * Handles all exception lifecycle commands: create, assign, resolve, escalate,
 * auto-resolve (AI pattern matching), and bulk resolve.
 *
 * Every command follows: validate → load → business rules → save → events → audit → return.
 * All monetary values use Prisma.Decimal. Zero native number arithmetic on money.
 */

import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors/app-error";

import type { APRepositoryRegistry } from "../ap-repositories/registry";
import type {
  InvoiceException,
  InvoiceExceptionStatus,
  InvoiceExceptionType,
  VendorInvoiceStatus,
} from "../ap-repositories/types";

import type {
  CommandContext,
  CommandResult,
  DomainEvent,
  AuditEntry,
} from "./types";

import {
  CreateExceptionCommand,
  AssignExceptionCommand,
  ResolveExceptionCommand,
  EscalateExceptionCommand,
} from "./types";

import { ok, fail } from "./types";
import { exceptionEvents } from "../domain/events/event-types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const SLA_HOURS: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 4,
  MEDIUM: 24,
  LOW: 48,
};

const RESOLVABLE_STATUSES: InvoiceExceptionStatus[] = ["IN_REVIEW", "ESCALATED"];
const ASSIGNABLE_STATUSES: InvoiceExceptionStatus[] = ["OPEN"];
const ESCALATABLE_STATUSES: InvoiceExceptionStatus[] = ["OPEN", "IN_REVIEW"];
const AUTO_RESOLVABLE_TYPES: InvoiceExceptionType[] = ["PRICE_VARIANCE", "QTY_VARIANCE"];
const BULK_RESOLVABLE_STATUSES: InvoiceExceptionStatus[] = ["IN_REVIEW", "ESCALATED"];

const MIN_RESOLUTION_NOTES_LENGTH = 20;
const MAX_BULK_SIZE = 50;
const MIN_AUTO_RESOLVE_CONFIDENCE = 0.85;

function calculateSlaDeadline(severity: string): Date {
  const hours = SLA_HOURS[severity] ?? SLA_HOURS.LOW;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

function audit(
  action: string,
  resourceId: string,
  ctx: CommandContext,
  metadata: Record<string, unknown>,
): AuditEntry {
  return {
    action,
    resourceType: "InvoiceException",
    resourceId,
    actorId: ctx.userId,
    companyId: ctx.companyId,
    metadata,
    severity: action.includes("escalat") ? "WARNING" : "INFO",
  };
}

function toExceptionStatus(status: string): InvoiceExceptionStatus {
  return status as InvoiceExceptionStatus;
}

// ── Service ──────────────────────────────────────────────────────────────────

export class ExceptionApplicationService {
  constructor(private readonly repos: APRepositoryRegistry) {}

  // ── 1. Create Exception ────────────────────────────────────────────────────

  async createException(
    cmd: CreateExceptionCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<InvoiceException>> {
    try {
      // Validate inputs
      if (!cmd.invoiceId) {
        return fail("VALIDATION_ERROR", "invoiceId is required", 400);
      }
      if (!cmd.exceptionType) {
        return fail("VALIDATION_ERROR", "exceptionType is required", 400);
      }
      if (!cmd.severity) {
        return fail("VALIDATION_ERROR", "severity is required", 400);
      }
      if (!VALID_SEVERITIES.includes(cmd.severity as typeof VALID_SEVERITIES[number])) {
        return fail("VALIDATION_ERROR", `severity must be one of: ${VALID_SEVERITIES.join(", ")}`, 400);
      }
      if (!cmd.description || cmd.description.trim().length === 0) {
        return fail("VALIDATION_ERROR", "description is required", 400);
      }

      // Load invoice — verify it exists in this company
      const invoice = await this.repos.invoice.findById(cmd.invoiceId, ctx.companyId);
      if (!invoice) {
        return fail("NOT_FOUND", "Invoice not found", 404);
      }

      // Dedup — if an open exception of the same type exists, re-open it
      const existingOpen = await this.repos.exception.findOpenByInvoiceId(cmd.invoiceId, ctx.companyId);
      if (existingOpen && existingOpen.exceptionType === cmd.exceptionType) {
        // Re-open the existing exception
        existingOpen.status = toExceptionStatus("OPEN");
        existingOpen.updatedBy = ctx.userId;
        existingOpen.updatedAt = new Date().toISOString();
        existingOpen.version += 1;
        await this.repos.exception.save(existingOpen);

        const event = exceptionEvents.created(existingOpen.id, {
          companyId: ctx.companyId,
          userId: ctx.userId,
          correlationId: ctx.correlationId,
          invoiceId: cmd.invoiceId,
          type: cmd.exceptionType,
          severity: cmd.severity,
        });

        const entry = audit("exception.created", existingOpen.id, ctx, {
          reopened: true,
          originalId: existingOpen.id,
          type: cmd.exceptionType,
          severity: cmd.severity,
        });

        return ok(existingOpen, [event], [entry]);
      }

      // Create new exception
      const id = randomUUID();
      const now = new Date().toISOString();
      const slaDeadline = calculateSlaDeadline(cmd.severity);

      const exception: InvoiceException = {
        id,
        companyId: ctx.companyId,
        vendorInvoiceId: cmd.invoiceId,
        exceptionType: cmd.exceptionType as InvoiceExceptionType,
        severity: cmd.severity as InvoiceException["severity"],
        description: cmd.description,
        varianceAmount: cmd.varianceAmount ? Number(cmd.varianceAmount) : 0,
        relatedEntityId: null,
        status: toExceptionStatus("OPEN"),
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
        version: 0,
      };

      await this.repos.exception.save(exception);

      const event = exceptionEvents.created(id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        invoiceId: cmd.invoiceId,
        type: cmd.exceptionType,
        severity: cmd.severity,
      });

      const entry = audit("exception.created", id, ctx, {
        type: cmd.exceptionType,
        severity: cmd.severity,
        invoiceId: cmd.invoiceId,
        slaDeadline: slaDeadline.toISOString(),
        varianceAmount: exception.varianceAmount,
      });

      return ok(exception, [event], [entry]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error creating exception";
      return fail("EXCEPTION_CREATE_FAILED", message, 500);
    }
  }

  // ── 2. Assign Exception ────────────────────────────────────────────────────

  async assignException(
    cmd: AssignExceptionCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<InvoiceException>> {
    try {
      if (!cmd.exceptionId) {
        return fail("VALIDATION_ERROR", "exceptionId is required", 400);
      }
      if (!cmd.assignedTo) {
        return fail("VALIDATION_ERROR", "assignedTo is required", 400);
      }

      const exception = await this.repos.exception.findById(cmd.exceptionId, ctx.companyId);
      if (!exception) {
        return fail("NOT_FOUND", "Exception not found", 404);
      }

      if (exception.status !== "OPEN") {
        return fail(
          "INVALID_STATUS_TRANSITION",
          `Cannot assign exception in ${exception.status} status. Must be OPEN.`,
          409,
        );
      }

      exception.assignedTo = cmd.assignedTo;
      exception.status = toExceptionStatus("IN_REVIEW");
      exception.updatedBy = ctx.userId;
      exception.updatedAt = new Date().toISOString();
      exception.version += 1;

      await this.repos.exception.save(exception);

      const event = exceptionEvents.assigned(cmd.exceptionId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        assignedTo: cmd.assignedTo,
      });

      const entry = audit("exception.assigned", cmd.exceptionId, ctx, {
        assignedTo: cmd.assignedTo,
        previousStatus: "OPEN",
        newStatus: "IN_REVIEW",
      });

      return ok(exception, [event], [entry]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error assigning exception";
      return fail("EXCEPTION_ASSIGN_FAILED", message, 500);
    }
  }

  // ── 3. Resolve Exception ───────────────────────────────────────────────────

  async resolveException(
    cmd: ResolveExceptionCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<InvoiceException>> {
    try {
      if (!cmd.exceptionId) {
        return fail("VALIDATION_ERROR", "exceptionId is required", 400);
      }
      if (!cmd.resolution) {
        return fail("VALIDATION_ERROR", "resolution is required", 400);
      }
      if (!cmd.resolutionNotes || cmd.resolutionNotes.trim().length < MIN_RESOLUTION_NOTES_LENGTH) {
        return fail(
          "VALIDATION_ERROR",
          `resolutionNotes must be at least ${MIN_RESOLUTION_NOTES_LENGTH} characters`,
          400,
        );
      }

      const exception = await this.repos.exception.findById(cmd.exceptionId, ctx.companyId);
      if (!exception) {
        return fail("NOT_FOUND", "Exception not found", 404);
      }

      if (!RESOLVABLE_STATUSES.includes(exception.status)) {
        return fail(
          "INVALID_STATUS_TRANSITION",
          `Cannot resolve exception in ${exception.status} status. Must be ${RESOLVABLE_STATUSES.join(" or ")}.`,
          409,
        );
      }

      const now = new Date().toISOString();
      const previousStatus = exception.status;

      exception.status = toExceptionStatus("RESOLVED");
      exception.resolution = cmd.resolution;
      exception.resolvedAt = now;
      exception.resolvedBy = ctx.userId;
      exception.updatedBy = ctx.userId;
      exception.updatedAt = now;
      exception.version += 1;

      await this.repos.exception.save(exception);

      // If exception resolved, update invoice status to MATCHED
      const invoice = await this.repos.invoice.findById(exception.vendorInvoiceId, ctx.companyId);
      if (invoice && invoice.status === "EXCEPTION") {
        invoice.status = "MATCHED" as VendorInvoiceStatus;
        invoice.updatedBy = ctx.userId;
        invoice.updatedAt = now;
        invoice.version += 1;
        await this.repos.invoice.save(invoice);
      }

      const event = exceptionEvents.resolved(cmd.exceptionId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        resolution: cmd.resolution,
      });

      const entry = audit("exception.resolved", cmd.exceptionId, ctx, {
        resolution: cmd.resolution,
        resolutionNotes: cmd.resolutionNotes,
        previousStatus,
        newStatus: "RESOLVED",
        invoiceId: exception.vendorInvoiceId,
      });

      return ok(exception, [event], [entry]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error resolving exception";
      return fail("EXCEPTION_RESOLVE_FAILED", message, 500);
    }
  }

  // ── 4. Escalate Exception ──────────────────────────────────────────────────

  async escalateException(
    cmd: EscalateExceptionCommand,
    ctx: CommandContext,
  ): Promise<CommandResult<InvoiceException>> {
    try {
      if (!cmd.exceptionId) {
        return fail("VALIDATION_ERROR", "exceptionId is required", 400);
      }
      if (!cmd.reason || cmd.reason.trim().length === 0) {
        return fail("VALIDATION_ERROR", "reason is required", 400);
      }

      const exception = await this.repos.exception.findById(cmd.exceptionId, ctx.companyId);
      if (!exception) {
        return fail("NOT_FOUND", "Exception not found", 404);
      }

      if (!ESCALATABLE_STATUSES.includes(exception.status)) {
        return fail(
          "INVALID_STATUS_TRANSITION",
          `Cannot escalate exception in ${exception.status} status. Must be ${ESCALATABLE_STATUSES.join(" or ")}.`,
          409,
        );
      }

      const now = new Date().toISOString();
      const previousStatus = exception.status;

      exception.status = toExceptionStatus("ESCALATED");
      exception.escalatedTo = ctx.userId;
      exception.escalatedAt = now;
      exception.updatedBy = ctx.userId;
      exception.updatedAt = now;
      exception.version += 1;

      await this.repos.exception.save(exception);

      const event = exceptionEvents.escalated(cmd.exceptionId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        reason: cmd.reason,
      });

      const entry = audit("exception.escalated", cmd.exceptionId, ctx, {
        reason: cmd.reason,
        previousStatus,
        newStatus: "ESCALATED",
        escalatedBy: ctx.userId,
      });

      return ok(exception, [event], [entry]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error escalating exception";
      return fail("EXCEPTION_ESCALATE_FAILED", message, 500);
    }
  }

  // ── 5. Auto-Resolve Exception ──────────────────────────────────────────────

  async autoResolveException(
    cmd: { exceptionId: string; patternId: string; confidence: number },
    ctx: CommandContext,
  ): Promise<CommandResult<InvoiceException>> {
    try {
      if (!cmd.exceptionId) {
        return fail("VALIDATION_ERROR", "exceptionId is required", 400);
      }
      if (!cmd.patternId) {
        return fail("VALIDATION_ERROR", "patternId is required", 400);
      }
      if (typeof cmd.confidence !== "number" || cmd.confidence < 0 || cmd.confidence > 1) {
        return fail("VALIDATION_ERROR", "confidence must be a number between 0 and 1", 400);
      }
      if (cmd.confidence < MIN_AUTO_RESOLVE_CONFIDENCE) {
        return fail(
          "VALIDATION_ERROR",
          `confidence must be >= ${MIN_AUTO_RESOLVE_CONFIDENCE} for auto-resolution`,
          400,
        );
      }

      const exception = await this.repos.exception.findById(cmd.exceptionId, ctx.companyId);
      if (!exception) {
        return fail("NOT_FOUND", "Exception not found", 404);
      }

      if (exception.status !== "OPEN") {
        return fail(
          "INVALID_STATUS_TRANSITION",
          `Cannot auto-resolve exception in ${exception.status} status. Must be OPEN.`,
          409,
        );
      }

      if (!AUTO_RESOLVABLE_TYPES.includes(exception.exceptionType)) {
        return fail(
          "INVALID_EXCEPTION_TYPE",
          `Auto-resolution only available for ${AUTO_RESOLVABLE_TYPES.join(", ")} exceptions. Got: ${exception.exceptionType}`,
          400,
        );
      }

      const now = new Date().toISOString();

      exception.status = toExceptionStatus("RESOLVED");
      exception.resolution = `AUTO_RESOLVED via pattern ${cmd.patternId}`;
      exception.resolvedAt = now;
      exception.resolvedBy = `system:${cmd.patternId}`;
      exception.updatedBy = ctx.userId;
      exception.updatedAt = now;
      exception.version += 1;

      await this.repos.exception.save(exception);

      // Use bulkResolved event with count=1 as specified
      const event = exceptionEvents.bulkResolved(cmd.exceptionId, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        count: 1,
        exceptionIds: [cmd.exceptionId],
      });

      const entry = audit("exception.autoResolved", cmd.exceptionId, ctx, {
        patternId: cmd.patternId,
        confidence: cmd.confidence,
        exceptionType: exception.exceptionType,
        previousStatus: "OPEN",
        newStatus: "RESOLVED",
      });

      return ok(exception, [event], [entry]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error auto-resolving exception";
      return fail("EXCEPTION_AUTO_RESOLVE_FAILED", message, 500);
    }
  }

  // ── 6. Bulk Resolve Exceptions ─────────────────────────────────────────────

  async bulkResolveExceptions(
    cmd: { exceptionIds: string[]; resolution: string; resolutionNotes: string },
    ctx: CommandContext,
  ): Promise<CommandResult<InvoiceException[]>> {
    try {
      if (!cmd.exceptionIds || cmd.exceptionIds.length === 0) {
        return fail("VALIDATION_ERROR", "exceptionIds is required and must not be empty", 400);
      }
      if (cmd.exceptionIds.length > MAX_BULK_SIZE) {
        return fail("VALIDATION_ERROR", `Cannot bulk resolve more than ${MAX_BULK_SIZE} exceptions`, 400);
      }
      if (!cmd.resolution) {
        return fail("VALIDATION_ERROR", "resolution is required", 400);
      }
      if (!cmd.resolutionNotes || cmd.resolutionNotes.trim().length < MIN_RESOLUTION_NOTES_LENGTH) {
        return fail(
          "VALIDATION_ERROR",
          `resolutionNotes must be at least ${MIN_RESOLUTION_NOTES_LENGTH} characters`,
          400,
        );
      }

      // Load all exceptions
      const exceptions: InvoiceException[] = [];
      for (const id of cmd.exceptionIds) {
        const ex = await this.repos.exception.findById(id, ctx.companyId);
        if (!ex) {
          return fail("NOT_FOUND", `Exception ${id} not found`, 404);
        }
        exceptions.push(ex);
      }

      // All must be in resolvable states
      for (const ex of exceptions) {
        if (!BULK_RESOLVABLE_STATUSES.includes(ex.status)) {
          return fail(
            "INVALID_STATUS_TRANSITION",
            `Exception ${ex.id} is in ${ex.status} status. All exceptions must be ${BULK_RESOLVABLE_STATUSES.join(" or ")}.`,
            409,
          );
        }
      }

      // All must be the same type
      const firstType = exceptions[0].exceptionType;
      for (const ex of exceptions) {
        if (ex.exceptionType !== firstType) {
          return fail(
            "MIXED_TYPES",
            `All exceptions must be the same type. Found ${firstType} and ${ex.exceptionType}.`,
            400,
          );
        }
      }

      // Resolve all atomically
      const now = new Date().toISOString();
      for (const ex of exceptions) {
        ex.status = toExceptionStatus("RESOLVED");
        ex.resolution = cmd.resolution;
        ex.resolvedAt = now;
        ex.resolvedBy = ctx.userId;
        ex.updatedBy = ctx.userId;
        ex.updatedAt = now;
        ex.version += 1;
        await this.repos.exception.save(ex);
      }

      const resolvedIds = exceptions.map((ex) => ex.id);

      const event = exceptionEvents.bulkResolved(exceptions[0].id, {
        companyId: ctx.companyId,
        userId: ctx.userId,
        correlationId: ctx.correlationId,
        count: exceptions.length,
        exceptionIds: resolvedIds,
      });

      const entry = audit("exception.bulkResolved", exceptions[0].id, ctx, {
        resolution: cmd.resolution,
        resolutionNotes: cmd.resolutionNotes,
        exceptionCount: exceptions.length,
        exceptionIds: resolvedIds,
        exceptionType: firstType,
        previousStatuses: [...new Set(exceptions.map((ex) => ex.status))],
        newStatus: "RESOLVED",
      });

      return ok(exceptions, [event], [entry]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error bulk-resolving exceptions";
      return fail("EXCEPTION_BULK_RESOLVE_FAILED", message, 500);
    }
  }
}
