import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand } from "./types";
import { capabilityMatrix } from "../../providers/capabilities/matrix";

export class FetchCapabilitiesCommand implements OrchestratorCommand {
  readonly kind = "FetchCapabilities" as const;

  async validate(_context: ExecutionContext): Promise<string[]> {
    return [];
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    const capabilities = context.currentProvider
      ? capabilityMatrix.getProviderCapabilities(context.currentProvider)
      : [];

    return {
      success: true,
      data: { providerKind: context.currentProvider, capabilities },
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
