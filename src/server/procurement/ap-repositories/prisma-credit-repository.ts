/**
 * Phase 21A.2 — Prisma VendorCredit Repository
 */

import type { PrismaClient, ProcurementVendorCredit, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { VendorCredit, CreditQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";
import type { ICreditRepository } from "./credit-repository";
import { toNumber, toRequiredDate, toDate, toIso } from "./prisma-ap-helpers";

export class PrismaCreditRepository implements ICreditRepository {
  readonly name = "CreditRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(credit: VendorCredit): Promise<void> {
    await this.db.procurementVendorCredit.upsert({
      where: { id: credit.id },
      create: {
        id: credit.id, companyId: credit.companyId, vendorId: credit.vendorId,
        creditNumber: credit.creditNumber, creditDate: toRequiredDate(credit.creditDate),
        creditAmount: credit.creditAmount, appliedAmount: credit.appliedAmount,
        currency: credit.currency, status: credit.status,
        appliedToInvoiceId: credit.appliedToInvoiceId,
        expiryDate: toDate(credit.expiryDate), reason: credit.reason,
        createdBy: credit.createdBy, updatedBy: credit.updatedBy,
      },
      update: {
        creditNumber: credit.creditNumber, creditDate: toRequiredDate(credit.creditDate),
        creditAmount: credit.creditAmount, appliedAmount: credit.appliedAmount,
        currency: credit.currency, status: credit.status,
        appliedToInvoiceId: credit.appliedToInvoiceId,
        expiryDate: toDate(credit.expiryDate), reason: credit.reason,
        updatedBy: credit.updatedBy,
      },
    });
  }

  async findById(id: string, companyId: string): Promise<VendorCredit | null> {
    const row = await this.db.procurementVendorCredit.findFirst({ where: { id, companyId } });
    return row ? this.toDomain(row) : null;
  }

  async findByCreditNumber(creditNumber: string, vendorId: string, companyId: string): Promise<VendorCredit | null> {
    const row = await this.db.procurementVendorCredit.findFirst({ where: { companyId, vendorId, creditNumber } });
    return row ? this.toDomain(row) : null;
  }

  async findByFilter(filter: CreditQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorCredit>> {
    const where: Prisma.ProcurementVendorCreditWhereInput = { companyId: filter.companyId };
    if (filter.vendorId) where.vendorId = filter.vendorId;
    if (filter.status) where.status = filter.status;
    if (filter.invoiceId) where.appliedToInvoiceId = filter.invoiceId;

    const orderBy: Prisma.ProcurementVendorCreditOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any : { createdAt: "desc" };
    const total = await this.db.procurementVendorCredit.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementVendorCredit.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.toDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }
    const rows = await this.db.procurementVendorCredit.findMany({ where, orderBy });
    return { items: rows.map((r) => this.toDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async findOpenByVendor(vendorId: string, companyId: string): Promise<VendorCredit[]> {
    const rows = await this.db.procurementVendorCredit.findMany({
      where: { vendorId, companyId, status: { in: ["ISSUED", "PARTIALLY_APPLIED"] } },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByInvoiceId(invoiceId: string, companyId: string): Promise<VendorCredit | null> {
    const row = await this.db.procurementVendorCredit.findFirst({ where: { appliedToInvoiceId: invoiceId, companyId } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: ProcurementVendorCredit): VendorCredit {
    return {
      id: row.id, companyId: row.companyId, vendorId: row.vendorId,
      creditNumber: row.creditNumber, creditDate: row.creditDate.toISOString(),
      creditAmount: toNumber(row.creditAmount), appliedAmount: toNumber(row.appliedAmount),
      currency: row.currency, status: row.status as VendorCredit["status"],
      appliedToInvoiceId: row.appliedToInvoiceId,
      expiryDate: toIso(row.expiryDate), reason: row.reason,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }
}
