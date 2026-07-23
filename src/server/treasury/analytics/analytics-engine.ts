import type {
  CashPosition,
  LiquidityPosition,
  TreasurySnapshot,
  CurrencyPosition,
  CashMovement,
  WorkingCapital,
} from "../domain/types";
import { CashClassification, LiquidityCategory } from "../domain/types";

export interface TreasuryMetrics {
  totalCash: number;
  availableCash: number;
  restrictedCash: number;
  idleCash: number;
  netLiquidity: number;
  immediateLiquidity: number;
  liquidityRatio: number;
  cashVelocity: number;
  fundingEfficiency: number;
  workingCapital: number;
  currentRatio: number;
  totalExposure: number;
  concentrationRisk: number;
}

export interface RegionalBreakdown {
  region: string;
  totalCash: number;
  availableCash: number;
  percentageOfTotal: number;
}

export class AnalyticsEngine {
  computeMetrics(snapshot: TreasurySnapshot): TreasuryMetrics {
    const netLiquidity = snapshot.liquidityByCategory[LiquidityCategory.IMMEDIATE] ?? 0;
    const immediateLiquidity = netLiquidity;
    const concentrationRisk = this.computeConcentrationRisk(snapshot.positionsByCurrency);

    return {
      totalCash: snapshot.totalCash,
      availableCash: snapshot.availableCash,
      restrictedCash: snapshot.restrictedCash,
      idleCash: snapshot.idleCash,
      netLiquidity,
      immediateLiquidity,
      liquidityRatio: immediateLiquidity > 0 ? immediateLiquidity / Math.max(1, snapshot.totalCash) : 0,
      cashVelocity: this.computeCashVelocity(snapshot),
      fundingEfficiency: this.computeFundingEfficiency(snapshot),
      workingCapital: snapshot.workingCapital?.netWorkingCapital ?? 0,
      currentRatio: snapshot.workingCapital?.currentRatio ?? 0,
      totalExposure: snapshot.totalExposure,
      concentrationRisk,
    };
  }

  computeRegionalBreakdown(cashPositions: CashPosition[]): RegionalBreakdown[] {
    const byRegion = new Map<string, number>();
    const total = cashPositions.reduce((s, p) => s + p.totalBalance, 0);

    for (const pos of cashPositions) {
      byRegion.set(pos.region, (byRegion.get(pos.region) ?? 0) + pos.totalBalance);
    }

    return Array.from(byRegion.entries())
      .map(([region, amount]) => ({
        region,
        totalCash: amount,
        availableCash: amount,
        percentageOfTotal: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.totalCash - a.totalCash);
  }

  computeCashVelocity(snapshot: TreasurySnapshot): number {
    const immediate = snapshot.liquidityByCategory[LiquidityCategory.IMMEDIATE] ?? 0;
    const total = snapshot.totalCash;
    return total > 0 ? immediate / total : 0;
  }

  computeFundingEfficiency(snapshot: TreasurySnapshot): number {
    const totalMovement = snapshot.openFundingRequests;
    return totalMovement > 0 ? 1 - (snapshot.policyViolations / Math.max(1, totalMovement)) : 1;
  }

  computeConcentrationRisk(positions: CurrencyPosition[]): number {
    if (positions.length === 0) return 0;
    const total = positions.reduce((s, p) => s + p.totalBalance, 0);
    if (total === 0) return 0;

    const maxPosition = Math.max(...positions.map((p) => p.totalBalance));
    return maxPosition / total;
  }

  computeForecastAccuracy(
    forecasted: number,
    actual: number,
  ): number {
    if (forecasted === 0) return actual === 0 ? 1 : 0;
    return 1 - Math.abs(forecasted - actual) / Math.abs(forecasted);
  }

  detectAnomalies(
    current: TreasuryMetrics,
    previous: TreasuryMetrics,
    thresholds: { liquidityDrop: number; cashDrop: number; exposureSpike: number },
  ): string[] {
    const anomalies: string[] = [];

    if (previous.immediateLiquidity > 0) {
      const liquidityDrop = 1 - current.immediateLiquidity / previous.immediateLiquidity;
      if (liquidityDrop > thresholds.liquidityDrop) {
        anomalies.push(`Immediate liquidity dropped ${(liquidityDrop * 100).toFixed(0)}%`);
      }
    }

    if (previous.totalCash > 0) {
      const cashDrop = 1 - current.totalCash / previous.totalCash;
      if (cashDrop > thresholds.cashDrop) {
        anomalies.push(`Total cash dropped ${(cashDrop * 100).toFixed(0)}%`);
      }
    }

    if (previous.totalExposure > 0) {
      const exposureSpike = current.totalExposure / previous.totalExposure - 1;
      if (exposureSpike > thresholds.exposureSpike) {
        anomalies.push(`FX exposure spiked ${(exposureSpike * 100).toFixed(0)}%`);
      }
    }

    return anomalies;
  }
}

export const analyticsEngine = new AnalyticsEngine();
