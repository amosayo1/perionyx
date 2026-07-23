import type {
  LiquidityPosition,
  LiquidityCategory,
  LiquidityInstrument,
  CashPosition,
  CashPool,
} from "../domain/types";
import { LiquidityCategory as LC } from "../domain/types";

export interface LiquiditySummary {
  totalLiquidity: number;
  byCategory: Record<LiquidityCategory, number>;
  byCurrency: Record<string, number>;
  immediateLiquidity: number;
  shortTermLiquidity: number;
  longTermLiquidity: number;
  liquidityRatio: number;
}

export class LiquidityEngine {
  categorizeByDays(daysToLiquidate: number): LiquidityCategory {
    if (daysToLiquidate <= 0) return LC.IMMEDIATE;
    if (daysToLiquidate <= 1) return LC.SAME_DAY;
    if (daysToLiquidate <= 2) return LC.T_PLUS_1;
    if (daysToLiquidate <= 30) return LC.SHORT_TERM;
    if (daysToLiquidate <= 180) return LC.MEDIUM_TERM;
    return LC.LONG_TERM;
  }

  computeLiquidityPosition(
    positions: CashPosition[],
    instruments: LiquidityInstrument[],
    companyId: string,
    legalEntityId: string,
    region: string,
    currency: string,
  ): LiquidityPosition[] {
    const totalCash = positions.reduce((s, p) => s + p.totalBalance, 0);
    const instrumentTotal = instruments.reduce((s, i) => s + i.amount, 0);
    const combined = totalCash + instrumentTotal;

    const byCategory = new Map<LiquidityCategory, number>();
    for (const cat of Object.values(LC)) byCategory.set(cat, 0);

    for (const pos of positions) {
      const cat = LC.IMMEDIATE;
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + pos.availableBalance);
    }

    for (const inst of instruments) {
      const cat = this.categorizeByDays(inst.daysToLiquidate);
      const liquidValue = inst.amount * (1 - inst.haircut);
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + liquidValue);
    }

    const result: LiquidityPosition[] = [];
    for (const [category, amount] of byCategory) {
      const pct = combined > 0 ? (amount / combined) * 100 : 0;
      result.push({
        id: `liquidity-${legalEntityId}-${currency}-${category}`,
        companyId,
        legalEntityId,
        region,
        currency,
        category,
        amount,
        percentageOfTotal: Math.round(pct * 100) / 100,
        daysToLiquidate: this.categoryDays(category),
        instruments: instruments.filter((i) => this.categorizeByDays(i.daysToLiquidate) === category),
        lastCalculatedAt: new Date().toISOString(),
      });
    }

    return result;
  }

  computeLiquidityRatio(
    immediateLiquidity: number,
    shortTermObligations: number,
  ): number {
    if (shortTermObligations <= 0) return immediateLiquidity > 0 ? Infinity : 0;
    return immediateLiquidity / shortTermObligations;
  }

  summarizeLiquidity(positions: LiquidityPosition[]): LiquiditySummary {
    const byCategory: Record<string, number> = {};
    const byCurrency: Record<string, number> = {};

    for (const pos of positions) {
      byCategory[pos.category] = (byCategory[pos.category] ?? 0) + pos.amount;
      byCurrency[pos.currency] = (byCurrency[pos.currency] ?? 0) + pos.amount;
    }

    const totalLiquidity = positions.reduce((s, p) => s + p.amount, 0);
    const immediate = byCategory["IMMEDIATE" as LiquidityCategory] ?? 0;
    const shortTerm =
      (byCategory["IMMEDIATE" as LiquidityCategory] ?? 0) +
      (byCategory["SAME_DAY" as LiquidityCategory] ?? 0) +
      (byCategory["T_PLUS_1" as LiquidityCategory] ?? 0) +
      (byCategory["SHORT_TERM" as LiquidityCategory] ?? 0);
    const longTerm = totalLiquidity - shortTerm;
    const obligations = 0;

    return {
      totalLiquidity,
      byCategory,
      byCurrency,
      immediateLiquidity: immediate,
      shortTermLiquidity: shortTerm,
      longTermLiquidity: longTerm,
      liquidityRatio: this.computeLiquidityRatio(immediate, obligations),
    };
  }

  computePoolUtilization(pool: CashPool): number {
    const total = pool.memberAccounts.reduce((s, m) => s + m.balance, 0);
    return pool.targetUtilization > 0 ? total / pool.targetUtilization : 0;
  }

  detectPoolImbalance(pool: CashPool, thresholdPercent = 20): string[] {
    const issues: string[] = [];
    for (const member of pool.memberAccounts) {
      const variance = member.balance - member.targetBalance;
      const variancePct = member.targetBalance > 0 ? Math.abs(variance / member.targetBalance) * 100 : 0;
      if (variancePct > thresholdPercent) {
        issues.push(
          `${member.institutionName} balance ${member.balance} deviates ${variancePct.toFixed(0)}% from target ${member.targetBalance}`,
        );
      }
    }
    return issues;
  }

  private categoryDays(category: LiquidityCategory): number {
    const map: Record<LiquidityCategory, number> = {
      IMMEDIATE: 0,
      SAME_DAY: 1,
      T_PLUS_1: 2,
      SHORT_TERM: 30,
      MEDIUM_TERM: 180,
      LONG_TERM: 365,
    };
    return map[category] ?? 0;
  }
}

export const liquidityEngine = new LiquidityEngine();
