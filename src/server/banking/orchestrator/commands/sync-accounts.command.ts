import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand } from "./types";

export class SyncAccountsCommand implements OrchestratorCommand {
  readonly kind = "SyncAccounts" as const;

  async validate(context: ExecutionContext): Promise<string[]> {
    const errors: string[] = [];
    if (!context.connectionId) errors.push("connectionId is required");
    return errors;
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    return {
      success: true,
      data: { connectionId: context.connectionId, providerKind: context.currentProvider, status: "accounts_synced" },
      providerUsed: context.currentProvider!,
      durationMs: Date.now() - startTime,
      retryCount: 0,
      fallbackCount: 0,
    };
  }

  getRequiredCapabilities(): string[] {
    return ["ACCOUNT_DISCOVERY"];
  }
}
