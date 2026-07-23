"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  DollarSign,
  Droplets,
  Activity,
  Briefcase,
  Shield,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Landmark,
  ShieldCheck,
  Globe,
  CircleDollarSign,
  ArrowUpDown,
  ArrowRight,
  FileDown,
  Printer,
  TrendingDown,
} from "lucide-react";
import { MOCK_TREASURY_HEALTH, MOCK_EXECUTIVE_KPIS } from "./data";
import type { ExecutiveKPI } from "./types";

const KPI_ICONS: Record<string, React.ElementType> = {
  DollarSign,
  Droplets,
  Activity,
  Briefcase,
  Shield,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Landmark,
  ShieldCheck,
  Globe,
  CircleDollarSign,
  ArrowUpDown,
};

function formatCurrency(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function statusColor(status: ExecutiveKPI["status"]): string {
  switch (status) {
    case "healthy": return "text-emerald-400";
    case "warning": return "text-amber-400";
    case "critical": return "text-red-400";
  }
}

function statusBadgeBg(status: ExecutiveKPI["status"]): string {
  switch (status) {
    case "healthy": return "bg-emerald-500/10 border-emerald-500/20";
    case "warning": return "bg-amber-500/10 border-amber-500/20";
    case "critical": return "bg-red-500/10 border-red-500/20";
  }
}

function HealthScoreRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center" role="figure" aria-label={`Treasury Health Score: ${score} out of 100, ${label}`}>
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="70" cy="70" r="54" fill="none" stroke="#c9a84c" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-[#c9a84c]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mt-0.5">{label}</span>
        </div>
      </div>
      <span className="mt-2 text-[13px] font-medium text-[#c9a84c]">{label}</span>
    </div>
  );
}

function KpiCard({ kpi, index }: { kpi: ExecutiveKPI; index: number }) {
  const Icon = KPI_ICONS[kpi.icon] || Activity;
  const isDown = kpi.direction === "down";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 hover:border-zinc-600 transition-colors", statusBadgeBg(kpi.status))}
      role="article" aria-label={`KPI: ${kpi.label}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={cn("flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border", statusBadgeBg(kpi.status))}>
          {Icon && <Icon className={cn("h-3 w-3", statusColor(kpi.status))} aria-hidden="true" />}
          <span className={statusColor(kpi.status)}>{kpi.status}</span>
        </div>
        <span className={cn("flex items-center gap-0.5 text-xs font-medium", isDown ? "text-red-400" : "text-emerald-400")}>
          {isDown ? <TrendingDown className="h-3 w-3" aria-hidden="true" /> : <TrendingUp className="h-3 w-3" aria-hidden="true" />}
          {kpi.changePercent >= 0 ? "+" : ""}{kpi.changePercent.toFixed(1)}%
        </span>
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{kpi.label}</p>
      <p className="mt-0.5 text-lg font-semibold text-white">{kpi.value}</p>
    </motion.div>
  );
}

export function ExecutiveHeader({ className }: { className?: string }) {
  const health = MOCK_TREASURY_HEALTH;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Treasury Command Center</h1>
          <p className="mt-1 text-[13px] text-zinc-400">Enterprise Treasury Mission Control</p>
        </div>
        <HealthScoreRing score={health.overall} label={health.label} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" role="list" aria-label="Executive KPIs">
        {MOCK_EXECUTIVE_KPIS.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-4 py-2.5 text-[13px] font-medium text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/20" aria-label="View Full Cash Position">
          View Full Cash Position
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white" aria-label="Open Liquidity Center">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Open Liquidity Center
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white" aria-label="Export Snapshot">
          <FileDown className="h-4 w-4" aria-hidden="true" />
          Export Snapshot
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white" aria-label="Print Dashboard">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print Dashboard
        </button>
      </div>
    </div>
  );
}
