"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, TrendingUp, TrendingDown, Calendar, Target,
  RefreshCw, ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";

interface ForecastData {
  horizon: string;
  scenarios: {
    name: string;
    probability: number;
    values: number[];
    color: string;
  }[];
  variance: { period: string; forecast: number; actual: number; variance: number }[];
  confidence: number;
  historicalAccuracy: number;
  dates: string[];
}

const horizons = ["Daily", "Weekly", "Monthly", "Quarterly", "Annual"];

export function ForecastCenter() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHorizon, setSelectedHorizon] = useState("Monthly");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/treasury/forecasts?horizon=${selectedHorizon.toLowerCase()}`);
        if (res.ok) setData(await res.json());
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, [selectedHorizon]);

  const d = data ?? {
    horizon: selectedHorizon,
    scenarios: [
      { name: "Best Case", probability: 25, values: [2850, 3000, 3150, 3300, 3450], color: "text-emerald-400" },
      { name: "Expected", probability: 55, values: [2780, 2850, 2920, 2980, 3050], color: "text-gold-500" },
      { name: "Worst Case", probability: 20, values: [2650, 2480, 2300, 2150, 2000], color: "text-red-400" },
    ],
    variance: [
      { period: "Jul 2026", forecast: 2780, actual: 2810, variance: 1.1 },
      { period: "Jun 2026", forecast: 2720, actual: 2690, variance: -1.1 },
      { period: "May 2026", forecast: 2650, actual: 2680, variance: 1.1 },
      { period: "Apr 2026", forecast: 2580, actual: 2540, variance: -1.6 },
    ],
    confidence: 92,
    historicalAccuracy: 94.2,
    dates: ["Jul", "Aug", "Sep", "Oct", "Nov"],
  };

  const fmt = (v: number) => {
    if (v >= 1e3) return `$${(v).toFixed(0)}M`;
    return `$${v}M`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Forecast Center</h1>
          <p className="text-sm text-white/60 mt-1">Cash flow forecasting with scenario analysis and variance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {horizons.map((h) => (
          <button key={h} onClick={() => setSelectedHorizon(h)} className={`text-sm px-4 py-2 rounded-md transition-colors ${selectedHorizon === h ? "bg-gold-500 text-black font-medium" : "text-white/50 hover:text-white"}`}>
            {h}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Forecast Confidence", value: `${d.confidence}%`, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Historical Accuracy", value: `${d.historicalAccuracy}%`, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Latest Variance", value: `${d.variance[0]?.variance > 0 ? "+" : ""}${d.variance[0]?.variance ?? 0}%`, icon: d.variance[0]?.variance > 0 ? ArrowUpRight : ArrowDownRight, color: d.variance[0]?.variance > 0 ? "text-emerald-400" : "text-red-400", bg: d.variance[0]?.variance > 0 ? "bg-emerald-500/10" : "bg-red-500/10" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Scenario Forecast ({selectedHorizon})</h2>
          <div className="space-y-4">
            {d.scenarios.map((sc, i) => (
              <div key={sc.name} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-emerald-400" : i === 1 ? "bg-gold-500" : "bg-red-400"}`} />
                    <span className={`text-sm font-medium ${sc.color}`}>{sc.name}</span>
                  </div>
                  <span className="text-xs text-white/50">{sc.probability}% probability</span>
                </div>
                <div className="flex items-end gap-2 h-20">
                  {sc.values.map((v, j) => (
                    <div key={j} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-white/40">{fmt(v)}</span>
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(v / 3500) * 100}%` }} transition={{ delay: j * 0.1, duration: 0.5 }} className={`w-full rounded-sm min-h-[4px] ${i === 0 ? "bg-emerald-500/40" : i === 1 ? "bg-gold-500/40" : "bg-red-500/40"}`} />
                      <span className="text-[10px] text-white/50">{d.dates[j]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Variance Tracking</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-white/50 font-medium py-2 pr-4">Period</th>
                  <th className="text-right text-xs text-white/50 font-medium py-2 px-4">Forecast</th>
                  <th className="text-right text-xs text-white/50 font-medium py-2 px-4">Actual</th>
                  <th className="text-right text-xs text-white/50 font-medium py-2">Variance</th>
                </tr>
              </thead>
              <tbody>
                {d.variance.map((v) => (
                  <tr key={v.period} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white">{v.period}</td>
                    <td className="py-3 px-4 text-right text-white/70">{fmt(v.forecast)}</td>
                    <td className="py-3 px-4 text-right text-white">{fmt(v.actual)}</td>
                    <td className={`py-3 text-right font-medium ${v.variance > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {v.variance > 0 ? "+" : ""}{v.variance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-medium text-white">Forecast Confidence Band</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${d.confidence}%` }} transition={{ duration: 1 }} className="h-2 rounded-full bg-gold-500" />
            </div>
            <p className="text-[10px] text-white/40 mt-1">Confidence based on historical accuracy, data quality, and model stability</p>
          </div>
        </div>
      </div>
    </div>
  );
}
