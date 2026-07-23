"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Network, FolderOpen, ListTodo, ThumbsUp, Scale, Users, Clock,
  ChevronRight, AlertTriangle, Activity, Target, Eye, CheckCircle, XCircle, Search, BarChart3, Brain, FileSearch
} from "lucide-react";
import { Card, Badge, Button } from "@/design-system";

interface DashboardStats {
  openCases: number;
  activeTasks: number;
  pendingRecommendations: number;
  pendingDecisions: number;
  activeAssignments: number;
  workQueueItems: number;
}

interface TimelineEvent {
  id: string;
  type: string;
  description: string;
  caseTitle: string;
  timestamp: string;
  source: string;
}

interface TopAlert {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  timestamp: string;
}

const quickLinks = [
  { label: "Case Management", href: "/finance/cases", icon: FolderOpen, color: "text-[var(--color-gold)]" },
  { label: "Collaboration Timeline", href: "/finance/timeline", icon: Clock, color: "text-blue-400" },
  { label: "Assignment Board", href: "/finance/assignments", icon: Users, color: "text-purple-400" },
  { label: "Work Queue", href: "/finance/work-queue", icon: ListTodo, color: "text-emerald-400" },
  { label: "Evidence Center", href: "/finance/evidence", icon: FileSearch, color: "text-amber-400" },
  { label: "Recommendations", href: "/finance/recommendations", icon: ThumbsUp, color: "text-indigo-400" },
  { label: "Decision Center", href: "/finance/decisions", icon: Scale, color: "text-rose-400" },
  { label: "Analytics", href: "/finance/analytics", icon: BarChart3, color: "text-teal-400" },
  { label: "Enterprise Memory", href: "/finance/memory", icon: Brain, color: "text-cyan-400" },
];

const severityBadgeVariant: Record<string, "danger" | "warning" | "gold" | "success"> = {
  critical: "danger",
  high: "warning",
  medium: "gold",
  low: "success",
};

const eventIcon: Record<string, typeof Network> = {
  assignment: Users,
  recommendation: ThumbsUp,
  evidence: FileSearch,
  approval: CheckCircle,
  comment: Activity,
  investigation: Search,
  decision: Scale,
  escalation: AlertTriangle,
};

const defaultEvents: TimelineEvent[] = [
  { id: "e1", type: "decision", description: "FX hedging strategy approved for Q3", caseTitle: "FX Strategy Review", timestamp: "10 min ago", source: "System" },
  { id: "e2", type: "assignment", description: "Assigned to review counterparty risk limits", caseTitle: "Counterparty Risk Assessment", timestamp: "25 min ago", source: "Treasury Specialist" },
  { id: "e3", type: "evidence", description: "New evidence uploaded from ledger reconciliation", caseTitle: "Ledger Discrepancy #43021", timestamp: "1 hour ago", source: "Reconciliation Engine" },
  { id: "e4", type: "comment", description: "Added meeting notes regarding credit limit increase", caseTitle: "Credit Limit Review", timestamp: "2 hours ago", source: "Senior Analyst" },
  { id: "e5", type: "escalation", description: "Policy violation flagged: cash concentration limit breached", caseTitle: "Cash Concentration Alert", timestamp: "3 hours ago", source: "Policy Engine" },
];

export function FinanceCommandCenter() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<TopAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          fetch("/api/finance/dashboard/stats").then((r) => r.ok ? r.json() : null),
          fetch("/api/finance/dashboard/alerts").then((r) => r.ok ? r.json() : null),
        ]);
        if (statsRes) setStats(statsRes);
        if (alertsRes) setAlerts(alertsRes.alerts ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    }
    load();
  }, []);

  const s = stats ?? {
    openCases: 24,
    activeTasks: 12,
    pendingRecommendations: 8,
    pendingDecisions: 5,
    activeAssignments: 29,
    workQueueItems: 47,
  };

  const statCards = [
    { label: "Open Cases", value: s.openCases, icon: FolderOpen, color: "text-[var(--color-gold)]", bg: "bg-[var(--color-gold-muted)]/20" },
    { label: "Active Tasks", value: s.activeTasks, icon: ListTodo, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Pending Recommendations", value: s.pendingRecommendations, icon: ThumbsUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Pending Decisions", value: s.pendingDecisions, icon: Scale, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Active Assignments", value: s.activeAssignments, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Work Queue Items", value: s.workQueueItems, icon: ListTodo, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  const a = alerts.length > 0 ? alerts : [
    { id: "a1", title: "Cash concentration limit violation in EMEA region", severity: "critical" as const, category: "Policy Violation", timestamp: "5 min ago" },
    { id: "a2", title: "Counterparty risk threshold breached for supplier ABC", severity: "high" as const, category: "Risk", timestamp: "15 min ago" },
    { id: "a3", title: "Pending approval overdue: Wire transfer $450K", severity: "medium" as const, category: "Approval", timestamp: "1 hour ago" },
    { id: "a4", title: "New evidence available for case #43021", severity: "low" as const, category: "Evidence", timestamp: "2 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Finance Command Center</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Enterprise finance collaboration and workflow management</p>
        </div>
        <div className="text-sm text-[var(--text-disabled)]">
          Last updated: {lastUpdated}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-stat-${i}`} className="animate-pulse bg-white/5 rounded-xl h-28" />
            ))
          : statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{card.value}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">{card.label}</div>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Navigation</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-nav-${i}`} className="animate-pulse bg-white/5 rounded-xl h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl p-4 hover:bg-[var(--surface-tertiary)] transition-colors group"
                >
                  <link.icon className={`w-6 h-6 ${link.color} mb-2`} />
                  <div className="text-sm text-[var(--text-primary)] group-hover:text-[var(--color-gold)] transition-colors">{link.label}</div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-disabled)] mt-2 group-hover:text-[var(--color-gold)] transition-colors" />
                </a>
              ))}
            </div>
          )}

          <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-6">Recent Timeline Events</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-timeline-${i}`} className="animate-pulse bg-white/5 rounded-xl h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {defaultEvents.map((e) => {
                const Icon = eventIcon[e.type] || Activity;
                return (
                  <Card key={e.id} padding="sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[var(--surface-tertiary)] rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[var(--color-gold)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--text-primary)]">{e.description}</div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-1">{e.caseTitle}</div>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--text-disabled)] mt-1">
                          <span>{e.source}</span>
                          <span>{e.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Top Alerts</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-alert-${i}`} className="animate-pulse bg-white/5 rounded-xl h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {a.map((alert) => (
                <Card key={alert.id} padding="sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text-primary)] truncate">{alert.title}</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">{alert.category}</div>
                    </div>
                    <Badge variant={severityBadgeVariant[alert.severity]} size="sm">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-[var(--text-disabled)] mt-2">{alert.timestamp}</div>
                </Card>
              ))}
            </div>
          )}

          {loading ? (
            <div className="animate-pulse bg-white/5 rounded-xl h-20 mt-4" />
          ) : (
            <Card padding="md" className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-[var(--color-gold)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Collaboration Metrics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-tertiary)]">Avg. Case Duration</span>
                  <span className="text-sm text-[var(--text-primary)] font-medium">4.2 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-tertiary)]">Resolution Rate</span>
                  <span className="text-sm text-[var(--color-success)] font-medium">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-tertiary)]">Specialists per Case</span>
                  <span className="text-sm text-[var(--color-gold)] font-medium">3.4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-tertiary)]">Recommendation Adoption</span>
                  <span className="text-sm text-[var(--color-info)] font-medium">78%</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
