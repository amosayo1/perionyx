"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toWorkQueueSlaLabel } from "@/modules/work-queue/status";
import type { WorkQueueItem } from "@/modules/work-queue/types";

const priorityConfig = {
  critical: { label: "Critical", dot: "bg-red-500", text: "text-red-400" },
  high: { label: "High", dot: "bg-amber-500", text: "text-amber-400" },
  medium: { label: "Medium", dot: "bg-blue-500", text: "text-blue-400" },
  low: { label: "Low", dot: "bg-zinc-500", text: "text-zinc-400" },
};

const slaConfig: Record<WorkQueueItem["slaStatus"], { dot: string; label: string; text: string }> = {
  "on-track": { dot: "bg-emerald-400", label: "On track", text: "text-emerald-400" },
  "at-risk": { dot: "bg-amber-400", label: "At risk", text: "text-amber-400" },
  breached: { dot: "bg-red-400", label: "Breached", text: "text-red-400" },
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface DashboardWorkQueueProps {
  items: WorkQueueItem[];
  totalCount: number;
  className?: string;
}

export const DashboardWorkQueue = memo(function DashboardWorkQueue({
  items,
  totalCount,
  className,
}: DashboardWorkQueueProps) {
  if (!items.length) {
    return (
      <div className={cn("rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5", className)}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-300">
            Work Queue
          </span>
          <span className="text-[11px] text-zinc-600">{totalCount} items</span>
        </div>
        <p className="mt-3 text-[13px] text-zinc-500">No pending items in the work queue.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-zinc-800/60 bg-zinc-900/30", className)}>
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3">
        <span className="inline-flex items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-300">
          Work Queue
        </span>
        <Link
          href="/work-queue"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-gold transition-colors hover:text-gold/80"
        >
          View All ({totalCount})
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/40">
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Priority</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Supplier</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Invoice</th>
              <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Amount</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">SLA</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const pc = priorityConfig[item.priority];
              const sla = slaConfig[item.slaStatus];
              return (
                <tr
                  key={item.id}
                  className="group border-b border-zinc-800/20 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3">
                    <span className={cn("flex items-center gap-1.5 text-[12px]", pc.text)}>
                      <Circle className={cn("h-1.5 w-1.5 fill-current", pc.dot.replace("bg-", ""))} />
                      {pc.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-zinc-300">{item.supplier}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/procurement/invoices/${item.id}`}
                      className="text-[13px] font-medium text-gold hover:underline"
                    >
                      {item.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-right text-[13px] font-medium tabular-nums text-zinc-200">
                    {formatCurrency(item.amount, item.currency)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("flex items-center gap-1.5 text-[12px]", sla.text)}>
                      <Circle className={cn("h-1.5 w-1.5 fill-current", sla.dot)} />
                      {toWorkQueueSlaLabel(item.slaStatus)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-400">
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
