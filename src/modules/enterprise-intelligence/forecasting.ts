export type ForecastHorizon = "7d" | "30d" | "90d";
export type ForecastMetric = "cash-flow" | "liquidity" | "payment-volume" | "approval-workload" | "reconciliation-completion";

export interface ForecastPoint {
  date: string;
  value: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface ForecastResult {
  metric: ForecastMetric;
  horizon: ForecastHorizon;
  points: ForecastPoint[];
  confidence: number;
  generatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ForecastingModel {
  readonly label: string;
  readonly supportedMetrics: ForecastMetric[];
  readonly supportedHorizons: ForecastHorizon[];

  forecast(
    metric: ForecastMetric,
    horizon: ForecastHorizon,
    historicalData: { date: string; value: number }[],
  ): Promise<ForecastResult>;
}

export class SimpleMovingAverageModel implements ForecastingModel {
  readonly label = "Simple Moving Average";
  readonly supportedMetrics: ForecastMetric[] = ["cash-flow", "payment-volume", "approval-workload"];
  readonly supportedHorizons: ForecastHorizon[] = ["7d", "30d"];

  async forecast(
    metric: ForecastMetric,
    horizon: ForecastHorizon,
    historicalData: { date: string; value: number }[],
  ): Promise<ForecastResult> {
    if (historicalData.length < 2) {
      return {
        metric,
        horizon,
        points: [],
        confidence: 0,
        generatedAt: new Date().toISOString(),
      };
    }

    const values = historicalData.map((d) => d.value);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);

    const days = horizon === "7d" ? 7 : 30;
    const points: ForecastPoint[] = [];
    const lastDate = new Date(historicalData[historicalData.length - 1].date);

    for (let i = 1; i <= days; i++) {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i);
      points.push({
        date: date.toISOString().slice(0, 10),
        value: Math.round(mean * 100) / 100,
        lowerBound: Math.round((mean - 1.96 * stddev) * 100) / 100,
        upperBound: Math.round((mean + 1.96 * stddev) * 100) / 100,
      });
    }

    const confidence = Math.min(70, Math.round((1 - stddev / (mean || 1)) * 100));

    return {
      metric,
      horizon,
      points,
      confidence,
      generatedAt: new Date().toISOString(),
    };
  }
}
