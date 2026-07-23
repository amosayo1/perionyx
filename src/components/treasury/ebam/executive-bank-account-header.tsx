"use client";

import { cn } from "@/lib/utils";
import {
  Building2, Landmark, Globe, PiggyBank, AlertTriangle, RefreshCw,
  Download, Printer, Plus, Users, FileText, ShieldCheck, Clock,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { MOCK_EBAM_METRICS } from "./data";
import type { EBAMetrics } from "./types";

interface ExecutiveBankAccountHeaderProps {
  className?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onOpenAccount?: () => void;
}

export function ExecutiveBankAccountHeader({
  className, onRefresh, onExport, onPrint, onOpenAccount,
}: ExecutiveBankAccountHeaderProps) {
  const m = MOCK_EBAM_METRICS;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bank Account Management</h1>
          <p className="mt-1 text-[13px] text-zinc-400">
            Enterprise-wide account registry &bull; Updated{" "}
            {new Date(m.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAccount}
            className="flex items-center gap-2 rounded-lg bg-[#c9a84c]/90 px-4 py-2 text-[13px] font-medium text-black transition-colors hover:bg-[#c9a84c]"
            aria-label="Open new bank account"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Open Account</span>
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Export data"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Print report"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-zinc-900 px-2 py-2 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white lg:hidden"
            aria-label={collapsed ? "Expand metrics" : "Collapse metrics"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn(collapsed && "hidden lg:grid", "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7")}>
        <MetricCard icon={PiggyBank} label="Total Accounts" value={m.totalAccounts.toLocaleString()} />
        <MetricCard icon={ShieldCheck} label="Active" value={m.activeAccounts.toLocaleString()} color="emerald" />
        <MetricCard icon={Clock} label="Dormant" value={m.dormantAccounts.toLocaleString()} color="amber" />
        <MetricCard icon={AlertTriangle} label="Restricted" value={m.restrictedAccounts.toLocaleString()} color="red" />
        <MetricCard icon={FileText} label="Closing" value={m.closingAccounts.toLocaleString()} color="red" />
        <MetricCard icon={Building2} label="Legal Entities" value={m.totalEntities.toLocaleString()} />
        <MetricCard icon={Landmark} label="Banking Partners" value={m.totalBanks.toLocaleString()} />
        <MetricCard icon={Globe} label="Countries" value={m.totalCountries.toLocaleString()} />
        <MetricCard icon={Globe} label="Currencies" value={m.totalCurrencies.toLocaleString()} />
        <MetricCard icon={Users} label="Signatories" value={m.totalSignatories.toLocaleString()} />
        <MetricCard icon={FileText} label="Mandates Expiring" value={m.mandatesExpiring.toLocaleString()} color="amber" />
        <MetricCard icon={ShieldCheck} label="KYC Pending" value={m.kycPending.toLocaleString()} color="amber" />
        <MetricCard icon={AlertTriangle} label="Compliance Alerts" value={m.complianceAlerts.toLocaleString()} color="red" />
        <MetricCard icon={Clock} label="Last Updated" value={new Date(m.lastUpdated).toLocaleDateString()} />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ElementType; label: string; value: string; color?: "emerald" | "amber" | "red";
}) {
  const colors = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-3 py-2.5 transition-colors hover:border-zinc-700">
      <Icon className={cn("h-4 w-4 shrink-0", color ? colors[color] : "text-zinc-500")} />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <p className={cn("text-base font-semibold", color ? colors[color] : "text-white")}>{value}</p>
      </div>
    </div>
  );
}
