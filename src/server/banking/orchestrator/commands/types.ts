import type { ExecutionContext, ExecutionResult, CommandKind } from "../types";

export interface OrchestratorCommand {
  readonly kind: CommandKind;

  validate(context: ExecutionContext): Promise<string[]>;

  execute(context: ExecutionContext): Promise<ExecutionResult>;

  getRequiredCapabilities(): string[];
}

export interface ConnectBankInput {
  institutionId: string;
  institutionName: string;
  protocol: string;
  syncFrequencyMinutes: number;
  credentials?: Record<string, unknown>;
}

export interface SyncTransactionsInput {
  connectionId: string;
  accountIds: string[];
  startDate?: string;
  endDate?: string;
}

export interface ImportStatementsInput {
  connectionId: string;
  accountId: string;
  fromDate: string;
  toDate: string;
}

export interface RotateCredentialsInput {
  connectionId: string;
}
