import type { IBankProvider } from "../providers/interface";
import type { SyncOptions } from "../providers/interface";
import type { BankConnection, BankAccount, BankTransaction, SyncJob, SyncStatus, SyncMode } from "../domain/types";
import { SyncOrchestrator } from "./sync-orchestrator";

export interface SyncExecutionPlan {
  connectionId: string;
  companyId: string;
  mode: SyncMode;
  accounts: BankAccount[];
  startDate?: string;
  endDate?: string;
  priority: number;
}

export interface SyncExecutionResult {
  connectionId: string;
  mode: SyncMode;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  totalAccounts: number;
  successfulAccounts: number;
  failedAccounts: number;
  totalCreated: number;
  totalUpdated: number;
  totalFailed: number;
  hasMore: boolean;
  cursor?: string;
  errors: string[];
}

export class BankingSyncEngine {
  private orchestrator: SyncOrchestrator;

  constructor() {
    this.orchestrator = new SyncOrchestrator();
  }

  async executeSync(
    provider: IBankProvider,
    connection: BankConnection,
    plan: SyncExecutionPlan,
    signal?: AbortSignal,
  ): Promise<SyncExecutionResult> {
    const startedAt = new Date().toISOString();
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    const options: SyncOptions = {
      mode: plan.mode,
      startDate: plan.startDate,
      endDate: plan.endDate,
      signal,
    };

    const result = await provider.syncTransactions(
      connection,
      plan.accounts,
      options,
      (_progress) => {},
    );

    for (const tx of result.transactions) {
      if (tx.status === "created") totalCreated++;
      else if (tx.status === "updated") totalUpdated++;
      else if (tx.status === "failed") totalFailed++;
    }
    errors.push(...result.errors);

    const completedAt = new Date().toISOString();
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

    return {
      connectionId: connection.id,
      mode: plan.mode,
      startedAt,
      completedAt,
      durationMs,
      totalAccounts: plan.accounts.length,
      successfulAccounts: plan.accounts.length - plan.accounts.filter((_, i) => errors.some((e) => e.includes(`Account ${i}`))).length,
      failedAccounts: plan.accounts.filter((_, i) => errors.some((e) => e.includes(`Account ${i}`))).length,
      totalCreated,
      totalUpdated,
      totalFailed,
      hasMore: result.hasMore,
      cursor: result.cursor,
      errors,
    };
  }
}