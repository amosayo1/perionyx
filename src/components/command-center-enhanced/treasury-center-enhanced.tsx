"use client";

import { GlassCard } from "@/components/enterprise/glass-panel";
import { LiquidityGauge, CurrencyExposureBar, CashFlowChart } from "@/components/enterprise/visualizations/treasury-charts";
import { TrendChart, MiniSparkline } from "@/components/enterprise/visualizations/trend-chart";
import { AnimatedCounter } from "@/components/enterprise/animated-counter";
import { HealthIndicator } from "@/components/enterprise/health-indicator";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

interface TreasuryEnhancedProps {
  data: CommandCenterData["treasury"];
  className?: string;
}

export function TreasuryCenterEnhanced({ data, className }: TreasuryEnhancedProps) {
  const totalLiquidityNum = Number(data.totalLiquidity.replace(/[^0-9.]/g, ""));
  const availableCashNum = Number(data.availableCash.replace(/[^0-9.]/g, ""));
  const healthPct = data.treasuryHealthScore ?? 0;
  const maxExposure = data.currencyExposure.length ? Math.max(...data.currencyExposure.map((ce) => Number(ce.balance.replace(/[^0-9.]/g, "")))) : 1;

  return (
    <GlassCard
      title="Treasury Center"
      description={`${data.walletCount} wallets · ${data.treasuryAccountCount} accounts`}
      variant="gold"
      className={className}
      headerClassName="border-b border-white/[0.04] pb-3"
    >
      <div className="space-y-4">
        {/* Top row: liquidity gauge + kpis */}
        <div className="flex items-center gap-4">
          <LiquidityGauge
            value={healthPct}
            size={80}
            strokeWidth={6}
            label="Health"
          />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total Liquidity</p>
              <AnimatedCounter value={totalLiquidityNum} prefix="$" className="text-lg font-bold text-white mt-0.5 tabular-nums" />
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Available Cash</p>
              <AnimatedCounter value={availableCashNum} prefix="$" className="text-lg font-bold text-white mt-0.5 tabular-nums" />
            </div>
          </div>
        </div>

        {/* Currency exposure */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Currency Exposure</p>
          {data.currencyExposure.length === 0 ? (
            <p className="text-xs text-zinc-500">No treasury accounts.</p>
          ) : (
            data.currencyExposure.map((ce) => {
              const numBalance = Number(ce.balance.replace(/[^0-9.]/g, ""));
              const pct = maxExposure > 0 ? (numBalance / maxExposure) * 100 : 0;
              return (
                <CurrencyExposureBar
                  key={ce.currency}
                  currency={ce.currency}
                  balance={ce.balance}
                  percentage={pct}
                />
              );
            })
          )}
        </div>

        {/* Trend sparkline */}
        {data.currencyExposure.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500">Balance Trend</span>
            <MiniSparkline
              data={data.currencyExposure.map((ce) => Number(ce.balance.replace(/[^0-9.]/g, "")))}
              color="#d4af37"
              height={20}
              width={80}
            />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
