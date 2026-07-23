"use client";

import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

interface ExecutiveAccountingHeaderProps {
  netIncome: number;
  grossMargin: number;
  workingCapital: number;
  currentRatio: number;
}

export function ExecutiveAccountingHeader({ netIncome, grossMargin, workingCapital, currentRatio }: ExecutiveAccountingHeaderProps) {
  const items = [
    {
      label: "Net Income",
      value: `$${(netIncome / 1e6).toFixed(1)}M`,
      trend: netIncome >= 0 ? "up" : "down",
      color: netIncome >= 0 ? "text-emerald-400" : "text-red-400",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: "Gross Margin",
      value: `${grossMargin.toFixed(1)}%`,
      trend: grossMargin >= 40 ? "up" : grossMargin >= 20 ? "stable" : "down",
      color: grossMargin >= 40 ? "text-emerald-400" : grossMargin >= 20 ? "text-amber-400" : "text-red-400",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Working Capital",
      value: `$${(workingCapital / 1e6).toFixed(1)}M`,
      trend: workingCapital >= 0 ? "up" : "down",
      color: workingCapital >= 0 ? "text-emerald-400" : "text-red-400",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: "Current Ratio",
      value: currentRatio.toFixed(2),
      trend: currentRatio >= 1.5 ? "up" : currentRatio >= 1 ? "stable" : "down",
      color: currentRatio >= 1.5 ? "text-emerald-400" : currentRatio >= 1 ? "text-amber-400" : "text-red-400",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{item.label}</p>
            <div className={item.color}>{item.icon}</div>
          </div>
          <p className={`mt-1 text-xl font-semibold ${item.color}`}>{item.value}</p>
          <div className="mt-1 flex items-center gap-1">
            {item.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : item.trend === "down" ? <TrendingDown className="h-3 w-3 text-red-400" /> : <BarChart3 className="h-3 w-3 text-gray-400" />}
            <span className="text-[10px] capitalize text-gray-500">{item.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
