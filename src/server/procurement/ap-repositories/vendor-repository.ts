/**
 * Phase 21A.2 — Vendor Repository
 *
 * Repository interface and in-memory implementation for the Vendor aggregate root.
 * Manages vendor lifecycle, bank details, performance records, and documents.
 */

import type {
  Vendor,
  VendorBankDetail,
  VendorPerformance,
  VendorDocument,
  VendorQueryFilter,
  PaginationParams,
  PaginatedResult,
  SortParams,
} from "./types";

export interface IVendorRepository {
  readonly name: string;

  // ── CRUD ──────────────────────────────────────────────────────────────────
  save(vendor: Vendor): Promise<void>;
  findById(id: string, companyId: string): Promise<Vendor | null>;
  findByVendorCode(vendorCode: string, companyId: string): Promise<Vendor | null>;
  findByTaxId(taxId: string, companyId: string): Promise<Vendor | null>;
  existsByTaxId(taxId: string, companyId: string, excludeId?: string): Promise<boolean>;

  // ── Queries ───────────────────────────────────────────────────────────────
  findByFilter(filter: VendorQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<Vendor>>;
  countByFilter(filter: VendorQueryFilter): Promise<number>;

  // ── Child Entities ────────────────────────────────────────────────────────
  saveBankDetail(detail: VendorBankDetail): Promise<void>;
  getBankDetails(vendorId: string, companyId: string): Promise<VendorBankDetail[]>;
  deleteBankDetail(id: string, companyId: string): Promise<boolean>;

  savePerformance(performance: VendorPerformance): Promise<void>;
  getPerformances(vendorId: string, companyId: string): Promise<VendorPerformance[]>;

  saveDocument(document: VendorDocument): Promise<void>;
  getDocuments(vendorId: string, companyId: string): Promise<VendorDocument[]>;
  deleteDocument(id: string, companyId: string): Promise<boolean>;

  // ── Aggregations ──────────────────────────────────────────────────────────
  countByStatus(companyId: string): Promise<Record<string, number>>;
  countActiveByCompany(companyId: string): Promise<number>;
}

export class InMemoryVendorRepository implements IVendorRepository {
  readonly name = "VendorRepository";
  private vendors = new Map<string, Vendor>();
  private bankDetails = new Map<string, VendorBankDetail[]>();
  private performances = new Map<string, VendorPerformance[]>();
  private documents = new Map<string, VendorDocument[]>();

  async save(vendor: Vendor): Promise<void> {
    this.vendors.set(vendor.id, { ...vendor });
  }

  async findById(id: string, companyId: string): Promise<Vendor | null> {
    const v = this.vendors.get(id);
    if (!v || v.companyId !== companyId) return null;
    return { ...v };
  }

  async findByVendorCode(vendorCode: string, companyId: string): Promise<Vendor | null> {
    for (const v of this.vendors.values()) {
      if (v.vendorCode === vendorCode && v.companyId === companyId) return { ...v };
    }
    return null;
  }

  async findByTaxId(taxId: string, companyId: string): Promise<Vendor | null> {
    for (const v of this.vendors.values()) {
      if (v.taxId === taxId && v.companyId === companyId) return { ...v };
    }
    return null;
  }

  async existsByTaxId(taxId: string, companyId: string, excludeId?: string): Promise<boolean> {
    for (const v of this.vendors.values()) {
      if (v.taxId === taxId && v.companyId === companyId && v.id !== excludeId) return true;
    }
    return false;
  }

  async findByFilter(filter: VendorQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<Vendor>> {
    let results = Array.from(this.vendors.values()).filter((v) => v.companyId === filter.companyId);
    if (filter.status) results = results.filter((v) => v.status === filter.status);
    if (filter.category) results = results.filter((v) => v.category === filter.category);
    if (filter.currency) results = results.filter((v) => v.currency === filter.currency);
    if (filter.preferred !== undefined) results = results.filter((v) => v.preferred === filter.preferred);
    if (filter.isBlocked !== undefined) results = results.filter((v) => v.isBlocked === filter.isBlocked);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter((v) => v.vendorCode.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.taxId.includes(q));
    }

    const total = results.length;
    if (sort) results.sort((a, b) => { const av = ((a as unknown as Record<string, unknown>))[sort.field]; const bv = ((b as unknown as Record<string, unknown>))[sort.field]; return sort.direction === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number); });

    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      results = results.slice(start, start + pagination.limit);
    }

    return { items: results.map((v) => ({ ...v })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }

  async countByFilter(filter: VendorQueryFilter): Promise<number> {
    return this.findByFilter(filter).then((r) => r.total);
  }

  async saveBankDetail(detail: VendorBankDetail): Promise<void> {
    const list = this.bankDetails.get(detail.vendorId) ?? [];
    const idx = list.findIndex((d) => d.id === detail.id);
    if (idx >= 0) list[idx] = { ...detail }; else list.push({ ...detail });
    this.bankDetails.set(detail.vendorId, list);
  }

  async getBankDetails(vendorId: string, _companyId: string): Promise<VendorBankDetail[]> {
    return (this.bankDetails.get(vendorId) ?? []).map((d) => ({ ...d }));
  }

  async deleteBankDetail(id: string, _companyId: string): Promise<boolean> {
    for (const [vendorId, list] of this.bankDetails.entries()) {
      const idx = list.findIndex((d) => d.id === id);
      if (idx >= 0) { list.splice(idx, 1); this.bankDetails.set(vendorId, list); return true; }
    }
    return false;
  }

  async savePerformance(performance: VendorPerformance): Promise<void> {
    const list = this.performances.get(performance.vendorId) ?? [];
    list.push({ ...performance });
    this.performances.set(performance.vendorId, list);
  }

  async getPerformances(vendorId: string, _companyId: string): Promise<VendorPerformance[]> {
    return (this.performances.get(vendorId) ?? []).map((p) => ({ ...p }));
  }

  async saveDocument(document: VendorDocument): Promise<void> {
    const list = this.documents.get(document.vendorId) ?? [];
    const idx = list.findIndex((d) => d.id === document.id);
    if (idx >= 0) list[idx] = { ...document }; else list.push({ ...document });
    this.documents.set(document.vendorId, list);
  }

  async getDocuments(vendorId: string, _companyId: string): Promise<VendorDocument[]> {
    return (this.documents.get(vendorId) ?? []).map((d) => ({ ...d }));
  }

  async deleteDocument(id: string, _companyId: string): Promise<boolean> {
    for (const [vendorId, list] of this.documents.entries()) {
      const idx = list.findIndex((d) => d.id === id);
      if (idx >= 0) { list.splice(idx, 1); this.documents.set(vendorId, list); return true; }
    }
    return false;
  }

  async countByStatus(companyId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const v of this.vendors.values()) {
      if (v.companyId === companyId) counts[v.status] = (counts[v.status] ?? 0) + 1;
    }
    return counts;
  }

  async countActiveByCompany(companyId: string): Promise<number> {
    let count = 0;
    for (const v of this.vendors.values()) {
      if (v.companyId === companyId && v.status === "ACTIVE") count++;
    }
    return count;
  }

  clear(): void {
    this.vendors.clear();
    this.bankDetails.clear();
    this.performances.clear();
    this.documents.clear();
  }
}
