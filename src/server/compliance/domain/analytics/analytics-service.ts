import type { ComplianceKPI, ComplianceAlert, ComplianceRecommendation } from "../../types";

export class ComplianceAnalyticsService {
  private kpis = new Map<string, ComplianceKPI>();
  private alerts = new Map<string, ComplianceAlert>();
  private recommendations = new Map<string, ComplianceRecommendation>();

  addKPI(name: string, kpi: ComplianceKPI): ComplianceKPI {
    this.kpis.set(name, kpi);
    return kpi;
  }

  getKPI(name: string): ComplianceKPI | undefined {
    return this.kpis.get(name);
  }

  getAllKPIs(): ComplianceKPI[] {
    return Array.from(this.kpis.values());
  }

  getKPIsByCategory(category: string): ComplianceKPI[] {
    return this.getAllKPIs().filter(k => k.category === category);
  }

  getKPIsByStatus(status: ComplianceKPI["status"]): ComplianceKPI[] {
    return this.getAllKPIs().filter(k => k.status === status);
  }

  addAlert(alert: ComplianceAlert): ComplianceAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  getAlert(id: string): ComplianceAlert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): ComplianceAlert[] {
    return Array.from(this.alerts.values());
  }

  getActiveAlerts(): ComplianceAlert[] {
    return this.getAllAlerts().filter(a => !a.dismissed);
  }

  getCriticalAlerts(): ComplianceAlert[] {
    return this.getAllAlerts().filter(a => a.severity === "critical" && !a.dismissed);
  }

  dismissAlert(id: string): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    this.alerts.set(id, { ...alert, dismissed: true });
    return true;
  }

  addRecommendation(recommendation: ComplianceRecommendation): ComplianceRecommendation {
    this.recommendations.set(recommendation.id, recommendation);
    return recommendation;
  }

  getRecommendation(id: string): ComplianceRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAllRecommendations(): ComplianceRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getPendingRecommendations(): ComplianceRecommendation[] {
    return this.getAllRecommendations().filter(r => !r.implemented);
  }

  markImplemented(id: string): boolean {
    const rec = this.recommendations.get(id);
    if (!rec) return false;
    this.recommendations.set(id, { ...rec, implemented: true });
    return true;
  }

  countKPIs(): number {
    return this.kpis.size;
  }

  countAlerts(): number {
    return this.alerts.size;
  }

  countRecommendations(): number {
    return this.recommendations.size;
  }
}
