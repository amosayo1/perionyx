"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart, TrendingUp, TrendingDown, Minus, AlertTriangle,
  CheckCircle2, Shield, FileText, BookOpen,
} from "lucide-react";

interface HealthMetric {
  id: string;
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  description: string;
  exceptions: number;
}

interface TrendData {
  period: string;
  score: number;
}

const defaultMetrics: HealthMetric[] = [
  { id: "1", name: "Overall Health", score: 87, trend: "up", description: "Composite accounting health score", exceptions: 2 },
  { id: "2", name: "Risk Score", score: 72, trend: "down", description: "Risk exposure across accounting operations", exceptions: 5 },
  { id: "3", name: "Integrity Score", score: 94, trend: "up", description: "Data integrity and consistency checks", exceptions: 1 },
  { id: "4", name: "Ledger Consistency", score: 91, trend: "stable", description: "Cross-ledger balance verification", exceptions: 0 },
  { id: "5", name: "Journal Quality", score: 78, trend: "up", description: "Journal entry quality and completeness", exceptions: 4 },
  { id: "6", name: "Reconciliation Completion", score: 82, trend: "up", description: "Account reconciliation progress", exceptions: 3 },
  { id: "7", name: "Policy Compliance", score: 96, trend: "stable", description: "Adherence to accounting policies", exceptions: 0 },
  { id: "8", name: "Posting Completeness", score: 88, trend: "up", description: "All required postings completed", exceptions: 2 },
];

const defaultTrends: TrendData[] = [
  { period: "Oct 2025", score: 79 },
  { period: "Nov 2025", score: 83 },
  { period: "Dec 2025", score: 87 },
];

function ScoreBar({ score, name }: { score: number; name: string }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/60">{name}</span>
        <span className="text-xs text-white font-medium">{score}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-2.5 rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function AccountingHealthDashboard() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/controller/health");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics ?? []);
          setTrends(data.trends ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const m = metrics.length > 0 ? metrics : defaultMetrics;
  const t = trends.length > 0 ? trends : defaultTrends;
  const totalExceptions = m.reduce((a, b) => a + b.exceptions, 0);
  const overallHealth = m.find((x) => x.name === "Overall Health")?.score ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Accounting Health</h1>
        <p className="text-sm text-white/60 mt-1">Monitor accounting quality, integrity, and compliance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-white/50">Overall Health</span>
          </div>
          <div className="text-2xl font-bold text-white">{overallHealth}%</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-white/50">Total Exceptions</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalExceptions}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-white/50">Metrics Passing</span>
          </div>
          <div className="text-2xl font-bold text-white">{m.filter((x) => x.score >= 80).length}/{m.length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-gold-500" />
            <span className="text-xs text-white/50">3-Month Trend</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">+{t.length >= 2 ? t[t.length - 1].score - t[0].score : 0}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Health Score Breakdown</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            {m.map((metric) => (
              <ScoreBar key={metric.id} score={metric.score} name={metric.name} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Metric Details</h2>
          <div className="space-y-2">
            {m.map((metric, i) => {
              const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
              const trendColor = metric.trend === "up" ? "text-emerald-400" : metric.trend === "down" ? "text-red-400" : "text-white/40";
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{metric.name}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{metric.description}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {metric.exceptions > 0 && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {metric.exceptions} exception{metric.exceptions !== 1 ? "s" : ""}
                      </span>
                    )}
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className="text-sm text-white font-medium w-10 text-right">{metric.score}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Trend History</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-end gap-6 h-40">
            {t.map((point, i) => (
              <div key={point.period} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-white font-medium">{point.score}%</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${point.score * 1.2}px` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="w-full bg-gold-500/30 rounded-t-lg"
                  style={{ minHeight: "4px" }}
                />
                <span className="text-[10px] text-white/40">{point.period}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
