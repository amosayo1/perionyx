"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { KpiCard } from "./kpi-card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import type { FinancialScoreData, KPIValueData } from "@/modules/intelligence-platform/types";

interface TreasuryDetailProps {
  score: FinancialScoreData;
  kpis: KPIValueData[];
}

function LiquidityGauge({ value, label, sub }: { value: number; label: string; sub?: string }) {
  const color = value >= 2 ? "emerald" : value >= 1 ? "amber" : "red";
  const angle = Math.min(value / 4, 1) * 180;
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="60" viewBox="0 0 80 60">
        <path d="M10 50 A 30 30 0 0 1 70 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
        <motion.path
          d="M10 50 A 30 30 0 0 1 70 50"
          fill="none"
          stroke={color === "emerald" ? "#34d399" : color === "amber" ? "#f59e0b" : "#ef4444"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={Math.PI * 30}
          strokeDashoffset={Math.PI * 30 * (1 - angle / 180)}
          initial={{ strokeDashoffset: Math.PI * 30 }}
          animate={{ strokeDashoffset: Math.PI * 30 * (1 - angle / 180) }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="mt-1 text-xs text-zinc-500">{label}</span>
      <span className={cn("text-sm font-bold", color === "emerald" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : "text-red-400")}>
        {value.toFixed(1)}x
      </span>
      {sub && <span className="text-[10px] text-zinc-600">{sub}</span>}
    </div>
  );
}

export function TreasuryDetail({ score, kpis }: TreasuryDetailProps) {
  const cashKpi = kpis.find((k) => k.kpiKey === "cash_position" || k.label.toLowerCase().includes("cash position"));
  const liquidityKpi = kpis.find((k) => k.kpiKey === "liquidity_ratio" || k.label.toLowerCase().includes("liquidity"));
  const fxKpi = kpis.find((k) => k.kpiKey === "fx_exposure" || k.label.toLowerCase().includes("fx") || k.label.toLowerCase().includes("forex"));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10">
          <span className="text-2xl font-bold text-amber-400">{Math.round(score.score)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Treasury Health</h3>
          <p className="text-xs text-zinc-500">{score.summary ?? "Treasury position and liquidity overview"}</p>
        </div>
      </div>

      {cashKpi && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4"
        >
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span>Cash Position</span>
          </div>
          <p className="text-3xl font-bold text-white">
            ${cashKpi.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          {cashKpi.variance != null && (
            <div className={cn("flex items-center gap-1 text-xs mt-1", cashKpi.variance >= 0 ? "text-emerald-400" : "text-red-400")}>
              {cashKpi.variance >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{cashKpi.variance >= 0 ? "+" : ""}{cashKpi.variance.toFixed(1)}{cashKpi.unit ?? ""}</span>
            </div>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {liquidityKpi && (
          <LiquidityGauge value={liquidityKpi.currentValue} label="Liquidity" sub={`Target: ${liquidityKpi.targetValue?.toFixed(1) ?? "—"}x`} />
        )}
        {fxKpi && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <span className="mt-1 text-[10px] text-zinc-500">FX Exposure</span>
            <span className={cn("text-sm font-bold", fxKpi.status === "critical" ? "text-red-400" : fxKpi.status === "at_risk" ? "text-amber-400" : "text-emerald-400")}>
              {fxKpi.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}{fxKpi.unit ?? ""}
            </span>
          </div>
        )}
        <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <span className="text-[10px] text-zinc-500">Score</span>
          <span className="text-lg font-bold text-white">{Math.round(score.score)}</span>
        </div>
      </div>

      {kpis.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Treasury KPIs</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {kpis.slice(0, 6).map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
