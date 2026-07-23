import type { FPAForecast, FPAForecastItem, ForecastType, ForecastScenario, ForecastMethod } from "../../types";

export class ForecastService {
  private forecasts = new Map<string, FPAForecast>();

  addForecast(f: FPAForecast): void {
    this.forecasts.set(f.id, f);
  }

  getForecast(id: string): FPAForecast | undefined {
    return this.forecasts.get(id);
  }

  getAllForecasts(): FPAForecast[] {
    return [...this.forecasts.values()];
  }

  getByType(type: ForecastType): FPAForecast[] {
    return this.getAllForecasts().filter((f) => f.type === type);
  }

  getByScenario(scenario: ForecastScenario): FPAForecast[] {
    return this.getAllForecasts().filter((f) => f.scenario === scenario);
  }

  getByMethod(method: ForecastMethod): FPAForecast[] {
    return this.getAllForecasts().filter((f) => f.method === method);
  }

  getByCompany(companyId: string): FPAForecast[] {
    return this.getAllForecasts().filter((f) => f.companyId === companyId);
  }

  getByPeriod(period: string): FPAForecast[] {
    return this.getAllForecasts().filter((f) => f.period === period);
  }

  addItem(item: FPAForecastItem): void {
    const forecast = this.forecasts.get(item.forecastId);
    if (forecast) {
      forecast.items.push(item);
    }
  }

  getItems(forecastId: string): FPAForecastItem[] {
    const forecast = this.forecasts.get(forecastId);
    return forecast ? [...forecast.items] : [];
  }

  count(): number {
    return this.forecasts.size;
  }
}
