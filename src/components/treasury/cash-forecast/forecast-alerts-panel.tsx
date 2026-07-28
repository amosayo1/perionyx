"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, AlertCircle, Info, Skull,
  CheckCircle2, Bell, BellOff, Filter,
} from "lucide-react";
import { MOCK_ALERTS } from "./data";
import type { ForecastAlert } from "./types";

const SEVERITY_ORDER: Record<string, number> = {
  emergency: 0,
  critical: 1,
  warning: 2,
  info: 3,
};

const SEVERITY_CONFIG: Record<
  string,
  { label: string; border: string; bg: string; icon: React.ElementType }
> = {
  emergency: {
    label: "Emergency",
    border: "border-l-red-500",
    bg: "bg-red-500/10",
    icon: Skull,
  },
  critical: {
    label: "Critical",
    border: "border-l-red-400",
    bg: "bg-red-500/8",
    icon: AlertTriangle,
  },
  warning: {
    label: "Warning",
    border: "border-l-amber-400",
    bg: "bg-amber-500/8",
    icon: AlertCircle,
  },
  info: {
    label: "Info",
    border: "border-l-blue-400",
    bg: "bg-blue-500/8",
    icon: Info,
  },
};

const CATEGORIES = [...new Set(MOCK_ALERTS.map((a) => a.category))];

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mon = months[d.getMonth()];
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${mon} ${day}, ${hh}:${mm}`;
}

export function ForecastAlertsPanel() {
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const unacknowledgedCount = MOCK_ALERTS.filter(
    (a) => a.acknowledged && !acknowledged.has(a.id)
  ).length;

  const filtered = useMemo(() => {
    let data = [...MOCK_ALERTS];
    if (severityFilter) data = data.filter((a) => a.severity === severityFilter);
    if (categoryFilter) data = data.filter((a) => a.category === categoryFilter);

    data.sort((a, b) => {
      const aUnack =
        (a.acknowledged || acknowledged.has(a.id)) ? 1 : 0;
      const bUnack =
        (b.acknowledged || acknowledged.has(b.id)) ? 1 : 0;
      if (aUnack !== bUnack) return aUnack - bUnack;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return data;
  }, [severityFilter, categoryFilter, acknowledged]);

  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => new Set(prev).add(id));
  };

  const handleAcknowledgeAll = () => {
    setAcknowledged(
      new Set(MOCK_ALERTS.map((a) => a.id))
    );
  };

  const isAcknowledged = (alert: ForecastAlert) =>
    alert.acknowledged || acknowledged.has(alert.id);

  const totalUnacknowledged = MOCK_ALERTS.filter((a) => !isAcknowledged(a)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Forecast Alerts</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">
            {totalUnacknowledged} unacknowledged of {MOCK_ALERTS.length} total
          </span>
          {totalUnacknowledged > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="text-xs px-2 py-1 rounded bg-zinc-800/50 border border-white/10 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
              aria-label="Acknowledge all alerts"
            >
              Acknowledge All
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={severityFilter ?? ""}
          onChange={(e) => setSeverityFilter(e.target.value || null)}
          className="text-xs bg-zinc-900/50 border border-white/10 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-gold/50"
          aria-label="Filter by severity"
        >
          <option value="">All Severities</option>
          <option value="emergency">Emergency</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        <select
          value={categoryFilter ?? ""}
          onChange={(e) => setCategoryFilter(e.target.value || null)}
          className="text-xs bg-zinc-900/50 border border-white/10 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-gold/50"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((alert) => {
          const severity = SEVERITY_CONFIG[alert.severity];
          const acknowledged = isAcknowledged(alert);
          const SeverityIcon = severity.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                "border-l-2 border-r border-t border-b border-white/[0.06] rounded-lg p-4 transition-colors",
                !acknowledged ? severity.border : "border-l-zinc-700",
                acknowledged ? "opacity-60" : severity.bg
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    alert.severity === "emergency"
                      ? "bg-red-500/15 text-red-400"
                      : alert.severity === "critical"
                        ? "bg-red-500/10 text-red-400"
                        : alert.severity === "warning"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                  )}
                >
                  <SeverityIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full border font-medium",
                        alert.severity === "emergency"
                          ? "bg-red-500/15 text-red-400 border-red-500/25"
                          : alert.severity === "critical"
                            ? "bg-red-500/10 text-red-300 border-red-500/20"
                            : alert.severity === "warning"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      )}
                    >
                      {severity.label}
                    </span>
                    <span className="text-xs text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded-full border border-zinc-700/50">
                      {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
                    </span>
                    {acknowledged && (
                      <span className="text-xs text-zinc-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Acknowledged
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-medium text-white">{alert.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{alert.message}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span>{alert.entity}</span>
                    <span className="text-zinc-600">|</span>
                    <span>{alert.forecastPeriod}</span>
                    <span className="text-zinc-600">|</span>
                    <span>{formatTimestamp(alert.timestamp)}</span>
                  </div>

                  <div className="mt-2 text-xs text-gold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {alert.suggestedAction}
                  </div>
                </div>

                {!acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="flex-shrink-0 text-xs px-2 py-1 rounded bg-zinc-800/50 border border-white/10 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                    aria-label="Acknowledge alert"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-zinc-500 text-sm">
          No alerts match the selected filters.
        </div>
      )}
    </div>
  );
}