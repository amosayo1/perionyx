/**
 * Phase 21A.2 — AP Audit Record Repository (Append-Only)
 *
 * The audit repository is append-only — no updates, no deletes.
 * Every state transition across all AP aggregates writes an immutable audit record.
 */

import type { APAuditRecord, AuditQueryFilter, PaginationParams, PaginatedResult, SortParams } from "./types";

export interface IAuditRepository {
  readonly name: string;

  /** Append an immutable audit record. No updates allowed. */
  append(record: APAuditRecord): Promise<void>;

  /** Find audit record by ID (read-only). */
  findById(id: string, companyId: string): Promise<APAuditRecord | null>;

  /** Query audit records with filters. */
  findByFilter(filter: AuditQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<APAuditRecord>>;

  /** Get the full audit trail for a specific entity. */
  getEntityAuditTrail(entityType: string, entityId: string, companyId: string): Promise<APAuditRecord[]>;

  /** Count audit records matching filter. */
  countByFilter(filter: AuditQueryFilter): Promise<number>;
}

export class InMemoryAuditRepository implements IAuditRepository {
  readonly name = "AuditRepository";
  private records: APAuditRecord[] = [];

  async append(record: APAuditRecord): Promise<void> {
    this.records.push({ ...record });
  }

  async findById(id: string, companyId: string): Promise<APAuditRecord | null> {
    const r = this.records.find((r) => r.id === id && r.companyId === companyId);
    return r ? { ...r } : null;
  }

  async findByFilter(filter: AuditQueryFilter, sort?: SortParams, pagination?: PaginationParams): Promise<PaginatedResult<APAuditRecord>> {
    let results = this.records.filter((r) => r.companyId === filter.companyId);
    if (filter.entityType) results = results.filter((r) => r.entityType === filter.entityType);
    if (filter.entityId) results = results.filter((r) => r.entityId === filter.entityId);
    if (filter.action) results = results.filter((r) => r.action === filter.action);
    if (filter.userId) results = results.filter((r) => r.userId === filter.userId);
    if (filter.correlationId) results = results.filter((r) => r.correlationId === filter.correlationId);
    if (filter.createdAtFrom) results = results.filter((r) => r.createdAt >= filter.createdAtFrom!);
    if (filter.createdAtTo) results = results.filter((r) => r.createdAt <= filter.createdAtTo!);

    // Default sort by createdAt desc (most recent first)
    if (sort) {
      results.sort((a, b) => { const av = ((a as unknown as Record<string, unknown>))[sort.field]; const bv = ((b as unknown as Record<string, unknown>))[sort.field]; return sort.direction === "asc" ? (String(av)).localeCompare(String(bv)) : String(bv).localeCompare(String(av)); });
    } else {
      results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    const total = results.length;
    if (pagination) { const s = (pagination.page - 1) * pagination.limit; results = results.slice(s, s + pagination.limit); }

    return { items: results.map((r) => ({ ...r })), total, page: pagination?.page ?? 1, limit: pagination?.limit ?? total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 };
  }

  async getEntityAuditTrail(entityType: string, entityId: string, companyId: string): Promise<APAuditRecord[]> {
    return this.records
      .filter((r) => r.entityType === entityType && r.entityId === entityId && r.companyId === companyId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((r) => ({ ...r }));
  }

  async countByFilter(filter: AuditQueryFilter): Promise<number> {
    return this.findByFilter(filter).then((r) => r.total);
  }

  clear(): void { this.records = []; }
}
