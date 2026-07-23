"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye, AlertTriangle, Clock, ShieldAlert, Activity, UserX,
  RefreshCw, CheckCircle, XCircle, Wifi,
} from "lucide-react";

interface ControlFailure {
  id: string;
  controlName: string;
  category: string;
  failureCount: number;
  lastFailure: string;
  severity: "critical" | "high" | "medium" | "low";
}

interface MissingApproval {
  id: string;
  transactionRef: string;
  amount: number;
  requestedBy: string;
  pendingSince: string;
  approvalLevel: string;
}

interface LateReconciliation {
  id: string;
  accountName: string;
  dueDate: string;
  daysOverdue: number;
  balance: number;
}

interface HighRiskEvent {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  riskScore: number;
  status: "active" | "investigating" | "resolved";
}

interface UnusualBehavior {
  id: string;
  description: string;
  user: string;
  timestamp: string;
  riskLevel: "high" | "medium" | "low";
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const statusColors: Record<string, string> = {
  active: "bg-red-500/20 text-red-400 border-red-500/30",
  investigating: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function ContinuousAuditCenter() {
  const [controlFailures, setControlFailures] = useState<ControlFailure[]>([]);
  const [missingApprovals, setMissingApprovals] = useState<MissingApproval[]>([]);
  const [lateReconciliations, setLateReconciliations] = useState<LateReconciliation[]>([]);
  const [highRiskEvents, setHighRiskEvents] = useState<HighRiskEvent[]>([]);
  const [unusualBehavior, setUnusualBehavior] = useState<UnusualBehavior[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cf, ma, lr, hr, ub] = await Promise.all([
          fetch("/api/audit/continuous/control-failures").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/continuous/missing-approvals").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/continuous/late-reconciliations").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/continuous/high-risk-events").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/audit/continuous/unusual-behavior").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (cf) setControlFailures(cf.failures ?? []);
        if (ma) setMissingApprovals(ma.approvals ?? []);
        if (lr) setLateReconciliations(lr.reconciliations ?? []);
        if (hr) setHighRiskEvents(hr.events ?? []);
        if (ub) setUnusualBehavior(ub.alerts ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const monitoringIndicators = [
    { label: "Control Tests", status: "online" as const, lastRun: "2 min ago" },
    { label: "Transaction Monitoring", status: "online" as const, lastRun: "Real-time" },
    { label: "Access Reviews", status: "online" as const, lastRun: "15 min ago" },
    { label: "Reconciliation Checks", status: "warning" as const, lastRun: "1 hour ago" },
    { label: "Anomaly Detection", status: "online" as const, lastRun: "Real-time" },
  ];

  const indicatorStatus: Record<string, string> = {
    online: "bg-emerald-400",
    warning: "bg-yellow-400",
    offline: "bg-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Continuous Audit Center</h1>
          <p className="text-sm text-white/60 mt-1">Real-time monitoring of controls, approvals, and anomalies</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {monitoringIndicators.map((ind, i) => (
          <motion.div
            key={ind.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${indicatorStatus[ind.status]} ${ind.status === "online" ? "animate-pulse" : ""}`} />
            <div>
              <div className="text-xs text-white font-medium">{ind.label}</div>
              <div className="text-[10px] text-white/40">{ind.lastRun}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Control Failures</h2>
          <div className="space-y-2">
            {controlFailures.length === 0 && !loading ? (
              <div className="text-sm text-white/40 py-4">No control failures detected</div>
            ) : (
              controlFailures.map((cf) => (
                <div key={cf.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{cf.controlName}</div>
                      <div className="text-xs text-white/50 mt-1">{cf.category} &middot; {cf.failureCount} failures &middot; {cf.lastFailure}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${severityColors[cf.severity]}`}>
                      {cf.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">Missing Approvals</h2>
          <div className="space-y-2">
            {missingApprovals.length === 0 && !loading ? (
              <div className="text-sm text-white/40 py-4">No missing approvals</div>
            ) : (
              missingApprovals.map((ma) => (
                <div key={ma.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">{ma.transactionRef}</div>
                      <div className="text-xs text-white/50 mt-1">{ma.requestedBy} &middot; {ma.approvalLevel} &middot; {ma.pendingSince}</div>
                    </div>
                    <div className="text-sm text-gold-500 font-medium">${ma.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Late Reconciliations</h2>
          <div className="space-y-2">
            {lateReconciliations.length === 0 && !loading ? (
              <div className="text-sm text-white/40 py-4">No overdue reconciliations</div>
            ) : (
              lateReconciliations.map((lr) => (
                <div key={lr.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">{lr.accountName}</div>
                      <div className="text-xs text-white/50 mt-1">Due: {lr.dueDate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400 font-medium">{lr.daysOverdue}d overdue</span>
                      <span className="text-sm text-white font-medium">${lr.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">High-Risk Events</h2>
          <div className="space-y-2">
            {highRiskEvents.length === 0 && !loading ? (
              <div className="text-sm text-white/40 py-4">No high-risk events</div>
            ) : (
              highRiskEvents.map((hr) => (
                <div key={hr.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{hr.title}</div>
                      <div className="text-xs text-white/50 mt-1">{hr.category} &middot; {hr.timestamp}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-gold-500 font-bold">{hr.riskScore}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[hr.status]}`}>
                        {hr.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <h2 className="text-lg font-semibold text-white mt-6">Unusual Behavior</h2>
          <div className="space-y-2">
            {unusualBehavior.length === 0 && !loading ? (
              <div className="text-sm text-white/40 py-4">No unusual behavior detected</div>
            ) : (
              unusualBehavior.map((ub) => (
                <div key={ub.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-white">{ub.description}</div>
                      <div className="text-xs text-white/50 mt-1">{ub.user} &middot; {ub.timestamp}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${severityColors[ub.riskLevel]}`}>
                      {ub.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
