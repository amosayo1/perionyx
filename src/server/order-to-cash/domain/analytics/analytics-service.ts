import type { O2CKPI, O2CForecast, O2CAlert, O2CRecommendation } from "../../types";

export class O2CAnalyticsService {
  private kpis = new Map<string, O2CKPI>();
  private forecasts = new Map<string, O2CForecast>();
  private alerts = new Map<string, O2CAlert>();
  private recommendations = new Map<string, O2CRecommendation>();

  addKPI(kpi: O2CKPI): O2CKPI {
    this.kpis.set(kpi.id, kpi);
    return kpi;
  }

  getKPI(id: string): O2CKPI | undefined {
    return this.kpis.get(id);
  }

  getAllKPIs(): O2CKPI[] {
    return Array.from(this.kpis.values());
  }

  addForecast(forecast: O2CForecast): O2CForecast {
    this.forecasts.set(forecast.id, forecast);
    return forecast;
  }

  getForecast(id: string): O2CForecast | undefined {
    return this.forecasts.get(id);
  }

  getAllForecasts(): O2CForecast[] {
    return Array.from(this.forecasts.values());
  }

  addAlert(alert: O2CAlert): O2CAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  getAlert(id: string): O2CAlert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): O2CAlert[] {
    return Array.from(this.alerts.values());
  }

  getBySeverity(severity: "critical" | "warning" | "info"): O2CAlert[] {
    return this.getAllAlerts().filter(a => a.severity === severity);
  }

  getActiveAlerts(): O2CAlert[] {
    return this.getAllAlerts().filter(a => !a.dismissed);
  }

  dismissAlert(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) alert.dismissed = true;
  }

  addRecommendation(rec: O2CRecommendation): O2CRecommendation {
    this.recommendations.set(rec.id, rec);
    return rec;
  }

  getRecommendation(id: string): O2CRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAllRecommendations(): O2CRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getByType(type: string): O2CRecommendation[] {
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
