/**
 * Phase 21A.2 — ApprovalChain Repository
 */

import type { ApprovalRecord, ApprovalLevel, ApprovalQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";

export interface IApprovalRepository {
  readonly name: string;
  // Approval Records
  saveRecord(record: ApprovalRecord): Promise<void>;
  findRecordById(id: string, companyId: string): Promise<ApprovalRecord | null>;
  findRecordsByInvoiceId(invoiceId: string, companyId: string): Promise<ApprovalRecord[]>;
  findRecordsByFilter(filter: ApprovalQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<ApprovalRecord>>;
  findPendingByAssignee(assigneeId: string, companyId: string): Promise<ApprovalRecord[]>;
  countPendingByCompany(companyId: string): Promise<number>;
  // Approval Levels (configuration)
  saveLevel(level: ApprovalLevel): Promise<void>;
  findLevelById(id: string, companyId: string): Promise<ApprovalLevel | null>;
  findLevelByNumber(levelNumber: number, companyId: string): Promise<ApprovalLevel | null>;
  getActiveLevels(companyId: string): Promise<ApprovalLevel[]>;
}

export class InMemoryApprovalRepository implements IApprovalRepository {
  readonly name = "ApprovalRepository";
  private records = new Map<string, ApprovalRecord>();
  private levels = new Map<string, ApprovalLevel>();

  async saveRecord(record: ApprovalRecord): Promise<void> { this.records.set(record.id, { ...record }); }
  async findRecordById(id: string, companyId: string): Promise<ApprovalRecord | null> { const r = this.records.get(id); return r && r.companyId === companyId ? { ...r } : null; }
  async findRecordsByInvoiceId(invoiceId: string, companyId: string): Promise<ApprovalRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.vendorInvoiceId === invoiceId && r.companyId === companyId).sort((a, b) => a.approvalLevel - b.approvalLevel).map((r) => ({ ...r }));
  }
  async findRecordsByFilter(filter: ApprovalQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<ApprovalRecord>> {
    let results = Array.from(this.records.values()).filter((r) => r.companyId === filter.companyId);
    if (filter.vendorInvoiceId) results = results.filter((r) => r.vendorInvoiceId === filter.vendorInvoiceId);
    if (filter.status) results = results.filter((r) => r.status === filter.status);
    if (filter.decisionBy) results = results.filter((r) => r.decisionBy === filter.decisionBy);
    const total = results.length;
    if (pagination) { const s = (pagination.page - 1) * pagination.limit; results = results.slice(s, s + pagination.limit); }
    return { items: results.map((r) => ({ ...r })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }
  async findPendingByAssignee(assigneeId: string, companyId: string): Promise<ApprovalRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.companyId === companyId && r.status === "PENDING").map((r) => ({ ...r }));
  }
  async countPendingByCompany(companyId: string): Promise<number> {
    let count = 0; for (const r of this.records.values()) { if (r.companyId === companyId && r.status === "PENDING") count++; } return count;
  }
  async saveLevel(level: ApprovalLevel): Promise<void> { this.levels.set(level.id, { ...level }); }
  async findLevelById(id: string, companyId: string): Promise<ApprovalLevel | null> { const l = this.levels.get(id); return l && l.companyId === companyId ? { ...l } : null; }
  async findLevelByNumber(levelNumber: number, companyId: string): Promise<ApprovalLevel | null> {
    for (const l of this.levels.values()) { if (l.levelNumber === levelNumber && l.companyId === companyId) return { ...l }; }
    return null;
  }
  async getActiveLevels(companyId: string): Promise<ApprovalLevel[]> {
    return Array.from(this.levels.values()).filter((l) => l.companyId === companyId && l.isActive).sort((a, b) => a.levelNumber - b.levelNumber).map((l) => ({ ...l }));
  }
  clear(): void { this.records.clear(); this.levels.clear(); }
}
