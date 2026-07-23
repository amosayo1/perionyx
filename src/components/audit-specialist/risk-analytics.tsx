"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, AlertTriangle, Shield, BarChart3, Target,
  ChevronRight, CheckCircle, TrendingDown,
} from "lucide-react";

interface RiskCategory {
  id: string;
  name: string;
  score: number;
  riskCount: number;
  controlsCount: number;
}

interface HighRiskArea {
  id: string;
  title: string;
  category: string;
  score: number;
  trend: "increasing" | "decreasing" | "stable";
  mitigatingControls: number;
}

interface RiskTrendPoint {
  month: string;
  score: number;
  incidents: number;
}

export function RiskAnalytics() {
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [highRiskAreas, setHighRiskAreas] = useState<HighRiskArea[]>([]);
  const [trend, setTrend] = useState<RiskTrendPoint[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, hrRes, trendRes] = await Promise.all([
          fetch("/api/audit/risk-analytics/categories").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/risk-analytics/high-risk").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/risk-analytics/trend").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (catRes) setCategories(catRes.categories ?? []);
        if (hrRes) {
          setHighRiskAreas(hrRes.areas ?? []);
          setOverallScore(hrRes.overallScore ?? 0);
        }
        if (trendRes) setTrend(trendRes.trend ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxTrend = Math.max(...trend.map((t) => t.score), 100);

  const getHeatColor = (score: number) => {
    if (score >= 80) return "bg-red-500/40 text-red-300";
    if (score >= 60) return "bg-orange-500/40 text-orange-300";
    if (score >= 40) return "bg-yellow-500/40 text-yellow-300";
    if (score >= 20) return "bg-emerald-500/40 text-emerald-300";
    return "bg-blue-500/40 text-blue-300";
  };

  const trendIcons: Record<string, typeof TrendingUp> = {
    increasing: TrendingUp,
    decreasing: TrendingDown,
    stable: Target,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Risk Analytics</h1>
          <p className="text-sm text-white/60 mt-1">Assess risk exposure and evaluate mitigating controls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
          <div className={`text-5xl font-bold mb-2 ${overallScore >= 70 ? "text-red-400" : overallScore >= 40 ? "text-yellow-400" : "text-emerald-400"}`}>{loading ? "—" : overallScore}</div>
          <div className="text-sm text-white/60">Overall Risk Score</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-white/60">High Risk Areas</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">{highRiskAreas.length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-white/60">Total Controls</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{categories.reduce((s, c) => s + c.controlsCount, 0)}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Risk by Category</h2>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-4 text-center ${getHeatColor(cat.score)}`}
              >
                <div className="text-2xl font-bold">{cat.score}</div>
                <div className="text-xs mt-1 opacity-80">{cat.name}</div>
                <div className="text-[10px] mt-0.5 opacity-60">{cat.riskCount} risks &middot; {cat.controlsCount} controls</div>
              </motion.div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">Mitigating Controls</h2>
          <div className="space-y-2">
            {categories.map((cat) => {
              const effective = Math.round(cat.controlsCount * 0.85);
              const pct = Math.round((effective / cat.controlsCount) * 100);
              return (
                <div key={cat.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white">{cat.name}</span>
                    <span className="text-xs text-white/50">{effective}/{cat.controlsCount} effective</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">High Risk Areas</h2>
          <div className="space-y-2">
            {highRiskAreas.length === 0 && !loading ? (
              <div className="text-sm text-white/40 py-4">No high risk areas identified</div>
            ) : (
              highRiskAreas.map((area) => {
                const TrendIcon = trendIcons[area.trend];
                return (
                  <div key={area.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate">{area.title}</div>
                        <div className="text-xs text-white/50 mt-1">{area.category} &middot; {area.mitigatingControls} mitigating controls</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-lg font-bold text-orange-400">{area.score}</span>
                        <TrendIcon className="w-4 h-4 text-white/40" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">Risk Trend</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-end gap-1 h-40">
              {trend.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="text-[10px] text-white/50 mb-1">{t.score}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(t.score / maxTrend) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={`w-full rounded-t ${
                      t.score >= 70 ? "bg-red-400/60" : t.score >= 40 ? "bg-yellow-400/60" : "bg-emerald-400/60"
                    }`}
                  />
                  <div className="text-[10px] text-white/40 mt-1">{t.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
