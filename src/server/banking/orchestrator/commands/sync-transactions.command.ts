import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand, SyncTransactionsInput } from "./types";

export class SyncTransactionsCommand implements OrchestratorCommand {
  readonly kind = "SyncTransactions" as const;

  async validate(context: ExecutionContext): Promise<string[]> {
    const errors: string[] = [];
    if (!context.connectionId) errors.push("connectionId is required");
    const input = context.metadata?.input as SyncTransactionsInput | undefined;
    if (!input?.accountIds || input.accountIds.length === 0) errors.push("accountIds is required");
    return errors;
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    return {
      success: true,
      data: {
        connectionId: context.connectionId,
        accountIds: (context.metadata?.input as SyncTransactionsInput)?.accountIds,
        providerKind: context.currentProvider,
        status: "transactions_synced",
        period: {
          startDate: (context.metadata?.input as SyncTransactionsInput)?.startDate,
          endDate: (context.metadata?.input as SyncTransactionsInput)?.endDate,
        },
      },
      providerUsed: context.currentProvider!,
      durationMs: Date.now() - startTime,
      retryCount: 0,
      fallbackCount: 0,
    };
  }

  getRequiredCapabilities(): string[] {
    return ["TRANSACTIONS", "HISTORICAL_SYNC"];
  }
}
