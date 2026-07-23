import type { CashPool, CashPoolMember, TreasuryAccount } from "../domain/types";
import { PoolType, AccountStatus } from "../domain/types";

export interface PoolConfig {
  name: string;
  poolType: PoolType;
  currency: string;
  region: string;
  targetUtilization: number;
  interestRate?: number;
}

export class PoolManager {
  private pools = new Map<string, CashPool>();

  createPool(config: PoolConfig, companyId: string): CashPool {
    const pool: CashPool = {
      id: `pool-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      companyId,
      name: config.name,
      poolType: config.poolType,
      currency: config.currency,
      region: config.region,
      memberAccounts: [],
      totalBalance: 0,
      availableBalance: 0,
      targetUtilization: config.targetUtilization,
      currentUtilization: 0,
      interestRate: config.interestRate ?? null,
      notionalValue: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.pools.set(pool.id, pool);
    return pool;
  }

  addMember(
    poolId: string,
    account: TreasuryAccount,
    balance: number,
    contributionRatio: number,
    isLead: boolean,
  ): CashPool | null {
    const pool = this.pools.get(poolId);
    if (!pool) return null;

    const member: CashPoolMember = {
      accountId: account.bankAccountId,
      institutionName: account.institutionName,
      balance,
      targetBalance: balance * contributionRatio,
      contributionRatio,
      isLeadAccount: isLead,
    };

    pool.memberAccounts.push(member);
    pool.totalBalance = pool.memberAccounts.reduce((s, m) => s + m.balance, 0);
    pool.availableBalance = pool.totalBalance;
    pool.updatedAt = new Date().toISOString();

    if (pool.poolType === PoolType.NOTIONAL) {
      pool.notionalValue = pool.totalBalance;
    }

    return pool;
  }

  removeMember(poolId: string, accountId: string): CashPool | null {
    const pool = this.pools.get(poolId);
    if (!pool) return null;

    pool.memberAccounts = pool.memberAccounts.filter((m) => m.accountId !== accountId);
    pool.totalBalance = pool.memberAccounts.reduce((s, m) => s + m.balance, 0);
    pool.updatedAt = new Date().toISOString();

    return pool;
  }

  getPool(poolId: string): CashPool | null {
    return this.pools.get(poolId) ?? null;
  }

  getPoolsByCompany(companyId: string): CashPool[] {
    return Array.from(this.pools.values()).filter((p) => p.companyId === companyId);
  }

  getPoolsByType(poolType: PoolType): CashPool[] {
    return Array.from(this.pools.values()).filter((p) => p.poolType === poolType);
  }

  getPoolsByCurrency(currency: string): CashPool[] {
    return Array.from(this.pools.values()).filter((p) => p.currency === currency);
  }

  getTotalPooledBalance(companyId: string): number {
    return this.getPoolsByCompany(companyId).reduce((s, p) => s + p.totalBalance, 0);
  }

  recalculatePool(poolId: string): CashPool | null {
    const pool = this.pools.get(poolId);
    if (!pool) return null;

    pool.totalBalance = pool.memberAccounts.reduce((s, m) => s + m.balance, 0);
    pool.currentUtilization = pool.targetUtilization > 0
      ? pool.totalBalance / pool.targetUtilization
      : 0;
    pool.updatedAt = new Date().toISOString();

    return pool;
  }

  deletePool(poolId: string): boolean {
    return this.pools.delete(poolId);
  }

  getAllPools(): CashPool[] {
    return Array.from(this.pools.values());
  }

  clear(): void {
    this.pools.clear();
  }
}

export const poolManager = new PoolManager();
