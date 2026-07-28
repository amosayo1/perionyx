"use client";

import { cn } from "@/lib/utils";
import {
  ArrowUpFromLine, ArrowDownToLine, ArrowLeftRight, Clock, CheckCircle2,
  XCircle, Ban, Building2, Landmark, Globe, AlertTriangle, RefreshCw,
  Download, Printer, Plus, TrendingUp, TrendingDown,
} from "lucide-react";
import { MOCK_PAYMENT_METRICS } from "./data";

interface ExecutivePaymentsHeaderProps {
  className?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onNewPayment?: () => void;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function KpiBox({ icon: Icon, label, value, sub, highlight, trend }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  highlight?: "positive" | "negative" | "warning" | undefined;
  trend?: "up" | "down" | undefined;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-700">
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg",
        highlight === "positive" ? "bg-emerald-500/10" :
        highlight === "negative" ? "bg-red-500/10" :
        highlight === "warning" ? "bg-amber-500/10" :
        "bg-zinc-800",
      )}>
        <Icon className={cn(
          "h-4 w-4",
          highlight === "positive" ? "text-emerald-400" :
          highlight === "negative" ? "text-red-400" :
          highlight === "warning" ? "text-amber-400" :
          "text-zinc-400",
        )} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 truncate">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className={cn(
            "text-lg font-semibold",
            highlight === "positive" ? "text-emerald-400" :
            highlight === "negative" ? "text-red-400" :
            highlight === "warning" ? "text-amber-400" :
            "text-white",
          )}>{value}</p>
          {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
          {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-400 shrink-0" />}
        </div>
        {sub && <p className="text-[11px] text-zinc-500 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export function ExecutivePaymentsHeader({
  className,
  onRefresh,
  onExport,
  onPrint,
  onNewPayment,
}: ExecutivePaymentsHeaderProps) {
  const m = MOCK_PAYMENT_METRICS;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">Payments & Cash Movement</h1>
          <p className="mt-1 text-[13px] text-zinc-400">
            Enterprise-wide payment operations &bull; Updated{" "}
            {new Date(m.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNewPayment}
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-[13px] font-medium text-black transition-colors hover:bg-[#d4b85a]"
            aria-label="Create new payment"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Payment</span>
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Refresh payment data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Export payment data"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Print payment report"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
        <KpiBox
          icon={ArrowUpFromLine}
          label="Today's Payments"
          value={formatCurrency(m.outgoingValue)}
          sub={`${m.outgoingCount} payments`}
          highlight={m.trend === "up" ? "warning" : undefined}
          trend={m.trend === "up" ? "up" : undefined}
        />
        <KpiBox
          icon={ArrowDownToLine}
          label="Today's Collections"
          value={formatCurrency(m.incomingValue)}
          sub={`${m.incomingCount} collections`}
          highlight={m.incomingValue > 0 ? "positive" : undefined}
        />
        <KpiBox
          icon={ArrowLeftRight}
          label="Net Cash Movement"
          value={formatCurrency(Math.abs(m.netCashFlow))}
          sub={m.netCashFlow >= 0 ? "Net positive" : "Net negative"}
          highlight={m.netCashFlow >= 0 ? "positive" : "negative"}
          trend={m.netCashFlow >= 0 ? "up" : "down"}
        />
        <KpiBox
          icon={Clock}
          label="Pending Approvals"
          value={m.awaitingApproval.toString()}
          sub={formatCurrency(m.awaitingApprovalValue)}
          highlight={m.awaitingApproval > 0 ? "warning" : undefined}
        />
        <KpiBox
          icon={CheckCircle2}
          label="Payments In Flight"
          value={m.pendingCount.toString()}
          sub={formatCurrency(m.pendingValue)}
        />
        <KpiBox
          icon={XCircle}
          label="Failed Payments"
          value={m.failedToday.toString()}
          sub={formatCurrency(m.failedTodayValue)}
          highlight={m.failedToday > 0 ? "negative" : undefined}
        />
        <KpiBox
          icon={Ban}
          label="Avg Settlement"
          value={`${m.averageSettlementHours}h`}
          sub={`${m.averageProcessingMinutes}m processing`}
        />
        <KpiBox
          icon={Building2}
          label="Entities"
          value={m.entities.toString()}
        />
        <KpiBox
          icon={Landmark}
          label="Banks"
          value={m.banks.toString()}
        />
        <KpiBox
          icon={Globe}
          label="Currencies"
          value={m.currencies.toString()}
        />
        <KpiBox
          icon={AlertTriangle}
          label="Alerts"
          value={m.alerts.toString()}
          highlight={m.alerts > 0 ? "negative" : undefined}
        />
      </div>
    </div>
  );
}
