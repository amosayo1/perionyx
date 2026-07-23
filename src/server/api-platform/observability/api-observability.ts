import type { RequestContext, ApiVersion, RateLimitTier } from "../types";

// ──────────────────────────────────────────────────────────
// API Observability — Metrics & Dimensions
// ──────────────────────────────────────────────────────────

export interface ApiMetricPoint {
  timestamp: number;
  method: string;
  path: string;
  version: ApiVersion;
  statusCode: number;
  durationMs: number;
  rateLimitTier: RateLimitTier;
  authStrategy?: string;
  tenantId?: string;
  userId?: string;
  error?: string;
}

const MAX_METRICS = 10000;
const metrics: ApiMetricPoint[] = [];

export function recordApiMetric(point: Omit<ApiMetricPoint, "timestamp">): void {
  const entry: ApiMetricPoint = { ...point, timestamp: Date.now() };
  metrics.push(entry);
  if (metrics.length > MAX_METRICS) {
    metrics.splice(0, metrics.length - MAX_METRICS);
  }
}

export function getApiMetrics(
  windowMs = 3600000,
  options?: { method?: string; version?: ApiVersion; statusCode?: number },
): ApiMetricPoint[] {
  const cutoff = Date.now() - windowMs;
  let filtered = metrics.filter((m) => m.timestamp >= cutoff);

  if (options?.method) filtered = filtered.filter((m) => m.method === options.method);
  if (options?.version) filtered = filtered.filter((m) => m.version === options.version);
  if (options?.statusCode) filtered = filtered.filter((m) => m.statusCode === options.statusCode);

  return filtered;
}

export function getRequestVolume(windowMs = 3600000): number {
  return getApiMetrics(windowMs).length;
}

export function getAverageLatency(windowMs = 3600000): number {
  const recent = getApiMetrics(windowMs);
  if (recent.length === 0) return 0;
  return Math.round(recent.reduce((sum, m) => sum + m.durationMs, 0) / recent.length);
}

export function getErrorRate(windowMs = 3600000): number {
  const recent = getApiMetrics(windowMs);
  if (recent.length === 0) return 0;
  const errors = recent.filter((m) => m.statusCode >= 400).length;
  return Math.round((errors / recent.length) * 100);
}

export function getEndpointUsage(windowMs = 3600000): Array<{
  path: string;
  method: string;
  count: number;
  avgLatencyMs: number;
  errorRate: number;
}> {
  const recent = getApiMetrics(windowMs);
  const grouped = new Map<string, { count: number; totalLatency: number; errors: number; method: string; path: string }>();

  for (const m of recent) {
    const key = `${m.method}:${m.path}`;
    const existing = grouped.get(key) ?? { count: 0, totalLatency: 0, errors: 0, method: m.method, path: m.path };
    existing.count++;
    existing.totalLatency += m.durationMs;
    if (m.statusCode >= 400) existing.errors++;
    grouped.set(key, existing);
  }

  return [...grouped.values()]
    .map((g) => ({
      path: g.path,
      method: g.method,
      count: g.count,
      avgLatencyMs: Math.round(g.totalLatency / g.count),
      errorRate: Math.round((g.errors / g.count) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getAuthMetrics(windowMs = 3600000): {
  totalAuthAttempts: number;
  authFailures: number;
  authSuccessRate: number;
  byStrategy: Record<string, { attempts: number; failures: number }>;
} {
  const recent = getApiMetrics(windowMs);
  const authRequests = recent.filter((m) => m.authStrategy);

  const byStrategy: Record<string, { attempts: number; failures: number }> = {};
  for (const m of authRequests) {
    const strat = m.authStrategy ?? "unknown";
    if (!byStrategy[strat]) byStrategy[strat] = { attempts: 0, failures: 0 };
    byStrategy[strat].attempts++;
    if (m.statusCode === 401 || m.statusCode === 403) byStrategy[strat].failures++;
  }

  const totalFailures = Object.values(byStrategy).reduce((s, v) => s + v.failures, 0);

  return {
    totalAuthAttempts: authRequests.length,
    authFailures: totalFailures,
    authSuccessRate: authRequests.length
      ? Math.round(((authRequests.length - totalFailures) / authRequests.length) * 100)
      : 100,
    byStrategy,
  };
}

export function getWebhookMetrics(windowMs = 3600000): {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageLatencyMs: number;
} {
  const webhookRequests = metrics.filter(
    (m) => m.path.includes("/webhooks") && m.timestamp >= Date.now() - windowMs,
  );
  const successful = webhookRequests.filter((m) => m.statusCode < 400);
  const latencies = webhookRequests.filter((m) => m.durationMs > 0);

  return {
    totalDeliveries: webhookRequests.length,
    successfulDeliveries: successful.length,
    failedDeliveries: webhookRequests.length - successful.length,
    averageLatencyMs: latencies.length
      ? Math.round(latencies.reduce((s, m) => s + m.durationMs, 0) / latencies.length)
      : 0,
  };
}

export function getApiObservabilitySummary() {
  return {
    requestVolume: getRequestVolume(),
    averageLatencyMs: getAverageLatency(),
    errorRate: getErrorRate(),
    endpoints: getEndpointUsage(),
    auth: getAuthMetrics(),
    webhook: getWebhookMetrics(),
  };
}

export function getRateLimitEvents(windowMs = 3600000): number {
  return getApiMetrics(windowMs, { statusCode: 429 }).length;
}

export function getSdkUsageMetrics(windowMs = 3600000): {
  totalRequests: number;
  userAgentBreakdown: Record<string, number>;
} {
  const recent = getApiMetrics(windowMs);
  const userAgentCount: Record<string, number> = {};

  for (const m of metrics) {
    if (m.timestamp < Date.now() - windowMs) continue;
    if (!m.authStrategy) continue;
    const key = m.authStrategy;
    userAgentCount[key] = (userAgentCount[key] ?? 0) + 1;
  }

  return {
    totalRequests: recent.length,
    userAgentBreakdown: userAgentCount,
  };
}
