import type { UserPreferences, PersonalizedDashboard } from "./types";
import type { LayoutConfig } from "./adaptive-layout-engine";

export class PersonalizationCache {
  private preferences = new Map<string, UserPreferences>();
  private dashboards = new Map<string, PersonalizedDashboard>();
  private layouts = new Map<string, LayoutConfig>();
  private readonly ttlMs = 300_000;

  private key(userId: string, companyId: string, type: string): string {
    return `${userId}:${companyId}:${type}`;
  }

  private isValid(entry: { storedAt: number; ttlMs: number }): boolean {
    return Date.now() - entry.storedAt < entry.ttlMs;
  }

  getPreferences(userId: string, companyId: string): UserPreferences | null {
    const key = this.key(userId, companyId, "prefs");
    const entry = this.preferences.get(key);
    if (!entry) return null;
    if (!this.isValid({ storedAt: this.getStoredAt(this.preferences, key), ttlMs: this.ttlMs })) {
      this.preferences.delete(key);
      return null;
    }
    return entry;
  }

  setPreferences(userId: string, companyId: string, prefs: UserPreferences): void {
    this.preferences.set(this.key(userId, companyId, "prefs"), prefs);
  }

  getDashboard(userId: string, companyId: string): PersonalizedDashboard | null {
    const key = this.key(userId, companyId, "dash");
    const entry = this.dashboards.get(key);
    if (!entry) return null;
    if (!this.isValid({ storedAt: this.getStoredAt(this.dashboards, key), ttlMs: this.ttlMs })) {
      this.dashboards.delete(key);
      return null;
    }
    return entry;
  }

  setDashboard(userId: string, companyId: string, dashboard: PersonalizedDashboard): void {
    this.dashboards.set(this.key(userId, companyId, "dash"), dashboard);
  }

  invalidate(userId: string, companyId: string): void {
    this.preferences.delete(this.key(userId, companyId, "prefs"));
    this.dashboards.delete(this.key(userId, companyId, "dash"));
    this.layouts.delete(this.key(userId, companyId, "layout"));
  }

  invalidateAll(companyId: string): void {
    for (const [k] of this.preferences) { if (k.includes(companyId)) this.preferences.delete(k); }
    for (const [k] of this.dashboards) { if (k.includes(companyId)) this.dashboards.delete(k); }
    for (const [k] of this.layouts) { if (k.includes(companyId)) this.layouts.delete(k); }
  }

  clear(): void {
    this.preferences.clear();
    this.dashboards.clear();
    this.layouts.clear();
  }

  private getStoredAt(map: Map<string, unknown>, _key: string): number {
    return Date.now();
  }
}

export const personalizationCache = new PersonalizationCache();
