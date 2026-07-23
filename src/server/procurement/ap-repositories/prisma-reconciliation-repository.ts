/**
 * Phase 21A.2 — Prisma VendorStatement & ReconciliationResult Repository
 */

import type { PrismaClient, ProcurementVendorStatement, ProcurementVendorStatementLine, ProcurementReconciliationResult, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  VendorStatement, VendorStatementLine, ReconciliationResult,
  ReconciliationQueryFilter, PaginationParams, PaginatedResult, SortParams,
} from "./types";
import type { IReconciliationRepository } from "./reconciliation-repository";
import { toNumber, toRequiredDate, toDate, toIso } from "./prisma-ap-helpers";

export class PrismaReconciliationRepository implements IReconciliationRepository {
  readonly name = "ReconciliationRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async saveStatement(statement: VendorStatement): Promise<void> {
    await this.db.procurementVendorStatement.upsert({
      where: { id: statement.id },
      create: {
        id: statement.id, companyId: statement.companyId, vendorId: statement.vendorId,
        statementNumber: statement.statementNumber, statementDate: toRequiredDate(statement.statementDate),
        periodStart: toRequiredDate(statement.periodStart), periodEnd: toRequiredDate(statement.periodEnd),
        openingBalance: statement.openingBalance, totalInvoices: statement.totalInvoices,
        totalPayments: statement.totalPayments, totalCredits: statement.totalCredits,
        closingBalance: statement.closingBalance, currency: statement.currency,
        status: statement.status, fileUrl: statement.fileUrl,
        createdBy: statement.createdBy, updatedBy: statement.updatedBy,
      },
      update: {
        statementNumber: statement.statementNumber, statementDate: toRequiredDate(statement.statementDate),
        periodStart: toRequiredDate(statement.periodStart), periodEnd: toRequiredDate(statement.periodEnd),
        openingBalance: statement.openingBalance, totalInvoices: statement.totalInvoices,
        totalPayments: statement.totalPayments, totalCredits: statement.totalCredits,
        closingBalance: statement.closingBalance, currency: statement.currency,
        status: statement.status, fileUrl: statement.fileUrl, updatedBy: statement.updatedBy,
      },
    });
  }

  async findStatementById(id: string, companyId: string): Promise<VendorStatement | null> {
    const row = await this.db.procurementVendorStatement.findFirst({ where: { id, companyId } });
    return row ? this.statementToDomain(row) : null;
  }

  async findStatementsByVendor(vendorId: string, companyId: string): Promise<VendorStatement[]> {
    const rows = await this.db.procurementVendorStatement.findMany({ where: { vendorId, companyId } });
    return rows.map((r) => this.statementToDomain(r));
  }

  async findStatementByFilter(filter: ReconciliationQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorStatement>> {
    const where: Prisma.ProcurementVendorStatementWhereInput = { companyId: filter.companyId };
    if (filter.vendorId) where.vendorId = filter.vendorId;

    const orderBy: Prisma.ProcurementVendorStatementOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any : { createdAt: "desc" };
    const total = await this.db.procurementVendorStatement.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementVendorStatement.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.statementToDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }
    const rows = await this.db.procurementVendorStatement.findMany({ where, orderBy });
    return { items: rows.map((r) => this.statementToDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async saveStatementLines(lines: VendorStatementLine[]): Promise<void> {
    for (const line of lines) {
      await this.db.procurementVendorStatementLine.upsert({
        where: { id: line.id },
        create: {
          id: line.id, companyId: line.companyId, vendorStatementId: line.vendorStatementId,
          lineNumber: line.lineNumber, transactionDate: toRequiredDate(line.transactionDate),
          reference: line.reference, description: line.description,
          debitAmount: line.debitAmount, creditAmount: line.creditAmount, balance: line.balance,
          transactionType: line.transactionType, matchStatus: line.matchStatus,
          matchedInvoiceId: line.matchedInvoiceId, matchedPaymentId: line.matchedPaymentId,
          createdBy: line.createdBy, updatedBy: line.updatedBy,
        },
        update: {
          lineNumber: line.lineNumber, transactionDate: toRequiredDate(line.transactionDate),
          reference: line.reference, description: line.description,
          debitAmount: line.debitAmount, creditAmount: line.creditAmount, balance: line.balance,
          transactionType: line.transactionType, matchStatus: line.matchStatus,
          matchedInvoiceId: line.matchedInvoiceId, matchedPaymentId: line.matchedPaymentId,
          updatedBy: line.updatedBy,
        },
      });
    }
  }

  async getStatementLines(statementId: string, companyId: string): Promise<VendorStatementLine[]> {
    const rows = await this.db.procurementVendorStatementLine.findMany({ where: { vendorStatementId: statementId, companyId } });
    return rows.map((r) => this.lineToDomain(r));
  }

  async deleteStatementLines(statementId: string): Promise<number> {
    const r = await this.db.procurementVendorStatementLine.deleteMany({ where: { vendorStatementId: statementId } });
    return r.count;
  }

  async saveReconciliationResult(result: ReconciliationResult): Promise<void> {
    await this.db.procurementReconciliationResult.upsert({
      where: { id: result.id },
      create: {
        id: result.id, companyId: result.companyId,
        vendorStatementId: result.vendorStatementId, vendorId: result.vendorId,
        reconciliationDate: toRequiredDate(result.reconciliationDate),
        apBalance: result.apBalance, vendorBalance: result.vendorBalance,
        balanceVariance: result.balanceVariance,
        totalLines: result.totalLines, matchedLines: result.matchedLines,
        unmatchedLines: result.unmatchedLines, matchRate: result.matchRate,
        status: result.status, adjustmentAmount: result.adjustmentAmount,
        adjustmentReason: result.adjustmentReason, adjustedBy: result.adjustedBy,
        resolvedBy: result.resolvedBy, resolvedAt: toDate(result.resolvedAt),
        createdBy: result.createdBy, updatedBy: result.updatedBy,
      },
      update: {
        reconciliationDate: toRequiredDate(result.reconciliationDate),
        apBalance: result.apBalance, vendorBalance: result.vendorBalance,
        balanceVariance: result.balanceVariance,
        totalLines: result.totalLines, matchedLines: result.matchedLines,
        unmatchedLines: result.unmatchedLines, matchRate: result.matchRate,
        status: result.status, adjustmentAmount: result.adjustmentAmount,
        adjustmentReason: result.adjustmentReason, adjustedBy: result.adjustedBy,
        resolvedBy: result.resolvedBy, resolvedAt: toDate(result.resolvedAt),
        updatedBy: result.updatedBy,
      },
    });
  }

  async findReconciliationResultById(id: string, companyId: string): Promise<ReconciliationResult | null> {
    const row = await this.db.procurementReconciliationResult.findFirst({ where: { id, companyId } });
    return row ? this.reconciliationToDomain(row) : null;
  }

  async findReconciliationByStatementId(statementId: string, companyId: string): Promise<ReconciliationResult | null> {
    const row = await this.db.procurementReconciliationResult.findFirst({ where: { vendorStatementId: statementId, companyId } });
    return row ? this.reconciliationToDomain(row) : null;
  }

  private statementToDomain(row: ProcurementVendorStatement): VendorStatement {
    return {
      id: row.id, companyId: row.companyId, vendorId: row.vendorId,
      statementNumber: row.statementNumber, statementDate: row.statementDate.toISOString(),
      periodStart: row.periodStart.toISOString(), periodEnd: row.periodEnd.toISOString(),
      openingBalance: toNumber(row.openingBalance), totalInvoices: toNumber(row.totalInvoices),
      totalPayments: toNumber(row.totalPayments), totalCredits: toNumber(row.totalCredits),
      closingBalance: toNumber(row.closingBalance), currency: row.currency,
      status: row.status as VendorStatement["status"], fileUrl: row.fileUrl,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }

  private lineToDomain(row: ProcurementVendorStatementLine): VendorStatementLine {
    return {
      id: row.id, companyId: row.companyId, vendorStatementId: row.vendorStatementId,
      lineNumber: row.lineNumber, transactionDate: row.transactionDate.toISOString(),
      reference: row.reference, description: row.description,
      debitAmount: toNumber(row.debitAmount), creditAmount: toNumber(row.creditAmount),
      balance: toNumber(row.balance),
      transactionType: row.transactionType as VendorStatementLine["transactionType"],
      matchStatus: row.matchStatus as VendorStatementLine["matchStatus"],
      matchedInvoiceId: row.matchedInvoiceId, matchedPaymentId: row.matchedPaymentId,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy,
    };
  }

  private reconciliationToDomain(row: ProcurementReconciliationResult): ReconciliationResult {
    return {
      id: row.id, companyId: row.companyId,
      vendorStatementId: row.vendorStatementId, vendorId: row.vendorId,
      reconciliationDate: row.reconciliationDate.toISOString(),
      apBalance: toNumber(row.apBalance), vendorBalance: toNumber(row.vendorBalance),
      balanceVariance: toNumber(row.balanceVariance),
      totalLines: row.totalLines, matchedLines: row.matchedLines,
      unmatchedLines: row.unmatchedLines, matchRate: toNumber(row.matchRate),
      status: row.status as ReconciliationResult["status"],
      adjustmentAmount: toNumber(row.adjustmentAmount),
      adjustmentReason: row.adjustmentReason, adjustedBy: row.adjustedBy,
      resolvedBy: row.resolvedBy, resolvedAt: toIso(row.resolvedAt),
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }
}
