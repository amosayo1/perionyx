"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { KpiCard } from "./kpi-card";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import type { FinancialScoreData, KPIValueData } from "@/modules/intelligence-platform/types";

interface WorkingCapitalDetailProps {
  score: FinancialScoreData;
  kpis: KPIValueData[];
}

function MetricGauge({ value, unit, label, target, status }: { value: number; unit?: string; label: string; target?: number; status?: string }) {
  const maxVal = target ? target * 2 : value * 2;
  const pct = Math.min((value / maxVal) * 100, 100);
  const color = status === "critical" ? "text-red-400" : status === "at_risk" ? "text-amber-400" : "text-emerald-400";
  const barColor = status === "critical" ? "bg-red-500" : status === "at_risk" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex flex-col items-center rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
      <span className="text-[10px] text-zinc-500">{label}</span>
      <span className={cn("text-lg font-bold", color)}>
        {value.toFixed(1)}{unit ?? ""}
      </span>
      {target && <span className="text-[10px] text-zinc-600">Target: {target.toFixed(1)}{unit ?? ""}</span>}
      <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800">
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

function TrendIndicator({ value, direction }: { value?: number; direction?: string }) {
  if (value === undefined) return null;
  const color = direction === "up" ? "text-emerald-400" : direction === "down" ? "text-red-400" : "text-zinc-400";
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  return (
    <div className={cn("flex items-center gap-0.5 text-xs", color)}>
      <Icon className="h-3 w-3" />
      <span>{value > 0 ? "+" : ""}{value.toFixed(1)}</span>
    </div>
  );
}

export function WorkingCapitalDetail({ score, kpis }: WorkingCapitalDetailProps) {
  const dsoKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("dso") || k.label.toLowerCase().includes("dso"));
  const dpoKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("dpo") || k.label.toLowerCase().includes("dpo"));
  const cccKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("ccc") || k.label.toLowerCase().includes("ccc") || k.label.toLowerCase().includes("cash conversion"));
  const wcRatio = kpis.find((k) => k.kpiKey?.toLowerCase().includes("working_capital") || k.label.toLowerCase().includes("working capital ratio"));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10">
          <span className="text-2xl font-bold text-amber-400">{Math.round(score.score)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Working Capital</h3>
          <p className="text-xs text-zinc-500">{score.summary ?? "Working capital efficiency metrics"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {dsoKpi && (
          <MetricGauge
            value={dsoKpi.currentValue}
            unit="d"
            label="DSO"
            target={dsoKpi.targetValue}
            status={dsoKpi.status}
          />
        )}
        {dpoKpi && (
          <MetricGauge
            value={dpoKpi.currentValue}
            unit="d"
            label="DPO"
            target={dpoKpi.targetValue}
            status={dpoKpi.status}
          />
        )}
        {cccKpi && (
          <MetricGauge
            value={cccKpi.currentValue}
            unit="d"
            label="CCC"
            target={cccKpi.targetValue}
            status={cccKpi.status}
          />
        )}
      </div>

      {wcRatio && (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 px-4 py-3">
          <span className="text-xs text-zinc-400">Working Capital Ratio</span>
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold", wcRatio.status === "critical" ? "text-red-400" : wcRatio.status === "at_risk" ? "text-amber-400" : "text-emerald-400")}>
              {wcRatio.currentValue.toFixed(2)}x
            </span>
            <TrendIndicator value={wcRatio.variance} direction={wcRatio.trend} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Recommendations</h4>
        {score.metadata?.recommendations && Array.isArray(score.metadata.recommendations) ? (
          (score.metadata.recommendations as string[]).map((r: string, i: number) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <p className="text-xs text-zinc-400">{r}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-600">No specific recommendations at this time.</p>
        )}
      </div>

      {kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {kpis.slice(0, 4).map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}
