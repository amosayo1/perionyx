"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Calculator, FileText,
  ShieldAlert, Target, DollarSign, Activity, Clock,
} from "lucide-react";

interface AnalyticsKPI {
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: "up" | "down" | "flat";
}

interface ChartDataPoint {
  label: string;
  value: number;
}

interface FilingMetric {
  label: string;
  value: number;
  total: number;
}

export function TaxAnalytics() {
  const [kpis, setKpis] = useState<AnalyticsKPI[]>([]);
  const [etrTrend, setEtrTrend] = useState<ChartDataPoint[]>([]);
  const [filingMetrics, setFilingMetrics] = useState<FilingMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiRes, etrRes, filRes] = await Promise.all([
          fetch("/api/tax/analytics/kpis").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/analytics/etr-trend").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/analytics/filings").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (kpiRes) setKpis(kpiRes.kpis ?? []);
        if (etrRes) setEtrTrend(etrRes.trend ?? []);
        if (filRes) setFilingMetrics(filRes.metrics ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultKPIs: AnalyticsKPI[] = [
    { name: "Effective Tax Rate", value: 21.4, previousValue: 21.5, unit: "%", trend: "down" },
    { name: "Provision Accuracy", value: 97.3, previousValue: 96.8, unit: "%", trend: "up" },
    { name: "Filing Compliance Rate", value: 94.2, previousValue: 92.1, unit: "%", trend: "up" },
    { name: "Average Days to File", value: 12, previousValue: 15, unit: "days", trend: "down" },
    { name: "Total Tax Liability", value: 4.27, previousValue: 3.95, unit: "M", trend: "up" },
    { name: "Planning ROI", value: 340, previousValue: 280, unit: "%", trend: "up" },
    { name: "Risk Score", value: 72, previousValue: 68, unit: "/100", trend: "up" },
    { name: "Transfer Pricing Compliance", value: 85, previousValue: 82, unit: "%", trend: "up" },
  ];

  const defaultETR: ChartDataPoint[] = [
    { label: "Q1 25", value: 22.1 },
    { label: "Q2 25", value: 21.8 },
    { label: "Q3 25", value: 21.5 },
    { label: "Q4 25", value: 21.2 },
    { label: "Q1 26", value: 21.6 },
    { label: "Q2 26", value: 21.4 },
  ];

  const defaultFilings: FilingMetric[] = [
    { label: "Filed on Time", value: 18, total: 25 },
    { label: "Filed Late", value: 2, total: 25 },
    { label: "Pending", value: 5, total: 25 },
    { label: "Overdue", value: 1, total: 25 },
  ];

  const kpisData = kpis.length > 0 ? kpis : defaultKPIs;
  const etr = etrTrend.length > 0 ? etrTrend : defaultETR;
  const filings = filingMetrics.length > 0 ? filingMetrics : defaultFilings;

  const maxETR = Math.max(...etr.map((d) => d.value));
  const minETR = Math.min(...etr.map((d) => d.value));

  const provisionMetrics = [
    { label: "Current Tax", value: "$3.89M", change: "+5.2%" },
    { label: "Deferred Tax Liability", value: "$380K", change: "-2.1%" },
    { label: "Deferred Tax Asset", value: "$125K", change: "+12.8%" },
    { label: "Net Provision", value: "$4.27M", change: "+3.8%" },
  ];

  const riskMetrics = [
    { label: "Jurisdiction Risk", score: 72, status: "medium" as const },
    { label: "Filing Risk", score: 65, status: "medium" as const },
    { label: "Provision Risk", score: 88, status: "low" as const },
    { label: "Transfer Pricing", score: 55, status: "high" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tax Analytics</h1>
          <p className="text-sm text-white/60 mt-1">ETR trends, filing status, provision accuracy, risk scores, and planning ROI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {kpisData.map((kpi, i) => (
          <motion.div
            key={kpi.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="text-xs text-white/50 mb-1">{kpi.name}</div>
            <div className="flex items-end gap-2">
              <div className="text-xl font-bold text-white">
                {loading ? "\u2014" : `${kpi.value}${kpi.unit === "%" ? "%" : ""}`}
              </div>
              <div className={`text-xs mb-0.5 ${
                kpi.trend === "up" ? (kpi.name.includes("Risk") ? "text-red-400" : "text-emerald-400") :
                kpi.trend === "down" ? (kpi.name.includes("Days") || kpi.name.includes("Rate") ? "text-emerald-400" : "text-red-400") :
                "text-white/40"
              }`}>
                {kpi.trend === "up" ? <TrendingUp className="w-3 h-3 inline" /> :
                 kpi.trend === "down" ? <TrendingDown className="w-3 h-3 inline" /> : null}
                {" "}
                {Math.abs(((kpi.value - kpi.previousValue) / (kpi.previousValue || 1)) * 100).toFixed(1)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">ETR Trend</h2>
          <div className="flex items-end gap-3 h-48">
            {etr.map((d, i) => {
              const height = ((d.value - minETR + 0.5) / (maxETR - minETR + 1)) * 100;
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gold-500 font-medium">{d.value}%</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 15)}%` }}
                    transition={{ delay: i * 0.08 }}
                    className="w-full bg-gold-500/30 rounded-t"
                  />
                  <span className="text-[9px] text-white/40">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Filing Status</h2>
          <div className="space-y-4">
            {filings.map((f, i) => {
              const pct = f.total > 0 ? (f.value / f.total) * 100 : 0;
              const color = f.label.includes("Overdue") ? "bg-red-400" :
                            f.label.includes("Pending") ? "bg-amber-400" :
                            f.label.includes("Late") ? "bg-orange-400" :
                            "bg-emerald-400";
              return (
                <div key={f.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{f.label}</span>
                    <span className="text-xs text-white font-medium">{f.value} / {f.total}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.1 }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Provision Summary</h2>
          <div className="space-y-3">
            {provisionMetrics.map((m) => (
              <div key={m.label} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-xs text-white/60">{m.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white font-medium">{m.value}</span>
                  <span className={`text-[10px] ${m.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                    {m.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Risk Scores</h2>
          <div className="space-y-3">
            {riskMetrics.map((r) => (
              <div key={r.label} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`w-4 h-4 ${
                    r.status === "high" ? "text-red-400" :
                    r.status === "medium" ? "text-amber-400" :
                    "text-emerald-400"
                  }`} />
                  <span className="text-xs text-white/60">{r.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        r.status === "high" ? "bg-red-400" :
                        r.status === "medium" ? "bg-amber-400" :
                        "bg-emerald-400"
                      }`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-medium w-8 text-right">{r.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
