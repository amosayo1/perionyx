import type { SearchAuditEntry, SearchMode } from "./types";

export class SearchAuditService {
  private entries: SearchAuditEntry[] = [];
  private readonly maxEntries = 50_000;

  record(
    action: SearchAuditEntry["action"],
    query: string,
    mode: SearchMode,
    userId: string,
    companyId: string,
    resultCount: number,
    latencyMs: number,
  ): void {
    this.entries.push({
      action,
      query,
      mode,
      userId,
      companyId,
      resultCount,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
    this.trim();
  }

  getByCompany(companyId: string, limit = 100): SearchAuditEntry[] {
    return this.entries
      .filter((e) => e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  getByUser(userId: string, companyId: string, limit = 100): SearchAuditEntry[] {
    return this.entries
      .filter((e) => e.userId === userId && e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  getAll(limit = 100): SearchAuditEntry[] {
    return this.entries.slice(-limit).reverse();
  }

  private trim(): void {
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }
}

export const searchAuditService = new SearchAuditService();
