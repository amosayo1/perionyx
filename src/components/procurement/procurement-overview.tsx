"use client";

import { Building2, ShoppingCart, FileText, Package, FileSignature, DollarSign, Clock, AlertTriangle, Ban } from "lucide-react";
import type { ProcurementOverviewMetrics } from "./procurement-types";

interface ProcurementOverviewProps {
  metrics: ProcurementOverviewMetrics;
}

const cardConfig = [
  { key: "totalVendors", title: "Total Vendors", icon: <Building2 className="h-4 w-4" />, status: undefined as "good" | "warning" | "critical" | undefined },
  { key: "activeVendors", title: "Active Vendors", icon: <Building2 className="h-4 w-4" />, status: undefined as "good" | "warning" | "critical" | undefined },
  { key: "totalPOs", title: "Total POs", icon: <ShoppingCart className="h-4 w-4" />, status: undefined as "good" | "warning" | "critical" | undefined },
  { key: "openPOs", title: "Open POs", icon: <ShoppingCart className="h-4 w-4" />, status: "warning" as "good" | "warning" | "critical" },
  { key: "totalInvoices", title: "Total Invoices", icon: <FileText className="h-4 w-4" />, status: undefined as "good" | "warning" | "critical" | undefined },
  { key: "pendingInvoices", title: "Pending Invoices", icon: <FileText className="h-4 w-4" />, status: "warning" as "good" | "warning" | "critical" },
  { key: "totalReceipts", title: "Total Receipts", icon: <Package className="h-4 w-4" />, status: undefined as "good" | "warning" | "critical" | undefined },
  { key: "pendingReceipts", title: "Pending Receipts", icon: <Package className="h-4 w-4" />, status: "warning" as "good" | "warning" | "critical" },
  { key: "totalContracts", title: "Total Contracts", icon: <FileSignature className="h-4 w-4" />, status: undefined as "good" | "warning" | "critical" | undefined },
  { key: "activeContracts", title: "Active Contracts", icon: <FileSignature className="h-4 w-4" />, status: "good" as "good" | "warning" | "critical" },
  { key: "totalSpend", title: "Total Spend", icon: <DollarSign className="h-4 w-4" />, status: undefined as "good" | "warning" | "critical" | undefined },
  { key: "pendingApprovals", title: "Pending Approvals", icon: <Clock className="h-4 w-4" />, status: "warning" as "good" | "warning" | "critical" },
  { key: "matchExceptions", title: "Match Exceptions", icon: <AlertTriangle className="h-4 w-4" />, status: "critical" as "good" | "warning" | "critical" },
  { key: "blockedVendors", title: "Blocked Vendors", icon: <Ban className="h-4 w-4" />, status: "critical" as "good" | "warning" | "critical" },
];

export function ProcurementOverview({ metrics }: ProcurementOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {cardConfig.map(({ key, title, icon, status }) => {
        const value = metrics[key as keyof ProcurementOverviewMetrics];
        const formattedValue = typeof value === "number" ? value.toLocaleString() : String(value);
        return (
          <div key={key} className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400">{title}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{key === "totalSpend" ? `$${(Number(value) / 1e6).toFixed(1)}M` : formattedValue}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-gray-500">{icon}</div>
                {status && <div className={`h-2 w-2 rounded-full ${status === "critical" ? "bg-red-500" : status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
