/**
 * Phase 21A.2 — Prisma PaymentProposal & PaymentBatch Repositories
 */

import type { PrismaClient, ProcurementPaymentProposal, ProcurementPaymentProposalItem, ProcurementPaymentBatch, ProcurementPaymentRecord, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  PaymentProposal, PaymentProposalItem, PaymentBatch, PaymentRecord,
  PaymentProposalQueryFilter, PaymentBatchQueryFilter, PaginationParams, PaginatedResult, SortParams,
} from "./types";
import type { IPaymentProposalRepository, IPaymentBatchRepository } from "./payment-repository";
import { toNumber, toRequiredDate, toDate, toIso, dateRangeFilter } from "./prisma-ap-helpers";

// ── PrismaPaymentProposalRepository ────────────────────────────────────────

export class PrismaPaymentProposalRepository implements IPaymentProposalRepository {
  readonly name = "PaymentProposalRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(proposal: PaymentProposal): Promise<void> {
    await this.db.procurementPaymentProposal.upsert({
      where: { id: proposal.id },
      create: {
        id: proposal.id, companyId: proposal.companyId,
        proposalNumber: proposal.proposalNumber, proposalDate: toRequiredDate(proposal.proposalDate),
        paymentDate: toRequiredDate(proposal.paymentDate),
        currency: proposal.currency, totalAmount: proposal.totalAmount,
        totalInvoices: proposal.totalInvoices, totalVendors: proposal.totalVendors,
        paymentMethod: proposal.paymentMethod,
        prioritizeDiscounts: proposal.prioritizeDiscounts,
        includePartialPayments: proposal.includePartialPayments,
        status: proposal.status,
        submittedBy: proposal.submittedBy, submittedAt: toDate(proposal.submittedAt),
        reviewedBy: proposal.reviewedBy, reviewedAt: toDate(proposal.reviewedAt),
        approvedBy: proposal.approvedBy, approvedAt: toDate(proposal.approvedAt),
        rejectedBy: proposal.rejectedBy, rejectionReason: proposal.rejectionReason,
        createdBy: proposal.createdBy, updatedBy: proposal.updatedBy,
      },
      update: {
        proposalNumber: proposal.proposalNumber, paymentDate: toRequiredDate(proposal.paymentDate),
        currency: proposal.currency, totalAmount: proposal.totalAmount,
        totalInvoices: proposal.totalInvoices, totalVendors: proposal.totalVendors,
        paymentMethod: proposal.paymentMethod,
        prioritizeDiscounts: proposal.prioritizeDiscounts,
        includePartialPayments: proposal.includePartialPayments,
        status: proposal.status,
        submittedBy: proposal.submittedBy, submittedAt: toDate(proposal.submittedAt),
        reviewedBy: proposal.reviewedBy, reviewedAt: toDate(proposal.reviewedAt),
        approvedBy: proposal.approvedBy, approvedAt: toDate(proposal.approvedAt),
        rejectedBy: proposal.rejectedBy, rejectionReason: proposal.rejectionReason,
        updatedBy: proposal.updatedBy,
      },
    });
  }

  async findById(id: string, companyId: string): Promise<PaymentProposal | null> {
    const row = await this.db.procurementPaymentProposal.findFirst({ where: { id, companyId } });
    return row ? this.proposalToDomain(row) : null;
  }

  async findByProposalNumber(proposalNumber: string, companyId: string): Promise<PaymentProposal | null> {
    const row = await this.db.procurementPaymentProposal.findUnique({
      where: { companyId_proposalNumber: { companyId, proposalNumber } },
    });
    return row ? this.proposalToDomain(row) : null;
  }

  async findByFilter(filter: PaymentProposalQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<PaymentProposal>> {
    const where: Prisma.ProcurementPaymentProposalWhereInput = { companyId: filter.companyId };
    if (filter.status) where.status = filter.status;
    const payDateRange = dateRangeFilter(filter.paymentDateFrom, filter.paymentDateTo);
    if (payDateRange) where.paymentDate = payDateRange as any;

    const orderBy: Prisma.ProcurementPaymentProposalOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any : { createdAt: "desc" };
    const total = await this.db.procurementPaymentProposal.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementPaymentProposal.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.proposalToDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }
    const rows = await this.db.procurementPaymentProposal.findMany({ where, orderBy });
    return { items: rows.map((r) => this.proposalToDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async findActiveByInvoiceId(invoiceId: string, companyId: string): Promise<PaymentProposal | null> {
    const item = await this.db.procurementPaymentProposalItem.findFirst({
      where: { vendorInvoiceId: invoiceId, companyId },
      include: { paymentProposal: true },
    });
    if (!item) return null;
    const p = (item as any).paymentProposal as ProcurementPaymentProposal | undefined;
    if (!p || !["DRAFT", "SUBMITTED"].includes(p.status)) return null;
    return this.proposalToDomain(p);
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const r = await this.db.procurementPaymentProposal.deleteMany({ where: { id, companyId } });
    return r.count > 0;
  }

  async saveItems(items: PaymentProposalItem[]): Promise<void> {
    for (const item of items) {
      await this.db.procurementPaymentProposalItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id, companyId: item.companyId, paymentProposalId: item.paymentProposalId,
          vendorInvoiceId: item.vendorInvoiceId, vendorId: item.vendorId,
          amount: item.amount, discountTaken: item.discountTaken,
          creditApplied: item.creditApplied, netPayment: item.netPayment,
          paymentPriority: item.paymentPriority, selectedBy: item.selectedBy,
          notes: item.notes, createdBy: item.createdBy, updatedBy: item.updatedBy,
        },
        update: {
          amount: item.amount, discountTaken: item.discountTaken,
          creditApplied: item.creditApplied, netPayment: item.netPayment,
          paymentPriority: item.paymentPriority, selectedBy: item.selectedBy,
          notes: item.notes, updatedBy: item.updatedBy,
        },
      });
    }
  }

  async getItems(proposalId: string, companyId: string): Promise<PaymentProposalItem[]> {
    const rows = await this.db.procurementPaymentProposalItem.findMany({ where: { paymentProposalId: proposalId, companyId } });
    return rows.map((r) => this.itemToDomain(r));
  }

  async deleteItem(id: string, companyId: string): Promise<boolean> {
    const r = await this.db.procurementPaymentProposalItem.deleteMany({ where: { id, companyId } });
    return r.count > 0;
  }

  private proposalToDomain(row: ProcurementPaymentProposal): PaymentProposal {
    return {
      id: row.id, companyId: row.companyId, proposalNumber: row.proposalNumber,
      proposalDate: row.proposalDate.toISOString(), paymentDate: row.paymentDate.toISOString(),
      currency: row.currency, totalAmount: toNumber(row.totalAmount),
      totalInvoices: row.totalInvoices, totalVendors: row.totalVendors,
      paymentMethod: row.paymentMethod as PaymentProposal["paymentMethod"],
      prioritizeDiscounts: row.prioritizeDiscounts, includePartialPayments: row.includePartialPayments,
      status: row.status as PaymentProposal["status"],
      submittedBy: row.submittedBy, submittedAt: toIso(row.submittedAt),
      reviewedBy: row.reviewedBy, reviewedAt: toIso(row.reviewedAt),
      approvedBy: row.approvedBy, approvedAt: toIso(row.approvedAt),
      rejectedBy: row.rejectedBy, rejectionReason: row.rejectionReason,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }

  private itemToDomain(row: ProcurementPaymentProposalItem): PaymentProposalItem {
    return {
      id: row.id, companyId: row.companyId, paymentProposalId: row.paymentProposalId,
      vendorInvoiceId: row.vendorInvoiceId, vendorId: row.vendorId,
      amount: toNumber(row.amount), discountTaken: toNumber(row.discountTaken),
      creditApplied: toNumber(row.creditApplied), netPayment: toNumber(row.netPayment),
      paymentPriority: row.paymentPriority, selectedBy: row.selectedBy as PaymentProposalItem["selectedBy"],
      notes: row.notes,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy,
    };
  }
}

