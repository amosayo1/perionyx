/**
 * Phase 21A.2 — VendorInvoice Repository
 *
 * Repository interface and in-memory implementation for the VendorInvoice aggregate root.
 * This is the CORE aggregate of the AP domain — every operation revolves around invoices.
 */

import type {
  VendorInvoice,
  InvoiceLineItem,
  InvoiceAttachment,
  InvoiceQueryFilter,
  PaginationParams,
  PaginatedResult,
  SortParams,
  VendorInvoiceStatus,
} from "./types";

export interface IInvoiceRepository {
  readonly name: string;

  // ── CRUD ──────────────────────────────────────────────────────────────────
  save(invoice: VendorInvoice): Promise<void>;
  findById(id: string, companyId: string): Promise<VendorInvoice | null>;
  findByInvoiceNumber(invoiceNumber: string, vendorId: string, companyId: string): Promise<VendorInvoice | null>;
  existsByInvoiceNumber(invoiceNumber: string, vendorId: string, companyId: string, excludeId?: string): Promise<boolean>;
  findByIdempotencyKey(idempotencyKey: string, companyId: string): Promise<VendorInvoice | null>;
  delete(id: string, companyId: string): Promise<boolean>;

  // ── Queries ───────────────────────────────────────────────────────────────
  findByFilter(filter: InvoiceQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorInvoice>>;
  countByFilter(filter: InvoiceQueryFilter): Promise<number>;
  findApprovedUnscheduled(companyId: string, sort?: SortParams): Promise<VendorInvoice[]>;
  findOverdue(companyId: string): Promise<VendorInvoice[]>;
  findByVendorId(vendorId: string, companyId: string, status?: VendorInvoiceStatus): Promise<VendorInvoice[]>;

  // ── Child Entities ────────────────────────────────────────────────────────
  saveLineItems(lineItems: InvoiceLineItem[]): Promise<void>;
  getLineItems(invoiceId: string, companyId: string): Promise<InvoiceLineItem[]>;
  deleteLineItemsByInvoice(invoiceId: string): Promise<number>;

  saveAttachment(attachment: InvoiceAttachment): Promise<void>;
  getAttachments(invoiceId: string, companyId: string): Promise<InvoiceAttachment[]>;
  deleteAttachment(id: string, companyId: string): Promise<boolean>;

  // ── Aggregations ──────────────────────────────────────────────────────────
  countByStatus(companyId: string): Promise<Record<string, number>>;
  sumOutstandingByVendor(vendorId: string, companyId: string): Promise<number>;
  countByVendorAndStatus(vendorId: string, companyId: string, status: VendorInvoiceStatus): Promise<number>;
}

export class InMemoryInvoiceRepository implements IInvoiceRepository {
  readonly name = "InvoiceRepository";
  private invoices = new Map<string, VendorInvoice>();
  private lineItems = new Map<string, InvoiceLineItem[]>();
  private attachments = new Map<string, InvoiceAttachment[]>();

  async save(invoice: VendorInvoice): Promise<void> {
    this.invoices.set(invoice.id, { ...invoice });
  }

  async findById(id: string, companyId: string): Promise<VendorInvoice | null> {
    const inv = this.invoices.get(id);
    if (!inv || inv.companyId !== companyId) return null;
    return { ...inv };
  }

  async findByInvoiceNumber(invoiceNumber: string, vendorId: string, companyId: string): Promise<VendorInvoice | null> {
    for (const inv of this.invoices.values()) {
      if (inv.invoiceNumber === invoiceNumber && inv.vendorId === vendorId && inv.companyId === companyId) return { ...inv };
    }
    return null;
  }

  async existsByInvoiceNumber(invoiceNumber: string, vendorId: string, companyId: string, excludeId?: string): Promise<boolean> {
    for (const inv of this.invoices.values()) {
      if (inv.invoiceNumber === invoiceNumber && inv.vendorId === vendorId && inv.companyId === companyId && inv.id !== excludeId) return true;
    }
    return false;
  }

  async findByIdempotencyKey(idempotencyKey: string, companyId: string): Promise<VendorInvoice | null> {
    for (const inv of this.invoices.values()) {
      if (inv.idempotencyKey === idempotencyKey && inv.companyId === companyId) return { ...inv };
    }
    return null;
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const inv = this.invoices.get(id);
    if (!inv || inv.companyId !== companyId) return false;
    this.invoices.delete(id);
    this.lineItems.delete(id);
    this.attachments.delete(id);
    return true;
  }

