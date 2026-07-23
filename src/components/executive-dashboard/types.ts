"use client";

export interface KpiData {
  label: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  format?: "currency" | "percent" | "number" | "compact";
  trend?: "up" | "down" | "flat";
  trendValue?: number;
  status?: "success" | "warning" | "error" | "neutral";
  sparklineData?: number[];
  confidence?: number;
  subtitle?: string;
  lastUpdated?: Date;
  source?: string;
}

export interface HealthScore {
  label: string;
  score: number;
  maxScore: number;
  status: "healthy" | "warning" | "critical";
  trend?: "up" | "down" | "flat";
}

export interface TimelineEvent {
  id: string;
  type: "approval" | "payment" | "risk" | "policy" | "treasury" | "automation" | "ai" | "compliance";
  title: string;
  description: string;
  timestamp: string;
  status?: "completed" | "pending" | "failed" | "warning";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  roi?: string;
  timeSaved?: string;
  category: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  shortcut?: string;
}

export interface DashboardState {
  isLoading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
}

export type CardSize = "full" | "half" | "third" | "two-thirds" | "quarter";

export interface DashboardCardProps {
  title: string;
  description?: string;
  size?: CardSize;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
  onPin?: () => void;
  onExport?: () => void;
  pinned?: boolean;
  fullscreen?: boolean;
  onFullscreen?: () => void;
  className?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}
