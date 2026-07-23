"use client";

import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Minus, ArrowUpFromLine, ArrowDownToLine,
  ArrowLeftRight, Clock, CheckCircle2, XCircle, Timer, BarChart3, Gauge,
} from "lucide-react";
import { MOCK_PAYMENT_METRICS } from "./data";

interface PaymentsOverviewProps {
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

interface KpiCardData {
  label: string;
  value: string;
  sub?: string;
  trend: "up" | "down" | "stable";
  delta: number;
  status: "positive" | "negative" | "neutral" | "warning";
  barColor: string;
  barWidth: number;
}

function KpiCard({ data }: { data: KpiCardData }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{data.label}</p>
        {data.trend === "up" ? (
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        ) : data.trend === "down" ? (
          <TrendingDown className="h-4 w-4 text-red-400" />
        ) : (
          <Minus className="h-4 w-4 text-zinc-500" />
        )}
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{data.value}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className={cn(
          "text-[12px] font-medium",
          data.status === "positive" ? "text-emerald-400" :
          data.status === "negative" ? "text-red-400" :
          data.status === "warning" ? "text-amber-400" :
          "text-zinc-400",
        )}>
          {data.delta >= 0 ? "+" : ""}{data.delta.toFixed(1)}%
        </span>
        {data.sub && <span className="text-[11px] text-zinc-500">{data.sub}</span>}
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(data.barWidth, 100)}%`,
            backgroundColor: data.barColor,
          }}
          role="progressbar"
          aria-valuenow={data.barWidth}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${data.label} sparkline`}
        />
      </div>
    </div>
  );
}

export function PaymentsOverview({ className }: PaymentsOverviewProps) {
  const m = MOCK_PAYMENT_METRICS;

  const cards: KpiCardData[] = [
    {
      label: "Outgoing Payments",
      value: formatCurrency(m.outgoingValue),
      sub: `${formatNumber(m.outgoingCount)} payments`,
      trend: "up",
      delta: 12.4,
      status: "warning",
      barColor: "#f59e0b",
      barWidth: 72,
    },
    {
      label: "Incoming Collections",
      value: formatCurrency(m.incomingValue),
      sub: `${formatNumber(m.incomingCount)} collections`,
      trend: "up",
      delta: 8.2,
      status: "positive",
      barColor: "#22c55e",
      barWidth: 58,
    },
    {
      label: "Net Cash Flow",
      value: formatCurrency(Math.abs(m.netCashFlow)),
      sub: m.netCashFlow >= 0 ? "Net positive" : "Net negative",
      trend: m.netCashFlow >= 0 ? "up" : "down",
      delta: m.netCashFlow >= 0 ? 3.5 : -5.2,
      status: m.netCashFlow >= 0 ? "positive" : "negative",
      barColor: m.netCashFlow >= 0 ? "#22c55e" : "#ef4444",
      barWidth: 45,
    },
    {
      label: "Pending Payments",
      value: formatNumber(m.pendingCount),
      sub: formatCurrency(m.pendingValue),
      trend: "up",
      delta: 6.8,
      status: "warning",
      barColor: "#f59e0b",
      barWidth: 35,
    },
    {
      label: "Awaiting Approval",
      value: formatNumber(m.awaitingApproval),
      sub: formatCurrency(m.awaitingApprovalValue),
      trend: "down",
      delta: -3.1,
      status: "warning",
      barColor: "#f97316",
      barWidth: 28,
    },
    {
      label: "Completed Today",
      value: formatNumber(m.completedToday),
      sub: formatCurrency(m.completedTodayValue),
      trend: "up",
      delta: 15.6,
      status: "positive",
      barColor: "#22c55e",
      barWidth: 85,
    },
    {
      label: "Failed Today",
      value: formatNumber(m.failedToday),
      sub: formatCurrency(m.failedTodayValue),
      trend: "up",
      delta: 2.1,
      status: "negative",
      barColor: "#ef4444",
      barWidth: 12,
    },
    {
      label: "Avg Processing Time",
      value: `${m.averageProcessingMinutes}m`,
      sub: "per payment",
      trend: "stable",
      delta: 0.0,
      status: "neutral",
      barColor: "#6366f1",
      barWidth: 30,
    },
    {
      label: "Avg Settlement Time",
      value: `${m.averageSettlementHours}h`,
      sub: "per payment",
      trend: "down",
      delta: -4.8,
      status: "positive",
      barColor: "#6366f1",
      barWidth: 40,
    },
    {
      label: "Daily Volume",
      value: formatNumber(m.dailyVolume),
      sub: "payments today",
      trend: "up",
      delta: 5.3,
      status: "positive",
      barColor: "#c9a84c",
      barWidth: 65,
    },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", className)}>
      {cards.map((card) => (
        <KpiCard key={card.label} data={card} />
      ))}
    </div>
  );
}
