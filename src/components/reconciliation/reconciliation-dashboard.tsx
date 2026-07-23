"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Shield,
  Search,
  ChevronRight,
} from "lucide-react";

interface DashboardData {
  activeCases: number;
  overallMatchRate: number;
  totalExceptions: number;
  criticalExceptions: number;
  openEscalations: number;
  casesByStatus: Record<string, number>;
  casesByType: Record<string, number>;
  exceptionsBySeverity: Record<string, number>;
  topRisks: Array<{
    caseId: string;
    title: string;
    riskType: string;
    severity: string;
    amount: number;
  }>;
}

export function ReconciliationDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reconciliation/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/5" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Active Cases",
      value: data.activeCases,
      icon: ArrowRightLeft,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Match Rate",
      value: `${(data.overallMatchRate * 100).toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Exceptions",
      value: data.totalExceptions,
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Critical Issues",
      value: data.criticalExceptions,
      icon: Shield,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Enterprise Reconciliation
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Autonomous reconciliation platform
          </p>
        </div>
        <Link
          href="/reconciliation/exceptions"
          className="flex items-center gap-2 rounded-lg bg-gold-500/10 px-4 py-2 text-sm text-gold-500 hover:bg-gold-500/20"
        >
          <Search className="h-4 w-4" />
          Exception Center
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-white/60">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/reconciliation/matching", label: "Matching Center", icon: ArrowRightLeft },
          { href: "/reconciliation/exceptions", label: "Exception Workspace", icon: AlertTriangle },
          { href: "/reconciliation/investigation", label: "Investigation Hub", icon: Search },
          { href: "/reconciliation/rules", label: "Rule Builder", icon: BarChart3 },
          { href: "/reconciliation/analytics", label: "Analytics", icon: TrendingUp },
          { href: "/reconciliation/summary", label: "Executive Summary", icon: Clock },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <link.icon className="h-5 w-5 text-gold-500" />
              <span className="text-sm font-medium text-white">{link.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-white/40" />
          </Link>
        ))}
      </div>

      {/* Top Risks */}
      {data.topRisks.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Top Risks</h2>
          <div className="space-y-2">
            {data.topRisks.slice(0, 5).map((risk) => (
              <div
                key={risk.caseId}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      risk.severity === "CRITICAL" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm text-white">{risk.title}</span>
                </div>
                <span className="text-xs text-white/40">${risk.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
