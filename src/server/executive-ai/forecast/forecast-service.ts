import type { AIForecast, ForecastHorizon } from "../types";

export class ForecastService {
  private forecasts = new Map<string, AIForecast>();

  add(forecast: AIForecast): AIForecast {
    this.forecasts.set(forecast.id, { ...forecast, updatedAt: new Date() });
    return forecast;
  }

  get(id: string): AIForecast | undefined {
    return this.forecasts.get(id);
  }

  getAll(): AIForecast[] {
    return Array.from(this.forecasts.values());
  }

  update(id: string, updates: Partial<AIForecast>): AIForecast | undefined {
    const existing = this.forecasts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.forecasts.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.forecasts.delete(id);
  }

  getByDomain(domain: string): AIForecast[] {
    return this.getAll().filter(f => f.domain === domain);
  }

  getByHorizon(horizon: ForecastHorizon): AIForecast[] {
    return this.getAll().filter(f => f.horizon === horizon);
  }

  getLatest(): AIForecast[] {
    const grouped = new Map<string, AIForecast>();
    for (const f of this.getAll()) {
      const key = `${f.domain}:${f.metric}`;
      const existing = grouped.get(key);
      if (!existing || f.createdAt > existing.createdAt) {
        grouped.set(key, f);
      }
    }
    return Array.from(grouped.values());
  }

  getTrend(trend: "increasing" | "decreasing" | "stable"): AIForecast[] {
    return this.getAll().filter(f => f.trend === trend);
  }

  count(): number {
    return this.forecasts.size;
  }
}
