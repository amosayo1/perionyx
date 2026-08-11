/**
 * Program 1 — Treasury Intelligence Platform: Cash Forecast Analysis
 *
 * Measured forecast facts over the most recent recorded forecast: net
 * prediction, projected closing balance, confidence band, and surfaced risks.
 * A forecast that projects a negative minimum balance is flagged — the fact is
 * recorded, the platform never decides the response.
 */

import { getTreasuryDataSource } from "../data-source";
import { toNumber } from "./cash-position";
import type { CashForecastRecord } from "../types";

export interface ForecastFlag {
  key: "negative-balance" | "low-confidence" | "risk-named";
  label: string;
  severity: "info" | "warning" | "critical";
  detail: string;
}

export interface ForecastAnalysis {
  tenantId: string;
  currency: string;
  horizon: CashForecastRecord["horizon"];
  confidence: CashForecastRecord["confidence"];
  generatedAt: string;
  validTo: string;
  openingBalance: number;
  closingBalance: number;
  netPrediction: number;
  minimumProjectedBalance: number;
  maximumProjectedBalance: number;
  predictedInflows: CashForecastRecord["predictedInflows"];
  predictedOutflows: CashForecastRecord["predictedOutflows"];
  flags: ForecastFlag[];
}

export function analyzeForecast(forecast: CashForecastRecord | null): ForecastAnalysis | null {
  if (!forecast) return null;

  const minimumProjectedBalance = toNumber(forecast.minimumProjectedBalance);
  const flags: ForecastFlag[] = [];

  if (minimumProjectedBalance < 0) {
    flags.push({
      key: "negative-balance",
      label: "Projected minimum balance is negative",
      severity: "critical",
      detail: `The forecast projects a minimum balance of ${minimumProjectedBalance.toFixed(2)} ${forecast.currency} in the ${forecast.horizon} horizon.`,
    });
  }
  if (forecast.confidence === "low") {
    flags.push({
      key: "low-confidence",
      label: "Forecast confidence is low",
      severity: "warning",
      detail: "The recorded confidence band is low — treat the projection as directional.",
    });
  }
  if (forecast.keyRisks.length > 0) {
    flags.push({
      key: "risk-named",
      label: "Named forecast risks",
      severity: "info",
      detail: forecast.keyRisks.join("; "),
    });
  }

  return {
    tenantId: forecast.tenantId,
    currency: forecast.currency,
    horizon: forecast.horizon,
    confidence: forecast.confidence,
    generatedAt: forecast.generatedAt,
    validTo: forecast.validTo,
    openingBalance: toNumber(forecast.openingBalance),
    closingBalance: toNumber(forecast.closingBalance),
    netPrediction: toNumber(forecast.netPrediction),
    minimumProjectedBalance,
    maximumProjectedBalance: toNumber(forecast.maximumProjectedBalance),
    predictedInflows: forecast.predictedInflows,
    predictedOutflows: forecast.predictedOutflows,
    flags,
  };
}

export async function analyzeForecastForTenant(tenantId: string): Promise<ForecastAnalysis | null> {
  const forecasts = await getTreasuryDataSource().getForecasts(tenantId);
  if (forecasts.length === 0) return null;
  const latest = forecasts.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
  return analyzeForecast(latest);
}
