"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp, ThumbsDown, Users, AlertTriangle, Shield, TrendingUp, Target,
  CheckCircle, XCircle, Eye, Clock, RefreshCw
} from "lucide-react";

type RiskLevel = "low" | "medium" | "high";
type RecommendationStatus = "pending" | "accepted" | "rejected" | "implemented";

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  riskLevel: RiskLevel;
  status: RecommendationStatus;
  businessReason: string;
  contributors: { name: string; role: string }[];
  collaborationChain: { specialist: string; action: string; timestamp: string }[];
  expectedImpact: string;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  "FX Hedging": "bg-blue-500/20 text-blue-400",
  "Risk Management": "bg-orange-500/20 text-orange-400",
  "Cash Management": "bg-emerald-500/20 text-emerald-400",
  "Investment": "bg-purple-500/20 text-purple-400",
  "Debt Management": "bg-rose-500/20 text-rose-400",
  "Policy": "bg-amber-500/20 text-amber-400",
  "Compliance": "bg-cyan-500/20 text-cyan-400",
  "Strategy": "bg-indigo-500/20 text-indigo-400",
};

const statusColors: Record<RecommendationStatus, string> = {
  pending: "bg-blue-500/20 text-blue-400",
  accepted: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
  implemented: "bg-gold-500/20 text-gold-400",
};

const riskColors: Record<RiskLevel, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

const defaultRecommendations: Recommendation[] = [
  {
    id: "R1", category: "FX Hedging", title: "Execute GBP forward contract before BOE decision",
    description: "GBP expected to be volatile ahead of the BOE rate decision. Locking in forward contract protects against downside on $25M unhedged GBP position.",
    confidence: 88, riskLevel: "medium", status: "pending",
    businessReason: "GBP/USD 30-day implied vol at 9.2% exceeds 6-month average of 7.8%",
    contributors: [
      { name: "AI FX Engine", role: "Primary Analyst" },
      { name: "David Kim", role: "Treasury Specialist" },
    ],
    collaborationChain: [
      { specialist: "AI FX Engine", action: "Generated recommendation based on market analysis", timestamp: "2 days ago" },
      { specialist: "David Kim", action: "Reviewed and added market context on BOE expectations", timestamp: "1 day ago" },
      { specialist: "Carol Nguyen", action: "Validated FX exposure numbers against policy limits", timestamp: "12 hours ago" },
    ],
    expectedImpact: "Reduces GBP downside risk by up to $1.2M", createdAt: "2026-07-17",
  },
  {
    id: "R2", category: "Risk Management", title: "Increase EUR hedge ratio from 70% to 80%",
    description: "EUR exposure is above policy limits. Increasing hedge ratio reduces concentration risk.",
    confidence: 92, riskLevel: "low", status: "accepted",
    businessReason: "EUR hedge ratio 70%, policy target 80%, threshold breached for 14 days",
    contributors: [
      { name: "Policy Engine", role: "Automated Monitor" },
      { name: "Alice Chen", role: "Treasury Specialist" },
      { name: "Bob Martinez", role: "Risk Manager" },
    ],
    collaborationChain: [
      { specialist: "Policy Engine", action: "Detected policy threshold breach", timestamp: "3 days ago" },
      { specialist: "Bob Martinez", action: "Confirmed risk exposure analysis", timestamp: "2 days ago" },
      { specialist: "Alice Chen", action: "Proposed hedge ratio increase to 80%", timestamp: "1 day ago" },
    ],
    expectedImpact: "Reduces EUR exposure risk by $37M", createdAt: "2026-07-16",
  },
  {
    id: "R3", category: "Cash Management", title: "Diversify cash away from JPMorgan to secondary bank",
    description: "Cash concentration at JPMorgan approaching $500M policy limit. Moving $100M to Deutsche Bank improves diversification.",
    confidence: 85, riskLevel: "low", status: "pending",
    businessReason: "JPMorgan balance $425M, policy limit $500M, 85% utilized",
    contributors: [
      { name: "Concentration Monitor", role: "Automated Detection" },
      { name: "Diana Lopez", role: "Treasury Analyst" },
    ],
    collaborationChain: [
      { specialist: "Concentration Monitor", action: "Flagged concentration approaching limit", timestamp: "3 days ago" },
      { specialist: "Diana Lopez", action: "Analyzed bank diversification options", timestamp: "1 day ago" },
    ],
    expectedImpact: "Improves concentration score from 73% to 82%", createdAt: "2026-07-16",
  },
  {
    id: "R4", category: "Investment", title: "Extend duration on US Treasury holdings",
    description: "With rate cuts expected in Q4, locking in current 10Y yields of 4.25% provides attractive risk-adjusted returns.",
    confidence: 78, riskLevel: "medium", status: "pending",
    businessReason: "10Y yield 4.25%, projected decline of 50-75bps by year-end",
    contributors: [
      { name: "Yield Curve Model", role: "Analytics Engine" },
      { name: "Grace Liu", role: "Investment Specialist" },
    ],
    collaborationChain: [
      { specialist: "Yield Curve Model", action: "Generated yield curve forecast", timestamp: "4 days ago" },
      { specialist: "Grace Liu", action: "Reviewed against portfolio strategy", timestamp: "2 days ago" },
    ],
    expectedImpact: "Captures additional 25-40bps yield on $250M allocation", createdAt: "2026-07-15",
  },
  {
    id: "R5", category: "Debt Management", title: "Engage refinancing advisory for 2027 revolver maturity",
    description: "The $300M revolver matures March 2027. Early engagement with advisors provides better positioning.",
    confidence: 90, riskLevel: "low", status: "implemented",
    businessReason: "Revolver $300M matures 2027-03-15, 8 months to maturity",
    contributors: [
      { name: "Debt Maturity Tracker", role: "Automated Detection" },
      { name: "Frank Okafor", role: "Treasury Director" },
    ],
    collaborationChain: [
      { specialist: "Debt Maturity Tracker", action: "Flagged upcoming maturity", timestamp: "1 week ago" },
      { specialist: "Frank Okafor", action: "Initiated refinancing advisory RFP", timestamp: "5 days ago" },
    ],
    expectedImpact: "Potential 15-25bps improvement on refinancing terms", createdAt: "2026-07-14",
  },
  {
    id: "R6", category: "Strategy", title: "Implement quarterly FX hedging rebalancing cycle",
    description: "Move from annual to quarterly rebalancing to better respond to market volatility.",
    confidence: 82, riskLevel: "low", status: "rejected",
    businessReason: "Annual rebalancing has resulted in average 120bps drift from target ratios",
    contributors: [
      { name: "David Kim", role: "Treasury Specialist" },
      { name: "Carol Nguyen", role: "EMEA Controller" },
    ],
    collaborationChain: [
      { specialist: "David Kim", action: "Proposed quarterly rebalancing cycle", timestamp: "5 days ago" },
      { specialist: "Carol Nguyen", action: "Raised concerns about operational burden", timestamp: "4 days ago" },
    ],
    expectedImpact: "Reduces hedge ratio drift by 60%", createdAt: "2026-07-13",
  },
];

