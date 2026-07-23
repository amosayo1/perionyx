"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCheck,
  Check,
} from "lucide-react";
import { MOCK_ALERTS } from "./data";
import type { TreasuryRiskAlert, BreachSeverity } from "./types";

const SEVERITY_ORDER: Record<BreachSeverity, number> = {
  emergency: 0,
  critical: 1,
  warning: 2,
  info: 3,
};

const SEVERITY_ICONS: Record<BreachSeverity, typeof AlertTriangle> = {
  emergency: AlertOctagon,
  critical: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_COLORS: Record<
  BreachSeverity,
  { border: string; bg: string; text: string; icon: string; accent: string }
> = {
  emergency: {
    border: "border-red-500/40",
    bg: "bg-red-500/20",
    text: "text-red-300",
    icon: "text-red-400",
    accent: "border-l-red-500",
  },
  critical: {
    border: "border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-300",
    icon: "text-red-400",
    accent: "border-l-red-500",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    icon: "text-amber-400",
    accent: "border-l-amber-500",
  },
  info: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    icon: "text-blue-400",
    accent: "border-l-blue-500",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  FX: "bg-violet-500/15 text-violet-300",
  interest_rate: "bg-cyan-500/15 text-cyan-300",
  liquidity: "bg-sky-500/15 text-sky-300",
  counterparty: "bg-orange-500/15 text-orange-300",
  country: "bg-rose-500/15 text-rose-300",
  VaR: "bg-purple-500/15 text-purple-300",
  policy: "bg-indigo-500/15 text-indigo-300",
  concentration: "bg-pink-500/15 text-pink-300",
  hedge: "bg-teal-500/15 text-teal-300",
  derivative: "bg-yellow-500/15 text-yellow-300",
  compliance: "bg-emerald-500/15 text-emerald-300",
};

const CATEGORIES = Array.from(new Set(MOCK_ALERTS.map((a) => a.category))).sort();
const SEVERITIES: ("All" | BreachSeverity)[] = ["All", "info", "warning", "critical", "emergency"];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatEntityShort(entity: string): string {
  return entity.replace("Perionyx ", "");
}

export function RiskAlertsPanel({ className }: { className?: string }) {
  const [severityFilter, setSeverityFilter] = useState<"All" | BreachSeverity>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(
    new Set(MOCK_ALERTS.filter((a) => a.acknowledged).map((a) => a.id))
  );

  const toggleAcknowledge = (id: string) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const acknowledgeAll = () => {
    setAcknowledged(new Set(filteredAlerts.map((a) => a.id)));
  };

  const filteredAlerts = useMemo(() => {
    let list = [...MOCK_ALERTS];

    if (severityFilter !== "All") {
      list = list.filter((a) => a.severity === severityFilter);
    }
    if (categoryFilter !== "All") {
      list = list.filter((a) => a.category === categoryFilter);
    }

    list.sort((a, b) => {
      const aAck = acknowledged.has(a.id);
      const bAck = acknowledged.has(b.id);
      if (aAck !== bAck) return aAck ? 1 : -1;
      const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return list;
  }, [severityFilter, categoryFilter, acknowledged]);

  const unacknowledgedCount = filteredAlerts.filter(
    (a) => !acknowledged.has(a.id)
  ).length;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-medium text-white">Risk Alerts</h3>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
            {MOCK_ALERTS.length}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500">
          <span className="text-amber-400">{unacknowledgedCount}</span> unacknowledged of{" "}
          {filteredAlerts.length}
        </span>
      </div>

      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2">
        <div className="flex gap-1" role="group" aria-label="Severity filter">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverityFilter(s)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors",
                severityFilter === s
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
              aria-pressed={severityFilter === s}
            >
              {s === "All" ? "All" : s}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-white/[0.06]" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-white/[0.06] bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 outline-none"
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-[600px] space-y-0 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-zinc-500">
            <Check className="h-8 w-8" />
            <span className="text-[13px]">No alerts match filters</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = SEVERITY_ICONS[alert.severity];
            const colors = SEVERITY_COLORS[alert.severity];
            const isAck = acknowledged.has(alert.id);

            return (
              <div
                key={alert.id}
                className={cn(
                  "group border-b border-white/[0.03] px-4 py-3 transition-colors last:border-b-0 hover:bg-white/[0.02]",
                  !isAck && "bg-white/[0.015]"
                )}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      colors.bg
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", colors.icon)} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "truncate text-[13px] font-medium",
                              isAck ? "text-zinc-400" : "text-white"
                            )}
                          >
                            {alert.title}
                          </span>
                          {!isAck && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                          )}
                        </div>
                        <p
                          className={cn(
                            "mt-0.5 text-[12px] leading-relaxed",
                            isAck ? "text-zinc-500" : "text-zinc-400"
                          )}
                        >
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      <span>{formatEntityShort(alert.entity)}</span>
                      <span>{alert.source}</span>
                      <span>Owner: {alert.owner}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                          colors.bg,
                          colors.text
                        )}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                          CATEGORY_COLORS[alert.category] || "bg-zinc-700 text-zinc-300"
                        )}
                      >
                        {alert.category.replace(/_/g, " ")}
                      </span>
                      {alert.suggestedAction && (
                        <span className="text-[11px] font-medium text-amber-400/90">
                          {alert.suggestedAction}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAcknowledge(alert.id)}
                    className={cn(
                      "mt-0.5 flex h-6 shrink-0 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors",
                      isAck
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 opacity-0 group-hover:opacity-100"
                        : "border-white/[0.08] bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    )}
                    aria-label={isAck ? "Unacknowledge alert" : "Acknowledge alert"}
                  >
                    <Check className="h-3 w-3" />
                    {isAck ? "Acknowledged" : "Acknowledge"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredAlerts.length > 0 && (
        <div className="flex items-center justify-end border-t border-white/[0.06] px-4 py-2">
          <button
            type="button"
            onClick={acknowledgeAll}
            className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            aria-label="Acknowledge all visible alerts"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Acknowledge All
          </button>
        </div>
      )}
    </div>
  );
}
