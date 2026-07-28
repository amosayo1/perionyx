// Design System — Enterprise Component Library
// Re-exports standardized components + existing enterprise infrastructure

// ─── Buttons ─────────────────────────────────────────
export { EnterpriseButton, ToolbarButton, IconButton } from "./buttons";
export type { EnterpriseButtonProps } from "./buttons";

// ─── Cards ───────────────────────────────────────────
export { EnterpriseCard } from "./cards";
export type { EnterpriseCardProps } from "./cards";

// ─── Status ──────────────────────────────────────────
export { StatusDot, StatusBadge, StatusLabel } from "./status";
export type { StatusType } from "./status";

// ─── Badges ──────────────────────────────────────────
export { EnterpriseBadge, PriorityBadge } from "./badges";
export type { BadgeVariant } from "./badges";

// ─── Dialogs ─────────────────────────────────────────
export { EnterpriseDialog, ConfirmDialog } from "./dialogs";
export type { EnterpriseDialogProps } from "./dialogs";

// ─── Loading & Skeleton ──────────────────────────────
export { Skeleton, SkeletonGroup, MetricSkeleton, TableSkeleton, ChartSkeleton, LoadingSpinner } from "./loading";

// ─── Empty State ─────────────────────────────────────
export { EmptyState } from "./loading/empty-state";

// ─── Micro Components ────────────────────────────────
export { MetricDelta, TrendArrow, ConfidenceScore, HealthDot, formatCurrency, formatPercent, formatCompactInteger } from "./micro";

// ─── Charts ──────────────────────────────────────────
export { SparklineChart, TrendLineChart, BarChart, DonutChart, HealthScorecard } from "@/components/executive-dashboard/charts";

// ─── Enterprise Metrics (existing) ────────────────────
export { MetricCard } from "@/components/enterprise/metric-card";
export { MetricCardEnhanced } from "@/components/enterprise/metric-card-enhanced";
export { ExecutiveMetricCard } from "@/components/enterprise/executive-metric-card";
export { AnimatedCounter } from "@/components/enterprise/animated-counter";
export { MetricTrend } from "@/components/enterprise/metric-trend";

// ─── Enterprise Dashboard (existing) ──────────────────
export { DashboardGrid, DashboardLayout, DashboardMain, DashboardSidebar } from "@/components/enterprise/dashboard-grid";
export { DashboardSection } from "@/components/enterprise/dashboard-section";
export { ExecutiveSummary, ExpandableWidget, HealthRiskWidget, RecommendedActions, DismissibleBanner } from "@/components/enterprise/dashboard-widgets";

// ─── Enterprise Navigation (existing) ────────────────
export { BreadcrumbBar } from "@/components/navigation/breadcrumb-bar";
export { EnterpriseSidebarNew } from "@/components/navigation/enterprise-sidebar-new";
export { NavigationProvider, useNavigation } from "@/components/navigation/navigation-state";
export { WorkspaceSwitcher } from "@/components/navigation/workspace-switcher";

// ─── Enterprise Tables (existing) ─────────────────────
export { EnterpriseTable } from "@/components/enterprise/table/data-table";
export type { Column, SortState, CellConfig, EnterpriseTableProps } from "@/components/enterprise/table/types";

// ─── Enterprise Forms (existing) ──────────────────────
export { EnterpriseForm } from "@/components/enterprise/forms/enterprise-form";
export { EnterpriseSection } from "@/components/enterprise/forms/enterprise-section";
export { EnterpriseField } from "@/components/enterprise/forms/enterprise-field";
export { SmartSelect } from "@/components/enterprise/forms/smart-select";
export { EnterpriseWizard } from "@/components/enterprise/forms/enterprise-wizard";

// ─── Enterprise Analytics (existing) ──────────────────
export { ExecutiveKpiCard } from "@/components/enterprise/analytics/executive-kpi-card";
export { ChartToolbar } from "@/components/enterprise/analytics/chart-toolbar";
export { ChartLegend } from "@/components/enterprise/analytics/chart-legend";
export { VarianceCard } from "@/components/enterprise/analytics/variance-card";

// ─── Enterprise Motion (existing) ─────────────────────
export { AnimatedCard } from "@/components/enterprise/motion/animated-card";
export { AnimatedButton } from "@/components/enterprise/motion/animated-button";
export { AnimatedDialog } from "@/components/enterprise/motion/animated-dialog";
export { AnimatedToast } from "@/components/enterprise/motion/animated-toast";
export { AnimatedMetric } from "@/components/enterprise/motion/animated-metric";
export { PageTransition } from "@/components/enterprise/motion/page-transition";
export { SectionTransition, SectionItem } from "@/components/enterprise/motion/section-transition";
export { LoadingSkeleton, SkeletonCard, SkeletonTable } from "@/components/enterprise/motion/loading-skeleton";

// ─── Enterprise Status (existing) ─────────────────────
export { HealthIndicator, HealthBar } from "@/components/enterprise/health-indicator";

// ─── Design Tokens (canonical EDL source) ────────────
export { BRAND, SURFACES, TEXT, BORDERS, STATUS, FINANCIAL, RISK, SHADOWS, ELEVATION } from "@/design-system/edl/colors";
export { FONT_FAMILY, FONT_SIZE } from "@/design-system/edl/typography";
export { SPACE, LAYOUT } from "@/design-system/edl/spacing";
export { RADIUS, RADIUS_USE } from "@/design-system/edl/radius";
export { DURATION, EASING, VARIANTS } from "@/design-system/edl/motion";
export { Z } from "@/design-system/edl/z-index";

// ─── Design Providers (existing) ──────────────────────
export { ThemeProvider } from "@/design-system/providers/theme-provider";
export { DesignTokenProvider, useColor, useSpacing, useTypography } from "@/design-system/providers/design-token-provider";
export { ColorModeProvider, useColorMode } from "@/design-system/providers/color-mode-provider";
