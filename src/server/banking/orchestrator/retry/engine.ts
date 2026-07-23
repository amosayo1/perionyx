import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand } from "../commands/types";
import { executionEngine } from "../execution/engine";
import { circuitBreaker } from "./circuit-breaker";

export class RetryEngine {
  async executeWithRetry(
    context: ExecutionContext,
    command: OrchestratorCommand,
    maxRetries: number,
  ): Promise<ExecutionResult> {
    let lastResult: ExecutionResult | null = null;
    let retryCount = 0;
    const provider = context.currentProvider!;

    if (!circuitBreaker.canAttempt(provider)) {
      return {
        success: false,
        error: {
          stage: "EXECUTION" as any,
          message: `Circuit breaker is OPEN for provider ${provider}`,
          code: "CIRCUIT_BREAKER_OPEN",
          retryable: false,
          timestamp: new Date().toISOString(),
        },
        providerUsed: provider,
        durationMs: 0,
        retryCount: 0,
        fallbackCount: 0,
      };
    }

    while (retryCount <= maxRetries) {
      if (retryCount > 0) {
        const delayMs = this.calculateDelay(retryCount);
        await this.sleep(delayMs);
      }

      const result = await executionEngine.execute(command, context);

      if (result.success) {
        circuitBreaker.recordSuccess(provider);

        return {
          ...result,
          retryCount,
          fallbackCount: 0,
        };
      }

      lastResult = result;

      const isRetryable = result.error?.retryable ?? false;
      const isTransient = result.error?.code === "RATE_LIMIT_EXCEEDED" ||
        result.error?.code === "TIMEOUT" ||
        result.error?.code === "NETWORK_ERROR";

      if (!isRetryable && !isTransient) {
        circuitBreaker.recordFailure(provider);
        break;
      }

      retryCount++;
    }

    if (provider) {
      circuitBreaker.recordFailure(provider);
    }

    return {
      success: false,
      error: lastResult?.error ?? {
        stage: "EXECUTION" as any,
        message: "Max retries exceeded",
        code: "MAX_RETRIES_EXCEEDED",
        retryable: false,
        timestamp: new Date().toISOString(),
      },
      providerUsed: provider,
      durationMs: lastResult?.durationMs ?? 0,
      retryCount,
      fallbackCount: 0,
    };
  }

  private calculateDelay(retryCount: number): number {
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);
    const jitter = delay * 0.1 * Math.random();
    return Math.round(delay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const retryEngine = new RetryEngine();