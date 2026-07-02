export interface DeveloperKpi {
  id: string;
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  status: "healthy" | "warning" | "info";
  insight: string;
  sparklineData: number[];
}

export interface ApiEndpoint {
  id: string;
  name: string;
  version: string;
  status: "stable" | "beta" | "deprecated";
  auth: string;
  baseUrl: string;
  latency: string;
  description: string;
}

export interface Sdk {
  id: string;
  language: string;
  latestVersion: string;
  releaseDate: string;
  packageManager: string;
}

export interface AuthMethod {
  id: string;
  name: string;
  description: string;
  recommendedUsage: string;
  status: "recommended" | "available" | "legacy";
}

export interface WebhookCategory {
  id: string;
  name: string;
  eventCount: number;
  deliveryStatus: "healthy" | "warning" | "degraded";
  retryRate: string;
  lastDelivery: string;
}

export interface DeveloperResource {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}
