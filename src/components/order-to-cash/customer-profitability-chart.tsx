"use client";

import { TrendingUp, TrendingDown, Minus, DollarSign, Users, ShoppingCart, Calendar, Heart } from "lucide-react";

interface CustomerProfitability {
  id: string;
  customerName: string;
  revenue: number;
  orderCount: number;
  avgPaymentDays: number;
  lifetimeValue: number;
  profitabilityTrend: "up" | "down" | "stable";
}

interface CustomerProfitabilityChartProps {
  customers: CustomerProfitability[];
  max?: number;
}

export function CustomerProfitabilityChart({ customers, max = 15 }: CustomerProfitabilityChartProps) {
  const displayed = customers.slice(0, max);
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-200">Customer Profitability</h3>
      </div>
      <div className="space-y-2">
        {displayed.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-800 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">{c.customerName}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />{c.orderCount} orders</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{c.avgPaymentDays}d avg</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-sm text-gray-200">${(c.revenue / 1e3).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">LTV</p>
                <p className="text-sm font-medium text-emerald-400">${(c.lifetimeValue / 1e3).toFixed(0)}K</p>
              </div>
              <div className="flex items-center gap-1">
                {c.profitabilityTrend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : c.profitabilityTrend === "down" ? <TrendingDown className="h-4 w-4 text-red-400" /> : <Minus className="h-4 w-4 text-gray-400" />}
                <span className="text-[10px] capitalize text-gray-500">{c.profitabilityTrend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
