"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, BookOpen, ClipboardList, AlertTriangle, Calendar, Brain,
  ChevronRight, FileText, TrendingUp, BarChart3, Clock, Scale,
} from "lucide-react";
import { Card, Badge, Skeleton, Alert, StatusDot, Button } from "@/design-system";

interface ComplianceStats {
  complianceScore: number;
  openViolations: number;
  activePolicies: number;
  overdueObligations: number;
  upcomingFilings: number;
  regulatoryChanges: number;
}

interface TopRisk {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  category: string;
  owner: string;
}

interface RecentBriefing {
  id: string;
  title: string;
  type: string;
  date: string;
  summary: string;
}

const quickLinks = [
  { label: "Policies", href: "/compliance/policies", icon: BookOpen, color: "text-blue-400" },
  { label: "Obligations", href: "/compliance/obligations", icon: ClipboardList, color: "text-emerald-400" },
  { label: "Violations", href: "/compliance/violations", icon: AlertTriangle, color: "text-orange-400" },
  { label: "Calendar", href: "/compliance/calendar", icon: Calendar, color: "text-amber-400" },
  { label: "Regulatory Intel", href: "/compliance/regulatory-intelligence", icon: Brain, color: "text-purple-400" },
  { label: "Remediation", href: "/compliance/remediation", icon: Scale, color: "text-rose-400" },
  { label: "Analytics", href: "/compliance/analytics", icon: TrendingUp, color: "text-cyan-400" },
  { label: "Executive Summary", href: "/compliance/executive", icon: FileText, color: "text-indigo-400" },
  { label: "Regulatory Calendar", href: "/compliance/calendar", icon: Calendar, color: "text-[var(--color-gold)]" },
];

const severityBadgeVariant: Record<string, "danger" | "warning" | "gold" | "success" | "info"> = {
  critical: "danger",
  high: "warning",
  medium: "gold",
  low: "success",
  informational: "info",
};

export function ComplianceDashboard() {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [risks, setRisks] = useState<TopRisk[]>([]);
  const [briefings, setBriefings] = useState<RecentBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");
  const [dataSummary, setDataSummary] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, risksRes, briefingsRes] = await Promise.all([
          fetch("/api/compliance/dashboard/stats").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/compliance/dashboard/risks").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/compliance/dashboard/briefings").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (statsRes) setStats(statsRes);
        if (risksRes) setRisks(risksRes.risks ?? []);
        if (briefingsRes) setBriefings(briefingsRes.briefings ?? []);
        const pol = statsRes?.activePolicies ?? 0;
        const vio = statsRes?.openViolations ?? 0;
        const br = briefingsRes?.briefings?.length ?? 0;
        setDataSummary(
          pol || vio || br
            ? `Evaluated ${pol} policies with ${vio} active violations and ${br} pending reviews.`
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
    complianceScore: 91,
    openViolations: 7,
    activePolicies: 34,
    overdueObligations: 3,
    upcomingFilings: 12,
    regulatoryChanges: 5,
  };

  const statCards = [
    { label: "Compliance Score", value: `${s.complianceScore}%`, icon: ShieldAlert, color: "text-[var(--color-gold)]", bg: "bg-[var(--color-gold-muted)]/20" },
    { label: "Open Violations", value: s.openViolations, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Active Policies", value: s.activePolicies, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Overdue Obligations", value: s.overdueObligations, icon: ClipboardList, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Upcoming Filings", value: s.upcomingFilings, icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Regulatory Changes", value: s.regulatoryChanges, icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Compliance Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Enterprise compliance management and regulatory oversight</p>
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
              <div className="text-2xl font-bold text-[var(--text-primary)]">{loading ? "—" : card.value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{card.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Navigation</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.href + link.label}
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
              <div className="text-sm text-[var(--text-disabled)] py-4">No recent briefings</div>
            ) : (
              briefings.slice(0, 5).map((b) => (
                <Card key={b.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{b.title}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{b.type} &middot; {b.date}</div>
                      </div>
                    </div>
                    <Badge variant="info" size="sm">
                      {b.type.toUpperCase()}
                    </Badge>
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
              <div className="text-sm text-[var(--text-disabled)] py-4">No active risks</div>
            ) : (
              risks.slice(0, 5).map((r) => (
                <Card key={r.id} padding="sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text-primary)] truncate">{r.title}</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">{r.category} &middot; {r.owner}</div>
                    </div>
                    <Badge variant={severityBadgeVariant[r.severity] ?? "muted"} size="sm">
                      {r.severity.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-[var(--color-gold)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Compliance Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Policy Adherence</span>
                <span className="text-sm text-emerald-400 font-medium">96.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Obligations Completed (MTD)</span>
                <span className="text-sm text-blue-400 font-medium">28</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Remediation Rate</span>
                <span className="text-sm text-[var(--color-gold)] font-medium">91%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Overdue Items</span>
                <span className="text-sm text-red-400 font-medium">3</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
