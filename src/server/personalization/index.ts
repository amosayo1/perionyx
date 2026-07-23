export { PersonalizationEngine, personalizationEngine } from "./personalization-engine";
export { UserBehaviorAnalyzer, userBehaviorAnalyzer } from "./user-behavior-analyzer";
export { PreferenceManager, preferenceManager } from "./preference-manager";
export { AdaptiveDashboardEngine, adaptiveDashboardEngine } from "./adaptive-dashboard-engine";
export { WidgetRecommendationEngine, widgetRecommendationEngine } from "./widget-recommendation-engine";
export { NavigationOptimizer, navigationOptimizer } from "./navigation-optimizer";
export { ShortcutEngine, shortcutEngine } from "./shortcut-engine";
export { EnterprisePreferenceRegistry, enterprisePreferenceRegistry } from "./enterprise-preference-registry";
export { PersonalizationCache, personalizationCache } from "./personalization-cache";
export { BehaviorLearningService, behaviorLearningService } from "./behavior-learning-service";
export { AdaptiveLayoutEngine, adaptiveLayoutEngine } from "./adaptive-layout-engine";
export { PersonalizationAuditService, personalizationAuditService } from "./personalization-audit-service";

export type {
  PersonalizationScope,
  ThemeMode,
  DensityMode,
  DateFormat,
  DashboardLayout,
  UserPreferences,
  UserBehaviorProfile,
  PageVisit,
  ModuleFrequency,
  SearchPattern,
  ApprovalPattern,
  WidgetRecommendation,
  NavigationSuggestion,
  ShortcutSuggestion,
  PersonalizedDashboard,
} from "./types";

export type { LayoutConfig } from "./adaptive-layout-engine";
export type { BehaviorInsight } from "./behavior-learning-service";

export {
  DEFAULT_USER_PREFERENCES,
  ROLE_DEFAULT_WIDGETS,
  ROLE_NAVIGATION_PRIORITY,
} from "./types";
