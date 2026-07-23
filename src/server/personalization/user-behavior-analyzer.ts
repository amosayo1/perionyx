import type { UserBehaviorProfile, PageVisit, ModuleFrequency, SearchPattern, ApprovalPattern, ActiveTime } from "./types";

export class UserBehaviorAnalyzer {
  private profiles = new Map<string, UserBehaviorProfile>();

  private profileKey(userId: string, companyId: string): string {
    return `${userId}:${companyId}`;
  }

  getProfile(userId: string, companyId: string): UserBehaviorProfile {
    const key = this.profileKey(userId, companyId);
    let profile = this.profiles.get(key);
    if (!profile) {
      profile = {
        userId,
        companyId,
        roles: [],
        recentlyVisited: [],
        frequentModules: [],
        searchPatterns: [],
        approvalPatterns: [],
        activeTimes: [],
        lastActiveAt: new Date().toISOString(),
        onboardingComplete: false,
        featureAdoption: {},
      };
      this.profiles.set(key, profile);
    }
    return profile;
  }

  trackPageVisit(userId: string, companyId: string, page: string, module: string): void {
    const profile = this.getProfile(userId, companyId);

    profile.recentlyVisited.unshift({ page, module, visitedAt: new Date().toISOString() });
    if (profile.recentlyVisited.length > 100) {
      profile.recentlyVisited = profile.recentlyVisited.slice(0, 100);
    }

    this.incrementModuleFrequency(profile, module);
    profile.lastActiveAt = new Date().toISOString();
  }

  trackSearch(userId: string, companyId: string, query: string): void {
    const profile = this.getProfile(userId, companyId);
    const existing = profile.searchPatterns.find((s) => s.query === query);
    if (existing) {
      existing.count++;
      existing.lastSearched = new Date().toISOString();
    } else {
      profile.searchPatterns.unshift({ query, count: 1, lastSearched: new Date().toISOString() });
      if (profile.searchPatterns.length > 50) profile.searchPatterns.pop();
    }
  }

  trackApprovalAction(
    userId: string,
    companyId: string,
    action: ApprovalPattern["action"],
    responseTimeMs: number,
  ): void {
    const profile = this.getProfile(userId, companyId);
    const existing = profile.approvalPatterns.find((a) => a.action === action);
    if (existing) {
      existing.count++;
      existing.avgResponseTimeMs = Math.round(
        (existing.avgResponseTimeMs * (existing.count - 1) + responseTimeMs) / existing.count,
      );
    } else {
      profile.approvalPatterns.push({ action, count: 1, avgResponseTimeMs: responseTimeMs });
    }
  }

  trackFeatureAdoption(userId: string, companyId: string, feature: string): void {
    const profile = this.getProfile(userId, companyId);
    profile.featureAdoption[feature] = true;
  }

  getFrequentModules(userId: string, companyId: string, limit = 5): ModuleFrequency[] {
    const profile = this.getProfile(userId, companyId);
    return profile.frequentModules
      .sort((a, b) => b.visits - a.visits)
      .slice(0, limit);
  }

  getRecentPages(userId: string, companyId: string, limit = 10): PageVisit[] {
    const profile = this.getProfile(userId, companyId);
    return profile.recentlyVisited.slice(0, limit);
  }

  getTopSearches(userId: string, companyId: string, limit = 10): SearchPattern[] {
    const profile = this.getProfile(userId, companyId);
    return profile.searchPatterns
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getFrequentModuleNames(userId: string, companyId: string): string[] {
    return this.getFrequentModules(userId, companyId).map((m) => m.module);
  }

  clearProfile(userId: string, companyId: string): void {
    this.profiles.delete(this.profileKey(userId, companyId));
  }

  private incrementModuleFrequency(profile: UserBehaviorProfile, module: string): void {
    const existing = profile.frequentModules.find((m) => m.module === module);
    if (existing) {
      existing.visits++;
      existing.lastVisited = new Date().toISOString();
    } else {
      profile.frequentModules.push({ module, visits: 1, lastVisited: new Date().toISOString() });
    }
  }
}

export const userBehaviorAnalyzer = new UserBehaviorAnalyzer();
