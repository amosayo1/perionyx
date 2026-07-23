import type { ProcurementAlert, ProcurementRecommendation } from "../../types";

export class ProcurementAnalyticsService {
  private alerts = new Map<string, ProcurementAlert>();
  private recommendations = new Map<string, ProcurementRecommendation>();

  addAlert(alert: ProcurementAlert): void {
    this.alerts.set(alert.id, alert);
  }

  getAlert(id: string): ProcurementAlert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): ProcurementAlert[] {
    return [...this.alerts.values()];
  }

  getBySeverity(severity: "critical" | "warning" | "info"): ProcurementAlert[] {
    return this.getAllAlerts().filter((a) => a.severity === severity);
  }

  getActiveAlerts(): ProcurementAlert[] {
    return this.getAllAlerts().filter((a) => !a.dismissed);
  }

  dismissAlert(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.dismissed = true;
    }
  }

  addRecommendation(rec: ProcurementRecommendation): void {
    this.recommendations.set(rec.id, rec);
  }

  getRecommendation(id: string): ProcurementRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAllRecommendations(): ProcurementRecommendation[] {
    return [...this.recommendations.values()];
  }

  getByType(type: string): ProcurementRecommendation[] {
    return this.getAllRecommendations().filter((r) => r.type === type);
  }

  implementRecommendation(id: string): void {
    const rec = this.recommendations.get(id);
    if (rec) {
      rec.implemented = true;
    }
  }

  count(): number {
    return this.alerts.size + this.recommendations.size;
  }
}
