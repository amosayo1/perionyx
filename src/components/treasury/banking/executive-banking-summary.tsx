"use client";

import { cn } from "@/lib/utils";
import { Globe, AlertTriangle, Building2, Activity } from "lucide-react";
import type { ExecutiveSummary } from "@/server/banking/workspace";

interface ExecutiveBankingSummaryProps {
  summary: ExecutiveSummary;
  className?: string;
}

export function ExecutiveBankingSummary({ summary, className }: ExecutiveBankingSummaryProps) {
  const healthColor = summary.globalHealth === "HEALTHY" ? "text-emerald-400" : summary.globalHealth === "DEGRADED" ? "text-amber-400" : "text-red-400";
  const healthBg = summary.globalHealth === "HEALTHY" ? "bg-emerald-500/10" : summary.globalHealth === "DEGRADED" ? "bg-amber-500/10" : "bg-red-500/10";

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("rounded-lg border p-5", healthBg.replace("bg", "border").replace("/10", "/20"), healthBg)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-500">Global Banking Health</p>
            <p className={cn("mt-1 text-[28px] font-bold tracking-[-0.02em]", healthColor)}>
              {summary.globalHealth}
            </p>
          </div>
          <div className="text-right">
            <p className={cn("text-[32px] font-bold", healthColor)}>{summary.globalHealthScore}</p>
            <p className="text-[11px] text-zinc-500">out of 100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricBox label="Banks" value={String(summary.totalBanks)} icon={Building2} />
        <MetricBox label="Providers" value={String(summary.totalProviders)} icon={Globe} />
        <MetricBox label="Accounts" value={String(summary.totalAccounts)} icon={Building2} />
        <MetricBox label="Legal Entities" value={String(summary.totalLegalEntities)} icon={Building2} />
        <MetricBox label="Countries" value={String(summary.totalCountries)} icon={Globe} />
        <MetricBox label="Currencies" value={String(summary.totalCurrencies)} icon={Activity} />
        <MetricBox label="Healthy" value={String(summary.healthyConnections)} icon={Activity} color="text-emerald-400" />
        <MetricBox label="Failed" value={String(summary.failedConnections)} icon={AlertTriangle} color="text-red-400" />
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4">
        <p className="mb-2 text-[12px] font-medium tracking-[0.08em] uppercase text-zinc-500">Top Risks</p>
        <div className="space-y-1.5">
          {summary.topRisks.map((risk, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px]">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
              <span className="text-zinc-300">{risk}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AlertBadge label="Critical Alerts" value={summary.criticalAlerts} color={summary.criticalAlerts > 0 ? "text-red-400" : "text-emerald-400"} />
        <AlertBadge label="Credential Expiry" value={summary.upcomingCredentialExpiry} color={summary.upcomingCredentialExpiry > 0 ? "text-amber-400" : "text-emerald-400"} />
        <AlertBadge label="Provider Issues" value={summary.providerIssues} color={summary.providerIssues > 0 ? "text-amber-400" : "text-emerald-400"} />
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <p className={cn("mt-1 text-[18px] font-semibold", color ?? "text-white")}>{value}</p>
    </div>
  );
}

function AlertBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-center">
      <p className={cn("text-[20px] font-bold", color)}>{value}</p>
      <p className="text-[10px] text-zinc-500">{label}</p>
    </div>
  );
}