import type { RiskKPIItem, RiskAlert, RiskRecommendation } from "../../types";

export class RiskAnalyticsService {
  private kpis: RiskKPIItem[] = [];
  private alerts = new Map<string, RiskAlert>();
  private recommendations = new Map<string, RiskRecommendation>();

  addKPI(kpi: RiskKPIItem): void {
    this.kpis.push(kpi);
  }

  getAllKPIs(): RiskKPIItem[] {
    return this.kpis;
  }

  addAlert(alert: RiskAlert): RiskAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  getAlert(id: string): RiskAlert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): RiskAlert[] {
    return Array.from(this.alerts.values());
  }

  getActiveAlerts(): RiskAlert[] {
    return this.getAllAlerts().filter(a => !a.dismissed);
  }

  addRecommendation(rec: RiskRecommendation): RiskRecommendation {
    this.recommendations.set(rec.id, rec);
    return rec;
  }

  getRecommendation(id: string): RiskRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAllRecommendations(): RiskRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getPendingRecommendations(): RiskRecommendation[] {
    return this.getAllRecommendations().filter(r => !r.implemented);
  }

  countKPIs(): number {
    return this.kpis.length;
  }

  countAlerts(): number {
    return this.alerts.size;
  }

  countRecommendations(): number {
    return this.recommendations.size;
  }
}
