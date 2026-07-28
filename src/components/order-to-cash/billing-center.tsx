"use client";

import type { Invoice } from "./o2c-types";
import { FileText, Clock } from "lucide-react";

interface BillingCenterProps {
  invoices: Invoice[];
  max?: number;
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-700 text-gray-300",
  sent: "bg-blue-900/50 text-blue-300",
  paid: "bg-emerald-900/50 text-emerald-300",
  overdue: "bg-red-900/50 text-red-300",
  partial: "bg-amber-900/50 text-amber-300",
  cancelled: "bg-gray-800 text-gray-500",
  credit_note: "bg-violet-900/50 text-violet-300",
};

const arStatusStyles: Record<string, string> = {
  current: "text-emerald-400",
  due: "text-amber-400",
  overdue: "text-red-400",
  paid: "text-emerald-400",
  written_off: "text-gray-500",
};

function getDaysOverdue(dueDate: Date | string): number {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
}

export function BillingCenter({ invoices, max = 20 }: BillingCenterProps) {
  const displayed = invoices.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a24]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Invoice #</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">AR Status</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Days Overdue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((inv) => {
            const daysOverdue = getDaysOverdue(inv.dueDate);
            return (
              <tr key={inv.id} className="hover:bg-gray-800/30">
                <td className="px-3 py-2 text-xs font-medium text-gray-200">{inv.invoiceNumber}</td>
                <td className="px-3 py-2 text-sm text-gray-200">{inv.customerName}</td>
                <td className="px-3 py-2 text-xs capitalize text-gray-400">{inv.billingType}</td>
                <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[inv.status] || "bg-gray-700 text-gray-300"}`}>{inv.status.replace(/_/g, " ")}</span></td>
                <td className="px-3 py-2"><span className={`text-xs ${arStatusStyles[inv.arStatus] || "text-gray-400"}`}>{inv.arStatus}</span></td>
                <td className="px-3 py-2 text-right text-sm text-gray-200">${inv.totalAmount.toLocaleString()}</td>
                <td className="px-3 py-2 text-xs text-gray-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  {daysOverdue > 0 ? (
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      daysOverdue > 90 ? "bg-red-900/50 text-red-300" : daysOverdue > 60 ? "bg-red-900/30 text-red-300" : daysOverdue > 30 ? "bg-amber-900/50 text-amber-300" : "bg-amber-900/30 text-amber-300"
                    }`}>
                      <Clock className="h-2.5 w-2.5" />
                      {daysOverdue}d
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">Current</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
