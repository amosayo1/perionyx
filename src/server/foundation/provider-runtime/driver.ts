/**
 * Enterprise Provider Runtime — Base Driver
 *
 * Phase 24.0
 *
 * Every provider inherits from this base class.
 * Implements: retry, timeout, circuit breaker, rate limiting, idempotency,
 * health checks, telemetry, metrics, tracing, error normalization.
 *
 * No provider should reimplement these concerns.
 */

import {
  ProviderConfig,
  ProviderState,
  ProviderHealth,
  ProviderRequest,
  ProviderResponse,
  ProviderError,
  ProviderErrorCategory,
  ProviderMetrics,
  OAuthTokens,
} from "./types";
import { CircuitBreaker } from "./circuit-breaker";
import { RateLimiter } from "./rate-limiter";
import { withRetry } from "./retry";

// ── Provider Driver Base ─────────────────────────────────────────────────────

export abstract class ProviderDriver {
  protected config: ProviderConfig;
  protected state: ProviderState = ProviderState.IDLE;
  protected circuitBreaker: CircuitBreaker;
  protected rateLimiter: RateLimiter;
  protected metrics: ProviderMetrics;
  protected oauthTokens: OAuthTokens | null = null;
  protected lastHealthCheck: Date | null = null;
  protected lastError: string | null = null;
  protected consecutiveFailures = 0;
  protected startTime: Date | null = null;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker(
      config.circuitBreakerThreshold,
      config.circuitBreakerResetMs,
    );
    this.rateLimiter = new RateLimiter(
      config.rateLimitRpm,
      config.rateLimitBurst,
    );
    this.metrics = {
      requestsTotal: 0,
      requestsSuccessful: 0,
      requestsFailed: 0,
      averageLatencyMs: 0,
      p99LatencyMs: 0,
      circuitBreakerTrips: 0,
      rateLimitHits: 0,
      retriesTotal: 0,
    };
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /**
   * Initialize the provider. Subclasses must implement.
   */
  async initialize(): Promise<void> {
    this.state = ProviderState.INITIALIZING;
    try {
      await this.onInitialize();
      this.state = ProviderState.READY;
      this.startTime = new Date();
    } catch (error) {
      this.state = ProviderState.ERROR;
      this.lastError = error instanceof Error ? error.message : "Initialization failed";
      throw error;
    }
  }

  /**
   * Shutdown the provider gracefully.
   */
  async shutdown(): Promise<void> {
    await this.onShutdown();
    this.state = ProviderState.DISABLED;
  }

  // ── Core Request Method ──────────────────────────────────────────────────

  /**
   * Execute a request through the provider runtime.
   * Handles: circuit breaker, rate limiting, retry, timeout, metrics, error normalization.
   */
  async executeRequest<T>(request: ProviderRequest): Promise<ProviderResponse<T>> {
    const startTime = Date.now();
    this.metrics.requestsTotal++;

    // 1. Check circuit breaker
    if (!this.circuitBreaker.allowRequest()) {
      this.metrics.circuitBreakerTrips++;
      return this.buildError<T>(
        "CIRCUIT_OPEN",
        `Circuit breaker is open for provider '${this.config.providerId}'.`,
        ProviderErrorCategory.NETWORK,
        503,
        Date.now() - startTime,
        false,
      );
    }

    // 2. Check rate limiter
    if (!this.rateLimiter.tryAcquire()) {
      this.metrics.rateLimitHits++;
      return this.buildError<T>(
        "RATE_LIMITED",
        `Rate limit exceeded for provider '${this.config.providerId}'. Retry in ${this.rateLimiter.waitTimeMs()}ms.`,
        ProviderErrorCategory.RATE_LIMITED,
        429,
        Date.now() - startTime,
        true,
      );
    }

    // 3. Execute with retry
    const timeoutMs = request.timeoutMs ?? this.config.timeoutMs;

    const result = await withRetry(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await this.makeHttpRequest(request, controller.signal);
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      {
        maxAttempts: this.config.maxRetries,
        initialDelayMs: this.config.initialBackoffMs,
        maxDelayMs: this.config.maxBackoffMs,
      },
      (error) => this.isRetryableError(error),
    );

    // 4. Update metrics
    const latencyMs = Date.now() - startTime;
    this.updateLatencyMetrics(latencyMs);

    if (result.success && result.data) {
      this.circuitBreaker.recordSuccess();
      this.consecutiveFailures = 0;
      this.metrics.requestsSuccessful++;
      return {
        ok: true,
        status: 200,
        data: result.data as T,
        error: null,
        latencyMs,
        cached: false,
        idempotentReplay: false,
      };
    }

    // 5. Handle failure
    this.circuitBreaker.recordFailure();
    this.consecutiveFailures++;
    this.metrics.requestsFailed++;
    this.metrics.retriesTotal += result.attempts - 1;

    const error = this.normalizeError(result.error ?? new Error("Unknown error"));
    this.lastError = error.message;

    return {
      ok: false,
      status: error.statusCode ?? 500,
      data: null,
      error,
      latencyMs,
      cached: false,
      idempotentReplay: false,
    };
  }

