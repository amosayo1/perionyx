"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Droplets, TrendingUp, TrendingDown, Clock, AlertTriangle,
  RefreshCw, ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";

interface LiquidityData {
  currentPosition: number;
  forecastPosition: number;
  burnRate: number;
  workingCapital: number;
  shortTermNeeds: number;
  longTermNeeds: number;
  liquidityScore: number;
  riskScore: number;
  daysOfLiquidity: number;
  scenarios: {
    name: string;
    probability: number;
    position30d: number;
    position60d: number;
    position90d: number;
  }[];
}

export function LiquidityCenter() {
  const [data, setData] = useState<LiquidityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/treasury/liquidity");
        if (res.ok) setData(await res.json());
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const d = data ?? {
    currentPosition: 2614200000, forecastPosition: 2780000000, burnRate: 18500000,
    workingCapital: 892000000, shortTermNeeds: 425000000, longTermNeeds: 1150000000,
    liquidityScore: 82, riskScore: 28, daysOfLiquidity: 141,
    scenarios: [
      { name: "Best Case", probability: 25, position30d: 2850000000, position60d: 3100000000, position90d: 3350000000 },
      { name: "Expected", probability: 55, position30d: 2780000000, position60d: 2920000000, position90d: 3050000000 },
      { name: "Worst Case", probability: 20, position30d: 2450000000, position60d: 2200000000, position90d: 1950000000 },
    ],
  };

  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
  };

  const scoreColor = (v: number, invert = false) => {
    const good = invert ? v < 40 : v >= 70;
    const mid = invert ? v < 60 : v >= 50;
    return good ? "text-emerald-400" : mid ? "text-amber-400" : "text-red-400";
  };

  const scenarioColors = ["text-emerald-400", "text-gold-500", "text-red-400"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Liquidity Center</h1>
          <p className="text-sm text-white/60 mt-1">Liquidity position, forecasts, and scenario analysis</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Liquidity Score", value: `${d.liquidityScore}%`, icon: Droplets, color: scoreColor(d.liquidityScore), bg: "bg-blue-500/10" },
          { label: "Risk Score", value: `${d.riskScore}%`, icon: AlertTriangle, color: scoreColor(d.riskScore, true), bg: "bg-orange-500/10" },
          { label: "Days of Liquidity", value: d.daysOfLiquidity, icon: Clock, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Daily Burn Rate", value: fmt(d.burnRate), icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? "\u2014" : card.value}</div>
            <div className="text-xs text-white/50 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Liquidity Position</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/50 mb-1">Current Position</div>
                <div className="text-xl font-bold text-white">{fmt(d.currentPosition)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Available now</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/50 mb-1">30-Day Forecast</div>
                <div className="text-xl font-bold text-white">{fmt(d.forecastPosition)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400">{((d.forecastPosition - d.currentPosition) / d.currentPosition * 100).toFixed(1)}% projected</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/50 mb-1">Working Capital</div>
                <div className="text-xl font-bold text-gold-500">{fmt(d.workingCapital)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3 text-gold-500" />
                  <span className="text-xs text-gold-500">Healthy ratio</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/50 mb-1">Short-Term Needs (30d)</div>
                <div className="text-lg font-bold text-amber-400">{fmt(d.shortTermNeeds)}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/50 mb-1">Long-Term Needs (90d)</div>
                <div className="text-lg font-bold text-orange-400">{fmt(d.longTermNeeds)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Forecast Scenario Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-white/50 font-medium py-2 pr-4">Scenario</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-4">Probability</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-4">30 Days</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-4">60 Days</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2">90 Days</th>
                  </tr>
                </thead>
                <tbody>
                  {d.scenarios.map((sc, i) => (
                    <tr key={sc.name} className="border-b border-white/5">
                      <td className={`py-3 pr-4 font-medium ${scenarioColors[i]}`}>{sc.name}</td>
                      <td className="py-3 px-4 text-right text-white">{sc.probability}%</td>
                      <td className="py-3 px-4 text-right text-white">{fmt(sc.position30d)}</td>
                      <td className="py-3 px-4 text-right text-white">{fmt(sc.position60d)}</td>
                      <td className="py-3 text-right text-white">{fmt(sc.position90d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Liquidity Score</h3>
            <div className="flex items-center justify-center mb-3">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" initial={{ strokeDasharray: "0 314" }} animate={{ strokeDasharray: `${(d.liquidityScore / 100) * 314} 314` }} transition={{ duration: 1.2, ease: "easeOut" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{d.liquidityScore}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/50 text-center">Based on cash availability, forecast accuracy, and coverage ratios</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Risk Assessment</h3>
            <div className="space-y-3">
              {[
                { label: "Cash Concentration", value: 73, status: "moderate" },
                { label: "Forecast Accuracy", value: 94, status: "good" },
                { label: "Counterparty Risk", value: 22, status: "low" },
                { label: "Currency Risk", value: 45, status: "moderate" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{item.label}</span>
                    <span className={`text-xs font-medium ${item.status === "good" ? "text-emerald-400" : item.status === "low" ? "text-emerald-400" : "text-amber-400"}`}>{item.value}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${item.status === "good" || item.status === "low" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
