import type { CloseAlert, CloseTask, ExceptionRecord, ApprovalRecord, ClosePeriod } from "../../types";

export class AlertsService {
  private alerts = new Map<string, CloseAlert>();

  add(alert: CloseAlert): CloseAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  get(id: string): CloseAlert | undefined {
    return this.alerts.get(id);
  }

  getAll(): CloseAlert[] {
    return Array.from(this.alerts.values());
  }

  getByType(type: string): CloseAlert[] {
    return this.getAll().filter((a) => a.type === type);
  }

  getBySeverity(severity: string): CloseAlert[] {
    return this.getAll().filter((a) => a.severity === severity);
  }

  getUnread(): CloseAlert[] {
    return this.getAll().filter((a) => !a.isRead);
  }

  getUnresolved(): CloseAlert[] {
    return this.getAll().filter((a) => !a.isResolved);
  }

  count(): number {
    return this.alerts.size;
  }

  update(id: string, updates: Partial<CloseAlert>): CloseAlert {
    const existing = this.alerts.get(id);
    if (!existing) throw new Error(`Alert ${id} not found`);
    const updated = { ...existing, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.alerts.delete(id);
  }

  acknowledge(id: string): void {
    this.update(id, { isRead: true, acknowledgedAt: new Date() });
  }

  resolve(id: string): void {
    this.update(id, { isResolved: true, resolvedAt: new Date() });
  }

  generateOverdueTaskAlert(task: CloseTask): CloseAlert {
    return {
      id: `alert-task-${Date.now()}`,
      type: "task", severity: task.priority === "critical" ? "critical" : task.priority === "high" ? "warning" : "info",
      title: `Task overdue: ${task.title}`,
      message: `Task ${task.taskCode} is due but not completed. Assignee: ${task.assignedTo}. Category: ${task.category}.`,
      periodId: task.periodId, entityId: task.id, isRead: false, isResolved: false, companyId: task.companyId, createdAt: new Date(),
    };
  }

  generateExceptionAlert(exception: ExceptionRecord): CloseAlert {
    return {
      id: `alert-exc-${Date.now()}`,
      type: "close",
      severity: exception.severity === "blocker" ? "emergency" : exception.severity === "critical" ? "critical" : exception.severity === "warning" ? "warning" : "info",
      title: exception.title,
      message: exception.description,
      periodId: exception.periodId, entityId: exception.id, isRead: false, isResolved: false, companyId: exception.companyId, createdAt: new Date(),
    };
  }

  generateApprovalAlert(approval: ApprovalRecord): CloseAlert {
    return {
      id: `alert-appr-${Date.now()}`,
      type: "approval", severity: "warning",
      title: `Approval pending: ${approval.entityDescription}`,
      message: `${approval.entityType} approval requested by ${approval.requestedBy}. ${approval.escalationLevel > 1 ? `Escalation level: ${approval.escalationLevel}.` : ""}`,
      periodId: approval.periodId, entityId: approval.id, isRead: false, isResolved: false, companyId: approval.companyId, createdAt: new Date(),
    };
  }

  generatePeriodAlert(period: ClosePeriod, daysRemaining: number): CloseAlert {
    const severity = daysRemaining <= 1 ? "emergency" : daysRemaining <= 3 ? "critical" : daysRemaining <= 5 ? "warning" : "info";
    return {
      id: `alert-period-${Date.now()}`,
      type: "close",
      severity: severity as "info" | "warning" | "critical" | "emergency",
      title: `Close deadline approaching: ${period.label}`,
      message: `${daysRemaining} days remaining until ${period.periodType} close target. Status: ${period.status}. Tasks remaining: ${period.totalTasks - period.completedTasks}.`,
      periodId: period.id, isRead: false, isResolved: false, companyId: period.companyId, createdAt: new Date(),
    };
  }
}
