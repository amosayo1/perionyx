import type { CommandKind } from "../types";
import type { OrchestratorCommand } from "./types";
import { ConnectBankCommand } from "./connect-bank.command";
import { DisconnectBankCommand } from "./disconnect-bank.command";
import { SyncAccountsCommand } from "./sync-accounts.command";
import { SyncTransactionsCommand } from "./sync-transactions.command";
import { RefreshBalancesCommand } from "./refresh-balances.command";
import { ImportStatementsCommand } from "./import-statements.command";
import { VerifyConnectionCommand } from "./verify-connection.command";
import { RotateCredentialsCommand } from "./rotate-credentials.command";
import { FetchCapabilitiesCommand } from "./fetch-capabilities.command";
import { HealthCheckCommand } from "./health-check.command";

const COMMAND_REGISTRY = new Map<CommandKind, OrchestratorCommand>([
  ["ConnectBank", new ConnectBankCommand()],
  ["DisconnectBank", new DisconnectBankCommand()],
  ["SyncAccounts", new SyncAccountsCommand()],
  ["SyncTransactions", new SyncTransactionsCommand()],
  ["RefreshBalances", new RefreshBalancesCommand()],
  ["ImportStatements", new ImportStatementsCommand()],
  ["VerifyConnection", new VerifyConnectionCommand()],
  ["RotateCredentials", new RotateCredentialsCommand()],
  ["FetchCapabilities", new FetchCapabilitiesCommand()],
  ["HealthCheck", new HealthCheckCommand()],
]);

export function getCommand(kind: CommandKind): OrchestratorCommand {
  const command = COMMAND_REGISTRY.get(kind);
  if (!command) {
    throw new Error(`Unknown command kind: ${kind}`);
  }
  return command;
}

export function getRegisteredCommands(): CommandKind[] {
  return Array.from(COMMAND_REGISTRY.keys());
}

export type { OrchestratorCommand };
export type {
  ConnectBankInput,
  SyncTransactionsInput,
  ImportStatementsInput,
  RotateCredentialsInput,
} from "./types";
