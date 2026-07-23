import type { BankConnection, BankAccount, BankTransaction } from "../../domain/types";
import type { SyncStatistics, SyncError } from "../types";

export interface ReconciliationDiff {
  transactionId: string;
  externalId: string;
  field: string;
  expectedValue: unknown;
  actualValue: unknown;
}

export interface ReconciliationConfig {
  enableBalanceVerification: boolean;
  enableTransactionMatching: boolean;
  enableDuplicateDetection: boolean;
  enableModificationDetection: boolean;
  enableDeletionDetection: boolean;
  balanceTolerancePercent: number;
}

const DEFAULT_CONFIG: ReconciliationConfig = {
  enableBalanceVerification: true,
  enableTransactionMatching: true,
  enableDuplicateDetection: true,
  enableModificationDetection: true,
  enableDeletionDetection: true,
  balanceTolerancePercent: 1,
};

export interface ReconciliationOutcome {
  reconciliationId: string;
  connectionId: string;
  accountId: string;
  providerExpectedBalance: number;
  computedBalance: number;
  balanceMatches: boolean;
  balanceDelta: number;
  missingTransactions: string[];
  duplicateTransactions: string[];
  modifiedTransactions: ReconciliationDiff[];
  deletedTransactions: string[];
  providerInconsistencies: string[];
  totalChecked: number;
  issuesFound: number;
  completedAt: string;
}

export class ReconciliationEngine {
  private config: ReconciliationConfig;
  private outcomes = new Map<string, ReconciliationOutcome>();

  constructor(config?: Partial<ReconciliationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async reconcile(
    connection: BankConnection,
    account: BankAccount,
    providerTransactions: BankTransaction[],
    localTransactions: BankTransaction[],
    providerBalance: number,
  ): Promise<ReconciliationOutcome> {
    const reconciliationId = `recon-${connection.id}-${account.id}-${Date.now()}`;
    const missingTransactions: string[] = [];
    const duplicateTransactions: string[] = [];
    const modifiedTransactions: ReconciliationDiff[] = [];
    const deletedTransactions: string[] = [];
    const providerInconsistencies: string[] = [];

    const providerMap = new Map<string, BankTransaction>();
    for (const tx of providerTransactions) {
      providerMap.set(tx.externalId, tx);
    }

    const localMap = new Map<string, BankTransaction>();
    for (const tx of localTransactions) {
      localMap.set(tx.externalId, tx);
      if (providerMap.has(tx.externalId)) {
        if (this.config.enableDuplicateDetection) {
          duplicateTransactions.push(tx.externalId);
        }
        if (this.config.enableModificationDetection) {
          const providerTx = providerMap.get(tx.externalId)!;
          const diffs = this.detectModifications(tx, providerTx);
          modifiedTransactions.push(...diffs);
        }
      }
    }

    if (this.config.enableDeletionDetection) {
      for (const [extId] of providerMap) {
        if (!localMap.has(extId)) {
          deletedTransactions.push(extId);
        }
      }
    }

    if (this.config.enableTransactionMatching) {
      for (const [extId] of providerMap) {
        if (!localMap.has(extId)) {
          missingTransactions.push(extId);
        }
      }
    }

    const localBalance = localTransactions.reduce(
      (sum, tx) => sum + (tx.direction === "INFLOW" ? tx.amount : -tx.amount),
      0,
    );

    const tolerance = Math.abs(providerBalance) * (this.config.balanceTolerancePercent / 100);
    const balanceDelta = Math.abs(providerBalance - localBalance);
    const balanceMatches = balanceDelta <= tolerance;

    if (!balanceMatches && this.config.enableBalanceVerification) {
      providerInconsistencies.push(
        `Balance mismatch: provider=${providerBalance}, computed=${localBalance}, delta=${balanceDelta}`,
      );
    }

    const totalChecked = providerTransactions.length + localTransactions.length;
    const issuesFound =
      missingTransactions.length +
      duplicateTransactions.length +
      modifiedTransactions.length +
      deletedTransactions.length +
      providerInconsistencies.length;

    const outcome: ReconciliationOutcome = {
      reconciliationId,
      connectionId: connection.id,
      accountId: account.id,
      providerExpectedBalance: providerBalance,
      computedBalance: localBalance,
      balanceMatches,
      balanceDelta,
      missingTransactions,
      duplicateTransactions,
      modifiedTransactions,
      deletedTransactions,
      providerInconsistencies,
      totalChecked,
      issuesFound,
      completedAt: new Date().toISOString(),
    };

    this.outcomes.set(reconciliationId, outcome);
    return outcome;
  }

  async batchReconcile(
    connection: BankConnection,
    accounts: BankAccount[],
    providerTransactionsMap: Map<string, BankTransaction[]>,
    localTransactionsMap: Map<string, BankTransaction[]>,
    providerBalancesMap: Map<string, number>,
  ): Promise<{
    results: ReconciliationOutcome[];
    totalIssues: number;
  }> {
    const results: ReconciliationOutcome[] = [];
    let totalIssues = 0;

    for (const account of accounts) {
      const providerTxns = providerTransactionsMap.get(account.id) ?? [];
      const localTxns = localTransactionsMap.get(account.id) ?? [];
      const providerBalance = providerBalancesMap.get(account.id) ?? 0;

      const outcome = await this.reconcile(
        connection,
        account,
        providerTxns,
        localTxns,
        providerBalance,
      );

      results.push(outcome);
      totalIssues += outcome.issuesFound;
    }

    return { results, totalIssues };
  }

  getOutcome(reconciliationId: string): ReconciliationOutcome | null {
    return this.outcomes.get(reconciliationId) ?? null;
  }

  getOutcomesByAccount(connectionId: string, accountId: string): ReconciliationOutcome[] {
    return Array.from(this.outcomes.values()).filter(
      (o) => o.connectionId === connectionId && o.accountId === accountId,
    );
  }

  getLatestOutcome(connectionId: string, accountId: string): ReconciliationOutcome | null {
    const outcomes = this.getOutcomesByAccount(connectionId, accountId);
    if (outcomes.length === 0) return null;
    outcomes.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
    return outcomes[0];
  }

  clearOutcomes(connectionId: string): void {
    for (const [id, outcome] of this.outcomes) {
      if (outcome.connectionId === connectionId) {
        this.outcomes.delete(id);
      }
    }
  }

  private detectModifications<T extends BankTransaction>(local: T, provider: T): ReconciliationDiff[] {
    const diffs: ReconciliationDiff[] = [];
    const fieldsToCheck: (keyof BankTransaction)[] = [
      "amount", "currency", "description", "transactionType",
      "direction", "status", "transactionDate", "postDate",
    ];

    for (const field of fieldsToCheck) {
      const localVal = local[field];
      const providerVal = provider[field];
      if (JSON.stringify(localVal) !== JSON.stringify(providerVal)) {
        diffs.push({
          transactionId: local.id,
          externalId: local.externalId,
          field: field as string,
          expectedValue: providerVal,
          actualValue: localVal,
        });
      }
    }

    return diffs;
  }
}

export const reconciliationEngine = new ReconciliationEngine();