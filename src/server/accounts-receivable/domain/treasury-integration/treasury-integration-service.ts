import type { Receipt, Invoice, ARPaymentProjection } from "../../types";

export class TreasuryIntegrationService {
  calculateCashPositionImpact(receipts: Receipt[]): {
    totalInflow: number;
    totalOutflow: number;
    netImpact: number;
    currency: string;
  } {
    const totalInflow = receipts
      .filter((r) => r.status !== "voided")
      .reduce((sum, r) => sum + r.baseAmount, 0);
    return {
      totalInflow,
      totalOutflow: 0,
      netImpact: totalInflow,
      currency: receipts.length > 0 ? receipts[0].currency : "USD",
    };
  }

  generateLiquidityForecast(
    projections: ARPaymentProjection[],
  ): { date: Date; expectedInflow: number; confidence: number }[] {
    return projections.map((p) => ({
      date: p.date,
      expectedInflow: p.expectedAmount,
      confidence: p.confidence,
    }));
  }

  generatePaymentProjectionsForTreasury(invoices: Invoice[], days: number): ARPaymentProjection[] {
    const projections: ARPaymentProjection[] = [];
    const now = new Date();

    for (let d = 0; d < days; d++) {
      const date = new Date(now.getTime() + d * 86400000);
      const dayInvoices = invoices.filter((inv) => {
        if (!inv.dueDate) return false;
        const diffDays = Math.floor((inv.dueDate.getTime() - now.getTime()) / 86400000);
        return diffDays === d;
      });

      const fromInvoices = dayInvoices.reduce((sum, inv) => {
        const prob = inv.daysOverdue > 90 ? 0.2 : inv.daysOverdue > 60 ? 0.4 : inv.daysOverdue > 30 ? 0.6 : inv.daysOverdue > 0 ? 0.8 : 0.95;
        return sum + inv.amountDue * prob;
      }, 0);

      projections.push({
        date,
        expectedAmount: Math.round(fromInvoices * 100) / 100,
        confidence: Math.max(0.1, 0.9 - d * 0.008),
        fromInvoices: Math.round(fromInvoices * 100) / 100,
        fromRecurring: 0,
        fromCollections: 0,
      });
    }

    return projections;
  }

  calculatePaymentTiming(
    invoices: Invoice[],
  ): { averageDaysToPay: number; medianDaysToPay: number; byCustomer: Map<string, number> } {
    const paidInvoices = invoices.filter((i) => i.paidDate && i.invoiceDate);
    const daysToPay = paidInvoices.map((i) =>
      Math.floor((i.paidDate!.getTime() - i.invoiceDate.getTime()) / 86400000),
    );
    const sorted = [...daysToPay].sort((a, b) => a - b);
    const average = daysToPay.length > 0 ? daysToPay.reduce((s, d) => s + d, 0) / daysToPay.length : 0;
    const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;

    const byCustomer = new Map<string, number>();
    const byCustMap = new Map<string, number[]>();
    for (const inv of paidInvoices) {
      const list = byCustMap.get(inv.customerId) ?? [];
      list.push(Math.floor((inv.paidDate!.getTime() - inv.invoiceDate.getTime()) / 86400000));
      byCustMap.set(inv.customerId, list);
    }
    for (const [custId, days] of byCustMap) {
      byCustomer.set(custId, days.reduce((s, d) => s + d, 0) / days.length);
    }

    return { averageDaysToPay: Math.round(average * 10) / 10, medianDaysToPay: median, byCustomer };
  }
}
