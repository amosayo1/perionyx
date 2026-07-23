# Phase 8C.8 — Personalization & Adaptive Enterprise Experience

## Architecture

The personalization module ensures no two users experience the platform exactly the same. Every decision is permission-aware, tenant-aware, explainable, auditable, configurable, and reversible.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PersonalizationEngine                        │
│  (public facade — all external entry points)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │PreferenceMgr │  │ Behavior     │  │ WidgetRecEngine   │     │
│  │              │  │ Analyzer     │  │                  │     │
│  │ CRUD prefs   │  │ track visits │  │ role defaults    │     │
│  │ merge with   │  │ search       │  │ behavior-based   │     │
│  │ org/role     │  │ approvals    │  │ recent activity  │     │
│  │ defaults     │  │ features     │  │ + dedup          │     │
│  └──────┬───────┘  └──────┬───────┘  └───────┬──────────┘     │
│         │                 │                  │                │
│  ┌──────┴─────────────────┴──────────────────┴──────────┐    │
│  │              AdaptiveDashboardEngine                  │    │
│  │  builds PersonalizedDashboard from:                  │    │
│  │  recommended widgets + pinned + quick actions        │    │
│  └──────────────────────┬───────────────────────────────┘    │
│         │                                                    │
│  ┌──────┴────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │NavOptimizer   │  │ShortcutEngine│  │LayoutEngine    │   │
│  │role priority  │  │role +        │  │density/theme   │   │
│  │+ frequency    │  │behavior      │  │font/spacing    │   │
│  │+ recency      │  │shortcuts     │  │sidebar width   │   │
│  └───────────────┘  └──────────────┘  └────────────────┘   │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │Personalization   │  │BehaviorLearning  │                │
│  │Cache             │  │Service           │                │
│  │per-user/company  │  │insight analysis  │                │
│  │300s TTL          │  │trend detection   │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │ PersonalizationAuditService                      │      │
│  │ 10K-cap, 8 action types                          │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Module Reference

### 1. `types.ts` — Core types and defaults
- 5 scopes: `user | role | department | organization | global`
- 4 density modes: `compact | comfortable | spacious`
- Theme: `dark | light | system`
- Layout: `single_column | two_column | three_column | focus`
- 7 roles × 6 default widgets
- 7 roles × 7 navigation priorities

### 2. `EnterprisePreferenceRegistry`
- 8 core preference definitions (type/scope/defaults/options)
- Role/org/department default override resolution
- `resolveDefaults(roles, companyId, department)` merges: org → department → role → user

### 3. `UserBehaviorAnalyzer`
- Per-user behavior profiles with page visits (100 cap)
- Module frequency tracking
- Search patterns (50 cap)
- Approval pattern tracking (action + response time)
- Feature adoption tracking

### 4. `PreferenceManager`
- CRUD for user preferences
- Merge with role/org defaults
- `togglePinnedWidget`, `toggleFavoriteReport`
- `addRecentReport`, `getPinnedNavItems`

### 5. `BehaviorLearningService`
- Rising/declining module detection
- Approval speed analysis
- Search focus identification
- Learning summary text generation

### 6. `WidgetRecommendationEngine`
- 4 recommendation sources:
  - **Role defaults**: predefined widget list per role
  - **Behavior**: widgets from frequently visited modules
  - **Recent activity**: based on recent page visits
  - **Business priorities**: platform-defined important widgets
- Deduplication (seen set)
- Scored and sorted (0–1 scale)
- Limited to 8 recommendations

### 7. `AdaptiveDashboardEngine`
- Builds `PersonalizedDashboard` from recommended widgets
- Adds pinned items from preferences
- Generates quick actions from recent pages + frequent modules
- Supports default dashboard return

### 8. `NavigationOptimizer`
- Base priority from `ROLE_NAVIGATION_PRIORITY`
- Behavior frequency boost (+1 per visit, capped at 50)
- Returns sorted `NavigationSuggestion[]`
- `getTopModules()` returns top N module IDs

### 9. `ShortcutEngine`
- Role-based shortcuts (CFO → cash/forecast/briefing, Treasurer → liquidity/payments, Controller → recon/month-end, Auditor → audit trail/compliance)
- Behavior-based shortcuts (frequently visited modules)
- Deduplication, scored sorting, limited to 5

