import type { ExecutionContext, ExecutionResult, PipelineError } from "../types";
import type { BankProviderKind } from "../../domain/types";
import { PipelineStage } from "../types";
import type { OrchestratorCommand } from "../commands/types";
import { getCommand } from "../commands";
import { orchestratorRouter } from "../routing/router";
import { executionEngine } from "../execution/engine";
import { retryEngine } from "../retry/engine";
import { failoverEngine } from "../failover/engine";
import { orchestrationAudit } from "../audit/audit";
import { orchestrationEventBus } from "../events/events";

export interface PipelineConfig {
  maxRetries: number;
  maxFallbacks: number;
  enableCapabilityNegotiation: boolean;
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  maxRetries: 3,
  maxFallbacks: 3,
  enableCapabilityNegotiation: true,
};

export class ExecutionPipeline {
  private config: PipelineConfig;

  constructor(config: Partial<PipelineConfig> = {}) {
    this.config = { ...DEFAULT_PIPELINE_CONFIG, ...config };
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    const errors: PipelineError[] = [];
    let result: ExecutionResult | null = null;
    let currentProvider = context.currentProvider;

    orchestrationEventBus.publish("CommandStarted", {
      correlationId: context.correlationId,
      commandKind: context.commandKind,
      tenantId: context.tenantId,
    });

    try {
      const command = getCommand(context.commandKind);

      result = await this.runValidationStage(context, command, errors);
      if (!result.success) return this.finalize(context, result, startTime);

      result = await this.runCapabilityCheckStage(context, command, errors);
      if (!result.success) return this.finalize(context, result, startTime);

      result = await this.runProviderSelectionStage(context, command, currentProvider, errors);
      if (!result.success) return this.finalize(context, result, startTime);

      result = await this.runExecutionStage(context, command, errors);
      if (!result.success) {
        result = await this.runRetryStage(context, command, result, errors);
      }

      if (!result.success) {
        result = await this.runFallbackStage(context, command, result, errors);
      }

      await this.runAuditStage(context, command, result, errors);

      const finalResult = { ...result, durationMs: Date.now() - startTime };

      orchestrationEventBus.publish(
        finalResult.success ? "ExecutionCompleted" : "ExecutionFailed",
        {
          correlationId: context.correlationId,
          commandKind: context.commandKind,
          providerUsed: finalResult.providerUsed,
          durationMs: finalResult.durationMs,
          retryCount: finalResult.retryCount,
          fallbackCount: finalResult.fallbackCount,
          success: finalResult.success,
        },
      );

      return finalResult;
    } catch (err) {
      const errorResult: ExecutionResult = {
        success: false,
        error: {
          stage: PipelineStage.EXECUTION,
          message: err instanceof Error ? err.message : "Unknown pipeline error",
          code: "PIPELINE_ERROR",
          retryable: false,
          timestamp: new Date().toISOString(),
        },
        providerUsed: currentProvider!,
        durationMs: Date.now() - startTime,
        retryCount: 0,
        fallbackCount: 0,
      };

      orchestrationEventBus.publish("ExecutionFailed", {
        correlationId: context.correlationId,
        commandKind: context.commandKind,
        error: errorResult.error?.message,
      });

      return errorResult;
    }
  }

  private async runValidationStage(
    context: ExecutionContext,
    command: OrchestratorCommand,
    errors: PipelineError[],
  ): Promise<ExecutionResult> {
    const stageStart = Date.now();
    const validationErrors = await command.validate(context);

    if (validationErrors.length > 0) {
      const error: PipelineError = {
        stage: PipelineStage.VALIDATION,
        message: validationErrors.join("; "),
        code: "VALIDATION_ERROR",
        retryable: false,
        timestamp: new Date().toISOString(),
      };
      errors.push(error);
      return {
        success: false,
        error,
        providerUsed: context.currentProvider!,
        durationMs: Date.now() - stageStart,
        retryCount: 0,
        fallbackCount: 0,
      };
    }

    orchestrationEventBus.publish("CommandValidated", {
      correlationId: context.correlationId,
      commandKind: context.commandKind,
    });

    return {
      success: true,
      data: null,
      providerUsed: context.currentProvider!,
      durationMs: Date.now() - stageStart,
      retryCount: 0,
      fallbackCount: 0,
    };
  }

  private async runCapabilityCheckStage(
    context: ExecutionContext,
    command: OrchestratorCommand,
    errors: PipelineError[],
  ): Promise<ExecutionResult> {
    const required = command.getRequiredCapabilities();

    if (required.length === 0) {
      return {
        success: true,
        data: null,
        providerUsed: context.currentProvider!,
        durationMs: 0,
        retryCount: 0,
        fallbackCount: 0,
      };
    }

    if (this.config.enableCapabilityNegotiation && context.currentProvider) {
      const provider = context.currentProvider;
      const def = await import("../../providers/definitions/provider-definitions").then(
        (m) => m.getProviderDefinition(provider),
      );

      if (def) {
        const missing = required.filter((cap) => !def.capabilities.includes(cap as any));
        if (missing.length > 0) {
          orchestrationEventBus.publish("CapabilityMismatch", {
            correlationId: context.correlationId,
            provider,
            capabilities: missing,
          });

          const alternatives = await import("../../providers/definitions/provider-definitions").then(
            (m) => m.getProvidersByCapability(missing[0] as any),
          );

          if (alternatives.length > 0) {
            const altProvider = alternatives[0].kind;
            orchestrationEventBus.publish("CapabilityMatched", {
              correlationId: context.correlationId,
              fromProvider: provider,
              toProvider: altProvider,
              capability: missing[0],
            });
            context.currentProvider = altProvider;
          }
        }
      }
    }

    return {
      success: true,
      data: null,
      providerUsed: context.currentProvider!,
      durationMs: 0,
      retryCount: 0,
      fallbackCount: 0,
    };
  }

