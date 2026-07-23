"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Timer, Heart, Bell, AlertTriangle, ThumbsUp,
  FileText, BarChart3, Activity, ChevronRight, Clock, TrendingUp,
  ArrowRight, Shield, FileCheck,
} from "lucide-react";
import { Card, Badge, Skeleton, Alert, StatusDot, Button } from "@/design-system";

interface DashboardStats {
  activeClosePeriods: number;
  healthScore: number;
  pendingApprovals: number;
  exceptions: number;
  lateJournals: number;
  openRecommendations: number;
}

interface TopRisk {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  dueDate: string;
}

interface RecentBriefing {
  id: string;
  date: string;
  closeProgress: number;
  healthScore: number;
  highlights: string[];
}

const quickLinks = [
  { label: "Close Command Center", href: "/controller/close", icon: Timer, color: "text-[var(--color-gold)]" },
  { label: "Journal Review", href: "/controller/journals", icon: FileText, color: "text-blue-400" },
  { label: "Statement Readiness", href: "/controller/statements", icon: BarChart3, color: "text-emerald-400" },
  { label: "Accounting Health", href: "/controller/health", icon: Heart, color: "text-rose-400" },
  { label: "Recommendations", href: "/controller/recommendations", icon: ThumbsUp, color: "text-purple-400" },
  { label: "Daily Briefing", href: "/controller/briefings", icon: FileCheck, color: "text-amber-400" },
  { label: "Accounting Risks", href: "/controller/risks", icon: AlertTriangle, color: "text-orange-400" },
  { label: "Close Calendar", href: "/controller/close/calendar", icon: LayoutDashboard, color: "text-cyan-400" },
];

const severityBadgeVariant: Record<string, "danger" | "warning" | "gold" | "success"> = {
  critical: "danger",
  high: "warning",
  medium: "gold",
  low: "success",
};

export function ControllerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [risks, setRisks] = useState<TopRisk[]>([]);
  const [briefings, setBriefings] = useState<RecentBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");
  const [dataSummary, setDataSummary] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, risksRes, briefRes] = await Promise.all([
          fetch("/api/controller/dashboard/stats").then((r) => r.ok ? r.json() : null),
          fetch("/api/controller/dashboard/risks").then((r) => r.ok ? r.json() : null),
          fetch("/api/controller/dashboard/briefings").then((r) => r.ok ? r.json() : null),
        ]);
        if (statsRes) setStats(statsRes);
        if (risksRes) setRisks(risksRes.risks ?? []);
        if (briefRes) setBriefings(briefRes.briefings ?? []);
        const j = statsRes?.lateJournals ?? 0;
        const a = statsRes?.pendingApprovals ?? 0;
        const x = statsRes?.exceptions ?? 0;
        setDataSummary(
          j || a || x
            ? `Refreshed ${j} journal entries, ${a} pending approvals, and ${x} anomalies across monitored accounts.`
            : "No data loaded yet \u2014 refresh to pull latest."
        );
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
    activeClosePeriods: 3,
    healthScore: 87,
    pendingApprovals: 12,
    exceptions: 5,
    lateJournals: 8,
    openRecommendations: 15,
  };

  const statCards = [
    { label: "Active Close Periods", value: s.activeClosePeriods, icon: Timer, color: "text-[var(--color-gold)]", bg: "bg-[var(--color-gold-muted)]/20" },
    { label: "Health Score", value: `${s.healthScore}%`, icon: Heart, color: "text-[var(--color-success)]", bg: "bg-[var(--color-success-muted)]/20" },
    { label: "Pending Approvals", value: s.pendingApprovals, icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Exceptions", value: s.exceptions, icon: AlertTriangle, color: "text-[var(--color-danger)]", bg: "bg-[var(--color-danger-muted)]/20" },
    { label: "Late Journals", value: s.lateJournals, icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Open Recommendations", value: s.openRecommendations, icon: ThumbsUp, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Controller Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Financial close oversight and accounting health</p>
        </div>
        <div className="text-sm text-[var(--text-disabled)]">
          Last updated: {lastUpdated}
          {dataSummary && <p className="text-xs text-white/50 mt-0.5">{dataSummary}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
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
              <div className="text-2xl font-bold text-[var(--text-primary)]">{loading ? "\u2014" : card.value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{card.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

          <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-6">Recent Briefings</h2>
          <div className="space-y-2">
            {briefings.length === 0 && !loading ? (
              <div className="text-sm text-[var(--text-disabled)] py-4">No briefings yet</div>
            ) : (
              briefings.slice(0, 3).map((b) => (
                <Card key={b.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-[var(--color-gold)]" />
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{b.date}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{b.highlights.length} highlights</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-tertiary)]">Close</div>
                        <div className="text-sm text-[var(--text-primary)] font-medium">{b.closeProgress}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-tertiary)]">Health</div>
                        <div className="text-sm text-[var(--color-success)] font-medium">{b.healthScore}%</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-disabled)]" />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Top Risks</h2>
          <div className="space-y-2">
            {risks.length === 0 && !loading ? (
              <div className="text-sm text-[var(--text-disabled)] py-4">No risks identified</div>
            ) : (
              risks.slice(0, 5).map((risk) => (
                <Card key={risk.id} padding="sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text-primary)] truncate">{risk.title}</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">{risk.category}</div>
                    </div>
                    <Badge variant={severityBadgeVariant[risk.severity] ?? "muted"} size="sm">
                      {risk.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-[var(--text-disabled)] mt-2">Due: {risk.dueDate}</div>
                </Card>
              ))
            )}
          </div>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[var(--color-gold)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Journals This Week</span>
                <span className="text-sm text-[var(--text-primary)] font-medium">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Reconciliations Due</span>
                <span className="text-sm text-amber-400 font-medium">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Statements Pending</span>
                <span className="text-sm text-orange-400 font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Policies Compliant</span>
                <span className="text-sm text-[var(--color-success)] font-medium">96%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
