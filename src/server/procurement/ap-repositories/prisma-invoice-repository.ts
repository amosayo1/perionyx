/**
 * Phase 21A.2 — Prisma VendorInvoice Repository (CORE aggregate)
 */

import type { PrismaClient, ProcurementVendorInvoice, ProcurementInvoiceLineItem, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  VendorInvoice, InvoiceLineItem, InvoiceAttachment,
  InvoiceQueryFilter, PaginationParams, PaginatedResult, SortParams, VendorInvoiceStatus,
} from "./types";
import type { IInvoiceRepository } from "./invoice-repository";
import { toNumber, toRequiredDate, toDate, toIso, dateRangeFilter } from "./prisma-ap-helpers";

export class PrismaInvoiceRepository implements IInvoiceRepository {
  readonly name = "InvoiceRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(invoice: VendorInvoice): Promise<void> {
    await this.db.procurementVendorInvoice.upsert({
      where: { id: invoice.id },
      create: this.toCreateInput(invoice),
      update: this.toUpdateInput(invoice),
    });
  }

  async findById(id: string, companyId: string): Promise<VendorInvoice | null> {
    const row = await this.db.procurementVendorInvoice.findFirst({ where: { id, companyId } });
    return row ? this.toDomain(row) : null;
  }

  async findByInvoiceNumber(invoiceNumber: string, vendorId: string, companyId: string): Promise<VendorInvoice | null> {
    const row = await this.db.procurementVendorInvoice.findUnique({
      where: { companyId_vendorId_invoiceNumber: { companyId, vendorId, invoiceNumber } },
    });
    return row ? this.toDomain(row) : null;
  }

  async existsByInvoiceNumber(invoiceNumber: string, vendorId: string, companyId: string, excludeId?: string): Promise<boolean> {
    const row = await this.db.procurementVendorInvoice.findUnique({
      where: { companyId_vendorId_invoiceNumber: { companyId, vendorId, invoiceNumber } },
      select: { id: true },
    });
    return row != null && row.id !== excludeId;
  }

  async findByIdempotencyKey(idempotencyKey: string, companyId: string): Promise<VendorInvoice | null> {
    const row = await this.db.procurementVendorInvoice.findFirst({ where: { idempotencyKey, companyId } });
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const r = await this.db.procurementVendorInvoice.deleteMany({ where: { id, companyId } });
    return r.count > 0;
  }

  async findByFilter(filter: InvoiceQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorInvoice>> {
    const where: Prisma.ProcurementVendorInvoiceWhereInput = { companyId: filter.companyId };
    if (filter.vendorId) where.vendorId = filter.vendorId;
    if (filter.status) where.status = Array.isArray(filter.status) ? { in: filter.status } : filter.status;
    if (filter.currency) where.currency = filter.currency;
    if (filter.poReferenceId) where.poReferenceId = filter.poReferenceId;
    const invoiceDateRange = dateRangeFilter(filter.invoiceDateFrom, filter.invoiceDateTo);
    if (invoiceDateRange) where.invoiceDate = invoiceDateRange as Prisma.DateTimeFilter;
    const dueDateRange = dateRangeFilter(filter.dueDateFrom, filter.dueDateTo);
    if (dueDateRange) where.dueDate = dueDateRange as Prisma.DateTimeFilter;
    if (filter.search) {
      where.OR = [{ invoiceNumber: { contains: filter.search, mode: "insensitive" } }];
    }

    const orderBy: Prisma.ProcurementVendorInvoiceOrderByWithRelationInput = sort
      ? ({ [sort.field]: sort.direction } as Prisma.ProcurementVendorInvoiceOrderByWithRelationInput)
      : { createdAt: "desc" };
    const total = await this.db.procurementVendorInvoice.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementVendorInvoice.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.toDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }

    const rows = await this.db.procurementVendorInvoice.findMany({ where, orderBy });
    return { items: rows.map((r) => this.toDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async countByFilter(filter: InvoiceQueryFilter): Promise<number> {
    const where: Prisma.ProcurementVendorInvoiceWhereInput = { companyId: filter.companyId };
    if (filter.vendorId) where.vendorId = filter.vendorId;
    if (filter.status) where.status = Array.isArray(filter.status) ? { in: filter.status } : filter.status;
    return this.db.procurementVendorInvoice.count({ where });
  }

  async findApprovedUnscheduled(companyId: string, sort?: SortParams): Promise<VendorInvoice[]> {
    return this.findByFilter({ companyId, status: "APPROVED" }, sort).then((r) => r.items);
  }

  async findOverdue(companyId: string): Promise<VendorInvoice[]> {
    const rows = await this.db.procurementVendorInvoice.findMany({
      where: {
        companyId, dueDate: { lt: new Date() },
        status: { notIn: ["PAID", "VOIDED", "PARTIALLY_PAID"] as VendorInvoiceStatus[] },
      },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByVendorId(vendorId: string, companyId: string, status?: VendorInvoiceStatus): Promise<VendorInvoice[]> {
    const where: Prisma.ProcurementVendorInvoiceWhereInput = { vendorId, companyId };
    if (status) where.status = status;
    const rows = await this.db.procurementVendorInvoice.findMany({ where, orderBy: { createdAt: "desc" } });
    return rows.map((r) => this.toDomain(r));
  }

  async saveLineItems(lineItems: InvoiceLineItem[]): Promise<void> {
    for (const item of lineItems) {
      await this.db.procurementInvoiceLineItem.upsert({
        where: { id: item.id },
        create: this.lineItemToCreate(item),
        update: this.lineItemToUpdate(item),
      });
    }
  }

  async getLineItems(invoiceId: string, companyId: string): Promise<InvoiceLineItem[]> {
    const rows = await this.db.procurementInvoiceLineItem.findMany({ where: { vendorInvoiceId: invoiceId, companyId } });
    return rows.map((r) => this.lineItemToDomain(r));
  }

  async deleteLineItemsByInvoice(invoiceId: string): Promise<number> {
    const r = await this.db.procurementInvoiceLineItem.deleteMany({ where: { vendorInvoiceId: invoiceId } });
    return r.count;
  }

  async saveAttachment(attachment: InvoiceAttachment): Promise<void> {
    await this.db.procurementInvoiceAttachment.upsert({
      where: { id: attachment.id },
      create: {
        id: attachment.id, companyId: attachment.companyId, vendorInvoiceId: attachment.vendorInvoiceId,
        fileName: attachment.fileName, fileType: attachment.fileType, fileSize: attachment.fileSize,
        storageUrl: attachment.storageUrl, category: attachment.category, ocrExtracted: attachment.ocrExtracted,
        createdBy: attachment.createdBy,
      },
      update: {
        fileName: attachment.fileName, fileType: attachment.fileType, fileSize: attachment.fileSize,
        storageUrl: attachment.storageUrl, category: attachment.category, ocrExtracted: attachment.ocrExtracted,
      },
    });
  }

  async getAttachments(invoiceId: string, companyId: string): Promise<InvoiceAttachment[]> {
    const rows = await this.db.procurementInvoiceAttachment.findMany({ where: { vendorInvoiceId: invoiceId, companyId } });
    return rows.map((r) => ({
      id: r.id, companyId: r.companyId, vendorInvoiceId: r.vendorInvoiceId,
      fileName: r.fileName, fileType: r.fileType, fileSize: r.fileSize,
      storageUrl: r.storageUrl, category: r.category as InvoiceAttachment["category"],
      ocrExtracted: r.ocrExtracted,
      createdAt: r.createdAt.toISOString(), createdBy: r.createdBy,
    }));
  }

  async deleteAttachment(id: string, companyId: string): Promise<boolean> {
    const r = await this.db.procurementInvoiceAttachment.deleteMany({ where: { id, companyId } });
    return r.count > 0;
  }

  async countByStatus(companyId: string): Promise<Record<string, number>> {
    const groups = await this.db.procurementVendorInvoice.groupBy({ by: ["status"], where: { companyId }, _count: true });
    const counts: Record<string, number> = {};
    for (const g of groups) counts[g.status] = g._count;
    return counts;
  }

  async sumOutstandingByVendor(vendorId: string, companyId: string): Promise<number> {
    const result = await this.db.procurementVendorInvoice.aggregate({
      where: { vendorId, companyId, status: { in: ["APPROVED", "PENDING_APPROVAL", "MATCHED"] as VendorInvoiceStatus[] } },
      _sum: { balanceDue: true },
    });
    return toNumber(result._sum.balanceDue);
  }

  async countByVendorAndStatus(vendorId: string, companyId: string, status: VendorInvoiceStatus): Promise<number> {
    return this.db.procurementVendorInvoice.count({ where: { vendorId, companyId, status } });
  }

  // ── Mapping: Invoice ──────────────────────────────────────────────────────

  private toCreateInput(v: VendorInvoice) {
    return {
      id: v.id, companyId: v.companyId, vendorId: v.vendorId,
      invoiceNumber: v.invoiceNumber,
      invoiceDate: toRequiredDate(v.invoiceDate),
      dueDate: toRequiredDate(v.dueDate),
      receivedDate: toRequiredDate(v.receivedDate),
      status: v.status, previousStatus: v.previousStatus,
      statusChangedAt: toDate(v.statusChangedAt),
      poReferenceId: v.poReferenceId, grnReferenceId: v.grnReferenceId,
      currency: v.currency, exchangeRate: v.exchangeRate, baseCurrency: v.baseCurrency,
      subtotal: v.subtotal, taxAmount: v.taxAmount, discountAmount: v.discountAmount,
      shippingAmount: v.shippingAmount, totalAmount: v.totalAmount, totalWithTax: v.totalWithTax,
      amountPaid: v.amountPaid, balanceDue: v.balanceDue, creditApplied: v.creditApplied,
      netBalance: v.netBalance,
      paymentTerms: v.paymentTerms, paymentMethod: v.paymentMethod,
      glAccountId: v.glAccountId, costCenterId: v.costCenterId,
      departmentId: v.departmentId, projectId: v.projectId,
      description: v.description, vendorMemo: v.vendorMemo, internalMemo: v.internalMemo,
      ocrConfidence: v.ocrConfidence, ocrRawText: v.ocrRawText,
      isDuplicateSuspicion: v.isDuplicateSuspicion, duplicateConfidence: v.duplicateConfidence,
      duplicateOfInvoiceId: v.duplicateOfInvoiceId,
      matchResult: v.matchResult, varianceAmount: v.varianceAmount, varianceThreshold: v.varianceThreshold,
      approvalRequired: v.approvalRequired,
      approvedAt: toDate(v.approvedAt), approvedBy: v.approvedBy,
      rejectedAt: toDate(v.rejectedAt), rejectedBy: v.rejectedBy, rejectionReason: v.rejectionReason,
      paymentBatchId: v.paymentBatchId, paymentProposalId: v.paymentProposalId,
      paymentDate: toDate(v.paymentDate), paymentReference: v.paymentReference, checkNumber: v.checkNumber,
      accrualPosted: v.accrualPosted, accrualReversed: v.accrualReversed,
      glPosted: v.glPosted, glPostedAt: toDate(v.glPostedAt),
      periodId: v.periodId, idempotencyKey: v.idempotencyKey, source: v.source,
      createdBy: v.createdBy, updatedBy: v.updatedBy,
    };
  }

  private toUpdateInput(v: VendorInvoice) {
    return {
      ...this.toCreateInput(v),
    };
  }

  private toDomain(row: ProcurementVendorInvoice): VendorInvoice {
    return {
      id: row.id, companyId: row.companyId, vendorId: row.vendorId,
      invoiceNumber: row.invoiceNumber,
      invoiceDate: row.invoiceDate.toISOString(),
      dueDate: row.dueDate.toISOString(),
      receivedDate: row.receivedDate.toISOString(),
      status: row.status as VendorInvoiceStatus,
      previousStatus: row.previousStatus as VendorInvoiceStatus | null,
      statusChangedAt: toIso(row.statusChangedAt),
      poReferenceId: row.poReferenceId, grnReferenceId: row.grnReferenceId,
      currency: row.currency, exchangeRate: toNumber(row.exchangeRate), baseCurrency: row.baseCurrency,
      subtotal: toNumber(row.subtotal), taxAmount: toNumber(row.taxAmount),
      discountAmount: toNumber(row.discountAmount), shippingAmount: toNumber(row.shippingAmount),
      totalAmount: toNumber(row.totalAmount), totalWithTax: toNumber(row.totalWithTax),
      amountPaid: toNumber(row.amountPaid), balanceDue: toNumber(row.balanceDue),
      creditApplied: toNumber(row.creditApplied), netBalance: toNumber(row.netBalance),
      paymentTerms: row.paymentTerms, paymentMethod: row.paymentMethod as VendorInvoice["paymentMethod"],
      glAccountId: row.glAccountId, costCenterId: row.costCenterId,
      departmentId: row.departmentId, projectId: row.projectId,
      description: row.description, vendorMemo: row.vendorMemo, internalMemo: row.internalMemo,
      ocrConfidence: toNumber(row.ocrConfidence), ocrRawText: row.ocrRawText,
      isDuplicateSuspicion: row.isDuplicateSuspicion, duplicateConfidence: toNumber(row.duplicateConfidence),
      duplicateOfInvoiceId: row.duplicateOfInvoiceId,
      matchResult: row.matchResult as VendorInvoice["matchResult"],
      varianceAmount: toNumber(row.varianceAmount), varianceThreshold: toNumber(row.varianceThreshold),
      approvalRequired: row.approvalRequired,
      approvedAt: toIso(row.approvedAt), approvedBy: row.approvedBy,
      rejectedAt: toIso(row.rejectedAt), rejectedBy: row.rejectedBy, rejectionReason: row.rejectionReason,
      paymentBatchId: row.paymentBatchId, paymentProposalId: row.paymentProposalId,
      paymentDate: toIso(row.paymentDate), paymentReference: row.paymentReference, checkNumber: row.checkNumber,
      accrualPosted: row.accrualPosted, accrualReversed: row.accrualReversed,
      glPosted: row.glPosted, glPostedAt: toIso(row.glPostedAt),
      periodId: row.periodId, idempotencyKey: row.idempotencyKey,
      source: row.source as VendorInvoice["source"],
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }

  private lineItemToCreate(item: InvoiceLineItem) {
    return {
      id: item.id, companyId: item.companyId, vendorInvoiceId: item.vendorInvoiceId,
      lineNumber: item.lineNumber, description: item.description,
      quantity: item.quantity, unitOfMeasure: item.unitOfMeasure,
      unitPrice: item.unitPrice, lineTotal: item.lineTotal,
      discountPercent: item.discountPercent, discountAmount: item.discountAmount,
      netLineTotal: item.netLineTotal, taxRate: item.taxRate, taxAmount: item.taxAmount,
      taxJurisdiction: item.taxJurisdiction, taxType: item.taxType,
      glAccountId: item.glAccountId, costCenterId: item.costCenterId,
      departmentId: item.departmentId, projectId: item.projectId,
      poReferenceLineItemId: item.poReferenceLineItemId, grnReferenceLineItemId: item.grnReferenceLineItemId,
      matchStatus: item.matchStatus, matchVariance: item.matchVariance,
      createdBy: item.createdBy, updatedBy: item.updatedBy,
    };
  }

  private lineItemToUpdate(item: InvoiceLineItem) {
    return { ...this.lineItemToCreate(item) };
  }

  private lineItemToDomain(row: ProcurementInvoiceLineItem): InvoiceLineItem {
    return {
      id: row.id, companyId: row.companyId, vendorInvoiceId: row.vendorInvoiceId,
      lineNumber: row.lineNumber, description: row.description,
      quantity: toNumber(row.quantity), unitOfMeasure: row.unitOfMeasure,
      unitPrice: toNumber(row.unitPrice), lineTotal: toNumber(row.lineTotal),
      discountPercent: toNumber(row.discountPercent), discountAmount: toNumber(row.discountAmount),
      netLineTotal: toNumber(row.netLineTotal),
      taxRate: toNumber(row.taxRate), taxAmount: toNumber(row.taxAmount),
      taxJurisdiction: row.taxJurisdiction, taxType: row.taxType as InvoiceLineItem["taxType"],
      glAccountId: row.glAccountId, costCenterId: row.costCenterId,
      departmentId: row.departmentId, projectId: row.projectId,
      poReferenceLineItemId: row.poReferenceLineItemId, grnReferenceLineItemId: row.grnReferenceLineItemId,
      matchStatus: row.matchStatus as InvoiceLineItem["matchStatus"],
      matchVariance: toNumber(row.matchVariance),
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy,
    };
  }
}
