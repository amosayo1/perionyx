/**
 * Phase 21A.2 — VendorStatement & ReconciliationResult Repository
 */

import type {
  VendorStatement, VendorStatementLine,
  ReconciliationResult,
  ReconciliationQueryFilter, PaginationParams, PaginatedResult, SortParams,
} from "./types";

export interface IReconciliationRepository {
  readonly name: string;
  // Statements
  saveStatement(statement: VendorStatement): Promise<void>;
  findStatementById(id: string, companyId: string): Promise<VendorStatement | null>;
  findStatementsByVendor(vendorId: string, companyId: string): Promise<VendorStatement[]>;
  findStatementByFilter(filter: ReconciliationQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorStatement>>;
  // Statement Lines
  saveStatementLines(lines: VendorStatementLine[]): Promise<void>;
  getStatementLines(statementId: string, companyId: string): Promise<VendorStatementLine[]>;
  deleteStatementLines(statementId: string): Promise<number>;
  // Reconciliation Results
  saveReconciliationResult(result: ReconciliationResult): Promise<void>;
  findReconciliationResultById(id: string, companyId: string): Promise<ReconciliationResult | null>;
  findReconciliationByStatementId(statementId: string, companyId: string): Promise<ReconciliationResult | null>;
}

export class InMemoryReconciliationRepository implements IReconciliationRepository {
  readonly name = "ReconciliationRepository";
  private statements = new Map<string, VendorStatement>();
  private lines = new Map<string, VendorStatementLine[]>();
  private results = new Map<string, ReconciliationResult>();

  async saveStatement(statement: VendorStatement): Promise<void> { this.statements.set(statement.id, { ...statement }); }
  async findStatementById(id: string, companyId: string): Promise<VendorStatement | null> { const s = this.statements.get(id); return s && s.companyId === companyId ? { ...s } : null; }
  async findStatementsByVendor(vendorId: string, companyId: string): Promise<VendorStatement[]> {
    return Array.from(this.statements.values()).filter((s) => s.vendorId === vendorId && s.companyId === companyId).map((s) => ({ ...s }));
  }
  async findStatementByFilter(filter: ReconciliationQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<VendorStatement>> {
    let results = Array.from(this.statements.values()).filter((s) => s.companyId === filter.companyId);
    if (filter.vendorId) results = results.filter((s) => s.vendorId === filter.vendorId);
    const total = results.length;
    if (pagination) { const s = (pagination.page - 1) * pagination.limit; results = results.slice(s, s + pagination.limit); }
    return { items: results.map((s) => ({ ...s })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }
  async saveStatementLines(lines: VendorStatementLine[]): Promise<void> { for (const line of lines) { const list = this.lines.get(line.vendorStatementId) ?? []; const idx = list.findIndex((l) => l.id === line.id); if (idx >= 0) list[idx] = { ...line }; else list.push({ ...line }); this.lines.set(line.vendorStatementId, list); } }
  async getStatementLines(statementId: string, _companyId: string): Promise<VendorStatementLine[]> { return (this.lines.get(statementId) ?? []).map((l) => ({ ...l })); }
  async deleteStatementLines(statementId: string): Promise<number> { const lines = this.lines.get(statementId) ?? []; this.lines.delete(statementId); return lines.length; }
  async saveReconciliationResult(result: ReconciliationResult): Promise<void> { this.results.set(result.id, { ...result }); }
  async findReconciliationResultById(id: string, companyId: string): Promise<ReconciliationResult | null> { const r = this.results.get(id); return r && r.companyId === companyId ? { ...r } : null; }
  async findReconciliationByStatementId(statementId: string, companyId: string): Promise<ReconciliationResult | null> {
    for (const r of this.results.values()) { if (r.vendorStatementId === statementId && r.companyId === companyId) return { ...r }; }
    return null;
  }
  clear(): void { this.statements.clear(); this.lines.clear(); this.results.clear(); }
}
