/**
 * Phase 21A.2 — PaymentProposal & PaymentBatch Repositories
 */

import type {
  PaymentProposal, PaymentProposalItem,
  PaymentBatch, PaymentRecord,
  PaymentProposalQueryFilter, PaymentBatchQueryFilter,
  PaginationParams, PaginatedResult, SortParams,
} from "./types";

// ── PaymentProposal ────────────────────────────────────────────────────────

export interface IPaymentProposalRepository {
  readonly name: string;
  save(proposal: PaymentProposal): Promise<void>;
  findById(id: string, companyId: string): Promise<PaymentProposal | null>;
  findByProposalNumber(proposalNumber: string, companyId: string): Promise<PaymentProposal | null>;
  findByFilter(filter: PaymentProposalQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<PaymentProposal>>;
  findActiveByInvoiceId(invoiceId: string, companyId: string): Promise<PaymentProposal | null>;
  delete(id: string, companyId: string): Promise<boolean>;
  // Items
  saveItems(items: PaymentProposalItem[]): Promise<void>;
  getItems(proposalId: string, companyId: string): Promise<PaymentProposalItem[]>;
  deleteItem(id: string, companyId: string): Promise<boolean>;
}

export class InMemoryPaymentProposalRepository implements IPaymentProposalRepository {
  readonly name = "PaymentProposalRepository";
  private proposals = new Map<string, PaymentProposal>();
  private items = new Map<string, PaymentProposalItem[]>();

