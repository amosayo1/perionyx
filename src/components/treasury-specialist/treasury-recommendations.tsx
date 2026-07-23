"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp, ThumbsDown, RefreshCw, AlertTriangle, Shield,
  TrendingUp, Clock, Target, CheckCircle2, XCircle, Eye,
} from "lucide-react";

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  status: "pending" | "accepted" | "rejected" | "executing";
  priority: "critical" | "high" | "medium" | "low";
  evidence: { source: string; data: string; timestamp: string }[];
  expectedImpact: string;
  createdAt: string;
}

export function TreasuryRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/treasury/recommendations");
        if (res.ok) setRecommendations((await res.json()).recommendations ?? []);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const display = recommendations.length > 0 ? recommendations : [
    { id: "1", category: "FX Hedging", title: "Execute GBP forward contract before BOE decision", description: "GBP is expected to be volatile ahead of the Bank of England rate decision. Locking in a forward contract now protects against downside risk on the $25M unhedged GBP position.", confidence: 88, riskLevel: "medium" as const, status: "pending" as const, priority: "high" as const, evidence: [{ source: "FX Risk Engine", data: "GBP/USD 30-day implied vol at 9.2%, above 6-month average of 7.8%", timestamp: "2026-07-17T08:00:00Z" }, { source: "Market Data", data: "BOE meeting scheduled July 18, consensus expects rate hold", timestamp: "2026-07-17T07:30:00Z" }], expectedImpact: "Reduces GBP downside risk by up to $1.2M", createdAt: "2026-07-17T06:00:00Z" },
    { id: "2", category: "FX Hedging", title: "Increase EUR hedge ratio from 70% to 80%", description: "EUR exposure is well above policy limits. Increasing the hedge ratio reduces concentration risk and aligns with treasury policy.", confidence: 92, riskLevel: "low" as const, status: "pending" as const, priority: "high" as const, evidence: [{ source: "Policy Engine", data: "EUR hedge ratio 70%, policy target 80%, threshold breached", timestamp: "2026-07-17T08:15:00Z" }], expectedImpact: "Reduces EUR exposure risk by $37M", createdAt: "2026-07-17T05:45:00Z" },
    { id: "3", category: "Cash Management", title: "Diversify cash away from JPMorgan to secondary bank", description: "Cash concentration at JPMorgan Chase is approaching the $500M policy limit. Moving $100M to Deutsche Bank improves diversification.", confidence: 85, riskLevel: "low" as const, status: "pending" as const, priority: "medium" as const, evidence: [{ source: "Concentration Monitor", data: "JPMorgan balance $425M, policy limit $500M, 85% utilized", timestamp: "2026-07-17T09:00:00Z" }], expectedImpact: "Improves concentration score from 73% to 82%", createdAt: "2026-07-17T05:30:00Z" },
    { id: "4", category: "Investments", title: "Extend duration on US Treasury holdings", description: "With rate cuts expected in Q4, locking in current 10Y yields of 4.25% provides attractive risk-adjusted returns before rates decline.", confidence: 78, riskLevel: "medium" as const, status: "pending" as const, priority: "medium" as const, evidence: [{ source: "Yield Curve Model", data: "10Y yield 4.25%, projected decline of 50-75bps by year-end", timestamp: "2026-07-17T08:30:00Z" }], expectedImpact: "Captures additional 25-40bps yield on $250M allocation", createdAt: "2026-07-17T05:00:00Z" },
    { id: "5", category: "Debt Management", title: "Engage refinancing advisory for 2027 revolver maturity", description: "The $300M revolving credit facility matures in March 2027. Early engagement with advisors provides better positioning for refinancing terms.", confidence: 90, riskLevel: "low" as const, status: "accepted" as const, priority: "high" as const, evidence: [{ source: "Debt Maturity Tracker", data: "Revolver $300M matures 2027-03-15, 8 months to maturity", timestamp: "2026-07-17T07:00:00Z" }], expectedImpact: "Potential 15-25bps improvement on refinancing terms", createdAt: "2026-07-16T10:00:00Z" },
  ];

  const filtered = filter === "all" ? display : display.filter((r) => r.status === filter);

  const priColor: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-orange-500/20 text-orange-400", medium: "bg-amber-500/20 text-amber-400", low: "bg-emerald-500/20 text-emerald-400" };
  const statusColor: Record<string, string> = { pending: "bg-blue-500/20 text-blue-400", accepted: "bg-emerald-500/20 text-emerald-400", rejected: "bg-red-500/20 text-red-400", executing: "bg-amber-500/20 text-amber-400" };
  const riskColor: Record<string, string> = { low: "text-emerald-400", medium: "text-amber-400", high: "text-red-400" };

  const accept = (id: string) => {
    setRecommendations((prev) => prev.map((r) => r.id === id ? { ...r, status: "accepted" as const } : r));
  };
  const reject = (id: string) => {
    setRecommendations((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" as const } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Treasury Recommendations</h1>
          <p className="text-sm text-white/60 mt-1">AI-powered treasury recommendations with evidence and actions</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`text-sm px-4 py-2 rounded-md transition-colors capitalize ${filter === f ? "bg-gold-500 text-black font-medium" : "text-white/50 hover:text-white"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((rec, i) => (
          <motion.div key={rec.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${priColor[rec.priority]}`}>{rec.priority.toUpperCase()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[rec.status]}`}>{rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}</span>
                  <span className="text-xs text-white/40">{rec.category}</span>
                </div>
                <div className="text-sm font-semibold text-white">{rec.title}</div>
                <div className="text-xs text-white/50 mt-1">{rec.description}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-gold-500">{rec.confidence}%</div>
                <div className="text-[10px] text-white/40">Confidence</div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/50">Risk: <span className={riskColor[rec.riskLevel]}>{rec.riskLevel}</span></span>
              </div>
              <span className="text-xs text-white/50">Impact: <span className="text-white">{rec.expectedImpact}</span></span>
            </div>

            <div className="bg-white/5 rounded-lg p-3 mb-3">
              <div className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1"><Eye className="w-3 h-3" /> Evidence</div>
              <div className="space-y-1">
                {rec.evidence.map((e, j) => (
                  <div key={j} className="text-[10px] text-white/50 flex items-start gap-2">
                    <span className="text-gold-500 shrink-0">[{e.source}]</span>
                    <span>{e.data}</span>
                  </div>
                ))}
              </div>
            </div>

            {rec.status === "pending" && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button onClick={() => accept(rec.id)} className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors">
                  <ThumbsUp className="w-3 h-3" /> Accept
                </button>
                <button onClick={() => reject(rec.id)} className="flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors">
                  <ThumbsDown className="w-3 h-3" /> Reject
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
