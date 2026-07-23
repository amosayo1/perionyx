"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  FileText, Lock, Clock,
} from "lucide-react";

interface ReadinessScore {
  category: string;
  score: number;
  maxScore: number;
  status: "ready" | "partial" | "not-ready";
}

interface GapItem {
  id: string;
  area: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  owner: string;
}

interface TrendPoint {
  month: string;
  score: number;
}

export function AuditReadinessDashboard() {
  const [scores, setScores] = useState<ReadinessScore[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [outstandingExceptions, setOutstandingExceptions] = useState(0);
  const [openFindingsCount, setOpenFindingsCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [scoresRes, gapsRes, trendRes] = await Promise.all([
          fetch("/api/audit/readiness/scores").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/readiness/gaps").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/readiness/trend").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (scoresRes) setScores(scoresRes.scores ?? []);
        if (gapsRes) {
          setGaps(gapsRes.gaps ?? []);
          setOutstandingExceptions(gapsRes.outstandingExceptions ?? 0);
          setOpenFindingsCount(gapsRes.openFindings ?? 0);
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

  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / scores.length)
    : 87;

  const statusColors: Record<string, string> = {
    ready: "text-emerald-400",
    partial: "text-yellow-400",
    "not-ready": "text-red-400",
  };

  const priorityColors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const maxTrend = Math.max(...trend.map((t) => t.score), 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Audit Readiness</h1>
          <p className="text-sm text-white/60 mt-1">Assess organizational preparedness for audit engagements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
          <div className="text-5xl font-bold text-gold-500 mb-2">{loading ? "—" : `${overallScore}%`}</div>
          <div className="text-sm text-white/60">Overall Readiness</div>
          <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gold-500 rounded-full transition-all" style={{ width: `${overallScore}%` }} />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-white/60">Outstanding Exceptions</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">{loading ? "—" : outstandingExceptions}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-white/60">Open Findings</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{loading ? "—" : openFindingsCount}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Readiness Scores</h2>
          <div className="space-y-3">
            {scores.map((s, i) => {
              const pct = Math.round((s.score / s.maxScore) * 100);
              return (
                <motion.div
                  key={s.category}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{s.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${statusColors[s.status]}`}>{pct}%</span>
                      <span className="text-xs text-white/40">{s.score}/{s.maxScore}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      pct >= 80 ? "bg-emerald-400" : pct >= 60 ? "bg-yellow-400" : "bg-red-400"
                    }`} style={{ width: `${pct}%` }} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">Gap Analysis</h2>
          <div className="space-y-2">
            {gaps.length === 0 && !loading ? (
              <div className="text-sm text-white/40 py-4">No gaps identified</div>
            ) : (
              gaps.map((gap) => (
                <div key={gap.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-white">{gap.description}</div>
                      <div className="text-xs text-white/50 mt-1">{gap.area} &middot; {gap.owner}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${priorityColors[gap.priority]}`}>{gap.priority}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Readiness Trend</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-end gap-1 h-48">
              {trend.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="text-[10px] text-white/50 mb-1">{t.score}%</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(t.score / maxTrend) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={`w-full rounded-t ${
                      t.score >= 80 ? "bg-emerald-400/60" : t.score >= 60 ? "bg-yellow-400/60" : "bg-red-400/60"
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
