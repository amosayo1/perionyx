/**
 * Phase 21A.2 — Prisma ThreeWayMatch Repository
 */

import type { PrismaClient, ProcurementThreeWayMatch, ProcurementMatchLineItem, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { ThreeWayMatch, MatchLineItem, MatchQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";
import type { IMatchRepository } from "./match-repository";
import { toNumber, toRequiredDate, toIso } from "./prisma-ap-helpers";

export class PrismaMatchRepository implements IMatchRepository {
  readonly name = "MatchRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(match: ThreeWayMatch): Promise<void> {
    await this.db.procurementThreeWayMatch.upsert({
      where: { id: match.id },
      create: {
        id: match.id, companyId: match.companyId, vendorInvoiceId: match.vendorInvoiceId,
        poReferenceId: match.poReferenceId, grnReferenceId: match.grnReferenceId,
        matchResult: match.matchResult, overallConfidence: match.overallConfidence,
        priceVarianceTotal: match.priceVarianceTotal, quantityVarianceTotal: match.quantityVarianceTotal,
        totalVariance: match.totalVariance, variancePercent: match.variancePercent,
        autoApproved: match.autoApproved, approvalThreshold: match.approvalThreshold,
        matchedAt: toRequiredDate(match.matchedAt), matchedBy: match.matchedBy,
        createdBy: match.createdBy, updatedBy: match.updatedBy,
      },
      update: {
        matchResult: match.matchResult, overallConfidence: match.overallConfidence,
        priceVarianceTotal: match.priceVarianceTotal, quantityVarianceTotal: match.quantityVarianceTotal,
        totalVariance: match.totalVariance, variancePercent: match.variancePercent,
        autoApproved: match.autoApproved, approvalThreshold: match.approvalThreshold,
        matchedBy: match.matchedBy, updatedBy: match.updatedBy,
      },
    });
  }

  async findById(id: string, companyId: string): Promise<ThreeWayMatch | null> {
    const row = await this.db.procurementThreeWayMatch.findFirst({ where: { id, companyId } });
    return row ? this.toDomain(row) : null;
  }

  async findByInvoiceId(invoiceId: string, companyId: string): Promise<ThreeWayMatch | null> {
    const row = await this.db.procurementThreeWayMatch.findFirst({ where: { vendorInvoiceId: invoiceId, companyId } });
    return row ? this.toDomain(row) : null;
  }

  async findByFilter(filter: MatchQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<ThreeWayMatch>> {
    const where: Prisma.ProcurementThreeWayMatchWhereInput = { companyId: filter.companyId };
    if (filter.vendorInvoiceId) where.vendorInvoiceId = filter.vendorInvoiceId;
    if (filter.matchResult) where.matchResult = filter.matchResult;

    const orderBy: Prisma.ProcurementThreeWayMatchOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any : { createdAt: "desc" };
    const total = await this.db.procurementThreeWayMatch.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementThreeWayMatch.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.toDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }
    const rows = await this.db.procurementThreeWayMatch.findMany({ where, orderBy });
    return { items: rows.map((r) => this.toDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const r = await this.db.procurementThreeWayMatch.deleteMany({ where: { id, companyId } });
    return r.count > 0;
  }

  async saveLineItems(items: MatchLineItem[]): Promise<void> {
    for (const item of items) {
      await this.db.procurementMatchLineItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id, companyId: item.companyId, threeWayMatchId: item.threeWayMatchId,
          invoiceLineItemId: item.invoiceLineItemId, poReferenceLineItemId: item.poReferenceLineItemId,
          grnReferenceLineItemId: item.grnReferenceLineItemId, matchStatus: item.matchStatus,
          invoiceQuantity: item.invoiceQuantity, invoiceUnitPrice: item.invoiceUnitPrice,
          poQuantity: item.poQuantity, poUnitPrice: item.poUnitPrice, grnQuantity: item.grnQuantity,
          priceVariance: item.priceVariance, quantityVariance: item.quantityVariance,
          confidence: item.confidence, createdBy: item.createdBy, updatedBy: item.updatedBy,
        },
        update: {
          poReferenceLineItemId: item.poReferenceLineItemId, grnReferenceLineItemId: item.grnReferenceLineItemId,
          matchStatus: item.matchStatus, invoiceQuantity: item.invoiceQuantity, invoiceUnitPrice: item.invoiceUnitPrice,
          poQuantity: item.poQuantity, poUnitPrice: item.poUnitPrice, grnQuantity: item.grnQuantity,
          priceVariance: item.priceVariance, quantityVariance: item.quantityVariance,
          confidence: item.confidence, updatedBy: item.updatedBy,
        },
      });
    }
  }

  async getLineItems(matchId: string, companyId: string): Promise<MatchLineItem[]> {
    const rows = await this.db.procurementMatchLineItem.findMany({ where: { threeWayMatchId: matchId, companyId } });
    return rows.map((r) => this.lineToDomain(r));
  }

  async deleteLineItemsByMatch(matchId: string): Promise<number> {
    const r = await this.db.procurementMatchLineItem.deleteMany({ where: { threeWayMatchId: matchId } });
    return r.count;
  }

  private toDomain(row: ProcurementThreeWayMatch): ThreeWayMatch {
    return {
      id: row.id, companyId: row.companyId, vendorInvoiceId: row.vendorInvoiceId,
      poReferenceId: row.poReferenceId, grnReferenceId: row.grnReferenceId,
      matchResult: row.matchResult as ThreeWayMatch["matchResult"],
      overallConfidence: toNumber(row.overallConfidence),
      priceVarianceTotal: toNumber(row.priceVarianceTotal),
      quantityVarianceTotal: toNumber(row.quantityVarianceTotal),
      totalVariance: toNumber(row.totalVariance), variancePercent: toNumber(row.variancePercent),
      autoApproved: row.autoApproved, approvalThreshold: toNumber(row.approvalThreshold),
      matchedAt: row.matchedAt.toISOString(), matchedBy: row.matchedBy,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }

  private lineToDomain(row: ProcurementMatchLineItem): MatchLineItem {
    return {
      id: row.id, companyId: row.companyId, threeWayMatchId: row.threeWayMatchId,
      invoiceLineItemId: row.invoiceLineItemId, poReferenceLineItemId: row.poReferenceLineItemId,
      grnReferenceLineItemId: row.grnReferenceLineItemId,
      matchStatus: row.matchStatus as MatchLineItem["matchStatus"],
      invoiceQuantity: toNumber(row.invoiceQuantity), invoiceUnitPrice: toNumber(row.invoiceUnitPrice),
      poQuantity: toNumber(row.poQuantity), poUnitPrice: toNumber(row.poUnitPrice),
      grnQuantity: toNumber(row.grnQuantity),
      priceVariance: toNumber(row.priceVariance), quantityVariance: toNumber(row.quantityVariance),
      confidence: toNumber(row.confidence),
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy,
    };
  }
}
