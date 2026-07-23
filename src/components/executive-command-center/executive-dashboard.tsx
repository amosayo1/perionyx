"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown, DollarSign, Droplets, FileCheck, Shield, ShieldCheck, Scale,
  Brain, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  ChevronRight, Bell, Calendar, FileText, Target, BarChart3, Lightbulb,
  ThumbsUp, ThumbsDown, BookOpen, Briefcase, ArrowUpRight, Activity,
  ShieldAlert,
} from "lucide-react";
import { Card, Badge, Skeleton, Alert, StatusDot, Button, IconButton } from "@/design-system";

interface HealthDomain {
  name: string;
  score: number;
  color: string;
}

interface HealthScore {
  overall: number;
  domains: HealthDomain[];
}

interface ExecutiveMetric {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  trendValue: string;
  source: string;
  icon: string;
}

interface CriticalAlert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  specialist: string;
  impact: string;
  status: "pending" | "accepted" | "rejected";
}

interface BoardPack {
  id: string;
  name: string;
  status: "ready" | "in-progress" | "pending";
  dueDate: string;
  completionPercent: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
}

interface SpecialistHighlight {
  specialist: string;
  title: string;
  highlights: string[];
}

interface RiskCategory {
  name: string;
  score: number;
  risks: { id: string; title: string; level: string }[];
}

interface DashboardData {
  healthScore: HealthScore;
  metrics: ExecutiveMetric[];
  criticalAlerts: CriticalAlert[];
  recommendations: Recommendation[];
  boardPacks: BoardPack[];
  calendarEvents: CalendarEvent[];
  dailyBriefing: SpecialistHighlight[];
  riskSummary: RiskCategory[];
}

const riskLevelColors: Record<string, string> = {
  critical: "text-[var(--color-danger)]",
  high: "text-[var(--color-warning)]",
  medium: "text-[var(--color-gold)]",
  low: "text-[var(--color-info)]",
};

