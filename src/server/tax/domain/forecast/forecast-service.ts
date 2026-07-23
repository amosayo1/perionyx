import type { TaxForecast } from "../../types";

export class TaxForecastService {
  private forecasts = new Map<string, TaxForecast>();

  addForecast(forecast: TaxForecast): TaxForecast {
    this.forecasts.set(forecast.id, forecast);
    return forecast;
  }

  getForecast(id: string): TaxForecast | undefined {
    return this.forecasts.get(id);
  }

  getAllForecasts(): TaxForecast[] {
    return Array.from(this.forecasts.values());
  }

  getByMetric(metric: string): TaxForecast[] {
    return this.getAllForecasts().filter(f => f.metric === metric);
  }

  getByPeriod(period: string): TaxForecast[] {
    return this.getAllForecasts().filter(f => f.period === period);
  }

  count(): number {
    return this.forecasts.size;
  }
}
