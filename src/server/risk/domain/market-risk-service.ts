import type {
  MarketRiskData,
  FXRiskData,
  InterestRateRiskData,
} from "../types";

export class MarketRiskService {
  private marketData = new Map<string, MarketRiskData>();
  private fxData = new Map<string, FXRiskData>();
  private interestData = new Map<string, InterestRateRiskData>();

  addMarketRiskData(data: MarketRiskData): void {
    this.marketData.set(data.riskId, data);
  }

  getMarketRiskData(riskId: string): MarketRiskData | undefined {
    return this.marketData.get(riskId);
  }

  getAllMarketRiskData(): MarketRiskData[] {
    return [...this.marketData.values()];
  }

  addFXRiskData(data: FXRiskData): void {
    this.fxData.set(data.riskId, data);
  }

  getFXRiskData(riskId: string): FXRiskData | undefined {
    return this.fxData.get(riskId);
  }

  getAllFXRiskData(): FXRiskData[] {
    return [...this.fxData.values()];
  }

  addInterestRateData(data: InterestRateRiskData): void {
    this.interestData.set(data.riskId, data);
  }

  getInterestRateData(riskId: string): InterestRateRiskData | undefined {
    return this.interestData.get(riskId);
  }

  getAllInterestRateData(): InterestRateRiskData[] {
    return [...this.interestData.values()];
  }

  getTotalPortfolioExposure(): number {
    return [...this.marketData.values()].reduce(
      (sum, d) => sum + d.portfolioExposure,
      0,
    );
  }

  getTotalFxExposure(): number {
    return [...this.fxData.values()].reduce((sum, d) => sum + d.netExposure, 0);
  }

  getTotalInterestExposure(): number {
    return [...this.interestData.values()].reduce(
      (sum, d) => sum + d.yieldCurveExposure,
      0,
    );
  }
}
