import type { UserPreferences } from "./types";
import { DEFAULT_USER_PREFERENCES } from "./types";
import { enterprisePreferenceRegistry } from "./enterprise-preference-registry";

export class PreferenceManager {
  private userPrefs = new Map<string, UserPreferences>();

  private key(userId: string, companyId: string): string {
    return `${userId}:${companyId}`;
  }

  get(userId: string, companyId: string, roles: string[], department?: string): UserPreferences {
    const k = this.key(userId, companyId);
    const userPref = this.userPrefs.get(k);
    const defaults = enterprisePreferenceRegistry.resolveDefaults(roles, companyId, department);
    return userPref ? { ...defaults, ...userPref } : defaults;
  }

  update(userId: string, companyId: string, updates: Partial<UserPreferences>): UserPreferences {
    const k = this.key(userId, companyId);
    const existing = this.userPrefs.get(k) ?? { ...DEFAULT_USER_PREFERENCES };
    Object.assign(existing, updates);
    this.userPrefs.set(k, existing);
    return existing;
  }

  set(userId: string, companyId: string, prefs: UserPreferences): void {
    this.userPrefs.set(this.key(userId, companyId), prefs);
  }

  reset(userId: string, companyId: string): void {
    this.userPrefs.delete(this.key(userId, companyId));
  }

  getPinnedWidgets(userId: string, companyId: string): string[] {
    return this.userPrefs.get(this.key(userId, companyId))?.pinnedWidgets ?? [];
  }

  togglePinnedWidget(userId: string, companyId: string, widgetId: string): string[] {
    const k = this.key(userId, companyId);
    const prefs = this.userPrefs.get(k) ?? { ...DEFAULT_USER_PREFERENCES };
    const idx = prefs.pinnedWidgets.indexOf(widgetId);
    if (idx >= 0) {
      prefs.pinnedWidgets.splice(idx, 1);
    } else {
      prefs.pinnedWidgets.push(widgetId);
    }
    this.userPrefs.set(k, prefs);
    return prefs.pinnedWidgets;
  }

  getPinnedNavItems(userId: string, companyId: string): string[] {
    return this.userPrefs.get(this.key(userId, companyId))?.pinnedNavItems ?? [];
  }

  addRecentReport(userId: string, companyId: string, reportId: string): void {
    const k = this.key(userId, companyId);
    const prefs = this.userPrefs.get(k) ?? { ...DEFAULT_USER_PREFERENCES };
    prefs.recentReports = prefs.recentReports.filter((r) => r !== reportId);
    prefs.recentReports.unshift(reportId);
    if (prefs.recentReports.length > 20) prefs.recentReports.pop();
    this.userPrefs.set(k, prefs);
  }

  toggleFavoriteReport(userId: string, companyId: string, reportId: string): string[] {
    const k = this.key(userId, companyId);
    const prefs = this.userPrefs.get(k) ?? { ...DEFAULT_USER_PREFERENCES };
    const idx = prefs.favoriteReports.indexOf(reportId);
    if (idx >= 0) {
      prefs.favoriteReports.splice(idx, 1);
    } else {
      prefs.favoriteReports.push(reportId);
    }
    this.userPrefs.set(k, prefs);
    return prefs.favoriteReports;
  }

  getFavoriteReports(userId: string, companyId: string): string[] {
    return this.userPrefs.get(this.key(userId, companyId))?.favoriteReports ?? [];
  }
}

export const preferenceManager = new PreferenceManager();
