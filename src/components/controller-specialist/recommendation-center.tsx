"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp, ThumbsDown, AlertTriangle, Lightbulb, Clock,
  CheckCircle2, Eye, ChevronRight,
} from "lucide-react";

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "DISMISSED";
  createdAt: string;
  impact: string;
  source: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
  ACCEPTED: { label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10" },
  DISMISSED: { label: "Dismissed", color: "text-white/40", bg: "bg-white/5" },
};

const riskConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10" },
  high: { label: "High", color: "text-red-400", bg: "bg-red-500/10" },
};

const categoryIcons: Record<string, typeof ThumbsUp> = {
  "Journal Quality": Lightbulb,
  "Reconciliation": CheckCircle2,
  "Compliance": AlertTriangle,
  "Process": Clock,
  "Financial": Eye,
};

const defaultRecommendations: Recommendation[] = [
  { id: "1", category: "Journal Quality", title: "Automate recurring journal entries", description: "12 recurring monthly entries could be automated to reduce manual errors and save ~4 hours per month.", confidence: 89, riskLevel: "low", status: "PENDING", createdAt: "2025-12-30", impact: "Reduces journal errors by ~35%", source: "AI Analysis" },
  { id: "2", category: "Reconciliation", title: "Prioritize bank reconciliation for 3 accounts", description: "Three high-value accounts have unreconciled items exceeding materiality thresholds.", confidence: 95, riskLevel: "high", status: "PENDING", createdAt: "2025-12-29", impact: "Resolves $2.3M in unreconciled items", source: "Risk Engine" },
  { id: "3", category: "Compliance", title: "Update intercompany elimination procedures", description: "Current procedures don't reflect new entity structure after Q3 acquisition.", confidence: 82, riskLevel: "medium", status: "ACCEPTED", createdAt: "2025-12-28", impact: "Ensures compliance with new group structure", source: "Policy Monitor" },
  { id: "4", category: "Process", title: "Close calendar optimization", description: "Shifting depreciation run to Day 1 could save 2 days in the close timeline.", confidence: 76, riskLevel: "low", status: "PENDING", createdAt: "2025-12-27", impact: "Reduces close timeline by 2 days", source: "AI Analysis" },
  { id: "5", category: "Financial", title: "Review deferred tax provision", description: "DTA calculations using outdated tax rates. Update to reflect recent legislative changes.", confidence: 91, riskLevel: "high", status: "PENDING", createdAt: "2025-12-30", impact: "Potential $500K adjustment", source: "Tax Engine" },
];

export function RecommendationCenter() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/controller/recommendations");
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const list = recommendations.length > 0 ? recommendations : defaultRecommendations;
  const filtered = list.filter((r) => filter === "ALL" || r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Recommendations</h1>
        <p className="text-sm text-white/60 mt-1">AI-powered recommendations for accounting improvements</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{list.filter((r) => r.status === "PENDING").length}</div>
          <div className="text-xs text-white/50">Pending</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{list.filter((r) => r.status === "ACCEPTED").length}</div>
          <div className="text-xs text-white/50">Accepted</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-red-400">{list.filter((r) => r.status === "REJECTED").length}</div>
          <div className="text-xs text-white/50">Rejected</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-white">{list.filter((r) => r.riskLevel === "high").length}</div>
          <div className="text-xs text-white/50">High Risk</div>
        </div>
      </div>

      <div className="flex gap-1">
        {["PENDING", "ACCEPTED", "REJECTED", "ALL"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? "bg-gold-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((rec, i) => {
          const st = statusConfig[rec.status];
          const rk = riskConfig[rec.riskLevel];
          const Icon = categoryIcons[rec.category] ?? Lightbulb;
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4.5 h-4.5 text-gold-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{rec.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">{rec.category} · {rec.source}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${rk.bg} ${rk.color}`}>
                    {rk.label} Risk
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              </div>

              <p className="text-sm text-white/60 mb-3">{rec.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40">Confidence:</span>
                    <span className={`text-xs font-medium ${rec.confidence >= 85 ? "text-emerald-400" : rec.confidence >= 70 ? "text-amber-400" : "text-red-400"}`}>
                      {rec.confidence}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40">Impact:</span>
                    <span className="text-xs text-white/60">{rec.impact}</span>
                  </div>
                </div>
                {rec.status === "PENDING" && (
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      Accept
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">
                      <ThumbsDown className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