  async findByFilter(filter: InvoiceQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorInvoice>> {
    let results = Array.from(this.invoices.values()).filter((i) => i.companyId === filter.companyId);
    if (filter.vendorId) results = results.filter((i) => i.vendorId === filter.vendorId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((i) => statuses.includes(i.status));
    }
    if (filter.currency) results = results.filter((i) => i.currency === filter.currency);
    if (filter.poReferenceId) results = results.filter((i) => i.poReferenceId === filter.poReferenceId);
    if (filter.invoiceDateFrom) results = results.filter((i) => i.invoiceDate >= filter.invoiceDateFrom!);
    if (filter.invoiceDateTo) results = results.filter((i) => i.invoiceDate <= filter.invoiceDateTo!);
    if (filter.dueDateFrom) results = results.filter((i) => i.dueDate >= filter.dueDateFrom!);
    if (filter.dueDateTo) results = results.filter((i) => i.dueDate <= filter.dueDateTo!);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter((i) => i.invoiceNumber.toLowerCase().includes(q));
    }

    const total = results.length;
    if (sort) results.sort((a, b) => { const av = ((a as unknown as Record<string, unknown>))[sort.field]; const bv = ((b as unknown as Record<string, unknown>))[sort.field]; return sort.direction === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number); });

    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      results = results.slice(start, start + pagination.limit);
    }

    return { items: results.map((i) => ({ ...i })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }

  async countByFilter(filter: InvoiceQueryFilter): Promise<number> {
    return this.findByFilter(filter).then((r) => r.total);
  }

  async findApprovedUnscheduled(companyId: string, sort?: SortParams): Promise<VendorInvoice[]> {
    return this.findByFilter({ companyId, status: "APPROVED" }, sort).then((r) => r.items);
  }

  async findOverdue(companyId: string): Promise<VendorInvoice[]> {
    const today = new Date().toISOString().slice(0, 10);
    return Array.from(this.invoices.values()).filter((i) =>
      i.companyId === companyId && i.dueDate < today && !["PAID", "VOIDED", "PARTIALLY_PAID"].includes(i.status),
    );
  }

  async findByVendorId(vendorId: string, companyId: string, status?: VendorInvoiceStatus): Promise<VendorInvoice[]> {
    return this.findByFilter({ companyId, vendorId, status }).then((r) => r.items);
  }

  async saveLineItems(items: InvoiceLineItem[]): Promise<void> {
    for (const item of items) {
      const list = this.lineItems.get(item.vendorInvoiceId) ?? [];
      const idx = list.findIndex((l) => l.id === item.id);
      if (idx >= 0) list[idx] = { ...item }; else list.push({ ...item });
      this.lineItems.set(item.vendorInvoiceId, list);
    }
  }

  async getLineItems(invoiceId: string, _companyId: string): Promise<InvoiceLineItem[]> {
    return (this.lineItems.get(invoiceId) ?? []).map((i) => ({ ...i }));
  }

  async deleteLineItemsByInvoice(invoiceId: string): Promise<number> {
    const items = this.lineItems.get(invoiceId) ?? [];
    this.lineItems.delete(invoiceId);
    return items.length;
  }

  async saveAttachment(attachment: InvoiceAttachment): Promise<void> {
    const list = this.attachments.get(attachment.vendorInvoiceId) ?? [];
    const idx = list.findIndex((a) => a.id === attachment.id);
    if (idx >= 0) list[idx] = { ...attachment }; else list.push({ ...attachment });
    this.attachments.set(attachment.vendorInvoiceId, list);
  }

  async getAttachments(invoiceId: string, _companyId: string): Promise<InvoiceAttachment[]> {
    return (this.attachments.get(invoiceId) ?? []).map((a) => ({ ...a }));
  }

  async deleteAttachment(id: string, _companyId: string): Promise<boolean> {
    for (const [invId, list] of this.attachments.entries()) {
      const idx = list.findIndex((a) => a.id === id);
      if (idx >= 0) { list.splice(idx, 1); this.attachments.set(invId, list); return true; }
    }
    return false;
  }

  async countByStatus(companyId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const inv of this.invoices.values()) {
      if (inv.companyId === companyId) counts[inv.status] = (counts[inv.status] ?? 0) + 1;
    }
    return counts;
  }

  async sumOutstandingByVendor(vendorId: string, companyId: string): Promise<number> {
    let sum = 0;
    for (const inv of this.invoices.values()) {
      if (inv.vendorId === vendorId && inv.companyId === companyId && ["APPROVED", "PENDING_APPROVAL", "MATCHED"].includes(inv.status)) {
        sum += inv.balanceDue;
      }
    }
    return sum;
  }

  async countByVendorAndStatus(vendorId: string, companyId: string, status: VendorInvoiceStatus): Promise<number> {
    let count = 0;
    for (const inv of this.invoices.values()) {
      if (inv.vendorId === vendorId && inv.companyId === companyId && inv.status === status) count++;
    }
    return count;
  }

  clear(): void {
    this.invoices.clear();
    this.lineItems.clear();
    this.attachments.clear();
  }
}
