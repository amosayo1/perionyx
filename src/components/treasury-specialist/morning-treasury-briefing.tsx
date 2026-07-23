"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sun, Banknote, Droplets, ArrowLeftRight, CreditCard, PieChart,
  ShieldAlert, ThumbsUp, AlertTriangle, CheckCircle2, Clock, RefreshCw,
} from "lucide-react";

interface BriefingData {
  id: string;
  date: string;
  cash: { position: number; change: number; highlights: string[] };
  liquidity: { score: number; daysOfLiquidity: number; highlights: string[] };
  fx: { totalExposure: number; topMove: string; highlights: string[] };
  debt: { utilization: number; upcomingMaturity: string; highlights: string[] };
  investments: { totalValue: number; yield: number; highlights: string[] };
  risks: { open: number; critical: number; highlights: string[] };
  recommendations: { count: number; highPriority: number; items: string[] };
  actionItems: { id: string; title: string; priority: string; dueDate: string }[];
}

export function MorningTreasuryBriefing() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/treasury/briefings/latest");
        if (res.ok) setBriefing(await res.json());
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const b = briefing ?? {
    id: "1", date: new Date().toISOString().split("T")[0],
    cash: { position: 2847500000, change: 2.3, highlights: ["USD strengthened overnight, boosting consolidated position", "EUR subsidiary received $42M from customer collections", "Restricted cash increased by $8M due to new escrow requirement"] },
    liquidity: { score: 82, daysOfLiquidity: 141, highlights: ["30-day forecast improved by 3.1% vs yesterday", "Working capital ratio stable at 1.8x", "Short-term obligations well-covered by available cash"] },
    fx: { totalExposure: 412000000, topMove: "EUR/USD +0.45%", highlights: ["EUR exposure gained $1.8M on spot movement", "GBP position needs attention ahead of BOE meeting", "JPY natural hedge opportunity identified for next week"] },
    debt: { utilization: 45, upcomingMaturity: "2027-03-15", highlights: ["Revolver utilization stable at 40%", "All covenants in compliance", "Refinancing advisory engagement recommended for Q1 2027 maturity"] },
    investments: { totalValue: 1268000000, yield: 4.85, highlights: ["Portfolio yield improved 5bps on new Treasury purchases", "Money market allocation earning 5.15% on $250M", "Corporate bond duration extended by 0.3 years"] },
    risks: { open: 8, critical: 2, highlights: ["GBP unhedged position flagged as critical", "Cash concentration at JPMorgan approaching policy limit", "Interest rate risk on variable debt needs monitoring"] },
    recommendations: { count: 11, highPriority: 3, items: ["Execute GBP forward contract before BOE decision", "Increase EUR hedge ratio from 70% to 80%", "Diversify cash away from JPMorgan to secondary bank"] },
    actionItems: [
      { id: "1", title: "Review GBP hedging strategy with FX desk", priority: "high", dueDate: "2026-07-18" },
      { id: "2", title: "Approve EUR forward contract execution ($50M)", priority: "high", dueDate: "2026-07-18" },
      { id: "3", title: "Schedule bank relationship meeting with Deutsche Bank", priority: "medium", dueDate: "2026-07-21" },
      { id: "4", title: "Review maturity profile with debt advisory team", priority: "medium", dueDate: "2026-07-22" },
      { id: "5", title: "Update cash forecast model with latest collections data", priority: "low", dueDate: "2026-07-23" },
    ],
  };

  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
  };

  const priColor: Record<string, string> = { high: "bg-red-500/20 text-red-400", medium: "bg-amber-500/20 text-amber-400", low: "bg-emerald-500/20 text-emerald-400" };
  const sections = [
    { title: "Cash Position", icon: Banknote, color: "text-gold-500", bg: "bg-gold-500/10", value: fmt(b.cash.position), sub: `${b.cash.change > 0 ? "+" : ""}${b.cash.change}% today`, highlights: b.cash.highlights },
    { title: "Liquidity", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10", value: `${b.liquidity.score}%`, sub: `${b.liquidity.daysOfLiquidity} days coverage`, highlights: b.liquidity.highlights },
    { title: "FX Exposure", icon: ArrowLeftRight, color: "text-purple-400", bg: "bg-purple-500/10", value: fmt(b.fx.totalExposure), sub: b.fx.topMove, highlights: b.fx.highlights },
    { title: "Debt", icon: CreditCard, color: "text-rose-400", bg: "bg-rose-500/10", value: `${b.debt.utilization}% utilization`, sub: `Next: ${b.debt.upcomingMaturity}`, highlights: b.debt.highlights },
    { title: "Investments", icon: PieChart, color: "text-cyan-400", bg: "bg-cyan-500/10", value: fmt(b.investments.totalValue), sub: `${b.investments.yield}% yield`, highlights: b.investments.highlights },
    { title: "Risks", icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10", value: `${b.risks.open} open`, sub: `${b.risks.critical} critical`, highlights: b.risks.highlights },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Morning Treasury Briefing</h1>
          <p className="text-sm text-white/60 mt-1">Daily treasury operations summary and action items</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-white/40 flex items-center gap-1">
            <Clock className="w-4 h-4" /> {b.date}
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((sec, i) => (
          <motion.div key={sec.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${sec.bg} flex items-center justify-center`}>
                <sec.icon className={`w-5 h-5 ${sec.color}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{sec.title}</div>
                <div className="text-xs text-white/50">{sec.sub}</div>
              </div>
              <div className="ml-auto text-lg font-bold text-white">{sec.value}</div>
            </div>
            <div className="space-y-1">
              {sec.highlights.map((h, j) => (
                <div key={j} className="text-xs text-white/50 flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-5 h-5 text-gold-500" />
            <h2 className="text-lg font-semibold text-white">Recommendations</h2>
            <span className="text-xs text-white/40 ml-auto">{b.recommendations.count} total, {b.recommendations.highPriority} high priority</span>
          </div>
          <div className="space-y-2">
            {b.recommendations.items.map((item, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                <span className="text-sm text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Action Items</h2>
          </div>
          <div className="space-y-2">
            {b.actionItems.map((item) => (
              <div key={item.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/40" />
                  <div>
                    <div className="text-sm text-white">{item.title}</div>
                    <div className="text-[10px] text-white/40">Due: {item.dueDate}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${priColor[item.priority]}`}>
                  {item.priority.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
