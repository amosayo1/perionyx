"use client";

import { WidgetCard } from "./widget-card";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

export function TreasuryCenterWidget({ data }: { data: CommandCenterData["treasury"] }) {
  return (
    <WidgetCard title="Treasury Center" description={`${data.walletCount} wallets · ${data.treasuryAccountCount} accounts`}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total Liquidity</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.totalLiquidity}</p>
          </div>
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Available Cash</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.availableCash}</p>
          </div>
        </div>
        <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Currency Exposure</p>
          {data.currencyExposure.length === 0 ? (
            <p className="text-xs text-zinc-500">No treasury accounts.</p>
          ) : (
            <div className="space-y-1">
              {data.currencyExposure.map((ce) => (
                <div key={ce.currency} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{ce.currency}</span>
                  <span className="text-sm font-mono text-white">{ce.balance}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Treasury Health Score</span>
          <span className="text-sm font-bold text-white">{data.treasuryHealthScore}/100</span>
        </div>
      </div>
    </WidgetCard>
  );
}
