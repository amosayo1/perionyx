"use client";

import { TrendingUp, TrendingDown, DollarSign, Building2, ShoppingCart, FileText, AlertTriangle } from "lucide-react";

interface ExecutiveProcurementHeaderProps {
  totalSpend: number;
  activeVendors: number;
  openPOs: number;
  pendingInvoices: number;
  matchExceptions: number;
}

export function ExecutiveProcurementHeader({ totalSpend, activeVendors, openPOs, pendingInvoices, matchExceptions }: ExecutiveProcurementHeaderProps) {
  const items = [
    {
      label: "Total Spend",
      value: `$${(totalSpend / 1e6).toFixed(1)}M`,
      trend: totalSpend >= 0 ? "up" : "down",
      color: "text-emerald-400",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: "Active Vendors",
      value: activeVendors.toLocaleString(),
      trend: activeVendors >= 100 ? "up" : "stable",
      color: "text-emerald-400",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      label: "Open POs",
      value: openPOs.toLocaleString(),
      trend: openPOs > 50 ? "stable" : "down",
      color: openPOs > 100 ? "text-amber-400" : "text-emerald-400",
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      label: "Pending Invoices",
      value: pendingInvoices.toLocaleString(),
      trend: pendingInvoices > 20 ? "down" : "stable",
      color: pendingInvoices > 50 ? "text-amber-400" : "text-emerald-400",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Match Exceptions",
      value: matchExceptions.toLocaleString(),
      trend: matchExceptions > 0 ? "up" : "down",
      color: matchExceptions > 10 ? "text-red-400" : matchExceptions > 0 ? "text-amber-400" : "text-emerald-400",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{item.label}</p>
            <div className={item.color}>{item.icon}</div>
          </div>
          <p className={`mt-1 text-xl font-semibold ${item.color}`}>{item.value}</p>
          <div className="mt-1 flex items-center gap-1">
            {item.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : item.trend === "down" ? <TrendingDown className="h-3 w-3 text-red-400" /> : <TrendingUp className="h-3 w-3 text-gray-400" />}
            <span className="text-[10px] capitalize text-gray-500">{item.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
