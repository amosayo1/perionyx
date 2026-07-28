/**
 * AP Workflow Orchestrator
 *
 * Wraps application service calls in Prisma transactions (Unit of Work).
 * Ensures:
 * 1. Cross-aggregate writes are atomic (approval → invoice, payment → invoice)
 * 2. Domain events are published only after successful commit
 * 3. Audit entries are persisted atomically with the operation
 *
 * Usage:
 *   const result = await executeWithUnitOfWork(async (repos) => {
 *     return invoiceService.approveInvoice(cmd, ctx);
 *   });
 */

import { prisma } from "@/server/db/prisma";
import type { PrismaClient } from "@prisma/client";
import type { DomainEvent, AuditEntry } from "./types";
import type { APAuditAction } from "../ap-repositories/types";
import { apEventBus } from "../domain/events/event-bus";
import type { APRepositoryRegistry } from "../ap-repositories/registry";
import { PrismaVendorRepository } from "../ap-repositories/prisma-vendor-repository";
import { PrismaInvoiceRepository } from "../ap-repositories/prisma-invoice-repository";
import { PrismaMatchRepository } from "../ap-repositories/prisma-match-repository";
import { PrismaExceptionRepository } from "../ap-repositories/prisma-exception-repository";
import { PrismaApprovalRepository } from "../ap-repositories/prisma-approval-repository";
import {
  PrismaPaymentProposalRepository,
  PrismaPaymentBatchRepository,
} from "../ap-repositories/prisma-payment-repository";
import { PrismaCreditRepository } from "../ap-repositories/prisma-credit-repository";
import { PrismaReconciliationRepository } from "../ap-repositories/prisma-reconciliation-repository";
import { PrismaAuditRepository } from "../ap-repositories/prisma-audit-repository";

/**
 * Map audit action strings to typed APAuditAction values.
 */
function mapAuditAction(action: string): APAuditAction {
  const valid: APAuditAction[] = [
    "CREATED", "UPDATED", "STATUS_CHANGED", "APPROVED", "REJECTED",
    "VOIDED", "PAID", "EXCEPTION", "RESOLVED", "DELEGATED",
    "ESCALATED", "CONFIG_CHANGED",
  ];
  const upper = action.toUpperCase().replace(/\./g, "_");
  if (valid.includes(upper as APAuditAction)) return upper as APAuditAction;
  return "UPDATED";
}

/**
 * Create a repository registry bound to a specific Prisma transaction.
 * All writes within this registry are part of the same transaction.
 */
function createTransactionRepos(tx: PrismaClient): APRepositoryRegistry {
  return {
    vendor: new PrismaVendorRepository(tx as never),
    invoice: new PrismaInvoiceRepository(tx as never),
    match: new PrismaMatchRepository(tx as never),
    exception: new PrismaExceptionRepository(tx as never),
    approval: new PrismaApprovalRepository(tx as never),
    paymentProposal: new PrismaPaymentProposalRepository(tx as never),
    paymentBatch: new PrismaPaymentBatchRepository(tx as never),
    credit: new PrismaCreditRepository(tx as never),
    reconciliation: new PrismaReconciliationRepository(tx as never),
    audit: new PrismaAuditRepository(tx as never),
  };
}

/**
 * Execute a command within a Prisma interactive transaction.
 * Events are published after successful commit.
 * Audit entries are persisted atomically.
 */
export async function executeWithUnitOfWork<T>(
  commandFn: (
    repos: APRepositoryRegistry,
  ) => Promise<{
    success: boolean;
    data?: T;
    error?: { code: string; message: string; statusCode: number };
    events: DomainEvent[];
    auditEntries: AuditEntry[];
  }>,
): Promise<{
  success: boolean;
  data?: T;
  error?: { code: string; message: string; statusCode: number };
}> {
  const result = await prisma.$transaction(async (tx) => {
    const repos = createTransactionRepos(tx as unknown as PrismaClient);
    const commandResult = await commandFn(repos);

    // Persist audit entries within the transaction
    if (commandResult.auditEntries.length > 0) {
      const auditRepo = repos.audit;
      for (const audit of commandResult.auditEntries) {
        await auditRepo.append({
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          companyId: audit.companyId,
          entityType: audit.resourceType,
          entityId: audit.resourceId,
          action: mapAuditAction(audit.action),
          field: null,
          oldValue: null,
          newValue: null,
          amount: null,
          description: `${audit.action} on ${audit.resourceType} ${audit.resourceId}`,
          reason: typeof audit.metadata.reason === "string" ? audit.metadata.reason : null,
          userId: audit.actorId,
          userRole: "system",
          ipAddress: null,
          userAgent: null,
          correlationId: null,
          metadata: audit.metadata,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return commandResult;
  });

  // Post-commit: publish domain events
  if (result.events.length > 0) {
    await apEventBus.publishAll(result.events);
  }

  return {
    success: result.success,
    data: result.data,
    error: result.error,
  };
}
