"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Download,
} from "lucide-react";

interface SummaryData {
  activeCases: number;
  overallMatchRate: number;
  totalExceptions: number;
  criticalExceptions: number;
  openEscalations: number;
  casesByType: Record<string, number>;
  casesByStatus: Record<string, number>;
  exceptionsBySeverity: Record<string, number>;
  topRisks: Array<{
    caseId: string;
    title: string;
    severity: string;
    amount: number;
  }>;
}

export function ExecutiveSummary() {
  const [data, setData] = useState<SummaryData | null>(null);
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
        <div className="h-48 animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Executive Reconciliation Summary</h1>
          <p className="mt-1 text-sm text-white/60">
            High-level reconciliation status for executives
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Active Cases", value: data.activeCases, color: "text-blue-400" },
          { label: "Match Rate", value: `${(data.overallMatchRate * 100).toFixed(1)}%`, color: "text-green-400" },
          { label: "Exceptions", value: data.totalExceptions, color: "text-amber-400" },
          { label: "Critical", value: data.criticalExceptions, color: "text-red-400" },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          >
            <p className="text-sm text-white/60">{metric.label}</p>
            <p className={`mt-1 text-3xl font-semibold ${metric.color}`}>
              {metric.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Case Status</h2>
          <div className="space-y-2">
            {Object.entries(data.casesByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg bg-white/5 p-2">
                <span className="text-sm text-white/60">{status.replace(/_/g, " ")}</span>
                <span className="text-sm font-medium text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Risk Summary</h2>
          <div className="space-y-2">
            {data.topRisks.slice(0, 5).map((risk) => (
              <div key={risk.caseId} className="flex items-center justify-between rounded-lg bg-white/5 p-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${risk.severity === "CRITICAL" ? "bg-red-500" : "bg-amber-500"}`} />
                  <span className="text-sm text-white/60">{risk.title}</span>
                </div>
                <span className="text-sm text-white/40">${risk.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escalations Alert */}
      {data.openEscalations > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-400">
                {data.openEscalations} open escalation(s) require attention
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                Review and resolve escalations to prevent month-end delays
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
