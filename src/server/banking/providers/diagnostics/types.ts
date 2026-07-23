import type { BankProviderKind } from "../../domain/types";

export interface ProviderHealthStatus {
  providerKind: BankProviderKind;
  name: string;
  status: "healthy" | "degraded" | "unavailable" | "unknown";
  latencyMs: number | null;
  lastCheckedAt: string;
  successRate: number;
  errorRate: number;
  errorMessage?: string;
  score: number;
}

export interface DiagnosticsReport {
  generatedAt: string;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unavailable: number;
    unknown: number;
  };
  providers: ProviderHealthStatus[];
  recommendations: string[];
}
