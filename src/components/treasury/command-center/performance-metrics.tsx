"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_PERFORMANCE_METRICS } from "./data";



export function PerformanceMetrics({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Performance metrics">
      <h2 className="text-sm font-semibold text-white">Performance Metrics</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {MOCK_PERFORMANCE_METRICS.map((metric, i) => {
          const isUp = metric.direction === "up";
          const isPositive = isUp ? metric.current >= metric.previous : metric.current <= metric.previous;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4"
              role="article" aria-label={`Metric: ${metric.label}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{metric.label}</p>
                <span className={cn("flex items-center gap-0.5 text-xs font-medium", isPositive ? "text-emerald-400" : "text-red-400")}>
                  {isPositive ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
                  {metric.current.toFixed(1)}{metric.unit}
                </span>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                    <span>Current: {metric.current.toFixed(1)}{metric.unit}</span>
                    <span>Prev: {metric.previous.toFixed(1)}{metric.unit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", isPositive ? "bg-emerald-500" : "bg-red-500")}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5 text-[9px] text-zinc-600">
                    <span>0</span>
                    <span>Target: {metric.target}{metric.unit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
