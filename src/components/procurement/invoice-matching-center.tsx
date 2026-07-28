"use client";

import { FileText, CheckCircle, AlertTriangle, Clock, Building2, Calendar } from "lucide-react";
import type { Invoice } from "./procurement-types";

interface InvoiceMatchingCenterProps {
  invoices: Invoice[];
}

const matchStyles: Record<string, { badge: string; icon: React.ReactNode }> = {
  matched: { badge: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50", icon: <CheckCircle className="h-3 w-3" /> },
  exception: { badge: "bg-red-950/50 text-red-400 border-red-900/50", icon: <AlertTriangle className="h-3 w-3" /> },
  pending: { badge: "bg-amber-950/50 text-amber-400 border-amber-900/50", icon: <Clock className="h-3 w-3" /> },
  resolved: { badge: "bg-blue-950/50 text-blue-400 border-blue-900/50", icon: <CheckCircle className="h-3 w-3" /> },
};

const invStatusStyles: Record<string, string> = {
  draft: "bg-gray-800 text-gray-400 border-gray-700",
  submitted: "bg-blue-950/50 text-blue-400 border-blue-900/50",
  matched: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50",
  approved: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50",
  paid: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50",
  disputed: "bg-red-950/50 text-red-400 border-red-900/50",
  cancelled: "bg-gray-800 text-gray-500 border-gray-700",
};

export function InvoiceMatchingCenter({ invoices }: InvoiceMatchingCenterProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a24] p-8">
        <p className="text-sm text-gray-500">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-800 bg-[#1a1a24]">
          <tr className="text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">Invoice Number</th>
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium">PO Number</th>
            <th className="px-4 py-3 font-medium text-right">Total Amount</th>
            <th className="px-4 py-3 font-medium">Match Status</th>
            <th className="px-4 py-3 font-medium">Match Score</th>
            <th className="px-4 py-3 font-medium">Invoice Status</th>
            <th className="px-4 py-3 font-medium">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-[#1a1a24]">
          {invoices.map((inv) => {
            const matchStyle = matchStyles[inv.matchStatus] || matchStyles.pending;
            const invStatusStyle = invStatusStyles[inv.status] || invStatusStyles.draft;
            const scoreColor = inv.matchScore >= 95 ? "text-emerald-400" : inv.matchScore >= 80 ? "text-amber-400" : "text-red-400";
            const scoreBarColor = inv.matchScore >= 95 ? "bg-emerald-500" : inv.matchScore >= 80 ? "bg-amber-500" : "bg-red-500";
            return (
              <tr key={inv.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-300">{inv.vendorName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{inv.poNumber || "—"}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-200">${inv.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${matchStyle.badge}`}>
                    {matchStyle.icon} {inv.matchStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-12 rounded-full bg-gray-800">
                      <div className={`h-1.5 rounded-full ${scoreBarColor}`} style={{ width: `${inv.matchScore}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${scoreColor}`}>{inv.matchScore}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${invStatusStyle}`}>{inv.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">{inv.dueDate.toLocaleDateString()}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
