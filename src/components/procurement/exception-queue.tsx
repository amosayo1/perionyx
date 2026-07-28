"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, CheckCircle, Clock, Shield, User, Filter,
  ChevronDown, Search, ArrowUpRight, Loader2, XCircle,
} from "lucide-react";

export type ExceptionStatus = "OPEN" | "IN_REVIEW" | "ESCALATED" | "RESOLVED";
export type ExceptionSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ExceptionType =
  | "PRICE_VARIANCE" | "QUANTITY_VARIANCE" | "DUPLICATE" | "TAX_MISMATCH"
  | "MISSING_PO" | "MISSING_GRN" | "BUDGET_EXCEEDED" | "POLICY_VIOLATION";

export interface Exception {
  id: string;
  companyId: string;
  vendorInvoiceId: string;
  exceptionType: ExceptionType;
  severity: ExceptionSeverity;
  description: string;
  varianceAmount: number;
  status: ExceptionStatus;
  assignedTo: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  escalatedTo: string | null;
  escalatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ExceptionQueueProps {
  exceptions: Exception[];
  onAssign: (id: string, userId: string) => Promise<void>;
  onResolve: (id: string, resolution: string, notes: string) => Promise<void>;
  onEscalate: (id: string, reason: string) => Promise<void>;
  onBulkResolve: (ids: string[], resolution: string, notes: string) => Promise<void>;
  loading?: boolean;
}

const severityConfig: Record<ExceptionSeverity, { badge: string; icon: React.ReactNode; label: string }> = {
  CRITICAL: { badge: "bg-red-950/60 text-red-400 border-red-900/60", icon: <XCircle className="h-3 w-3" />, label: "CRITICAL" },
  HIGH: { badge: "bg-orange-950/60 text-orange-400 border-orange-900/60", icon: <AlertTriangle className="h-3 w-3" />, label: "HIGH" },
  MEDIUM: { badge: "bg-amber-950/60 text-amber-400 border-amber-900/60", icon: <Clock className="h-3 w-3" />, label: "MEDIUM" },
  LOW: { badge: "bg-blue-950/60 text-blue-400 border-blue-900/60", icon: <Shield className="h-3 w-3" />, label: "LOW" },
};

const statusConfig: Record<ExceptionStatus, { badge: string; icon: React.ReactNode }> = {
  OPEN: { badge: "bg-gray-800 text-gray-400 border-gray-700", icon: <AlertTriangle className="h-3 w-3" /> },
  IN_REVIEW: { badge: "bg-blue-950/50 text-blue-400 border-blue-900/50", icon: <User className="h-3 w-3" /> },
  ESCALATED: { badge: "bg-red-950/50 text-red-400 border-red-900/50", icon: <ArrowUpRight className="h-3 w-3" /> },
  RESOLVED: { badge: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50", icon: <CheckCircle className="h-3 w-3" /> },
};

const typeLabels: Record<ExceptionType, string> = {
  PRICE_VARIANCE: "Price Variance",
  QUANTITY_VARIANCE: "Quantity Variance",
  DUPLICATE: "Duplicate",
  TAX_MISMATCH: "Tax Mismatch",
  MISSING_PO: "Missing PO",
  MISSING_GRN: "Missing GRN",
  BUDGET_EXCEEDED: "Budget Exceeded",
  POLICY_VIOLATION: "Policy Violation",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function ExceptionQueue({
  exceptions,
  onAssign,
  onResolve,
  onEscalate,
  onBulkResolve,
  loading = false,
}: ExceptionQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | "ALL">("ALL");
  const [severityFilter, setSeverityFilter] = useState<ExceptionSeverity | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<ExceptionType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [resolveModal, setResolveModal] = useState<{ id: string; type: "resolve" | "escalate" } | null>(null);
  const [resolveText, setResolveText] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");

  const filtered = exceptions.filter((e) => {
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
    if (severityFilter !== "ALL" && e.severity !== severityFilter) return false;
    if (typeFilter !== "ALL" && e.exceptionType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !e.description.toLowerCase().includes(q) &&
        !e.id.toLowerCase().includes(q) &&
        !typeLabels[e.exceptionType].toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const statusCounts = exceptions.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  };

  const handleAction = async (id: string, action: () => Promise<void>) => {
    setActionLoading(id);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkResolve = async () => {
    if (selectedIds.size === 0 || !resolveText || resolveNotes.length < 20) return;
    await onBulkResolve(Array.from(selectedIds), resolveText, resolveNotes);
    setSelectedIds(new Set());
    setResolveModal(null);
    setResolveText("");
    setResolveNotes("");
  };

  const handleSingleResolve = async () => {
    if (!resolveModal || !resolveText || resolveNotes.length < 20) return;
    if (resolveModal.type === "resolve") {
      await onResolve(resolveModal.id, resolveText, resolveNotes);
    } else {
      await onEscalate(resolveModal.id, resolveNotes);
    }
    setResolveModal(null);
    setResolveText("");
    setResolveNotes("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a24] p-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">Loading exceptions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-[#1a1a24] px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search exceptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExceptionStatus | "ALL")}
            className="appearance-none rounded-lg border border-gray-800 bg-[#1a1a24] px-3 py-2 pr-8 text-sm text-gray-300 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open ({statusCounts.OPEN || 0})</option>
            <option value="IN_REVIEW">In Review ({statusCounts.IN_REVIEW || 0})</option>
            <option value="ESCALATED">Escalated ({statusCounts.ESCALATED || 0})</option>
            <option value="RESOLVED">Resolved ({statusCounts.RESOLVED || 0})</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        <div className="relative">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as ExceptionSeverity | "ALL")}
            className="appearance-none rounded-lg border border-gray-800 bg-[#1a1a24] px-3 py-2 pr-8 text-sm text-gray-300 outline-none"
          >
            <option value="ALL">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ExceptionType | "ALL")}
            className="appearance-none rounded-lg border border-gray-800 bg-[#1a1a24] px-3 py-2 pr-8 text-sm text-gray-300 outline-none"
          >
            <option value="ALL">All Types</option>
            {Object.entries(typeLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={() => setResolveModal({ id: "bulk", type: "resolve" })}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-950/50"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Bulk Resolve ({selectedIds.size})
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-800 bg-[#1a1a24]">
            <tr className="text-xs text-gray-500">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 rounded border-gray-700 bg-gray-800"
                />
              </th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-right">Variance</th>
              <th className="px-4 py-3 font-medium">Assigned</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-[#1a1a24]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                  {exceptions.length === 0 ? "No exceptions found" : "No exceptions match the current filters"}
                </td>
              </tr>
            ) : (
              filtered.map((ex) => {
                const sev = severityConfig[ex.severity];
                const st = statusConfig[ex.status];
                const isExpanded = expandedRow === ex.id;
                const isLoading = actionLoading === ex.id;
                return (
                  <tr key={ex.id} className={`hover:bg-gray-800/50 ${isExpanded ? "bg-gray-800/30" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(ex.id)}
                        onChange={() => toggleSelect(ex.id)}
                        disabled={ex.status === "RESOLVED"}
                        className="h-3.5 w-3.5 rounded border-gray-700 bg-gray-800 disabled:opacity-30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-300">{typeLabels[ex.exceptionType]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sev.badge}`}>
                        {sev.icon} {sev.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${st.badge}`}>
                        {st.icon} {ex.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-xs text-gray-400">{ex.description}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {ex.varianceAmount > 0 ? (
                        <span className="font-mono text-xs text-amber-400">{formatCurrency(ex.varianceAmount)}</span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ex.assignedTo ? (
                        <span className="text-xs text-gray-400">{ex.assignedTo.split(":").pop()?.slice(0, 8) || ex.assignedTo}</span>
                      ) : (
                        <span className="text-xs text-gray-600">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{formatTimeAgo(ex.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {ex.status !== "RESOLVED" && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAction(ex.id, () => onAssign(ex.id, "current-user"))}
                            disabled={isLoading || ex.status !== "OPEN"}
                            className="rounded p-1 text-gray-500 transition hover:bg-gray-800 hover:text-gray-300 disabled:opacity-30"
                            title="Assign to me"
                          >
                            <User className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setResolveModal({ id: ex.id, type: "resolve" })}
                            disabled={isLoading || !["IN_REVIEW", "ESCALATED"].includes(ex.status)}
                            className="rounded p-1 text-gray-500 transition hover:bg-emerald-900/30 hover:text-emerald-400 disabled:opacity-30"
                            title="Resolve"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setResolveModal({ id: ex.id, type: "escalate" })}
                            disabled={isLoading || !["OPEN", "IN_REVIEW"].includes(ex.status)}
                            className="rounded p-1 text-gray-500 transition hover:bg-red-900/30 hover:text-red-400 disabled:opacity-30"
                            title="Escalate"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#1a1a24] p-6 shadow-2xl">
            <h3 className="mb-4 text-sm font-semibold text-gray-200">
              {resolveModal.type === "resolve"
                ? resolveModal.id === "bulk"
                  ? `Bulk Resolve ${selectedIds.size} Exceptions`
                  : "Resolve Exception"
                : "Escalate Exception"}
            </h3>
            {resolveModal.type === "resolve" && (
              <div className="mb-3">
                <label className="mb-1 block text-xs text-gray-500">Resolution</label>
                <select
                  value={resolveText}
                  onChange={(e) => setResolveText(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0f0f0f] px-3 py-2 text-sm text-gray-200 outline-none"
                >
                  <option value="">Select resolution...</option>
                  <option value="APPROVED_AS_CORRECT">Approved as correct</option>
                  <option value="VARIANCE_ACCEPTED">Variance accepted within tolerance</option>
                  <option value="DUPLICATE_VOIDED">Duplicate invoice voided</option>
                  <option value="MANUAL_ADJUSTMENT">Manual adjustment applied</option>
                  <option value="VENDOR_CREDIT_RECEIVED">Vendor credit received</option>
                </select>
              </div>
            )}
            <div className="mb-4">
              <label className="mb-1 block text-xs text-gray-500">
                {resolveModal.type === "resolve" ? "Resolution Notes (min 20 chars)" : "Escalation Reason"}
              </label>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-800 bg-[#0f0f0f] px-3 py-2 text-sm text-gray-200 outline-none placeholder-gray-600"
                placeholder={resolveModal.type === "resolve" ? "Provide detailed resolution notes..." : "Explain why this needs escalation..."}
              />
              {resolveModal.type === "resolve" && resolveNotes.length > 0 && resolveNotes.length < 20 && (
                <p className="mt-1 text-[11px] text-red-400">{resolveNotes.length}/20 characters minimum</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setResolveModal(null); setResolveText(""); setResolveNotes(""); }}
                className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSingleResolve}
                disabled={!resolveText || (resolveModal.type === "resolve" && resolveNotes.length < 20)}
                className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-950/50 disabled:opacity-30"
              >
                {resolveModal.type === "resolve" ? "Resolve" : "Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
