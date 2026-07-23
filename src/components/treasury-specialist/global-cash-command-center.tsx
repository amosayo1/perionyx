"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Banknote, Globe, Building2, Landmark, TrendingUp, TrendingDown,
  Lock, ArrowRightLeft, AlertTriangle, RefreshCw,
} from "lucide-react";

interface CashPosition {
  id: string;
  company: string;
  bank: string;
  currency: string;
  region: string;
  balance: number;
  availableBalance: number;
  restrictedCash: number;
  inTransitFunds: number;
  lastUpdated: string;
}

interface CashSummary {
  totalBalance: number;
  totalAvailable: number;
  totalRestricted: number;
  totalInTransit: number;
  concentrationScore: number;
  healthScore: number;
  currencyBreakdown: { currency: string; amount: number; percentage: number }[];
  regionBreakdown: { region: string; amount: number; percentage: number }[];
  companyBreakdown: { company: string; amount: number; percentage: number }[];
}

const currencyColors: Record<string, string> = {
  USD: "bg-emerald-500", EUR: "bg-blue-500", GBP: "bg-purple-500", JPY: "bg-amber-500",
};

export function GlobalCashCommandCenter() {
  const [positions, setPositions] = useState<CashPosition[]>([]);
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"all" | "company" | "bank" | "currency" | "region">("all");

  useEffect(() => {
    async function load() {
      try {
        const [posRes, sumRes] = await Promise.all([
          fetch("/api/treasury/cash/positions").then((r) => r.ok ? r.json() : null),
          fetch("/api/treasury/cash/summary").then((r) => r.ok ? r.json() : null),
        ]);
        if (posRes) setPositions(posRes.positions ?? []);
        if (sumRes) setSummary(sumRes);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const s = summary ?? {
    totalBalance: 2847500000, totalAvailable: 2614200000, totalRestricted: 142800000,
    totalInTransit: 90500000, concentrationScore: 73, healthScore: 88,
    currencyBreakdown: [
      { currency: "USD", amount: 1680000000, percentage: 59 },
      { currency: "EUR", amount: 625000000, percentage: 22 },
      { currency: "GBP", amount: 342000000, percentage: 12 },
      { currency: "JPY", amount: 200500000, percentage: 7 },
    ],
    regionBreakdown: [
      { region: "North America", amount: 1423750000, percentage: 50 },
      { region: "Europe", amount: 969150000, percentage: 34 },
      { region: "Asia Pacific", amount: 342900000, percentage: 12 },
      { region: "Latin America", amount: 111700000, percentage: 4 },
    ],
    companyBreakdown: [
      { company: "Parent Corp", amount: 1708500000, percentage: 60 },
      { company: "Subsidiary US", amount: 569500000, percentage: 20 },
      { company: "Subsidiary UK", amount: 341700000, percentage: 12 },
      { company: "Subsidiary JP", amount: 227800000, percentage: 8 },
    ],
  };

  const displayPositions = positions.length > 0 ? positions : [
    { id: "1", company: "Parent Corp", bank: "JPMorgan Chase", currency: "USD", region: "North America", balance: 842000000, availableBalance: 821000000, restrictedCash: 12000000, inTransitFunds: 9000000, lastUpdated: "2026-07-17T10:30:00Z" },
    { id: "2", company: "Parent Corp", bank: "Deutsche Bank", currency: "EUR", region: "Europe", balance: 412000000, availableBalance: 398000000, restrictedCash: 8500000, inTransitFunds: 5500000, lastUpdated: "2026-07-17T10:25:00Z" },
    { id: "3", company: "Subsidiary US", bank: "Bank of America", currency: "USD", region: "North America", balance: 356000000, availableBalance: 348000000, restrictedCash: 4200000, inTransitFunds: 3800000, lastUpdated: "2026-07-17T10:28:00Z" },
    { id: "4", company: "Subsidiary UK", bank: "HSBC", currency: "GBP", region: "Europe", balance: 278000000, availableBalance: 269000000, restrictedCash: 5800000, inTransitFunds: 3200000, lastUpdated: "2026-07-17T10:20:00Z" },
    { id: "5", company: "Subsidiary JP", bank: "Mizuho Bank", currency: "JPY", region: "Asia Pacific", balance: 200500000, availableBalance: 195200000, restrictedCash: 2800000, inTransitFunds: 2500000, lastUpdated: "2026-07-17T09:45:00Z" },
  ];

  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
  };

  const healthColor = s.healthScore >= 80 ? "text-emerald-400" : s.healthScore >= 60 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Global Cash Command Center</h1>
          <p className="text-sm text-white/60 mt-1">Real-time cash positions across all entities, banks, and currencies</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Balance", value: fmt(s.totalBalance), icon: Landmark, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Available Cash", value: fmt(s.totalAvailable), icon: Banknote, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Restricted Cash", value: fmt(s.totalRestricted), icon: Lock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "In-Transit Funds", value: fmt(s.totalInTransit), icon: ArrowRightLeft, color: "text-blue-400", bg: "bg-blue-500/10" },
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Cash Positions</h2>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {(["all", "company", "bank", "currency", "region"] as const).map((v) => (
                <button key={v} onClick={() => setActiveView(v)} className={`text-xs px-3 py-1 rounded-md transition-colors ${activeView === v ? "bg-gold-500 text-black" : "text-white/50 hover:text-white"}`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {displayPositions.map((pos, i) => (
              <motion.div key={pos.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{pos.bank}</div>
                      <div className="text-xs text-white/50 flex items-center gap-2">
                        <span>{pos.company}</span>
                        <span className="text-white/50">·</span>
                        <span>{pos.currency}</span>
                        <span className="text-white/50">·</span>
                        <span>{pos.region}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{fmt(pos.balance)}</div>
                    <div className="text-xs text-emerald-400">Available: {fmt(pos.availableBalance)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 flex items-center gap-1"><Lock className="w-3 h-3" /> Restricted</span>
                    <span className="text-xs text-amber-400 font-medium">{fmt(pos.restrictedCash)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 flex items-center gap-1"><ArrowRightLeft className="w-3 h-3" /> In Transit</span>
                    <span className="text-xs text-blue-400 font-medium">{fmt(pos.inTransitFunds)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Health Score</h3>
              <span className={`text-2xl font-bold ${healthColor}`}>{s.healthScore}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${s.healthScore}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-3 rounded-full bg-gold-500" />
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-white/50">Concentration Score</span>
              <span className="text-sm text-white font-medium">{s.concentrationScore}%</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">By Currency</h3>
            <div className="space-y-3">
              {s.currencyBreakdown.map((c) => (
                <div key={c.currency}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{c.currency}</span>
                    <span className="text-xs text-white font-medium">{fmt(c.amount)} ({c.percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`h-2 rounded-full ${currencyColors[c.currency] ?? "bg-white/30"}`} style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">By Region</h3>
            <div className="space-y-3">
              {s.regionBreakdown.map((r) => (
                <div key={r.region}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{r.region}</span>
                    <span className="text-xs text-white font-medium">{fmt(r.amount)} ({r.percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gold-500" style={{ width: `${r.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">By Company</h3>
            <div className="space-y-3">
              {s.companyBreakdown.map((c) => (
                <div key={c.company}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{c.company}</span>
                    <span className="text-xs text-white font-medium">{fmt(c.amount)} ({c.percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${c.percentage}%` }} />
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
