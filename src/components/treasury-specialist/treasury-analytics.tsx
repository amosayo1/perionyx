"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, RefreshCw, Activity,
  DollarSign, Target, ArrowUpRight, ArrowDownRight, PieChart,
} from "lucide-react";

interface AnalyticsMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

interface TrendData {
  period: string;
  cashPosition: number;
  liquidityScore: number;
  fxExposure: number;
  riskScore: number;
}

interface KPI {
  label: string;
  value: string;
  target: string;
  status: "on-track" | "at-risk" | "behind";
  progress: number;
}

export function TreasuryAnalytics() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        await fetch("/api/treasury/analytics").then((r) => r.ok ? r.json() : null);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const metrics: AnalyticsMetric[] = [
    { label: "Cash Position", value: "$2.85B", change: 2.3, changeLabel: "vs last month", icon: "dollar", color: "text-gold-500" },
    { label: "Liquidity Score", value: "82%", change: 3, changeLabel: "vs last month", icon: "activity", color: "text-blue-400" },
    { label: "FX Exposure", value: "$412M", change: -5.2, changeLabel: "vs last month", icon: "trending", color: "text-purple-400" },
    { label: "Risk Score", value: "35%", change: -8, changeLabel: "improved", icon: "target", color: "text-emerald-400" },
    { label: "Portfolio Yield", value: "4.85%", change: 0.15, changeLabel: "bps improvement", icon: "chart", color: "text-cyan-400" },
    { label: "Forecast Accuracy", value: "94.2%", change: 1.1, changeLabel: "vs last quarter", icon: "activity", color: "text-emerald-400" },
  ];

  const trends: TrendData[] = [
    { period: "Jan", cashPosition: 2450, liquidityScore: 75, fxExposure: 480, riskScore: 42 },
    { period: "Feb", cashPosition: 2520, liquidityScore: 77, fxExposure: 465, riskScore: 40 },
    { period: "Mar", cashPosition: 2610, liquidityScore: 78, fxExposure: 445, riskScore: 38 },
    { period: "Apr", cashPosition: 2580, liquidityScore: 76, fxExposure: 430, riskScore: 40 },
    { period: "May", cashPosition: 2650, liquidityScore: 79, fxExposure: 425, riskScore: 37 },
    { period: "Jun", cashPosition: 2720, liquidityScore: 80, fxExposure: 418, riskScore: 36 },
    { period: "Jul", cashPosition: 2848, liquidityScore: 82, fxExposure: 412, riskScore: 35 },
  ];

  const kpis: KPI[] = [
    { label: "Cash Return on Invested Funds", value: "4.85%", target: "4.50%", status: "on-track", progress: 92 },
    { label: "Days Sales Outstanding", value: "32 days", target: "30 days", status: "at-risk", progress: 78 },
    { label: "Working Capital Ratio", value: "1.8x", target: "1.5x", status: "on-track", progress: 95 },
    { label: "Cash Conversion Cycle", value: "45 days", target: "42 days", status: "at-risk", progress: 82 },
    { label: "FX Hedge Effectiveness", value: "94%", target: "90%", status: "on-track", progress: 98 },
    { label: "Debt Service Coverage", value: "4.2x", target: "3.0x", status: "on-track", progress: 96 },
  ];

  const kpiColor = (s: string) => s === "on-track" ? "text-emerald-400" : s === "at-risk" ? "text-amber-400" : "text-red-400";
  const kpiBg = (s: string) => s === "on-track" ? "bg-emerald-500" : s === "at-risk" ? "bg-amber-500" : "bg-red-500";

  const maxCash = Math.max(...trends.map((t) => t.cashPosition));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Treasury Analytics</h1>
          <p className="text-sm text-white/60 mt-1">Key metrics, trends, and performance indicators</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">{m.label}</span>
              <span className={`text-xs flex items-center gap-1 ${m.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {m.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {m.change > 0 ? "+" : ""}{m.change}%
              </span>
            </div>
            <div className={`text-2xl font-bold ${m.color}`}>{loading ? "\u2014" : m.value}</div>
            <div className="text-[10px] text-white/40 mt-1">{m.changeLabel}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Cash Position Trend (7 Months)</h2>
          <div className="flex items-end gap-2 h-40">
            {trends.map((t, i) => (
              <div key={t.period} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-white/40">${t.cashPosition}M</span>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(t.cashPosition / maxCash) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} className="w-full rounded-t-sm bg-gold-500/40" />
                <span className="text-[10px] text-white/50">{t.period}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Multi-Metric Trend</h2>
          <div className="space-y-4">
            {[
              { label: "Liquidity Score", data: trends.map((t) => t.liquidityScore), color: "bg-blue-500", max: 100 },
              { label: "Risk Score", data: trends.map((t) => t.riskScore), color: "bg-red-500", max: 100 },
            ].map((series) => (
              <div key={series.label}>
                <div className="text-xs text-white/50 mb-2">{series.label}</div>
                <div className="flex items-end gap-1 h-16">
                  {series.data.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[8px] text-white/50">{v}</span>
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(v / series.max) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.4 }} className={`w-full rounded-sm ${series.color}/40`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">{kpi.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${kpi.status === "on-track" ? "bg-emerald-500/20 text-emerald-400" : kpi.status === "at-risk" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                  {kpi.status === "on-track" ? "On Track" : kpi.status === "at-risk" ? "At Risk" : "Behind"}
                </span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <div className="text-xl font-bold text-white">{kpi.value}</div>
                <div className="text-xs text-white/40">Target: {kpi.target}</div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${kpi.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className={`h-1.5 rounded-full ${kpiBg(kpi.status)}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