  private async runProviderSelectionStage(
    context: ExecutionContext,
    _command: OrchestratorCommand,
    currentProvider: BankProviderKind | undefined,
    _errors: PipelineError[],
  ): Promise<ExecutionResult> {
    if (currentProvider) {
      return {
        success: true,
        data: { provider: currentProvider },
        providerUsed: currentProvider,
        durationMs: 0,
        retryCount: 0,
        fallbackCount: 0,
      };
    }

    const selection = await orchestratorRouter.selectProvider(context);
    if (!selection) {
      const error: PipelineError = {
        stage: PipelineStage.PROVIDER_SELECTION,
        message: "No available provider for the requested capabilities and region",
        code: "NO_PROVIDER_AVAILABLE",
        retryable: false,
        timestamp: new Date().toISOString(),
      };
      return {
        success: false,
        error,
        providerUsed: context.currentProvider ?? "plaid",
        durationMs: 0,
        retryCount: 0,
        fallbackCount: 0,
      };
    }

    context.currentProvider = selection.provider;
    orchestrationEventBus.publish("ProviderSelected", {
      correlationId: context.correlationId,
      provider: selection.provider,
      reason: selection.reason,
    });

    return {
      success: true,
      data: { provider: selection.provider, reason: selection.reason },
      providerUsed: selection.provider,
      durationMs: 0,
      retryCount: 0,
      fallbackCount: 0,
    };
  }

  private async runExecutionStage(
    context: ExecutionContext,
    command: OrchestratorCommand,
    errors: PipelineError[],
  ): Promise<ExecutionResult> {
    const stageStart = Date.now();

    try {
      const result = await executionEngine.execute(command, context);

      if (!result.success && result.error) {
        errors.push(result.error);
        result.error.stage = PipelineStage.EXECUTION;
      }

      result.durationMs = Date.now() - stageStart;
      return result;
    } catch (err) {
      const error: PipelineError = {
        stage: PipelineStage.EXECUTION,
        message: err instanceof Error ? err.message : "Execution error",
        code: "EXECUTION_ERROR",
        retryable: true,
        timestamp: new Date().toISOString(),
      };
      errors.push(error);
      return {
        success: false,
        error,
        providerUsed: context.currentProvider!,
        durationMs: Date.now() - stageStart,
        retryCount: 0,
        fallbackCount: 0,
      };
    }
  }

  private async runRetryStage(
    context: ExecutionContext,
    command: OrchestratorCommand,
    previousResult: ExecutionResult,
    errors: PipelineError[],
  ): Promise<ExecutionResult> {
    if (!previousResult.error?.retryable) return previousResult;

    const retryResult = await retryEngine.executeWithRetry(
      context,
      command,
      this.config.maxRetries,
    );

    if (retryResult.retryCount > 0) {
      orchestrationEventBus.publish("RetrySucceeded", {
        correlationId: context.correlationId,
        retryCount: retryResult.retryCount,
        provider: context.currentProvider,
      });
    }

    return retryResult;
  }

  private async runFallbackStage(
    context: ExecutionContext,
    command: OrchestratorCommand,
    previousResult: ExecutionResult,
    errors: PipelineError[],
  ): Promise<ExecutionResult> {
    const currentProvider = context.currentProvider;

    orchestrationEventBus.publish("ProviderFailed", {
      correlationId: context.correlationId,
      provider: currentProvider,
      error: previousResult.error?.message,
    });

    const failoverResult = await failoverEngine.failover(
      context,
      command,
      this.config.maxFallbacks,
    );

    if (failoverResult.fallbackCount > 0) {
      orchestrationEventBus.publish("FallbackActivated", {
        correlationId: context.correlationId,
        fromProvider: currentProvider,
        toProvider: failoverResult.providerUsed,
      });
    }

    return failoverResult;
  }

  private async runAuditStage(
    context: ExecutionContext,
    _command: OrchestratorCommand,
    result: ExecutionResult,
    errors: PipelineError[],
  ): Promise<void> {
    orchestrationAudit.record({
      correlationId: context.correlationId,
      commandKind: context.commandKind,
      tenantId: context.tenantId,
      userId: context.userId,
      region: context.region,
      providerUsed: result.providerUsed,
      success: result.success,
      durationMs: result.durationMs,
      retryCount: result.retryCount,
      fallbackCount: result.fallbackCount,
      errors: errors.map((e) => ({ message: e.message, code: e.code, stage: e.stage })),
      timestamp: new Date().toISOString(),
    });
  }

  private finalize(
    _context: ExecutionContext,
    result: ExecutionResult,
    startTime: number,
  ): ExecutionResult {
    return { ...result, durationMs: Date.now() - startTime };
  }

  setConfig(config: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const executionPipeline = new ExecutionPipeline();
