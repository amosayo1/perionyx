import type {
  CashPosition,
  TreasuryAccount,
  TreasurySnapshot,
  CurrencyPosition,
} from "../domain/types";
import { CashClassification, LiquidityCategory, CurrencyType, FXExposureDirection } from "../domain/types";
import { cashEngine } from "../cash";

export interface PositionQuery {
  companyId?: string;
  legalEntityId?: string;
  region?: string;
  currency?: string;
  classification?: CashClassification;
}

export class CashPositionService {
  private positions = new Map<string, CashPosition>();

  recordPosition(position: CashPosition): void {
    const key = `${position.bankAccountId}-${position.classification}-${position.currency}`;
    this.positions.set(key, position);
  }

  recordPositions(positions: CashPosition[]): void {
    for (const pos of positions) {
      this.recordPosition(pos);
    }
  }

  getPositions(query: PositionQuery): CashPosition[] {
    let result = Array.from(this.positions.values());

    if (query.companyId) result = result.filter((p) => p.companyId === query.companyId);
    if (query.legalEntityId) result = result.filter((p) => p.legalEntityId === query.legalEntityId);
    if (query.region) result = result.filter((p) => p.region === query.region);
    if (query.currency) result = result.filter((p) => p.currency === query.currency);
    if (query.classification) result = result.filter((p) => p.classification === query.classification);

    return result.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }

  getLatestPosition(accountId: string): CashPosition | null {
    const accountPositions = Array.from(this.positions.values())
      .filter((p) => p.bankAccountId === accountId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

    return accountPositions[0] ?? null;
  }

  buildSnapshot(companyId: string, legalEntityId: string, region: string, accounts: TreasuryAccount[]): TreasurySnapshot {
    const positions = this.getPositions({ companyId, legalEntityId, region });
    const summary = cashEngine.summarizePositions(positions);

    const liquidityByCategory: Record<string, number> = {};
    for (const cat of Object.values(LiquidityCategory)) liquidityByCategory[cat] = 0;
    for (const pos of positions) {
      liquidityByCategory[LiquidityCategory.IMMEDIATE] =
        (liquidityByCategory[LiquidityCategory.IMMEDIATE] ?? 0) + pos.availableBalance;
    }

    const cashByClassification: Record<string, number> = {};
    for (const cls of Object.values(CashClassification)) cashByClassification[cls] = 0;
    for (const pos of positions) {
      cashByClassification[pos.classification] =
        (cashByClassification[pos.classification] ?? 0) + pos.totalBalance;
    }

    const currencyPositions = this.buildCurrencyPositions(positions);

    return {
      id: `snapshot-${legalEntityId}-${region}-${Date.now()}`,
      companyId,
      legalEntityId,
      region,
      recordedAt: new Date().toISOString(),
      totalCash: summary.totalCash,
      availableCash: summary.availableCash,
      restrictedCash: summary.restrictedCash,
      idleCash: summary.idleCash,
      netLiquidity: summary.availableCash,
      workingCapital: null,
      positionsByCurrency: currencyPositions,
      liquidityByCategory,
      cashByClassification,
      totalExposure: 0,
      openFundingRequests: 0,
      activePools: 0,
      policyViolations: 0,
      alerts: [],
    };
  }

  private buildCurrencyPositions(positions: CashPosition[]): CurrencyPosition[] {
    const byCurrency = new Map<string, {
      totalBalance: number;
      availableBalance: number;
      restrictedBalance: number;
      classificationBreakdown: Record<string, number>;
      liquidityBreakdown: Record<string, number>;
    }>();

    for (const pos of positions) {
      const entry = byCurrency.get(pos.currency) ?? {
        totalBalance: 0,
        availableBalance: 0,
        restrictedBalance: 0,
        classificationBreakdown: {},
        liquidityBreakdown: {},
      };
      entry.totalBalance += pos.totalBalance;
      entry.availableBalance += pos.availableBalance;
      if (pos.classification === CashClassification.RESTRICTED) {
        entry.restrictedBalance += pos.totalBalance;
      }
      entry.classificationBreakdown[pos.classification] =
        (entry.classificationBreakdown[pos.classification] ?? 0) + pos.totalBalance;
      entry.liquidityBreakdown[LiquidityCategory.IMMEDIATE] =
        (entry.liquidityBreakdown[LiquidityCategory.IMMEDIATE] ?? 0) + pos.availableBalance;
      byCurrency.set(pos.currency, entry);
    }

    return Array.from(byCurrency.entries()).map(([currency, data]) => ({
      currency,
      currencyType: CurrencyType.FUNCTIONAL,
      totalBalance: data.totalBalance,
      availableBalance: data.availableBalance,
      restrictedBalance: data.restrictedBalance,
      classificationBreakdown: data.classificationBreakdown as Record<CashClassification, number>,
      liquidityBreakdown: data.liquidityBreakdown as Record<LiquidityCategory, number>,
      fxExposure: 0,
      fxExposureDirection: FXExposureDirection.FLAT,
      exchangeRateToBase: 1,
      exchangeRateTimestamp: new Date().toISOString(),
    }));
  }

  clear(): void {
    this.positions.clear();
  }

  count(): number {
    return this.positions.size;
  }
}

export const cashPositionService = new CashPositionService();
