"use client";

import { TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, Wallet, Clock, Landmark } from "lucide-react";

interface ExecutiveRevenueHeaderProps {
  totalRevenue: number;
  openAR: number;
  overdueAR: number;
  dso: number;
  cashCollected: number;
}

export function ExecutiveRevenueHeader({ totalRevenue, openAR, overdueAR, dso, cashCollected }: ExecutiveRevenueHeaderProps) {
  const items = [
    { label: "Total Revenue", value: `$${(totalRevenue / 1e6).toFixed(1)}M`, trend: totalRevenue >= 0 ? "up" : "down", color: "text-emerald-400", icon: <DollarSign className="h-4 w-4" />, },
    { label: "Open AR", value: `$${(openAR / 1e6).toFixed(1)}M`, trend: openAR > 10e6 ? "up" : "stable", color: openAR > 10e6 ? "text-amber-400" : "text-gray-400", icon: <Wallet className="h-4 w-4" />, },
    { label: "Overdue AR", value: `$${(overdueAR / 1e6).toFixed(1)}M`, trend: overdueAR > 5e6 ? "up" : "down", color: overdueAR > 5e6 ? "text-red-400" : "text-emerald-400", icon: <Clock className="h-4 w-4" />, },
    { label: "DSO", value: `${dso.toFixed(1)}d`, trend: dso <= 45 ? "up" : dso <= 60 ? "stable" : "down", color: dso <= 45 ? "text-emerald-400" : dso <= 60 ? "text-amber-400" : "text-red-400", icon: <BarChart3 className="h-4 w-4" />, },
    { label: "Cash Collected", value: `$${(cashCollected / 1e6).toFixed(1)}M`, trend: cashCollected > 0 ? "up" : "down", color: "text-emerald-400", icon: <Landmark className="h-4 w-4" />, },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{item.label}</p>
            <div className={item.color}>{item.icon}</div>
          </div>
          <p className={`mt-1 text-xl font-semibold ${item.color}`}>{item.value}</p>
          <div className="mt-1 flex items-center gap-1">
            {item.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : item.trend === "down" ? <TrendingDown className="h-3 w-3 text-red-400" /> : <Minus className="h-3 w-3 text-gray-400" />}
            <span className="text-[10px] capitalize text-gray-500">{item.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
