"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, ShieldAlert, FileText, Calendar, AlertTriangle,
  CheckCircle, PieChart, Activity,
} from "lucide-react";

interface AnalyticsData {
  complianceScore: number;
  scoreTrend: number;
  policyAdherence: number;
  regulatoryReadiness: number;
  violationTrends: { month: string; count: number; severity: string }[];
  filingStatus: { onTime: number; overdue: number; upcoming: number };
  topFrameworks: { name: string; adherence: number }[];
  violationByType: { type: string; count: number }[];
}

export function ComplianceAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compliance/analytics");
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch {
        // defaults
      } finally {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    }
    load();
  }, []);

  const d = data ?? {
    complianceScore: 91,
    scoreTrend: 3.2,
    policyAdherence: 96.2,
    regulatoryReadiness: 88,
    violationTrends: [
      { month: "Jan", count: 12, severity: "high" },
      { month: "Feb", count: 9, severity: "medium" },
      { month: "Mar", count: 15, severity: "high" },
      { month: "Apr", count: 7, severity: "low" },
      { month: "May", count: 11, severity: "medium" },
      { month: "Jun", count: 5, severity: "low" },
    ],
    filingStatus: { onTime: 45, overdue: 3, upcoming: 12 },
    topFrameworks: [
      { name: "SOX", adherence: 98 },
      { name: "GDPR", adherence: 94 },
      { name: "ISO 27001", adherence: 91 },
      { name: "PCI DSS", adherence: 87 },
      { name: "Basel III", adherence: 96 },
    ],
    violationByType: [
      { type: "Data Protection", count: 8 },
      { type: "Financial Reporting", count: 5 },
      { type: "Security", count: 12 },
      { type: "HR", count: 3 },
      { type: "Operational", count: 6 },
    ],
  };

  const maxViolations = Math.max(...d.violationTrends.map((v) => v.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Compliance Analytics</h1>
          <p className="text-sm text-white/60 mt-1">Compliance metrics, trends, and framework adherence</p>
        </div>
        <div className="text-sm text-white/40">Last updated: {lastUpdated}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Compliance Score", value: `${d.complianceScore}%`, change: `+${d.scoreTrend}%`, icon: ShieldAlert, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Policy Adherence", value: `${d.policyAdherence}%`, change: null, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Regulatory Readiness", value: `${d.regulatoryReadiness}%`, change: null, icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Open Violations", value: d.violationByType.reduce((a, b) => a + b.count, 0), change: null, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? "—" : card.value}</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-white/50">{card.label}</div>
              {card.change && <div className="text-xs text-emerald-400">{card.change}</div>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-semibold text-white">Violation Trends</h3>
          </div>
          <div className="space-y-3">
            {d.violationTrends.map((v) => (
              <div key={v.month} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-8">{v.month}</span>
                <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(v.count / maxViolations) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-lg ${
                      v.severity === "high" ? "bg-orange-500/60" : v.severity === "medium" ? "bg-yellow-500/60" : "bg-emerald-500/60"
                    }`}
                  />
                </div>
                <span className="text-xs text-white/60 w-6 text-right">{v.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-semibold text-white">Filing Status</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "On Time", value: d.filingStatus.onTime, color: "bg-emerald-500" },
              { label: "Overdue", value: d.filingStatus.overdue, color: "bg-red-500" },
              { label: "Upcoming", value: d.filingStatus.upcoming, color: "bg-blue-500" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${f.color}`} />
                <span className="text-sm text-white/60 flex-1">{f.label}</span>
                <span className="text-sm font-medium text-white">{f.value}</span>
              </div>
            ))}
            <div className="mt-2 h-3 bg-white/5 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${(d.filingStatus.onTime / (d.filingStatus.onTime + d.filingStatus.overdue + d.filingStatus.upcoming)) * 100}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${(d.filingStatus.overdue / (d.filingStatus.onTime + d.filingStatus.overdue + d.filingStatus.upcoming)) * 100}%` }} />
              <div className="bg-blue-500 h-full" style={{ width: `${(d.filingStatus.upcoming / (d.filingStatus.onTime + d.filingStatus.overdue + d.filingStatus.upcoming)) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-semibold text-white">Framework Adherence</h3>
          </div>
          <div className="space-y-3">
            {d.topFrameworks.map((fw) => (
              <div key={fw.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/60">{fw.name}</span>
                  <span className="text-xs text-white/80">{fw.adherence}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fw.adherence}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      fw.adherence >= 95 ? "bg-emerald-500" : fw.adherence >= 90 ? "bg-gold-500" : "bg-orange-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-semibold text-white">Violations by Type</h3>
          </div>
          <div className="space-y-3">
            {d.violationByType.map((v) => {
              const max = Math.max(...d.violationByType.map((x) => x.count));
              return (
                <div key={v.type} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-32 truncate">{v.type}</span>
                  <div className="flex-1 h-5 bg-white/5 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(v.count / max) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-purple-500/60 rounded-lg"
                    />
                  </div>
                  <span className="text-xs text-white/60 w-6 text-right">{v.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
