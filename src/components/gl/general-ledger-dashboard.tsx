"use client";

import { memo, useState } from "react";
import { BookOpen, FileText, CheckSquare, Calendar, Layers, Bell, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GLOverviewMetrics, Journal, AccountingPeriod, GLAlert, GLRecommendation } from "./gl-types";
import { ExecutiveGLHeader } from "./executive-gl-header";
import { AlertsPanel } from "./alerts-panel";
import { RecommendationsPanel } from "./recommendations-panel";

interface GeneralLedgerDashboardProps {
  metrics: GLOverviewMetrics;
  accounts: { id: string; name: string; number: string; category: string }[];
  journals: Journal[];
  periods: AccountingPeriod[];
  alerts: GLAlert[];
  recommendations: GLRecommendation[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  draft: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  approved: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  posted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  reversed: "border-red-500/20 bg-red-500/10 text-red-400",
  error: "border-red-500/20 bg-red-500/10 text-red-400",
};

const PERIOD_STATUS_STYLES: Record<string, string> = {
  open: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  "soft-close": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "hard-close": "border-red-500/20 bg-red-500/10 text-red-400",
  locked: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  reopened: "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

const COLORS = {
  gold: { icon: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
  emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  cyan: { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
};

function MetricCard({ label, value, icon, variant = "gold", trend }: { label: string; value: string; icon: React.ReactNode; variant?: string; trend?: { value: string; up: boolean } }) {
  const c = COLORS[variant as keyof typeof COLORS] ?? COLORS.gold;
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60 hover:bg-zinc-900/60">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <span className={cn("text-xs", trend.up ? "text-emerald-400" : "text-red-400")}>
                {trend.up ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const GeneralLedgerDashboard = memo(function GeneralLedgerDashboard({
  metrics, accounts, journals, periods, alerts, recommendations, className,
}: GeneralLedgerDashboardProps) {
  const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
  const recentJournals = [...journals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  return (
    <div className={cn("space-y-6", className)}>
      <ExecutiveGLHeader
        totalAccounts={metrics.totalAccounts}
        totalJournals={metrics.totalJournals}
        totalPostedJournals={metrics.totalPostedJournals}
        totalOpenPeriods={metrics.totalOpenPeriods}
        totalLedgers={metrics.totalLedgers}
        activeAlerts={metrics.openAlerts}
      />

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total Entries" value={metrics.totalEntries.toLocaleString()} icon={<FileText />} variant="blue" />
        <MetricCard label="Total Batches" value={metrics.totalBatches.toLocaleString()} icon={<Layers />} variant="purple" />
        <MetricCard label="Total Alerts" value={metrics.totalAlerts.toLocaleString()} icon={<Bell />} variant={metrics.openAlerts > 0 ? "red" : "emerald"} />
        <MetricCard label="Last Close" value={metrics.lastPeriodClose ?? "—"} icon={<Calendar />} variant="amber" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40">
            <div className="border-b border-zinc-800/60 px-4 py-3">
              <h3 className="text-sm font-semibold text-zinc-300">Recent Journal Entries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Journal #</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Description</th>
                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Debit</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Credit</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {recentJournals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">No journals found</td>
                    </tr>
                  ) : (
                    recentJournals.map((j) => (
                      <tr
                        key={j.id}
                        className={cn("cursor-pointer transition-colors hover:bg-zinc-800/40", selectedJournal === j.id && "bg-zinc-800/60")}
                        onClick={() => setSelectedJournal(selectedJournal === j.id ? null : j.id)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-white">{j.journalNumber}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{j.description}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[j.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                            {j.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gold">{formatCurrency(j.totalDebit)}</td>
                        <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(j.totalCredit)}</td>
                        <td className="px-4 py-3 text-right text-sm text-zinc-500">{formatDate(j.postingDate ?? j.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40">
            <div className="border-b border-zinc-800/60 px-4 py-3">
              <h3 className="text-sm font-semibold text-zinc-300">Period Status</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              {periods.length === 0 ? (
                <div className="col-span-3 py-8 text-center text-sm text-zinc-500">No periods found</div>
              ) : (
                periods.slice(0, 6).map((p) => (
                  <div key={p.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{p.period}</span>
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium", PERIOD_STATUS_STYLES[p.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                        {p.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">{formatDate(p.startDate)} – {formatDate(p.endDate)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AlertsPanel alerts={alerts} />
          <RecommendationsPanel recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
});
