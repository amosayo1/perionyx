"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, TrendingUp, TrendingDown, RefreshCw, AlertTriangle,
  Activity, Target, ArrowUpRight, ArrowDownRight, Shield,
} from "lucide-react";

interface TreasuryRisk {
  id: string;
  title: string;
  riskType: string;
  level: "critical" | "high" | "medium" | "low";
  score: number;
  exposure: number;
  mitigation: string;
  status: "open" | "mitigated" | "monitoring" | "accepted";
  owner: string;
  lastAssessed: string;
}

interface RiskSummary {
  totalRisks: number;
  criticalRisks: number;
  overallScore: number;
  totalExposure: number;
  byType: { type: string; count: number; avgScore: number }[];
  trends: { period: string; score: number; count: number }[];
}

export function TreasuryRiskCenter() {
  const [risks, setRisks] = useState<TreasuryRisk[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [riskRes, sumRes] = await Promise.all([
          fetch("/api/treasury/risks").then((r) => r.ok ? r.json() : null),
          fetch("/api/treasury/risks/summary").then((r) => r.ok ? r.json() : null),
        ]);
        if (riskRes) setRisks(riskRes.risks ?? []);
        if (sumRes) setSummary(sumRes);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const s = summary ?? {
    totalRisks: 12, criticalRisks: 2, overallScore: 35, totalExposure: 187500000,
    byType: [
      { type: "FX Risk", count: 4, avgScore: 38 },
      { type: "Liquidity Risk", count: 3, avgScore: 25 },
      { type: "Credit Risk", count: 2, avgScore: 42 },
      { type: "Interest Rate Risk", count: 2, avgScore: 30 },
      { type: "Operational Risk", count: 1, avgScore: 15 },
    ],
    trends: [
      { period: "Jul", score: 35, count: 12 },
      { period: "Jun", score: 38, count: 14 },
      { period: "May", score: 42, count: 16 },
      { period: "Apr", score: 40, count: 15 },
    ],
  };

  const displayRisks = risks.length > 0 ? risks : [
    { id: "1", title: "EUR/USD volatility above threshold", riskType: "FX Risk", level: "high" as const, score: 72, exposure: 45000000, mitigation: "Execute forward contract for EUR exposure", status: "open", owner: "FX Desk", lastAssessed: "2026-07-17" },
    { id: "2", title: "GBP position unhedged ahead of BOE decision", riskType: "FX Risk", level: "critical" as const, score: 85, exposure: 25000000, mitigation: "Purchase GBP put options", status: "open", owner: "FX Desk", lastAssessed: "2026-07-17" },
    { id: "3", title: "Cash concentration in single bank exceeds policy", riskType: "Liquidity Risk", level: "high" as const, score: 68, exposure: 120000000, mitigation: "Diversify to secondary banking partner", status: "monitoring", owner: "Treasury Ops", lastAssessed: "2026-07-16" },
    { id: "4", title: "Revolver maturity approaching - refinancing risk", riskType: "Credit Risk", level: "medium" as const, score: 45, exposure: 300000000, mitigation: "Engage investment bank for refinancing advisory", status: "monitoring", owner: "Debt Team", lastAssessed: "2026-07-15" },
    { id: "5", title: "Rising interest rate impact on variable rate debt", riskType: "Interest Rate Risk", level: "medium" as const, score: 40, exposure: 425000000, mitigation: "Evaluate interest rate swap for portion of variable debt", status: "open", owner: "Debt Team", lastAssessed: "2026-07-14" },
    { id: "6", title: "JPY exposure not aligned with natural hedge window", riskType: "FX Risk", level: "low" as const, score: 22, exposure: 18000000, mitigation: "Adjust JPY outflow timing to match inflows", status: "mitigated", owner: "FX Desk", lastAssessed: "2026-07-13" },
  ];

  const fmt = (v: number) => {
    if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
    return `$${v.toLocaleString()}`;
  };

  const levelColor: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const statusColor: Record<string, string> = {
    open: "bg-red-500/20 text-red-400",
    monitoring: "bg-blue-500/20 text-blue-400",
    mitigated: "bg-emerald-500/20 text-emerald-400",
    accepted: "bg-white/10 text-white/60",
  };

  const scoreColor = (v: number) => v < 30 ? "text-emerald-400" : v < 60 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Treasury Risk Center</h1>
          <p className="text-sm text-white/60 mt-1">Risk identification, assessment, and mitigation tracking</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Risks", value: s.totalRisks, icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Critical Risks", value: s.criticalRisks, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Overall Risk Score", value: `${s.overallScore}%`, icon: Target, color: scoreColor(s.overallScore), bg: "bg-purple-500/10" },
          { label: "Total Exposure", value: fmt(s.totalExposure), icon: Activity, color: "text-gold-500", bg: "bg-gold-500/10" },
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
            <h2 className="text-lg font-semibold text-white mb-4">Risk Register</h2>
            <div className="space-y-3">
              {displayRisks.map((risk, i) => (
                <motion.div key={risk.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelColor[risk.level]}`}>
                          {risk.level.toUpperCase()}
                        </span>
                        <span className="text-xs text-white/40">{risk.riskType}</span>
                      </div>
                      <div className="text-sm text-white font-medium">{risk.title}</div>
                      <div className="text-xs text-white/50 mt-1">{risk.mitigation}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-lg font-bold ${scoreColor(risk.score)}`}>{risk.score}</div>
                      <div className="text-[10px] text-white/40">Risk Score</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/40">Exposure: <span className="text-white">{fmt(risk.exposure)}</span></span>
                      <span className="text-[10px] text-white/40">Owner: <span className="text-white">{risk.owner}</span></span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[risk.status]}`}>
                      {risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Risk Heatmap</h3>
            <div className="grid grid-cols-5 gap-1">
              {[...Array(25)].map((_, i) => {
                const row = Math.floor(i / 5);
                const col = i % 5;
                const intensity = (row + col) / 8;
                const bg = intensity > 0.6 ? "bg-red-500/40" : intensity > 0.3 ? "bg-amber-500/30" : "bg-emerald-500/20";
                return <div key={i} className={`w-full aspect-square rounded-sm ${bg}`} />;
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-white/40">Low</span>
              <span className="text-[10px] text-white/40">High</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Risk by Type</h3>
            <div className="space-y-3">
              {s.byType.map((t) => (
                <div key={t.type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{t.type}</span>
                    <span className="text-xs text-white font-medium">{t.count} risks (avg {t.avgScore})</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`h-2 rounded-full ${scoreColor(t.avgScore).replace("text-", "bg-")}`} style={{ width: `${t.avgScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Risk Trends</h3>
            <div className="flex items-end gap-2 h-24">
              {s.trends.map((t, i) => (
                <div key={t.period} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-white/40">{t.score}</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(t.score / 100) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} className={`w-full rounded-sm ${scoreColor(t.score).replace("text-", "bg-")}`} />
                  <span className="text-[10px] text-white/50">{t.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