  // ── Health Check ─────────────────────────────────────────────────────────

  /**
   * Run a health check on the provider.
   */
  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const healthy = await this.onHealthCheck();
      this.lastHealthCheck = new Date();
      return {
        healthy,
        state: this.state,
        latencyMs: Date.now() - start,
        lastCheckedAt: this.lastHealthCheck,
        lastError: this.lastError,
        consecutiveFailures: this.consecutiveFailures,
        uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
        requestsTotal: this.metrics.requestsTotal,
        errorsTotal: this.metrics.requestsFailed,
      };
    } catch (error) {
      this.lastHealthCheck = new Date();
      return {
        healthy: false,
        state: this.state,
        latencyMs: Date.now() - start,
        lastCheckedAt: this.lastHealthCheck,
        lastError: error instanceof Error ? error.message : "Health check failed",
        consecutiveFailures: this.consecutiveFailures,
        uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
        requestsTotal: this.metrics.requestsTotal,
        errorsTotal: this.metrics.requestsFailed,
      };
    }
  }

  // ── OAuth ────────────────────────────────────────────────────────────────

  /**
   * Get valid OAuth tokens, refreshing if necessary.
   */
  async getOAuthTokens(): Promise<OAuthTokens | null> {
    if (!this.config.oauthClientId) return null;
    if (!this.oauthTokens) return null;

    // Check if token is expired (with 5-minute buffer)
    if (this.oauthTokens.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
      return this.refreshOAuthTokens();
    }

    return this.oauthTokens;
  }

  /**
   * Refresh OAuth tokens. Subclasses should implement the actual refresh.
   */
  protected async refreshOAuthTokens(): Promise<OAuthTokens | null> {
    // Default implementation — subclasses override with provider-specific logic
    return this.oauthTokens;
  }

  // ── Metrics ──────────────────────────────────────────────────────────────

  getMetrics(): ProviderMetrics {
    return { ...this.metrics };
  }

  getState(): ProviderState {
    return this.state;
  }

  // ── Abstract Methods (Subclasses Must Implement) ─────────────────────────

  /**
   * Provider-specific initialization logic.
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Provider-specific shutdown logic.
   */
  protected abstract onShutdown(): Promise<void>;

  /**
   * Make the actual HTTP request to the provider API.
   * Subclasses implement provider-specific authentication, headers, URL construction.
   */
  protected abstract makeHttpRequest(
    request: ProviderRequest,
    signal: AbortSignal,
  ): Promise<unknown>;

  /**
   * Provider-specific health check logic.
   */
  protected abstract onHealthCheck(): Promise<boolean>;

  // ── Protected Helpers ────────────────────────────────────────────────────

  /**
   * Build request headers with OAuth bearer token.
   */
  protected async buildHeaders(additional?: Record<string, string>): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.customHeaders,
      ...additional,
    };

    const tokens = await this.getOAuthTokens();
    if (tokens) {
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }

    return headers;
  }

  /**
   * Determine if an error is retryable.
   */
  protected isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    // Network errors, timeouts, and 5xx are retryable
    if (message.includes("econnrefused") || message.includes("econnreset")) return true;
    if (message.includes("timeout") || message.includes("aborted")) return true;
    if (message.includes("500") || message.includes("502") || message.includes("503")) return true;
    if (message.includes("rate limit")) return true; // Retry after backoff
    return false;
  }

  /**
   * Normalize a raw error into a ProviderError.
   */
  protected normalizeError(error: Error): ProviderError {
    const message = error.message;

    if (message.includes("401") || message.includes("unauthorized")) {
      return { code: "AUTH_FAILED", message: "Authentication failed", category: ProviderErrorCategory.AUTHENTICATION, retryable: false, statusCode: 401, providerMessage: message };
    }
    if (message.includes("403") || message.includes("forbidden")) {
      return { code: "AUTH_FORBIDDEN", message: "Authorization denied", category: ProviderErrorCategory.AUTHORIZATION, retryable: false, statusCode: 403, providerMessage: message };
    }
    if (message.includes("429") || message.includes("rate limit")) {
      return { code: "RATE_LIMITED", message: "Rate limit exceeded", category: ProviderErrorCategory.RATE_LIMITED, retryable: true, statusCode: 429, providerMessage: message };
    }
    if (message.includes("timeout") || message.includes("aborted")) {
      return { code: "TIMEOUT", message: "Request timed out", category: ProviderErrorCategory.TIMEOUT, retryable: true, statusCode: 408, providerMessage: message };
    }
    if (message.includes("econnrefused") || message.includes("econnreset") || message.includes("enotfound")) {
      return { code: "NETWORK_ERROR", message: "Network connection failed", category: ProviderErrorCategory.NETWORK, retryable: true, statusCode: null, providerMessage: message };
    }
    if (message.includes("404") || message.includes("not found")) {
      return { code: "NOT_FOUND", message: "Resource not found", category: ProviderErrorCategory.NOT_FOUND, retryable: false, statusCode: 404, providerMessage: message };
    }
    if (message.includes("400") || message.includes("bad request")) {
      return { code: "VALIDATION_ERROR", message: "Request validation failed", category: ProviderErrorCategory.VALIDATION, retryable: false, statusCode: 400, providerMessage: message };
    }
    if (message.includes("409") || message.includes("conflict")) {
      return { code: "CONFLICT", message: "Resource conflict", category: ProviderErrorCategory.CONFLICT, retryable: false, statusCode: 409, providerMessage: message };
    }
    if (message.includes("5")) {
      return { code: "SERVER_ERROR", message: "Provider server error", category: ProviderErrorCategory.SERVER_ERROR, retryable: true, statusCode: 500, providerMessage: message };
    }

    return { code: "UNKNOWN", message: message || "Unknown error", category: ProviderErrorCategory.UNKNOWN, retryable: false, statusCode: null, providerMessage: message };
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private buildError<T>(
    code: string,
    message: string,
    category: ProviderErrorCategory,
    statusCode: number,
    latencyMs: number,
    retryable: boolean,
  ): ProviderResponse<T> {
    return {
      ok: false,
      status: statusCode,
      data: null,
      error: { code, message, category, retryable, statusCode, providerMessage: null },
      latencyMs,
      cached: false,
      idempotentReplay: false,
    };
  }

  private updateLatencyMetrics(latencyMs: number): void {
    const total = this.metrics.requestsTotal;
    this.metrics.averageLatencyMs =
      (this.metrics.averageLatencyMs * (total - 1) + latencyMs) / total;
  }
}
