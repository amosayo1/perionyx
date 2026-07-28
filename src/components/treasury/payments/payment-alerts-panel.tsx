"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Info, AlertTriangle, AlertOctagon, Skull, CheckCircle2, ChevronDown, Bell,
} from "lucide-react";
import { MOCK_ALERTS } from "./data";
import type { AlertSeverity, AlertCategory } from "./types";

const SEVERITIES: { value: string; label: string }[] = [
  { value: "All", label: "All Severities" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
  { value: "emergency", label: "Emergency" },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: "All", label: "All Categories" },
  { value: "approval_sla", label: "Approval SLA" },
  { value: "failed_payment", label: "Failed Payment" },
  { value: "settlement_delay", label: "Settlement Delay" },
  { value: "duplicate_payment", label: "Duplicate" },
  { value: "large_payment", label: "Large Payment" },
  { value: "policy_violation", label: "Policy Violation" },
  { value: "liquidity_impact", label: "Liquidity" },
  { value: "counterparty_risk", label: "Counterparty Risk" },
  { value: "fx_timing", label: "FX Timing" },
  { value: "fraud_review", label: "Fraud Review" },
];

const SEVERITY_ICONS: Record<AlertSeverity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
  emergency: Skull,
};

const SEVERITY_STYLES: Record<AlertSeverity, { badge: string; icon: string; border: string }> = {
  info: {
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: "text-blue-400",
    border: "border-l-blue-500",
  },
  warning: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: "text-amber-400",
    border: "border-l-amber-500",
  },
  critical: {
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: "text-red-400",
    border: "border-l-red-500",
  },
  emergency: {
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: "text-purple-400",
    border: "border-l-purple-500",
  },
};

const CATEGORY_LABELS: Record<AlertCategory, string> = {
  approval_sla: "Approval SLA",
  failed_payment: "Failed Payment",
  settlement_delay: "Settlement Delay",
  duplicate_payment: "Duplicate",
  large_payment: "Large Payment",
  policy_violation: "Policy Violation",
  liquidity_impact: "Liquidity Impact",
  counterparty_risk: "Counterparty Risk",
  fx_timing: "FX Timing",
  fraud_review: "Fraud Review",
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month} ${day}, ${hours}:${minutes}`;
}

interface PaymentAlertsPanelProps {
  className?: string;
}

export function PaymentAlertsPanel({ className }: PaymentAlertsPanelProps) {
  const [severityFilter, setSeverityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(
    new Set(MOCK_ALERTS.filter((a) => a.acknowledged).map((a) => a.id)),
  );

  const handleAcknowledge = useCallback((id: string) => {
    setAcknowledged((prev) => new Set(prev).add(id));
  }, []);

  const handleAcknowledgeAll = useCallback(() => {
    setAcknowledged(new Set(filteredAlerts.map((a) => a.id)));
  }, []);

  const filteredAlerts = useMemo(() => {
    let items = [...MOCK_ALERTS];

    if (severityFilter !== "All") {
      items = items.filter((a) => a.severity === severityFilter);
    }
    if (categoryFilter !== "All") {
      items = items.filter((a) => a.category === categoryFilter);
    }

    items.sort((a, b) => {
      const aAck = acknowledged.has(a.id);
      const bAck = acknowledged.has(b.id);
      if (aAck !== bAck) return aAck ? 1 : -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return items;
  }, [severityFilter, categoryFilter, acknowledged]);

  const unacknowledgedCount = useMemo(
    () => filteredAlerts.filter((a) => !acknowledged.has(a.id)).length,
    [filteredAlerts, acknowledged],
  );

  return (
    <div className={cn("flex flex-col", className)} aria-label="Payment alerts feed">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <label htmlFor="alert-severity-filter" className="sr-only">Severity filter</label>
          <div className="relative">
            <select
              id="alert-severity-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="appearance-none rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 pr-8 text-[12px] text-zinc-300 outline-none focus:border-gold/50"
              aria-label="Filter by severity"
            >
              {SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="alert-category-filter" className="sr-only">Category filter</label>
          <div className="relative">
            <select
              id="alert-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 pr-8 text-[12px] text-zinc-300 outline-none focus:border-gold/50"
              aria-label="Filter by category"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[12px] text-zinc-500">
            <Bell className="mr-1 inline h-3.5 w-3.5" />
            {unacknowledgedCount} unacknowledged of {filteredAlerts.length} total
          </span>
          {unacknowledgedCount > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold/20"
              aria-label="Acknowledge all alerts"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Acknowledge All
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 divide-y divide-white/[0.06] overflow-y-auto">
        {filteredAlerts.map((alert) => {
          const isAcknowledged = acknowledged.has(alert.id);
          const SeverityIcon = SEVERITY_ICONS[alert.severity];
          const styles = SEVERITY_STYLES[alert.severity];

          return (
            <div
              key={alert.id}
              className={cn(
                "border-l-2 px-5 py-4 transition-colors hover:bg-zinc-800/30",
                !isAcknowledged ? styles.border : "border-l-transparent",
              )}
              role="article"
              aria-label={`Alert: ${alert.title}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <SeverityIcon className={cn("h-5 w-5", styles.icon)} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{alert.title}</span>
                    <span className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      styles.badge,
                    )}>
                      {alert.severity}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-white/[0.06] bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">
                      {CATEGORY_LABELS[alert.category]}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{alert.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-zinc-500">
                    <span>{formatTimestamp(alert.timestamp)}</span>
                    <span>{alert.entity}</span>
                    <span>{alert.paymentReference}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[12px] font-medium text-gold">{alert.suggestedAction}</span>
                    {!isAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-zinc-800/50 px-2.5 py-1 text-[11px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
                        aria-label={`Acknowledge alert ${alert.id}`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredAlerts.length === 0 && (
          <div className="flex items-center justify-center py-16 text-[13px] text-zinc-500">
            No alerts match the selected filters
          </div>
        )}
      </div>
    </div>
  );
}
