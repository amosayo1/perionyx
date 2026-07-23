"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, AlertTriangle } from "lucide-react";

interface AnalyticsData {
  matchRate: number;
  exceptionVolume: number;
  criticalExceptions: number;
  casesByType: Record<string, number>;
  casesByStatus: Record<string, number>;
  exceptionsBySeverity: Record<string, number>;
}

export function ReconciliationAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reconciliation/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/5" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 animate-pulse rounded-lg bg-white/5" />
          <div className="h-64 animate-pulse rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const typeLabels: Record<string, string> = {
    bank: "Bank",
    gl: "General Ledger",
    subledger: "Subledger",
    intercompany: "Intercompany",
    ar: "Accounts Receivable",
    ap: "Accounts Payable",
    fixed_asset: "Fixed Assets",
    treasury: "Treasury",
    payroll: "Payroll",
    tax: "Tax",
    multi_company: "Multi-Company",
    multi_currency: "Multi-Currency",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reconciliation Analytics</h1>
        <p className="mt-1 text-sm text-white/60">
          Performance metrics and trends
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Match Rate</p>
              <p className="text-2xl font-semibold text-white">
                {(data.matchRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Exceptions</p>
              <p className="text-2xl font-semibold text-white">{data.exceptionVolume}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <Clock className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Critical Issues</p>
              <p className="text-2xl font-semibold text-white">{data.criticalExceptions}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Cases by Type</h2>
          <div className="space-y-2">
            {Object.entries(data.casesByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-white/60">{typeLabels[type] ?? type}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gold-500"
                      style={{
                        width: `${(count / Math.max(...Object.values(data.casesByType))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-white/40">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Exceptions by Severity</h2>
          <div className="space-y-2">
            {Object.entries(data.exceptionsBySeverity).map(([severity, count]) => {
              const colors: Record<string, string> = {
                CRITICAL: "bg-red-500",
                HIGH: "bg-orange-500",
                MEDIUM: "bg-amber-500",
                LOW: "bg-blue-500",
              };
              return (
                <div key={severity} className="flex items-center justify-between">
                  <span className="text-sm text-white/60">{severity}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-white/10">
                      <div
                        className={`h-2 rounded-full ${colors[severity] ?? "bg-white/20"}`}
                        style={{
                          width: `${(count / Math.max(...Object.values(data.exceptionsBySeverity))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white/40">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
