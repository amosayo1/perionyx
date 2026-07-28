import { cn } from "@/lib/utils";
import { ChartCard } from "./chart-card";
import { BarChartPlaceholder } from "./bar-chart-placeholder";
import type { OperationalPerformanceData } from "./types";

const barData = [
  { label: "Approvals", value: 96, color: "emerald" },
  { label: "Incidents", value: 88, color: "blue" },
  { label: "Txns", value: 98, color: "emerald" },
  { label: "Policy", value: 92, color: "amber" },
  { label: "Recon", value: 94, color: "purple" },
];

export function OperationalPerformance({ data }: { data: OperationalPerformanceData }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">Operational Performance</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Executive summary of operational efficiency metrics
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Avg Approval Time</p>
          <span className="text-xl font-semibold text-white mt-0.5 block">{data.avgApprovalTime}</span>
          <p className="text-[10px] text-gold mt-1">-14% vs last month</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Avg Resolution Time</p>
          <span className="text-xl font-semibold text-white mt-0.5 block">{data.avgIncidentResolution}</span>
          <p className="text-[10px] text-gold mt-1">-8% vs last month</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Failed Transactions</p>
          <span className="text-xl font-semibold text-white mt-0.5 block">{data.failedTransactions}</span>
          <p className="text-[10px] text-gold mt-1">-67% vs last month</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Policy Exceptions</p>
          <span className="text-xl font-semibold text-white mt-0.5 block">{data.policyExceptions}</span>
          <p className="text-[10px] text-amber-400 mt-1">Same as last month</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Reconciliation Success</p>
          <span className="text-xl font-semibold text-gold mt-0.5 block">{data.reconciliationSuccess}</span>
          <p className="text-[10px] text-gold mt-1">+0.3pp improvement</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Operational Efficiency</p>
          <span className="text-xl font-semibold text-white mt-0.5 block">{data.operationalEfficiency}%</span>
          <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                data.operationalEfficiency >= 90 && "bg-gold",
                data.operationalEfficiency >= 80 && data.operationalEfficiency < 90 && "bg-amber-500",
                data.operationalEfficiency < 80 && "bg-red-500",
              )}
              style={{ width: `${data.operationalEfficiency}%` }}
            />
          </div>
        </div>
      </div>

      <ChartCard title="Operational Efficiency by Module" description="Score breakdown across operational areas" height="h-36">
        <BarChartPlaceholder data={barData} />
      </ChartCard>
    </div>
  );
}
