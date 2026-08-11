import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptText, DollarSign, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";
import { prisma } from "@/server/db/prisma";
import type { VendorInvoiceStatus } from "@prisma/client";

const OPEN_STATUSES: VendorInvoiceStatus[] = [
  "CAPTURED", "VALIDATING", "VALIDATED", "THREE_WAY_MATCHING", "MATCHED",
  "MATCH_FAILED", "EXCEPTION", "PENDING_APPROVAL", "APPROVED",
];

function formatMoney(value: { toString(): string }, currency: string) {
  const num = Number(value.toString());
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
}

export default async function InvoicesPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    const companyId = ctx.tenant.companyId;

    const [openInvoices, dueThisWeek, overdue, recent, statusCounts] = await Promise.all([
      prisma.procurementVendorInvoice.findMany({
        where: { companyId, status: { in: OPEN_STATUSES } },
        select: { netBalance: true, currency: true },
      }),
      prisma.procurementVendorInvoice.findMany({
        where: {
          companyId,
          status: { in: OPEN_STATUSES },
          dueDate: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) },
        },
        select: { netBalance: true, currency: true },
      }),
      prisma.procurementVendorInvoice.findMany({
        where: {
          companyId,
          status: { in: OPEN_STATUSES },
          dueDate: { lt: new Date() },
        },
        select: { netBalance: true, currency: true },
      }),
      prisma.procurementVendorInvoice.findMany({
        where: { companyId },
        orderBy: { receivedDate: "desc" },
        take: 8,
        select: {
          invoiceNumber: true,
          receivedDate: true,
          dueDate: true,
          netBalance: true,
          currency: true,
          status: true,
          vendor: { select: { name: true } },
        },
      }),
      prisma.procurementVendorInvoice.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { _all: true },
      }),
    ]);

    const sumByCurrency = (rows: Array<{ netBalance: { toString(): string }; currency: string }>) => {
      const acc = new Map<string, number>();
      for (const r of rows) {
        acc.set(r.currency, (acc.get(r.currency) ?? 0) + Number(r.netBalance.toString()));
      }
      return Array.from(acc.entries());
    };

    const outstanding = sumByCurrency(openInvoices);
    const dueThisWeekSum = sumByCurrency(dueThisWeek);
    const overdueSum = sumByCurrency(overdue);

    const statusLabel: Record<string, string> = {
      CAPTURED: "Captured", VALIDATING: "Validating", VALIDATED: "Validated",
      THREE_WAY_MATCHING: "3-Way Matching", MATCHED: "Matched", MATCH_FAILED: "Match Failed",
      EXCEPTION: "Exception", PENDING_APPROVAL: "Pending Approval", APPROVED: "Approved",
      DRAFT: "Draft", REJECTED: "Rejected", VOIDED: "Voided", PARTIALLY_PAID: "Partially Paid", PAID: "Paid",
    };

    const stats = [
      {
        label: "Total Outstanding",
        value: outstanding.map(([c, v]) => formatMoney(v, c)).join(" + ") || "$0.00",
        icon: DollarSign,
        color: "text-gold",
      },
      {
        label: "Due This Week",
        value: dueThisWeekSum.map(([c, v]) => formatMoney(v, c)).join(" + ") || "$0.00",
        icon: Clock,
        color: "text-amber-400",
      },
      {
        label: "Overdue",
        value: overdueSum.map(([c, v]) => formatMoney(v, c)).join(" + ") || "$0.00",
        icon: AlertTriangle,
        color: "text-red-400",
      },
    ];

    const countByStatus = new Map(statusCounts.map((s) => [s.status, s._count._all]));

    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Invoices"
          description="Vendor invoice status, aging, and activity — sourced live from the AP workflow."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-white/[0.06] bg-zinc-900/40">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="border-white/[0.06] bg-zinc-900/40 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Recent Invoices</CardTitle>
              <CardDescription className="text-xs text-zinc-600">
                Latest received invoices across all statuses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <ReceiptText className="mx-auto h-8 w-8 text-zinc-700" />
                    <p className="mt-3 text-sm text-zinc-600">No invoices received yet.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-xs text-zinc-500">
                        <th className="py-2 pr-4 font-medium">Invoice</th>
                        <th className="py-2 pr-4 font-medium">Vendor</th>
                        <th className="py-2 pr-4 font-medium">Received</th>
                        <th className="py-2 pr-4 font-medium">Due</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 text-right font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((inv) => (
                        <tr key={inv.invoiceNumber} className="border-b border-white/[0.03] text-zinc-300">
                          <td className="py-2.5 pr-4 font-mono text-xs">{inv.invoiceNumber}</td>
                          <td className="py-2.5 pr-4">{inv.vendor.name}</td>
                          <td className="py-2.5 pr-4 text-xs text-zinc-500">
                            {inv.receivedDate.toISOString().split("T")[0]}
                          </td>
                          <td className="py-2.5 pr-4 text-xs text-zinc-500">
                            {inv.dueDate.toISOString().split("T")[0]}
                          </td>
                          <td className="py-2.5 pr-4 text-xs">{statusLabel[inv.status] ?? inv.status}</td>
                          <td className="py-2.5 text-right font-medium text-white">
                            {formatMoney(inv.netBalance, inv.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/[0.06] bg-zinc-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Status Breakdown</CardTitle>
              <CardDescription className="text-xs text-zinc-600">
                Invoice counts by workflow state.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.from(countByStatus.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([status, count]) => (
                    <li key={status} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">{statusLabel[status] ?? status}</span>
                      <span className="font-medium text-white">{count}</span>
                    </li>
                  ))}
              </ul>
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <Link
                  href="/procurement/invoices"
                  className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80"
                >
                  Open the AP work queue <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  });
}