### 10. `AdaptiveLayoutEngine`
- Resolves: theme → density → sidebar width → font size → spacing → show labels
- Density profiles:
  - **Compact**: 200px sidebar, 12px font, 8px spacing
  - **Comfortable**: 240px sidebar, 14px font, 16px spacing
  - **Spacious**: 280px sidebar, 16px font, 24px spacing
- Returns `LayoutConfig` for application

### 11. `PersonalizationCache`
- Per-user/company cache (300s TTL)
- Stores: preferences, dashboards, layouts
- Invalidation: per-user, per-company, full clear

### 12. `PersonalizationAuditService`
- 10,000-entry cap
- 8 action types: `PREFERENCE_UPDATED`, `PREFERENCE_RESET`, `DASHBOARD_ADAPTED`, `NAVIGATION_ADAPTED`, `WIDGET_RECOMMENDED`, `SHORTCUT_CREATED`, `BEHAVIOR_TRACKED`, `LEARNING_APPLIED`
- Queries: by user, by company

### 13. `PersonalizationEngine` (main facade)
- `getPersonalizedDashboard` — cache-first, falls back to build
- `getPreferences` — cache-first, falls back to merge
- `updatePreferences` — update + invalidate cache + audit
- `resetPreferences` — reset + invalidate cache + audit
- `getWidgetRecommendations` — quick recommend
- `getOptimizedNavigation` — sort all modules
- `getShortcuts` — context-aware shortcuts
- `getLayout` — resolve layout from prefs
- `getBehaviorProfile` — raw behavior data
- `trackPageVisit` / `trackSearch` / `trackApproval` / `trackFeatureAdoption`
- `getLearningInsights` — behavior analysis
- `getAuditLog` — per-user audit trail

## Design Decisions

### Hierarchy
```
org defaults → department defaults → role defaults → user specifics
```
Each level overrides the previous. Admins control enabled/disabled at org level.

### Scoring
- Role defaults: 0.7–1.0 (hardcoded per widget)
- Behavior: 0.6 (constant, behavior-based)
- Module frequency boost: 1 point per visit (capped 50)
- Navigation priority: (totalModules - index) × 10

### No Two Users Same
The system ensures uniqueness through:
1. Role-based defaults vary by role combination
2. Behavior profiles diverge naturally over time
3. Shortcuts include context-aware elements
4. Layout preferences are user-configurable

## Access Control

All personalization is:
- **Permission-aware**: engine does not recommend widgets for modules the user cannot access
- **Tenant-aware**: all data is scoped to `companyId`
- **Explainable**: every recommendation carries a `reason` string
- **Auditable**: all actions recorded in `PersonalizationAuditService`
- **Reversible**: preferences can be reset to defaults at any time
- **Configurable**: admins control org-level defaults and enabled features

## Caching

| Cache | TTL | Scope | Invalidation |
|---|---|---|---|
| Preferences | 300s | per user + company | on update/reset |
| Dashboard | 300s | per user + company | on preference change |
| Layout | 300s | per user + company | on preference change |

Cache is invalidated immediately on `updatePreferences()` or `resetPreferences()`.

## Future

- Persist behavior profiles to DB (PgBoss background sync)
- ML-based widget recommendations using collaborative filtering
- Cross-session behavior learning with persistent storage
- A/B testing framework for layout/widget placement optimization
- Org-wide personalization analytics dashboard
- Export user personalization profiles for audit

## File Reference

| File | Description |
|---|---|
| `src/server/personalization/types.ts` | Core types, defaults, role maps |
| `src/server/personalization/personalization-engine.ts` | Main facade |
| `src/server/personalization/user-behavior-analyzer.ts` | Behavior tracking |
| `src/server/personalization/preference-manager.ts` | Preference CRUD |
| `src/server/personalization/enterprise-preference-registry.ts` | Preference definitions |
| `src/server/personalization/behavior-learning-service.ts` | Behavior insight analysis |
| `src/server/personalization/widget-recommendation-engine.ts` | Widget recommendation |
| `src/server/personalization/adaptive-dashboard-engine.ts` | Dashboard assembly |
| `src/server/personalization/navigation-optimizer.ts` | Navigation optimization |
| `src/server/personalization/shortcut-engine.ts` | Contextual shortcuts |
| `src/server/personalization/adaptive-layout-engine.ts` | Layout resolution |
| `src/server/personalization/personalization-cache.ts` | In-memory cache |
| `src/server/personalization/personalization-audit-service.ts` | Audit trail |
| `src/server/personalization/index.ts` | Barrel exports |