  async save(proposal: PaymentProposal): Promise<void> { this.proposals.set(proposal.id, { ...proposal }); }
  async findById(id: string, companyId: string): Promise<PaymentProposal | null> { const p = this.proposals.get(id); return p && p.companyId === companyId ? { ...p } : null; }
  async findByProposalNumber(proposalNumber: string, companyId: string): Promise<PaymentProposal | null> {
    for (const p of this.proposals.values()) { if (p.proposalNumber === proposalNumber && p.companyId === companyId) return { ...p }; }
    return null;
  }
  async findByFilter(filter: PaymentProposalQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<PaymentProposal>> {
    let results = Array.from(this.proposals.values()).filter((p) => p.companyId === filter.companyId);
    if (filter.status) results = results.filter((p) => p.status === filter.status);
    if (filter.paymentDateFrom) results = results.filter((p) => p.paymentDate >= filter.paymentDateFrom!);
    if (filter.paymentDateTo) results = results.filter((p) => p.paymentDate <= filter.paymentDateTo!);
    const total = results.length;
    if (pagination) { const s = (pagination.page - 1) * pagination.limit; results = results.slice(s, s + pagination.limit); }
    return { items: results.map((p) => ({ ...p })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }
  async findActiveByInvoiceId(invoiceId: string, companyId: string): Promise<PaymentProposal | null> {
    for (const item of this.items.values()) {
      for (const i of item) { if (i.vendorInvoiceId === invoiceId && i.companyId === companyId) { const p = this.proposals.get(i.paymentProposalId); if (p && ["DRAFT", "SUBMITTED"].includes(p.status)) return { ...p }; } }
    }
    return null;
  }
  async delete(id: string, companyId: string): Promise<boolean> { const p = this.proposals.get(id); if (p && p.companyId === companyId) { this.proposals.delete(id); this.items.delete(id); return true; } return false; }
  async saveItems(items: PaymentProposalItem[]): Promise<void> { for (const item of items) { const list = this.items.get(item.paymentProposalId) ?? []; const idx = list.findIndex((i) => i.id === item.id); if (idx >= 0) list[idx] = { ...item }; else list.push({ ...item }); this.items.set(item.paymentProposalId, list); } }
  async getItems(proposalId: string, _companyId: string): Promise<PaymentProposalItem[]> { return (this.items.get(proposalId) ?? []).map((i) => ({ ...i })); }
  async deleteItem(id: string, _companyId: string): Promise<boolean> { for (const [pid, list] of this.items.entries()) { const idx = list.findIndex((i) => i.id === id); if (idx >= 0) { list.splice(idx, 1); this.items.set(pid, list); return true; } } return false; }
  clear(): void { this.proposals.clear(); this.items.clear(); }
}

// ── PaymentBatch ───────────────────────────────────────────────────────────

export interface IPaymentBatchRepository {
  readonly name: string;
  save(batch: PaymentBatch): Promise<void>;
  findById(id: string, companyId: string): Promise<PaymentBatch | null>;
  findByBatchNumber(batchNumber: string, companyId: string): Promise<PaymentBatch | null>;
  findByProposalId(proposalId: string, companyId: string): Promise<PaymentBatch | null>;
  findByFilter(filter: PaymentBatchQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<PaymentBatch>>;
  delete(id: string, companyId: string): Promise<boolean>;
  // Payment Records
  savePaymentRecord(record: PaymentRecord): Promise<void>;
  findPaymentRecordById(id: string, companyId: string): Promise<PaymentRecord | null>;
  findByInvoiceId(invoiceId: string, companyId: string): Promise<PaymentRecord | null>;
  getPaymentRecords(batchId: string, companyId: string): Promise<PaymentRecord[]>;
  findByIdempotencyKey(idempotencyKey: string, companyId: string): Promise<PaymentRecord | null>;
}

export class InMemoryPaymentBatchRepository implements IPaymentBatchRepository {
  readonly name = "PaymentBatchRepository";
  private batches = new Map<string, PaymentBatch>();
  private records = new Map<string, PaymentRecord[]>();

  async save(batch: PaymentBatch): Promise<void> { this.batches.set(batch.id, { ...batch }); }
  async findById(id: string, companyId: string): Promise<PaymentBatch | null> { const b = this.batches.get(id); return b && b.companyId === companyId ? { ...b } : null; }
  async findByBatchNumber(batchNumber: string, companyId: string): Promise<PaymentBatch | null> {
    for (const b of this.batches.values()) { if (b.batchNumber === batchNumber && b.companyId === companyId) return { ...b }; }
    return null;
  }
  async findByProposalId(proposalId: string, companyId: string): Promise<PaymentBatch | null> {
    for (const b of this.batches.values()) { if (b.paymentProposalId === proposalId && b.companyId === companyId) return { ...b }; }
    return null;
  }
  async findByFilter(filter: PaymentBatchQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<PaymentBatch>> {
    let results = Array.from(this.batches.values()).filter((b) => b.companyId === filter.companyId);
    if (filter.status) results = results.filter((b) => b.status === filter.status);
    if (filter.paymentMethod) results = results.filter((b) => b.paymentMethod === filter.paymentMethod);
    const total = results.length;
    if (pagination) { const s = (pagination.page - 1) * pagination.limit; results = results.slice(s, s + pagination.limit); }
    return { items: results.map((b) => ({ ...b })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }
  async delete(id: string, companyId: string): Promise<boolean> { const b = this.batches.get(id); if (b && b.companyId === companyId) { this.batches.delete(id); this.records.delete(id); return true; } return false; }
  async savePaymentRecord(record: PaymentRecord): Promise<void> { const list = this.records.get(record.paymentBatchId) ?? []; const idx = list.findIndex((r) => r.id === record.id); if (idx >= 0) list[idx] = { ...record }; else list.push({ ...record }); this.records.set(record.paymentBatchId, list); }
  async findPaymentRecordById(id: string, companyId: string): Promise<PaymentRecord | null> {
    for (const list of this.records.values()) { const r = list.find((r) => r.id === id && r.companyId === companyId); if (r) return { ...r }; }
    return null;
  }
  async findByInvoiceId(invoiceId: string, companyId: string): Promise<PaymentRecord | null> {
    for (const list of this.records.values()) { const r = list.find((r) => r.vendorInvoiceId === invoiceId && r.companyId === companyId); if (r) return { ...r }; }
    return null;
  }
  async getPaymentRecords(batchId: string, _companyId: string): Promise<PaymentRecord[]> { return (this.records.get(batchId) ?? []).map((r) => ({ ...r })); }
  async findByIdempotencyKey(idempotencyKey: string, companyId: string): Promise<PaymentRecord | null> {
    for (const list of this.records.values()) { const r = list.find((r) => r.idempotencyKey === idempotencyKey && r.companyId === companyId); if (r) return { ...r }; }
    return null;
  }
  clear(): void { this.batches.clear(); this.records.clear(); }
}
