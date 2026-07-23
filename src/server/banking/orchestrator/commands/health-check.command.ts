import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand } from "./types";

export class HealthCheckCommand implements OrchestratorCommand {
  readonly kind = "HealthCheck" as const;

  async validate(_context: ExecutionContext): Promise<string[]> {
    return [];
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    return {
      success: true,
      data: { providerKind: context.currentProvider, status: "healthy", checkedAt: new Date().toISOString() },
      providerUsed: context.currentProvider!,
      durationMs: Date.now() - startTime,
      retryCount: 0,
      fallbackCount: 0,
    };
  }

  getRequiredCapabilities(): string[] {
    return [];
  }
}
