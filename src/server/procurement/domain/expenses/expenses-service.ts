import type { SpendAnalytic, ProcurementKPI, ProcurementForecast } from "../../types";

export class ExpenseService {
  private analytics = new Map<string, SpendAnalytic>();
  private kpis = new Map<string, ProcurementKPI>();
  private forecasts = new Map<string, ProcurementForecast>();

  addAnalytic(analytic: SpendAnalytic): void {
    this.analytics.set(analytic.id, analytic);
  }

  getAnalytic(id: string): SpendAnalytic | undefined {
    return this.analytics.get(id);
  }

  getAllAnalytics(): SpendAnalytic[] {
    return [...this.analytics.values()];
  }

  getByDimension(dimension: string, dimensionValue: string): SpendAnalytic[] {
    return this.getAllAnalytics().filter(
      (a) => a.dimension === dimension && a.dimensionValue === dimensionValue,
    );
  }

  getByPeriod(period: string): SpendAnalytic[] {
    return this.getAllAnalytics().filter((a) => a.period === period);
  }

  getByCompany(companyId: string): SpendAnalytic[] {
    return this.getAllAnalytics().filter((a) => a.companyId === companyId);
  }

  addKPI(kpi: ProcurementKPI): void {
    this.kpis.set(kpi.id, kpi);
  }

  getKPI(id: string): ProcurementKPI | undefined {
    return this.kpis.get(id);
  }

  getAllKPIs(): ProcurementKPI[] {
    return [...this.kpis.values()];
  }

  addForecast(forecast: ProcurementForecast): void {
    this.forecasts.set(forecast.id, forecast);
  }

  getForecast(id: string): ProcurementForecast | undefined {
    return this.forecasts.get(id);
  }

  getAllForecasts(): ProcurementForecast[] {
    return [...this.forecasts.values()];
  }

  count(): number {
    return this.analytics.size + this.kpis.size + this.forecasts.size;
  }
}