export function ExecutiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [acceptedRecs, setAcceptedRecs] = useState<Set<string>>(new Set());
  const [rejectedRecs, setRejectedRecs] = useState<Set<string>>(new Set());
  const [expandedBriefings, setExpandedBriefings] = useState<Set<number>>(new Set());
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/executive/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(getDefaultData());
        }
      } catch {
        setData(getDefaultData());
      } finally {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    }
    load();
  }, []);

  function toggleAlertAcknowledge(id: string) {
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleRecAccept(id: string) {
    setAcceptedRecs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleRecReject(id: string) {
    setRejectedRecs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleBriefing(index: number) {
    setExpandedBriefings((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const d = data ?? getDefaultData();
  const h = d.healthScore;
  const overallColor = h.overall >= 80 ? "text-emerald-400" : h.overall >= 60 ? "text-amber-400" : "text-red-400";
  const overallStroke = h.overall >= 80 ? "var(--color-success)" : h.overall >= 60 ? "var(--color-warning)" : "var(--color-danger)";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3">
            <Crown className="w-7 h-7 text-[var(--color-gold)]" />
            Executive Command Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Unified enterprise health, alerts, and recommendations</p>
        </div>
        <div className="text-sm text-[var(--text-disabled)]">Last updated: {loading ? "\u2014" : lastUpdated}</div>
      </div>

      {error && (
        <Alert variant="danger" role="alert">{error}</Alert>
      )}

      {/* Health Score */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Enterprise Health Score</h2>
        {loading ? (
          <div className="flex gap-6"><Skeleton className="w-40 h-40 rounded-full" /><div className="flex-1 space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div></div>
        ) : (
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border-subtle)" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="none" stroke={overallStroke} strokeWidth="12" strokeDasharray={`${(h.overall / 100) * 440} 440`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${overallColor}`}>{h.overall}</span>
                <span className="text-xs text-[var(--text-disabled)]">Overall</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {h.domains.map((domain) => (
                <div key={domain.name} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-secondary)] w-28 text-right">{domain.name}</span>
                  <div className="flex-1 h-2 bg-[var(--surface-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${domain.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: domain.color }}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] w-8 text-right">{domain.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          d.metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-tertiary)]">{m.label}</span>
                  {m.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                  ) : m.trend === "down" ? (
                    <TrendingDown className="w-4 h-4 text-[var(--color-danger)]" />
                  ) : (
                    <Activity className="w-4 h-4 text-[var(--text-disabled)]" />
                  )}
                </div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{m.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${m.trend === "up" ? "text-[var(--color-success)]" : m.trend === "down" ? "text-[var(--color-danger)]" : "text-[var(--text-disabled)]"}`}>
                    {m.trendValue}
                  </span>
                  <Badge variant="info" size="sm">{m.source}</Badge>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Alerts + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--color-danger)]" />
              Critical Alerts
            </h2>
            <Link href="/executive/alerts" className="text-xs text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2">
              {d.criticalAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`${acknowledgedAlerts.has(alert.id) ? "opacity-50" : ""}`}>
                  <Card padding="sm" variant={alert.severity === "critical" ? "danger" : "default"}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={alert.severity === "critical" ? "danger" : alert.severity === "high" ? "warning" : alert.severity === "medium" ? "gold" : "info"} size="sm">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-[var(--text-primary)] truncate">{alert.title}</span>
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] line-clamp-1">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[var(--text-disabled)]">{alert.source}</span>
                          <span className="text-[10px] text-[var(--text-disabled)]">{alert.timestamp}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => toggleAlertAcknowledge(alert.id)}
                      >
                        {acknowledgedAlerts.has(alert.id) ? "Undo" : "Ack"}
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
              {d.criticalAlerts.length === 0 && (
                <div className="text-center py-8 text-[var(--text-disabled)] text-sm">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-[var(--color-success)]" />
                  No critical alerts
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[var(--color-gold)]" />
              Executive Recommendations
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2">
              {d.recommendations.slice(0, 5).map((rec) => (
                <div key={rec.id}>
                  <Card padding="sm" variant={acceptedRecs.has(rec.id) ? "success" : rejectedRecs.has(rec.id) ? "danger" : "default"}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--text-primary)] mb-1">{rec.title}</div>
                        <p className="text-xs text-[var(--text-tertiary)] line-clamp-1">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="info" size="sm">{rec.specialist}</Badge>
                          <span className="text-[10px] text-[var(--text-disabled)]">Impact: {rec.impact}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <IconButton
                          aria-label="Accept recommendation"
                          size="xs"
                          icon={<ThumbsUp className="w-3.5 h-3.5" />}
                          onClick={() => toggleRecAccept(rec.id)}
                          className={acceptedRecs.has(rec.id) ? "bg-[var(--color-success-muted)] text-[var(--color-success)]" : ""}
                        />
                        <IconButton
                          aria-label="Reject recommendation"
                          size="xs"
                          icon={<ThumbsDown className="w-3.5 h-3.5" />}
                          onClick={() => toggleRecReject(rec.id)}
                          className={rejectedRecs.has(rec.id) ? "bg-[var(--color-danger-muted)] text-[var(--color-danger)]" : ""}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Board Packs + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Board Pack Status */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-[var(--color-info)]" />
            Board Pack Status
          </h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2">
              {d.boardPacks.map((pack) => (
                <Card key={pack.id} padding="sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--text-primary)]">{pack.name}</span>
                    <Badge variant={pack.status === "ready" ? "success" : pack.status === "in-progress" ? "warning" : "muted"} size="sm">
                      {pack.status === "ready" ? "READY" : pack.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[var(--surface-tertiary)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-gold)] rounded-full" style={{ width: `${pack.completionPercent}%` }} />
                    </div>
                    <span className="text-xs text-[var(--text-disabled)]">{pack.completionPercent}%</span>
                    <span className="text-[10px] text-[var(--text-disabled)]">Due: {pack.dueDate}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Executive Calendar */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[var(--color-info)]" />
            Executive Calendar
          </h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2">
              {d.calendarEvents.slice(0, 5).map((event) => (
                <Card key={event.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface-tertiary)] flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-[var(--text-disabled)]">{new Date(event.date).toLocaleDateString("en-US", { month: "short" })}</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{new Date(event.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text-primary)] truncate">{event.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-disabled)]">{event.time}</span>
                        <Badge variant="muted" size="sm">{event.type}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Daily Briefing */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[var(--color-gold)]" />
          Daily Executive Briefing
        </h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-2">
            {d.dailyBriefing.map((brief, i) => (
              <Card key={i} padding="none" variant="default">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBriefing(i)}
                  className="w-full p-3 flex items-center justify-between text-left hover:bg-[var(--surface-tertiary)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="info" size="sm">{brief.specialist}</Badge>
                    <span className="text-sm text-[var(--text-primary)]">{brief.title}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-[var(--text-disabled)] transition-transform ${expandedBriefings.has(i) ? "rotate-90" : ""}`} />
                </Button>
                {expandedBriefings.has(i) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-3 pb-3 border-t border-[var(--border-subtle)]"
                  >
                    <ul className="mt-2 space-y-1">
                      {brief.highlights.map((h, j) => (
                        <li key={j} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                          <span className="text-[var(--color-gold)] mt-0.5">&#x2022;</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Risk Summary */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-[var(--color-warning)]" />
          Enterprise Risk Summary
        </h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {d.riskSummary.map((cat) => (
              <Card key={cat.name} padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-primary)]">{cat.name}</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">{cat.score}</span>
                </div>
                <div className="space-y-1">
                  {cat.risks.slice(0, 3).map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between">
                      <span className="text-[11px] text-[var(--text-tertiary)] truncate">{risk.title}</span>
                      <span className={`text-[10px] font-medium ${riskLevelColors[risk.level] ?? "text-[var(--text-disabled)]"}`}>
                        {risk.level.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function getDefaultData(): DashboardData {
  return {
    healthScore: {
      overall: 82,
      domains: [
        { name: "Financial", score: 88, color: "#34d399" },
        { name: "Treasury", score: 76, color: "#60a5fa" },
        { name: "Operational", score: 84, color: "#a78bfa" },
        { name: "Compliance", score: 91, color: "#f472b6" },
        { name: "Risk", score: 72, color: "#fbbf24" },
        { name: "Governance", score: 85, color: "#818cf8" },
        { name: "Strategic", score: 79, color: "#2dd4bf" },
        { name: "Collaborative", score: 81, color: "#fb923c" },
      ],
    },
    metrics: [
      { label: "Cash Position", value: "$47.2M", trend: "up", trendValue: "+3.2%", source: "Treasury", icon: "DollarSign" },
      { label: "Liquidity Ratio", value: "2.4x", trend: "up", trendValue: "+0.1x", source: "Treasury", icon: "Droplets" },
      { label: "Close Readiness", value: "94%", trend: "up", trendValue: "+2%", source: "Controller", icon: "FileCheck" },
      { label: "Audit Score", value: "87", trend: "flat", trendValue: "unchanged", source: "Audit", icon: "Shield" },
      { label: "Compliance Score", value: "91", trend: "up", trendValue: "+3", source: "Compliance", icon: "ShieldCheck" },
      { label: "Tax Health", value: "96%", trend: "up", trendValue: "+1%", source: "Tax", icon: "Scale" },
    ],
    criticalAlerts: [
      { id: "a1", title: "Treasury cash below policy minimum", message: "Operating account at $2.1M, policy requires $3.0M minimum.", severity: "critical", source: "Treasury", timestamp: "12 min ago", acknowledged: false },
      { id: "a2", title: "SOX control exception detected", message: "Segregation of duties violation in AP approval workflow.", severity: "high", source: "Audit", timestamp: "45 min ago", acknowledged: false },
      { id: "a3", title: "Transfer pricing documentation overdue", message: "DE-SG intercompany documentation past 30-day deadline.", severity: "high", source: "Tax", timestamp: "1 hr ago", acknowledged: false },
      { id: "a4", title: "FX exposure exceeds threshold", message: "EUR/USD net exposure $12.4M, threshold is $10M.", severity: "medium", source: "Risk", timestamp: "2 hrs ago", acknowledged: false },
      { id: "a5", title: "Board pack draft pending review", message: "Q2 board pack awaiting CFO sign-off.", severity: "low", source: "Governance", timestamp: "3 hrs ago", acknowledged: false },
    ],
    recommendations: [
      { id: "r1", title: "Execute FX hedge for EUR exposure", description: "Lock forward contracts for $8M of EUR exposure before rate deterioration.", specialist: "Treasury", impact: "High", status: "pending" },
      { id: "r2", title: "Accelerate AP batch processing", description: "Current batch cycle at 48hrs, target is 24hrs. Reallocate 2 FTEs.", specialist: "Controller", impact: "Medium", status: "pending" },
      { id: "r3", title: "Remediate SOX finding #2024-087", description: "Implement dual-approval for payments >$50K to resolve control exception.", specialist: "Audit", impact: "High", status: "pending" },
      { id: "r4", title: "Update transfer pricing policy", description: "Align DE-SG margin with OECD guidelines to avoid penalties.", specialist: "Tax", impact: "High", status: "pending" },
      { id: "r5", title: "Consolidate bank accounts", description: "Merge 3 underutilized accounts to save $120K/yr in fees.", specialist: "Treasury", impact: "Low", status: "pending" },
    ],
    boardPacks: [
      { id: "bp1", name: "Q2 2026 Board Pack", status: "in-progress", dueDate: "2026-07-25", completionPercent: 72 },
      { id: "bp2", name: "Audit Committee Report", status: "ready", dueDate: "2026-07-20", completionPercent: 100 },
      { id: "bp3", name: "Risk Committee Briefing", status: "pending", dueDate: "2026-07-28", completionPercent: 30 },
    ],
    calendarEvents: [
      { id: "e1", title: "Board of Directors Meeting", date: "2026-07-25", time: "09:00 AM", type: "Board" },
      { id: "e2", title: "Treasury Weekly Review", date: "2026-07-21", time: "10:00 AM", type: "Internal" },
      { id: "e3", title: "SOX Compliance Call", date: "2026-07-22", time: "02:00 PM", type: "Compliance" },
      { id: "e4", title: "FX Strategy Discussion", date: "2026-07-23", time: "11:00 AM", type: "Treasury" },
      { id: "e5", title: "Q2 Close Review", date: "2026-07-24", time: "03:00 PM", type: "Close" },
    ],
    dailyBriefing: [
      { specialist: "Treasury", title: "Treasury Highlights", highlights: ["Cash position stable at $47.2M, up 3.2% from last week.", "EUR/USD exposure requires attention — exceeds $10M threshold.", "Liquidity ratio improved to 2.4x, well above 1.5x minimum."] },
      { specialist: "Controller", title: "Close & Accounting", highlights: ["Close readiness at 94%, 6 tasks remaining.", "Journal review queue cleared — 0 backlog.", "Reconciliations 89% complete, 12 accounts pending."] },
      { specialist: "Audit", title: "Audit & Controls", highlights: ["SOX finding #2024-087 requires remediation by July 31.", "Continuous audit score stable at 87/100.", "3 control exceptions pending resolution."] },
      { specialist: "Compliance", title: "Compliance Update", highlights: ["Overall compliance score improved to 91.", "No new regulatory changes detected this week.", "Policy review cycle on track for Q3 completion."] },
      { specialist: "Tax", title: "Tax Summary", highlights: ["Effective tax rate at 21.4%, within target range.", "Transfer pricing documentation overdue — action required.", "R&D tax credit opportunity identified for APAC operations."]},
    ],
    riskSummary: [
      { name: "Financial", score: 72, risks: [{ id: "fr1", title: "Cash shortfall risk", level: "high" }, { id: "fr2", title: "Credit concentration", level: "medium" }, { id: "fr3", title: "Interest rate spike", level: "medium" }] },
      { name: "Operational", score: 68, risks: [{ id: "or1", title: "System downtime", level: "medium" }, { id: "or2", title: "Key person dependency", level: "high" }, { id: "or3", title: "Process bottleneck", level: "low" }] },
      { name: "Compliance", score: 85, risks: [{ id: "cr1", title: "SOX exception", level: "high" }, { id: "cr2", title: "Regulatory change", level: "medium" }, { id: "cr3", title: "Policy gap", level: "low" }] },
      { name: "Strategic", score: 76, risks: [{ id: "sr1", title: "Market volatility", level: "medium" }, { id: "sr2", title: "Competitive pressure", level: "medium" }, { id: "sr3", title: "Talent shortage", level: "high" }] },
    ],
  };
}
