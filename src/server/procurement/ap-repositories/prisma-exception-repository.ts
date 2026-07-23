/**
 * Phase 21A.2 — Prisma InvoiceException Repository
 */

import type { PrismaClient, ProcurementInvoiceException, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { InvoiceException, ExceptionQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";
import type { IExceptionRepository } from "./exception-repository";
import { toNumber, toDate, toIso } from "./prisma-ap-helpers";

export class PrismaExceptionRepository implements IExceptionRepository {
  readonly name = "ExceptionRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(exception: InvoiceException): Promise<void> {
    await this.db.procurementInvoiceException.upsert({
      where: { id: exception.id },
      create: {
        id: exception.id, companyId: exception.companyId, vendorInvoiceId: exception.vendorInvoiceId,
        exceptionType: exception.exceptionType, severity: exception.severity,
        description: exception.description, varianceAmount: exception.varianceAmount,
        relatedEntityId: exception.relatedEntityId, status: exception.status,
        assignedTo: exception.assignedTo, resolution: exception.resolution,
        resolvedAt: toDate(exception.resolvedAt), resolvedBy: exception.resolvedBy,
        escalatedTo: exception.escalatedTo, escalatedAt: toDate(exception.escalatedAt),
        createdBy: exception.createdBy, updatedBy: exception.updatedBy,
      },
      update: {
        exceptionType: exception.exceptionType, severity: exception.severity,
        description: exception.description, varianceAmount: exception.varianceAmount,
        relatedEntityId: exception.relatedEntityId, status: exception.status,
        assignedTo: exception.assignedTo, resolution: exception.resolution,
        resolvedAt: toDate(exception.resolvedAt), resolvedBy: exception.resolvedBy,
        escalatedTo: exception.escalatedTo, escalatedAt: toDate(exception.escalatedAt),
        updatedBy: exception.updatedBy,
      },
    });
  }

  async findById(id: string, companyId: string): Promise<InvoiceException | null> {
    const row = await this.db.procurementInvoiceException.findFirst({ where: { id, companyId } });
    return row ? this.toDomain(row) : null;
  }

  async findByFilter(filter: ExceptionQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<InvoiceException>> {
    const where: Prisma.ProcurementInvoiceExceptionWhereInput = { companyId: filter.companyId };
    if (filter.vendorInvoiceId) where.vendorInvoiceId = filter.vendorInvoiceId;
    if (filter.status) where.status = filter.status;
    if (filter.severity) where.severity = filter.severity;
    if (filter.exceptionType) where.exceptionType = filter.exceptionType;
    if (filter.assignedTo) where.assignedTo = filter.assignedTo;

    const orderBy: Prisma.ProcurementInvoiceExceptionOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any : { createdAt: "desc" };
    const total = await this.db.procurementInvoiceException.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementInvoiceException.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.toDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }
    const rows = await this.db.procurementInvoiceException.findMany({ where, orderBy });
    return { items: rows.map((r) => this.toDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async findByInvoiceId(invoiceId: string, companyId: string): Promise<InvoiceException[]> {
    const rows = await this.db.procurementInvoiceException.findMany({ where: { vendorInvoiceId: invoiceId, companyId } });
    return rows.map((r) => this.toDomain(r));
  }

  async findOpenByInvoiceId(invoiceId: string, companyId: string): Promise<InvoiceException | null> {
    const row = await this.db.procurementInvoiceException.findFirst({
      where: { vendorInvoiceId: invoiceId, companyId, status: { in: ["OPEN", "IN_REVIEW", "ESCALATED"] } },
    });
    return row ? this.toDomain(row) : null;
  }

  async countByFilter(filter: ExceptionQueryFilter): Promise<number> {
    const where: Prisma.ProcurementInvoiceExceptionWhereInput = { companyId: filter.companyId };
    if (filter.vendorInvoiceId) where.vendorInvoiceId = filter.vendorInvoiceId;
    if (filter.status) where.status = filter.status;
    if (filter.severity) where.severity = filter.severity;
    if (filter.exceptionType) where.exceptionType = filter.exceptionType;
    if (filter.assignedTo) where.assignedTo = filter.assignedTo;
    return this.db.procurementInvoiceException.count({ where });
  }

  async countOpenByCompany(companyId: string): Promise<number> {
    return this.db.procurementInvoiceException.count({ where: { companyId, status: "OPEN" } });
  }

  private toDomain(row: ProcurementInvoiceException): InvoiceException {
    return {
      id: row.id, companyId: row.companyId, vendorInvoiceId: row.vendorInvoiceId,
      exceptionType: row.exceptionType as InvoiceException["exceptionType"],
      severity: row.severity as InvoiceException["severity"],
      description: row.description, varianceAmount: toNumber(row.varianceAmount),
      relatedEntityId: row.relatedEntityId, status: row.status as InvoiceException["status"],
      assignedTo: row.assignedTo, resolution: row.resolution,
      resolvedAt: toIso(row.resolvedAt), resolvedBy: row.resolvedBy,
      escalatedTo: row.escalatedTo, escalatedAt: toIso(row.escalatedAt),
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }
}
