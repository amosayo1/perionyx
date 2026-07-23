import type { ReactNode } from "react";

export type TrendDirection = "up" | "down" | "neutral";

export type StatusLevel = "healthy" | "warning" | "critical" | "neutral" | "info";

export type ComparisonPeriod = "today" | "yesterday" | "week" | "month" | "quarter" | "year" | "custom";

export interface TrendData {
  value: number;
  direction: TrendDirection;
  period?: string;
  sparklineData?: number[];
}

export interface KpiData {
  label: string;
  value: string | number;
  formattedValue?: string;
  trend?: TrendData;
  status?: StatusLevel;
  confidence?: number;
  subtitle?: string;
  comparisonLabel?: string;
  previousValue?: string | number;
  variance?: number;
  variancePercent?: number;
  lastUpdated?: Date;
  sparklineData?: number[];
  drillDownAction?: () => void;
  drillDownLabel?: string;
  gold?: boolean;
}

export interface ChartSeries {
  label: string;
  data: number[];
  color: string;
  dashed?: boolean;
  type?: "line" | "bar" | "area";
}

export interface ChartConfig {
  series: ChartSeries[];
  labels?: string[];
  height?: number;
  width?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  formatY?: (value: number) => string;
  formatX?: (value: string) => string;
  className?: string;
}

export interface VarianceData {
  category: string;
  budget: number;
  actual: number;
  forecast?: number;
  previous?: number;
}

export interface ApprovalMetric {
  status: string;
  count: number;
  avgWaitMinutes: number;
  trend?: TrendData;
}

export interface WorkflowMetric {
  name: string;
  total: number;
  completed: number;
  failed: number;
  avgDurationMs: number;
  trend?: TrendData;
}

export interface CashFlowPoint {
  date: string;
  inflows: number;
  outflows: number;
  balance: number;
  forecast?: boolean;
}

export interface ForecastPoint {
  date: string;
  value: number;
  lowerBound?: number;
  upperBound?: number;
  confidence?: number;
}

export interface InsightItem {
  type: "positive" | "negative" | "info" | "risk";
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  metric?: string;
  value?: string;
  confidence?: number;
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface DrillDownConfig {
  title: string;
  data: unknown;
  onNavigate?: (path: string) => void;
  onFilter?: (filter: Record<string, unknown>) => void;
}

export interface ExecutiveSummaryData {
  period: string;
  positiveInsights: InsightItem[];
  negativeInsights: InsightItem[];
  risks: InsightItem[];
  recommendations: InsightItem[];
  kpis: KpiData[];
  lastUpdated: Date;
}
