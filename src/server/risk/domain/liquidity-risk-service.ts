import type { LiquidityRiskData } from "../types";

export class LiquidityRiskService {
  private liquidityData = new Map<string, LiquidityRiskData>();

  addLiquidityData(data: LiquidityRiskData): void {
    this.liquidityData.set(data.riskId, data);
  }

  getLiquidityData(riskId: string): LiquidityRiskData | undefined {
    return this.liquidityData.get(riskId);
  }

  getAllLiquidityData(): LiquidityRiskData[] {
    return [...this.liquidityData.values()];
  }

  getAverageLiquidityCoverageRatio(): number {
    const items = this.getAllLiquidityData();
    if (items.length === 0) return 0;
    return (
      items.reduce((sum, d) => sum + d.liquidityCoverageRatio, 0) / items.length
    );
  }

  getTotalFundingGap(): number {
    return [...this.liquidityData.values()].reduce(
      (sum, d) => sum + d.fundingGap,
      0,
    );
  }

  getTotalLiquidityBuffer(): number {
    return [...this.liquidityData.values()].reduce(
      (sum, d) => sum + d.liquidityBuffer,
      0,
    );
  }

  getTotalEmergencyLiquidity(): number {
    return [...this.liquidityData.values()].reduce(
      (sum, d) => sum + d.emergencyLiquidity,
      0,
    );
  }
}
