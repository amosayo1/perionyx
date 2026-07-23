"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Flag, CheckCircle2, XCircle, Eye, AlertTriangle,
  Search, Filter, ChevronDown, ArrowUpDown,
} from "lucide-react";

interface JournalEntry {
  id: string;
  journalNumber: string;
  description: string;
  entity: string;
  period: string;
  amount: number;
  currency: string;
  status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | "FLAGGED";
  riskLevel: "low" | "medium" | "high" | "critical";
  createdBy: string;
  createdAt: string;
  riskFlags: string[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof FileText }> = {
  PENDING: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", icon: Eye },
  REVIEWED: { label: "Reviewed", color: "text-blue-400", bg: "bg-blue-500/10", icon: CheckCircle2 },
  APPROVED: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
  FLAGGED: { label: "Flagged", color: "text-orange-400", bg: "bg-orange-500/10", icon: AlertTriangle },
};

const riskConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/10" },
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-500/10" },
};

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function JournalReviewCenter() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/controller/journals");
        if (res.ok) {
          const data = await res.json();
          setJournals(data.journals ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayJournals = journals.length > 0 ? journals : [
    { id: "1", journalNumber: "JE-2025-001", description: "Revenue recognition adjustment", entity: "Consolidated", period: "Dec 2025", amount: 1250000, currency: "USD", status: "PENDING" as const, riskLevel: "medium" as const, createdBy: "John Smith", createdAt: "2025-12-28", riskFlags: ["Unusual amount", "Period-end entry"] },
    { id: "2", journalNumber: "JE-2025-002", description: "Accrued liability reversal", entity: "Subsidiary US", period: "Dec 2025", amount: 450000, currency: "USD", status: "FLAGGED" as const, riskLevel: "high" as const, createdBy: "Jane Doe", createdAt: "2025-12-29", riskFlags: ["Missing supporting documentation", "Exceeds materiality threshold"] },
    { id: "3", journalNumber: "JE-2025-003", description: "FX revaluation entries", entity: "Subsidiary UK", period: "Dec 2025", amount: 780000, currency: "GBP", status: "REVIEWED" as const, riskLevel: "low" as const, createdBy: "Mike Johnson", createdAt: "2025-12-27", riskFlags: [] },
    { id: "4", journalNumber: "JE-2025-004", description: "Intercompany elimination", entity: "Consolidated", period: "Dec 2025", amount: 2100000, currency: "USD", status: "APPROVED" as const, riskLevel: "low" as const, createdBy: "Sarah Chen", createdAt: "2025-12-26", riskFlags: [] },
    { id: "5", journalNumber: "JE-2025-005", description: "Goodwill impairment test provision", entity: "Consolidated", period: "Dec 2025", amount: 5000000, currency: "USD", status: "PENDING" as const, riskLevel: "critical" as const, createdBy: "John Smith", createdAt: "2025-12-30", riskFlags: ["Material amount", "Requires CFO approval", "Year-end adjustment"] },
    { id: "6", journalNumber: "JE-2025-006", description: "Deferred tax asset adjustment", entity: "Subsidiary US", period: "Dec 2025", amount: 320000, currency: "USD", status: "REJECTED" as const, riskLevel: "medium" as const, createdBy: "Jane Doe", createdAt: "2025-12-25", riskFlags: ["Invalid tax rate applied"] },
  ];

  const filtered = displayJournals.filter((j) => {
    if (filter !== "all" && j.status !== filter) return false;
    if (search && !j.description.toLowerCase().includes(search.toLowerCase()) && !j.journalNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: displayJournals.length,
    pending: displayJournals.filter((j) => j.status === "PENDING").length,
    flagged: displayJournals.filter((j) => j.status === "FLAGGED").length,
    approved: displayJournals.filter((j) => j.status === "APPROVED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Journal Review Center</h1>
          <p className="text-sm text-white/60 mt-1">Review, flag, and approve journal entries</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-white/50">Total Journals</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-xs text-white/50">Pending Review</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-orange-400">{stats.flagged}</div>
          <div className="text-xs text-white/50">Flagged</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{stats.approved}</div>
          <div className="text-xs text-white/50">Approved</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search journals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold-500"
          />
        </div>
        <div className="flex gap-1">
          {["all", "PENDING", "FLAGGED", "REVIEWED", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? "bg-gold-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "All" : statusConfig[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Journal</th>
                <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Description</th>
                <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Entity</th>
                <th className="text-right text-xs font-medium text-white/50 px-4 py-3">Amount</th>
                <th className="text-center text-xs font-medium text-white/50 px-4 py-3">Risk</th>
                <th className="text-center text-xs font-medium text-white/50 px-4 py-3">Status</th>
                <th className="text-center text-xs font-medium text-white/50 px-4 py-3">Flags</th>
                <th className="text-center text-xs font-medium text-white/50 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((journal, i) => {
                const st = statusConfig[journal.status];
                const rk = riskConfig[journal.riskLevel];
                return (
                  <motion.tr
                    key={journal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-gold-500 font-medium">{journal.journalNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white">{journal.description}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-white/60">{journal.entity}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-white font-medium">{formatCurrency(journal.amount, journal.currency)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${rk.bg} ${rk.color}`}>
                        {rk.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {journal.riskFlags.length > 0 ? (
                        <span className="text-xs text-orange-400">{journal.riskFlags.length} flag{journal.riskFlags.length !== 1 ? "s" : ""}</span>
                      ) : (
                        <span className="text-xs text-white/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {journal.status === "PENDING" && (
                          <>
                            <button className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors" title="Approve">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors" title="Reject">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors" title="Flag">
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
