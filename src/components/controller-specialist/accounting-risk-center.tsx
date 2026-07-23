"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, Search, User, CheckCircle2, Clock, Filter,
  ChevronDown,
} from "lucide-react";

interface AccountingException {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";
  assignee: string | null;
  createdAt: string;
  dueDate: string;
  entity: string;
  amount?: number;
}

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-500/10" },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/10" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  low: { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: "Open", color: "text-red-400", bg: "bg-red-500/10" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/10" },
  RESOLVED: { label: "Resolved", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ESCALATED: { label: "Escalated", color: "text-purple-400", bg: "bg-purple-500/10" },
};

const defaultExceptions: AccountingException[] = [
  { id: "1", title: "Material balance discrepancy", description: "GL account 1100 Cash shows $50K variance between sub-ledger and GL.", type: "Balance Mismatch", severity: "critical", status: "OPEN", assignee: null, createdAt: "2025-12-30", dueDate: "2026-01-02", entity: "Consolidated", amount: 50000 },
  { id: "2", title: "Unapproved journal entry", description: "JE-2025-005 for $5M goodwill impairment posted without required CFO approval.", type: "Compliance", severity: "critical", status: "ESCALATED", assignee: "John Smith", createdAt: "2025-12-29", dueDate: "2025-12-31", entity: "Consolidated", amount: 5000000 },
  { id: "3", title: "Intercompany imbalance", description: "APAC subsidiary owes $120K more than recorded in parent entity.", type: "Intercompany", severity: "high", status: "IN_PROGRESS", assignee: "Jane Doe", createdAt: "2025-12-28", dueDate: "2026-01-03", entity: "APAC Region", amount: 120000 },
  { id: "4", title: "Missing bank reconciliation", description: "3 accounts with unreconciled items exceeding $100K materiality threshold.", type: "Reconciliation", severity: "high", status: "OPEN", assignee: null, createdAt: "2025-12-27", dueDate: "2026-01-05", entity: "Subsidiary US" },
  { id: "5", title: "Deferred tax rate mismatch", description: "DTA calculations still using 21% federal rate instead of updated 25%.", type: "Tax", severity: "medium", status: "OPEN", assignee: null, createdAt: "2025-12-26", dueDate: "2026-01-08", entity: "Subsidiary US" },
  { id: "6", title: "Stale accounts receivable provision", description: "AR aging provision not updated for December. Current provision may be understated.", type: "Provision", severity: "medium", status: "IN_PROGRESS", assignee: "Sarah Chen", createdAt: "2025-12-25", dueDate: "2026-01-06", entity: "Consolidated" },
  { id: "7", title: "Missing segment data", description: "Q4 segment reporting data incomplete for 2 of 5 reportable segments.", type: "Reporting", severity: "low", status: "OPEN", assignee: null, createdAt: "2025-12-24", dueDate: "2026-01-10", entity: "Consolidated" },
];

export function AccountingRiskCenter() {
  const [exceptions, setExceptions] = useState<AccountingException[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/controller/risks");
        if (res.ok) {
          const data = await res.json();
          setExceptions(data.exceptions ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const list = exceptions.length > 0 ? exceptions : defaultExceptions;
  const filtered = list.filter((e) => {
    if (severityFilter !== "all" && e.severity !== severityFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    open: list.filter((e) => e.status === "OPEN").length,
    inProgress: list.filter((e) => e.status === "IN_PROGRESS").length,
    escalated: list.filter((e) => e.status === "ESCALATED").length,
    critical: list.filter((e) => e.severity === "critical").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Accounting Risks</h1>
        <p className="text-sm text-white/60 mt-1">Track and resolve accounting exceptions and risks</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-red-400">{stats.open}</div>
          <div className="text-xs text-white/50">Open</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{stats.inProgress}</div>
          <div className="text-xs text-white/50">In Progress</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{stats.escalated}</div>
          <div className="text-xs text-white/50">Escalated</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-orange-400">{stats.critical}</div>
          <div className="text-xs text-white/50">Critical</div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exceptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold-500"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
        >
          <option value="all">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ESCALATED">Escalated</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((exc, i) => {
          const sev = severityConfig[exc.severity];
          const st = statusConfig[exc.status];
          return (
            <motion.div
              key={exc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${sev.bg} ${sev.color}`}>
                      {sev.label}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="text-[10px] text-white/50">{exc.type}</span>
                  </div>
                  <div className="text-sm font-semibold text-white">{exc.title}</div>
                  <div className="text-xs text-white/50 mt-1">{exc.description}</div>
                </div>
                {exc.amount && (
                  <div className="text-right shrink-0">
                    <div className="text-sm text-white font-medium">
                      ${exc.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40">{exc.entity}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3 text-[10px] text-white/40">
                  <span>Due: {exc.dueDate}</span>
                  {exc.assignee && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {exc.assignee}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {exc.status !== "RESOLVED" && (
                    <>
                      <button className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-medium hover:bg-blue-500/20 transition-colors">
                        Assign
                      </button>
                      <button className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-medium hover:bg-emerald-500/20 transition-colors">
                        Resolve
                      </button>
                      {exc.status !== "ESCALATED" && (
                        <button className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-medium hover:bg-purple-500/20 transition-colors">
                          Escalate
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
