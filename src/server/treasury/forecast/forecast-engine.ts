import type {
  CashForecast,
  ForecastLineItem,
  ForecastHorizon,
} from "../domain/types";
import { ForecastConfidence } from "../domain/types";

export interface ForecastInput {
  openingBalance: number;
  historicalInflows: { amount: number; date: string; category: string }[];
  historicalOutflows: { amount: number; date: string; category: string }[];
  knownUpcomingInflows: { category: string; description: string; amount: number; expectedDate: string; probability: number }[];
  knownUpcomingOutflows: { category: string; description: string; amount: number; expectedDate: string; probability: number }[];
  companyId: string;
  legalEntityId: string;
  currency: string;
  horizon: ForecastHorizon;
}

export class ForecastEngine {
  generate(input: ForecastInput): CashForecast {
    const now = new Date();
    const horizonEnd = this.computeHorizonEnd(now, input.horizon);

    const inflows: ForecastLineItem[] = input.knownUpcomingInflows.map((u) => ({
      category: u.category,
      description: u.description,
      predictedAmount: u.amount,
      probability: u.probability,
      expectedDate: u.expectedDate,
      isRecurring: false,
      variance: null,
    }));

    const outflows: ForecastLineItem[] = input.knownUpcomingOutflows.map((u) => ({
      category: u.category,
      description: u.description,
      predictedAmount: u.amount,
      probability: u.probability,
      expectedDate: u.expectedDate,
      isRecurring: false,
      variance: null,
    }));

    const historicalInflowAvg = this.averageAmount(input.historicalInflows);
    const historicalOutflowAvg = this.averageAmount(input.historicalOutflows);

    if (historicalInflowAvg > 0) {
      inflows.push({
        category: "HISTORICAL_AVERAGE",
        description: "Historical average inflow",
        predictedAmount: historicalInflowAvg,
        probability: 0.6,
        expectedDate: horizonEnd.toISOString(),
        isRecurring: true,
        variance: this.calculateVariance(input.historicalInflows.map((i) => i.amount), historicalInflowAvg),
      });
    }

    if (historicalOutflowAvg > 0) {
      outflows.push({
        category: "HISTORICAL_AVERAGE",
        description: "Historical average outflow",
        predictedAmount: historicalOutflowAvg,
        probability: 0.6,
        expectedDate: horizonEnd.toISOString(),
        isRecurring: true,
        variance: this.calculateVariance(input.historicalOutflows.map((i) => i.amount), historicalOutflowAvg),
      });
    }

    const totalInflows = inflows.reduce((s, i) => s + i.predictedAmount * i.probability, 0);
    const totalOutflows = outflows.reduce((s, o) => s + o.predictedAmount * o.probability, 0);
    const netPrediction = totalInflows - totalOutflows;
    const closingBalance = input.openingBalance + netPrediction;

    const allProjections = [
      input.openingBalance,
      ...inflows.map((i) => i.predictedAmount),
      ...outflows.map((o) => -o.predictedAmount),
    ];
    const minProj = Math.min(...allProjections);
    const maxProj = Math.max(...allProjections);

    return {
      id: `forecast-${input.legalEntityId}-${input.currency}-${Date.now()}`,
      companyId: input.companyId,
      legalEntityId: input.legalEntityId,
      currency: input.currency,
      horizon: input.horizon,
      confidence: this.determineConfidence(input),
      generatedAt: now.toISOString(),
      validFrom: now.toISOString(),
      validTo: horizonEnd.toISOString(),
      predictedInflows: inflows,
      predictedOutflows: outflows,
      netPrediction,
      openingBalance: input.openingBalance,
      closingBalance,
      minimumProjectedBalance: minProj,
      maximumProjectedBalance: maxProj,
      keyRisks: this.identifyRisks(input),
      keyAssumptions: this.identifyAssumptions(input),
      aiConfidenceScore: null,
    };
  }

  private computeHorizonEnd(from: Date, horizon: ForecastHorizon): Date {
    const end = new Date(from);
    switch (horizon) {
      case "DAY": end.setDate(end.getDate() + 1); break;
      case "WEEK": end.setDate(end.getDate() + 7); break;
      case "MONTH": end.setMonth(end.getMonth() + 1); break;
      case "QUARTER": end.setMonth(end.getMonth() + 3); break;
      case "YEAR": end.setFullYear(end.getFullYear() + 1); break;
    }
    return end;
  }

  private averageAmount(items: { amount: number }[]): number {
    if (items.length === 0) return 0;
    return items.reduce((s, i) => s + i.amount, 0) / items.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0 || mean === 0) return 0;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((s, d) => s + d, 0) / values.length;
    return Math.sqrt(variance) / mean;
  }

  private determineConfidence(input: ForecastInput): ForecastConfidence {
    const totalDataPoints = input.historicalInflows.length + input.historicalOutflows.length;
    const knownRatio = (input.knownUpcomingInflows.length + input.knownUpcomingOutflows.length) /
      Math.max(1, totalDataPoints);

    if (totalDataPoints > 50 && knownRatio > 0.3) return ForecastConfidence.HIGH;
    if (totalDataPoints > 10) return ForecastConfidence.MEDIUM;
    return ForecastConfidence.LOW;
  }

  private identifyRisks(input: ForecastInput): string[] {
    const risks: string[] = [];
    if (input.knownUpcomingOutflows.length === 0) {
      risks.push("No known upcoming outflows — projections may overestimate available cash");
    }
    if (input.historicalInflows.length < 5) {
      risks.push("Limited historical inflow data — forecast confidence is reduced");
    }
    return risks;
  }

  private identifyAssumptions(input: ForecastInput): string[] {
    const assumptions: string[] = [];
    assumptions.push("Historical patterns continue at historical averages");
    assumptions.push("Scheduled payments occur on expected dates");
    return assumptions;
  }
}

export const forecastEngine = new ForecastEngine();
