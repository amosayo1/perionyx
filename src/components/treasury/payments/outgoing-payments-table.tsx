"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  ArrowUpDown, Eye, Download, AlertTriangle,
} from "lucide-react";
import { MOCK_PAYMENTS } from "./data";
import type { Payment } from "./types";

interface OutgoingPaymentsTableProps {
  className?: string;
}

const STATUS_STYLES: Record<Payment["status"], string> = {
  draft: "bg-zinc-500/10 text-zinc-400",
  pending_approval: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  queued: "bg-blue-500/10 text-blue-400",
  processing: "bg-blue-500/10 text-blue-400",
  settled: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-500/10 text-zinc-400",
};

const PRIORITY_STYLES: Record<Payment["priority"], string> = {
  urgent: "text-red-400",
  high: "text-amber-400",
  normal: "text-blue-400",
  low: "text-zinc-400",
};

const RISK_STYLES: Record<Payment["risk"], string> = {
  low: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-red-500/10 text-red-400",
};

const PAGE_SIZE = 15;

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function OutgoingPaymentsTable({ className }: OutgoingPaymentsTableProps) {
  const [showAll, setShowAll] = useState(false);

  const sorted = [...MOCK_PAYMENTS].sort(
    (a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime(),
  );

  const displayed = showAll ? sorted : sorted.slice(0, PAGE_SIZE);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <h3 className="text-sm font-medium text-white">Outgoing Payments</h3>
          <p className="text-[12px] text-zinc-500">{MOCK_PAYMENTS.length} total payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="Export payments"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Outgoing payments">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Payment ID</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Counterparty</th>
              <th className="px-4 py-3 font-medium">Bank</th>
              <th className="px-4 py-3 font-medium">Currency</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Rail</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Requested</th>
              <th className="px-4 py-3 font-medium">Execution</th>
              <th className="px-4 py-3 font-medium">Settlement</th>
              <th className="px-4 py-3 font-medium">Approver</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Risk</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30"
              >
                <td className="px-4 py-3 font-medium text-white">{payment.id}</td>
                <td className="px-4 py-3 text-zinc-300">{payment.entity}</td>
                <td className="px-4 py-3 text-zinc-300">{payment.counterparty}</td>
                <td className="px-4 py-3 text-zinc-300">{payment.bank}</td>
                <td className="px-4 py-3 font-medium text-zinc-200">{payment.currency}</td>
                <td className="px-4 py-3 text-right font-medium text-white">{formatCurrency(payment.amount)}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] font-medium text-zinc-300">
                    {payment.paymentType}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{payment.rail}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-[11px] font-medium uppercase", PRIORITY_STYLES[payment.priority])}>
                    {payment.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{formatDate(payment.requestedDate)}</td>
                <td className="px-4 py-3 text-zinc-400">{formatDate(payment.executionDate)}</td>
                <td className="px-4 py-3 text-zinc-400">{formatDate(payment.settlementDate)}</td>
                <td className="px-4 py-3 text-zinc-400">{payment.approvedBy || "—"}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[payment.status])}>
                    {payment.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", RISK_STYLES[payment.risk])}>
                    {payment.risk}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                      aria-label={`View payment ${payment.id}`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {payment.status === "failed" && (
                      <button
                        type="button"
                        className="rounded p-1 text-red-400 transition-colors hover:bg-red-500/10"
                        aria-label={`Alert for payment ${payment.id}`}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && MOCK_PAYMENTS.length > PAGE_SIZE && (
        <div className="border-t border-white/[0.06] px-5 py-3 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            aria-label={`View all ${MOCK_PAYMENTS.length} payments`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            View All ({MOCK_PAYMENTS.length - PAGE_SIZE} more)
          </button>
        </div>
      )}
    </div>
  );
}
