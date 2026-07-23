import type { PersonalizationAuditEntry } from "./types";

export class PersonalizationAuditService {
  private entries: PersonalizationAuditEntry[] = [];
  private readonly maxEntries = 50_000;

  record(action: PersonalizationAuditEntry["action"], userId: string, companyId: string, details: string): void {
    this.entries.push({ action, userId, companyId, details, timestamp: new Date().toISOString() });
    this.trim();
  }

  getByUser(userId: string, companyId: string, limit = 50): PersonalizationAuditEntry[] {
    return this.entries
      .filter((e) => e.userId === userId && e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  getByCompany(companyId: string, limit = 100): PersonalizationAuditEntry[] {
    return this.entries
      .filter((e) => e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  private trim(): void {
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }
}

export const personalizationAuditService = new PersonalizationAuditService();
