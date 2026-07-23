"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, Clock, ThumbsUp, FolderOpen, Search, AlertTriangle,
  Activity, TrendingUp, User, Target, CheckCircle, Eye, TrendingDown
} from "lucide-react";

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "flat";
  icon: typeof BarChart3;
  color: string;
  bg: string;
}

interface ChartData {
  label: string;
  value: number;
  max: number;
}

const metrics: MetricCard[] = [
  { label: "Cross-Specialist Collaboration", value: "3.4", sub: "specialists per case", trend: "up", icon: Users, color: "text-gold-500", bg: "bg-gold-500/10" },
  { label: "Task Completion Rate", value: "92%", sub: "+5% vs last quarter", trend: "up", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Recommendation Adoption", value: "78%", sub: "+12% vs last quarter", trend: "up", icon: ThumbsUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { label: "Avg. Case Duration", value: "4.2 days", sub: "-1.1 days vs Q1", trend: "down", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Avg. Investigation Time", value: "6.8 hours", sub: "-2.3 hours vs Q1", trend: "down", icon: Search, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { label: "Escalation Frequency", value: "7%", sub: "of all cases", trend: "down", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
];

const specialistWorkload = [
  { name: "Alice Chen", activeCases: 8, tasksCompleted: 24, avgDuration: "3.2d" },
  { name: "Bob Martinez", activeCases: 5, tasksCompleted: 18, avgDuration: "3.8d" },
  { name: "Carol Nguyen", activeCases: 7, tasksCompleted: 22, avgDuration: "4.1d" },
  { name: "David Kim", activeCases: 6, tasksCompleted: 19, avgDuration: "3.5d" },
  { name: "Diana Lopez", activeCases: 4, tasksCompleted: 15, avgDuration: "5.2d" },
  { name: "Grace Liu", activeCases: 5, tasksCompleted: 17, avgDuration: "4.0d" },
];

const monthlyTrend: ChartData[] = [
  { label: "Jan", value: 18, max: 30 },
  { label: "Feb", value: 22, max: 30 },
  { label: "Mar", value: 28, max: 30 },
  { label: "Apr", value: 24, max: 30 },
  { label: "May", value: 30, max: 30 },
  { label: "Jun", value: 27, max: 30 },
];

const categoryBreakdown: ChartData[] = [
  { label: "Reconciliation", value: 35, max: 40 },
  { label: "Risk Assessment", value: 28, max: 40 },
  { label: "Compliance", value: 22, max: 40 },
  { label: "Credit Review", value: 18, max: 40 },
  { label: "Policy Violation", value: 15, max: 40 },
  { label: "Payment", value: 12, max: 40 },
];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Collaboration Analytics</h1>
          <p className="text-sm text-white/60 mt-1">Cross-specialist collaboration metrics and KPIs</p>
        </div>
        <div className="text-sm text-white/40">Q2 2026</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="text-xs text-white/50 mt-1">{m.sub}</div>
            <div className="flex items-center gap-1 mt-2">
              {m.trend === "up" ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : m.trend === "down" ? <TrendingDown className="w-3 h-3 text-red-400" /> : <Activity className="w-3 h-3 text-white/40" />}
              <span className={`text-[10px] ${m.trend === "up" ? "text-emerald-400" : m.trend === "down" ? "text-red-400" : "text-white/40"}`}>
                {m.trend === "up" ? "Improving" : m.trend === "down" ? "Declining" : "Stable"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Case Volume Trend (2026)</h2>
          <div className="flex items-end justify-between h-32 gap-2 pt-4">
            {monthlyTrend.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="text-[10px] text-white/40">{m.value}</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.value / m.max) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full bg-gold-500/60 rounded-t"
                  style={{ maxHeight: "120px" }}
                />
                <div className="text-[10px] text-white/50">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Case Categories</h2>
          <div className="space-y-3">
            {categoryBreakdown.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/80">{c.label}</span>
                  <span className="text-white/40">{c.value}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.value / c.max) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gold-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-gold-500" />
          Specialist Workload
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-white/40 border-b border-white/10">
                <th className="text-left py-2 pr-4">Specialist</th>
                <th className="text-right py-2 pr-4">Active Cases</th>
                <th className="text-right py-2 pr-4">Tasks Completed</th>
                <th className="text-right py-2">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {specialistWorkload.map((s, i) => (
                <motion.tr
                  key={s.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 text-white/80"
                >
                  <td className="py-3 pr-4">{s.name}</td>
                  <td className="text-right py-3 pr-4 text-white">{s.activeCases}</td>
                  <td className="text-right py-3 pr-4 text-emerald-400">{s.tasksCompleted}</td>
                  <td className="text-right py-3 text-white/60">{s.avgDuration}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Recommendation Adoption
          </h2>
          <div className="text-3xl font-bold text-white mb-1">78%</div>
          <div className="text-xs text-emerald-400">+12% vs last quarter</div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Accepted</span>
              <span className="text-white">42</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Rejected</span>
              <span className="text-white">8</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Implemented</span>
              <span className="text-white">14</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Case Resolution Time
          </h2>
          <div className="text-3xl font-bold text-white mb-1">4.2 days</div>
          <div className="text-xs text-emerald-400">-1.1 days vs Q1</div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Reconciliation</span>
              <span className="text-white">5.1d</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Compliance</span>
              <span className="text-white">3.8d</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Risk Assessment</span>
              <span className="text-white">6.2d</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Escalation Rate
          </h2>
          <div className="text-3xl font-bold text-white mb-1">7%</div>
          <div className="text-xs text-emerald-400">-2% vs Q1</div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Critical</span>
              <span className="text-red-400">2%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">High</span>
              <span className="text-orange-400">3%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Medium</span>
              <span className="text-amber-400">2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
