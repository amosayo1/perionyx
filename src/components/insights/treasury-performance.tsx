import { ChartCard } from "./chart-card";
import { LineChartPlaceholder } from "./line-chart-placeholder";
import type { TreasuryPerformanceData } from "./types";

export function TreasuryPerformance({ data }: { data: TreasuryPerformanceData }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">Treasury Performance</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Account overview, settlement health, and transfer activity
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500 font-medium">Total Accounts</p>
          <span className="text-2xl font-semibold text-white mt-1 block">{data.totalAccounts}</span>
          <p className="text-[11px] text-zinc-600 mt-1">{data.currencies} currencies</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500 font-medium">Settlement Success</p>
          <span className="text-2xl font-semibold text-[#d4af37] mt-1 block">{data.settlementSuccess}</span>
          <p className="text-[11px] text-zinc-600 mt-1">Above 99.5% target</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500 font-medium">Transfer Volume</p>
          <span className="text-2xl font-semibold text-white mt-1 block">{data.transferVolume.count}</span>
          <p className="text-[11px] text-zinc-600 mt-1">{data.transferVolume.value}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500 font-medium">Treasury Health</p>
          <span className="text-2xl font-semibold text-[#d4af37] mt-1 block">{data.treasuryHealth}%</span>
          <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-[#d4af37]" style={{ width: `${data.treasuryHealth}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Treasury Activity" description="Transaction volume over time">
          <LineChartPlaceholder color="emerald" />
        </ChartCard>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Largest Accounts</h3>
          <div className="space-y-2">
            {data.largestAccounts.map((acc) => (
              <div key={acc.name} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                <span className="text-xs text-zinc-400">{acc.name}</span>
                <span className="text-xs font-medium text-zinc-200">{acc.balance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
