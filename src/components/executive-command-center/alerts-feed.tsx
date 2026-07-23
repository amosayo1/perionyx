"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell, AlertTriangle, CheckCircle, Clock, Shield, Filter,
  ChevronRight, ExternalLink, X,
} from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  source: string;
  timestamp: string;
  recommendedAction: string;
  acknowledged: boolean;
  category: string;
}

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: typeof Bell }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", icon: AlertTriangle },
  high: { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", icon: AlertTriangle },
  medium: { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", icon: Clock },
  low: { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", icon: Shield },
  info: { color: "text-white/60", bg: "bg-white/10", border: "border-white/20", icon: CheckCircle },
};

const specialistColors: Record<string, string> = {
  Treasury: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Controller: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Audit: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Compliance: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Tax: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  FPandA: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Risk: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Governance: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

type SeverityTab = "all" | "critical" | "high" | "medium" | "low" | "info";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse rounded-lg ${className}`} />;
}

export function AlertsFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SeverityTab>("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/executive/alerts");
        if (res.ok) {
          const json = await res.json();
          setAlerts(json.alerts ?? []);
        } else {
          setAlerts(getDefaultAlerts());
        }
      } catch {
        setAlerts(getDefaultAlerts());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    alerts.forEach((a) => {
      if (!acknowledged.has(a.id)) {
        c.all++;
        c[a.severity]++;
      }
    });
    return c;
  }, [alerts, acknowledged]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (acknowledged.has(a.id)) return false;
      if (activeTab !== "all" && a.severity !== activeTab) return false;
      return true;
    });
  }, [alerts, activeTab, acknowledged]);

  function handleAcknowledge(id: string) {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function handleDismiss(id: string) {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  const tabs: { key: SeverityTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
    { key: "info", label: "Info" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-gold-500" />
            Enterprise Alerts
          </h1>
          <p className="text-sm text-white/60 mt-1">Real-time alerts across all enterprise domains</p>
        </div>
        <div className="text-sm text-white/40">
          {counts.all} active alert{counts.all !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Severity Tabs */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const config = tab.key !== "all" ? severityConfig[tab.key] : null;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5"
              }`}
            >
              {config && <div className={`w-1.5 h-1.5 rounded-full ${config.bg}`} />}
              {tab.label}
              <span className="text-[10px] text-white/40 ml-0.5">{counts[tab.key]}</span>
            </button>
          );
        })}
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white/5 border border-white/10 rounded-xl"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
          <p className="text-sm text-white/60">
            {activeTab === "all" ? "No active alerts" : `No ${activeTab} severity alerts`}
          </p>
          <p className="text-xs text-white/40 mt-1">All systems operating normally</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, i) => {
            const sev = severityConfig[alert.severity];
            const SevIcon = sev.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white/5 border ${sev.border} rounded-xl p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${sev.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <SevIcon className={`w-4 h-4 ${sev.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${sev.bg} ${sev.color} ${sev.border}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-white font-medium">{alert.title}</span>
                    </div>
                    <p className="text-xs text-white/50 mb-2">{alert.message}</p>
                    {alert.recommendedAction && (
                      <div className="bg-white/5 rounded-lg px-3 py-2 mb-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">Recommended Action</span>
                        <p className="text-xs text-white/70 mt-0.5">{alert.recommendedAction}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${specialistColors[alert.source] ?? "bg-white/10 text-white/50 border-white/20"}`}>
                        {alert.source}
                      </span>
                      <span className="text-[10px] text-white/40">{alert.category}</span>
                      <span className="text-[10px] text-white/50">{alert.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="text-[10px] px-2.5 py-1.5 rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                      aria-label="Dismiss alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getDefaultAlerts(): Alert[] {
  return [
    { id: "a1", title: "Treasury cash below policy minimum", message: "Operating account balance at $2.1M, below the $3.0M policy minimum established by Cash Policy CP-001.", severity: "critical", source: "Treasury", timestamp: "12 min ago", recommendedAction: "Initiate emergency fund transfer from reserve account or draw on credit facility.", acknowledged: false, category: "Cash Management" },
    { id: "a2", title: "SOX control exception in AP workflow", message: "Segregation of duties violation detected in Accounts Payable approval chain for invoice #INV-2026-4892.", severity: "high", source: "Audit", timestamp: "45 min ago", recommendedAction: "Review approval chain configuration and implement dual-approval for payments exceeding $50K.", acknowledged: false, category: "Internal Controls" },
    { id: "a3", title: "Transfer pricing documentation overdue", message: "DE-SG intercompany transfer pricing documentation is 30 days past the compliance deadline.", severity: "high", source: "Tax", timestamp: "1 hr ago", recommendedAction: "Engage transfer pricing advisor and submit documentation to avoid potential penalties.", acknowledged: false, category: "Tax Compliance" },
    { id: "a4", title: "FX exposure exceeds risk threshold", message: "Net EUR/USD exposure at $12.4M, exceeding the $10M threshold set by Risk Policy RP-003.", severity: "medium", source: "Risk", timestamp: "2 hrs ago", recommendedAction: "Execute forward contracts to hedge $3M+ of EUR exposure before next rate window.", acknowledged: false, category: "FX Risk" },
    { id: "a5", title: "Board pack Q2 awaiting sign-off", message: "Q2 2026 board pack draft completed but awaiting CFO review and sign-off before July 25 meeting.", severity: "low", source: "Governance", timestamp: "3 hrs ago", recommendedAction: "Schedule CFO review session and finalize board pack by July 23.", acknowledged: false, category: "Board Governance" },
    { id: "a6", title: "New regulatory update: IFRS 17 amendment", message: "IASB issued amendment to IFRS 17 effective Q1 2027. Impact assessment required for insurance contracts.", severity: "info", source: "Compliance", timestamp: "5 hrs ago", recommendedAction: "Initiate impact assessment and update compliance calendar with new deadlines.", acknowledged: false, category: "Regulatory" },
    { id: "a7", title: "Vendor payment batch delayed", message: "Weekly vendor payment batch delayed by 24hrs due to bank file format issue with Deutsche Bank.", severity: "medium", source: "Treasury", timestamp: "6 hrs ago", recommendedAction: "Coordinate with bank IT to resolve file format issue and expedite batch processing.", acknowledged: false, category: "Payments" },
    { id: "a8", title: "Budget variance exceeds 10%", message: "Q2 marketing spend at 112% of budget. Variance exceeds 10% threshold requiring executive review.", severity: "medium", source: "FPandA", timestamp: "1 day ago", recommendedAction: "Schedule budget review with marketing leadership and implement spend controls.", acknowledged: false, category: "Budget" },
  ];
}
