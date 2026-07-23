import { InMemoryVendorRepository } from "./vendor-repository";
import { InMemoryInvoiceRepository } from "./invoice-repository";
import { InMemoryMatchRepository } from "./match-repository";
import { InMemoryExceptionRepository } from "./exception-repository";
import { InMemoryApprovalRepository } from "./approval-repository";
import { InMemoryPaymentProposalRepository, InMemoryPaymentBatchRepository } from "./payment-repository";
import { InMemoryCreditRepository } from "./credit-repository";
import { InMemoryReconciliationRepository } from "./reconciliation-repository";
import { InMemoryAuditRepository } from "./audit-repository";
import type { APRepositoryRegistry } from "./registry";

export class InMemoryAPRepositoryRegistry implements APRepositoryRegistry {
  readonly vendor = new InMemoryVendorRepository();
  readonly invoice = new InMemoryInvoiceRepository();
  readonly match = new InMemoryMatchRepository();
  readonly exception = new InMemoryExceptionRepository();
  readonly approval = new InMemoryApprovalRepository();
  readonly paymentProposal = new InMemoryPaymentProposalRepository();
  readonly paymentBatch = new InMemoryPaymentBatchRepository();
  readonly credit = new InMemoryCreditRepository();
  readonly reconciliation = new InMemoryReconciliationRepository();
  readonly audit = new InMemoryAuditRepository();
}
