"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DollarSign, Droplets, ArrowUpDown, Shield, Landmark, TrendingUp } from "lucide-react";
import { MOCK_CASH_POSITION, MOCK_LIQUIDITY_SUMMARY, MOCK_PAYMENT_SUMMARY, MOCK_BANK_ACCOUNT_SUMMARY, MOCK_FORECAST_SUMMARY, MOCK_RISK_SUMMARY } from "./data";

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

const MODULES = [
    { id: "cash", icon: DollarSign, title: "Cash Position", color: "text-emerald-400", data: MOCK_CASH_POSITION as unknown as Record<string, unknown>, fields: [
    { label: "Total Cash", value: (d: Record<string, unknown>) => formatCompact(d.totalCash as number) },
    { label: "Available", value: (d: Record<string, unknown>) => formatCompact(d.availableCash as number) },
    { label: "Change", value: (d: Record<string, unknown>) => `${(d.changePercent as number) >= 0 ? "+" : ""}${(d.changePercent as number).toFixed(2)}%` },
  ]},
  { id: "liquidity", icon: Droplets, title: "Liquidity", color: "text-blue-400", data: MOCK_LIQUIDITY_SUMMARY as unknown as Record<string, unknown>, fields: [
    { label: "Score", value: (d: Record<string, unknown>) => `${d.liquidityScore}/100` },
    { label: "Coverage Ratio", value: (d: Record<string, unknown>) => `${d.coverageRatio}x` },
    { label: "Days Remaining", value: (d: Record<string, unknown>) => `${d.daysCashRemaining}d` },
  ]},
  { id: "payments", icon: ArrowUpDown, title: "Payments", color: "text-violet-400", data: MOCK_PAYMENT_SUMMARY as unknown as Record<string, unknown>, fields: [
    { label: "Today", value: (d: Record<string, unknown>) => `${d.paymentsToday} payments` },
    { label: "Volume", value: (d: Record<string, unknown>) => formatCompact(d.paymentsTodayValue as number) },
    { label: "Pending", value: (d: Record<string, unknown>) => `${d.pendingApprovals} items` },
  ]},
  { id: "banks", icon: Landmark, title: "Bank Accounts", color: "text-cyan-400", data: MOCK_BANK_ACCOUNT_SUMMARY as unknown as Record<string, unknown>, fields: [
    { label: "Active", value: (d: Record<string, unknown>) => `${d.activeAccounts}` },
    { label: "Banks", value: (d: Record<string, unknown>) => `${d.totalBanks}` },
    { label: "Compliance", value: (d: Record<string, unknown>) => `${d.complianceIssues} issues` },
  ]},
  { id: "forecast", icon: TrendingUp, title: "Forecast", color: "text-amber-400", data: MOCK_FORECAST_SUMMARY as unknown as Record<string, unknown>, fields: [
    { label: "Accuracy", value: (d: Record<string, unknown>) => `${d.forecastAccuracy}%` },
    { label: "Confidence", value: (d: Record<string, unknown>) => `${d.confidenceScore}%` },
    { label: "Runway", value: (d: Record<string, unknown>) => `${d.cashRunway}d` },
  ]},
  { id: "risk", icon: Shield, title: "Risk", color: "text-red-400", data: MOCK_RISK_SUMMARY as unknown as Record<string, unknown>, fields: [
    { label: "Score", value: (d: Record<string, unknown>) => `${d.overallScore}/100` },
    { label: "FX Exposure", value: (d: Record<string, unknown>) => formatCompact(d.fxExposure as number) },
    { label: "Policy Breaches", value: (d: Record<string, unknown>) => `${d.policyBreaches}` },
  ]},
];

export function ModuleSummaries({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Module summaries">
      <h2 className="text-sm font-semibold text-white">Module Summaries</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {MODULES.map((mod, i) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4"
            role="article" aria-label={mod.title}
          >
            <div className="flex items-center gap-2 mb-3">
              <mod.icon className={cn("h-4 w-4", mod.color)} aria-hidden="true" />
              <h3 className="text-[12px] font-semibold text-white">{mod.title}</h3>
            </div>
            <div className="space-y-1.5">
              {mod.fields.map((f) => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">{f.label}</span>
                  <span className="text-[12px] font-medium text-white">{f.value(mod.data)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
