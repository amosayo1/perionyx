"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";
import { TrendLineChart, BarChart } from "./charts";

interface Zone7Props {
  revenueData?: { label: string; value: number }[];
  cashData?: { label: string; value: number }[];
  expenseData?: { label: string; value: number }[];
  approvalVelocity?: number;
  monthEndProgress?: number;
  forecastAccuracy?: number;
  className?: string;
}

export const Zone7StrategicAnalytics = memo(function Zone7StrategicAnalytics({
  revenueData,
  cashData,
  expenseData,
  approvalVelocity = 0,
  monthEndProgress = 0,
  forecastAccuracy = 0,
  className,
}: Zone7Props) {
  const defaultRevenue = revenueData ?? [
    { label: "Jan", value: 12.4 }, { label: "Feb", value: 13.1 }, { label: "Mar", value: 12.8 },
    { label: "Apr", value: 14.2 }, { label: "May", value: 15.0 }, { label: "Jun", value: 14.6 },
  ];

  const defaultCash = cashData ?? [
    { label: "Mon", value: 24.2 }, { label: "Tue", value: 24.8 }, { label: "Wed", value: 23.9 },
    { label: "Thu", value: 24.5 }, { label: "Fri", value: 25.1 }, { label: "Sat", value: 24.6 },
    { label: "Sun", value: 25.0 },
  ];

  const defaultExpenses = expenseData ?? [
    { label: "Ops", value: 4.2, color: "#ef4444" },
    { label: "Payroll", value: 5.6, color: "#f59e0b" },
    { label: "Tech", value: 2.8, color: "#3b82f6" },
    { label: "Mktg", value: 1.5, color: "#8b5cf6" },
    { label: "Other", value: 1.2, color: "#6b7280" },
  ];

  const statusMetrics = [
    { label: "Approval Velocity", value: `${approvalVelocity}h`, status: approvalVelocity < 4 ? "healthy" : approvalVelocity < 12 ? "warning" : "critical" },
    { label: "Month-End Progress", value: `${monthEndProgress}%`, status: monthEndProgress >= 80 ? "healthy" : monthEndProgress >= 50 ? "warning" : "critical" },
    { label: "Forecast Accuracy", value: `${forecastAccuracy}%`, status: forecastAccuracy >= 90 ? "healthy" : forecastAccuracy >= 70 ? "warning" : "critical" },
  ];

  return (
    <DashboardCard
      title="Strategic Analytics"
      description="Revenue, cash, expenses, and forecasting"
      size="two-thirds"
      className={className}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium text-zinc-500">Revenue Trend</p>
          </div>
          <TrendLineChart data={defaultRevenue} width={500} height={140} color="#22c55e" />
        </div>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-[11px] font-medium text-zinc-500">Expense Breakdown</p>
            <BarChart data={defaultExpenses} width={200} height={120} maxBarWidth={24} />
          </div>
          {statusMetrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2">
              <span className="text-[11px] text-zinc-500">{m.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-zinc-200">{m.value}</span>
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    m.status === "healthy" && "bg-emerald-500",
                    m.status === "warning" && "bg-amber-500",
                    m.status === "critical" && "bg-red-500",
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-medium text-zinc-500">Cash Position (7 days)</p>
          <TrendLineChart data={defaultCash} width={350} height={100} color="#d4a800" showGrid={false} minGridlines={2} />
        </div>
      </div>
    </DashboardCard>
  );
});
