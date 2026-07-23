"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, AlertOctagon, AlertCircle, ShieldCheck,
} from "lucide-react";
import { MOCK_RISK_ITEMS } from "./data";
import type { PaymentRiskItem } from "./types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

const SEVERITY_STYLES: Record<PaymentRiskItem["severity"], { border: string; icon: string; bg: string }> = {
  healthy: {
    border: "border-emerald-500/40",
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  watch: {
    border: "border-amber-500/40",
    icon: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  critical: {
    border: "border-red-500/40",
    icon: "text-red-400",
    bg: "bg-red-500/10",
  },
};

const SEVERITY_LABELS: Record<PaymentRiskItem["severity"], string> = {
  healthy: "Healthy",
  watch: "Watch",
  critical: "Critical",
};

function RiskIcon({ severity, category }: { severity: PaymentRiskItem["severity"]; category: string }) {
  if (severity === "critical") {
    return <AlertOctagon className="h-5 w-5 text-red-400" aria-hidden="true" />;
  }
  if (severity === "watch") {
    return <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />;
  }
  return <AlertCircle className="h-5 w-5 text-emerald-400" aria-hidden="true" />;
}

function RiskCard({ item }: { item: PaymentRiskItem }) {
  const styles = SEVERITY_STYLES[item.severity];
  return (
    <div
      className={cn("rounded-lg border bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-800/40", styles.border)}
      role="article"
      aria-label={`Risk item: ${item.label}`}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", styles.bg)}>
          <RiskIcon severity={item.severity} category={item.category} />
        </div>
        <span className={cn(
          "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          styles.border,
          styles.icon,
        )}>
          {SEVERITY_LABELS[item.severity]}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{item.description}</p>
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="text-[12px] text-zinc-500">{item.entity}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#c9a84c]">{formatCurrency(item.value)}</span>
          <span className={cn(
            "inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-medium",
            styles.bg,
            styles.icon,
          )}>
            {item.count}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PaymentRiskPanelProps {
  className?: string;
}

export function PaymentRiskPanel({ className }: PaymentRiskPanelProps) {
  const summary = useMemo(() => {
    const totalValue = MOCK_RISK_ITEMS.reduce((acc, r) => acc + r.value, 0);
    const totalCount = MOCK_RISK_ITEMS.reduce((acc, r) => acc + r.count, 0);
    const breakdown = {
      critical: MOCK_RISK_ITEMS.filter((r) => r.severity === "critical").length,
      watch: MOCK_RISK_ITEMS.filter((r) => r.severity === "watch").length,
      healthy: MOCK_RISK_ITEMS.filter((r) => r.severity === "healthy").length,
    };
    return { totalValue, totalCount, breakdown };
  }, []);

  return (
    <div className={cn("flex flex-col", className)} aria-label="Payment risk dashboard">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Total Risk Value</p>
            <p className="mt-0.5 text-lg font-semibold text-white">{formatCurrency(summary.totalValue)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Total Items</p>
            <p className="mt-0.5 text-lg font-semibold text-white">{summary.totalCount}</p>
          </div>
          <div className="flex items-center gap-3">
            {summary.breakdown.critical > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-[12px] text-zinc-400">{summary.breakdown.critical} critical</span>
              </div>
            )}
            {summary.breakdown.watch > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-[12px] text-zinc-400">{summary.breakdown.watch} watch</span>
              </div>
            )}
            {summary.breakdown.healthy > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[12px] text-zinc-400">{summary.breakdown.healthy} healthy</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-5 md:grid-cols-2">
        {MOCK_RISK_ITEMS.map((item) => (
          <RiskCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
