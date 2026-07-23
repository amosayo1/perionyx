import type { AgingReport, AgingSummary, AgingBucket, DSOReport, CEIReport, Invoice } from "../../types";

export class ReportingService {
  generateAgingReport(customerId: string, customerName: string, invoices: Invoice[], asOfDate: Date): AgingReport {
    const summary = this.generateAgingSummary(invoices);
    return {
      asOfDate,
      customerId,
      customerName,
      totalOutstanding: summary.total,
      current: summary.current,
      days1to30: summary.days1to30,
      days31to60: summary.days31to60,
      days61to90: summary.days61to90,
      days91plus: summary.days91plus,
      totalOverdue: summary.totalOverdue,
      overduePercentage: summary.overduePercentage,
    };
  }

  generateAgingSummary(invoices: Invoice[]): AgingSummary {
    const now = new Date();
    let current = 0;
    let days1to30 = 0;
    let days31to60 = 0;
    let days61to90 = 0;
    let days91plus = 0;

    for (const inv of invoices) {
      if (inv.status === "paid" || inv.status === "cancelled" || inv.status === "void") continue;
      const daysOverdue = Math.max(0, Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000));
      if (daysOverdue <= 0) current += inv.amountDue;
      else if (daysOverdue <= 30) days1to30 += inv.amountDue;
      else if (daysOverdue <= 60) days31to60 += inv.amountDue;
      else if (daysOverdue <= 90) days61to90 += inv.amountDue;
      else days91plus += inv.amountDue;
    }

    const total = current + days1to30 + days31to60 + days61to90 + days91plus;
    const totalOverdue = days1to30 + days31to60 + days61to90 + days91plus;
    const overduePercentage = total > 0 ? (totalOverdue / total) * 100 : 0;

    const buckets: AgingBucket[] = [
      { bucket: "current", amount: current, count: invoices.filter((i) => Math.max(0, Math.floor((now.getTime() - i.dueDate.getTime()) / 86400000)) <= 0).length, percentage: total > 0 ? (current / total) * 100 : 0 },
      { bucket: "1to30", amount: days1to30, count: invoices.filter((i) => { const d = Math.max(0, Math.floor((now.getTime() - i.dueDate.getTime()) / 86400000)); return d > 0 && d <= 30; }).length, percentage: total > 0 ? (days1to30 / total) * 100 : 0 },
      { bucket: "31to60", amount: days31to60, count: invoices.filter((i) => { const d = Math.max(0, Math.floor((now.getTime() - i.dueDate.getTime()) / 86400000)); return d > 30 && d <= 60; }).length, percentage: total > 0 ? (days31to60 / total) * 100 : 0 },
      { bucket: "61to90", amount: days61to90, count: invoices.filter((i) => { const d = Math.max(0, Math.floor((now.getTime() - i.dueDate.getTime()) / 86400000)); return d > 60 && d <= 90; }).length, percentage: total > 0 ? (days61to90 / total) * 100 : 0 },
      { bucket: "91plus", amount: days91plus, count: invoices.filter((i) => Math.max(0, Math.floor((now.getTime() - i.dueDate.getTime()) / 86400000)) > 90).length, percentage: total > 0 ? (days91plus / total) * 100 : 0 },
    ];

    return { current, days1to30, days31to60, days61to90, days91plus, total, totalOverdue, overduePercentage, buckets };
  }

  generateDSOReport(period: string, totalRevenue: number, averageReceivables: number, comparativeDSO?: number): DSOReport {
    const periodDays = period === "monthly" ? 30 : period === "weekly" ? 7 : period === "quarterly" ? 90 : 365;
    const dso = averageReceivables > 0 && totalRevenue > 0 ? (averageReceivables / totalRevenue) * periodDays : 0;
    const avgDSO = 45;
    return {
      period,
      dso: Math.round(dso * 100) / 100,
      bestPossibleDSO: Math.round(dso * 0.7 * 100) / 100,
      averageDSO: avgDSO,
      trend: dso > avgDSO ? "worsening" : dso < avgDSO * 0.9 ? "improving" : "stable",
      revenue: totalRevenue,
      receivables: averageReceivables,
      comparativeDSO,
    };
  }

  generateCEIReport(
    period: string,
    beginningReceivables: number,
    collections: number,
    newCharges: number,
    endingReceivables: number,
    targetCEI?: number,
  ): CEIReport {
    const denominator = beginningReceivables + newCharges - endingReceivables;
    const cei = denominator > 0 ? (collections / denominator) * 100 : 0;
    const avgCEI = 80;
    return {
      period,
      cei: Math.round(cei * 100) / 100,
      beginningReceivables,
      collections,
      newCharges,
      endingReceivables,
      targetCEI: targetCEI ?? 85,
      trend: cei > avgCEI ? "improving" : cei < avgCEI * 0.9 ? "worsening" : "stable",
    };
  }

  generateCustomerAging(invoices: Invoice[]): Map<string, { customerId: string; customerName: string; aging: AgingSummary }> {
    const result = new Map<string, { customerId: string; customerName: string; aging: AgingSummary }>();
    const byCustomer = new Map<string, Invoice[]>();
    for (const inv of invoices) {
      const list = byCustomer.get(inv.customerId) ?? [];
      list.push(inv);
      byCustomer.set(inv.customerId, list);
    }
    for (const [customerId, invs] of byCustomer) {
      const customerName = invs[0]?.customerName ?? "Unknown";
      const aging = this.generateAgingSummary(invs);
      result.set(customerId, { customerId, customerName, aging });
    }
    return result;
  }
}
