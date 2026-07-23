import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand } from "../commands/types";

export interface ExecutionHook {
  beforeExecute?(context: ExecutionContext): Promise<void>;
  afterExecute?(context: ExecutionContext, result: ExecutionResult): Promise<void>;
  onError?(context: ExecutionContext, error: Error): Promise<void>;
}

export class ExecutionEngine {
  private hooks: ExecutionHook[] = [];

  registerHook(hook: ExecutionHook): void {
    this.hooks.push(hook);
  }

  removeHook(hook: ExecutionHook): void {
    this.hooks = this.hooks.filter((h) => h !== hook);
  }

  clearHooks(): void {
    this.hooks = [];
  }

  async execute(command: OrchestratorCommand, context: ExecutionContext): Promise<ExecutionResult> {
    for (const hook of this.hooks) {
      await hook.beforeExecute?.(context);
    }

    try {
      const result = await command.execute(context);

      for (const hook of this.hooks) {
        await hook.afterExecute?.(context, result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      for (const hook of this.hooks) {
        await hook.onError?.(context, error);
      }

      return {
        success: false,
        error: {
          stage: "EXECUTION" as any,
          message: error.message,
          code: "EXECUTION_ERROR",
          retryable: true,
          timestamp: new Date().toISOString(),
        },
        providerUsed: context.currentProvider!,
        durationMs: 0,
        retryCount: 0,
        fallbackCount: 0,
      };
    }
  }
}

export const executionEngine = new ExecutionEngine();
