import type { PlanningAlert, BudgetPlan, Forecast, VarianceAnalysisRecord, CapitalPlan } from "../../types";

export class AlertsService {
  private items = new Map<string, PlanningAlert>();

  add(alert: PlanningAlert): void { this.items.set(alert.id, alert); }

  get(id: string): PlanningAlert | undefined { return this.items.get(id); }

  getAll(): PlanningAlert[] { return Array.from(this.items.values()); }

  getByType(type: string): PlanningAlert[] { return this.getAll().filter((a) => a.type === type); }

  getBySeverity(severity: string): PlanningAlert[] { return this.getAll().filter((a) => a.severity === severity); }

  getUnread(): PlanningAlert[] { return this.getAll().filter((a) => !a.isRead); }

  getUnresolved(): PlanningAlert[] { return this.getAll().filter((a) => !a.isResolved); }

  getByPlan(planId: string): PlanningAlert[] { return this.getAll().filter((a) => a.planId === planId); }

  acknowledge(id: string): PlanningAlert | undefined {
    const alert = this.items.get(id); if (!alert) return undefined;
    alert.isRead = true; alert.acknowledgedAt = new Date();
    this.items.set(id, alert); return alert;
  }

  resolve(id: string): PlanningAlert | undefined {
    const alert = this.items.get(id); if (!alert) return undefined;
    alert.isResolved = true; alert.resolvedAt = new Date();
    this.items.set(id, alert); return alert;
  }

  generatePlanningAlerts(
    plans: BudgetPlan[], forecasts: Forecast[], variances: VarianceAnalysisRecord[], capitals: any[]
  ): PlanningAlert[] {
    const alerts: PlanningAlert[] = [];
    for (const plan of plans) {
      if (plan.totalExpenses > plan.totalRevenue * 0.95) {
        alerts.push(this.makeAlert("budget", "warning", "Budget at risk", `Plan ${plan.label} expenses near revenue limit.`, plan.id));
      }
    }
    for (const variance of variances) {
      if (variance.isSignificant) {
        alerts.push(this.makeAlert("variance", "warning", "Large variance detected", `${variance.accountName}: ${variance.variancePercent.toFixed(1)}% variance.`, variance.fiscalYear.toString()));
      }
    }
    for (const capital of capitals) {
      if (capital.spentToDate > capital.totalBudget * 0.9) {
        alerts.push(this.makeAlert("capital", "critical", "Capital overspend risk", `${capital.projectName} has spent ${((capital.spentToDate / capital.totalBudget) * 100).toFixed(0)}% of budget.`, capital.id));
      }
    }
    for (const forecast of forecasts) {
      if (forecast.confidenceLevel < 50) {
        alerts.push(this.makeAlert("forecast", "warning", "Low forecast confidence", `Forecast ${forecast.label} confidence is ${forecast.confidenceLevel}%.`, forecast.id));
      }
    }
    for (const plan of plans) {
      if (plan.status === "draft" || plan.status === "review") {
        alerts.push(this.makeAlert("budget", "info", "Plan approval overdue", `Plan ${plan.label} has been in ${plan.status} status. Review and approve.`, plan.id));
      }
    }
    return alerts;
  }

  private makeAlert(type: string, severity: string, title: string, message: string, planId?: string): PlanningAlert {
    return {
      id: crypto.randomUUID(),
      type: type as any,
      severity: severity as any,
      title,
      message,
      planId,
      isRead: false,
      isResolved: false,
      companyId: "",
      createdAt: new Date(),
    };
  }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<PlanningAlert>): PlanningAlert | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated); return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
