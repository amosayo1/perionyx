"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertOctagon, Info, CheckCircle, XCircle } from "lucide-react";
import { MOCK_ALERTS } from "./data";

const SEVERITIES = ["All", "info", "warning", "critical", "emergency"] as const;
const CATEGORIES = ["All", ...Array.from(new Set(MOCK_ALERTS.map((a) => a.category)))];

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function BankAccountAlertsPanel({ className }: { className?: string }) {
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const handleAcknowledge = useCallback((id: string) => {
    setAcknowledged((prev) => new Set(prev).add(id));
  }, []);

  const handleAcknowledgeAll = useCallback(() => {
    setAcknowledged(new Set(MOCK_ALERTS.map((a) => a.id)));
  }, []);

  const visible = useMemo(() => {
    let list = [...MOCK_ALERTS];
    if (severityFilter !== "All") list = list.filter((a) => a.severity === severityFilter);
    if (categoryFilter !== "All") list = list.filter((a) => a.category === categoryFilter);
    return list.sort((a, b) => {
      const aAcked = acknowledged.has(a.id) || a.acknowledged;
      const bAcked = acknowledged.has(b.id) || b.acknowledged;
      if (aAcked !== bAcked) return aAcked ? 1 : -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [severityFilter, categoryFilter, acknowledged]);

  const unackedCount = useMemo(
    () => visible.filter((a) => !(acknowledged.has(a.id) || a.acknowledged)).length,
    [visible, acknowledged],
  );

  const severityIcon = (severity: string, className?: string) => {
    switch (severity) {
      case "emergency":
        return <AlertOctagon className={cn("h-4 w-4 shrink-0 text-red-400", className)} aria-hidden />;
      case "critical":
        return <AlertTriangle className={cn("h-4 w-4 shrink-0 text-red-400", className)} aria-hidden />;
      case "warning":
        return <AlertTriangle className={cn("h-4 w-4 shrink-0 text-amber-400", className)} aria-hidden />;
      default:
        return <Info className={cn("h-4 w-4 shrink-0 text-blue-400", className)} aria-hidden />;
    }
  };

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-white">Bank Account Alerts</h3>
            <p className="text-[12px] text-zinc-500">
              {unackedCount} unacknowledged of {visible.length} total
            </p>
          </div>
          {unackedCount > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-zinc-800 px-2.5 py-1.5 text-[11px] text-zinc-300 transition-colors hover:bg-zinc-700"
              aria-label="Acknowledge all alerts"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden />
              Acknowledge All
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            className="rounded-md border border-white/[0.06] bg-zinc-800 px-2.5 py-1.5 text-[12px] text-zinc-300 outline-none focus:ring-1 focus:ring-[#c9a84c]/50"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            aria-label="Filter by severity"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-white/[0.06] bg-zinc-800 px-2.5 py-1.5 text-[12px] text-zinc-300 outline-none focus:ring-1 focus:ring-[#c9a84c]/50"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="divide-y divide-white/[0.06]" role="list" aria-label="Alerts list">
        {visible.map((alert) => {
          const isAcked = acknowledged.has(alert.id) || alert.acknowledged;
          return (
            <div
              key={alert.id}
              role="listitem"
              className={cn(
                "px-5 py-4 transition-colors hover:bg-zinc-800/20",
                !isAcked && "border-l-2",
                !isAcked && alert.severity === "emergency" && "border-l-red-500",
                !isAcked && alert.severity === "critical" && "border-l-red-500",
                !isAcked && alert.severity === "warning" && "border-l-amber-500",
                !isAcked && alert.severity === "info" && "border-l-blue-500",
              )}
            >
              <div className="flex items-start gap-3">
                {severityIcon(alert.severity, "mt-0.5")}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-white">{alert.title}</p>
                      <p className="text-[12px] text-zinc-400">{alert.message}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                          alert.severity === "emergency" && "bg-red-500/15 text-red-400",
                          alert.severity === "critical" && "bg-red-500/10 text-red-400",
                          alert.severity === "warning" && "bg-amber-500/10 text-amber-400",
                          alert.severity === "info" && "bg-blue-500/10 text-blue-400",
                        )}
                      >
                        {alert.severity}
                      </span>
                      {!isAcked && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300 transition-colors hover:bg-zinc-700"
                          aria-label={`Acknowledge alert ${alert.id}`}
                        >
                          <CheckCircle className="h-3 w-3" aria-hidden />
                          Acknowledge
                        </button>
                      )}
                      {isAcked && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <XCircle className="h-3 w-3" aria-hidden />
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                    <span>{formatTimestamp(alert.timestamp)}</span>
                    <span aria-hidden>&bull;</span>
                    <span>{alert.entity}</span>
                    <span aria-hidden>&bull;</span>
                    <span>{alert.accountNumber}</span>
                    <span
                      className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-400"
                    >
                      {alert.category}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#c9a84c]">&rarr; {alert.suggestedAction}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
