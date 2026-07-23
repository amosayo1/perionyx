# Perionyx Design System Migration Plan

**Date**: July 2026  
**Baseline**: UX_UI_ARCHITECTURE_AUDIT.md (July 2026)  
**Target**: Unified enterprise design language, 8.5+/10 UX score  
**Status**: ACTIVE

---

## 1. Current Component Inventory

### Competing Systems Identified

| Category | Current Systems | Canonical Replacement | Deprecation |
|----------|----------------|----------------------|-------------|
| **Buttons** | `ui/button.tsx` (CVA, rounded-xl, #d4af37 ring), `enterprise-button.tsx` (framer-motion, rounded-lg, #d4a800 ring), `AnimatedButton` (motion, #d4af37/50 ring), raw `<button>` (no ring) | `ds/button.tsx` | ui/button.tsx, enterprise-button.tsx (raw buttons migrated inline) |
| **Cards** | `ui/card.tsx` (rounded-xl, zinc-900/50 gradient), `enterprise-card.tsx` (rounded-lg, zinc-900/80 gradient), raw divs (rounded-2xl to rounded-[32px]), shell overrides (border-[rgba(212,175,55,0.12)]) | `ds/card.tsx` | ui/card.tsx, enterprise-card.tsx |
| **Dialogs** | `ui/dialog.tsx` (Radix), `ui/sheet.tsx` (Radix side), `enterprise/motion/animated-dialog.tsx` (framer), `design-system/dialogs/enterprise-dialog.tsx` (framer) | `ds/dialog.tsx` | ui/dialog.tsx, animated-dialog.tsx, enterprise-dialog.tsx |
| **Skeletons** | `ui/skeleton.tsx` (pulse, white shimmer), `design-system/loading-states.tsx` (pulse, zinc), `enterprise/motion/loading-skeleton.tsx` (shimmer, stagger), inline SkeletonBlock | `ds/skeleton.tsx` | ui/skeleton.tsx, design-system/loading-states.tsx, enterprise/motion/loading-skeleton.tsx |
| **Badges** | `ui/badge.tsx` (CVA 6 variants), `enterprise-badge.tsx` (9 domain variants), inline status spans | `ds/badge.tsx` | ui/badge.tsx, enterprise-badge.tsx |
| **Toasts** | `sonner` (30+ files), `AnimatedToast` (1 file) | sonner (keep), deprecate AnimatedToast | enterprise/motion/animated-toast.tsx |
| **Tables** | `EnterpriseTable` (5 consumers), `DataTable` (1 consumer), 70+ raw `<table>` | `ds/table.tsx` (EnterpriseTable enhanced) | DataTable (base), raw tables (migrate) |
| **Forms** | `EnterpriseForm` (10 consumers), 17 raw `<form>`, 6 FPA inline `<form onSubmit>` | `ds/form.tsx` (EnterpriseForm enhanced) | raw forms (migrate) |
| **Charts** | 95+ inline SVG charts, `enterprise/analytics/` (11 components) | `ds/chart.tsx` wrapper | inline SVG (migrate high-traffic) |
| **Alerts** | Inline `<div>` patterns, `AlertCenter`, `SmartAlerts` | `ds/alert.tsx` | inline alerts (migrate) |
| **Empty States** | 13 pages with comment-only handling, `EmptyState` component exists | `ds/empty-state.tsx` | inline empty states |
| **Error States** | `error-boundary.tsx` (has role), `app/error.tsx` (no role), `global-error.tsx` (no role) | `ds/error-state.tsx` | app/error.tsx, global-error.tsx patterns |
| **Loading** | 5 skeleton systems + Spinner + inline | `ds/skeleton.tsx` + `ds/spinner.tsx` | All others |
| **Page Headers** | `ExecutiveHeader`, `EnterprisePageHeader`, inline headers | `ds/page-header.tsx` | ExecutiveHeader, EnterprisePageHeader |
| **Dashboard Layout** | `DashboardGrid`, `DashboardSection`, raw divs | `ds/dashboard-layout.tsx` | DashboardGrid, DashboardSection |
| **Status Indicators** | `StatusDot`, `StatusBadge`, `StatusLabel`, `HealthIndicator`, `RiskIndicator` | `ds/status.tsx` | HealthIndicator, RiskIndicator (consolidate) |
| **Tooltips** | Radix Tooltip (used in some), no standard | `ds/tooltip.tsx` | — (new canonical) |

### Color Token Conflict

| Token | System A (tokens/colors.ts) | System B (tailwind.config) | System C (globals.css) | Resolution |
|-------|----------------------------|---------------------------|----------------------|------------|
| Gold primary | `#d4a800` | `#D4AF37` | `#d4af37` | Unify to `#d4af37` via `--color-gold` |
| Background | `#0f0f11` | `#050505` (bg1) | `#040404` | Unify to `#0a0a0f` via `--surface-primary` |
| Border | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.08)` | Unify to `rgba(255,255,255,0.08)` via `--border-default` |

---

## 2. Canonical Replacements

### Design Token Layer (`src/design-system/tokens/`)

| File | Status | Purpose |
|------|--------|---------|
| `colors.ts` | **UPDATE** | Single source of truth — merge all 3 systems |
| `typography.ts` | **UPDATE** | Merge tailwind.config font declarations |
| `spacing.ts` | KEEP | Already comprehensive |
| `radius.ts` | **UPDATE** | Align with tailwind.config radius |
| `shadows.ts` | **UPDATE** | Merge globals.css shadow vars |
| `motion.ts` | KEEP | Already comprehensive |
| `breakpoints.ts` | **NEW** | Responsive breakpoints |
| `z-index.ts` | KEEP | Already exists |

### New CSS Variables (`src/app/globals.css`)

Replace 24 `--perionyx-*` vars with semantic tokens:

```
--color-gold: #d4af37
--color-success: #22c55e
--color-warning: #f59e0b
--color-danger: #ef4444
--color-info: #3b82f6
--surface-primary: #0a0a0f
--surface-secondary: #111118
--surface-tertiary: #1a1a24
--surface-elevated: #222230
--border-default: rgba(255,255,255,0.08)
--border-strong: rgba(255,255,255,0.12)
--border-subtle: rgba(255,255,255,0.04)
--text-primary: #f7f6f2
--text-secondary: #a1a1aa
--text-tertiary: #71717a
--text-disabled: #52525b
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 8px
--radius-xl: 12px
--radius-2xl: 16px
--shadow-soft: 0 1px 3px rgba(0,0,0,0.3)
--shadow-medium: 0 4px 12px rgba(0,0,0,0.4)
--shadow-large: 0 8px 24px rgba(0,0,0,0.5)
```

### Canonical Components (`src/design-system/`)

| File | Replaces | Props |
|------|----------|-------|
| `button.tsx` | ui/button, enterprise-button, AnimatedButton | variant, size, loading, icon, className |
| `card.tsx` | ui/card, enterprise-card, raw divs | variant, padding, hover, interactive, className |
| `dialog.tsx` | ui/dialog, ui/sheet, animated-dialog, enterprise-dialog | variant (modal/sheet), size, title, description, onClose |
| `skeleton.tsx` | ui/skeleton, design-system/loading, motion/loading-skeleton, inline | variant, lines, width, height, className |
| `badge.tsx` | ui/badge, enterprise-badge | variant (semantic), size, icon, className |
| `alert.tsx` | Inline alerts, AlertCenter, SmartAlerts | variant, title, message, action, dismissible |
| `tooltip.tsx` | Radix Tooltip (standardize) | content, side, delay |
| `table.tsx` | EnterpriseTable + DataTable | Full EnterpriseTable features |
| `form.tsx` | EnterpriseForm + raw forms | Full EnterpriseForm features |
| `chart.tsx` | 95+ inline charts | type, data, config, loading, error |
| `empty-state.tsx` | 13 comment-only pages | icon, title, description, action |
| `error-state.tsx` | error-boundary, app/error, global-error | error, reset, title, description |
| `page-header.tsx` | ExecutiveHeader, EnterprisePageHeader, inline | title, description, actions, breadcrumbs |
| `dashboard-layout.tsx` | DashboardGrid, DashboardSection, raw divs | header, kpis, alerts, recommendations, content, activity |
| `status.tsx` | StatusDot, StatusBadge, StatusLabel, HealthIndicator | variant, value, trend, size |
| `spinner.tsx` | LoadingSpinner, inline spinners | size, color |

---

## 3. Deprecated Components

| File | Action | Replacement |
|------|--------|-------------|
| `src/components/ui/button.tsx` | DEPRECATE | `src/design-system/button.tsx` |
| `src/components/ui/card.tsx` | DEPRECATE | `src/design-system/card.tsx` |
| `src/components/ui/dialog.tsx` | DEPRECATE | `src/design-system/dialog.tsx` |
| `src/components/ui/sheet.tsx` | DEPRECATE | `src/design-system/dialog.tsx` (sheet variant) |
| `src/components/ui/skeleton.tsx` | DEPRECATE | `src/design-system/skeleton.tsx` |
| `src/components/ui/badge.tsx` | DEPRECATE | `src/design-system/badge.tsx` |
| `src/components/ui/loading-state.tsx` | DEPRECATE | `src/design-system/skeleton.tsx` |
| `src/components/ui/empty-state.tsx` | DEPRECATE | `src/design-system/empty-state.tsx` |
| `src/components/ui/error-boundary.tsx` | DEPRECATE | `src/design-system/error-state.tsx` |
| `src/components/design-system/buttons/enterprise-button.tsx` | DEPRECATE | `src/design-system/button.tsx` |
| `src/components/design-system/cards/enterprise-card.tsx` | DEPRECATE | `src/design-system/card.tsx` |
| `src/components/design-system/badges/enterprise-badge.tsx` | DEPRECATE | `src/design-system/badge.tsx` |
| `src/components/design-system/dialogs/enterprise-dialog.tsx` | DEPRECATE | `src/design-system/dialog.tsx` |
| `src/components/design-system/loading/loading-states.tsx` | DEPRECATE | `src/design-system/skeleton.tsx` |
| `src/components/enterprise/motion/animated-dialog.tsx` | DEPRECATE | `src/design-system/dialog.tsx` |
| `src/components/enterprise/motion/animated-toast.tsx` | DEPRECATE | sonner |
| `src/components/enterprise/motion/loading-skeleton.tsx` | DEPRECATE | `src/design-system/skeleton.tsx` |
| `src/components/data-table/data-table.tsx` | DEPRECATE | `src/design-system/table.tsx` |

---

## 4. Migration Order

### Phase 1 — Foundation (THIS SESSION)
1. ✅ Create DESIGN_SYSTEM_MIGRATION_PLAN.md
2. Create unified design tokens (merge 3 systems into 1)
3. Update globals.css with semantic tokens
4. Update tailwind.config to reference design tokens
5. Create canonical Button, Card, Dialog, Skeleton, Badge, Alert, EmptyState, ErrorState, Spinner, StatusIndicator, PageHeader, DashboardLayout
6. Keep old components as re-export shims for backward compatibility

### Phase 2 — Navigation Redesign
7. Consolidate 30 sections into 7 workflow-based groups
8. Update nav-config.ts with new hierarchy
9. Update breadcrumb mappings
10. Update command palette shortcuts

### Phase 3 — High-Traffic Page Migration
11. Executive Dashboard + Command Center
12. CFO pages (8 pages)
13. Controller pages (9 pages)
14. Treasury pages (12 pages)
15. Audit pages (10 pages)
16. Compliance pages (9 pages)
17. FP&A pages (10 pages)
18. Tax pages (9 pages)
19. Governance pages (10 pages)

### Phase 4 — Table/Form/Chart Migration
20. Migrate raw tables to EnterpriseTable (70+ pages)
21. Migrate raw forms to EnterpriseForm (17+ pages)
22. Create chart wrapper component

### Phase 5 — Accessibility & Performance
23. WCAG AA pass (contrast, labels, ARIA, keyboard)
24. Standardize loading/skeleton states
25. Add lazy loading for route components

### Phase 6 — Documentation & Audit
26. Generate design system documentation
27. Run UX Audit V2
28. Compare scores

---

## 5. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing pages during migration | HIGH | Keep old components as re-export shims; migrate incrementally |
| TypeScript errors from component API changes | HIGH | Maintain backward-compatible prop interfaces |
| Visual regressions | MEDIUM | Visual regression testing; migrate one module at a time |
| Performance regression from additional abstraction | LOW | Monitor bundle size; tree-shake unused exports |
| Navigation confusion during transition | MEDIUM | Keep old URLs working via redirects |

---

## 6. Rollback Strategy

- Old components remain as re-export shims pointing to new canonical components
- If a new component causes issues, the shim can be reverted to the original implementation
- Git branches per migration phase allow cherry-picking reversions
- `pnpm typecheck` and `pnpm build` run after every migration batch

---

## 7. Estimated Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Button systems | 4 | 1 | -75% |
| Card systems | 4+ | 1 | -80% |
| Dialog systems | 4 | 1 | -75% |
| Skeleton systems | 5 | 1 | -80% |
| Badge systems | 2+ | 1 | -60% |
| Toast systems | 2 | 1 | -50% |
| Table systems | 3 | 1 | -67% |
| Form systems | 3 | 1 | -67% |
| Color gold values | 3 | 1 | -67% |
| Nav sections | 30 | 7 | -77% |
| Nav entries | 224 | ~150 | -33% |
| UX Score | 4.7/10 | 8.5+/10 | +81% |
| Design token systems | 3 | 1 | -67% |
| Accessibility issues | ~20 | <5 | -75% |
