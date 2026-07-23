import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand, ImportStatementsInput } from "./types";

export class ImportStatementsCommand implements OrchestratorCommand {
  readonly kind = "ImportStatements" as const;

  async validate(context: ExecutionContext): Promise<string[]> {
    const errors: string[] = [];
    const input = context.metadata?.input as ImportStatementsInput | undefined;
    if (!input?.accountId) errors.push("accountId is required");
    if (!input?.fromDate) errors.push("fromDate is required");
    if (!input?.toDate) errors.push("toDate is required");
    return errors;
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    return {
      success: true,
      data: {
        accountId: (context.metadata?.input as ImportStatementsInput)?.accountId,
        period: {
          fromDate: (context.metadata?.input as ImportStatementsInput)?.fromDate,
          toDate: (context.metadata?.input as ImportStatementsInput)?.toDate,
        },
        providerKind: context.currentProvider,
        status: "statements_imported",
      },
      providerUsed: context.currentProvider!,
      durationMs: Date.now() - startTime,
      retryCount: 0,
      fallbackCount: 0,
    };
  }

  getRequiredCapabilities(): string[] {
    return ["STATEMENTS"];
  }
}
