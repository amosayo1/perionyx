"use client";

import { memo } from "react";
import { TrendingUp, BarChart3, Activity, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PerformanceData } from "./investment-types";

interface PerformanceChartsProps {
  performances: PerformanceData[];
  className?: string;
}

function formatPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export const PerformanceCharts = memo(function PerformanceCharts({ performances, className }: PerformanceChartsProps) {
  const sorted = [...performances].sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const yearly = performances.find((p) => p.period === "yearly");
  const inception = performances.find((p) => p.period === "since-inception");

  const chartData = sorted.map((p) => ({
    label: p.period === "since-inception" ? "Inception" : p.period.charAt(0).toUpperCase() + p.period.slice(1),
    value: p.returnValue,
  }));

  const maxVal = Math.max(...chartData.map((d) => Math.abs(d.value)), 1);
  const barUnit = 80 / maxVal;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Yearly Return</p>
              <p className={cn("text-lg font-bold", (yearly?.returnValue ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                {yearly ? formatPct(yearly.returnValue) : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-purple-500/20 bg-purple-500/10">
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Since Inception</p>
              <p className={cn("text-lg font-bold", (inception?.returnValue ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                {inception ? formatPct(inception.returnValue) : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10">
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Sharpe Ratio</p>
              <p className="text-lg font-bold text-white">{yearly?.sharpeRatio != null ? yearly.sharpeRatio.toFixed(2) : "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-[#d4af37]" />
          <h3 className="text-sm font-semibold text-white">Performance by Period</h3>
        </div>
        <div className="flex items-end gap-3">
          {chartData.map((d) => {
            const height = Math.max(Math.abs(d.value) * barUnit, 2);
            const isPositive = d.value >= 0;
            return (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <span className={cn("text-[11px] font-medium", isPositive ? "text-emerald-400" : "text-red-400")}>
                  {d.value >= 0 ? "+" : ""}{d.value.toFixed(1)}%
                </span>
                <div className="relative flex w-full items-end justify-center" style={{ height: "100px" }}>
                  <div
                    className={cn("absolute w-full max-w-[32px] rounded-t", isPositive ? "bg-emerald-500/60" : "bg-red-500/60")}
                    style={{ height: `${height}px`, bottom: isPositive ? "50%" : "auto", top: isPositive ? "auto" : "50%" }}
                  />
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-700/50" />
                </div>
                <span className="text-[10px] text-zinc-600">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {yearly && (
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <p className="text-[11px] text-zinc-500">Alpha</p>
            <p className={cn("text-sm font-bold", (yearly.alpha ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
              {yearly.alpha != null ? formatPct(yearly.alpha) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <p className="text-[11px] text-zinc-500">Beta</p>
            <p className="text-sm font-bold text-white">{yearly.beta != null ? yearly.beta.toFixed(2) : "—"}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <p className="text-[11px] text-zinc-500">Sortino</p>
            <p className="text-sm font-bold text-white">{yearly.sortinoRatio != null ? yearly.sortinoRatio.toFixed(2) : "—"}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <p className="text-[11px] text-zinc-500">Tracking Error</p>
            <p className="text-sm font-bold text-white">{yearly.trackingError != null ? `${yearly.trackingError.toFixed(2)}%` : "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
});
