import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class AgedReceivablesBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const endDate = new Date(config.dateRange.end);
    const companyIds = config.companyIds.length ? config.companyIds : [ctx.companyId];
    const round = (n: number) => Math.round(n * 10 ** config.rounding) / 10 ** config.rounding;

    const invoices = await prisma.accountingInvoice.findMany({
      where: {
        companyId: { in: companyIds },
        dueDate: { lte: endDate },
        status: { notIn: ["Paid", "Void"] },
      },
      orderBy: { customerName: "asc" },
    });

    const agingBuckets = [
      { label: "Current (0–30)", min: 0, max: 30 },
      { label: "31–60 Days", min: 31, max: 60 },
      { label: "61–90 Days", min: 61, max: 90 },
      { label: "90+ Days", min: 91, max: Infinity },
    ];

    const groupByCustomer = new Map<string, typeof invoices>();
    for (const inv of invoices) {
      const key = inv.customerName ?? "Unknown Customer";
      if (!groupByCustomer.has(key)) groupByCustomer.set(key, []);
      groupByCustomer.get(key)!.push(inv);
    }

    let grandTotal = 0;
    const bucketTotals: Record<string, number> = {};
    for (const bucket of agingBuckets) bucketTotals[bucket.label] = 0;

    const customerRows: ReportRow[] = [];

    for (const [customerName, customerInvoices] of groupByCustomer) {
      const bucketAmounts: Record<string, number> = {};
      for (const bucket of agingBuckets) bucketAmounts[bucket.label] = 0;

      for (const inv of customerInvoices) {
        const dueDate = inv.dueDate ?? inv.transactionDate ?? new Date();
        const daysOverdue = Math.max(0, Math.floor((endDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        const balance = Number(inv.balance);

        for (const bucket of agingBuckets) {
          if (daysOverdue >= bucket.min && daysOverdue <= bucket.max) {
            bucketAmounts[bucket.label] += balance;
            bucketTotals[bucket.label] += balance;
            break;
          }
        }
        grandTotal += balance;
      }

      const total = Object.values(bucketAmounts).reduce((s, v) => s + v, 0);

      customerRows.push({
        id: `ar-customer-${customerName.replace(/\s+/g, "-")}`,
        label: customerName,
        depth: 0,
        type: "section-header",
        values: {
          customer: customerName,
          current: round(bucketAmounts[agingBuckets[0].label]),
          days31to60: round(bucketAmounts[agingBuckets[1].label]),
          days61to90: round(bucketAmounts[agingBuckets[2].label]),
          days90plus: round(bucketAmounts[agingBuckets[3].label]),
          total: round(total),
          pctCurrent: total > 0 ? round((bucketAmounts[agingBuckets[0].label] / total) * 100) : 0,
          pct31to60: total > 0 ? round((bucketAmounts[agingBuckets[1].label] / total) * 100) : 0,
          pct61to90: total > 0 ? round((bucketAmounts[agingBuckets[2].label] / total) * 100) : 0,
          pct90plus: total > 0 ? round((bucketAmounts[agingBuckets[3].label] / total) * 100) : 0,
        },
      });
    }

    const sections: ReportSection[] = [
      {
        id: "aged-receivables",
        title: "Aged Receivables",
        subtitle: `As of ${config.dateRange.end} — ${invoices.length} outstanding invoices`,
        type: "table",
        columns: [
          "Customer",
          "Current (0–30)",
          "31–60 Days",
          "61–90 Days",
          "90+ Days",
          "Total",
          "% Current",
          "% 31–60",
          "% 61–90",
          "% 90+",
        ],
        rows: customerRows,
        totals: {
          current: round(bucketTotals[agingBuckets[0].label]),
          days31to60: round(bucketTotals[agingBuckets[1].label]),
          days61to90: round(bucketTotals[agingBuckets[2].label]),
          days90plus: round(bucketTotals[agingBuckets[3].label]),
          total: round(grandTotal),
        },
        notes: [
          `Total outstanding: ${round(grandTotal)}`,
          `Over 90 days: ${round(bucketTotals[agingBuckets[3].label])} (${grandTotal > 0 ? round((bucketTotals[agingBuckets[3].label] / grandTotal) * 100) : 0}%)`,
        ],
      },
    ];

    return sections;
  }
}
