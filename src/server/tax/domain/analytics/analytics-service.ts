import type { TaxKPI, TaxForecast, TaxAlert, TaxRecommendation } from "../../types";

export class TaxAnalyticsService {
  private kpis = new Map<string, TaxKPI>();
  private forecasts = new Map<string, TaxForecast>();
  private alerts = new Map<string, TaxAlert>();
  private recommendations = new Map<string, TaxRecommendation>();

  addKPI(kpi: TaxKPI): TaxKPI {
    this.kpis.set(kpi.id, kpi);
    return kpi;
  }

  getKPI(id: string): TaxKPI | undefined {
    return this.kpis.get(id);
  }

  getAllKPIs(): TaxKPI[] {
    return Array.from(this.kpis.values());
  }

  getByCategory(category: string): TaxKPI[] {
    return this.getAllKPIs().filter(k => k.category === category);
  }

  getByStatus(status: string): TaxKPI[] {
    return this.getAllKPIs().filter(k => k.status === status);
  }

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

  addAlert(alert: TaxAlert): TaxAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  getAlert(id: string): TaxAlert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): TaxAlert[] {
    return Array.from(this.alerts.values());
  }

  getBySeverity(severity: "critical" | "warning" | "info"): TaxAlert[] {
    return this.getAllAlerts().filter(a => a.severity === severity);
  }

  getActiveAlerts(): TaxAlert[] {
    return this.getAllAlerts().filter(a => !a.dismissed);
  }

  dismissAlert(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) alert.dismissed = true;
  }

  addRecommendation(rec: TaxRecommendation): TaxRecommendation {
    this.recommendations.set(rec.id, rec);
    return rec;
  }

  getRecommendation(id: string): TaxRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAllRecommendations(): TaxRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getByType(type: string): TaxRecommendation[] {
    return this.getAllRecommendations().filter(r => r.type === type);
  }

  implementRecommendation(id: string): void {
    const rec = this.recommendations.get(id);
    if (rec) rec.implemented = true;
  }

  count(): number {
    return this.kpis.size;
  }
}
