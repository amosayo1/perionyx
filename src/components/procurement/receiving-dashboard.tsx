"use client";

import { Package, Wrench, Calendar, Building2 } from "lucide-react";
import type { Receipt } from "./procurement-types";

interface ReceivingDashboardProps {
  receipts: Receipt[];
}

const statusStyles: Record<string, string> = {
  pending: "bg-gray-800 text-gray-400 border-gray-700",
  partial: "bg-amber-950/50 text-amber-400 border-amber-900/50",
  complete: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50",
  cancelled: "bg-red-950/50 text-red-400 border-red-900/50",
};

export function ReceivingDashboard({ receipts }: ReceivingDashboardProps) {
  if (receipts.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-8">
        <p className="text-sm text-gray-500">No receipts found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-800 bg-[#1a1a1a]">
          <tr className="text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">Receipt Number</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">PO Number</th>
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium">Received Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Items</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
          {receipts.map((receipt) => (
            <tr key={receipt.id} className="hover:bg-gray-800/50">
              <td className="px-4 py-3 font-mono text-xs text-gray-400">{receipt.receiptNumber}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${receipt.type === "goods" ? "border-blue-900/50 bg-blue-950/50 text-blue-400" : "border-purple-900/50 bg-purple-950/50 text-purple-400"}`}>
                  {receipt.type === "goods" ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                  {receipt.type}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">{receipt.poNumber}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-300">{receipt.vendorName}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-400">{receipt.receivedDate.toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyles[receipt.status] || statusStyles.pending}`}>
                  {receipt.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-xs text-gray-400">{receipt.items.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
