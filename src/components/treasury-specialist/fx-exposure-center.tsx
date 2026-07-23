"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, TrendingUp, TrendingDown, Shield, AlertTriangle,
  RefreshCw, Globe, DollarSign, Target,
} from "lucide-react";

interface FxExposure {
  id: string;
  currency: string;
  longExposure: number;
  shortExposure: number;
  netExposure: number;
  hedgedAmount: number;
  unhedgedAmount: number;
  hedgeRatio: number;
  riskScore: number;
}

interface FxSummary {
  totalExposure: number;
  netOpenPosition: number;
  hedgedTotal: number;
  unhedgedTotal: number;
  overallHedgeRatio: number;
  portfolioRiskScore: number;
  byRegion: { region: string; exposure: number; percentage: number }[];
  opportunities: { id: string; type: string; currency: string; amount: number; potentialSavings: number; confidence: number; description: string }[];
  recommendations: { id: string; title: string; priority: string; impact: string }[];
}

export function FXExposureCenter() {
  const [exposures, setExposures] = useState<FxExposure[]>([]);
  const [summary, setSummary] = useState<FxSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [expRes, sumRes] = await Promise.all([
          fetch("/api/treasury/fx/exposures").then((r) => r.ok ? r.json() : null),
          fetch("/api/treasury/fx/summary").then((r) => r.ok ? r.json() : null),
        ]);
        if (expRes) setExposures(expRes.exposures ?? []);
        if (sumRes) setSummary(sumRes);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const s = summary ?? {
    totalExposure: 412000000, netOpenPosition: 87500000, hedgedTotal: 289000000,
    unhedgedTotal: 123000000, overallHedgeRatio: 70, portfolioRiskScore: 35,
    byRegion: [
      { region: "Europe", exposure: 185000000, percentage: 45 },
      { region: "Asia Pacific", exposure: 124000000, percentage: 30 },
      { region: "Latin America", exposure: 62000000, percentage: 15 },
      { region: "Middle East", exposure: 41000000, percentage: 10 },
    ],
    opportunities: [
      { id: "1", type: "Forward Contract", currency: "EUR/USD", amount: 50000000, potentialSavings: 340000, confidence: 85, description: "Lock in favorable EUR rate for Q4 payments" },
      { id: "2", type: "Options Hedge", currency: "GBP/USD", amount: 25000000, potentialSavings: 180000, confidence: 72, description: "Protect against GBP volatility around BOE decision" },
      { id: "3", type: "Natural Hedge", currency: "JPY/USD", amount: 40000000, potentialSavings: 95000, confidence: 90, description: "Match JPY inflows with upcoming JPY outflows" },
    ],
    recommendations: [
      { id: "1", title: "Increase EUR hedge ratio to 80%", priority: "high", impact: "Reduces EUR exposure risk by $37M" },
      { id: "2", title: "Execute GBP forward contract", priority: "medium", impact: "Locks in favorable rate for $25M Q4 liability" },
      { id: "3", title: "Review JPY natural hedge window", priority: "low", impact: "Potential $95K savings through timing optimization" },
    ],
  };

  const displayExposures = exposures.length > 0 ? exposures : [
    { id: "1", currency: "EUR", longExposure: 215000000, shortExposure: 30000000, netExposure: 185000000, hedgedAmount: 148000000, unhedgedAmount: 37000000, hedgeRatio: 80, riskScore: 25 },
    { id: "2", currency: "GBP", longExposure: 142000000, shortExposure: 18000000, netExposure: 124000000, hedgedAmount: 74400000, unhedgedAmount: 49600000, hedgeRatio: 60, riskScore: 45 },
    { id: "3", currency: "JPY", longExposure: 68000000, shortExposure: 6000000, netExposure: 62000000, hedgedAmount: 49600000, unhedgedAmount: 12400000, hedgeRatio: 80, riskScore: 20 },
    { id: "4", currency: "CHF", longExposure: 28000000, shortExposure: 5000000, netExposure: 23000000, hedgedAmount: 11500000, unhedgedAmount: 11500000, hedgeRatio: 50, riskScore: 55 },
    { id: "5", currency: "CAD", longExposure: 18000000, shortExposure: 0, netExposure: 18000000, hedgedAmount: 12600000, unhedgedAmount: 5400000, hedgeRatio: 70, riskScore: 30 },
  ];

  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
  };

  const riskColor = (v: number) => v < 30 ? "text-emerald-400" : v < 60 ? "text-amber-400" : "text-red-400";
  const priorityColor: Record<string, string> = { high: "bg-red-500/20 text-red-400", medium: "bg-amber-500/20 text-amber-400", low: "bg-emerald-500/20 text-emerald-400" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">FX Exposure Center</h1>
          <p className="text-sm text-white/60 mt-1">Foreign exchange exposure management and hedging analysis</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Exposure", value: fmt(s.totalExposure), icon: Globe, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Net Open Position", value: fmt(s.netOpenPosition), icon: ArrowLeftRight, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Hedged", value: fmt(s.hedgedTotal), icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Unhedged", value: fmt(s.unhedgedTotal), icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
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
            <h2 className="text-lg font-semibold text-white mb-4">Exposure by Currency</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-white/50 font-medium py-2">Currency</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-3">Net Exposure</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-3">Hedged</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-3">Unhedged</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-3">Hedge Ratio</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {displayExposures.map((e) => (
                    <tr key={e.id} className="border-b border-white/5">
                      <td className="py-3 font-medium text-white">{e.currency}</td>
                      <td className="py-3 px-3 text-right text-white">{fmt(e.netExposure)}</td>
                      <td className="py-3 px-3 text-right text-emerald-400">{fmt(e.hedgedAmount)}</td>
                      <td className="py-3 px-3 text-right text-red-400">{fmt(e.unhedgedAmount)}</td>
                      <td className="py-3 px-3 text-right text-white">{e.hedgeRatio}%</td>
                      <td className={`py-3 text-right font-medium ${riskColor(e.riskScore)}`}>{e.riskScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Hedging Opportunities</h2>
            <div className="space-y-3">
              {s.opportunities.map((opp, i) => (
                <motion.div key={opp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{opp.type} — {opp.currency}</div>
                      <div className="text-xs text-white/50 mt-1">{opp.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-emerald-400 font-medium">{fmt(opp.potentialSavings)} savings</div>
                      <div className="text-xs text-white/40">{opp.confidence}% confidence</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-white/40">Amount: <span className="text-white">{fmt(opp.amount)}</span></span>
                    <div className="flex-1 bg-white/10 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-gold-500" style={{ width: `${opp.confidence}%` }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Hedge Ratio Overview</h3>
            <div className="flex items-center justify-center mb-3">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" initial={{ strokeDasharray: "0 314" }} animate={{ strokeDasharray: `${(s.overallHedgeRatio / 100) * 314} 314` }} transition={{ duration: 1.2 }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{s.overallHedgeRatio}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/50 text-center">Overall portfolio hedge ratio</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Exposure by Region</h3>
            <div className="space-y-3">
              {s.byRegion.map((r) => (
                <div key={r.region}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{r.region}</span>
                    <span className="text-xs text-white font-medium">{fmt(r.exposure)} ({r.percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="h-2 rounded-full bg-purple-500" style={{ width: `${r.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">FX Recommendations</h3>
            <div className="space-y-2">
              {s.recommendations.map((rec) => (
                <div key={rec.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm text-white">{rec.title}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${priorityColor[rec.priority]}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 mt-1">{rec.impact}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-semibold text-white">Risk Score</h3>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${riskColor(s.portfolioRiskScore)}`}>{s.portfolioRiskScore}%</div>
              <div className="text-xs text-white/50 mt-1">Portfolio FX Risk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
