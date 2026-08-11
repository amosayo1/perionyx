"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { VendorInvoice } from "@/server/procurement/ap-repositories/types";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-500/20 text-zinc-300",
  CAPTURED: "bg-blue-500/20 text-blue-300",
  VALIDATING: "bg-yellow-500/20 text-yellow-300",
  VALIDATED: "bg-emerald-500/20 text-emerald-300",
  THREE_WAY_MATCHING: "bg-yellow-500/20 text-yellow-300",
  MATCHED: "bg-emerald-500/20 text-emerald-300",
  MATCH_FAILED: "bg-red-500/20 text-red-300",
  EXCEPTION: "bg-orange-500/20 text-orange-300",
  PENDING_APPROVAL: "bg-amber-500/20 text-amber-300",
  APPROVED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-red-500/20 text-red-300",
  PARTIALLY_PAID: "bg-blue-500/20 text-blue-300",
  PAID: "bg-emerald-500/20 text-emerald-300",
  VOIDED: "bg-zinc-500/20 text-zinc-400",
};

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface InvoiceSummaryProps {
  invoice: VendorInvoice;
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const statusColor = STATUS_COLORS[invoice.status] ?? "bg-zinc-500/20 text-zinc-300";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Invoice Summary</CardTitle>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
            {invoice.status.replace(/_/g, " ")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="space-y-1">
            <span className="text-zinc-500">Invoice Number</span>
            <p className="font-medium text-white">{invoice.invoiceNumber}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Currency</span>
            <p className="font-medium text-white">{invoice.currency}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Invoice Date</span>
            <p className="text-white">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Due Date</span>
            <p className="text-white">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Received Date</span>
            <p className="text-white">{formatDate(invoice.receivedDate)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Source</span>
            <p className="text-white">{invoice.source}</p>
          </div>
          {invoice.poReferenceId && (
            <div className="space-y-1">
              <span className="text-zinc-500">PO Reference</span>
              <p className="font-mono text-xs text-white">{invoice.poReferenceId}</p>
            </div>
          )}
          {invoice.paymentTerms && (
            <div className="space-y-1">
              <span className="text-zinc-500">Payment Terms</span>
              <p className="text-white">{invoice.paymentTerms}</p>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-zinc-500">Subtotal</span>
              <p className="text-sm font-semibold text-white">{formatCurrency(invoice.subtotal, invoice.currency)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500">Tax</span>
              <p className="text-sm font-semibold text-white">{formatCurrency(invoice.taxAmount, invoice.currency)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500">Total</span>
              <p className="text-sm font-semibold text-white">{formatCurrency(invoice.totalWithTax, invoice.currency)}</p>
            </div>
          </div>
          {(invoice.amountPaid > 0 || invoice.balanceDue > 0) && (
            <div className="mt-3 flex items-center justify-between rounded-md bg-white/[0.03] px-4 py-2.5">
              <div className="space-y-0.5">
                <span className="text-xs text-zinc-500">Amount Paid</span>
                <p className="text-sm text-zinc-300">{formatCurrency(invoice.amountPaid, invoice.currency)}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-xs text-zinc-500">Balance Due</span>
                <p className={`text-sm font-semibold ${invoice.balanceDue > 0 ? "text-amber-300" : "text-emerald-300"}`}>
                  {formatCurrency(invoice.balanceDue, invoice.currency)}
                </p>
              </div>
            </div>
          )}
        </div>

        {invoice.description && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <span className="text-xs text-zinc-500">Description</span>
            <p className="mt-1 text-sm text-zinc-300">{invoice.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
