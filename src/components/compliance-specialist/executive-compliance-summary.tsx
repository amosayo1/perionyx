"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, AlertTriangle, ClipboardList, BookOpen, Brain, TrendingUp,
  Calendar, FileText, ChevronRight, Clock, Activity,
} from "lucide-react";

interface ExecutiveData {
  healthScore: number;
  healthTrend: number;
  upcomingDeadlines: { title: string; date: string; type: string }[];
  highRiskViolations: { id: string; title: string; severity: string; owner: string }[];
  openObligations: { name: string; dueDate: string; type: string }[];
  regulatoryChanges: { title: string; jurisdiction: string; effectiveDate: string }[];
  riskTrends: { month: string; score: number }[];
  boardSummary: {
    totalPolicies: number;
    activePolicies: number;
    totalViolations: number;
    resolvedViolations: number;
    complianceScore: number;
    nextReview: string;
  };
}

export function ExecutiveComplianceSummary() {
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compliance/executive-summary");
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
    healthScore: 91,
    healthTrend: 3.2,
    upcomingDeadlines: [
      { title: "SOX 404 Assessment", date: "2026-08-15", type: "assessment" },
      { title: "GDPR Annual Report", date: "2026-08-30", type: "filing" },
      { title: "PCI DSS Recertification", date: "2026-09-15", type: "certification" },
    ],
    highRiskViolations: [
      { id: "V-001", title: "Unencrypted PII in staging", severity: "critical", owner: "Security Team" },
      { id: "V-002", title: "Missing audit trail for wire transfers", severity: "high", owner: "Treasury" },
    ],
    openObligations: [
      { name: "SOC 2 Type II Evidence Collection", dueDate: "2026-08-01", type: "regulatory" },
      { name: "Annual Code of Conduct Training", dueDate: "2026-08-15", type: "internal" },
      { name: "Vendor Security Assessment Review", dueDate: "2026-09-01", type: "contractual" },
    ],
    regulatoryChanges: [
      { title: "EU AI Act Implementation", jurisdiction: "EU", effectiveDate: "2026-08-01" },
      { title: "SEC Cybersecurity Disclosure Rules", jurisdiction: "US", effectiveDate: "2026-09-01" },
    ],
    riskTrends: [
      { month: "Jan", score: 84 },
      { month: "Feb", score: 86 },
      { month: "Mar", score: 82 },
      { month: "Apr", score: 88 },
      { month: "May", score: 90 },
      { month: "Jun", score: 91 },
    ],
    boardSummary: {
      totalPolicies: 34,
      activePolicies: 31,
      totalViolations: 47,
      resolvedViolations: 40,
      complianceScore: 91,
      nextReview: "2026-08-01",
    },
  };

  const maxScore = Math.max(...d.riskTrends.map((r) => r.score));
  const minScore = Math.min(...d.riskTrends.map((r) => r.score));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Executive Compliance Summary</h1>
          <p className="text-sm text-white/60 mt-1">Board-level compliance health and risk overview</p>
        </div>
        <div className="text-sm text-white/40">Last updated: {lastUpdated}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{loading ? "—" : `${d.healthScore}%`}</div>
              <div className="text-xs text-emerald-400">+{d.healthTrend}% from last month</div>
            </div>
          </div>
          <div className="text-xs text-white/50">Overall Compliance Health</div>
        </motion.div>

        {[
          { label: "Active Policies", value: d.boardSummary.activePolicies, total: d.boardSummary.totalPolicies, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Resolved Violations", value: d.boardSummary.resolvedViolations, total: d.boardSummary.totalViolations, icon: AlertTriangle, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Open Obligations", value: d.openObligations.length, total: null, icon: ClipboardList, color: "text-orange-400", bg: "bg-orange-500/10" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? "—" : card.value}</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-white/50">{card.label}</div>
              {card.total !== null && <div className="text-xs text-white/40">of {card.total}</div>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-semibold text-white">Risk Score Trend</h3>
            </div>
            <div className="flex items-end gap-2 h-32">
              {d.riskTrends.map((r, i) => (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-white/40">{r.score}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${((r.score - minScore + 10) / (maxScore - minScore + 20)) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`w-full rounded-t-lg ${
                      r.score >= 90 ? "bg-emerald-500/60" : r.score >= 85 ? "bg-gold-500/60" : "bg-orange-500/60"
                    }`}
                  />
                  <span className="text-[10px] text-white/40">{r.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-semibold text-white">High-Risk Violations</h3>
            </div>
            <div className="space-y-2">
              {d.highRiskViolations.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 ${v.severity === "critical" ? "text-red-400" : "text-orange-400"}`} />
                    <div>
                      <div className="text-sm text-white">{v.title}</div>
                      <div className="text-xs text-white/50">{v.owner}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    v.severity === "critical" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }`}>
                    {v.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-semibold text-white">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-2">
              {d.upcomingDeadlines.map((dl, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg">
                  <div className="text-sm text-white">{dl.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {dl.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-white/40">{dl.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Regulatory Changes</h3>
            </div>
            <div className="space-y-2">
              {d.regulatoryChanges.map((rc, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg">
                  <div className="text-sm text-white">{rc.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                    <span>{rc.jurisdiction}</span>
                    <span>&middot;</span>
                    <span>Effective: {rc.effectiveDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-semibold text-white">Board Summary</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Compliance Score", value: `${d.boardSummary.complianceScore}%` },
                { label: "Active Policies", value: `${d.boardSummary.activePolicies}/${d.boardSummary.totalPolicies}` },
                { label: "Violations Resolved", value: `${d.boardSummary.resolvedViolations}/${d.boardSummary.totalViolations}` },
                { label: "Next Board Review", value: d.boardSummary.nextReview },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-white/50">{item.label}</span>
                  <span className="text-sm text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
