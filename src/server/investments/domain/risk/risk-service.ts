import type { RiskMetrics, Holding, Security } from "../../types";

export class RiskService {
  private metrics: Map<string, RiskMetrics> = new Map();

  record(metrics: RiskMetrics): void {
    this.metrics.set(metrics.id, metrics);
  }

  getLatest(portfolioId: string): RiskMetrics | undefined {
    const entries = [...this.metrics.values()]
      .filter((m) => m.portfolioId === portfolioId)
      .sort((a, b) => b.asOf.getTime() - a.asOf.getTime());
    return entries[0];
  }

  getHistory(portfolioId: string): RiskMetrics[] {
    return [...this.metrics.values()]
      .filter((m) => m.portfolioId === portfolioId)
      .sort((a, b) => a.asOf.getTime() - b.asOf.getTime());
  }

  calculateConcentrationRisk(holdings: Holding[], securities: Map<string, Security>): ConcentrationAnalysis {
    const issuerExposure = new Map<string, number>();
    const sectorExposure = new Map<string, number>();
    const countryExposure = new Map<string, number>();
    const currencyExposure = new Map<string, number>();
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    for (const h of holdings) {
      const sec = securities.get(h.securityId);
      if (!sec) continue;

      issuerExposure.set(sec.issuer, (issuerExposure.get(sec.issuer) ?? 0) + h.marketValue);
      sectorExposure.set(sec.sector, (sectorExposure.get(sec.sector) ?? 0) + h.marketValue);
      countryExposure.set(sec.country, (countryExposure.get(sec.country) ?? 0) + h.marketValue);
      currencyExposure.set(h.currency, (currencyExposure.get(h.currency) ?? 0) + h.marketValue);
    }

    const toPercent = (value: number) => totalValue > 0 ? (value / totalValue) * 100 : 0;

    return {
      topIssuer: Math.max(0, ...issuerExposure.values()),
      topIssuerName: [...issuerExposure.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "",
      issuerConcentration: toPercent(Math.max(0, ...issuerExposure.values())),
      sectorConcentration: toPercent(Math.max(0, ...sectorExposure.values())),
      countryConcentration: toPercent(Math.max(0, ...countryExposure.values())),
      currencyConcentration: toPercent(Math.max(0, ...currencyExposure.values())),
      herfindahlIndex: [...issuerExposure.values()].reduce((sum, v) => sum + Math.pow(v / totalValue, 2), 0),
      diversificationScore: issuerExposure.size > 0 ? Math.min(100, issuerExposure.size * 10) : 0,
    };
  }
}

export interface ConcentrationAnalysis {
  topIssuer: number;
  topIssuerName: string;
  issuerConcentration: number;
  sectorConcentration: number;
  countryConcentration: number;
  currencyConcentration: number;
  herfindahlIndex: number;
  diversificationScore: number;
}
