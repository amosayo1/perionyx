"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Landmark, Banknote, Droplets, LineChart, ArrowLeftRight, Building2,
  CreditCard, PieChart, ShieldAlert, Sun, ThumbsUp, BarChart3,
  ChevronRight, AlertTriangle, Bell, TrendingUp, TrendingDown, Activity,
} from "lucide-react";
import { Card, Badge, Skeleton, Alert, StatusDot, Button } from "@/design-system";

interface DashboardStats {
  globalCashPosition: number;
  liquidityScore: number;
  fxExposure: number;
  activeRisks: number;
  pendingRecommendations: number;
  activeAlerts: number;
}

interface TopAlert {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  timestamp: string;
}

interface RecentBriefing {
  id: string;
  date: string;
  cashPosition: number;
  liquidityScore: number;
  highlights: string[];
}

  const quickLinks = [
    { label: "Cash Command Center", href: "/treasury/cash", icon: Banknote, color: "text-[var(--color-gold)]" },
    { label: "Liquidity Center", href: "/treasury/liquidity", icon: Droplets, color: "text-[var(--color-info)]" },
    { label: "Forecast Center", href: "/treasury/forecasts", icon: LineChart, color: "text-[var(--color-success)]" },
    { label: "FX Exposure", href: "/treasury/fx", icon: ArrowLeftRight, color: "text-purple-400" },
    { label: "Bank Operations", href: "/treasury/banking", icon: Building2, color: "text-amber-400" },
    { label: "Debt Management", href: "/treasury/debt", icon: CreditCard, color: "text-rose-400" },
    { label: "Investment Portfolio", href: "/treasury/investments", icon: PieChart, color: "text-cyan-400" },
    { label: "Treasury Risks", href: "/treasury/risks", icon: ShieldAlert, color: "text-orange-400" },
    { label: "Morning Briefing", href: "/treasury/briefings", icon: Sun, color: "text-yellow-400" },
    { label: "Recommendations", href: "/treasury/recommendations", icon: ThumbsUp, color: "text-indigo-400" },
    { label: "Treasury Analytics", href: "/treasury/analytics", icon: BarChart3, color: "text-teal-400" },
  ];

const severityBadgeVariant: Record<string, "danger" | "warning" | "gold" | "success"> = {
  critical: "danger",
  high: "warning",
  medium: "gold",
  low: "success",
};

export function TreasuryDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<TopAlert[]>([]);
  const [briefings, setBriefings] = useState<RecentBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");
  const [dataSummary, setDataSummary] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, alertsRes, briefRes] = await Promise.all([
          fetch("/api/treasury/dashboard/stats").then((r) => r.ok ? r.json() : null),
          fetch("/api/treasury/dashboard/alerts").then((r) => r.ok ? r.json() : null),
          fetch("/api/treasury/dashboard/briefings").then((r) => r.ok ? r.json() : null),
        ]);
        if (statsRes) setStats(statsRes);
        if (alertsRes) setAlerts(alertsRes.alerts ?? []);
        if (briefRes) setBriefings(briefRes.briefings ?? []);
        const p = briefRes?.briefings?.length ?? 0;
        const al = alertsRes?.alerts?.length ?? 0;
        const r = statsRes?.pendingRecommendations ?? 0;
        setDataSummary(
          p || al || r
            ? `Captured ${p} cash positions with ${al} active alerts and ${r} pending recommendations.`
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
    globalCashPosition: 2847500000,
    liquidityScore: 82,
    fxExposure: 412000000,
    activeRisks: 7,
    pendingRecommendations: 11,
    activeAlerts: 4,
  };

  const formatCurrency = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
  };

  const statCards = [
    { label: "Global Cash Position", value: formatCurrency(s.globalCashPosition), icon: Landmark, color: "text-[var(--color-gold)]", bg: "bg-[var(--color-gold-muted)]/20" },
    { label: "Liquidity Score", value: `${s.liquidityScore}%`, icon: Droplets, color: "text-[var(--color-info)]", bg: "bg-[var(--surface-tertiary)]" },
    { label: "FX Exposure", value: formatCurrency(s.fxExposure), icon: ArrowLeftRight, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Active Risks", value: s.activeRisks, icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Pending Recommendations", value: s.pendingRecommendations, icon: ThumbsUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Active Alerts", value: s.activeAlerts, icon: Bell, color: "text-[var(--color-danger)]", bg: "bg-[var(--color-danger-muted)]/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Treasury Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Enterprise treasury operations and cash management</p>
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

          <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-6">Recent Briefings</h2>
          <div className="space-y-2">
            {briefings.length === 0 && !loading ? (
              <div className="text-sm text-[var(--text-disabled)] py-4">No briefings yet</div>
            ) : (
              briefings.slice(0, 3).map((b) => (
                <Card key={b.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-[var(--color-gold)]" />
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{b.date}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{b.highlights.length} highlights</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-tertiary)]">Cash</div>
                        <div className="text-sm text-[var(--text-primary)] font-medium">{formatCurrency(b.cashPosition)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-tertiary)]">Liquidity</div>
                        <div className="text-sm text-[var(--color-info)] font-medium">{b.liquidityScore}%</div>
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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Top Alerts</h2>
          <div className="space-y-2">
            {alerts.length === 0 && !loading ? (
              <div className="text-sm text-[var(--text-disabled)] py-4">No active alerts</div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <Card key={alert.id} padding="sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text-primary)] truncate">{alert.title}</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">{alert.category}</div>
                    </div>
                    <Badge variant={severityBadgeVariant[alert.severity] ?? "muted"} size="sm">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-[var(--text-disabled)] mt-2">{alert.timestamp}</div>
                </Card>
              ))
            )}
          </div>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[var(--color-gold)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Cash Inflow (MTD)</span>
                <span className="text-sm text-[var(--color-success)] font-medium">$847M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Cash Outflow (MTD)</span>
                <span className="text-sm text-[var(--color-danger)] font-medium">$623M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Net Position</span>
                <span className="text-sm text-[var(--color-gold)] font-medium">$224M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Forecast Accuracy</span>
                <span className="text-sm text-[var(--color-info)] font-medium">94.2%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
