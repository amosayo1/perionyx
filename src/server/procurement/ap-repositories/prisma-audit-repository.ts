/**
 * Phase 21A.2 — Prisma AP Audit Record Repository (Append-Only)
 */

import type { PrismaClient, ProcurementAPAuditRecord, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { APAuditRecord, AuditQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";
import type { IAuditRepository } from "./audit-repository";
import { toNumber, toRequiredDate, dateRangeFilter } from "./prisma-ap-helpers";

export class PrismaAuditRepository implements IAuditRepository {
  readonly name = "AuditRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async append(record: APAuditRecord): Promise<void> {
    await this.db.procurementAPAuditRecord.create({
      data: {
        id: record.id, companyId: record.companyId,
        entityType: record.entityType, entityId: record.entityId,
        action: record.action, field: record.field,
        oldValue: record.oldValue, newValue: record.newValue,
        amount: record.amount ?? undefined,
        description: record.description, reason: record.reason,
        userId: record.userId, userRole: record.userRole,
        ipAddress: record.ipAddress, userAgent: record.userAgent,
        correlationId: record.correlationId,
        metadata: record.metadata as any ?? undefined,
      },
    });
  }

  async findById(id: string, companyId: string): Promise<APAuditRecord | null> {
    const row = await this.db.procurementAPAuditRecord.findFirst({ where: { id, companyId } });
    return row ? this.toDomain(row) : null;
  }

  async findByFilter(filter: AuditQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<APAuditRecord>> {
    const where: Prisma.ProcurementAPAuditRecordWhereInput = { companyId: filter.companyId };
    if (filter.entityType) where.entityType = filter.entityType;
    if (filter.entityId) where.entityId = filter.entityId;
    if (filter.action) where.action = filter.action;
    if (filter.userId) where.userId = filter.userId;
    if (filter.correlationId) where.correlationId = filter.correlationId;
    const dateRange = dateRangeFilter(filter.createdAtFrom, filter.createdAtTo);
    if (dateRange) where.createdAt = dateRange as any;

    const orderBy: Prisma.ProcurementAPAuditRecordOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any : { createdAt: "desc" };

    const total = await this.db.procurementAPAuditRecord.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementAPAuditRecord.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.toDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }

    const rows = await this.db.procurementAPAuditRecord.findMany({ where, orderBy });
    return { items: rows.map((r) => this.toDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async getEntityAuditTrail(entityType: string, entityId: string, companyId: string): Promise<APAuditRecord[]> {
    const rows = await this.db.procurementAPAuditRecord.findMany({
      where: { entityType, entityId, companyId }, orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async countByFilter(filter: AuditQueryFilter): Promise<number> {
    const where: Prisma.ProcurementAPAuditRecordWhereInput = { companyId: filter.companyId };
    if (filter.entityType) where.entityType = filter.entityType;
    if (filter.entityId) where.entityId = filter.entityId;
    if (filter.action) where.action = filter.action;
    if (filter.userId) where.userId = filter.userId;
    if (filter.correlationId) where.correlationId = filter.correlationId;
    return this.db.procurementAPAuditRecord.count({ where });
  }

  private toDomain(row: ProcurementAPAuditRecord): APAuditRecord {
    return {
      id: row.id, companyId: row.companyId,
      entityType: row.entityType, entityId: row.entityId,
      action: row.action as APAuditRecord["action"],
      field: row.field, oldValue: row.oldValue, newValue: row.newValue,
      amount: toNumber(row.amount), description: row.description, reason: row.reason,
      userId: row.userId, userRole: row.userRole,
      ipAddress: row.ipAddress, userAgent: row.userAgent, correlationId: row.correlationId,
      metadata: (row.metadata as Record<string, unknown>) ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
