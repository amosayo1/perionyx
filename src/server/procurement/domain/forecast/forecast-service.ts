import type { ProcurementForecast } from "../../types";

export class ProcurementForecastService {
  private forecasts = new Map<string, ProcurementForecast>();

  addForecast(forecast: ProcurementForecast): void {
    this.forecasts.set(forecast.id, forecast);
  }

  getForecast(id: string): ProcurementForecast | undefined {
    return this.forecasts.get(id);
  }

  getAllForecasts(): ProcurementForecast[] {
    return [...this.forecasts.values()];
  }

  getByMetric(metric: "spend" | "savings" | "orders" | "invoices"): ProcurementForecast[] {
    return this.getAllForecasts().filter((f) => f.metric === metric);
  }

  getByCompany(companyId: string): ProcurementForecast[] {
    return this.getAllForecasts().filter((f) => f.companyId === companyId);
  }

  count(): number {
    return this.forecasts.size;
  }
}
