"use client";

import type { SalesOrder } from "./o2c-types";
import { Package, Truck, User } from "lucide-react";

interface SalesOrderBoardProps {
  orders: SalesOrder[];
  max?: number;
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-700 text-gray-300",
  confirmed: "bg-blue-900/50 text-blue-300",
  fulfilled: "bg-emerald-900/50 text-emerald-300",
  partially_fulfilled: "bg-amber-900/50 text-amber-300",
  invoiced: "bg-violet-900/50 text-violet-300",
  cancelled: "bg-red-900/50 text-red-300",
};

export function SalesOrderBoard({ orders, max = 20 }: SalesOrderBoardProps) {
  const displayed = orders.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Order #</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Fulfillment</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Delivery</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sales Rep</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((o) => (
            <tr key={o.id} className="hover:bg-gray-800/30">
              <td className="px-3 py-2 text-xs font-medium text-gray-200">{o.orderNumber}</td>
              <td className="px-3 py-2 text-sm text-gray-200">{o.customerName}</td>
              <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[o.status] || "bg-gray-700 text-gray-300"}`}>{o.status.replace(/_/g, " ")}</span></td>
              <td className="px-3 py-2 text-xs capitalize text-gray-400">{o.type}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${o.totalAmount.toLocaleString()}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-700">
                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${o.fulfillmentPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{o.fulfillmentPercent}%</span>
                </div>
              </td>
              <td className="px-3 py-2 text-xs text-gray-400">{o.promisedDeliveryDate ? new Date(o.promisedDeliveryDate).toLocaleDateString() : "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-400">{o.salesRep || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
