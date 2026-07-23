"use client";

import { ShoppingCart, Clock, CheckCircle, Ban, Package, Truck } from "lucide-react";
import type { PurchaseOrder } from "./procurement-types";

interface PurchaseOrderGridProps {
  orders: PurchaseOrder[];
}

const statusStyles: Record<string, { badge: string; icon: React.ReactNode }> = {
  draft: { badge: "bg-gray-800 text-gray-400 border-gray-700", icon: <ShoppingCart className="h-3 w-3" /> },
  approved: { badge: "bg-blue-950/50 text-blue-400 border-blue-900/50", icon: <CheckCircle className="h-3 w-3" /> },
  sent: { badge: "bg-indigo-950/50 text-indigo-400 border-indigo-900/50", icon: <Truck className="h-3 w-3" /> },
  acknowledged: { badge: "bg-purple-950/50 text-purple-400 border-purple-900/50", icon: <CheckCircle className="h-3 w-3" /> },
  "partially-received": { badge: "bg-amber-950/50 text-amber-400 border-amber-900/50", icon: <Package className="h-3 w-3" /> },
  "fully-received": { badge: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50", icon: <CheckCircle className="h-3 w-3" /> },
  closed: { badge: "bg-gray-800 text-gray-400 border-gray-700", icon: <Ban className="h-3 w-3" /> },
  cancelled: { badge: "bg-red-950/50 text-red-400 border-red-900/50", icon: <Ban className="h-3 w-3" /> },
};

export function PurchaseOrderGrid({ orders }: PurchaseOrderGridProps) {
  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-8">
        <p className="text-sm text-gray-500">No purchase orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-800 bg-[#1a1a1a]">
          <tr className="text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">PO Number</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium text-right">Total Amount</th>
            <th className="px-4 py-3 font-medium">Received %</th>
            <th className="px-4 py-3 font-medium">Expected Delivery</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
          {orders.map((po) => {
            const style = statusStyles[po.status] || statusStyles.draft;
            const receivedColor = po.receivedPercent >= 100 ? "text-emerald-400" : po.receivedPercent > 0 ? "text-amber-400" : "text-gray-400";
            const barColor = po.receivedPercent >= 100 ? "bg-emerald-500" : po.receivedPercent > 0 ? "bg-amber-500" : "bg-gray-700";
            return (
              <tr key={po.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{po.poNumber}</td>
                <td className="px-4 py-3 text-xs text-gray-400 capitalize">{po.type}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                    {style.icon} {po.status.replace("-", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-300">{po.vendorName}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-200">${po.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-gray-800">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${Math.min(po.receivedPercent, 100)}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${receivedColor}`}>{po.receivedPercent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">{po.expectedDeliveryDate.toLocaleDateString()}</span>
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
