import type { ARAlert, Invoice, Customer, CreditLimit, Dispute } from "../../types";
import type { AgingSummary, ARForecast } from "../../types";

export class AlertsService {
  private alerts = new Map<string, ARAlert>();

  add(alert: ARAlert): ARAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  get(id: string): ARAlert | undefined {
    return this.alerts.get(id);
  }

  getAll(): ARAlert[] {
    return Array.from(this.alerts.values());
  }

  getByType(type: string): ARAlert[] {
    return this.getAll().filter((a) => a.type === type);
  }

  getBySeverity(severity: string): ARAlert[] {
    return this.getAll().filter((a) => a.severity === severity);
  }

  getByCustomer(customerId: string): ARAlert[] {
    return this.getAll().filter((a) => a.customerId === customerId);
  }

  getUnread(): ARAlert[] {
    return this.getAll().filter((a) => !a.isRead);
  }

  getUnresolved(): ARAlert[] {
    return this.getAll().filter((a) => !a.isResolved);
  }

  search(query: string): ARAlert[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (a) => a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q),
    );
  }

  count(): number {
    return this.alerts.size;
  }

  update(id: string, updates: Partial<ARAlert>): ARAlert {
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

  generateOverdueAlert(invoice: Invoice, customer: Customer): ARAlert {
    const daysOverdue = invoice.daysOverdue ?? 0;
    const severity = daysOverdue > 90 ? "emergency" : daysOverdue > 60 ? "critical" : daysOverdue > 30 ? "warning" : "info";
    return {
      id: `alert-overdue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "payment",
      severity: severity as "info" | "warning" | "critical" | "emergency",
      title: `Payment overdue: ${customer.name}`,
      message: `Invoice ${invoice.invoiceNumber} for ${invoice.amountDue.toLocaleString()} ${invoice.currency} is ${daysOverdue} days overdue. Dunning level: ${invoice.dunningLevel}.`,
      customerId: customer.id,
      customerName: customer.name,
      invoiceId: invoice.id,
      isRead: false,
      isResolved: false,
      companyId: invoice.companyId,
      createdAt: new Date(),
    };
  }

  generateCreditAlert(customer: Customer, creditLimit: CreditLimit, utilization: number): ARAlert {
    const severity = utilization > 0.9 ? "critical" : utilization > 0.75 ? "warning" : "info";
    return {
      id: `alert-credit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "credit",
      severity: severity as "info" | "warning" | "critical",
      title: `Credit limit approaching: ${customer.name}`,
      message: `${customer.name} has ${(utilization * 100).toFixed(0)}% credit utilization (${creditLimit.creditUsed.toLocaleString()}/${creditLimit.creditLimit.toLocaleString()}). Risk: ${creditLimit.riskRating}.`,
      customerId: customer.id,
      customerName: customer.name,
      isRead: false,
      isResolved: false,
      companyId: customer.companyId,
      createdAt: new Date(),
    };
  }

  generateAgingAlert(customer: Customer, agingSummary: AgingSummary): ARAlert {
    const totalOverdue = agingSummary.days91plus + agingSummary.days61to90 + agingSummary.days31to60 + agingSummary.days1to30;
    const severity = agingSummary.days91plus > 0 ? "critical" : agingSummary.days61to90 > 0 ? "warning" : "info";
    return {
      id: `alert-aging-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "aging",
      severity: severity as "info" | "warning" | "critical",
      title: `Aging concern: ${customer.name}`,
      message: `${customer.name} has ${totalOverdue.toLocaleString()} ${customer.currency} overdue. 91+ days: ${agingSummary.days91plus.toLocaleString()}. DSO: ${customer.dso.toFixed(1)} days.`,
      customerId: customer.id,
      customerName: customer.name,
      isRead: false,
      isResolved: false,
      companyId: customer.companyId,
      createdAt: new Date(),
    };
  }

  generateForecastAlert(forecast: ARForecast, variance: number): ARAlert {
    const absVar = Math.abs(variance);
    const severity = absVar > 0.2 ? "critical" : absVar > 0.1 ? "warning" : "info";
    return {
      id: `alert-forecast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "forecast",
      severity: severity as "info" | "warning" | "critical",
      title: `Forecast variance alert`,
      message: `AR forecast for ${forecast.period} shows ${(variance * 100).toFixed(1)}% variance from actuals. Projected: ${forecast.projectedCollections.toLocaleString()}. Confidence: ${(forecast.confidenceLevel * 100).toFixed(0)}%.`,
      isRead: false,
      isResolved: false,
      companyId: forecast.companyId,
      createdAt: new Date(),
    };
  }

  generateDisputeAlert(dispute: Dispute): ARAlert {
    const daysOpen = Math.floor((Date.now() - dispute.createdAt.getTime()) / 86400000);
    return {
      id: `alert-dispute-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "dispute",
      severity: daysOpen > 30 ? "critical" : daysOpen > 14 ? "warning" : "info",
      title: `Dispute open: ${dispute.customerName}`,
      message: `Dispute ${dispute.disputeNumber} for ${dispute.amount.toLocaleString()} ${dispute.currency} has been open for ${daysOpen} days. Reason: ${dispute.reason}. Assignee: ${dispute.assignedTo ?? "unassigned"}.`,
      customerId: dispute.customerId,
      customerName: dispute.customerName,
      invoiceId: dispute.invoiceId,
      isRead: false,
      isResolved: false,
      companyId: dispute.companyId,
      createdAt: new Date(),
    };
  }
}
