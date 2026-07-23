"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, ShieldCheck, AlertTriangle, TrendingUp, Clock,
  Lock, CheckCircle, XCircle, Activity, Calendar,
} from "lucide-react";

interface KeyMetric {
  label: string;
  value: string;
  icon: typeof ShieldCheck;
  color: string;
  bg: string;
}

interface FindingTrend {
  month: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ComplianceStatus {
  framework: string;
  status: "compliant" | "partial" | "non-compliant";
  lastAudit: string;
  nextAudit: string;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  date: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
}

const complianceColors: Record<string, string> = {
  compliant: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  partial: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "non-compliant": "bg-red-500/20 text-red-400 border-red-500/30",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function ExecutiveAuditSummary() {
  const [metrics, setMetrics] = useState<KeyMetric[]>([]);
  const [findingTrends, setFindingTrends] = useState<FindingTrend[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus[]>([]);
  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const [metricsRes, trendsRes, compRes, deadlinesRes] = await Promise.all([
          fetch("/api/audit/executive/metrics").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/executive/finding-trends").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/executive/compliance").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/executive/deadlines").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (metricsRes) setMetrics(metricsRes.metrics ?? []);
        if (trendsRes) setFindingTrends(trendsRes.trends ?? []);
        if (compRes) setCompliance(compRes.compliance ?? []);
        if (deadlinesRes) setDeadlines(deadlinesRes.deadlines ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    }
    load();
  }, []);

  const defaultMetrics: KeyMetric[] = [
    { label: "Audit Readiness", value: "87%", icon: ShieldCheck, color: "text-gold-500", bg: "bg-gold-500/10" },
    { label: "Open Findings", value: "14", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Remediation Rate", value: "87%", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Control Effectiveness", value: "94%", icon: Lock, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Overdue Items", value: "3", icon: Clock, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Days to Next Audit", value: "42", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  const defaultCompliance: ComplianceStatus[] = [
    { framework: "SOX 404", status: "compliant", lastAudit: "2026-03-15", nextAudit: "2026-09-15" },
    { framework: "ISO 27001", status: "compliant", lastAudit: "2026-02-20", nextAudit: "2027-02-20" },
    { framework: "SOC 2", status: "partial", lastAudit: "2026-01-10", nextAudit: "2026-07-10" },
    { framework: "GDPR", status: "compliant", lastAudit: "2026-04-01", nextAudit: "2027-04-01" },
  ];

  const displayCompliance = compliance.length > 0 ? compliance : defaultCompliance;

  const defaultDeadlines: UpcomingDeadline[] = [
    { id: "1", title: "SOX 404 Testing Completion", date: "2026-08-15", type: "regulatory", priority: "critical" },
    { id: "2", title: "Q3 Evidence Package Due", date: "2026-09-30", type: "filing", priority: "high" },
    { id: "3", title: "ISO 27001 Surveillance Audit", date: "2026-10-15", type: "engagement", priority: "high" },
    { id: "4", title: "Board Audit Committee Meeting", date: "2026-08-01", type: "meeting", priority: "medium" },
  ];

  const displayDeadlines = deadlines.length > 0 ? deadlines : defaultDeadlines;

  const defaultTrends: FindingTrend[] = [
    { month: "Jan", critical: 1, high: 3, medium: 5, low: 2 },
    { month: "Feb", critical: 2, high: 2, medium: 4, low: 3 },
    { month: "Mar", critical: 0, high: 4, medium: 6, low: 2 },
    { month: "Apr", critical: 1, high: 2, medium: 3, low: 4 },
    { month: "May", critical: 0, high: 3, medium: 5, low: 3 },
    { month: "Jun", critical: 2, high: 1, medium: 4, low: 2 },
    { month: "Jul", critical: 1, high: 2, medium: 3, low: 1 },
  ];

  const displayTrends = findingTrends.length > 0 ? findingTrends : defaultTrends;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Executive Audit Summary</h1>
          <p className="text-sm text-white/60 mt-1">High-level audit metrics, compliance, and critical deadlines</p>
        </div>
        <div className="text-sm text-white/40">Last updated: {lastUpdated}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {displayMetrics.map((m, i) => (
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
            <div className="text-2xl font-bold text-white">{loading ? "—" : m.value}</div>
            <div className="text-xs text-white/50 mt-1">{m.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Finding Trends</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-end gap-1 h-48">
              {displayTrends.map((t, i) => {
                const total = t.critical + t.high + t.medium + t.low;
                const maxTotal = Math.max(...displayTrends.map((x) => x.critical + x.high + x.medium + x.low), 1);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="text-[10px] text-white/50 mb-1">{total}</div>
                    <div className="w-full flex flex-col-reverse" style={{ height: `${(total / maxTotal) * 100}%` }}>
                      <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ delay: i * 0.05, duration: 0.3 }} className="w-full bg-blue-400/40 rounded-t" style={{ flex: t.low }} />
                      <div className="w-full bg-yellow-400/40" style={{ flex: t.medium }} />
                      <div className="w-full bg-orange-400/40" style={{ flex: t.high }} />
                      <div className="w-full bg-red-400/40 rounded-b" style={{ flex: t.critical }} />
                    </div>
                    <div className="text-[10px] text-white/40 mt-1">{t.month}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-red-400/60" /><span className="text-[10px] text-white/50">Critical</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-orange-400/60" /><span className="text-[10px] text-white/50">High</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-yellow-400/60" /><span className="text-[10px] text-white/50">Medium</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-blue-400/60" /><span className="text-[10px] text-white/50">Low</span></div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">Compliance Status</h2>
          <div className="space-y-2">
            {displayCompliance.map((c) => (
              <div key={c.framework} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white font-medium">{c.framework}</div>
                  <div className="text-xs text-white/50 mt-1">Last: {c.lastAudit} &middot; Next: {c.nextAudit}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${complianceColors[c.status]}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Deadlines</h2>
          <div className="space-y-2">
            {displayDeadlines.map((d) => (
              <div key={d.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-white/40 shrink-0" />
                  <div>
                    <div className="text-sm text-white">{d.title}</div>
                    <div className="text-xs text-white/50 mt-1">{d.date} &middot; {d.type}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${priorityColors[d.priority]}`}>{d.priority}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-semibold text-white">Quick Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Control Effectiveness</span>
                <span className="text-sm text-emerald-400 font-medium">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Avg Finding Age</span>
                <span className="text-sm text-blue-400 font-medium">18 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Audit Coverage</span>
                <span className="text-sm text-gold-500 font-medium">91%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Critical Open</span>
                <span className="text-sm text-red-400 font-medium">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
