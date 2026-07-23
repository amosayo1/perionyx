/**
 * Phase 21A.2 — VendorCredit Repository
 */

import type { VendorCredit, CreditQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";

export interface ICreditRepository {
  readonly name: string;
  save(credit: VendorCredit): Promise<void>;
  findById(id: string, companyId: string): Promise<VendorCredit | null>;
  findByCreditNumber(creditNumber: string, vendorId: string, companyId: string): Promise<VendorCredit | null>;
  findByFilter(filter: CreditQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorCredit>>;
  findOpenByVendor(vendorId: string, companyId: string): Promise<VendorCredit[]>;
  findByInvoiceId(invoiceId: string, companyId: string): Promise<VendorCredit | null>;
}

export class InMemoryCreditRepository implements ICreditRepository {
  readonly name = "CreditRepository";
  private credits = new Map<string, VendorCredit>();

  async save(credit: VendorCredit): Promise<void> { this.credits.set(credit.id, { ...credit }); }
  async findById(id: string, companyId: string): Promise<VendorCredit | null> { const c = this.credits.get(id); return c && c.companyId === companyId ? { ...c } : null; }
  async findByCreditNumber(creditNumber: string, vendorId: string, companyId: string): Promise<VendorCredit | null> {
    for (const c of this.credits.values()) { if (c.creditNumber === creditNumber && c.vendorId === vendorId && c.companyId === companyId) return { ...c }; }
    return null;
  }
  async findByFilter(filter: CreditQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorCredit>> {
    let results = Array.from(this.credits.values()).filter((c) => c.companyId === filter.companyId);
    if (filter.vendorId) results = results.filter((c) => c.vendorId === filter.vendorId);
    if (filter.status) results = results.filter((c) => c.status === filter.status);
    if (filter.invoiceId) results = results.filter((c) => c.appliedToInvoiceId === filter.invoiceId);
    const total = results.length;
    if (pagination) { const s = (pagination.page - 1) * pagination.limit; results = results.slice(s, s + pagination.limit); }
    return { items: results.map((c) => ({ ...c })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }
  async findOpenByVendor(vendorId: string, companyId: string): Promise<VendorCredit[]> {
    return Array.from(this.credits.values()).filter((c) => c.vendorId === vendorId && c.companyId === companyId && ["ISSUED", "PARTIALLY_APPLIED"].includes(c.status)).map((c) => ({ ...c }));
  }
  async findByInvoiceId(invoiceId: string, companyId: string): Promise<VendorCredit | null> {
    for (const c of this.credits.values()) { if (c.appliedToInvoiceId === invoiceId && c.companyId === companyId) return { ...c }; }
    return null;
  }
  clear(): void { this.credits.clear(); }
}
