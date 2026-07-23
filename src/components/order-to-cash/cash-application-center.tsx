"use client";

import type { CashReceipt } from "./o2c-types";
import { Banknote, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface CashApplicationCenterProps {
  receipts: CashReceipt[];
  max?: number;
}

const statusStyles: Record<string, string> = {
  unapplied: "bg-amber-900/50 text-amber-300",
  partially_applied: "bg-blue-900/50 text-blue-300",
  applied: "bg-emerald-900/50 text-emerald-300",
  on_hold: "bg-red-900/50 text-red-300",
};

export function CashApplicationCenter({ receipts, max = 20 }: CashApplicationCenterProps) {
  const displayed = receipts.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Receipt #</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Applied</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Unapplied</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Method</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Received</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((r) => {
            const appliedPercent = r.amount > 0 ? (r.appliedAmount / r.amount) * 100 : 0;
            return (
              <tr key={r.id} className="hover:bg-gray-800/30">
                <td className="px-3 py-2 text-xs font-medium text-gray-200">{r.receiptNumber}</td>
                <td className="px-3 py-2 text-sm text-gray-200">{r.customerName}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-200">${r.amount.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-sm text-emerald-400">${r.appliedAmount.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-sm text-amber-400">${(r.amount - r.appliedAmount).toLocaleString()}</td>
                <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[r.status] || "bg-gray-700 text-gray-300"}`}>{r.status.replace(/_/g, " ")}</span></td>
                <td className="px-3 py-2 text-xs text-gray-400">{r.method}</td>
                <td className="px-3 py-2 text-xs text-gray-400">{new Date(r.receivedDate).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
