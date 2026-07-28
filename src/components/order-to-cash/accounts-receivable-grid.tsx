"use client";

import type { ARRecord } from "./o2c-types";
import { Clock, DollarSign } from "lucide-react";

interface AccountsReceivableGridProps {
  records: ARRecord[];
  max?: number;
}

const bucketColors: Record<string, { text: string; bg: string }> = {
  current: { text: "text-emerald-400", bg: "bg-emerald-900/20" },
  "1-30": { text: "text-blue-400", bg: "bg-blue-900/20" },
  "31-60": { text: "text-amber-400", bg: "bg-amber-900/20" },
  "61-90": { text: "text-orange-400", bg: "bg-orange-900/20" },
  "90+": { text: "text-red-400", bg: "bg-red-900/20" },
};

const statusStyles: Record<string, string> = {
  open: "text-amber-400",
  partially_paid: "text-blue-400",
  paid: "text-emerald-400",
  overdue: "text-red-400",
  written_off: "text-gray-500",
};

function getDaysOverdue(dueDate: Date | string): number {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
}

export function AccountsReceivableGrid({ records, max = 20 }: AccountsReceivableGridProps) {
  const displayed = records.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a24]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Invoice</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Outstanding</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Days Overdue</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Aging Bucket</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((r) => {
            const daysOverdue = getDaysOverdue(r.dueDate);
            const bucket = r.agingBucket;
            const bucketColor = bucketColors[bucket] || bucketColors.current;
            return (
              <tr key={r.id} className={`hover:bg-gray-800/30 ${bucketColor.bg}`}>
                <td className="px-3 py-2 text-sm text-gray-200">{r.customerName}</td>
                <td className="px-3 py-2 text-xs font-medium text-gray-200">{r.invoiceNumber}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-200">${r.totalAmount.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-200">${r.amountOutstanding.toLocaleString()}</td>
                <td className="px-3 py-2 text-xs text-gray-400">{new Date(r.dueDate).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-xs text-gray-400">{daysOverdue > 0 ? `${daysOverdue}d` : "—"}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${bucketColor.text} ${bucketColor.bg}`}>
                    <Clock className="h-2.5 w-2.5" />
                    {bucket}
                  </span>
                </td>
                <td className="px-3 py-2"><span className={`text-xs font-medium ${statusStyles[r.status] || "text-gray-400"}`}>{r.status.replace(/_/g, " ")}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
