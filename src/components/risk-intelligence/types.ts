export interface RiskKpi {
  id: string;
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  status: "critical" | "warning" | "healthy" | "info";
  insight: string;
  sparklineData: number[];
}

export interface HeatmapRow {
  businessUnit: string;
  categories: { category: string; level: "low" | "medium" | "high" | "critical"; value: number }[];
}

export interface PolicyMetric {
  id: string;
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  description: string;
  status: "critical" | "warning" | "healthy";
}

export interface Vendor {
  id: string;
  name: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  category: string;
  country: string;
  status: "active" | "review" | "watchlist" | "suspended";
  recommendation: string;
  addedAt: string;
}

export interface Region {
  id: string;
  name: string;
  transactionVolume: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  policyExceptions: number;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
}

export interface TrendPeriod {
  id: string;
  label: string;
  data: { label: string; value: number; color?: string }[];
  insight: string;
}

export interface ExceptionMetric {
  id: string;
  label: string;
  count: number;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  impact: string;
  status: "critical" | "warning" | "healthy";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: string;
  trend: "up" | "down" | "neutral";
}
