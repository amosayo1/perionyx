"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import { MOCK_COLLECTIONS } from "./data";
import type { Collection } from "./types";

interface IncomingCollectionsTableProps {
  className?: string;
}

const STATUS_STYLES: Record<Collection["status"], string> = {
  expected: "bg-blue-500/10 text-blue-400",
  received: "bg-green-500/10 text-green-400",
  overdue: "bg-red-500/10 text-red-400",
  short: "bg-amber-500/10 text-amber-400",
  disputed: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-500/10 text-zinc-400",
};

const METHOD_STYLES: Record<Collection["method"], string> = {
  wire: "bg-zinc-800 text-zinc-300",
  ach: "bg-zinc-800 text-zinc-300",
  sepa_direct: "bg-zinc-800 text-zinc-300",
  rtp: "bg-zinc-800 text-zinc-300",
  card: "bg-zinc-800 text-zinc-300",
  direct_debit: "bg-zinc-800 text-zinc-300",
  check: "bg-zinc-800 text-zinc-300",
  cash: "bg-zinc-800 text-zinc-300",
};

const RISK_STYLES: Record<Collection["risk"], string> = {
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

function methodLabel(method: Collection["method"]): string {
  return method.replace(/_/g, " ");
}

export function IncomingCollectionsTable({ className }: IncomingCollectionsTableProps) {
  const [showAll, setShowAll] = useState(false);

  const sorted = [...MOCK_COLLECTIONS].sort(
    (a, b) => new Date(b.expectedDate).getTime() - new Date(a.expectedDate).getTime(),
  );

  const displayed = showAll ? sorted : sorted.slice(0, PAGE_SIZE);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <h3 className="text-sm font-medium text-white">Incoming Collections</h3>
          <p className="text-[12px] text-zinc-500">{MOCK_COLLECTIONS.length} total collections</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Export collections"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Incoming collections">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Collection ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Currency</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Expected</th>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Variance</th>
              <th className="px-4 py-3 text-center font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((col) => (
              <tr
                key={col.id}
                className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30"
              >
                <td className="px-4 py-3 font-medium text-white">{col.id}</td>
                <td className="px-4 py-3 text-zinc-300">{col.customer}</td>
                <td className="px-4 py-3 text-zinc-300">{col.entity}</td>
                <td className="px-4 py-3 font-medium text-zinc-200">{col.currency}</td>
                <td className="px-4 py-3 text-right font-medium text-white">{formatCurrency(col.amount)}</td>
                <td className="px-4 py-3 text-zinc-400">{formatDate(col.expectedDate)}</td>
                <td className="px-4 py-3 text-zinc-400">{formatDate(col.receivedDate)}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", METHOD_STYLES[col.method])}>
                    {methodLabel(col.method)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[col.status])}>
                    {col.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {col.status === "received" || col.status === "short" ? (
                    <span className={cn(
                      "text-[12px] font-medium",
                      col.variance >= 0 ? "text-emerald-400" : "text-red-400",
                    )}>
                      {col.variance >= 0 ? "+" : ""}
                      {formatCurrency(Math.abs(col.variance))}
                      <span className="text-zinc-500"> ({col.variancePercent >= 0 ? "+" : ""}{col.variancePercent.toFixed(1)}%)</span>
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", RISK_STYLES[col.risk])}>
                    {col.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && MOCK_COLLECTIONS.length > PAGE_SIZE && (
        <div className="border-t border-white/[0.06] px-5 py-3 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            aria-label={`View all ${MOCK_COLLECTIONS.length} collections`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            View All ({MOCK_COLLECTIONS.length - PAGE_SIZE} more)
          </button>
        </div>
      )}
    </div>
  );
}
