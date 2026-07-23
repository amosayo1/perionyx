"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, FileText, Zap, RefreshCw, X } from "lucide-react";

type Briefing = {
  id: string;
  title: string;
  summary: string;
  sections: Array<{ title: string; summary: string; metric: string }>;
  recommendations: string[];
  createdAt: string;
};

type IntelligenceMetric = {
  metric: string;
  value: number;
  label: string;
  trend: "up" | "down" | "stable";
};

export function IntelligenceDashboard() {
  const [open, setOpen] = useState(false);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !briefing && !loading) {
      loadLatestBriefing();
    }
  }, [open]);

  async function loadLatestBriefing() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/sandbox/intelligence");
      if (res.ok) {
        const data = await res.json();
        if (data.briefing) {
          setBriefing(data.briefing);
        }
      }
    } catch {
      setError("Failed to load intelligence data");
    } finally {
      setLoading(false);
    }
  }

  async function generateBriefing() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/sandbox/intelligence", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.briefing) {
          setBriefing(data.briefing);
        }
      } else {
        setError("Failed to generate briefing");
      }
    } catch {
      setError("Failed to generate briefing");
    } finally {
      setLoading(false);
    }
  }

  function getTrendIcon(metric: string, value: number) {
    const positiveMetrics = ["cash_position", "treasury_balance", "reconciliation_match_rate", "approval_sla", "transaction_volume", "active_users", "settlement_success_rate", "operational_efficiency", "multi_currency_count"];
    const negativeMetrics = ["risk_score", "critical_alerts", "pending_approvals", "overdue_approvals", "failed_transactions", "policy_violations", "reconciliation_exceptions", "unread_notifications", "high_severity_audit"];

    if (positiveMetrics.includes(metric)) {
      return value >= 0 ? TrendingUp : TrendingDown;
    }
    if (negativeMetrics.includes(metric)) {
      return value > 0 ? TrendingUp : TrendingDown;
    }
    return TrendingUp;
  }

  function getTrendColor(metric: string, value: number) {
    const positiveMetrics = ["cash_position", "treasury_balance", "reconciliation_match_rate", "approval_sla", "transaction_volume", "active_users", "settlement_success_rate", "operational_efficiency", "multi_currency_count"];
    const negativeMetrics = ["risk_score", "critical_alerts", "pending_approvals", "overdue_approvals", "failed_transactions", "policy_violations", "reconciliation_exceptions", "unread_notifications", "high_severity_audit"];

    const isUp = value >= 0;
    if (positiveMetrics.includes(metric)) return isUp ? "text-emerald-400" : "text-red-400";
    if (negativeMetrics.includes(metric)) return isUp ? "text-red-400" : "text-emerald-400";
    return "text-zinc-400";
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
      >
        <Brain className="h-3.5 w-3.5" />
        Enterprise Intelligence
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-[420px] border-l border-white/[0.06] bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl border-b border-white/[0.06] p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#d4af37]" />
                  <h2 className="text-sm font-semibold text-white">Enterprise Intelligence</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {loading && (
                  <div className="flex items-center gap-2 py-8 text-zinc-500 text-xs justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading intelligence data...
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p role="alert" className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                {briefing && !loading && (
                  <>
                    <div className="rounded-xl border border-[#d4af37]/15 bg-[#d4af37]/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-[#d4af37]" />
                        <span className="text-xs font-semibold text-white">AI Briefing</span>
                        <span className="text-[10px] text-zinc-500 ml-auto">
                          {new Date(briefing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-white mb-2">{briefing.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">{briefing.summary}</p>

                      {briefing.sections.length > 0 && (
                        <div className="space-y-2">
                          {briefing.sections.slice(0, 4).map((section, i) => (
                            <div key={i} className="rounded-lg bg-white/[0.03] p-2.5">
                              <p className="text-[11px] font-medium text-[#d4af37]/80 uppercase tracking-wider mb-1">
                                {section.title}
                              </p>
                              <p className="text-[11px] text-zinc-400 leading-relaxed">{section.summary}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {briefing.recommendations.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-[10px] font-semibold text-white uppercase tracking-wider">Recommendations</p>
                          {briefing.recommendations.slice(0, 3).map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400">
                              <Zap className="h-3 w-3 shrink-0 mt-0.5 text-[#d4af37]" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!briefing && !loading && !error && (
                  <div className="text-center py-8">
                    <Brain className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm text-zinc-400 mb-4">No intelligence data yet</p>
                    <button
                      onClick={generateBriefing}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2 text-xs font-semibold text-black hover:bg-[#d4af37]/90 transition-colors"
                    >
                      Generate AI Briefing
                    </button>
                  </div>
                )}

                {briefing && !loading && (
                  <button
                    onClick={generateBriefing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.06] px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Generate New Briefing
                  </button>
                )}

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">About Enterprise Intelligence</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    AI Briefings analyze your treasury data — cash position, risk score, approval efficiency, settlement rates, and anomalies — to produce actionable executive summaries. This is the same intelligence that powers the Insights and Risk Intelligence modules.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