export function RecommendationCenter() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(defaultRecommendations);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = [...new Set(recommendations.map((r) => r.category))];

  const filtered = recommendations.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    return true;
  });

  const updateStatus = (id: string, status: RecommendationStatus) => {
    setRecommendations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Recommendation Center</h1>
          <p className="text-sm text-white/60 mt-1">AI-powered and specialist-driven collaborative recommendations</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-sm px-4 py-2 rounded-md transition-colors capitalize ${filter === f ? "bg-gold-500 text-black font-medium" : "text-white/50 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c === categoryFilter ? null : c)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${categoryFilter === c ? "bg-white/10 text-white" : "bg-white/5 text-white/50 hover:text-white"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[rec.category] || "bg-white/10 text-white/50"}`}>{rec.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[rec.status]}`}>{rec.status}</span>
                </div>
                <div className="text-sm font-semibold text-white">{rec.title}</div>
                <div className="text-xs text-white/50 mt-1">{rec.description}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-gold-500">{rec.confidence}%</div>
                <div className="text-[10px] text-white/40">Confidence</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/50">Risk: <span className={riskColors[rec.riskLevel]}>{rec.riskLevel}</span></span>
              </div>
              <span className="text-xs text-white/50">Impact: <span className="text-white">{rec.expectedImpact}</span></span>
            </div>

            <div className="bg-white/5 rounded-lg p-3 mb-3">
              <div className="text-xs font-medium text-white/60 mb-2">Business Reason</div>
              <div className="text-[11px] text-white/50">{rec.businessReason}</div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3 h-3 text-white/40" />
              <span className="text-xs text-white/50">{rec.contributors.length} contributors:</span>
              {rec.contributors.map((c, j) => (
                <span key={j} className="text-xs text-white/80">{c.name}<span className="text-white/40 ml-1">({c.role})</span>{j < rec.contributors.length - 1 ? "," : ""}</span>
              ))}
            </div>

            <button onClick={() => setExpanded(expanded === rec.id ? null : rec.id)} className="text-xs text-gold-500 hover:text-gold-400 transition-colors mb-3 block">
              {expanded === rec.id ? "Hide" : "Show"} collaboration chain ({rec.collaborationChain.length} steps)
            </button>

            {expanded === rec.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-white/5 rounded-lg p-3 mb-3">
                <div className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Collaboration Chain</div>
                <div className="space-y-2">
                  {rec.collaborationChain.map((step, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-gold-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-white/80">{step.specialist}</span>
                        <span className="text-white/50"> — {step.action}</span>
                        <div className="text-white/40 text-[10px]">{step.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {rec.status === "pending" && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button onClick={() => updateStatus(rec.id, "accepted")} className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors">
                  <ThumbsUp className="w-3 h-3" /> Accept
                </button>
                <button onClick={() => updateStatus(rec.id, "rejected")} className="flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors">
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
