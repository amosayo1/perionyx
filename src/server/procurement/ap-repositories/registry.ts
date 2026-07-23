/**
 * Phase 21A.2 — AP Repository Registry
 *
 * Initializes and provides access to all Prisma-backed AP repositories.
 * For tests, inject InMemory implementations directly.
 */

import { prisma } from "@/server/db/prisma";
import { PrismaVendorRepository } from "./prisma-vendor-repository";
import { PrismaInvoiceRepository } from "./prisma-invoice-repository";
import { PrismaMatchRepository } from "./prisma-match-repository";
import { PrismaExceptionRepository } from "./prisma-exception-repository";
import { PrismaApprovalRepository } from "./prisma-approval-repository";
import { PrismaPaymentProposalRepository, PrismaPaymentBatchRepository } from "./prisma-payment-repository";
import { PrismaCreditRepository } from "./prisma-credit-repository";
import { PrismaReconciliationRepository } from "./prisma-reconciliation-repository";
import { PrismaAuditRepository } from "./prisma-audit-repository";

import type { IVendorRepository } from "./vendor-repository";
import type { IInvoiceRepository } from "./invoice-repository";
import type { IMatchRepository } from "./match-repository";
import type { IExceptionRepository } from "./exception-repository";
import type { IApprovalRepository } from "./approval-repository";
import type { IPaymentProposalRepository, IPaymentBatchRepository } from "./payment-repository";
import type { ICreditRepository } from "./credit-repository";
import type { IReconciliationRepository } from "./reconciliation-repository";
import type { IAuditRepository } from "./audit-repository";

export interface APRepositoryRegistry {
  vendor: IVendorRepository;
  invoice: IInvoiceRepository;
  match: IMatchRepository;
  exception: IExceptionRepository;
  approval: IApprovalRepository;
  paymentProposal: IPaymentProposalRepository;
  paymentBatch: IPaymentBatchRepository;
  credit: ICreditRepository;
  reconciliation: IReconciliationRepository;
  audit: IAuditRepository;
}

let registry: APRepositoryRegistry | null = null;

/**
 * Initialize the AP repository registry with Prisma-backed implementations.
 * Safe to call multiple times — only initializes once.
 */
export function initializeAPRepositories(): APRepositoryRegistry {
  if (registry) return registry;

  registry = {
    vendor: new PrismaVendorRepository(prisma),
    invoice: new PrismaInvoiceRepository(prisma),
    match: new PrismaMatchRepository(prisma),
    exception: new PrismaExceptionRepository(prisma),
    approval: new PrismaApprovalRepository(prisma),
    paymentProposal: new PrismaPaymentProposalRepository(prisma),
    paymentBatch: new PrismaPaymentBatchRepository(prisma),
    credit: new PrismaCreditRepository(prisma),
    reconciliation: new PrismaReconciliationRepository(prisma),
    audit: new PrismaAuditRepository(prisma),
  };

  return registry;
}

/**
 * Get the initialized AP repository registry.
 * Must call initializeAPRepositories() first.
 */
export function getAPRepositories(): APRepositoryRegistry {
  if (!registry) {
    return initializeAPRepositories();
  }
  return registry;
}

/**
 * Reset the registry (for testing only).
 */
export function resetAPRepositories(): void {
  registry = null;
}
