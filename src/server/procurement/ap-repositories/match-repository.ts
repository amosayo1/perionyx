/**
 * Phase 21A.2 — ThreeWayMatch Repository
 */

import type { ThreeWayMatch, MatchLineItem, MatchQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";

export interface IMatchRepository {
  readonly name: string;
  save(match: ThreeWayMatch): Promise<void>;
  findById(id: string, companyId: string): Promise<ThreeWayMatch | null>;
  findByInvoiceId(invoiceId: string, companyId: string): Promise<ThreeWayMatch | null>;
  findByFilter(filter: MatchQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<ThreeWayMatch>>;
  delete(id: string, companyId: string): Promise<boolean>;
  // Line items
  saveLineItems(items: MatchLineItem[]): Promise<void>;
  getLineItems(matchId: string, companyId: string): Promise<MatchLineItem[]>;
  deleteLineItemsByMatch(matchId: string): Promise<number>;
}

export class InMemoryMatchRepository implements IMatchRepository {
  readonly name = "MatchRepository";
  private matches = new Map<string, ThreeWayMatch>();
  private lineItems = new Map<string, MatchLineItem[]>();

  async save(match: ThreeWayMatch): Promise<void> { this.matches.set(match.id, { ...match }); }
  async findById(id: string, companyId: string): Promise<ThreeWayMatch | null> { const m = this.matches.get(id); return m && m.companyId === companyId ? { ...m } : null; }
  async findByInvoiceId(invoiceId: string, companyId: string): Promise<ThreeWayMatch | null> {
    for (const m of this.matches.values()) { if (m.vendorInvoiceId === invoiceId && m.companyId === companyId) return { ...m }; }
    return null;
  }
  async findByFilter(filter: MatchQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<ThreeWayMatch>> {
    let results = Array.from(this.matches.values()).filter((m) => m.companyId === filter.companyId);
    if (filter.vendorInvoiceId) results = results.filter((m) => m.vendorInvoiceId === filter.vendorInvoiceId);
    if (filter.matchResult) results = results.filter((m) => m.matchResult === filter.matchResult);
    const total = results.length;
    if (pagination) { const s = (pagination.page - 1) * pagination.limit; results = results.slice(s, s + pagination.limit); }
    return { items: results.map((m) => ({ ...m })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }
  async delete(id: string, companyId: string): Promise<boolean> { const m = this.matches.get(id); if (m && m.companyId === companyId) { this.matches.delete(id); this.lineItems.delete(id); return true; } return false; }
  async saveLineItems(items: MatchLineItem[]): Promise<void> { for (const item of items) { const list = this.lineItems.get(item.threeWayMatchId) ?? []; const idx = list.findIndex((l) => l.id === item.id); if (idx >= 0) list[idx] = { ...item }; else list.push({ ...item }); this.lineItems.set(item.threeWayMatchId, list); } }
  async getLineItems(matchId: string, _companyId: string): Promise<MatchLineItem[]> { return (this.lineItems.get(matchId) ?? []).map((i) => ({ ...i })); }
  async deleteLineItemsByMatch(matchId: string): Promise<number> { const items = this.lineItems.get(matchId) ?? []; this.lineItems.delete(matchId); return items.length; }
  clear(): void { this.matches.clear(); this.lineItems.clear(); }
}
