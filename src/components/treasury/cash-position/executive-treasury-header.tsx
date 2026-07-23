"use client";

import { cn } from "@/lib/utils";
import { Building2, Landmark, Globe, PiggyBank, AlertTriangle, RefreshCw, Download, Printer } from "lucide-react";
import { MOCK_EXECUTIVE_SUMMARY } from "./data";

interface ExecutiveTreasuryHeaderProps {
  className?: string;
  onExport?: () => void;
  onPrint?: () => void;
}

export function ExecutiveTreasuryHeader({ className, onExport, onPrint }: ExecutiveTreasuryHeaderProps) {
  const summary = MOCK_EXECUTIVE_SUMMARY;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Global Cash Position</h1>
          <p className="mt-1 text-[13px] text-zinc-400">
            Enterprise-wide treasury overview &bull; Updated {new Date(summary.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Export data"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Print report"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        <SummaryStat icon={Building2} label="Entities" value={summary.totalEntities.toString()} />
        <SummaryStat icon={Landmark} label="Institutions" value={summary.totalInstitutions.toString()} />
        <SummaryStat icon={Globe} label="Regions" value={summary.totalRegions.toString()} />
        <SummaryStat icon={PiggyBank} label="Accounts" value={summary.totalAccounts.toString()} />
        <SummaryStat icon={Globe} label="Currencies" value={summary.totalCurrencies.toString()} />
        <SummaryStat
          icon={AlertTriangle}
          label="Open Alerts"
          value={summary.openAlerts.toString()}
          highlight={summary.openAlerts > 0}
        />
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-3">
      <Icon className={cn("h-5 w-5 shrink-0", highlight ? "text-amber-400" : "text-zinc-500")} />
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <p className={cn("text-lg font-semibold", highlight ? "text-amber-400" : "text-white")}>{value}</p>
      </div>
    </div>
  );
}
