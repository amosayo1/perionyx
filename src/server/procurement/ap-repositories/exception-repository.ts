/**
 * Phase 21A.2 — InvoiceException Repository
 */

import type { InvoiceException, ExceptionQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";

export interface IExceptionRepository {
  readonly name: string;
  save(exception: InvoiceException): Promise<void>;
  findById(id: string, companyId: string): Promise<InvoiceException | null>;
  findByFilter(filter: ExceptionQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<InvoiceException>>;
  findByInvoiceId(invoiceId: string, companyId: string): Promise<InvoiceException[]>;
  findOpenByInvoiceId(invoiceId: string, companyId: string): Promise<InvoiceException | null>;
  countByFilter(filter: ExceptionQueryFilter): Promise<number>;
  countOpenByCompany(companyId: string): Promise<number>;
}

export class InMemoryExceptionRepository implements IExceptionRepository {
  readonly name = "ExceptionRepository";
  private exceptions = new Map<string, InvoiceException>();

  async save(exception: InvoiceException): Promise<void> { this.exceptions.set(exception.id, { ...exception }); }
  async findById(id: string, companyId: string): Promise<InvoiceException | null> { const e = this.exceptions.get(id); return e && e.companyId === companyId ? { ...e } : null; }
  async findByFilter(filter: ExceptionQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<InvoiceException>> {
    let results = Array.from(this.exceptions.values()).filter((e) => e.companyId === filter.companyId);
    if (filter.vendorInvoiceId) results = results.filter((e) => e.vendorInvoiceId === filter.vendorInvoiceId);
    if (filter.status) results = results.filter((e) => e.status === filter.status);
    if (filter.severity) results = results.filter((e) => e.severity === filter.severity);
    if (filter.exceptionType) results = results.filter((e) => e.exceptionType === filter.exceptionType);
    if (filter.assignedTo) results = results.filter((e) => e.assignedTo === filter.assignedTo);
    const total = results.length;
    if (sort) results.sort((a, b) => { const av = ((a as unknown as Record<string, unknown>))[sort.field]; const bv = ((b as unknown as Record<string, unknown>))[sort.field]; return sort.direction === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number); });
    if (pagination) { const s = (pagination.page - 1) * pagination.limit; results = results.slice(s, s + pagination.limit); }
    return { items: results.map((e) => ({ ...e })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }
  async findByInvoiceId(invoiceId: string, companyId: string): Promise<InvoiceException[]> { return Array.from(this.exceptions.values()).filter((e) => e.vendorInvoiceId === invoiceId && e.companyId === companyId).map((e) => ({ ...e })); }
  async findOpenByInvoiceId(invoiceId: string, companyId: string): Promise<InvoiceException | null> {
    for (const e of this.exceptions.values()) { if (e.vendorInvoiceId === invoiceId && e.companyId === companyId && ["OPEN", "IN_REVIEW", "ESCALATED"].includes(e.status)) return { ...e }; }
    return null;
  }
  async countByFilter(filter: ExceptionQueryFilter): Promise<number> { return this.findByFilter(filter).then((r) => r.total); }
  async countOpenByCompany(companyId: string): Promise<number> { return this.findByFilter({ companyId, status: "OPEN" }).then((r) => r.total); }
  clear(): void { this.exceptions.clear(); }
}
