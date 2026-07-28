/**
 * Enterprise Provider Runtime — Types
 *
 * Phase 24.0
 *
 * Every provider inherits a shared runtime.
 * No provider should reimplement: retry, timeout, circuit breaker, rate limiting,
 * idempotency, OAuth, health checks, telemetry, metrics, tracing, error normalization.
 */

// ── Provider Configuration ───────────────────────────────────────────────────

export interface ProviderConfig {
  /** Provider identifier. */
  providerId: string;
  /** Provider display name. */
  name: string;
  /** Base URL for API calls. */
  baseUrl: string;
  /** Request timeout in milliseconds. */
  timeoutMs: number;
  /** Maximum retry attempts. */
  maxRetries: number;
  /** Initial backoff delay in milliseconds. */
  initialBackoffMs: number;
  /** Maximum backoff delay in milliseconds. */
  maxBackoffMs: number;
  /** Circuit breaker threshold (failures before opening). */
  circuitBreakerThreshold: number;
  /** Circuit breaker reset timeout in milliseconds. */
  circuitBreakerResetMs: number;
  /** Rate limit: requests per minute. */
  rateLimitRpm: number;
  /** Rate limit: burst size. */
  rateLimitBurst: number;
  /** Whether to enable idempotency for mutations. */
  enableIdempotency: boolean;
  /** OAuth client ID (if applicable). */
  oauthClientId?: string;
  /** OAuth scopes required. */
  oauthScopes?: string[];
  /** Custom headers. */
  customHeaders?: Record<string, string>;
  /** Configuration from the Configuration Platform. */
  configKey?: string;
}

// ── Provider State ───────────────────────────────────────────────────────────

export enum ProviderState {
  IDLE = "IDLE",
  INITIALIZING = "INITIALIZING",
  READY = "READY",
  ERROR = "ERROR",
  CIRCUIT_OPEN = "CIRCUIT_OPEN",
  DISABLED = "DISABLED",
}

export interface ProviderHealth {
  healthy: boolean;
  state: ProviderState;
  latencyMs: number | null;
  lastCheckedAt: Date | null;
  lastError: string | null;
  consecutiveFailures: number;
  uptime: number;
  requestsTotal: number;
  errorsTotal: number;
}

// ── Request/Response Types ───────────────────────────────────────────────────

export interface ProviderRequest {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  /** Idempotency key for mutations. */
  idempotencyKey?: string;
  /** Request timeout override. */
  timeoutMs?: number;
  /** Correlation ID for tracing. */
  correlationId?: string;
}

export interface ProviderResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error: ProviderError | null;
  /** Response time in milliseconds. */
  latencyMs: number;
  /** Whether this response was from cache. */
  cached: boolean;
  /** Idempotency replay detected. */
  idempotentReplay: boolean;
}

export interface ProviderError {
  code: string;
  message: string;
  category: ProviderErrorCategory;
  retryable: boolean;
  statusCode: number | null;
  providerMessage: string | null;
}

export enum ProviderErrorCategory {
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  RATE_LIMITED = "RATE_LIMITED",
  NETWORK = "NETWORK",
  TIMEOUT = "TIMEOUT",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN = "UNKNOWN",
}

// ── Telemetry Types ──────────────────────────────────────────────────────────

export interface ProviderMetrics {
  requestsTotal: number;
  requestsSuccessful: number;
  requestsFailed: number;
  averageLatencyMs: number;
  p99LatencyMs: number;
  circuitBreakerTrips: number;
  rateLimitHits: number;
  retriesTotal: number;
}

// ── OAuth Types ──────────────────────────────────────────────────────────────

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  tokenType: string;
  scopes: string[];
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
}
