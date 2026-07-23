import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand } from "../commands/types";
import { orchestratorRouter } from "../routing/router";
import { executionEngine } from "../execution/engine";
import { orchestrationEventBus } from "../events/events";

export interface FailoverDecision {
  fromProvider: string;
  toProvider: string;
  reason: string;
  score: number;
}

export class FailoverEngine {
  async failover(
    context: ExecutionContext,
    command: OrchestratorCommand,
    maxFallbacks: number,
  ): Promise<ExecutionResult> {
    const originalProvider = context.currentProvider!;
    const failoverChain: FailoverDecision[] = [];
    let lastResult: string | null = null;

    orchestrationEventBus.publish("ProviderFailed", {
      correlationId: context.correlationId,
      provider: originalProvider,
      commandKind: context.commandKind,
    });

    const requiredCapabilities = command.getRequiredCapabilities();
    const selection = await orchestratorRouter.selectProviderForCommand(
      context,
      requiredCapabilities,
    );

    if (!selection || selection.fallbacks.length === 0) {
      const noFallbackResult: ExecutionResult = {
        success: false,
        error: {
          stage: "FALLBACK" as any,
          message: "No fallback providers available",
          code: "NO_FALLBACK_AVAILABLE",
          retryable: false,
          timestamp: new Date().toISOString(),
        },
        providerUsed: originalProvider,
        durationMs: 0,
        retryCount: 0,
        fallbackCount: 0,
      };
      return noFallbackResult;
    }

    const fallbackCandidates = selection.fallbacks.slice(0, maxFallbacks).concat(
      selection.fallbacks.length <= maxFallbacks ? [] : [originalProvider],
    );

    for (const [index, fallbackProvider] of fallbackCandidates.entries()) {
      context.currentProvider = fallbackProvider;

      failoverChain.push({
        fromProvider: index === 0 ? originalProvider : fallbackCandidates[index - 1],
        toProvider: fallbackProvider,
        reason: `Failover attempt ${index + 1}`,
        score: 100 - (index * 10),
      });

      orchestrationEventBus.publish("FallbackActivated", {
        correlationId: context.correlationId,
        fromProvider: failoverChain[failoverChain.length - 1].fromProvider,
        toProvider: fallbackProvider,
        attempt: index + 1,
      });

      const result = await executionEngine.execute(command, context);

      if (result.success) {
        orchestrationEventBus.publish("ProviderRestored", {
          correlationId: context.correlationId,
          provider: fallbackProvider,
          via: "failover",
        });

        return {
          ...result,
          fallbackCount: index + 1,
          data: {
            ...(result.data as Record<string, unknown> ?? {}),
            failoverChain,
            failoverDecisionPath: failoverChain.map((d) => ({
              from: d.fromProvider,
              to: d.toProvider,
              reason: d.reason,
            })),
          },
        };
      }

      lastResult = result.error?.message ?? "Unknown error";
    }

    return {
      success: false,
      error: {
        stage: "FALLBACK" as any,
        message: `All fallback providers failed. Last error: ${lastResult}`,
        code: "ALL_FALLBACKS_FAILED",
        retryable: false,
        timestamp: new Date().toISOString(),
      },
      providerUsed: originalProvider,
      durationMs: 0,
      retryCount: 0,
      fallbackCount: fallbackCandidates.length,
    };
  }
}

export const failoverEngine = new FailoverEngine();