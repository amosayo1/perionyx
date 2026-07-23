"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { KpiCard } from "./kpi-card";
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
import type { FinancialScoreData, KPIValueData } from "@/modules/intelligence-platform/types";

interface OperationalDetailProps {
  score: FinancialScoreData;
  kpis: KPIValueData[];
}

function BudgetGauge({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const color = pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-500">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>${used.toLocaleString()}</span>
        <span>${total.toLocaleString()}</span>
      </div>
    </div>
  );
}

export function OperationalDetail({ score, kpis }: OperationalDetailProps) {
  const revenueKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("revenue") || k.label.toLowerCase().includes("revenue"));
  const expenseKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("expense") || k.label.toLowerCase().includes("expense"));
  const profitKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("profit") || k.label.toLowerCase().includes("profitability"));

  const budgetData = useMemo(() => {
    if (score.metadata?.budgets && Array.isArray(score.metadata.budgets)) {
      return score.metadata.budgets as Array<{ label: string; used: number; total: number }>;
    }
    return [];
  }, [score]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10">
          <span className="text-2xl font-bold text-amber-400">{Math.round(score.score)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Operational Performance</h3>
          <p className="text-xs text-zinc-500">{score.summary ?? "Revenue, expenses, and budget utilization"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {revenueKpi && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
            <div className="flex items-center gap-1 text-xs text-emerald-400 mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Revenue</span>
            </div>
            <p className="text-xl font-bold text-white">
              ${revenueKpi.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            {revenueKpi.variancePercent != null && (
              <span className={cn("text-xs", revenueKpi.variancePercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                {revenueKpi.variancePercent >= 0 ? "+" : ""}{revenueKpi.variancePercent.toFixed(1)}%
              </span>
            )}
          </div>
        )}
        {expenseKpi && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/[0.03] p-3">
            <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>Expenses</span>
            </div>
            <p className="text-xl font-bold text-white">
              ${expenseKpi.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            {expenseKpi.variancePercent != null && (
              <span className={cn("text-xs", expenseKpi.variancePercent <= 0 ? "text-emerald-400" : "text-red-400")}>
                {expenseKpi.variancePercent >= 0 ? "+" : ""}{expenseKpi.variancePercent.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Budget Utilization</h4>
        {budgetData.length > 0 ? budgetData.slice(0, 5).map((b, i) => (
          <BudgetGauge key={i} label={b.label} used={b.used} total={b.total} />
        )) : (
          <p className="text-xs text-zinc-600">No budget data available.</p>
        )}
      </div>

      {profitKpi && (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-zinc-400">Profitability Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-base font-bold", profitKpi.status === "critical" ? "text-red-400" : profitKpi.status === "at_risk" ? "text-amber-400" : "text-emerald-400")}>
              {profitKpi.currentValue.toFixed(1)}{profitKpi.unit ?? ""}
            </span>
            {profitKpi.variancePercent != null && (
              <span className={cn("text-xs", profitKpi.variancePercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                {profitKpi.variancePercent >= 0 ? "+" : ""}{profitKpi.variancePercent.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {kpis.slice(0, 4).map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
