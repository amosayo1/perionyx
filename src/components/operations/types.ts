export type Severity = "critical" | "high" | "medium" | "low";

export type ServiceStatus = "healthy" | "warning" | "offline";

export interface HealthMetric {
  id: string;
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  color: "emerald" | "amber" | "red" | "blue" | "zinc";
  sparklineData: number[];
  href: string;
}

export interface AttentionItem {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  owner: string;
  age: string;
  status: string;
  actionLabel: string;
  actionHref: string;
}

export interface QueueCardData {
  id: string;
  title: string;
  count: number;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  avgWait: string;
  largestItem: string;
  href: string;
}

export interface ServiceCardData {
  id: string;
  name: string;
  status: ServiceStatus;
  description: string;
  lastChecked: string;
  latency?: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  label: string;
  description: string;
  timestamp: string;
  href: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  variant?: "default" | "primary";
}
