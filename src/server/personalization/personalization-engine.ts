import type {
  UserPreferences, PersonalizedDashboard, NavigationSuggestion,
  ShortcutSuggestion, WidgetRecommendation, UserBehaviorProfile,
} from "./types";
import type { LayoutConfig } from "./adaptive-layout-engine";
import { preferenceManager } from "./preference-manager";
import { userBehaviorAnalyzer } from "./user-behavior-analyzer";
import { behaviorLearningService } from "./behavior-learning-service";
import { widgetRecommendationEngine } from "./widget-recommendation-engine";
import { adaptiveDashboardEngine } from "./adaptive-dashboard-engine";
import { navigationOptimizer } from "./navigation-optimizer";
import { shortcutEngine } from "./shortcut-engine";
import { adaptiveLayoutEngine } from "./adaptive-layout-engine";
import { personalizationCache } from "./personalization-cache";
import { personalizationAuditService } from "./personalization-audit-service";

export class PersonalizationEngine {
  async getPersonalizedDashboard(
    userId: string,
    companyId: string,
    roles: string[],
    department?: string,
  ): Promise<PersonalizedDashboard> {
    const cached = personalizationCache.getDashboard(userId, companyId);
    if (cached) return cached;

    const dashboard = await adaptiveDashboardEngine.build(userId, companyId, roles, department);
    personalizationCache.setDashboard(userId, companyId, dashboard);

    personalizationAuditService.record("DASHBOARD_ADAPTED", userId, companyId, `Dashboard built with ${dashboard.widgets.length} widgets`);
    return dashboard;
  }

  getPreferences(userId: string, companyId: string, roles: string[], department?: string): UserPreferences {
    const cached = personalizationCache.getPreferences(userId, companyId);
    if (cached) return cached;

    const prefs = preferenceManager.get(userId, companyId, roles, department);
    personalizationCache.setPreferences(userId, companyId, prefs);
    return prefs;
  }

  updatePreferences(userId: string, companyId: string, updates: Partial<UserPreferences>): UserPreferences {
    const prefs = preferenceManager.update(userId, companyId, updates);
    personalizationCache.invalidate(userId, companyId);

    personalizationAuditService.record("PREFERENCE_UPDATED", userId, companyId, `Updated: ${Object.keys(updates).join(", ")}`);
    return prefs;
  }

  resetPreferences(userId: string, companyId: string): void {
    preferenceManager.reset(userId, companyId);
    personalizationCache.invalidate(userId, companyId);
    personalizationAuditService.record("PREFERENCE_RESET", userId, companyId, "All preferences reset to defaults");
  }

  getWidgetRecommendations(userId: string, companyId: string, roles: string[]): WidgetRecommendation[] {
    return widgetRecommendationEngine.recommend(userId, companyId, roles);
  }

  getOptimizedNavigation(
    userId: string,
    companyId: string,
    roles: string[],
    allModules: { id: string; label: string; url: string }[],
  ): NavigationSuggestion[] {
    return navigationOptimizer.optimize(userId, companyId, roles, allModules);
  }

  getShortcuts(userId: string, companyId: string, roles: string[], currentPage?: string): ShortcutSuggestion[] {
    return shortcutEngine.suggest(userId, companyId, roles, currentPage);
  }

  getLayout(userId: string, companyId: string, roles: string[], department?: string): LayoutConfig {
    const prefs = this.getPreferences(userId, companyId, roles, department);
    return adaptiveLayoutEngine.resolve(prefs);
  }

  getBehaviorProfile(userId: string, companyId: string): UserBehaviorProfile {
    return userBehaviorAnalyzer.getProfile(userId, companyId);
  }

  trackPageVisit(userId: string, companyId: string, page: string, module: string): void {
    userBehaviorAnalyzer.trackPageVisit(userId, companyId, page, module);
    personalizationAuditService.record("BEHAVIOR_TRACKED", userId, companyId, `Page visit: ${module}/${page}`);
  }

  trackSearch(userId: string, companyId: string, query: string): void {
    userBehaviorAnalyzer.trackSearch(userId, companyId, query);
  }

  trackApproval(userId: string, companyId: string, action: "approved" | "rejected" | "delegated" | "escalated", responseTimeMs: number): void {
    userBehaviorAnalyzer.trackApprovalAction(userId, companyId, action, responseTimeMs);
  }

  trackFeatureAdoption(userId: string, companyId: string, feature: string): void {
    userBehaviorAnalyzer.trackFeatureAdoption(userId, companyId, feature);
  }

  getLearningInsights(userId: string, companyId: string) {
    return behaviorLearningService.analyze(userId, companyId);
  }

  getAuditLog(userId: string, companyId: string) {
    return personalizationAuditService.getByUser(userId, companyId);
  }
}

export const personalizationEngine = new PersonalizationEngine();
