import type { GLAnalyticsKPI, GLAlert, GLRecommendation } from "../../types";

export class AnalyticsService {
  private kpis: GLAnalyticsKPI[] = [];
  private alerts = new Map<string, GLAlert>();
  private recommendations = new Map<string, GLRecommendation>();

  setKPIs(kpis: GLAnalyticsKPI[]): void {
    this.kpis = kpis;
  }

  getKPIs(): GLAnalyticsKPI[] {
    return this.kpis;
  }

  getKPIByName(name: string): GLAnalyticsKPI | undefined {
    return this.kpis.find(k => k.name === name);
  }

  addAlert(alert: GLAlert): GLAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  getAlert(id: string): GLAlert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): GLAlert[] {
    return Array.from(this.alerts.values());
  }

  getActiveAlerts(): GLAlert[] {
    return this.getAllAlerts().filter(a => !a.dismissed);
  }

  getCriticalAlerts(): GLAlert[] {
    return this.getAllAlerts().filter(a => a.severity === "critical" && !a.dismissed);
  }

  addRecommendation(rec: GLRecommendation): GLRecommendation {
    this.recommendations.set(rec.id, rec);
    return rec;
  }

  getRecommendation(id: string): GLRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAllRecommendations(): GLRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getPendingRecommendations(): GLRecommendation[] {
    return this.getAllRecommendations().filter(r => !r.implemented);
  }

  count(): number {
    return this.kpis.length;
  }

  countAlerts(): number {
    return this.alerts.size;
  }

  countRecommendations(): number {
    return this.recommendations.size;
  }
}
