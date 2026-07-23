"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown, TrendingUp, TrendingDown, Target, Lightbulb, BarChart3,
  CheckCircle, AlertTriangle, Clock, ChevronRight, Activity,
} from "lucide-react";

interface StrategicKPI {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  trend: "up" | "down" | "flat";
  status: "on-track" | "at-risk" | "behind";
}

interface StrategicInitiative {
  id: string;
  name: string;
  progress: number;
  owner: string;
  deadline: string;
  status: "on-track" | "at-risk" | "behind" | "completed";
}

interface Recommendation {
  id: string;
  title: string;
  impact: string;
  priority: "high" | "medium" | "low";
  category: string;
}

const statusColors: Record<string, string> = {
  "on-track": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "at-risk": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  behind: "bg-red-500/20 text-red-400 border-red-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-white/10 text-white/60 border-white/20",
};

export function ExecutivePlanning() {
  const [kpis, setKpis] = useState<StrategicKPI[]>([]);
  const [initiatives, setInitiatives] = useState<StrategicInitiative[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const [kpisRes, initiativesRes, recsRes] = await Promise.all([
          fetch("/api/fpa/executive/kpis").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/fpa/executive/initiatives").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/fpa/executive/recommendations").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (kpisRes) setKpis(kpisRes.kpis ?? []);
        if (initiativesRes) setInitiatives(initiativesRes.initiatives ?? []);
        if (recsRes) setRecommendations(recsRes.recommendations ?? []);
      } catch { /* defaults */ } finally {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    }
    load();
  }, []);

  const defaultKPIs: StrategicKPI[] = [
    { id: "1", name: "Revenue Growth", target: 15, current: 12.3, unit: "%", trend: "up", status: "on-track" },
    { id: "2", name: "EBITDA Margin", target: 25, current: 22.8, unit: "%", trend: "up", status: "at-risk" },
    { id: "3", name: "Cash Conversion", target: 95, current: 91, unit: "%", trend: "flat", status: "at-risk" },
    { id: "4", name: "Working Capital Days", target: 30, current: 34, unit: "days", trend: "down", status: "behind" },
  ];

  const defaultInitiatives: StrategicInitiative[] = [
    { id: "1", name: "ERP Modernization", progress: 72, owner: "CIO", deadline: "2026-Q3", status: "on-track" },
    { id: "2", name: "Market Expansion APAC", progress: 45, owner: "CRO", deadline: "2026-Q4", status: "at-risk" },
    { id: "3", name: "Cost Optimization Program", progress: 88, owner: "CFO", deadline: "2026-Q2", status: "on-track" },
    { id: "4", name: "Sustainability Initiative", progress: 30, owner: "CSO", deadline: "2027-Q1", status: "behind" },
  ];

  const defaultRecs: Recommendation[] = [
    { id: "1", title: "Accelerate APAC market entry by 2 months", impact: "+$4.2M revenue", priority: "high", category: "Growth" },
    { id: "2", title: "Renegotiate top 5 supplier contracts", impact: "-$1.8M cost", priority: "high", category: "Cost" },
    { id: "3", title: "Increase automation investment by 15%", impact: "+8% efficiency", priority: "medium", category: "Operations" },
  ];

  const displayKpis = kpis.length > 0 ? kpis : defaultKPIs;
  const displayInitiatives = initiatives.length > 0 ? initiatives : defaultInitiatives;
  const displayRecs = recommendations.length > 0 ? recommendations : defaultRecs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Executive Planning</h1>
          <p className="text-sm text-white/60 mt-1">Strategic KPIs, initiatives and planning recommendations</p>
        </div>
        <div className="text-sm text-white/40">Last updated: {lastUpdated}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayKpis.map((kpi, i) => {
          const pct = (kpi.current / kpi.target) * 100;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">{kpi.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[kpi.status]}`}>{kpi.status.replace("-", " ").toUpperCase()}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{kpi.current}{kpi.unit}</span>
                <span className="text-xs text-white/40 mb-1">/ {kpi.target}{kpi.unit}</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 90 ? "bg-emerald-400" : pct >= 70 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {kpi.trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
                {kpi.trend === "flat" && <Activity className="w-3 h-3 text-white/40" />}
                <span className="text-[10px] text-white/40">{kpi.trend === "up" ? "Improving" : kpi.trend === "down" ? "Declining" : "Flat"}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Strategic Initiatives</h2>
          <div className="space-y-3">
            {displayInitiatives.map((init, i) => (
              <motion.div
                key={init.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white">{init.name}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[init.status]}`}>{init.status.replace("-", " ").toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/50 mb-2">
                  <span>Owner: {init.owner}</span>
                  <span>Deadline: {init.deadline}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${init.progress >= 80 ? "bg-emerald-400" : init.progress >= 50 ? "bg-gold-500" : "bg-amber-400"}`}
                      style={{ width: `${init.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{init.progress}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Recommendations</h2>
          <div className="space-y-3">
            {displayRecs.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-gold-500 shrink-0" />
                      <div className="text-sm font-medium text-white">{rec.title}</div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gold-500 font-medium">{rec.impact}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/5 text-white/50 border-white/10">{rec.category}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${priorityColors[rec.priority]}`}>{rec.priority.toUpperCase()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
