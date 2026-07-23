"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PieChart, TrendingUp, TrendingDown, RefreshCw, AlertTriangle,
  Shield, DollarSign, Calendar, Target,
} from "lucide-react";

interface InvestmentHolding {
  id: string;
  name: string;
  type: string;
  counterparty: string;
  faceValue: number;
  currentValue: number;
  yield: number;
  maturityDate: string;
  liquidityClassification: "immediate" | "1-7days" | "7-30days" | "30-90days" | "90days+";
  riskRating: number;
}

interface PortfolioSummary {
  totalFaceValue: number;
  totalCurrentValue: number;
  weightedYield: number;
  portfolioRisk: number;
  allocationBreakdown: { category: string; amount: number; percentage: number }[];
  counterpartyExposure: { counterparty: string; amount: number; limit: number }[];
  recommendations: { id: string; title: string; impact: string; priority: string }[];
}

export function InvestmentPortfolio() {
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [holdRes, sumRes] = await Promise.all([
          fetch("/api/treasury/investments/holdings").then((r) => r.ok ? r.json() : null),
          fetch("/api/treasury/investments/summary").then((r) => r.ok ? r.json() : null),
        ]);
        if (holdRes) setHoldings(holdRes.holdings ?? []);
        if (sumRes) setSummary(sumRes);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const s = summary ?? {
    totalFaceValue: 1250000000, totalCurrentValue: 1268000000, weightedYield: 4.85,
    portfolioRisk: 28,
    allocationBreakdown: [
      { category: "Government Bonds", amount: 500000000, percentage: 40 },
      { category: "Corporate Bonds", amount: 312500000, percentage: 25 },
      { category: "Money Market", amount: 250000000, percentage: 20 },
      { category: "Term Deposits", amount: 125000000, percentage: 10 },
      { category: "Commercial Paper", amount: 62500000, percentage: 5 },
    ],
    counterpartyExposure: [
      { counterparty: "JPMorgan Chase", amount: 312000000, limit: 500000000 },
      { counterparty: "Deutsche Bank", amount: 245000000, limit: 400000000 },
      { counterparty: "HSBC", amount: 198000000, limit: 350000000 },
      { counterparty: "Goldman Sachs", amount: 156000000, limit: 300000000 },
    ],
    recommendations: [
      { id: "1", title: "Extend duration on US Treasury holdings", impact: "Capture higher yields before rate cuts", priority: "high" },
      { id: "2", title: "Diversify money market into short-duration bonds", impact: "+45bps yield improvement", priority: "medium" },
      { id: "3", title: "Reduce Goldman Sachs counterparty concentration", impact: "Bring exposure within 50% of limit", priority: "medium" },
    ],
  };

  const displayHoldings = holdings.length > 0 ? holdings : [
    { id: "1", name: "US Treasury 10Y", type: "Government Bond", counterparty: "US Treasury", faceValue: 250000000, currentValue: 248000000, yield: 4.25, maturityDate: "2036-06-30", liquidityClassification: "immediate" as const, riskRating: 5 },
    { id: "2", name: "US Treasury 5Y", type: "Government Bond", counterparty: "US Treasury", faceValue: 150000000, currentValue: 151500000, yield: 3.90, maturityDate: "2031-12-31", liquidityClassification: "immediate" as const, riskRating: 5 },
    { id: "3", name: "German Bund 7Y", type: "Government Bond", counterparty: "German Govt", faceValue: 100000000, currentValue: 99200000, yield: 2.45, maturityDate: "2033-09-15", liquidityClassification: "1-7days" as const, riskRating: 8 },
    { id: "4", name: "JPMorgan Corporate Bond", type: "Corporate Bond", counterparty: "JPMorgan Chase", faceValue: 125000000, currentValue: 126800000, yield: 5.125, maturityDate: "2028-03-15", liquidityClassification: "1-7days" as const, riskRating: 15 },
    { id: "5", name: "Deutsche Bank Corporate Bond", type: "Corporate Bond", counterparty: "Deutsche Bank", faceValue: 100000000, currentValue: 101200000, yield: 4.875, maturityDate: "2029-06-30", liquidityClassification: "1-7days" as const, riskRating: 18 },
    { id: "6", name: "Goldman Sachs CP", type: "Commercial Paper", counterparty: "Goldman Sachs", faceValue: 62500000, currentValue: 62200000, yield: 5.30, maturityDate: "2026-10-15", liquidityClassification: "immediate" as const, riskRating: 12 },
    { id: "7", name: "Money Market Fund - Prime", type: "Money Market", counterparty: "Fidelity", faceValue: 250000000, currentValue: 250000000, yield: 5.15, maturityDate: "N/A", liquidityClassification: "immediate" as const, riskRating: 3 },
    { id: "8", name: "Term Deposit - 90 Day", type: "Term Deposit", counterparty: "HSBC", faceValue: 125000000, currentValue: 125000000, yield: 4.50, maturityDate: "2026-10-15", liquidityClassification: "90days+" as const, riskRating: 8 },
  ];

  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
    return `$${v.toLocaleString()}`;
  };

  const liqColor: Record<string, string> = {
    immediate: "bg-emerald-500/20 text-emerald-400",
    "1-7days": "bg-blue-500/20 text-blue-400",
    "7-30days": "bg-amber-500/20 text-amber-400",
    "30-90days": "bg-orange-500/20 text-orange-400",
    "90days+": "bg-red-500/20 text-red-400",
  };

  const riskColor = (v: number) => v <= 10 ? "text-emerald-400" : v <= 25 ? "text-amber-400" : "text-red-400";
  const priorityColor: Record<string, string> = { high: "bg-red-500/20 text-red-400", medium: "bg-amber-500/20 text-amber-400", low: "bg-emerald-500/20 text-emerald-400" };
  const allocColors = ["bg-gold-500", "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Investment Portfolio</h1>
          <p className="text-sm text-white/60 mt-1">Investment holdings, allocation, and counterparty analysis</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Face Value", value: fmt(s.totalFaceValue), icon: DollarSign, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Total Market Value", value: fmt(s.totalCurrentValue), icon: PieChart, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Weighted Yield", value: `${s.weightedYield}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Portfolio Risk", value: `${s.portfolioRisk}%`, icon: Shield, color: riskColor(s.portfolioRisk), bg: "bg-purple-500/10" },
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
            <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-white/50 font-medium py-2">Name</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-3">Face Value</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-3">Market Value</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-3">Yield</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2 px-3">Liquidity</th>
                    <th className="text-right text-xs text-white/50 font-medium py-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {displayHoldings.map((h) => (
                    <tr key={h.id} className="border-b border-white/5">
                      <td className="py-3">
                        <div className="text-sm text-white">{h.name}</div>
                        <div className="text-[10px] text-white/40">{h.type} · {h.counterparty}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-white">{fmt(h.faceValue)}</td>
                      <td className="py-3 px-3 text-right text-white">{fmt(h.currentValue)}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-medium">{h.yield}%</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${liqColor[h.liquidityClassification]}`}>
                          {h.liquidityClassification}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-medium ${riskColor(h.riskRating)}`}>{h.riskRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Counterparty Exposure</h2>
            <div className="space-y-3">
              {s.counterpartyExposure.map((cp) => (
                <div key={cp.counterparty}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{cp.counterparty}</span>
                    <span className="text-xs text-white font-medium">{fmt(cp.amount)} / {fmt(cp.limit)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`h-2 rounded-full ${(cp.amount / cp.limit) > 0.8 ? "bg-red-500" : (cp.amount / cp.limit) > 0.6 ? "bg-amber-500" : "bg-gold-500"}`} style={{ width: `${(cp.amount / cp.limit) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Allocation Breakdown</h3>
            <div className="space-y-3">
              {s.allocationBreakdown.map((a, i) => (
                <div key={a.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{a.category}</span>
                    <span className="text-xs text-white font-medium">{fmt(a.amount)} ({a.percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`h-2 rounded-full ${allocColors[i % allocColors.length]}`} style={{ width: `${a.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-semibold text-white">Investment Recommendations</h3>
            </div>
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
            <h3 className="text-sm font-semibold text-white mb-3">Risk Score</h3>
            <div className="flex items-center justify-center mb-3">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" initial={{ strokeDasharray: "0 314" }} animate={{ strokeDasharray: `${(s.portfolioRisk / 100) * 314} 314` }} transition={{ duration: 1.2 }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${riskColor(s.portfolioRisk)}`}>{s.portfolioRisk}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/50 text-center">Weighted portfolio risk based on counterparty ratings and duration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
