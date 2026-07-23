import type { Forecast, ForecastLineItem, ForecastType, PlanStatus } from "../../types";

export class RollingForecastService {
  private forecasts = new Map<string, Forecast>();
  private lineItems = new Map<string, ForecastLineItem>();

  addForecast(forecast: Forecast): void { this.forecasts.set(forecast.id, forecast); }
  getForecast(id: string): Forecast | undefined { return this.forecasts.get(id); }
  getAllForecasts(): Forecast[] { return Array.from(this.forecasts.values()); }
  getByType(type: ForecastType): Forecast[] { return this.getAllForecasts().filter((f) => f.forecastType === type); }
  getByStatus(status: PlanStatus): Forecast[] { return this.getAllForecasts().filter((f) => f.status === status); }
  getByFiscalYear(year: number): Forecast[] { return this.getAllForecasts().filter((f) => f.fiscalYear === year); }
  getActive(): Forecast[] { return this.getAllForecasts().filter((f) => f.status !== "archived"); }
  getLatest(): Forecast | undefined { return this.getAllForecasts().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]; }
  approveForecast(id: string, userId: string): Forecast | undefined {
    const f = this.forecasts.get(id); if (!f) return undefined;
    const updated = { ...f, status: "approved" as const, approvedBy: userId, approvedAt: new Date(), updatedAt: new Date() };
    this.forecasts.set(id, updated); return updated;
  }
  lockForecast(id: string): Forecast | undefined {
    const f = this.forecasts.get(id); if (!f) return undefined;
    const updated = { ...f, status: "locked" as const, updatedAt: new Date() };
    this.forecasts.set(id, updated); return updated;
  }
  getTotalRevenueForecast(): number { return this.getAllForecasts().reduce((s, f) => s + f.totalRevenue, 0); }
  getTotalExpenseForecast(): number { return this.getAllForecasts().reduce((s, f) => s + f.totalExpenses, 0); }
  countForecasts(): number { return this.forecasts.size; }
  count(): number { return this.forecasts.size; }
  updateForecast(id: string, updates: Partial<Forecast>): Forecast | undefined {
    const existing = this.forecasts.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.forecasts.set(id, updated); return updated;
  }
  deleteForecast(id: string): boolean { return this.forecasts.delete(id); }

  addLineItem(item: ForecastLineItem): void { this.lineItems.set(item.id, item); }
  getLineItemsByForecast(forecastId: string): ForecastLineItem[] { return Array.from(this.lineItems.values()).filter((i) => i.forecastId === forecastId); }
  getAllLineItems(): ForecastLineItem[] { return Array.from(this.lineItems.values()); }
  countLineItems(): number { return this.lineItems.size; }
}
