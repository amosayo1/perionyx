import type { ApiPlatformConfig, RateLimitTier } from "./types";

const DEFAULT_CONFIG: ApiPlatformConfig = {
  baseUrl: process.env.API_BASE_URL ?? "http://localhost:3000",
  versions: ["v1"],
  defaultVersion: "v1",
  rateLimits: {
    free: { requests: 60, windowMs: 60000 },
    basic: { requests: 300, windowMs: 60000 },
    enterprise: { requests: 3000, windowMs: 60000 },
    internal: { requests: 10000, windowMs: 60000 },
  },
  maxPageSize: 200,
  defaultPageSize: 25,
  requestTimeoutMs: 30000,
  compressionEnabled: true,
  correlationHeader: "x-correlation-id",
  auditEnabled: true,
  openApiPath: "/api/openapi.json",
  developerPortalPath: "/developer",
};

let instance: ApiPlatformConfig | null = null;

export function getApiConfig(): ApiPlatformConfig {
  if (!instance) {
    instance = { ...DEFAULT_CONFIG };
  }
  return instance;
}

export function updateApiConfig(overrides: Partial<ApiPlatformConfig>): ApiPlatformConfig {
  const config = getApiConfig();
  Object.assign(config, overrides);
  return config;
}

export function getRateLimitConfig(tier: RateLimitTier): { requests: number; windowMs: number } {
  const config = getApiConfig();
  return config.rateLimits[tier] ?? config.rateLimits.free;
}

export function getPageSize(pageSize?: number): number {
  const config = getApiConfig();
  if (!pageSize || pageSize < 1) return config.defaultPageSize;
  return Math.min(pageSize, config.maxPageSize);
}
