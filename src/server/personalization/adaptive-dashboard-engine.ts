import type { PersonalizedDashboard, WidgetRecommendation, ShortcutSuggestion, DashboardLayout } from "./types";
import { ROLE_DEFAULT_WIDGETS } from "./types";
import { widgetRecommendationEngine } from "./widget-recommendation-engine";
import { preferenceManager } from "./preference-manager";
import { userBehaviorAnalyzer } from "./user-behavior-analyzer";

export class AdaptiveDashboardEngine {
  async build(
    userId: string,
    companyId: string,
    roles: string[],
    department?: string,
  ): Promise<PersonalizedDashboard> {
    const prefs = preferenceManager.get(userId, companyId, roles, department);

    const widgets = widgetRecommendationEngine.recommend(userId, companyId, roles);

    const pinnedItems = prefs.pinnedWidgets.filter((p) =>
      widgets.some((w) => w.widgetId === p),
    );

    const quickActions = this.getQuickActions(userId, companyId, roles);

    return {
      layout: prefs.dashboardLayout,
      widgets,
      pinnedItems,
      quickActions,
      generatedAt: new Date().toISOString(),
    };
  }

  async getDefaultDashboard(roles: string[]): Promise<PersonalizedDashboard> {
    const widgets: WidgetRecommendation[] = [];
    const seen = new Set<string>();
    for (const role of roles) {
      const upperRole = role.toUpperCase().replace(/\s+/g, "_");
      const roleWidgets = ROLE_DEFAULT_WIDGETS[upperRole];
      if (roleWidgets) {
        for (const w of roleWidgets) {
          if (!seen.has(w)) {
            widgets.push({
              widgetId: w,
              title: w.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              reason: `Default for ${upperRole}`,
              score: 0.8,
              source: "role_default",
              module: "analytics",
            });
            seen.add(w);
          }
        }
      }
    }

    return {
      layout: "two_column",
      widgets,
      pinnedItems: widgets.slice(0, 3).map((w) => w.widgetId),
      quickActions: [],
      generatedAt: new Date().toISOString(),
    };
  }

  private getQuickActions(
    userId: string,
    companyId: string,
    roles: string[],
  ): ShortcutSuggestion[] {
    const actions: ShortcutSuggestion[] = [];
    const recentPages = userBehaviorAnalyzer.getRecentPages(userId, companyId, 3);

    for (const page of recentPages) {
      actions.push({
        id: `revisit-${page.page}`,
        label: `Return to ${page.module}`,
        action: "navigate",
        url: `/${page.page}`,
        module: page.module,
        score: 0.5,
        context: "Recently visited",
      });
    }

    const frequentModules = userBehaviorAnalyzer.getFrequentModuleNames(userId, companyId);
    for (const mod of frequentModules.slice(0, 2)) {
      if (!actions.some((a) => a.module === mod)) {
        actions.push({
          id: `frequent-${mod}`,
          label: `Open ${mod.charAt(0).toUpperCase() + mod.slice(1)}`,
          action: "navigate",
          url: `/${mod}`,
          module: mod,
          score: 0.7,
          context: "Frequently visited",
        });
      }
    }

    return actions.slice(0, 5);
  }
}

export const adaptiveDashboardEngine = new AdaptiveDashboardEngine();