// ── PrismaPaymentBatchRepository ───────────────────────────────────────────

export class PrismaPaymentBatchRepository implements IPaymentBatchRepository {
  readonly name = "PaymentBatchRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(batch: PaymentBatch): Promise<void> {
    await this.db.procurementPaymentBatch.upsert({
      where: { id: batch.id },
      create: {
        id: batch.id, companyId: batch.companyId, batchNumber: batch.batchNumber,
        paymentProposalId: batch.paymentProposalId,
        paymentMethod: batch.paymentMethod, bankAccountId: batch.bankAccountId,
        totalPayments: batch.totalPayments, totalAmount: batch.totalAmount,
        totalFees: batch.totalFees, netDisbursement: batch.netDisbursement,
        fileUrl: batch.fileUrl, fileName: batch.fileName,
        status: batch.status, submittedAt: toDate(batch.submittedAt),
        completedAt: toDate(batch.completedAt), confirmedBy: batch.confirmedBy,
        createdBy: batch.createdBy, updatedBy: batch.updatedBy,
      },
      update: {
        batchNumber: batch.batchNumber, paymentMethod: batch.paymentMethod, bankAccountId: batch.bankAccountId,
        totalPayments: batch.totalPayments, totalAmount: batch.totalAmount,
        totalFees: batch.totalFees, netDisbursement: batch.netDisbursement,
        fileUrl: batch.fileUrl, fileName: batch.fileName,
        status: batch.status, submittedAt: toDate(batch.submittedAt),
        completedAt: toDate(batch.completedAt), confirmedBy: batch.confirmedBy,
        updatedBy: batch.updatedBy,
      },
    });
  }

  async findById(id: string, companyId: string): Promise<PaymentBatch | null> {
    const row = await this.db.procurementPaymentBatch.findFirst({ where: { id, companyId } });
    return row ? this.batchToDomain(row) : null;
  }

  async findByBatchNumber(batchNumber: string, companyId: string): Promise<PaymentBatch | null> {
    const row = await this.db.procurementPaymentBatch.findUnique({
      where: { companyId_batchNumber: { companyId, batchNumber } },
    });
    return row ? this.batchToDomain(row) : null;
  }

  async findByProposalId(proposalId: string, companyId: string): Promise<PaymentBatch | null> {
    const row = await this.db.procurementPaymentBatch.findFirst({ where: { paymentProposalId: proposalId, companyId } });
    return row ? this.batchToDomain(row) : null;
  }

  async findByFilter(filter: PaymentBatchQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<PaymentBatch>> {
    const where: Prisma.ProcurementPaymentBatchWhereInput = { companyId: filter.companyId };
    if (filter.status) where.status = filter.status;
    if (filter.paymentMethod) where.paymentMethod = filter.paymentMethod;

    const orderBy: Prisma.ProcurementPaymentBatchOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any : { createdAt: "desc" };
    const total = await this.db.procurementPaymentBatch.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementPaymentBatch.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.batchToDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }
    const rows = await this.db.procurementPaymentBatch.findMany({ where, orderBy });
    return { items: rows.map((r) => this.batchToDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const r = await this.db.procurementPaymentBatch.deleteMany({ where: { id, companyId } });
    return r.count > 0;
  }

  async savePaymentRecord(record: PaymentRecord): Promise<void> {
    await this.db.procurementPaymentRecord.upsert({
      where: { id: record.id },
      create: {
        id: record.id, companyId: record.companyId, paymentNumber: record.paymentNumber,
        paymentBatchId: record.paymentBatchId, vendorInvoiceId: record.vendorInvoiceId, vendorId: record.vendorId,
        paymentDate: toRequiredDate(record.paymentDate),
        amount: record.amount, discountTaken: record.discountTaken,
        creditApplied: record.creditApplied, netPayment: record.netPayment,
        currency: record.currency, exchangeRate: record.exchangeRate, baseCurrencyAmount: record.baseCurrencyAmount,
        paymentMethod: record.paymentMethod, bankAccountId: record.bankAccountId,
        transactionReference: record.transactionReference, checkNumber: record.checkNumber,
        status: record.status, glPosted: record.glPosted, glPostedAt: toDate(record.glPostedAt),
        glReversalPosted: record.glReversalPosted, idempotencyKey: record.idempotencyKey,
        voidedAt: toDate(record.voidedAt), voidedBy: record.voidedBy, voidReason: record.voidReason,
        createdBy: record.createdBy, updatedBy: record.updatedBy,
      },
      update: {
        paymentNumber: record.paymentNumber, vendorInvoiceId: record.vendorInvoiceId, vendorId: record.vendorId,
        paymentDate: toRequiredDate(record.paymentDate),
        amount: record.amount, discountTaken: record.discountTaken,
        creditApplied: record.creditApplied, netPayment: record.netPayment,
        currency: record.currency, exchangeRate: record.exchangeRate, baseCurrencyAmount: record.baseCurrencyAmount,
        paymentMethod: record.paymentMethod, bankAccountId: record.bankAccountId,
        transactionReference: record.transactionReference, checkNumber: record.checkNumber,
        status: record.status, glPosted: record.glPosted, glPostedAt: toDate(record.glPostedAt),
        glReversalPosted: record.glReversalPosted,
        voidedAt: toDate(record.voidedAt), voidedBy: record.voidedBy, voidReason: record.voidReason,
        updatedBy: record.updatedBy,
      },
    });
  }

  async findPaymentRecordById(id: string, companyId: string): Promise<PaymentRecord | null> {
    const row = await this.db.procurementPaymentRecord.findFirst({ where: { id, companyId } });
    return row ? this.recordToDomain(row) : null;
  }

  async findByInvoiceId(invoiceId: string, companyId: string): Promise<PaymentRecord | null> {
    const row = await this.db.procurementPaymentRecord.findFirst({ where: { vendorInvoiceId: invoiceId, companyId } });
    return row ? this.recordToDomain(row) : null;
  }

  async getPaymentRecords(batchId: string, companyId: string): Promise<PaymentRecord[]> {
    const rows = await this.db.procurementPaymentRecord.findMany({ where: { paymentBatchId: batchId, companyId } });
    return rows.map((r) => this.recordToDomain(r));
  }

  async findByIdempotencyKey(idempotencyKey: string, companyId: string): Promise<PaymentRecord | null> {
    const row = await this.db.procurementPaymentRecord.findFirst({ where: { idempotencyKey, companyId } });
    return row ? this.recordToDomain(row) : null;
  }

  private batchToDomain(row: ProcurementPaymentBatch): PaymentBatch {
    return {
      id: row.id, companyId: row.companyId, batchNumber: row.batchNumber,
      paymentProposalId: row.paymentProposalId,
      paymentMethod: row.paymentMethod as PaymentBatch["paymentMethod"],
      bankAccountId: row.bankAccountId,
      totalPayments: row.totalPayments, totalAmount: toNumber(row.totalAmount),
      totalFees: toNumber(row.totalFees), netDisbursement: toNumber(row.netDisbursement),
      fileUrl: row.fileUrl, fileName: row.fileName,
      status: row.status as PaymentBatch["status"],
      submittedAt: toIso(row.submittedAt), completedAt: toIso(row.completedAt),
      confirmedBy: row.confirmedBy,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }

  private recordToDomain(row: ProcurementPaymentRecord): PaymentRecord {
    return {
      id: row.id, companyId: row.companyId, paymentNumber: row.paymentNumber,
      paymentBatchId: row.paymentBatchId, vendorInvoiceId: row.vendorInvoiceId, vendorId: row.vendorId,
      paymentDate: row.paymentDate.toISOString(),
      amount: toNumber(row.amount), discountTaken: toNumber(row.discountTaken),
      creditApplied: toNumber(row.creditApplied), netPayment: toNumber(row.netPayment),
      currency: row.currency, exchangeRate: toNumber(row.exchangeRate),
      baseCurrencyAmount: toNumber(row.baseCurrencyAmount),
      paymentMethod: row.paymentMethod as PaymentRecord["paymentMethod"],
      bankAccountId: row.bankAccountId, transactionReference: row.transactionReference,
      checkNumber: row.checkNumber, status: row.status as PaymentRecord["status"],
      glPosted: row.glPosted, glPostedAt: toIso(row.glPostedAt),
      glReversalPosted: row.glReversalPosted, idempotencyKey: row.idempotencyKey,
      voidedAt: toIso(row.voidedAt), voidedBy: row.voidedBy, voidReason: row.voidReason,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }
}
