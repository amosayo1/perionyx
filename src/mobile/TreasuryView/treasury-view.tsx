"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ExecutiveCard, ExecutiveCardGrid } from "@/mobile/ExecutiveCards/executive-cards";
import {
  DollarSign, BarChart3, Globe, Shield, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const MOCK = {
  totalCash: { label: "Total Cash", value: "$847.2M", subtitle: "+2.3% vs yesterday", trend: "up" as const, trendValue: "+2.3%" },
  netLiquidity: { label: "Net Liquidity", value: "$721.5M", subtitle: "Available for operations", trend: "up" as const, trendValue: "+1.8%" },
  receivables: { label: "Receivables", value: "$189.4M", subtitle: "Pending collection", trend: "up" as const, trendValue: "+0.7%" },
  payables: { label: "Payables (30d)", value: "$134.7M", subtitle: "Due within 30 days", trend: "neutral" as const, trendValue: "+3.1%" },
  fxExposure: [
    { currency: "EUR", amount: "$124.3M", pct: "55%", trend: "up" as const },
    { currency: "GBP", amount: "$48.7M", pct: "22%", trend: "down" as const },
    { currency: "CHF", amount: "$31.2M", pct: "14%", trend: "neutral" as const },
    { currency: "JPY", amount: "$20.1M", pct: "9%", trend: "up" as const },
  ],
  riskIndicators: [
    { label: "Concentration Risk", value: "High", color: "red" as const, sub: "Top 3 > 60%" },
    { label: "FX Exposure", value: "Moderate", color: "amber" as const, sub: "72% of limit" },
    { label: "Liquidity Coverage", value: "94.2%", color: "emerald" as const, sub: "Above 80% threshold" },
  ],
  upcomingPayments: [
    { vendor: "CloudScale Inc.", amount: "$847,200", due: "Today", priority: "high" as const },
    { vendor: "DataSync Corp", amount: "$1,240,000", due: "Tomorrow", priority: "medium" as const },
    { vendor: "SecureNet Ltd", amount: "$395,800", due: "Jul 10", priority: "low" as const },
  ],
};

const priorityColors = {
  high: "border-l-red-500/50",
  medium: "border-l-gold/50",
  low: "border-l-zinc-600/50",
};

export function TreasuryView({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <div className={cn("mx-auto max-w-lg space-y-3 px-4 pb-32 pt-2", className)}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white">Treasury</h1>
        <p className="text-[11px] text-zinc-500">Real-time cash position & risk</p>
      </motion.div>

      <ExecutiveCardGrid>
        <ExecutiveCard metric={MOCK.totalCash} accent="gold" icon={<DollarSign className="h-4 w-4" />} />
        <ExecutiveCard metric={MOCK.netLiquidity} accent="emerald" icon={<BarChart3 className="h-4 w-4" />} />
        <ExecutiveCard metric={MOCK.receivables} accent="blue" icon={<TrendingUp className="h-4 w-4" />} />
        <ExecutiveCard metric={MOCK.payables} accent="amber" icon={<Activity className="h-4 w-4" />} />
      </ExecutiveCardGrid>

      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">FX Exposure</span>
        </div>
        <div className="space-y-2">
          {MOCK.fxExposure.map((fx) => (
            <div key={fx.currency} className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-300">{fx.currency}</span>
                <span className="text-[10px] text-zinc-600">{fx.pct}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">{fx.amount}</span>
                {fx.trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-400" />}
                {fx.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Risk Indicators</span>
        </div>
        <div className="space-y-2">
          {MOCK.riskIndicators.map((r) => (
            <div key={r.label} className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
              <span className="text-xs text-zinc-400">{r.label}</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-medium",
                  r.color === "red" ? "text-red-400" : r.color === "amber" ? "text-amber-400" : "text-emerald-400",
                )}>{r.value}</span>
                <span className="text-[9px] text-zinc-600">{r.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Upcoming Payments</span>
        </div>
        <div className="space-y-2">
          {MOCK.upcomingPayments.map((p) => (
            <div
              key={p.vendor}
              className={cn("flex items-center justify-between rounded-lg border-l-2 bg-zinc-900/60 px-3 py-2", priorityColors[p.priority])}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-200">{p.vendor}</p>
                <p className="text-[10px] text-zinc-500">Due {p.due}</p>
              </div>
              <span className="text-xs font-semibold text-zinc-200">{p.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
