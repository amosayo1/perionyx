import type { BankConnection, BankAccount, BankTransaction, LegalEntity, AccountGroup, TreasuryRelationship, AccountBalanceSnapshot } from "../domain/types";
import type { IBankProvider } from "../providers/interface";

export interface TreasuryConsolidationView {
  companyId: string;
  timestamp: string;
  totalBalanceByCurrency: Record<string, string>;
  totalAvailableByCurrency: Record<string, string>;
  accountsByEntity: EntityBalanceBreakdown[];
  accountsByBank: BankBalanceBreakdown[];
  summary: {
    totalAccounts: number;
    linkedAccounts: number;
    unlinkedAccounts: number;
    totalBalanceUsd: string;
    currencyCount: number;
  };
}

export interface EntityBalanceBreakdown {
  legalEntityId: string;
  legalEntityName: string;
  balanceByCurrency: Record<string, string>;
  accountCount: number;
}

export interface BankBalanceBreakdown {
  institutionName: string;
  balanceByCurrency: Record<string, string>;
  accountCount: number;
  lastSyncAt: string | null;
}

export interface CashPoolConfig {
  id: string;
  companyId: string;
  name: string;
  poolType: "physical" | "notional" | "zero_balance" | "target";
  sourceAccountIds: string[];
  targetAccountId: string;
  sweepRule: "end_of_day" | "threshold" | "manual";
  thresholdAmount?: number;
  minimumTargetAmount?: number;
  currency: string;
  isActive: boolean;
}

export interface CashPoolSweepResult {
  poolId: string;
  totalSwept: number;
  currency: string;
  sourceAccounts: Array<{ accountId: string; sweptAmount: number }>;
  targetAccountId: string;
  executedAt: string;
}

export class TreasuryBankingService {
  private pools: Map<string, CashPoolConfig> = new Map();

  computeConsolidationView(
    accounts: BankAccount[],
    entities: LegalEntity[],
    connections: BankConnection[],
  ): TreasuryConsolidationView {
    const balanceByCurrency = new Map<string, number>();
    const availableByCurrency = new Map<string, number>();
    const entityMap = new Map(entities.map((e) => [e.id, e]));
    const connMap = new Map(connections.map((c) => [c.id, c]));

    const entityBalances = new Map<string, Map<string, number>>();
    const bankBalances = new Map<string, Map<string, { balance: number; count: number; lastSync: string | null }>>();

    for (const account of accounts) {
      const currency = account.currency;
      const current = parseFloat(account.balance.current);
      const available = account.balance.available ? parseFloat(account.balance.available) : current;

      balanceByCurrency.set(currency, (balanceByCurrency.get(currency) ?? 0) + current);
      availableByCurrency.set(currency, (availableByCurrency.get(currency) ?? 0) + available);

      if (account.legalEntityId) {
        if (!entityBalances.has(account.legalEntityId)) {
          entityBalances.set(account.legalEntityId, new Map());
        }
        const eMap = entityBalances.get(account.legalEntityId)!;
        eMap.set(currency, (eMap.get(currency) ?? 0) + current);
      }

      const connection = connMap.get(account.connectionId);
      const institutionName = connection?.institutionName ?? "Unknown";
      if (!bankBalances.has(institutionName)) {
        bankBalances.set(institutionName, new Map());
      }
      const bMap = bankBalances.get(institutionName)!;
      const existing = bMap.get(currency) ?? { balance: 0, count: 0, lastSync: null };
      bMap.set(currency, {
        balance: existing.balance + current,
        count: existing.count + 1,
        lastSync: connection?.lastSyncAt ?? existing.lastSync,
      });
    }

const totalBalanceUsd = this.estimateUsd(
    Object.fromEntries(balanceByCurrency),
  );

    return {
      companyId: "",
      timestamp: new Date().toISOString(),
      totalBalanceByCurrency: Object.fromEntries(
        Array.from(balanceByCurrency.entries()).map(([k, v]) => [k, v.toFixed(2)]),
      ),
      totalAvailableByCurrency: Object.fromEntries(
        Array.from(availableByCurrency.entries()).map(([k, v]) => [k, v.toFixed(2)]),
      ),
      accountsByEntity: Array.from(entityBalances.entries()).map(([entityId, balances]) => ({
        legalEntityId: entityId,
        legalEntityName: entityMap.get(entityId)?.name ?? "Unknown",
        balanceByCurrency: Object.fromEntries(
          Array.from(balances.entries()).map(([k, v]) => [k, v.toFixed(2)]),
        ),
        accountCount: accounts.filter((a) => a.legalEntityId === entityId).length,
      })),
      accountsByBank: Array.from(bankBalances.entries()).map(([name, currencies]) => {
        const entries = Array.from(currencies.entries());
        const firstEntry = entries[0]?.[1];
        return {
          institutionName: name,
          balanceByCurrency: Object.fromEntries(
            entries.map(([c, d]) => [c, d.balance.toFixed(2)]),
          ),
          accountCount: firstEntry?.count ?? 0,
          lastSyncAt: firstEntry?.lastSync ?? null,
        };
      }),
      summary: {
        totalAccounts: accounts.length,
        linkedAccounts: accounts.filter((a) => a.isLinkedToTreasury).length,
        unlinkedAccounts: accounts.filter((a) => !a.isLinkedToTreasury).length,
        totalBalanceUsd: totalBalanceUsd.toFixed(2),
        currencyCount: balanceByCurrency.size,
      },
    };
  }

  createCashPool(config: CashPoolConfig): CashPoolConfig {
    this.pools.set(config.id, config);
    return config;
  }

  getCashPool(poolId: string): CashPoolConfig | undefined {
    return this.pools.get(poolId);
  }

  listCashPools(companyId: string): CashPoolConfig[] {
    return Array.from(this.pools.values()).filter((p) => p.companyId === companyId);
  }

  updateCashPool(poolId: string, updates: Partial<CashPoolConfig>): CashPoolConfig | null {
    const pool = this.pools.get(poolId);
    if (!pool) return null;
    Object.assign(pool, updates);
    this.pools.set(poolId, pool);
    return pool;
  }

  deleteCashPool(poolId: string): boolean {
    return this.pools.delete(poolId);
  }

  private estimateUsd(currencyBalances: Record<string, number>): number {
    return Object.entries(currencyBalances).reduce(
      (sum, [currency, amount]) => sum + this.convertToUsd(currency, amount),
      0,
    );
  }

  private convertToUsd(currency: string, amount: number): number {
    const rates: Record<string, number> = {
      USD: 1, EUR: 1.08, GBP: 1.27, JPY: 0.0067, CAD: 0.74,
      CHF: 1.12, AUD: 0.66, AED: 0.27, SAR: 0.27,
    };
    return amount * (rates[currency] ?? 1);
  }

  }

export const treasuryBankingService = new TreasuryBankingService();