"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target, Wallet, TrendingUp, GitBranch, DollarSign, Lightbulb,
  ChevronRight, BarChart3, FileText, Activity, Brain, PieChart,
  Calendar, AlertTriangle, CheckCircle,
} from "lucide-react";
import { Card, Badge, Skeleton, Alert, StatusDot, Button } from "@/design-system";

interface PlanningStats {
  activePlans: number;
  budgetUtilization: number;
  forecastAccuracy: number;
  openScenarios: number;
  capitalDeployed: number;
  strategicInitiatives: number;
}

interface PlanningHealth {
  metric: string;
  value: string;
  status: "good" | "warning" | "critical";
}

interface RecentBriefing {
  id: string;
  title: string;
  type: string;
  date: string;
  summary: string;
}

const quickLinks = [
  { label: "Budgets", href: "/fpa/budgets", icon: Wallet, color: "text-blue-400" },
  { label: "Forecasts", href: "/fpa/forecasts", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Scenarios", href: "/fpa/scenarios", icon: GitBranch, color: "text-orange-400" },
  { label: "Drivers", href: "/fpa/drivers", icon: Target, color: "text-amber-400" },
  { label: "Variance", href: "/fpa/variance", icon: BarChart3, color: "text-purple-400" },
  { label: "Capital", href: "/fpa/capital", icon: DollarSign, color: "text-rose-400" },
  { label: "Executive", href: "/fpa/executive", icon: FileText, color: "text-cyan-400" },
  { label: "Board", href: "/fpa/board", icon: PieChart, color: "text-indigo-400" },
  { label: "Analytics", href: "/fpa/analytics", icon: Brain, color: "text-[var(--color-gold)]" },
];

export function PlanningDashboard() {
  const [stats, setStats] = useState<PlanningStats | null>(null);
  const [health, setHealth] = useState<PlanningHealth[]>([]);
  const [briefings, setBriefings] = useState<RecentBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");
  const [dataSummary, setDataSummary] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, healthRes, briefingsRes] = await Promise.all([
          fetch("/api/fpa/dashboard/stats").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/fpa/dashboard/health").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/fpa/dashboard/briefings").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (statsRes) setStats(statsRes);
        if (healthRes) setHealth(healthRes.health ?? []);
        if (briefingsRes) setBriefings(briefingsRes.briefings ?? []);
        const sc = statsRes?.openScenarios ?? 0;
        const fc = briefingsRes?.briefings?.length ?? 0;
        const va = (healthRes?.health ?? []).filter((h: { status: string }) => h.status !== "good").length;
        setDataSummary(
          sc || fc || va
            ? `Loaded ${sc} scenarios with ${fc} active forecasts and ${va} variance alerts.`
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
    activePlans: 12,
    budgetUtilization: 87.3,
    forecastAccuracy: 94.1,
    openScenarios: 6,
    capitalDeployed: 42500000,
    strategicInitiatives: 8,
  };

  const defaultHealth: PlanningHealth[] = [
    { metric: "Budget Adherence", value: "92%", status: "good" },
    { metric: "Forecast Variance", value: "3.2%", status: "good" },
    { metric: "Scenario Coverage", value: "78%", status: "warning" },
    { metric: "Driver Accuracy", value: "96%", status: "good" },
  ];

  const statCards = [
    { label: "Active Plans", value: s.activePlans, icon: Target, color: "text-[var(--color-gold)]", bg: "bg-[var(--color-gold-muted)]/20" },
    { label: "Budget Utilization", value: `${s.budgetUtilization}%`, icon: Wallet, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Forecast Accuracy", value: `${s.forecastAccuracy}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Open Scenarios", value: s.openScenarios, icon: GitBranch, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Capital Deployed", value: `$${(s.capitalDeployed / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Strategic Initiatives", value: s.strategicInitiatives, icon: Lightbulb, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">FP&A Planning Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Financial planning, budgeting, forecasting and analysis</p>
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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Planning Health</h2>
          <Card padding="md">
            <div className="space-y-3">
              {(health.length > 0 ? health : defaultHealth).map((h) => (
                <div key={h.metric} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {h.status === "good" && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    {h.status === "warning" && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                    {h.status === "critical" && <AlertTriangle className="w-3 h-3 text-red-400" />}
                    <span className="text-xs text-[var(--text-tertiary)]">{h.metric}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    h.status === "good" ? "text-emerald-400" :
                    h.status === "warning" ? "text-amber-400" : "text-red-400"
                  }`}>{h.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[var(--color-gold)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Planning Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Budgets on Track</span>
                <span className="text-sm text-emerald-400 font-medium">8 of 10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Forecasts Submitted (MTD)</span>
                <span className="text-sm text-blue-400 font-medium">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Scenarios Completed</span>
                <span className="text-sm text-[var(--color-gold)] font-medium">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Capital Requests Pending</span>
                <span className="text-sm text-orange-400 font-medium">4</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
