"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PieChart, BarChart3, TrendingUp, Activity, Target, CheckCircle,
  AlertTriangle, Clock, DollarSign,
} from "lucide-react";

interface AccuracyTrend {
  period: string;
  accuracy: number;
  target: number;
}

interface BudgetUtilization {
  category: string;
  budgeted: number;
  utilized: number;
  utilization: number;
}

interface ScenarioOutcome {
  scenario: string;
  result: string;
  probability: number;
}

interface PlanningHealthMetric {
  metric: string;
  value: string;
  score: number;
  status: "good" | "warning" | "critical";
}

export function PlanningAnalytics() {
  const [accuracyTrends, setAccuracyTrends] = useState<AccuracyTrend[]>([]);
  const [utilizations, setUtilizations] = useState<BudgetUtilization[]>([]);
  const [outcomes, setOutcomes] = useState<ScenarioOutcome[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<PlanningHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const [accRes, utilRes, outRes, healthRes] = await Promise.all([
          fetch("/api/fpa/analytics/accuracy").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/fpa/analytics/utilization").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/fpa/analytics/outcomes").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/fpa/analytics/health").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (accRes) setAccuracyTrends(accRes.trends ?? []);
        if (utilRes) setUtilizations(utilRes.utilizations ?? []);
        if (outRes) setOutcomes(outRes.outcomes ?? []);
        if (healthRes) setHealthMetrics(healthRes.metrics ?? []);
      } catch { /* defaults */ } finally {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    }
    load();
  }, []);

  const defaultTrends: AccuracyTrend[] = [
    { period: "Q1 2025", accuracy: 91.2, target: 93 },
    { period: "Q2 2025", accuracy: 93.8, target: 93 },
    { period: "Q3 2025", accuracy: 92.1, target: 93 },
    { period: "Q4 2025", accuracy: 94.5, target: 93 },
    { period: "Q1 2026", accuracy: 94.1, target: 93 },
  ];

  const defaultUtilizations: BudgetUtilization[] = [
    { category: "Revenue", budgeted: 45000000, utilized: 41200000, utilization: 91.6 },
    { category: "Cost of Sales", budgeted: 22000000, utilized: 20800000, utilization: 94.5 },
    { category: "OpEx", budgeted: 18000000, utilized: 16200000, utilization: 90.0 },
    { category: "CapEx", budgeted: 8000000, utilized: 6400000, utilization: 80.0 },
    { category: "R&D", budgeted: 5000000, utilized: 4700000, utilization: 94.0 },
  ];

  const defaultOutcomes: ScenarioOutcome[] = [
    { scenario: "Base Case", result: "+12.3% revenue", probability: 65 },
    { scenario: "Bull Case", result: "+18.7% revenue", probability: 20 },
    { scenario: "Bear Case", result: "+4.2% revenue", probability: 15 },
  ];

  const defaultHealth: PlanningHealthMetric[] = [
    { metric: "Forecast Accuracy", value: "94.1%", score: 94, status: "good" },
    { metric: "Budget Adherence", value: "91.2%", score: 91, status: "good" },
    { metric: "Scenario Coverage", value: "78%", score: 78, status: "warning" },
    { metric: "Driver Calibration", value: "96%", score: 96, status: "good" },
    { metric: "Planning Cycle Time", value: "4.2 days", score: 85, status: "good" },
    { metric: "Stakeholder Alignment", value: "82%", score: 82, status: "warning" },
  ];

  const displayTrends = accuracyTrends.length > 0 ? accuracyTrends : defaultTrends;
  const displayUtilizations = utilizations.length > 0 ? utilizations : defaultUtilizations;
  const displayOutcomes = outcomes.length > 0 ? outcomes : defaultOutcomes;
  const displayHealth = healthMetrics.length > 0 ? healthMetrics : defaultHealth;

  const formatCurrency = (n: number) => `$${(n / 1000000).toFixed(1)}M`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Planning Analytics</h1>
          <p className="text-sm text-white/60 mt-1">Forecast accuracy, budget utilization and planning health</p>
        </div>
        <div className="text-sm text-white/40">Last updated: {lastUpdated}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Forecast Accuracy Trend</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-end gap-2 h-40">
              {displayTrends.map((t, i) => {
                const h = (t.accuracy / 100) * 100;
                const targetH = (t.target / 100) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                    <div className="w-full flex items-end justify-center gap-0.5" style={{ height: "100%" }}>
                      <div
                        className="w-3 bg-gold-500/60 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                      <div
                        className="w-1 bg-white/20 rounded-t"
                        style={{ height: `${targetH}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-white/40">{t.period}</div>
                    <div className="text-[9px] text-gold-500 font-medium">{t.accuracy}%</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gold-500/60 rounded" />
                <span className="text-[10px] text-white/50">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-white/20 rounded" />
                <span className="text-[10px] text-white/50">Target</span>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">Budget Utilization</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="space-y-3">
              {displayUtilizations.map((u, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{u.category}</span>
                    <span className="text-sm text-gold-500 font-medium">{u.utilization}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${u.utilization >= 90 ? "bg-emerald-400" : u.utilization >= 75 ? "bg-gold-500" : "bg-amber-400"}`}
                        style={{ width: `${Math.min(u.utilization, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/40 w-16 text-right">{formatCurrency(u.utilized)} / {formatCurrency(u.budgeted)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Planning Health</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            {displayHealth.map((h, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {h.status === "good" && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                  {h.status === "warning" && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  {h.status === "critical" && <AlertTriangle className="w-3 h-3 text-red-400" />}
                  <span className="text-xs text-white/50">{h.metric}</span>
                </div>
                <span className={`text-sm font-medium ${
                  h.status === "good" ? "text-emerald-400" :
                  h.status === "warning" ? "text-amber-400" : "text-red-400"
                }`}>{h.value}</span>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">Scenario Outcomes</h2>
          <div className="space-y-3">
            {displayOutcomes.map((o, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white">{o.scenario}</div>
                  <div className="text-xs text-gold-500 font-medium">{o.probability}%</div>
                </div>
                <div className="text-sm text-emerald-400">{o.result}</div>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500/60 rounded-full"
                    style={{ width: `${o.probability}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
