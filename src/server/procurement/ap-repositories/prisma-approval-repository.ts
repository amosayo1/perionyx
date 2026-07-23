/**
 * Phase 21A.2 — Prisma ApprovalChain Repository
 */

import type { PrismaClient, ProcurementApprovalRecord, ProcurementApprovalLevel, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { ApprovalRecord, ApprovalLevel, ApprovalQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";
import type { IApprovalRepository } from "./approval-repository";
import { toNumber, toDate, toIso, parseJsonArray, stringifyJsonArray } from "./prisma-ap-helpers";

export class PrismaApprovalRepository implements IApprovalRepository {
  readonly name = "ApprovalRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async saveRecord(record: ApprovalRecord): Promise<void> {
    await this.db.procurementApprovalRecord.upsert({
      where: { id: record.id },
      create: {
        id: record.id, companyId: record.companyId, vendorInvoiceId: record.vendorInvoiceId,
        approvalLevel: record.approvalLevel, approvalLevelName: record.approvalLevelName,
        requiredRole: record.requiredRole, requiredThreshold: record.requiredThreshold,
        status: record.status, decision: record.decision,
        decisionAt: toDate(record.decisionAt), decisionBy: record.decisionBy,
        decisionComment: record.decisionComment,
        delegatedTo: record.delegatedTo, delegatedAt: toDate(record.delegatedAt),
        delegationReason: record.delegationReason,
        escalated: record.escalated, escalatedAt: toDate(record.escalatedAt),
        escalationReason: record.escalationReason, timeLimit: toDate(record.timeLimit),
        createdBy: record.createdBy, updatedBy: record.updatedBy,
      },
      update: {
        approvalLevel: record.approvalLevel, approvalLevelName: record.approvalLevelName,
        requiredRole: record.requiredRole, requiredThreshold: record.requiredThreshold,
        status: record.status, decision: record.decision,
        decisionAt: toDate(record.decisionAt), decisionBy: record.decisionBy,
        decisionComment: record.decisionComment,
        delegatedTo: record.delegatedTo, delegatedAt: toDate(record.delegatedAt),
        delegationReason: record.delegationReason,
        escalated: record.escalated, escalatedAt: toDate(record.escalatedAt),
        escalationReason: record.escalationReason, timeLimit: toDate(record.timeLimit),
        updatedBy: record.updatedBy,
      },
    });
  }

  async findRecordById(id: string, companyId: string): Promise<ApprovalRecord | null> {
    const row = await this.db.procurementApprovalRecord.findFirst({ where: { id, companyId } });
    return row ? this.recordToDomain(row) : null;
  }

  async findRecordsByInvoiceId(invoiceId: string, companyId: string): Promise<ApprovalRecord[]> {
    const rows = await this.db.procurementApprovalRecord.findMany({
      where: { vendorInvoiceId: invoiceId, companyId }, orderBy: { approvalLevel: "asc" },
    });
    return rows.map((r) => this.recordToDomain(r));
  }

  async findRecordsByFilter(filter: ApprovalQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<ApprovalRecord>> {
    const where: Prisma.ProcurementApprovalRecordWhereInput = { companyId: filter.companyId };
    if (filter.vendorInvoiceId) where.vendorInvoiceId = filter.vendorInvoiceId;
    if (filter.status) where.status = filter.status;
    if (filter.decisionBy) where.decisionBy = filter.decisionBy;

    const orderBy: Prisma.ProcurementApprovalRecordOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any : { createdAt: "desc" };
    const total = await this.db.procurementApprovalRecord.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementApprovalRecord.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.recordToDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }
    const rows = await this.db.procurementApprovalRecord.findMany({ where, orderBy });
    return { items: rows.map((r) => this.recordToDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async findPendingByAssignee(assigneeId: string, companyId: string): Promise<ApprovalRecord[]> {
    const rows = await this.db.procurementApprovalRecord.findMany({
      where: { companyId, status: "PENDING", decisionBy: assigneeId },
    });
    return rows.map((r) => this.recordToDomain(r));
  }

  async countPendingByCompany(companyId: string): Promise<number> {
    return this.db.procurementApprovalRecord.count({ where: { companyId, status: "PENDING" } });
  }

  async saveLevel(level: ApprovalLevel): Promise<void> {
    await this.db.procurementApprovalLevel.upsert({
      where: { id: level.id },
      create: {
        id: level.id, companyId: level.companyId,
        levelNumber: level.levelNumber, levelName: level.levelName,
        minAmount: level.minAmount, maxAmount: level.maxAmount,
        requiredRoles: stringifyJsonArray(level.requiredRoles),
        requiredDepartment: level.requiredDepartment,
        canDelegate: level.canDelegate, canEscalate: level.canEscalate,
        timeLimitHours: level.timeLimitHours, isActive: level.isActive,
        createdBy: level.createdBy, updatedBy: level.updatedBy,
      },
      update: {
        levelNumber: level.levelNumber, levelName: level.levelName,
        minAmount: level.minAmount, maxAmount: level.maxAmount,
        requiredRoles: stringifyJsonArray(level.requiredRoles),
        requiredDepartment: level.requiredDepartment,
        canDelegate: level.canDelegate, canEscalate: level.canEscalate,
        timeLimitHours: level.timeLimitHours, isActive: level.isActive,
        updatedBy: level.updatedBy,
      },
    });
  }

  async findLevelById(id: string, companyId: string): Promise<ApprovalLevel | null> {
    const row = await this.db.procurementApprovalLevel.findFirst({ where: { id, companyId } });
    return row ? this.levelToDomain(row) : null;
  }

  async findLevelByNumber(levelNumber: number, companyId: string): Promise<ApprovalLevel | null> {
    const row = await this.db.procurementApprovalLevel.findUnique({
      where: { companyId_levelNumber: { companyId, levelNumber } },
    });
    return row ? this.levelToDomain(row) : null;
  }

  async getActiveLevels(companyId: string): Promise<ApprovalLevel[]> {
    const rows = await this.db.procurementApprovalLevel.findMany({
      where: { companyId, isActive: true }, orderBy: { levelNumber: "asc" },
    });
    return rows.map((r) => this.levelToDomain(r));
  }

  private recordToDomain(row: ProcurementApprovalRecord): ApprovalRecord {
    return {
      id: row.id, companyId: row.companyId, vendorInvoiceId: row.vendorInvoiceId,
      approvalLevel: row.approvalLevel, approvalLevelName: row.approvalLevelName,
      requiredRole: row.requiredRole, requiredThreshold: toNumber(row.requiredThreshold),
      status: row.status as ApprovalRecord["status"],
      decision: row.decision as ApprovalRecord["decision"],
      decisionAt: toIso(row.decisionAt), decisionBy: row.decisionBy,
      decisionComment: row.decisionComment,
      delegatedTo: row.delegatedTo, delegatedAt: toIso(row.delegatedAt),
      delegationReason: row.delegationReason,
      escalated: row.escalated, escalatedAt: toIso(row.escalatedAt),
      escalationReason: row.escalationReason, timeLimit: toIso(row.timeLimit),
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }

  private levelToDomain(row: ProcurementApprovalLevel): ApprovalLevel {
    return {
      id: row.id, companyId: row.companyId,
      levelNumber: row.levelNumber, levelName: row.levelName,
      minAmount: toNumber(row.minAmount), maxAmount: toNumber(row.maxAmount),
      requiredRoles: parseJsonArray(row.requiredRoles),
      requiredDepartment: row.requiredDepartment,
      canDelegate: row.canDelegate, canEscalate: row.canEscalate,
      timeLimitHours: row.timeLimitHours, isActive: row.isActive,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }
}
