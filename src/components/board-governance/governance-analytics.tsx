"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, CheckCircle, Clock, Users, Scale, Calendar, Target,
} from "lucide-react";

interface GovernanceMetrics {
  healthScore: number;
  meetingEffectiveness: number;
  resolutionCompletionRate: number;
  actionCompletionRate: number;
  averageAttendance: number;
  decisionCycleDays: number;
}

interface TrendData {
  label: string;
  value: number;
  change: number;
  changeLabel: string;
}

export function GovernanceAnalytics() {
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/board/analytics").then((r) => (r.ok ? r.json() : null));
        if (res) setMetrics(res);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    }
    load();
  }, []);

  const m = metrics ?? {
    healthScore: 92,
    meetingEffectiveness: 88,
    resolutionCompletionRate: 94,
    actionCompletionRate: 82,
    averageAttendance: 96.2,
    decisionCycleDays: 12,
  };

  const kpis: TrendData[] = [
    { label: "Governance Health", value: m.healthScore, change: 3, changeLabel: "vs last quarter" },
    { label: "Meeting Effectiveness", value: m.meetingEffectiveness, change: 5, changeLabel: "vs last quarter" },
    { label: "Resolution Completion", value: m.resolutionCompletionRate, change: 2, changeLabel: "vs last quarter" },
    { label: "Action Completion", value: m.actionCompletionRate, change: -3, changeLabel: "vs last quarter" },
    { label: "Average Attendance", value: m.averageAttendance, change: 1.2, changeLabel: "vs last quarter" },
    { label: "Decision Cycle", value: m.decisionCycleDays, change: -2, changeLabel: "days faster" },
  ];

  const meetingData = [
    { month: "Jan", meetings: 2, attendance: 95 },
    { month: "Feb", meetings: 1, attendance: 98 },
    { month: "Mar", meetings: 2, attendance: 92 },
    { month: "Apr", meetings: 3, attendance: 94 },
    { month: "May", meetings: 1, attendance: 97 },
    { month: "Jun", meetings: 2, attendance: 96 },
    { month: "Jul", meetings: 3, attendance: 96 },
  ];

  const attendanceByMember = [
    { name: "Sarah Chen", rate: 100 },
    { name: "Michael Torres", rate: 95 },
    { name: "Priya Sharma", rate: 92 },
    { name: "James Wilson", rate: 88 },
    { name: "Elena Volkov", rate: 97 },
    { name: "David Kim", rate: 100 },
  ];

  const resolutionStats = [
    { type: "Ordinary", passed: 10, failed: 1, pending: 2 },
    { type: "Special", passed: 3, failed: 0, pending: 1 },
    { type: "Circular", passed: 1, failed: 0, pending: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Governance Analytics</h1>
          <p className="text-sm text-white/60 mt-1">Board governance performance and insights</p>
        </div>
        <div className="text-sm text-white/40">Last updated: {lastUpdated}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => {
          const isReverse = kpi.label === "Decision Cycle";
          const isPositive = isReverse ? kpi.change < 0 : kpi.change > 0;
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-xs text-white/50 mb-2">{kpi.label}</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-white">{isReverse ? `${kpi.value}d` : `${kpi.value}%`}</div>
                <div className={`text-xs font-medium mb-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {isPositive ? "+" : ""}{kpi.change}{isReverse ? "" : "%"} {kpi.changeLabel}
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
                <div className={`h-full rounded-full ${isPositive ? "bg-emerald-400" : "bg-red-400"}`} style={{ width: `${isReverse ? Math.min(100, (30 - kpi.value) / 30 * 100) : kpi.value}%` }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-gold-500" /> Meeting Activity</h2>
          <div className="space-y-3">
            {meetingData.map((d, i) => (
              <div key={d.month} className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-8">{d.month}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: d.meetings }).map((_, j) => (
                      <div key={j} className="w-4 h-4 rounded bg-gold-500/30" />
                    ))}
                  </div>
                  <span className="text-xs text-white/40 ml-auto">{d.meetings} meetings</span>
                </div>
                <span className="text-xs text-emerald-400 w-12 text-right">{d.attendance}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-gold-500" /> Attendance by Member</h2>
          <div className="space-y-3">
            {attendanceByMember.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs text-white/70 w-32 truncate">{a.name}</span>
                <div className="flex-1">
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${a.rate >= 95 ? "bg-emerald-400" : a.rate >= 85 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${a.rate}%` }} />
                  </div>
                </div>
                <span className="text-xs text-white/50 w-10 text-right">{a.rate}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Scale className="w-4 h-4 text-gold-500" /> Resolution Statistics</h2>
          <div className="space-y-4">
            {resolutionStats.map((r) => {
              const total = r.passed + r.failed + r.pending;
              return (
                <div key={r.type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/70">{r.type}</span>
                    <span className="text-xs text-white/40">{total} total</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500" style={{ width: `${(r.passed / total) * 100}%` }} />
                    <div className="bg-red-500" style={{ width: `${(r.failed / total) * 100}%` }} />
                    <div className="bg-amber-500" style={{ width: `${(r.pending / total) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px]">
                    <span className="text-emerald-400">Passed: {r.passed}</span>
                    <span className="text-red-400">Failed: {r.failed}</span>
                    <span className="text-amber-400">Pending: {r.pending}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-gold-500" /> Governance Insights</h2>
          <div className="space-y-3">
            {[
              { title: "Attendance improving", detail: "Average attendance increased 1.2% this quarter, driven by virtual meeting option.", color: "text-emerald-400" },
              { title: "Decision cycle faster", detail: "Average decision cycle reduced from 14 to 12 days. Board pack pre-read contributing.", color: "text-emerald-400" },
              { title: "Action items lagging", detail: "Action completion rate dropped 3%. Consider adding follow-up cadence.", color: "text-amber-400" },
              { title: "Risk committee active", detail: "Highest meeting frequency committee. 100% attendance this quarter.", color: "text-blue-400" },
            ].map((insight, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <div className={`text-sm font-medium ${insight.color}`}>{insight.title}</div>
                <div className="text-xs text-white/50 mt-1">{insight.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
