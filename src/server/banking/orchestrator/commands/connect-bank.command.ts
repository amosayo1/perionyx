import type { ExecutionContext, ExecutionResult } from "../types";
import type { OrchestratorCommand, ConnectBankInput } from "./types";
import { connectionManager } from "../../connections/connection-manager";

export class ConnectBankCommand implements OrchestratorCommand {
  readonly kind = "ConnectBank" as const;

  async validate(context: ExecutionContext): Promise<string[]> {
    const errors: string[] = [];
    const input = context.metadata?.input as ConnectBankInput | undefined;
    if (!input?.institutionId) errors.push("institutionId is required");
    if (!input?.institutionName) errors.push("institutionName is required");
    if (!input?.protocol) errors.push("protocol is required");
    if (!context.connectionId && !input?.institutionId) errors.push("connectionId or institutionId is required");
    return errors;
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    const record = connectionManager.buildConnectionRecord({
      providerKind: context.currentProvider!,
      companyId: context.tenantId,
      legalEntityId: context.legalEntityId,
      institutionId: (context.metadata?.input as ConnectBankInput)?.institutionId,
      institutionName: (context.metadata?.input as ConnectBankInput)?.institutionName,
      label: `Connection to ${(context.metadata?.input as ConnectBankInput)?.institutionName ?? "Bank"}`,
      protocol: (context.metadata?.input as ConnectBankInput)?.protocol as any ?? "OAUTH2",
      syncFrequencyMinutes: (context.metadata?.input as ConnectBankInput)?.syncFrequencyMinutes ?? 1440,
      metadata: context.metadata,
    });

    return {
      success: true,
      data: { connection: record, providerKind: context.currentProvider },
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
