import type { ExecutiveBriefing, BriefingType, ExecutiveRole } from "./types";

interface CacheEntry {
  briefing: ExecutiveBriefing;
  storedAt: number;
  accessCount: number;
}

export class BriefingCache {
  private store = new Map<string, CacheEntry>();
  private companyEventVersions = new Map<string, number>();

  private key(companyId: string, role: ExecutiveRole, type: BriefingType, period: string): string {
    return `${companyId}:${role}:${type}:${period}`;
  }

  get(companyId: string, role: ExecutiveRole, type: BriefingType, period: string): ExecutiveBriefing | null {
    const k = this.key(companyId, role, type, period);
    const entry = this.store.get(k);
    if (!entry) return null;

    if (Date.now() > new Date(entry.briefing.expiresAt).getTime()) {
      this.store.delete(k);
      return null;
    }

    entry.accessCount++;
    return entry.briefing;
  }

  set(companyId: string, role: ExecutiveRole, type: BriefingType, period: string, briefing: ExecutiveBriefing, ttlMs: number): void {
    const k = this.key(companyId, role, type, period);
    briefing.expiresAt = new Date(Date.now() + ttlMs).toISOString();
    this.store.set(k, { briefing, storedAt: Date.now(), accessCount: 0 });
  }

  invalidateCompany(companyId: string): number {
    let count = 0;
    for (const [k, entry] of this.store) {
      if (entry.briefing.companyId === companyId) {
        this.store.delete(k);
        count++;
      }
    }
    const version = (this.companyEventVersions.get(companyId) ?? 0) + 1;
    this.companyEventVersions.set(companyId, version);
    return count;
  }

  getEventVersion(companyId: string): number {
    return this.companyEventVersions.get(companyId) ?? 0;
  }

  getStats(): { size: number; totalAccesses: number } {
    let totalAccesses = 0;
    for (const entry of this.store.values()) {
      totalAccesses += entry.accessCount;
    }
    return { size: this.store.size, totalAccesses };
  }

  clear(): void {
    this.store.clear();
    this.companyEventVersions.clear();
  }
}

export const briefingCache = new BriefingCache();
