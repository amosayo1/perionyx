/**
 * Phase 21A.2 — Prisma Vendor Repository
 */

import type { PrismaClient, ProcurementVendor, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  Vendor, VendorBankDetail, VendorPerformance, VendorDocument,
  VendorQueryFilter, PaginationParams, PaginatedResult, SortParams,
} from "./types";
import type { IVendorRepository } from "./vendor-repository";
import { toNumber, toRequiredDate, toDate, toIso, parseJsonArray, stringifyJsonArray } from "./prisma-ap-helpers";

export class PrismaVendorRepository implements IVendorRepository {
  readonly name = "VendorRepository";
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(vendor: Vendor): Promise<void> {
    await this.db.procurementVendor.upsert({
      where: { id: vendor.id },
      create: this.toCreateInput(vendor),
      update: this.toUpdateInput(vendor),
    });
  }

  async findById(id: string, companyId: string): Promise<Vendor | null> {
    const row = await this.db.procurementVendor.findFirst({ where: { id, companyId } });
    return row ? this.toDomain(row) : null;
  }

  async findByVendorCode(vendorCode: string, companyId: string): Promise<Vendor | null> {
    const row = await this.db.procurementVendor.findUnique({
      where: { companyId_vendorCode: { companyId, vendorCode } },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByTaxId(taxId: string, companyId: string): Promise<Vendor | null> {
    const row = await this.db.procurementVendor.findUnique({
      where: { companyId_taxId: { companyId, taxId } },
    });
    return row ? this.toDomain(row) : null;
  }

  async existsByTaxId(taxId: string, companyId: string, excludeId?: string): Promise<boolean> {
    const row = await this.db.procurementVendor.findUnique({
      where: { companyId_taxId: { companyId, taxId } }, select: { id: true },
    });
    return row != null && row.id !== excludeId;
  }

  async findByFilter(filter: VendorQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<Vendor>> {
    const where: Prisma.ProcurementVendorWhereInput = { companyId: filter.companyId };
    if (filter.status) where.status = filter.status;
    if (filter.category) where.category = filter.category;
    if (filter.currency) where.currency = filter.currency;
    if (filter.preferred !== undefined) where.preferred = filter.preferred;
    if (filter.isBlocked !== undefined) where.isBlocked = filter.isBlocked;
    if (filter.search) {
      where.OR = [
        { vendorCode: { contains: filter.search, mode: "insensitive" } },
        { name: { contains: filter.search, mode: "insensitive" } },
        { taxId: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.ProcurementVendorOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction } as any
      : { createdAt: "desc" };
    const total = await this.db.procurementVendor.count({ where });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      const rows = await this.db.procurementVendor.findMany({ where, orderBy, skip, take: pagination.limit });
      return { items: rows.map((r) => this.toDomain(r)), total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) };
    }

    const rows = await this.db.procurementVendor.findMany({ where, orderBy });
    return { items: rows.map((r) => this.toDomain(r)), total, page: 1, limit: total, totalPages: 1 };
  }

  async countByFilter(filter: VendorQueryFilter): Promise<number> {
    const where: Prisma.ProcurementVendorWhereInput = { companyId: filter.companyId };
    if (filter.status) where.status = filter.status;
    if (filter.category) where.category = filter.category;
    return this.db.procurementVendor.count({ where });
  }

  async saveBankDetail(detail: VendorBankDetail): Promise<void> {
    await this.db.procurementVendorBankDetail.upsert({
      where: { id: detail.id },
      create: {
        id: detail.id, companyId: detail.companyId, vendorId: detail.vendorId,
        bankName: detail.bankName, bankCountry: detail.bankCountry,
        routingNumber: detail.routingNumber, accountNumber: detail.accountNumber,
        accountHolderName: detail.accountHolderName, accountType: detail.accountType,
        isPrimary: detail.isPrimary, isActive: detail.isActive,
        verifiedAt: toDate(detail.verifiedAt), verifiedBy: detail.verifiedBy,
        createdBy: detail.createdBy, updatedBy: detail.updatedBy,
      },
      update: {
        bankName: detail.bankName, bankCountry: detail.bankCountry,
        routingNumber: detail.routingNumber, accountNumber: detail.accountNumber,
        accountHolderName: detail.accountHolderName, accountType: detail.accountType,
        isPrimary: detail.isPrimary, isActive: detail.isActive,
        verifiedAt: toDate(detail.verifiedAt), verifiedBy: detail.verifiedBy,
        updatedBy: detail.updatedBy,
      },
    });
  }

  async getBankDetails(vendorId: string, companyId: string): Promise<VendorBankDetail[]> {
    const rows = await this.db.procurementVendorBankDetail.findMany({ where: { vendorId, companyId } });
    return rows.map((r) => ({
      id: r.id, companyId: r.companyId, vendorId: r.vendorId,
      bankName: r.bankName, bankCountry: r.bankCountry,
      routingNumber: r.routingNumber, accountNumber: r.accountNumber,
      accountHolderName: r.accountHolderName, accountType: r.accountType as VendorBankDetail["accountType"],
      isPrimary: r.isPrimary, isActive: r.isActive,
      verifiedAt: toIso(r.verifiedAt), verifiedBy: r.verifiedBy,
      createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
      createdBy: r.createdBy, updatedBy: r.updatedBy,
    }));
  }

  async deleteBankDetail(id: string, companyId: string): Promise<boolean> {
    const r = await this.db.procurementVendorBankDetail.deleteMany({ where: { id, companyId } });
    return r.count > 0;
  }

  async savePerformance(performance: VendorPerformance): Promise<void> {
    await this.db.procurementVendorPerformance.upsert({
      where: { companyId_vendorId_period: { companyId: performance.companyId, vendorId: performance.vendorId, period: performance.period } },
      create: {
        id: performance.id, companyId: performance.companyId, vendorId: performance.vendorId,
        period: performance.period, onTimeDelivery: performance.onTimeDelivery,
        qualityScore: performance.qualityScore, responseTime: performance.responseTime,
        invoiceAccuracy: performance.invoiceAccuracy, returnRate: performance.returnRate,
        overallScore: performance.overallScore, totalOrders: performance.totalOrders,
        totalAmount: performance.totalAmount,
      },
      update: {
        onTimeDelivery: performance.onTimeDelivery, qualityScore: performance.qualityScore,
        responseTime: performance.responseTime, invoiceAccuracy: performance.invoiceAccuracy,
        returnRate: performance.returnRate, overallScore: performance.overallScore,
        totalOrders: performance.totalOrders, totalAmount: performance.totalAmount,
      },
    });
  }

  async getPerformances(vendorId: string, companyId: string): Promise<VendorPerformance[]> {
    const rows = await this.db.procurementVendorPerformance.findMany({ where: { vendorId, companyId } });
    return rows.map((r) => ({
      id: r.id, companyId: r.companyId, vendorId: r.vendorId, period: r.period,
      onTimeDelivery: toNumber(r.onTimeDelivery), qualityScore: toNumber(r.qualityScore),
      responseTime: toNumber(r.responseTime), invoiceAccuracy: toNumber(r.invoiceAccuracy),
      returnRate: toNumber(r.returnRate), overallScore: toNumber(r.overallScore),
      totalOrders: r.totalOrders, totalAmount: toNumber(r.totalAmount),
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async saveDocument(document: VendorDocument): Promise<void> {
    await this.db.procurementVendorDocument.upsert({
      where: { id: document.id },
      create: {
        id: document.id, companyId: document.companyId, vendorId: document.vendorId,
        type: document.type, name: document.name, reference: document.reference,
        expiryDate: toDate(document.expiryDate), status: document.status,
        fileUrl: document.fileUrl, createdBy: document.createdBy, updatedBy: document.updatedBy,
      },
      update: {
        type: document.type, name: document.name, reference: document.reference,
        expiryDate: toDate(document.expiryDate), status: document.status,
        fileUrl: document.fileUrl, updatedBy: document.updatedBy,
      },
    });
  }

  async getDocuments(vendorId: string, companyId: string): Promise<VendorDocument[]> {
    const rows = await this.db.procurementVendorDocument.findMany({ where: { vendorId, companyId } });
    return rows.map((r) => ({
      id: r.id, companyId: r.companyId, vendorId: r.vendorId,
      type: r.type, name: r.name, reference: r.reference,
      expiryDate: toIso(r.expiryDate), status: r.status as VendorDocument["status"],
      fileUrl: r.fileUrl,
      createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
      createdBy: r.createdBy, updatedBy: r.updatedBy,
    }));
  }

  async deleteDocument(id: string, companyId: string): Promise<boolean> {
    const r = await this.db.procurementVendorDocument.deleteMany({ where: { id, companyId } });
    return r.count > 0;
  }

  async countByStatus(companyId: string): Promise<Record<string, number>> {
    const groups = await this.db.procurementVendor.groupBy({ by: ["status"], where: { companyId }, _count: true });
    const counts: Record<string, number> = {};
    for (const g of groups) counts[g.status] = g._count;
    return counts;
  }

  async countActiveByCompany(companyId: string): Promise<number> {
    return this.db.procurementVendor.count({ where: { companyId, status: "ACTIVE" } });
  }

  private toCreateInput(v: Vendor) {
    return {
      id: v.id, companyId: v.companyId, vendorCode: v.vendorCode, name: v.name,
      legalName: v.legalName, status: v.status, riskLevel: v.riskLevel, riskScore: v.riskScore,
      category: v.category, taxId: v.taxId, taxCountry: v.taxCountry,
      currency: v.currency, billingAddress: v.billingAddress, shippingAddress: v.shippingAddress,
      paymentTerms: v.paymentTerms, preferredPaymentMethod: v.preferredPaymentMethod,
      creditLimit: v.creditLimit, bankAccountId: v.bankAccountId,
      preferred: v.preferred, preferredRank: v.preferredRank,
      isBlocked: v.isBlocked, blockReason: v.blockReason,
      rating: v.rating, totalSpend: v.totalSpend, totalOrders: v.totalOrders,
      avgPaymentDays: v.avgPaymentDays,
      contactName: v.contactName, contactEmail: v.contactEmail, contactPhone: v.contactPhone,
      tags: stringifyJsonArray(v.tags),
      onboardingDate: toRequiredDate(v.onboardingDate),
      lastOrderDate: toDate(v.lastOrderDate),
      createdBy: v.createdBy, updatedBy: v.updatedBy,
    };
  }

  private toUpdateInput(v: Vendor) {
    return { ...this.toCreateInput(v) };
  }

  private toDomain(row: ProcurementVendor): Vendor {
    return {
      id: row.id, companyId: row.companyId,
      vendorCode: row.vendorCode, name: row.name, legalName: row.legalName,
      status: row.status as Vendor["status"], riskLevel: row.riskLevel as Vendor["riskLevel"],
      riskScore: toNumber(row.riskScore), category: row.category as Vendor["category"],
      taxId: row.taxId, taxCountry: row.taxCountry, currency: row.currency,
      billingAddress: row.billingAddress, shippingAddress: row.shippingAddress,
      paymentTerms: row.paymentTerms, preferredPaymentMethod: row.preferredPaymentMethod as Vendor["preferredPaymentMethod"],
      creditLimit: toNumber(row.creditLimit), bankAccountId: row.bankAccountId,
      preferred: row.preferred, preferredRank: row.preferredRank,
      isBlocked: row.isBlocked, blockReason: row.blockReason,
      rating: toNumber(row.rating), totalSpend: toNumber(row.totalSpend),
      totalOrders: row.totalOrders, avgPaymentDays: row.avgPaymentDays,
      contactName: row.contactName, contactEmail: row.contactEmail, contactPhone: row.contactPhone,
      tags: parseJsonArray(row.tags),
      onboardingDate: row.onboardingDate.toISOString(),
      lastOrderDate: toIso(row.lastOrderDate),
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy, updatedBy: row.updatedBy, version: row.version,
    };
  }
}
